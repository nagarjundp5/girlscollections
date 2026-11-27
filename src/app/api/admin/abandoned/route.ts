import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import { userCarts, users, pushSubscriptions } from '@/db/schema';
import { desc, eq, and, ne } from 'drizzle-orm';
import { firestoreService } from '@/lib/firestore';
import { rateLimit } from '@/lib/rateLimit';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const ip = req.headers.get('x-forwarded-for') || 'admin';
  const rateCheck = await rateLimit(`admin:abandoned:get:${ip}`, 30, 60000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'bags';

    if (tab === 'bags') {
      // Query Neon user_carts joined with users (active and abandoned bags)
      const rows = await db
        .select({
          id: userCarts.id,
          userId: userCarts.user_id,
          items: userCarts.items,
          total: userCarts.total,
          status: userCarts.status,
          reminderSentAt: userCarts.reminder_sent_at,
          reminderCount: userCarts.reminder_count,
          updatedAt: userCarts.updated_at,
          customerName: users.name,
          phone: users.phone,
          email: users.email,
        })
        .from(userCarts)
        .leftJoin(users, eq(userCarts.user_id, users.id))
        .where(ne(userCarts.status, 'purchased'))
        .orderBy(desc(userCarts.updated_at))
        .limit(200);

      type RowType = typeof rows[number];
      const items = rows
        .filter((r: RowType) => Array.isArray(r.items) && r.items.length > 0)
        .map((r: RowType) => ({
          id: r.id,
          userId: r.userId,
          customerName: r.customerName || 'Registered Customer',
          phone: r.phone || '',
          email: r.email || '',
          items: r.items,
          totalAmount: r.total || r.items.reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0),
          status: r.status,
          reminderSentAt: r.reminderSentAt,
          reminderCount: r.reminderCount,
          updatedAt: r.updatedAt,
          lastActivity: r.updatedAt,
        }));

      return NextResponse.json({ items });
    } else {
      const docs = await firestoreService.queryDocs('checkout_sessions');
      docs.sort(
        (a: any, b: any) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
      return NextResponse.json({ items: docs });
    }
  } catch (err: any) {
    console.error('[GET /api/admin/abandoned error]:', err);
    return NextResponse.json({ error: 'Failed to retrieve abandoned records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { action, id, userId, tab } = body;

    if (action === 'send_reminder' && userId) {
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.topic_offers, true)));

      if (subs.length === 0) {
        return NextResponse.json({ error: 'Customer has no active push subscription with offers enabled' }, { status: 400 });
      }

      const payload = {
        title: 'Your bag is waiting',
        body: 'Your bag is waiting, only a few left in your size',
        url: '/cart',
        type: 'cart_reminder',
      };

      await Promise.allSettled(subs.map((sub: typeof subs[number]) => sendPushNotification(sub, payload)));

      await db
        .update(userCarts)
        .set({
          status: 'abandoned',
          reminder_sent_at: new Date(),
          reminder_count: 1,
        })
        .where(eq(userCarts.user_id, userId));

      return NextResponse.json({ success: true, sentTo: subs.length });
    }

    if (action === 'mark_contacted') {
      const collection = tab === 'checkouts' ? 'checkout_sessions' : 'carts_abandoned';
      await firestoreService.setDoc(
        collection,
        id,
        {
          contacted: true,
          contactedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[POST /api/admin/abandoned error]:', err);
    return NextResponse.json({ error: 'Failed action' }, { status: 500 });
  }
}
