import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v1';
try{await access(root+'/approval.json');throw Error('Approval already recorded; preserve this baseline.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const catalog=JSON.parse(await readFile(root+'/catalog.json','utf8'));
assert.equal(catalog.coverage.clips,12);assert.equal(catalog.coverage.poses,72);
const paths=new Map([['catalog.json','manifest'],['production.json','production-record'],['production-plan.json','brief'],['registration.json','measurements'],['registration-input.json','measurements'],['review/verification.json','technical-evidence'],['review/gpu-verification.json','technical-evidence']]);
const visualFiles=new Set();
for(const actor of catalog.actors){
 paths.set(actor.neutralSprite,'visual-calibration');visualFiles.add(actor.neutralSprite);
 for(const clip of Object.values(actor.clips)){
  paths.set(clip.atlas,'visual-atlas');visualFiles.add(clip.atlas);
  for(const frame of clip.frames){paths.set(frame.file,'visual-pose');visualFiles.add(frame.file);}
 }
}
for(const source of catalog.sources){
 paths.set(source.file,'selected-visual-source');visualFiles.add(source.file);
 paths.set(source.prompt,'prompt');paths.set(source.routerMetadata,'router-metadata');
}
const pinnedFiles=[];
for(const [file,role]of paths)pinnedFiles.push({file,role,sha256:hash(await readFile(root+'/'+file))});
const supportingFiles=new Map();
for(const source of catalog.sources)for(const image of source.inputs)supportingFiles.set(image.path,image.sha256);
for(const target of catalog.morphologyBasis.targets)supportingFiles.set(target.file,target.sha256);
supportingFiles.set(catalog.morphologyBasis.liveNativeFile,catalog.morphologyBasis.liveNativeSha256);
for(const [file,expected]of supportingFiles)assert.equal(hash(await readFile(resolve(file))),expected,'Reference changed: '+file);
const approval={
 schema:'npc-motion-owner-approval-1',date:'2026-10-13',ownerFeedback:'bộ này ổn đó',
 status:'owner-approved-southeast-motion-pilot',
 scope:{actors:catalog.actors.map(a=>({id:a.id,name:a.name,slug:a.slug})),directions:['southeast'],actions:['idle','talk','profession'],clips:12,poses:72,canvas:[96,96],pivot:[48,88]},
 ownerApproved:true,artApproved:true,motionApproved:true,fullDirectionalSetApproved:false,runtimeApproved:false,runtimeImported:false,
 basisUse:'Accepted identity/action pilot for the next real directional views; live Wang Lin remains the primary human anatomy and pixel reference.',
 approvedVisualFiles:[...visualFiles],pinnedFiles,
 supportingProvenance:[...supportingFiles].map(([file,sha256])=>({file,sha256,visualApprovalExtended:false})),
 knownLimitationsAtReview:[],
 recordPolicy:'Creation-time flags in source/router/technical records remain unchanged. This owner feedback record is authoritative only for these pinned pilot assets; historical revisions, references, other directions/NPCs/runtime are outside its scope.'
};
const plan=JSON.parse(await readFile(root+'/production-plan.json','utf8'));
approval.knownLimitationsAtReview=Object.entries(plan.visualLimitations??{}).map(([slug,note])=>({slug,note}));
await writeFile(root+'/approval.json',JSON.stringify(approval,null,2)+'\n');
console.log(JSON.stringify({ownerApproved:true,clips:12,poses:72,directions:['southeast'],pinnedFiles:pinnedFiles.length,runtimeApproved:false}));
