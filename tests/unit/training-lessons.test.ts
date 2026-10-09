import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { initialProfile } from '../../shared/profiles';
import { SECT_STATIONS, readSectCommand, sectCommandKey, validSectProgress, clearSectPath } from '../../shared/sect';
import { newAvoidAttempt, observeAvoidMotion, observeAvoidSkill, resolveAvoidAttempt, initialLessonProgress } from '../../shared/lesson-contracts';
import { performLessonCommand, creditLessonHit, type LessonRuntime } from '../../server/src/training-lessons';
import { advanceCultivation, sectView } from '../../server/src/sect-progress';
import { ProfileStore } from '../../server/src/profile-store';
import type { CombatActor, SkillEvent, TrainingTarget } from '../../shared/skills/contracts';

function fixture() {
  const profile=initialProfile('profile','account','CHR-WANG-LIN-CHIBI',10000);
  Object.assign(profile,{milestone:'M01',cultivation:100,mp:65});
  Object.assign(profile.sect,{hn01:true,hn02:true,cycleStep:4,level:1,foundation:'breathing'});
  const actor:CombatActor={...SECT_STATIONS[2],id:'actor',direction:'south',moving:false,connected:true,hp:100,mp:65,
    casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0};
  const start=performLessonCommand(profile,actor,{id:'start',action:'lesson_start',lesson:'arts'},10000,new Map(),undefined,false);
  assert.ok(start.candidate&&start.target&&start.start);
  return {profile:start.candidate,actor,target:start.target,runtime:start.start,targets:new Map([[start.target.id,start.target]])};
}
const hit=(targetId:string,skillId:'sword'|'thunder',at=11000):SkillEvent=>
  ({type:'hit',actorId:'actor',castId:'cast',skillId,at,x:2464,y:952,dx:0,dy:1,targetId,damage:30});

test('lesson wire strips client completion/rewards and retains legacy receipt keys',()=>{
  assert.deepEqual(readSectCommand({id:'x',action:'lesson_confirm',lesson:'arts',hn03:true,reward:9999}),{id:'x',action:'lesson_confirm',lesson:'arts'});
  assert.equal(readSectCommand({id:'x',action:'lesson_start',lesson:'farm'}),undefined);
  assert.equal(readSectCommand({id:'x',action:'basic_attack',targetId:'<script>'}),undefined);
  assert.equal(sectCommandKey({id:'x',action:'confirm_m01'}),'["confirm_m01",null,null,null,null]');
  assert.notEqual(sectCommandKey({id:'x',action:'basic_attack',targetId:'first'}),sectCommandKey({id:'x',action:'basic_attack',targetId:'second'}));
});

test('HN03 requires M01 and NPC proximity, creates an own target on unchanged walkable ground',()=>{
  const f=fixture();assert.equal(f.target.ownerId,f.actor.id);assert.ok(clearSectPath(f.actor,f.target));
  f.profile.sect.hn02=false;
  assert.equal(performLessonCommand(f.profile,f.actor,{id:'new',action:'lesson_start',lesson:'arts'},10000,f.targets,undefined,false).result.reason,'hn02');
  f.profile.sect.hn02=true;f.actor.x=1616;f.actor.y=992;
  assert.equal(performLessonCommand(f.profile,f.actor,{id:'new',action:'lesson_start',lesson:'arts'},10000,f.targets,undefined,false).result.reason,'distance');
  assert.deepEqual(f.profile.skills,['sword','thunder','wind']);
});

test('ordinary attack has no MP cost and validates target ownership, range, path, cast and persistent cooldown before damage',()=>{
  const f=fixture(),command={id:'basic',action:'basic_attack' as const,targetId:f.target.id};
  const outcome=performLessonCommand(f.profile,f.actor,command,10000,f.targets,f.runtime,false);
  assert.equal(outcome.result.ok,true);assert.equal(outcome.candidate?.mp,65);assert.equal(outcome.candidate?.sect.lessons.basic,true);
  assert.equal(outcome.candidate?.sect.lessons.nextBasicAt,10800);assert.equal(f.target.hp,100,'pure plan cannot damage before persistence');
  assert.equal(f.profile.sect.lessons.basic,false,'candidate cannot mutate its source');
  assert.equal(performLessonCommand(outcome.candidate!,f.actor,command,10799,f.targets,f.runtime,false).result.reason,'basic_cooldown');
  assert.equal(performLessonCommand(outcome.candidate!,f.actor,command,10800,f.targets,f.runtime,false).result.ok,true);
  f.target.ownerId='peer';assert.equal(performLessonCommand(f.profile,f.actor,command,11000,f.targets,f.runtime,false).result.reason,'target');
  f.target.ownerId=f.actor.id;f.actor.x-=160;assert.equal(performLessonCommand(f.profile,f.actor,command,11000,f.targets,f.runtime,false).result.reason,'basic_range');
  f.actor.castId='cast';assert.equal(performLessonCommand(f.profile,f.actor,command,11000,f.targets,f.runtime,false).result.reason,'combat');
});

