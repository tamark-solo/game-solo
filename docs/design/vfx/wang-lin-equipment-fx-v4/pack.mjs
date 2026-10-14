import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';

// Registration and packing only: no API calls, paint, hue filter or body edits.
const root=dirname(fileURLToPath(import.meta.url));
const workspace=resolve(root,'../../../..');
const partial=process.argv.includes('--partial');
const canvas=[384,320],pivot=[176,288],gutter=2;
// Source inspection found the drawn ribbon-tail base lower than requested y416.
// One reviewed correction per whole sequence; no frame-bound alignment.
const sourceRegistrationOverrides={
 'banner-escort':{originNormalized:[.5,.9375],requestedCellOrigin:[256,416],registeredCellOrigin:[256,480],reason:'Visible common soul-ribbon tail base around cell y480; source varies modestly in lower-row tail curl. One uniform correction keeps the source development.'},
 'sword-escort':{originNormalized:[.5,.9375],requestedCellOrigin:[256,416],registeredCellOrigin:[256,480],reason:'Visible common hắc-khí tail base around cell y480; no per-frame fitting of coil/slash stages.'},
 'chariot-escort':{originNormalized:[.5,.9375],requestedCellOrigin:[256,416],registeredCellOrigin:[256,480],reason:'Visible common lower chain base around cell y480; preserve source chain/roar movement and slight lower-row drift, no per-frame fitting.'},
 'chariot-charge':{originNormalized:[.5,.9375],requestedCellOrigin:[256,416],registeredCellOrigin:[256,480],reason:'Common chain base appears around cell y480; one uniform source registration for all six charging poses.'},
 'sword-release':{sourceOrigins:[[222,315],[695,320],[1169,327],[143,835],[630,845],[1167,852]],expectedSourceSize:[1536,1024],nativeOrigin:[210,248],requestedNativeOrigin:[244,222],originEvidence:['visible ivory burst star','visible ivory burst star','visible ivory burst star','visible ivory burst star','estimated continuation of faded burst/emitter','estimated continuation of faded burst/emitter'],reason:'Manual physical emitter registration fixes bright burst position across source cells. Late fade origins are explicit estimates; fixed global scale and one native emitter, no per-frame bbox fit.'},
 'chariot-release':{originNormalized:[.5,.5],nativeOrigin:[244,200],requestedNativeOrigin:[244,222],reason:'Common native emitter raised22px for full alpha4 padding; peak width225 and source scale preserved. One offset for all six frames; no clipping/cropping/haze-driven downscale.'},
 'chariot-residual':{originNormalized:[.5,.5],nativeOrigin:[256,220],requestedNativeOrigin:[256,228],reason:'Common native emitter raised8px for full alpha4 padding; peak width165 and source scale preserved. One offset for all six fading stages; no clipping/cropping or per-frame fit.'}
};
const hash=b=>createHash('sha256').update(b).digest('hex');
const exists=async p=>{try{await access(p);return true;}catch{return false;}};
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const safe=p=>{const v=resolve(root,p);if(v!==root&&!v.startsWith(root+sep))throw Error('Output path escapes package: '+p);return v;};
const save=async(p,v)=>{const target=safe(p);await mkdir(dirname(target),{recursive:true});await writeFile(target,JSON.stringify(v,null,2)+'\n');};
const bounds=(data,w,h,threshold=1)=>{let l=w,t=h,r=0,b=0,count=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>=threshold){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);count++;}return count?{rect:[l,t,r,b],count}:null;};
const bands=projection=>{const r=[];let a=-1;for(let i=0;i<=projection.length;i++){if(i<projection.length&&!projection[i]){if(a<0)a=i;}else if(a>=0){r.push([a,i]);a=-1;}}return r;};
function cutsFor(projection,count,label){
 const size=projection.length,empty=bands(projection),cuts=[0],diagnostics=[];
 for(let n=1;n<count;n++){
  const ideal=n*size/count,window=size/count*.28;
  const eligible=empty.filter(([a,b])=>b>ideal-window&&a<ideal+window&&b-a>=2);
  if(!eligible.length)throw Error(`${label}: no measured transparent gutter near boundary ${n}; inspect source, do not divide blindly`);
  eligible.sort((a,b)=>Math.abs((a[0]+a[1])/2-ideal)-Math.abs((b[0]+b[1])/2-ideal));
  const band=eligible[0],cut=Math.floor((Math.max(band[0],ideal-window)+Math.min(band[1],ideal+window))/2);
  if(cut<=cuts.at(-1)||projection[cut])throw Error(`${label}: invalid empty gutter`);
  cuts.push(cut);diagnostics.push({boundary:n,ideal,emptyBand:band,cut,alphaThreshold:4,alpha4PixelsAtCut:projection[cut]});
 }
 cuts.push(size);return{cuts,diagnostics};
}
const defaults={escort:{layer:'rear',width:140,origin:[176,220],holds:[300,300,300,300,300,300]},ground:{layer:'ground',width:160,origin:[176,282],holds:[180,180,220,280,320,380]},charge:{layer:'rear',width:150,origin:[176,220],holds:[150,150,150,150,150,150]},release:{layer:'rear',width:200,origin:[176,212],holds:[80,80,80,80,80,80]},residual:{layer:'rear',width:150,origin:[176,224],holds:[140,140,140,140,140,140]}};
const plan=await read(safe('plan.json'));
const generation=await exists(safe('generation.json'))?await read(safe('generation.json')):{requests:[]};
const priorInspection=await exists(safe('review/source-inspection.json'))?await read(safe('review/source-inspection.json')):{inspections:[]};
const requests=generation.requests??generation.records??generation.jobs??[];
const supplied=plan.sequences??plan.jobs??plan.fx?.sequences;
if(!Array.isArray(supplied))throw Error('plan.json must expose sequences or jobs array');
const jobs=supplied.flatMap(job=>job.phases?job.phases.map(phase=>({...job,...phase,id:phase.id.includes('-')?phase.id:job.id+'-'+phase.id,phase:phase.phase??phase.id})):job);
if(new Set(jobs.map(j=>j.id)).size!==jobs.length)throw Error('Duplicate sequence id');
if(await exists(safe('approval.json')))throw Error('Approved package frozen; create another version');
const clips={},registrations=[],inspections=[],sourcePins=[],pending=[],outputBuffers=new Map();
for(const job of jobs){
 const phase=job.phase??job.id.split('-').at(-1),kit=job.kit??job.actor??job.id.split('-')[0],d=defaults[phase];
 if(!d)throw Error('Unknown phase '+phase);
 const request=Array.isArray(requests)?requests.find(r=>r.id===job.id):requests[job.id];
 const source=job.source??request?.raw??`sources/${job.id}-source.png`;
 if(!await exists(safe(source))){pending.push(job.id);continue;}
 const bytes=await readFile(safe(source));
 if(request?.sha256&&hash(bytes)!==request.sha256)throw Error(job.id+': source hash mismatch');
 const{data:original,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height;
 if(sourceRegistrationOverrides[job.id]?.expectedSourceSize&&JSON.stringify([w,h])!==JSON.stringify(sourceRegistrationOverrides[job.id].expectedSourceSize))throw Error(job.id+': reviewed emitter coordinates require original source size');
 const clean=Buffer.from(original);let lowFringe=0,clearRgb=0;
 // Drop ONLY alpha1..3 floating noise; every disconnected alpha>=4 shard stays.
 for(let i=0;i<clean.length;i+=4){if(clean[i+3]>0&&clean[i+3]<4){clean[i+3]=0;lowFringe++;}if(!clean[i+3]&&(clean[i]||clean[i+1]||clean[i+2])){clean.fill(0,i,i+3);clearRgb++;}}
 if(!clean.some((v,i)=>i%4===3&&v===0))throw Error(job.id+': opaque source background');
 const edge={top:0,right:0,bottom:0,left:0};
 for(let x=0;x<w;x++){if(clean[x*4+3]>=8)edge.top++;if(clean[((h-1)*w+x)*4+3]>=8)edge.bottom++;}
 for(let y=0;y<h;y++){if(clean[(y*w)*4+3]>=8)edge.left++;if(clean[(y*w+w-1)*4+3]>=8)edge.right++;}
 if(Object.values(edge).some(Boolean))throw Error(job.id+': source alpha8 reaches an outer edge');
 const py=Array(h).fill(0);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(clean[(y*w+x)*4+3]>=4)py[y]++;
 const ys=cutsFor(py,2,job.id+' rows'),cells=[],vertical=[];
 for(let row=0;row<2;row++){
  const px=Array(w).fill(0);for(let y=ys.cuts[row];y<ys.cuts[row+1];y++)for(let x=0;x<w;x++)if(clean[(y*w+x)*4+3]>=4)px[x]++;
  const xs=cutsFor(px,3,job.id+' row '+row);vertical.push({row,...xs});
  for(let col=0;col<3;col++){
   const rect=[xs.cuts[col],ys.cuts[row],xs.cuts[col+1],ys.cuts[row+1]],cw=rect[2]-rect[0],ch=rect[3]-rect[1];
   const raw=await sharp(clean,{raw:{width:w,height:h,channels:4}}).extract({left:rect[0],top:rect[1],width:cw,height:ch}).raw().toBuffer();
   const full=bounds(raw,cw,ch,4),core=bounds(raw,cw,ch,64);
   if(!full||!core)throw Error(`${job.id} frame${row*3+col+1}: missing alpha64 core`);
   // Common source emitter is fixed; measured gutters crop only.
   const normalized=sourceRegistrationOverrides[job.id]?.originNormalized??job.sourceSheet?.originNormalized??(job.sourceOrigin&&job.sourceSheet?.nominalCell?[job.sourceOrigin[0]/job.sourceSheet.nominalCell[0],job.sourceOrigin[1]/job.sourceSheet.nominalCell[1]]:[.5,.5]);
   const sourceOrigin=sourceRegistrationOverrides[job.id]?.sourceOrigins?.[row*3+col]??job.sourceOrigins?.[row*3+col]??[(col+normalized[0])*w/3,(row+normalized[1])*h/2];
   cells.push({raw,w:cw,h:ch,sourceRect:rect,sourceOrigin,localOrigin:[sourceOrigin[0]-rect[0],sourceOrigin[1]-rect[1]],alphaBounds:full.rect,coreBounds:core.rect,alpha4Pixels:full.count,alpha64Pixels:core.count});
  }
 }
 const peakWidth=Math.max(...cells.map(c=>c.coreBounds[2]-c.coreBounds[0]));
 const target=job.targetWidth??job.peakTargetWidth??job.width??(kit==='chariot'&&phase==='release'?220:d.width);
 const scale=job.scale??target/peakWidth,origin=sourceRegistrationOverrides[job.id]?.nativeOrigin??job.origin??job.nativeOrigin??d.origin;
 const holds=job.frameHoldsMs??job.holdsMs??d.holds;
 if(holds.length!==6||holds.some(v=>!Number.isFinite(v)||v<1))throw Error(job.id+': six positive holds required');
 const packed=[],mapped=[];
 for(let index=0;index<6;index++){
  const c=cells[index],b=c.alphaBounds,crop=await sharp(c.raw,{raw:{width:c.w,height:c.h,channels:4}}).extract({left:b[0],top:b[1],width:b[2]-b[0],height:b[3]-b[1]}).png().toBuffer();
  const size=[Math.max(1,Math.round((b[2]-b[0])*scale)),Math.max(1,Math.round((b[3]-b[1])*scale))];
  const offset=[Math.round(origin[0]+(b[0]-c.localOrigin[0])*scale),Math.round(origin[1]+(b[1]-c.localOrigin[1])*scale)];
  if(offset[0]<2||offset[1]<2||offset[0]+size[0]>canvas[0]-2||offset[1]+size[1]>canvas[1]-2)throw Error(`${job.id} frame${index+1}: full alpha4 clips common canvas at scale ${scale}, origin ${origin}, offset ${offset}, size ${size}; inspect origin/width, no fit-per-frame`);
  const sprite=await sharp(crop).resize(...size,{kernel:'nearest'}).png().toBuffer();
  const out=await sharp({create:{width:canvas[0],height:canvas[1],channels:4,background:'#00000000'}}).composite([{input:sprite,left:offset[0],top:offset[1]}]).png().toBuffer();
  const pixels=await sharp(out).ensureAlpha().raw().toBuffer();
  const file=`fx/frames/${job.id}/${String(index+1).padStart(3,'0')}.png`,rect={x:gutter+(index%3)*(canvas[0]+2*gutter),y:gutter+Math.floor(index/3)*(canvas[1]+2*gutter),w:canvas[0],h:canvas[1]};
  outputBuffers.set(file,out);
  packed.push({file,rect,sha256:hash(out),bounds:bounds(pixels,...canvas,4)?.rect,coreBounds:bounds(pixels,...canvas,64)?.rect,holdMs:holds[index]});
  mapped.push({frame:index+1,sourceRect:c.sourceRect,sourceOrigin:c.sourceOrigin,localOrigin:c.localOrigin,alphaBounds:c.alphaBounds,coreBounds:c.coreBounds,alpha4Pixels:c.alpha4Pixels,alpha64Pixels:c.alpha64Pixels,nativeOffset:offset,nativeSize:size,scale,disconnectedComponentsRemoved:0});
 }
 const atlasSize=[3*(canvas[0]+2*gutter),2*(canvas[1]+2*gutter)],atlas=`fx/atlases/${job.id}.png`;
 // Copy raw straight RGBA once; repeated alpha compositing can round soft RGB.
 const atlasRaw=Buffer.alloc(atlasSize[0]*atlasSize[1]*4);
 for(const f of packed){const raw=await sharp(outputBuffers.get(f.file)).ensureAlpha().raw().toBuffer();for(let y=0;y<canvas[1];y++)raw.copy(atlasRaw,((f.rect.y+y)*atlasSize[0]+f.rect.x)*4,y*canvas[0]*4,(y+1)*canvas[0]*4);}
 const atlasBytes=await sharp(atlasRaw,{raw:{width:atlasSize[0],height:atlasSize[1],channels:4}}).png().toBuffer();
 outputBuffers.set(atlas,atlasBytes);
 const startMs=job.startMs??{escort:0,ground:0,charge:0,release:900,residual:1380}[phase];
 clips[job.id]={id:job.id,kit,phase,name:job.name??job.id,layer:job.layer??d.layer,atlas,atlasSize,atlasSha256:hash(atlasBytes),decodedBytes:atlasSize[0]*atlasSize[1]*4,frameSize:canvas,pivot,origin,emitterOffset:[origin[0]-pivot[0],origin[1]-pivot[1]],frameHoldsMs:holds,durationMs:holds.reduce((a,b)=>a+b,0),startMs,loop:phase==='escort',idle:phase==='escort',idleOpacity:job.idleOpacity??(phase==='escort'?1:0),frameCount:6,frames:packed,peakTargetWidth:target,actualPeakCoreWidth:Math.max(...packed.map(f=>f.coreBounds[2]-f.coreBounds[0])),source,sourceFile:source,promptFile:job.prompt??request?.prompt,sourceSha256:hash(bytes),artApproved:false,runtimeIntegrated:false};
 registrations.push({id:job.id,source,sourceSha256:hash(bytes),sourceSize:[w,h],layout:[3,2],yCuts:ys.cuts,horizontalGutters:ys.diagnostics,xCutsByRow:vertical.map(r=>r.cuts),verticalGutters:vertical.map(r=>r.diagnostics),sourceAlpha8EdgePixels:edge,gutterAlphaThreshold:4,scale,scaleBasis:'one peak alpha64 width across all six genuine source frames; fixed native emitter with reviewed common or physical source anchors; no per-frame fit',sourceOriginRegistration:sourceRegistrationOverrides[job.id]??{originNormalized:job.sourceSheet?.originNormalized??[.5,.5],reason:'Requested source emitter retained after cell registration.'},targetWidth:target,canvas,pivot,nativeOrigin:origin,frames:mapped,softAlphaPreservedAtThreshold:4,fringeCleanup:{threshold:4,removedAlpha1to3:lowFringe,clearedFullyTransparentRgb:clearRgb,noRgbPaint:true,noLargestComponentFilter:true,noHueFilter:true},sourceUnchanged:true});
 const prompt=job.prompt??request?.prompt;
 const promptSha256=prompt&&await exists(safe(prompt))?hash(await readFile(safe(prompt))):request?.promptSha256;
 sourcePins.push({id:job.id,file:source,sha256:hash(bytes),size:[w,h],prompt,promptSha256,original:request?.original});
 const prior=priorInspection.inspections?.find(i=>i.id===job.id&&i.sourceSha256===hash(bytes));
 inspections.push({id:job.id,source,sourceSha256:hash(bytes),size:[w,h],sourceAlpha8EdgePixels:edge,measuredTransparentGutters:true,gutterAlphaThreshold:4,frames: mapped.map(f=>({frame:f.frame,sourceRect:f.sourceRect,alphaBounds:f.alphaBounds,coreBounds:f.coreBounds,alpha4Pixels:f.alpha4Pixels,alpha64Pixels:f.alpha64Pixels})),sourceLayoutAssessment:'Measured alpha4-empty row and column gutters after explicit alpha1..3 fringe cleanup; all six ordered source cells have visible alpha64 content. Visual progression review required separately.',manualVisualReview:prior?.manualVisualReview??false,visualAssessment:prior?.visualAssessment??null,cleanup:registrations.at(-1).fringeCleanup});
}
if(pending.length&&!partial)throw Error('Missing sources: '+pending.join(', ')+'; use --partial while generation is in progress');
const kits=[...new Set(jobs.map(j=>j.kit??j.actor??j.id.split('-')[0]))].map(id=>({id,name:plan.kits?.find?.(k=>k.id===id)?.name??id,description:plan.kits?.find?.(k=>k.id===id)?.description,clips:Object.values(clips).filter(c=>c.kit===id).map(c=>c.id)}));
const prior=resolve(workspace,'docs/design/characters/wang-lin-equipment-options-v3'),v3=await read(resolve(prior,'manifest.json'));
const bodyPins=new Map();bodyPins.set('manifest.json',hash(await readFile(resolve(prior,'manifest.json'))));
const shortlist=await exists(safe('owner-shortlist.json'))?await read(safe('owner-shortlist.json')):null;
const selections=Array.isArray(shortlist)?shortlist:shortlist?.selections??shortlist?.entries??shortlist?.pins??shortlist?.items??[];
for(const selection of selections){
 const outfit=selection.outfit??selection.outfitId??selection.bodyId,artifact=selection.artifact??selection.artifactId??selection.equipmentId,colour=selection.color??selection.colorId??selection.variantId;
 const body=v3.bodies.find(b=>b.id===outfit);if(body)bodyPins.set(body.file,body.sha256);
 const gear=v3.equipmentGroups.find(g=>g.id===artifact)?.variants.find(v=>v.id===colour);if(gear)for(const[field,key]of [['frontFile','front'],['rearFile','rear'],['fxRearFile','fxRear']])bodyPins.set(gear[field],gear.layerSha256[key]);
}
if(!selections.length)for(const body of v3.bodies)bodyPins.set(body.file,body.sha256);
const basis=[];for(const[file,sha256]of bodyPins){if(hash(await readFile(resolve(prior,file)))!==sha256)throw Error('V3 basis changed: '+file);basis.push({file:relative(workspace,resolve(prior,file)).replaceAll('\\','/'),sha256});}
const manifest={schema:'wang-lin-equipment-fx-4',date:'2026-10-13',stage:pending.length?'production-in-progress':'candidate-equipment-fx-review',frameSize:canvas,canvas,pivot,atlasGutter:gutter,kits,clips,sources:sourcePins,bodyBasis:{package:'docs/design/characters/wang-lin-equipment-options-v3',targets:basis,bodyPixelsModified:false,gearPixelsModified:false},timeline:{durationMs:plan.timeline?.durationMs??plan.durationMs??3600,peakMs:plan.timeline?.peakMs??1060,chargeEndMs:plan.timeline?.chargeEndMs??900,releaseEndMs:plan.timeline?.releaseEndMs??1380,residualEndMs:plan.timeline?.residualEndMs??2220,loopPresentation:true,flipbookLoops:'escort only; other source phases play once'},decodedCacheBudgetBytes:16*1024*1024,cacheScope:'all decoded review bitmaps, including FX atlases and pinned body/gear/map; current kit references protected from eviction',coverage:{expectedSequences:jobs.length,sequences:Object.keys(clips).length,canonicalFrames:Object.keys(clips).length*6,pending},pending,ownerApproved:false,artApproved:false,runtimeIntegrated:false};
// Validate every available source before publishing any replacement output.
for(const[file,bytes]of outputBuffers){const target=safe(file);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);}
await save('manifest.json',manifest);
await save('registration.json',{schema:'wang-lin-equipment-fx-registration-4',canvas,pivot,registration:registrations,artApproved:false});
await save('review/source-inspection.json',{date:'2026-10-13',inspections,manualVisualReview:inspections.length===jobs.length&&inspections.every(i=>i.manualVisualReview),scope:'Source gutters, cell content, fixed emitter and native clipping. Root owner visual assessment remains separate.',artApproved:false});
console.log(JSON.stringify({sequences:manifest.coverage.sequences,canonicalFrames:manifest.coverage.canonicalFrames,pending,bodyBasisPins:basis.length}));
