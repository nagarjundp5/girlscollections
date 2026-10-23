export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pushSubscriptions, notificationLogs } from '@/db/schema';
import { isNull, eq } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/push';
import { requireStaffOrAdmin } from '@/lib/auth/admin';

export async function POST(req: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { title, body, url, icon, audienceType, productId } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    let subscribers: any[] = [];
    if (audienceType === 'product' && productId) {
      subscribers = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.product_id, productId));
    } else {
      subscribers = await db
        .select()
        .from(pushSubscriptions)
        .where(isNull(pushSubscriptions.product_id));
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, count: 0, successful: 0, failed: 0 });
    }

    const payload = {
      title,
      body,
      url: url || '/',
      icon: icon || 'https://www.thegirlscollections.com/logo.png',
    };

    const results = await Promise.allSettled(
      subscribers.map((sub: any) => sendPushNotification(sub, payload))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Save notification log
    await db.insert(notificationLogs).values({
      title,
      body,
      url: url || '/',
      audience_type: audienceType === 'product' ? 'product' : 'general',
      product_id: audienceType === 'product' && productId ? productId : null,
      sent_count: successful,
      failed_count: failed,
    });

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      successful,
      failed,
    });
  } catch (error: any) {
    console.error('[send-custom push] Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to send custom notification' }, { status: 500 });
  }
}
