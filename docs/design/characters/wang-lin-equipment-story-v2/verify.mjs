import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const m=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
const body=await readFile(resolve(root,m.body.file));
assert.equal(sha(body),'78d0fb7e2e159334e65707423d8da2e4608d75e0845dcd3db677a3d1d2a14431');
const actual=await sharp(resolve(root,'../../../../client/public/assets/hang-nhac-pixel-player/atlases/idle-southeast.png')).extract({left:2,top:2,width:64,height:96}).ensureAlpha().raw().toBuffer();
assert((await sharp(body).ensureAlpha().raw().toBuffer()).equals(actual),'Body must equal actual live pixels');
assert.equal(m.equipment.length,4);
const assets=[];
for(const e of m.equipment){
 assert.equal(e.ownerApproved,false);assert.equal(e.artApproved,false);
 const raw=await readFile(resolve(root,e.raw));assert.equal(sha(raw),e.sourceSha256);
 for(const file of [...new Set([e.frontFile,e.rearFile,e.fxRearFile,e.fxFile].filter(Boolean))]){
  const {data,info}=await sharp(resolve(root,file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual([info.width,info.height],e.canvas);let visible=0,edgeOpaque=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const a=data[(y*info.width+x)*4+3];if(a)visible++;
   if(a>=128&&(x===0||y===0||x===info.width-1||y===info.height-1))edgeOpaque++;
  }
  assert.equal(edgeOpaque,0,'No clipped opaque item edge: '+file);
  assets.push({id:e.id,file,canvas:e.canvas,pivot:e.pivot,visiblePixels:visible,sha256:sha(await readFile(resolve(root,file)))});
 }
 // Map comparison reads the approved web background; no scene/map mutation.
 await sharp(resolve(root,'review/map-courtyard-background.png')).composite([{input:await readFile(resolve(root,'review/'+e.id+'-equipped.png')),left:240-e.pivot[0],top:285-e.pivot[1]}]).png().toFile(resolve(root,'review/'+e.id+'-map-1x.png'));
}
const errors=[],failedLocal=[],browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const url='http://127.0.0.1:5173/@fs/'+root.replaceAll('\\','/')+'/index.html';
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:5173/')&&r.status()>=400&&!r.url().includes('favicon'))failedLocal.push({url:r.url(),status:r.status()});});
await page.goto(url,{waitUntil:'domcontentloaded'});
await page.waitForSelector('body[data-ready="true"]');
const scenarios=[];
for(const id of ['sword','banner','bead','chariot'])for(const zoom of [1,2,4])for(const background of ['dark','light','gray']){
 await page.selectOption('#equipment',id);
 await page.click('[data-zoom="'+zoom+'"]');
 await page.selectOption('#background',background);
 const info=await page.evaluate(()=>({width:document.getElementById('pair').width,height:document.getElementById('pair').height,smoothing:document.getElementById('pair').getContext('2d').imageSmoothingEnabled}));
 assert.equal(info.smoothing,false);scenarios.push({id,zoom,background,...info});
}
for(const id of ['show-body','show-gear','show-fx','show-roots','show-boxes'])if(await page.locator('#'+id).count()){
 await page.locator('#'+id).uncheck();await page.locator('#'+id).check();
}
await page.click('[data-zoom="2"]');await page.selectOption('#background','gray');await page.selectOption('#equipment','banner');
await page.screenshot({path:resolve(root,'review/desktop.png'),fullPage:true});
await page.locator('#pair').screenshot({path:resolve(root,'review/banner-pair-2x.png')});
await page.setViewportSize({width:390,height:844});
await page.click('[data-zoom="1"]');
const mobile=await page.evaluate(()=>({viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,canvasCSS:getComputedStyle(document.getElementById('pair')).width}));
assert(mobile.pageWidth<=mobile.viewport+1,'Only inner canvas containers may scroll horizontally');
await page.screenshot({path:resolve(root,'review/mobile.png'),fullPage:true});
await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(failedLocal,[]);
const result={schema:'story-equipment-review-verification-1',date:'2026-10-13',bodyExactLiveRGBA:true,bodySha256:sha(body),assets,scenarios,scenarioCount:scenarios.length,mobile,pageErrors:errors,failedLocal,scope:'static Canvas review and map background bake, not Three/runtime/motion/occlusion validation',ownerApproved:false,artApproved:false};
await writeFile(resolve(root,'review/verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({bodyExactLiveRGBA:true,assets:assets.length,scenarios:scenarios.length,mobile,pageErrors:errors.length,failedLocal:failedLocal.length}));