test('only confirmed hits in the received lesson and on its unique target earn credit; old, free and missing hits do not',()=>{
  const f=fixture();
  assert.equal(creditLessonHit(f.profile,undefined,hit(f.target.id,'sword')),undefined);
  assert.equal(creditLessonHit(f.profile,f.runtime,hit('free-target','sword')),undefined);
  assert.equal(creditLessonHit(f.profile,f.runtime,hit(f.target.id,'sword',9999)),undefined);
  assert.equal(creditLessonHit(f.profile,f.runtime,{...hit(f.target.id,'sword'),type:'miss'}),undefined);
  const candidate=creditLessonHit(f.profile,f.runtime,hit(f.target.id,'sword'))!;
  assert.equal(candidate.sect.lessons.sword,true);assert.equal(f.profile.sect.lessons.sword,false);
  assert.equal(creditLessonHit(candidate,f.runtime,hit(f.target.id,'sword')),undefined);
  assert.equal(candidate.cultivation,100);assert.equal(candidate.sect.lessons.hn03,false);
});

test('HN03 and HN04 confirmation grant 80 once, preserve overflow and do not grant M02 or another skill',()=>{
  const f=fixture();
  const arts={id:'confirm',action:'lesson_confirm' as const,lesson:'arts' as const};
  assert.equal(performLessonCommand(f.profile,f.actor,arts,12000,f.targets,f.runtime,false).result.reason,'lesson_incomplete');
  Object.assign(f.profile.sect.lessons,{basic:true,sword:true,thunder:true});f.profile.cultivation=360;
  const a=performLessonCommand(f.profile,f.actor,arts,12000,f.targets,f.runtime,false).candidate!;
  assert.equal(a.cultivation,440);assert.equal(a.sect.lessons.active,'none');assert.equal(a.milestone,'M01');
  assert.equal(performLessonCommand(a,f.actor,arts,12000,f.targets,undefined,false).result.reason,'already_complete');
  Object.assign(a.sect.lessons,{walk:true,wind:true});
  const b=performLessonCommand(a,f.actor,{id:'confirm4',action:'lesson_confirm',lesson:'avoid'},12000,f.targets,undefined,false).candidate!;
  assert.equal(b.cultivation,520);assert.equal(b.sect.lessons.hn04,true);assert.equal(b.milestone,'M01');
  assert.deepEqual(b.skills,['sword','thunder','wind']);assert.ok(validSectProgress(b.sect,b));
  assert.equal(performLessonCommand(b,f.actor,{id:'new',action:'lesson_confirm',lesson:'avoid'},12000,f.targets,undefined,false).candidate,undefined);
});

test('lesson start/stop does not erase completed evidence and an in-flight warning cannot be replaced',()=>{
  const f=fixture();f.profile.sect.lessons.basic=true;
  const stop=performLessonCommand(f.profile,f.actor,{id:'stop',action:'lesson_stop'},10000,f.targets,f.runtime,false);
  assert.equal(stop.candidate?.sect.lessons.basic,true);assert.equal(stop.candidate?.sect.lessons.active,'none');
  assert.equal(performLessonCommand(f.profile,f.actor,{id:'warn',action:'lesson_start',lesson:'avoid'},10000,f.targets,undefined,false).result.reason,'hn03');
  Object.assign(f.profile.sect.lessons,{hn03:true,basic:true,sword:true,thunder:true});
  const started=performLessonCommand(f.profile,f.actor,{id:'warn',action:'lesson_start',lesson:'avoid'},10000,f.targets,undefined,false);
  assert.equal(started.result.ok,true);assert.equal(started.start?.kind,'avoid');
  assert.equal(performLessonCommand(f.profile,f.actor,{id:'replace',action:'lesson_start',lesson:'avoid'},11000,f.targets,started.start,false).result.reason,'lesson_running');
});

