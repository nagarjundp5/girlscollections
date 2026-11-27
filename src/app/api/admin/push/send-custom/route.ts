export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import { pushSubscriptions, notificationLogs, orders, userCarts } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/push';
import { rateLimit } from '@/lib/rateLimit';
import { getSiteUrl } from '@/lib/getSiteUrl';

export async function executeCustomPushSend(params: {
  title: string;
  body: string;
  url?: string;
  image?: string;
  audience: 'all' | 'women' | 'kids' | 'specific';
  specificUserIds?: string[];
}) {
  const { title, body, url, image, audience, specificUserIds } = params;

  // Fetch all offer-opted-in subscriptions from Neon
  let subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.topic_offers, true));

  type SubType = typeof subs[number];

  if (audience === 'specific' && Array.isArray(specificUserIds) && specificUserIds.length > 0) {
    const idSet = new Set(specificUserIds.map((s) => s.trim()).filter(Boolean));
    subs = subs.filter((s: SubType) => s.user_id && idSet.has(s.user_id));
  } else if (audience === 'women' || audience === 'kids') {
    // Match users who ordered or carted products in that target
    const targetUserIds = new Set<string>();
    const [recentOrders, activeCarts] = await Promise.all([
      db.select({ user_id: orders.user_id, items: orders.items }).from(orders).limit(500).catch(() => []),
      db.select({ user_id: userCarts.user_id, items: userCarts.items }).from(userCarts).limit(500).catch(() => []),
    ]);

    const matchesTarget = (item: any) => {
      const str = `${item?.title || item?.name || ''} ${item?.slug || ''} ${item?.category || ''}`.toLowerCase();
      if (audience === 'kids') return str.includes('kid') || str.includes('frock') || str.includes('pattu');
      return !str.includes('kid');
    };

    for (const o of recentOrders) {
      if (o.user_id && Array.isArray(o.items) && o.items.some(matchesTarget)) {
        targetUserIds.add(o.user_id);
      }
    }
    for (const c of activeCarts) {
      if (c.user_id && Array.isArray(c.items) && c.items.some(matchesTarget)) {
        targetUserIds.add(c.user_id);
      }
    }

    if (targetUserIds.size > 0) {
      subs = subs.filter((s: SubType) => s.user_id && targetUserIds.has(s.user_id));
    }
  }

  // Insert log first so we get logId for click tracking
  const [logRow] = await db
    .insert(notificationLogs)
    .values({
      title: title.trim(),
      body: body.trim(),
      url: url || '/',
      audience_type: audience,
      sent_count: 0,
      failed_count: 0,
      clicked_count: 0,
    })
    .returning();

  const payload = {
    title: title.trim(),
    body: body.trim(),
    url: url || '/',
    image: image || undefined,
    logId: logRow?.id || null,
  };

  let successful = 0;
  let failed = 0;

  // Send in batches of 25
  const BATCH_SIZE = 25;
  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((sub: SubType) => sendPushNotification(sub, payload))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') successful++;
      else failed++;
    }
  }

  if (logRow) {
    await db
      .update(notificationLogs)
      .set({ sent_count: successful, failed_count: failed })
      .where(eq(notificationLogs.id, logRow.id))
      .catch(() => {});
  }

  return { successful, failed, totalTargeted: subs.length, logId: logRow?.id };
}

export async function POST(req: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const ip = req.headers.get('x-forwarded-for') || 'admin';
  const rateCheck = await rateLimit(`admin:push:send:${ip}`, 10, 60000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
  }

  try {
    const { title, body, url, image, audience = 'all', specificUserIds, scheduleAt } = await req.json();

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // If scheduled in the future, queue via QStash
    if (scheduleAt) {
      const targetTs = new Date(scheduleAt).getTime();
      const delaySec = Math.max(0, Math.floor((targetTs - Date.now()) / 1000));
      if (delaySec > 5) {
        if (!process.env.QSTASH_TOKEN) {
          return NextResponse.json({ error: 'QSTASH_TOKEN not configured for scheduling' }, { status: 400 });
        }
        const { Client } = await import('@upstash/qstash');
        const client = new Client({ token: process.env.QSTASH_TOKEN });
        await client.publishJSON({
          url: `${getSiteUrl()}/api/qstash/send-push`,
          body: { title, body, url, image, audience, specificUserIds },
          delay: delaySec,
        });
        return NextResponse.json({
          success: true,
          scheduled: true,
          scheduledFor: new Date(targetTs).toISOString(),
        });
      }
    }

    const result = await executeCustomPushSend({
      title,
      body,
      url,
      image,
      audience,
      specificUserIds,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[admin/push/send-custom] Error:', err);
    return NextResponse.json({ error: 'Failed to send push notification' }, { status: 500 });
  }
}
