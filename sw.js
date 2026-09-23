const CACHE='gangsterka-dc20-v3';

const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './assets/css/styles.css',
  './assets/css/lore-fixes.css',
  './assets/js/rules-data.js',
  './assets/js/classes-extra.js',
  './assets/js/classes-current.js',
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
  './assets/references/DC20_Bard_Class_Reference.pdf',
  './assets/references/DC20_Summoner_Class_Reference.pdf',
  './assets/references/Cleric_Turn_Cheat_Sheet.pdf',
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
      .then(()=>self.clients.matchAll({type:'window'}))
      .then(clients=>clients.forEach(client=>client.postMessage({type:'SW_UPDATED'})))
  );
});

function remember(request,response){
  if(response?.ok){
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(request,copy));
  }
  return response;
}

function networkFirst(request,fallback){
  return fetch(request,{cache:'no-store'})
    .then(response=>remember(request,response))
    .catch(async()=>{
      const cached=await caches.match(request);
      if(cached) return cached;
      if(fallback) return caches.match(fallback);
      throw new Error('Offline and no cached response');
    });
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  const isSameOrigin=url.origin===self.location.origin;
  if(!isSameOrigin) return;

  const isCmsJson=
    url.pathname.endsWith('/content/gangcyklopedie.json') ||
    url.pathname.endsWith('/content/postavy.json') ||
    url.pathname.endsWith('/content/kronika.json');

  const isFreshAppFile=
    request.mode==='navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/manifest.webmanifest') ||
    url.pathname.endsWith('/version.json') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if(isCmsJson){
    event.respondWith(networkFirst(request));
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request,'./index.html'));
    return;
  }

  if(isFreshAppFile){
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;
      return fetch(request).then(response=>remember(request,response));
    })
  );
});
