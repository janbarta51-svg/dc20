const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const saved = JSON.parse(fs.readFileSync(path.join(root,'content/bestiar.json'),'utf8'));
assert.ok(Array.isArray(saved.creatures), 'Bestiář must have editable creatures array');

const fixture = {creatures:[
  {name:'Lesní bestie',description:'Popis lesní potvory.\n\n- Schopnost\n  - Zranitelnost',image:'assets/media/dc20-logo.webp'},
  {name:'Noční přízrak',description:'Potvora bez obrázku.'}
]};

(async () => {
  const browser=await chromium.launch({headless:true});
  try {
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:4173/#bestiar',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#app h1').textContent(),'Bestiář');
    if(saved.creatures.length===0){
      assert.match(await page.locator('#app').textContent(),/zatím nejsou žádné potvory/);
    }
    const order=await page.locator('.site-menu a').evaluateAll(items=>items.map(x=>x.dataset.route));
    assert.deepEqual(order.slice(order.indexOf('stripky'),order.indexOf('combat')+1),
      ['stripky','bestiar','combat'],'Bestiář belongs between Střípky and Combat, right of logo');

    await page.route('**/content/bestiar.json*',route=>
      route.fulfill({contentType:'application/json',body:JSON.stringify(fixture)}));
    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelectorAll('.bestiary-reference .lore-item').length===2);
    const creatures=page.locator('.bestiary-reference .lore-item');
    assert.equal(await creatures.first().locator('.lore-toggle strong').textContent(),'Lesní bestie');
    assert.equal(await creatures.nth(1).locator('.lore-toggle strong').textContent(),'Noční přízrak');

    await creatures.first().locator('.lore-toggle').click();
    assert.equal(await creatures.first().locator('.lore-toggle').getAttribute('aria-expanded'),'true');
    const detail=creatures.first().locator('.lore-detail');
    assert.equal(await detail.locator('img.lore-image').count(),1);
    assert.equal(await detail.locator('img.lore-image').getAttribute('src'),'assets/media/dc20-logo.webp');
    assert.equal(await detail.locator('img.lore-image').evaluate(img=>img.naturalWidth>0),true);
    assert.match(await detail.textContent(),/Popis lesní potvory/);
    assert.equal(await detail.locator('ul.lore-bullets-level-2 > li').count(),1);
    await creatures.first().locator('.lore-toggle').click();
    assert.equal(await creatures.first().locator('.lore-toggle').getAttribute('aria-expanded'),'false');
    await creatures.nth(1).locator('.lore-toggle').click();
    assert.equal(await creatures.nth(1).locator('.lore-detail img').count(),0,
      'No blank or placeholder image should appear when image is omitted');

    await page.evaluate(()=>location.hash='#stripky');
    await page.waitForFunction(()=>document.querySelector('#app h1')?.textContent==='Střípky z Kostelce');
    assert.ok(!(await page.locator('#app').textContent()).includes('Lesní bestie'),
      'Bestiary contents must remain separate from Střípky');
    assert.deepEqual(errors,[]);
    console.log('Bestiář OK: navigation, CMS records, name, description, photo, missing photo, accordion, isolation.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
