// Service Worker 版本
const CACHE_VERSION = 'v1.5';
const CACHE_NAME = 'work-calendar-cache-' + CACHE_VERSION;
const urlsToCache = ['/'];

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