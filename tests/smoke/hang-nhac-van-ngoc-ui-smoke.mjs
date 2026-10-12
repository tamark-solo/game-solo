import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { SECT_STATIONS } from '../../shared/sect.ts';
import { startService } from '../support/services.mjs';

const origin = 'http://127.0.0.1:5220', endpoint = 'http://127.0.0.1:2620';
const captures = resolve('artifacts/van-ngoc-ui'); await mkdir(captures, { recursive: true });
const folder = await mkdtemp(resolve('artifacts/hn-van-ngoc-ui-')), dbPath = resolve(folder, 'profiles.sqlite');
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], endpoint + '/health', { PORT: '2620', GAME_DB_PATH: dbPath });
let vite, browser, page; const errors = [], checks = [];
const game = () => page.evaluate(() => window.__hangNhacR01());
const shell = () => page.evaluate(() => window.__hangNhacDiagnostics().shell);
const capture = async options => {
  // CSS material/atlas backgrounds can finish after the dialog is already visible.
  // Decode every referenced image before judging artwork from a screenshot.
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const node of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
      const style = getComputedStyle(node, pseudo);
      for (const property of [style.backgroundImage, style.borderImageSource, style.maskImage]) {
        for (const match of property.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/g)) urls.add(match[1] ?? match[2] ?? match[3]);
      }
    }
    await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode(); }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot(options);
};
const alignedSurfaces = async () => {
  const errors = await page.evaluate(() => [...document.querySelectorAll('.vn-frame-surface')].flatMap(surface => {
    const frame = surface.parentElement, outer = frame.getBoundingClientRect(), inner = surface.getBoundingClientRect();
    if (!outer.width || !outer.height) return [];
    return ['x','y','width','height'].filter(key => Math.abs(outer[key] - inner[key]) > .75).map(key => `${frame.id || frame.className}: ${key} ${outer[key]} != ${inner[key]}`);
  }));
  assert.deepEqual(errors, [], 'backing and artwork must share the exact frame box');
};
try {
  const config = resolve(folder, 'vite.mjs');
  await writeFile(config, `export default {root:${JSON.stringify(resolve('client'))}, publicDir:${JSON.stringify(resolve('client/public'))}, cacheDir:${JSON.stringify(resolve(folder, 'vite-cache'))}, resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}}, server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5220'], origin, { VITE_SERVER_URL: endpoint });
  const guest = await fetch(endpoint + '/api/profile-session', { method: 'POST' }).then(response => response.json());
  const store = new ProfileStore(dbPath);
  try {
    const account = store.authenticate(guest.token);
    for (const [avatar, station] of [['CHR-WANG-LIN-CHIBI', 0], ['CHR-SITU-NAN', 1], ['CHR-LI-MUWAN', 2]]) {
      const profile = store.get(account, avatar);
      Object.assign(profile, { x: SECT_STATIONS[station].x, y: SECT_STATIONS[station].y });
      if (station > 0) Object.assign(profile.sect, { hn01: true, foundation: station === 1 ? 'spirit' : 'breathing', cycleStep: station === 1 ? 1 : 4 });
      if (station === 2) { profile.cultivation = 100; Object.assign(profile.sect, { hn02: true, level: 1 }); profile.milestone = 'M01'; }
      store.save(profile);
    }
  } finally { store.close(); }
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(token => localStorage.setItem('hang-nhac.guest.v1', token), guest.token);
  page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  await page.goto(origin + '/hang-nhac.html?devGuest=1'); await page.waitForFunction(() => window.__hangNhacDiagnostics?.().shell.phase === 'entry');
  for (const avatar of ['CHR-SITU-NAN', 'CHR-LI-MUWAN', 'CHR-WANG-LIN-CHIBI']) {
    await page.locator(`[data-avatar-choice="${avatar}"]`).click();
    assert.equal(await page.locator('#avatar').inputValue(), avatar);
    assert.equal(await page.locator('.avatar-choice[aria-pressed=true]').count(), 1);
    assert.equal(await page.locator(`[data-avatar-choice="${avatar}"]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.avatar-pedestal i').evaluate(node => getComputedStyle(node).imageRendering), 'pixelated');
  }
  await capture({ path: resolve(captures, 'entry-desktop.png') });
  await alignedSurfaces();
  checks.push('three_real_profile_choices_native_sprite_preview_no_transport_or_fake_unlock');
  await page.locator('#join').click(); await page.waitForFunction(() => window.__hangNhacSect().view?.profileId === window.__hangNhacR01().own?.profileId);
  await page.locator('#interact').click(); await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#sect-dialog').getAttribute('data-mode'), 'npc');
  assert.equal(await page.locator('.dialog-actions [data-action=accept_intro]').count(), 1);
  await capture({ path: resolve(captures, 'npc-intro.png') });
  await page.locator('[data-action=accept_intro]').click(); await page.waitForFunction(() => window.__hangNhacSect().view?.hn01);
  await page.locator('#sect-close').click(); await page.waitForFunction(() => document.activeElement.id === 'stage');
  await page.locator('#journal').click();
  assert.equal(await page.locator('.quest-card').count(), 5);
  assert.equal(await page.locator('.quest-card[data-quest=HN02] button').getAttribute('aria-expanded'), 'true');
  await page.locator('.quest-card[data-quest=HN01] button').click();
  assert.equal(await page.locator('.quest-card[data-quest=HN01] .quest-card-detail').isVisible(), true);
  assert.equal(await page.locator('.quest-card[data-quest=HN02] .quest-card-detail').isVisible(), false);
  const before = await game();
  await page.locator('.sect-pin[data-station=training]').click();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.station), 'training');
  assert.equal(await page.locator('.sect-pin[data-station=training]').getAttribute('aria-pressed'), 'true');
  assert.equal((await game()).own.casts, before.own.casts); assert.deepEqual((await game()).input.aim, before.input.aim);
  const map = await page.locator('.journal-map-panel').boundingBox(), journal = await page.locator('#sect-dialog').boundingBox();
  assert.ok(map.y + map.height <= journal.y + journal.height, `route map must be visible beside the mission list: ${JSON.stringify({ map, journal })}`);
  await capture({ path: resolve(captures, 'journal-desktop.png') });
  await alignedSurfaces();
  await page.locator('#sect-close').click(); checks.push('journal_accordion_route_selection_preserves_focus_and_sends_no_gameplay');
  await page.locator('#menu-button').click(); await page.locator('#ui-reduced-motion').check();
  assert.equal(await page.locator('#game-shell').getAttribute('data-motion'), 'reduce');
  assert.equal(await page.locator('.hotbar-orb-liquid').first().evaluate(node => getComputedStyle(node, '::before').animationName), 'none');
  const paused = await game(); await page.keyboard.press('1'); assert.equal((await game()).own.casts, paused.own.casts);
  await capture({ path: resolve(captures, 'settings-desktop.png') });
  await page.locator('#menu-close').click(); await page.reload();
  await page.waitForFunction(() => window.__hangNhacDiagnostics?.().shell.phase === 'playing');
  assert.equal(await page.locator('#game-shell').getAttribute('data-motion'), 'reduce');
  await page.locator('#menu-button').click(); await page.locator('#ui-reduced-motion').uncheck(); await page.locator('#menu-close').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.getElementById('game-shell').dataset.motion === 'reduce');
  assert.equal(await page.locator('#game-shell').getAttribute('data-motion'), 'reduce');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  checks.push('manual_and_OS_reduced_motion_static_HUD_persisted_without_changing_gameplay');
  const switchAvatar = async avatar => {
    await page.locator('#leave').click(); await page.waitForFunction(() => window.__hangNhacDiagnostics().shell.phase === 'entry');
    await page.locator(`[data-avatar-choice="${avatar}"]`).click(); await page.locator('#join').click();
    await page.waitForFunction(id => window.__hangNhacR01().avatarId === id && !!window.__hangNhacSect().view, avatar);
  };
  await switchAvatar('CHR-SITU-NAN'); await page.locator('#interact').click(); await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  await capture({ path: resolve(captures, 'cultivation-spirit.png') }); await page.locator('#sect-close').click();
  assert.match(await page.locator('#cultivation-summary').textContent(), /Tích lũy hồi phục/);
  await switchAvatar('CHR-LI-MUWAN'); await page.locator('#interact').click(); await page.locator('#sect-dialog').waitFor({ state: 'visible' });
  await capture({ path: resolve(captures, 'training-dialog.png') }); await page.locator('#sect-close').click();
  await page.locator('#journal').click(); await capture({ path: resolve(captures, 'journal-active.png') }); await page.locator('#sect-close').click();
  checks.push('profile_specific_spirit_cultivation_and_training_dialogs_keep_real_actions');
  for (const size of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size); await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight), false);
    const hotbar = await page.locator('.game-hotbar').boundingBox();
    if (size.width > 760) assert.equal(hotbar.width, 760);
    if (size.width === 1366 || size.width === 390) await capture({ path: resolve(captures, `playing-${size.width}.png`) });
    await page.locator('#journal').click();
    assert.ok(await page.locator('#sect-close').isVisible());
    await alignedSurfaces();
    await page.locator('#sect-dialog .vn-frame-scroll').evaluate(node => { node.scrollTop = node.scrollHeight; });
    await alignedSurfaces();
    if (size.width === 390) await capture({ path: resolve(captures, 'journal-mobile.png') });
    await page.locator('#sect-close').click();
  }
  // Exercise rendered text, including localized copy wider than the real catalogue.
  // Mutations stay in this private browser fixture and are discarded on close.
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator('#journal').click();
  await page.evaluate(() => {
    for (const title of document.querySelectorAll('.quest-card-title')) title.textContent += ' · Quan sát hướng vận khí và hoàn thành thử thách của người hướng dẫn tại Hằng Nhạc';
    for (const copy of document.querySelectorAll('.quest-card-detail p, .quest-card-detail li > span:last-child')) copy.textContent += ' Hãy đọc lời hướng dẫn rồi kiểm tra từng điều kiện trước khi trở về xác nhận. ' + 'Chuoikhongcodaucach'.repeat(5);
  });
  const textCases = [];
  for (const width of [320, 390, 760, 980, 1024, 1366]) for (const scale of [1, 1.5, 2]) {
    await page.setViewportSize({ width, height: width <= 760 ? 844 : 768 });
    const style = await page.addStyleTag({ content: `.hang-nhac-game { --ui-text-body: ${15 * scale}px; --ui-text-small: ${12 * scale}px; --ui-text-title: ${20 * scale}px; }` });
    for (const id of ['HN01', 'HN02', 'HN03', 'HN04', 'HN05']) {
      const tab = page.locator(`.quest-card[data-quest=${id}] .quest-card-select`);
      if (await tab.getAttribute('aria-expanded') !== 'true') await tab.click();
      const failures = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('.quest-card-select, .quest-card-label, .quest-card-detail:not([hidden]), .quest-card-detail:not([hidden]) p, .quest-card-detail:not([hidden]) li > span:last-child')];
        return nodes.flatMap(node => {
          const box = node.getBoundingClientRect();
          if (!box.width || !box.height) return [];
          const issues = [];
          if (node.scrollWidth > node.clientWidth + 1) issues.push(`${node.className || node.tagName} horizontal overflow`);
          if (node.matches('p, li > span:last-child, .quest-card-label')) {
            const range = document.createRange(); range.selectNodeContents(node);
            if ([...range.getClientRects()].some(rect => rect.left < box.left - 1 || rect.right > box.right + 1)) issues.push(`${node.className || node.tagName} text outside reading column`);
          }
          return issues;
        });
      });
      assert.deepEqual(failures, [], `quest ${id} text at ${width}px / ${scale}x`);
    }
    assert.equal(await page.locator('#sect-dialog .vn-frame-scroll').evaluate(node => node.scrollWidth > node.clientWidth + 1), false, `dialog overflow at ${width}px / ${scale}x`);
    await page.locator('#sect-dialog .vn-frame-scroll').evaluate(node => { node.scrollTop = node.scrollHeight; });
    const close = await page.locator('#sect-close').boundingBox();
    assert.ok(close.y >= 0 && close.y + close.height <= (width <= 760 ? 844 : 768), 'close remains visible after scrolling long copy');
    await alignedSurfaces();
    if (width === 390 && scale === 1) await capture({ path: resolve(captures, 'journal-long-text-mobile.png') });
    textCases.push({ width, textScale: scale, quests: 5 });
    await style.evaluate(node => node.remove());
  }
  await page.locator('#sect-close').click();
  checks.push('18_reading_layouts_all_five_quests_long_Vietnamese_and_unbroken_text_100_150_200_percent_no_clipping');
  await page.locator('#leave').click(); await page.waitForFunction(() => window.__hangNhacDiagnostics().shell.phase === 'entry');
  await page.setViewportSize({ width: 390, height: 844 }); await capture({ path: resolve(captures, 'entry-mobile.png') });
  await page.locator('#entry-settings').click(); await capture({ path: resolve(captures, 'settings-mobile.png') });
  checks.push('six_H5_viewports_native_hotbar_no_document_scroll_entry_and_dialogs_accessible');
  checks.push('surface_and_frame_aligned_through_resizes_breakpoints_and_dialog_scroll');
  assert.deepEqual(errors, []);
  const report = { passed: true, checks, textCases, errors, fixtureDatabase: dbPath, ownerDatabaseUsed: false, ownerMapEdited: false, artApproved: false };
  await writeFile(resolve(captures, 'verification.json'), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page?.screenshot({ path: resolve(captures, 'failure.png') });
  console.error(JSON.stringify({ checks, errors, shell: page ? await shell() : undefined, backend: backend.output(), vite: vite?.output() }, null, 2)); throw error;
} finally { await browser?.close(); vite?.stop(); backend.stop(); }
