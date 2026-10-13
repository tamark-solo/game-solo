import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname,resolve,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-concepts-v1');
const c=JSON.parse(await readFile(resolve(root,'catalog.json'),'utf8'));assert.equal(c.actors.length,6);
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.png':'image/png','.json':'application/json','.webp':'image/webp','.css':'text/css'};
const server=createServer(async(req,res)=>{try{const path=resolve(workspace,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const rel=relative(workspace,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));const bytes=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/docs/design/characters/van-hai-npc-wave-a-concepts-v1/index.html');
 const renders=await page.evaluate(async actors=>{
  const THREE=await import('/node_modules/three/build/three.module.js');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,64,96,0,.1,10);camera.position.z=5;
  const geometry=new THREE.PlaneGeometry(64,96);geometry.translate(0,88-48,0);
  const material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}),mesh=new THREE.Mesh(geometry,material);mesh.position.set(32,8,0);scene.add(mesh);const results=[];
  for(const a of actors){
   renderer.setSize(a.canvas[0],a.canvas[1]);const texture=await new THREE.TextureLoader().loadAsync(a.sprite);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;material.map=texture;material.needsUpdate=true;renderer.render(scene,camera);results.push({sprite:a.sprite,id:a.id,png:renderer.domElement.toDataURL().split(',')[1]});texture.dispose();
  }
  material.dispose();geometry.dispose();renderer.dispose();return results;
 },c.actors);
 let maxColorDelta=0;
 for(const r of renders){const actual=await sharp(Buffer.from(r.png,'base64')).ensureAlpha().raw().toBuffer(),expected=await sharp(resolve(root,r.sprite)).ensureAlpha().raw().toBuffer();assert.equal(actual.length,expected.length);for(let i=0;i<actual.length;i+=4){assert.equal(actual[i+3],expected[i+3],'GPU alpha/pivot mismatch '+r.id);if(!expected[i+3])continue;for(let k=0;k<3;k++){const delta=Math.abs(actual[i+k]-expected[i+k]);maxColorDelta=Math.max(maxColorDelta,delta);assert.ok(delta<=1,'GPU color mismatch '+r.id);}}}
 assert.deepEqual(errors,[]);const result={passed:true,threeWebGLSprites:renders.length,canvas:[64,96],pivot:[32,88],nearestSampling:true,alphaPixelParity:true,maxColorDelta,errors,artApproved:false,runtimeImported:false};
 await writeFile(resolve(root,'review/gpu-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();await new Promise(done=>server.close(done));}
