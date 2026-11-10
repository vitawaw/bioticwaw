/* BIOTICWAW · js/lists.js
   Interactions tab (filters + search incl. Arabic drug names), sources tab, roadmap ('coming next') and contact links.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/* ===================== interactions & sources ===================== */
let RTF='all';
const tx2=o=>o?(LANG==='ar'?o.ar:(o.en||o.ar)):'';
const iTerms=q=>q?[q]:[]; // search words (normalised by normAr)
/* 1.4.6 (test): the interactions page is arranged like the calculator page: choose a drug from the list (1), its
   interactions appear below (2). Data: CFG.ab (published only). */
let ISEL=null;
function abPicker(){
  const tx=o=>o?(o[LANG]||o.en||o.ar||''):'';
  const A=(CFG.ab||[]).filter(a=>a&&a.n);
  const pk=$('ipicker');
  if(!A.length){pk.innerHTML='';$('ilist').innerHTML=`<p class="inone">${esc(T('ab_pub_none'))}</p>`;return}
  if(ISEL&&!A.some(a=>a.id===ISEL))ISEL=null;
  // the global search (openSearch) sets the hidden box: open the first drug that matches it
  const q=normAr($('isearch')&&$('isearch').value?$('isearch').value:'');
  if(!ISEL&&q){const m=A.find(a=>normAr([a.n.ar||'',a.n.en||''].join(' ')).includes(q));if(m)ISEL=m.id}
  pk.innerHTML=`<div class="f"><label class="l" for="intsel">${esc(T('s1'))}</label><select id="intsel"><option value="">${esc(T('ab_choose'))}</option>`+
    A.map(a=>`<option value="${esc(a.id)}"${a.id===ISEL?' selected':''}>${esc(tx(a.n))}</option>`).join('')+'</select></div>';
  $('intsel').onchange=e=>{ISEL=e.target.value||null;renderInter()};
  const cur=A.find(a=>a.id===ISEL);
  $('ilist').innerHTML=!cur?`<p class="inone">${esc(T('ab_pick_hint'))}</p>`
    :`<article class="abx-card"><h3>${esc(tx(cur.n))}</h3>`+((cur.inter||[]).length?cur.inter.map(x=>`<p class="abi"><b>${esc(tx(x.b))}</b>: ${esc(tx(x.d))} ${SRCS(x.r&&x.r.length?x.r:cur.r)}</p>`).join(''):`<p class="hint">${esc(T('ab_no_inter'))}</p>`)+'</article>';
}
function renderInter(){abPicker()}
const IC={
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
 plus:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
 pill:'<rect x="6" y="7" width="12" height="14" rx="2"/><path d="M7.5 3h9v4h-9zM12 11v6M9 14h6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
 cam:'<path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
 baby:'<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>'};
/** footer: the app logo and (when set) the company logo, side by side in circles; both open the company site if set */
function renderBrand(){
  const el=$('flogos');if(!el)return;const b=CFG.brand||{};
  const pic=(src,alt,fallback)=>src?`<img src="${esc(src)}" alt="${esc(alt)}">`:fallback;
  const circ=(x,cls)=>b.url?`<a class="fl ${cls}" href="${esc(b.url)}" target="_blank" rel="noopener" title="${esc(b.url)}">${x}</a>`:`<span class="fl ${cls}">${x}</span>`;
  el.innerHTML=circ(pic(b.l1,'BIOTICWAW',`<svg viewBox="0 0 64 64" aria-hidden="true">${MARKSVG}</svg>`),'c1')+(b.l2?circ(pic(b.l2,T('br_l2'),''),'c2'):'');
}
function renderContact(){
  renderBrand();
  if(!$('mail1'))return; // 1.2.0: the suggestion block lived on the removed «upcoming» page
  const E=CFG.contact.email,P=(CFG.contact.phone||'').trim();
  const subj='BIOTICWAW – '+L('اقتراح','Suggestion');
  $('mail1').textContent=E;$('mailrow').hidden=!E;$('mailh').hidden=!E;
  $('mailgo').href=E?mailto(subj):'';
  $('vno').textContent=T('vno')+' '+APP_VERSION;
  $('phonerow').hidden=!P;$('phone1').textContent=P;
  $('wago').href=waLink(subj);$('callgo').href='tel:'+P.replace(/[^+\d]/g,'');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copymail]');if(!b)return;
  const done=()=>{b.textContent=T('cpd');setTimeout(()=>b.textContent=T('cpm'),1600)};
  try{navigator.clipboard.writeText(EMAILF()).then(done).catch(()=>fallback(EMAILF(),done))}catch(err){fallback(EMAILF(),done)}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-copyphone]');if(!b)return;const P=CFG.contact.phone;
  const done=()=>{b.textContent=T('cpd');setTimeout(()=>b.textContent=T('cpp'),1600)};
  try{navigator.clipboard.writeText(P).then(done).catch(()=>fallback(P,done))}catch(err){fallback(P,done)}});
