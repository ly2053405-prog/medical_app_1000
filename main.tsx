const CACHE_NAME = 'medical-dashboard-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'snooze') {
    // Send message to clients to snooze
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SNOOZE_NOTIFICATION',
            id: event.notification.data?.id,
            mins: 15
          });
        });
      })
    );
  } else {
    // Dismiss and focus
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        if (clients.length) {
          clients[0].focus();
        }
        clients.forEach(client => {
          client.postMessage({
            type: 'DISMISS_NOTIFICATION',
            id: event.notification.data?.id
          });
        });
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
           // Fallback for offline mode if needed
           return caches.match('/');
        });
      })
  );
});