const VERSION = 'ra9mana-pwa-v5';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const DATA = `${VERSION}-data`;

const APP_SHELL = [
  './admin.html',
  './articles.html',
  './assets/brand/logo.png',
  './assets/icons/icons.svg',
  './assets/images/treated/ecosystem-duotone.jpg',
  './assets/images/treated/hero-photo.jpg',
  './assets/images/treated/philosophy-duotone.jpg',
  './assets/images/treated/why-duotone.jpg',
  './assets/products/business.svg',
  './assets/products/education.svg',
  './assets/products/medical.svg',
  './assets/products/restaurant.svg',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/ra9mon/ra9mon.png',
  './assets/vendor/qrcode.js',
  './compliance/app.js',
  './compliance/certificate.js',
  './compliance/i18n-extend.js',
  './compliance/index.html',
  './compliance/questions.js',
  './compliance/rules.js',
  './compliance/services/certificate-service.js',
  './compliance/verify-data.js',
  './compliance/verify.html',
  './compliance/verify.js',
  './covers/REF-2026-00003.png',
  './css/styles.css',
  './data/articles.json',
  './data/library.json',
  './index.html',
  './js/admin.js',
  './js/article-form.js',
  './js/articles-common.js',
  './js/articles-data.js',
  './js/articles-i18n-extend.js',
  './js/articles.js',
  './js/i18n.js',
  './js/library-common.js',
  './js/citation.js',
  './js/library-data.js',
  './js/library-types.js',
  './js/library.js',
  './js/locales.js',
  './js/main.js',
  './js/offline-sync.js',
  './js/products.js',
  './js/pwa.js',
  './js/reference-form.js',
  './js/simple-header.js',
  './js/submit.js',
  './library.html',
  './locales/ar.json',
  './locales/en.json',
  './locales/fr.json',
  './submit-article.html',
  './submit.html',
  './sw.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![SHELL, RUNTIME, DATA].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isDataRequest(url) {
  return url.pathname.endsWith('/data/library.json') || url.pathname.endsWith('/data/articles.json');
}
function isPdf(url) { return url.pathname.toLowerCase().endsWith('.pdf'); }
function isImage(url) { return /\.(png|jpe?g|webp)$/i.test(url.pathname); }

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw _;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function serveOfflinePdf(url) {
  const source = url.searchParams.get('src');
  if (!source) return new Response('Missing PDF source', { status: 400 });

  let target;
  try {
    target = new URL(source, self.location.origin);
  } catch (_) {
    return new Response('Invalid PDF source', { status: 400 });
  }

  // Only allow PDFs from this same origin.
  if (target.origin !== self.location.origin || !isPdf(target)) {
    return new Response('Invalid PDF source', { status: 400 });
  }

  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(target.href);
  if (cached) return cached;

  try {
    const response = await fetch(target.href);
    if (response.ok) await cache.put(target.href, response.clone());
    return response;
  } catch (_) {
    return new Response('This PDF is not available offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/__ra9mana-pdf')) {
    event.respondWith(serveOfflinePdf(url));
    return;
  }

  if (isDataRequest(url)) {
    event.respondWith(networkFirst(event.request, DATA));
    return;
  }
  if (isPdf(url) || isImage(url)) {
    event.respondWith(cacheFirst(event.request, RUNTIME));
    return;
  }

  // Navigation: network first so the normal website remains fresh; fall back to cached pages.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(RUNTIME).then(c => c.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then(r => r || caches.match('./library.html') || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(cacheFirst(event.request, RUNTIME).catch(() => caches.match(event.request)));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
