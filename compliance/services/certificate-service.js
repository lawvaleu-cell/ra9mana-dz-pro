/**
 * RA9MANA — Certificate service (local / static implementation)
 * ------------------------------------------------------------
 * Everything here runs entirely in the browser: no request is ever
 * sent anywhere. The public shape of this service (issue / getById)
 * is deliberately what a future server-backed implementation would
 * also expose, so swapping this file for one that calls a real API
 * later does not require changing app.js or certificate.js.
 */

const RA9MANA_CERTIFICATE_SERVICE = (() => {
  const STORAGE_KEY = "ra9mana-compliance-certificates";

  function pad(n) { return String(n).padStart(2, "0"); }

  function randomSegment(len) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
    let out = "";
    const cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const arr = new Uint32Array(len);
      cryptoObj.getRandomValues(arr);
      for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
    } else {
      for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function generateCertificateId() {
    const year = new Date().getFullYear();
    return `RA9-COMP-${year}-${randomSegment(6)}`;
  }

  function getStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveStore(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  // Local implementation of "issue a certificate". A future backend
  // implementation would POST to an API here instead and return its
  // response — the caller (app.js / certificate.js) doesn't need to
  // change either way.
  function issue({ websiteName, score, level, lang }) {
    const now = new Date();
    const certificate = {
      id: generateCertificateId(),
      websiteName: websiteName,
      score: score,
      level: level,
      lang: lang,
      issuedAt: now.toISOString(),
      issuedAtDisplay: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
    };
    const list = getStore();
    list.push(certificate);
    saveStore(list);
    return certificate;
  }

  // Looks up a certificate by ID among the ones issued locally in this
  // browser. A future backend implementation would call a real
  // verification API instead.
  function getById(id) {
    if (!id) return null;
    const normalized = String(id).trim().toUpperCase();
    return getStore().find((c) => c.id.toUpperCase() === normalized) || null;
  }

  return { generateCertificateId, issue, getById, STORAGE_KEY };
})();
