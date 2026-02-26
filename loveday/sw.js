const CACHE_NAME = 'loveday-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Nhắc nhở', body: event.data.text(), url: 'https://loveday.bolt.host' };
  }

  const isUpdate = payload.type === 'app-update';
  const { title = 'Nhắc nhở', body = '', url = 'https://loveday.bolt.host', icon, badge } = payload;

  const options = {
    body,
    icon: icon || '/favicon.svg',
    badge: badge || '/favicon.svg',
    data: { url, type: payload.type || 'reminder' },
    requireInteraction: isUpdate,
    vibrate: isUpdate ? [300, 100, 300, 100, 300] : [200, 100, 200],
    tag: isUpdate ? 'loveday-app-update' : `loveday-${Date.now()}`,
    renotify: isUpdate ? false : true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.url || 'https://loveday.bolt.host';
  const isUpdate = data.type === 'app-update';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith('https://loveday.bolt.host') && 'focus' in client) {
          if (isUpdate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
