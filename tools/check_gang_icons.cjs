const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const characters = JSON.parse(fs.readFileSync(path.join(root,'content/postavy.json'), 'utf8'));
const gangs = JSON.parse(fs.readFileSync(path.join(root,'content/gangcyklopedie.json'), 'utf8'));
const fixtureIcon = 'assets/icons/d20.svg';

assert.ok(characters.groups?.length >= 2, 'Need at least two character gang groups');
assert.ok(gangs.gangs?.length >= 2, 'Need at least two encyclopedia gangs');
const groupsFixture = structuredClone(characters);
const gangsFixture = structuredClone(gangs);
groupsFixture.groups[0].logo = fixtureIcon;
delete groupsFixture.groups[1].logo;
delete groupsFixture.groups[1].icon;
gangsFixture.gangs[0].logo = fixtureIcon;
delete gangsFixture.gangs[1].logo;
delete gangsFixture.gangs[1].icon;

(async () => {
  const browser = await chromium.launch({ headless:true });
  try {
    const context = await browser.newContext({ serviceWorkers:'block', viewport:{width:390,height:844} });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/content/postavy.json*', route =>
      route.fulfill({contentType:'application/json',body:JSON.stringify(groupsFixture)}));
    await page.route('**/content/gangcyklopedie.json*', route =>
      route.fulfill({contentType:'application/json',body:JSON.stringify(gangsFixture)}));

    await page.goto('http://127.0.0.1:4173/#postavy', {waitUntil:'networkidle'});
    await page.waitForFunction(expected => document.querySelectorAll('.character-gang').length === expected,
      groupsFixture.groups.length);

    const groupItems = page.locator('.character-gang');
    assert.equal(await groupItems.first().locator('summary img.gang-emblem').count(),1,
      'Gang with an uploaded icon should show the icon beside its name');
    assert.equal(await groupItems.first().locator('summary img.gang-emblem').getAttribute('src'),fixtureIcon);
    assert.equal(await groupItems.nth(1).locator('summary img').count(),0,
      'Gang without an icon must not display any placeholder image');
    assert.ok(!(await groupItems.nth(1).locator('summary').textContent()).includes('📁'),
      'Default folder emoji must be absent');
    const groupMark = groupItems.first().locator('summary img.gang-emblem');
    const dimensions = await groupMark.evaluate(el => {
      const image=el.getBoundingClientRect(), row=el.closest('summary').getBoundingClientRect();
      const style=getComputedStyle(el);
      return {
        width:image.width, height:image.height, rowHeight:row.height,
        top:image.top, bottom:image.bottom, rowTop:row.top, rowBottom:row.bottom,
        objectFit:style.objectFit
      };
    });
    assert.equal(dimensions.width,68,'Mobile gang mark should fill most of row height');
    assert.equal(dimensions.height,68,'Mobile gang mark should show full artwork');
    assert.equal(dimensions.objectFit,'contain','Uploaded emblem must never be cropped');
    assert.ok(dimensions.height >= dimensions.rowHeight*0.75,'Gang icon should be close to row height');
    assert.ok(dimensions.top >= dimensions.rowTop && dimensions.bottom <= dimensions.rowBottom,'Gang mark must fit inside row');
    const plus = await groupItems.first().locator('.character-gang-chevron').evaluate(el => getComputedStyle(el,'::before').content);
    assert.ok(plus.includes('+'),'Closed character gang folder should show plus');
    await groupItems.first().locator('summary').click();
    assert.ok(await groupItems.first().evaluate(el => el.open),'Character group must remain expandable');
    const minus = await groupItems.first().locator('.character-gang-chevron').evaluate(el => getComputedStyle(el,'::before').content);
    assert.ok(minus.includes('−'),'Expanded character gang folder should show minus');
    await groupItems.first().locator('summary').click();
    assert.ok(!(await groupItems.first().evaluate(el => el.open)),'Click again should collapse the gang');
    assert.ok((await groupItems.first().locator('.character-gang-chevron').evaluate(el => getComputedStyle(el,'::before').content)).includes('+'));

    await page.evaluate(() => location.hash = '#gangcyklopedie');
    await page.waitForFunction(expected =>
      document.querySelectorAll('.lore-item[data-share-type="gang"]').length===expected,gangsFixture.gangs.length);
    const gangItems=page.locator('.lore-item[data-share-type="gang"]');
    assert.equal(await gangItems.first().locator('.lore-toggle img.gang-emblem').count(),1,
      'Encyclopedia should show uploaded gang icon beside its name');
    const gangMark=gangItems.first().locator('.lore-toggle img.gang-emblem');
    assert.equal(await gangMark.evaluate(el=>getComputedStyle(el).width),'68px');
    assert.equal(await gangMark.evaluate(el=>getComputedStyle(el).objectFit),'contain');
    assert.equal(await gangItems.first().locator('.lore-chevron').evaluate(el=>getComputedStyle(el,'::before').content),'"+"');
    assert.equal(await gangItems.first().locator('.lore-detail img.lore-image').count(),0,
      'Gang emblem should not also take up a large image slot');
    assert.equal(await gangItems.nth(1).locator('img').count(),0,
      'Gang without an uploaded icon must not render any image');
    await gangItems.first().locator('.lore-toggle').click();
    assert.equal(await gangItems.first().locator('.lore-toggle').getAttribute('aria-expanded'),'true');
    assert.equal(await gangItems.first().locator('.lore-chevron').evaluate(el=>getComputedStyle(el,'::before').content),'"−"');

    // Also check the larger full-row artwork on desktop.
    await page.setViewportSize({width:1280,height:900});
    assert.equal(await gangMark.evaluate(el=>getComputedStyle(el).width),'76px');
    await page.evaluate(() => location.hash = '#postavy');
    await page.waitForFunction(() => document.querySelectorAll('.character-gang').length>0);
    assert.equal(await page.locator('.character-gang .gang-emblem').first().evaluate(el=>getComputedStyle(el).height),'76px');

    assert.deepEqual(errors,[],'Both gang lists must render without JavaScript errors');
    console.log('Gang emblems OK: + / − controls, full uncropped artwork, no placeholder, mobile and desktop.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
