const CURRENT_CACHE = 'v1.001';
const resources = [
    '/',
    '/index.html',
    '/assets/css/basic.css',
    '/assets/css/about.css',
    '/assets/css/canvas.css',
    '/assets/css/chatBox.css',
    '/assets/css/info.css',
    '/assets/css/key.css',
    '/assets/css/leaderBoard.css',
    '/assets/css/setting.css',
    '/assets/js/script.js',
    '/assets/js/chatManager.js',
    '/assets/js/draw.js',
    '/assets/js/info.js',
    '/assets/js/keyManager.js',
    '/assets/js/leaderBoard.js',
    '/assets/js/settingsManager.js',
    '/assets/js/webSocket.js'
    // 在这增加需要缓存的资源
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CURRENT_CACHE)
        .then((cache) => {
            return cache.addAll(resources);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CURRENT_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            return response || fetch(event.request);
        })
    );
});