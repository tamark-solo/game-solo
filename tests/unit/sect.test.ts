import test from 'node:test';
import assert from 'node:assert/strict';
import { initialProfile, type AvatarId } from '../../shared/profiles';
import { HANG_NHAC, HANG_NHAC_AVATARS, hangNhacWalkable } from '../../shared/hang-nhac';
import { SECT_STATIONS, clearSectPath, guideText, nearStation, progressionLabel, readSectCommand, validSectProgress, type SectCommand } from '../../shared/sect';
import { sectRoute } from '../../shared/sect-route';
import { advanceCultivation, performSectCommand, sectView } from '../../server/src/sect-progress';
import type { CombatActor } from '../../shared/r01';

function fixture(avatarId:AvatarId=HANG_NHAC_AVATARS[0]){
  let profile=initialProfile('profile','account',avatarId,10000);
  const actor:CombatActor={...SECT_STATIONS[0],id:'actor',direction:'south',moving:false,connected:true,hp:100,mp:70,casts:0,practiceHits:0,
    nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0};
  const act=(action:SectCommand['action'],extra:Partial<SectCommand>={},now=10000,readyAt=0)=>{
    const outcome=performSectCommand(profile,actor,{id:'request',action,...extra},now,readyAt);
    if(outcome.candidate)profile=outcome.candidate;return outcome;
  };
  return {actor,act,profile:()=>profile};
}
test('sect wire ignores client rewards and rejects invented actions/phases/answers',()=>{
  assert.equal(readSectCommand({id:'x',action:'finish_hn12',reward:9999}),undefined);
  assert.equal(readSectCommand({id:'x',action:'cycle_step',step:3}),undefined);
  assert.equal(readSectCommand({id:'x',action:'understanding',answer:'give_me_100'}),undefined);
  assert.deepEqual(readSectCommand({id:'x',action:'confirm_m01',reward:9999,avatarId:'hacked'}),{id:'x',action:'confirm_m01'});
});
test('all four NPC interaction points and hinted paths use reachable owner ground without collider edits',()=>{
  assert.equal(HANG_NHAC.blockers.length,9);
  for(const station of SECT_STATIONS){
    assert.ok(hangNhacWalkable(station,24));const route=sectRoute(HANG_NHAC.world.spawn,station);assert.ok(route,station.name);
    assert.deepEqual(route[0],HANG_NHAC.world.spawn);assert.equal(route.at(-1)?.x,station.x);
    route.slice(1).forEach((p,i)=>assert.ok(clearSectPath(route[i]!,p)));
    assert.ok(nearStation(station,station.id));
  }
  assert.equal(nearStation(HANG_NHAC.world.spawn,'cultivation'),false);
  const blocked=HANG_NHAC.blockers[0]!.points[0]!;assert.equal(sectRoute(blocked,SECT_STATIONS[0]),undefined);
});
test('HN01 requires real proximity and grants two supplies once, with no R01 regrant',()=>{
  const f=fixture();f.actor.x=1616;f.actor.y=992;assert.equal(f.act('accept_intro').result.reason,'distance');
  Object.assign(f.actor,SECT_STATIONS[0]);assert.equal(f.act('accept_intro').result.ok,true);
  assert.equal(f.profile().sect.supplies,2);assert.equal(f.profile().cultivation,0);
  assert.equal(f.act('accept_intro').result.reason,'already_complete');assert.equal(f.profile().sect.supplies,2);
  assert.deepEqual(f.profile().skills,['sword','thunder','wind']);
});
test('three timed, explicit cycle phases and a correct understanding answer precede one-time M01',()=>{
  const f=fixture();f.act('accept_intro');Object.assign(f.actor,SECT_STATIONS[1]);
  assert.equal(f.act('confirm_m01').result.reason,'understanding');f.act('cycle_start');
  for(let step=0;step<3;step++){
    assert.equal(f.act('cycle_step',{step},10000,13000).result.reason,'settling');
    f.actor.moving=true;assert.equal(f.act('cycle_step',{step},13000,13000).result.reason,'settling');f.actor.moving=false;
    assert.equal(f.act('cycle_step',{step},13000,13000).result.ok,true);
    assert.equal(f.act('cycle_step',{step},13000,13000).result.reason,'phase');
  }
  assert.equal(f.act('understanding',{answer:'mp'}).result.reason,'understanding');
  assert.equal(f.act('confirm_m01').result.ok,false);
  f.act('understanding',{answer:'cultivation'});f.act('confirm_m01');
  assert.equal(f.profile().cultivation,100);assert.equal(f.profile().milestone,'M01');assert.equal(f.profile().sect.level,1);
  assert.equal(f.actor.mp,70);f.act('confirm_m01');assert.equal(f.profile().cultivation,100);
  assert.ok(validSectProgress(f.profile().sect,f.profile()));
});
test('Situ retains recovery wording and his existing knowledge; Li has her own solo preparation introduction',()=>{
  const f=fixture(HANG_NHAC_AVATARS[1]);f.act('accept_intro');Object.assign(f.actor,SECT_STATIONS[1]);f.act('cycle_start');
  assert.equal(f.profile().sect.foundation,'spirit');assert.match(progressionLabel(HANG_NHAC_AVATARS[1],3),/Hồi phục I/);
  assert.doesNotMatch(progressionLabel(HANG_NHAC_AVATARS[1],3),/Ngưng Khí/);
  assert.match(guideText(HANG_NHAC_AVATARS[1]),/Kiến thức tu luyện.*vẫn còn/);assert.match(guideText(HANG_NHAC_AVATARS[2]),/tự luyện tập/);
});
test('chosen cultivation counts valid online server time at 120/minute, pauses for practice/drop and stops at gate',()=>{
  const f=fixture(),p=f.profile();p.sect={...p.sect,hn01:true,hn02:true,foundation:'breathing',cycleStep:4,level:1,activity:true};p.milestone='M01';p.cultivation=100;
  for(let i=0;i<30;i++)advanceCultivation(p,f.actor,1/30,10000);assert.equal(p.cultivation,102);
  assert.equal(f.actor.mp,70);f.actor.castId='cast';for(let i=0;i<300;i++)advanceCultivation(p,f.actor,1/30,10000);assert.equal(p.cultivation,102);
  assert.equal(sectView(p,f.actor,10000,0).activityStatus,'paused');f.actor.castId='';
  advanceCultivation(p,f.actor,.1,10000,true);assert.equal(p.cultivation,102);
  f.actor.connected=false;for(let i=0;i<18000;i++)advanceCultivation(p,f.actor,1/30,100000000);assert.equal(p.cultivation,102);
  f.actor.connected=true;p.cultivation=359;p.sect.remainderMs=499;advanceCultivation(p,f.actor,1/30,10000);assert.equal(p.cultivation,360);
  for(let i=0;i<30;i++)advanceCultivation(p,f.actor,1/30,10000);assert.equal(p.cultivation,360);assert.equal(p.sect.level,1);
  assert.equal(sectView(p,f.actor,10000,0).activityStatus,'gate');
  p.cultivation=440;advanceCultivation(p,f.actor,.1,10000);assert.equal(p.cultivation,440,'future mission reward overflow is not discarded');
});
test('level confirmation is explicit, requires cultivation station and sufficient threshold, never grants M02',()=>{
  const f=fixture(),p=f.profile();Object.assign(p,{milestone:'M01',cultivation:219});Object.assign(p.sect,{hn01:true,hn02:true,foundation:'breathing',cycleStep:4,level:1});
  assert.equal(f.act('confirm_level').result.reason,'distance');Object.assign(f.actor,SECT_STATIONS[1]);
  assert.equal(f.act('confirm_level',{level:1}).result.reason,'cultivation');p.cultivation=360;
  assert.equal(f.act('confirm_level',{level:1}).result.ok,true);assert.equal(f.profile().sect.level,2);
  assert.equal(f.act('confirm_level',{level:1}).result.reason,'phase');
  f.act('confirm_level',{level:2});assert.equal(f.profile().sect.level,3);assert.equal(f.profile().milestone,'M01');
  assert.equal(f.act('confirm_level').result.reason,'gate');assert.equal(f.profile().cultivation,360);
});
test('recovery supply only heals missing HP, obeys cooldown and never spends during practice',()=>{
  const f=fixture();f.act('accept_intro');assert.equal(f.act('use_recovery').result.reason,'full_hp');assert.equal(f.profile().sect.supplies,2);
  f.actor.hp=50;f.actor.castId='cast';assert.equal(f.act('use_recovery').result.reason,'combat');f.actor.castId='';
  f.act('use_recovery');assert.equal(f.profile().hp,80);assert.equal(f.profile().sect.supplies,1);f.actor.hp=80;
  assert.equal(f.act('use_recovery').result.reason,'cooldown');f.act('use_recovery',{},20000);assert.equal(f.profile().hp,100);assert.equal(f.profile().sect.supplies,0);
});
test('malformed tutorial cannot silently skip its foundation, phases or milestone',()=>{
  const f=fixture(),p=f.profile();assert.ok(validSectProgress(p.sect,p));
  assert.equal(validSectProgress({...p.sect,hn02:true},p),false);
  assert.equal(validSectProgress({...p.sect,activity:true},p),false);
  assert.equal(validSectProgress({...p.sect,level:4},p),false);
});
