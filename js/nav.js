/* BIOTICWAW · js/nav.js
   The menus, like Facebook. Same contents for visitors, pharmacists and the owner:
   - Phones and tablets: tab bar at the bottom (four sections + ☰ «Menu»); «Menu» is a full page:
     account card, management (team, by permission), shortcut tiles, settings, log out.
   - Wide screens (≥1024px): the same menu is a fixed side menu, with the sections at its top.
   - Floating window (sheet) in the middle of the screen: tools, information pages, pharmacists.
   To add a menu entry, add it in menuHTML() (or a group in adminGroups() for the team).
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */

/* ===================== helpers ===================== */
const ICO={
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
  history:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h13"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
  page:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.8 3.5 6"/></svg>',
  site:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/></svg>'
};
const tabIco=p=>{const s=(p==='meds'||p==='links')&&$(p)?$(p).querySelector('.hi svg'):$('t-'+p)&&$('t-'+p).querySelector('svg');return s?s.outerHTML:ICO.info};
/** true when the signed-in account may edit this part: 'nut' | 'inter' | 'refs' | 'text' */
const CAN=k=>typeof OWN!=='undefined'&&OWN.on&&(OWN.local||OWN.role==='owner'||(k!=='text'&&!!(OWN.perms&&OWN.perms[k]))); // texts and pages: owner only
const ISOWNER=()=>typeof OWN!=='undefined'&&OWN.on&&(OWN.local||OWN.role==='owner');
const colorVars=p=>CFG.colors[p]?`--pc:${CFG.colors[p][0]};--pc2:${CFG.colors[p][1]}`:'';
/** page text → HTML. 1.16.0 simple formatting from the page editor's buttons: a line «## …» = heading, «- …» = list item,
   **…** = bold. Everything is escaped first, so a page can never carry HTML. */
