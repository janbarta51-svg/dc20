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
    assert.equal(await groupItems.first().locator('summary img.gang-emblem').evaluate(el => getComputedStyle(el).width),'34px');
    await groupItems.first().locator('summary').click();
    assert.ok(await groupItems.first().evaluate(el => el.open),'Character group must remain expandable');

    await page.evaluate(() => location.hash = '#gangcyklopedie');
    await page.waitForFunction(expected =>
      document.querySelectorAll('.lore-item[data-share-type="gang"]').length===expected,gangsFixture.gangs.length);
    const gangItems=page.locator('.lore-item[data-share-type="gang"]');
    assert.equal(await gangItems.first().locator('.lore-toggle img.gang-emblem').count(),1,
      'Encyclopedia should show uploaded gang icon beside its name');
    assert.equal(await gangItems.first().locator('.lore-detail img.lore-image').count(),0,
      'Gang emblem should not also take up a large image slot');
    assert.equal(await gangItems.nth(1).locator('img').count(),0,
      'Gang without an uploaded icon must not render any image');
    await gangItems.first().locator('.lore-toggle').click();
    assert.equal(await gangItems.first().locator('.lore-toggle').getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[],'Both gang lists must render without JavaScript errors');
    console.log('Gang emblems OK: optional icon, no placeholder, compact mobile size, expanded details.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
