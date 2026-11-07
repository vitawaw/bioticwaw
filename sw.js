// BIOTICWAW service worker: lets the installed app open offline.
// VERSION and FILES are updated by tools/set_version.py; do not edit them by hand.
const VERSION='bioticwaw-0.1.0-9d94be72';
const FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css?v=0.1.0-92756d1f',
  './js/pre.js?v=0.1.0-e186d15a',
  './js/config.js?v=0.1.0-f925661a',
  './js/i18n.js?v=0.1.0-740b10d8',
  './js/data.js?v=0.1.0-54f64416',
  './js/util.js?v=0.1.0-035b84b1',
  './js/validation.js?v=0.1.0-1cf6bfcd',
  './js/render.js?v=0.1.0-83f42c71',
  './js/calculators.js?v=0.1.0-057939b2',
  './js/content.js?v=0.1.0-6e1ff2fb',
  './js/tools.js?v=0.1.0-10fc3be0',
  './js/lists.js?v=0.1.0-fb269c53',
  './js/ui.js?v=0.1.0-97dbf54c',
  './js/published.js?v=0.1.0-bf497084',
  './js/owner.js?v=0.1.0-58c4e564',
  './js/nav.js?v=0.1.0-65864933',
  './js/team.js?v=0.1.0-6056d317',
  './js/stats.js?v=0.1.0-5a8860e0',
  './js/boot.js?v=0.1.0-43320419',
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
