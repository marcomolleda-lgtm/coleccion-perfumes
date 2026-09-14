const CACHE = 'perfumes-v19';
const ASSETS = ['./index.html', './manifest.json', './icon-192-v7.png', './icon-512-v7.png', './icon-192-maskable-v7.png', './icon-512-maskable-v7.png', './sample-chanel5-v1.jpg', './sample-shalimar-v1.jpg', './sample-acquadigio-v1.jpg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // cache.add each file separately so one slow/missing file (e.g. a CDN
      // propagation delay right after deploying) doesn't block the whole
      // update — previously cache.addAll() failed all-or-nothing here.
      return Promise.all(
        ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('sw: failed to precache', url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
