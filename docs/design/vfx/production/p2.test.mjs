import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {P2VfxController} from './p2-controller.mjs';
import {makePlan,samplePresentation,movementPoint} from './p2-model.mjs';
import {frameSeconds,SequencePlayer} from '../frame-by-frame-r01/sequence-system.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const thunder=await read('../r01-thunder-v1/skill.json'),wind=await read('../r01-wind-v1/skill.json');
const tc=(await read('../r01-thunder-v1/clips.json')).clips,wc=(await read('../r01-wind-v1/clips.json')).clips;
test('42 thunder and 36 wind RGBA source frames, distinct within every sequence, atlas rects fit',async()=>{
 for(const [family,clips,count]of[['thunder',tc,42],['wind',wc,36]]){
  assert.equal(Object.values(clips).reduce((n,c)=>n+c.frames.length,0),count);
  for(const clip of Object.values(clips)){
   const hashes=new Set();for(const frame of clip.frames){const png=await readFile(new URL(`../r01-${family}-v1/${frame.file}`,import.meta.url));assert.equal(png.readUInt32BE(16),clip.frameSize[0]);assert.equal(png.readUInt32BE(20),clip.frameSize[1]);assert.equal(png[25],6);hashes.add(createHash('sha256').update(png).digest('hex'));assert.ok(frame.rect.x+frame.rect.w<=clip.atlasSize[0]);assert.ok(frame.rect.y+frame.rect.h<=clip.atlasSize[1]);}assert.equal(hashes.size,clip.frames.length);
  }
 }
});
test('authored character.end matches holds, and start/end sampling is stable',()=>{for(const [s,clips]of[[thunder,tc],[wind,wc]]){const player=new SequencePlayer(clips[s.character.clip]),end=s.events.find(e=>e.type==='character.end').frame;assert.equal(player.length,end-1);assert.equal(player.sample((end-2)/24).index,11);assert.equal(player.sample((end-1)/24),null);assert.equal(s.authority.vfxAppliesDamage,false);assert.equal(s.authority.vfxMovesActor,false);}});
test('thunder miss has no bolt or impact; delay shifts only confirmation-dependent tracks',()=>{
 const miss=makePlan(thunder,{hit:false});for(let frame=1;frame<=30;frame++)assert.ok(!samplePresentation(thunder,tc,miss,frameSeconds(frame,24)).items.some(i=>i.id==='thunder-bolt'||i.id==='thunder-impact'));
 const delayed=makePlan(thunder,{delay:12});assert.equal(delayed.confirmFrame,25);assert.equal(delayed.contactFrame,27);assert.ok(!samplePresentation(thunder,tc,delayed,frameSeconds(24,24)).items.some(i=>i.id==='thunder-bolt'));assert.ok(samplePresentation(thunder,tc,delayed,frameSeconds(27,24)).items.some(i=>i.id==='thunder-impact'));
});
test('boss changes hit anchor and body profile, retains same FX frame size',()=>{const pvp=makePlan(thunder,{target:'pvp'}),boss=makePlan(thunder,{target:'boss'});assert.notDeepEqual(pvp.hitPoint,boss.hitPoint);const a=samplePresentation(thunder,tc,pvp,14/24),b=samplePresentation(thunder,tc,boss,14/24);assert.deepEqual(a.items.find(i=>i.id==='thunder-impact').sample.clip.frameSize,b.items.find(i=>i.id==='thunder-impact').sample.clip.frameSize);});
test('wind preview path clamps, is independent of target range, and arrival FX starts at foot',()=>{const p=makePlan(wind,{distance:400});assert.deepEqual(movementPoint(wind,p,0),[360,386]);assert.deepEqual(movementPoint(wind,p,100),[520,386]);const state=samplePresentation(wind,wc,p,10/24);assert.deepEqual(state.items.find(i=>i.id==='wind-arrival').point,[520,386]);assert.ok(!state.items.some(i=>i.id==='wind-trail'));});
test('host thunder requires explicit hit, dedupes once, scheduled flash respects lead frames',()=>{
 const events=[],c=new P2VfxController(thunder,tc,{onEvent:e=>events.push(e)});c.beginCast({castId:'a',startedAt:10,foot:[360,386],targetFoot:[620,386]});assert.deepEqual(c.update(9),[]);assert.ok(!c.update(10.8).some(i=>i.clip==='thunder-impact'));assert.equal(c.confirmHit({castId:'wrong',hitId:'1',worldPosition:[600,340],confirmedAt:11}),false);assert.equal(c.confirmHit({castId:'a',hitId:'1',worldPosition:[600,340],confirmedAt:11}),true);assert.equal(c.confirmHit({castId:'a',hitId:'1',worldPosition:[600,340],confirmedAt:11}),false);assert.ok(c.update(11).some(i=>i.clip==='thunder-bolt'));assert.ok(!c.update(11).some(i=>i.clip==='thunder-impact'));assert.deepEqual(c.update(11+2/24).find(i=>i.clip==='thunder-impact').point,[600,340]);assert.ok(events.every(e=>e.type.startsWith('visual.')));c.endCast();c.update(12);assert.equal(c.pool.activeCount,0);
});
test('wind adapter follows host position, never arrives from authoring clock alone',()=>{
 const c=new P2VfxController(wind,wc);c.beginCast({castId:'b',startedAt:0,foot:[300,300]});c.setActorFoot([330,304]);assert.deepEqual(c.update(.2).find(i=>i.clip==='wanglin-wind-east').point,[330,304]);assert.ok(c.update(.8).some(i=>i.clip==='wind-trail'));assert.ok(!c.update(.8).some(i=>i.clip==='wind-arrival'));assert.equal(c.confirmArrival({castId:'b',worldFoot:[410,306],arrivedAt:1}),true);assert.equal(c.confirmArrival({castId:'b',worldFoot:[410,306],arrivedAt:1}),false);const draw=c.update(1);assert.ok(!draw.some(i=>i.clip==='wind-trail'));assert.deepEqual(draw.find(i=>i.clip==='wind-arrival').point,[410,306]);c.dispose();assert.equal(c.pool.activeCount,0);
});
test('controller bounded pool rejects excess effects without unbounded allocations',()=>{const c=new P2VfxController(thunder,tc,{capacity:2});for(let i=0;i<1000;i++)c.spawn('thunder-impact',0,[0,0]);assert.equal(c.pool.slots.length,2);c.update(1);assert.equal(c.pool.activeCount,0);});
test('sword approved source remains byte-identical to frozen release',async()=>{const release=await read('../releases/kiem-khi-r01-1.0.0/manifest.json');for(const entry of release.files){const bytes=await readFile(new URL('../frame-by-frame-r01/'+entry.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.file);}});
