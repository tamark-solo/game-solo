import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,relative,isAbsolute,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
const mime={'.html':'text/html','.mjs':'text/javascript','.json':'application/json','.png':'image/png'},checks=[],errors=[],failedAssets=[];
const check=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}const p=resolve(workspace,'.'+decodeURIComponent(pathname)),r=relative(workspace,p);if(r.startsWith('..')||isAbsolute(r))throw Error('scope');const bytes=await fs.readFile(p);res.writeHead(200,{'Content-Type':mime[extname(p)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1,reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failedAssets.push(r.url());});
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/design/characters/gdd-character-animation-v1/review/limb-audit-v1/index.html`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__limbAudit?.current);
 check('six actual repairs listed',await page.locator('#clip option').count()===6);
 await page.evaluate(()=>localStorage.setItem('owner-sentinel','unchanged'));
 const repairs=await page.evaluate(()=>window.__limbAudit.findings.repairs);
 for(const repair of repairs){
  await page.selectOption('#clip',repair.clipId);await page.waitForFunction(id=>window.__limbAudit.current===id,repair.clipId);
  for(let key=0;key<repair.activeKeys;key++){
   await page.locator('#seek').fill(String(key));await page.locator('#seek').dispatchEvent('input');await page.waitForFunction(i=>window.__limbAudit.key===i,key);
   check('render actual limb key '+repair.clipId+'/'+key,await page.evaluate(()=>{const c=document.querySelector('#after'),ctx=c.getContext('2d'),d=ctx.getImageData(0,0,c.width,c.height).data,z=window.__limbAudit.state.zoom;let n=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(y!==104*z&&d[(y*c.width+x)*4+3]>128)n++;return n>150*z*z;}));
  }
  check('historical presence '+repair.clipId,await page.locator('#before').isVisible()===repair.oldClipArchived);
  for(const zoom of ['1','2','4']){await page.selectOption('#zoom',zoom);await page.waitForFunction(z=>document.querySelector('#after').width===112*z,Number(zoom));check('integer zoom without CSS shrink '+repair.clipId+'/'+zoom,await page.evaluate(()=>Math.abs(document.querySelector('#after').getBoundingClientRect().width-document.querySelector('#after').width)<.1));}
 }
 await page.selectOption('#clip','huyen-tam-entry-cast-aoe-south');await page.waitForFunction(()=>window.__limbAudit.current==='huyen-tam-entry-cast-aoe-south');await page.locator('#seek').fill('2');await page.locator('#seek').dispatchEvent('input');await page.waitForFunction(()=>window.__limbAudit.key===2);await page.screenshot({path:resolve(root,'review/limb-audit-v1/desktop.png'),fullPage:true});
 await page.selectOption('#background','light');check('light background active',await page.locator('body').getAttribute('class')==='light');await page.selectOption('#background','dark');
 await page.setViewportSize({width:390,height:844});check('mobile no document overflow at4x',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));check('mobile retains actual4x width',await page.locator('#after').evaluate(c=>Math.abs(c.width-c.getBoundingClientRect().width)<.1));await page.screenshot({path:resolve(root,'review/limb-audit-v1/mobile.png'),fullPage:true});
 await page.selectOption('#scope','all');check('all208 real clips available',await page.locator('#clip option').count()===208);
 await page.locator('#play').click();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));check('offline pauses',await page.evaluate(()=>!window.__limbAudit.state.playing));check('decoded cache bounded',await page.evaluate(()=>window.__limbAudit.decodedCacheBytes<=16*1024*1024));check('owner storage unchanged',await page.evaluate(()=>localStorage.getItem('owner-sentinel')==='unchanged'));
 check('no JavaScript errors',errors.length===0);check('no failed source/history assets',failedAssets.length===0);
 const report={status:'passed',checks:checks.length,actualRepairs:repairs.length,actualKeys:repairs.reduce((n,r)=>n+r.activeKeys,0),errors,failedAssets,ownerMotionApprovalInferred:false,runtimeIntegrated:false};await fs.writeFile(resolve(root,'review/limb-audit-v1/browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();await new Promise(r=>server.close(r));}
