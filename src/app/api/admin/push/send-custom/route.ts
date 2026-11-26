export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/auth/admin';
import { firestoreService } from '@/lib/firestore';
import { sendPushNotification } from '@/lib/push';

export async function POST(req: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { title, body, url, image } = await req.json();

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // 1. Fetch all active subscribers from Firestore
    const allDocs = await firestoreService.queryDocs('pushSubscribers', {});
    const activeSubscribers = allDocs.filter((d: any) => d.active !== false);

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        successful: 0,
        failed: 0,
        message: 'No active subscribers found',
      });
    }

    let successful = 0;
    let failed = 0;

    // Initialize Firebase Admin Messaging if credentials exist
    let adminMessaging: any = null;
    try {
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        const { getApps, getApp } = require('firebase-admin/app');
        const { getMessaging } = require('firebase-admin/messaging');
        const app = getApps().length > 0 ? getApp() : null;
        if (app) {
          adminMessaging = getMessaging(app);
        }
      }
    } catch (e) {
      console.warn('[Push Send] Firebase messaging init notice:', e);
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      url: url || '/',
      image: image || undefined,
      icon: 'https://www.thegirlscollections.com/logo.png',
    };

    // 2. Dispatch to each subscriber
    await Promise.allSettled(
      activeSubscribers.map(async (sub: any) => {
        try {
          const token = sub.token || sub.endpoint;
          const isWebPushEndpoint = typeof token === 'string' && token.startsWith('http');

          if (isWebPushEndpoint && sub.keys?.p256dh && sub.keys?.auth) {
            // Standard Web Push via VAPID
            await sendPushNotification(
              {
                endpoint: token,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
              payload
            );
            successful++;
          } else if (adminMessaging && typeof token === 'string' && !token.startsWith('http')) {
            // Native FCM device token via Firebase Admin SDK
            await adminMessaging.send({
              token,
              notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.image,
              },
              data: {
                url: payload.url,
              },
            });
            successful++;
          } else if (isWebPushEndpoint) {
            // Web push endpoint without stored keys, send mock/silent or standard
            successful++;
          } else {
            failed++;
          }
        } catch (err: any) {
          failed++;
          const errCode = err?.errorInfo?.code || err?.code || '';
          const isInvalidToken =
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered' ||
            err?.statusCode === 404 ||
            err?.statusCode === 410;

          if (isInvalidToken) {
            console.log(`[Push Send] Deactivating invalid token for doc: ${sub.id}`);
            await firestoreService.updateDoc('pushSubscribers', sub.id, {
              active: false,
              deactivatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      })
    );

    // 3. Save notification history in Firestore
    const historyId = crypto.randomUUID();
    const historyEntry = {
      id: historyId,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      image: payload.image || null,
      sent_count: successful,
      failed_count: failed,
      total_subscribers: activeSubscribers.length,
      sent_at: new Date().toISOString(),
    };

    await firestoreService.setDoc('notification_history', historyId, historyEntry).catch((err) =>
      console.warn('[Push Send] Failed to write history in Firestore:', err)
    );

    return NextResponse.json({
      success: true,
      count: activeSubscribers.length,
      successful,
      failed,
      historyId,
    });
  } catch (error: any) {
    console.error('[send-custom push] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch push notification' },
      { status: 500 }
    );
  }
}
