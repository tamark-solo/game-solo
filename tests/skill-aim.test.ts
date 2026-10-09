import test from 'node:test';
import assert from 'node:assert/strict';
import { SkillAim } from '../client/src/skills/aim';
import { facingAim, normalizedAim } from '../shared/skills/aim';
import { SkillEngine } from '../shared/skills/engine';
import type { CombatActor, CastCommand, SkillEvent } from '../shared/skills/contracts';
import { commandKey, readCastCommand } from '../shared/skills/commands';

const directions={north:{x:0,y:-1},south:{x:0,y:1},west:{x:-1,y:0},east:{x:1,y:0}};
const actor=():CombatActor=>({id:'a',x:100,y:100,direction:'south',moving:false,connected:true,hp:100,mp:100,casts:0,practiceHits:0,
  nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0});
const command=(skillId:CastCommand['skillId']):CastCommand=>({id:'cast',skillId,aimX:1,aimY:0,targetId:'target'});
function fixture(){const events:SkillEvent[]=[],a=actor(),engine=new SkillEngine(1000,e=>events.push(e),undefined,{walkable:()=>true,clearPath:()=>true});engine.add(a);return{a,engine,events};}

test('optional input boundary is bounded, sanitized and part of new receipts without changing legacy keys',()=>{
  const legacy=command('sword');assert.equal(commandKey(legacy),JSON.stringify(['sword',1,0,'target']));assert.deepEqual(readCastCommand(legacy),legacy);
  const sequenced={...legacy,inputSeq:42};assert.deepEqual(readCastCommand(sequenced),sequenced);assert.notEqual(commandKey(sequenced),commandKey(legacy));
  for(const value of [0,-1,1.5,NaN,Infinity,'2',0x80000000])assert.equal(readCastCommand({...legacy,inputSeq:value}),undefined);
});

test('standing aim follows loaded facing, with independent values and no east default',()=>{
  const aim=new SkillAim();for(const [direction,vector] of Object.entries(directions)){assert.deepEqual(aim.value(direction),vector);assert.deepEqual(facingAim(direction),vector);}
  const copy=aim.value('north');copy.y=1;assert.deepEqual(aim.value('north'),directions.north);
});
test('movement updates all eight directions and stopping preserves the last intent',()=>{
  for(const vector of [...Object.values(directions),{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}]){
    const aim=new SkillAim();aim.observeMovement(vector);assert.deepEqual(aim.value('south'),normalizedAim(vector));
    aim.observeMovement({x:0,y:0});assert.deepEqual(aim.value('south'),normalizedAim(vector));assert.equal(aim.source,'movement');
  }
});
test('pointer overrides held movement until a new movement intent, including release and repress',()=>{
  const aim=new SkillAim();aim.observeMovement(directions.east);aim.point(directions.north);
  for(let i=0;i<60;i++)aim.observeMovement(directions.east);
  assert.deepEqual(aim.value('east'),directions.north);assert.equal(aim.source,'pointer');
  aim.observeMovement({x:0,y:0});assert.deepEqual(aim.value('east'),directions.north);
  aim.observeMovement(directions.east);assert.deepEqual(aim.value('south'),directions.east);
  aim.point(directions.north);aim.observeMovement(directions.west);assert.deepEqual(aim.value('south'),directions.west);
});
test('invalid/zero pointer input is ignored; reset follows the new avatar facing',()=>{
  const aim=new SkillAim();aim.point(directions.west);
  for(const input of [{x:0,y:0},{x:NaN,y:1},{x:Infinity,y:0}]){aim.point(input);aim.observeMovement(input);assert.deepEqual(aim.value('south'),directions.west);}
  aim.reset();assert.deepEqual(aim.value('north'),directions.north);assert.equal(aim.source,'facing');
});
test('thunder faces the selected target in all directions regardless of requested aim, then freezes the cast',()=>{
  for(const [direction,vector] of Object.entries(directions)){
    const {a,engine,events}=fixture();const target={id:'target',ownerId:a.id,x:a.x+vector.x*80,y:a.y+vector.y*80,hp:100,maxHp:100,radius:16};engine.targets.set(target.id,target);
    assert.equal(engine.cast(a.id,command('thunder')).accepted,true);assert.equal(a.direction,direction);
    assert.equal(a.castAimX,vector.x);assert.equal(a.castAimY,vector.y);assert.equal(events[0].dx,vector.x);assert.equal(events[0].dy,vector.y);
    target.x=a.x+40;target.y=a.y+40;engine.prepare(.1);assert.equal(a.castAimX,vector.x);assert.equal(a.castAimY,vector.y);
  }
});
test('invalid target cannot turn, charge or animate; coincident target retains a finite requested direction',()=>{
  const {a,engine,events}=fixture();assert.equal(engine.cast(a.id,command('thunder')).reason,'target');assert.equal(a.direction,'south');assert.equal(a.mp,100);assert.equal(events.length,0);
  engine.targets.set('target',{id:'target',ownerId:a.id,x:a.x,y:a.y,hp:100,maxHp:100,radius:16});
  assert.equal(engine.cast(a.id,{...command('thunder'),id:'coincident'}).accepted,true);assert.equal(a.castAimX,1);assert.equal(a.castAimY,0);
});
test('sword and wind follow requested direction independently of a selected target; malformed vector costs nothing',()=>{
  for(const skill of ['sword','wind'] as const){const{a,engine}=fixture();engine.targets.set('target',{id:'target',ownerId:a.id,x:a.x-80,y:a.y,hp:100,maxHp:100,radius:16});
    assert.equal(engine.cast(a.id,{...command(skill),aimX:0,aimY:-1}).accepted,true);assert.equal(a.direction,'north');assert.equal(a.castAimX,0);assert.equal(a.castAimY,-1);}
  const{a,engine}=fixture();assert.equal(engine.cast(a.id,{...command('sword'),aimX:0}).reason,'aim');assert.equal(a.mp,100);assert.equal(a.casts,0);
});
