(() => {
  'use strict';
  const T = {
    fr: {heroEy:'OUTIL RA9MANA', heroTitle:'Éditeur juridique', heroDesc:"Rédigez comme dans un traitement de texte. Ajoutez vos références depuis la bibliothèque, créez vos notes de bas de page et générez automatiquement votre bibliographie.", new:'＋ Nouveau projet', projects:'Mes projets', saved:'Enregistré localement', project:'Nouveau travail juridique', export:'⬇ Projet', import:'⬆ Importer', print:'🖨 Imprimer / PDF', word:'📄 Word', style:'Style', text:'Texte', title1:'Titre 1', title2:'Titre 2', title3:'Titre 3', quote:'Citation', list:'• Liste', olist:'1. Liste', ref:'📚 Référence', foot:'¹ Tḥmīsh', bib:'📖 Bibliographie', page:'＋ Page', projectLabel:'Projet', addRef:'📚 Ajouter une référence', addFoot:'¹ Ajouter un tḥmīsh', viewBib:'📖 Voir la bibliographie', tipTitle:'Conseil de رقمون', tip:'Ajoutez une référence depuis la bibliothèque plutôt que de la retaper.', storage:'Stockage', storageText:'Ce document reste sur cet appareil. Aucun serveur n’est nécessaire.', offline:'● Offline ready', words:'mots', pages:'pages', notes:'tḥmīsh'},
    en: {heroEy:'RA9MANA TOOL', heroTitle:'Legal Editor', heroDesc:'Write like in a word processor. Add references from the library, create footnotes and automatically build your bibliography.', new:'＋ New project', projects:'My projects', saved:'Saved locally', project:'New legal work', export:'⬇ Project', import:'⬆ Import', print:'🖨 Print / PDF', word:'📄 Word', style:'Style', text:'Text', title1:'Heading 1', title2:'Heading 2', title3:'Heading 3', quote:'Quote', list:'• List', olist:'1. List', ref:'📚 Reference', foot:'¹ Footnote', bib:'📖 Bibliography', page:'＋ Page', projectLabel:'Project', addRef:'📚 Add a reference', addFoot:'¹ Add a footnote', viewBib:'📖 View bibliography', tipTitle:'RA9MON tip', tip:'Add a reference from the library instead of typing it again.', storage:'Storage', storageText:'This document stays on this device. No server is required.', offline:'● Offline ready', words:'words', pages:'pages', notes:'footnotes'},
    ar: {heroEy:'أداة RA9MANA', heroTitle:'المحرر القانوني', heroDesc:'اكتب مثل برامج معالجة النصوص، وأضف مراجعك من المكتبة، وأنشئ التهميش، وأنشئ قائمة المراجع تلقائيًا.', new:'＋ مشروع جديد', projects:'مشاريعي', saved:'تم الحفظ محليًا', project:'عمل قانوني جديد', export:'⬇ المشروع', import:'⬆ استيراد', print:'🖨 طباعة / PDF', word:'📄 Word', style:'النمط', text:'نص', title1:'عنوان 1', title2:'عنوان 2', title3:'عنوان 3', quote:'اقتباس', list:'• قائمة', olist:'1. قائمة', ref:'📚 مرجع', foot:'¹ تهميش', bib:'📖 قائمة المراجع', page:'＋ صفحة', projectLabel:'المشروع', addRef:'📚 إضافة مرجع', addFoot:'¹ إضافة تهميش', viewBib:'📖 عرض قائمة المراجع', tipTitle:'نصيحة رقمون', tip:'أضف المرجع من المكتبة بدل إعادة كتابته يدويًا.', storage:'التخزين', storageText:'يبقى هذا المستند على هذا الجهاز. لا حاجة إلى خادم.', offline:'● جاهز للعمل دون اتصال', words:'كلمة', pages:'صفحات', notes:'تهميش'}
  };
  const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
  function lang(){return RA9MANA_I18N.getLang() || localStorage.getItem('ra9mana-lang') || 'fr'}
  function apply(){const l=T[lang()]||T.fr; const set=(sel,v)=>{const e=$(sel);if(e)e.textContent=v};
    set('.editor-hero .eyebrow',l.heroEy); set('.editor-hero h1',l.heroTitle); set('.editor-hero p',l.heroDesc); set('#new-project',l.new); set('#open-project',l.projects); set('#save-status',l.saved);
    set('#export-project',l.export); set('#import-project',l.import); set('#print-document',l.print); set('#export-word',l.word); set('#ask-ramon','🤖 رقمون');
    const sel=$('#block-style'); if(sel){sel.title=l.style; sel.options[0].text=l.text;sel.options[1].text=l.title1;sel.options[2].text=l.title2;sel.options[3].text=l.title3;sel.options[4].text=l.quote}
    const byId={ 'add-reference':l.ref,'add-footnote':l.foot,'show-bibliography':l.bib,'add-page':l.page,'sidebar-add-ref':l.addRef,'sidebar-footnote':l.addFoot,'sidebar-bib':l.viewBib,'word-count':$('#word-count')?.textContent,'page-count':$('#page-count')?.textContent,'footnote-count':$('#footnote-count')?.textContent};
    Object.entries(byId).forEach(([id,v])=>{if(v && id!=='word-count'&&id!=='page-count'&&id!=='footnote-count')set('#'+id,v)});
    set('.sidebar-head b',l.projectLabel); set('.sidebar-box:nth-of-type(1) b',l.tipTitle); set('.sidebar-box:nth-of-type(1) p',l.tip); set('.sidebar-box:nth-of-type(2) b',l.storage); set('.sidebar-box:nth-of-type(2) p',l.storageText); set('.editor-offline',l.offline);
    const title=$('#project-title'); if(title){title.placeholder=l.project; if(!title.value || title.value==='Nouveau travail juridique'||title.value==='New legal work'||title.value==='عمل قانوني جديد') title.value=l.project}
    document.title=lang()==='ar'?'RA9MANA DZ — المحرر القانوني':lang()==='en'?'RA9MANA DZ — Legal Editor':'RA9MANA DZ — Éditeur juridique';
  }
  async function init() {
    // Use the same global i18n engine as the homepage/library.
    // IMPORTANT: RA9MANA_I18N is a top-level const, not window.RA9MANA_I18N.
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        RA9MANA_I18N.setLanguage(btn.getAttribute('data-lang-btn'));
      });
    });

    await RA9MANA_I18N.init();
    apply();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  document.addEventListener('ra9mana:langchange',apply);
})();
