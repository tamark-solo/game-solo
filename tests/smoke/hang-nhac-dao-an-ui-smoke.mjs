import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {ProfileStore} from '../../server/src/profile-store.ts';
import {HANG_NHAC_AVATARS} from '../../shared/hang-nhac.ts';
import {startService} from '../support/services.mjs';

const origin='http://127.0.0.1:5268',endpoint='http://127.0.0.1:2668';
const output=resolve('artifacts/dao-an-integration');await mkdir(output,{recursive:true});
const fixture=await mkdtemp(resolve(output,'fixture-')),dbPath=resolve(fixture,'profiles.sqlite');
const checks=[],layouts=[],errors=[];
const check=(label,value)=>{assert.ok(value,label);checks.push(label);};
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const pins=JSON.parse(await readFile('docs/design/characters/wang-lin-equipment-production-v2/basis.json','utf8')).protectedRuntimeAndMap;
const protectedBefore=await Promise.all(pins.map(async p=>({path:resolve('docs/design/characters/wang-lin-equipment-production-v2',p.file),hash:await hash(resolve('docs/design/characters/wang-lin-equipment-production-v2',p.file))})));
let backend,vite,browser,page;
try{
  // Probe the user's running frontend without joining a room or writing its DB.
  if(process.env.DAO_AN_LIVE_ORIGIN){
    for(const path of ['/hang-nhac.html','/src/hang-nhac.ts','/src/ui/dao-player-ux.css','/src/ui/dao-an-readability.css']){
      const response=await fetch(new URL(path,process.env.DAO_AN_LIVE_ORIGIN));
      check(`Live frontend serves ${path}`,response.status===200);
    }
  }
  backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2668',GAME_DB_PATH:dbPath,GAME_ALLOW_GUEST:'1',GAME_NODE_ID:'dao-an-ui-fixture',GAME_ALLOWED_ORIGINS:origin});
  const config=resolve(fixture,'vite.mjs');
  await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},cacheDir:${JSON.stringify(resolve(fixture,'cache'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
  vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5268'],origin,{VITE_SERVER_URL:endpoint});
  const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());
  const store=new ProfileStore(dbPath),account=store.authenticate(guest.token);
  try{const p=store.get(account,HANG_NHAC_AVATARS[0]);p.hp=55;p.mp=80;p.sect.supplies=2;store.save(p);}finally{store.close();}
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  await context.addInitScript(token=>localStorage.setItem('hang-nhac.guest.v1',token),guest.token);
  page=await context.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))errors.push(`${r.status()} ${r.url()}`);});
  const own=()=>page.evaluate(()=>window.__hangNhacR01().own);
  const phase=value=>page.waitForFunction(value=>window.__hangNhacDiagnostics?.().shell.phase===value,value,{timeout:45000});
  const settled=()=>page.waitForFunction(()=>window.__hangNhacCharacter?.().synced&&!window.__hangNhacCharacter().pending&&window.__hangNhacCharacter().online);
  const shot=async name=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(e=>e.getClientRects().length).map(e=>e.decode().catch(()=>{})));});await page.screenshot({path:resolve(output,name+'.png')});};
  const route=async id=>{await page.locator('dialog[open] .dao-an-menu-nav [data-dao-an-route="'+id+'"]').click();await page.waitForTimeout(180);};
  const surfaceContrast=selector=>page.locator(selector).evaluate(node=>{
    const s=getComputedStyle(node),rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
    const lum=color=>rgb(color).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
    const a=lum(s.color),b=lum(s.backgroundColor);
    return {image:s.backgroundImage,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  });
  const reading=async label=>{
    const report=await page.evaluate(()=>{
      const journal=!!document.querySelector('#sect-dialog[open][data-mode="journal"]');
      const root=document.querySelector(journal?'#sect-body':'#character-dialog');
      const selectors=journal?'.dao-scroll-description,.dao-scroll-voice,.dao-scroll-speaker,.dao-scroll-title,.dao-obj-text,.dao-scroll-section-title,.dao-scroll-next-step':'.primary-pane p,.detail-copy p,.item-cell b,.dao-plain-data dt,.dao-plain-data dd';
      const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
      const background=lum(journal?[233,222,199]:[32,39,41]);
      const nodes=[...root.querySelectorAll(selectors)].filter(node=>node.getClientRects().length&&!node.closest('[hidden]'));
      const failures=nodes.map(node=>{const c=getComputedStyle(node).color.match(/[\d.]+/g).slice(0,3).map(Number),l=lum(c);return {text:node.textContent.slice(0,80),contrast:(Math.max(l,background)+.05)/(Math.min(l,background)+.05)};}).filter(n=>n.contrast<4.5);
      const reader=root.querySelector('.dao-codex-scroll-pane')?.getBoundingClientRect(),dialog=root.closest('dialog').getBoundingClientRect();
      return {journal,count:nodes.length,failures,reader:reader?{height:reader.height,bottom:reader.bottom}:null,dialog:{height:dialog.height,bottom:dialog.bottom},nestedScroll:root.querySelector('.dao-scroll-sheet')?getComputedStyle(root.querySelector('.dao-scroll-sheet')).overflowY:null};
    });
    check(`${label}: readable text contrast ${JSON.stringify(report.failures)}`,report.count>0&&report.failures.length===0);
    if(report.journal){
      check(`${label}: reader uses available height`,report.reader.height>report.dialog.height*.4&&report.dialog.bottom-report.reader.bottom<65);
      check(`${label}: article has one scrolling surface`,report.nestedScroll==='visible');
    }
  };
  await page.goto(origin+'/hang-nhac.html?devGuest=1');await phase('entry');await page.locator('#join').click();await phase('playing');
  await page.waitForFunction(()=>document.querySelector('.dao-vital-hp b')?.textContent==='55 / 100');
  check('Approved V3 is the live default',await page.locator('#game-shell').getAttribute('data-ui-design')==='dao-an-v3');
  check('Eight real hotbar cells',await page.locator('.hotbar-slot-group').count()===8);
  check('Three unassigned cells are explicit',await page.locator('.dao-an-empty').count()===3);
  check('Fake experience decoration removed',await page.locator('.hotbar-exp-bar').count()===0);
  check('Vitals are server values',Number(await page.locator('.dao-vital-hp .dao-vital-track').getAttribute('aria-valuenow'))===(await own()).hp);
  await page.locator('#training').click();
  await page.waitForFunction(()=>Object.keys(window.__hangNhacR01().targets??{}).length===1);
  const castsBefore=(await own()).casts;
  await page.locator('[data-hotbar-skill="sword"]').click();
  await page.waitForFunction(count=>window.__hangNhacR01().own?.casts===count,castsBefore+1);
  check('Hotbar cast is confirmed by server',(await own()).mp<100);
  check('Cooldown is read from snapshot',['casting','cooldown'].includes(await page.locator('[data-hotbar-skill="sword"]').getAttribute('data-state')));
  await page.waitForFunction(()=>!window.__hangNhacR01().own?.castId);
  const afterCast=(await own()).casts;
  await page.locator('#stage').focus();await page.keyboard.press('5');
  check('Empty slot explains missing assignment',(await page.locator('.hotbar-feedback').textContent()).includes('chưa gán'));
  check('Empty slot sends no cast',(await own()).casts===afterCast);
  const guideStyle=await surfaceContrast('#quest-guide');
  check(`Tracker action has one readable surface ${JSON.stringify(guideStyle)}`,guideStyle.image==='none'&&guideStyle.contrast>=4.5);
  await shot('desktop-world');
  await page.locator('#stage').focus();await page.keyboard.press('c');await page.waitForSelector('#character-dialog[open]');await settled();
  check('Shared menu has eight routes',await page.locator('#character-dialog .dao-an-menu-nav button').count()===8);
  await shot('desktop-character');
  await route('inventory');await page.waitForSelector('#character-dialog[open]');await settled();
  const state=()=>page.evaluate(()=>window.__hangNhacCharacter());
  const initial=(await state()).view;
  const weapon=initial.items.find(item=>item.definitionId==='wood-sword'),recovery=initial.items.find(item=>item.definitionId==='recovery');
  await page.locator(`#character-dialog .item-cell[data-item="${weapon.id}"]`).click();
  await page.locator('#character-dialog [data-action="unequip"]').click();await settled();
  check('Unequip uses committed inventory snapshot',!(await state()).view.equipment.weapon);
  await page.locator('#character-dialog [data-action="equip"]').click();await settled();
  check('Equip keeps the original item identity',(await state()).view.equipment.weapon===weapon.id);
  const modalCasts=(await own()).casts,position={x:(await own()).x,y:(await own()).y};
  await page.locator('#live-tab-inventory').focus();
  await page.keyboard.press('1');await page.keyboard.press('f');await page.keyboard.press('w');
  await page.waitForTimeout(150);
  check('Modal blocks world movement and cast',(await own()).casts===modalCasts&&(await own()).x===position.x&&(await own()).y===position.y);
  await page.locator(`#character-dialog .item-cell[data-item="${recovery.id}"]`).click();
  await page.locator('#character-dialog [data-action="use"]').click();await settled();
  check('Recovery consumes the shared server supply',(await state()).view.sect.supplies===1&&(await state()).view.hp===85);
  await page.waitForFunction(()=>document.querySelector('.dao-vital-hp b')?.textContent==='85 / 100');
  check('Top-left HP updates after recovery',await page.locator('#character-dialog [data-action="use"]').isDisabled());
  await page.locator('#character-item-search').fill('không có món này');
  check('Search has an empty state',await page.locator('#character-dialog .item-cell').count()===0);
  await page.locator('#character-item-search').fill('');
  await shot('desktop-inventory');
  await route('quest');await page.waitForSelector('#sect-dialog[open]');await shot('desktop-journal');
  await route('crafting');await page.waitForSelector('.chapter-dialog[open]');await shot('desktop-crafting');
  await page.locator('[data-chapter-tab="preparation"]').click();await shot('desktop-inner-world');
  await route('map');await page.waitForSelector('#dao-hud-dialog[open][data-screen="map"]');await shot('desktop-map');
  await route('settings');await page.waitForSelector('#game-menu[open]');await shot('desktop-settings');
  await route('world');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
  await page.locator('#stage').focus();await page.keyboard.press('4');await page.waitForSelector('#character-dialog[open]');await settled();
  check('Slot 4 opens actual inventory',(await state()).tab==='inventory');
  await route('world');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
  for(const [width,height] of [[1366,768],[1024,768],[390,844],[320,720],[844,390]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(120);await shot(`world-${width}x${height}`);
    const layout=await page.evaluate(()=>{
      const box=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
      const selectors=['.dao-live-identity','.dao-live-target','.dao-hud-map','#sect-objective','.game-hotbar','.dao-main-dock','.dao-mobile-dock'];
      return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,boxes:Object.fromEntries(selectors.map(s=>[s,document.querySelector(s)]).filter(([,e])=>e?.getClientRects().length).map(([s,e])=>[s,box(e)])),slots:[...document.querySelectorAll('.hotbar-slot-group')].map(box)};
    });layouts.push(layout);check(`${width}: page stays in viewport`,!layout.overflow);
    const b=layout.boxes['.game-hotbar'];
    check(`${width}: all hotbar cells are reachable`,layout.slots.every(s=>s.x>=0&&s.right<=width+1&&s.y>=0&&s.bottom<=height+1));
    check(`${width}: equal hotbar cells`,Math.max(...layout.slots.map(s=>s.width))-Math.min(...layout.slots.map(s=>s.width))<1);
    const overlap=(a,c)=>a&&c&&a.x<c.right-1&&a.right>c.x+1&&a.y<c.bottom-1&&a.bottom>c.y+1;
    check(`${width}: tracker clears hotbar`,!overlap(b,layout.boxes['#sect-objective']));
    check(`${width}: menu clears hotbar`,!overlap(b,layout.boxes['.dao-main-dock'])&&!overlap(b,layout.boxes['.dao-mobile-dock']));
    await page.locator('#character-open').click();await page.waitForSelector('#character-dialog[open]');await settled();await shot(`character-${width}x${height}`);
    await route('inventory');await page.waitForSelector('#character-dialog[open]');await settled();await shot(`inventory-${width}x${height}`);
    const modal=await page.locator('#character-dialog').boundingBox();check(`${width}: character dialog fits screen`,modal.x>=0&&modal.y>=0&&modal.x+modal.width<=width+1&&modal.y+modal.height<=height+1);
    await route('world');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
  }
  for(const [width,height] of [[1113,1143],[1366,768],[390,844],[320,720],[844,390]]){
    await page.setViewportSize({width,height});
    await page.locator('#character-open').click();await page.waitForSelector('#character-dialog[open]');await settled();
    for(const tab of ['overview','attributes','cultivation','spells','equipment','inventory']){
      if(tab==='spells')await route('spells');
      else if(tab==='attributes'||tab==='cultivation')await page.locator('.character-local-nav [data-sheet="'+tab+'"]').click();
      else await page.locator('#live-tab-'+tab).click();
      await settled();await reading(`${tab} ${width}x${height}`);await shot(`audit-${tab}-${width}x${height}`);
      if(tab==='overview'&&width>1100){
        const colors=await surfaceContrast('.profile-pane .pose-toggle');
        check('Portrait pose control has a legible foreground',colors.contrast>=4.5);
      }
    }
    await route('quest');await page.waitForSelector('#sect-dialog[open]');
    await page.waitForFunction(()=>{const node=document.querySelector('.dao-codex-card[data-selected=true]');if(!node)return false;const b=node.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();return b.right>p.left&&b.left<p.right&&b.bottom>p.top&&b.top<p.bottom;});
    await reading(`journal ${width}x${height}`);await shot(`audit-journal-${width}x${height}`);
    await page.locator('.dao-codex-filter-btn').last().click();
    check(`${width}: journal chapter filter keeps a readable article`,await page.locator('.dao-scroll-sheet:visible').count()===1);
    await page.locator('.dao-codex-filter-btn').first().click();
    const selectedVisible=await page.locator('.dao-codex-card[data-selected=true]').evaluate(node=>{const b=node.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();return b.right>p.left&&b.left<p.right&&b.bottom>p.top&&b.top<p.bottom;});
    check(`${width}: selected journal card remains in view`,selectedVisible);
    await route('world');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
    if(height>620){
      check(`${width}: tracker shows one current objective`,await page.locator('#sect-objective .dao-tracker-step').count()===1);
      check(`${width}: tracker removes duplicate action badges`,await page.locator('#sect-objective .dao-obj-cta-pill').count()===0);
      await page.locator('#quest-toggle').click();
      check(`${width}: tracker can collapse`,await page.locator('#quest-tracker-body').isHidden());
      await page.locator('#quest-toggle').click();
      check(`${width}: tracker can expand`,await page.locator('#quest-tracker-body').isVisible());
    }
  }
  check('No JS/HTTP failures',errors.length===0);
  for(const p of protectedBefore)assert.equal(await hash(p.path),p.hash,p.path);
  check('All protected runtime/map files unchanged',true);
  await writeFile(resolve(output,'verification.json'),JSON.stringify({status:'pass',checks,layouts,errors},null,2));
  console.log(JSON.stringify({status:'pass',checks:checks.length,errors}));
}catch(error){
  if(page)await page.screenshot({path:resolve(output,'failure.png')}).catch(()=>{});
  await writeFile(resolve(output,'verification.json'),JSON.stringify({status:'fail',checks,layouts,errors,error:error.stack},null,2));
  throw error;
}finally{await browser?.close();vite?.stop();backend?.stop();}
