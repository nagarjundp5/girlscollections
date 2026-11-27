export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/getAuthUserId';
import { db } from '@/db';
import { pushSubscriptions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { firestoreService } from '@/lib/firestore';

export async function GET(req: Request) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subs = await db
      .select({
        topic_orders: pushSubscriptions.topic_orders,
        topic_offers: pushSubscriptions.topic_offers,
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_id, userId))
      .limit(1);

    if (subs.length > 0) {
      return NextResponse.json({
        topicOrders: subs[0].topic_orders,
        topicOffers: subs[0].topic_offers,
        hasSubscription: true,
      });
    }

    const [u] = await db
      .select({ optIn: users.notifications_opt_in })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      topicOrders: true,
      topicOffers: u ? u.optIn : true,
      hasSubscription: false,
    });
  } catch (err) {
    console.error('[GET /api/user/notifications] error:', err);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { topicOrders, topicOffers } = await req.json();
    const ordersVal = typeof topicOrders === 'boolean' ? topicOrders : true;
    const offersVal = typeof topicOffers === 'boolean' ? topicOffers : true;

    await db
      .update(pushSubscriptions)
      .set({
        topic_orders: ordersVal,
        topic_offers: offersVal,
      })
      .where(eq(pushSubscriptions.user_id, userId));

    await db
      .update(users)
      .set({ notifications_opt_in: offersVal })
      .where(eq(users.id, userId))
      .catch(() => {});

    // Also update matching Firestore subscriber docs for this user
    try {
      const docs = await firestoreService.queryDocs('pushSubscribers', {
        where: [{ field: 'userId', op: '==', value: userId }],
      });
      for (const doc of docs) {
        if (doc.id) {
          await firestoreService.setDoc(
            'pushSubscribers',
            doc.id,
            { topicOrders: ordersVal, topicOffers: offersVal, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        }
      }
    } catch {
      // Ignore Firestore sync errors
    }

    return NextResponse.json({ success: true, topicOrders: ordersVal, topicOffers: offersVal });
  } catch (err) {
    console.error('[PATCH /api/user/notifications] error:', err);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
