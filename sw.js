// mFlow – Offline-Speicher
// Strategie: sofort aus dem Speicher starten, im Hintergrund die neueste Version von GitHub holen.
// Eine hochgeladene neue Version ist damit beim nächsten Start aktiv.
const CACHE='mflow-bf7bd3cf';
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
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true})||(req.mode==='navigate'?await c.match('index.html'):undefined);
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r;}).catch(()=>undefined);
    if(hit){e.waitUntil(net);return hit;}
    return (await net)||new Response('Offline',{status:503});
  }));
});
