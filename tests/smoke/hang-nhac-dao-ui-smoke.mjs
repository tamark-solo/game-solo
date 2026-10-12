import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

const origin = 'http://127.0.0.1:5248', endpoint = 'http://127.0.0.1:2648';
const captures = resolve('artifacts/hang-nhac-dao-ui');
await mkdir(captures, { recursive: true });
const fixture = await mkdtemp(resolve(captures, 'fixture-')), dbPath = resolve(fixture, 'profiles.sqlite');
const ownerPath = resolve('docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json');
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex');
const ownerBefore = await hash(ownerPath), checks = [], layouts = [], errors = [];
let backend, vite, browser, page;

try {
  backend = await startService(['--import', 'tsx', 'server/src/index.ts'], `${endpoint}/ready`, {
    PORT: '2648', GAME_DB_PATH: dbPath, GAME_ALLOW_GUEST: '0',
    GAME_NODE_ID: 'dao-ui-fixture', GAME_ALLOWED_ORIGINS: origin,
  });
  const config = resolve(fixture, 'vite.mjs');
  await writeFile(config, `export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(fixture, 'cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5248'], origin, { VITE_SERVER_URL: endpoint });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    args: ['--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) errors.push(`${response.status()} ${response.url()}`); });
  const own = () => page.evaluate(() => window.__hangNhacR01().own);
  const phase = expected => page.waitForFunction(expected => window.__gameEntry?.().phase === expected && !window.__gameEntry().busy, expected, { timeout: 45000 });
  const shot = async name => {
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.currentSrc).map(image => image.decode().catch(() => {}))); });
    await page.screenshot({ path: resolve(captures, `${name}.png`) });
  };
  const closeCharacter = async () => { await page.locator('#character-dialog [data-close]').click(); await page.waitForSelector('#character-dialog:not([open])', { state: 'attached' }); };
  const openSystems = async () => { await page.locator('.dao-main-dock [data-dao-systems],.dao-mobile-dock [data-dao-systems]').filter({ visible: true }).click(); await page.waitForSelector('#dao-hud-dialog[open][data-screen=systems]'); };

  await page.goto(`${origin}/hang-nhac.html?screen=title`);
  await phase('title');
  await page.locator('#entry-title-start').click(); await phase('login');
  await page.locator('[data-entry-action="register-mode"]').click();
  await page.locator('#account-login').fill('daofixture');
  await page.locator('#account-password').fill('dao-fixture-password');
  await page.locator('[data-entry-form="auth"] button[type=submit]').click(); await phase('realms');
  await page.locator('[data-entry-realm="hang-nhac-1"]').click(); await phase('characters');
  await page.locator('[data-entry-action="create"]').click(); await phase('create');
  await page.locator('#new-character-name').fill('Thanh Ngọc Live');
  await page.locator('[data-entry-form="create"] button[type=submit]').click(); await phase('characters');
  await page.locator('[data-entry-action="play"]').click(); await phase('playing');
  await page.waitForFunction(() => window.__hangNhacR01().own?.connected && document.querySelector('.game-hotbar').dataset.online === 'true');
  await page.waitForFunction(() => document.querySelector('.dao-hud-coordinates')?.textContent === `${Math.round(window.__hangNhacR01().own.x)}, ${Math.round(window.__hangNhacR01().own.y)}`);
  const initial = await own();
  assert.equal(initial.name, 'Thanh Ngọc Live');
  assert.equal(await page.locator('#character-name').textContent(), initial.name);
  assert.equal(await page.locator('#game-shell').getAttribute('data-dao-theme'), 'tu-dao');
  assert.equal(await page.locator('#stage').getAttribute('data-dao-hud'), '05');
  assert.equal(await page.locator('#game-shell').getAttribute('data-dao-ux'), '05');
  assert.equal(await page.locator('[data-hotbar-skill]').count(), 3);
  assert.equal(await page.locator('.hotbar-reserved').count(), 7);
  assert.equal(await page.locator('.hotbar-reserved button').count(), 0);
  const native = await page.locator('.game-hotbar').boundingBox();
  assert.equal(native.width, 760); assert.equal(native.height, 140);
  await page.waitForFunction(() => document.querySelector('.game-hotbar').dataset.daoArt === 'ready' && document.querySelector('.game-hotbar').dataset.daoLayout === 'ready');
  const orbCenters = await page.evaluate(() => {
    const root = document.querySelector('.game-hotbar'), r = root.getBoundingClientRect(), style = getComputedStyle(root);
    return ['hp', 'mp'].map(role => {
      const orb = root.querySelector(role === 'hp' ? '.hotbar-health' : '.hotbar-mana').getBoundingClientRect();
      return { role, x: orb.x + orb.width / 2 - r.x, y: orb.y + orb.height / 2 - r.y, expectedX: parseFloat(style.getPropertyValue(`--dao-${role}-x`)), expectedY: parseFloat(style.getPropertyValue(`--dao-${role}-y`)) };
    });
  });
  for (const orb of orbCenters) { assert.ok(Math.abs(orb.x - orb.expectedX) < .1); assert.ok(Math.abs(orb.y - orb.expectedY) < .1); }
  const art = await page.evaluate(() => ({
    hotbar: getComputedStyle(document.querySelector('.game-hotbar')).getPropertyValue('--hotbar-frame-art'),
    frame: getComputedStyle(document.querySelector('#sect-objective'), '::after').borderImageSource,
    minimap: document.querySelector('.dao-minimap img').getAttribute('src'),
    mapParts: window.__hangNhacDiagnostics().mapParts.length,
    coverParts: window.__hangNhacDiagnostics().mapParts.filter(part => part.cover).length,
    hp: document.querySelector('.hotbar-hp-value').textContent,
    mp: document.querySelector('.hotbar-mp-value').textContent,
  }));
  assert.match(art.frame, /dao-dual-theme-v1\/tu-dao\/window.webp/);
  assert.match(await page.locator('.hotbar-frame').evaluate(node => getComputedStyle(node).backgroundImage), /dao-dual-theme-v1\/tu-dao\/hud.webp/);
  assert.match(art.minimap, /\/assets\/hang-nhac\//);
  assert.doesNotMatch(art.minimap, /concept/);
  assert.equal(art.mapParts, 32); assert.equal(art.coverParts, 10);
  assert.equal(Number(art.hp), initial.hp); assert.equal(Number(art.mp), initial.mp);
  // Review the new HUD against the owner's current baked ART, after checking
  // the unchanged default layered release above. Only fixture preferences change.
  await page.locator('#menu-button').click();
  await page.locator('#map-art').selectOption('van-ngoc-detail');
  await page.waitForFunction(() => window.__hangNhacDiagnostics().mapArt?.id === 'van-ngoc-detail' && !document.querySelector('#map-art').disabled);
  await page.locator('#menu-close').click();
  await shot('desktop-live-hud');
  assert.equal(await page.locator('#sect-objective').getAttribute('data-details'), 'compact');
  assert.equal(await page.locator('#quest-reward').isVisible(), false);
  await page.locator('#quest-details-toggle').click();
  assert.equal(await page.locator('#quest-details-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#quest-reward').isVisible(), true);
  await page.locator('#quest-details-toggle').click();
  await page.locator('#quest-title').focus(); await page.keyboard.press('Enter');
  await page.waitForSelector('#sect-dialog[open]'); await page.keyboard.press('Escape');
  assert.equal(await page.locator('.dao-world-dock .chapter-launch').count(), 1);
  await page.locator('.dao-world-dock .chapter-launch').click(); await page.waitForSelector('.chapter-dialog[open]'); await page.keyboard.press('Escape');
  checks.push('Live HUD05 uses confirmed identity and resources; compact quest disclosure, keyboard journal and docked journey launcher work without gameplay commands');

  await openSystems();
  assert.equal(await page.locator('.dao-directory-group').count(), 7);
  assert.equal(await page.locator('.dao-directory-item').count(), 38);
  const glyphs = await page.locator('.dao-directory-item .hud-glyph').evaluateAll(nodes => new Set(nodes.map(node => node.dataset.hudGlyph)).size);
  assert.equal(glyphs, 38);
  assert.equal(await page.locator('.dao-main-dock [data-dao-feature]').count(), 5);
  await page.locator('#dao-hud-search').fill('thuat phap');
  assert.equal(await page.locator('.dao-directory-item').count(), 1);
  assert.equal(await page.locator('.dao-directory-item').getAttribute('data-dao-feature'), 'spells');
  await page.locator('#dao-hud-search').fill('');
  await page.locator('[data-dao-pin=quest]').click();
  assert.match(await page.locator('.dao-directory-status').textContent(), /Đã ghim năm/);
  await page.locator('[data-dao-pin=artifact]').click();
  await page.locator('[data-dao-pin=quest]').click();
  assert.equal(await page.locator('.dao-main-dock [data-dao-feature]').count(), 5);
  assert.equal(await page.locator('.dao-main-dock [data-dao-feature=quest]').count(), 1);
  const guarded = await own();
  await page.locator('#dao-hud-dialog-title').click();
  await page.keyboard.down('w'); await page.keyboard.press('1'); await page.keyboard.press('f'); await page.waitForTimeout(250); await page.keyboard.up('w');
  const afterGuard = await own();
  assert.equal(afterGuard.casts, guarded.casts); assert.equal(afterGuard.x, guarded.x); assert.equal(afterGuard.y, guarded.y);
  await shot('desktop-directory');
  await page.locator('.dao-directory-item[data-dao-feature=artifact]').click();
  assert.match(await page.locator('.dao-feature-unavailable').textContent(), /Chưa mở/);
  assert.equal((await own()).casts, guarded.casts);
  assert.equal((await own()).hp, guarded.hp);
  await page.locator('#dao-hud-dialog [data-dao-close]').click();
  checks.push('38 shared glyphs, seven groups, accent-insensitive search, maximum five persistent pins, honest unavailable features and blocked gameplay under directory modal');

  await openSystems();await page.locator('.dao-directory-item[data-dao-feature=crafting]').click();
  await page.waitForSelector('.chapter-dialog[open]');assert.equal(await page.locator('[data-chapter-tab=crafting]').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#dao-hud-dialog').getAttribute('open'),null);
  const beforeCraftModal=await own();await page.keyboard.down('w');await page.keyboard.press('1');await page.keyboard.press('f');await page.waitForTimeout(250);await page.keyboard.up('w');
  const afterCraftModal=await own();assert.equal(afterCraftModal.x,beforeCraftModal.x);assert.equal(afterCraftModal.y,beforeCraftModal.y);assert.equal(afterCraftModal.casts,beforeCraftModal.casts);
  await shot('desktop-crafting');await page.keyboard.press('Escape');checks.push('HUD Luyện chế opens real chapter tab; movement and casts remain blocked under the player workspace');

  for (const [feature, tab] of [['character', 'overview'], ['inventory', 'inventory'], ['equipment', 'equipment'], ['cultivation', 'cultivation'], ['spells', 'spells']]) {
    await openSystems();
    await page.locator(`.dao-directory-item[data-dao-feature=${feature}]`).click();
    await page.waitForFunction(tab => window.__hangNhacCharacter().modal && window.__hangNhacCharacter().synced && window.__hangNhacCharacter().tab === tab, tab);
    assert.equal(await page.locator('#dao-hud-dialog').getAttribute('open'), null);
    if (feature === 'character') { await page.waitForFunction(() => window.__hangNhacCharacter().shrine.cultivationReady === 3); await shot('desktop-character'); }
    await closeCharacter();
  }
  await openSystems(); await page.locator('.dao-directory-item[data-dao-feature=quest]').click();
  await page.waitForSelector('#sect-dialog[open]'); assert.equal(await page.locator('.quest-journal').count(), 1);
  await page.locator('#sect-close').click();
  await openSystems(); await page.locator('.dao-directory-item[data-dao-feature=settings]').click();
  await page.waitForSelector('#game-menu[open]');
  await page.locator('#ui-reduced-motion').check(); assert.equal(await page.locator('#game-shell').getAttribute('data-motion'), 'reduce');
  await page.locator('#ui-reduced-motion').uncheck();
  await page.locator('#menu-close').click();
  await page.locator('.dao-minimap').click();
  await page.waitForSelector('#dao-hud-dialog[open][data-screen=map]');
  assert.equal(await page.locator('.dao-world-map [data-dao-station]').count(), 4);
  assert.equal(await page.locator('.dao-world-map [data-dao-player-dot]').isVisible(), true);
  const point = await page.locator('.dao-world-map [data-dao-player-dot]').evaluate(node => ({ left: parseFloat(node.style.left), top: parseFloat(node.style.top) }));
  assert.ok(Math.abs(point.left - initial.x / 3072 * 100) < .001); assert.ok(Math.abs(point.top - initial.y / 2048 * 100) < .001);
  await shot('desktop-world-map'); await page.keyboard.press('Escape');
  checks.push('Directory routes to real character tabs, inventory, journal and settings; world map reads position and four current NPCs; reduced motion remains a presentation preference');

  for (const [width, height] of [[1440, 980], [1366, 768], [1280, 720], [980, 780], [390, 844], [320, 740], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(100);
    const metrics = await page.evaluate(() => {
      const visible = node => { const r = node.getBoundingClientRect(), s = getComputedStyle(node); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const areas = ['.dao-live-identity', '.dao-live-target', '#sect-objective', '.dao-hud-map', '.dao-main-dock', '.dao-mobile-dock', '.game-hotbar'];
      const rectangles = Object.fromEntries(areas.map(selector => { const node = document.querySelector(selector), r = node.getBoundingClientRect(); return [selector, visible(node) ? { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom } : null]; }));
      const controls = [...document.querySelectorAll('.dao-runtime-hud button,#character-open,#leave,.dao-identity-cultivation,#quest-toggle,#quest-details-toggle,#quest-title,#quest-guide,#interact,#journal,#training,#basic-attack')].filter(visible);
      const obstructed = controls.filter(node => { const r = node.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !hit || !node.contains(hit); }).map(node => node.id || node.dataset.daoFeature || 'systems');
      const small = controls.filter(node => { const r = node.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; }).map(node => node.id || node.dataset.daoFeature);
      const blankQuestLabels = [...document.querySelectorAll('.quest-actions button')].filter(visible).filter(node => {
        const text = getComputedStyle(node);
        if (node.textContent.trim() && parseFloat(text.fontSize) >= 10) return false;
        return !['::before', '::after'].some(pseudo => {
          const label = getComputedStyle(node, pseudo);
          return label.display !== 'none' && label.visibility !== 'hidden' && parseFloat(label.fontSize) >= 10 && !['none', 'normal', '""', "''"].includes(label.content);
        });
      }).map(node => node.id);
      const outside = Object.entries(rectangles).filter(([, r]) => r && (r.x < -1 || r.y < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1)).map(([selector]) => selector);
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1, obstructed, small, blankQuestLabels, outside, rectangles };
    });
    assert.equal(metrics.overflow, false, `${width}x${height}`);
    assert.deepEqual(metrics.outside, [], `${width}x${height}: ${JSON.stringify(metrics)}`);
    assert.deepEqual(metrics.obstructed, [], `${width}x${height}: ${JSON.stringify(metrics)}`);
    assert.deepEqual(metrics.small, [], `${width}x${height}: ${JSON.stringify(metrics)}`);
    assert.deepEqual(metrics.blankQuestLabels, [], `${width}x${height}: quest actions must have readable labels`);
    if (width >= 1366) assert.ok(metrics.rectangles['.dao-main-dock'].x >= metrics.rectangles['.game-hotbar'].right - .1, `${width}x${height}: function seals must leave the native orb frame clear`);
    for (const id of ['quest-guide', 'interact', 'journal']) assert.match(await page.locator(`#${id}`).ariaSnapshot(), /button "[^"]*\S[^"]*"/, `${width}x${height}: ${id} must have an accessible name`);
    layouts.push({ width, height, ...metrics });
    await shot(`hud-${width}x${height}`);
    if (height < 521) {
      await page.locator('#quest-details-toggle').click(); await page.waitForSelector('#sect-dialog[open]'); await page.keyboard.press('Escape');
    }
    await openSystems();
    const modal = await page.locator('#dao-hud-dialog').boundingBox();
    assert.ok(modal.x >= 0 && modal.y >= 0 && modal.x + modal.width <= width + 1 && modal.y + modal.height <= height + 1);
    await page.locator('#dao-hud-search').fill('tu luyen'); assert.equal(await page.locator('.dao-directory-item').count(), 1);
    await page.locator('#dao-hud-search').fill('');
    if (width === 390) await shot('mobile-directory');
    await page.locator('#dao-hud-dialog [data-dao-close]').click();
  }
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await shot('mobile-reduced-motion');
  await page.setViewportSize({ width: 1440, height: 980 });
  // The initial title-screen route deliberately forces title on reload. Resume
  // gameplay from the ordinary game route without clearing profile or pin state.
  await page.evaluate(() => { const url = new URL(location.href); url.searchParams.delete('screen'); history.replaceState(null, '', url); });
  await page.reload(); await phase('playing');
  await page.waitForFunction(() => window.__hangNhacR01().own?.connected);
  assert.equal((await own()).profileId, initial.profileId);
  assert.equal(await page.locator('.dao-main-dock [data-dao-feature=quest]').count(), 1);
  assert.equal(await hash(ownerPath), ownerBefore);
  assert.deepEqual(errors, []);
  checks.push('Seven desktop/mobile/landscape HUD layouts keep controls reachable and within viewport, minimum 44px targets, native orb frame clear, modal search usable, pins and profile retained after reload; owner map bytes unchanged');
  await writeFile(resolve(captures, 'verification.json'), JSON.stringify({ passed: true, checks, layouts, art, orbCenters, errors, fixtureDb: dbPath, ownerMapSha256: ownerBefore, ownerDataUsed: false }, null, 2) + '\n');
  console.log(`Dao runtime UI: ${checks.length} groups, ${layouts.length} HUD layouts passed.`);
} catch (error) {
  if (page) { await page.screenshot({ path: resolve(captures, 'failure.png') }).catch(() => {}); console.log({ errors, entry: await page.evaluate(() => window.__gameEntry?.()).catch(() => null) }); }
  throw error;
} finally { await browser?.close(); vite?.stop(); backend?.stop(); }
