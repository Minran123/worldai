const CACHE='worldai-v2';
const APP_SHELL=[
  './',
  './index.html',
  'https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css',
  'https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/gun/gun.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes('mapbox.com')||url.hostname.includes('tiles.mapbox')){
    e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request).then(res=>res||fetch(e.request).then(r=>{cache.put(e.request,r.clone());return r}))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
self.addEventListener('message',e=>{
  if(e.data && e.data.type==='DOWNLOAD_TILES'){
    const {tiles}=e.data;
    e.waitUntil(caches.open(CACHE).then(cache=>Promise.all(tiles.map(u=>fetch(u).then(r=>cache.put(u,r)).catch(()=>{})))));
  }
});
