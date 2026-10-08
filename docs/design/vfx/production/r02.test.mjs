import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {R02VfxController} from './r02-controller.mjs';
import {makePlan,samplePresentation,movementPoint} from './r02-model.mjs';
import {FrameEventCursor,SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const kits=await Promise.all(['sword','thunder','wind'].map(async family=>({family,skill:await read(`../r02-${family}-v1/skill.json`),clips:(await read(`../r02-${family}-v1/clips.json`)).clips})));
const [s,t,w]=kits;
const at=f=>frameSeconds(f,24);
test('132 RGBA frames and 15 atlases: dimensions, distinct sequence frames and atlas bounds',async()=>{
 for(const [n,k] of kits.entries()){
  assert.equal(Object.values(k.clips).reduce((sum,c)=>sum+c.frames.length,0),[50,44,38][n]);
  assert.equal(Object.keys(k.clips).length,[6,5,4][n]);
  for(const c of Object.values(k.clips)){
   const hashes=new Set(); assert.equal(c.durations.length,c.frames.length);
   for(const f of c.frames){const png=await readFile(new URL(`../r02-${k.family}-v1/${f.file}`,import.meta.url));assert.equal(png.readUInt32BE(16),c.frameSize[0]);assert.equal(png.readUInt32BE(20),c.frameSize[1]);assert.equal(png[25],6);hashes.add(createHash('sha256').update(png).digest('hex'));assert.ok(f.rect.x+f.rect.w<=c.atlasSize[0]);assert.ok(f.rect.y+f.rect.h<=c.atlasSize[1]);}assert.equal(hashes.size,c.frames.length);
  }
 }
});
test('84 reused PNG frames remain byte-identical to R01; 48 new FX frames are separate',async()=>{
 let reused=0,newFrames=0;
 for(const k of kits)for(const c of Object.values(k.clips)){
  if(!c.reusedFrom){newFrames+=c.frames.length;continue;}
  for(const f of c.frames){const a=await readFile(new URL(`../r02-${k.family}-v1/${f.file}`,import.meta.url)),b=await readFile(new URL(`../r02-${k.family}-v1/${c.reusedFrom.path}/${f.file}`,import.meta.url));assert.deepEqual(a,b);reused++;}
 }assert.equal(reused,84);assert.equal(newFrames,48);
});
test('character holds end exactly at authored character.end and VFX has no combat/movement authority',()=>{
 for(const k of kits){const end=k.skill.events.find(e=>e.type==='character.end').frame,p=new SequencePlayer(k.clips[k.skill.character.clip]);assert.equal(p.length,end-1);assert.equal(p.sample(at(end-1)).index,11);assert.equal(p.sample(at(end)),null);assert.equal(k.skill.authority.vfxAppliesDamage,false);assert.equal(k.skill.authority.vfxMovesActor,false);}
});
test('dropped render frames emit release once; three decorative parts do not emit three attacks',()=>{
 for(const k of kits){const c=new FrameEventCursor(24,k.skill.events),events=c.advance(10);assert.equal(events.filter(e=>e.type==='release'||e.type==='movement.request').length,1);assert.equal(events.filter(e=>/damage|hitbox/.test(e.type)).length,0);assert.deepEqual(c.advance(11),[]);}
});
test('sword contact hides flight before delayed host hit; miss dissolves at path end',()=>{
 const p=makePlan(s.skill,s.clips,{delay:12});assert.equal(p.confirmFrame,p.contactFrame+12);
 const waiting=samplePresentation(s.skill,s.clips,p,at(p.contactFrame));assert.ok(!waiting.items.some(i=>i.id==='sword-flight'||i.id==='qi-impact'));
 const hit=samplePresentation(s.skill,s.clips,p,at(p.confirmFrame));assert.deepEqual(hit.items.find(i=>i.id==='qi-impact').point,p.hitPoint);
 const miss=makePlan(s.skill,s.clips,{hit:false});for(let f=1;f<miss.projectile.expireFrame;f++)assert.ok(!samplePresentation(s.skill,s.clips,miss,at(f)).items.some(i=>i.id==='qi-impact'));
 const tail=samplePresentation(s.skill,s.clips,miss,at(miss.projectile.expireFrame)).items.find(i=>i.id==='qi-impact');assert.ok(tail);assert.notDeepEqual(tail.point,miss.hitPoint);
});
test('boss anchor changes contact location without scaling impact artwork',()=>{
 const a=makePlan(s.skill,s.clips,{target:'pvp'}),b=makePlan(s.skill,s.clips,{target:'boss'});assert.notDeepEqual(a.hitPoint,b.hitPoint);
 const x=samplePresentation(s.skill,s.clips,a,at(a.confirmFrame)).items.find(i=>i.id==='qi-impact'),y=samplePresentation(s.skill,s.clips,b,at(b.confirmFrame)).items.find(i=>i.id==='qi-impact');assert.deepEqual(x.sample.clip.frameSize,y.sample.clip.frameSize);assert.equal(y.angle,b.projectile.angle);
});
test('early host sword hit cannot respawn projectile on first delayed update',()=>{
 const c=new R02VfxController(s.skill,s.clips);c.beginCast({castId:'a',startedAt:0,foot:[300,300]});c.setProjectilePose({tip:[420,260]});assert.equal(c.confirmHit({castId:'a',hitId:'h',worldPosition:[500,252],confirmedAt:.45}),true);assert.equal(c.confirmHit({castId:'a',hitId:'h',worldPosition:[500,252],confirmedAt:.45}),false);
 const draw=c.update(.5);assert.ok(!draw.some(i=>i.clip==='sword-flight'));assert.deepEqual(draw.find(i=>i.clip==='qi-impact').point,[500,252]);c.dispose();
});
test('sword adapter uses external projectile pose and expires once without damage',()=>{
 const c=new R02VfxController(s.skill,s.clips);c.beginCast({castId:'b',startedAt:0,foot:[300,300]});assert.ok(!c.update(.5).some(i=>i.clip==='sword-flight'));c.setProjectilePose({tip:[450,255],direction:[0,-1]});const flight=c.update(.55).find(i=>i.clip==='sword-flight');assert.deepEqual(flight.point,[450,255]);assert.equal(flight.angle,-Math.PI/2);
 assert.equal(c.expireProjectile({castId:'b',expiredAt:.6,tip:[460,250]}),true);assert.equal(c.expireProjectile({castId:'b',expiredAt:.6,tip:[460,250]}),false);assert.equal(c.update(.6).find(i=>i.kind==='airDissolve').sample.frame.file,s.clips['qi-impact'].frames.at(-4).file);c.endCast();c.update(2);assert.equal(c.pool.activeCount,0);
});
test('thunder nodes cannot synthesize hit; explicit confirmation dedupes and leads impact by two ticks',()=>{
 const events=[],c=new R02VfxController(t.skill,t.clips,{onEvent:e=>events.push(e)});c.beginCast({castId:'c',startedAt:0,foot:[300,300],targetFoot:[550,300]});assert.ok(!c.update(1).some(i=>i.clip==='thunder-bolt'||i.clip==='thunder-impact'));assert.equal(c.confirmHit({castId:'bad',hitId:'h',worldPosition:[550,250],confirmedAt:1}),false);assert.equal(c.confirmHit({castId:'c',hitId:'h',worldPosition:[550,250],confirmedAt:1}),true);assert.equal(c.confirmHit({castId:'c',hitId:'h',worldPosition:[550,250],confirmedAt:1}),false);assert.ok(c.update(1).some(i=>i.clip==='thunder-bolt'));assert.ok(!c.update(1).some(i=>i.clip==='thunder-impact'));assert.deepEqual(c.update(1+2/24).find(i=>i.clip==='thunder-impact').point,[550,250]);assert.ok(events.every(e=>e.type.startsWith('visual.')));c.dispose();
});
test('wind return curl never pulls actor back; host arrival stops trail and dedupes',()=>{
 const plan=makePlan(w.skill,w.clips);assert.deepEqual(movementPoint(w.skill,plan,100),[520,386]);assert.deepEqual(samplePresentation(w.skill,w.clips,plan,at(25)).foot,[520,386]);
 const c=new R02VfxController(w.skill,w.clips);c.beginCast({castId:'d',startedAt:0,foot:[300,300]});c.setActorFoot([355,307]);assert.ok(c.update(1).some(i=>i.clip==='wind-trail'));assert.ok(!c.update(1).some(i=>i.clip==='wind-return-curl'));assert.equal(c.confirmArrival({castId:'d',worldFoot:[470,310],arrivedAt:1.1}),true);assert.equal(c.confirmArrival({castId:'d',worldFoot:[470,310],arrivedAt:1.1}),false);const draw=c.update(1.1);assert.ok(!draw.some(i=>i.clip==='wind-trail'));assert.deepEqual(draw.find(i=>i.clip==='wind-return-curl').point,[470,310]);assert.deepEqual(c.cast.foot,[470,310]);c.dispose();
});
test('pool stays bounded through excess requests and dispose releases all slots',()=>{
 const c=new R02VfxController(t.skill,t.clips,{capacity:2});for(let i=0;i<1000;i++)c.spawn('thunder-impact',0,[0,0]);assert.equal(c.pool.slots.length,2);c.update(3);assert.equal(c.pool.activeCount,0);c.spawn('thunder-impact',5,[0,0]);c.dispose();assert.equal(c.pool.activeCount,0);
});
