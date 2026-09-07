(() => {
  'use strict';

  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const launchedFromHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');

  // The normal website keeps its homepage. Only the installed PWA starts in the legal library.
  const shouldOpenLibrary = standalone && launchedFromHome;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      } catch (e) {
        console.warn('RA9MANA PWA service worker:', e);
      }
      if (shouldOpenLibrary && !location.pathname.endsWith('/library.html')) {
        const target = new URL('library.html', location.href);
        location.replace(target.href);
      }
    });
  } else if (shouldOpenLibrary) {
    location.replace(new URL('library.html', location.href).href);
  }
})();
