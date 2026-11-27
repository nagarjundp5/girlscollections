export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { firestoreService } from '@/lib/firestore';
import { getAuthUserId } from '@/lib/auth/getAuthUserId';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token || body.endpoint;
    const keys = body.keys;
    const productId = body.productId || null;
    const topicOrders = body.topicOrders !== false; // default true
    const topicOffers = body.topicOffers !== false; // default true

    if (!token) {
      return NextResponse.json({ error: 'Missing token or endpoint' }, { status: 400 });
    }

    const userId = (await getAuthUserId(req)) || body.userId || null;
    const userAgent = req.headers.get('user-agent') || '';

    // Determine friendly device name
    let device = body.device || 'Web Browser';
    if (!body.device) {
      if (/iPhone|iPad|iPod/i.test(userAgent)) device = 'iOS Device';
      else if (/Android/i.test(userAgent)) device = 'Android Device';
      else if (/Macintosh/i.test(userAgent)) device = 'macOS Desktop';
      else if (/Windows/i.test(userAgent)) device = 'Windows PC';
      else if (/Linux/i.test(userAgent)) device = 'Linux Desktop';
    }

    // Deterministic doc ID from token for clean deduplication
    const docId = crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);

    // Save to Firestore pushSubscribers collection
    await firestoreService.setDoc('pushSubscribers', docId, {
      token,
      endpoint: token,
      keys: keys || null,
      userId,
      device,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      productId,
      topicOrders,
      topicOffers,
    }, { merge: true });

    // Also persist to Neon if keys exist (VAPID web-push subscriptions)
    if (keys?.p256dh && keys?.auth) {
      await db
        .insert(pushSubscriptions)
        .values({
          endpoint: token,
          p256dh: keys.p256dh,
          auth: keys.auth,
          product_id: productId,
          user_id: userId,
          topic_orders: topicOrders,
          topic_offers: topicOffers,
          user_agent: userAgent,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            p256dh: keys.p256dh,
            auth: keys.auth,
            product_id: productId,
            user_id: userId,
            topic_orders: topicOrders,
            topic_offers: topicOffers,
            user_agent: userAgent,
            notified_at: null,
          },
        })
        .catch((err: any) => console.warn('[push/subscribe] Neon sync notice:', err));
    }

    return NextResponse.json({ success: true, subscriberId: docId });
  } catch (error: any) {
    console.error('[push/subscribe] Error saving subscriber:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

// PATCH — update topic preferences for an existing subscription
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, topicOrders, topicOffers } = body;
    if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

    const userId = await getAuthUserId(req);
    const docId = crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 32);

    await firestoreService.setDoc('pushSubscribers', docId, {
      topicOrders: topicOrders !== undefined ? topicOrders : true,
      topicOffers: topicOffers !== undefined ? topicOffers : true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await db
      .insert(pushSubscriptions)
      .values({
        endpoint,
        p256dh: '', auth: '', // placeholder – will be ignored on conflict
        user_id: userId,
        topic_orders: topicOrders !== undefined ? topicOrders : true,
        topic_offers: topicOffers !== undefined ? topicOffers : true,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          topic_orders: topicOrders !== undefined ? topicOrders : true,
          topic_offers: topicOffers !== undefined ? topicOffers : true,
        },
      })
      .catch(() => {}); // ignore if no Neon record

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
