// BIOTICWAW service worker: lets the installed app open offline.
// VERSION and FILES are updated by tools/set_version.py; do not edit them by hand.
const VERSION='bioticwaw-1.4.5-a79f8f85';
const FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css?v=1.4.5-2a9b4ea1',
  './js/pre.js?v=1.4.5-e186d15a',
  './js/config.js?v=1.4.5-b917909d',
  './js/i18n.js?v=1.4.5-758e72a8',
  './js/data.js?v=1.4.5-0d86288e',
  './js/util.js?v=1.4.5-035b84b1',
  './js/validation.js?v=1.4.5-b9312dd7',
  './js/render.js?v=1.4.5-0c728587',
  './js/calculators.js?v=1.4.5-ce8b42fa',
  './js/content.js?v=1.4.5-70f4c87f',
  './js/lists.js?v=1.4.5-b2f78b5a',
  './js/ui.js?v=1.4.5-b7e2308f',
  './js/published.js?v=1.4.5-bf497084',
  './js/owner.js?v=1.4.5-98f3a2b1',
  './js/nav.js?v=1.4.5-623442a9',
  './js/team.js?v=1.4.5-6056d317',
  './js/abrules.js?v=1.4.5-caf12542',
  './js/abcalc.js?v=1.4.5-df9afd12',
  './js/boot.js?v=1.4.5-44931332',
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
