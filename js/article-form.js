(() => {
  "use strict";

  const fileState = { authorPhoto: null };

  /* ---------------------------------------------------------
     Dropzone (reuses RA9MANA_REF_FORM.wireDropzone — the exact
     same dropzone component used by submit.html)
  --------------------------------------------------------- */
  function wirePreviewDropzone(dropzoneId, inputId, filenameId, previewId, key) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const filenameEl = document.getElementById(filenameId);
    const previewEl = previewId ? document.getElementById(previewId) : null;

    RA9MANA_REF_FORM.wireDropzone(dropzone, input, (file) => {
      fileState[key] = file;
      filenameEl.textContent = file.name;
      const wrap = dropzone.closest(".form-field");
      if (wrap) wrap.classList.remove("has-error");
      if (previewEl && file.type && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => { previewEl.src = reader.result; previewEl.style.display = "block"; };
        reader.readAsDataURL(file);
      }
    });
  }

  /* ---------------------------------------------------------
     Simple formatting toolbar for the "body" textarea: inserts
     markdown-lite tokens understood by RA9MANA_ARTICLES.renderRich.
  --------------------------------------------------------- */
  function wireEditorToolbar(toolbar, textarea, onChange) {
    function wrapSelection(before, after) {
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const value = textarea.value;
      const selected = value.slice(start, end) || "";
      textarea.value = value.slice(0, start) + before + selected + after + value.slice(end);
      const cursor = start + before.length + selected.length + after.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
      onChange();
    }

    function prefixLines(prefix) {
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const value = textarea.value;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = end >= value.length ? value.length : (value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end));
      const block = value.slice(lineStart, lineEnd);
      const updated = block.split("\n").map((l) => (l.startsWith(prefix) ? l : prefix + l)).join("\n");
      textarea.value = value.slice(0, lineStart) + updated + value.slice(lineEnd);
      textarea.focus();
      onChange();
    }

    toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-editor-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-editor-action");
      if (action === "bold") wrapSelection("**", "**");
      else if (action === "italic") wrapSelection("*", "*");
      else if (action === "heading") prefixLines("## ");
      else if (action === "list") prefixLines("- ");
      else if (action === "quote") prefixLines("> ");
    });
  }

  /* ---------------------------------------------------------
     Live preview — rendered exactly like the public article feed
  --------------------------------------------------------- */
  function updatePreview(form, previewEl) {
    const fd = new FormData(form);
    const title = (fd.get("title") || "").trim();
    const intro = (fd.get("introduction") || "").trim();
    const body = (fd.get("body") || "").trim();
    const conclusion = (fd.get("conclusion") || "").trim();
    const authorName = (fd.get("authorName") || "").trim();
    const showName = fd.get("showName") === "on";
    const showPhoto = fd.get("showPhoto") === "on";
    const showBio = fd.get("showBio") === "on";
    const bio = (fd.get("authorBio") || "").trim();

    if (!title && !intro && !body && !conclusion) {
      previewEl.innerHTML = `<p class="field-hint">${RA9MANA_LIBRARY.esc(RA9MANA_I18N.t("articleSubmit.previewEmpty") || "")}</p>`;
      return;
    }

    const displayName = showName && authorName ? authorName : (RA9MANA_I18N.t("articles.authorAnonymous") || "");
    const photo = showPhoto && previewPhotoDataUrl
      ? `<img class="article-author-photo" src="${previewPhotoDataUrl}" alt="">`
      : `<span class="article-author-photo-fallback">${RA9MANA_LIBRARY.esc((displayName || "?").charAt(0) || "?")}</span>`;
    const bioHtml = showBio && bio ? `<div class="ref-contributor-bio">${RA9MANA_LIBRARY.esc(bio)}</div>` : "";

    const sIntro = RA9MANA_I18N.t("articles.sections.introduction") || "Introduction";
    const sBody = RA9MANA_I18N.t("articles.sections.body") || "Body";
    const sConclusion = RA9MANA_I18N.t("articles.sections.conclusion") || "Conclusion";

    previewEl.innerHTML = `
      <div class="article-author">
        ${photo}
        ${displayName ? `<div class="ref-contributor-name">${RA9MANA_LIBRARY.esc(displayName)}</div>` : ""}
        ${bioHtml}
      </div>
      <h2 class="article-title">${RA9MANA_LIBRARY.esc(title || "")}</h2>
      <div class="article-content">
        ${intro ? `<div class="article-section-label">${RA9MANA_LIBRARY.esc(sIntro)}</div>${RA9MANA_ARTICLES.renderRich(intro)}` : ""}
        ${body ? `<div class="article-section-label">${RA9MANA_LIBRARY.esc(sBody)}</div>${RA9MANA_ARTICLES.renderRich(body)}` : ""}
        ${conclusion ? `<div class="article-section-label">${RA9MANA_LIBRARY.esc(sConclusion)}</div>${RA9MANA_ARTICLES.renderRich(conclusion)}` : ""}
      </div>`;
  }

  let previewPhotoDataUrl = "";

  /* ---------------------------------------------------------
     Validation (mirrors RA9MANA_REF_FORM.validate for the fields
     this form actually has)
  --------------------------------------------------------- */
  function showError(fieldWrap, message) {
    fieldWrap.classList.add("has-error");
    const err = fieldWrap.querySelector(".field-error");
    if (err) err.textContent = message;
  }
  function clearAllErrors(form) {
    form.querySelectorAll(".form-field.has-error").forEach((f) => f.classList.remove("has-error"));
  }

  function validate(form) {
    clearAllErrors(form);
    let valid = true;
    let firstInvalid = null;

    ["title", "category", "introduction", "body", "conclusion"].forEach((name) => {
      const el = form.elements[name];
      const wrap = el.closest(".form-field");
      if (!el.value || !el.value.trim()) {
        showError(wrap, RA9MANA_I18N.t("articleSubmit.errors.required") || "Required field");
        valid = false;
        if (!firstInvalid) firstInvalid = el;
      }
    });

    const photoErr = RA9MANA_LIBRARY.validateImage(fileState.authorPhoto);
    if (photoErr) {
      const wrap = document.getElementById("field-author-photo");
      if (wrap) {
        showError(wrap, RA9MANA_I18N.t(`articleSubmit.errors.${photoErr}`) || "Invalid file");
        valid = false;
        if (!firstInvalid) firstInvalid = wrap;
      }
    }

    return { valid, firstInvalid };
  }

  const SUBMIT_ENDPOINT = "https://server-5xab.onrender.com/api/submit-article";

  function buildEntry(form) {
    const fd = new FormData(form);
    const title = (fd.get("title") || "").trim();
    return {
      id: RA9MANA_ARTICLES.generateId(title),
      title,
      category: (fd.get("category") || "").trim(),
      date: new Date().toISOString().slice(0, 10),
      author: {
        name: (fd.get("authorName") || "").trim(),
        email: (fd.get("authorEmail") || "").trim(),
        bio: (fd.get("authorBio") || "").trim(),
        photo: previewPhotoDataUrl || "",
        showName: fd.get("showName") === "on",
        showPhoto: fd.get("showPhoto") === "on",
        showBio: fd.get("showBio") === "on",
        showLinks: fd.get("showLinks") === "on",
        links: {
          website: (fd.get("linkWebsite") || "").trim(),
          linkedin: (fd.get("linkLinkedin") || "").trim(),
          facebook: (fd.get("linkFacebook") || "").trim(),
          instagram: (fd.get("linkInstagram") || "").trim(),
          x: (fd.get("linkX") || "").trim(),
          github: (fd.get("linkGithub") || "").trim()
        }
      },
      content: {
        introduction: (fd.get("introduction") || "").trim(),
        body: (fd.get("body") || "").trim(),
        conclusion: (fd.get("conclusion") || "").trim()
      },
      status: "pending"
    };
  }

  function resetFormState(form) {
    form.reset();
    fileState.authorPhoto = null;
    previewPhotoDataUrl = "";
    const filenameEl = document.getElementById("author-photo-filename");
    if (filenameEl) filenameEl.textContent = "";
    const previewImg = document.getElementById("author-photo-preview");
    if (previewImg) { previewImg.style.display = "none"; previewImg.src = ""; }
  }

  function initForm() {
    const form = document.getElementById("article-form");
    if (!form) return;

    const previewEl = document.getElementById("article-preview");
    const bodyTextarea = document.getElementById("a-body");
    const toolbar = document.getElementById("editor-toolbar");

    wirePreviewDropzone("author-photo-dropzone", "author-photo-input", "author-photo-filename", "author-photo-preview", "authorPhoto");

    // Track the photo as a data URL too, so the live preview can show it
    // without waiting for a real upload target.
    const photoInput = document.getElementById("author-photo-input");
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { previewPhotoDataUrl = reader.result; updatePreview(form, previewEl); };
      reader.readAsDataURL(file);
    });

    const refresh = () => updatePreview(form, previewEl);
    form.addEventListener("input", refresh);
    wireEditorToolbar(toolbar, bodyTextarea, refresh);
    refresh();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const { valid, firstInvalid } = validate(form);
      if (!valid) {
        if (firstInvalid && firstInvalid.scrollIntoView) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      try {
        // FormData already contains every named text field and checkbox:
        // title, category, introduction, body, conclusion, author name/email/bio,
        // all social links, and all visibility flags. The photo is appended explicitly.
        const fd = new FormData(form);
        if (fileState.authorPhoto) {
          fd.append("authorPhoto", fileState.authorPhoto, fileState.authorPhoto.name);
        }

        const res = await fetch(SUBMIT_ENDPOINT, {
          method: "POST",
          body: fd
        });

        let payload = null;
        try { payload = await res.json(); } catch (parseErr) { payload = null; }

        if (!res.ok || (payload && payload.success === false)) {
          throw new Error((payload && (payload.message || payload.error)) || `HTTP ${res.status}`);
        }

        document.getElementById("form-success").classList.add("is-visible");
        document.getElementById("form-success").scrollIntoView({ behavior: "smooth", block: "center" });

        if (window.RA9MANA_showToast) {
          window.RA9MANA_showToast(RA9MANA_I18N.t("articleSubmit.success.toast") || "Article submitted successfully");
        }

        resetFormState(form);
        refresh();
      } catch (err) {
        console.error("Article submission failed:", err);
        if (window.RA9MANA_showToast) {
          window.RA9MANA_showToast(RA9MANA_I18N.t("submit.errors.submitFailed") || "Something went wrong. Please try again.");
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await RA9MANA_I18N.init();
    initForm();
  });
})();