test('walk avoidance requires ordinary travel and being outside the circle at the server deadline, not just an earlier escape',()=>{
  const p={x:2464,y:880},attempt=newAvoidAttempt(p,'walk',10000);
  for(let i=1;i<=20;i++)observeAvoidMotion(attempt,{x:p.x,y:p.y+i*2.667},true,false,1/30);
  const end={x:p.x,y:p.y+54};
  assert.equal(resolveAvoidAttempt(attempt,end,11499,true,true),'pending');
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'passed');
  assert.equal(resolveAvoidAttempt(attempt,p,11500,true,true),'failed');
  assert.equal(resolveAvoidAttempt(attempt,end,11500,false,true),'failed');
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,false),'failed');
  observeAvoidSkill(attempt,{type:'cast',skillId:'wind',castId:'wind',at:11000});
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'failed','dash cannot satisfy the walking lesson');
});

test('wind avoidance requires matching confirmed cast and arrival inside the warning; walking or old arrival cannot substitute',()=>{
  const p={x:2464,y:880},attempt=newAvoidAttempt(p,'wind',10000),end={x:p.x+160,y:p.y};
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'failed');
  observeAvoidSkill(attempt,{type:'arrival',skillId:'wind',castId:'old',at:10500});
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'failed');
  observeAvoidSkill(attempt,{type:'cast',skillId:'wind',castId:'new',at:10500});
  observeAvoidSkill(attempt,{type:'arrival',skillId:'wind',castId:'new',at:11600});
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'failed');
  observeAvoidSkill(attempt,{type:'arrival',skillId:'wind',castId:'new',at:10800});
  assert.equal(resolveAvoidAttempt(attempt,end,11500,true,true),'passed');
  assert.equal(resolveAvoidAttempt(attempt,p,11500,true,true),'failed','Phong supplies no invulnerability');
});

test('the selected cultivation activity pauses throughout lessons without applying offline or cutting mission overflow',()=>{
  const f=fixture();f.profile.sect.activity=true;
  for(let i=0;i<90;i++)advanceCultivation(f.profile,f.actor,1/30,12000);
  assert.equal(f.profile.cultivation,100);assert.equal(sectView(f.profile,f.actor,12000,0).activityStatus,'paused');
  f.profile.sect.lessons.active='none';
  for(let i=0;i<30;i++)advanceCultivation(f.profile,f.actor,1/30,13000);
  assert.equal(f.profile.cultivation,102);
});

test('optional lesson extension upgrades existing schema 2 JSON without losing resources, identity, quests or receipts',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-lessons-')),path=join(folder,'profiles.sqlite'),store=new ProfileStore(path);
  try {
    const guest=store.createGuest(),p=store.get(guest.accountId,'CHR-WANG-LIN-CHIBI');
    p.mp=47;p.casts=3;store.commitCast(p,'old-cast',{accepted:true});
    const db=new DatabaseSync(path),old={...p,sect:{...p.sect}};
    delete (old.sect as Partial<typeof old.sect>).lessons;
    db.prepare('UPDATE profiles SET data=? WHERE id=?').run(JSON.stringify(old),p.id);db.close();
    const upgraded=store.get(guest.accountId,p.avatarId);
    assert.equal(upgraded.schema,2);assert.equal(upgraded.id,p.id);assert.equal(upgraded.mp,47);assert.equal(upgraded.casts,3);
    assert.deepEqual(upgraded.sect.lessons,initialLessonProgress());assert.deepEqual(store.receipt(p.id,'old-cast'),{accepted:true});
    const bad={...upgraded,sect:{...upgraded.sect,lessons:{...upgraded.sect.lessons,hn04:true}}};
    assert.equal(validSectProgress(bad.sect,bad),false);
    store.save(upgraded);assert.deepEqual(store.get(guest.accountId,p.avatarId).sect.lessons,initialLessonProgress());
  } finally {store.close();assert.equal(dirname(resolve(folder)),resolve(tmpdir()));rmSync(folder,{recursive:true});}
});
