import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SequencePlayer,FrameEventCursor,VfxPool,AtlasManager,sortLayers} from './sequence-system.mjs';
import {makePreviewPlan,projectileTip} from './preview-model.mjs';
import {SkillVfxController} from './skill-vfx-controller.mjs';
const data=JSON.parse(await readFile(new URL('./clips.json',import.meta.url))),skill=JSON.parse(await readFile(new URL('./skill.json',import.meta.url)));
test('authored frame holds and sequence lifetime do not depend on display FPS',()=>{
 const player=new SequencePlayer(data.clips['wanglin-cast-east']);
 assert.equal(player.length,16);assert.equal(player.sample(4/24).index,4);assert.equal(player.sample(5/24).index,4);assert.equal(player.sample(7/24).index,6);assert.equal(player.sample(8/24).index,6);assert.equal(player.sample(9/24).index,7);
 assert.equal(player.sample(16/24),null);assert.equal(player.sample(-.01),null);
});
test('projectile sequence loops through genuinely separate frames',()=>{
 const player=new SequencePlayer(data.clips['sword-projectile']);assert.equal(player.sample(6/24).index,0);assert.equal(player.sample(11/24).index,5);
});
test('a dropped render interval still emits each crossed event exactly once',()=>{
 const events=new FrameEventCursor(24,skill.events);
 assert.deepEqual(events.advance(0).map(e=>e.type),['cast.start']);
 assert.deepEqual(events.advance(15/24).map(e=>e.type),['release','recovery.start']);
 assert.equal(events.advance(15/24).length,0);assert.deepEqual(events.advance(17/24).map(e=>e.type),['character.end']);
 assert.throws(()=>events.advance(0));events.seek(7);assert.equal(events.advance(6/24).length,0);events.reset();assert.equal(events.advance(0).length,1);
});
test('impact follows simulated collision/confirmation, changes with distance and delay, and disappears on miss',()=>{
 const options={target:'pvp',distance:260,hit:true,delay:0};
 const near=makePreviewPlan(skill,data.clips,options),far=makePreviewPlan(skill,data.clips,{...options,distance:400});
 assert.equal(near.releaseFrame,7);assert.equal(near.confirmFrame,13);assert.ok(far.confirmFrame>near.confirmFrame);
 const delayed=makePreviewPlan(skill,data.clips,{...options,delay:12});assert.equal(delayed.confirmFrame,near.confirmFrame+12);
 const miss=makePreviewPlan(skill,data.clips,{...options,hit:false});assert.ok(!miss.events.some(e=>e.type.includes('hitConfirmed')));assert.ok(miss.events.some(e=>e.type.includes('expired')));
 const tip=projectileTip(near,near.contactTime);assert.ok(tip[0]>=near.hitPoint[0]);
});
test('Boss changes hit anchor while using the same sequence and sizes',()=>{
 const options={target:'pvp',distance:260,hit:true,delay:0};
 const pvp=makePreviewPlan(skill,data.clips,options),boss=makePreviewPlan(skill,data.clips,{...options,target:'boss'});
 assert.ok(boss.hitPoint[1]<pvp.hitPoint[1]);assert.equal(boss.track.clip,pvp.track.clip);assert.equal(boss.track.initialTipAhead,pvp.track.initialTipAhead);
});
test('pool reuses slots and remains bounded across repeated casts',()=>{
 const pool=new VfxPool(3);for(let i=0;i<1000;i++){assert.ok(pool.acquire({}));assert.ok(pool.acquire({}));assert.ok(pool.acquire({}));assert.equal(pool.acquire({}),null);pool.clear();}
 assert.equal(pool.activeCount,0);assert.equal(pool.slots.length,3);
});
test('atlas cache coalesces requests and retries failures',async()=>{
 let count=0;const manager=new AtlasManager(async url=>{count++;if(count===1)throw new Error('test failure');return {url};});
 await assert.rejects(manager.load('a'));await Promise.all([manager.load('a'),manager.load('a')]);assert.equal(count,2);
});
test('layer sorting is stable by layer, feet and insertion order',()=>{
 const items=[{layer:3,sortY:1,order:0},{layer:1,sortY:10,order:2},{layer:1,sortY:10,order:1}];
 assert.deepEqual(sortLayers(items).map(i=>i.order),[1,2,0]);assert.equal(items[0].layer,3);
});
test('produced clips have all source PNGs, uniform frame canvases, valid atlas rects and matching holds',async()=>{
 assert.equal(Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),36);
 for(const clip of Object.values(data.clips)){
  assert.equal(clip.frames.length,clip.durations.length);assert.ok(clip.commonScale>0);
  for(const frame of clip.frames){assert.equal(frame.rect.w,clip.frameSize[0]);assert.equal(frame.rect.h,clip.frameSize[1]);assert.ok(frame.rect.x+frame.rect.w<=clip.atlasSize[0]);assert.ok(frame.rect.y+frame.rect.h<=clip.atlasSize[1]);assert.ok((await readFile(new URL(frame.file,import.meta.url))).length>0);}
 }
});
test('host adapter follows projectile snapshots and deduplicates confirmed hits',()=>{
 const events=[],vfx=new SkillVfxController(skill,data.clips,{onEvent:e=>events.push(e)});
 assert.equal(vfx.beginCast({castId:'c',startedAt:10,foot:[360,386],direction:[1,0]}),true);
 vfx.update(10);vfx.update(10.3);vfx.setProjectilePose('c',{tip:[570,344],direction:[1,0]});
 assert.deepEqual(vfx.update(10.4).find(s=>s.mode==='projectile').point,[570,344]);
 const hit={castId:'c',hitId:'h',targetId:'p',worldPosition:[614,344],incomingDirection:[1,0],confirmedAt:10.5};
 assert.equal(vfx.confirmHit(hit),true);assert.equal(vfx.confirmHit(hit),false);
 const drawn=vfx.update(10.5);assert.equal(drawn.filter(s=>s.clip==='qi-impact').length,1);assert.ok(!drawn.some(s=>s.mode==='projectile'));
 assert.equal(events.filter(e=>e.type==='visual.hit').length,1);assert.ok(events.every(e=>!e.type.includes('damage')));
 vfx.endCast('c');assert.ok(vfx.update(10.6).some(s=>s.clip==='qi-impact'));assert.equal(vfx.update(11).length,0);assert.equal(vfx.pool.activeCount,0);
});
test('a hit arriving before a delayed render cannot respawn the already-ended projectile',()=>{
 const events=[],vfx=new SkillVfxController(skill,data.clips,{onEvent:event=>events.push(event)});vfx.beginCast({castId:'c',startedAt:0,foot:[0,0],direction:[1,0]});
 vfx.confirmHit({castId:'c',hitId:1,targetId:'p',worldPosition:[200,0],incomingDirection:[1,0],confirmedAt:.3});
 const drawn=vfx.update(.4);assert.ok(drawn.some(s=>s.clip==='qi-impact'));assert.ok(!drawn.some(s=>s.mode==='projectile'));assert.ok(!events.some(event=>event.type==='visual.release'));vfx.dispose();assert.equal(vfx.pool.activeCount,0);
});
