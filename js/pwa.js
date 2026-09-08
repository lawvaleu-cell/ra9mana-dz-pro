(() => {
  'use strict';

  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = window.navigator.standalone === true;
  const launchedFromHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
  const shouldOpenLibrary = (standalone || iosStandalone) && launchedFromHome;

  const TEXT = {
    fr: {
      install: 'Installer l\'application',
      installNav: 'Installer l\'app',
      installTitle: 'RA9MANA DZ sur votre appareil',
      installDesc: 'Installez le site comme une application pour retrouver la bibliothèque juridique et vos contenus plus rapidement, même hors connexion.',
      installNow: 'Installer maintenant',
      installed: 'Application installée',
      later: 'Plus tard',
      botName: 'RA9MON',
      botGreeting: 'Salut 👋 Je suis RA9MON.',
      botIntro: 'Ton ami dans le monde numérique. Je peux te guider vers la bibliothèque, les articles et l’installation de RA9MANA DZ.',
      botLibrary: 'Ouvrir la bibliothèque',
      botArticles: 'Voir les articles',
      botExplore: 'Explorer les contenus',
      botBack: 'Retour',
      botCount: 'contenus disponibles',
      botInstall: 'Installer le site',
      botClose: 'Fermer',
      botHint: 'Besoin d’un coup de main ?',
      notReady: 'L’installation sera proposée dès que votre navigateur la rend disponible.',
      ios: 'Sur iPhone/iPad : utilisez « Ajouter à l’écran d’accueil » depuis le menu Partager.'
    },
    en: {
      install: 'Install the app',
      installNav: 'Install app',
      installTitle: 'RA9MANA DZ on your device',
      installDesc: 'Install the website as an app to reach the legal library and your content faster, even when offline.',
      installNow: 'Install now',
      installed: 'App installed',
      later: 'Later',
      botName: 'RA9MON',
      botGreeting: 'Hi 👋 I’m RA9MON.',
      botIntro: 'Your friend in the digital world. I can guide you to the library, articles and the RA9MANA DZ installation.',
      botLibrary: 'Open the library',
      botArticles: 'View articles',
      botExplore: 'Explore content',
      botBack: 'Back',
      botCount: 'available items',
      botInstall: 'Install the site',
      botClose: 'Close',
      botHint: 'Need a hand?',
      notReady: 'The installation option will appear as soon as your browser makes it available.',
      ios: 'On iPhone/iPad: use “Add to Home Screen” from the Share menu.'
    },
    ar: {
      install: 'تحميل الموقع كتطبيق',
      installNav: 'تحميل التطبيق',
      installTitle: 'رقمانة DZ على جهازك',
      installDesc: 'ثبّت الموقع كتطبيق للوصول إلى المكتبة القانونية والمقالات بسرعة، وحتى عند انقطاع الإنترنت.',
      installNow: 'تحميل الآن',
      installed: 'تم تثبيت التطبيق',
      later: 'لاحقًا',
      botName: 'رقمون',
      botGreeting: 'مرحبًا 👋 أنا رقمون.',
      botIntro: 'صديقك في العالم الرقمي. أساعدك في الوصول إلى المكتبة والمقالات وتثبيت رقمانة DZ على جهازك.',
      botLibrary: 'افتح المكتبة',
      botArticles: 'شاهد المقالات',
      botExplore: 'استكشف المحتوى',
      botBack: 'رجوع',
      botCount: 'محتوى متاح',
      botInstall: 'حمّل الموقع كتطبيق',
      botClose: 'إغلاق',
      botHint: 'تحتاج إلى مساعدة؟',
      notReady: 'سيظهر خيار التثبيت فور إتاحته من طرف المتصفح.',
      ios: 'على iPhone/iPad: اختر «إضافة إلى الشاشة الرئيسية» من قائمة المشاركة.'
    }
  };

  let deferredPrompt = null;
  let installCard = null;
  let botPanel = null;

  function lang() {
    const current = (typeof RA9MANA_I18N !== 'undefined' && typeof RA9MANA_I18N.getLang === 'function')
      ? RA9MANA_I18N.getLang()
      : (document.documentElement.lang || 'fr').slice(0, 2);
    return TEXT[current] ? current : 'fr';
  }

  function t(key) { return TEXT[lang()][key] || TEXT.fr[key] || key; }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function installAvailable() {
    return !!deferredPrompt;
  }

  async function requestInstall() {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      updateInstallUI();
      try {
        await promptEvent.prompt();
        await promptEvent.userChoice;
      } catch (e) {
        console.warn('RA9MANA install prompt:', e);
      }
      return;
    }

    if (isIos() && !iosStandalone) {
      window.alert(t('ios'));
      return;
    }

    window.alert(t('notReady'));
  }

  function makeDownloadIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function injectNavButton() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight || document.getElementById('ra9mon-install-nav')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'ra9mon-install-nav';
    button.className = 'ra9mon-install-nav';
    button.innerHTML = `${makeDownloadIcon()}<span class="ra9mon-install-nav-label"></span>`;
    button.addEventListener('click', requestInstall);
    navRight.insertBefore(button, navRight.querySelector('.nav-toggle') || null);
    updateInstallUI();
  }

  function injectMobileInstall() {
    const foot = document.querySelector('.mobile-menu-foot');
    if (!foot || document.getElementById('ra9mon-install-mobile')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'ra9mon-install-mobile';
    button.className = 'btn btn-primary btn-block ra9mon-install-mobile';
    button.innerHTML = `${makeDownloadIcon()}<span class="ra9mon-install-mobile-label"></span>`;
    button.addEventListener('click', requestInstall);
    foot.insertBefore(button, foot.lastElementChild || null);
  }

  function injectInstallCard() {
    const host = document.querySelector('.hero-ctas');
    if (!host || document.getElementById('ra9mon-install-card')) return;

    installCard = document.createElement('aside');
    installCard.id = 'ra9mon-install-card';
    installCard.className = 'ra9mon-install-card';
    installCard.innerHTML = `
      <div class="ra9mon-install-card-icon">${makeDownloadIcon()}</div>
      <div class="ra9mon-install-card-copy">
        <strong class="ra9mon-install-title"></strong>
        <p class="ra9mon-install-desc"></p>
      </div>
      <button type="button" class="btn btn-primary ra9mon-install-action"></button>
    `;
    installCard.querySelector('.ra9mon-install-action').addEventListener('click', requestInstall);
    host.insertAdjacentElement('afterend', installCard);
    updateInstallUI();
  }

  function injectRobot() {
    if (document.getElementById('ra9mon-widget')) return;

    const widget = document.createElement('aside');
    widget.id = 'ra9mon-widget';
    widget.className = 'ra9mon-widget';
    widget.innerHTML = `
      <div class="ra9mon-panel" hidden>
        <div class="ra9mon-panel-head">
          <div>
            <strong class="ra9mon-name"></strong>
            <span class="ra9mon-online"><i></i> <span class="ra9mon-online-label">Online</span></span>
          </div>
          <button type="button" class="ra9mon-close" aria-label="Close">×</button>
        </div>
        <p class="ra9mon-greeting"></p>
        <p class="ra9mon-intro"></p>
        <div class="ra9mon-actions">
          <button type="button" class="ra9mon-action ra9mon-explore-action"><span>✦</span><span class="ra9mon-explore"></span></button>
          <button type="button" class="ra9mon-action ra9mon-install-action"><span>${makeDownloadIcon()}</span><span class="ra9mon-install"></span></button>
        </div>
        <div class="ra9mon-explorer" hidden></div>
      </div>
      <button type="button" class="ra9mon-launch" aria-expanded="false" aria-label="RA9MON">
        <img src="assets/ra9mon/ra9mon.png" alt="RA9MON">
        <span class="ra9mon-pulse"></span>
        <span class="ra9mon-hint"></span>
      </button>
    `;
    document.body.appendChild(widget);
    botPanel = widget.querySelector('.ra9mon-panel');

    const launcher = widget.querySelector('.ra9mon-launch');
    const close = widget.querySelector('.ra9mon-close');
    const toggle = () => {
      const open = botPanel.hasAttribute('hidden');
      if (open) botPanel.removeAttribute('hidden'); else botPanel.setAttribute('hidden', '');
      launcher.setAttribute('aria-expanded', String(open));
      widget.classList.toggle('is-open', open);
    };
    launcher.addEventListener('click', toggle);
    close.addEventListener('click', toggle);
    widget.querySelector('.ra9mon-install-action').addEventListener('click', requestInstall);
    widget.querySelector('.ra9mon-explore-action').addEventListener('click', () => openExplorer(widget));

    updateRobotText();
  }

  async function openExplorer(widget) {
    const box = widget.querySelector('.ra9mon-explorer');
    const actions = widget.querySelector('.ra9mon-actions');
    if (!box) return;
    box.hidden = false; actions.hidden = true;
    box.innerHTML = `<div class="ra9mon-explorer-head"><strong>${t('botExplore')}</strong><button type="button" class="ra9mon-back" hidden>${t('botBack')}</button></div><div class="ra9mon-explorer-content"><span class="ra9mon-loading">…</span></div>`;
    const content = box.querySelector('.ra9mon-explorer-content');
    const back = box.querySelector('.ra9mon-back');
    let refs = [], articles = [];
    try { const r = await fetch('data/library.json', {cache:'no-store'}); refs = r.ok ? await r.json() : []; } catch(_) {}
    try { const r = await fetch('data/articles.json', {cache:'no-store'}); articles = r.ok ? await r.json() : []; } catch(_) {}
    refs = Array.isArray(refs) ? refs.filter(x=>x && x.status !== 'draft') : [];
    articles = Array.isArray(articles) ? articles.filter(x=>x && x.status !== 'draft') : [];
    const l=lang(), esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    const label = x => x.typeLabel || x.type || (l==='ar'?'مرجع':l==='en'?'Reference':'Référence');
    const groups = [...new Map(refs.map(r=>[String(r.type||'other'), {id:String(r.type||'other'), label:label(r)}])).values()];
    const showHome = () => {
      back.hidden=true;
      content.innerHTML = `<p class="ra9mon-question">${l==='ar'?'ماذا تريد أن تفتح؟':l==='en'?'What would you like to explore?':'Que voulez-vous explorer ?'}</p><div class="ra9mon-choice-grid"><button data-explore-kind="refs">⚖️ <b>${l==='ar'?'المراجع':l==='en'?'References':'Références'}</b><small>${refs.length} ${t('botCount')}</small></button><button data-explore-kind="articles">📰 <b>${l==='ar'?'المقالات':l==='en'?'Articles':'Articles'}</b><small>${articles.length} ${t('botCount')}</small></button></div>`;
    };
    const showTypes = () => {
      back.hidden=false; back.onclick=showHome;
      content.innerHTML = `<p class="ra9mon-question">${l==='ar'?'أوه! لدينا الكثير 😎 اختر نوع المرجع:':l==='en'?'Oh! We have plenty 😎 Choose a reference type:':'Oh ! Nous en avons beaucoup 😎 Choisissez un type :'}</p><div class="ra9mon-choice-grid">${groups.map(g=>`<button data-ref-type="${esc(g.id)}"><b>${esc(g.label)}</b><small>${refs.filter(r=>String(r.type||'other')===g.id).length} ${t('botCount')}</small></button>`).join('')}</div>`;
    };
    const showArticles = () => {
      back.hidden=false; back.onclick=showHome;
      content.innerHTML=`<p class="ra9mon-question">${l==='ar'?'لدينا هذه المقالات:':l==='en'?'Here are the available articles:':'Voici les articles disponibles :'}</p><div class="ra9mon-result-list">${articles.slice(0,30).map(a=>`<a href="articles.html?article=${encodeURIComponent(a.id)}"><b>${esc(a.title)}</b><small>${esc(a.category||'')}</small></a>`).join('')}</div>`;
    };
    const showRefs = type => {
      back.hidden=false; back.onclick=showTypes;
      const list=refs.filter(r=>String(r.type||'other')===type);
      content.innerHTML=`<p class="ra9mon-question">${l==='ar'?'أوه نعم! لدينا عدة مراجع من هذا النوع. اختر المرجع:':l==='en'?'Oh yes! We have several references of this type. Choose one:':'Oh oui ! Nous avons plusieurs références de ce type. Choisissez-en une :'}</p><div class="ra9mon-result-list">${list.slice(0,40).map(r=>`<a href="library.html?ref=${encodeURIComponent(r.id)}"><b>${esc(r.title)}</b><small>${esc(r.category||'')} ${r.year?`· ${esc(r.year)}`:''}</small></a>`).join('')}</div>`;
    };
    content.addEventListener('click', e=>{ const k=e.target.closest('[data-explore-kind]'); const rt=e.target.closest('[data-ref-type]'); if(k){k.dataset.exploreKind==='refs'?showTypes():showArticles();} if(rt) showRefs(rt.dataset.refType); });
    showHome();
  }

  function updateRobotText() {
    const root = document.getElementById('ra9mon-widget');
    if (!root) return;
    root.querySelector('.ra9mon-name').textContent = t('botName');
    root.querySelector('.ra9mon-greeting').textContent = t('botGreeting');
    root.querySelector('.ra9mon-intro').textContent = t('botIntro');
    const explore = root.querySelector('.ra9mon-explore');
    if (explore) explore.textContent = t('botExplore');
    root.querySelector('.ra9mon-install').textContent = t('botInstall');
    root.querySelector('.ra9mon-hint').textContent = t('botHint');
    root.querySelector('.ra9mon-close').setAttribute('aria-label', t('botClose'));
  }

  function updateInstallUI() {
    const installed = standalone || iosStandalone;
    const nav = document.getElementById('ra9mon-install-nav');
    if (nav) {
      nav.querySelector('.ra9mon-install-nav-label').textContent = installed ? t('installed') : t('installNav');
      nav.classList.toggle('is-installed', installed);
      nav.disabled = installed;
    }

    const mobile = document.getElementById('ra9mon-install-mobile');
    if (mobile) {
      mobile.querySelector('.ra9mon-install-mobile-label').textContent = installed ? t('installed') : t('install');
      mobile.disabled = installed;
    }

    if (installCard) {
      installCard.querySelector('.ra9mon-install-title').textContent = t('installTitle');
      installCard.querySelector('.ra9mon-install-desc').textContent = t('installDesc');
      const action = installCard.querySelector('.ra9mon-install-action');
      action.textContent = installed ? t('installed') : t('installNow');
      action.disabled = installed;
      installCard.classList.toggle('is-installed', installed);
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return Promise.resolve();
    if (!(location.protocol === 'https:' || location.hostname === 'localhost')) return Promise.resolve();

    return navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch((e) => {
      console.warn('RA9MANA PWA service worker:', e);
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    updateInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateInstallUI();
  });

  document.addEventListener('ra9mana:langchange', () => {
    updateInstallUI();
    updateRobotText();
  });

  document.addEventListener('DOMContentLoaded', async () => {
    injectNavButton();
    injectMobileInstall();
    injectInstallCard();
    injectRobot();
    updateInstallUI();

    await registerServiceWorker();

    if (shouldOpenLibrary && !location.pathname.endsWith('/library.html')) {
      const target = new URL('library.html', location.href);
      location.replace(target.href);
    }
  });
})();
