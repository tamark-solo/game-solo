import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService, waitFor } from '../support/services.mjs';

const origin = 'http://127.0.0.1:5199', endpoint = 'http://127.0.0.1:2619';
const conceptUrl = '/assets/dao-dual-theme-v1/concept.webp';
const detailArt = JSON.parse(await readFile('client/src/hang-nhac-van-ngoc-detail-art.json', 'utf8'));
assert.equal(detailArt.status, 'art-baseline', 'Sync the owner-approved baseline before running this test.');
assert.equal(detailArt.sectorCount, 20);
assert.deepEqual(detailArt.nativeRegionSize, [704, 704]);
assert.equal(detailArt.webEncoding, 'lossless');
assert.equal(detailArt.sampling, 'nearest');
const releaseSource = await readFile('shared/data/hang-nhac.json', 'utf8');
const release = JSON.parse(releaseSource);
const output = resolve('output/hang-nhac-map-art');
await mkdir(output, { recursive: true });
const fixture = await mkdtemp(resolve(output, 'fixture-'));
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`,
  { PORT: '2619', GAME_DB_PATH: resolve(fixture, 'profiles.sqlite') });
let vite, browser, page;
const checks = [], errors = [];
const diagnostic = () => page.evaluate(() => window.__hangNhacDiagnostics());
const own = state => state.actors.find(actor => actor.own);
const unchangedContracts = state => {
  assert.equal(state.version, release.version);
  assert.deepEqual(state.world, release.world);
  assert.equal(state.blockers, release.blockers.length);
  assert.equal(state.zoom, 1);
  assert.deepEqual(own(state).frameSize, [64, 96]);
  assert.deepEqual(own(state).anchor, [32, 88]);
  const sprite = state.sprites.find(sprite => sprite.id === own(state).id);
  assert.ok(sprite, 'The current player must have a rendered sprite.');
  assert.deepEqual(sprite.scale, [64, 96, 1]);
};
const selectedArt = async id => {
  await page.waitForFunction(id => {
    const state = window.__hangNhacDiagnostics?.();
    const player = state?.actors.find(actor => actor.own);
    return state?.ready && state.mapArt?.id === id && !document.querySelector('#map-art').disabled &&
      state.sprites.some(sprite => sprite.id === player?.id);
  }, id);
  const state = await diagnostic();
  unchangedContracts(state);
  assert.equal(await page.locator('#map-art').inputValue(), id);
  assert.equal(state.mapArt.worldWidth, 3072);
  assert.equal(state.mapArt.worldHeight, 2048);
  if (id === 'van-ngoc') {
    assert.equal(state.mapArt.status, 'concept-preview');
    assert.equal(state.mapArt.backgroundUrl, conceptUrl);
    assert.equal(state.mapArt.nativeWidth, 1536);
    assert.equal(state.mapArt.nativeHeight, 1024);
    assert.deepEqual(state.mapParts, [], 'Old layered parts must not cover the new concept.');
    assert.deepEqual(state.mapBackground, { url: conceptUrl, nativeWidth: 1536, nativeHeight: 1024,
      width: 3072, height: 2048, sampling: 'linear' }, 'The loaded texture and actual render plane must match the review contract.');
  } else if (id === 'van-ngoc-detail') {
    assert.equal(state.mapArt.status, 'art-baseline');
    assert.equal(state.mapArt.backgroundUrl, detailArt.backgroundUrl);
    assert.equal(state.mapArt.nativeWidth, 3072);
    assert.equal(state.mapArt.nativeHeight, 2048);
    assert.equal(state.mapArt.sha256, detailArt.sha256);
    assert.equal(state.mapArt.sectorCount, detailArt.sectorCount);
    assert.equal(state.mapArt.ownerApproved, true);
    assert.equal(state.mapArt.artApproved, true);
    assert.equal(state.mapArt.approvalScope, 'baked-background-art-baseline');
    assert.equal(state.mapArt.productionLayersApproved, false);
    assert.equal(state.mapArt.exactFootprintVerified, false);
    assert.deepEqual(state.mapParts, []);
    assert.deepEqual(state.mapBackground, { url: detailArt.backgroundUrl, nativeWidth: 3072,
      nativeHeight: 2048, width: 3072, height: 2048, sampling: 'nearest' });
  } else {
    assert.equal(state.mapArt.status, 'runtime');
    assert.equal(state.mapArt.backgroundUrl, release.background.url);
    assert.equal(state.mapParts.length, 32);
    assert.equal(state.mapParts.filter(part => part.cover).length, 10);
    assert.equal(state.mapBackground, undefined, 'Restoring the layered scene must clear its flat background.');
  }
  await waitFor(() => page.locator('.dao-minimap img').evaluate((image, url) =>
    image.complete && image.naturalWidth > 0 && new URL(image.currentSrc).pathname === url,
  state.mapArt.backgroundUrl), 'Selected artwork reaches the minimap');
  return state;
};
const switchArt = async id => {
  await page.locator('#menu-button').click();
  await page.locator('#map-art').selectOption(id);
  const state = await selectedArt(id);
  await page.locator('#menu-close').click();
  return state;
};
try {
  // This fixture serves client assets only and cannot run the Editor storage plugin.
  const config = resolve(fixture, 'vite.mjs');
  await writeFile(config, `export default {
    root:${JSON.stringify(resolve('client'))}, publicDir:${JSON.stringify(resolve('client/public'))},
    cacheDir:${JSON.stringify(resolve(fixture, 'vite-cache'))},
    resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},
    server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}
  };`);
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5199'], origin,
    { VITE_SERVER_URL: endpoint });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: [...(process.env.TEST_NATIVE_GPU === '1' ? [] : ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']),
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  await page.goto(`${origin}/hang-nhac.html?devGuest=1&review=map-art-smoke#fixture`);
  const initial = await selectedArt('current');
  assert.equal(own(initial).x, release.world.spawn.x);
  assert.equal(own(initial).y, release.world.spawn.y);
  checks.push('default_preserves_current_32_parts_and_10_covers', 'native_character_camera_world_and_owner_spawn');

  await page.locator('#join').click();
  await page.waitForFunction(() => window.__hangNhacDiagnostics().status === 'connected' && window.__hangNhacR01().own?.profileId);
  const connected = await diagnostic();
  const profileId = await page.evaluate(() => window.__hangNhacR01().own.profileId);
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  const assertSameSession = async state => {
    assert.equal(state.status, 'connected');
    assert.equal(state.sessionId, connected.sessionId);
    assert.equal(state.roomId, connected.roomId);
    assert.equal(state.serverMapVersion, release.version);
    assert.equal(await page.evaluate(() => window.__hangNhacR01().own.profileId), profileId);
    assert.equal(await page.evaluate(() => performance.timeOrigin), timeOrigin, 'Switching artwork must not reload the game.');
  };
  const preview = await switchArt('van-ngoc');
  await assertSameSession(preview);
  const selectedUrl = new URL(page.url());
  assert.equal(selectedUrl.searchParams.get('mapArt'), 'van-ngoc');
  assert.equal(selectedUrl.searchParams.get('devGuest'), '1');
  assert.equal(selectedUrl.searchParams.get('review'), 'map-art-smoke');
  assert.equal(selectedUrl.hash, '#fixture');
  const sourceDimensions = await page.locator('.dao-minimap img').evaluate(image => [image.naturalWidth, image.naturalHeight]);
  assert.deepEqual(sourceDimensions, [1536, 1024]);
  assert.equal(preview.mapArt.worldWidth / sourceDimensions[0], 2);
  assert.equal(preview.mapArt.worldHeight / sourceDimensions[1], 2);
  checks.push('flat_concept_uses_native_bitmap_at_world_scale_2_without_old_layers', 'live_switch_preserves_online_room_session_profile_and_other_url_params');

  // Same-page modal; check its decoded image below instead of waiting for navigation.
  await page.locator('.dao-minimap').click({ noWaitAfter: true });
  await waitFor(() => page.locator('.dao-world-map img').evaluate((image, url) =>
    image.complete && image.naturalWidth === 1536 && new URL(image.currentSrc).pathname === url,
  conceptUrl), 'Expanded world map uses the concept');
  await page.locator('[data-dao-close]').click();
  await page.locator('#journal').click();
  await page.waitForSelector('#sect-dialog[open] .sect-minimap');
  assert.ok(await page.locator('.sect-minimap').evaluate((map, url) =>
    getComputedStyle(map).backgroundImage.includes(url), conceptUrl), 'The journal map must use the selected concept.');
  await page.locator('#sect-close').click();
  await page.screenshot({ path: resolve(output, 'van-ngoc-desktop.png') });
  checks.push('minimap_expanded_map_and_journal_follow_selected_artwork');

  await assertSameSession(await switchArt('current'));
  assert.notEqual(new URL(page.url()).searchParams.get('mapArt'), 'van-ngoc');
  await assertSameSession(await switchArt('van-ngoc'));
  checks.push('switch_back_restores_original_layered_runtime_and_returns_to_preview');

  const detailed = await switchArt('van-ngoc-detail');
  await assertSameSession(detailed);
  assert.equal(new URL(page.url()).searchParams.get('mapArt'), 'van-ngoc-detail');
  assert.deepEqual(await page.locator('.dao-minimap img').evaluate(image => [image.naturalWidth, image.naturalHeight]), [3072, 2048]);
  await page.locator('.dao-minimap').click({ noWaitAfter: true });
  await waitFor(() => page.locator('.dao-world-map img').evaluate((image, url) =>
    image.complete && image.naturalWidth === 3072 && new URL(image.currentSrc).pathname === url,
  detailArt.backgroundUrl), 'Expanded world map uses the detailed background');
  await page.locator('[data-dao-close]').click();
  await page.locator('#journal').click();
  await page.waitForSelector('#sect-dialog[open] .sect-minimap');
  assert.ok(await page.locator('.sect-minimap').evaluate((map, url) =>
    getComputedStyle(map).backgroundImage.includes(url), detailArt.backgroundUrl));
  await page.locator('#sect-close').click();
  await page.screenshot({ path: resolve(output, 'van-ngoc-detail-desktop.png') });
  await assertSameSession(await switchArt('current'));
  await assertSameSession(await switchArt('van-ngoc-detail'));
  checks.push('detail_native_texture_with_same_character_world_session_and_navigation', 'detail_minimap_world_map_journal_and_layer_restore');

  await page.reload();
  await selectedArt('van-ngoc-detail');
  await page.waitForFunction(() => window.__hangNhacDiagnostics().status === 'connected' && window.__hangNhacR01().own?.profileId);
  assert.equal(await page.evaluate(() => window.__hangNhacR01().own.profileId), profileId);
  assert.equal(new URL(page.url()).searchParams.get('mapArt'), 'van-ngoc-detail');
  checks.push('query_selected_preview_and_profile_survive_reload');

  await page.setViewportSize({ width: 390, height: 844 });
  await waitFor(async () => (await diagnostic()).viewport.width <= 390, 'Mobile renderer resized');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('.dao-mobile-dock [data-dao-systems]').click();
  await page.locator('.dao-directory-item[data-dao-feature=settings]').click();
  const select = await page.locator('#map-art').boundingBox();
  assert.ok(select.x >= 0 && select.x + select.width <= 390, 'Artwork selector must fit the mobile viewport.');
  await page.locator('#map-art').selectOption('current');
  await selectedArt('current');
  await page.locator('#map-art').selectOption('van-ngoc');
  await selectedArt('van-ngoc');
  await page.locator('#map-art').selectOption('van-ngoc-detail');
  await selectedArt('van-ngoc-detail');
  await page.locator('#menu-close').click();
  const beforeMove = own(await diagnostic());
  const west = await page.locator('[data-input=west]').boundingBox();
  assert.ok(west.width >= 44 && west.height >= 44);
  await page.mouse.move(west.x + west.width / 2, west.y + west.height / 2);
  await page.mouse.down(); await page.waitForTimeout(450); await page.mouse.up();
  await waitFor(async () => own(await diagnostic()).x < beforeMove.x - 10, 'Mobile input still moves the player in the preview');
  assert.ok(own(await diagnostic()).walkable);
  unchangedContracts(await diagnostic());
  await page.screenshot({ path: resolve(output, 'van-ngoc-detail-mobile.png') });
  checks.push('mobile_selector_fits_and_switches_artwork', 'mobile_touch_movement_and_native_scale_remain_valid');

  await page.locator('#leave').click();
  await page.waitForFunction(() => window.__hangNhacDiagnostics().status === 'idle');
  await selectedArt('van-ngoc-detail');
  assert.equal(await readFile('shared/data/hang-nhac.json', 'utf8'), releaseSource);
  assert.deepEqual(errors, []);
  const report = { passed: true, checks, errors, version: release.version,
    sourceDimensions, preview: preview.mapArt, detailPreview: detailed.mapArt, fixtureOnly: true,
    ownerNavigationEdited: false, ownerDatabaseUsed: false,
    screenshots: [resolve(output, 'van-ngoc-desktop.png'), resolve(output, 'van-ngoc-detail-desktop.png'), resolve(output, 'van-ngoc-detail-mobile.png')] };
  await writeFile(resolve(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(JSON.stringify({ checks, errors, game: await page?.evaluate(() => window.__hangNhacDiagnostics?.()),
    mapImages: await page?.locator('.dao-world-map img, .dao-minimap img').evaluateAll(images => images.map(image =>
      ({ src: image.src, currentSrc: image.currentSrc, complete: image.complete,
        width: image.naturalWidth, height: image.naturalHeight }))),
    backend: backend.output(), vite: vite?.output() }, null, 2));
  await page?.screenshot({ path: resolve(output, 'failure.png') });
  throw error;
} finally { await browser?.close(); vite?.stop(); backend.stop(); }
