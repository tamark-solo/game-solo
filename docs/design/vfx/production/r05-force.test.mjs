import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {R05ForceVfxController as Controller} from './r05-force-controller.mjs';
import {makePlan,samplePresentation,movementPoint,frameFeedback} from './r05-force-model.mjs';
import {intentLighting} from './r05-lighting.mjs';
import {SequencePlayer,FrameEventCursor,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
const json=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
const kits=await Promise.all(['sword','thunder','wind'].map(async family=>({family,skill:await json(`../r05-${family}-v2/skill.json`),clips:(await json(`../r05-${family}-v2/clips.json`)).clips})));
const [s,t,w]=kits,at=f=>frameSeconds(f,24),hash=b=>createHash('sha256').update(b).digest('hex');
test('R05 V2 has 112 distinct-within-clip RGBA frames in 14 atlases with valid sizes, rects, holds and opacity',async()=>{
 for(const [i,k]of kits.entries()){
  assert.equal(Object.values(k.clips).reduce((n,c)=>n+c.frames.length,0),[38,40,34][i]);assert.equal(Object.keys(k.clips).length,[5,5,4][i]);
  for(const c of Object.values(k.clips)){assert.equal(c.frames.length,c.durations.length);if(c.opacities)assert.equal(c.opacities.length,c.frames.length);const hashes=new Set();for(const f of c.frames){const p=await readFile(new URL(`../r05-${k.family}-v2/${f.file}`,import.meta.url));assert.equal(p[25],6);assert.deepEqual([p.readUInt32BE(16),p.readUInt32BE(20)],c.frameSize);hashes.add(hash(p));assert.ok(f.rect.x+f.rect.w<=c.atlasSize[0]&&f.rect.y+f.rect.h<=c.atlasSize[1]);}assert.equal(hashes.size,c.frames.length);}
 }
});
test('70 PNGs retain V1 artwork unchanged, 42 main/impact PNGs are new, and sealed V1 packs stay unchanged',async()=>{
 let reused=0,fresh=0;for(const k of kits)for(const c of Object.values(k.clips)){if(!c.reusedFrom){fresh+=c.frames.length;continue;}for(const f of c.frames){assert.deepEqual(await readFile(new URL(`../r05-${k.family}-v2/${f.file}`,import.meta.url)),await readFile(new URL(`../r05-${k.family}-v1/${f.file}`,import.meta.url)));reused++;}}
 assert.equal(reused,70);assert.equal(fresh,42);
 for(const k of kits){const m=await json(`../releases/skill-packs/r05-${k.family}-1.0.0.manifest.json`);for(const e of m.files)assert.equal(hash(await readFile(new URL('../'+e.file,import.meta.url))),e.sha256,e.file);}
});
test('quiet hold timings match pose ends and one release survives a dropped render without actor growth',()=>{
 for(const k of kits){const c=k.clips[k.skill.character.clip],end=k.skill.events.find(e=>e.type==='character.end').frame;assert.equal(c.durations.reduce((a,b)=>a+b,0),end-1);assert.equal(new SequencePlayer(c).sample(at(end)),null);assert.equal(k.skill.character.bodyHeightMax,80);assert.equal(k.skill.authority.vfxAppliesDamage,false);assert.equal(k.skill.authority.vfxMovesActor,false);assert.equal(k.skill.spirit,undefined);const cursor=new FrameEventCursor(24,k.skill.events),events=cursor.advance(at(end));assert.equal(events.filter(e=>e.type==='release'||e.type==='movement.request').length,1);assert.deepEqual(cursor.advance(at(end)),[]);}
 assert.equal(s.skill.hitContract.swordCountVisual,1);
});
test('misses have no bolt or impact and boss changes only contact anchor, not image sizes',()=>{
 for(const k of [s,t]){const miss=makePlan(k.skill,k.clips,{hit:false}),normal=makePlan(k.skill,k.clips),boss=makePlan(k.skill,k.clips,{target:'boss'});assert.notDeepEqual(normal.hitPoint,boss.hitPoint);for(let f=1;f<=miss.endFrame;f++)assert.ok(!samplePresentation(k.skill,k.clips,miss,at(f)).items.some(r=>r.id==='thunder-bolt'||r.id==='thunder-impact'||r.id==='qi-impact'&&r.sample.clip.frames.length>4));const a=samplePresentation(k.skill,k.clips,normal,at(normal.confirmFrame+2)),b=samplePresentation(k.skill,k.clips,boss,at(boss.confirmFrame+2));assert.deepEqual(a.character.clip.frameSize,b.character.clip.frameSize);}
});
test('early host sword hit cannot respawn the single flight when the first render skips the release',()=>{
 const c=new Controller(s.skill,s.clips);c.beginCast({castId:'s',startedAt:0,foot:[300,300]});c.setProjectilePose({tip:[500,260]});assert.equal(c.confirmHit({castId:'s',hitId:'h',worldPosition:[520,255],confirmedAt:.2}),true);assert.equal(c.confirmHit({castId:'s',hitId:'h',worldPosition:[520,255],confirmedAt:.2}),false);assert.ok(!c.update(.8).some(r=>r.clip==='sword-flight'));c.dispose();
});
test('lightning waits for host hit, preserves contact position and has a finite local flash',()=>{
 const c=new Controller(t.skill,t.clips);c.beginCast({castId:'t',startedAt:0,foot:[300,300],targetFoot:[540,300]});assert.ok(!c.update(.8).some(r=>r.clip==='thunder-bolt'||r.clip==='thunder-impact'));assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[550,245],confirmedAt:1}),true);const draw=c.update(1),bolt=draw.find(r=>r.clip==='thunder-bolt'),light=draw.find(r=>r.kind==='localContrast');assert.deepEqual(bolt.point,[550,245]);assert.equal(bolt.layer,2);assert.equal(light.alpha,.18);assert.equal(c.confirmHit({castId:'t',hitId:'h',worldPosition:[550,245],confirmedAt:1}),false);assert.ok(!c.update(1+3/24).some(r=>r.kind==='localContrast'));c.dispose();
});
test('local lighting is bounded to 72x48 world px, leaves input feet untouched and never becomes fullscreen',()=>{
 const foot=[500,300],before=[...foot];for(let f=1;f<=48;f++){const row=intentLighting(t.skill,{age:at(f),targetFoot:foot});if(row){assert.deepEqual(row.radii,[72,48]);assert.ok(row.alpha<=.12);assert.deepEqual(row.point,before);assert.equal(row.layer,.25);}}assert.deepEqual(foot,before);assert.equal(intentLighting(s.skill,{age:at(12),targetFoot:foot}),null);assert.equal(t.skill.intent.fullScreenEffect,false);
});
test('wind movement and path echo require real host snapshots/arrival and never pull the actor back',()=>{
 const c=new Controller(w.skill,w.clips);c.beginCast({castId:'w',startedAt:0,foot:[300,300]});c.setActorFoot([430,304]);assert.ok(c.update(1.2).some(r=>r.clip==='wind-trail'));assert.ok(!c.update(1.2).some(r=>r.clip==='wind-return-curl'));assert.deepEqual(c.cast.foot,[430,304]);assert.equal(c.confirmArrival({castId:'w',worldFoot:[477,307],arrivedAt:1.3}),true);assert.equal(c.confirmArrival({castId:'w',worldFoot:[477,307],arrivedAt:1.3}),false);const rows=c.update(1.3);assert.ok(!rows.some(r=>r.clip==='wind-trail'));assert.deepEqual(rows.find(r=>r.clip==='wind-return-curl').point,[477,307]);assert.equal(rows.find(r=>r.clip==='wind-return-curl').layer,0);assert.deepEqual(c.cast.foot,[477,307]);c.dispose();
});
test('effects remain bounded at pool saturation, endCast removes local field and dispose releases slots',()=>{
 const c=new Controller(t.skill,t.clips,{capacity:1});c.beginCast({castId:'cap',startedAt:0,foot:[300,300]});c.confirmHit({castId:'cap',hitId:'h',worldPosition:[500,240],confirmedAt:.4});assert.equal(c.pool.slots.length,1);assert.equal(c.pool.activeCount,1);c.endCast();assert.ok(!c.update(.45).some(r=>r.kind==='localContrast'));c.dispose();assert.equal(c.pool.activeCount,0);
});
test('confirmed R05 V2 previews end with no transient sprite or local lighting record',()=>{
 for(const k of kits){const plan=makePlan(k.skill,k.clips);assert.deepEqual(samplePresentation(k.skill,k.clips,plan,at(plan.endFrame)).items,[]);}
});

