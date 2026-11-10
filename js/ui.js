/* BIOTICWAW · js/ui.js
   Page behaviour: tabs/navigation, welcome card, theme, language switch (setLang), event wiring, colors and refreshAll().
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/* ===================== navigation ===================== */
const PAGES=['calc','interactions','sources','notif','team','menu','abx','roadmap']; // 1.2.0: calculator, interactions, medicines (abx), sources; the rest was removed
let cur='calc';
/** 1.17.1 after a reload the saved session is restored a moment after the first page is drawn: a team-only page asked for in
    the address (pharmacists, visit dashboard, link check, a section hidden from visitors) waits for it instead of jumping away */
let WANT=null;
const HASSESSION=()=>{try{return Object.keys(localStorage).some(k=>/^sb-.+-auth-token$/.test(k))}catch(e){return false}};
function show(p,view){
  if(p==='notif'){if(typeof openNotif==='function')setTimeout(openNotif,0);p=cur&&cur!=='notif'?cur:'calc'} // 🔔 is a floating window, not a page
  const asked=p,askedView=view;
  if(!PAGES.includes(p)||(p==='menu'&&WIDE())||(p==='team'&&!ISOWNER())||(navHidden(p)&&!SHOWALL()))p='calc'; // a section the owner hid is not shown // wide screens show the menu at the side
  if(asked!==p&&asked!=='notif'&&asked!=='menu'&&typeof OWN!=='undefined'&&!OWN.on&&HASSESSION())WANT=[asked,askedView];
  else if(asked===p)WANT=null;
  cur=p;
  PAGES.forEach(x=>{$(x).hidden=x!==p;const t=$('t-'+x);if(t){t.setAttribute('aria-selected',x===p);t.tabIndex=x===p?0:-1}});
  // a section that is a tool's page (schedule, lab results) is the selected tab while its tool is open
  if(p==='team'&&typeof openTeamPage==='function')openTeamPage();
  if(p==='abx'&&typeof renderAbx==='function')renderAbx();
  if(p==='abx'&&typeof renderAbAdmin==='function')renderAbAdmin();
  if(p==='roadmap'&&typeof renderRoadmap==='function')renderRoadmap();
  sharedParts(p);
  if(typeof rememberRecent==='function')rememberRecent('p:'+p);
  if(p!=='sources'){$('back').hidden=true;document.querySelectorAll('ol.refs li.hl').forEach(l=>l.classList.remove('hl'))}
  if(p!=='menu'&&p!=='notif')try{localStorage.setItem('vw-p',p)}catch(e){}
  if(p==='notif'&&typeof renderNotif==='function')renderNotif(true);
  if(p==='sources'&&typeof linksAuto==='function'&&typeof OWN!=='undefined'&&OWN.on&&CAN('refs'))linksAuto(); // the link check runs by itself once a week
  if(typeof renderNav==='function')renderNav();
}
/** «my medicines» and the link check have their own pages (1.13.0) and still appear where they were:
   the same elements move to the page that is open, so there is one list and one check */
