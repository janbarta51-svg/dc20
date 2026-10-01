const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

// Exercise the calendar UI with a read-only fixture client, without changing
// the party's events or requiring a player's Supabase / Google credentials.
const sessions = [
  {
    id: 'old-summer', title: 'Řezníci & Kostelec',
    starts_at: '2026-09-02T16:00:00+00:00', ends_at: '2026-09-02T20:00:00+00:00',
    timezone: 'Europe/Prague', location: 'Kostelec, u Honzy & spol.',
    description: 'Meč, štít a kostky.\nPoznámka s diakritikou & otazníkem?'
  },
  ...[3, 4, 5, 6, 7].map(day => ({
    id: `past-${day}`, title: `Minulé hraní ${day}`,
    starts_at: `2026-09-0${day}T16:00:00Z`, ends_at: `2026-09-0${day}T20:00:00Z`
  })),
  {
    id: 'overnight', title: 'Noční hraní',
    starts_at: '2026-10-08T20:00:00Z', ends_at: '2026-10-09T01:00:00Z'
  },
  {
    id: 'winter', title: 'Zimní hraní',
    starts_at: '2026-12-04T17:00:00Z', ends_at: '2026-12-04T21:00:00Z'
  }
];

async function checkLink(page, event, dates) {
  const link = page.locator('#calendarModal .calendar-google-button');
  await link.waitFor({ state: 'visible' });
  const url = new URL(await link.getAttribute('href'));
  assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/r/eventedit');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), event.title);
  assert.equal(url.searchParams.get('dates'), dates);
  assert.equal(url.searchParams.get('stz'), 'Europe/Prague');
  assert.equal(url.searchParams.get('etz'), 'Europe/Prague');
  assert.equal(url.searchParams.get('location'), event.location || '');
  assert.equal(url.searchParams.get('details'), [event.description || '', 'Gangsterka: https://dc20.honzanacestach.cz/#calendar'].filter(Boolean).join('\n\n'));
  assert.equal(await link.getAttribute('target'), '_blank');
  return link;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ timezoneId: 'Europe/Prague' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-10-01T12:00:00Z'));
    await page.route('**/__calendar_check__', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><link rel="stylesheet" href="/assets/css/styles.css"></head><body><main id="app" class="app-shell"></main></body></html>'
    }));
    await page.addInitScript(({ sessions }) => {
      window.calendarFixture = { role: 'member', signedIn: true, reads: [] };
      const client = {
        auth: {
          getSession: async () => ({ data: { session: window.calendarFixture.signedIn ? { user: { id: 'fixture-member' } } : null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
        },
        from(table) {
          window.calendarFixture.reads.push(table);
          const data = table === 'channels' ? [{ id: 'fixture-party', slug: 'druzina' }]
            : table === 'channel_members' ? [{ role: window.calendarFixture.role }]
            : table === 'game_sessions' ? sessions : [];
          const query = {
            select() { return this; }, eq() { return this; },
            limit() { return this; }, order() { return this; },
            then(resolve, reject) { return Promise.resolve({ data, error: null }).then(resolve, reject); }
          };
          return query;
        },
        channel() { return { on() { return this; }, subscribe() { return this; } }; },
        removeChannel() {}
      };
      window.dc20SupabaseReady = Promise.resolve(client);
    }, { sessions });
    await page.goto('http://127.0.0.1:4173/__calendar_check__#calendar');
    await page.addScriptTag({ path: path.join(__dirname, '../assets/js/calendar.js') });
    await page.locator('.calendar-grid').waitFor();

    // Old events can still be opened even when omitted from the last-four list.
    await page.locator('[data-month="-1"]').click();
    assert.equal(await page.locator('[data-session-id="old-summer"]').count(), 0);
    await page.locator('[data-open-session="old-summer"]').click();
    let link = await checkLink(page, sessions[0], '20260902T160000Z/20260902T200000Z');
    assert.match(await page.locator('#calendarModal .calendar-session-time').innerText(), /18:00–22:00/);
    assert.equal(await page.locator('#calendarModal [data-edit-session]').count(), 0);
    assert.equal(await page.locator('#calendarNewSession').count(), 0);

    // Observe the popup destination without saving anything in Google Calendar.
    await page.context().route('https://calendar.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Calendar link destination</h1>' }));
    const popupPromise = page.waitForEvent('popup');
    await link.click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(new URL(popup.url()).searchParams.get('text'), sessions[0].title);
    await popup.close();
    await page.locator('#calendarModal .calendar-modal-close').click();
    assert.equal(await page.locator('[data-open-session="old-summer"]').evaluate(el => el === document.activeElement), true);

    await page.locator('[data-month="1"]').click();
    await page.locator('[data-open-session="overnight"]').click();
    await checkLink(page, sessions[6], '20261008T200000Z/20261009T010000Z');
    assert.match(await page.locator('#calendarModal .calendar-session-time').innerText(), /9\. října 2026/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#calendarModal').isVisible(), false);

    await page.locator('[data-month="1"]').click();
    await page.locator('[data-month="1"]').click();
    await page.locator('[data-open-session="winter"]').click();
    await checkLink(page, sessions[7], '20261204T170000Z/20261204T210000Z');
    assert.match(await page.locator('#calendarModal .calendar-session-time').innerText(), /18:00–22:00/);
    await page.keyboard.press('Escape');

    // Admin can still open the original edit form through the new detail.
    await page.evaluate(async () => { window.calendarFixture.role = 'owner'; await window.renderDC20Calendar(); });
    await page.locator('[data-open-session="winter"]').click();
    await page.locator('#calendarModal [data-edit-session]').click();
    assert.equal(await page.locator('#calendarSessionForm [name="start_time"]').inputValue(), '18:00');
    assert.equal(await page.locator('#calendarSessionForm [name="end_time"]').inputValue(), '22:00');
    await page.locator('.calendar-form-cancel').click();

    await page.evaluate(async () => { window.calendarFixture.signedIn = false; await window.renderDC20Calendar(); });
    assert.equal(await page.locator('.calendar-grid').count(), 0);
    assert.match(await page.locator('#app').innerText(), /přihlášení členové/);
    assert.deepEqual(errors, []);
    console.log('Calendar OK: old events, summer/winter times, overnight events, popup, member/admin access.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
