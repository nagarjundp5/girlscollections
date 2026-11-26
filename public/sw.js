// Service Worker for The Girls Collections Web Push & FCM
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'The Girls Collections', body: event.data.text() };
    }
  }

  const title = data.title || data.notification?.title || 'The Girls Collections';
  const options = {
    body: data.body || data.notification?.body || 'New exclusive drops & bridal edits are live!',
    icon: data.icon || data.notification?.icon || '/logo.png',
    badge: data.badge || '/logo-120.webp',
    image: data.image || data.notification?.image || undefined,
    data: {
      url: data.url || data.data?.url || '/',
    },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