/** «جرّبه» on a feature that is available now: where each feature lives */
const GO={calc:()=>go('calc'),interactions:()=>go('interactions'),abx:()=>go('abx'),sources:()=>go('sources'),search:()=>openSearch()};
const GOLIST=()=>[['',T('rm_go_none')],['calc',T('tab_calc')],['interactions',T('tab_int')],['abx',T('med_t')],['sources',T('tab_src')],['search',T('gs_t')]];
 // roadmap filter: all | now | dev | plan | idea
/* Source type from the organisation name, used to order the list (strongest first) and label it. */
const REFTYPES=[[/Society|NICE|Academy of Pediatrics|WHO|World Health/i,'g'],[/NIH|National Institutes|BNF|National Formulary|Specialist Pharmacy/i,'o'],
  [/SmPC|label|Medsafe|data sheet|Food and Drug|FDA/i,'d'],[/Cochrane|Lancet|BMJ|Journal|J Clin/i,'s'],[/Medscape|StatPearls|MSD|Manual/i,'c']];
const RTORD={g:0,o:1,d:2,s:3,c:4,x:5};
const refType=org=>{for(const[re,t]of REFTYPES)if(re.test(org||''))return t;return 'x'};
/** the type chosen in the source dialog, or guessed from the organisation */
const rtOf=x=>RTORD[x[7]]!=null?x[7]:refType(x[0]);
/** under each source: the antibiotics that cite it, and when it was last reviewed (approved) */
function usedIn(n,x){
  const tx=o=>o?(o[LANG]||o.en||o.ar||''):'';
  const ab=(CFG.ab||[]).filter(a=>a&&a.n&&((a.r||[]).includes(n)||(a.inter||[]).some(i=>(i.r||[]).includes(n))));
  const at=/^\d{4}-\d{2}/.test(x[8]||'')?x[8].slice(0,7):'';
  if(!ab.length&&!at)return '';
  return `<div class="used">${ab.length?`<span>${T('su_in')}</span>`:''}${ab.map(a=>`<button type="button" data-goabx="${esc(a.id)}">${esc(tx(a.n))}</button>`).join('')}${at?`<small>${T('su_at')} <bdi>${at}</bdi></small>`:''}</div>`;
}
function renderRefs(){
  // one full list, filtered by source type and search
  const onLk=$('reflist').parentNode.id==='linksb'&&typeof lkShow==='function',lk=onLk?lkShow():null; // 1.14.6: the link filter only on its own page
  const sq=iTerms(normAr($('ssearch')&&$('ssearch').value)),sm=([n,x])=>!sq.length||sq.some(q=>normAr([n,x[0],x[1],x[3],x[4]].join(' ')).includes(q));
  const base=Object.entries(REFS).filter(sm),inT=(x,k)=>k==='all'||rtOf(x)===k;
  const tc=k=>base.filter(([n,x])=>inT(x,k)).length;
  const tks=['all',...Object.keys(RTORD).filter(k=>Object.values(REFS).some(x=>rtOf(x)===k))];
  if(!tks.includes(RTF))RTF='all';
  $('rtfilters').innerHTML=tks.map(k=>`<button type="button" data-rtf="${k}" aria-pressed="${k===RTF}">${esc(T(k==='all'?'all':'rtp_'+k))}<bdi class="fc">${tc(k)}</bdi></button>`).join('');
  $('refbulk').innerHTML=SHOWALL()?bulkBar('r',(CFG.refs||[]).filter(x=>x.rv===false).length):'';
  $('reflist').innerHTML=base.sort((a,b)=>RTORD[rtOf(a[1])]-RTORD[rtOf(b[1])]||a[0]-b[0]).filter(([n,x])=>lk?lk.includes(+n):inT(x,RTF)).map(([n,x])=>
    `<li id="ref-${n}"${x[6]?' class="hid"':''}><span class="num">${n}</span><div><div class="org"><span class="rtype rt-${rtOf(x)}">${T('rt_'+rtOf(x))}</span>${esc(x[0])}${(LANG==='ar'?x[3]:x[4])?' · '+esc(LANG==='ar'?x[3]:x[4]):''}</div><div class="ttl" dir="auto">${/^https?:\/\//.test(x[2]||'')?`<a href="${esc(x[2])}" target="_blank" rel="noopener">${esc(x[1])}</a>`:esc(x[1])}</div>${onLk?lkBadge(+n,x):''}${stampHTML(x[9],x[10])}${usedIn(+n,x)}${actBar('r',n,{rv:x[5]!==false,hidden:x[6]})}</div></li>`).join('');
  $('rcount').textContent=Object.keys(REFS).length;
  if(typeof renderLinks==='function')renderLinks();
  $('rev2').hidden=!REV().name;if(REV().name)$('rev2').innerHTML=reviewHTML0().replace(/^<div class="reviewed">|<\/div>$/g,'');
}

