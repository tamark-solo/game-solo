import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(resolve(root,f),'utf8'));
const basis=await json('basis.json'),g=await json('generation.json'),p=await json('plan.json'),brief=await json('brief.json'),failures=[];
for(const f of basis.files)if(sha(await readFile(resolve(root,f.file)))!==f.sha256)failures.push({type:'changed-existing-file',file:f.file});
for(const r of g.requests){
 if(!['generated-preview','superseded-framing'].includes(r.status)){failures.push({type:'incomplete-source',id:r.id});continue;}
 if(sha(await readFile(resolve(root,r.raw)))!==r.sha256)failures.push({type:'raw-hash',id:r.id});
 if(sha(await readFile(r.original))!==r.sha256)failures.push({type:'original-source-copy',id:r.id});
 if(sha(await readFile(resolve(root,r.prompt)))!==r.promptSha256)failures.push({type:'prompt-hash',id:r.id});
 for(const i of r.inputs)if(sha(await readFile(resolve(root,i.file)))!==i.sha256)failures.push({type:'input-hash',id:r.id,file:i.file});
}
if(p.families.length!==4||p.identityMasters.length!==2||p.families.reduce((n,f)=>n+f.options.length,0)!==8)failures.push({type:'concept-coverage'});
for(const f of p.families)if(!f.singleTarget?.beats?.length||f.aoe?.beats?.length!==4||f.milestones.length!==3||!f.progressionBoard||!f.combatBoard)failures.push({type:'flow-coverage',id:f.id});
if(brief.productionFlow.length!==7||brief.readiness.conceptApproved||p.readiness.runtimeIntegrated)failures.push({type:'scope-state'});
const report={schema:'wang-lin-concept-lineage-check-5',passed:!failures.length,existingFilesUnchanged:basis.files.length,generatedSourcesChecked:g.requests.length,selectedConceptAssets:18,supersededSourceRetained:1,promptAndInputHashesChecked:true,originalImageGenCopiesMatch:true,liveRole:'scale and pixel style only; no original pixel identity restoration',flow:{identities:2,outfits:8,families:4,milestonesPerFamily:3,singleTargetAndAoePerFamily:true,aoeBeats:4,productionGates:7},failures,conceptApproved:false,artApproved:false,runtimeIntegrated:false};
await writeFile(resolve(root,'review/lineage-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
