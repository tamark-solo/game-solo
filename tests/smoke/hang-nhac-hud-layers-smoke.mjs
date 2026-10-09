import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService, waitFor } from '../support/services.mjs';

const origin = 'http://127.0.0.1:5199', endpoint = 'http://127.0.0.1:2599';
await mkdir('artifacts', { recursive: true });
const folder = await mkdtemp(resolve('artifacts/hn-hud-layers-'));
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`,
  { PORT: '2599', GAME_DB_PATH: resolve(folder, 'profiles.sqlite') });
let vite, browser, page;
const errors = [], checks = [];
const state = page => page.evaluate(() => window.__hangNhacR01());
try {
  // No Editor storage plugin: this fixture cannot write an owner's authored project.
  const config = resolve(folder, 'vite.mjs');
  await writeFile(config, `export default {
    root:${JSON.stringify(resolve('client'))}, publicDir:${JSON.stringify(resolve('client/public'))},
    resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},
    server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}},
    plugins:[{name:'isolated-render-fixture',configureServer(server){server.middlewares.use((req,res,next)=>{
      if(req.url!=='/__render-test')return next();res.setHeader('Content-Type','text/html');
      res.end('<!doctype html><html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="stage" style="position:relative;width:800px;height:500px;overflow:hidden"><div id="world-labels" style="position:absolute;inset:0"></div></div></body></html>');
    });}}]
  };`);
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5199'], origin,
    { VITE_SERVER_URL: endpoint });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  await page.goto(`${origin}/hang-nhac.html`);
  await page.waitForFunction(() => window.__hangNhacDiagnostics?.().ready);
  assert.equal(await page.locator('[data-hotbar-skill]').count(), 3);
  assert.equal(await page.locator('.hotbar-reserved').count(), 7);
  assert.equal(await page.locator('.hotbar-reserved button').count(), 0);
  const initial = await page.evaluate(() => window.__hangNhacDiagnostics());
  assert.equal(initial.mapParts.length, 32); assert.equal(initial.mapParts.filter(part => part.cover).length, 10);
  assert.ok(await page.locator('.game-hotbar').evaluate(element => element.dataset.art === 'painted' && element.dataset.online === 'false'));
  await page.locator('#join').click();
  await page.waitForFunction(() => window.__hangNhacDiagnostics().status === 'connected' && window.__hangNhacR01().own?.connected);
  await page.waitForFunction(() => document.querySelector('.game-hotbar').dataset.online === 'true');
  assert.equal(await page.locator('[data-skill=thunder]').getAttribute('data-state'), 'target');
  await page.locator('[data-skill=thunder]').focus();
  assert.equal(await page.locator('.hotbar-tooltip').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.hotbar-tooltip').isVisible(), false);
  await page.locator('#stage').focus(); await page.keyboard.press('2');
  assert.equal((await state(page)).own.casts, 0);
  assert.match(await page.locator('#skill-feedback').textContent(), /mục tiêu/);
  const beforeOrb = await state(page);
  await page.locator('.hotbar-hp-track').click();
  assert.deepEqual((await state(page)).input.aim, beforeOrb.input.aim);
  assert.equal((await state(page)).own.casts, 0);
  checks.push('handshake_before_first_snapshot_safe', 'three_live_slots_seven_noninteractive_reservations',
    'missing_target_and_orb_click_do_not_send_cast_or_change_aim', 'tooltip_focus_and_escape');
  await page.locator('#training').click();
  await page.waitForFunction(() => document.querySelector('[data-skill=thunder]').dataset.state === 'ready');
  await page.locator('[data-skill=sword]').click();
  await page.waitForFunction(() => window.__hangNhacR01().own?.casts === 1);
  await page.waitForFunction(() => window.__hangNhacR01().own?.practiceHits === 1 && !window.__hangNhacR01().own.castId);
  await page.locator('[data-skill=thunder]').click();
  await page.waitForFunction(() => window.__hangNhacR01().own?.practiceHits === 2 && !window.__hangNhacR01().own.castId);
  await page.locator('#stage').focus(); await page.keyboard.press('3');
  await page.waitForFunction(() => window.__hangNhacR01().own?.casts === 3 && !window.__hangNhacR01().own.castId);
  await waitFor(() => page.evaluate(() => {
    const own = window.__hangNhacR01().own;
    return document.querySelector('.hotbar-hp-value').textContent === String(Math.floor(own.hp)) &&
      document.querySelector('.hotbar-mp-value').textContent === String(Math.floor(own.mp));
  }), 'HUD resources match authoritative snapshot');
  assert.equal(await page.locator('[data-skill=wind]').getAttribute('data-state'), 'cooldown');
  await page.locator('#hud-effects').uncheck();
  assert.equal(await page.locator('.game-hotbar').getAttribute('data-effects'), 'off');
  await page.locator('#hud-effects').check();
  const desktop = await page.locator('.game-hotbar').boundingBox();
  assert.equal(desktop.width, 760); assert.equal(desktop.height, 140);
  await page.screenshot({ path: 'artifacts/hang-nhac-hud-desktop.png' });
  const completed = await state(page);
  await page.reload();
  await page.waitForFunction(() => window.__hangNhacDiagnostics?.().status === 'connected' && window.__hangNhacR01().own?.profileId);
  assert.equal((await state(page)).own.profileId, completed.own.profileId);
  assert.equal((await state(page)).own.casts, 3);
  checks.push('keyboard_and_hotbar_buttons_use_server_casts', 'resources_and_cooldown_from_snapshot',
    'approved_desktop_dimensions_and_effect_toggle', 'reload_preserves_profile_and_cast_count');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const mobile = await page.locator('.game-hotbar').boundingBox();
  assert.ok(mobile.x >= 0 && mobile.x + mobile.width <= 390);
  for (const id of ['sword', 'thunder', 'wind']) {
    const button = await page.locator(`[data-skill=${id}]`).boundingBox();
    assert.ok(button.width >= 44 && button.height >= 44);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'artifacts/hang-nhac-hud-mobile.png' });
  checks.push('mobile_no_horizontal_overflow_and_minimum_touch_targets', 'reduced_motion_view');
  await page.locator('#leave').click();
  await page.waitForFunction(() => window.__hangNhacDiagnostics().status === 'idle');
  assert.equal(await page.locator('.game-hotbar').getAttribute('data-online'), 'false');

  // Visual-only fixture: positions here test rendering, not walkability or gameplay rewards.
  const gpu = await context.newPage();
  gpu.on('pageerror', error => errors.push(error.message));
  await gpu.goto(`${origin}/__render-test`);
  const renderCases = await gpu.evaluate(async () => {
    const rendererPath = '/src/render/renderer.ts', animationPath = '/src/assets/animation.ts';
    const { PreviewRenderer } = await import(rendererPath), { AnimationPlayer } = await import(animationPath);
    const release = await fetch('/assets/hang-nhac/manifest.json').then(response => response.json());
    const catalog = await fetch('/assets/catalog.json').then(response => response.json());
    const definition = catalog.actors.find(actor => actor.id === 'CHR-WANG-LIN-CHIBI');
    const renderer = new PreviewRenderer(document.getElementById('stage'), document.getElementById('world-labels'));
    renderer.zoom = 1; renderer.debug = false; renderer.mode = 'map';
    await Promise.all([renderer.loadActors([definition]), renderer.loadAuthoredMap(release.scene)]);
    const asset = release.scene.assets.find(asset => asset.id === 'route-v6-tree-courtyard-west-north');
    const object = release.scene.objects.find(object => object.assetId === asset.id);
    const actor = { id: 'render-fixture', assetId: definition.id, name: 'Kiểm layer', own: true,
      x: object.x, y: object.y - 20, direction: 'south', moving: false,
      animation: new AnimationPlayer(renderer.assets.get(definition.id).atlas) };
    renderer.cameraCenter = { x: object.x, y: object.y - 50 };
    const sample = (x, y) => {
      actor.x = x; actor.y = y; renderer.render([actor]);
      const parts = renderer.mapDiagnostics();
      const cover = parts.find(part => part.assetId === asset.id && part.cover);
      const body = parts.find(part => part.assetId === asset.id && !part.cover);
      const sprite = renderer.scene.children.find(child => child.userData.entityId === actor.id);
      return { coverOpacity: cover.opacity, bodyOpacity: body.opacity, coverOrder: cover.order, actorOrder: sprite.renderOrder };
    };
    const behind = sample(object.x, object.y - 20);
    const front = sample(object.x, object.y + 24);
    const transparentCorner = sample(object.x - asset.pivot.x - 20, object.y - asset.pivot.y + 12);
    window.__layerRenderSample = sample;
    sample(object.x, object.y - 20);
    return { behind, front, transparentCorner, partCount: renderer.mapDiagnostics().length };
  });
  assert.equal(renderCases.partCount, 32);
  assert.equal(renderCases.behind.coverOpacity, .35); assert.equal(renderCases.behind.bodyOpacity, 1);
  assert.ok(renderCases.behind.coverOrder > renderCases.behind.actorOrder);
  assert.equal(renderCases.front.coverOpacity, 1); assert.ok(renderCases.front.coverOrder < renderCases.front.actorOrder);
  assert.equal(renderCases.transparentCorner.coverOpacity, 1, 'transparent bounding-box overlap must not fade a canopy');
  await gpu.screenshot({ path: 'artifacts/hang-nhac-layer-occlusion.png' });
  await gpu.close();
  checks.push('32_gpu_parts_loaded', 'behind_canopy_alpha_overlap_fades_only_cover',
    'in_front_of_canopy_restores_opacity_and_actor_order', 'transparent_rectangle_overlap_does_not_fade');
  assert.deepEqual(errors, []);
  const report = { passed: true, checks, errors, renderCases, desktop, mobile,
    fixtureOnly: true, ownerNavigationEdited: false, ownerDatabaseUsed: false };
  await writeFile('artifacts/hang-nhac-hud-layers-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(JSON.stringify({ checks, errors, state: await page?.evaluate(() => window.__hangNhacR01?.()),
    backend: backend.output(), vite: vite?.output() }, null, 2));
  await page?.screenshot({ path: 'artifacts/hang-nhac-hud-layers-failure.png' });
  throw error;
} finally { await browser?.close(); vite?.stop(); backend.stop(); }
