// BIOTICWAW service worker: lets the installed app open offline.
// VERSION and FILES are updated by tools/set_version.py; do not edit them by hand.
const VERSION='bioticwaw-1.4.4-7a67735c';
const FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css?v=1.4.4-962f5c27',
  './js/pre.js?v=1.4.4-e186d15a',
  './js/config.js?v=1.4.4-f4b68b0f',
  './js/i18n.js?v=1.4.4-5ea57ebe',
  './js/data.js?v=1.4.4-0d86288e',
  './js/util.js?v=1.4.4-035b84b1',
  './js/validation.js?v=1.4.4-b9312dd7',
  './js/render.js?v=1.4.4-0c728587',
  './js/calculators.js?v=1.4.4-ce8b42fa',
  './js/content.js?v=1.4.4-70f4c87f',
  './js/lists.js?v=1.4.4-1a17b939',
  './js/ui.js?v=1.4.4-b7e2308f',
  './js/published.js?v=1.4.4-bf497084',
  './js/owner.js?v=1.4.4-b9ee2a45',
  './js/nav.js?v=1.4.4-623442a9',
  './js/team.js?v=1.4.4-6056d317',
  './js/abrules.js?v=1.4.4-caf12542',
  './js/abcalc.js?v=1.4.4-df9afd12',
  './js/boot.js?v=1.4.4-44931332',
  './fonts/cairo-700.woff2',
  './fonts/cairo-800.woff2',
  './fonts/tajawal-400.woff2',
  './fonts/tajawal-500.woff2',
  './fonts/tajawal-700.woff2'
];

self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;               // Supabase, jsDelivr: always live
  // live content: network first, last good copy when offline
  if(url.pathname.startsWith('/api/')){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();e.waitUntil(caches.open(VERSION).then(x=>x.put(req,c)))}return r}).catch(()=>caches.match(req)));
    return;
  }
  // pages: network first so updates show; after 3 s on a weak signal (or offline) the saved copy
  if(req.mode==='navigate'){
    const net=fetch(req).then(r=>{if(r.ok){const c=r.clone();e.waitUntil(caches.open(VERSION).then(x=>x.put('./index.html',c)))}return r});
    const slow=new Promise(ok=>setTimeout(ok,3000)).then(()=>caches.match('./index.html'));
    e.respondWith(Promise.race([net.catch(()=>caches.match('./index.html')),slow.then(m=>m||net)]));
    return;
  }
  // versioned files (css/js?v=…, fonts, icons): cache first
  e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r})));
});
