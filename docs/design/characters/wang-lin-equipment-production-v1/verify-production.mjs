/**
 * Independent read-only inspection of production data, PNG payload and lineage.
 * Default is a readiness probe. --final writes only review/production-verification.json.
 * It never executes packers, ImageGen, live engine, map builder or other report writers.
 */
import {readFile,writeFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE=path.resolve(ROOT,'../../../..');
const V5=path.resolve(ROOT,'../wang-lin-concept-direction-v5');
const FINAL=process.argv.includes('--final');
const resolve=(base,file)=>path.resolve(base,file);
const json=async(base,file)=>JSON.parse(await readFile(resolve(base,file),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const exists=async file=>{try{await stat(file);return true}catch(e){if(e.code==='ENOENT')return false;throw e}};
const needed=['manifest.json','basis.json','body-generation.json','body-registration.json','gear-generation.json','gear-registration.json','motion-generation.json','motion-registration.json','gear-tracks.json'];
const missing=[];
for(const file of needed)if(!await exists(resolve(ROOT,file)))missing.push(file);
if(missing.length){console.log(JSON.stringify({status:'ready-script-waiting-for-inputs',missing}));process.exit(FINAL?2:0)}
const manifest=await json(ROOT,'manifest.json'),bodyGen=await json(ROOT,'body-generation.json'),bodyReg=await json(ROOT,'body-registration.json'),gearGen=await json(ROOT,'gear-generation.json'),gearReg=await json(ROOT,'gear-registration.json'),motionGen=await json(ROOT,'motion-generation.json'),motion=await json(ROOT,'motion-registration.json'),gearTracks=await json(ROOT,'gear-tracks.json');
const bodyKeys=motion.clips.reduce((n,c)=>n+c.frames.length,0),calKeys=motion.calibrations.reduce((n,c)=>n+c.frames.length,0);
const actualGearClips=gearTracks.clips??gearTracks.tracks??[];
const gearKeys=actualGearClips.reduce((n,c)=>n+c.frames.length,0);
const manifestKeys=manifest.motions.clips.reduce((n,c)=>n+c.frames.length,0);
const readiness={status:'ready-script',bodyNeutral:bodyReg.records.length,gear:gearReg.records.length,motionSources:motion.sources.length,clips:motion.clips.length,bodyKeys,calibrationKeys:calKeys,gearKeys,manifestBodyKeys:manifestKeys};
if(!FINAL){console.log(JSON.stringify(readiness));process.exit(0)}
const checks=[],warnings=[],hashCache=new Map(),imageCache=new Map(),inputFacts=[];
function check(name,condition,detail){if(!condition)throw Error(name+(detail?' · '+detail:''));checks.push({name,pass:true})}
async function hash(file){if(!hashCache.has(file))hashCache.set(file,sha(await readFile(file)));return hashCache.get(file)}
async function checkHash(base,file,expected,label=file){check('SHA256 '+label,await hash(resolve(base,file))===expected)}
function near(a,b,tolerance=0.0015){return Math.abs(a-b)<=tolerance}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c}
async function png(file){
 if(imageCache.has(file))return imageCache.get(file);
 const bytes=await readFile(file);check('PNG signature '+path.basename(file),bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
 let width,height,depth,type,interlace,idat=[];
 for(let at=8;at<bytes.length;){const length=bytes.readUInt32BE(at),tag=bytes.toString('ascii',at+4,at+8),data=bytes.subarray(at+8,at+8+length);if(tag==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];interlace=data[12]}if(tag==='IDAT')idat.push(data);at+=12+length}
 check('PNG 8-bit noninterlaced '+path.basename(file),depth===8&&interlace===0&&[0,2,4,6].includes(type));
 const channels={0:1,2:3,4:2,6:4}[type],stride=width*channels,raw=inflateSync(Buffer.concat(idat)),filtered=Buffer.alloc(stride*height);
 check('PNG decoded length '+path.basename(file),raw.length===(stride+1)*height);
 let validFilters=true;
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];validFilters=validFilters&&filter>=0&&filter<=4;
  for(let x=0;x<stride;x++){
   const v=raw[y*(stride+1)+1+x],a=x>=channels?filtered[y*stride+x-channels]:0,b=y?filtered[(y-1)*stride+x]:0,c=y&&x>=channels?filtered[(y-1)*stride+x-channels]:0;
   filtered[y*stride+x]=(v+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;
  }
 }
 check('PNG scanline filters '+path.basename(file),validFilters);
 const rgba=Buffer.alloc(width*height*4);
 for(let i=0;i<width*height;i++){const j=i*channels,k=i*4;rgba[k]=filtered[j];rgba[k+1]=type===0||type===4?filtered[j]:filtered[j+1];rgba[k+2]=type===0||type===4?filtered[j]:filtered[j+2];rgba[k+3]=type===4?filtered[j+1]:type===6?filtered[j+3]:255}
 const out={width,height,rgba};imageCache.set(file,out);return out;
}
const pixel=(im,x,y)=>x<0||y<0||x>=im.width||y>=im.height?[0,0,0,0]:Array.from(im.rgba.subarray((y*im.width+x)*4,(y*im.width+x)*4+4));
function bounds(im,threshold=1,rect=[0,0,im.width,im.height]){
 let left=Infinity,top=Infinity,right=-1,bottom=-1;
 for(let y=rect[1];y<rect[1]+rect[3];y++)for(let x=rect[0];x<rect[0]+rect[2];x++)if(im.rgba[(y*im.width+x)*4+3]>=threshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y)}
 return right<0?null:[left,top,right+1,bottom+1];
}
function vivid(im){let total=0;for(let i=0;i<im.rgba.length;i+=4){const [r,g,b,a]=im.rgba.subarray(i,i+4);if(a>=128&&((r>200&&b>160&&g<110)||(b>200&&r<110&&g<110)||(r>230&&g<80&&b<80)))total++}return total}
function noEdges(im,threshold=1){const b=bounds(im,threshold);return !b||(b[0]>0&&b[1]>0&&b[2]<im.width&&b[3]<im.height)}
function sameVisible(a,b){if(a.width!==b.width||a.height!==b.height)return false;for(let i=0;i<a.rgba.length;i+=4){if(a.rgba[i+3]!==b.rgba[i+3])return false;if(a.rgba[i+3]&&(!a.rgba.subarray(i,i+4).equals(b.rgba.subarray(i,i+4))))return false}return true}
function atlasPayload(atlas,rect,frame){const [x,y,w,h]=rect;if(w!==frame.width||h!==frame.height)return false;for(let row=0;row<h;row++)if(!atlas.rgba.subarray(((y+row)*atlas.width+x)*4,((y+row)*atlas.width+x+w)*4).equals(frame.rgba.subarray(row*w*4,(row+1)*w*4)))return false;return true}
function gutterClear(atlas,rect,gutter){const [x,y,w,h]=rect;for(let gy=y-gutter;gy<y+h+gutter;gy++)for(let gx=x-gutter;gx<x+w+gutter;gx++)if((gx<x||gx>=x+w||gy<y||gy>=y+h)&&pixel(atlas,gx,gy)[3])return false;return true}
function nearestMaterial(im,p,scale){const radius=Math.ceil(2/scale);let best=Infinity;for(let y=Math.max(0,Math.floor(p[1]-radius));y<=Math.min(im.height-1,Math.ceil(p[1]+radius));y++)for(let x=Math.max(0,Math.floor(p[0]-radius));x<=Math.min(im.width-1,Math.ceil(p[0]+radius));x++)if(pixel(im,x,y)[3]>=128)best=Math.min(best,Math.hypot(x-p[0],y-p[1])*scale);return best}
function sourceSamples(source,native,root,scale,pivot,rect=[0,0,source.width,source.height]){
 let samples=0,matched=0,considered=0;
 for(let y=1;y<native.height-1;y+=2)for(let x=1;x<native.width-1;x+=2){
  const n=pixel(native,x,y);if(n[3]<128)continue;
  const fx=root[0]+(x+0.5-pivot[0])/scale,fy=root[1]+(y+0.5-pivot[1])/scale,sx=Math.floor(fx),sy=Math.floor(fy);
  if(sx<rect[0]+1||sy<rect[1]+1||sx>=rect[0]+rect[2]-1||sy>=rect[1]+rect[3]-1)continue;
  const s=pixel(source,sx,sy);if(s[3]<128)continue;
  // Avoid raw nearest-index boundaries where rounded root metadata can shift one source pixel.
  if(fx-sx<0.02||fx-sx>0.98||fy-sy<0.02||fy-sy>0.98)continue;
  considered++;samples++;if(n.slice(0,3).every((v,k)=>v===s[k]))matched++;
 }
 return {samples,matched,considered};
}
async function lineage(base,records,kind){
 for(const r of records){
  const raw=r.raw??r.source??r.file,rawHash=r.sourceSha256??r.sha256;
  await checkHash(base,raw,rawHash,kind+' raw '+r.id);
  if(r.prompt)await checkHash(base,r.prompt,r.promptSha256,kind+' prompt '+r.id);
  for(const i of r.inputs??[])await checkHash(base,i.file,i.sha256,kind+' input '+i.file);
  const original=r.original??r.generatedFile??r.originalPath;
  if(original){check('Original copy '+kind+' '+r.id,await hash(resolve(base,original))===rawHash);inputFacts.push({kind,id:r.id,raw,original,rawHash})}
 }
}
check('Owner kick-off captured',manifest.kickoff.instruction==='tôi đồng ý bắt đầu làm luôn nhé');
check('Both own identities, four families',manifest.identities.map(x=>x.id).join(',')==='a,b'&&manifest.families.length===4);
check('Future ART/runtime approval remains separate',manifest.ownerApproved===false&&manifest.artApproved===false&&manifest.motionApproved===false&&manifest.runtimeIntegrated===false);
check('P1 eight body and gear records',bodyReg.records.length===8&&gearReg.records.length===8&&manifest.appearances.length===8);
check('P3 sixteen actual clips with current dynamic key count',motion.clips.length===16&&bodyKeys===97&&manifestKeys===bodyKeys);
check('Eight actual source neutrals, 48 calibration keys',motion.sources.length===8&&calKeys===48);
check('Sixteen actual gear tracks mirror current body key count',actualGearClips.length===16&&gearKeys===bodyKeys);
await lineage(ROOT,bodyGen.records,'body');await lineage(ROOT,gearGen.sources,'gear');await lineage(ROOT,motionGen.records,'motion');
for(const r of bodyReg.records){
 await checkHash(ROOT,r.source,r.sourceSha256);await checkHash(ROOT,r.nativeFile,r.nativeSha256);
 const source=await png(resolve(ROOT,r.source)),native=await png(resolve(ROOT,r.nativeFile)),m=r.registration;
 check(r.id+' neutral native contract',native.width===64&&native.height===96&&r.pivot.join(',')==='32,88');
 check(r.id+' anatomical 80 scale',near(m.scale*(m.groundY-m.crownY),80)&&near(m.nativeGroundY,88)&&near(m.nativeCrownY,8));
 check(r.id+' own identity no pixel patch',r.identityPatchedFromLive===false&&r.pixelsRepainted===false&&r.bodyGearSeparated===true);
 check(r.id+' raw crown/hands/boots contained',noEdges(source,128));
 check(r.id+' native core contained',noEdges(native,128));
 const sampled=sourceSamples(source,native,[m.rootX,m.groundY],m.scale,r.pivot);
 check(r.id+' sampled original RGB provenance',sampled.samples>=20&&sampled.samples===sampled.matched,JSON.stringify(sampled));
 for(const s of Object.values(r.sockets))check(r.id+' body socket projection',near(s.native[0],32+(s.source[0]-m.rootX)*m.scale)&&near(s.native[1],88+(s.source[1]-m.groundY)*m.scale));
}
for(const r of gearReg.records){
 await checkHash(ROOT,r.source,r.sourceSha256);await checkHash(ROOT,r.fullFile,r.fullSha256);
 const full=await png(resolve(ROOT,r.fullFile)),rear=await png(resolve(ROOT,r.layers.find(l=>l.role==='rear').file)),front=await png(resolve(ROOT,r.layers.find(l=>l.role==='front').file));
 for(const l of r.layers)await checkHash(ROOT,l.file,l.sha256);
 const union={width:full.width,height:full.height,rgba:Buffer.from(rear.rgba)};
 for(let i=0;i<front.rgba.length;i+=4)if(front.rgba[i+3])front.rgba.copy(union.rgba,i,i,i+4);
 check(r.id+' rear/front visible union is source prop',sameVisible(union,full));
 check(r.id+' gear uniform scale and empty native edges',r.uniformScalePerSource===true&&noEdges(full));
 const rawGear=await png(resolve(ROOT,r.source)),gripAlpha=pixel(rawGear,...r.sourceGrip)[3],materialDistance=nearestMaterial(rawGear,r.sourceGrip,r.scale);
 check(r.id+' source contact alpha recorded accurately',gripAlpha===r.sourceGripAlpha);
 check(r.id+' grip at material or hollow loop/edge within2 native px',materialDistance<=2);
 if(gripAlpha<128)warnings.push({kind:'grip-loop-or-edge-anchor',id:r.id,alpha:gripAlpha,nearestPhysicalMaterialDistanceNativePx:materialDistance,scope:'Transparent chain-link center or bead bottom edge is a geometric anchor, not evidence of opaque handle contact; neutral composite remains a visual candidate.'});
 check(r.id+' body hand registration projection',near(r.registeredGrip[0]-r.pivot[0],r.bodyGrip[0]-32)&&near(r.registeredGrip[1]-r.pivot[1],r.bodyGrip[1]-88));
 if(r.sourceGround)check(r.id+' prop ground registration',near(r.registeredGroundY,r.bodyGround[1],0.0015));
}
for(const r of motion.sources){
 await checkHash(ROOT,r.file,r.sha256);const raw=await png(resolve(ROOT,r.file));
 check(r.id+' no opaque vivid source fringe',vivid(raw)===0);
 const heights=[...r.neutralHeights].sort((a,b)=>a-b),median=(heights[2]+heights[3])/2;
 check(r.id+' one neutral-derived factor',r.neutralHeights.length===6&&near(r.scale*median,80));
 check(r.id+' raw full source edges clear',noEdges(raw,128));
 for(const row of r.rawGrid??r.grid)for(const cell of row){
  const bb=bounds(raw,128,cell.rect);check(r.id+' raw cell '+cell.row+'/'+cell.col+' matches measured content',bb&&bb.every((v,i)=>v===cell.coreBounds[i]));
  const [x,y,w,h]=cell.rect;check(r.id+' physical cell margins '+cell.row+'/'+cell.col,bb[0]>x&&bb[1]>y&&bb[2]<x+w&&bb[3]<y+h);
 }
}
const allFrames=[...motion.calibrations.flatMap(c=>c.frames),...motion.clips.flatMap(c=>c.frames)];
for(const f of allFrames){
 await checkHash(ROOT,f.file,f.sha256);const im=await png(resolve(ROOT,f.file)),raw=await png(resolve(ROOT,f.source)),src=motion.sources.find(s=>s.file===f.source);
 check(f.file+' registered source factor',src&&near(f.sourceScale,src.scale,1e-12));
 check(f.file+' native 112 padding/core edge',im.width===112&&im.height===112&&noEdges(im,128));
 check(f.file+' no opaque vivid native fringe',vivid(im)===0);
 check(f.file+' real pose hand projection',near(f.grip.native[0],f.pivot[0]+(f.grip.source[0]-f.root[0])*f.sourceScale,0.002)&&near(f.grip.native[1],f.pivot[1]+(f.grip.source[1]-f.root[1])*f.sourceScale,0.002));
 const sampled=sourceSamples(raw,im,f.root,f.sourceScale,f.pivot,f.sourceRect);
 check(f.file+' same-source RGB sampled proof',sampled.samples>=20&&sampled.samples===sampled.matched,JSON.stringify(sampled));
}
for(const c of motion.clips){
 const published=manifest.motions.clips.find(x=>x.id===c.id);check(c.id+' aggregate manifest current pose hashes',published&&published.frames.length===c.frames.length&&published.frames.every((f,i)=>f.sha256===c.frames[i].sha256));
 await checkHash(ROOT,c.atlas,c.atlasSha256);const atlas=await png(resolve(ROOT,c.atlas));
 check(c.id+' action holds sum',c.durationMs===c.frames.reduce((n,f)=>n+f.durationMs,0));
 for(let i=0;i<c.frames.length;i++){const im=await png(resolve(ROOT,c.frames[i].file));check(c.id+' atlas pose '+i,atlasPayload(atlas,c.rects[i],im));check(c.id+' atlas gutter '+i,gutterClear(atlas,c.rects[i],c.gutter))}
 if(c.frames.length===7){const last=c.frames[6];check(c.id+' actual closing key lineage',Boolean(last.reuseReason)&&last.source===c.frames[0].source&&motion.calibrations.some(n=>n.frames.some(f=>f.sha256===last.sha256)));inputFacts.push({kind:'closing-key',clip:c.id,source:last.source,sourceRect:last.sourceRect,reuseReason:last.reuseReason})}
}
let restKeys=0,castKeys=0,heldKeys=0,hoverKeys=0,releasedKeys=0,occludedHeldCandidates=0;
for(const track of actualGearClips){
 const body=motion.clips.find(c=>c.id===track.id);check(track.id+' track follows actual clip length',body&&track.frames.length===body.frames.length);
 if(body.action==='idle'||body.action==='run')restKeys+=track.frames.length;else castKeys+=track.frames.length;
 for(let i=0;i<track.frames.length;i++){
  const f=track.frames[i],p=f.gearPresentation;
  check(track.id+'/'+i+' body pose provenance',p&&p.bodyPoseSha256===body.frames[i].sha256);
  check(track.id+'/'+i+' source prop fixed scale',p.additionalScale===1&&p.sourceScale>0);
  await checkHash(ROOT,p.sourcePropNative,p.sourcePropNativeSha256??p.sourcePropSha256);
  await checkHash(ROOT,p.file,p.sha256);
  const fullProp=await png(resolve(ROOT,p.file)),layerImages=[];
  const neutralProp=gearReg.records.find(r=>r.id==='sword-'+body.identityId);
  check(track.id+'/'+i+' one prop source factor per identity',neutralProp&&near(p.sourceScale,neutralProp.scale,1e-12)&&p.sourcePixelsRepainted===false);
  check(track.id+'/'+i+' subpixel registration accounting',near(p.registeredHilt[0]-p.pivot[0],p.actualWorldOffset[0])&&near(p.registeredHilt[1]-p.pivot[1],p.actualWorldOffset[1])&&near(p.quantizationErrorPx,Math.hypot(p.actualWorldOffset[0]-p.desiredWorldOffset[0],p.actualWorldOffset[1]-p.desiredWorldOffset[1]),0.00001)&&p.quantizationErrorPx<=Math.SQRT1_2+0.00001);
  check(track.id+'/'+i+' visible mode declared',['held','hover','released'].includes(p.mode));
  heldKeys+=p.mode==='held';hoverKeys+=p.mode==='hover';releasedKeys+=p.mode==='released';
  if(p.mode==='held'){
   const pose=body.frames[i];
   if(p.handVisibility==='occluded'){
    occludedHeldCandidates++;
    check(track.id+'/'+i+' hidden held candidate does not claim visible grip',p.gripAgreementClaimed===false&&p.handOcclusionApplied===false);
    warnings.push({kind:'occluded-rear-held-candidate',clip:track.id,key:i,bodySocketAlpha:p.bodySocketAlpha,scope:'Forearm-endpoint estimate in a back pose; gear must remain rear and no visible grip agreement is claimed.'});
   }else check(track.id+'/'+i+' visible held contact evidence',p.bodySocketAlpha>=128&&p.gripAgreementClaimed===true&&p.handOcclusionApplied===true);
   check(track.id+'/'+i+' held hand is current pose, not static neutral',near(p.desiredWorldOffset[0],pose.grip.native[0]-pose.pivot[0])&&near(p.desiredWorldOffset[1],pose.grip.native[1]-pose.pivot[1]));
  }
  else check(track.id+'/'+i+' detached does not claim hand contact',p.gripAgreementClaimed===false);
  if(p.mode==='released'){
   check(track.id+'/'+i+' release requires Core fact',p.releaseRequiresCoreFact===true);
   check(track.id+'/'+i+' detached release origin stays locked',near(p.desiredWorldOffset[0],track.gearTrack.releaseOffset[0])&&near(p.desiredWorldOffset[1],track.gearTrack.releaseOffset[1]));
  }
  for(const layer of f.gearLayers.filter(l=>l.role==='front'||l.role==='rear')){await checkHash(ROOT,layer.file,layer.sha256);const im=await png(resolve(ROOT,layer.file));check(layer.file+' gear native dimensions/contained',im.width===layer.canvas[0]&&im.height===layer.canvas[1]&&noEdges(im));layerImages.push({role:layer.role,image:im})}
  const rear=layerImages.find(x=>x.role==='rear').image,front=layerImages.find(x=>x.role==='front').image,union={width:rear.width,height:rear.height,rgba:Buffer.from(rear.rgba)};
  if(p.mode==='held'&&p.handVisibility==='occluded')check(track.id+'/'+i+' hidden held artwork entirely rear',bounds(front)===null&&sameVisible(rear,fullProp));
  for(let at=0;at<front.rgba.length;at+=4)if(front.rgba[at+3])front.rgba.copy(union.rgba,at,at,at+4);
  check(track.id+'/'+i+' motion gear visible layer union',sameVisible(union,fullProp));
  for(const layer of f.gearLayers.filter(l=>l.role==='occlusion'))check(track.id+'/'+i+' hand overlay is exact own pose',layer.file===body.frames[i].file&&layer.sha256===body.frames[i].sha256&&layer.cropInBody===true);
 }
 if(track.gearTrack){check(track.id+' artwork not new gameplay release',track.gearTrack.releaseGateMs===(body.action==='cast-single-target'?480:body.action==='cast-aoe'?800:track.gearTrack.releaseGateMs));}
}
check('48 actual idle/run and 49 cast gear keys',restKeys===48&&castKeys===49);
const fxRoot=path.dirname(resolve(ROOT,manifest.fxManifest)),fx=await json(ROOT,manifest.fxManifest),fxGen=await json(fxRoot,'generation.json'),fxProof=await json(fxRoot,'review/verification.json');
check('FX ten sequences/60 keys, separate approval',fx.sequences.length===10&&fx.sequences.reduce((n,s)=>n+s.frames.length,0)===60&&fx.artApproved===false&&fx.runtimeIntegrated===false);
await lineage(fxRoot,fxGen.sources,'FX');
for(const s of fx.sequences){
 await checkHash(fxRoot,s.source,s.sourceSha256);await checkHash(fxRoot,s.atlas.file,s.atlas.sha256);const atlas=await png(resolve(fxRoot,s.atlas.file));
 for(const f of s.frames){await checkHash(fxRoot,f.file,f.sha256);const im=await png(resolve(fxRoot,f.file));check(f.file+' soft alpha remains',im.rgba.some((v,i)=>i%4===3&&v>0&&v<255));check(f.file+' FX atlas/native parity',atlasPayload(atlas,f.rect,im));check(f.file+' FX gutter',gutterClear(atlas,f.rect,2))}
}
check('FX independent package QA current',fxProof.status==='passed'&&fxProof.coverage.canonicalFrames===60);
const p2Root=path.dirname(resolve(ROOT,manifest.prototype.core)),coreContracts=await json(ROOT,manifest.prototype.contracts),coreProof=await json(p2Root,'review/verification.json');
check('P2 eight contracts/four families',coreContracts.contracts.length===8&&new Set(coreContracts.contracts.map(c=>c.family)).size===4);
for(const f of coreProof.files)await checkHash(p2Root,f.file,f.sha256,'P2 immutable '+f.file);
check('P2 report 135 checks and 38 unit',coreProof.coverage.checks===135&&coreProof.coverage.unitTests.total===38&&coreProof.coverage.unitTests.passed===38);
const unit=spawnSync(process.execPath,['--test','--test-reporter=tap',resolve(WORKSPACE,'tests/unit/wang-lin-equipment-prototype.test.mjs')],{encoding:'utf8',cwd:WORKSPACE});
check('P2 scoped unit rerun without report writes',unit.status===0&&/# pass 38/.test(unit.stdout));
const approval=await json(V5,'approval.json'),basis=await json(V5,'basis.json');
for(const f of approval.files)await checkHash(V5,f.file,f.sha256,'V5 approved '+f.file);
for(const f of basis.files)await checkHash(V5,f.file,f.sha256,'Prior basis '+f.file);
check('86 concept pins and 307 prior basis remain',approval.files.length===86&&basis.files.length===307);
const productionBasis=await json(ROOT,'basis.json');
for(const f of productionBasis.files)await checkHash(ROOT,f.file,f.sha256,'Production basis '+f.file);
for(const f of productionBasis.protectedRuntimeAndMapFiles)await checkHash(ROOT,f.file,f.sha256,'Protected runtime/map '+f.file);
check('Root 393 concept/prior pins and 11 runtime/map hashes',productionBasis.files.length===393&&productionBasis.protectedRuntimeAndMapFiles.length===11);
const mapPath=resolve(ROOT,manifest.mapReference.file);
const mapRecord=productionBasis.protectedRuntimeAndMapFiles.find(f=>resolve(ROOT,f.file)===mapPath);
check('Owner map read-only approved hash reference',mapRecord&&await hash(mapPath)===mapRecord.sha256);
const git=spawnSync('git',['diff','--name-only','HEAD','--','client/src','client/public','server/src','shared','core','public'],{encoding:'utf8',cwd:WORKSPACE});
check('Tracked runtime/Core/public actor paths unchanged from Git HEAD',git.status===0&&git.stdout.trim()==='',git.stdout);
const gitHead=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',cwd:WORKSPACE}).stdout.trim();
const report={schema:'wang-lin-equipment-independent-production-verification-1',date:'2026-10-14',status:'passed',coverage:{bodyNeutral:8,restingGear:8,motionRawSources:motion.sources.length,bodyClips:16,bodyKeys,calibrationKeys:calKeys,gearTracks:actualGearClips.length,gearKeys,restKeys,castKeys,heldKeys,hoverKeys,releasedKeys,occludedHeldCandidates,fxSequences:10,fxKeys:60,coreContracts:8,coreUnitTests:38,v5Pins:86,priorBasisPins:307,rootBasisPins:393,protectedRuntimeAndMapFiles:11},checks,warnings,rawCopies:inputFacts,gitHead,protectedTrackedPaths:['client/src','client/public','server/src','shared','core','public'],scope:'Readonly lineage, raw/canonical PNG, source scale/roots/sockets, visible gear layers, FX atlas parity and pure Core fixtures. Combined browser/Three report belongs to review worker; tests do not grant ART approval.',ownerApproved:false,artApproved:false,motionApproved:false,runtimeIntegrated:false,files:[]};
for(const file of needed)report.files.push({file,sha256:await hash(resolve(ROOT,file))});
report.files.push({file:'verify-production.mjs',sha256:await hash(fileURLToPath(import.meta.url))});
await writeFile(resolve(ROOT,'review/production-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'passed',checks:checks.length,coverage:report.coverage}));
