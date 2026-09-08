const CACHE='gangsterka-dc20-final-fixed-spells';
const ASSETS=[
  './','./index.html','./manifest.webmanifest',
  './assets/css/styles.css','./assets/js/rules-data.js','./assets/js/app.js',
  './assets/icons/d20.svg','./assets/icons/gangsterka-192.png','./assets/icons/gangsterka-512.png',
  './assets/media/dc20-logo.webp','./assets/media/cleric-art.webp','./assets/media/commander-art.webp','./assets/media/spellblade-art.webp',
  './assets/references/DC20_Cleric_Class_Reference.pdf',
  './assets/references/DC20_Commander_Class_Reference.pdf',
  './assets/references/DC20_Spellblade_Class_Reference.pdf',
  './assets/references/Cleric_Turn_Cheat_Sheet.pdf',
  './assets/references/Commander_Turn_Cheat_Sheet.pdf',
  './assets/references/Spellblade_Turn_Cheat_Sheet.pdf',
  './content/gangcyklopedie.json','./content/postavy.json','./content/kronika.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    const clone=res.clone();
    caches.open(CACHE).then(c=>c.put(e.request,clone));
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
