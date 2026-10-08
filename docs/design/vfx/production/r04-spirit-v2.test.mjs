import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {R04VfxController as Controller} from './r04-sigil-controller.mjs';
import {makePlan,samplePresentation} from './r04-sigil-model.mjs';
import {spiritPresentation} from './spirit-sigil-model.mjs';
import {frameSeconds,sortLayers} from '../frame-by-frame-r01/sequence-system.mjs';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
const kits=await Promise.all(['sword','thunder','wind'].map(async family=>({family,skill:await read(`../r04-${family}-v2/skill.json`),clips:(await read(`../r04-${family}-v2/clips.json`)).clips})));
const [s,t,w]=kits,at=f=>frameSeconds(f,24),hash=b=>createHash('sha256').update(b).digest('hex');
test('R04 has 156 RGBA frames in 19 atlases, distinct per sequence with valid rects and opacity curves',async()=>{
 for(const [n,k]of kits.entries()){
  assert.equal(Object.values(k.clips).reduce((a,c)=>a+c.frames.length,0),[56,54,46][n]);assert.equal(Object.keys(k.clips).length,[7,7,5][n]);
  for(const c of Object.values(k.clips)){
   assert.equal(c.frames.length,c.durations.length);if(c.opacities){assert.equal(c.opacities.length,c.frames.length);assert.ok(c.opacities.every(a=>a>=0&&a<=1));}
   const hashes=new Set();for(const f of c.frames){const bytes=await readFile(new URL(`../r04-${k.family}-v2/${f.file}`,import.meta.url));assert.equal(bytes[25],6);assert.equal(bytes.readUInt32BE(16),c.frameSize[0]);assert.equal(bytes.readUInt32BE(20),c.frameSize[1]);hashes.add(hash(bytes));assert.ok(f.rect.x+f.rect.w<=c.atlasSize[0]);assert.ok(f.rect.y+f.rect.h<=c.atlasSize[1]);}assert.equal(hashes.size,c.frames.length);
  }
 }
});
test('116 PNGs are reused unchanged plus 40 new frames; all sealed R03 payloads still match hashes',async()=>{
 let reused=0,newFrames=0;for(const k of kits)for(const c of Object.values(k.clips)){
  if(!c.reusedFrom){newFrames+=c.frames.length;continue;}for(const f of c.frames){assert.deepEqual(await readFile(new URL(`../r04-${k.family}-v2/${f.file}`,import.meta.url)),await readFile(new URL(`../r04-${k.family}-v2/${c.reusedFrom.path}/${f.file}`,import.meta.url)));reused++;}
 }assert.equal(reused,116);assert.equal(newFrames,40);
 for(const k of kits){const m=await read(`../releases/skill-packs/r03-${k.family}-1.0.0.manifest.json`);for(const e of m.files)assert.equal(hash(await readFile(new URL('../'+e.file,import.meta.url))),e.sha256,e.file);}
});
test('spirit is a short 80-pixel decorative silhouette, never a gameplay actor',()=>{
 for(const k of kits){const spec=k.skill.spirit,c=k.clips[spec.clip];assert.equal(c.frames.length,6);assert.ok(c.frames.every(f=>f.registeredBounds.h<=80));assert.equal(k.skill.character.bodyHeightMax,80);assert.equal(spec.hasAI,false);assert.equal(spec.hasCollision,false);assert.equal(spec.appliesDamage,false);assert.equal(k.skill.authority.vfxMovesActor,false);for(const tr of k.skill.tracks)assert.ok(k.clips[tr.clip]);}
});
test('wind spirit holds departure pose after authoring arrival time until actual host confirmation',()=>{
 const c=new Controller(w.skill,w.clips);c.beginCast({castId:'w',startedAt:0,foot:[300,300]});c.setActorFoot([420,310]);const row=c.update(1.1).find(r=>r.kind==='decorativeSpirit');assert.equal(row.sample.index,2);assert.deepEqual(row.point,[378,276]);assert.deepEqual(c.cast.foot,[420,310]);
 assert.equal(c.confirmArrival({castId:'w',worldFoot:[465,312],arrivedAt:1.2}),true);assert.equal(c.confirmArrival({castId:'w',worldFoot:[465,312],arrivedAt:1.2}),false);const first=c.update(1.2).find(r=>r.kind==='decorativeSpirit');assert.equal(first.sample.index,3);assert.deepEqual(first.sample.frame,w.clips[w.skill.spirit.clip].frames[3]);
 const middle=c.update(1.2+2/24).find(r=>r.kind==='decorativeSpirit');assert.ok(middle.point[0]>423&&middle.point[0]<465);assert.deepEqual(c.cast.foot,[465,312]);assert.ok(!c.update(1.2+5/24).some(r=>r.kind==='decorativeSpirit'));c.dispose();
});
test('early host arrival cannot respawn departure spirit on first delayed render',()=>{
 const c=new Controller(w.skill,w.clips);c.beginCast({castId:'early',startedAt:0,foot:[300,300]});c.confirmArrival({castId:'early',worldFoot:[430,304],arrivedAt:.3});const draw=c.update(.9);assert.ok(!draw.some(r=>r.kind==='decorativeSpirit'||r.clip==='wind-trail'));assert.deepEqual(c.cast.foot,[430,304]);c.dispose();
});
test('woven lightning starts only after a deduplicated host hit at the provided contact point',()=>{
 const events=[],c=new Controller(t.skill,t.clips,{onEvent:e=>events.push(e)});c.beginCast({castId:'t',startedAt:0,foot:[300,300],targetFoot:[550,300]});assert.ok(!c.update(.8).some(r=>r.clip==='thunder-weave'));assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[558,247],confirmedAt:1}),true);assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[558,247],confirmedAt:1}),false);const row=c.update(1).find(r=>r.clip==='thunder-weave');assert.deepEqual(row.point,[558,247]);assert.equal(row.layer,2);assert.equal(c.pool.activeCount,3);assert.ok(events.every(e=>e.type.startsWith('visual.')));c.dispose();
 const miss=makePlan(t.skill,t.clips,{hit:false});for(let f=1;f<=48;f++)assert.ok(!samplePresentation(t.skill,t.clips,miss,at(f)).items.some(r=>r.id==='thunder-weave'||r.id==='thunder-impact'));
});
test('spirit samples neither mutate host feet nor grow when switching target to boss',()=>{
 const foot=[410,305],before=[...foot],a=spiritPresentation(s.skill,s.clips,{age:at(7),foot});assert.deepEqual(foot,before);assert.deepEqual(a.point,[368,271]);const normal=makePlan(s.skill,s.clips,{target:'pvp'}),boss=makePlan(s.skill,s.clips,{target:'boss'});assert.notDeepEqual(normal.hitPoint,boss.hitPoint);const x=samplePresentation(s.skill,s.clips,normal,at(7)).items.find(r=>r.kind==='decorativeSpirit'),y=samplePresentation(s.skill,s.clips,boss,at(7)).items.find(r=>r.kind==='decorativeSpirit');assert.deepEqual(x.sample.clip.frameSize,y.sample.clip.frameSize);assert.deepEqual(x.point,y.point);
});
test('new decoration respects bounded pool and ends with cast/dispose without extra gameplay events',()=>{
 const c=new Controller(t.skill,t.clips,{capacity:2});c.beginCast({castId:'small',startedAt:0,foot:[300,300]});c.confirmHit({castId:'small',hitId:'h',worldPosition:[500,240],confirmedAt:.5});assert.equal(c.pool.slots.length,2);assert.ok(!c.update(.5).some(r=>r.clip==='thunder-weave'));c.endCast();assert.ok(!c.update(.6).some(r=>r.kind==='decorativeSpirit'));c.dispose();assert.equal(c.pool.activeCount,0);
});
test('R04 preview terminates all transient FX and spirit at final frame',()=>{
 for(const k of kits){const plan=makePlan(k.skill,k.clips);assert.deepEqual(samplePresentation(k.skill,k.clips,plan,at(plan.endFrame)).items,[]);}
});

