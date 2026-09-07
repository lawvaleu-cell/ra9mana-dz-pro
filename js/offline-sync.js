(() => {
  'use strict';

  const LIBRARY_URL = 'data/library.json';
  const ARTICLES_URL = 'data/articles.json';
  const SYNC_KEY = 'ra9mana-last-sync';
  const CACHE_NAME = 'ra9mana-pwa-v3-runtime';
  let running = false;

  function isOnline() { return navigator.onLine !== false; }

  function resolveUrl(path) {
    return new URL(path, location.href).href;
  }

  async function openCache() {
    if (!('caches' in window)) return null;
    return caches.open(CACHE_NAME);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
  }

  function urlsFrom(list) {
    const out = [];
    for (const item of Array.isArray(list) ? list : []) {
      for (const key of ['pdf', 'cover']) {
        const value = item && item[key];
        if (typeof value === 'string' && value) out.push(value);
      }
      const photo = item?.contributor?.photo || item?.author?.photo;
      if (typeof photo === 'string' && photo) out.push(photo);
    }
    return [...new Set(out)];
  }

  async function cacheUrls(urls) {
    const cache = await openCache();
    if (!cache) return { total: 0, cached: 0 };
    let cached = 0;
    for (const path of urls) {
      try {
        const absolute = resolveUrl(path);
        const res = await fetch(absolute, { cache: 'no-store' });
        if (res.ok) { await cache.put(absolute, res.clone()); cached++; }
      } catch (_) { /* one unavailable file must not stop the sync */ }
    }
    return { total: urls.length, cached };
  }

  async function getFileUrl(path) {
    if (!path) return '';
    const absolute = resolveUrl(path);
    const cache = await openCache();
    if (cache) {
      const cached = await cache.match(absolute);
      if (cached) {
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
    }
    if (!isOnline()) return '';
    try {
      const res = await fetch(absolute, { cache: 'no-store' });
      if (!res.ok) return '';
      if (cache) await cache.put(absolute, res.clone());
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (_) {
      return '';
    }
  }

  async function openFile(path) {
    if (!path) return false;
    const absolute = resolveUrl(path);
    if (!absolute.toLowerCase().includes('.pdf')) return false;

    const cache = await openCache();
    if (cache) {
      const cached = await cache.match(absolute);
      if (cached) {
        const viewerUrl = new URL('__ra9mana-pdf', location.href);
        viewerUrl.searchParams.set('src', absolute);
        location.assign(viewerUrl.href);
        return true;
      }
    }

    if (!isOnline()) return false;

    try {
      const res = await fetch(absolute, { cache: 'no-store' });
      if (!res.ok) return false;
      if (cache) await cache.put(absolute, res.clone());
      const viewerUrl = new URL('__ra9mana-pdf', location.href);
      viewerUrl.searchParams.set('src', absolute);
      location.assign(viewerUrl.href);
      return true;
    } catch (_) {
      return false;
    }
  }

  function setStatus(text, kind = '') {
    const el = document.getElementById('pwa-sync-status');
    if (!el) return;
    el.textContent = text;
    el.dataset.state = kind;
  }

  async function sync() {
    if (running || !isOnline()) return;
    running = true;
    setStatus('Synchronisation…', 'syncing');
    try {
      const [refs, articles] = await Promise.all([
        fetchJson(LIBRARY_URL),
        fetchJson(ARTICLES_URL)
      ]);
      const urls = urlsFrom(refs).concat(urlsFrom(articles));
      const result = await cacheUrls(urls);
      localStorage.setItem(SYNC_KEY, new Date().toISOString());
      setStatus(`✓ ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`, 'ok');
      window.dispatchEvent(new CustomEvent('ra9mana:offline-sync', { detail: { refs, articles, files: result } }));
    } catch (e) {
      setStatus('Hors ligne', 'offline');
      window.dispatchEvent(new CustomEvent('ra9mana:offline-sync-error', { detail: e }));
      console.warn('RA9MANA offline sync:', e);
    } finally {
      running = false;
    }
  }

  function addStatus() {
    if (!location.pathname.includes('library.html') && !location.pathname.includes('articles.html')) return;
    const host = document.querySelector('.library-toolbar') || document.querySelector('.page-hero .container');
    if (!host || document.getElementById('pwa-sync-status')) return;
    const el = document.createElement('div');
    el.id = 'pwa-sync-status';
    el.setAttribute('aria-live', 'polite');
    el.textContent = isOnline() ? 'Synchronisation…' : 'Hors ligne';
    el.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:10px 0 0;font-size:.82rem;opacity:.72;';
    host.appendChild(el);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addStatus();
    setTimeout(sync, 700);
  });
  window.addEventListener('online', sync);

  window.RA9MANA_OFFLINE = {
    getFileUrl,
    openFile,
    resolveUrl,
    sync
  };
})();
