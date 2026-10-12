import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);let sharp;
try{sharp=require('sharp');}catch{sharp=require(resolve(process.env.USERPROFILE??process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const folder='docs/design/characters/wang-lin-hoa-than-review-v1',hash=b=>createHash('sha256').update(b).digest('hex');
function bounds(raw,width,height,threshold=2){let left=width,top=height,right=-1,bottom=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(raw[(y*width+x)*4+3]>threshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}assert.ok(right>=left);return {left,top,width:right-left+1,height:bottom-top+1};}
const manifest=JSON.parse(await readFile(folder+'/assets.json','utf8')),fx=[];
manifest.assets=manifest.assets.filter(a=>!a.id.endsWith('-qi'));
for(const id of ['sinh-tu','huyen-tu']){
 const sourceFile=id+'-qi-source.png',source=await readFile(folder+'/'+sourceFile),decoded=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=decoded.info,crop=bounds(decoded.data,width,height);
 assert.equal(decoded.data[(Math.floor(height/2)*width+Math.floor(width/2))*4+3],0,'Transparent ring centre');
 const scale=Math.min(90/crop.width,28/crop.height),size=[Math.max(1,Math.round(crop.width*scale)),Math.max(1,Math.round(crop.height*scale))],offset=[Math.floor((96-size[0])/2),Math.floor((32-size[1])/2)];
 // Mechanical alpha crop and resample of generated ART; no procedural painting.
 const ring=await sharp(source).extract(crop).resize(...size,{kernel:'lanczos3'}).png().toBuffer();
 const bytes=await sharp({create:{width:96,height:32,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:ring,left:offset[0],top:offset[1]}]).png({compressionLevel:9}).toBuffer(),native=await sharp(bytes).ensureAlpha().raw().toBuffer();
 assert.equal(native[(16*96+48)*4+3],0,'Native centre remains transparent');const b=bounds(native,96,32);assert.ok(Math.abs(b.left+(b.width-1)/2-47.5)<=1&&Math.abs(b.top+(b.height-1)/2-15.5)<=1,'Ring centred on ground pivot');
 const file=id+'-qi.png';await writeFile(folder+'/'+file,bytes);await writeFile(folder+'/'+id+'-qi-preview.png',await sharp(bytes).resize(768,256,{kernel:'nearest'}).png().toBuffer());
 manifest.assets.push({id:id+'-qi',file,size:[96,32],sha256:hash(bytes),bytes:bytes.length,role:'Separate static qi ground halo; no character pixels'});
 fx.push({id:id+'-qi',source:{file:sourceFile,size:[width,height],sha256:hash(source)},prompt:id+'-qi.prompt.txt',promptSha256:hash(await readFile(folder+'/'+id+'-qi.prompt.txt')),native:file,framePx:[96,32],groundPivotPx:[48,16],sourceCropPx:crop,resample:{kernel:'lanczos3',size,offset},visibleBoundsPx:b,centerAlpha:0,softAlpha:true,animation:false,runtimeIntegrated:false,ownerApproved:false,artApproved:false});
}
manifest.qiEffects={tool:'built-in image_gen',scope:'Optional static costume review decoration, not R01 skill VFX',defaultEnabled:false,effects:fx};await writeFile(folder+'/assets.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(fx));
