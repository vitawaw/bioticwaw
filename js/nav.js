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
const TOOLS=[]; // 1.19 (test): the vitamin and supplement tools were removed
/** the line under a tool's name on the tools page (1.14.0: never the same words as the name) */
const TOOLSUB={};
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
const pickNut=k=>openNut(k);
const SECTIONS=['calc','tools','interactions','sources','roadmap','meds']; // 1.14.1: meds/sch/labs are sections too (owner: bar, order, names)
const SECTOOL={}; // sections that are a tool's own page (none left)
const SECKEY0={calc:'tab_calc',tools:'tab_tools',interactions:'tab_int',sources:'tab_src',roadmap:'tab_rm',notif:'nt_t',meds:'mm_t',links:'lk_t',};
const SECKEY=SECKEY0;
/* ===================== main sections (owner, 1.12.0): order everywhere, the bar (≤4), hidden ones, names, colors =====================
   CFG.menus = {order, bar, hide}. The calculator cannot be hidden; 🔔 and ☰ are always there. */
const HEROKEY={calc:['hc_t','hc_l'],tools:['ht_t','ht_l'],interactions:['ti_t','hi_l'],sources:['ts_t','hs_l'],roadmap:['rm_t','rm_l']};
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
/* the tools page: rectangles like the vitamins; each opens its own working page (#tool-pill…) with «‹ Tools» */
/** a tool the owner hid is gone everywhere: tools page, search, result buttons, menu, reminders (id = 'tool-labs', or its kind 'labs') */
const toolHidden=k=>{const id=k.startsWith('tool-')?k:(TOOLS.find(t=>TOOLKIND[t[0]]===k)||[''])[0];return !(SHOWALL()&&EDITING())&&((CFG.tools&&CFG.tools.hide)||[]).includes(id)}; // 1.17.2 the owner too, unless «تعديل وترتيب» is on
/** the tools in the owner's order; hidden ones only for the team while editing */
function toolList(){
  const c=CFG.tools||{},ids=TOOLS.map(t=>t[0]),order=[...new Set([...(c.order||[]).filter(x=>ids.includes(x)),...ids])],hide=c.hide||[];
  return order.map(id=>TOOLS.find(t=>t[0]===id)).filter(t=>!hide.includes(t[0])||(SHOWALL()&&EDITING()));
}
const toolName=t=>{const n=CFG.tools&&CFG.tools.names&&CFG.tools.names[t[0]];return (n&&(LANG==='ar'?n.ar:(n.en||n.ar)))||T(t[1])};
/* 1.16.0 «أدوات المتابعة»: the owner chooses what is in it — tools, any section, any information page (also pages added
   later) — with «+ إضافة», removes an item with its ✎ and orders them with ⋮⋮. Saved in CFG.tools.follow. */
const FOLLOW0=[];
/** 1.16.2 the team's own pages: one list for the menu («الأقسام») and the follow-up tools' «+ إضافة», so a team page added later
    appears in both by itself. Shown only to the signed-in team (and «فحص المصادر» only to whoever edits sources). */
const TEAMX=()=>{const own=typeof OWN!=='undefined'&&OWN.on&&!OWN.preview;return [
  ...(own?[{k:'log',name:T('lg_t'),ico:ICO.history,page:'roadmap',f:()=>openLog()}]:[]),
  ...(own&&ISOWNER()?[{k:'stats',name:T('st_t'),ico:ICO.chart,page:'tools',f:()=>go('stats')}]:[]),
  ...(own&&CAN('refs')?[{k:'links',name:T('lk_t'),ico:tabIco('links'),page:'sources',f:()=>go('links')}]:[])]};
