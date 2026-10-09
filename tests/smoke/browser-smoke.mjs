import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startService, waitFor } from '../support/services.mjs';

const clientUrl = 'http://127.0.0.1:5179';
const backendUrl = 'http://127.0.0.1:2579';
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${backendUrl}/health`, { PORT: '2579' });
let vite, browser;
const errors = [];
const checks = [];
const design = JSON.parse(await readFile('docs/data/client-tech-preview-design.json', 'utf8'));
const measurements = [];
function monitor(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
}
async function diagnostics(page) { return page.evaluate(() => window.__previewDiagnostics()); }
async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.width, `${label}: ${JSON.stringify(dimensions)}`);
}
try {
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', 'vite.config.ts', '--port', '5179'], clientUrl, { VITE_SERVER_URL: backendUrl });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  await mkdir('artifacts', { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  const page = await context.newPage(); monitor(page); await page.goto(clientUrl);
  await page.waitForFunction(() => typeof window.__previewDiagnostics === 'function' && window.__previewDiagnostics().sprites.length > 0);
  const initial = await diagnostics(page);
  assert.equal(initial.loadedAssets, design.preview.assets.length);
  assert.equal(initial.nativeFrames, design.preview.existingNativeFrameCount);
  assert.equal(initial.selectedActorId, design.preview.defaultActorId);
  assert.match(initial.actors[0].frame, /^wanglin_chibi_walk_east_/);
  assert.deepEqual(initial.availableDirections, ['south', 'west', 'east', 'north']);
  assert.match(await page.locator('#scene-title').textContent(), /chibi/);
  for (const direction of initial.availableDirections) assert.equal(await page.locator(`[data-direction=${direction}]`).isDisabled(), false);
  assert.equal(initial.sprites[0].center[0], .5);
  assert.ok(Math.abs(initial.sprites[0].center[1] - 1 / 12) < 1e-10);
  checks.push(`source_atlases_${initial.loadedAssets}_packs_${initial.nativeFrames}_frames`, 'home_page_defaults_to_new_chibi_asset');
  await page.locator('#play-pause').click();
  await waitFor(async () => (await page.locator('#play-pause').textContent()) === 'Tiếp tục', 'animation is paused');
  const previous = (await diagnostics(page)).actors[0].frame;
  await page.locator('#next-frame').click(); await page.waitForTimeout(80);
  assert.notEqual((await diagnostics(page)).actors[0].frame, previous);
  await page.locator('#previous-frame').click(); await page.waitForTimeout(80);
  assert.equal((await diagnostics(page)).actors[0].frame, previous);
  checks.push('pause_and_manual_frame_step');
  await page.screenshot({ path: 'artifacts/preview-default-chibi.png' });
  await page.locator('[data-mode=map]').click(); await page.locator('#stage').click();
  for (const [key, direction, axis, sign] of [['d', 'east', 'x', 1], ['a', 'west', 'x', -1], ['s', 'south', 'y', 1], ['w', 'north', 'y', -1]]) {
    const before = (await diagnostics(page)).actors[0];
    await page.keyboard.down(key); await page.waitForTimeout(180);
    assert.ok((await diagnostics(page)).actors[0].frame.includes(`walk_${direction}_`));
    await page.waitForTimeout(270); await page.keyboard.up(key); await page.waitForTimeout(100);
    const after = (await diagnostics(page)).actors[0];
    assert.ok((after[axis] - before[axis]) * sign > 8, `chibi moves ${direction}`);
    assert.equal(after[axis === 'x' ? 'y' : 'x'], before[axis === 'x' ? 'y' : 'x']);
    assert.equal(after.frame, `wanglin_chibi_stand_${direction}`);
    await page.waitForTimeout(100);
    assert.equal((await diagnostics(page)).actors[0][axis], after[axis]);
  }
  const diagonalBefore = (await diagnostics(page)).actors[0];
  await page.keyboard.down('a'); await page.keyboard.down('w'); await page.waitForTimeout(250); await page.keyboard.up('a'); await page.keyboard.up('w');
  await page.waitForTimeout(80);
  const diagonalAfter = (await diagnostics(page)).actors[0];
  assert.ok(diagonalAfter.x < diagonalBefore.x - 3 && diagonalAfter.y < diagonalBefore.y - 3);
  assert.ok(Math.hypot(diagonalAfter.x - diagonalBefore.x, diagonalAfter.y - diagonalBefore.y) < 14, 'diagonal speed remains normalized');
  await page.screenshot({ path: 'artifacts/chibi-four-direction-map.png' });
  await page.locator('#actor-count').selectOption('5'); await page.waitForTimeout(300);
  assert.ok((await diagnostics(page)).actors.every(a => a.frame.startsWith('wanglin_chibi_')));
  await page.locator('#actor-count').selectOption('1');
  checks.push('main_map_chibi_four_directions_walk_stop_and_normalized_diagonal');
  await page.locator('[data-mode=inspector]').click(); await page.locator('#play-pause').click();
  for (const actorId of ['CHR-WANG-LIN-CHIBI', 'CHR-WANG-LIN', 'AVATAR-NOVICE-MALE', 'AVATAR-NOVICE-FEMALE', 'CHR-SITU-NAN', 'CHR-LI-MUWAN']) {
    await page.locator('#actor').selectOption(actorId);
    for (const direction of ['south', 'west', 'east', 'north']) {
      await page.locator(`[data-direction=${direction}]`).click(); await page.waitForTimeout(25);
      assert.ok((await diagnostics(page)).actors[0].frame.endsWith(direction) || (await diagnostics(page)).actors[0].frame.includes(`${direction}_`));
    }
    const staticActor = !design.preview.assets.find(a => a.characterId === actorId).availablePreviewStates.includes('walk');
    assert.equal(await page.locator('#motion-state option[value=walk]').evaluate(option => option.disabled), staticActor);
    if (staticActor) assert.match(await page.locator('#actor-note').textContent(), /hình tĩnh/);
    else {
      if (actorId === 'CHR-SITU-NAN') {
        assert.equal(await page.locator('#motion-state option[value=walk]').textContent(), 'Lướt');
        assert.match(await page.locator('#actor-note').textContent(), /4 px/);
      }
      await page.locator('#motion-state').selectOption('walk');
      for (const direction of ['south', 'west', 'east', 'north']) {
        await page.locator(`[data-direction=${direction}]`).click();
        const metadata = JSON.parse(await readFile(design.preview.assets.find(a => a.characterId === actorId).metadataPath, 'utf8'));
        const expected = metadata.animations[`walk_${direction}`];
        const shown = new Set();
        for (let i = 0; i < expected.length; i++) {
          shown.add((await diagnostics(page)).actors[0].frame);
          await page.locator('#next-frame').click();
        }
        assert.deepEqual(shown, new Set(expected), `all walk poses display: ${actorId}/${direction}`);
        if (actorId === 'CHR-WANG-LIN-CHIBI') {
          await page.locator('#motion-state').selectOption('stand');
          assert.equal((await diagnostics(page)).actors[0].frame, `wanglin_chibi_stand_${direction}`);
          await waitFor(async () => (await page.locator('#frame-name').textContent()) === `wanglin_chibi_stand_${direction}`, 'standing pose readout updated');
          await page.screenshot({ path: `artifacts/chibi-four-direction-${direction}.png` });
          await page.locator('#motion-state').selectOption('walk');
        }
      }
    }
  }
  checks.push('four_directions_all_actors_static_states_explicit');
  checks.push('every_walk_pose_is_displayed_by_three_renderer');
  checks.push('new_chibi_sets_all_directions_spirit_glide_label_explicit');
  await page.locator('#actor').selectOption('CHR-SITU-NAN');
  await page.locator('[data-mode=map]').click(); await page.locator('#stage').click();
  const spiritBefore = (await diagnostics(page)).actors[0].x;
  await page.keyboard.down('d'); await page.waitForTimeout(420); await page.keyboard.up('d'); await page.waitForTimeout(100);
  assert.ok((await diagnostics(page)).actors[0].x > spiritBefore + 8);
  assert.equal((await diagnostics(page)).actors[0].frame, 'situ_nan_chibi_stand_east');
  await page.screenshot({ path: 'artifacts/chibi-spirit-map.png' });
  await page.locator('[data-mode=inspector]').click();
  await page.locator('#actor').selectOption('CHR-WANG-LIN');
  await page.locator('#motion-state').selectOption('walk'); await page.locator('[data-direction=south]').click();
  await page.locator('#backdrop').selectOption('dark'); await page.locator('[data-zoom="4"]').click();
  await page.screenshot({ path: 'artifacts/preview-inspector-dark-4x.png' });
  await page.locator('#backdrop').selectOption('grid'); await page.locator('[data-zoom="2"]').click();
  await waitFor(async () => (await page.locator('#stage-corner').textContent()).includes('2×'), 'zoom readout updated');
  await page.screenshot({ path: 'artifacts/preview-inspector-desktop.png' });
  checks.push('paper_dark_grid_integer_zoom');
  await page.locator('[data-mode=map]').click(); await page.locator('#stage').click();
  const mapBefore = (await diagnostics(page)).actors[0];
  await page.keyboard.down('d'); await page.waitForTimeout(500); await page.keyboard.up('d');
  const mapAfter = (await diagnostics(page)).actors[0];
  assert.ok(mapAfter.x > mapBefore.x + 20);
  assert.ok(mapAfter.x < mapBefore.x + 65);
  const inputBefore = (await diagnostics(page)).actors[0].x;
  await page.locator('#move-speed').focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  assert.ok(Math.abs((await diagnostics(page)).actors[0].x - inputBefore) < .01);
  checks.push('local_wasd_movement_input_focus_does_not_move_actor');
  for (const count of [1, 5, 20]) {
    await page.locator('#actor-count').selectOption(String(count)); await page.waitForTimeout(1300);
    const d = await diagnostics(page); assert.equal(d.actors.length, count);
    const stat = await page.locator('#render-readout').textContent(); measurements.push({ simulatedActors: count, readout: stat, renderer: 'headless_software', mmoCapacityClaim: false });
    if (count > 1) {
      assert.ok(new Set(d.actors.map(a => a.frame)).size > 1);
      assert.ok(new Set(d.sprites.map(s => JSON.stringify(s.offset))).size > 1, 'actual Three.js textures have independent frame UVs');
    }
  }
  checks.push('independent_animation_uvs_1_5_20_local_actors');
  await page.locator('#actor-count').selectOption('1'); await page.locator('#show-debug').uncheck();
  await page.screenshot({ path: 'artifacts/preview-map-desktop.png' });
  await assertNoOverflow(page, 'desktop');
  const phoneContext = await browser.newContext({ viewport: { width: 360, height: 900 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const phone = await phoneContext.newPage(); monitor(phone); await phone.goto(clientUrl);
  await phone.waitForFunction(() => typeof window.__previewDiagnostics === 'function');
  await phone.locator('[data-mode=map]').click(); await assertNoOverflow(phone, 'mobile 360 px');
  await phone.bringToFront();
  const phoneBefore = (await diagnostics(phone)).actors[0].x;
  const cdp = await phoneContext.newCDPSession(phone);
  for (const [direction, axis, sign] of [['east', 'x', 1], ['west', 'x', -1], ['south', 'y', 1], ['north', 'y', -1]]) {
    const button = phone.locator(`[data-input=${direction}]`);
    assert.equal(await button.isDisabled(), false);
    await button.scrollIntoViewIfNeeded();
    const touchBounds = await button.boundingBox();
    const before = (await diagnostics(phone)).actors[0];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchBounds.x + touchBounds.width / 2, y: touchBounds.y + touchBounds.height / 2 }] });
    await phone.waitForTimeout(400);
    assert.ok((await diagnostics(phone)).actors[0].frame.includes(`walk_${direction}_`));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await phone.waitForTimeout(100);
    const after = (await diagnostics(phone)).actors[0];
    assert.ok((after[axis] - before[axis]) * sign > 8, `touch pad moves ${direction}`);
    assert.equal(after.frame, `wanglin_chibi_stand_${direction}`);
  }
  await cdp.detach();
  await phone.screenshot({ path: 'artifacts/preview-map-mobile.png', fullPage: true });
  checks.push('mobile_360_px_dpr2_four_direction_touch_movement_no_horizontal_overflow');
  await phoneContext.close();
  const gallery = await context.newPage(); monitor(gallery);
  await gallery.goto(`${clientUrl}/assets/chibi-roster/index.html`);
  await gallery.waitForFunction(() => typeof window.__chibiRosterDiagnostics === 'function');
  await gallery.evaluate(() => Promise.all(window.ChibiRosterGallery.actors.map(async a => { const img = new Image(); img.src = a.atlasUrl; await img.decode(); })));
  assert.equal(await gallery.locator('.card').count(), 5);
  await gallery.locator('#pause').click();
  for (const direction of ['south', 'west', 'east', 'north']) {
    await gallery.locator(`[data-direction=${direction}]`).click();
    for (let i = 0; i < 4; i++) {
      const d = await gallery.evaluate(() => window.__chibiRosterDiagnostics());
      assert.equal(d.actors.length, 5);
      assert.ok(d.actors.every(a => a.frame.includes(`walk_${direction}_`)));
      await gallery.locator('#next').click();
    }
  }
  await gallery.locator('[data-direction=south]').click(); await gallery.locator('#motion').selectOption('stand');
  await gallery.screenshot({ path: 'artifacts/chibi-roster-desktop.png', fullPage: true });
  await gallery.locator('#backdrop').selectOption('dark');
  await gallery.screenshot({ path: 'artifacts/chibi-roster-dark.png', fullPage: true });
  await gallery.setViewportSize({ width: 360, height: 900 }); await assertNoOverflow(gallery, 'chibi gallery 360 px');
  await gallery.screenshot({ path: 'artifacts/chibi-roster-mobile.png', fullPage: true });
  await gallery.close();
  checks.push('five_character_chibi_gallery_frames_and_mobile_no_overflow');
  await page.bringToFront(); await page.locator('[data-mode=online]').click();
  await page.locator('#player-name').fill('Đệ tử A'); await page.locator('#join-room').click();
  await waitFor(async () => (await page.locator('.player-card').count()) === 1, 'first browser joins');
  const second = await context.newPage(); monitor(second); await second.goto(`${clientUrl}/?player=2`);
  await second.waitForFunction(() => typeof window.__previewDiagnostics === 'function');
  await second.locator('#player-name').fill('Đệ tử B'); await second.locator('#join-room').click();
  await waitFor(async () => (await page.locator('.player-card').count()) === 2 && (await second.locator('.player-card').count()) === 2, 'two browser players visible');
  const aId = await page.locator('.player-card.own').getAttribute('data-player-id');
  await page.bringToFront(); await page.locator('#stage').click();
  const onlineBefore = (await diagnostics(page)).actors.find(a => a.id === aId).x;
  await page.keyboard.down('a'); await page.waitForTimeout(750); await page.keyboard.up('a');
  await page.waitForTimeout(400);
  const aOwn = (await diagnostics(page)).actors.find(a => a.id === aId);
  // A background tab can suspend RAF and keep a stale rendered sprite even
  // while WebSocket state arrives. Compare the second view after it is visible.
  await second.bringToFront();
  await waitFor(async () => Math.abs((await diagnostics(second)).actors.find(a => a.id === aId).x - aOwn.x) < 5, 'foreground second view renders the settled position');
  const aOtherView = (await diagnostics(second)).actors.find(a => a.id === aId);
  assert.ok(aOwn.x < onlineBefore - 25);
  assert.ok(Math.abs(aOwn.x - aOtherView.x) < 5);
  await page.bringToFront();
  await page.evaluate(() => window.__previewDropConnection());
  await waitFor(async () => {
    const d = await diagnostics(page);
    return d.connectionStatus === 'connected' && d.sessionId === aId && (await page.locator('#network-status').textContent()).includes('kết nối lại');
  }, 'browser automatically reconnects to the same session');
  checks.push('browser_auto_reconnect_same_session');
  await page.screenshot({ path: 'artifacts/preview-online-desktop.png' });
  checks.push('two_browser_clients_see_same_server_movement');
  await second.locator('#leave-room').click();
  await waitFor(async () => (await page.locator('.player-card').count()) === 1, 'departing player disappears');
  await page.locator('#leave-room').click();
  checks.push('browser_leave_updates_roster');
  assert.deepEqual(errors, [], 'browser console/page errors');
  const result = { passed: true, browserVersion: browser.version(), checks, measurements, browserErrors: errors, mobileInputStartX: phoneBefore };
  await writeFile('artifacts/browser-verification.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close(); vite?.stop(); backend.stop();
}
