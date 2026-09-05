/**
 * RA9MANA — Website Compliance Assessment: certificate UI
 * ------------------------------------------------------------
 * Renders the "confirm & generate" gate under the results, then the
 * printable certificate itself (with an offline-generated QR code
 * pointing at the future verification URL). Exposed as
 * window.RA9MANA_CERTIFICATE so app.js can call it after computing a
 * result, without either file needing to know the other's internals.
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

  function renderGate(container, results) {
    if (!container) return;
    const eligible = results.overall >= RA9MANA_COMPLIANCE_RULES.certificateThreshold;

    if (!eligible) {
      container.innerHTML = `
        <div class="compliance-cert-not-eligible">
          <h3>${escapeHtml(t("compliance.certificate.notEligibleTitle"))}</h3>
          <p>${escapeHtml(t("compliance.certificate.notEligibleBody"))}</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="compliance-cert-gate" id="compliance-cert-gate">
        <div class="eyebrow" style="color:var(--c-brand)">${escapeHtml(t("compliance.certificate.eyebrow"))}</div>
        <h3>${escapeHtml(t("compliance.certificate.congratsTitle"))}</h3>
        <p>${escapeHtml(t("compliance.certificate.congratsBody"))}</p>
        <div class="form-field full">
          <label for="compliance-cert-name">${escapeHtml(t("compliance.certificate.nameLabel"))}</label>
          <input type="text" id="compliance-cert-name" placeholder="${escapeHtml(t("compliance.certificate.namePlaceholder"))}" maxlength="120">
        </div>
        <label class="check-field">
          <input type="checkbox" id="compliance-cert-confirm">
          <span>${escapeHtml(t("compliance.certificate.confirmLabel"))}</span>
        </label>
        <div class="compliance-error" id="compliance-cert-gate-error" style="margin-top:var(--space-2)">
          <svg><use href="../assets/icons/icons.svg#icon-alert"></use></svg>
          <span id="compliance-cert-gate-error-text"></span>
        </div>
        <div style="margin-top:var(--space-3)">
          <button type="button" class="btn btn-primary" id="compliance-cert-generate-btn">
            <span>${escapeHtml(t("compliance.certificate.generateCta"))}</span>
            <svg><use href="../assets/icons/icons.svg#icon-arrow"></use></svg>
          </button>
        </div>
      </div>
      <div id="compliance-cert-output"></div>
    `;

    document.getElementById("compliance-cert-generate-btn").addEventListener("click", () => {
      const nameInput = document.getElementById("compliance-cert-name");
      const confirmInput = document.getElementById("compliance-cert-confirm");
      const errorBox = document.getElementById("compliance-cert-gate-error");
      const errorText = document.getElementById("compliance-cert-gate-error-text");

      const name = nameInput.value.trim();
      if (!name) {
        errorText.textContent = t("compliance.certificate.nameRequired");
        errorBox.classList.add("is-visible");
        nameInput.focus();
        return;
      }
      if (!confirmInput.checked) {
        errorText.textContent = t("compliance.certificate.confirmRequired");
        errorBox.classList.add("is-visible");
        return;
      }
      errorBox.classList.remove("is-visible");

      const certificate = RA9MANA_CERTIFICATE_SERVICE.issue({
        websiteName: name,
        score: results.overall,
        level: results.level.id,
        lang: RA9MANA_I18N.getLang()
      });

      document.getElementById("compliance-cert-gate").style.display = "none";
      renderCertificate(document.getElementById("compliance-cert-output"), certificate);
    });
  }

  function renderCertificate(container, certificate) {
    if (!container) return;
    const lang = RA9MANA_I18N.getLang();
    const verifyUrl = new URL("verify.html", window.location.href);
    verifyUrl.searchParams.set("id", certificate.id);

    let qrSvg = "";
    try {
      const qr = qrcode(0, "M");
      qr.addData(verifyUrl.toString());
      qr.make();
      qrSvg = qr.createSvgTag(3, 6);
    } catch (e) {
      qrSvg = ""; // fail quietly — the ID text next to it still verifies manually
    }

    container.innerHTML = `
      <div class="compliance-certificate-wrap">
        <div class="compliance-certificate" id="compliance-certificate">
          <div class="compliance-cert-top">
            <img src="../assets/brand/logo.png" alt="RA9MANA">
            <span class="compliance-cert-eyebrow">${escapeHtml(t("compliance.certificate.subheading"))}</span>
          </div>
          <div class="compliance-cert-heading">${escapeHtml(t("compliance.certificate.heading"))}</div>
          <div class="compliance-cert-grid">
            <div class="compliance-cert-field">
              <span>${escapeHtml(t("compliance.certificate.websiteLabel"))}</span>
              <b>${escapeHtml(certificate.websiteName)}</b>
            </div>
            <div class="compliance-cert-field">
              <span>${escapeHtml(t("compliance.certificate.dateLabel"))}</span>
              <b>${escapeHtml(certificate.issuedAtDisplay)}</b>
            </div>
            <div class="compliance-cert-field">
              <span>${escapeHtml(t("compliance.certificate.idLabel"))}</span>
              <b>${escapeHtml(certificate.id)}</b>
            </div>
          </div>
          <div class="compliance-cert-score">
            <b>${certificate.score}</b>
            <span>${escapeHtml(t("compliance.result.scoreOutOf"))} — ${escapeHtml(t("compliance.certificate.scoreLabel"))}</span>
          </div>
          <div class="compliance-cert-bottom">
            <p class="compliance-cert-notice">${escapeHtml(t("compliance.certificate.notice"))}</p>
            <div class="compliance-cert-qr">
              ${qrSvg}
              <p>${escapeHtml(t("compliance.certificate.scanNote"))}</p>
            </div>
          </div>
        </div>
        <div class="compliance-cert-actions">
          <button type="button" class="btn btn-primary" id="compliance-cert-print-btn">
            <svg><use href="../assets/icons/icons.svg#icon-download"></use></svg>
            <span>${escapeHtml(t("compliance.certificate.printCta"))}</span>
          </button>
          <a class="btn btn-ghost" href="${escapeHtml(verifyUrl.toString())}" target="_blank" rel="noopener">
            <svg><use href="../assets/icons/icons.svg#icon-link"></use></svg>
            <span>${escapeHtml(t("compliance.certificate.verifyCta"))}</span>
          </a>
        </div>
      </div>
    `;

    document.getElementById("compliance-cert-print-btn").addEventListener("click", () => window.print());
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.RA9MANA_CERTIFICATE = { renderGate };
})();