const FOLLOW=()=>Array.isArray(CFG.tools&&CFG.tools.follow)?CFG.tools.follow:FOLLOW0;
const fKey=k=>k.startsWith('p:')&&SECTOOL[k.slice(2)]?SECTOOL[k.slice(2)]:k; // a section that is a tool (schedule, lab results…) is that tool
/** what a follow-up key shows: {name, icon, colours page, hidden} or null when it no longer exists */
function fItem(k){
  if(k.startsWith('tool-')){const t=TOOLS.find(x=>x[0]===k);return t?{tool:t}:null}
  if(k.startsWith('p:')){const p=k.slice(2);if(!SECKEY[p])return null;return {name:T(SECKEY[p]),ico:tabIco(p),page:p,off:navHidden(p)||mgOff('p-'+p)}}
  if(k.startsWith('pg:')){const pg=allPages().find(x=>x.id===k.slice(3));if(!pg)return null;return {name:tx2(pg.t),ico:ICO.page,off:!!pg.hidden}}
  if(k.startsWith('x:')){const x=TEAMX().find(y=>y.k===k.slice(2));return x?{name:x.name,ico:x.ico,page:x.page}:null} // visitors: not shown
  return null;
}
function renderToolsGrid(){
  if(!$('tgrid'))return;
  const own=ISOWNER()&&EDITING(),hide=(CFG.tools&&CFG.tools.hide)||[],fol=FOLLOW();
  const tic=id=>{const sv=$(id)&&$(id).querySelector('.ttl-ic svg');return sv?sv.outerHTML:ICO.info};
  const toolTile=t=>{const off=hide.includes(t[0]),b=`<button type="button" data-tv="${t[0]}"><i class="tico" aria-hidden="true">${tic(t[0])}</i><span>${esc(toolName(t))}</span><small>${esc(T(toolSubKey(t)))}</small>${SHOWALL()&&off?`<em class="hidb">${T('o_hiddenb')}</em>`:''}</button>`;
    return own?`<div class="pkw tkw${off?' off':''}" data-sid="${t[0]}">${b}<div class="pka">${DRAG(T('o_drag'))}${EPEN(`data-tled="${t[0]}"`)}</div></div>`:b};
  const main=toolList().filter(t=>!fol.includes(t[0]));
  const fl=fol.map(k=>{const it=fItem(k);if(!it)return '';
    if(it.tool)return toolHidden(k)?'':toolTile(it.tool); // 1.17.2 hidden: shown to the team only in «تعديل وترتيب»
    if(it.off&&!SHOWALL())return '';
    const b=`<button type="button" data-fgo="${esc(k)}"${it.page?` style="${colorVars(it.page)}"`:''}><i class="tico" aria-hidden="true">${it.ico}</i><span>${esc(it.name)}</span>${SHOWALL()&&it.off?`<em class="hidb">${T('o_hiddenb')}</em>`:''}</button>`;
    return own?`<div class="pkw tkw" data-sid="${esc(k)}">${b}<div class="pka">${DRAG(T('o_drag'))}${EPEN(`data-fed="${esc(k)}"`)}</div></div>`:b}).join('');
  const add=own?`<button type="button" class="tadd" data-fadd="1">${PLUS}<span>${esc(T('fl_add'))}</span></button>`:'';
  $('tgrid').innerHTML=`<div class="picker tgmain">${main.map(toolTile).join('')}</div>`+
    (fl||add?`<h3 class="pkh tgh">${esc(T('tg_follow'))}</h3><div class="picker tgfol">${fl}${add}</div>`:'')+
    (own?`<p class="hint tlhint">${T('o_tile_hint')} ${T('fl_hint')}</p>`:'');
  if(own){
    sortable($('tgrid').querySelector('.tgmain'),'.tkw',ids=>{if(!ISOWNER())return;CFG.tools={...CFG.tools,order:ids};changed()});
    sortable($('tgrid').querySelector('.tgfol'),'.tkw',ids=>{if(!ISOWNER())return;CFG.tools={...CFG.tools,follow:ids};changed()});
  }
  toolSearch();
}
function folSet(list){CFG.tools={order:[],hide:[],names:{},...CFG.tools,follow:[...new Set(list)]};changed()}
/** «+ إضافة» in the follow-up tools: every section, every information page and every tool not yet there */
function openFollowAdd(){
  if(!ISOWNER())return;openSheet(T('fl_add_t'),'',{key:'foladd'});drawFollowAdd();
}
function drawFollowAdd(){
  if(!SHEET||SHEET.key!=='foladd')return;
  const fol=FOLLOW(),has=k=>fol.includes(fKey(k)),row=(k,name,ico,page)=>`<button type="button" class="mi" data-fpick="${esc(k)}"${has(k)?' disabled':''}><span class="di"${page?` style="${colorVars(page)}"`:''}>${ico}</span><span class="mt">${esc(name)}${has(k)?`<small>${esc(T('fl_in'))}</small>`:''}</span></button>`;
  const secs=NAV().order.filter(p=>p!=='tools'),pages=allPages(),tools=TOOLS.filter(t=>!secs.some(p=>SECTOOL[p]===t[0]));
  $('sheet-b').innerHTML=`<p class="hint">${esc(T('fl_add_i'))}</p><h4 class="lkh4">${esc(T('mn_short'))}</h4><div class="ml">${secs.map(p=>row('p:'+p,T(SECKEY[p]),tabIco(p),p)).join('')}</div>`+
    `<h4 class="lkh4">${esc(T('fl_pages'))}</h4><div class="ml">${pages.map(pg=>row('pg:'+pg.id,tx2(pg.t)+(pg.hidden?' · '+T('pg_hidden'):''),ICO.page)).join('')}</div>`+
    `<h4 class="lkh4">${esc(T('tab_tools'))}</h4><div class="ml">${tools.map(t=>row(t[0],toolName(t),ICO.info)).join('')}</div>`+
    (TEAMX().length?`<h4 class="lkh4">${esc(T('fl_team'))}</h4><div class="ml">${TEAMX().map(x=>row('x:'+x.k,x.name,x.ico,x.page)).join('')}</div>`:'');
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-fgo]');if(g){e.preventDefault();const k=g.dataset.fgo;if(k.startsWith('p:'))go(k.slice(2));else if(k.startsWith('pg:'))openPage(k.slice(3));else if(k.startsWith('x:')){const x=TEAMX().find(y=>y.k===k.slice(2));if(x)x.f()}return}
  if(e.target.closest('[data-fadd]')){e.preventDefault();openFollowAdd();return}
  const pk=e.target.closest('[data-fpick]');if(pk&&ISOWNER()){e.preventDefault();folSet([...FOLLOW(),fKey(pk.dataset.fpick)]);toast(T('fl_added'));drawFollowAdd();return}
  const fe=e.target.closest('[data-fed]');if(fe&&ISOWNER()){e.preventDefault();e.stopPropagation();editFollow(fe.dataset.fed)}
});
/** ✎ on a section or page in the follow-up tools: open it, or take it out of the follow-up tools */
async function editFollow(k){
  const it=fItem(k);
  const r=await dialog({title:it?it.name:k,info:T('fl_ed_i'),buttons:[{label:T('fl_remove'),action:'rm',danger:1},{label:T('o_cancel'),action:'cancel'},{label:T('fl_open'),action:'open',pri:1}]});
  if(r.action==='rm'){folSet(FOLLOW().filter(x=>x!==k));toast(T('fl_removed'))}
  if(r.action==='open'){if(k.startsWith('p:'))go(k.slice(2));else if(k.startsWith('pg:'))openPage(k.slice(3));else{const x=TEAMX().find(y=>'x:'+y.k===k);if(x)x.f()}}
}
const toolSubKey=t=>TOOLSUB[t[0]]||t[2];
/** the search box above the tools keeps only the tools whose name matches */
function toolSearch(){const q=normAr($('tsearch')&&$('tsearch').value).trim();document.querySelectorAll('#tgrid [data-tv],#tgrid [data-fgo]').forEach(b=>{(b.closest('.tkw')||b).hidden=!!q&&!normAr(b.textContent).includes(q)});document.querySelectorAll('#tgrid .tgh').forEach(h=>{h.hidden=!!q})}
/** 1.16.0 ✎ on a tool (owner): Arabic and English name, description, hide/show — one floating window */
async function editTool(id){
  const c=CFG.tools={order:[],hide:[],names:{},...CFG.tools};
  const t=TOOLS.find(x=>x[0]===id);if(!t)return;const n=c.names[t[0]]||{ar:I18N[t[1]][0],en:I18N[t[1]][1]},dk=toolSubKey(t),d=CFG.text[dk]||{ar:I18N[dk][0],en:I18N[dk][1]},off=c.hide.includes(id);
  const inF=FOLLOW().includes(id);
  const r=await dialog({title:toolName(t),fields:[{label:T('nv_name'),value:n.ar},{label:T('nv_name_en'),value:n.en||'',ltr:1},{label:T('ed_desc'),value:d.ar},{label:T('ed_desc_en'),value:d.en||'',ltr:1}],buttons:[{label:T(inF?'fl_remove':'fl_to'),action:'fol'},...EDB({hidden:off,del:false,reset:true})]});
  if(r.action==='fol'){folSet(inF?FOLLOW().filter(x=>x!==id):[...FOLLOW(),id]);return}
  if(r.action==='hide'){c.hide=off?c.hide.filter(x=>x!==id):[...c.hide,id];changed();return}
  if(r.action==='reset'){const nm={...c.names};delete nm[t[0]];c.names=nm;delete CFG.text[dk];changed();return}
  if(r.action!=='ok')return;
  const ar=r.values[0].trim(),en=r.values[1].trim();c.names={...c.names,[t[0]]:{ar:ar||I18N[t[1]][0],en:en||I18N[t[1]][1]}};
  const da=r.values[2].trim()||I18N[dk][0],de=r.values[3].trim()||I18N[dk][1];if(da===I18N[dk][0]&&de===I18N[dk][1])delete CFG.text[dk];else CFG.text[dk]={ar:da,en:de};
  changed();
}
document.addEventListener('click',e=>{const ed=e.target.closest('[data-tled]');if(!ed||!ISOWNER())return;e.preventDefault();e.stopPropagation();editTool(ed.dataset.tled)});
function openToolPage(id){closeSheet(false);TOOLFROM=cur==='tools'?'':(location.hash||'#'+cur);if(location.hash!=='#'+id)location.hash=id;else show('tools',id);window.scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tv]');if(!b)return;e.preventDefault();openToolPage(b.dataset.tv)});
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
  renderToolsGrid();$('cvname').textContent=kname(K);
  $('hsearch').setAttribute('aria-label',T('gs_t'));
  document.querySelectorAll('.tab[data-p]').forEach(t=>{const lb=t.querySelector('.full,[data-t]');if(lb)t.title=lb.textContent}); // computers show icons only: the name appears on hover
  if(WIDE())$('t-menu').setAttribute('aria-selected',!document.body.classList.contains('noside'));
  renderMenu();
}
// older names (owner bar «awaiting review ›», tests)
/** 🔔 opens in a floating window over the page you are on */
function openNotif(){if(SHEET&&SHEET.key==='notif')return;if(typeof renderAbAdmin==='function')renderAbAdmin();openSheet(T('nt_t'),$('notifbox'),{key:'notif',onClose:()=>renderNav()});renderNotif(true);renderNav()}
const openNav=openNotif;
const openMore=openNav,closeNav=()=>{},closeMore=()=>{};

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
  // 1.3.0: the menu keeps only: calculator, interactions, sources, actions (owner), upcoming, and sign in / out
  const own=typeof OWN!=='undefined'&&OWN.on;
  const items=[
    {label:T('tab_calc'),f:()=>go('calc')},
    {label:T('tab_int'),f:()=>go('interactions')},
    {label:T('tab_src'),f:()=>go('sources')},
    ...(own?[{label:T('lg_t'),f:()=>openLog()}]:[]),
    {label:T('med_t'),f:()=>go('abx')},
    {label:T('up_t'),f:()=>go('roadmap')},
    own?{label:T('nav_logout'),f:()=>logout()}:{label:T('nav_login'),f:()=>openOwner()},
  ];
  return '<div class="mlist">'+items.map(c=>`<button type="button" class="mi" data-na="${r}${ACT[r].push(c.f)-1}"><span class="mt">${esc(c.label)}</span></button>`).join('')+'</div>';
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
  const calc=KEYS.slice(1).filter(k=>hit(kname(k)+' '+(I18N['h_'+k]?I18N['h_'+k].join(' '):''))).slice(0,6);
  const tools=TOOLS.filter(t=>!toolHidden(t[0])&&hit(T(t[1])+' '+T(t[2]))).slice(0,6);
  const inter=INTER.filter(x=>x[7]&&!x[8]&&hit([x[1][0],x[1][1],x[2][0],x[2][1],x[3][0],x[3][1]].join(' ')));
  const refs=Object.entries(REFS).filter(([i,x])=>!x[6]&&hit(x[0]+' '+x[1]+' '+x[3]+' '+x[4])).slice(0,6);
  const pages=visiblePages().filter(p=>hit(tx2(p.t)+' '+tx2(p.b))).slice(0,4);
  const sec=(t,items)=>items?`<h3 class="gsh">${esc(t)}</h3><div class="gsl">${items}</div>`:'';
  const it=(attr,label,sub)=>`<button type="button" class="gsi" ${attr}><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</button>`;
  const h=sec(T('gs_calc'),calc.map(k=>it(`data-gocalc="${esc(k)}"`,kname(k),I18N['h_'+k]?T('h_'+k):'')).join(''))+
    sec(T('gs_tools'),tools.map(t=>it(`data-tool="${TOOLKIND[t[0]]}"`,T(t[2]),'')).join(''))+
    sec(T('tab_int')+(inter.length?` (${inter.length})`:''),inter.slice(0,6).map(x=>it(`data-gsint="${esc(q)}"`,L(x[1][0],x[1][1])+' + '+L(x[2][0],x[2][1]),L(x[3][0],x[3][1]))).join(''))+
    sec(T('tab_src'),refs.map(([i,x])=>it(`data-ref="${i}"`,i+'. '+x[0],x[1])).join(''))+
    sec(T('nv_info'),pages.map(p=>it(`data-gspage="${esc(p.id)}"`,tx2(p.t),'')).join(''));
  return h||`<p class="inone">${T('gs_none')}</p>`;
}
function openSearch(){
  openSheet(T('gs_t'),`<div class="nsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="gsq" dir="auto" autocomplete="off" placeholder="${esc(T('gs_ph'))}"></div><div id="gsr" aria-live="polite"></div>`,{key:'search'});
  const q=$('gsq');q.addEventListener('input',()=>{$('gsr').innerHTML=gsResults(q.value)});setTimeout(()=>q.focus(),50);
  $('gsr').addEventListener('click',e=>{
    if(e.target.closest('[data-gocalc],[data-tool],[data-ref]'))closeSheet(false); // the global handlers open the item
    const gi=e.target.closest('[data-gsint]');if(gi){closeSheet(false);IF='all';ISRC=null;$('isearch').value=gi.dataset.gsint;renderInter();go('interactions')}
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

