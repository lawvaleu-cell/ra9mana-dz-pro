(() => {
  "use strict";

  let ALL = [];      // all published articles
  let VISIBLE = [];  // after search + category filter

  const state = { query: "", category: "" };
  const els = {};

  function cacheEls() {
    els.feed = document.getElementById("articles-feed");
    els.search = document.getElementById("articles-search-input");
    els.resultsMeta = document.getElementById("articles-results-meta");
    els.categoryChips = document.getElementById("article-category-chips");
  }

  /* ---------------------------------------------------------
     Filter chips (dynamic — driven entirely by data, same pattern
     as library.js's populateFilters for reference types)
  --------------------------------------------------------- */
  function populateCategories(list) {
    const allLabel = RA9MANA_I18N.t("articles.allCategories") || "All";
    let html = `<button type="button" class="filter-chip is-active" data-category="">${RA9MANA_ARTICLES.esc(allLabel)}</button>`;
    RA9MANA_ARTICLES.distinctCategories(list).forEach((cat) => {
      html += `<button type="button" class="filter-chip" data-category="${RA9MANA_ARTICLES.esc(cat)}">${RA9MANA_ARTICLES.esc(cat)}</button>`;
    });
    els.categoryChips.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Author block (reuses the exact contributor pattern already
     used by the reference detail modal — see js/library.js)
  --------------------------------------------------------- */
  function authorBlock(author) {
    const a = author || {};
    const name = a.showName && a.name ? a.name : (RA9MANA_I18N.t("articles.authorAnonymous") || "");
    const photo = a.showPhoto && a.photo
      ? `<img class="article-author-photo" src="${RA9MANA_ARTICLES.esc(a.photo)}" alt="">`
      : `<span class="article-author-photo-fallback">${RA9MANA_ARTICLES.esc((name || "?").trim().charAt(0) || "?")}</span>`;
    const bio = a.showBio && a.bio ? `<div class="ref-contributor-bio">${RA9MANA_ARTICLES.esc(a.bio)}</div>` : "";

    let links = "";
    if (a.showLinks && a.links) {
      const map = [
        ["website", "website"], ["linkedin", "linkedin"], ["facebook", "facebook"],
        ["instagram", "instagram"], ["x", "x-social"], ["github", "github"]
      ];
      map.forEach(([key, icon]) => {
        if (a.links[key]) {
          links += `<a href="${RA9MANA_ARTICLES.esc(a.links[key])}" target="_blank" rel="noopener noreferrer"><svg><use href="assets/icons/icons.svg#icon-${icon}"></use></svg></a>`;
        }
      });
    }

    return `
      <div class="article-author">
        ${photo}
        ${name ? `<div class="ref-contributor-name">${RA9MANA_ARTICLES.esc(name)}</div>` : ""}
        ${bio}
        ${links ? `<div class="ref-contributor-links">${links}</div>` : ""}
      </div>`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const lang = RA9MANA_I18N.getLang();
      const locale = lang === "ar" ? "ar" : (lang === "en" ? "en-GB" : "fr-FR");
      return new Date(dateStr + "T00:00:00").toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return dateStr; }
  }

  function articleHtml(article) {
    const c = article.content || {};
    const sIntro = RA9MANA_I18N.t("articles.sections.introduction") || "Introduction";
    const sBody = RA9MANA_I18N.t("articles.sections.body") || "Body";
    const sConclusion = RA9MANA_I18N.t("articles.sections.conclusion") || "Conclusion";
    const metaLine = [formatDate(article.date), article.category].filter(Boolean).join(" &middot; ");

    return `
      <article class="article-entry" data-article-id="${RA9MANA_ARTICLES.esc(article.id)}">
        ${authorBlock(article.author)}
        <div class="article-author-meta" style="justify-content:center; margin: -6px 0 var(--space-3)">${metaLine}</div>
        <h2 class="article-title">${RA9MANA_ARTICLES.esc(article.title)}</h2>
        <div class="article-content">
          ${c.introduction ? `<div class="article-section-label">${RA9MANA_ARTICLES.esc(sIntro)}</div>${RA9MANA_ARTICLES.renderRich(c.introduction)}` : ""}
          ${c.body ? `<div class="article-section-label">${RA9MANA_ARTICLES.esc(sBody)}</div>${RA9MANA_ARTICLES.renderRich(c.body)}` : ""}
          ${c.conclusion ? `<div class="article-section-label">${RA9MANA_ARTICLES.esc(sConclusion)}</div>${RA9MANA_ARTICLES.renderRich(c.conclusion)}` : ""}
        </div>
      </article>`;
  }

  function render() {
    if (VISIBLE.length === 0) {
      const title = RA9MANA_I18N.t("articles.empty.title") || "No articles";
      const desc = RA9MANA_I18N.t("articles.empty.desc") || "";
      els.feed.innerHTML = `
        <div class="library-state">
          <svg><use href="assets/icons/icons.svg#icon-search"></use></svg>
          <h3>${RA9MANA_ARTICLES.esc(title)}</h3>
          <p>${RA9MANA_ARTICLES.esc(desc)}</p>
        </div>`;
    } else {
      els.feed.innerHTML = VISIBLE.map(articleHtml).join("");
    }
    updateResultsMeta(VISIBLE.length);
    observeReveals();
  }

  function updateResultsMeta(count) {
    if (!els.resultsMeta) return;
    const template = RA9MANA_I18N.t("library.results.count") || "articles";
    els.resultsMeta.innerHTML = `<b>${count}</b> ${RA9MANA_ARTICLES.esc(template.replace("{count}", "").trim())}`;
  }

  function recompute() {
    const list = RA9MANA_ARTICLES.filterAndSearch(ALL, state.query, state.category);
    VISIBLE = RA9MANA_ARTICLES.sortByDateDesc(list);
    render();
  }

  let observer = null;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
    }
    document.querySelectorAll(".article-entry:not(.is-visible)").forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  let searchDebounce = null;
  function bindEvents() {
    els.search.addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => { state.query = els.search.value; recompute(); }, 220);
    });

    els.categoryChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-category]");
      if (!btn) return;
      els.categoryChips.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.category = btn.getAttribute("data-category");
      recompute();
    });

    document.addEventListener("ra9mana:langchange", () => {
      populateCategories(ALL);
      recompute();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    cacheEls();
    bindEvents();
    await RA9MANA_I18N.init();

    ALL = await RA9MANA_ARTICLES.loadPublished();
    populateCategories(ALL);
    recompute();
  });
})();
