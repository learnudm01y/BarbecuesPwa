const CACHE_NAME = 'kabab-menu-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/device-info.html',
  '/style.css',
  '/app.js',
  '/device-info.js',
  '/manifest.json',
  '/fonts/Tajawal-Regular.ttf',
  '/fonts/Tajawal-Light.ttf',
  '/fonts/Tajawal-Medium.ttf',
  '/fonts/Tajawal-Bold.ttf',
  '/fonts/Tajawal-ExtraBold.ttf',
  '/fonts/Tajawal-Black.ttf',
  '/fonts/Tajawal-ExtraLight.ttf',
  '/images/1725890147_r6H6cQ.jpg',
  '/images/1725946614_TRBvLL.jpg',
  '/images/53d1276e-74fd-46d2-9e69-a0bf8f02fca5.jpg',
  '/images/660.png-550x550.png.webp',
  '/images/82b2ff44ea849a79d2674418aa85547e_5534d19d-636f-498f-b4d4-f606affb55d7.webp',
  '/images/mmw_638955205646984466.jpg',
  '/images/pngtree-chicken-mixed-grills-platter-with-salad-png-image_15071847.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control immediately
      return self.clients.claim();
    })
  );
  
  // Force reload all clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'CACHE_UPDATED' }));
  });
});