const mdB=s=>s.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');
const paras=t=>String(t||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(blk=>{
  let h='',ul=[],p=[];const flushP=()=>{if(p.length){h+=`<p>${p.join('<br>')}</p>`;p=[]}},flushU=()=>{if(ul.length){h+=`<ul>${ul.map(x=>`<li>${x}</li>`).join('')}</ul>`;ul=[]}};
  blk.split('\n').forEach(line=>{const e=mdB(esc(line.trim()));
    if(/^##\s+/.test(line.trim())){flushP();flushU();h+=`<h3>${e.replace(/^##\s+/,'')}</h3>`}
    else if(/^[-•]\s+/.test(line.trim())){flushP();ul.push(e.replace(/^[-•]\s+/,''))}
    else{flushU();p.push(e)}});
  flushP();flushU();return h}).reduce((o,h)=>{ // 1.16.1: every «## heading» starts a card (.pgc) holding what follows it
    if(h.startsWith('<h3>')){o.push({c:1,h});}else if(o.length&&o[o.length-1].c){o[o.length-1].h+=h}else o.push({c:0,h});return o},[]).map(x=>x.c?`<section class="pgc">${x.h}</section>`:x.h).join('');
/** «suggest a feature or report an error» is a page like the others (editable); until the owner edits it, it uses the default texts */
const SUGGEST=()=>{const t=k=>(CFG.text&&CFG.text[k])||{ar:I18N[k][0],en:I18N[k][1]};return {id:'suggest',t:t('sg_t'),b:t('sg_l'),hidden:false}};
/** «How to use and FAQ» (one old page) is shown as two pages to everyone until the owner saves the split (owner.js splitHowto) */
function splitPages(P){
  if(P.some(p=>p.id==='howto'))return null;
  const f=P.find(p=>p.id==='faq');if(!f||!/طريقة الاستخدام/.test((f.t&&f.t.ar)||''))return null;
  const cut=(x,head)=>{const b=String(x||'').split(/\n\s*\n/);return [b[0].replace(head,'').trim(),b.slice(1).join('\n\n').trim()]};
  const [ha,fa]=cut(f.b.ar,/^طريقة الاستخدام\s*\n?/),[he,fe]=cut(f.b.en,/^How to use\s*\n?/i),i=P.indexOf(f);
  return [...P.slice(0,i),{id:'howto',t:{ar:'طريقة الاستخدام',en:'How to use'},b:{ar:ha,en:he},hidden:!!f.hidden},{...f,t:{ar:'الأسئلة الشائعة',en:'Frequently asked questions'},b:{ar:fa,en:fe}},...P.slice(i+1)];
}
const allPages=()=>{let P=CFG.pages||[];P=splitPages(P)||P;return P.some(p=>p.id==='suggest')?P:[...P,SUGGEST()]};
const visiblePages=(all=SHOWALL())=>allPages().filter(p=>all||!p.hidden);

/* Every menu button stores its action here; data-na="d3" = side menu action 3, "m" = Menu page, "s" = floating window, "n" = notifications. */
const ACT={d:[],m:[],s:[],n:[],t:[]};
function chipH(r,c){
  if(c.href)return `<a class="chip${c.cls?' '+c.cls:''}" href="${esc(c.href)}"${/^https?:/.test(c.href)?' target="_blank" rel="noopener"':''}>${esc(c.label)}</a>`;
  const i=ACT[r].push(c.f)-1;
  return `<button type="button" class="${c.cls||''}" data-na="${r}${i}"${c.pressed!=null?` aria-pressed="${!!c.pressed}"`:''}>${esc(c.label)}${c.n?` <span class="cn">${c.n}</span>`:''}</button>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-na]');if(!b)return;
  const f=ACT[b.dataset.na[0]][+b.dataset.na.slice(1)];if(f){e.preventDefault();f(b)}
});

/* ===================== tab bar + menu (like Facebook) ===================== */
// Phones and tablets: the tab bar at the bottom holds the four sections and ☰ «Menu», which opens a full page
// (account card, shortcuts, settings, log out). Wide screens (≥1024px): the same menu is a fixed side menu.
const WIDE=()=>matchMedia('(min-width:1024px)').matches;
const SECTIONS=['calc','interactions','sources','abx','roadmap']; // the five sections: order, bottom bar, hide and names are set by the owner
const SECKEY0={calc:'tab_calc',interactions:'tab_int',sources:'tab_src',abx:'med_t',roadmap:'up_t',notif:'nt_t',links:'lk_t'};
const SECKEY=SECKEY0;
/* ===================== main sections (owner, 1.12.0): order everywhere, the bar (≤4), hidden ones, names, colors =====================
   CFG.menus = {order, bar, hide}. The calculator cannot be hidden; 🔔 and ☰ are always there. */
const HEROKEY={calc:['hc_t','hc_l'],interactions:['ti_t','hi_l'],sources:['ts_t','hs_l'],abx:['abx_h']};
function NAV(){
  const n=CFG.menus||{},ok=x=>SECTIONS.includes(x);
  const order=[...new Set([...(n.order||[]).filter(ok),...SECTIONS])];
  const hide=[...new Set((n.hide||[]).filter(x=>ok(x)&&x!=='calc'))];
  let bar=order.filter(x=>(n.bar||[]).includes(x)&&!hide.includes(x)).slice(0,4);if(!bar.length)bar=['calc'];
  return {order,bar,hide};
}
const navHidden=p=>NAV().hide.includes(p);
function renderTabs(){
  const n=NAV();
  n.order.forEach((p,i)=>{const t=$('t-'+p);if(!t)return;t.style.order=i;t.classList.toggle('offbar',!n.bar.includes(p));t.hidden=n.hide.includes(p)&&!SHOWALL()});
  $('t-notif').style.order=98;$('t-menu').style.order=99;
}
function navSave(n){CFG.menus={...(CFG.menus||{}),order:n.order,bar:n.bar,hide:n.hide};changed();drawNavManager()}
function openNavManager(){if(!ISOWNER())return;openSheet(T('nv_order'),'',{key:'navmgr'});drawNavManager()}
function drawNavManager(){
  if(!SHEET||SHEET.key!=='navmgr')return;
  const n=NAV();ACT.s=[];const S=c=>chipH('s',c);
  $('sheet-b').innerHTML=`<p class="hint">${T('nv_hint')}</p><div class="olist" id="nv-order">${n.order.map(p=>{const inBar=n.bar.includes(p),hid=n.hide.includes(p);
    return `<div class="orow nvrow${hid?' off':''}" data-sid="${p}">${DRAG(T('o_drag'))}<span class="di" style="${colorVars(p)}">${tabIco(p)}</span><span class="nvn">${esc(T(SECKEY[p]))}${hid?` · ${T('pg_hidden')}`:''}${inBar?`<small>${T('nv_inbar')}</small>`:''}</span>
      <div class="filters">${S({label:T('nv_bar'),pressed:inBar,f:()=>{
        if(inBar){if(n.bar.length<2){toast(T('nv_min'));return}n.bar=n.bar.filter(x=>x!==p)}
        else{if(hid){toast(T('nv_hidbar'));return}if(n.bar.length>=4){toast(T('nv_max'));return}n.bar=[...n.bar,p]}navSave(n)}})}${
      p==='calc'?'':S({label:T(hid?'o_nshow':'o_nhide'),f:()=>{n.hide=hid?n.hide.filter(x=>x!==p):[...n.hide,p];if(!hid)n.bar=n.bar.filter(x=>x!==p);navSave(n)}})}${
      S({label:T('o_edit'),f:()=>editNavText(p)})}${S({label:T('ad_colors'),f:async()=>{closeSheet(false);await editColors(p);openNavManager()}})}</div></div>`}).join('')}</div>
    <div class="filters">${S({label:T('o_reset'),f:()=>{CFG.menus=clone(DEFAULT_CFG.menus);changed();drawNavManager()}})}</div>`;
  sortable($('nv-order'),'.orow',ids=>{n.order=ids;navSave(n)});
}
/** a section's name in the menus, and its title and description at the top of its page */
async function editNavText(p){
  closeSheet(false);
  const keys=[SECKEY[p],...(HEROKEY[p]||[])],cur=k=>CFG.text[k]||{ar:I18N[k][0],en:I18N[k][1]};
  const labels=[['nv_name','nv_name_en'],['o_ftitle','o_ftitle_en'],['o_fdesc','o_fdesc_en']];
  const fields=keys.flatMap((k,i)=>[{label:T(labels[i][0]),value:cur(k).ar,type:i===2?'textarea':'text'},{label:T(labels[i][1]),value:cur(k).en,ltr:1,type:i===2?'textarea':'text'}]);
  const r=await dialog({title:T(SECKEY[p]),fields,buttons:[{label:T('o_reset'),action:'reset'},{label:T('o_cancel'),action:'cancel'},{label:T('o_ok'),action:'ok',pri:1}]});
  if(r.action==='ok')keys.forEach((k,i)=>{const d=I18N[k],ar=r.values[2*i].trim()||d[0],en=r.values[2*i+1].trim()||d[1];if(ar===d[0]&&en===d[1])delete CFG.text[k];else CFG.text[k]={ar,en}});
  if(r.action==='reset')keys.forEach(k=>delete CFG.text[k]);
  if(r.action!=='cancel')changed();
  openNavManager();
}
/* «your shortcuts»: the last pages and tools this visitor opened (this device only) */
let RECENT=[];try{RECENT=JSON.parse(localStorage.getItem('vw-recent')||'[]').filter(x=>typeof x==='string').slice(0,8)}catch(e){}
function rememberRecent(k){if(k==='p:menu'||k==='p:notif')return;RECENT=[k,...RECENT.filter(x=>x!==k)].slice(0,8);try{localStorage.setItem('vw-recent',JSON.stringify(RECENT))}catch(e){}if(k[0]==='t')renderMenu()}
/* computers: ☰ shows or hides the side menu (remembered on this device) */
function toggleSide(on){
  on=on==null?document.body.classList.contains('noside'):on;
  document.body.classList.toggle('noside',!on);$('t-menu').setAttribute('aria-selected',on);
  try{localStorage.setItem('vw-side',on?'1':'0')}catch(e){}
}
try{if(localStorage.getItem('vw-side')==='0')document.body.classList.add('noside')}catch(e){}
/** labels and the 🔔 count; redraws the menu page and the side menu */
function renderNav(){
  if(!$('side'))return;
  renderTabs();
  document.querySelectorAll('#sheet-x').forEach(x=>x.setAttribute('aria-label',L('إغلاق','Close')));
  const nc=notifCount();['nt-count','hnt-count'].forEach(id=>{$(id).hidden=!nc;$(id).textContent=nc>99?'99+':nc});
  $('hnotif').setAttribute('aria-label',T('nt_t'));$('hnotif').classList.toggle('on',!!(SHEET&&SHEET.key==='notif'));
  document.body.classList.toggle('team',typeof OWN!=='undefined'&&OWN.on);
  if(SHEET&&SHEET.key==='notif')renderNotif();
  $('hsearch').setAttribute('aria-label',T('gs_t'));
  document.querySelectorAll('.tab[data-p]').forEach(t=>{const lb=t.querySelector('.full,[data-t]');if(lb)t.title=lb.textContent}); // computers show icons only: the name appears on hover
  if(WIDE())$('t-menu').setAttribute('aria-selected',!document.body.classList.contains('noside'));
  renderMenu();
}
// older names (owner bar «awaiting review ›», tests)
/** 🔔 opens in a floating window over the page you are on */
function openNotif(){if(SHEET&&SHEET.key==='notif')return;if(typeof renderAbAdmin==='function')renderAbAdmin();openSheet(T('nt_t'),$('notifbox'),{key:'notif',onClose:()=>renderNav()});renderNotif(true);renderNav()}

let INSTALL=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();INSTALL=e});
function installApp(){
  if(INSTALL){INSTALL.prompt();INSTALL.userChoice.finally(()=>{INSTALL=null});return}
  openSheet(T('inst_t'),`<div class="prose">${paras(T('inst_b'))}</div>`);
}
const whoLabel=()=>T(OWN.local?'o_local':OWN.role==='owner'?'o_owner':'o_editor')+(OWN.name?' · '+OWN.name:'');
const MGNAME={recent:'mn_recent',short:'mn_short',help:'mg_help',admin:'nv_admin',contact:'ma_contact',settings:'mr_settings'}; // «apps» (install · share · clear my data) has no title until the owner gives one
const MGCFG=()=>(CFG.menus&&CFG.menus.groups)||{};
const mgName=id=>{const n=(MGCFG().names||{})[id];return n&&(n.ar||n.en)?tx2(n):(MGNAME[id]?T(MGNAME[id]):'')};
/* 1.14.6: the owner hides groups ('g:<id>') or single items (their key) from visitors; the team still sees them, marked hidden */
const mgOff=k=>((MGCFG().off)||[]).includes(k);
function mgToggle(k){mgSet(g=>{const o=new Set(g.off||[]);o.has(k)?o.delete(k):o.add(k);g.off=[...o]})}
// 1.16.0: the owner always sees ⋮⋮ and ✎ on the menu's groups and items (no separate «edit» mode)
const MEDIT=()=>ISOWNER()&&EDITING(); // 1.16.0: only after «تعديل وترتيب»
function mgSet(f){const g=JSON.parse(JSON.stringify(MGCFG()));f(g);CFG.menus={...(CFG.menus||{}),groups:g};changed();renderMenu()}
/** 1.16.0 ✎ on a menu group or item (owner): its name in Arabic and English and hide/show for visitors, in one floating window.
   An information page opens its own editor (title, text, hide, delete). */
const MGTEXT={log:'lg_t','ad-look':'ad_look','ad-contact':'ad_contact','ad-team':'ad_team','ad-pub':'ad_pub',share:'mr_share',clear:'cd_t',lang:'mr_lang',theme:'mr_theme',install:'mr_install',wa:'mr_wa',mail:'mr_mail',call:'mr_call',links:'lk_t'};
async function mgEdit(key){
  if(!ISOWNER())return;
  if(key.startsWith('g:'))return mgGroupEdit(key.slice(2));
  if(key.startsWith('pg-'))return editPage(key.slice(3));
  const tk=key.startsWith('p-')?SECKEY[key.slice(2)]:MGTEXT[key];if(!tk||!I18N[tk])return;
  const d=I18N[tk],c=CFG.text[tk]||{ar:d[0],en:d[1]},off=mgOff(key),adm=key.startsWith('ad-'); // management is never shown to visitors: no hide
  const r=await dialog({title:T(tk),fields:[{label:T('nv_name'),value:c.ar},{label:T('nv_name_en'),value:c.en||'',ltr:1}],buttons:EDB({hidden:off,hide:!adm,del:false,reset:true})});
  if(r.action==='hide')return mgToggle(key);
  if(r.action==='reset'){delete CFG.text[tk];changed();renderNav();return}
  if(r.action!=='ok')return;
  const ar=r.values[0].trim()||d[0],en=r.values[1].trim()||d[1];if(ar===d[0]&&en===d[1])delete CFG.text[tk];else CFG.text[tk]={ar,en};changed();renderNav();
}
async function mgGroupEdit(id){
  const cur=(MGCFG().names||{})[id]||{},d=MGNAME[id]?I18N[MGNAME[id]]:['',''],off=mgOff('g:'+id);
  const r=await dialog({title:mgName(id)||T('mg_noname'),fields:[{label:T('nv_name'),value:cur.ar||d[0]},{label:T('nv_name_en'),value:cur.en||d[1],ltr:1}],buttons:EDB({hidden:off,hide:id!=='admin',del:false,reset:true})});
  if(r.action==='hide')return mgToggle('g:'+id);
  if(r.action==='cancel')return;
  mgSet(g=>{g.names=g.names||{};const ar=r.action==='ok'?r.values[0].trim():'',en=r.action==='ok'?r.values[1].trim():'';
    if(!ar&&!en||(ar===d[0]&&en===d[1]))delete g.names[id];else g.names[id]={ar:ar||en,en:en||ar}});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-mged]');if(!b)return;e.preventDefault();e.stopPropagation();mgEdit(b.dataset.mged)});
/** after drawing: groups and their items can be dragged */
function mgSortable(){
  if(!MEDIT())return;
  document.querySelectorAll('.mgs').forEach(box=>{
    sortable(box,'.mg[data-sid]',ids=>mgSet(g=>{g.order=ids}),'.gdrag');
    box.querySelectorAll('.mgl').forEach(l=>sortable(l,'.medit',ids=>mgSet(g=>{g.items=g.items||{};g.items[l.dataset.g]=ids}),'.idrag'));
  });
}
/** The menu: on the «Menu» page (r='m', Facebook style: account card, shortcut tiles, lists) and in the side menu (r='d', lists). */
function menuHTML(r){
  // the sections in the owner's order (hidden ones only for the team), the owner's tools, the information pages, sign in / out
  const own=typeof OWN!=='undefined'&&OWN.on,owner=own&&ISOWNER()&&!OWN.preview,n=NAV();
  const item=(label,f,ico)=>`<button type="button" class="mi" data-na="${r}${ACT[r].push(f)-1}">${ico?`<span class="di">${ico}</span>`:''}<span class="mt">${esc(label)}</span></button>`;
  const secs=n.order.filter(p=>!n.hide.includes(p)||SHOWALL()).map(p=>item(T(SECKEY[p])+(n.hide.includes(p)?' · '+T('pg_hidden'):''),()=>go(p),tabIco(p))).join('');
  const admin=owner?`<h3 class="nsec">${esc(T('mg_admin'))}</h3><div class="mlist">`+[
    item(T('nv_order'),()=>openNavManager(),ICO.menu),
    item(T('mg_texts'),()=>{if(!document.body.classList.contains('textedit'))$('o-texts').click();go('calc')},ICO.page),
    item(T('tx_all'),()=>openTexts(),ICO.page),
    item(T('br_t'),()=>editBrand(),ICO.image),
    item(T('lk_win'),()=>editLook(),ICO.site),
    item(T('lg_t'),()=>openLog(),ICO.history)].join('')+'</div>':(own?`<div class="mlist">${item(T('lg_t'),()=>openLog(),ICO.history)}</div>`:'');
  const pages=visiblePages().filter(p=>p.id!=='suggest');
  const info=pages.length?`<h3 class="nsec">${esc(T('nv_info'))}</h3><div class="mlist">`+pages.map(p=>item(tx2(p.t)+(p.hidden?' · '+T('pg_hidden'):''),()=>openPage(p.id),ICO.page)).join('')+'</div>':'';
  const th=THEMEK(),thName={auto:T('th_auto'),light:T('th_light'),dark:T('th_dark')};
  const set=`<h3 class="nsec">${esc(T('mr_settings'))}</h3><div class="mlist">`+
    item(T('mr_lang')+': '+(LANG==='ar'?'العربية':'English'),()=>setLang(LANG==='ar'?'en':'ar'),ICO.site)+
    item(T('mr_theme')+': '+thName[th],()=>setTheme(th==='auto'?'light':th==='light'?'dark':'auto'),ICO.info)+'</div>';
  const acc=`<div class="mlist">${own?item(T('nav_logout'),()=>logout()):item(T('nav_login'),()=>openOwner())}</div>`;
  return `<div class="mlist">${secs}</div>`+admin+info+set+acc;
}
/* folding lists stay open or closed when the menu is redrawn */
/* one folding list open at a time: opening one closes the one that was open (its items show under it) */
let MOPEN='';
document.addEventListener('toggle',e=>{const d=e.target;if(!d.matches||!d.matches('details.macc'))return;
  if(d.open){MOPEN=d.dataset.acc;d.parentNode.querySelectorAll('details.macc[open]').forEach(x=>{if(x!==d)x.open=false})}else if(MOPEN===d.dataset.acc&&!d.parentNode.querySelector('details.macc[open]'))MOPEN=''},true);
function renderMenu(){
  if(!$('side'))return;
  ACT.d=[];const sb=$('side-b'),keep=sb.scrollTop;sb.innerHTML=menuHTML('d');sb.scrollTop=keep;
  ACT.m=[];$('menu-b').innerHTML=menuHTML('m');
  mgSortable();
}
// switching between phone and wide layouts (rotating a tablet): leave the menu page on wide screens
matchMedia('(min-width:1024px)').addEventListener('change',()=>{if(WIDE()&&cur==='menu')show('calc');renderNav()});

/* ===================== one search for everything ===================== */
function gsResults(q){
  const n=normAr(q);if(n.length<2)return '';
  const terms=iTerms(n),hit=t=>{const h=normAr(t);return terms.some(x=>h.includes(x))};
  const tx=o=>o?(o[LANG]||o.en||o.ar||''):'',ab=(CFG.ab||[]).filter(a=>a&&a.n&&hit([a.n.ar||'',a.n.en||'',tx(a.cls)].join(' '))).slice(0,8);
  const refs=Object.entries(REFS).filter(([i,x])=>!x[6]&&hit(x[0]+' '+x[1]+' '+x[3]+' '+x[4])).slice(0,6);
  const pages=visiblePages().filter(p=>hit(tx2(p.t)+' '+tx2(p.b))).slice(0,4);
  const sec=(t,items)=>items?`<h3 class="gsh">${esc(t)}</h3><div class="gsl">${items}</div>`:'';
  const it=(attr,label,sub)=>`<button type="button" class="gsi" ${attr}><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</button>`;
  const h=sec(T('med_t'),ab.map(a=>it(`data-gsab="${esc(a.id)}"`,tx(a.n),tx(a.cls))).join(''))+
    sec(T('tab_src'),refs.map(([i,x])=>it(`data-ref="${i}"`,i+'. '+x[0],x[1])).join(''))+
    sec(T('nv_info'),pages.map(p=>it(`data-gspage="${esc(p.id)}"`,tx2(p.t),'')).join(''));
  return h||`<p class="inone">${T('gs_none')}</p>`;
}
function openSearch(){
  openSheet(T('gs_t'),`<div class="nsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="gsq" dir="auto" autocomplete="off" placeholder="${esc(T('gs_ph'))}"></div><div id="gsr" aria-live="polite"></div>`,{key:'search'});
  const q=$('gsq');q.addEventListener('input',()=>{$('gsr').innerHTML=gsResults(q.value)});setTimeout(()=>q.focus(),50);
  $('gsr').addEventListener('click',e=>{
    if(e.target.closest('[data-ref]'))closeSheet(false); // the global handler opens the source
    const ga=e.target.closest('[data-gsab]');if(ga){closeSheet(false);ISEL=ga.dataset.gsab;go('interactions');renderInter()}
    const gp=e.target.closest('[data-gspage]');if(gp){closeSheet(false);openPage(gp.dataset.gspage)}
  });
}

/* ===================== floating window (sheet) ===================== */
let SHEET=null;
/** content: HTML string, or an element that is moved in (and put back on close, keeping its events). */
function openSheet(title,content,opt={}){
  closeSheet(false);
  $('sheet-t').textContent=title;const b=$('sheet-b');b.innerHTML='';ACT.s=[];
  SHEET={last:opt.last||document.activeElement,onClose:opt.onClose,key:opt.key};
  if(typeof content==='string')b.innerHTML=content;
  else{const home=document.createComment('home');content.parentNode.insertBefore(home,content);b.appendChild(content);SHEET.node=content;SHEET.home=home}
  $('sheet').hidden=false;document.body.style.overflow='hidden';b.scrollTop=0;$('sheet-x').focus();
}
function closeSheet(focus=true){
  if($('sheet').hidden||!SHEET)return;
  const s=SHEET;SHEET=null;
  if(s.key==='page'&&/^#info-/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+'#'+(cur||'calc')); // back to the page underneath
  if(s.node){s.home.parentNode.insertBefore(s.node,s.home);s.home.remove()}
  $('sheet').hidden=true;$('sheet-b').innerHTML='';document.body.style.overflow='';
  if(s.onClose)s.onClose();if(focus&&s.last&&s.last.focus)s.last.focus();
}
$('sheet-x').addEventListener('click',()=>closeSheet());
$('hsearch').addEventListener('click',openSearch);
$('hnotif').addEventListener('click',openNotif);
$('sheet').addEventListener('click',e=>{if(e.target===$('sheet'))closeSheet()});

/* ===================== information pages ===================== */
function openPage(id){
  const p=allPages().find(x=>x.id===id);if(!p||(p.hidden&&!SHOWALL()))return;
  if(location.hash!=='#info-'+id)history.replaceState(null,'',location.pathname+location.search+'#info-'+id); // 1.17.1 a reload keeps it open
  openSheet(tx2(p.t),`<div class="prose">${paras(tx2(p.b))}</div>`,{key:'page'});
  if(id==='suggest'){ // e-mail and phone with their buttons (the owner edits them here too)
    const c=document.querySelector('#roadmap .contact').cloneNode(true);c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));c.querySelectorAll('h2,.lead').forEach(x=>x.remove());
    $('sheet-b').appendChild(c);
    if(ISOWNER()&&!OWN.preview)$('sheet-b').insertAdjacentHTML('beforeend',`<div class="sact filters">${chipH('s',{label:T('o_contact'),f:async()=>{closeSheet(false);await editContact();openPage('suggest')}})}</div>`);
  }
  // the same buttons as every other item: edit, hide/show, delete
  if(CAN('text')&&!OWN.preview)$('sheet-b').insertAdjacentHTML('beforeend',`<div class="sact filters">${chipH('s',{label:T('o_edit'),f:()=>{closeSheet(false);editPage(id)}})}${
    chipH('s',{label:T(p.hidden?'o_nshow':'o_nhide'),f:()=>{p.hidden=!p.hidden;changed();openPage(id)}})}${
    id==='suggest'?'':chipH('s',{label:T('o_del'),cls:'danger',f:async()=>{if(await confirmDel(tx2(p.t))){CFG.pages=CFG.pages.filter(x=>x.id!==id);closeSheet(false);changed()}}})}</div>`);
}
async function editPage(id){
  if(!CAN('text')){toast(T('tm_noperm'));return}
  if(!Array.isArray(CFG.pages))CFG.pages=clone(DEFAULT_CFG.pages);
  if(id==='suggest'&&!CFG.pages.some(p=>p.id==='suggest'))CFG.pages.push(SUGGEST());
  const isNew=id==null,o=isNew?{t:{ar:'',en:''},b:{ar:'',en:''},hidden:false}:CFG.pages.find(x=>x.id===id);if(!o)return;
  // 1.16.0: buttons that add a heading, bold text or a list item, and a preview of the page as visitors will see it
  const bar=n=>({type:'html',html:`<div class="mdbar" role="toolbar" aria-label="${esc(T('md_bar'))}">${[['h','md_h','##'],['b','md_b','B'],['l','md_l','•']].map(([k,l,ic])=>`<button type="button" class="btn" data-md="${k}" data-for="dlgf${n}" title="${esc(T(l))}"><b>${ic}</b> ${esc(T(l))}</button>`).join('')}</div>`});
  let v=[o.t.ar,o.t.en||'',o.b.ar,o.b.en||'',o.hidden?'h':'s'],err=null;
  while(true){
    const btns=EDB({isNew,hide:false,del:id!=='suggest'});
    const pr=dialog({err,title:T(isNew?'pg_new':'pg_edit'),fields:[{label:T('pg_t'),value:v[0]},{label:T('pg_ten'),value:v[1],ltr:1},bar(3),{label:T('pg_b'),type:'textarea',value:v[2]},bar(5),{label:T('pg_ben'),type:'textarea',value:v[3],ltr:1},
      {label:T('pg_vis'),type:'select',options:[['s',T('pg_shown')],['h',T('pg_hiddenv')]],value:v[4]},{type:'html',html:`<div class="row"><span class="l">${esc(T('md_prev'))}</span><div class="mdprev prose" id="mdprev"></div></div>`}],buttons:btns});
    mdPreview();
    const r=await pr;
    if(r.action==='del'){if(await confirmDel(tx2(o.t))){CFG.pages=CFG.pages.filter(x=>x.id!==id);closeSheet(false);changed()}return}
    if(r.action!=='ok')return;
    v=[r.values[0],r.values[1],r.values[3],r.values[5],r.values[6]].map(x=>x.trim());
    if(!v[0]||!v[2]){err={i:v[0]?3:0,msg:T('pg_need')};continue}
    const item={id:isNew?'p'+Date.now().toString(36).slice(-7):id,t:{ar:v[0],en:v[1]},b:{ar:v[2],en:v[3]},hidden:v[4]==='h'};
    if(isNew)CFG.pages.push(item);else CFG.pages[CFG.pages.findIndex(x=>x.id===id)]=item;
    changed();if(isNew||!item.hidden)openPage(item.id);return;
  }
}
/** the page preview under the editor follows what is typed (Arabic text in Arabic, English text in English) */
function mdPreview(){const pv=$('mdprev');if(!pv)return;const a=$('dlgf3'),e=$('dlgf5');pv.innerHTML=paras(LANG==='en'&&e&&e.value.trim()?e.value:(a?a.value:''))}
document.addEventListener('input',e=>{if(e.target&&(e.target.id==='dlgf3'||e.target.id==='dlgf5')&&$('mdprev'))mdPreview()});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-md]');if(!b)return;e.preventDefault();
  const ta=$(b.dataset.for);if(!ta)return;const s=ta.selectionStart,en=ta.selectionEnd,val=ta.value,sel=val.slice(s,en);
  const lineStart=val.lastIndexOf('\n',s-1)+1;let out,cur;
  if(b.dataset.md==='b'){const w=sel||T('md_btxt');out=val.slice(0,s)+'**'+w+'**'+val.slice(en);cur=s+2+w.length+2}
  else{const pre=b.dataset.md==='h'?'## ':'- ';out=val.slice(0,lineStart)+pre+val.slice(lineStart);cur=en+pre.length}
  ta.value=out;ta.focus();ta.setSelectionRange(cur,cur);mdPreview();
});

/* ===================== keyboard ===================== */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!$('dlg').hidden||!$('ov').hidden)return;
  if(!$('sheet').hidden){closeSheet();return}
});

