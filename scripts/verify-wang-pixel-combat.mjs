import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sharp,components} from './actor-sprite-tools.mjs';
const root='docs/design/characters/wang-lin-pixel-combat-v1',json=async f=>JSON.parse(await readFile(f)),sha=b=>createHash('sha256').update(b).digest('hex');
const p=await json(root+'/production-plan.json'),c=await json(root+'/catalog.json'),basis=await json(root+'/'+c.basis),checks=[];
for(const f of basis.targets)assert.equal(sha(await readFile(f.file)),f.sha256,'Approved basis changed: '+f.file);
assert.equal(Object.keys(c.clips).length,40);assert.deepEqual(c.coverage.missing,[]);assert.equal(c.artApproved,false);assert.equal(c.ownerApproved,false);
for(const r of p.requests){assert.equal(r.status,'generated');for(const [f,h]of [[r.sourceFile,r.sourceSha256],[r.promptFile,r.promptSha256],...r.inputHashes.map(i=>[i.file,i.sha256])])assert.equal(sha(await readFile(root+'/'+f)),h,f);const source=await sharp(root+'/'+r.sourceFile).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(components(source.data,source.info.width,source.info.height).length,6*r.rows.length);}
for(const clip of Object.values(c.clips)){
 assert.equal(clip.frames.length,6);assert.deepEqual(clip.frameSize,p.frames[clip.action]);assert.deepEqual(clip.pivot,[clip.frameSize[0]/2,88]);assert.equal(clip.loop,false);assert.equal(clip.holdLast,true);assert.deepEqual(clip.durations,p.timing[clip.action].durations);assert.equal(clip.fps,p.timing[clip.action].fps);
 const atlasFile=await readFile(root+'/'+clip.atlas);assert.equal(sha(atlasFile),clip.atlasSha256);const atlas=await sharp(atlasFile).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([atlas.info.width,atlas.info.height],clip.atlasSize);
 const reg=c.registration.find(r=>r.id===clip.registrationSource),frames=reg.frames.filter(f=>f.action===clip.action);assert.equal(frames.length,6);assert.ok(frames.every(f=>f.scale===reg.scale));
 let lastBounds;
 for(const[i,f]of clip.frames.entries()){
  const file=await readFile(root+'/'+f.file);assert.equal(sha(file),f.sha256);const decoded=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{data,info}=decoded;assert.deepEqual([info.width,info.height],clip.frameSize);
  let left=Infinity,right=-1,top=Infinity,bottom=-1,opaque=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const at=(y*info.width+x)*4,a=data[at+3],ai=((y+f.rect.y)*atlas.info.width+x+f.rect.x)*4;assert.ok(a===0||a===255,'Non-binary alpha');assert.ok(data.subarray(at,at+4).equals(atlas.data.subarray(ai,ai+4)),'Atlas pixel mismatch');if(a){opaque++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}else assert.ok(data.subarray(at,at+4).every(v=>v===0),'Transparent RGB contamination');}
  assert.ok(opaque>250);assert.equal(bottom,87);assert.ok(left>=1&&right<info.width-1&&top>=1,'Opaque frame edge / clipping');
  for(let y=f.rect.y-2;y<f.rect.y+f.rect.h+2;y++)for(let x=f.rect.x-2;x<f.rect.x+f.rect.w+2;x++){if(x>=f.rect.x&&x<f.rect.x+f.rect.w&&y>=f.rect.y&&y<f.rect.y+f.rect.h)continue;assert.ok(atlas.data.subarray((y*atlas.info.width+x)*4,(y*atlas.info.width+x)*4+4).every(v=>v===0),'Atlas gutter');}
  const bounds={left,top,width:right-left+1,height:bottom-top+1};lastBounds=bounds;checks.push({clip:clip.id,index:i,bounds,opaque,scale:reg.scale,root:frames[i].sourcePivot,offset:frames[i].offset});
 }
 if(clip.action==='death')assert.ok(lastBounds.height<45,'Corpse did not lower naturally');
 const duration=clip.durations.reduce((a,b)=>a+b,0)*1000/clip.fps,expected={hit:200,death:1000,attack:400,attack_2:2000/3,attack_3:750}[clip.action];assert.ok(Math.abs(duration-expected)<1e-6);
 if(clip.action.startsWith('attack'))assert.ok(Math.abs(clip.phases.find(p=>p.label==='Phát lực').at-({attack:200,attack_2:1000/3,attack_3:1250/3}[clip.action]))<1e-6);
}
assert.equal(checks.length,240);const report={passed:true,clips:40,frames:240,directions:8,sourceSheets:16,approvedBasisFilesUnchanged:basis.targets.length,oneScalePerSource:true,perPoseFit:false,binaryAlpha:true,atlasPixelsExact:true,gutter:2,worldFoot:[null,88],noWalkOrSprintRequired:true,artApproved:false,scope:'Technical source/canonical/atlas/pivot/timing verification. New anatomy and motion still require visual owner review; no live gameplay integration.',checks};await mkdir('docs/data',{recursive:true});await writeFile('docs/data/wang-pixel-combat-v1-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,checks:undefined}));
