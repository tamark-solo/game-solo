import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startService, waitFor } from './support/services.mjs';

const origin = 'http://127.0.0.1:5187', endpoint = 'http://127.0.0.1:2588';
const release = JSON.parse(await readFile('shared/data/hang-nhac.json', 'utf8'));
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`, { PORT: '2588', GAME_DB_PATH: ':memory:' });
let vite, browser;
const errors = [], checks = [];
const diagnostic = page => page.evaluate(() => window.__hangNhacDiagnostics());
const own = d => d.actors.find(a => a.own);
try {
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', 'vite.config.ts', '--port', '5187'], origin, { VITE_SERVER_URL: endpoint });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  const a = await context.newPage();
  a.on('pageerror', e => errors.push(e.message));
  a.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  a.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await a.goto(`${origin}/hang-nhac.html`); await a.waitForFunction(() => window.__hangNhacDiagnostics?.().ready);
  const initial = await diagnostic(a);
  assert.equal(initial.zoom, 1); assert.equal(initial.blockers, 9); assert.equal(initial.backgroundBytes, release.background.bytes);
  assert.deepEqual(own(initial).frameSize, [64, 96]); assert.deepEqual(own(initial).anchor, [32, 88]);
  assert.equal(own(initial).x, release.world.spawn.x); assert.equal(own(initial).y, release.world.spawn.y);
  assert.deepEqual(initial.sprites[0].scale, [64, 96, 1]);
  checks.push('native_camera_frame_anchor_and_owner_spawn');
  for (const id of ['CHR-SITU-NAN', 'CHR-LI-MUWAN', 'CHR-WANG-LIN-CHIBI']) {
    await a.locator('#avatar').selectOption(id); await a.locator('#stage').focus();
    const before = own(await diagnostic(a)); await a.keyboard.down('d'); await a.waitForTimeout(350); await a.keyboard.up('d');
    await a.waitForTimeout(100); const after = own(await diagnostic(a));
    assert.equal(after.assetId, id); assert.ok(after.x > before.x + 10); assert.ok(after.walkable);
  }
  checks.push('three_original_appearances_move_locally');
  await a.locator('#join').click(); await a.waitForFunction(() => window.__hangNhacDiagnostics().status === 'connected');
  const peerContext = await browser.newContext({ viewport: { width: 1440, height: 980 } });
  const b = await peerContext.newPage(); b.on('pageerror', e => errors.push(e.message));
  await b.goto(`${origin}/hang-nhac.html`); await b.waitForFunction(() => window.__hangNhacDiagnostics?.().ready);
  await b.locator('#avatar').selectOption('CHR-LI-MUWAN'); await b.locator('#join').click();
  await waitFor(async () => (await diagnostic(a)).actors.length === 2 && (await diagnostic(b)).actors.length === 2, 'two browsers see each other');
  assert.equal((await diagnostic(a)).roomId, (await diagnostic(b)).roomId);
  assert.equal((await diagnostic(a)).serverMapVersion, release.version);
  await a.bringToFront(); await a.locator('#stage').focus();
  await a.keyboard.down('d'); await a.waitForTimeout(6000); await a.keyboard.up('d'); await a.waitForTimeout(350);
  const wall = own(await diagnostic(a));
  assert.ok(wall.walkable && !wall.moving); assert.ok(wall.x > 1900 && wall.x < 2000);
  const peer = (await diagnostic(b)).actors.find(p => p.id === wall.id);
  assert.ok(Math.abs(peer.x - wall.x) < .01, `prediction must converge at owner wall: ${peer.x} / ${wall.x}`);
  checks.push('two_browser_sessions_same_map', 'prediction_reconciles_at_owner_blocker');
  await mkdir('artifacts', { recursive: true }); await a.screenshot({ path: 'artifacts/hang-nhac-online-desktop.png' });
  await a.locator('#leave').click(); await waitFor(async () => (await diagnostic(b)).actors.length === 1, 'leaving updates peer');
  await a.setViewportSize({ width: 390, height: 844 }); await a.waitForTimeout(150);
  const overflow = await a.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  const start = own(await diagnostic(a));
  const button = await a.locator('[data-input=west]').boundingBox();
  await a.mouse.move(button.x + button.width / 2, button.y + button.height / 2); await a.mouse.down(); await a.waitForTimeout(450); await a.mouse.up();
  assert.ok(own(await diagnostic(a)).x < start.x - 10);
  await a.screenshot({ path: 'artifacts/hang-nhac-mobile.png' });
  checks.push('mobile_without_overflow', 'pointer_controls_move_character', 'leave_updates_peer');
  assert.deepEqual(errors, []);
  const report = { passed: true, version: release.version, checks, errors, blockerStop: wall };
  await writeFile('artifacts/hang-nhac-browser-verification.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser?.close(); vite?.stop(); backend.stop(); }
