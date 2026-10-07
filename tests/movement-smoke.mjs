import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startService, waitFor } from './support/services.mjs';

const endpoint = 'http://127.0.0.1:2581', url = 'http://127.0.0.1:5182';
const backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/health`, { PORT: '2581' });
let client, browser;
const timers = new Set();
const errors = [];
const measurements = [];
const socketLog = [];
const design = JSON.parse(await readFile('docs/data/client-tech-preview-design.json', 'utf8'));
const walkAsset = design.preview.assets.find(a => a.role === 'player_template');
const walkMetadata = JSON.parse(await readFile(walkAsset.metadataPath, 'utf8'));
try {
  client = await startService(['node_modules/vite/bin/vite.js', '--config', 'vite.config.ts', '--port', '5182'], url, { VITE_SERVER_URL: endpoint });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1050 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.routeWebSocket(`ws://127.0.0.1:2581/**`, socket => {
    socketLog.push({ url: socket.url(), event: 'open' });
    const server = socket.connectToServer();
    // Delay real WebSocket frames by 100 ms each way, with ordered arrival jitter.
    let upstreamAt = 0, downstreamAt = 0;
    let n = 0, closed = false;
    const delayed = (send, data, upstream) => {
      const jitter = [0, 12, -8, 5][n++ % 4];
      const last = upstream ? upstreamAt : downstreamAt;
      const at = Math.max(Date.now() + 100 + jitter, last + 1);
      if (upstream) upstreamAt = at; else downstreamAt = at;
      const timer = setTimeout(() => { timers.delete(timer); if (!closed) send(data); }, Math.max(0, at - Date.now())); timers.add(timer);
    };
    socket.onMessage(data => { socketLog.push({ event: 'up', bytes: data.length }); delayed(data => server.send(data), data, true); });
    server.onMessage(data => { socketLog.push({ event: 'down', bytes: data.length }); delayed(data => socket.send(data), data, false); });
    socket.onClose(() => { closed = true; void server.close(); });
    server.onClose(() => { closed = true; void socket.close(); });
  });
  // Playwright's WS mock does not synchronously reject Node-style options like
  // a browser does. Preserve the browser constructor contract so the SDK's
  // Node/browser fallback selects its normal browser branch under interception.
  await page.addInitScript(() => {
    window.WebSocket = new Proxy(window.WebSocket, {
      construct(target, args, newTarget) {
        if (args[1] && typeof args[1] === 'object' && !Array.isArray(args[1])) throw new TypeError('WebSocket protocols must be a string or string array.');
        return Reflect.construct(target, args, newTarget);
      },
    });
  });
  await page.goto(url);
  await page.waitForFunction(() => typeof window.__previewDiagnostics === 'function').catch(async error => {
    console.log(JSON.stringify({ errors, url: page.url(), content: (await page.content()).slice(0, 1800), clientLog: client.output(), serverLog: backend.output() })); throw error;
  });
  // This regression test measures the existing four-direction motion behavior.
  await page.locator('#actor').selectOption('CHR-WANG-LIN');
  await page.locator('[data-mode=map]').click();
  await page.locator('#stage').click();
  await page.keyboard.down('d'); await page.waitForTimeout(650); await page.keyboard.up('d');
  const mapAtRelease = await page.evaluate(() => window.__previewDiagnostics().actors[0].x);
  await page.waitForTimeout(180);
  const mapAtRest = await page.evaluate(() => window.__previewDiagnostics().actors[0].x);
  assert.ok(Math.abs(mapAtRest - mapAtRelease) < .1, 'local movement stops without drifting');
  assert.match(await page.locator('#frame-name').textContent(), /stand/);
  await page.locator('[data-zoom="4"]').click();
  await page.locator('#stage').click();
  await page.keyboard.down('a'); await page.waitForTimeout(150); await page.keyboard.up('a');
  const camera = await page.evaluate(() => window.__previewDiagnostics().camera);
  assert.ok(Math.abs(camera.x - Math.round(camera.x)) > .00001, 'camera preserves subpixel movement');
  measurements.push({ mode: 'local', postReleaseDriftPx: Math.abs(mapAtRest - mapAtRelease), cameraWorldX: camera.x });
  await page.locator('[data-mode=online]').click(); await page.locator('#join-room').click();
  await waitFor(async () => (await page.locator('.player-card.own').count()) === 1, 'join through delayed WebSocket').catch(async error => {
    console.log(JSON.stringify({ errors, status: await page.locator('#network-status').textContent(), socketLog: socketLog.slice(0, 15), backend: backend.output() })); throw error;
  });
  await page.waitForTimeout(700); await page.locator('#stage').click();
  const before = await page.evaluate(() => window.__previewDiagnostics());
  const ownId = before.sessionId;
  const beforeX = before.actors.find(p => p.id === ownId).x;
  await page.evaluate(() => {
    window.__movementSamples = [];
    window.__sampleMovement = true;
    function sample(t) {
      if (!window.__sampleMovement) return;
      const d = window.__previewDiagnostics(), a = d.actors.find(p => p.id === d.sessionId);
      if (a) window.__movementSamples.push({ t, x: a.x, y: a.y, frame: a.frame });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.keyboard.down('d'); await page.waitForTimeout(100);
  const early = await page.evaluate(() => window.__previewDiagnostics());
  const earlyLocal = early.actors.find(p => p.id === ownId), earlyServer = early.serverActors.find(p => p.id === ownId);
  assert.ok(earlyLocal.x > beforeX + 1, 'local prediction responds before the round trip');
  assert.ok(earlyLocal.x > earlyServer.x + 1, 'render is not waiting for the server snapshot');
  await page.waitForTimeout(650); await page.keyboard.up('d');
  await page.waitForTimeout(120);
  const afterStop = await page.evaluate(() => window.__previewDiagnostics().actors.find(p => p.id === window.__previewDiagnostics().sessionId).x);
  await page.waitForTimeout(350);
  const atRest = await page.evaluate(() => window.__previewDiagnostics());
  const rendered = atRest.actors.find(p => p.id === ownId), authoritative = atRest.serverActors.find(p => p.id === ownId);
  assert.ok(Math.abs(rendered.x - afterStop) < .25, 'release does not produce a long easing tail');
  assert.ok(Math.abs(rendered.x - authoritative.x) < .25, 'prediction converges to authoritative position');
  const samples = await page.evaluate(() => { window.__sampleMovement = false; return window.__movementSamples; });
  const standingSlides = samples.slice(1).filter((p, i) => p.frame.includes('stand') && Math.hypot(p.x - samples[i].x, p.y - samples[i].y) > .15);
  assert.equal(standingSlides.length, 0, 'visible travel does not use a planted stand frame');
  assert.ok(new Set(samples.filter(p => p.frame.includes('walk')).map(p => p.frame)).size >= 4, 'gait advances through distinct source poses');
  measurements.push({ mode: 'online', injectedOneWayLatencyMs: 100, jitterMs: [-8, 12], earlyLocalTravelPx: earlyLocal.x - beforeX,
    earlyServerTravelPx: earlyServer.x - beforeX, postReleaseDriftPx: Math.abs(rendered.x - afterStop), finalServerErrorPx: Math.abs(rendered.x - authoritative.x), standingSlideFrames: standingSlides.length });
  await page.keyboard.down('s'); await page.waitForTimeout(1700); await page.keyboard.up('s');
  await page.waitForTimeout(450);
  const collision = await page.evaluate(() => window.__previewDiagnostics());
  assert.ok(collision.actors.find(p => p.id === ownId).y <= 444.01, 'prediction respects the map boundary');
  assert.ok(collision.serverActors.find(p => p.id === ownId).y <= 444.01, 'server respects the same boundary');
  assert.deepEqual(errors, []);
  await mkdir('artifacts', { recursive: true });
  const result = { passed: true, nativeWalkFramesPerDirection: walkMetadata.animations.walk_east.length,
    newArtGenerated: design.newAnimationProduced,
    checks: ['distance_locked_gait', 'local_stop_no_drift', 'fractional_camera', 'prediction_before_server_roundtrip', 'stop_no_long_easing_tail', 'no_standing_slide_frames', 'prediction_converges_to_server', 'shared_collision_under_latency'], measurements };
  await writeFile('artifacts/movement-verification.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  for (const timer of timers) clearTimeout(timer);
  await browser?.close(); client?.stop(); backend.stop();
}
