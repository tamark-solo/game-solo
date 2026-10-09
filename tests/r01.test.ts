import test from 'node:test';
import assert from 'node:assert/strict';
import { R01Engine, R01, readCastCommand, applyR01Movement, type CombatActor, type CastCommand, type SkillEvent } from '../shared/r01';
import { HANG_NHAC, hangNhacWalkable } from '../shared/hang-nhac';

const actor=(id='a'):CombatActor=>({id,...HANG_NHAC.world.spawn,direction:'east',moving:false,connected:true,hp:100,mp:100,casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0});
const command=(id:string,skillId:CastCommand['skillId']='sword',targetId=''):CastCommand=>({id,skillId,aimX:1,aimY:0,targetId});
function fixture(commit?:ConstructorParameters<typeof R01Engine>[2]){const events:SkillEvent[]=[],a=actor(),engine=new R01Engine(10000,e=>events.push(e),commit);engine.add(a);return{a,engine,events};}
function ticks(engine:R01Engine,count:number){for(let i=0;i<count;i++){engine.prepare(1/30);for(const a of engine.actors.values())if(a.connected)applyR01Movement(a,{moveX:0,moveY:0},1/30);engine.finish(1/30);}}
test('R01 wire input rejects invalid aim, unknown skills and executable request identifiers',()=>{
  const valid=command('valid');assert.deepEqual(readCastCommand(valid),valid);
  for(const bad of [{...valid,aimX:NaN},{...valid,aimX:2},{...valid,aimX:0},{...valid,skillId:'r02'},{...valid,id:'<script>'}])assert.equal(readCastCommand(bad),undefined);
});
test('accepted casts spend once; retries do not charge or produce another hit',()=>{
  const{a,engine,events}=fixture();const target=engine.practice(a.id,{x:1,y:0})!;
  const cmd=command('once','sword',target.id);assert.equal(engine.cast(a.id,cmd).accepted,true);assert.equal(a.mp,90);
  assert.equal(engine.cast(a.id,cmd).duplicate,true);assert.equal(a.casts,1);ticks(engine,30);
  assert.equal(target.hp,70);assert.equal(a.practiceHits,1);assert.equal(events.filter(e=>e.type==='hit').length,1);
  assert.equal(engine.cast(a.id,{...cmd,skillId:'wind'}).reason,'request_reused');assert.equal(a.casts,1);
});
test('sword starts at the ground origin and hits a close target before a 100px preview offset',()=>{
  const{a,engine}=fixture();const target={id:'close',ownerId:a.id,x:a.x+42,y:a.y,hp:100,maxHp:100,radius:16};engine.targets.set(target.id,target);
  engine.cast(a.id,command('close'));ticks(engine,12);assert.equal(target.hp,70);
});
test('new movement cancels an unreleased sword with cost retained; held input does not cancel itself',()=>{
  const{a,engine,events}=fixture();engine.cast(a.id,command('held'),{x:1,y:0});engine.movement(a.id,{x:1,y:0});assert.ok(a.castId);
  engine.movement(a.id,{x:0,y:0});engine.movement(a.id,{x:1,y:0});assert.equal(a.castId,'');assert.equal(a.mp,90);ticks(engine,30);assert.equal(events.filter(e=>e.type==='release').length,0);
  assert.equal(engine.cast(a.id,command('too-soon')).reason,'cooldown');
});
test('thunder only damages the selected own target, misses a moved snapshot and never hits another player',()=>{
  const{a,engine,events}=fixture();const b=actor('b');engine.add(b);
  const target=engine.practice(a.id,{x:1,y:0})!;assert.equal(engine.cast(a.id,command('player','thunder',b.id)).reason,'target');assert.equal(a.mp,100);
  engine.cast(a.id,command('moved','thunder',target.id));ticks(engine,11);target.x+=30;ticks(engine,12);assert.equal(target.hp,100);assert.equal(b.hp,100);assert.ok(events.some(e=>e.type==='miss'));assert.ok(!events.some(e=>e.type==='hit'));
  ticks(engine,140);const t=engine.practice(a.id,{x:1,y:0})!;engine.cast(a.id,command('hit','thunder',t.id));ticks(engine,23);assert.equal(t.hp,55);assert.equal(a.practiceHits,1);
});
test('wind travels 160px once, obeys owner blockers and reports actual arrival',()=>{
  const{a,engine,events}=fixture();const origin=a.x;engine.cast(a.id,command('dash','wind'));ticks(engine,20);
  assert.ok(Math.abs(a.x-origin-160)<.01);assert.ok(hangNhacWalkable(a));assert.equal(events.filter(e=>e.type==='arrival').length,1);assert.equal(a.hp,100);
  const wall=fixture();wall.a.x=1980;wall.engine.cast(wall.a.id,command('wall','wind'));ticks(wall.engine,25);
  assert.ok(wall.a.x<2000&&hangNhacWalkable(wall.a));assert.ok(wall.a.x>1980);assert.equal(wall.events.filter(e=>e.type==='arrival').length,1);
  const blocked=fixture();blocked.a.x=1990;assert.ok(hangNhacWalkable(blocked.a));assert.equal(blocked.engine.cast(blocked.a.id,command('blocked','wind')).reason,'blocked');assert.equal(blocked.a.mp,100);
});
test('sword ends at a wall without fake confirmed impact or target damage',()=>{
  const{a,engine,events}=fixture();a.x=1980;engine.cast(a.id,command('wall'));ticks(engine,40);assert.equal(engine.projectiles.size,0);assert.ok(events.some(e=>e.type==='miss'));assert.ok(!events.some(e=>e.type==='hit'));
});
test('save failure rolls back acceptance; no insufficient resource cast, extra regen or offline catchup',()=>{
  const failure=fixture(()=>{throw new Error('disk');});assert.equal(failure.engine.cast('a',command('fail')).reason,'save');assert.equal(failure.a.mp,100);assert.equal(failure.a.casts,0);assert.equal(failure.events.length,0);
  const{a,engine}=fixture();a.mp=5;assert.equal(engine.cast('a',command('empty')).reason,'resource');assert.equal(a.mp,5);
  a.lastSpentAt=engine.now;ticks(engine,30);assert.equal(a.mp,5);ticks(engine,60);assert.ok(a.mp>16&&a.mp<18);
  a.connected=false;const mp=a.mp;ticks(engine,300);assert.equal(a.mp,mp);a.connected=true;ticks(engine,1);assert.ok(Math.abs(a.mp-mp-.4)<.001);
});
