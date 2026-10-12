import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

// Isolated Vite/browser only. No backend, real token, SQLite or map editor API.
const folder = resolve('artifacts/character-ui'); await mkdir(folder, { recursive: true });
const temporary = await mkdtemp(resolve(folder, 'fixture-'));
const config = resolve(temporary, 'vite.mjs'), origin = 'http://127.0.0.1:5232';
await writeFile(config, `export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(temporary, 'cache'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
let service, browser; const errors = [], requests = [], checks = [], layouts = [];
try {
  service = await startService(['node_modules/vite/bin/vite.js', '--config', config, '--port', '5232'], origin);
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { if (/\/api\/|\/matchmake|\/colyseus/.test(request.url())) requests.push(request.url()); });
  const state = () => page.evaluate(() => window.__characterPreview());
  const ready = () => page.waitForFunction(() => !window.__characterPreview().pending);
  const scenario = async value => { await page.locator('#review-controls summary').click(); await page.locator('#scenario').selectOption(value); };
  const capture = async name => {
    await page.evaluate(async () => {
      await document.fonts.ready;
      const urls = new Set();
      for (const element of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        for (const value of [style.backgroundImage, style.borderImageSource, style.maskImage]) for (const match of value.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/g)) urls.add(match[1] ?? match[2] ?? match[3]);
      }
      await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode(); }));
    });
    await page.screenshot({ path: resolve(folder, `${name}.png`) });
  };
  await page.goto(origin + '/character-ui.html'); await page.waitForFunction(() => document.body.dataset.ready === 'true');
  assert.equal((await state()).spritesReady, 3); await capture('desktop-overview');
  const hud = await page.locator('.game-hotbar').boundingBox(); assert.equal(hud.width, 760); assert.equal(hud.height, 140);
  checks.push('Original HUD 760 × 140 and three native 64 × 96 sprites at integer 2×');
  await page.locator('#tab-inventory').click();
  await page.locator('.item-cell[data-item="jade-sword"]').click();
  await page.locator('[data-action="equip"]').click(); await ready();
  assert.equal((await state()).equipped.weapon, 'jade-sword'); assert.equal((await state()).resources.maxMP, 108);
  await page.locator('[data-action="protect"]').click(); await ready();
  assert.equal((await state()).items.find(item => item.id === 'jade-sword').protected, true);
  await page.locator('.item-cell[data-item="lotus-pill"]').click();
  await page.locator('[data-action="use"]').click(); await ready();
  assert.equal((await state()).resources.hp, 100); assert.equal((await state()).items.find(item => item.id === 'lotus-pill').quantity, 7);
  assert.equal(await page.locator('[data-action="use"]').isDisabled(), true);
  await page.locator('#preview-avatar').selectOption('CHR-SITU-NAN');
  assert.equal((await state()).equipped.weapon, 'wood-sword'); assert.equal((await state()).resources.hp, 72);
  assert.match(await page.locator('#profile-pane').innerText(), /hồi phục|hồi phục|phục hồi/); assert.doesNotMatch(await page.locator('#profile-pane').innerText(), /Ngưng Khí/);
  await page.locator('#preview-avatar').selectOption('CHR-LI-MUWAN');
  assert.match(await page.locator('#profile-pane').innerText(), /Lý Mộ Uyển/);
  await page.locator('#preview-avatar').selectOption('CHR-WANG-LIN-CHIBI');
  assert.equal((await state()).equipped.weapon, 'jade-sword');
  checks.push('Equip/compare/resources/use/protection and three isolated in-memory profiles');
  await page.locator('#item-search').fill('không tìm thấy'); assert.equal(await page.locator('.item-cell').count(), 0);
  await page.locator('[data-action="clear-filter"]').click(); assert.equal(await page.locator('.item-cell').count(), 12);
  await page.locator('[data-category="material"]').click(); assert.equal(await page.locator('.item-cell').count(), 2);
  await page.locator('[data-category="all"]').click();
  await page.locator('.item-cell[data-item="cloud-pearl"]').click();
  assert.equal(await page.locator('#detail-pane .primary').isDisabled(), true);
  checks.push('Search/no results/category filters and explicit unavailable artifact condition');
  await scenario('save-error');
  await page.locator('.item-cell[data-item="cloud-robe"]').click();
  const before = await state(); await page.locator('[data-action="equip"]').click(); await ready();
  assert.deepEqual((await state()).equipped, before.equipped); assert.match(await page.locator('#preview-status').innerText(), /giữ nguyên/);
  await scenario('offline'); await page.locator('.item-cell[data-item="jade-sword"]').click();
  assert.equal(await page.locator('[data-action="equip"]').isDisabled(), true);
  await scenario('ready'); assert.deepEqual((await state()).equipped, before.equipped);
  await scenario('loading'); assert.match(await page.locator('#item-grid').innerText(), /Đang nạp/);
  await scenario('empty'); assert.equal(await page.locator('.item-cell').count(), 0); assert.match(await page.locator('#empty-inventory').innerText(), /trống/);
  checks.push('Loading/empty/offline/error/recovery preserves data and does not replay operations');
  await scenario('ready'); await page.locator('#tab-equipment').click(); assert.equal(await page.locator('.equipment-slots .equip-slot').count(), 3);
  await capture('desktop-equipment');
  await page.locator('#tab-inventory').click(); await page.locator('.item-cell[data-item="jade-sword"]').click(); await capture('desktop-inventory');
  await page.locator('#tab-inventory').focus(); await page.keyboard.press('ArrowRight'); assert.equal((await state()).tab, 'equipment');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#character-window').isVisible(), false);
  assert.equal(await page.locator('#open-character').evaluate(element => document.activeElement === element), true);
  await page.keyboard.press('c'); assert.equal(await page.locator('#character-window').isVisible(), true);
  checks.push('Keyboard tab navigation, close/reopen, focus restoration');

  // Resize the same live document, stressing the backing/frame box and long copy.
  await page.locator('#tab-inventory').click(); await scenario('long');
  for (const [width, height] of [[320,740],[390,844],[760,760],[980,780],[1100,800],[1366,900],[844,390]]) {
    await page.setViewportSize({ width, height });
    for (const scale of [1,1.5,2]) {
      await page.evaluate(scale => { document.body.style.setProperty('--ui-text-body', `${15*scale}px`); document.body.style.setProperty('--ui-text-small', `${12*scale}px`); }, scale);
      await page.locator('.item-cell[data-item="jade-sword"]').click();
      const measurements = await page.evaluate(() => {
        const frame = document.querySelector('#character-window'), surface = frame.querySelector('.vn-frame-surface');
        const box = frame.getBoundingClientRect(), backing = surface.getBoundingClientRect();
        const visible = node => { const r=node.getBoundingClientRect(); return r.width>0&&r.height>0; };
        const overflow = [...document.querySelectorAll('#character-window .ui-reading, #character-window .ui-copy-section, #detail-title, .character-tabs, .inventory-tools')].filter(visible).filter(node => node.scrollWidth > node.clientWidth+1).map(node=>node.id||node.className);
        return { overflow, pageOverflow: document.documentElement.scrollWidth > innerWidth+1, backing: ['x','y','width','height'].every(key=>Math.abs(box[key]-backing[key])<.75), inside: box.top>=0&&box.left>=0&&box.right<=innerWidth+1&&box.bottom<=innerHeight+1, readable: getComputedStyle(document.querySelector('.detail-copy')).fontSize };
      });
      assert.deepEqual(measurements.overflow, [], `text overflow ${width}×${height} / ${scale}`);
      assert.equal(measurements.pageOverflow, false); assert.equal(measurements.backing, true); assert.equal(measurements.inside, true);
      assert.equal(measurements.readable, `${15*scale}px`);
      layouts.push({ width, height, scale, ...measurements });
      if (width < 760) await page.locator('[data-action="back"]').click();
    }
  }
  checks.push('21 resize/long Vietnamese copy/font scale configurations with aligned backing and no horizontal text/page overflow');
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(()=>{ document.body.style.removeProperty('--ui-text-body');document.body.style.removeProperty('--ui-text-small'); });
  await scenario('many'); assert.equal(await page.locator('.item-cell').count(), 120);
  await page.locator('#character-content').evaluate(element=>element.scrollTop=element.scrollHeight);
  const scrollBefore = await page.locator('#character-content').evaluate(element=>element.scrollTop);
  await page.locator('.item-cell').last().click(); await page.locator('[data-action="back"]').click();
  assert.ok(Math.abs(await page.locator('#character-content').evaluate(element=>element.scrollTop)-scrollBefore)<2);
  await scenario('ready'); await capture('mobile-inventory');
  await page.locator('.item-cell[data-item="jade-sword"]').click(); await capture('mobile-detail');
  await page.keyboard.press('Escape'); assert.equal((await state()).detailOpen, false);
  assert.equal(await page.locator('.item-cell[data-item="jade-sword"]').evaluate(element=>element===document.activeElement), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const moving = await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length); assert.equal(moving, 0);
  checks.push('120-item mobile scroll restoration/detail back focus/reduced motion');

  // The v2 shrine is a body presentation only. All three actors animate using
  // their authored 4-frame clip; no inventory/resource/progression mutations.
  await page.setViewportSize({width:1366,height:900});
  await page.locator('#tab-overview').click();await page.emulateMedia({reducedMotion:'no-preference'});
  for(const avatar of ['CHR-WANG-LIN-CHIBI','CHR-SITU-NAN','CHR-LI-MUWAN']){
    await page.locator('#preview-avatar').selectOption(avatar);
    const before=await state();await page.locator('[data-action="pose"]').click();
    const seen=await page.evaluate(async()=>{
      const seen=new Set(),images=new Set(),end=performance.now()+1300;
      while(performance.now()<end){seen.add(window.__characterPreview().shrine.index);images.add(document.querySelector('.profile-sprite').toDataURL());await new Promise(resolve=>requestAnimationFrame(resolve));}
      return {frames:[...seen],pictures:images.size};
    });
    assert.ok(seen.frames.length>=3);assert.ok(seen.pictures>=3);assert.equal((await state()).shrine.cultivationReady,3);
    assert.deepEqual((await state()).resources,before.resources);assert.deepEqual((await state()).items,before.items);
    await capture(`v2-${avatar}-cultivation`);
    await page.locator('[data-action="pose"]').click();
  }
  checks.push('V2 cultivation body: three actors, >=3 distinct authored frames each, native 2×, no resource/item changes');
  await page.locator('[data-action="pose"]').click();
  await scenario('offline');assert.equal((await state()).shrine.moving,false);
  await scenario('ready');assert.equal((await state()).shrine.moving,true);
  await page.locator('#close-character').click();assert.equal((await state()).shrine.moving,false);
  await page.locator('#open-character').click();assert.equal((await state()).shrine.moving,true);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await state()).shrine.moving,false);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await state()).shrine.moving,true);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!window.__characterPreview().shrine.moving);
  assert.equal((await state()).shrine.index,2);
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0);
  checks.push('V2 motion freezes offline/hidden/closed, resumes without gameplay, and remains static under reduced motion');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-action="pose"]').click();
  await page.locator('[data-action="path"]').click();assert.equal(await page.locator('.dao-guide > div').count(),6);
  await page.locator('[data-action="path-back"]').click();
  await page.locator('#detail-pane [data-item="cloud-pearl"]').click();
  assert.equal((await state()).tab,'equipment');assert.equal((await state()).selectedId,'cloud-pearl');
  assert.equal(await page.locator('#detail-pane .primary').isDisabled(),true);
  checks.push('Six GDD growth dimensions and artifact shortcut retain explicit refinement condition');
  for(const [width,height] of [[320,740],[390,844],[760,760],[980,780],[1100,800],[1366,900],[844,390]]){
    await page.setViewportSize({width,height});await page.locator('#tab-overview').click();
    for(const scale of [1,1.5,2]){
      await page.evaluate(scale=>{document.body.style.setProperty('--ui-text-body',`${15*scale}px`);document.body.style.setProperty('--ui-text-small',`${12*scale}px`);},scale);
      const overflow=await page.evaluate(()=>[...document.querySelectorAll('.profile-pane,.primary-pane,.overview-note,.cultivation-card,.dao-milestones,.overview-skills')].filter(node=>node.getBoundingClientRect().width&&node.scrollWidth>node.clientWidth+1).map(node=>node.className));
      assert.deepEqual(overflow,[],`v2 overview overflow ${width}×${height} / ${scale}`);
      layouts.push({view:'v2-overview',width,height,scale,overflow});
    }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.body.style.removeProperty('--ui-text-body');document.body.style.removeProperty('--ui-text-small');});
  await capture('v2-mobile-overview');
  await page.setViewportSize({width:1366,height:900});await capture('desktop-overview');
  checks.push('V2 overview: 21 additional responsive/text configurations, no horizontal overflow');
  assert.deepEqual(requests, []); assert.deepEqual(errors, []);
  const storage = await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})); assert.deepEqual(storage,{local:0,session:0});
  checks.push('No gameplay API requests or browser save/storage writes');
  await writeFile(resolve(folder,'verification.json'),JSON.stringify({date:'2026-10-10',status:'passed',checks,layouts,errors,requests,storage},null,2)+'\n');
  console.log(`Character UI preview: ${checks.length} checks, ${layouts.length} responsive configurations passed.`);
} finally { await browser?.close(); service?.stop(); }
