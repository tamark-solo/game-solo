import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const pilot=path.resolve(root,'../wang-lin-equipment-production-v1');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const delivery=await read(path.join(pilot,'review/delivery.json'));
const verification=await read(path.join(pilot,'review/delivery-verification.json'));
if(verification.status!=='passed'||verification.deliverySha256!==sha(await fs.readFile(path.join(pilot,'review/delivery.json'))))throw Error('Pilot delivery is stale');
for(const p of delivery.files)if(sha(await fs.readFile(path.resolve(pilot,p.file)))!==p.sha256)throw Error('Pilot changed: '+p.file);
const statement='Bộ pilot nhìn ổn rồi, hãy làm tiếp đủ 8 hướng Kiếm linh cho cả Huyễn Tâm và Tịch Bạch, sau đó triển khai Hồn phiên, Xạ Thần Xa và Thiên Nghịch Châu theo kế hoạch.';
const approval={schema:'wang-lin-equipment-pilot-approval-1',date:'2026-10-14',ownerStatement:statement,
 scope:{neutralBodies:8,physicalGear:8,swordBodyClips:16,swordBodyKeys:97,swordDirections:['southeast','north'],swordGearTracks:16,swordGearKeys:97,swordFxSequences:10,swordFxFrames:60},
 ownerApproved:true,artApproved:true,motionApproved:true,vfxApproved:true,
 gameplayBalanceApproved:false,runtimeIntegrationApproved:false,additionalDirectionsApproved:false,
 supportingEvidenceIsNotGameplayApproval:true,limitations:delivery.limitations,files:delivery.files,
 delivery:{file:'review/delivery.json',sha256:verification.deliverySha256},
 nextAuthorizedWork:['P4 eight real directional sword views and eight base actions for both identities','P5 banner then chariot then bead with family body/gear/FX and fixture review']};
const approvalFile=path.join(pilot,'approval.json');
try{await fs.access(approvalFile);throw Error('Pilot approval already recorded');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.writeFile(approvalFile,JSON.stringify(approval,null,2)+'\n');
const original=await read(path.join(pilot,'basis.json'));
const files=new Map();
const add=(file,hash)=>files.set(path.relative(root,file).replaceAll('\\','/'),{file:path.relative(root,file).replaceAll('\\','/'),sha256:hash});
for(const p of delivery.files)add(path.resolve(pilot,p.file),p.sha256);
for(const name of ['approval.json','review/delivery.json','review/delivery-verification.json']){const file=path.join(pilot,name);add(file,sha(await fs.readFile(file)));}
for(const p of original.files??original.pins??[])add(path.resolve(pilot,p.file),p.sha256);
const protectedRuntimeAndMap=(original.protectedRuntimeAndMapFiles??[]).map(p=>({file:path.relative(root,path.resolve(pilot,p.file)).replaceAll('\\','/'),sha256:p.sha256}));
await fs.writeFile(path.join(root,'basis.json'),JSON.stringify({schema:'wang-lin-equipment-expansion-basis-2',date:'2026-10-14',ownerStatement:statement,pilotApproval:{file:'../wang-lin-equipment-production-v1/approval.json',sha256:sha(await fs.readFile(approvalFile))},files:[...files.values()],protectedRuntimeAndMap,pilotDeliveryPins:delivery.files.length},null,2)+'\n');
await fs.writeFile(path.join(root,'progress.json'),JSON.stringify({schema:'wang-lin-equipment-production-progress-2',date:'2026-10-14',ownerStatement:statement,order:['sword','banner','chariot','bead'],actions:['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe'],directions:['north','northeast','east','southeast','south','southwest','west','northwest'],targetBodyClips:512,phases:[{id:'P4',family:'sword',status:'in-production',targetClips:128},{id:'P5a',family:'banner',status:'queued',targetClips:128},{id:'P5b',family:'chariot',status:'queued',targetClips:128},{id:'P5c',family:'bead',status:'queued',targetClips:128}],runtimeIntegrated:false},null,2)+'\n');
console.log(JSON.stringify({pilotApproved:true,pilotPins:delivery.files.length,newBasisPins:files.size,protectedRuntimeAndMap:protectedRuntimeAndMap.length}));
