import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-concepts-v1');
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async file=>hash(await readFile(file));
function local(file){const path=resolve(root,file),rel=relative(root,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));return path;}
function inWorkspace(file){const path=resolve(workspace,file),rel=relative(workspace,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel));return path;}
const json=async file=>JSON.parse(await readFile(file,'utf8'));
try{await access(local('approval.json'));throw Error('Approved pack cannot be rewritten');}catch(e){if(e.code!=='ENOENT')throw e;}
const p=await json(local('production-plan.json')),m=await json(local('review/source-measurements.json'));
const assessmentFile='review/source-visual-assessment.json',assessment=await json(local(assessmentFile));
const expected=['NPC-HN-HERBALIST','NPC-HN-FORGE','NPC-HN-ROUTE-KEEPER','NPC-HN-GATE-WARDEN','NPC-HN-DISCIPLE-WATER','NPC-HN-DISCIPLE-SWORD'];
assert.deepEqual(new Set(p.actors.map(a=>a.id)),new Set(expected));assert.equal(p.actors.length,6);
const gddPath='docs/design/world/van-hai-living-world-v1/plan.json',gddBytes=await readFile(inWorkspace(gddPath)),gdd=JSON.parse(gddBytes);
const stdRoot=inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1'),basis=await json(resolve(stdRoot,'basis.json')),dirs=await json(resolve(stdRoot,'directions.json')),ref=dirs.directions.find(d=>d.direction==='southeast');
assert.equal(hash(gddBytes),p.sourcePlanSha256,'Authored GDD changed');
assert.equal(await digest(resolve(stdRoot,'basis.json')),p.primaryStandardSha256,'Primary style basis changed');
assert.equal(await digest(resolve(stdRoot,'directions.json')),p.directionalStandardSha256,'Actual direction reference changed');
assert.equal(await digest(inWorkspace(basis.sourceCatalog)),basis.sourceCatalogSha256);
assert.equal(await digest(inWorkspace(ref.atlas)),ref.atlasSha256);
const nativePath='inputs/wang-lin-live-southeast-native.png',largePath='inputs/wang-lin-live-southeast-nearest8x.png';
assert.equal(await digest(local(nativePath)),ref.nativeSha256);assert.equal(await digest(local(largePath)),ref.nearest8xSha256);
const liveRgba=await sharp(inWorkspace(ref.atlas)).extract({left:ref.rect.x,top:ref.rect.y,width:ref.rect.w,height:ref.rect.h}).ensureAlpha().raw().toBuffer();
assert.deepEqual(liveRgba,await sharp(local(nativePath)).ensureAlpha().raw().toBuffer());
await mkdir(local('sprites'),{recursive:true});const actors=[],registration=[];
for(const a of p.actors){
 const q=p.requests.find(r=>r.slug===a.slug);assert.ok(q);const brief=gdd.npcs.find(n=>n.id===a.id);assert.ok(brief);assert.equal(brief.name,a.name);
 const bytes=await readFile(local(q.source)),sourceSha256=hash(bytes),metaPath=q.source.replace(/\.png$/,'.json'),meta=await json(local(metaPath));
 assert.equal(meta.model,'gpt-image-2');assert.equal(meta.operation,'edit');assert.equal(meta.image.sha256,sourceSha256);
 assert.equal(meta.prompt.trim(),(await readFile(local(q.prompt),'utf8')).trim());assert.equal(meta.inputImages[0].sha256,ref.nearest8xSha256,'Wang must be Image1');
 assert.equal(meta.inputImages.length,q.inputHashes.length);
 for(let i=0;i<q.inputHashes.length;i++){assert.equal(await digest(local(q.inputHashes[i].file)),q.inputHashes[i].sha256);assert.equal(meta.inputImages[i].sha256,q.inputHashes[i].sha256);}
 const measure=m.sources.find(r=>r.slug===a.slug&&r.sourceSha256===sourceSha256);assert.ok(measure,'Exact-hash manual measurements required: '+a.slug);
 const review=assessment.sources.find(r=>r.sourceSha256===sourceSha256&&r.slug===a.slug);assert.ok(review,'Exact-hash visual assessment required');
 assert.equal(review.status,'review-candidate');assert.ok(review.orientation.pass&&review.identity.pass&&review.anatomy.pass);
 assert.equal(measure.visuallyReviewed,true);assert.ok(measure.rootBasis.length>20);assert.equal(measure.orientationPassed,true);assert.equal(measure.identityPassed,true);assert.equal(measure.anatomyPassed,true);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4;data[i+3]=data[i+3]>=128?255:0;if(data[i+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 assert.ok(right>=left&&bottom>=top);const bounds=[left,top,right+1,bottom+1],floor=measure.sourcePivot[1],bodyTop=measure.bodyTopY,scale=80/(floor-bodyTop),head=measure.headBounds;
 assert.ok(Number.isFinite(scale)&&scale>0&&floor>bodyTop);assert.ok(bodyTop>=top&&bodyTop<head[3]&&head[3]<floor);
 const witness=measure.sourceSupportWitness;assert.ok(witness[0]<=measure.sourcePivot[0]&&measure.sourcePivot[0]<=witness[2]&&witness[1]<=floor&&floor<=witness[3]);
 const canvas=measure.canvas??[64,96],pivot=[canvas[0]/2,88];assert.ok([64,96].includes(canvas[0])&&canvas[1]===96,'Wider canvas is padding only');
 const w=Math.round((right+1-left)*scale),h=Math.round((bottom+1-top)*scale),dx=pivot[0]-Math.round((measure.sourcePivot[0]-left)*scale),dy=88-Math.round((floor-top)*scale);
 assert.ok(dx>=0&&dy>=0&&dx+w<=canvas[0]&&dy+h<=canvas[1],'Need manual measurement or padding, never squeeze body: '+a.slug);
 const cut=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width:right+1-left,height:bottom+1-top}).resize(w,h,{kernel:'nearest'}).png().toBuffer();
 const sprite='sprites/'+a.slug+'.png';await sharp({create:{width:canvas[0],height:96,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:cut,left:dx,top:dy}]).png().toFile(local(sprite));
 const row={id:a.id,slug:a.slug,name:a.name,role:brief.role,zone:brief.zone,brief,sprite,spriteSha256:await digest(local(sprite)),raw:q.source,sourceSha256,metadata:metaPath,metadataSha256:await digest(local(metaPath)),prompt:q.prompt,promptSha256:await digest(local(q.prompt)),inputs:q.inputHashes,canvas,pivot,bodyHeightPx:80,direction:'southeast',pose:'neutral',visualLimitations:[...new Set([...(measure.visualLimitations??[]),...(review.limitations??[])])],sourceAssessment:assessmentFile,artApproved:false,ownerApproved:false,runtimeImported:false,animationProduced:false};
 actors.push(row);registration.push({id:a.id,slug:a.slug,source:q.source,sourceSha256,sourceDimensions:[info.width,info.height],bounds,sourcePivot:measure.sourcePivot,sourceSupportWitness:witness,bodyTopY:bodyTop,headBounds:head,headToStandingHeightRatio:(head[3]-bodyTop)/(floor-bodyTop),scale,rootBasis:measure.rootBasis,visuallyReviewed:true,sourceAssessmentRecord:review,sourceAssessmentRecordSha256:hash(Buffer.from(JSON.stringify(review))),alphaThreshold:128,binaryAlpha:true,rgbPainted:false,componentsRemoved:0,pixelsResampled:true,canvas,pivot,nativeOffset:[dx,dy],nativeBounds:[dx,dy,dx+w,dy+h],sprite,spriteSha256:row.spriteSha256,artApproved:false,runtimeImported:false});
}
const primaryReference={file:nativePath,sha256:ref.nativeSha256,canvas:[64,96],pivot:[32,88],bodyHeightPx:80,atlas:ref.atlas,atlasSha256:ref.atlasSha256,rect:ref.rect,nearest8x:largePath,nearest8xSha256:ref.nearest8xSha256};
const coverage={actors:6,neutralViews:6,directionsProduced:['southeast'],directionsPending:['south','southwest','west','northwest','north','northeast','east'],animationClips:0,poses:6};
const common={date:'2026-10-13',gdd:{file:gddPath,sha256:hash(gddBytes)},primaryReference,coverage,artApproved:false,ownerApproved:false,runtimeImported:false};
await writeFile(local('catalog.json'),JSON.stringify({schema:'npc-wave-a-neutral-catalog-1',...common,actors},null,2)+'\n');
await writeFile(local('registration.json'),JSON.stringify({schema:'npc-wave-a-neutral-registration-1',...common,measurementFile:'review/source-measurements.json',measurementSha256:await digest(local('review/source-measurements.json')),assessmentFile,assessmentSha256:await digest(local(assessmentFile)),sources:registration},null,2)+'\n');
await writeFile(local('production.json'),JSON.stringify({schema:'npc-wave-a-neutral-production-1',...p,...common,status:'six-southeast-neutral-owner-review-pending',generator:'project-router-gpt-image-2-edit',skill:'docs/skills/game-actor-animation-production/SKILL.md',productionPlanSha256:await digest(local('production-plan.json')),actors},null,2)+'\n');
console.log(JSON.stringify({actors:actors.length,neutralViews:6,animationClips:0,artApproved:false,runtimeImported:false}));
