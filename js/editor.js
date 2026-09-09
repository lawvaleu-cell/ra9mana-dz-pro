(() => {
  'use strict';
  const KEY='ra9mana-editor-projects-v1';
  const LANGS={fr:{new:'Nouveau travail juridique',words:'mots',pages:'pages',notes:'tḥmīsh',saved:'Enregistré localement',search:'Rechercher dans la bibliothèque…',add:'Ajouter',manual:'Entrer manuellement',close:'Fermer',full:'Citation complète',short:'Citation abrégée',bib:'Bibliographie'},en:{new:'New legal work',words:'words',pages:'pages',notes:'footnotes',saved:'Saved locally',search:'Search the library…',add:'Add',manual:'Enter manually',close:'Close',full:'Full citation',short:'Short citation',bib:'Bibliography'},ar:{new:'عمل قانوني جديد',words:'كلمة',pages:'صفحات',notes:'تهميش',saved:'تم الحفظ محليًا',search:'ابحث في المكتبة…',add:'إضافة',manual:'إدخال يدوي',close:'إغلاق',full:'التهميش الكامل',short:'التهميش المختصر',bib:'قائمة المراجع'}};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const lang=()=> (window.RA9MANA_I18N&&RA9MANA_I18N.getLang?RA9MANA_I18N.getLang():localStorage.getItem('ra9mana-lang')||'fr');
  let project=createProject(); let currentPage=0; let library=[]; let autosaveTimer;
  function uid(prefix='x'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
  function createPage(){return {id:uid('page'),html:'',footnotes:[],isBibliography:false,style:{fontFamily:'Georgia',fontSize:17,color:'#1e293b',borderStyle:'none',borderWidth:1,borderColor:'#cbd5e1',borderInset:10,borderTextGap:2}}}
  function createBibliographyPage(){return {id:uid('bib'),html:'',footnotes:[],isBibliography:true}}
  function createProject(){return {version:1,id:uid('project'),title:LANGS.fr.new,updatedAt:new Date().toISOString(),pages:[createPage()]}}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function getProjects(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
  function saveProjects(list){localStorage.setItem(KEY,JSON.stringify(list))}
  function hasBibliographyPage(){return project.pages.some(p=>p.isBibliography===true)}
  function ensureBibliographyPage(){
    const normal=project.pages.filter(p=>p.isBibliography!==true);
    const existing=project.pages.find(p=>p.isBibliography===true);
    project.pages=[...normal,existing||createBibliographyPage()];
    return project.pages.length-1;
  }
  function getUsedReferences(){
    const seen=new Map();
    project.pages.filter(p=>p.isBibliography!==true).flatMap(p=>p.footnotes||[]).forEach(n=>{
      const r=(n.refId&&library.find(x=>x.id===n.refId))||n.ref;
      if(r){const key=n.refId||r.id||n.id;if(!seen.has(key))seen.set(key,r)}
    });
    return [...seen.values()];
  }
  function persist(){project.title=$('#project-title').value.trim()||LANGS[lang()].new;project.updatedAt=new Date().toISOString(); const list=getProjects().filter(x=>x.id!==project.id);list.unshift(project);saveProjects(list.slice(0,30));$('#save-status').textContent=LANGS[lang()].saved;clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>$('#save-status').textContent='Auto-saved',900)}
  function capture(){
    $$('.page').forEach((el,i)=>{
      const idx=Number(el.dataset.index);
      const p=project.pages[idx];
      if(!p)return;
      if(p.isBibliography===true){return;}
      const content=el.querySelector('.page-content');
      if(content)p.html=content.innerHTML;
      p.footnotes=JSON.parse(el.dataset.footnotes||'[]');
    });
    updateBibliographyPage();
    const bibEl=$('.bibliography-page');if(bibEl)renderBibliographyPageElement(bibEl);
    persist();
    updateStats()
  }
  function render(){
    normalizeProject();
    $('#project-title').value=project.title;
    const root=$('#pages');root.innerHTML='';
    project.pages.forEach((p,i)=>{
      const page=document.createElement('section');page.className='page';page.dataset.index=i;page.dataset.footnotes=JSON.stringify(p.footnotes||[]);page.dataset.bibliography=p.isBibliography?'true':'false';
      if(p.isBibliography){
        page.classList.add('bibliography-page');
        page.innerHTML=`<div class="page-head"><span>RA9MANA Legal Editor</span><span>Page ${i+1}</span></div><div class="page-content bibliography-content" contenteditable="false"></div>`;
        root.appendChild(page);renderBibliographyPageElement(page);return;
      }
      page.style.border='none';page.style.setProperty('--page-border-width',`${p.style?.borderWidth||1}px`);page.style.setProperty('--page-border-style',p.style?.borderStyle||'none');page.style.setProperty('--page-border-color',p.style?.borderColor||'#cbd5e1');page.style.setProperty('--page-border-inset',`${Number(p.style?.borderInset)||10}mm`);const gapMm=Math.max(1,Math.min(3,Number(p.style?.borderTextGap)||2))*5;const contentInsetMm=(Number(p.style?.borderInset)||10)+gapMm;page.style.padding=`${contentInsetMm}mm ${contentInsetMm}mm 38mm`;page.innerHTML=`<div class="page-head"><span>RA9MANA Legal Editor</span><span>Page ${i+1}</span></div><div class="page-actions"><button data-delete-page="${i}" title="Delete page">× Page</button></div><div class="page-content" contenteditable="true" spellcheck="true"></div><div class="page-footnotes"></div>`;const pageContent=page.querySelector('.page-content');pageContent.style.fontFamily=p.style?.fontFamily||'Georgia';pageContent.style.fontSize=`${p.style?.fontSize||17}px`;pageContent.style.color=p.style?.color||'#1e293b';
      page.querySelector('.page-content').innerHTML=p.html||'';
      bindMarkerIds(page,p.footnotes||[]);
      renderFootnotes(page,p.footnotes||[]);
      root.appendChild(page)
    });
    bindPages();updateStats()
  }
  function normalizeProject(){
    if(!Array.isArray(project.pages)||!project.pages.length)project.pages=[createPage()];
    project.pages=project.pages.map(pg=>({id:pg.id||uid('page'),html:String(pg.html||''),footnotes:Array.isArray(pg.footnotes)?pg.footnotes:[],isBibliography:pg.isBibliography===true,style:{fontFamily:pg.style?.fontFamily||'Georgia',fontSize:Number(pg.style?.fontSize)||17,color:pg.style?.color||'#1e293b',borderStyle:pg.style?.borderStyle||'none',borderWidth:Number(pg.style?.borderWidth)||1,borderColor:pg.style?.borderColor||'#cbd5e1',borderInset:Number(pg.style?.borderInset)||10,borderTextGap:Math.max(1,Math.min(3,Number(pg.style?.borderTextGap)||2))}}));
    const bib=project.pages.find(p=>p.isBibliography===true);
    project.pages=project.pages.filter(p=>!p.isBibliography).concat(bib?[bib]:[]);
  }
  function bindMarkerIds(page,notes){
    const markers=[...page.querySelectorAll('.reference-marker')];
    markers.forEach((m,i)=>{
      if(!m.dataset.footnoteId && notes[i])m.dataset.footnoteId=notes[i].id;
      if(notes[i]){m.textContent=String(i+1);m.dataset.footnote=String(i+1)}
    });
  }
  function renumberPage(page,notes){
    const markers=[...page.querySelectorAll('.reference-marker')];
    markers.forEach((m,i)=>{m.textContent=String(i+1);m.dataset.footnote=String(i+1);if(notes[i])m.dataset.footnoteId=notes[i].id});
    page.dataset.footnotes=JSON.stringify(notes);
    renderFootnotes(page,notes)
  }
  function renderFootnotes(page,notes){const box=page.querySelector('.page-footnotes');if(!box)return;box.innerHTML=notes.map((n,i)=>`<div class="footnote-item" data-note-id="${escapeHtml(n.id)}"><span class="footnote-number">${i+1}.</span><span class="footnote-text">${escapeHtml(n.text)}</span><button type="button" class="footnote-delete" data-delete-note="${escapeHtml(n.id)}" title="حذف التهميش" aria-label="حذف التهميش">×</button></div>`).join('');page.dataset.footnotes=JSON.stringify(notes)}
  function bindPages(){
    $$('.page-content[contenteditable="true"]').forEach(el=>{
      el.addEventListener('focusin',()=>{currentPage=Number(el.closest('.page')?.dataset.index||0);rememberSelection()});
      el.addEventListener('input',()=>{currentPage=Number(el.closest('.page')?.dataset.index||0);rememberSelection();capture()});
      ['mouseup','keyup','touchend','select'].forEach(ev=>el.addEventListener(ev,rememberSelection));
      el.addEventListener('blur',rememberSelection);
    });
    $$('[data-delete-page]').forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.deletePage);const target=project.pages[i];
      if(target?.isBibliography){toast('لا يمكن حذف صفحة المراجع');return;}
      if(project.pages.filter(p=>p.isBibliography!==true).length===1){toast('يجب أن تبقى صفحة واحدة');return;}
      project.pages.splice(i,1);if(currentPage>=project.pages.length-1)currentPage=Math.max(0,project.pages.length-2);savedRange=null;render();persist();
    });
    // Footnote deletion uses event delegation because the footnote list is rebuilt
    // every time numbering changes. This keeps the × button working after any
    // insertion/deletion/renumbering.
    const pagesRoot=$('#pages');
    if(pagesRoot){
      pagesRoot.onclick=(ev)=>{
        const b=ev.target.closest?.('[data-delete-note]');
        if(!b)return;
        ev.preventDefault();
        ev.stopPropagation();
        const page=b.closest('.page');
        if(!page || page.dataset.bibliography==='true')return;
        const index=Number(page.dataset.index);
        const notes=JSON.parse(page.dataset.footnotes||'[]');
        const noteId=b.dataset.deleteNote;
        const noteIndex=notes.findIndex(n=>n.id===noteId);
        if(noteIndex<0)return;
        const marker=page.querySelector(`.reference-marker[data-footnote-id="${CSS.escape(noteId)}"]`);
        if(marker){
          const prev=marker.previousSibling;
          const next=marker.nextSibling;
          if(next && next.nodeType===3 && next.nodeValue.includes('\u200b'))next.remove();
          if(prev && prev.nodeType===3 && prev.nodeValue.includes('\u200b'))prev.remove();
          marker.remove();
        }
        notes.splice(noteIndex,1);
        project.pages[index].footnotes=notes;
        renumberPage(page,notes);
        capture();
        toast(lang()==='ar'?'تم حذف التهميش وإعادة الترقيم':'Footnote deleted and numbering updated');
      };
    }
  }

  let savedRange=null;
  function rememberSelection(){const s=window.getSelection();if(!s||!s.rangeCount)return;const range=s.getRangeAt(0);const node=range.commonAncestorContainer;const content=node.nodeType===3?node.parentElement:node;const pageContent=content?.closest?.('.page-content[contenteditable="true"]');if(pageContent)savedRange=range.cloneRange()}
  function restoreSelection(){if(!savedRange)return false;const container=savedRange.commonAncestorContainer;const content=(container.nodeType===3?savedRange.commonAncestorContainer.parentElement:container)?.closest?.('.page-content[contenteditable="true"]');if(!content)return false;const s=window.getSelection();s.removeAllRanges();s.addRange(savedRange);return true}
  function currentPageObject(){return project.pages[currentPage]||project.pages[0]}
  function applyTextStyle(prop,value,commandValue){rememberSelection();if(!restoreSelection()){toast(lang()==='ar'?'حدد النص أولًا':'Select text first');return;}document.execCommand(prop,false,commandValue??value);const p=currentPageObject();if(p){p.style=p.style||{};if(prop==='fontName')p.style.fontFamily=value;if(prop==='fontSize')p.style.fontSize=Number(value)||17;if(prop==='foreColor')p.style.color=value;}capture();renderSelectionPreservingCaret();}
  function renderSelectionPreservingCaret(){try{if(savedRange){const s=window.getSelection();s.removeAllRanges();s.addRange(savedRange)}}catch(e){}}
  function pageBorderModal(){const p=currentPageObject();const st=p.style||{};const gap=Math.max(1,Math.min(3,Number(st.borderTextGap)||2));openModal(`<h2 class="modal-title">▣ ${lang()==='ar'?'إطار الصفحة':'Page border'}</h2><p class="modal-sub">${lang()==='ar'?'الإطار سيكون داخل الصفحة مثل Word، مع مسافة مستقلة بين الإطار والنص.':'The border is inset from the page edge, like Word, with a separate text-to-border spacing.'}</p><form id="page-border-form" class="manual-form"><label>النمط<select name="style"><option value="none">بدون إطار</option><option value="solid">متصل</option><option value="double">مزدوج</option><option value="dashed">متقطع</option><option value="dotted">منقط</option></select></label><label>السماكة (px)<input name="width" type="number" min="1" max="8" value="${st.borderWidth||1}"></label><label>اللون<input name="color" type="color" value="${st.borderColor||'#cbd5e1'}"></label><label>التباعد بين النص والإطار<select name="gap"><option value="1">قريب — مستوى 1</option><option value="2">متوسط — مستوى 2</option><option value="3">واسع — مستوى 3</option></select></label><div class="page-border-preview"><b>معاينة المسافة</b><div class="border-gap-demo" data-gap-demo></div><small>المستوى 1 = أقرب للنص، المستوى 3 = مسافة أكبر.</small></div><div class="form-actions"><button type="button" class="btn btn-ghost" data-close-editor-modal>إلغاء</button><button class="btn btn-primary">تطبيق</button></div></form>`);const f=$('#page-border-form');f.elements.style.value=st.borderStyle||'none';f.elements.gap.value=String(gap);f.onsubmit=e=>{e.preventDefault();p.style=p.style||{};p.style.borderStyle=f.elements.style.value;p.style.borderWidth=Number(f.elements.width.value)||1;p.style.borderColor=f.elements.color.value;p.style.borderInset=10;p.style.borderTextGap=Math.max(1,Math.min(3,Number(f.elements.gap.value)||2));render();persist();closeModal();toast('تم تطبيق إطار الصفحة والتباعد')};}
  function exec(cmd,val=null){restoreSelection();if(cmd==='createLink'){const url=prompt('URL');if(url)document.execCommand(cmd,false,url)}else document.execCommand(cmd,false,val);capture()}
  function addPage(){
    capture();
    const bibIndex=project.pages.findIndex(p=>p.isBibliography===true);
    const newPage=createPage();
    if(bibIndex>=0)project.pages.splice(bibIndex,0,newPage);else project.pages.push(newPage);
    currentPage=bibIndex>=0?bibIndex:project.pages.length-1;
    render();
    setTimeout(()=>{$$('.page-content[contenteditable="true"]').at(currentPage)?.focus();window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})},50);
    persist()
  }
  async function loadLibrary(){try{const r=await fetch('data/library.json',{cache:'no-store'});library=await r.json();if(!Array.isArray(library))library=[]}catch{library=[]}}
  function openModal(html){hideSelectionToolbar();$('#modal-content').innerHTML=html;$('#editor-modal').classList.add('is-open');$('#editor-modal').setAttribute('aria-hidden','false')}
  function closeModal(){$('#editor-modal').classList.remove('is-open');$('#editor-modal').setAttribute('aria-hidden','true')}
  function refText(ref,kind='full',pageNo=null){
    let text='';
    if(window.RA9MANA_CITATION){
      try{
        if(kind==='footnote' && typeof window.RA9MANA_CITATION.footnote==='function') text=window.RA9MANA_CITATION.footnote(ref,lang(),pageNo);
        else if(typeof window.RA9MANA_CITATION[kind]==='function') text=window.RA9MANA_CITATION[kind](ref,lang());
      }catch{}
    }
    if(!text){
      const author=ref.author&&ref.author!=='/'?ref.author:'';
      text=[author,ref.title,ref.source,ref.year].filter(Boolean).join(', ');
      if(kind==='footnote' && pageNo) text=String(text).replace(/[.]+$/,'')+(lang()==='ar'?`، ص. ${pageNo}.`:` , p. ${pageNo}.`);
    }
    return text;
  }
  function addMarker(page,number,noteId){
    const content=page?.querySelector('.page-content[contenteditable="true"]');if(!content||!restoreSelection())return null;
    const r=savedRange.cloneRange();r.collapse(false);const marker=document.createElement('sup');marker.className='reference-marker';marker.textContent=String(number);marker.dataset.footnote=String(number);marker.dataset.footnoteId=noteId||'';marker.title='Footnote '+number;marker.setAttribute('aria-label','Footnote '+number);r.insertNode(marker);
    const spacer=document.createTextNode('\u200B');marker.parentNode.insertBefore(spacer,marker.nextSibling);const after=document.createRange();after.setStart(spacer,1);after.collapse(true);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(after);savedRange=after.cloneRange();return marker;
  }
  function addFootnote(ref,text){
    const pageIndex=currentPage;const page=$$('.page')[pageIndex];if(!page||page.dataset.bibliography==='true')return;
    const notes=JSON.parse(page.dataset.footnotes||'[]');const note={id:uid('note'),refId:ref?.id||null,ref:ref||null,text:text||refText(ref,'full'),citationKind:text&&text===refText(ref,'short')?'short':'full'};
    if(ref){project.usedReferences=Array.isArray(project.usedReferences)?project.usedReferences:[];const key=ref.id||JSON.stringify(ref);if(!project.usedReferences.some(r=>(r.id||JSON.stringify(r))===key))project.usedReferences.push(ref)}const marker=addMarker(page,notes.length+1,note.id);if(!marker){toast('ضع المؤشر داخل النص أولًا');return;}
    const markers=[...page.querySelectorAll('.reference-marker')];const insertIndex=markers.indexOf(marker);const safeIndex=insertIndex<0?notes.length:Math.min(insertIndex,notes.length);notes.splice(safeIndex,0,note);
    project.pages[pageIndex].footnotes=notes;const hadBib=hasBibliographyPage();ensureBibliographyPage();renumberPage(page,notes);capture();if(!hadBib){render();currentPage=pageIndex;}closeModal();toast('تمت إضافة التهميش رقم '+(safeIndex+1)+' إلى الصفحة '+(pageIndex+1));
  }
  function picker(){const l=LANGS[lang()];openModal(`<h2 class="modal-title">📚 ${lang()==='ar'?'إضافة مرجع من مكتبة RA9MANA':'Add a reference from RA9MANA Library'}</h2><p class="modal-sub">${l.search}</p><input class="library-picker-search" id="ref-search" placeholder="${l.search}"><div class="picker-filters" id="ref-filters"></div><div class="picker-list" id="ref-list"></div><div style="margin-top:15px"><button class="btn btn-ghost" id="manual-ref">✍️ ${l.manual}</button></div>`);let type='all';const types=[...new Set(library.map(r=>r.type).filter(Boolean))];$('#ref-filters').innerHTML=`<button class="picker-chip active" data-type="all">All</button>`+types.map(t=>`<button class="picker-chip" data-type="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');const draw=()=>{const q=($('#ref-search').value||'').toLowerCase();const arr=library.filter(r=>(type==='all'||r.type===type)&&[r.title,r.author,r.category,r.description,r.source].join(' ').toLowerCase().includes(q)).slice(0,60);$('#ref-list').innerHTML=arr.length?arr.map(r=>`<div class="picker-item"><div><h4>${escapeHtml(r.title||'—')}</h4><p>${escapeHtml([r.author&&r.author!=='/'?r.author:'',r.year,r.category].filter(Boolean).join(' · '))}</p></div><div class="picker-actions"><button data-use-ref="${escapeHtml(r.id)}">📚 إضافة للمراجع</button><button class="secondary" data-foot-ref="${escapeHtml(r.id)}">¹ تهميش</button></div></div>`).join(''):`<div class="ramon-box">${lang()==='ar'?'لم نجد هذا المرجع. يمكنك إدخاله يدويًا.':'No matching reference. You can enter it manually.'}</div>`;$$('[data-use-ref]').forEach(b=>b.onclick=()=>insertReference(library.find(r=>r.id===b.dataset.useRef)));$$('[data-foot-ref]').forEach(b=>b.onclick=()=>chooseFootnote(library.find(r=>r.id===b.dataset.footRef))) };$('#ref-search').oninput=draw;$$('[data-type]').forEach(b=>b.onclick=()=>{type=b.dataset.type;$$('[data-type]').forEach(x=>x.classList.remove('active'));b.classList.add('active');draw()});$('#manual-ref').onclick=manualForm;draw()}
  function chooseFootnote(ref){if(!ref)return;const previous=project.pages.flatMap(p=>p.footnotes||[]).find(n=>n.refId===ref.id);const options=previous?`<button class="btn btn-primary" id="use-full">${LANGS[lang()].full}</button><button class="btn btn-ghost" id="use-short">${LANGS[lang()].short}</button>`:`<button class="btn btn-primary" id="use-full">${LANGS[lang()].full}</button>`;openModal(`<h2 class="modal-title">¹ ${lang()==='ar'?'إضافة تهميش من المكتبة':'Add library footnote'}</h2><p class="modal-sub">${escapeHtml(ref.title)}</p><div class="library-citation-preview"><span>${lang()==='ar'?'النص الذي سيضاف إلى التهميش':'Citation that will be inserted into the footnote'}</span><div class="citation-preview-text">${escapeHtml(refText(ref,'full'))}</div></div><label class="page-number-field">${lang()==='ar'?'رقم الصفحة (اختياري)':'Page number (optional)'}<input id="footnote-page" type="text" inputmode="numeric" placeholder="${lang()==='ar'?'مثال: 25':'e.g. 25'}"></label><div class="form-actions">${options}</div></div>`);const pageInput=$('#footnote-page');const makeText=kind=>{const pageNo=(pageInput?.value||'').trim();return refText(ref,'footnote',pageNo)};$('#use-full').onclick=()=>addFootnote(ref,makeText('full'));$('#use-short')?.addEventListener('click',()=>addFootnote(ref,makeText('short')))}
  function manualForm(){openModal(`<h2 class="modal-title">✍️ ${LANGS[lang()].manual}</h2><p class="modal-sub">أدخل بيانات المرجع مرة واحدة وسيتم استخدامه في هذا المشروع.</p><form class="manual-form" id="manual-reference-form"><label>المؤلف<input name="author"></label><label>العنوان<input name="title" required></label><label>النوع<select name="type"><option value="book">كتاب</option><option value="law">قانون</option><option value="article">مقال</option><option value="thesis">مذكرة/أطروحة</option><option value="other">أخرى</option></select></label><label>المصدر / الناشر<input name="source"></label><label>السنة<input name="year"></label><label>الصفحة<input name="page"></label><div class="form-actions"><button type="button" class="btn btn-ghost" data-close-editor-modal>إلغاء</button><button class="btn btn-primary">إضافة التهميش</button></div></form>`);$('#manual-reference-form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const r={id:uid('manual'),author:d.get('author'),title:d.get('title'),type:d.get('type'),source:d.get('source'),year:d.get('year')};addFootnote(r,[d.get('author'),d.get('title'),d.get('source'),d.get('year'),d.get('page')?`ص. ${d.get('page')}`:''].filter(Boolean).join(', '))}}
  function insertReference(ref){
    if(!ref)return;
    capture();
    project.usedReferences=Array.isArray(project.usedReferences)?project.usedReferences:[];
    const key=ref.id||JSON.stringify(ref);
    if(!project.usedReferences.some(r=>(r.id||JSON.stringify(r))===key)) project.usedReferences.push(ref);
    ensureBibliographyPage();
    updateBibliographyPage();
    const bibEl=$('.bibliography-page');
    if(bibEl)renderBibliographyPageElement(bibEl);
    persist();
    closeModal();
    toast('تمت إضافة المرجع إلى قائمة المراجع دون إدراج وصفه داخل النص');
  }
  function updateBibliographyPage(){
    const bibIndex=project.pages.findIndex(p=>p.isBibliography===true);if(bibIndex<0)return;
    const refs=getUsedReferences();
    const direct=Array.isArray(project.usedReferences)?project.usedReferences:[];
    const seen=new Map(refs.map(r=>[r.id||JSON.stringify(r),r]));direct.forEach(r=>{const key=r.id||JSON.stringify(r);if(!seen.has(key))seen.set(key,r)});
    const all=[...seen.values()];
    project.pages[bibIndex].bibliographyRefs=all;
    project.pages[bibIndex].bibliographyEntries=all.map(r=>refText(r,'bibliography'));
  }
  function renderBibliographyPageElement(page){
    const refs=(()=>{
      const seen=new Map();getUsedReferences().forEach(r=>{const key=r.id||JSON.stringify(r);if(!seen.has(key))seen.set(key,r)});
      (Array.isArray(project.usedReferences)?project.usedReferences:[]).forEach(r=>{const key=r.id||JSON.stringify(r);if(!seen.has(key))seen.set(key,r)});
      return [...seen.values()];
    })();
    const content=page.querySelector('.bibliography-content');
    content.innerHTML=`<div class="bibliography-title">${lang()==='ar'?'قائمة المراجع':'Bibliography'}</div>`+(refs.length?refs.map(r=>`<div class="bibliography-entry"><span>${escapeHtml(refText(r,'bibliography'))}</span></div>`).join(''):`<div class="bibliography-empty">${lang()==='ar'?'ستظهر هنا المراجع المستخدمة في البحث تلقائيًا.':'Used references will appear here automatically.'}</div>`);
  }
  function viewReferences(){
    capture();
    const refs=getUsedReferences();
    const body=refs.length?refs.map((r,i)=>`<div class="bib-item reference-view-item"><div><b>${escapeHtml(refText(r,'bibliography'))}</b></div><button type="button" class="btn btn-ghost btn-sm" data-read-ref="${escapeHtml(r.id||'')}">قراءة</button></div>`).join(''):`<div class="ramon-box">لا توجد مراجع مستخدمة في البحث بعد.</div>`;
    openModal(`<h2 class="modal-title">📚 ${lang()==='ar'?'المراجع المستخدمة':'Used references'}</h2><p class="modal-sub">${lang()==='ar'?'هذه قائمة المراجع المستخدمة في البحث. يمكنك فتح أي مرجع لقراءة بياناته فقط، دون إدراجه في النص.':'References used in this research. Open one to read its details without inserting it.'}</p><div class="reference-view-list">${body}</div>`);
    $$('[data-read-ref]').forEach(b=>b.onclick=()=>{const r=refs.find(x=>(x.id||'')===b.dataset.readRef);if(!r)return;openModal(`<h2 class="modal-title">📖 ${escapeHtml(r.title||'مرجع')}</h2><div class="ramon-box"><p>${escapeHtml(refText(r,'bibliography'))}</p>${r.description?`<hr><p>${escapeHtml(r.description)}</p>`:''}</div><div class="form-actions"><button type="button" class="btn btn-ghost" data-back-refs>رجوع إلى المراجع</button></div>`);$('#modal-content [data-back-refs]').onclick=viewReferences});
  }
  function projectsModal(){const ps=getProjects();openModal(`<h2 class="modal-title">📂 ${lang()==='ar'?'مشاريعي':'My projects'}</h2><p class="modal-sub">${lang()==='ar'?'مشاريع محفوظة على هذا الجهاز فقط.':'Projects stored on this device only.'}</p><div class="project-list">${ps.length?ps.map(p=>`<div class="project-row"><div><b>${escapeHtml(p.title)}</b><small style="display:block;color:#64748b">${new Date(p.updatedAt).toLocaleString()}</small></div><button data-open-project="${escapeHtml(p.id)}">فتح</button></div>`).join(''):'<div class="ramon-box">لا توجد مشاريع محفوظة بعد.</div>'}</div>`);$$('[data-open-project]').forEach(b=>b.onclick=()=>{const p=ps.find(x=>x.id===b.dataset.openProject);if(p){project=p;currentPage=0;render();closeModal();}})}
  function ramon(){const l=lang();openModal(`<div class="ramon-box"><h2 class="modal-title">🤖 رقمون داخل المحرر</h2><p>${l==='ar'?'أنا رقمون. أستطيع مساعدتك في العثور على مرجع، إضافة تهميش أو بناء قائمة المراجع.':'Je suis رقمون. I can help you find references, add footnotes and build your bibliography.'}</p><div class="ramon-actions"><button data-ramon-action="ref">📚 ${l==='ar'?'ابحث عن مرجع':'Find a reference'}</button><button data-ramon-action="note">¹ ${l==='ar'?'أضف تهميشًا':'Add a footnote'}</button><button data-ramon-action="bib">📖 ${l==='ar'?'قائمة المراجع':'Bibliography'}</button></div></div>`);$$('[data-ramon-action]').forEach(b=>b.onclick=()=>{closeModal();if(b.dataset.ramonAction==='ref')picker();if(b.dataset.ramonAction==='note')openFootnote();if(b.dataset.ramonAction==='bib')viewReferences()})}
  function openFootnote(){
    rememberSelection();
    if(savedRange){
      const node=savedRange.commonAncestorContainer;
      const el=node.nodeType===3?node.parentElement:node;
      const page=el?.closest?.('.page');
      if(page) currentPage=Number(page.dataset.index||0);
    } else {
      const page=$('.page:focus-within');
      if(page) currentPage=Number(page.dataset.index||0);
    }
    picker();
  }
  function exportProject(){capture();const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'});download(blob,(project.title||'ra9mana-project').replace(/[^\w\-\u0600-\u06ff]+/g,'-')+'.ra9mana')}
  function importProject(){ $('#project-file').click() }
  $('#project-file').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(!p.pages)throw Error();project=p;render();persist();toast('تم استيراد المشروع')}catch{toast('ملف مشروع غير صالح')}};r.readAsText(f);e.target.value=''}
  function rtfEscape(text){
    text=String(text??'');
    let out='';
    for(const ch of text){
      const cp=ch.codePointAt(0);
      if(ch==='\\') out+='\\\\';
      else if(ch==='{') out+='\\{';
      else if(ch==='}') out+='\\}';
      else if(ch==='\n') out+='\\line ';
      else if(cp>127) out+='\\u'+(cp>32767?cp-65536:cp)+'?';
      else out+=ch;
    }
    return out;
  }
  function htmlToRtf(root, pageNotes){
    let out='';
    const notes=Array.isArray(pageNotes)?pageNotes:[];
    const used=new Set();
    const walk=node=>{
      if(node.nodeType===Node.TEXT_NODE){ out+=rtfEscape(node.nodeValue); return; }
      if(node.nodeType!==Node.ELEMENT_NODE)return;
      const tag=node.tagName.toLowerCase();
      if(tag==='br'){out+='\\line ';return;}
      if(tag==='p'||tag==='div'||tag==='li'){ if(out && !out.endsWith('\\line '))out+='\\line '; }
      if(tag==='strong'||tag==='b')out+='{\\b ';
      if(tag==='em'||tag==='i')out+='{\\i ';
      if(tag==='u')out+='{\\ul ';
      if(tag==='h1'||tag==='h2'||tag==='h3')out+='{\\b\\fs'+(tag==='h1'?32:tag==='h2'?28:24)+' ';
      if(tag==='blockquote')out+='{\\li720 ';
      if(tag==='sup' && node.classList.contains('reference-marker')){
        let id=node.dataset.footnoteId||'';
        let note=notes.find(n=>String(n.id)===String(id));
        let idx=note?notes.indexOf(note):-1;
        // Fallback: if the DOM marker lost its data-id during serialization,
        // match it by its displayed number/order within this page.
        if(!note){
          const displayed=String(node.textContent||'').replace(/[^0-9]/g,'');
          const candidate=Math.max(0,(parseInt(displayed,10)||1)-1);
          if(notes[candidate]){note=notes[candidate];idx=candidate;}
        }
        if(!note){
          for(let j=0;j<notes.length;j++){
            if(!used.has(j)){note=notes[j];idx=j;break;}
          }
        }
        const num=idx>=0?String(idx+1):(String(node.textContent||'').trim()||'1');
        out+='{\\super '+rtfEscape(num)+'}';
        if(note && idx>=0){
          used.add(idx);
          out+='{\\footnote\\chftn '+rtfEscape(String(note.text||''))+'}';
        }
        return;
      }
      for(const child of node.childNodes)walk(child);
      if(tag==='strong'||tag==='b'||tag==='em'||tag==='i'||tag==='u'||tag==='h1'||tag==='h2'||tag==='h3'||tag==='blockquote')out+='}';
      if(tag==='p'||tag==='div'||tag==='li'||tag==='h1'||tag==='h2'||tag==='h3'||tag==='blockquote')out+='\\line ';
    };
    for(const child of root.childNodes)walk(child);
    return out;
  }
  function exportWord(){ toast(lang()==='ar'?'لم يعد تصدير Word متاحًا. استخدم الطباعة المباشرة.':'Word export is disabled. Use direct printing.'); }
  function preparePrint(){
    capture();
    return project;
  }
  async function printDocument(){
    preparePrint();
    hideSelectionToolbar();
    try{
      if(document.fonts&&document.fonts.ready) await document.fonts.ready;
    }catch(e){}
    // Print the current document directly. This avoids the mobile-browser
    // popup -> generated file -> PDF download flow that can fail on phones.
    requestAnimationFrame(()=>setTimeout(()=>window.print(),80));
  }
  function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  async function copyText(text){
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
        toast('تم النسخ');
        return;
      }
    }catch(e){}
    try{
      const t=document.createElement('textarea');
      t.value=text;
      t.setAttribute('readonly','');
      t.style.position='fixed';t.style.opacity='0';
      document.body.appendChild(t);t.select();
      document.execCommand('copy');t.remove();toast('تم النسخ');
    }catch(e){toast('تعذر النسخ تلقائيًا');}
  }
  function toast(m){const t=$('#toast');if(!t)return;t.querySelector('.toast-inner').textContent=m;t.classList.add('is-visible');setTimeout(()=>t.classList.remove('is-visible'),2200)}
  function updateStats(){let html=$$('.page-content').map(x=>x.innerText).join(' ').trim();const words=html?html.split(/\s+/).filter(Boolean).length:0;const notes=project.pages.reduce((a,p)=>a+(p.footnotes||[]).length,0);$('#word-count').textContent=`${words} ${LANGS[lang()].words}`;$('#page-count').textContent=`${project.pages.length} ${LANGS[lang()].pages}`;$('#footnote-count').textContent=`${notes} ${LANGS[lang()].notes}`}
  function refreshEditorLanguage(){const l=LANGS[lang()];$('#project-title').placeholder=l.new;$('#save-status').textContent=l.saved;updateStats()}
  function syncStickyToolbarOffset(){
    const header=$('#site-header');
    if(!header)return;
    const update=()=>{
      const h=Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--site-header-height',`${h}px`);
    };
    update();
    if(window.ResizeObserver){
      const ro=new ResizeObserver(update);
      ro.observe(header);
    }else{
      window.addEventListener('resize',update,{passive:true});
      window.addEventListener('scroll',update,{passive:true});
    }
  }
  let selectionToolbar=null;
  let selectionHideTimer=null;
  function ensureSelectionToolbar(){
    if(selectionToolbar)return selectionToolbar;
    selectionToolbar=document.createElement('div');
    selectionToolbar.id='editor-selection-toolbar';
    selectionToolbar.setAttribute('role','toolbar');
    selectionToolbar.innerHTML=`
      <select id="float-font" title="الخط"><option value="">خط</option><option>Amiri</option><option>Arial</option><option>Calibri</option><option>Cambria</option><option>Garamond</option><option>Georgia</option><option>Times New Roman</option></select>
      <input id="float-size" type="number" min="8" max="72" value="17" title="حجم الخط" aria-label="حجم الخط">
      <button type="button" data-float-cmd="bold" title="عريض"><b>B</b></button>
      <button type="button" data-float-cmd="italic" title="مائل"><i>I</i></button>
      <button type="button" data-float-cmd="underline" title="تحته خط"><u>U</u></button>
      <button type="button" id="float-color" title="لون النص">A</button>
      <input id="float-color-picker" type="color" value="#1e293b" title="لون النص" aria-label="لون النص">
      <span class="float-sep"></span>
      <button type="button" data-float-cmd="justifyRight" title="محاذاة لليمين">≡</button>
      <button type="button" data-float-cmd="justifyCenter" title="توسيط">≡</button>
      <button type="button" data-float-cmd="justifyLeft" title="محاذاة لليسار">≡</button>
      <span class="float-sep"></span>
      <button type="button" id="float-footnote" title="إضافة تهميش">¹</button>
    `;
    document.body.appendChild(selectionToolbar);
    selectionToolbar.addEventListener('mousedown',e=>e.preventDefault());
    selectionToolbar.addEventListener('click',e=>{
      const b=e.target.closest('[data-float-cmd]');
      if(b){e.preventDefault();exec(b.dataset.floatCmd);positionSelectionToolbar();return;}
      if(e.target.closest('#float-footnote')){e.preventDefault();openFootnote();hideSelectionToolbar();}
      if(e.target.closest('#float-color')){e.preventDefault();$('#float-color-picker')?.click();}
    });
    const ff=selectionToolbar.querySelector('#float-font');
    if(ff)ff.addEventListener('change',e=>{applyTextStyle('fontName',e.target.value,e.target.value);positionSelectionToolbar()});
    const fs=selectionToolbar.querySelector('#float-size');
    if(fs)fs.addEventListener('change',e=>{const v=Math.max(8,Math.min(72,Number(e.target.value)||17));e.target.value=v;applyTextStyle('fontSize',v,Math.max(1,Math.min(7,Math.round(v/3))));positionSelectionToolbar()});
    const fc=selectionToolbar.querySelector('#float-color-picker');
    if(fc)fc.addEventListener('input',e=>{applyTextStyle('foreColor',e.target.value,e.target.value);positionSelectionToolbar()});
    return selectionToolbar;
  }
  function selectionInsideEditor(){
    const s=window.getSelection();
    if(!s||!s.rangeCount||s.isCollapsed)return false;
    const node=s.anchorNode?.nodeType===3?s.anchorNode.parentElement:s.anchorNode;
    return !!node?.closest?.('.page-content[contenteditable="true"]');
  }
  function positionSelectionToolbar(){
    const bar=ensureSelectionToolbar();
    const s=window.getSelection();
    if(!selectionInsideEditor()){hideSelectionToolbar();return;}
    rememberSelection();
    const range=s.getRangeAt(0);
    let rect=range.getBoundingClientRect();
    if((!rect.width&&!rect.height)&&s.anchorNode?.parentElement)rect=s.anchorNode.parentElement.getBoundingClientRect();
    const barRect=bar.getBoundingClientRect();
    const gap=8;
    let left=rect.left+rect.width/2-barRect.width/2;
    left=Math.max(8,Math.min(left,window.innerWidth-barRect.width-8));
    let top=rect.top-barRect.height-gap;
    if(top<8)top=rect.bottom+gap;
    bar.style.left=`${Math.round(left)}px`;
    bar.style.top=`${Math.round(top)}px`;
    bar.classList.add('is-visible');
  }
  function hideSelectionToolbar(){
    if(selectionToolbar)selectionToolbar.classList.remove('is-visible');
  }
  function scheduleSelectionToolbar(){
    clearTimeout(selectionHideTimer);
    selectionHideTimer=setTimeout(()=>{
      if(selectionInsideEditor())positionSelectionToolbar();else hideSelectionToolbar();
    },40);
  }
  function init(){
    syncStickyToolbarOffset();
    loadLibrary();
    render();
    ensureSelectionToolbar();
    refreshEditorLanguage();
    document.addEventListener('selectionchange',scheduleSelectionToolbar);
    window.addEventListener('scroll',()=>{if(selectionToolbar?.classList.contains('is-visible'))positionSelectionToolbar()},{passive:true});
    window.addEventListener('resize',()=>{if(selectionToolbar?.classList.contains('is-visible'))positionSelectionToolbar()},{passive:true});
    document.addEventListener('ra9mana:langchange',refreshEditorLanguage);

    const title=$('#project-title');
    if(title) title.oninput=()=>persist();

    $$('.editor-toolbar [data-cmd]').forEach(b=>b.onclick=e=>{e.preventDefault();exec(b.dataset.cmd);});
    const style=$('#block-style');
    if(style) style.onchange=e=>{rememberSelection();exec('formatBlock',e.target.value);};
    const font=$('#font-family');if(font)font.onchange=e=>applyTextStyle('fontName',e.target.value,e.target.value);
    const size=$('#font-size');if(size){size.onchange=e=>{const v=Math.max(8,Math.min(72,Number(e.target.value)||17));e.target.value=v;applyTextStyle('fontSize',v,Math.max(1,Math.min(7,Math.round(v/3))));};}
    const picker=$('#text-color-picker');if(picker)picker.oninput=e=>applyTextStyle('foreColor',e.target.value,e.target.value);
    $$('#color-palette [data-color]').forEach(b=>b.onclick=()=>{const c=b.dataset.color;if(picker)picker.value=c;applyTextStyle('foreColor',c,c)});

    const actions={
      'add-page':addPage,
      'add-footnote':openFootnote,
      'sidebar-footnote':openFootnote,
      'view-references':viewReferences,
      'page-border':pageBorderModal,
      'sidebar-references':viewReferences,
      'ask-ramon':ramon,
      'open-project':projectsModal,
      'export-project':exportProject,
      'import-project':importProject,
      'export-word':exportWord
    };
    Object.entries(actions).forEach(([id,fn])=>{
      const el=$('#'+id);
      if(el) el.onclick=e=>{e.preventDefault();fn();};
    });
    const printBtn=$('#print-document');
    if(printBtn) printBtn.onclick=e=>{e.preventDefault();printDocument();};

    const newBtn=$('#new-project');
    if(newBtn) newBtn.onclick=e=>{
      e.preventDefault();
      capture();
      project=createProject();
      currentPage=0;
      savedRange=null;
      render();
      persist();
    };

    const closeSidebar=$('#close-sidebar');
    if(closeSidebar) closeSidebar.onclick=()=>{
      $('.editor-sidebar')?.classList.toggle('is-collapsed');
    };

    const file=$('#project-file');
    if(file) file.onchange=e=>{
      const f=e.target.files?.[0];
      if(!f)return;
      const r=new FileReader();
      r.onload=()=>{
        try{
          const p=JSON.parse(r.result);
          if(!p || !Array.isArray(p.pages)) throw Error('invalid');
          p.pages=p.pages.map(pg=>({id:pg.id||uid('page'),html:String(pg.html||''),footnotes:Array.isArray(pg.footnotes)?pg.footnotes:[],isBibliography:pg.isBibliography===true,style:pg.style||{fontFamily:'Georgia',fontSize:17,color:'#1e293b',borderStyle:'none',borderWidth:1,borderColor:'#cbd5e1',borderInset:10,borderTextGap:2}}));p.usedReferences=Array.isArray(p.usedReferences)?p.usedReferences:[];
          p.id=p.id||uid('project');
          p.title=p.title||LANGS[lang()].new;
          p.version=1;
          p.updatedAt=new Date().toISOString();
          project=p;currentPage=0;savedRange=null;
          render();persist();toast('تم استيراد المشروع');
        }catch(err){toast('ملف مشروع غير صالح');}
      };
      r.readAsText(f);e.target.value='';
    };

    $$('[data-close-editor-modal]').forEach(b=>b.onclick=e=>{e.preventDefault();closeModal();});
    document.addEventListener('click',e=>{
      const close=e.target.closest('[data-close-editor-modal]');
      if(close){e.preventDefault();closeModal();return;}
      if(e.target.id==='editor-modal') closeModal();
    });
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){
        e.preventDefault();capture();toast('تم الحفظ');
      }
      if(e.key==='Escape' && $('#editor-modal')?.classList.contains('is-open')) closeModal();
    });
    window.addEventListener('beforeprint',capture);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.RA9MANA_EDITOR={getProject:()=>project};
})();
