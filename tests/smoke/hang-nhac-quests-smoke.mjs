import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { SECT_STATIONS } from '../../shared/sect.ts';
import { startService } from '../support/services.mjs';

const origin = 'http://127.0.0.1:5203', endpoint = 'http://127.0.0.1:2599';
await mkdir('artifacts', { recursive: true });
const folder = await mkdtemp(resolve('artifacts/hn-quests-')), dbPath = resolve(folder, 'profiles.sqlite');
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], endpoint + '/health', { PORT: '2599', GAME_DB_PATH: dbPath });
let vite, browser, page; const checks = [], errors = [];
const game = () => page.evaluate(() => window.__hangNhacR01());
const sect = () => page.evaluate(() => window.__hangNhacSect());
try {
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', 'vite.config.ts', '--port', '5203'], origin,
    { VITE_SERVER_URL: endpoint, MAP_EDITOR_STORAGE: resolve(folder, 'map-store') });
  const guest = await fetch(endpoint + '/api/profile-session', { method: 'POST' }).then(r => r.json());
  const store = new ProfileStore(dbPath);
  try {
    const account = store.authenticate(guest.token);
    const fresh = store.get(account, 'CHR-WANG-LIN-CHIBI');
    Object.assign(fresh, { x: SECT_STATIONS[0].x, y: SECT_STATIONS[0].y }); store.save(fresh);
    const partial = store.get(account, 'CHR-SITU-NAN');
    Object.assign(partial, { x: SECT_STATIONS[1].x, y: SECT_STATIONS[1].y });
    Object.assign(partial.sect, { hn01: true, foundation: 'spirit', cycleStep: 2 }); store.save(partial);
    const ready = store.get(account, 'CHR-LI-MUWAN');
    Object.assign(ready, { x: SECT_STATIONS[2].x, y: SECT_STATIONS[2].y, milestone: 'M01', cultivation: 100 });
    Object.assign(ready.sect, { hn01: true, hn02: true, foundation: 'breathing', cycleStep: 4, level: 1 });
    Object.assign(ready.sect.lessons, { basic: true, sword: true, thunder: true }); store.save(ready);
  } finally { store.close(); }
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 } });
  await context.addInitScript(token => localStorage.setItem('hang-nhac.guest.v1', token), guest.token);
  await context.addInitScript('window.__name = (fn) => fn;');
  page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  await page.goto(origin + '/hang-nhac.html?devGuest=1'); await page.waitForFunction(() => window.__hangNhacDiagnostics?.().ready);
  assert.equal(await page.locator('#entry-screen').isVisible(), true);
  assert.equal(await page.locator('#sect-objective').isVisible(), false);
  assert.equal(await page.locator('#quest-state').textContent(), 'Chưa kết nối');
  assert.match(await page.locator('#quest-next').textContent(), /Vào sân chung/);
  await page.locator('#entry-journal').click(); await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.quest-card').count(), 5);
  assert.equal(await page.locator('.quest-card[data-quest=HN03]').getAttribute('data-state'), 'locked');
  assert.equal(await page.locator('.quest-card[data-quest=HN05]').getAttribute('data-state'), 'unreleased');
  await page.keyboard.press('j'); await page.locator('#sect-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement?.id === 'join');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'join');
  checks.push('entry_help_and_J_journal_without_fake_unlocks');

  await page.locator('#join').click();
  await page.waitForFunction(() => window.__hangNhacR01().own?.connected && !!window.__hangNhacSect().view);
  const profileId = (await game()).own.profileId;
  const aimBefore = await page.locator('#skill-aim').textContent(), castsBefore = (await game()).own.casts;
  await page.locator('#quest-title').click();
  await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#skill-aim').textContent(), aimBefore);
  assert.equal((await game()).own.casts, castsBefore);
  await page.keyboard.press('Escape');
  await page.locator('#sect-dialog').waitFor({ state: 'hidden' });
  await page.locator('#quest-guide').click(); await page.locator('[data-action=accept_intro]').click();
  await page.waitForFunction(() => window.__hangNhacSect().view?.hn01);
  await page.locator('#sect-close').click();
  assert.equal(await page.locator('#quest-title').textContent(), 'HN02 · Một vòng vận hành');
  assert.equal(await page.locator('#quest-chapter-progress').textContent(), '1/16 nhiệm vụ');
  await page.locator('#quest-guide').click();
  await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  assert.equal((await sect()).station, undefined, 'distant guide opens the journal, not remote NPC dialogue');
  assert.equal((await sect()).destination, 'cultivation');
  await page.locator('#sect-close').click();
  await page.reload(); await page.waitForFunction(() => window.__hangNhacSect?.().view?.hn01);
  assert.equal((await game()).own.profileId, profileId);
  assert.equal(await page.locator('#quest-chapter-progress').textContent(), '1/16 nhiệm vụ');
  checks.push('entry_from_tracker_real_HN01_confirmation_route_reload_and_no_cast_from_UI');

  const switchAvatar = async avatar => {
    await page.locator('#leave').click(); await page.waitForFunction(() => !window.__hangNhacR01().own);
    await page.locator('#avatar:enabled').selectOption(avatar); await page.locator('#join:enabled').click();
    await page.waitForFunction(id => window.__hangNhacR01().own?.connected && window.__hangNhacSect().view?.profileId === window.__hangNhacR01().own.profileId && window.__hangNhacR01().avatarId === id, avatar);
  };
  await switchAvatar('CHR-SITU-NAN');
  assert.equal(await page.locator('#quest-state').textContent(), 'Đang thực hiện');
  assert.equal(await page.locator('#quest-objectives [data-complete=true]').count(), 3);
  assert.match(await page.locator('#cultivation-summary').textContent(), /Linh thể.*Tích lũy hồi phục/);
  await page.screenshot({ path: 'artifacts/hang-nhac-quests-desktop.png' });
  checks.push('separate_partial_HN02_snapshot_and_spirit_progression');

  await switchAvatar('CHR-LI-MUWAN');
  assert.equal(await page.locator('#quest-state').textContent(), 'Chờ xác nhận');
  assert.equal(await page.locator('#quest-objectives [data-complete=true]').count(), 3);
  assert.equal((await sect()).view.cultivation, 100);
  await page.locator('#journal').click();
  assert.equal(await page.locator('.quest-card[data-quest=HN03]').getAttribute('data-state'), 'ready');
  await page.screenshot({ path: 'artifacts/hang-nhac-quests-journal.png' });
  await page.locator('#sect-close').click();
  await page.locator('#quest-guide').click(); await page.locator('[data-action=lesson_confirm]').click();
  await page.waitForFunction(() => window.__hangNhacSect().view.lessons.hn03);
  await page.locator('#sect-close').click();
  assert.equal((await sect()).view.cultivation, 180);
  assert.equal(await page.locator('#quest-title').textContent(), 'HN04 · Nhìn đòn mà tiến');
  assert.equal(await page.locator('#quest-chapter-progress').textContent(), '3/16 nhiệm vụ');
  checks.push('ready_is_not_rewarded_until_NPC_server_confirmation_and_next_quest');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const tracker = await page.locator('#sect-objective').boundingBox(), movement = await page.locator('.touch-pad').boundingBox();
  const stageBox = await page.locator('#stage').boundingBox(), utility = await page.locator('.skill-panel').boundingBox();
  assert.ok(tracker.y + tracker.height <= movement.y, 'tracker must not cover touch movement');
  for (const panel of [tracker, utility]) assert.ok(panel.y + panel.height < stageBox.y + stageBox.height / 2 - 36, 'mobile panels must leave the native character visible');
  assert.ok(utility.x + utility.width <= tracker.x, 'mobile tracker must not cover skill utility');
  for (const id of ['quest-guide', 'interact', 'journal', 'quest-toggle']) {
    const target = await page.locator('#' + id).boundingBox();
    assert.ok(target.width >= 44 && target.height >= 44, `${id} must retain a 44px touch target`);
  }
  await page.locator('#quest-toggle').click(); assert.equal(await page.locator('#quest-tracker-body').isVisible(), false);
  assert.equal(await page.locator('#journal').isVisible(), true);
  await page.locator('#quest-toggle').click();
  await page.screenshot({ path: 'artifacts/hang-nhac-quests-mobile.png' });
  await page.locator('#journal').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('#sect-close').click();
  checks.push('mobile_tracker_collapse_journal_no_horizontal_overflow_or_movement_overlap');
  assert.deepEqual(errors, []);
  const report = { passed: true, checks, errors, fixtureDatabase: dbPath, ownerDatabaseUsed: false, ownerMapEdited: false };
  await writeFile('artifacts/hang-nhac-quests-verification.json', JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(JSON.stringify({ checks, errors, game: page ? await game() : undefined, sect: page ? await sect() : undefined, backend: backend.output(), vite: vite?.output() }, null, 2));
  await page?.screenshot({ path: 'artifacts/hang-nhac-quests-failure.png' }); throw error;
} finally { await browser?.close(); vite?.stop(); backend.stop(); }
