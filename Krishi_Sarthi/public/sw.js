// KIRAN Service Worker — Versioned Static Cache
const CACHE_NAME = 'kiran-static-v1';

// Safe core static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/Kiran.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png'
];

// Install: Cache core static assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kiran-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Secure routing — strictly bypass APIs, auth headers, and mutation methods
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Only handle GET requests; never intercept POST, PUT, PATCH, DELETE
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Do not intercept cross-origin/external API requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. STRICT SECURITY BYPASS: Never intercept or cache API or authenticated endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/price') ||
    url.pathname.startsWith('/db-test') ||
    request.headers.has('Authorization')
  ) {
    return;
  }

  // 4. Navigation requests (HTML pages): Network-first with offline /index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 5. Safe Static Assets: Cache-first with network fallback and dynamic caching for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache only successful same-origin responses for static files
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          (url.pathname.startsWith('/assets/') ||
           /\.(png|jpg|jpeg|svg|webp|css|js|woff2?|webmanifest)$/i.test(url.pathname))
        ) {
          const responseToClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
