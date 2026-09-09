const CACHE_NAME = 'fiscalizacion-ms-v1';
const ASSETS = [
  '/metroseguridad/fiscalizacion_ms.html',
  '/metroseguridad/manifest_fiscalizacion.json',
  '/metroseguridad/icon-192-fisc.png',
  '/metroseguridad/icon-512-fisc.png'
];

// Instalar y cachear recursos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interceptar requests — network first, cache fallback
self.addEventListener('fetch', e => {
  // No interceptar requests al Apps Script (necesitan red)
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Actualizar cache con respuesta fresca
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
