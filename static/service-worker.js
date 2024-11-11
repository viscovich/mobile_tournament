// Service Worker for Cagiano's Cup PWA

const CACHE_NAME = 'cagianos-cup-v7';
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

// Send message to all clients
const sendMessageToClients = async (message) => {
  const allClients = await clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  });

  return Promise.all(
    allClients.map((client) => {
      // Check if client is iOS/iPadOS (Safari)
      const isIOS = client.userAgent && /iPad|iPhone|iPod/.test(client.userAgent);
      if (isIOS) {
        return client.postMessage(message);
      }
    })
  );
};

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Force activation after install
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      clients.claim(),
      // Remove old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              // Delete old cache and notify iOS clients
              return caches.delete(cacheName).then(() => {
                return sendMessageToClients({
                  type: 'NEW_VERSION',
                  message: 'New version available! Refresh to update.'
                });
              });
            }
          })
        );
      })
    ])
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

// Fetch event handler with network-first strategy for HTML
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

  // Network-first strategy for HTML navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Clone the response before caching
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
              // If both network and cache fail, return cached home page
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Network-first strategy for all requests
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Clone the response before caching
        const responseToCache = networkResponse.clone();
        
        // Cache successful responses for whitelisted assets
        if (networkResponse.ok && ASSETS_TO_CACHE.some(asset => event.request.url.endsWith(asset))) {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
        }
        
        return addCorsHeaders(networkResponse);
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return addCorsHeaders(cachedResponse);
            }
            // If both network and cache fail, return error
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
