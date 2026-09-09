/**
 * RA9MANA DZ — Automatic legal citation engine
 * Footnote and bibliography styles are intentionally separate.
 */
(() => {
  'use strict';

  const clean = (value) => String(value ?? '')
    .replace(/[\u00a0\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
  const val = (...values) => values.map(clean).find(Boolean) || '';
  const author = ref => {
    const a = val(ref.author, ref.authorName);
    return a && a !== '/' && a.toLowerCase() !== 'unknown' ? a : '';
  };
  const legalTypes = new Set(['law','order','decree','presidential_decree','executive_decree','decision','agreement','treaty','case_law','court_judgment','court_decision','official_document']);
  const articleTypes = new Set(['scientific_article','legal_article','article']);
  const thesisTypes = new Set(['master_thesis','magister_thesis','phd_thesis','academic_research','university_research','thesis']);
  const bookTypes = new Set(['book','personal_book']);

  // Library records historically stored the legal number/date inside `description`.
  // Extract only the legal-identification part; never use the descriptive summary as a citation.
  function legalMeta(ref) {
    const raw = clean(ref.description || ref.legalDescription || '');
    let number = val(ref.number, ref.referenceNumber, ref.lawNumber);
    let date = val(ref.date, ref.legalDate, ref.publicationDate, ref.publishedAt);

    if (!number && raw) {
      const m = raw.match(/(?:رقم|رقـم|رقــم|N[°ºo]?|n[°ºo]?)\s*([0-9]{1,5}\s*[-–—]\s*[0-9]{1,5})/i);
      if (m) number = clean(m[1]);
    }

    if (!date && raw) {
      // Arabic: keep the complete legal date phrase, including the Gregorian equivalent.
      const ar = raw.match(/مؤرخ(?:ة)?\s*(?:في|بـ|في تاريخ)?\s*.*?(?:(?:سنة\s*)?(?:19|20)\d{2})/i);
      // French: support common legal-record wording when the library is multilingual.
      const fr = raw.match(/(?:dat[ée]e?|du|en date du)\s+.*?(?:(?:19|20)\d{2})/i);
      date = clean(ar?.[0] || fr?.[0] || '');
    }
    return {number, date};
  }

  function pageSuffix(ref, lang='fr') {
    const page = val(ref.page, ref.pages, ref.pageNumber);
    if (!page) return '';
    return lang === 'ar' ? `، ص. ${page}.` : `, p. ${page}.`;
  }

  function fullBase(ref, lang='fr') {
    const t=val(ref.type).toLowerCase(), title=val(ref.title), a=author(ref), year=val(ref.year);
    const source=val(ref.source), university=val(ref.university,ref.institution);
    const meta=legalMeta(ref);
    const issue=val(ref.issue,ref.issueNumber,ref.joNumber,ref.officialJournalNumber);
    const publisher=val(ref.publisher,ref.edition,ref.editor), city=val(ref.city,ref.place);

    if(legalTypes.has(t)){
      let out=title;
      if(meta.number) out += lang==='ar' ? ` رقم ${meta.number}` : `, n° ${meta.number}`;
      if(meta.date) out += lang==='ar' ? ` ${meta.date}` : `, ${meta.date}`;
      if(source) out += lang==='ar' ? `، ${source}` : `, ${source}`;
      if(issue) out += lang==='ar' ? `، العدد ${issue}` : `, n° ${issue}`;
      if(year && !meta.date && !issue) out += lang==='ar' ? `، ${year}` : `, ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    if(bookTypes.has(t)){
      let out=a?`${a}، ${title}`:title;
      if(publisher) out+=lang==='ar'?`، ${publisher}`:`. ${publisher}`;
      if(city) out+=lang==='ar'?`، ${city}`:`، ${city}`;
      if(year) out+=lang==='ar'?`، ${year}`:`، ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    if(articleTypes.has(t)){
      let out=a?`${a}، «${title}»`:`«${title}»`;
      if(source) out+=lang==='ar'?`، ${source}`:` , ${source}`;
      if(issue) out+=lang==='ar'?`، العدد ${issue}`:`, n° ${issue}`;
      if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    if(thesisTypes.has(t)){
      let out=a?`${a}، ${title}`:title;
      const thesisType=val(t==='phd_thesis'?'أطروحة دكتوراه':t==='magister_thesis'?'مذكرة ماجستير':'مذكرة');
      if(lang==='ar') out+=`، ${thesisType}`; else out+=`, ${thesisType}`;
      if(university) out+=lang==='ar'?`، ${university}`:`, ${university}`;
      if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    let out=a?`${a}، ${title}`:title;
    if(source) out+=lang==='ar'?`، ${source}`:` , ${source}`;
    if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
    return clean(out)+pageSuffix(ref,lang);
  }

  function full(ref, lang='fr') {
    return fullBase(ref, lang);
  }

  function footnote(ref, lang='fr', pageNo=null) {
    // One authoritative footnote formatter for both the library and the editor.
    // Never use the descriptive `description` as citation text.
    let text = fullBase(ref, lang);
    if (pageNo !== null && pageNo !== undefined && String(pageNo).trim()) {
      text = text.replace(/[.]+$/, '');
      text += lang === 'ar' ? `، ص. ${clean(pageNo)}.` : `, p. ${clean(pageNo)}.`;
    }
    return text;
  }

  function short(ref, lang='fr') {
    const a=author(ref), title=val(ref.title), year=val(ref.year);
    return clean(a ? `${a}، ${title}${year?`، ${year}`:''}.` : `${title}${year?`، ${year}`:''}.`);
  }

  function bibliography(ref, lang='ar') {
    const t=val(ref.type).toLowerCase(), title=val(ref.title), a=author(ref);
    const year=val(ref.year), source=val(ref.source), city=val(ref.city,ref.place);
    const publisher=val(ref.publisher,ref.edition,ref.editor);
    const university=val(ref.university,ref.institution);
    const meta=legalMeta(ref);
    const issue=val(ref.issue,ref.issueNumber,ref.joNumber,ref.officialJournalNumber);

    if(legalTypes.has(t)){
      let parts=[title];
      if(meta.number) parts.push(lang==='ar'?`رقم ${meta.number}`:`n° ${meta.number}`);
      if(meta.date) parts.push(meta.date);
      if(source) parts.push(source);
      if(issue) parts.push(lang==='ar'?`العدد ${issue}`:`n° ${issue}`);
      if(year && !meta.date) parts.push(year);
      return parts.filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
    }
    if(bookTypes.has(t)){
      const parts=[a,title,publisher,city,year].filter(Boolean);
      return parts.join(lang==='ar'?'، ':', ')+'.';
    }
    if(articleTypes.has(t)){
      const parts=[a,title?`«${title}»`:'',source,issue?(lang==='ar'?`العدد ${issue}`:`n° ${issue}`):'',year].filter(Boolean);
      return parts.join(lang==='ar'?'، ':', ')+'.';
    }
    if(thesisTypes.has(t)){
      const thesisType=t==='phd_thesis'?'أطروحة دكتوراه':t==='magister_thesis'?'مذكرة ماجستير':'مذكرة';
      return [a,title,thesisType,university,year].filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
    }
    return [a,title,source,city,university,year].filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
  }

  window.RA9MANA_CITATION={full,footnote,short,bibliography};
})();
