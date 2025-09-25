const CACHE_NAME = 'naathconnect-v1';
const urlsToCache = [
    '/',
    '/assets/css/style.css',
    '/assets/css/animations.css',
    '/assets/js/main.js',
    '/assets/images/avatar.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});