const V='plantarium-v1';
const FILES=['./','index.html','style.css','app.js','plants.js','config.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return; // API и магазины — только по сети
  const net=/\.(html|js|css|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/');
  if(net){
    e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match('index.html'))));
});
