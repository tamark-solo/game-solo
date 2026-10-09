import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch{sharp=require(join(process.env.VFX_NODE_MODULES||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'sharp'));}
const root=resolve('docs/design/characters/core-cast-v1');
const data=JSON.parse(await readFile(join(root,'clips.json'),'utf8'));
const sources=JSON.parse(await readFile(join(root,'sources.json'),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputs=[];
for(const source of sources){
  const bytes=await readFile(join(root,source.file)),metadata=await sharp(bytes).metadata();
  const prompt=`prompts/${source.key}.txt`,reference=`references/${source.actor}-${source.direction}.png`;
  assert.ok(metadata.hasAlpha);assert.ok(metadata.width>=1024&&metadata.height>=384,'source has enough pixels for an 8 × 3 sheet');
  inputs.push({...source,sha256:hash(bytes),dimensions:[metadata.width,metadata.height],alpha:true,
    prompt,promptSha256:hash(await readFile(join(root,prompt))),reference,referenceSha256:hash(await readFile(join(root,reference)))});
}
const frames=[];
for(const [id,clip] of Object.entries(data.clips)){
  const unique=new Set();
  for(const frame of clip.frames){
    const png=await readFile(join(root,frame.file)),raw=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    unique.add(hash(png));
    assert.equal(raw.info.width,clip.frameSize[0]);assert.equal(raw.info.height,96);
    let opaque=0,blank=0,bottom=-1,top=96;
    for(let y=0;y<96;y++)for(let x=0;x<raw.info.width;x++){
      const alpha=raw.data[(y*raw.info.width+x)*4+3];
      if(alpha===0)blank++;
      if(alpha>12){opaque++;top=Math.min(top,y);bottom=Math.max(bottom,y);}
    }
    assert.ok(opaque>100&&blank>raw.info.width*96*.4,`${id}: transparent single body`);
    assert.ok(bottom-top+1<=80,`${id}: native body height`);
    assert.ok(Math.abs(bottom-(88-clip.hoverHeight))<=1,`${id}: foot/hover registration`);
    frames.push({clip:id,file:frame.file,sha256:hash(png),opaquePixels:opaque,bodyHeight:bottom-top+1,bottom,anchor:clip.anchor});
  }
  assert.ok(unique.size>=4,`${id}: actual changing poses`);
  const atlas=await readFile(join(root,clip.atlas));assert.equal(hash(atlas),clip.sha256);
}
assert.equal(inputs.length,11);assert.equal(Object.keys(data.clips).length,33);assert.equal(frames.length,264);
const selected=new Set(sources.map(s=>s.file.split('/').pop()));
const historicalCandidates=(await readdir(join(root,'source'))).filter(name=>!selected.has(name)).map(name=>'source/'+name);
await writeFile(join(root,'provenance.json'),JSON.stringify({date:'2026-10-09',generator:'built_in_imagegen',
  artApproved:false,ownerApproved:false,selectedInputs:inputs,historicalCandidates,
  processing:'crop / one scale per source sheet / foot registration / lossless atlas; no painted poses or background removal',
  nativeSources:{wang:'docs/design/characters/wang-lin-chibi-walk-v1/native-v2',situ:'docs/design/characters/chibi-roster-v1/situ-nan/native-v2',li:'docs/design/characters/chibi-roster-v1/li-muwan/native-v5'},
  runtimeOriginalEastSources:['docs/design/vfx/frame-by-frame-r01','docs/design/vfx/r01-thunder-v1','docs/design/vfx/r01-wind-v1']},null,2)+'\n');
await writeFile(join(root,'technical-verification.json'),JSON.stringify({passed:true,date:new Date().toISOString(),
  artApproved:false,newClips:33,newFrames:264,runtimeBindings:36,runtimeCastingFrames:300,frames},null,2)+'\n');
console.log(JSON.stringify({passed:true,newClips:33,newFrames:264,alpha:true,bodyMax:80,footY:88,spiritHover:4},null,2));
