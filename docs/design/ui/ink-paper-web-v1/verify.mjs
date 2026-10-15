import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const url='http://127.0.0.1:5188/ui/ink-paper-web-v1/';
const out=new URL('./review/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],checks=[],screens=[];
const ctx=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
const check=(label,fn)=>{assert.ok(fn,label);checks.push(label);};
async function view(id){await page.locator(`.review-nav [data-view="${id}"]`).click();await page.waitForTimeout(280);await page.evaluate(()=>document.fonts.ready);}
async function screenshot(name){await page.screenshot({path:new URL(name+'.png',out).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});screens.push(name+'.png');}
async function layout(name){const issues=await page.evaluate(()=>{const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';return {overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].filter(visible).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),clippedText:[...document.querySelectorAll('h2,h3,h4,button,p,label')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='auto').map(e=>e.textContent.slice(0,50))};});check(name+': no horizontal page overflow',!issues.overflow);check(name+': all visible raster assets decoded',issues.images.length===0);check(name+': text fits horizontally',issues.clippedText.length===0);}
try{
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
 check('No remote transport or game session required',!(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/colyseus')||r.name.includes('/api/')))));
 for(const id of ['explore','combat','artifacts','inventory','progress','journal']){await view(id);await layout('1440 '+id);await screenshot('desktop-'+id);}
 await view('artifacts');
 for(const family of ['sword','banner','chariot','bead']){await page.locator(`[data-artifact="${family}"]`).click();check('Artifact '+family+' selected',await page.locator(`[data-artifact="${family}"]`).getAttribute('aria-pressed')==='true');check('Artifact '+family+' has framed source image',await page.locator('.artifact-orbit svg image').count()===1);}
 await page.locator('[data-demo-equip]').click();check('Chosen bead reflected on HUD',await page.locator('#dock-artifact').textContent()==='THIÊN NGHỊCH CHÂU');
 await page.locator('[data-skill="1"]').click();check('Cooldown feedback visible',await page.locator('[data-skill="1"]').getAttribute('data-cooldown')==='3');await page.waitForTimeout(3150);check('Cooldown resolves',!(await page.locator('[data-skill="1"]').getAttribute('class')).includes('cooling'));
 await view('inventory');await page.locator('[data-item="jade-sword"]').click();await page.locator('[data-item-action]').click();check('Equip updates selected item badge',await page.locator('[data-item="jade-sword"] .equipped-tag').count()===1);check('Equipped action cannot resubmit',await page.locator('[data-item-action]').isDisabled());
 await page.locator('[data-filter="medicine"]').click();check('Medicine filter shows two items',await page.locator('[data-item]').count()===2);await page.locator('#item-search').fill('không tồn tại');check('Empty search result explained',await page.locator('.empty-result').isVisible());await page.locator('#item-search').fill('');
 await view('progress');check('Breakthrough disabled when prerequisites missing',await page.locator('#breakthrough').isDisabled());await page.locator('#ready').check();check('Breakthrough enabled in ready fixture',await page.locator('#breakthrough').isEnabled());await page.locator('#breakthrough').click();check('Breakthrough result shown',await page.locator('.realm-ring h3').textContent()==='Trúc Cơ');
 await view('journal');await page.locator('[data-chapter="0"]').click();await page.locator('[data-track-chapter]').click();check('Chapter I can be tracked',await page.locator('.quest-tracker h2').textContent()==='Phế sài nhập môn');
 await page.locator('#avatar').selectOption('b');check('Avatar B identity updated',await page.locator('#identity-name').textContent()==='Tịch Bạch');await view('artifacts');check('Avatar B art loaded',await page.locator('.actor-large').getAttribute('src').then(s=>s.includes('-b.png')));await page.keyboard.press('Escape');check('Escape returns to HUD',await page.locator('#screen-layer').isHidden());
 await view('inventory');await page.locator('.folio .close').focus();await page.keyboard.press('Shift+Tab');check('Focus wraps within menu',await page.evaluate(()=>{const nodes=[...document.querySelectorAll('#screen-layer button:not(:disabled),#screen-layer input,#screen-layer select')].filter(n=>n.offsetParent!==null);return document.activeElement===nodes.at(-1);}));await page.keyboard.press('Escape');
 await page.locator('#lighting').click();check('Night lighting toggled',await page.locator('#lighting').getAttribute('aria-pressed')==='true');await screenshot('night-hud');await page.locator('#lighting').click();
 await page.setViewportSize({width:1366,height:768});for(const id of ['explore','artifacts','inventory','progress','journal']){await view(id);await layout('1366 '+id);}await screenshot('compact-desktop');
 await page.setViewportSize({width:390,height:844});for(const id of ['explore','combat','artifacts','inventory','progress','journal']){await view(id);await layout('390 '+id);await screenshot('mobile-'+id);}
 await page.setViewportSize({width:1920,height:1080});await view('explore');await layout('1920 explore');await screenshot('wide-hud');
 check('No browser or HTTP errors',errors.length===0);
 await writeFile(new URL('verification.json',out),JSON.stringify({date:'2026-10-15',status:'pass',checks,screens,errors},null,2));
 console.log(JSON.stringify({status:'pass',checks:checks.length,screens:screens.length,errors}));
}catch(e){await writeFile(new URL('verification.json',out),JSON.stringify({status:'fail',checks,screens,errors,failure:e.stack},null,2));await screenshot('failure');throw e;}finally{await browser.close();}