/* tap a card (interaction, source, coming next): the whole card in a floating window */
document.addEventListener('click',e=>{
  if(e.target.closest('button,a,input,select,label,summary,.drag'))return;
  const c=e.target.closest('#ilist .icard,#reflist>li,#rmgrid .rm');if(!c||c.closest('#sheet'))return;
  const t=c.matches('.icard')?c.querySelector('.who').textContent:c.matches('.rm')?c.querySelector('h3').textContent:(c.querySelector('.org')||c).textContent;
  openSheet(t.trim(),`<div class="cardfull ${c.className}">${c.innerHTML}</div>`,{key:'card'});
});
// a button or link inside an opened card does its job and the window closes (e.g. «used in» → the calculator)
document.addEventListener('click',e=>{if(e.target.closest('#sheet-b .cardfull')&&e.target.closest('button,a'))setTimeout(()=>{if(SHEET&&SHEET.key==='card')closeSheet(false)},0)});


/* 1.21 (test): the antibiotics page: approved antibiotics from the published settings (CFG.ab) */
function renderAbx(){
  const el=$('abxlist'); if(!el)return;
  const A=(CFG.ab||[]).filter(a=>a&&a.n);
  if(!A.length){el.innerHTML=`<p class="inone">${esc(T('abx_none'))}</p>`;return}
  const tx=o=>o?(o[LANG]||o.en||o.ar||''):'';
  el.innerHTML=A.map(a=>{
    const row=(k,v)=>v?`<p><b>${esc(T(k))}:</b> ${esc(v)} ${SRCS(a.r)}</p>`:'';
    const inter=(a.inter||[]).map(x=>`<li><b>${esc(tx(x.b))}</b>: ${esc(tx(x.d))} ${SRCS(x.r&&x.r.length?x.r:a.r)}</li>`).join('');
    return `<article class="abxcard"><h3>${esc(tx(a.n))}</h3>`+
      (a.aware?`<p class="hint">${esc(T('abx_aware'))}: ${esc(a.aware)}</p>`:'')+
      row('abx_uses',tx(a.uses))+row('abx_dose',tx(a.dose))+row('abx_renal',tx(a.renal))+row('abx_timing',tx(a.timing))+
      (inter?`<p><b>${esc(T('abx_inter'))}:</b></p><ul>${inter}</ul>`:'')+
      '</article>';
  }).join('');
}

/* 1.1 (test): the owner's editor for antibiotics (on the calculator page, above the list). Every write goes through
   database functions that check the owner role themselves (antibiotic_save, antibiotic_set_flag). */
