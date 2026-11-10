// BIOTICWAW service worker: lets the installed app open offline.
// VERSION and FILES are updated by tools/set_version.py; do not edit them by hand.
const VERSION='bioticwaw-1.6.7-74910020';
const FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css?v=1.6.7-4c14d631',
  './js/pre.js?v=1.6.7-e186d15a',
  './js/config.js?v=1.6.7-cd25a653',
  './js/i18n.js?v=1.6.7-c019579d',
  './js/util.js?v=1.6.7-00fab7fa',
  './js/render.js?v=1.6.7-c1cbf468',
  './js/content.js?v=1.6.7-aac4e179',
  './js/lists.js?v=1.6.7-3d3fcb96',
  './js/ui.js?v=1.6.7-4c66323e',
  './js/published.js?v=1.6.7-bf497084',
  './js/owner.js?v=1.6.7-ab0af066',
  './js/nav.js?v=1.6.7-87254a77',
  './js/team.js?v=1.6.7-240a298a',
  './js/abrules.js?v=1.6.7-27c040b1',
  './js/abcalc.js?v=1.6.7-0215407e',
  './js/boot.js?v=1.6.7-11762d93',
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
