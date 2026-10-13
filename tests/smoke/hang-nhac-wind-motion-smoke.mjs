import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {createServer,request} from 'node:http';
import {WebSocket,WebSocketServer} from 'ws';
import {startService} from '../support/services.mjs';

const output=resolve('artifacts/wind-motion');await mkdir(output,{recursive:true});
const fixture=await mkdtemp(resolve(output,'fixture-'));
const origin='http://127.0.0.1:5223',endpoint='http://127.0.0.1:2623',proxyEndpoint='http://127.0.0.1:2624';
const latency=Number(process.env.WIND_TEST_LATENCY_MS??0);assert.ok(latency>=0&&latency<=300);
const backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2623',GAME_DB_PATH:resolve(fixture,'profiles.sqlite')});
let vite,browser;const cases=[],errors=[],timers=new Set();
const proxy=createServer((req,res)=>{const upstream=request(endpoint+req.url,{method:req.method,headers:req.headers},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});
const sockets=new WebSocketServer({noServer:true});
const forward=(to,data,binary)=>{const timer=setTimeout(()=>{timers.delete(timer);if(to.readyState===WebSocket.OPEN)to.send(data,{binary});},latency);timers.add(timer);};
proxy.on('upgrade',(req,socket,head)=>{const upstream=new WebSocket(endpoint.replace('http:','ws:')+req.url,{headers:req.headers});upstream.on('error',()=>socket.destroy());upstream.once('open',()=>sockets.handleUpgrade(req,socket,head,client=>{upstream.on('message',(data,binary)=>forward(client,data,binary));client.on('message',(data,binary)=>forward(upstream,data,binary));client.on('error',()=>upstream.close());client.on('close',()=>upstream.close());upstream.on('close',()=>client.close());}));});
try{
 await new Promise((r,reject)=>{proxy.once('error',reject);proxy.listen(2624,'127.0.0.1',r);});
 const config=resolve(fixture,'vite.mjs');await writeFile(config,`export default {root:${JSON.stringify(resolve('client'))},publicDir:${JSON.stringify(resolve('client/public'))},resolve:{alias:{'@shared':${JSON.stringify(resolve('shared'))}}},server:{host:'127.0.0.1',strictPort:true,fs:{allow:[${JSON.stringify(resolve('.'))}]}}};`);
 vite=await startService(['node_modules/vite/bin/vite.js','--config',config,'--port','5223'],origin,{VITE_SERVER_URL:proxyEndpoint});
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:[...(process.env.TEST_NATIVE_GPU==='1'?[]:['--enable-unsafe-swiftshader','--use-angle=swiftshader']),'--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 // Keep software WebGL frame capture above ten samples per dash while other
 // fixture suites run; sampling quality is still asserted below.
 const page=await browser.newPage({viewport:{width:980,height:600}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/hang-nhac.html?devGuest=1');await page.waitForFunction(()=>window.__hangNhacDiagnostics?.().ready);await page.locator('#join').click();await page.waitForFunction(()=>window.__hangNhacR01?.().own?.connected);
 // Upload/compile the wind art before temporal QA. Software WebGL may spend
 // several hundred ms compiling the first FX draw; that is not a motion sample.
 const warm=await page.evaluate(()=>window.__hangNhacDiagnostics()),warmActor=warm.actors.find(a=>a.own),warmBox=await page.locator('#stage').boundingBox();
 await page.mouse.click(warmBox.x+warmBox.width/2+warmActor.x-warm.cameraCenter.x+60,warmBox.y+warmBox.height/2+warmActor.y-warm.cameraCenter.y);
 await page.locator('#stage').focus();await page.keyboard.press('3');
 await page.waitForFunction(()=>window.__hangNhacR01().own.casts===1&&!window.__hangNhacR01().own.castId);
 for(const [label,dx,dy]of [['east',1,0],['west',-1,0]]){
  await page.locator('[data-skill=wind][aria-disabled="false"]').waitFor();
  const d=await page.evaluate(()=>window.__hangNhacDiagnostics()),a=d.actors.find(a=>a.own),box=await page.locator('#stage').boundingBox();
  await page.mouse.click(box.x+box.width/2+a.x-d.cameraCenter.x+dx*60,box.y+box.height/2+a.y-d.cameraCenter.y+dy*60);
  await page.evaluate(()=>{window.__windFrames=[];window.__windSampling=true;const sample=()=>{if(!window.__windSampling)return;const d=window.__hangNhacDiagnostics(),p=d.actors.find(a=>a.own),a=window.__hangNhacR01().own;window.__windFrames.push({t:performance.now(),x:p.x,y:p.y,serverX:a.x,serverY:a.y,cast:a.castId,dashVX:a.dashVX,dashVY:a.dashVY,ack:a.ack});requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  const casts=await page.evaluate(()=>window.__hangNhacR01().own.casts);await page.locator('#stage').focus();await page.keyboard.press('3');
  await page.waitForFunction(n=>window.__hangNhacR01().own.casts>n&&!window.__hangNhacR01().own.castId,casts);await page.waitForTimeout(350);
  const frames=await page.evaluate(()=>{window.__windSampling=false;return window.__windFrames;});
  await writeFile(resolve(output,`frames-${latency}ms-${label}.json`),JSON.stringify(frames,null,2)+'\n');
  assert.ok(frames.length>=10,`Capture the dash and its correction window, not only the final position (${frames.length} frames; use TEST_NATIVE_GPU=1 when software WebGL cannot sustain the capture rate).`);
  const start=frames[0],end=frames.at(-1);let maxBacktrack=0,overshoot=0;
  for(let i=1;i<frames.length;i++)maxBacktrack=Math.max(maxBacktrack,-((frames[i].x-frames[i-1].x)*dx+(frames[i].y-frames[i-1].y)*dy));
  for(const f of frames)overshoot=Math.max(overshoot,(f.x-end.serverX)*dx+(f.y-end.serverY)*dy);
  const serverDistance=(end.serverX-start.serverX)*dx+(end.serverY-start.serverY)*dy;
  assert.ok(Math.abs(serverDistance-160)<.01,'Confirmed wind still travels its authored 160px range.');
  cases.push({label,maxBacktrack,overshoot,serverDistance,frames});
 }
 await page.screenshot({path:resolve(output,'confirmed-wind.png')});
 const passed=cases.every(c=>c.maxBacktrack<1&&c.overshoot<1)&&!errors.length;
 await writeFile(resolve(output,`verification-${latency}ms.json`),JSON.stringify({passed,oneWayLatencyMs:latency,nativeGpu:process.env.TEST_NATIVE_GPU==='1',shaderWarmupCast:true,cases,errors,fixtureDatabase:resolve(fixture,'profiles.sqlite'),ownerDatabaseUsed:false,ownerMapEdited:false},null,2)+'\n');
 console.log(JSON.stringify({passed,oneWayLatencyMs:latency,cases:cases.map(({frames,...c})=>c),errors},null,2));
 assert.ok(passed,'Wind must not overshoot or reverse after an authoritative dash.');
}finally{await browser?.close();for(const t of timers)clearTimeout(t);for(const c of sockets.clients)c.terminate();sockets.close();if(proxy.listening){proxy.closeAllConnections();proxy.close();}vite?.stop();backend.stop();}
