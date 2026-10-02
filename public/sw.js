const CACHE_NAME = 'lifevault-v2';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some static assets failed to pre-cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching for API requests and auth callbacks to guarantee live data
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (Opening the app or reloading a page while offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, cache the page for offline viewing
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Network failed! Check if this exact page was previously cached
          const cachedPage = await caches.match(event.request);
          if (cachedPage) {
            return cachedPage;
          }

          // Otherwise serve the special offline screen
          const offlinePage = await caches.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }

          const offlineHtml = await caches.match('/offline.html');
          if (offlineHtml) {
            return offlineHtml;
          }

          // Ultimate fallback to cached root
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Network-first strategy with cache fallback for static files and assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          (url.pathname.startsWith('/_next/static/') ||
            url.pathname.startsWith('/icons/') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.js'))
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
