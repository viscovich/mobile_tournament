// Service Worker for Cagiano's Cup PWA

const CACHE_NAME = 'cagianos-cup-v9'; // Incremented cache name
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
    allClients.map((client) => client.postMessage(message))
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
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Helper function to add CORS headers to response
function addCorsHeaders(response) {
  // Handle null or undefined responses first
  if (!response) {
    console.error('ServiceWorker: addCorsHeaders received a null or undefined response.');
    return new Response('Service worker encountered an issue: No response object provided to addCorsHeaders.', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }

  // Opaque responses cannot have their headers/body read or modified.
  // They often have status 0. Return them as-is.
  if (response.type === 'opaque' || response.type === 'opaqueredirect') {
    return response;
  }

  // If the response (non-opaque) has status 0, it's likely a network error.
  // We cannot construct a new Response with status 0. Return a synthetic error.
  if (response.status === 0) {
    console.error('ServiceWorker: addCorsHeaders received a non-opaque response with status 0.', response);
    return new Response('Service worker: Upstream response had status 0.', {
      status: 502, // Bad Gateway, indicating an issue with an upstream server/response
      statusText: 'Bad Gateway'
    });
  }

  // For non-OK responses (e.g., 3xx, 4xx, 5xx), also return them as-is.
  // The Response constructor will throw a RangeError if status is not [200, 599].
  // It's safer to only modify OK responses (status 200-299).
  if (!response.ok) { // .ok is true for statuses in the range 200-299
    return response;
  }

  // If we reach here, response is not opaque, status is not 0, and response.ok is true (status 200-299).
  // This means response.status is in a valid range for constructing a new Response.
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