async function renderAbAdmin(){
  const el=$('abxadm'); if(!el)return;
  if(typeof OWN==='undefined'||!OWN.on||OWN.preview||!OWN.client){el.innerHTML='';window.ABPEND=[];return}
  el.innerHTML=`<p class="hint">${esc(T('ab_loading'))}</p>`;
  const {data,error}=await OWN.client.rpc('antibiotics_all');
  if(error||!Array.isArray(data)){el.innerHTML=`<p class="hint">${esc(T('o_neterr'))}</p>`;return}
  window.ABLIST=data;
  window.ABPEND=data.filter(a=>!a.reviewed&&!a.deleted);
  if(typeof renderNotifPending==='function')renderNotifPending();
  el.innerHTML=`<button class="oadd otop" type="button" data-abadd="1"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg><span>${esc(T('ab_addbtn'))}</span></button>`+
    (data.length&&EDITING()?'<div class="olist abolist">'+data.map(a=>`<div class="orow abrow${a.hidden?' off':''}"><span class="nvn">${esc((a.n&&(a.n[LANG]||a.n.en))||a.id)}${a.reviewed?'':` · <small class="pend">${esc(T('o_pending'))}</small>`}${a.hidden?` · <small>${esc(T('o_hiddenb'))}</small>`:''}</span>`+
      `<button type="button" class="btn" data-abedit="${esc(a.id)}">${esc(T('ab_edit'))}</button> `+
      `<button type="button" class="btn" data-abhide="${esc(a.id)}" data-v="${a.hidden?'0':'1'}">${esc(T(a.hidden?'ab_hidden_off':'ab_hidden_on'))}</button></div>`).join('')+'</div>':(data.length?`<p class="hint">${esc(T('ab_edit_hint'))}</p>`:''));
}
async function abEdit(id){
  const o=id?(window.ABLIST||[]).find(x=>x.id===id):null,isNew=!o;
  if(!isNew&&!o)return;
  const g=(k,l)=>o&&o[k]?(o[k][l]||''):'';
  const fields=[
    {label:T('ab_id'),value:isNew?'':o.id,ltr:1,type:'text'},
    {label:T('ab_name_ar'),value:isNew?'':g('n','ar')},{label:T('ab_name_en'),value:isNew?'':g('n','en'),ltr:1},
    {label:T('ab_aware'),type:'select',options:[['',T('ab_aw_none')],['access','Access'],['watch','Watch'],['reserve','Reserve']],value:isNew?'':(o.aware||'')},
    {label:T('ab_cls_ar'),value:isNew?'':g('cls','ar')},{label:T('ab_cls_en'),value:isNew?'':g('cls','en'),ltr:1},
    {label:T('ab_uses_ar'),type:'textarea',value:isNew?'':g('uses','ar')},{label:T('ab_uses_en'),type:'textarea',value:isNew?'':g('uses','en'),ltr:1},
    {label:T('ab_dose_ar'),type:'textarea',value:isNew?'':g('dose','ar')},{label:T('ab_dose_en'),type:'textarea',value:isNew?'':g('dose','en'),ltr:1},
    {label:T('ab_renal_ar'),type:'textarea',value:isNew?'':g('renal','ar')},{label:T('ab_renal_en'),type:'textarea',value:isNew?'':g('renal','en'),ltr:1},
    {label:T('ab_timing_ar'),type:'textarea',value:isNew?'':g('timing','ar')},{label:T('ab_timing_en'),type:'textarea',value:isNew?'':g('timing','en'),ltr:1},
    {label:T('ab_src'),value:isNew?'':(o.r||[]).join(', '),ltr:1},
  ];
  let err=null;
  while(true){
    const r=await dialog({err,title:T(isNew?'ab_add':'ab_edit'),fields,buttons:[{label:T('ab_savebtn'),pri:true,action:'ok'},{label:T('o_cancel'),action:'cancel'}]});
    if(r.action!=='ok')return;
    const v=r.values.map(x=>(x||'').trim());
    const newId=isNew?v[0].toLowerCase():o.id;
    if(!newId||!/^[a-z0-9_]{1,24}$/.test(newId)||!v[1]){err={i:!/^[a-z0-9_]{1,24}$/.test(newId)?0:1,msg:T('ab_need')};continue}
    const src=v[14].split(/[,،\s]+/).filter(Boolean).map(Number);
    if(src.some(n=>!Number.isInteger(n)||n<1)){err={i:14,msg:T('ab_need')};continue}
    const p={id:newId,n:{ar:v[1],en:v[2]},aware:v[3],cls:{ar:v[4],en:v[5]},uses:{ar:v[6],en:v[7]},dose:{ar:v[8],en:v[9]},
      renal:{ar:v[10],en:v[11]},timing:{ar:v[12],en:v[13]},r:src,hidden:!!(o&&o.hidden)};
    const {error:e2}=await OWN.client.rpc('antibiotic_save',{p});
    if(e2){toast(T('o_neterr'));return}
    toast(T('ab_saved'));await renderAbAdmin();return;
  }
}
document.addEventListener('click',async e=>{
  const add=e.target.closest('[data-abadd]'),ed=e.target.closest('[data-abedit]'),hd=e.target.closest('[data-abhide]');
  if(add){e.preventDefault();abEdit(null);return}
  if(ed){e.preventDefault();abEdit(ed.dataset.abedit);return}
  if(hd&&OWN&&OWN.client){e.preventDefault();const {error}=await OWN.client.rpc('antibiotic_set_flag',{p_id:hd.dataset.abhide,p_hidden:hd.dataset.v==='1'});
    if(error){toast(T('o_neterr'));return}await renderAbAdmin()}
});

