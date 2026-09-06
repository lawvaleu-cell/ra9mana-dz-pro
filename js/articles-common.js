/**
 * RA9MANA DZ — Legal Articles: shared engine
 * ------------------------------------------------------------
 * Used by articles.html and submit-article.html. Mirrors the structure
 * of js/library-common.js so the "Articles" section of the library
 * behaves exactly like the existing "References" section:
 *  - loading the article dataset (data/articles.json, falling back to
 *    the embedded copy in js/articles-data.js when fetch is unavailable,
 *    e.g. when the site is opened as a local file)
 *  - safe (XSS-free) HTML escaping reused from RA9MANA_LIBRARY
 *  - search / filter helpers
 *  - a small markdown-lite renderer for the article editor + preview
 *    (paragraphs, ## subheadings, **bold**, *italic*, - lists, > quotes)
 *  - local drafts (localStorage) — session convenience only, nothing is
 *    ever sent anywhere (see js/article-form.js)
 */
const RA9MANA_ARTICLES = (() => {
  const DATA_URL = "data/articles.json";
  const DRAFTS_KEY = "ra9mana-articles-drafts";

  const esc = (v) => RA9MANA_LIBRARY.esc(v);

  /* ---------------------------------------------------------
     Data loading
  --------------------------------------------------------- */
  async function loadAll() {
    try {
      if (location.protocol !== "file:") {
        const res = await fetch(DATA_URL, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) return sanitizeList(json);
        }
      }
    } catch (e) {
      /* fall through to embedded fallback */
    }
    const fallback = typeof RA9MANA_ARTICLES_FALLBACK !== "undefined" ? RA9MANA_ARTICLES_FALLBACK : [];
    return sanitizeList(fallback);
  }

  function sanitizeList(list) {
    return list.filter((a) => a && typeof a === "object" && a.id && a.title);
  }

  async function loadPublished() {
    const all = await loadAll();
    return all.filter((a) => a.status === "published");
  }

  /* ---------------------------------------------------------
     Search / filter (same shape as RA9MANA_LIBRARY.filterAndSearch)
  --------------------------------------------------------- */
  function matchesQuery(article, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const c = article.content || {};
    const haystack = [
      article.title, article.category,
      article.author && article.author.name,
      c.introduction, c.body, c.conclusion
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  }

  function matchesCategory(article, category) {
    if (!category) return true;
    return article.category === category;
  }

  function filterAndSearch(list, query, category) {
    return list.filter((a) => matchesQuery(a, query) && matchesCategory(a, category));
  }

  function sortByDateDesc(list) {
    return list.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function distinctCategories(list) {
    const set = new Set();
    list.forEach((a) => { if (a.category) set.add(a.category); });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "fr"));
  }

  /* ---------------------------------------------------------
     Markdown-lite renderer, shared by the public feed and the
     submission form's live preview. Escapes all text first, then
     recognizes a small, fixed set of tokens — never raw HTML.
     Supported: blank-line paragraphs, "## " subheadings, "- " lists,
     "> " quotes, **bold**, *italic*.
  --------------------------------------------------------- */
  function inline(text) {
    let s = esc(text);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }

  function renderRich(raw) {
    const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let buf = [];
    const flush = () => {
      if (buf.length) { html += `<p>${inline(buf.join(" "))}</p>`; buf = []; }
    };
    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (!trimmed) { flush(); i++; continue; }
      if (/^##\s+/.test(trimmed)) {
        flush();
        html += `<h3>${inline(trimmed.replace(/^##\s+/, ""))}</h3>`;
        i++; continue;
      }
      if (/^>\s?/.test(trimmed)) {
        flush();
        const quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          quote.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        html += `<blockquote>${inline(quote.join(" "))}</blockquote>`;
        continue;
      }
      if (/^-\s+/.test(trimmed)) {
        flush();
        const items = [];
        while (i < lines.length && /^-\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^-\s+/, ""));
          i++;
        }
        html += `<ul>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ul>`;
        continue;
      }
      buf.push(trimmed);
      i++;
    }
    flush();
    return html;
  }

  /* ---------------------------------------------------------
     Id generation (reuses the same slugify used by the library)
  --------------------------------------------------------- */
  function generateId(title) {
    const base = RA9MANA_LIBRARY.slugify(title).slice(0, 40);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `ART-${new Date().getFullYear()}-${base}-${suffix}`;
  }

  /* ---------------------------------------------------------
     Local drafts (localStorage) — never sent anywhere.
  --------------------------------------------------------- */
  function getDrafts() {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveDrafts(list) {
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }

  function addDraft(entry) {
    const list = getDrafts();
    list.push(entry);
    saveDrafts(list);
    return list;
  }

  return {
    esc, loadAll, loadPublished, filterAndSearch, sortByDateDesc, distinctCategories,
    renderRich, generateId, getDrafts, saveDrafts, addDraft
  };
})();
