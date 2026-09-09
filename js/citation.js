/**
 * RA9MANA DZ — Automatic legal citation engine
 * Bibliography and footnote styles are intentionally separate.
 */
(() => {
  'use strict';

  const clean = (value) => String(value ?? '')
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

  function pageSuffix(ref, lang='fr') {
    const page = val(ref.page, ref.pages, ref.pageNumber);
    if (!page) return '';
    return lang === 'ar' ? `، ص. ${page}.` : `, p. ${page}.`;
  }

  function full(ref, lang='fr') {
    const t=val(ref.type).toLowerCase(), title=val(ref.title), a=author(ref), year=val(ref.year);
    const source=val(ref.source), university=val(ref.university,ref.institution);
    const number=val(ref.number,ref.referenceNumber,ref.lawNumber), date=val(ref.date,ref.legalDate,ref.publicationDate,ref.publishedAt);
    const issue=val(ref.issue,ref.issueNumber,ref.joNumber,ref.officialJournalNumber);
    const publisher=val(ref.publisher,ref.edition,ref.editor), city=val(ref.city,ref.place);
    if(legalTypes.has(t)){
      let out=title;
      if(number) out += lang==='ar' ? ` رقم ${number}` : `, n° ${number}`;
      if(date) out += lang==='ar' ? ` المؤرخ في ${date}` : `, ${date}`;
      if(source) out += lang==='ar' ? `، ${source}` : `, ${source}`;
      if(issue) out += lang==='ar' ? `، العدد ${issue}` : `, n° ${issue}`;
      if(year && !date && !issue) out += lang==='ar' ? `، ${year}` : `, ${year}`;
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
      if(source) out+=lang==='ar'?`، ${source}`:`, ${source}`;
      if(issue) out+=lang==='ar'?`، العدد ${issue}`:`, n° ${issue}`;
      if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    if(thesisTypes.has(t)){
      let out=a?`${a}، ${title}`:title;
      const thesisType=t==='phd_thesis'?'أطروحة دكتوراه':t==='magister_thesis'?'مذكرة ماجستير':'مذكرة';
      if(lang==='ar') out+=`، ${thesisType}`; else out+=`, ${thesisType}`;
      if(university) out+=lang==='ar'?`، ${university}`:`, ${university}`;
      if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
      return clean(out)+pageSuffix(ref,lang);
    }
    let out=a?`${a}، ${title}`:title;
    if(source) out+=lang==='ar'?`، ${source}`:`, ${source}`;
    if(year) out+=lang==='ar'?`، ${year}`:`, ${year}`;
    return clean(out)+pageSuffix(ref,lang);
  }

  function short(ref, lang='fr') {
    const a=author(ref), title=val(ref.title), year=val(ref.year);
    return clean(a ? `${a}، ${title}${year?`، ${year}`:''}.` : `${title}${year?`، ${year}`:''}.`);
  }

  // Bibliography is NOT a footnote: no page number, no footnote numbering,
  // and no "full citation" page suffix. Entries are separated by punctuation.
  function bibliography(ref, lang='ar') {
    const t=val(ref.type).toLowerCase(), title=val(ref.title), a=author(ref);
    const year=val(ref.year), source=val(ref.source), city=val(ref.city,ref.place);
    const publisher=val(ref.publisher,ref.edition,ref.editor);
    const university=val(ref.university,ref.institution);
    const number=val(ref.number,ref.referenceNumber,ref.lawNumber);
    const date=val(ref.date,ref.legalDate,ref.publicationDate,ref.publishedAt);
    const issue=val(ref.issue,ref.issueNumber,ref.joNumber,ref.officialJournalNumber);

    if(legalTypes.has(t)){
      let parts=[title];
      if(number) parts.push(lang==='ar'?`رقم ${number}`:`n° ${number}`);
      if(date) parts.push(lang==='ar'?`المؤرخ في ${date}`:date);
      if(source) parts.push(source);
      if(issue) parts.push(lang==='ar'?`العدد ${issue}`:`n° ${issue}`);
      if(year && !date) parts.push(year);
      return parts.filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
    }
    if(bookTypes.has(t)){
      const parts=[a,title,publisher,city,year].filter(Boolean);
      return parts.join(lang==='ar'?'، ':', ')+'.';
    }
    if(articleTypes.has(t)){
      const parts=[a?`${a}`:'',title?`«${title}»`:'',source,issue?(lang==='ar'?`العدد ${issue}`:`n° ${issue}`):'',year].filter(Boolean);
      return parts.join(lang==='ar'?'، ':', ')+'.';
    }
    if(thesisTypes.has(t)){
      const thesisType=t==='phd_thesis'?'أطروحة دكتوراه':t==='magister_thesis'?'مذكرة ماجستير':'مذكرة';
      return [a,title,thesisType,university,year].filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
    }
    return [a,title,source,city,university,year].filter(Boolean).join(lang==='ar'?'، ':', ')+'.';
  }

  window.RA9MANA_CITATION={full,short,bibliography};
})();
