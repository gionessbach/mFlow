// mFlow – Offline-Speicher
// Strategie: online immer die neueste Version laden, offline aus dem Speicher starten.
// Bei Änderungen an der App die Versionsnummer erhöhen.
const CACHE='mflow-v2';
const FILES=['./','index.html','manifest.webmanifest','icon.png','icon-512.png','fredoka.woff2'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin) return;
  // Erst Netz (neueste Version, am Zwischenspeicher vorbei), offline aus dem Speicher
  e.respondWith(caches.open(CACHE).then(async c=>{
    try{ const r=await fetch(req,{cache:'no-cache'}); if(r&&r.ok) c.put(req,r.clone()); return r; }
    catch(err){ return (await c.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?await c.match('index.html'):undefined)||new Response('Offline',{status:503}); }
  }));
});
