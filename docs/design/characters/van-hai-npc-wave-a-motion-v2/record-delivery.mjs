// Record a technically verified owner-review delivery. Never grants art/runtime approval.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');assert.equal(process.argv.length,2);
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async f=>hash(await readFile(f));
const json=async f=>JSON.parse(await readFile(f,'utf8'));
const catalog=await json(resolve(root,'catalog.json')),browser=await json(resolve(root,'review/verification.json')),gpu=await json(resolve(root,'review/gpu-verification.json'));
const sourceEdges=await json(resolve(root,'review/source-edge-verification.json'));assert.equal(sourceEdges.passed,true);assert.equal(sourceEdges.sources.length,42);
for(const s of sourceEdges.sources){assert.equal(await digest(resolve(root,s.source)),s.sourceSha256);assert.ok(Object.values(s.opaqueEdgePixels).every(v=>v===0));}
assert.equal(catalog.coverage.clips,144);assert.equal(catalog.coverage.poses,864);assert.equal(catalog.sources.length,42);
for(const evidence of [browser,gpu]){assert.equal(evidence.passed,true);assert.equal(evidence.catalogSha256,await digest(resolve(root,'catalog.json')));assert.deepEqual(evidence.errors,[]);}
assert.equal(browser.canonicalAtlasFramesVerified,864);assert.equal(browser.browserSceneZoomScenarios,1296);assert.equal(gpu.threeWebGLFrames,864);assert.equal(gpu.maxColorDelta,0);
const baselines=[];
for(const [name,manifest,count] of [['van-hai-npc-wave-a-motion-v1','approval.json',219],['van-hai-npc-wave-a-concepts-v1','approval.json',45],['van-hai-npc-motion-v1','approval.json',107],['van-hai-npc-motion-v2','review/delivery.json',9]]){
 const base=resolve(root,'..',name),file=resolve(base,manifest),p=await json(file);assert.equal(p.pinnedFiles.length,count);
 for(const pin of p.pinnedFiles){const target=resolve(base,pin.file),rel=relative(base,target);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));assert.equal(await digest(target),pin.sha256,'Protected baseline changed: '+name+'/'+pin.file);}
 baselines.push({file:relative(workspace,file).replaceAll('\\','/'),sha256:await digest(file),pinnedCount:count,unchanged:true});
}
const files=[];async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);assert.ok(!entry.isSymbolicLink(),'No external symlinks in delivery');if(entry.isDirectory())await walk(file);else if(entry.isFile()&&relative(root,file).replaceAll('\\','/')!=='review/delivery.json')files.push(file);}}
await walk(root);files.sort();const pinnedFiles=await Promise.all(files.map(async file=>({file:relative(root,file).replaceAll('\\','/'),sha256:await digest(file)})));
const delivery={schema:'npc-wave-a-motion-delivery-2',date:'2026-10-13',actors:catalog.actors.map(a=>({id:a.id,name:a.name,slug:a.slug})),coverage:catalog.coverage,contract:catalog.contract,primaryStandard:catalog.morphologyBasis,technicalVerification:{browser:{file:'review/verification.json',sha256:await digest(resolve(root,'review/verification.json')),passed:true,scenarios:1296,frames:864},gpu:{file:'review/gpu-verification.json',sha256:await digest(resolve(root,'review/gpu-verification.json')),passed:true,frames:864,maxColorDelta:0}},baselines,protectedBaselinePins:380,approvalScope:{southeastPilotApproved:true,remainingSevenViewsOwnerReviewPending:true,fullDirectionalSetApproved:false,artApproved:false,motionApproved:false,runtimeApproved:false},runtimeImported:false,ownerMapEdited:false,saveOrDatabaseEdited:false,pinnedFiles};
await writeFile(resolve(root,'review/delivery.json'),JSON.stringify(delivery,null,2)+'\n');
console.log(JSON.stringify({recorded:true,clips:144,poses:864,pinnedFiles:pinnedFiles.length,protectedBaselinePins:380,ownerReviewPending:true,runtimeImported:false}));
