import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),workspace=path.resolve(root,'../../../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse((await fs.readFile(path.resolve(root,p),'utf8')).replace(/^\uFEFF/,''));
try{await fs.access(path.join(root,'approval.json'));throw Error('Approved V2 is immutable');}catch(e){if(e.code!=='ENOENT')throw e;}
const manifest=await read('manifest.json'),basis=await read('basis.json');
if(manifest.coverage.bodyClips!==512||manifest.coverage.neutralViews!==64||manifest.coverage.gearTrackClips!==512||manifest.coverage.gearViews!==64||manifest.coverage.fxSequences!==40||manifest.coverage.fxKeys!==240||manifest.coverage.completeFamilies.length!==4)throw Error('Full P4–P5 production is incomplete');
for(const p of [...basis.files,...basis.protectedRuntimeAndMap])if(sha(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('Protected basis changed: '+p.file);
for(const family of ['sword','banner','chariot','bead']){
 const cp=await read(`checkpoints/${family}.json`);if(cp.familyId!==family||cp.status!=='technical-review-ready'||cp.ownerApproved!==false)throw Error('Missing technical checkpoint '+family);
 for(const p of cp.files)if(sha(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('Completed family changed: '+p.file);
}
const cpu=await read('review/production-verification.json'),browser=await read('review/browser-verification.json'),lineage=await read('review/lineage-verification.json'),unit=await read('review/unit-verification.json');
for(const r of [cpu,browser,lineage])if(r.status!=='passed'||r.scope!=='all-four-families')throw Error('Full QA evidence is incomplete');
if(!browser.threeGpuRenders?.length||unit.status!=='passed'||unit.passed!==38||unit.failed!==0)throw Error('GPU or Core evidence is incomplete');
for(const p of cpu.files)if(sha(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('CPU evidence is stale: '+p.file);
for(const p of unit.files)if(sha(await fs.readFile(path.resolve(workspace,p.file)))!==p.sha256)throw Error('Core evidence is stale: '+p.file);
const exported=await read('../../../../output/review/wang-lin-equipment-v2-full/presentation.json');
if(exported.clips.length!==512||exported.runtimeIntegrated!==false)throw Error('Isolated export is incomplete');
for(const p of exported.assets)if(sha(await fs.readFile(path.resolve(workspace,'output/review/wang-lin-equipment-v2-full',p.file)))!==p.sha256)throw Error('Export copy changed: '+p.file);
const files=[];
async function tree(folder){
 for(const e of await fs.readdir(path.resolve(root,folder),{withFileTypes:true})){
  if(e.name==='__pycache__')continue;
  const file=path.posix.join(folder,e.name);if(e.isDirectory())await tree(file);else{
   if(['review/delivery.json','review/delivery-verification.json'].includes(file))continue;
   const bytes=await fs.readFile(path.resolve(root,file));files.push({file,sha256:sha(bytes),bytes:bytes.length});
  }
 }
}
await tree('.');await tree('../../vfx/wang-lin-equipment-vfx-v2');await tree('../../../../output/review/wang-lin-equipment-v2-full');
files.sort((a,b)=>a.file.localeCompare(b.file));
const delivery={schema:'wang-lin-equipment-delivery-2',date:'2026-10-14',status:'P4-P5-review-ready',
 ownerRequest:'Bộ pilot nhìn ổn rồi, hãy làm tiếp đủ 8 hướng Kiếm linh cho cả Huyễn Tâm và Tịch Bạch, sau đó triển khai Hồn phiên, Xạ Thần Xa và Thiên Nghịch Châu theo kế hoạch.',
 scope:{identities:['Huyễn Tâm','Tịch Bạch'],families:['sword','banner','chariot','bead'],directions:manifest.directions,actions:manifest.actions,milestone:'II'},
 coverage:manifest.coverage,validation:{cpuChecks:cpu.checkCount,browserChecks:browser.checkCount,lineageChecks:lineage.checkCount,threeGpuRenders:browser.threeGpuRenders.length,coreTests:unit.passed},
 basis:{file:'basis.json',sha256:sha(await fs.readFile(path.join(root,'basis.json'))),pins:basis.files.length,runtimeAndMapPins:basis.protectedRuntimeAndMap.length},
 export:{file:'../../../../output/review/wang-lin-equipment-v2-full/presentation.json',sha256:sha(await fs.readFile(path.join(workspace,'output/review/wang-lin-equipment-v2-full/presentation.json'))),assetFiles:exported.assets.length},
 pilotApproval:'../wang-lin-equipment-production-v1/approval.json',files,ownerApproved:false,artApproved:false,motionApproved:false,vfxApproved:false,runtimeIntegrated:false,
 limits:['New body views/actions, gear tracks and three FX kits are candidates for owner review.','Creature/field apparition artwork is fixed-camera; it does not claim eight directional creature poses.','Core values are experimental fixtures, not live balance or progression.'],
 ownerMapUnchanged:true,ownerDatabaseUnchanged:true,ownerStorageUnchanged:true,approvalInferredFromChecks:false};
await fs.writeFile(path.join(root,'review/delivery.json'),JSON.stringify(delivery,null,2)+'\n');
console.log(JSON.stringify({status:delivery.status,coverage:delivery.coverage,pinnedFiles:files.length,validation:delivery.validation}));
