// Source/native measurement proposals only. No automatic root or ART confirmation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha,containedPoseLabels,maskedPose,suggestBootPairBandRoot} from '../../van-hai-npc-motion-v2/review/measurement-helper.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const hash=b=>createHash('sha256').update(b).digest('hex');
function local(file){const path=resolve(root,file),rel=relative(root,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside new motion pack');return path;}
const json=async file=>JSON.parse(await readFile(local(file),'utf8'));
const optionalJson=async file=>{try{return await json(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const args=process.argv.slice(2);
assert.ok(args.every(a=>!a.startsWith('--')||['--ids','--refresh','--render'].includes(a)),'Unknown option');
assert.ok(!(args.includes('--refresh')&&args.includes('--render')),'Choose refresh or render, not both');
const ids=[...new Set(args.filter(a=>!a.startsWith('--')).flatMap(a=>a.split(',')).filter(Boolean))];
assert.ok(ids.length&&ids.every(id=>/^[a-z0-9-]+$/.test(id)),'Explicit slug-direction IDs required');
const plan=await json('production-plan.json'),report=await json('review/source-components.json');
const expected=[['bach-chi','NPC-HN-HERBALIST'],['tong-thiet','NPC-HN-FORGE'],['hua-hanh','NPC-HN-ROUTE-KEEPER'],['dinh-soc','NPC-HN-GATE-WARDEN'],['ky-an','NPC-HN-DISCIPLE-WATER'],['phung-da','NPC-HN-DISCIPLE-SWORD']];
const newDirections=['south','southwest','west','northwest','north','northeast','east'];
assert.equal(plan.actors.length,6,'Six Wave A actors required');
assert.deepEqual(new Set(plan.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])),'Unexpected Wave A IDs');
assert.equal(plan.requests.length,42,'Six actors × seven real directional sources required');
assert.equal(new Set(plan.requests.map(q=>q.slug+'/'+q.direction)).size,42,'Duplicate actor/direction request');
for(const [slug,id] of expected){assert.equal(plan.actors.find(a=>a.slug===slug)?.id,id);for(const direction of newDirections)assert.ok(plan.requests.some(q=>q.slug===slug&&q.direction===direction),'Missing authored actor/direction');}
assert.ok(plan.requests.every(q=>newDirections.includes(q.direction)&&expected.some(a=>a[0]===q.slug)),'Seven new actual views only; southeast remains immutable pilot');
assert.equal(await optionalJson('approval.json'),null,'Approved pack is immutable; create a new version');
const registration=await optionalJson('registration-input.json'),summaries=[];
await mkdir(local('review'),{recursive:true});
for(const id of ids){
 const q=plan.requests.find(q=>q.slug+'-'+q.direction===id);assert.ok(q,'Unknown explicit ID: '+id);
 const source=await readFile(local(q.source)),sourceSha256=hash(source),file='review/'+id+'-root-review.json';
 const evidence=report.sources.find(s=>s.slug===q.slug&&s.direction===q.direction&&s.sourceSha256===sourceSha256);
 assert.ok(evidence&&evidence.source===q.source,'Inspect exact selected source first: '+id);
 const confirmed=registration?.sources?.find(s=>s.slug===q.slug&&s.direction===q.direction);
 if(confirmed){assert.equal(confirmed.sourceSha256,sourceSha256);summaries.push({id,skipped:'Confirmed roots preserved'});continue;}
 const prior=await optionalJson(file);
 if(prior&&args.includes('--refresh')&&prior.sourceSha256!==sourceSha256){
  // Keep every previous proposal/render revision under its exact source hash.
  // A single "initial" archive would silently lose second and later corrections.
  const prefix='review/rejected/'+id+'-'+prior.sourceSha256;
  await mkdir(local('review/rejected'),{recursive:true});const archived=[];
  for(const [kind,original] of [['proposal',file],['strip',prior.reviewStrip],['large-strip',prior.largeReviewStrip]]){
   if(!original)continue;const bytes=await readFile(local(original)),sha256=hash(bytes),target=prefix+'-'+kind+(kind==='proposal'?'.json':'.png');
   try{assert.equal(hash(await readFile(local(target))),sha256,'Existing revision archive differs; never replace it');}
   catch(error){if(error.code!=='ENOENT')throw error;await writeFile(local(target),bytes);}
   archived.push({kind,original,file:target,sha256});
  }
  const manifestFile=prefix+'-archive.json',manifest={schema:'npc-motion-root-revision-archive-1',slug:q.slug,direction:q.direction,source:prior.source,sourceSha256:prior.sourceSha256,replacedBySource:q.source,replacedBySourceSha256:sourceSha256,files:archived,rule:'Original proposal and strips preserved byte-for-byte for this prior source revision; no approval granted.'};
  try{const existing=await json(manifestFile);assert.equal(existing.sourceSha256,prior.sourceSha256);assert.deepEqual(existing.files,archived);}
  catch(error){if(error.code!=='ENOENT')throw error;await writeFile(local(manifestFile),JSON.stringify(manifest,null,2)+'\n');}
 }
 if(prior&&!args.includes('--refresh')&&!args.includes('--render')){assert.equal(prior.sourceSha256,sourceSha256,'Source revision needs explicit refresh');summaries.push({id,skipped:'Existing proposal and manual edits preserved',proposal:file,strip:prior.reviewStrip});continue;}
 if(args.includes('--render'))assert.ok(prior,'Render requires an existing manually editable proposal');
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const threshold=evidence.alphaThreshold??128,{labels,components}=labelAlpha(data,info.width,info.height,threshold);
 assert.equal(components.filter(c=>c.area>=250).length,18,'Exactly18 full pose components required');
 assert.equal(evidence.detectedCountMatches,true,'Ambiguous rows need source correction or explicit component review');
 const ordered=[...evidence.detectedFrames].sort((a,b)=>a.index-b.index);
 assert.deepEqual(ordered.map(f=>f.index),Array.from({length:18},(_,i)=>i));
 let proposal;
 if(args.includes('--render')){
  proposal=prior;assert.equal(proposal.sourceSha256,sourceSha256);assert.equal(proposal.source,q.source);
  assert.equal(proposal.proposalOnly,true);assert.equal(proposal.frames.length,18);
 }else{
  const frames=ordered.map(f=>{
   const candidate=suggestBootPairBandRoot(labels,info.width,f);
   const selection=containedPoseLabels(components,f);
   return {index:f.index,action:f.action,frame:f.frame,left:f.left,top:f.top,width:f.width,height:f.height,
    componentLabels:[...selection.labels],rootX:candidate.rootX,rootY:candidate.rootY,
    bootPairBandCandidate:candidate,bootPairSupportWitness:null,manualRootBasis:'',
    rootBasis:'UNCONFIRMED lower-band candidate. Locate both boot soles and exclude prop tips/robe hems manually.'};
  });
  proposal={schema:'npc-wave-a-motion-root-review-proposal-2',date:'2026-10-13',slug:q.slug,direction:q.direction,
   source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],prompt:q.prompt,alphaThreshold:threshold,
   neutralIndex:0,neutralTopY:frames[0].top,neutralBodyTopConfirmed:false,neutralBodyTopBasis:'',
   manualRootReviewBasis:'',frames,canvas:[96,96],pivot:[48,88],proposalOnly:true,visuallyReviewed:false,
   rootReviewPolicy:'Review source and native strip. Set neutralTopY to the actual crown/body top (exclude props), neutralBodyTopConfirmed=true and neutralBodyTopBasis. For every frame set rootX/rootY from both boots, bootPairSupportWitness=[left,top,right,bottom] covering both boot support bands, and manualRootBasis (or a shared manualRootReviewBasis). Run --render after edits, then explicit confirm with exact-hash visual assessment.',
   artApproved:false,ownerApproved:false,motionApproved:false,runtimeImported:false};
 }
 assert.deepEqual(new Set(proposal.frames.map(f=>f.index)),new Set(Array.from({length:18},(_,i)=>i)));
 const neutral=proposal.frames.find(f=>f.index===0),neutralHeight=neutral.rootY-proposal.neutralTopY,scale=80/neutralHeight;
 assert.ok(Number.isFinite(scale)&&scale>0&&Number.isFinite(proposal.neutralTopY));
 proposal.neutralHeight=neutralHeight;proposal.scale=scale;
 const layers=[],diagnostics=[];
 for(const f of [...proposal.frames].sort((a,b)=>a.index-b.index)){
  assert.equal(f.action,['idle','talk','profession'][Math.floor(f.index/6)]);assert.equal(f.frame,f.index%6);
  const selection=containedPoseLabels(components,f,f.componentLabels);
  assert.equal(selection.bodies.length,1,'Each measured pose must contain one complete connected body');
  const {pixels:crop,opaque}=maskedPose(data,info.width,info.height,labels,selection.labels,f);
  const size=[Math.max(1,Math.round(f.width*scale)),Math.max(1,Math.round(f.height*scale))];
  const pixels=await sharp(crop,{raw:{width:f.width,height:f.height,channels:4}}).resize(size[0],size[1],{kernel:'nearest'}).raw().toBuffer();
  const offset=[Math.round(48-(f.rootX-f.left)*scale),Math.round(88-(f.rootY-f.top)*scale)],native=Buffer.alloc(96*96*4);
  let clippedOpaquePixels=0,nativeOpaquePixels=0;
  for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){const src=(y*size[0]+x)*4;if(!pixels[src+3])continue;const dx=x+offset[0],dy=y+offset[1];if(dx<0||dy<0||dx>=96||dy>=96){clippedOpaquePixels++;continue;}pixels.copy(native,(dy*96+dx)*4,src,src+4);nativeOpaquePixels++;}
  const body=await sharp(native,{raw:{width:96,height:96,channels:4}}).png().toBuffer();
  const guide='<svg width="96" height="96"><path d="M0 88H96" stroke="#73988c" stroke-width=".5"/><path d="M44 88H52M48 84V92" stroke="#dc4766" stroke-width="1"/><text x="2" y="95" font-family="monospace" font-size="5" fill="#53645b">'+f.index+' '+f.action+'</text></svg>';
  const tile=await sharp({create:{width:96,height:96,channels:4,background:'#e9e6db'}}).composite([{input:Buffer.from(guide),left:0,top:0},{input:body,left:0,top:0}]).png().toBuffer();
  layers.push({input:tile,left:f.frame*96,top:Math.floor(f.index/6)*96});
  diagnostics.push({index:f.index,sourceOpaque:opaque,nativeOpaquePixels,clippedOpaquePixels,nativeSize:size,offset,sourceLabels:[...selection.labels],
   crownToRootNative:+((f.rootY-f.top)*scale).toFixed(2),manualBootPairWitnessPresent:Array.isArray(f.bootPairSupportWitness)});
 }
 const strip='review/'+id+'-root-review-2x.png',largeStrip='review/'+id+'-root-review-6x.png';
 const sheet=await sharp({create:{width:576,height:288,channels:4,background:'#e9e6db'}}).composite(layers).png().toBuffer();
 await sharp(sheet).resize(1152,576,{kernel:'nearest'}).png().toFile(local(strip));
 await sharp(sheet).resize(3456,1728,{kernel:'nearest'}).png().toFile(local(largeStrip));
 proposal.diagnostics=diagnostics;proposal.reviewStrip=strip;proposal.largeReviewStrip=largeStrip;
 proposal.reviewStripSha256=hash(await readFile(local(strip)));proposal.largeReviewStripSha256=hash(await readFile(local(largeStrip)));
 proposal.renderedMeasurementSha256=hash(Buffer.from(JSON.stringify({neutralTopY:proposal.neutralTopY,frames:proposal.frames})));
 proposal.needsManualAdjustment=diagnostics.some(d=>d.clippedOpaquePixels>0);
 await writeFile(local(file),JSON.stringify(proposal,null,2)+'\n');
 summaries.push({id,proposal:file,strip,largeStrip,scale,needsManualAdjustment:proposal.needsManualAdjustment,manualConfirmationRequired:true});
}
console.log(JSON.stringify({proposals:summaries,artApprovalGranted:false}));
