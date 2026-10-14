import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {png,edges,rectBytes,alphaCount} from './png-inspect.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=async p=>JSON.parse((await fs.readFile(path.resolve(root,p),'utf8')).replace(/^\uFEFF/,''));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const requested=process.argv.find(v=>v.startsWith('--family='))?.split('=')[1];
const identity=process.argv.find(v=>v.startsWith('--identity='))?.split('=')[1];
const manifest=await read('manifest.json'),basis=await read('basis.json');
const checks=[],warnings=[],hashes=new Map(),images=new Map();let imageBytes=0;
const check=(name,pass,detail)=>{if(!pass)throw Error(name+(detail?' '+detail:''));checks.push({name,passed:true});};
async function hash(file){const full=path.resolve(root,file);if(!hashes.has(full))hashes.set(full,sha(await fs.readFile(full)));return hashes.get(full);}
async function image(file){const full=path.resolve(root,file);if(images.has(full)){const i=images.get(full);images.delete(full);images.set(full,i);return i;}const i=await png(full);images.set(full,i);imageBytes+=i.rgba.length;for(const [key,old]of images){if(imageBytes<=32*1024*1024)break;if(key===full)continue;images.delete(key);imageBytes-=old.rgba.length;}return i;}
for(const pin of [...basis.files,...basis.protectedRuntimeAndMap])check('basis '+pin.file,await hash(pin.file)===pin.sha256);
const familyIds=requested?[requested]:['sword','banner','chariot','bead'];
const clips=manifest.motions.clips.filter(c=>familyIds.includes(c.familyId)&&(!identity||c.identityId===identity));
check('required coverage',clips.length===familyIds.length*(identity?64:128));
for(const family of familyIds){const state=manifest.completeness.find(c=>c.familyId===family);check(family+' complete bindings',state.missing.filter(m=>!identity||m.identity===identity).length===0);check(family+' own neutral views',manifest.views.filter(v=>v.familyId===family&&(!identity||v.identityId===identity)).length===(identity?8:16));check(family+' all gear tracks',clips.filter(c=>c.familyId===family).every(c=>c.frames.every(f=>f.gearLayers?.length)));check(family+' physical views',state.gearViews===16);check(family+' 10 FX sequences',state.fxSequences===10);}
const descriptorPins=[];
for(const r of manifest.registrations.filter(r=>familyIds.includes(r.familyId)&&(!identity||r.identityId===identity))){
 check('registration pin '+r.file,await hash(r.file)===r.sha256);descriptorPins.push({file:r.file,sha256:r.sha256});
 const reg=await read(r.file);
 check('actual socket review complete '+r.file,reg.manualReviewPending===false||reg.socketReviewComplete===true);
 for(const source of reg.sources??[]){const file=source.file??source.raw??source.source;check('source pin '+file,await hash(file)===(source.sha256??source.sourceSha256));const raw=await image(file);check('raw core edge '+file,edges(raw,128)===0);check('source factor positive '+file,source.scale>0);}
 for(const cal of reg.calibrations??[])for(const frame of cal.frames){check('calibration hash '+frame.file,await hash(frame.file)===frame.sha256);const im=await image(frame.file);check('calibration canvas '+frame.file,im.width===frame.canvas[0]&&im.height===frame.canvas[1]);check('calibration edge '+frame.file,edges(im,128)===0);}
}
let bodyKeys=0,gearKeys=0,atlasKeys=0,maxQuantization=0;
for(const clip of clips){
 if(!clip.reusedFrom||clip.direction!=='southeast')check('current directional gear registration '+clip.id,clip.sourceGearRegistration?.file===`gear/${clip.familyId}/registration.json`&&await hash(clip.sourceGearRegistration.file)===clip.sourceGearRegistration.sha256);
 if(clip.familyId==='banner'){
  const pin=clip.sourceGearGroundRegistration;
  check('physical shaft endpoint descriptor '+clip.id,pin?.file==='support/banner-base-measurement/measurements.json'&&await hash(pin.file)===pin.sha256);
  if(!descriptorPins.some(p=>p.file===pin.file))descriptorPins.push(pin);
 }
 check('clip binding '+clip.id,clip.frames.length>=3&&manifest.bindings.some(b=>b.clipId===clip.id&&b.direction===clip.direction&&b.action===clip.action&&b.identityId===clip.identityId&&b.familyId===clip.familyId));
 check('clip hold '+clip.id,clip.durationMs===clip.frames.reduce((n,f)=>n+f.durationMs,0));
 const atlasFile=typeof clip.atlas==='string'?clip.atlas:clip.atlas.file;check('atlas hash '+clip.id,await hash(atlasFile)===clip.atlasSha256);const atlas=await image(atlasFile);
 let age=0,releasePosition,ritualGround;
 for(const f of clip.frames){
  check('canonical SHA '+f.file,await hash(f.file)===f.sha256);const im=await image(f.file);bodyKeys++;
  check('body dimensions '+f.file,im.width===f.canvas[0]&&im.height===f.canvas[1]);check('body nonempty '+f.file,alphaCount(im,128)>100);check('body no clipping '+f.file,edges(im,128)===0);
  check('source factor '+f.file,Number.isFinite(f.sourceScale)&&f.sourceScale>0&&f.sourceScale===clip.sourceScale);check('world pivot '+f.file,JSON.stringify(f.pivot)===JSON.stringify(clip.pivot));
  if(f.sourcePartMask)check('source component mask pin '+f.sourcePartMask,await hash(f.sourcePartMask)===f.sourcePartMaskSha256);
  check('atlas exact RGBA '+f.file,rectBytes(atlas,f.atlasRect).equals(im.rgba));atlasKeys++;
  const [ax,ay,aw,ah]=f.atlasRect;let transparent=true;for(let x=ax-2;x<ax+aw+2;x++)for(const y of [ay-2,ay-1,ay+ah,ay+ah+1])if(atlas.pixel(x,y)[3])transparent=false;for(let y=ay;y<ay+ah;y++)for(const x of [ax-2,ax-1,ax+aw,ax+aw+1])if(atlas.pixel(x,y)[3])transparent=false;check('atlas gutter2 '+f.file,transparent);
  check('grip source per pose '+f.file,Array.isArray(f.grip?.native)&&Array.isArray(f.grip?.source)&&f.grip.native.length===2);
  check('gear layers exist '+clip.id,f.gearLayers?.length>=2);
  for(const layer of f.gearLayers){check('gear layer hash '+layer.file,await hash(layer.file)===layer.sha256);if(layer.role==='occlusion'){check('own body mask '+f.file,layer.file===f.file&&layer.sha256===f.sha256&&layer.cropInBody===true);const [x,y,w,h]=layer.rect;check('own crop in canvas '+f.file,x>=0&&y>=0&&x+w<=im.width&&y+h<=im.height);}else{const gear=await image(layer.file);check('gear no clipping '+layer.file,edges(gear,1)===0);check('gear dimensions '+layer.file,gear.width===layer.canvas[0]&&gear.height===layer.canvas[1]);}}
  const gp=f.gearPresentation;if(gp){
   check('gear one factor '+clip.id,gp.additionalScale===1);check('gear body unchanged '+clip.id,gp.bodyPoseSha256===f.sha256);check('gear full hash '+gp.file,await hash(gp.file)===gp.sha256);check('gear source view pin '+gp.sourcePropNative,await hash(gp.sourcePropNative)===gp.sourcePropNativeSha256);
   const whole=await image(gp.file),rear=await image(f.gearLayers.find(l=>l.role==='rear').file),front=await image(f.gearLayers.find(l=>l.role==='front').file);let union=true;
   for(let i=0;i<whole.rgba.length;i+=4){const a=rear.rgba[i+3]/255,b=front.rgba[i+3]/255,out=b+a*(1-b),expectedA=Math.round(out*255);if(Math.abs(expectedA-whole.rgba[i+3])>1){union=false;break;}if(out)for(let k=0;k<3;k++){const color=Math.round((front.rgba[i+k]*b+rear.rgba[i+k]*a*(1-b))/out);if(Math.abs(color-whole.rgba[i+k])>1){union=false;break;}}}
   check('visible layer union '+gp.file,union);maxQuantization=Math.max(maxQuantization,gp.quantizationErrorPx??0);check('gear quantization '+clip.id,(gp.quantizationErrorPx??0)<=Math.SQRT1_2+.002);
   if(gp.gripAgreementClaimed){const [x,y]=f.grip.native.map(Math.round);check('actual held hand '+f.file,im.pixel(x,y)[3]>0&&f.grip.visibility!=='occluded');check('physical hilt at socket '+gp.file,whole.pixel(...gp.registeredHilt)[3]>0);}
   if(gp.mode==='released'){const p=JSON.stringify(gp.actualWorldOffset);if(releasePosition)check('release origin held '+clip.id,p===releasePosition);releasePosition=p;}
   if(clip.familyId==='banner'){
    check('measured pole ground per key '+clip.id,Array.isArray(gp.physicalBaseWorldOffset)&&await hash(gp.baseMeasurementFile)===gp.baseMeasurementSha256&&gp.baseUncertaintyPx===.5);
    if(gp.mode==='planted-ritual'){
     check('ritual planted without false hand grip '+clip.id,gp.gripAgreementClaimed===false&&gp.rotationDeg===0);
     const pos=gp.physicalBaseWorldOffset;
     if(ritualGround)check('fixed ritual pole after ready '+clip.id,Math.hypot(...pos.map((v,i)=>v-ritualGround[i]))<=Math.SQRT1_2+.002);
     ritualGround??=pos;
    }else if(clip.action.startsWith('cast'))ritualGround=gp.physicalBaseWorldOffset;
   }
  }
  age+=f.durationMs;gearKeys++;
 }
}
let fxKeys=0,fxSequences=0;
for(const entry of manifest.fxManifests.filter(e=>familyIds.includes(e.familyId))){const fx=await read(entry.file),base=path.dirname(entry.file);descriptorPins.push({file:entry.file,sha256:await hash(entry.file)});check('FX phase coverage '+entry.familyId,fx.sequences.length===10);
 for(const s of fx.sequences){fxSequences++;const atlasFile=path.join(base,typeof s.atlas==='string'?s.atlas:s.atlas.file),atlas=await image(atlasFile);check('FX atlas hash '+s.id,await hash(atlasFile)===(s.atlasSha256??s.atlas.sha256));
  check('FX six source frames '+s.id,s.frames.length===6);for(const f of s.frames){const file=path.join(base,f.file);check('FX canonical hash '+file,await hash(file)===f.sha256);const im=await image(file);check('FX no clipping '+file,edges(im)===0);check('FX canvas '+file,im.width===f.canvas[0]&&im.height===f.canvas[1]);check('FX atlas RGBA '+file,rectBytes(atlas,f.rect??f.atlasRect).equals(im.rgba));fxKeys++;}
 }
}
for(const family of familyIds)for(const own of identity?[identity]:['a','b']){const hashes=manifest.directions.map(d=>clips.find(c=>c.familyId===family&&c.identityId===own&&c.direction===d&&c.action==='idle').frames[0].sha256);check('distinct directional art '+family+own,new Set(hashes).size===8);}
const report={schema:'wang-lin-equipment-production-verification-2',date:'2026-10-14',status:'passed',scope:(requested??'all-four-families')+(identity?'-identity-'+identity:''),coverage:{bodyClips:clips.length,bodyKeys,gearKeys,atlasKeys,fxSequences,fxKeys,basisPins:basis.files.length,runtimeAndMapPins:basis.protectedRuntimeAndMap.length},maxQuantizationPx:maxQuantization,checkCount:checks.length,checks,warnings,files:[{file:'manifest.json',sha256:await hash('manifest.json')},...descriptorPins],newProductionApprovalInferred:false,runtimeIntegrated:false};
if(process.argv.includes('--final')){await fs.mkdir(path.join(root,'review'),{recursive:true});await fs.writeFile(path.join(root,'review',identity?`${requested??'all'}-${identity}-verification.json`:requested?`${requested}-verification.json`:'production-verification.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({status:report.status,scope:report.scope,coverage:report.coverage,checks:report.checkCount}));