/* 1.3.0: «القادم»: the upcoming items from the settings, as plain cards (no editing here) */
function renderRoadmap(){
  const el=$('rmlist'); if(!el)return;
  const lab={now:T('up_now'),dev:T('up_dev'),plan:T('up_plan'),idea:T('up_idea')};
  const items=(CFG.roadmap||[]).filter(x=>x&&x.t&&!x.hidden);
  el.innerHTML=items.length?items.map(x=>`<article class="abxcard"><h3>${esc(tx2(x.t))}</h3>`+(lab[x.st]?`<p class="hint">${esc(lab[x.st])}</p>`:'')+(x.d?`<p>${esc(tx2(x.d))}</p>`:'')+'</article>').join(''):`<p class="inone">${esc(T('rm_go_none'))}</p>`;
}

/* 1.3.3 (test): antibiotics saved but not approved: listed in the owner's notifications, with an approve button */
function abPendHTML(){
  const P=window.ABPEND||[];
  if(!P.length)return '';
  return `<h3 class="nsec">${esc(T('abx_pend_t'))} (${P.length})</h3><p class="hint">${esc(T('abx_pend_h'))}</p>`+
    (P.length>1?`<div class="filters"><button type="button" class="btn pri" data-aball="1">${esc(T('abx_all_btn').replace('{n}',P.length))}</button></div>`:'')+
    P.map(a=>`<div class="ncard unread"><div class="nb"><div class="nh"><b>${esc((a.n&&(a.n[LANG]||a.n.en))||a.id)}</b></div>`+
      `<div class="filters"><button type="button" class="btn pri" data-abok="${esc(a.id)}">${esc(T('abx_ok_btn'))}</button></div></div></div>`).join('');
}
function renderNotifPending(){const b=$('notif-b');if(!b)return;const old=b.querySelector('.abpend');if(old)old.remove();const h=abPendHTML();if(h){b.insertAdjacentHTML('afterbegin',`<div class="abpend">${h}</div>`)}}
/* «اعتماد الكل»: the owner approves every waiting antibiotic (and its interactions) after reviewing them; one at a time in the database */
document.addEventListener('click',async e=>{
  const all=e.target.closest('[data-aball]');if(!all||!OWN||!OWN.client||!ISOWNER())return;
  e.preventDefault();const P=(window.ABPEND||[]).slice();if(!P.length)return;
  const q=await dialog({title:T('abx_all_btn').replace('{n}',P.length),info:T('abx_all_q'),buttons:[{label:T('o_cancel'),action:'cancel'},{label:T('abx_ok_btn'),action:'ok',pri:1}]});
  if(q.action!=='ok')return;
  let done=0;all.disabled=true;
  for(const a of P){const {error}=await OWN.client.rpc('antibiotic_approve',{p_id:a.id});if(error){toast(T('o_neterr'));break}done++;all.textContent=done+' / '+P.length}
  toast(T('abx_all_done').replace('{n}',done));await renderAbAdmin();
});
document.addEventListener('click',async e=>{
  const ok=e.target.closest('[data-abok]');if(!ok||!OWN||!OWN.client)return;
  e.preventDefault();const {error}=await OWN.client.rpc('antibiotic_approve',{p_id:ok.dataset.abok});
  if(error){toast(T('o_neterr'));return}
  toast(T('ab_saved'));await renderAbAdmin();
});
