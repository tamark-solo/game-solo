import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const origin = 'http://127.0.0.1:5222';
await mkdir('artifacts', { recursive: true });
const folder = await mkdtemp(resolve('artifacts/hn-ui-resize-'));
const config = resolve(folder, 'vite.mjs');
await writeFile(config, `export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(folder,'vite-cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}},plugins:[{name:'frame-pixel-fixture',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url!=='/__frame-fixture')return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/src/game-shell.css"><link rel="stylesheet" href="/src/hang-nhac.css"><link rel="stylesheet" href="/src/quest-ui.css"><link rel="stylesheet" href="/src/van-ngoc-ui.css"><link rel="stylesheet" href="/src/van-ngoc-art.css"><link rel="stylesheet" href="/src/ui-reading.css"></head><body class="hang-nhac-game" style="background:rgb(255,0,255)"></body></html>');});}}]};`);
let vite, browser, page;
const checks = [], errors = [];
const shapes = [
  ['tracker-owner-example', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 460, 1024, 768],
  ['tracker-collapsed', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 160, 1366, 768],
  ['tracker-tall', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 680, 1920, 1080],
  ['tracker-mobile', 'aside', 'sect-objective', 'quest-tracker van-panel', 180, 192, 390, 844],
  ['tracker-mobile-collapsed', 'aside', 'sect-objective', 'quest-tracker van-panel', 160, 110, 320, 568],
  ['tracker-ultrawide', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 520, 2560, 1080],
  ['player', 'section', '', 'player-hud van-panel', 336, 82, 1366, 768],
  ['player-mobile', 'section', '', 'player-hud van-panel', 238, 72, 320, 568],
  ['utility', 'aside', '', 'skill-panel van-panel', 246, 154, 1024, 768],
  ['utility-mobile', 'aside', '', 'skill-panel van-panel', 126, 142, 320, 568],
  ['entry-desktop', 'div', '', 'entry-card van-panel', 880, 650, 1366, 768],
  ['entry-mobile', 'div', '', 'entry-card van-panel', 350, 600, 390, 844],
  ['entry-wide-short', 'div', '', 'entry-card van-panel', 940, 320, 1280, 420],
  ['entry-portrait', 'div', '', 'entry-card van-panel', 500, 680, 800, 900],
  ['npc', 'dialog', 'sect-dialog', 'van-panel', 660, 500, 1024, 768],
  ['npc-mobile', 'dialog', 'sect-dialog', 'van-panel', 358, 740, 390, 844],
  ['menu', 'dialog', 'game-menu', 'van-panel', 750, 590, 1024, 768],
  ['menu-mobile', 'dialog', 'game-menu', 'van-panel', 358, 740, 390, 844],
  ['avatar', 'button', '', 'avatar-choice', 130, 125, 1366, 768],
  ['avatar-mobile', 'button', '', 'avatar-choice', 92, 126, 390, 844],
  ['route', 'section', '', 'journal-map-panel', 480, 490, 1366, 768],
  ['route-mobile', 'section', '', 'journal-map-panel', 282, 430, 390, 844],
  ['tracker-breakpoint-before', 'aside', 'sect-objective', 'quest-tracker van-panel', 180, 192, 760, 800],
  ['tracker-breakpoint-after', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 460, 761, 800],
  ['tracker-dpr-125', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 460, 1024, 768, 1.25],
  ['entry-dpr-125', 'div', '', 'entry-card van-panel', 880, 650, 1366, 768, 1.25],
  ['tracker-dpr-150', 'aside', 'sect-objective', 'quest-tracker van-panel', 316, 460, 1024, 768, 1.5],
  ['entry-dpr-200', 'div', '', 'entry-card van-panel', 350, 600, 390, 844, 2],
];

