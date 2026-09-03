(() => {
  "use strict";

  /**
   * ⚙️ SITE OWNER CONFIG
   * ------------------------------------------------------------
   * Set this once to your GitHub repository as "owner/repo", e.g.
   * "ra9mana-dz/ra9mana-dz". This is NOT a secret — it is just the
   * public repository address used to build a normal github.com URL.
   * No token of any kind belongs here or anywhere else in this file.
   */
  const GITHUB_REPO = "lawvaleu-cell/ra9mana-dz-pro";
  const ISSUE_TEMPLATE = "library-submission.yml";
  const ISSUE_LABEL = "library-submission";

  const fileState = { pdf: null, cover: null, contributorPhoto: null };

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

  /**
   * Builds a GitHub "New Issue" URL, pre-filled via query parameters, that
   * opens GitHub's own Issue Form (.github/ISSUE_TEMPLATE/library-submission.yml).
   * The visitor completes the submission on GitHub itself — no API call,
   * no token, nothing sent to any server we control. Every query key below
   * matches a field `id` in that Issue Form exactly.
   */
  function buildGithubIssueUrl(entry, fileState) {
    const params = new URLSearchParams();
    params.set("template", ISSUE_TEMPLATE);
    params.set("labels", ISSUE_LABEL);
    params.set("title", `[Library Submission] ${entry.title}`);

    const attachNote = (file, labelKey) => {
      if (!file) return RA9MANA_I18N.t("submit.github.noFile") || "";
      const tpl = RA9MANA_I18N.t(labelKey) || "Attach the file named: {filename}";
      return tpl.replace("{filename}", file.name);
    };

    const fields = {
      ref_title: entry.title,
      author: entry.author,
      type_id: entry.type,
      type_label: entry.typeLabel,
      category: entry.category,
      year: entry.year != null ? String(entry.year) : "",
      language_code: entry.language,
      country: entry.country,
      university: entry.university,
      description: entry.description,
      keywords: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "",
      source: entry.source,
      external_link: entry.externalLink,
      notes: entry.notes,
      contributor_name: entry.contributor.name,
      contributor_bio: entry.contributor.bio,
      link_website: entry.contributor.links.website,
      link_linkedin: entry.contributor.links.linkedin,
      link_facebook: entry.contributor.links.facebook,
      link_instagram: entry.contributor.links.instagram,
      link_x: entry.contributor.links.x,
      link_github: entry.contributor.links.github,
      show_name: String(entry.contributor.showName),
      show_photo: String(entry.contributor.showPhoto),
      show_bio: String(entry.contributor.showBio),
      show_links: String(entry.contributor.showLinks),
      pdf_attachment: attachNote(fileState.pdf, "submit.github.attachPdfNote"),
      cover_attachment: attachNote(fileState.cover, "submit.github.attachCoverNote"),
      contributor_photo_attachment: attachNote(fileState.contributorPhoto, "submit.github.attachPhotoNote")
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
  }

  function initForm() {
    const form = document.getElementById("submit-form");
    if (!form) return;

    RA9MANA_REF_FORM.populateTypeSelect(document.getElementById("s-type"));
    RA9MANA_REF_FORM.populateLanguageSelect(document.getElementById("s-language"));

    wirePreviewDropzone("cover-dropzone", "cover-input", "cover-filename", "cover-preview", "cover");
    wirePreviewDropzone("pdf-dropzone", "pdf-input", "pdf-filename", null, "pdf");
    wirePreviewDropzone("photo-dropzone", "photo-input", "photo-filename", "photo-preview", "contributorPhoto");

    document.addEventListener("ra9mana:langchange", () => {
      const typeSel = document.getElementById("s-type");
      const langSel = document.getElementById("s-language");
      const typeVal = typeSel.value, langVal = langSel.value;
      RA9MANA_REF_FORM.populateTypeSelect(typeSel);
      RA9MANA_REF_FORM.populateLanguageSelect(langSel);
      typeSel.value = typeVal; langSel.value = langVal;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { valid, firstInvalid } = RA9MANA_REF_FORM.validate(form, fileState, { requirePdf: true });
      if (!valid) {
        if (firstInvalid && firstInvalid.scrollIntoView) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      try {
        if (!GITHUB_REPO || GITHUB_REPO === "OWNER/REPO") {
          throw new Error("GITHUB_REPO not configured");
        }

        const entry = RA9MANA_REF_FORM.buildEntry(form, fileState, { status: "pending" });
        const url = buildGithubIssueUrl(entry, fileState);

        const win = window.open(url, "_blank", "noopener");

        const githubLink = document.getElementById("submit-github-link");
        if (githubLink) githubLink.href = url;

        document.getElementById("form-success").classList.add("is-visible");
        document.getElementById("form-success").scrollIntoView({ behavior: "smooth", block: "center" });

        if (window.RA9MANA_showToast) {
          window.RA9MANA_showToast(RA9MANA_I18N.t("submit.success.toast") || "Redirecting to GitHub…");
        }

        if (!win) {
          // Popup blocked — the visible "Open GitHub page" button (href already
          // set above) is the fallback the person can click manually.
          if (window.RA9MANA_showToast) {
            window.RA9MANA_showToast(RA9MANA_I18N.t("submit.github.popupBlocked") || "Please click the button to continue on GitHub.");
          }
        }
      } catch (err) {
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
