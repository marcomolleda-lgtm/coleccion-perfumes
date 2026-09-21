const CACHE = 'perfumes-v37';
const ASSETS = ['./index.html', './manifest.json', './icon-192-v7.png', './icon-512-v7.png', './icon-192-maskable-v7.png', './icon-512-maskable-v7.png', './sample-chanel5-v1.jpg', './sample-shalimar-v1.jpg', './sample-acquadigio-v1.jpg', './sample-chanel5-2-v1.jpg', './sample-acquadigio-2-v1.jpg', './sample-shalimar-2-v1.jpg', './sample-chanel5-3-v1.jpg'];

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
  // For the HTML page itself: always try the network first, so users get
  // the latest version as soon as it's deployed. Only fall back to the
  // cached copy if there's no connection (offline support).
  var isHTML = e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && (e.request.headers.get('accept') || '').includes('text/html'));

  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); });
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // For everything else (images, icons, manifest): cache-first is fine,
  // these don't change often and this keeps the app fast/offline-capable.
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
