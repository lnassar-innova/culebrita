// Culebrita 1.0.0: guarda la app en el celular para que funcione sin internet.
// Al subir una versión nueva, cambia el número de CACHE para que los celulares la descarguen.
const CACHE = 'culebrita-1.0.0';
const FILES = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Responde desde el celular y actualiza en segundo plano
  const net = fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => null);
  e.waitUntil(net);
  e.respondWith(caches.match(req, { ignoreSearch: true })
    .then(hit => hit || net.then(res => res || caches.match('./index.html'))));
});
