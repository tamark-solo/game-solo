import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {ProfileStore} from '../../server/src/profile-store.ts';
import {LIVE_HANG_NHAC_NPCS} from '../../client/src/npc-life.ts';
import {startService} from '../support/services.mjs';

const origin='http://127.0.0.1:5237',endpoint='http://127.0.0.1:2637';
const ownerMap=resolve('docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json');
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const mapBefore=await hash(ownerMap);
await mkdir('artifacts',{recursive:true});
const folder=await mkdtemp(resolve('artifacts/hn-npc-life-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2637',GAME_DB_PATH:dbPath});
let vite,browser;const checks=[],errors=[],fixtures=[];
try {
 vite=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5237'],origin,{VITE_SERVER_URL:endpoint,MAP_EDITOR_STORAGE:resolve(folder,'map-store')});
 const samples=[...LIVE_HANG_NHAC_NPCS.filter(n=>!n.stationId),LIVE_HANG_NHAC_NPCS.find(n=>n.stationId==='cultivation')];
 for(const npc of samples){
  const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json()),store=new ProfileStore(dbPath);
  try{const account=store.authenticate(guest.token),profile=store.get(account,'CHR-WANG-LIN-CHIBI');Object.assign(profile,{x:npc.x,y:npc.y});store.save(profile);fixtures.push({npc,token:guest.token,profileId:profile.id});}finally{store.close();}
 }
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 for(const [index,fixture] of fixtures.entries()){
  const context=await browser.newContext({viewport:{width:1440,height:980}});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),fixture.token);
  await context.addInitScript('window.__name = (fn) => fn;');
  const page=await context.newPage(),sent=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('websocket',ws=>ws.on('framesent',frame=>sent.push(String(frame.payload))));
  await page.goto(origin+'/hang-nhac.html?devGuest=1');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);
  assert.equal((await page.evaluate(()=>window.__hangNhacNpcs().npcs)).length,10);
  await page.locator('#join').click();await page.waitForFunction(()=>window.__hangNhacR01().own?.connected&&!!window.__hangNhacSect().view);
  await page.locator('#stage').focus();await page.waitForFunction(()=>!document.querySelector('#interact').disabled);
  sent.length=0;
  await page.keyboard.press('e');await page.locator('#sect-dialog').waitFor({state:'visible'});
  assert.match(await page.locator('#sect-title').textContent(),new RegExp(fixture.npc.name));
  if(!fixture.npc.stationId){
   assert.equal(await page.locator('#sect-dialog').getAttribute('data-mode'),'lore');
   assert.equal(await page.locator('#sect-body [data-action],#sect-body [data-chapter-route]').count(),0);
   assert.equal((await page.evaluate(()=>window.__hangNhacSect())).loreNpc,fixture.npc.id);
   assert.equal(sent.filter(s=>s.includes('sect:command')||s.includes('chapter:command')).length,0,'lore must not send gameplay commands');
   if(index===0){
    await page.screenshot({path:resolve(folder,'herbalist-dialog.png')});
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    await page.locator('#sect-dialog').waitFor({state:'hidden'});
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.locator('#stage').focus();await page.keyboard.press('e');await page.locator('#sect-dialog').waitFor({state:'visible'});
    checks.push('lore_closes_when_hidden_and_reopens_only_on_explicit_E');
   }
  }else{
   assert.equal(await page.locator('#sect-dialog').getAttribute('data-mode'),'npc');
   assert.equal((await page.evaluate(()=>window.__hangNhacSect())).station,'cultivation');
   assert.ok(sent.some(s=>s.includes('sect:command')));
  }
  await page.keyboard.press('Escape');await page.locator('#sect-dialog').waitFor({state:'hidden'});
  checks.push(`${fixture.npc.id}_interaction`);
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.equal(await hash(ownerMap),mapBefore);
 await writeFile(resolve(folder,'result.json'),JSON.stringify({ok:true,checks,npcs:LIVE_HANG_NHAC_NPCS.map(n=>({id:n.id,x:n.x,y:n.y})),ownerMapUnchanged:true},null,2));
 console.log(JSON.stringify({ok:true,checks,artifacts:folder}));
} finally {await browser?.close();vite?.stop();backend.stop();}
