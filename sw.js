const CACHE_NAME = 'app-cache-v2';
const RECURSOS = [
  './',
  './index.html',
  './manifest.json'
];

// Evento de instalación: se almacenan los archivos clave en la caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RECURSOS);
    })
  );
});

// Evento de activación: limpia cachés antiguas si las hay
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Evento fetch: responde con recursos de la caché si existen, si no, los busca en la red
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});