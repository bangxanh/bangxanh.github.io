/* Bộ nhớ đệm để mở nhanh và học được cả khi mất mạng */
const CACHE = 'bangxanh-v1.2.1';
const SHELL = ['./', 'index.html', 'config.js', 'js/grade.js', 'js/ui.js', 'js/store.js', 'js/app.js', 'js/quiz.js', 'js/tools.js', 'js/admin.js', 'js/lessons.js', 'js/ai.js', 'data/bai/index.json', 'data/content.js', 'data/site-data.json', 'data/news.json', 'manifest.webmanifest', 'icon-192.png', 'icon.svg'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/') || url.pathname.includes('/uploads/')) return;
  const networkFirst = req.mode === 'navigate' || /\.(json|html)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (networkFirst) {
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((m) => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((m) => {
    const net = fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; }).catch(() => m);
    return m || net;
  }));
});
