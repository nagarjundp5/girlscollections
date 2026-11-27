export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userCarts, pushSubscriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { sendPushNotification } from '@/lib/push';
import { getSiteUrl } from '@/lib/getSiteUrl';

/**
 * Computes seconds until next 9:00 AM IST if current IST hour is >= 21 or < 9.
 * Returns 0 if currently within allowed daytime hours (9 AM - 9 PM IST).
 */
function getQuietHoursDelaySeconds(): number {
  const nowUtcMs = Date.now();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(nowUtcMs + istOffsetMs);
  const hour = istDate.getUTCHours();

  if (hour >= 9 && hour < 21) {
    return 0;
  }

  const next9AmIst = new Date(istDate);
  next9AmIst.setUTCHours(9, 0, 0, 0);
  if (hour >= 21) {
    next9AmIst.setUTCDate(next9AmIst.getUTCDate() + 1);
  }
  return Math.max(60, Math.floor((next9AmIst.getTime() - istDate.getTime()) / 1000));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('upstash-signature');

  if (signature) {
    const valid = await verifyQStashSignature(req, rawBody);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 });
    }
  }

  try {
    const { userId, reminderIndex = 1 } = JSON.parse(rawBody);
    if (!userId) {
      return NextResponse.json({ skipped: 'Missing userId' });
    }

    const [cart] = await db
      .select()
      .from(userCarts)
      .where(eq(userCarts.user_id, userId))
      .limit(1);

    if (!cart || cart.status === 'purchased' || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ skipped: 'Cart purchased or empty' });
    }

    // Never more than 2 reminders per bag
    if (cart.reminder_count >= 2) {
      return NextResponse.json({ skipped: 'Max reminders reached' });
    }

    // Respect quiet hours 9 PM - 9 AM IST
    const quietDelay = getQuietHoursDelaySeconds();
    if (quietDelay > 0 && process.env.QSTASH_TOKEN) {
      const { Client } = await import('@upstash/qstash');
      const client = new Client({ token: process.env.QSTASH_TOKEN });
      await client.publishJSON({
        url: `${getSiteUrl()}/api/qstash/cart-reminder`,
        body: { userId, reminderIndex },
        delay: quietDelay,
      });
      return NextResponse.json({ rescheduledFor9AmIST: true, delaySec: quietDelay });
    }

    // Only send to users with offers enabled
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.topic_offers, true)));

    if (subs.length === 0) {
      return NextResponse.json({ skipped: 'No active offer push subscriptions' });
    }

    const payload = {
      title: 'Your bag is waiting',
      body: 'Your bag is waiting, only a few left in your size',
      url: '/cart',
      type: 'cart_reminder',
    };

    await Promise.allSettled(subs.map((sub: typeof subs[number]) => sendPushNotification(sub, payload)));

    const newCount = (cart.reminder_count || 0) + 1;
    await db
      .update(userCarts)
      .set({
        status: 'abandoned',
        reminder_sent_at: new Date(),
        reminder_count: newCount,
      })
      .where(eq(userCarts.user_id, userId));

    // Schedule 2nd reminder after 24 hours if this was the 1st reminder
    if (newCount === 1 && process.env.QSTASH_TOKEN) {
      const { Client } = await import('@upstash/qstash');
      const client = new Client({ token: process.env.QSTASH_TOKEN });
      await client.publishJSON({
        url: `${getSiteUrl()}/api/qstash/cart-reminder`,
        body: { userId, reminderIndex: 2 },
        delay: 86400, // 24 hours
        deduplicationId: `cart-remind-2-${userId}`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, reminderNumber: newCount });
  } catch (err) {
    console.error('[qstash/cart-reminder] Error:', err);
    return NextResponse.json({ error: 'Reminder job failed' }, { status: 500 });
  }
}
