import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),folder=resolve(root,'docs/design/ui/van-ngoc-co-dong-v1');
const require=createRequire(import.meta.url);let sharp;
try{sharp=require('sharp');}catch{sharp=require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const specs=[{id:'hud',size:[2171,724],crop:{left:0,top:159,width:2171,height:400},width:1520},{id:'window',size:[1254,1254],width:1024,slice:.22},{id:'button',size:[2170,725],width:900,slice:.22}];
const assets=[];
for(const spec of specs){
 const file=spec.id+'-source.png',source=await readFile(resolve(folder,file)),meta=await sharp(source).metadata();
 if(!meta.hasAlpha||meta.width!==spec.size[0]||meta.height!==spec.size[1])throw new Error(spec.id+': source changed; review geometry before export.');
 let crop=spec.crop;
 if(!crop){
  const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let l=info.width,t=info.height,r=-1,b=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>1){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
  if(r<0)throw new Error('Empty artwork.');
  const pad=4;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(info.width-1,r+pad);b=Math.min(info.height-1,b+pad);
  crop={left:l,top:t,width:r-l+1,height:b-t+1};
 }
 const output=await sharp(source).extract(crop).resize({width:spec.width,kernel:'lanczos3'}).webp({quality:94,alphaQuality:100}).toBuffer();
 const runtime=spec.id+'.webp';await writeFile(resolve(folder,runtime),output);
 const {data,info}=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const maxAlpha=(rect)=>{let max=0;for(let y=rect[1];y<rect[3];y++)for(let x=rect[0];x<rect[2];x++)max=Math.max(max,data[(y*info.width+x)*4+3]);return max;};
 let clearAlpha;
 if(spec.id==='window')clearAlpha=maxAlpha([Math.round(info.width*.25),Math.round(info.height*.25),Math.round(info.width*.75),Math.round(info.height*.75)]);
 if(spec.id==='hud'){
  clearAlpha=Math.max(maxAlpha([186,128,220,162]),maxAlpha([1300,128,1334,162]),maxAlpha([360,136,1150,192]));
  if(info.width!==1520||info.height!==280)throw new Error('HUD export must remain 1520x280.');
 }
 if(clearAlpha!==undefined&&clearAlpha>2)throw new Error(spec.id+': clear opening has visible fill.');
 assets.push({id:spec.id,source:file,sourceSize:spec.size,sourceSha256:hash(source),crop,file:runtime,width:info.width,height:info.height,bytes:output.length,sha256:hash(output),hasAlpha:true,clearAlphaMax:clearAlpha,slice:spec.slice,display:spec.id==='hud'?[760,140]:undefined,prompt:spec.id+'.prompt.txt'});
}
const refs=[['docs/design/ui/desktop-skill-hud-v3/cultivation-frame-source.png','HUD edit target / geometry'],['docs/design/ui/van-ngoc-kit-v2/window-frame-v2.webp','window edit target'],['docs/design/ui/van-ngoc-kit-v2/jade-button-v2.webp','button edit target'],['docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp','approved map palette/material reference']];
const references=[];for(const [path,role] of refs)references.push({path,role,sha256:hash(await readFile(resolve(root,path)))});
await writeFile(resolve(folder,'assets.json'),JSON.stringify({date:'2026-10-11',tool:'built-in image_gen',status:'prototype-pending-visual-review',ownerApproved:false,artApproved:false,runtimeIntegrated:false,references,processing:'Crop only specified delivery area / alpha>1 bounds + 4px safety; uniform Lanczos3 resize and WebP conversion. Generated source pixels unchanged; no recolor, repaint, mask, blur, sharpening or independent part scaling.',assets},null,2)+'\n');
// Isolated preview directory, distinct from the approved live skin and its assets.
const publicFolder=resolve(root,'client/public/assets/van-ngoc-co-dong-v1');await mkdir(publicFolder,{recursive:true});
for(const asset of assets)await writeFile(resolve(publicFolder,asset.file),await readFile(resolve(folder,asset.file)));
await writeFile(resolve(publicFolder,'concept.webp'),await readFile(resolve(root,'docs/design/world/hang-nhac-van-ngoc-concept-v1/concept.webp')));
console.log(JSON.stringify(assets.map(({id,width,height,bytes,clearAlphaMax})=>({id,width,height,bytes,clearAlphaMax}))));
await import('./build-co-dong-aperture.mjs');
