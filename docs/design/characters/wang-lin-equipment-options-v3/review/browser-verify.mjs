import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const reviewDirectory = dirname(fileURLToPath(import.meta.url));
const packDirectory = dirname(reviewDirectory);
const manifest = JSON.parse(readFileSync(join(packDirectory, 'manifest.json'), 'utf8'));
assert.equal(manifest.pending.length, 0, 'Pack must finish sources and registration before real browser verification.');
assert.equal(manifest.bodies.length, 9);
assert.equal(manifest.equipmentGroups.length, 4);
assert.equal(manifest.equipmentGroups.reduce((sum, group) => sum + group.variants.length, 0), 12);
const url = process.env.EQUIPMENT_OPTIONS_REVIEW_URL ?? 'http://127.0.0.1:5173/@fs/C:/Users/AnhLT/Documents/GM/game-solo/docs/design/characters/wang-lin-equipment-options-v3/index.html';
const report = { schema:'wang-equipment-options-browser-review-1', date:'2026-10-13', status:'running', artifactApproval:false, runtimeIntegrated:false, url, pageErrors:[], failedRequests:[], comparisons:[], controls:[] };
const screenshotDirectory = join(reviewDirectory, 'screenshots');
mkdirSync(screenshotDirectory, { recursive:true });
const browser = await chromium.launch({ executablePath:process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
try {
  const page = await browser.newPage({ viewport:{ width:1440, height:1180 }, deviceScaleFactor:1 });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.failedRequests.push({ url:request.url(), error:request.failure()?.errorText }));
  await page.goto(url);
  await page.waitForFunction(() => document.body.dataset.ready === 'true');
  const defaults = await page.evaluate(() => ({ state:equipmentOptionsReview.getState(), matrix:document.querySelectorAll('#combination-grid .combination-card').length, wardrobe:document.querySelectorAll('#wardrobe-grid .wardrobe-card').length }));
  assert.equal(defaults.state.artifact, 'bead');
  assert.equal(defaults.state.outfit, 'bead-cloud');
  assert.equal(defaults.state.color, 'cloud');
  assert.equal(defaults.matrix, 9);
  assert.equal(defaults.wardrobe, 9);
  report.defaults = defaults;
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.locator('#choose').screenshot({ path:join(screenshotDirectory, 'desktop.png') });

  await page.locator('[data-zoom="1"]').click();
  for (const group of manifest.equipmentGroups) {
    await page.locator(`[data-artifact="${group.id}"]`).click();
    for (const bodyId of group.bodyIds) {
      await page.locator(`[data-outfit="${bodyId}"]`).click();
      for (const variant of group.variants) {
        await page.locator(`[data-color="${variant.id}"]`).click();
        const actual = await page.evaluate(async ({ groupId, bodyId, variantId }) => {
          const review = equipmentOptionsReview;
          const { group, outfit, variant } = review.getSelection();
          const key = `${groupId}/${bodyId}/${variantId}`;
          const card = [...document.querySelectorAll('#combination-grid .combination-card')].find(item => item.dataset.key === key);
          const actualCanvas = card.querySelector('canvas');
          const frame = { canvas:variant.canvas, pivot:variant.pivot };
          const expected = document.createElement('canvas');
          expected.width = frame.canvas[0]; expected.height = frame.canvas[1];
          const context = expected.getContext('2d'); context.imageSmoothingEnabled = false;
          context.fillStyle = '#808a83'; context.fillRect(0,0,expected.width,expected.height);
          context.fillStyle = '#79837c';
          for (let y=0; y<expected.height; y+=16) for (let x=0; x<expected.width; x+=16) if ((x/16+y/16)%2) context.fillRect(x,y,16,16);
          const packed = new Image(); packed.src = variant.compositeFiles[bodyId]; await packed.decode();
          context.drawImage(packed,0,0);
          const a = actualCanvas.getContext('2d').getImageData(0,0,actualCanvas.width,actualCanvas.height).data;
          const b = context.getImageData(0,0,expected.width,expected.height).data;
          let maxChannelDifference=0, differentPixels=0, largerThanTolerance=0;
          for (let index=0; index<a.length; index+=4) {
            let different=false, pixelMax=0;
            for (let channel=0; channel<4; channel++) { const difference=Math.abs(a[index+channel]-b[index+channel]); maxChannelDifference=Math.max(maxChannelDifference,difference); pixelMax=Math.max(pixelMax,difference); if (difference) different=true; }
            if (different) differentPixels++;
            if (pixelMax>2) largerThanTolerance++;
          }
          const hashText=document.querySelector('#technical-detail').textContent;
          return { key, state:review.getState(), dimensions:[actualCanvas.width,actualCanvas.height], compositePath:variant.compositeFiles[bodyId], maxChannelDifference, differentPixels, largerThanTolerance, bodyHashShown:hashText.includes(outfit.sha256), gearHashShown:hashText.includes(variant.sha256), promptHashShown:!variant.promptSha256 || hashText.includes(variant.promptSha256), sourceHashShown:!variant.sourceSha256 || hashText.includes(variant.sourceSha256), selectedCard:card.classList.contains('selected') };
        }, { groupId:group.id, bodyId, variantId:variant.id });
        assert.equal(actual.state.artifact,group.id); assert.equal(actual.state.outfit,bodyId); assert.equal(actual.state.color,variant.id);
        assert.deepEqual(actual.dimensions,[256,224]); assert.equal(actual.largerThanTolerance,0,`${actual.key}: canvas differs from packed composite beyond alpha rounding tolerance.`);
        assert.ok(actual.selectedCard && actual.bodyHashShown && actual.gearHashShown && actual.promptHashShown && actual.sourceHashShown,`${actual.key}: selection/hash not shown.`);
        report.comparisons.push(actual);
      }
    }
  }
  assert.equal(report.comparisons.length,36);

  await page.locator('[data-artifact="bead"]').click();
  await page.locator('[data-outfit="bead-cloud"]').click();
  await page.locator('[data-color="cloud"]').click();
  for (const zoom of [1,2,4]) for (const background of ['gray','light','dark','map']) {
    await page.locator(`[data-zoom="${zoom}"]`).click();
    await page.locator('#background').selectOption(background);
    const control = await page.evaluate(() => ({ state:equipmentOptionsReview.getState(), cards:[...document.querySelectorAll('#combination-grid canvas')].map(canvas=>({ size:[canvas.width,canvas.height], css:[canvas.style.width,canvas.style.height], smoothing:canvas.getContext('2d').imageSmoothingEnabled })), overflow:document.documentElement.scrollWidth>innerWidth }));
    assert.equal(control.state.zoom,zoom); assert.equal(control.state.background,background); assert.equal(control.cards.length,9);
    for (const card of control.cards) { assert.deepEqual(card.size,[256*zoom,224*zoom]); assert.deepEqual(card.css,[`${256*zoom}px`,`${224*zoom}px`]); assert.equal(card.smoothing,false); }
    assert.equal(control.overflow,false); report.controls.push(control);
  }
  await page.locator('[data-zoom="1"]').click(); await page.locator('#background').selectOption('gray');
  await page.locator('#show-fx').uncheck();
  report.fxOff = await page.evaluate(() => ({ state:equipmentOptionsReview.getState(), canvasDigest:[...document.querySelector('#matrix-4').getContext('2d').getImageData(0,0,256,224).data].reduce((sum,value,index)=>(sum+value*(index%31+1))%2147483647,0) }));
  await page.locator('#show-fx').check();
  const fxOnDigest = await page.evaluate(() => [...document.querySelector('#matrix-4').getContext('2d').getImageData(0,0,256,224).data].reduce((sum,value,index)=>(sum+value*(index%31+1))%2147483647,0));
  assert.notEqual(report.fxOff.canvasDigest,fxOnDigest,'Cloud FX toggle must visibly change the canvas.');
  await page.locator('#show-fx').uncheck(); await page.locator('#show-gear').uncheck();
  report.bodyOnly = await page.evaluate(async () => {
    const { outfit,variant }=equipmentOptionsReview.getSelection(), frame=variant;
    const expected=document.createElement('canvas'); expected.width=256; expected.height=224;
    const ctx=expected.getContext('2d'); ctx.fillStyle='#808a83'; ctx.fillRect(0,0,256,224); ctx.fillStyle='#79837c';
    for(let y=0;y<224;y+=16)for(let x=0;x<256;x+=16)if((x/16+y/16)%2)ctx.fillRect(x,y,16,16);
    const image=new Image();image.src=outfit.file;await image.decode();ctx.drawImage(image,frame.pivot[0]-outfit.pivot[0],frame.pivot[1]-outfit.pivot[1]);
    const a=document.querySelector('#matrix-4').getContext('2d').getImageData(0,0,256,224).data,b=ctx.getImageData(0,0,256,224).data;
    let different=0;for(let index=0;index<a.length;index++)if(a[index]!==b[index])different++;
    return {state:equipmentOptionsReview.getState(),differentChannels:different};
  });
  assert.equal(report.bodyOnly.differentChannels,0); await page.locator('#show-fx').check(); await page.locator('#show-gear').check();
  await page.locator('#pin-current').click(); await page.locator('[data-artifact="sword"]').click(); await page.locator('[data-outfit="sword-ink"]').click(); await page.locator('[data-color="ink"]').click(); await page.locator('#pin-current').click();
  report.favoritesTwo = await page.evaluate(() => equipmentOptionsReview.getFavorites()); assert.equal(report.favoritesTwo.length,2);
  await page.locator('#favorite-grid [data-pin="bead/bead-cloud/cloud"]').click();
  report.afterUnpin = await page.evaluate(() => equipmentOptionsReview.getFavorites()); assert.equal(report.afterUnpin.length,1);
  const beforeReload = await page.evaluate(() => ({ state:equipmentOptionsReview.getState(), hash:location.hash }));
  await page.reload(); await page.waitForFunction(() => document.body.dataset.ready==='true');
  const afterReload = await page.evaluate(() => ({ state:equipmentOptionsReview.getState(), favorites:equipmentOptionsReview.getFavorites().length, hash:location.hash }));
  for(const key of ['artifact','outfit','color'])assert.equal(afterReload.state[key],beforeReload.state[key]); assert.equal(afterReload.hash,beforeReload.hash); assert.equal(afterReload.favorites,0);
  report.reload = { beforeReload,afterReload };

  report.sourceDecode = await page.evaluate(async () => {
    const review=equipmentOptionsReview, items=[...review.bodies,...review.groups.flatMap(group=>group.variants)], sources=[...new Set(items.map(item=>item.raw).filter(Boolean))], newSources=[...new Set(items.filter(item=>!item.copyPrevious).map(item=>item.raw).filter(Boolean))];
    const decoded=[];for(const source of sources){const image=new Image();image.src=source;await image.decode();decoded.push({file:source,size:[image.naturalWidth,image.naturalHeight]});}
    return {total:decoded.length,newSources:newSources.length,decoded};
  });
  assert.equal(report.sourceDecode.newSources,17); assert.equal(report.sourceDecode.total,20);
  await page.locator('[data-artifact="bead"]').click(); await page.locator('[data-outfit="bead-cloud"]').click(); await page.locator('[data-color="cloud"]').click(); await page.locator('[data-zoom="1"]').click();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.locator('#combinations').screenshot({ path:join(screenshotDirectory,'selection-grid.png') });
  const mobilePage=await browser.newPage({viewport:{width:390,height:1000},deviceScaleFactor:1});
  mobilePage.on('pageerror',error=>report.pageErrors.push(error.message));mobilePage.on('requestfailed',request=>report.failedRequests.push({url:request.url(),error:request.failure()?.errorText}));
  await mobilePage.goto(url);await mobilePage.waitForFunction(()=>document.body.dataset.ready==='true');
  await mobilePage.locator('.preview-panel').scrollIntoViewIfNeeded();
  await mobilePage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await mobilePage.screenshot({path:join(screenshotDirectory,'mobile.png')});
  report.mobile = await mobilePage.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyOverflow:document.documentElement.scrollWidth>innerWidth,matrix:document.querySelectorAll('#combination-grid .combination-card').length,wardrobe:document.querySelectorAll('#wardrobe-grid .wardrobe-card').length,bodyChoices:document.querySelectorAll('.outfit-choice').length,paletteChoices:document.querySelectorAll('.color-choice').length,state:equipmentOptionsReview.getState(),horizontalScroll:document.querySelector('.stage-scroll').scrollLeft}));
  assert.equal(report.mobile.width,390); assert.equal(report.mobile.bodyOverflow,false); assert.equal(report.mobile.bodyChoices,3); assert.equal(report.mobile.paletteChoices,3);assert.equal(report.mobile.state.zoom,1);assert.equal(report.mobile.state.color,'cloud');assert.equal(report.mobile.horizontalScroll,0);
  assert.equal(report.pageErrors.length,0); assert.equal(report.failedRequests.length,0);
  report.screenshots = ['review/screenshots/desktop.png','review/screenshots/mobile.png','review/screenshots/selection-grid.png'];
  report.status='passed';
} catch(error) { report.status='failed'; report.error=error.stack; throw error; }
finally { writeFileSync(join(reviewDirectory,'browser-verification.json'),JSON.stringify(report,null,2)+'\n'); await browser.close(); }
console.log(JSON.stringify({status:report.status,comparisons:report.comparisons.length,controls:report.controls.length,sources:report.sourceDecode,errors:report.pageErrors.length,mobile:report.mobile}));