function sharedParts(p){
  const put=(id,box)=>{const el=$(id);if(el&&el.parentNode!==box)box.append(el)},home=id=>{const el=$(id),a=$(id+'-home');if(el&&a&&el.previousElementSibling!==a)a.after(el)};
  if(false){put('reflist',$('linksb'));if(typeof renderRefs==='function')renderRefs();if(typeof linksAuto==='function'&&OWN.on)linksAuto()}
  else if(p==='sources'&&$('reflist').parentNode.id==='linksb'){home('reflist');if(typeof renderRefs==='function')renderRefs()}
}
function go(p){if(location.hash!=='#'+p)location.hash=p;else show(p);window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{if(routeSpecial())return;show(location.hash.slice(1));window.scrollTo(0,0)});
/* links that open something instead of a tab: #owner (sign in), #join=<email> (invited pharmacist), #info-<page> (info page) */
function routeSpecial(){
  let h=location.hash.slice(1);try{h=decodeURIComponent(h)}catch(e){}
  if(/(^|&)(type=recovery|error_code=otp_expired)(&|$)/.test(h)){recoverPassword();return true} // the link from the «forgot password» e-mail
  if(h==='owner'){openOwner();return true}
  if(h==='join'||h.startsWith('join=')){const [em,k]=h.slice(5).split('&k=');openOwner({join:em||'',key:k||''});return true}
  if(h.startsWith('info-')){const id=h.slice(5);if(!allPages().some(x=>x.id===id)&&/^[a-z0-9_-]{1,40}$/.test(id))WANTPG=id;else openPage(id);return true} // the page keeps #info-<id> while it is open (1.17.1: a reload opens it again)
  return false;
}
document.querySelectorAll('.tab[data-p]').forEach(t=>{
  t.addEventListener('click',()=>{if(t.dataset.p==='menu'&&WIDE()){toggleSide();return}if(t.dataset.p==='notif'){openNotif();return}go(t.dataset.p)}); // computers: ☰ shows or hides the side menu
  t.addEventListener('keydown',e=>{
    const vis=[...document.querySelectorAll('.tab[data-p]')].filter(x=>x.offsetParent!==null),i=vis.indexOf(t),rtl=document.documentElement.dir==='rtl';
    let j=null;if(e.key==='ArrowRight')j=rtl?i-1:i+1;if(e.key==='ArrowLeft')j=rtl?i+1:i-1;
    if(j!=null&&vis.length){e.preventDefault();const n=vis[(j+vis.length)%vis.length];go(n.dataset.p);n.focus()}
  });
});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-goabx]')){e.preventDefault();go('abx');return}
  const rg=e.target.closest('[data-rmgo]');if(rg){e.preventDefault();const f=GO[rg.dataset.rmgo];if(f)f();return}
  const a=e.target.closest('[data-ref]');if(!a)return;e.preventDefault();
  const back=cur;RTF='all';renderRefs();go('sources');
  $('back').hidden=back==='sources';$('back').dataset.to=back;
  const li=$('ref-'+a.dataset.ref);if(li){li.classList.add('hl');setTimeout(()=>li.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),30)}
});
$('back').addEventListener('click',()=>{const to=$('back').dataset.to||'calc';go(to);if(to==='calc'&&innerWidth<900)setTimeout(()=>$('resbox').scrollIntoView({block:'start'}),30)});
$('rtfilters').addEventListener('click',e=>{const b=e.target.closest('[data-rtf]');if(!b)return;RTF=b.dataset.rtf;renderRefs()});


/* ===================== mode, welcome, text size ===================== */
function closeWelcome(){$('welcome').hidden=true;try{localStorage.setItem('vw-welcome','1')}catch(e){}}
$('wclose').addEventListener('click',closeWelcome);


const MARKSVG=document.querySelector('.logo .mk svg').innerHTML; // the logo mark, reused by the footer
function themeIcon(){if(typeof renderMenu==='function')renderMenu()}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',themeIcon);

/* ===================== clear ===================== */
$('clear').addEventListener('click',()=>{['age','wt','ht','abscr'].forEach(id=>{const e=$(id);if(e)e.value=''});$('res').innerHTML=''});


/* ===================== language ===================== */
function setLang(l){
  LANG=l;buildData();const html=document.documentElement;
  html.lang=l;html.dir=l==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-t]').forEach(el=>{if(I18N[el.dataset.t])el.textContent=T(el.dataset.t)});
  document.querySelectorAll('[data-ph]').forEach(el=>{const v=I18N[el.dataset.ph];if(v){el.placeholder=v[l==='ar'?0:1];if(el.type==='search'&&!el.getAttribute('aria-labelledby'))el.setAttribute('aria-label',el.placeholder)}}); // 1.15.0: search fields need a name for screen readers
  document.querySelectorAll('[data-th]').forEach(el=>{const v=I18N[el.dataset.th];if(v)el.innerHTML=v[l==='ar'?0:1]});
  $('backarrow').setAttribute('d',l==='ar'?'M9 6l6 6-6 6':'M15 6l-6 6 6 6');
  document.querySelectorAll('[aria-label="unit"],[aria-label="الوحدة"]').forEach(el=>el.setAttribute('aria-label',l==='ar'?'الوحدة':'unit'));
  document.querySelectorAll('.x,[aria-label="close"],[aria-label="إغلاق"]').forEach(el=>{if(el.getAttribute('aria-label'))el.setAttribute('aria-label',l==='ar'?'إغلاق':'Close')});
  {const md=document.querySelector('meta[name=description]');if(md)md.content=l==='ar'?'معلومات المضادات الحيوية: الجرعات والتداخلات والمصادر الطبية':'Antibiotic information: doses, interactions and medical sources'}
  try{localStorage.setItem('vw-lang',l)}catch(e){}
  themeIcon();
  renderInter();renderRefs();renderContact();renderNav();
  if(typeof OWN!=='undefined'&&OWN.on){decorate();ownerBar()}if(typeof installBar==='function')installBar();
}


