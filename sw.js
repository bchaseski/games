const CACHE = 'goalie-hero-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/game.js', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      if (res) return res;
      return fetch(event.request);
    })
  );
});
