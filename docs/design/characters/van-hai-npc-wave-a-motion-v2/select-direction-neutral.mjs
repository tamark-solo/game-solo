// Select an explicitly reviewed same-NPC view as motion input; preserve earlier sources/requests.
import {readFile,writeFile,copyFile,access} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),ids=process.argv.slice(2);
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');assert.ok(ids.length);
const hash=b=>createHash('sha256').update(b).digest('hex'),digest=async f=>hash(await readFile(resolve(root,f)));
const writePrepared=async(file,body)=>{try{assert.equal(await readFile(resolve(root,file),'utf8'),body,'Existing prepared brief changed: '+file);}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(resolve(root,file),body,{flag:'wx'});}};
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),draft=JSON.parse(await readFile(resolve(root,'brief-draft.json'),'utf8'));
try{await access(resolve(root,'production-plan-before-direction-neutral.json'));}catch(e){if(e.code!=='ENOENT')throw e;await copyFile(resolve(root,'production-plan.json'),resolve(root,'production-plan-before-direction-neutral.json'));}
for(const id of ids){
 const q=p.requests.find(q=>q.id===id),n=p.neutralRequests.find(q=>q.id===id),b=draft.requests.find(q=>q.id===id);assert.ok(q&&n&&b);
 assert.ok(!q.directionNeutralReference,'Same-direction neutral already selected');
 const registration='direction-neutral/review/'+id+'.json',r=JSON.parse(await readFile(resolve(root,registration),'utf8'));
 assert.equal(r.slug,q.slug);assert.equal(r.direction,q.direction);assert.equal(r.visuallyReviewed,true);assert.equal(r.proposalOnly,false);assert.equal(r.manualSourceReviewConfirmed,true);assert.equal(r.clippedOpaquePixels,0);
 for(const [file,sha]of [[r.source,r.sourceSha256],[r.native,r.nativeSha256],[r.nearest8x,r.nearest8xSha256]])assert.equal(await digest(file),sha);
 const original=structuredClone(q),inputImages=['inputs/wang-lin-live-'+q.direction+'-nearest8x.png',r.nearest8x,r.source];
 const support='IMAGE2 is the SAME NPC manually inspected '+q.direction.toUpperCase()+' directional neutral enlarged nearest8x, the EXACT camera/identity/physical-hand calibration to preserve in every frame. IMAGE3 is the SAME directional neutral RAW; costume and prop detail only. All three images are in the target direction. No Southeast sheet is an input. Preserve this own neutral head, robe, tools and physical handedness throughout all18poses; never swivel to front or Southeast to display a gesture.';
 const base=b.prompt.replace(/IMAGE2 is the SAME NPC accepted Southeast native neutral enlarged nearest8x; IMAGE3 is this SAME NPC accepted Southeast raw\/motion identity source\.[\s\S]*?Do not use another NPC as style basis\./i,support);
 const prompt='DIRECTION-LOCKED MOTION from a verified same-NPC view. '+support+'\n\nPhysical handedness: '+n.physicalHandedness+'\n\n'+base+'\n';
 assert.ok(!prompt.includes('IMAGE2 is the SAME NPC accepted Southeast native'),'Old Southeast input wording remains');
 const promptFile='prompts/'+id+'-direction-neutral-motion.txt',spec='specs/'+id+'-direction-neutral-motion.json',assetPlan='plans/'+id+'-direction-neutral-motion.json';
 await writePrepared(promptFile,prompt);
 await writePrepared(spec,JSON.stringify({assetType:'character-concept',name:'vn-wave-a-motion-'+id+'-neutral-v2',prompt,size:'1536x1536',quality:'high',n:1},null,2)+'\n');
 q.revisions??=[];q.revisions.push({reason:'Selected verified same-direction neutral for robust camera and physical hand continuity',originalRequest:original,status:'prior-selection-preserved'});
 q.source='raw/'+id+'-direction-neutral.png';q.prompt=promptFile;q.promptSha256=hash(Buffer.from(prompt));q.spec=spec;q.assetPlan=assetPlan;q.images=inputImages;
 q.inputHashes=await Promise.all(inputImages.map(async file=>({file,sha256:await digest(file)})));
 q.directionNeutralReference={source:r.source,sourceSha256:r.sourceSha256,native:r.native,nativeSha256:r.nativeSha256,registration,registrationSha256:await digest(registration)};
 q.referencePolicy={stage:'motion-from-manually-inspected-same-direction-neutral',editTargetFirst:false,primaryStyleImageIndex:1,sameDirectionNeutralInput:true,ownApprovedPilotIdentityLocked:true};
 q.background='transparent';q.status='same-direction-motion-prepared-awaiting-plan';q.physicalHandedness=n.physicalHandedness;
}
await writeFile(resolve(root,'production-plan.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({selectedNeutralIds:ids,paidRequests:0,oldSourcesPreserved:true}));
