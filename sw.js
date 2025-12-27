// Service Worker 版本
const CACHE_VERSION = 'v1.5';
const CACHE_NAME = 'work-calendar-cache-' + CACHE_VERSION;
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/config.js',
    '/constants.js',
    '/validators.js',
    '/storage.js',
    '/dialog.js',
    '/manifest.json',
    '/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 缓存文件:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[SW] 缓存失败:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(error => {
                        console.error('[SW] Fetch 失败:', error);
                        return new Response('离线模式下无法访问此资源', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
            .catch(error => {
                console.error('[SW] 缓存匹配失败:', error);
                return fetch(event.request)
                    .catch(() => {
                        return new Response('离线模式下无法访问此资源', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});