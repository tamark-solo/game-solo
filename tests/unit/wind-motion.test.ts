import test from 'node:test';
import assert from 'node:assert/strict';
import {R01Engine,R01,applyR01Movement,type CombatActor} from '../../shared/r01';
import {HANG_NHAC,hangNhacWalkable} from '../../shared/hang-nhac';
import {prepareWindPrediction} from '../../shared/skills/dash-motion';
import {CHAPTER_WORLD,chapterWalkable,chapterClearPath,applyChapterMovement} from '../../shared/chapter';

const dt=1/30;
function trajectory(dx:number,dy:number,x=HANG_NHAC.world.spawn.x,command={moveX:0,moveY:0,fast:false}){
 const a:CombatActor={id:'wind',x,y:HANG_NHAC.world.spawn.y,direction:'east',moving:false,connected:true,hp:100,mp:100,casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0};
 const engine=new R01Engine(10000,()=>{});engine.add(a);
 assert.equal(engine.cast(a.id,{id:'dash',skillId:'wind',aimX:dx,aimY:dy,targetId:''}).accepted,true);
 const samples=[{time:engine.now,actor:structuredClone(a)}];
 for(let i=0;i<28;i++){engine.prepare(dt);applyR01Movement(a,command,dt);engine.finish(dt);samples.push({time:engine.now,actor:structuredClone(a)});}
 return samples;
}

test('unacknowledged wind steps replay the confirmed cast interval in all eight directions',()=>{
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
  const samples=trajectory(dx,dy);
  for(const index of [0,3,5,8,10,12,16,20]){
   const predicted=structuredClone(samples[index].actor);
   for(let ahead=1;ahead<=Math.min(8,samples.length-index-1);ahead++){
    const previous=samples[index].time+(ahead-1)*dt*1000;
    prepareWindPrediction(predicted,{previous,now:previous+dt*1000},dt);
    applyR01Movement(predicted,{moveX:0,moveY:0},dt);
    const actual=samples[index+ahead].actor;
    assert.ok(Math.hypot(predicted.x-actual.x,predicted.y-actual.y)<1e-6,`direction ${dx},${dy}, snapshot ${index}, replay ${ahead}`);
   }
  }
 }
});

test('wind replay clips at owner collision and never bypasses a blocker',()=>{
 const samples=trajectory(1,0,1980),predicted=structuredClone(samples[6].actor);
 for(let i=7;i<samples.length;i++){
  prepareWindPrediction(predicted,{previous:samples[i-1].time,now:samples[i].time},dt);
  applyR01Movement(predicted,{moveX:0,moveY:0},dt);
  assert.ok(hangNhacWalkable(predicted));assert.ok(Math.abs(predicted.x-samples[i].actor.x)<1e-6);
 }
 assert.ok(predicted.x<2000);
});

test('Shift keeps wind range and resumes normal running after recovery without stale dash velocity',()=>{
 const command={moveX:1,moveY:0,fast:true},samples=trajectory(1,0,HANG_NHAC.world.spawn.x,command);
 const predicted=structuredClone(samples[9].actor);
 for(let i=10;i<samples.length;i++){
  prepareWindPrediction(predicted,{previous:samples[i-1].time,now:samples[i].time},dt);
  applyR01Movement(predicted,command,dt);
  assert.ok(Math.abs(predicted.x-samples[i].actor.x)<1e-6);
 }
 assert.equal(predicted.dashVX,0);assert.equal(predicted.motionLocked,false);
 assert.ok(Math.abs(samples[13].actor.x-HANG_NHAC.world.spawn.x-R01.wind.range)<.001);
});

test('confirmed old wind snapshot cannot replay beyond its end, even after a long ack gap',()=>{
 const samples=trajectory(1,0),predicted=structuredClone(samples[7].actor),start=predicted.x;
 for(let i=1;i<=64;i++){
  const previous=samples[7].time+(i-1)*dt*1000;
  prepareWindPrediction(predicted,{previous,now:previous+dt*1000},dt);applyR01Movement(predicted,{moveX:0,moveY:0},dt);
 }
 assert.ok(predicted.x>=start);assert.ok(Math.abs(predicted.x-HANG_NHAC.world.spawn.x-R01.wind.range)<.001);
 assert.equal(predicted.dashVX,0);
});

test('the private exterior uses the same bounded wind timeline with its own collision',()=>{
 const base=trajectory(1,0)[0].actor;
 const a={...base,...CHAPTER_WORLD.spawn,castId:'',castSkill:'',casts:0,nextWindAt:0};
 const engine=new R01Engine(10000,()=>{},undefined,{walkable:chapterWalkable,clearPath:chapterClearPath});engine.add(a);
 assert.equal(engine.cast(a.id,{id:'exterior-wind',skillId:'wind',aimX:1,aimY:0,targetId:''}).accepted,true);
 const samples=[{time:engine.now,actor:structuredClone(a)}];
 for(let i=0;i<24;i++){engine.prepare(dt);applyChapterMovement(a,{moveX:0,moveY:0},dt);engine.finish(dt);samples.push({time:engine.now,actor:structuredClone(a)});}
 const predicted=structuredClone(samples[6].actor);
 for(let i=7;i<samples.length;i++){
  prepareWindPrediction(predicted,{previous:samples[i-1].time,now:samples[i].time},dt);applyChapterMovement(predicted,{moveX:0,moveY:0},dt);
  assert.ok(chapterWalkable(predicted));assert.ok(Math.abs(predicted.x-samples[i].actor.x)<1e-6);
 }
});
