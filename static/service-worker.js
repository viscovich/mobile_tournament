// Service Worker for Cagiano's Cup PWA

const CACHE_NAME = 'cagianos-cup-v5'; // Incrementing version to force cache refresh
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/images/beach-volleyball.png',
  '/images/beach-volleyball3.png',
  '/images/players-banner.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as it becomes active
  event.waitUntil(clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to add CORS headers to response
function addCorsHeaders(response) {
  if (!response) return response;
  
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Skip caching for Supabase requests
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Special handling for manifest.json
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      caches.match('/manifest.json')
        .then(response => {
          if (response) {
            return addCorsHeaders(response);
          }
          return fetch('/manifest.json')
            .then(networkResponse => {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put('/manifest.json', responseToCache));
              return addCorsHeaders(networkResponse);
            })
            .catch(() => new Response(JSON.stringify({
              name: "Cagiano's Cup",
              short_name: "Cagiano's Cup",
              start_url: "/"
            }), {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }));
        })
    );
    return;
  }

  // For HTML requests only (not JSON)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return addCorsHeaders(networkResponse);
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return addCorsHeaders(response);
              }
              return caches.match('/');
            });
        })
    );
    return;
  }

  // For static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return addCorsHeaders(cachedResponse);
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Only cache static assets
            if (ASSETS_TO_CACHE.some(asset => event.request.url.endsWith(asset))) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }

            return addCorsHeaders(networkResponse);
          });
      })
  );
});