test('spirit stays behind the opaque actor with a smaller, restrained silhouette',()=>{
 for(const k of kits){const plan=makePlan(k.skill,k.clips),state=samplePresentation(k.skill,k.clips,plan,at(7)),ghost=state.items.find(r=>r.kind==='decorativeSpirit');assert.ok(ghost);assert.equal(ghost.scale,1);assert.ok(ghost.layer<1);assert.ok(ghost.point[0]<=state.foot[0]-40);assert.ok(Math.max(...ghost.sample.clip.opacities)<=.85);const ordered=sortLayers([{id:'actor',layer:1,sortY:state.foot[1],order:0},{id:'spirit',layer:ghost.layer,sortY:ghost.point[1],order:1}]);assert.deepEqual(ordered.map(r=>r.id),['spirit','actor']);assert.ok(Math.max(...ghost.sample.clip.frames.map(f=>f.registeredBounds.h))*ghost.scale<=48);}
});

test('redesign replaces all 18 spirit PNGs, keeps the remaining 138 PNGs and sealed V1 payloads unchanged',async()=>{
 let fresh=0,retained=0;for(const k of kits){for(const [id,c]of Object.entries(k.clips))for(const f of c.frames){const a=await readFile(new URL(`../r04-${k.family}-v2/${f.file}`,import.meta.url)),b=await readFile(new URL(`../r04-${k.family}-v1/${f.file}`,import.meta.url));if(id===k.skill.spirit.clip){assert.notEqual(hash(a),hash(b));assert.ok(f.registeredBounds.h<=48);fresh++;}else{assert.deepEqual(a,b);retained++;}}const m=await read(`../releases/skill-packs/r04-${k.family}-1.0.1.manifest.json`);for(const e of m.files)assert.equal(hash(await readFile(new URL('../'+e.file,import.meta.url))),e.sha256,e.file);}assert.equal(fresh,18);assert.equal(retained,138);
});

test('wind sigil merges toward the torso without adding opaque body echoes',()=>{
 const c=new Controller(w.skill,w.clips);c.beginCast({castId:'merge',startedAt:0,foot:[300,300]});c.confirmArrival({castId:'merge',worldFoot:[465,312],arrivedAt:.7});const last=c.update(.7+4/24).find(r=>r.kind==='decorativeSpirit');assert.ok(last);assert.equal(last.sample.index,5);assert.equal(last.point[1],278);assert.ok(last.point[0]<465&&last.point[0]>450);assert.deepEqual(w.skill.presentation.ghosts.sampleLagFrames,[]);c.dispose();
});
