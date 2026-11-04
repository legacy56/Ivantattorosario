const CACHE='ivan-tatto-v4';
const ASSETS=['./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-192.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  // La página (HTML): siempre red primero, cache solo si no hay internet
  if(r.mode==='navigate'||(u.origin===location.origin&&(u.pathname==='/'||u.pathname.endsWith('.html')))){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp)).catch(()=>{});return res;}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(u.origin!==location.origin){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{});return res;}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;})));
});
