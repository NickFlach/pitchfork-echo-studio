// Enhanced Service Worker with advanced caching strategies
// Auto-versioned caches that update on each deployment
const VERSION = new Date().getTime();
const CACHE_NAME = `pitchfork-${VERSION}`;
const RUNTIME_CACHE = `pitchfork-runtime-${VERSION}`;
const IMAGE_CACHE = `pitchfork-images-${VERSION}`;
const API_CACHE = `pitchfork-api-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/consciousness',
  '/governance', 
  '/leadership',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing with version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache opened');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating with version:', VERSION);
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

// Cache-first strategy for images
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Image not available', { status: 503 });
  }
}

// Stale-while-revalidate for static assets
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(RUNTIME_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // API requests - network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Images - cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Static assets - stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Push notifications for consciousness insights
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New consciousness insight available',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [200, 100, 200],
    data: {
      url: '/consciousness'
    },
    actions: [
      {
        action: 'view',
        title: 'View Insight'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pitchfork Consciousness', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

async function syncData() {
  console.log('📤 Syncing offline data...');
  // Implement offline data sync logic here
}