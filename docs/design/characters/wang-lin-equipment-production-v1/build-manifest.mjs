import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=async relative=>JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
try{await fs.access(path.join(root,'approval.json'));throw new Error('Approved production root is immutable');}
catch(e){if(e.code!=='ENOENT')throw e;}
const approval=await read('../wang-lin-concept-direction-v5/approval.json');
for(const pin of approval.files){if(hash(await fs.readFile(path.resolve(root,'../wang-lin-concept-direction-v5',pin.file)))!==pin.sha256)throw new Error('Approved concept changed: '+pin.file);}
const body=await read('body-registration.json'),gear=await read('gear-registration.json');
let motion={clips:[]};
try{motion=await read('motion-registration.json');}catch(e){if(e.code!=='ENOENT')throw e;}
let gearTracks;
try{gearTracks=await read('gear-tracks.json');}catch(e){if(e.code!=='ENOENT')throw e;}
if(gearTracks){
 const trackedClips=gearTracks.clips??[];
 motion.clips=(motion.clips??[]).map(c=>{
  const track=trackedClips.find(t=>t.id===c.id||t.clipId===c.id);
  if(!track)return c;
  return {...c,gearTrackId:track.id??track.clipId,frames:c.frames.map((f,i)=>{
   const tf=track.frames?.[i];
   if(!tf)return f;
   return {...f,gearLayers:tf.gearLayers??tf.layers??[],gearMode:tf.gearMode??tf.mode,gearGrip:tf.gearGrip??tf.grip,gearPresentation:tf.gearPresentation,
    ...(tf.handOcclusion?{handOcclusion:tf.handOcclusion}:{}),...(tf.body?{body:tf.body}:{}),
    ...(tf.file&&tf.sha256?{gearBodySha256:tf.sha256}:{})};
  })};
 });
}
const families=approval.families;
const appearances=body.records.map(b=>{
 const g=gear.records.find(g=>g.id===b.id);
 if(!g)throw new Error('Missing gear: '+b.id);
 return {id:b.id,identityId:b.identityId,familyId:b.family,name:b.name+' · '+families.find(f=>f.id===b.family).name,direction:'southeast',
  body:{file:b.nativeFile,sha256:b.nativeSha256,canvas:b.canvas,pivot:b.pivot},
  gear:{layers:g.layers,handOcclusion:g.handOcclusion,source:g.source,registeredGrip:g.registeredGrip,scale:g.scale},
  sockets:b.sockets,grip:b.grip,concept:`../wang-lin-concept-direction-v5/sources/${b.id==='banner-a'?'banner-a-r2':b.id}.png`,
  master:`../wang-lin-concept-direction-v5/sources/identity-${b.identityId}.png`,source:b.source,
  bodyHeight:80,ownerApproved:false,motionApproved:false,runtimeIntegrated:false,
  visualLimitations:['Giữ form concept riêng; đầu/thân thon hơn Wang ở cùng 80 px.','Grip và lớp che là candidate đã đo, cần xem composite/motion.']};
});
let fxManifest,fxData;
try{fxData=await read('../../vfx/wang-lin-sword-pilot-v1/manifest.json');fxManifest='../../vfx/wang-lin-sword-pilot-v1/manifest.json';}catch(e){if(e.code!=='ENOENT')throw e;}
const manifest={schema:'wang-lin-equipment-production-1',date:'2026-10-14',title:'Huyễn Tâm / Tịch Bạch · P1–P3',
 kickoff:{source:'explicit owner message',instruction:'tôi đồng ý bắt đầu làm luôn nhé',plan:'../wang-lin-implementation-plan-v1/plan.json'},
 conceptApproval:{file:'../wang-lin-concept-direction-v5/approval.json',conceptApproved:true,pinnedFiles:86},
 identities:approval.identities,families,appearances,
 reference:{file:'../wang-lin-concept-direction-v5/inputs/wang-lin-live-southeast-native.png',canvas:[64,96],pivot:[32,88],role:'human proportions and pixel treatment only'},
 mapReference:{file:'../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp',role:'read-only camera-1x reference'},
 prototype:{core:'../../gameplay/wang-lin-equipment-prototype-v1/core.mjs',contracts:'../../gameplay/wang-lin-equipment-prototype-v1/contracts.json',runtimeIntegrated:false},
 motions:{clips:motion.clips??[],fx:[]},...(fxManifest?{fxManifest}:{}),
  coverage:{neutralBodies:appearances.length,restingGear:gear.records.length,directions:['southeast'],pilotDirections:[...new Set((motion.clips??[]).map(c=>c.direction))],bodyClips:(motion.clips??[]).length,bodyPoses:(motion.clips??[]).reduce((n,c)=>n+(c.frames?.length??0),0),calibrationPoses:motion.coverage?.neutralCalibrations??(motion.calibrations??[]).reduce((n,c)=>n+(c.frames?.length??0),0),gearTracks:gearTracks?.coverage??null,fxSequences:fxData?.sequences?.length??0,fxKeys:fxData?.sequences?.reduce((n,s)=>n+s.frames.length,0)??0},
 status:'production-candidate-review',ownerApproved:false,artApproved:false,motionApproved:false,runtimeIntegrated:false,
 policy:{bodyHeight80IsNotAnatomyApproval:true,liveFacePatch:false,eightDirectionCoverage:false,oldSourcesImmutable:true,coreNumbersExperimental:true},
 documentation:{body:'body-registration.json',gear:'gear-registration.json',motion:'motion-registration.json',plan:'../wang-lin-implementation-plan-v1/index.html'}};
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const pilotReady=manifest.coverage.bodyClips===16&&manifest.coverage.fxSequences===10&&Boolean(gearTracks)&&(motion.clips??[]).every(c=>c.frames.every(f=>f.gearLayers?.length));
await fs.writeFile(path.join(root,'progress.json'),JSON.stringify({schema:'wang-lin-equipment-production-progress-1',date:'2026-10-14',started:true,phases:[{id:'P1',status:'neutral-and-gear-review-ready',body:8,gear:8},{id:'P2',status:'prototype-tested',skills:8},{id:'P3',status:pilotReady?'pilot-review-ready':'in-production',clips:manifest.coverage.bodyClips,bodyKeys:manifest.coverage.bodyPoses,fxSequences:manifest.coverage.fxSequences,fxManifest}],nextGate:'Review the complete pilot before broad eight-direction expansion',ownerArtApproved:false,runtimeIntegrated:false},null,2)+'\n');
console.log(JSON.stringify({coverage:manifest.coverage,fxManifest:fxManifest??null}));
