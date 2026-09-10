const CACHE='gangsterka-dc20-stable-v3-classes';

const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/css/lore-fixes.css',
  './assets/js/rules-data.js',
  './assets/js/classes-extra.js',
  './assets/js/cms-fix.js',
  './assets/js/app.js',
  './assets/icons/d20.svg',
  './assets/icons/gangsterka-192.png',
  './assets/icons/gangsterka-512.png',
  './assets/media/dc20-logo.webp',
  './assets/media/cleric-art.webp',
  './assets/media/commander-art.webp',
  './assets/media/spellblade-art.webp',
  './assets/media/paper-texture.webp',
  './assets/references/DC20_Cleric_Class_Reference.pdf',
  './assets/references/DC20_Champion_Class_Reference.pdf',
  './assets/references/DC20_Sorcerer_Class_Reference.pdf',
  './assets/references/DC20_Spellblade_Class_Reference.pdf',
  './assets/references/Cleric_Turn_Cheat_Sheet.pdf',
  './assets/references/Spellblade_Turn_Cheat_Sheet.pdf',
  './content/gangcyklopedie.json',
  './content/postavy.json',
  './content/kronika.json'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  const isSameOrigin=url.origin===self.location.origin;
  const isCmsJson=isSameOrigin && (
    url.pathname.endsWith('/content/gangcyklopedie.json') ||
    url.pathname.endsWith('/content/postavy.json') ||
    url.pathname.endsWith('/content/kronika.json')
  );

  if(isCmsJson){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(request))
    );
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          }
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(isSameOrigin){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached) return cached;
        return fetch(request).then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(request,copy));
          }
          return response;
        });
      })
    );
  }
});
