const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const fixture = {
  chapters: [
    { title: 'Kapitola první', description: 'První zkušební střípek.\n\n- Hlavní bod\n  - Pododrážka' },
    { title: 'Kapitola druhá', description: 'Druhý samostatný zápis.' }
  ]
};
const saved = JSON.parse(fs.readFileSync(path.join(root,'content/stripky.json'), 'utf8'));
assert.ok(Array.isArray(saved.chapters), 'Střípky must be an editable chapters array');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport:{ width:390,height:844 },serviceWorkers:'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/#stripky', { waitUntil:'networkidle' });
    assert.equal(await page.locator('#app h1').textContent(), 'Střípky z Kostelce');
    const navigation = await page.locator('.site-menu a').evaluateAll(links=>links.map(l=>l.dataset.route));
    assert.deepEqual(navigation.slice(navigation.indexOf('kronika'),navigation.indexOf('combat')+1),
      ['kronika','stripky','combat'], 'Tab must be located between Kronika and Combat');
    if (saved.chapters.length === 0) {
      assert.match(await page.locator('#app').textContent(), /Zatím žádné kapitoly/);
    }

    // Simulate chapters saved through Pages CMS; the real app's CMS normalizer
    // must load the wrapped document, preserving titles and Markdown content.
    await page.route('**/content/stripky.json*', route=>
      route.fulfill({ contentType:'application/json',body:JSON.stringify(fixture) }));
    await page.reload({ waitUntil:'networkidle' });
    await page.waitForFunction(()=>document.querySelectorAll('.fragments-reference .lore-item').length===2);
    const chapters=page.locator('.fragments-reference .lore-item');
    assert.equal(await chapters.first().locator('.lore-toggle strong').textContent(),'Kapitola první');
    await chapters.first().locator('.lore-toggle').click();
    assert.equal(await chapters.first().locator('.lore-toggle').getAttribute('aria-expanded'),'true');
    const details=chapters.first().locator('.lore-prose');
    assert.match(await details.textContent(),/První zkušební střípek/);
    assert.equal(await details.locator('ul.lore-bullets-level-1 > li').count(),1);
    assert.equal(await details.locator('ul.lore-bullets-level-2 > li').count(),1);
    await chapters.first().locator('.lore-toggle').click();
    assert.equal(await chapters.first().locator('.lore-toggle').getAttribute('aria-expanded'),'false');
    await page.evaluate(()=>location.hash='#kronika');
    await page.waitForFunction(()=>document.querySelector('#app h1')?.textContent==='Kronika');
    assert.ok(!(await page.locator('#app').textContent()).includes('Kapitola první'),
      'Střípky must not overwrite Kronika data');
    assert.deepEqual(errors,[]);
    console.log('Střípky OK: CMS chapters, navigation order, nested Markdown bullets, accordion, independence.');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
