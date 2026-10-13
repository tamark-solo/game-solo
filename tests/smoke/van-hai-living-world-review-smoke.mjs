import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
const output=resolve('artifacts/living-world-review');await mkdir(output,{recursive:true});const fixture=await mkdtemp(resolve(output,'fixture-'));
const config=resolve(fixture,'vite.mjs'),origin='http://127.0.0.1:5224';
await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
const plan=JSON.parse(await readFile('docs/design/world/van-hai-living-world-v1/plan.json','utf8'));
const vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5224'],origin);let browser;
const errors=[],gameCalls=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/|\/matchmake\//.test(r.url()))gameCalls.push(r.url());});
 await page.goto(origin+'/@fs/'+resolve('docs/design/world/van-hai-living-world-v1/index.html').replaceAll('\\','/'));await page.waitForSelector('#cards .select');
 assert.equal(await page.locator('#cards .select').count(),14);await page.locator('.map img').evaluate(i=>i.decode());
 const startStorage=await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]);
 await page.locator('#search').fill('dinh soc');assert.equal(await page.locator('#cards .select').count(),1);await page.locator('#cards .select').click();assert.equal(await page.locator('#detail h2').innerText(),'Đinh Sóc');
 await page.locator('#search').fill('');await page.locator('.pin[data-id="NPC-HN-HERBALIST"]').click();assert.equal(await page.locator('#detail h2').innerText(),'Bạch Chỉ');await page.screenshot({path:resolve(output,'npc-desktop.png')});
 await page.locator('[data-view="mob"]').click();assert.equal(await page.locator('#cards .select').count(),11);
 await page.locator('[data-view="boss"]').click();assert.equal(await page.locator('#cards .select').count(),4);await page.locator('.select[data-id="BOSS-VH-DARK-SEAL-OFFICER"]').click();assert.equal(await page.locator('#detail .timeline li').count(),7);await page.screenshot({path:resolve(output,'boss-desktop.png')});
 await page.locator('[data-view="production"]').click();assert.equal(await page.locator('.references a').count(),5);assert.equal(await page.locator('.production article').count(),5);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-view="npc"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:resolve(output,'npc-mobile.png')});
 assert.deepEqual(await page.evaluate(()=>[JSON.stringify({...localStorage}),JSON.stringify({...sessionStorage})]),startStorage);assert.deepEqual(gameCalls,[]);assert.deepEqual(errors,[]);
 const ids=[...plan.npcs,...plan.enemies,...plan.materials,...plan.maps].map(v=>v.id);assert.equal(new Set(ids).size,40);assert.ok(plan.enemies.every(e=>e.materialIds.every(id=>plan.materials.some(m=>m.id===id))));
 const report={passed:true,npcs:14,mobs:8,elites:3,bosses:4,materials:8,maps:3,checks:['accent-insensitive NPC search','map pin selects brief','eleven mob/elite records','four bosses and seven story beats','production waves and five source links','mobile fits viewport','no game API or storage writes','unique IDs and material pointers'],errors,ownerMapEdited:false,ownerDatabaseUsed:false,artProduced:Boolean(plan.monsterConceptProduction),conceptArt:plan.monsterConceptProduction??null,artApproved:false};
 await writeFile(resolve(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();vite.stop();}
