// Authored VFX export only; preserve ImageGen alpha and all original sources.
import { createRequire } from 'node:module';import { homedir } from 'node:os';
import { readFile,writeFile,mkdir } from 'node:fs/promises';import { join,resolve } from 'node:path';import { createHash } from 'node:crypto';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const root=resolve('docs/design/vfx/quest-qi-v1'),input=await readFile(join(root,'source-v1.png')),meta=await sharp(input).metadata();
if(meta.width!==1536||meta.height!==1024||!meta.hasAlpha)throw new Error('Unexpected quest qi source canvas/alpha.');
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const rows=[{id:'formation',top:0,height:250,anchor:[64,73]},{id:'rising-qi',top:250,height:310,anchor:[64,103]},
 {id:'recovery-bloom',top:560,height:240,anchor:[64,64]},{id:'palm-accent',top:800,height:224,anchor:[64,64]}];
const catalog={version:1,tool:'built_in_imagegen',artApproved:false,ownerApproved:false,source:{file:'source-v1.png',sha256:hash(input),prompt:'source-v1.prompt.txt',reference:'../frame-by-frame-r01/atlases/sword-charge.png'},clips:{}};
await mkdir(join(root,'atlases'),{recursive:true});
for(const row of rows){const files=[];await mkdir(join(root,'frames',row.id),{recursive:true});
 for(let index=0;index<4;index++){
  const height=Math.round(row.height/3),sprite=await sharp(input).extract({left:index*384,top:row.top,width:384,height:row.height}).resize(128,height).png().toBuffer();
  const bytes=await sharp({create:{width:128,height:128,channels:4,background:'#00000000'}}).composite([{input:sprite,left:0,top:Math.floor((128-height)/2)}]).png().toBuffer();
  const file=`frames/${row.id}/${index+1}.png`;await writeFile(join(root,file),bytes);files.push(file);
 }
 const bytes=await sharp({create:{width:528,height:132,channels:4,background:'#00000000'}}).composite(files.map((file,i)=>({input:join(root,file),left:i*132+2,top:2}))).webp({lossless:true,effort:6}).toBuffer();
 await writeFile(join(root,'atlases',row.id+'.webp'),bytes);
 catalog.clips[row.id]={fps:row.id==='palm-accent'?10:row.id==='recovery-bloom'?5:4,durations:[1,1,1,1],loop:['formation','rising-qi'].includes(row.id),
  frameSize:[128,128],anchor:row.anchor,atlasSize:[528,132],atlasUrl:`/assets/quest-qi/${row.id}.webp?v=${hash(bytes).slice(0,16)}`,sampling:'linear',
  frames:files.map((_,i)=>({x:i*132+2,y:2,w:128,h:128})),canonical:files,bytes:bytes.length,sha256:hash(bytes),sourceRect:{top:row.top,height:row.height,cellWidth:384},commonScale:1/3};
}
await writeFile(join(root,'clips.json'),JSON.stringify(catalog,null,2)+'\n');console.log('Packed four quest qi FX / 16 native 128×128 frames.');
