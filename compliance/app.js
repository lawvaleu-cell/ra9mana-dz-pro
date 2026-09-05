/**
 * RA9MANA — Website Compliance Assessment: engine
 * ------------------------------------------------------------
 * Drives compliance/index.html: landing -> question flow -> results ->
 * certificate. 100% client-side, no network call. Reads its data from
 * RA9MANA_COMPLIANCE_QUESTIONS / RA9MANA_COMPLIANCE_CATEGORIES
 * (questions.js) and RA9MANA_COMPLIANCE_RULES (rules.js).
 */
(() => {
  "use strict";

  const QUESTIONS = RA9MANA_COMPLIANCE_QUESTIONS;
  const CATEGORIES = RA9MANA_COMPLIANCE_CATEGORIES;
  const RULES = RA9MANA_COMPLIANCE_RULES;

  // ---- State -----------------------------------------------------------
  const state = {
    started: false,
    answers: {},      // { questionId: [optionId, ...] }
    path: [],          // indices into QUESTIONS, in the order actually shown
    pos: -1,            // index into `path`
    finished: false
  };

  function t(key, vars) {
    let str = RA9MANA_I18N.t(key);
    if (str == null) return "";
    if (vars) Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  }

  function categoryById(id) { return CATEGORIES.find((c) => c.id === id); }
  function questionById(id) { return QUESTIONS.find((q) => q.id === id); }

  function isVisible(question) {
    if (!question.showIf) return true;
    const ans = state.answers[question.showIf.questionId];
    if (!ans) return false;
    return question.showIf.in.some((optId) => ans.includes(optId));
  }

  function visibleQuestions() { return QUESTIONS.filter(isVisible); }

  function findNextVisibleIndex(fromIndex) {
    for (let i = fromIndex + 1; i < QUESTIONS.length; i++) {
      if (isVisible(QUESTIONS[i])) return i;
    }
    return -1;
  }

  // ---- Answer handling ---------------------------------------------------
  function toggleAnswer(question, optionId) {
    const current = state.answers[question.id] ? state.answers[question.id].slice() : [];
    if (question.type === "single") {
      state.answers[question.id] = [optionId];
      return;
    }
    const option = question.options.find((o) => o.id === optionId);
    const idx = current.indexOf(optionId);
    if (option && option.isNone) {
      state.answers[question.id] = idx === -1 ? [optionId] : [];
      return;
    }
    // Selecting a real option clears any "none" selection.
    let next = current.filter((id) => {
      const opt = question.options.find((o) => o.id === id);
      return !(opt && opt.isNone);
    });
    if (idx === -1) next.push(optionId); else next = next.filter((id) => id !== optionId);
    state.answers[question.id] = next;
  }

  function hasAnswer(question) {
    const ans = state.answers[question.id];
    return Array.isArray(ans) && ans.length > 0;
  }

  // ---- Scoring -------------------------------------------------------
  function computeResults() {
    const categoryScores = {}; // id -> { points: [], weight }
    CATEGORIES.forEach((c) => { categoryScores[c.id] = []; });

    const wellItems = [];
    const improveItems = [];

    QUESTIONS.forEach((q) => {
      if (!q.scored) return;
      if (!isVisible(q)) return;
      const ans = state.answers[q.id];
      if (!ans || !ans.length) return;
      const opt = q.options.find((o) => o.id === ans[0]);
      if (!opt || typeof opt.points !== "number") return;
      categoryScores[q.category].push(opt.points);

      const lang = RA9MANA_I18N.getLang();
      const label = q.question[lang] || q.question.fr;
      if (opt.points >= RULES.recommendationThreshold) {
        wellItems.push(label);
      } else if (q.recommendation) {
        improveItems.push({ label, recommendation: q.recommendation[lang] || q.recommendation.fr, points: opt.points });
      }
    });

    const breakdown = CATEGORIES.map((c) => {
      const points = categoryScores[c.id];
      if (!points.length) return { id: c.id, title: c.title, applicable: false, score: null };
      const avg = points.reduce((a, b) => a + b, 0) / points.length;
      return { id: c.id, title: c.title, applicable: true, score: Math.round(avg) };
    });

    const applicable = breakdown.filter((b) => b.applicable);
    let overall = 0;
    if (applicable.length) {
      let weightedSum = 0, weightTotal = 0;
      applicable.forEach((b) => {
        const w = RULES.categoryWeights[b.id] || 1;
        weightedSum += b.score * w;
        weightTotal += w;
      });
      overall = Math.round(weightedSum / weightTotal);
    }

    improveItems.sort((a, b) => a.points - b.points);

    let level = RULES.levels[RULES.levels.length - 1];
    for (const lvl of RULES.levels) { if (overall >= lvl.min) { level = lvl; break; } }

    return { overall, level, breakdown, wellItems, improveItems };
  }

  // ---- Rendering: landing --------------------------------------------
  function renderCategoryStrip() {
    const strip = document.getElementById("compliance-category-strip");
    if (!strip) return;
    const lang = RA9MANA_I18N.getLang();
    strip.innerHTML = CATEGORIES.map((c) =>
      `<span class="compliance-category-chip">${c.number} — ${escapeHtml(c.title[lang] || c.title.fr)}</span>`
    ).join("");
  }

  // ---- Rendering: question card ----------------------------------------
  function renderQuestion() {
    const root = document.getElementById("compliance-question-root");
    if (!root) return;
    const qIndex = state.path[state.pos];
    const q = QUESTIONS[qIndex];
    const cat = categoryById(q.category);
    const lang = RA9MANA_I18N.getLang();
    const answered = state.answers[q.id] || [];

    const optionsHtml = q.options.map((opt) => {
      const checked = answered.includes(opt.id);
      const inputType = q.type === "single" ? "radio" : "checkbox";
      return `
        <label class="compliance-option${checked ? " is-selected" : ""}" data-option-id="${escapeHtml(opt.id)}">
          <input type="${inputType}" name="q-${escapeHtml(q.id)}" ${checked ? "checked" : ""} data-option="${escapeHtml(opt.id)}">
          <span>${escapeHtml(opt.label[lang] || opt.label.fr)}</span>
        </label>`;
    }).join("");

    root.innerHTML = `
      <div class="compliance-progress-wrap">
        <div class="compliance-progress-top">
          <span class="compliance-progress-caption">${escapeHtml(t("compliance.progressLabel"))}</span>
          <span class="compliance-progress-pct" id="compliance-progress-pct">0%</span>
        </div>
        <div class="compliance-progress-track"><div class="compliance-progress-fill" id="compliance-progress-fill"></div></div>
      </div>
      <div class="compliance-card">
        <div class="compliance-card-category">
          <svg><use href="../assets/icons/icons.svg#icon-${escapeHtml(cat.icon)}"></use></svg>
          <span>${escapeHtml(cat.number)} — ${escapeHtml(cat.title[lang] || cat.title.fr)}</span>
        </div>
        <h2>${escapeHtml(q.question[lang] || q.question.fr)}</h2>
        ${q.description ? `<p class="compliance-card-desc">${escapeHtml(q.description[lang] || q.description.fr)}</p>` : ""}
        <div class="compliance-options" id="compliance-options">${optionsHtml}</div>
        <div class="compliance-error" id="compliance-error">
          <svg><use href="../assets/icons/icons.svg#icon-alert"></use></svg>
          <span>${escapeHtml(t("compliance.validationRequired"))}</span>
        </div>
      </div>
      <div class="compliance-nav">
        <button type="button" class="btn btn-ghost compliance-prev-cta" id="compliance-prev-btn" ${state.pos === 0 ? "style=\"visibility:hidden\"" : ""}>
          <svg><use href="../assets/icons/icons.svg#icon-arrow"></use></svg>
          <span>${escapeHtml(t("compliance.previous"))}</span>
        </button>
        <div class="compliance-nav-spacer"></div>
        <button type="button" class="btn btn-primary" id="compliance-next-btn">
          <span id="compliance-next-label">${escapeHtml(t(isLastQuestion(qIndex) ? "compliance.seeResults" : "compliance.next"))}</span>
          <svg><use href="../assets/icons/icons.svg#icon-arrow"></use></svg>
        </button>
      </div>
    `;

    updateProgress();
    bindQuestionEvents(q);
    window.scrollTo({ top: document.getElementById("compliance-shell").offsetTop - 90, behavior: "smooth" });
  }

  function isLastQuestion(qIndex) { return findNextVisibleIndex(qIndex) === -1; }

  function updateProgress() {
    const visible = visibleQuestions();
    const currentQIndex = state.path[state.pos];
    const posInVisible = visible.findIndex((q) => q.id === QUESTIONS[currentQIndex].id);
    const total = Math.max(visible.length, posInVisible + 1);
    const pct = Math.round(((posInVisible + 1) / total) * 100);
    const fill = document.getElementById("compliance-progress-fill");
    const label = document.getElementById("compliance-progress-pct");
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = pct + "%";
  }

  function bindQuestionEvents(q) {
    document.querySelectorAll("#compliance-options .compliance-option input").forEach((input) => {
      input.addEventListener("change", () => {
        toggleAnswer(q, input.getAttribute("data-option"));
        // Re-render just the option states (cheap full re-render keeps this simple/robust)
        document.querySelectorAll("#compliance-options .compliance-option").forEach((label) => {
          const id = label.getAttribute("data-option-id");
          const selected = (state.answers[q.id] || []).includes(id);
          label.classList.toggle("is-selected", selected);
        });
        hideError();
      });
    });

    document.getElementById("compliance-prev-btn").addEventListener("click", goPrevious);
    document.getElementById("compliance-next-btn").addEventListener("click", () => goNext(q));
  }

  function hideError() {
    const err = document.getElementById("compliance-error");
    if (err) err.classList.remove("is-visible");
  }

  function showError() {
    const err = document.getElementById("compliance-error");
    if (err) err.classList.add("is-visible");
    if (window.RA9MANA_showToast) window.RA9MANA_showToast(t("compliance.validationRequired"));
  }

  function goNext(q) {
    if (q.required && !hasAnswer(q)) { showError(); return; }
    const currentQIndex = state.path[state.pos];
    const nextIndex = findNextVisibleIndex(currentQIndex);
    if (nextIndex === -1) { showResults(); return; }
    state.path = state.path.slice(0, state.pos + 1);
    state.path.push(nextIndex);
    state.pos++;
    renderQuestion();
  }

  function goPrevious() {
    if (state.pos <= 0) return;
    state.pos--;
    renderQuestion();
  }

  // ---- Results -----------------------------------------------------------
  function showResults() {
    state.finished = true;
    const results = computeResults();
    renderResults(results);
    document.getElementById("compliance-landing").style.display = "none";
    document.getElementById("compliance-question-wrap").style.display = "none";
    document.getElementById("compliance-result-wrap").style.display = "block";
    window.scrollTo({ top: document.getElementById("compliance-shell").offsetTop - 40, behavior: "smooth" });
  }

  function ringMarkup(score) {
    const r = 80, c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    return `
      <svg viewBox="0 0 180 180">
        <circle class="ring-track" cx="90" cy="90" r="${r}"></circle>
        <circle class="ring-fill" cx="90" cy="90" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-final-offset="${offset}"></circle>
      </svg>
      <div class="compliance-score-ring-label"><b>${score}</b><span>/ 100</span></div>
    `;
  }

  function renderResults(results) {
    const lang = RA9MANA_I18N.getLang();
    const wrap = document.getElementById("compliance-result-wrap");

    const breakdownHtml = results.breakdown.map((b) => {
      if (!b.applicable) {
        return `
          <div class="compliance-breakdown-row is-na">
            <span class="compliance-breakdown-name">${escapeHtml(b.title[lang] || b.title.fr)}</span>
            <span class="compliance-breakdown-score">${escapeHtml(t("compliance.result.notApplicable"))}</span>
          </div>`;
      }
      return `
        <div class="compliance-breakdown-row">
          <span class="compliance-breakdown-name">${escapeHtml(b.title[lang] || b.title.fr)}</span>
          <span class="compliance-breakdown-score">${b.score}%</span>
          <div class="compliance-breakdown-track"><div class="compliance-breakdown-fill" style="width:${b.score}%"></div></div>
        </div>`;
    }).join("");

    const wellHtml = results.wellItems.length
      ? results.wellItems.map((label) => `
          <div class="compliance-result-item well">
            <svg><use href="../assets/icons/icons.svg#icon-check"></use></svg>
            <span>${escapeHtml(label)}</span>
          </div>`).join("")
      : `<p style="color:var(--c-text-muted);font-size:0.9rem">${escapeHtml(t("compliance.result.noneWell"))}</p>`;

    const improveHtml = results.improveItems.length
      ? results.improveItems.map((item) => `
          <div class="compliance-result-item improve">
            <svg><use href="../assets/icons/icons.svg#icon-alert"></use></svg>
            <span>${escapeHtml(item.label)}</span>
          </div>`).join("")
      : `<p style="color:var(--c-text-muted);font-size:0.9rem">${escapeHtml(t("compliance.result.noneImprovement"))}</p>`;

    const actionsHtml = results.improveItems.length
      ? `<ol class="compliance-recommend-list">${results.improveItems.map((i) => `<li>${escapeHtml(i.recommendation)}</li>`).join("")}</ol>`
      : "";

    wrap.innerHTML = `
      <div class="compliance-result-hero">
        <div class="eyebrow" style="justify-content:center">${escapeHtml(t("compliance.result.title"))}</div>
        <div class="compliance-score-ring" id="compliance-score-ring">${ringMarkup(results.overall)}</div>
        <div class="compliance-status-pill level-${results.level.id}">${escapeHtml(results.level.label[lang] || results.level.label.fr)}</div>
      </div>

      <div class="compliance-breakdown">
        <h3>${escapeHtml(t("compliance.result.categoryBreakdown"))}</h3>
        <div class="compliance-breakdown-grid">${breakdownHtml}</div>
      </div>

      <div class="compliance-result-section">
        <h3>${escapeHtml(t("compliance.result.doingWell"))}</h3>
        <div class="compliance-result-list">${wellHtml}</div>
      </div>

      <div class="compliance-result-section">
        <h3>${escapeHtml(t("compliance.result.improvement"))}</h3>
        <div class="compliance-result-list">${improveHtml}</div>
      </div>

      ${actionsHtml ? `
      <div class="compliance-result-section">
        <h3>${escapeHtml(t("compliance.result.recommendedActions"))}</h3>
        ${actionsHtml}
      </div>` : ""}

      <div class="compliance-notice-box">
        <h4>${escapeHtml(t("compliance.disclaimer.title"))}</h4>
        <p>${escapeHtml(t("compliance.disclaimer.body"))}</p>
      </div>

      <div class="compliance-warning-box">
        <svg><use href="../assets/icons/icons.svg#icon-alert"></use></svg>
        <div>
          <h4>${escapeHtml(t("compliance.warning.title"))}</h4>
          <p>${escapeHtml(t("compliance.warning.body"))}</p>
        </div>
      </div>

      <div id="compliance-cert-zone"></div>

      <div style="text-align:center;margin-top:var(--space-5)">
        <button type="button" class="btn btn-ghost" id="compliance-restart-btn">
          <span>${escapeHtml(t("compliance.result.restart"))}</span>
        </button>
      </div>
    `;

    // animate the ring after insertion
    requestAnimationFrame(() => {
      const ringFill = wrap.querySelector(".ring-fill");
      if (ringFill) {
        const finalOffset = ringFill.getAttribute("data-final-offset");
        requestAnimationFrame(() => { ringFill.style.strokeDashoffset = finalOffset; });
      }
    });

    document.getElementById("compliance-restart-btn").addEventListener("click", restart);

    if (window.RA9MANA_CERTIFICATE) {
      window.RA9MANA_CERTIFICATE.renderGate(document.getElementById("compliance-cert-zone"), results);
    }
  }

  function restart() {
    state.answers = {};
    state.path = [];
    state.pos = -1;
    state.finished = false;
    document.getElementById("compliance-result-wrap").style.display = "none";
    document.getElementById("compliance-landing").style.display = "block";
    window.scrollTo({ top: document.getElementById("compliance-shell").offsetTop - 90, behavior: "smooth" });
  }

  // ---- Start ---------------------------------------------------------
  function startAssessment() {
    state.started = true;
    const firstIndex = QUESTIONS.findIndex(isVisible);
    state.path = [firstIndex];
    state.pos = 0;
    document.getElementById("compliance-landing").style.display = "none";
    document.getElementById("compliance-question-wrap").style.display = "block";
    renderQuestion();
  }

  // ---- Utilities -----------------------------------------------------
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.RA9MANA_COMPLIANCE_APP = { getState: () => state };

  // ---- Boot ------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    await RA9MANA_I18N.init();
    renderCategoryStrip();

    document.getElementById("compliance-start-btn").addEventListener("click", startAssessment);

    document.addEventListener("ra9mana:langchange", () => {
      renderCategoryStrip();
      if (state.started && !state.finished) renderQuestion();
      else if (state.finished) renderResults(computeResults());
    });
  });
})();
