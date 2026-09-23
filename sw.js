const CACHE='gangsterka-dc20-v5';

const CMS_PATHS=[
  './content/gangcyklopedie.json',
  './content/postavy.json',
  './content/kronika.json'
];

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
  './assets/js/supabase-client.js',
  './assets/js/account.js',
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
  ...CMS_PATHS
];

function collectAssetUrls(value,found=new Set()){
  if(typeof value==='string'){
    try{
      const url=new URL(value,self.location.href);
      if(url.origin===self.location.origin && url.pathname.includes('/assets/')) found.add(url.href);
    }catch(e){}
    return found;
  }
  if(Array.isArray(value)){
    value.forEach(item=>collectAssetUrls(item,found));
    return found;
  }
  if(value && typeof value==='object'){
    Object.values(value).forEach(item=>collectAssetUrls(item,found));
  }
  return found;
}

async function cacheCmsMedia(response){
  try{
    const data=await response.clone().json();
    const urls=[...collectAssetUrls(data)];
    if(!urls.length) return;
    const cache=await caches.open(CACHE);
    await Promise.all(urls.map(async url=>{
      try{
        const res=await fetch(url,{cache:'no-store'});
        if(res.ok) await cache.put(url,res);
      }catch(e){}
    }));
  }catch(e){}
}

async function refreshCmsMedia(){
  await Promise.all(CMS_PATHS.map(async path=>{
    try{
      const response=await fetch(path,{cache:'no-store'});
      if(response.ok) await cacheCmsMedia(response);
    }catch(e){}
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>refreshCmsMedia())
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

async function cmsNetworkFirst(request,event){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok){
      remember(request,response);
      event.waitUntil(cacheCmsMedia(response.clone()));
    }
    return response;
  }catch(e){
    const cached=await caches.match(request);
    if(cached) return cached;
    throw e;
  }
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
    event.respondWith(cmsNetworkFirst(request,event));
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
