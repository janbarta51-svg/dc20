const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8')).version;
const declaredVersion = source.match(/const APP_VERSION=['"]([^'"]+)['"]/);
assert.equal(declaredVersion?.[1], version, 'app.js and version.json must describe the same release');

// Use the real app and navigation, without starting unrelated account services.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<script src="assets\/js\/(?:supabase-client|account|chat|notifications|calendar|mobile)\.js"><\/script>/g, '');
const parts = version.split('.').map(Number);
const newerVersion = [...parts.slice(0, -1), parts.at(-1) + 1].join('.');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    // Control the advertised release independently of the loaded code. The
    // existing runtime smoke test separately exercises the real offline worker.
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let advertisedVersion = version;
    let servedSource = source;
    await page.route('**/__update_check__', route => route.fulfill({ contentType: 'text/html', body: html }));
    await page.route('**/assets/js/app.js', route => route.fulfill({ contentType: 'text/javascript', body: servedSource }));
    await page.route('**/version.json?*', route => route.fulfill({ json: { version: advertisedVersion } }));

    await page.goto('http://127.0.0.1:4173/__update_check__#home', { waitUntil: 'networkidle' });
    const bar = page.locator('.app-update-bar');
    for (let attempt = 0; attempt < 3; attempt++) {
      assert.equal(await bar.count(), 0, 'The current release must not offer another update');
      await page.reload({ waitUntil: 'networkidle' });
    }

    // An older manifest arriving from a CDN must not offer a downgrade.
    advertisedVersion = '2000.01.01.1';
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await bar.count(), 0, 'An older manifest must not trigger an update');

    // A genuinely newer release offers one update even after repeated checks.
    advertisedVersion = newerVersion;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await bar.waitFor({ state: 'visible' });
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForLoadState('networkidle');
    assert.equal(await bar.count(), 1, 'Repeated checks must not create duplicate prompts');

    // The update button loads the advertised code, and subsequent reloads and
    // foreground/online transitions must stay free of the update prompt.
    servedSource = source.replace(declaredVersion[0], `const APP_VERSION='${newerVersion}'`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      bar.getByRole('button', { name: 'Aktualizovat', exact: true }).click()
    ]);
    for (let attempt = 0; attempt < 3; attempt++) {
      assert.equal(await bar.count(), 0, 'An installed update must not be offered again');
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForLoadState('networkidle');
      assert.equal(await bar.count(), 0, 'Returning to the app must not reoffer the installed update');
      await page.reload({ waitUntil: 'networkidle' });
    }
    assert.deepEqual(errors, []);
    console.log('Updates OK: release versions agree, reloads stay quiet, older manifests are ignored, a real update is offered once.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