const draw = async hidden => {
  await page.evaluate(async hidden => {
    document.querySelector('.vn-frame-surface').style.visibility = hidden ? 'hidden' : 'visible';
    const urls = new Set();
    for (const node of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
      const style = getComputedStyle(node, pseudo);
      for (const value of [style.backgroundImage, style.borderImageSource, style.maskImage])
        for (const match of value.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/g)) urls.add(match[1] ?? match[2] ?? match[3]);
    }
    await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode(); }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, hidden);
};
const pixels = async buffer => sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const exterior = image => {
  const { data, info } = image, marked = new Uint8Array(info.width * info.height), queue = new Int32Array(marked.length);
  let head = 0, tail = 0;
  const outsideColor = p => data[p * 4] > 247 && data[p * 4 + 1] < 8 && data[p * 4 + 2] > 247;
  const add = p => { if (!marked[p] && outsideColor(p)) { marked[p] = 1; queue[tail++] = p; } };
  for (let x = 0; x < info.width; x++) { add(x); add((info.height - 1) * info.width + x); }
  for (let y = 0; y < info.height; y++) { add(y * info.width); add(y * info.width + info.width - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % info.width, y = Math.floor(p / info.width);
    if (x) add(p - 1); if (x + 1 < info.width) add(p + 1);
    if (y) add(p - info.width); if (y + 1 < info.height) add(p + info.width);
  }
  return marked;
};
const leaks = (frameOnly, filled, outer) => {
  let count = 0;
  for (let p = 0; p < outer.length; p++) if (outer[p]) {
    let delta = 0;
    for (let channel = 0; channel < 3; channel++) delta = Math.max(delta, Math.abs(frameOnly.data[p * 4 + channel] - filled.data[p * 4 + channel]));
    if (delta > 12) count++;
  }
  return count;
};

try {
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5222'], origin);
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/__frame-fixture');
  let currentDpr = 1;
  for (const [name, tag, id, className, width, height, viewportWidth, viewportHeight, dpr = 1] of shapes) {
    if (dpr !== currentDpr) {
      await page.close(); page = await browser.newPage({ deviceScaleFactor: dpr });
      page.on('pageerror', error => errors.push(error.message)); await page.goto(origin + '/__frame-fixture'); currentDpr = dpr;
    }
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    await page.evaluate(async ({ tag, id, className, width, height }) => {
      document.body.replaceChildren();
      const frame = document.createElement(tag); frame.id = id; frame.className = className;
      if (tag === 'dialog') frame.open = true;
      Object.assign(frame.style, { position: 'fixed', left: `${(innerWidth - width) / 2}px`, top: `${(innerHeight - height) / 2}px`, right: 'auto', bottom: 'auto',
        width: `${width}px`, height: `${height}px`, minWidth: '0', minHeight: '0', maxWidth: 'none', maxHeight: 'none', margin: '0', filter: 'none' });
      frame.style.setProperty('--vn-frame-fill', 'rgb(0,255,0)');
      document.body.append(frame);
      const { attachFrameSurface } = await import('/src/frame-surface.ts'); attachFrameSurface(frame);
    }, { tag, id, className, width, height });
    const frame = page.locator('body > *'), box = await frame.boundingBox();
    const clip = { x: Math.floor(box.x - 8), y: Math.floor(box.y - 8), width: Math.ceil(box.width + 16), height: Math.ceil(box.height + 16) };
    await draw(true);
    const bare = await pixels(await page.screenshot({ clip })), outer = exterior(bare);
    const center = Math.floor(bare.info.height / 2) * bare.info.width + Math.floor(bare.info.width / 2);
    assert.equal(outer[center], 0, `${name}: painted frame must enclose its center`);
    await draw(false); const shot = await page.screenshot({ clip }), filled = await pixels(shot);
    const escapedPixels = leaks(bare, filled, outer);
    assert.equal(escapedPixels, 0, `${name}: background escaped outside the painted frame`);
    assert.ok(filled.data[center * 4 + 1] > 245 && filled.data[center * 4] < 8, `${name}: backing must still fill the center`);
    if (name === 'tracker-owner-example') {
      await writeFile(resolve(folder, 'tracker-fixed.png'), shot);
      // Recreate the old rectangular backing to prove the pixel check catches this bug.
      await frame.evaluate(node => { node.style.background = 'rgb(0,255,0)'; });
      const legacy = await pixels(await page.screenshot({ clip }));
      const legacyLeak = leaks(bare, legacy, outer);
      assert.ok(legacyLeak > 100, 'legacy full rectangle must fail the exterior pixel check');
      checks.push({ legacyRectangleDetected: true, escapedPixels: legacyLeak });
    }
    checks.push({ name, viewport: [viewportWidth, viewportHeight], frame: [width, height], dpr, escapedPixels });
  }
  assert.deepEqual(errors, []);
  const report = { passed: true, checks, errors, backendStarted: false, ownerDatabaseUsed: false, ownerMapEdited: false };
  await writeFile('artifacts/hang-nhac-ui-resize-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) { await page?.screenshot({ path: resolve(folder, 'failure.png') }); console.error(JSON.stringify({ checks, errors, folder, vite: vite?.output() }, null, 2)); throw error; }
finally { await browser?.close(); vite?.stop(); }
