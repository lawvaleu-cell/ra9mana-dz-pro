(() => {
  "use strict";

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

  async function buildZip(entry) {
    const zip = new JSZip();
    const booksFolder = zip.folder("books");
    const coversFolder = zip.folder("covers");
    const dataFolder = zip.folder("data");

    if (entry._files.pdf) booksFolder.file(entry._files.pdf.name, entry._files.pdf.file);
    if (entry._files.cover) coversFolder.file(entry._files.cover.name, entry._files.cover.file);
    if (entry._files.contributorPhoto) coversFolder.file(entry._files.contributorPhoto.name, entry._files.contributorPhoto.file);

    const cleanEntry = { ...entry };
    delete cleanEntry._files;
    dataFolder.file("library-entry.json", JSON.stringify([cleanEntry], null, 2));

    const instructions = RA9MANA_I18N.t("submit.zipReadme") ||
      "Send this package to contact@ra9mana.dz so the reference can be reviewed and added to the library.";
    zip.file("README.txt", instructions);

    return zip.generateAsync({ type: "blob" });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const { valid, firstInvalid } = RA9MANA_REF_FORM.validate(form, fileState, { requirePdf: true });
      if (!valid) {
        if (firstInvalid && firstInvalid.scrollIntoView) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const entry = RA9MANA_REF_FORM.buildEntry(form, fileState, { status: "pending" });
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      try {
        const blob = await buildZip(entry);
        downloadBlob(blob, `${entry.id}.zip`);

        document.getElementById("form-success").classList.add("is-visible");
        document.getElementById("form-success").scrollIntoView({ behavior: "smooth", block: "center" });

        const subject = encodeURIComponent(`RA9MANA DZ — Bibliothèque juridique — ${entry.title}`);
        const body = encodeURIComponent(
          `Bonjour,\n\nVeuillez trouver ci-joint ma contribution "${entry.title}" pour la Bibliothèque juridique RA9MANA DZ (fichier ${entry.id}.zip téléchargé).\n\nCordialement.`
        );
        const mailLink = document.getElementById("submit-mail-link");
        if (mailLink) mailLink.href = `mailto:contact@ra9mana.dz?subject=${subject}&body=${body}`;

        if (window.RA9MANA_showToast) window.RA9MANA_showToast(RA9MANA_I18N.t("submit.success.toast") || "Package ready.");
      } catch (err) {
        if (window.RA9MANA_showToast) window.RA9MANA_showToast(RA9MANA_I18N.t("submit.errors.packageFailed") || "Something went wrong.");
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
