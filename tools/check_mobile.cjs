const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const routes = ['home', 'postavy', 'gangcyklopedie', 'kronika', 'stripky', 'bestiar', 'combat', 'combo', 'toolkit', 'calendar'];

async function layout(page, width, route) {
  const state = await page.evaluate(() => ({
    width: innerWidth, visualWidth: visualViewport.width, scale: visualViewport.scale,
    documentWidth: document.documentElement.scrollWidth,
    panels: [...document.querySelectorAll('.home-content,.standard-reference,.class-reference,.class-main,.selector-group')].map(el => {
      const rect = el.getBoundingClientRect();
      return { name: el.className, left: rect.left, right: rect.right };
    }),
    smallButtons: [...document.querySelectorAll('#app button:not(.glossary-term),#siteHeader .tool-button')].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width && rect.height && getComputedStyle(el).visibility === 'visible' && rect.height < 47.5;
    }).map(el => ({ text: el.innerText, height: el.getBoundingClientRect().height }))
  }));
  assert.equal(state.width, width, `${route}: layout viewport must fit the phone`);
  assert.ok(Math.abs(state.visualWidth - width) < 1 && Math.abs(state.scale - 1) < .01, `${route}: browser must not shrink the page`);
  assert.ok(state.documentWidth <= width + 1, `${route}: page must not overflow sideways`);
  for (const panel of state.panels) assert.ok(panel.left >= -1 && panel.right <= width + 1, `${route}: content panel escapes the screen: ${JSON.stringify(panel)}`);
  if (width <= 760) assert.deepEqual(state.smallButtons, [], `${route}: interactive controls must be tall enough for a finger`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 320, height: 640 }, { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 768, height: 1024 }]) {
      // Isolate layout interactions from the first-install worker's reload;
      // the existing runtime smoke test exercises the real worker and offline CSS.
      const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
      if (process.env.DC20_TEST_SDK_PATH) await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.min.js', route => route.fulfill({ path: process.env.DC20_TEST_SDK_PATH, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' } }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/#home', { waitUntil: 'networkidle' });
      await page.locator('#splash').waitFor({ state: 'hidden' });
      if (viewport.width <= 760) {
        assert.equal(await page.locator('.home-downloads a[download]').count(), 7);
        const firstDownload = await page.locator('.home-downloads a[download]').first().boundingBox();
        assert.ok(firstDownload.y + firstDownload.height < viewport.height, 'A full download card must be visible on the first screen');
      }
      const originalHeader = await page.locator('#siteHeader').boundingBox();
      await page.locator('#navToggle').click();
      const openHeader = await page.locator('#siteHeader').boundingBox();
      assert.equal(openHeader.height, originalHeader.height, 'Opening the menu must not push the page away');
      assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#app').evaluate(el => el.inert), true);
      const links = page.locator('.site-menu a');
      assert.equal(await links.count(), routes.length - 1, 'Menu must include every route except home');
      assert.deepEqual(await page.locator('.nav-left a').evaluateAll(items=>items.map(a=>a.dataset.route)),
        ['postavy','gangcyklopedie','kronika','stripky'], 'Left navigation and mobile menu must start with campaign pages');
      assert.deepEqual(await page.locator('.nav-right a').evaluateAll(items=>items.map(a=>a.dataset.route)),
        ['bestiar','combat','combo','toolkit','calendar'], 'Right navigation must show Bestiář before Combat, tools and calendar');
      for (const link of await links.all()) {
        const box = await link.boundingBox();
        assert.ok(box.height >= 51.5 && box.width >= viewport.width * .35, 'Menu links must be broad touch targets');
        assert.ok(Number.parseFloat(await link.evaluate(el => getComputedStyle(el).fontSize)) >= 16);
      }
      const lastLink = links.last();
      await lastLink.scrollIntoViewIfNeeded();
      const lastBox = await lastLink.boundingBox();
      assert.ok(lastBox.y >= originalHeader.height && lastBox.y + lastBox.height <= viewport.height, 'The final menu item must remain reachable on short screens');
      await lastLink.click();
      await page.waitForFunction(() => location.hash === '#calendar' && !document.querySelector('#app').inert);
      assert.equal(await page.locator('#menuBackdrop').isVisible(), false);
      await page.locator('#navToggle').click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#navToggle').evaluate(el => el === document.activeElement), true);
      await page.locator('#navToggle').click();
      await page.locator('#menuBackdrop').click({ position: { x: viewport.width - 2, y: viewport.height - 2 } });
      assert.equal(await page.locator('#app').evaluate(el => el.inert), false);

      for (const route of routes) {
        await page.evaluate(route => { location.hash = '#' + route; }, route);
        await page.waitForFunction(route => document.querySelector(`[data-route="${route}"]`)?.classList.contains('active'), route);
        await layout(page, viewport.width, route);
      }
      // Keyboard-operated campaign accordions remain usable.
      await page.evaluate(() => { location.hash = '#gangcyklopedie'; });
      await page.waitForFunction(() => document.querySelector('.lore-item .lore-toggle'));
      const detail = page.locator('.lore-item .lore-toggle').first();
      await detail.focus();
      await page.keyboard.press('Enter');
      assert.equal(await detail.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Enter');
      assert.equal(await detail.getAttribute('aria-expanded'), 'false');
      await page.evaluate(() => { location.hash = '#cleric'; });
      await page.waitForFunction(() => document.querySelector('#app .home-content'));
      assert.equal(await page.locator('#app .class-reference').count(), 0);

      await page.locator('#accountToggle').click();
      for (const tab of await page.locator('.account-tabs button').all()) assert.ok((await tab.boundingBox()).height >= 47.5);
      assert.ok((await page.locator('.account-close').boundingBox()).height >= 47.5);
      await page.locator('.account-close').click();
      await page.locator('.chat-fab').click();
      const chat = await page.locator('.chat-panel').boundingBox();
      if (viewport.width <= 720) assert.ok(chat.width >= viewport.width - 1 && chat.height >= viewport.height - 1);
      assert.ok((await page.locator('.chat-close').boundingBox()).height >= (viewport.width <= 760 ? 47.5 : 33.5));
      await page.locator('.chat-close').click();
      if (viewport.width === 390) {
        await page.locator('#navToggle').click();
        await page.setViewportSize({ width: 844, height: 390 });
        await lastLink.scrollIntoViewIfNeeded();
        await lastLink.click();
        assert.equal(await page.locator('#app').evaluate(el => el.inert), false);
        await page.locator('#navToggle').click();
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.waitForFunction(() => !document.querySelector('#app').inert);
        // Device emulation updates media queries before the complete layout;
        // wait for the desktop spacing as well as the breakpoint.
        await page.waitForFunction(() => matchMedia('(min-width:1440px)').matches && getComputedStyle(document.querySelector('#siteHeader')).paddingRight === '140px' && getComputedStyle(document.querySelector('.header-tools')).right === '16px');
        assert.equal(await page.locator('#menuBackdrop').isVisible(), false);
        const navBounds = await page.evaluate(() => {
          const left = [...document.querySelectorAll('.nav-left a')].map(el=>el.getBoundingClientRect());
          const right = [...document.querySelectorAll('.nav-right a')].map(el=>el.getBoundingClientRect());
          const logo = document.querySelector('.brand-center').getBoundingClientRect();
          return { lastLeft:Math.max(...left.map(r=>r.right)),logoLeft:logo.left,
            logoRight:logo.right,firstRight:Math.min(...right.map(r=>r.left)) };
        });
        assert.ok(navBounds.lastLeft <= navBounds.logoLeft + 1 && navBounds.logoRight <= navBounds.firstRight + 1,
          `Desktop navigation must flank the logo: ${JSON.stringify(navBounds)}`);
        const headerBoxes = await page.locator('.nav-cluster a,.header-tools .tool-button,.brand-center').evaluateAll(elements => elements.map(el => {
          const r = el.getBoundingClientRect(); return { text: el.innerText, x: r.x, y: r.y, right: r.right, bottom: r.bottom };
        }));
        for (let i = 0; i < headerBoxes.length; i++) for (let j = i + 1; j < headerBoxes.length; j++) {
          const a = headerBoxes[i], b = headerBoxes[j];
          assert.ok(a.right <= b.x + 1 || b.right <= a.x + 1 || a.bottom <= b.y + 1, `Desktop header overlaps: ${JSON.stringify(a)} / ${JSON.stringify(b)}`);
        }

        // Regression: the screenshot showed the entire tab group shifted right.
        // Test the logo against the actual viewport midpoint, not the padded grid.
        for (const desktopWidth of [1440, 1753, 1920]) {
          await page.setViewportSize({width:desktopWidth,height:900});
          const geometry=await page.evaluate(()=>{
            const logo=document.querySelector('.brand-center').getBoundingClientRect();
            const left=[...document.querySelectorAll('.nav-left a')].map(x=>x.getBoundingClientRect());
            const right=[...document.querySelectorAll('.nav-right a')].map(x=>x.getBoundingClientRect());
            const controls=document.querySelector('.header-tools').getBoundingClientRect();
            return {viewport:innerWidth,logoCenter:logo.left+logo.width/2,
              leftEnd:Math.max(...left.map(x=>x.right)),rightStart:Math.min(...right.map(x=>x.left)),
              logoLeft:logo.left,logoRight:logo.right,controlsLeft:controls.left,
              maxRight:Math.max(...right.map(x=>x.right)),scrollWidth:document.documentElement.scrollWidth};
          });
          assert.ok(Math.abs(geometry.logoCenter-desktopWidth/2)<=2,
            `Desktop logo and navigation should be centered: ${JSON.stringify(geometry)}`);
          assert.ok(geometry.leftEnd<=geometry.logoLeft+1 &&
            geometry.rightStart>=geometry.logoRight-1 && geometry.maxRight<=geometry.controlsLeft+1,
            `Tabs and account controls must not overlap: ${JSON.stringify(geometry)}`);
          assert.ok(geometry.scrollWidth<=desktopWidth+1,
            `Desktop header must not create overflow: ${JSON.stringify(geometry)}`);
        }
      }
      assert.deepEqual(errors, []);
      console.log(`Mobile OK: ${viewport.width}px, every route, readable menu, touch controls, login, chat and keyboard selection.`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
