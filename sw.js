// BIOTICWAW service worker: lets the installed app open offline.
// VERSION and FILES are updated by tools/set_version.py; do not edit them by hand.
const VERSION='bioticwaw-1.6.0-f96bbe94';
const FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css?v=1.6.0-788210b2',
  './js/pre.js?v=1.6.0-e186d15a',
  './js/config.js?v=1.6.0-2e7ec50d',
  './js/i18n.js?v=1.6.0-dd5a5e9f',
  './js/util.js?v=1.6.0-42ed0b9f',
  './js/render.js?v=1.6.0-0c8ce0d5',
  './js/content.js?v=1.6.0-aac4e179',
  './js/lists.js?v=1.6.0-8341a617',
  './js/ui.js?v=1.6.0-967ff8eb',
  './js/published.js?v=1.6.0-bf497084',
  './js/owner.js?v=1.6.0-7425bf95',
  './js/nav.js?v=1.6.0-1f78600a',
  './js/team.js?v=1.6.0-240a298a',
  './js/abrules.js?v=1.6.0-da3dcec0',
  './js/abcalc.js?v=1.6.0-44734454',
  './js/boot.js?v=1.6.0-016547e1',
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
