'use client';

import { urlBase64ToUint8Array } from './vapid';

/**
 * Triggers Notification.requestPermission() inside a user gesture, registers /sw.js,
 * creates a Web Push subscription, and saves it linked to the user.
 * If permission is denied, silently skips and remembers so it doesn't ask again.
 */
export async function subscribeUserToPush(options: {
  topicOrders?: boolean;
  topicOffers?: boolean;
} = {}): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  // If user previously denied or browser blocked, silently skip
  if (Notification.permission === 'denied' || localStorage.getItem('tgc_push_denied') === '1') {
    return false;
  }

  try {
    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      localStorage.setItem('tgc_push_denied', '1');
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const rawKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!rawKey) return false;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(rawKey),
      }));

    const json = subscription.toJSON();
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
        topicOrders: options.topicOrders !== false,
        topicOffers: options.topicOffers !== false,
      }),
    });

    localStorage.setItem('push_alerts_subscribed', 'true');
    return true;
  } catch {
    return false;
  }
}
