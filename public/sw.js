const CACHE_NAME = 'festival-insider-cache-v3';

// --- Lifecycle: Install ---
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// --- Lifecycle: Activate ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Clean up old caches
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('festival-insider-cache-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- Lifecycle: Fetch ---
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. SAFETY CHECK: Ignore non-HTTP/HTTPS schemes (like chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. SAFETY CHECK: Ignore non-GET requests (cannot cache POSTs)
  if (request.method !== 'GET') {
    return;
  }

  // 3. API CHECK: Cache weather (stale-while-revalidate), skip all other API calls
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname === '/api/weather') {
      event.respondWith(
        caches.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      );
    }
    return;
  }

  // 4. Navigation Requests (HTML) - Network First, fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If valid response, cache it
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, return cached page
          return caches.match(request);
        })
    );
    return;
  }

  // 5. Asset Requests - Cache First, fallback to Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        // Cache valid responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// --- Notifications ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin);
      }
    })
  );
});
