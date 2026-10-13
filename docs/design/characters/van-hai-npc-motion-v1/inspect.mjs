// Read-only source analysis; writes only review evidence in this new motion pack.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp,components} from '../../../../scripts/actor-sprite-tools.mjs';

const root=dirname(fileURLToPath(import.meta.url)),workspace=resolve(root,'../../../..');
assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-motion-v1');
const hash=b=>createHash('sha256').update(b).digest('hex');
const args=process.argv.slice(2),slugIndex=args.indexOf('--slug'),only=slugIndex<0?null:args[slugIndex+1];
const thresholdIndex=args.indexOf('--alpha-threshold'),threshold=thresholdIndex<0?128:Number(args[thresholdIndex+1]);
assert.ok(Number.isInteger(threshold)&&threshold>=1&&threshold<=255,'alpha threshold must be 1..255');
assert.ok(!only||/^[a-z0-9-]+$/.test(only),'Unsafe slug');
function local(file){const path=resolve(root,file),rel=relative(root,path);assert.ok(!rel.startsWith('..')&&!isAbsolute(rel),'Outside motion pack');return path;}
await mkdir(local('review'),{recursive:true});
const selectedPlan=JSON.parse(await readFile(local('production-plan.json'),'utf8'));
const selectedSources=selectedPlan.actors.filter(actor=>!only||actor.slug===only);
assert.ok(selectedSources.length,'No selected southeast raw sheets found');
const actors=[];
for(const selection of selectedSources){
 const source=selection.source,slug=selection.slug,bytes=await readFile(local(source));
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const bodies=components(data,info.width,info.height,threshold).sort((a,b)=>b.area-a.area);
 // Area-ranked body candidates, then detected vertical/horizontal order. This is
 // diagnostic only: no equal-grid cropping or automatic root measurement.
 const candidates=bodies.slice(0,18).sort((a,b)=>(a.top+a.height/2)-(b.top+b.height/2));
 const expectedCount=bodies.length===18;
 const ordered=expectedCount?[0,1,2].flatMap(row=>candidates.slice(row*6,row*6+6).sort((a,b)=>a.left-b.left).map((b,col)=>({...b,row,col,index:row*6+col,action:['idle','talk','profession'][row],frame:col}))):candidates.map((b,index)=>({...b,index,row:null,col:null,action:null,frame:null}));
 let opaque=0,soft=0,zero=0;for(let i=3;i<data.length;i+=4){if(data[i]>=threshold)opaque++;else if(data[i]>0)soft++;else zero++;}
 const lines=ordered.map(b=>`<rect x="${b.left}" y="${b.top}" width="${b.width}" height="${b.height}" fill="none" stroke="${['#55d98d','#ffd36e','#6dc6ff'][b.row]??'#ff9673'}" stroke-width="3"/><text x="${b.left}" y="${Math.max(20,b.top-7)}" fill="#16271e" stroke="#fff" stroke-width=".8" paint-order="stroke" font-family="Segoe UI" font-size="20">${b.index} ${b.action??'unassigned'} ${b.col??''}</text>`).join('');
 const grid=`<svg width="${info.width}" height="${info.height}">${lines}</svg>`;
 const guide='review/'+slug+'-source-components.png';
 await sharp({create:{width:info.width,height:info.height,channels:4,background:'#eee7d7'}}).composite([{input:bytes,left:0,top:0},{input:Buffer.from(grid),left:0,top:0}]).png().toFile(local(guide));
 actors.push({slug,direction:'southeast',source,sourceSha256:hash(bytes),sourceDimensions:[info.width,info.height],alphaThreshold:threshold,alpha:{opaqueAtThreshold:opaque,softBelowThreshold:soft,zero},connectedComponents:bodies,detectedFrames:ordered,bodyCandidates:ordered.length,expectedFrames:18,detectedCountMatches:expectedCount,orderingMethod:'area-ranked connected alpha components then vertical groups and horizontal order; visual assignment required',guide,registrationStatus:'manual-world-root-measurement-required',notes:'Components require area>=250 source pixels. Detached props/fragments can be separate components: inspect and include the full pose in its manually authored sourceRect. No root/scale is inferred here.'});
}
const report={schema:'npc-motion-source-components-1',date:'2026-10-13',actors,artApproved:false,ownerApproved:false,runtimeModified:false};
await writeFile(local('review/source-components.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({actors:actors.map(a=>({slug:a.slug,size:a.sourceDimensions,components:a.connectedComponents.length,bodyCandidates:a.bodyCandidates,guide:a.guide})),manualRootsRequired:true}));
