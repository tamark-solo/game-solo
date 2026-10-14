import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const family=process.argv.find(v=>v.startsWith('--family='))?.split('=')[1];
if(!['sword','banner','chariot','bead'].includes(family))throw Error('Choose a production family');
const target=path.join(root,'checkpoints',family+'.json');
try{await fs.access(target);throw Error('Existing checkpoint is immutable');}catch(e){if(e.code!=='ENOENT')throw e;}
const read=async p=>JSON.parse((await fs.readFile(path.resolve(root,p),'utf8')).replace(/^\uFEFF/,''));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=await read('manifest.json'),state=manifest.completeness.find(c=>c.familyId===family);
if(state.missing.length||state.gearTrackClips!==128||state.gearViews!==16||state.fxSequences!==10||state.manualSourceReviewComplete!==true)throw Error('Family is incomplete');
const cpu=await read(`review/${family}-verification.json`),lineage=await read(`review/${family}-lineage-verification.json`),browser=await read(`review/${family}-browser-verification.json`);
for(const report of [cpu,lineage,browser])if(report.status!=='passed'||report.scope!==family)throw Error('Scoped technical verification is incomplete');
if(!browser.threeGpuRenders?.length)throw Error('Actual Three GPU evidence required');
for(const p of cpu.files)if(sha(await fs.readFile(path.resolve(root,p.file)))!==p.sha256)throw Error('CPU evidence is stale: '+p.file);
const files=new Map();
async function add(file){const full=path.resolve(root,file),bytes=await fs.readFile(full);files.set(file.replaceAll('\\','/'),{file:file.replaceAll('\\','/'),sha256:sha(bytes),bytes:bytes.length});}
async function tree(dir){for(const e of await fs.readdir(path.resolve(root,dir),{withFileTypes:true})){if(e.name==='__pycache__')continue;const file=path.posix.join(dir,e.name);if(e.isDirectory())await tree(file);else await add(file);}}
for(const identity of ['a','b'])await tree(`actors/${identity}/${family}`);
await tree(`gear/${family}`);
if(family==='banner'){
 // Freeze the source-measurement evidence imported by the family, while future
 // family briefs and production support remain writable in their own folders.
 for(const e of await fs.readdir(path.join(root,'support'),{withFileTypes:true}))
  if(e.isDirectory()&&(e.name.startsWith('banner-')||e.name.startsWith('root-banner-')))
   await tree('support/'+e.name);
}
for(const c of manifest.motions.clips.filter(c=>c.familyId===family))if(!c.reusedFrom||c.direction!=='southeast')await tree('tracks/frames/'+c.id);
for(const suffix of ['verification','lineage-verification','browser-verification'])await add(`review/${family}-${suffix}.json`);
const checkpoint={schema:'wang-lin-equipment-family-checkpoint-2',date:'2026-10-14',familyId:family,status:'technical-review-ready',coverage:{bodyClips:128,bodyKeys:cpu.coverage.bodyKeys,gearTrackClips:128,physicalViews:16,fxSequences:10,fxFrames:60},
 files:[...files.values()].sort((a,b)=>a.file.localeCompare(b.file)),sourceManifestSha256:sha(await fs.readFile(path.join(root,'manifest.json'))),
 bodyAndTrackFrozen:true,ownerApproved:false,artApproved:false,motionApproved:false,runtimeIntegrated:false,approvalInferredFromChecks:false};
await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(checkpoint,null,2)+'\n');
// Windows chmod supports the read-only file bit. New families remain writable.
for(const p of checkpoint.files)await fs.chmod(path.resolve(root,p.file),0o444);
await fs.chmod(target,0o444);
console.log(JSON.stringify({family,bodyClips:128,pinnedFiles:checkpoint.files.length,status:checkpoint.status,newArtApproved:false}));
