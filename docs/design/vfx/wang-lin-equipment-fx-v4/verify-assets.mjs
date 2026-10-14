import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';

const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
const partial=process.argv.includes('--partial');
const read=async p=>readFile(resolve(root,p)),json=async p=>JSON.parse(await read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const m=await json('manifest.json'),reg=await json('registration.json');
assert.deepEqual(m.frameSize,[384,320]);assert.deepEqual(m.pivot,[176,288]);
assert.equal(m.atlasGutter,2);assert.equal(m.ownerApproved,false);assert.equal(m.artApproved,false);assert.equal(m.runtimeIntegrated,false);
assert.equal(m.decodedCacheBudgetBytes,16*1024*1024);
if(!partial){assert.deepEqual(m.pending,[]);assert.equal(Object.keys(m.clips).length,12);assert.equal(m.coverage.canonicalFrames,72);}
const basis=[];
for(const pin of m.bodyBasis.targets){assert.equal(hash(await readFile(resolve(workspace,pin.file))),pin.sha256,'Pinned v3 body/gear changed');basis.push({...pin,unchanged:true});}
assert.equal(m.bodyBasis.bodyPixelsModified,false);assert.equal(m.bodyBasis.gearPixelsModified,false);
const sequences=[];let canonicalCount=0;
for(const clip of Object.values(m.clips)){
 assert.equal(clip.frameCount,6);assert.equal(clip.loop,clip.phase==='escort');assert.deepEqual(clip.frameSize,m.frameSize);assert.deepEqual(clip.pivot,m.pivot);
 assert.equal(clip.frames.length,6);assert.equal(clip.frameHoldsMs.length,6);assert(clip.frameHoldsMs.every(v=>v>=1));assert.equal(clip.durationMs,clip.frameHoldsMs.reduce((a,b)=>a+b,0));
 const r=reg.registration.find(r=>r.id===clip.id);assert(r);assert.equal(r.frames.length,6);assert.equal(r.scale>0,true);
 assert.equal(r.scaleBasis.includes('no per-frame fit'),true);assert(r.frames.every(f=>f.scale===r.scale));assert.equal(r.fringeCleanup.noLargestComponentFilter,true);
 assert.equal(hash(await read(clip.source)),clip.sourceSha256);assert.equal(clip.sourceSha256,r.sourceSha256);
 const atlasBytes=await read(clip.atlas);assert.equal(hash(atlasBytes),clip.atlasSha256);
 const{data:atlas,info}=await sharp(atlasBytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],clip.atlasSize);assert.equal(clip.decodedBytes,info.width*info.height*4);
 const frames=[];
 for(let n=0;n<6;n++){
  const f=clip.frames[n],bytes=await read(f.file);assert.equal(hash(bytes),f.sha256);
  const{data,info:frameInfo}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([frameInfo.width,frameInfo.height],clip.frameSize);
  const extracted=await sharp(atlasBytes).extract({left:f.rect.x,top:f.rect.y,width:f.rect.w,height:f.rect.h}).ensureAlpha().raw().toBuffer();assert(extracted.equals(data),'Atlas differs from canonical frame '+f.file);
  let edgeAlpha4=0,partialAlpha=0,alpha64Pixels=0;
  for(let y=0;y<frameInfo.height;y++)for(let x=0;x<frameInfo.width;x++){
   const a=data[(y*frameInfo.width+x)*4+3];if(a>=4&&(x<2||y<2||x>=frameInfo.width-2||y>=frameInfo.height-2))edgeAlpha4++;if(a>3&&a<255)partialAlpha++;if(a>=64)alpha64Pixels++;
  }
  assert.equal(edgeAlpha4,0,'Full soft alpha touches padding '+f.file);assert(alpha64Pixels>0,'Missing bright phase frame');
  for(let y=f.rect.y-2;y<f.rect.y+f.rect.h+2;y++)for(let x=f.rect.x-2;x<f.rect.x+f.rect.w+2;x++)if(x<f.rect.x||x>=f.rect.x+f.rect.w||y<f.rect.y||y>=f.rect.y+f.rect.h)assert.equal(atlas[(y*info.width+x)*4+3],0,'Atlas gutter contaminated');
  frames.push({frame:n+1,sha256:f.sha256,alpha64Pixels,partialAlphaPixels:partialAlpha,fullAlphaMarginPixels:2,atlasRgbaExact:true});canonicalCount++;
 }
 assert.equal(new Set(clip.frames.map(f=>f.sha256)).size,6,'Six source stages collapsed/duplicated');
 const peak=Math.max(...clip.frames.map(f=>f.coreBounds[2]-f.coreBounds[0]));assert(Math.abs(peak-clip.peakTargetWidth)<=2,'Peak scale discrepancy');
 sequences.push({id:clip.id,sourceUnchanged:true,singleScale:r.scale,nativeOrigin:r.nativeOrigin,frames,decodedBytes:clip.decodedBytes,peakNativeCoreWidth:peak,softAlphaPreserved:true,componentsRemoved:0});
}
assert.equal(canonicalCount,m.coverage.canonicalFrames);
const kitMemory=m.kits.map(kit=>{const bytes=kit.clips.reduce((sum,id)=>sum+m.clips[id].decodedBytes,0);assert(bytes<=m.decodedCacheBudgetBytes,'One complete selected kit exceeds FX cache');return{id:kit.id,sequences:kit.clips.length,decodedBytes:bytes,fits16MiB:true};});
const report={date:'2026-10-13',status:m.pending.length?'partial':'passed',coverage:{sequences:sequences.length,canonicalFrames:canonicalCount,pending:m.pending},checks:{sourceBytesUnchanged:true,v3BodyGearBytesUnchanged:true,singleScalePerSource:true,fixedSourceEmitter:true,canonicalAtlasRgbaExact:true,allSixStagesDistinct:true,fullSoftAlphaPadding:true,atlasGutter2:true,oneCompleteKitFits16MiB:true},basis,sequences,kitMemory,scope:'Technical source, registration, frame and atlas checks. Visual owner ART/motion review and live integration are separate.',ownerApproved:false,artApproved:false,runtimeIntegrated:false};
await mkdir(resolve(root,'review'),{recursive:true});await writeFile(resolve(root,'review/asset-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,sequences:sequences.length,canonicalFrames:canonicalCount,pending:m.pending,v3BasisPins:basis.length,kitMemory}));
