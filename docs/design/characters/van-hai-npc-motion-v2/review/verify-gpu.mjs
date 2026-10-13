import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,dirname,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
function safe(file){const path=resolve(root,file),rel=relative(workspace,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));return path;}
const fixturePilot=process.argv.includes('--fixture-pilot');
let catalog;
if(fixturePilot){
 const original=JSON.parse(await readFile(resolve(root,'../van-hai-npc-motion-v1/catalog.json'),'utf8'));
 catalog={...original,actors:original.actors.map(actor=>({...actor,views:{southeast:{direction:'southeast',neutralSprite:'../van-hai-npc-motion-v1/'+actor.neutralSprite,artApproved:true,clips:Object.fromEntries(Object.entries(actor.clips).map(([action,motion])=>[action,{...motion,atlas:'../van-hai-npc-motion-v1/'+motion.atlas,frames:motion.frames.map(frame=>({...frame,file:'../van-hai-npc-motion-v1/'+frame.file}))}]))}}})),coverage:{missing:['fixture only: seven actual views pending for each NPC']}};
}else catalog=JSON.parse(await readFile(resolve(root,'catalog.json'),'utf8'));
const clips=catalog.actors.flatMap(actor=>Object.values(actor.views).flatMap(view=>Object.values(view.clips)));
if(process.argv.includes('--require-full'))assert.equal(clips.length,96);
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{try{const path=resolve(workspace,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)),rel=relative(workspace,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));const bytes=fixturePilot&&path===resolve(root,'catalog.json')?Buffer.from(JSON.stringify(catalog)):await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-motion-v2/index.html');
 const renders=await page.evaluate(async clips=>{
  const THREE=await import('/node_modules/three/build/three.module.js');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(96,96);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,96,96,0,.1,10);camera.position.z=5;
  const geometry=new THREE.PlaneGeometry(96,96),material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false});
  geometry.translate(48-48,88-48,0);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(48,8,0);scene.add(mesh);
  const output=[];
  for(const clip of clips){
   const texture=await new THREE.TextureLoader().loadAsync(clip.atlas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;material.map=texture;material.needsUpdate=true;
   for(const frame of clip.frames){const[aw,ah]=clip.atlasSize,ul=frame.x/aw,ur=(frame.x+frame.w)/aw,vt=1-frame.y/ah,vb=1-(frame.y+frame.h)/ah;geometry.setAttribute('uv',new THREE.Float32BufferAttribute([ul,vt,ur,vt,ul,vb,ur,vb],2));renderer.render(scene,camera);output.push({file:frame.file,clip:clip.id,png:renderer.domElement.toDataURL().split(',')[1]});}
   texture.dispose();
  }
  material.dispose();geometry.dispose();renderer.dispose();return output;
 },clips);
 let maxColorDelta=0;
 for(const rendered of renders){
  const actual=await sharp(Buffer.from(rendered.png,'base64')).ensureAlpha().raw().toBuffer(),expected=await sharp(safe(rendered.file)).ensureAlpha().raw().toBuffer();assert.equal(actual.length,expected.length);
  for(let index=0;index<actual.length;index+=4){assert.equal(actual[index+3],expected[index+3],'GPU alpha/pivot/UV mismatch '+rendered.file);if(!expected[index+3])continue;for(let channel=0;channel<3;channel++){const delta=Math.abs(actual[index+channel]-expected[index+channel]);maxColorDelta=Math.max(maxColorDelta,delta);assert.ok(delta<=1,'GPU texture/crop/color mismatch '+rendered.file);}}
 }
 assert.equal(renders.length,clips.length*6);assert.deepEqual(errors,[]);
 const result={passed:true,fixturePilot,threeWebGLFrames:renders.length,pivot:[48,88],nearestSampling:true,alphaPixelParity:true,maxColorDelta,textureSwapClips:clips.length,directionsByActor:Object.fromEntries(catalog.actors.map(actor=>[actor.id,Object.keys(actor.views)])),missing:catalog.coverage.missing,errors,newViewsOwnerApproved:false,runtimeImported:false};
 await mkdir(resolve(root,'review'),{recursive:true});await writeFile(resolve(root,fixturePilot?'review/fixture-gpu-verification.json':'review/gpu-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();await new Promise(done=>server.close(done));}