test('V2 changes motion structure: fast sword, eased three-tick dash and fresh impacts',()=>{
 assert.equal(s.skill.projectile.worldSpeed,1056);assert.equal(s.skill.events.find(e=>e.type==='release').frame,11);
 const plan=makePlan(w.skill,w.clips),mid=movementPoint(w.skill,plan,at(11));assert.ok(mid[0]>plan.foot[0]+w.skill.preview.travelWorld/3);assert.equal(w.skill.preview.arrivalFrame-w.skill.preview.moveStartFrame,3);
 for(const k of kits)assert.ok(k.clips[k.family==='sword'?'qi-impact':k.family==='thunder'?'thunder-impact':'wind-return-curl'].source.includes(k.family==='sword'?'cleave':k.family==='thunder'?'verdict':'pressure'));
});
test('force feedback requires real hit/arrival, emits once, stays finite and never changes host feet',()=>{
 for(const k of kits){const notices=[],c=new Controller(k.skill,k.clips,{onFeedback:e=>notices.push(e)}),foot=[300,300];c.beginCast({castId:'f',startedAt:0,foot});assert.equal(c.feedback(1),null);
 const event=k.family==='wind'?{castId:'f',worldFoot:[460,300],arrivedAt:1}:{castId:'f',hitId:'h',worldPosition:[530,255],confirmedAt:1};const accept=k.family==='wind'?e=>c.confirmArrival(e):e=>c.confirmHit(e);assert.equal(accept(event),true);assert.equal(accept(event),false);assert.equal(notices.length,1);assert.equal(notices[0].visualOnly,true);assert.ok(c.feedback(1).offset.every(v=>Math.abs(v)<=2));assert.equal(c.feedback(1+4/24),null);assert.deepEqual(foot,[300,300]);c.endCast();assert.equal(c.feedback(1),null);c.dispose();}
});
