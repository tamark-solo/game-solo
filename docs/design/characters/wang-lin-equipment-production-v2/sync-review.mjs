import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),workspace=path.resolve(root,'../../../..');
const family=process.argv.find(v=>v.startsWith('--family='))?.split('=')[1],families=family?[family]:['sword','banner','chariot','bead'];
const manifest=JSON.parse((await fs.readFile(path.join(root,'manifest.json'),'utf8')).replace(/^\uFEFF/,''));
for(const id of families){const c=manifest.completeness.find(c=>c.familyId===id);if(!c||c.missing.length||c.gearTrackClips!==128||c.gearViews!==16||c.fxSequences!==10||c.manualSourceReviewComplete!==true)throw Error('Family is incomplete: '+id);}
const allowed=path.join(workspace,'output','review'),target=path.join(allowed,'wang-lin-equipment-v2-'+(family??'full'));
if(!target.startsWith(allowed+path.sep))throw Error('Export target outside review workspace');
try{await fs.access(target);throw Error('Export already exists; retain it and use a new named revision');}catch(e){if(e.code!=='ENOENT')throw e;}
const copied=new Map(),copyJobs=new Map();const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function asset(file,base=root){const full=path.resolve(base,file),r=path.relative(workspace,full);if(r.startsWith('..')||path.isAbsolute(r))throw Error('Asset outside workspace: '+file);const bytes=await fs.readFile(full),sha256=hash(bytes),name='assets/'+sha256+path.extname(full);if(!copyJobs.has(name)){const job=(async()=>{const out=path.join(target,name);await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,bytes);if(hash(await fs.readFile(out))!==sha256)throw Error('Export copy mismatch');copied.set(name,{file:name,source:r.replaceAll('\\','/'),sha256});})();copyJobs.set(name,job);}await copyJobs.get(name);return name;}
async function rewrite(value,base=root){if(Array.isArray(value))return Promise.all(value.map(v=>rewrite(v,base)));if(value&&typeof value==='object'){const out={};for(const [k,v]of Object.entries(value))out[k]=typeof v==='string'&&['file','atlas','fullFile','sourcePropNative'].includes(k)&&/\.(png|webp)$/.test(v)?await asset(v,base):await rewrite(v,base);return out;}return value;}
const clips=await rewrite(manifest.motions.clips.filter(c=>families.includes(c.familyId))),fx=[];
for(const entry of manifest.fxManifests.filter(f=>families.includes(f.familyId))){const full=path.resolve(root,entry.file),data=JSON.parse(await fs.readFile(full,'utf8'));fx.push({familyId:entry.familyId,sequences:await rewrite(data.sequences,path.dirname(full)),sourceManifest:entry.file,ownerApproved:entry.ownerApproved});}
const exported={schema:'wang-lin-equipment-review-export-2',date:'2026-10-14',families,clips,fx,gearViews:await rewrite(manifest.gearViews.filter(v=>families.includes(v.familyId))),
 bindings:manifest.bindings.filter(b=>families.includes(b.familyId)),sourceManifest:path.relative(workspace,path.join(root,'manifest.json')).replaceAll('\\','/'),assets:[...copied.values()],runtimeIntegrated:false,sourceLineageRemainsInWorkspace:true,newArtApprovalInferred:false};
await fs.mkdir(target,{recursive:true});await fs.writeFile(path.join(target,'presentation.json'),JSON.stringify(exported,null,2)+'\n');
console.log(JSON.stringify({scope:'read-only source to isolated review fixture',target,bodyClips:clips.length,assetFiles:copied.size,runtimeIntegrated:false}));
