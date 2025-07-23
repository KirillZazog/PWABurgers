const CACHE_NAME = 'vintagefood-v2';
const urlsToCache = [
    '/',
    '/BasicDocument.html',
    '/service.html',
    '/style.css',
    '/index.js',
    '/manifest.json',
    '/images/logo.png',
    '/images/bueger.png',
    '/images/Картинка%20_Бургеры_.png',
    '/images/Картинка%20_Блюда%20из%20курицы_.png',
    '/images/Картинка%20_Горячие%20блюда_.png',
    '/images/Картинка%20_Закуски_.png',
    '/images/Картинка%20_Салаты_.png',
    '/images/Картинка%20_Десерты_.png',
    '/images/Кнопка%20_Корзина_.png',
    '/images/VK%20Circled.png',
    '/images/Telegram.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));

                        return response;
                    })
                    .catch(() => {
                        if (event.request.destination === 'document') {
                            return caches.match('/BasicDocument.html');
                        }
                    });
            })
    );
});

self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});