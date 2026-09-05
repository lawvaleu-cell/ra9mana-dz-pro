/**
 * RA9MANA — Certificate verification (static/local implementation)
 * ------------------------------------------------------------
 * Drives compliance/verify.html. Looks a certificate ID up against:
 *   1) certificates issued locally in this browser (services/certificate-service.js)
 *   2) the local demo dataset (verify-data.js)
 * This is explicitly NOT a centralized/authoritative verification —
 * see the on-page demoNotice string. A future backend can replace
 * this lookup with a real API call without changing the markup.
 */
(() => {
  "use strict";

  function t(key) { return RA9MANA_I18N.t(key) || ""; }
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function findCertificate(id) {
    const local = RA9MANA_CERTIFICATE_SERVICE.getById(id);
    if (local) return local;
    const normalized = String(id).trim().toUpperCase();
    return (RA9MANA_COMPLIANCE_DEMO_CERTIFICATES || []).find((c) => c.id.toUpperCase() === normalized) || null;
  }

  function levelLabel(levelId) {
    const lvl = (RA9MANA_COMPLIANCE_RULES.levels || []).find((l) => l.id === levelId);
    if (!lvl) return "";
    const lang = RA9MANA_I18N.getLang();
    return lvl.label[lang] || lvl.label.fr;
  }

  function renderResult(id) {
    const box = document.getElementById("compliance-verify-result");
    const certificate = findCertificate(id);

    if (!certificate) {
      box.innerHTML = `
        <div class="compliance-verify-badge invalid">
          <svg><use href="../assets/icons/icons.svg#icon-close"></use></svg>
          <span>${escapeHtml(t("compliance.verify.invalidTitle"))}</span>
        </div>
        <p style="color:var(--c-text-muted);font-size:0.92rem">${escapeHtml(t("compliance.verify.invalidBody"))}</p>
      `;
      box.classList.add("is-visible");
      return;
    }

    box.innerHTML = `
      <div class="compliance-verify-badge valid">
        <svg><use href="../assets/icons/icons.svg#icon-check"></use></svg>
        <span>${escapeHtml(t("compliance.verify.validTitle"))}</span>
      </div>
      <div class="compliance-cert-grid" style="margin-bottom:0">
        <div class="compliance-cert-field">
          <span>${escapeHtml(t("compliance.verify.resultWebsite"))}</span>
          <b>${escapeHtml(certificate.websiteName)}</b>
        </div>
        <div class="compliance-cert-field">
          <span>${escapeHtml(t("compliance.verify.resultScore"))}</span>
          <b>${escapeHtml(String(certificate.score))} / 100</b>
        </div>
        <div class="compliance-cert-field">
          <span>${escapeHtml(t("compliance.verify.resultDate"))}</span>
          <b>${escapeHtml(certificate.issuedAtDisplay || "—")}</b>
        </div>
        <div class="compliance-cert-field">
          <span>${escapeHtml(t("compliance.verify.resultStatus"))}</span>
          <b>${escapeHtml(levelLabel(certificate.level))}</b>
        </div>
      </div>
    `;
    box.classList.add("is-visible");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await RA9MANA_I18N.init();

    const input = document.getElementById("compliance-verify-input");
    const btn = document.getElementById("compliance-verify-btn");

    const params = new URLSearchParams(window.location.search);
    const presetId = params.get("id");
    if (presetId) {
      input.value = presetId;
      renderResult(presetId);
    }

    btn.addEventListener("click", () => {
      const id = input.value.trim();
      if (!id) return;
      renderResult(id);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); btn.click(); }
    });

    document.addEventListener("ra9mana:langchange", () => {
      if (input.value.trim() && document.getElementById("compliance-verify-result").classList.contains("is-visible")) {
        renderResult(input.value.trim());
      }
    });
  });
})();