$('isearch').addEventListener('input',renderInter);
$('ssearch').addEventListener('input',renderRefs);

/* ===================== colors ===================== */
const LOOKF={tajawal:'Tajawal,Cairo,"Segoe UI",Tahoma,sans-serif',cairo:'Cairo,Tajawal,"Segoe UI",Tahoma,sans-serif',system:'system-ui,-apple-system,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif'};
/** 1.14.0: the owner's fonts and sizes (CSS variables used by every font size in app.css) */
function applyLook(){
  const l=CFG.look||DEFAULT_CFG.look,r=document.documentElement.style,v={'--f-body':LOOKF[l.fb]||LOOKF.tajawal,'--f-display':LOOKF[l.fh]||LOOKF.cairo,'--fsb':String(l.sb||1),'--fsh':String(l.sh||1),'--fst':String(l.st||1)};
  Object.entries(v).forEach(([k,x])=>r.setProperty(k,x));
  try{localStorage.setItem('vw-look',JSON.stringify(v))}catch(e){}
}
function applyColors(){
  applyLook();
  Object.entries(CFG.colors).forEach(([p,c])=>{const el=$(p),t=$('t-'+p);if(t)t.style.setProperty('--ti',c[1]);if(!el)return;el.style.setProperty('--pc',c[0]);el.style.setProperty('--pc2',c[1])});
  [['meds','meds'],['links','sources'],['stats','tools']].forEach(([p,q])=>{const c=CFG.colors[q]||CFG.colors.interactions,el=$(p);if(c&&el){el.style.setProperty('--pc',c[0]);el.style.setProperty('--pc2',c[1])}}); // own pages take the colours of their section
}
function refreshAll(){if(typeof abcInit==='function')abcInit();applyColors();setLang(LANG);decorate();wantPage()}
/** 1.17.1 an owner's own info page in the address (#info-<id>) that arrives with the content opens as soon as it exists */
let WANTPG='';
function wantPage(){
  if(WANTPG&&location.hash==='#info-'+WANTPG&&allPages().some(x=>x.id===WANTPG)){const id=WANTPG;WANTPG='';openPage(id)}
}


/* 1.16.2 «ثبّت التطبيق الآن» at the very top. Hidden when the site already runs as an installed app (standalone),
   after it is installed (appinstalled), inside the owner's three-size preview, and for this visit after ×. */
const INSTALLED=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true||localStorage.getItem('vw-installed')==='1'}catch(e){return false}};
function installBar(){
  let b=$('instbar');const hide=INSTALLED()||(typeof FRAME!=='undefined'&&FRAME)||(()=>{try{return sessionStorage.getItem('vw-instx')==='1'}catch(e){return false}})();
  if(hide){if(b)b.remove();return}
  if(!b){b=document.createElement('div');b.id='instbar';b.setAttribute('role','region');document.body.prepend(b)}
  b.innerHTML=`<button type="button" class="ibgo" id="ibgo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/></svg><span>${esc(T('ib_t'))}</span></button><button type="button" class="ibx" id="ibx" aria-label="${esc(L('إغلاق','Close'))}">✕</button>`;
}
document.addEventListener('click',e=>{
  if(e.target.closest('#ibgo')){e.preventDefault();installApp();return}
  if(e.target.closest('#ibx')){e.preventDefault();try{sessionStorage.setItem('vw-instx','1')}catch(x){}installBar()}
});
addEventListener('appinstalled',()=>{try{localStorage.setItem('vw-installed','1')}catch(e){}installBar()});
try{matchMedia('(display-mode: standalone)').addEventListener('change',installBar)}catch(e){}
