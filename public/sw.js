const CACHE_NAME = 'pitchfork-consciousness-v1';
const CONSCIOUSNESS_DATA_CACHE = 'consciousness-data-v1';

const STATIC_ASSETS = [
  '/',
  '/consciousness',
  '/governance', 
  '/leadership',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== CONSCIOUSNESS_DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle consciousness API requests with caching
  if (url.pathname.includes('/api/consciousness')) {
    event.respondWith(
      caches.open(CONSCIOUSNESS_DATA_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Background sync for consciousness insights
self.addEventListener('sync', (event) => {
  if (event.tag === 'consciousness-sync') {
    event.waitUntil(syncConsciousnessData());
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

async function syncConsciousnessData() {
  try {
    // Sync offline consciousness entries when online
    const cache = await caches.open(CONSCIOUSNESS_DATA_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('POST')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log('Will retry consciousness sync later:', error);
        }
      }
    }
  } catch (error) {
    console.error('Consciousness sync failed:', error);
  }
}