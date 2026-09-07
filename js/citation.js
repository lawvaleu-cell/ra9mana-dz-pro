/**
 * RA9MANA DZ — Automatic legal citation engine
 * Static-only: reads the reference object and builds copy-ready citations.
 */
(() => {
  'use strict';

  const clean = (value) => String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();

  const val = (...values) => values.map(clean).find(Boolean) || '';
  const typeIds = new Set(['law','order','decree','presidential_decree','executive_decree','decision','agreement','treaty','case_law','court_judgment','court_decision','official_document']);

  function author(ref) {
    const a = val(ref.author, ref.authorName);
    return a && a !== '/' && a.toLowerCase() !== 'unknown' ? a : '';
  }

  function pageSuffix(ref, lang='fr') {
    const page = val(ref.page, ref.pages, ref.pageNumber);
    if (!page) return '';
    return lang === 'ar' ? `، ص. ${page}.` : `, p. ${page}.`;
  }

  function full(ref, lang='fr') {
    const t = val(ref.type).toLowerCase();
    const title = val(ref.title);
    const a = author(ref);
    const year = val(ref.year);
    const source = val(ref.source);
    const university = val(ref.university, ref.institution);
    const number = val(ref.number, ref.referenceNumber, ref.lawNumber);
    const date = val(ref.date, ref.legalDate, ref.publicationDate, ref.publishedAt);
    const issue = val(ref.issue, ref.issueNumber, ref.joNumber, ref.officialJournalNumber);
    const publisher = val(ref.publisher, ref.edition, ref.editor);
    const city = val(ref.city, ref.place);

    if (typeIds.has(t)) {
      const numberPart = number ? (lang === 'ar' ? ` رقم ${number}` : ` n° ${number}`) : '';
      const datePart = date ? (lang === 'ar' ? ` المؤرخ في ${date}` : `, ${date}`) : '';
      let out = `${title}${numberPart}${datePart}`;
      if (source) out += lang === 'ar' ? `، ${source}` : `, ${source}`;
      if (issue) out += lang === 'ar' ? `، العدد ${issue}` : `, n° ${issue}`;
      if (year && !date && !issue) out += `, ${year}`;
      return clean(out) + pageSuffix(ref, lang);
    }

    if (['book','personal_book'].includes(t)) {
      let out = `${a ? a + ', ' : ''}${title}`;
      if (publisher) out += `, ${publisher}`;
      if (city) out += `, ${city}`;
      if (year) out += `, ${year}`;
      return clean(out) + pageSuffix(ref, lang);
    }

    if (['scientific_article','legal_article'].includes(t)) {
      let out = `${a ? a + ', ' : ''}«${title}»`;
      if (source) out += `, ${source}`;
      if (issue) out += `, n° ${issue}`;
      if (year) out += `, ${year}`;
      return clean(out) + pageSuffix(ref, lang);
    }

    if (['master_thesis','magister_thesis','phd_thesis','academic_research','university_research'].includes(t)) {
      let out = `${a ? a + ', ' : ''}${title}`;
      const thesisType = t === 'phd_thesis' ? 'Thèse de doctorat' : t === 'magister_thesis' ? 'Mémoire de Magistère' : 'Mémoire';
      out += `, ${thesisType}`;
      if (university) out += `, ${university}`;
      if (year) out += `, ${year}`;
      return clean(out) + pageSuffix(ref, lang);
    }

    if (['report','guide','publication','lecture','study','study_note','official_document'].includes(t)) {
      let out = `${a ? a + ', ' : ''}${title}`;
      if (source) out += `, ${source}`;
      if (publisher) out += `, ${publisher}`;
      if (year) out += `, ${year}`;
      return clean(out) + pageSuffix(ref, lang);
    }

    // Safe generic fallback: never invent a bibliographic field.
    let out = `${a ? a + ', ' : ''}${title}`;
    if (source) out += `, ${source}`;
    if (year) out += `, ${year}`;
    return clean(out) + pageSuffix(ref, lang);
  }

  function short(ref, lang='fr') {
    const a = author(ref);
    const title = val(ref.title);
    const year = val(ref.year);
    if (a) return clean(`${a}, ${title}${year ? `, ${year}` : ''}.`);
    return clean(`${title}${year ? `, ${year}` : ''}.`);
  }

  function bibliography(ref, lang='fr') {
    const t = val(ref.type).toLowerCase();
    const base = full(ref, lang).replace(/[.]$/, '');
    if (['scientific_article','legal_article'].includes(t)) return `${base}.`;
    if (['law','order','decree','presidential_decree','executive_decree','decision','agreement','treaty','case_law','court_judgment','court_decision'].includes(t)) return `${base}.`;
    return `${base}.`;
  }

  window.RA9MANA_CITATION = { full, short, bibliography };
})();
