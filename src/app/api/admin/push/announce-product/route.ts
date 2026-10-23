export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pushSubscriptions, notificationLogs } from '@/db/schema';
import { eq, count, isNull } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/push';

import { adminPushAnnouncementSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const [row] = await db
      .select({ count: count() })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.product_id, productId));

    return NextResponse.json({ count: row?.count ?? 0 });
  } catch (error) {
    console.error('Count error:', error);
    return NextResponse.json({ error: 'Failed to count subscribers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const bodyData = await req.json();
    const validationResult = adminPushAnnouncementSchema.safeParse(bodyData);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid announcement data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { title, body, url, productId } = validationResult.data;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required for product-specific notifications' }, { status: 400 });
    }

    const subscribers = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.product_id, productId));

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, count: 0, successful: 0, failed: 0 });
    }

    const payload = {
      title,
      body,
      url: url || '/shop',
      icon: '/icon-192x192.png',
    };

    const results = await Promise.allSettled(
      subscribers.map((sub: any) => sendPushNotification(sub, payload))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Log the send
    await db.insert(notificationLogs).values({
      title,
      body,
      url: url || '/shop',
      audience_type: 'product',
      product_id: productId,
      sent_count: successful,
      failed_count: failed,
    });

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Product announcement error:', error);
    return NextResponse.json({ error: 'Failed to send product notification' }, { status: 500 });
  }
}
