import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {R02VfxController as Controller} from './r02-controller.mjs';
import {makePlan,samplePresentation,projectilePoint,movementPoint} from './r02-model.mjs';
import {FrameEventCursor,SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const kits=await Promise.all(['sword','thunder','wind'].map(async family=>({family,skill:await read(`../r03-${family}-v1/skill.json`),clips:(await read(`../r03-${family}-v1/clips.json`)).clips})));
const [s,t,w]=kits,at=f=>frameSeconds(f,24),hash=b=>createHash('sha256').update(b).digest('hex');
test('R03 has 130 distinct-within-clip RGBA frames in 15 atlases, correct holds and source bounds',async()=>{
 for(const [n,k]of kits.entries()){
  assert.equal(Object.values(k.clips).reduce((a,c)=>a+c.frames.length,0),[50,40,40][n]);assert.equal(Object.keys(k.clips).length,[6,5,4][n]);
  for(const c of Object.values(k.clips)){
   assert.equal(c.frames.length,c.durations.length);const hashes=new Set();
   if(c.opacities){assert.equal(c.opacities.length,c.frames.length);assert.ok(c.opacities.every(a=>a>=0&&a<=1));assert.ok(c.opacities.at(-1)<.2);}
   for(const f of c.frames){const bytes=await readFile(new URL(`../r03-${k.family}-v1/${f.file}`,import.meta.url));assert.equal(bytes[25],6);assert.equal(bytes.readUInt32BE(16),c.frameSize[0]);assert.equal(bytes.readUInt32BE(20),c.frameSize[1]);hashes.add(hash(bytes));assert.ok(f.rect.x+f.rect.w<=c.atlasSize[0]);assert.ok(f.rect.y+f.rect.h<=c.atlasSize[1]);assert.ok(f.registeredBounds.x>=0&&f.registeredBounds.y>=0);assert.ok(f.registeredBounds.x+f.registeredBounds.w<=c.frameSize[0]);}assert.equal(hashes.size,c.frames.length);
  }
 }
});
test('R03 uses 84 byte-identical PNGs from R02 plus 46 new FX frames; all sealed R02 payloads remain unchanged',async()=>{
 let reused=0,newFrames=0;for(const k of kits)for(const c of Object.values(k.clips)){
  if(!c.reusedFrom){newFrames+=c.frames.length;continue;}for(const f of c.frames){const a=await readFile(new URL(`../r03-${k.family}-v1/${f.file}`,import.meta.url)),b=await readFile(new URL(`../r03-${k.family}-v1/${c.reusedFrom.path}/${f.file}`,import.meta.url));assert.deepEqual(a,b);reused++;}
 }assert.equal(reused,84);assert.equal(newFrames,46);
 for(const k of kits){const manifest=await read(`../releases/skill-packs/r02-${k.family}-1.0.0.manifest.json`);for(const e of manifest.files)assert.equal(hash(await readFile(new URL('../'+e.file,import.meta.url))),e.sha256,e.file);}
});
test('R03 hold/end timing and skipped-frame release stay coherent without decorative damage events',()=>{
 for(const k of kits){const end=k.skill.events.find(e=>e.type==='character.end').frame,p=new SequencePlayer(k.clips[k.skill.character.clip]);assert.equal(p.length,end-1);assert.equal(p.sample(at(end)),null);assert.equal(k.skill.character.bodyHeightMax,80);assert.equal(k.skill.authority.vfxAppliesDamage,false);assert.equal(k.skill.authority.vfxMovesActor,false);const cursor=new FrameEventCursor(24,k.skill.events),events=cursor.advance(10);assert.equal(events.filter(e=>e.type==='release'||e.type==='movement.request').length,1);assert.ok(events.every(e=>!/damage|hitbox/.test(e.type)));assert.deepEqual(cursor.advance(11),[]);for(const tr of k.skill.tracks)assert.ok(k.clips[tr.clip],tr.clip);}
});
test('sword wheel leading edge connects to launch tip without jumping back to the caster',()=>{
 const p=makePlan(s.skill,s.clips),formation=s.clips['sword-wheel'],bounds=formation.frames.at(-1).registeredBounds,edge=p.foot[0]+s.skill.formationOffset[0]+bounds.x+bounds.w-formation.anchor[0],tip=projectilePoint(p,at(p.releaseFrame));assert.ok(Math.abs(tip[0]-edge)<24,JSON.stringify({edge,tip}));assert.deepEqual(s.clips['sword-flight'].anchor,[174,72]);
 const delayed=makePlan(s.skill,s.clips,{delay:12});assert.ok(!samplePresentation(s.skill,s.clips,delayed,at(delayed.contactFrame)).items.some(i=>i.id==='sword-flight'||i.id==='qi-impact'));
 const miss=makePlan(s.skill,s.clips,{hit:false});const tail=samplePresentation(s.skill,s.clips,miss,at(miss.projectile.expireFrame)).items.find(i=>i.id==='qi-impact');assert.ok(tail);assert.notDeepEqual(tail.point,miss.hitPoint);
});
test('R03 thunder core has no synthesized impact; host confirmation uses the new eight-frame pressure burst',()=>{
 const c=new Controller(t.skill,t.clips);c.beginCast({castId:'t',startedAt:0,foot:[300,300],targetFoot:[550,300]});assert.ok(!c.update(1.2).some(i=>i.clip==='thunder-impact'||i.clip==='thunder-bolt'));assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[550,250],confirmedAt:1.3}),true);assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[550,250],confirmedAt:1.3}),false);assert.ok(!c.update(1.3).some(i=>i.clip==='thunder-impact'));const hit=c.update(1.3+2/24).find(i=>i.clip==='thunder-impact');assert.equal(hit.sample.clip.frames.length,8);assert.deepEqual(hit.point,[550,250]);c.dispose();
});
test('R03 wind follows host movement and arrival, then returns qi without returning actor',()=>{
 const p=makePlan(w.skill,w.clips);assert.deepEqual(movementPoint(w.skill,p,at(44)),[520,386]);const c=new Controller(w.skill,w.clips);c.beginCast({castId:'w',startedAt:0,foot:[300,300]});c.setActorFoot([420,306]);assert.deepEqual(c.update(.6).find(i=>i.clip==='wanglin-wind-east').point,[420,306]);assert.ok(!c.update(1).some(i=>i.clip==='wind-return-curl'));assert.equal(c.confirmArrival({castId:'w',worldFoot:[465,308],arrivedAt:1.1}),true);const draw=c.update(1.1);assert.ok(!draw.some(i=>i.clip==='wind-trail'));assert.deepEqual(draw.find(i=>i.clip==='wind-return-curl').point,[465,308]);assert.deepEqual(c.cast.foot,[465,308]);c.dispose();
});
test('confirmed R03 previews finish with no lingering transient FX at final frame',()=>{
 for(const k of kits){const p=makePlan(k.skill,k.clips);assert.deepEqual(samplePresentation(k.skill,k.clips,p,at(p.endFrame)).items,[]);}
});
