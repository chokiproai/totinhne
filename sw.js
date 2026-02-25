/* ========================================
   Service Worker - Web Projects
   Provides offline support and caching
   ======================================== */

const CACHE_NAME = 'projects-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/confession/',
    '/confession/index.html',
    '/confession/style.css',
    '/confession/script.js',
    '/confession/bg-music.mp3',
    '/confession/img/bear_hug.gif',
    '/confession/img/cat_love.gif',
    '/confession/img/heart.gif',
    '/confession/img/dance.gif',
    '/confession/img/kiss.gif',
    '/3d-heart/',
    '/3d-heart/index.html',
    '/3d-heart/style.css',
    '/3d-heart/script.js',
    '/christmas/',
    '/christmas/index.html',
    '/christmas/style.css',
    '/christmas/script.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.log('Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) return response;

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseToCache));

                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
