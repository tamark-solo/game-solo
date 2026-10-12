import assert from 'node:assert/strict';import {test} from 'node:test';
import {BASIC_RULES,actorDirection,readActorAction,type ActorActionFact} from '../../shared/actor-actions';
import {ChapterActivity} from '../../server/src/chapter-activity';import {initialProfile} from '../../shared/profiles';import {initialChapter,validChapter,applyChapterMovement} from '../../shared/chapter';
import {applyR01Movement} from '../../shared/skills/movement';import {HANG_NHAC} from '../../shared/hang-nhac';import {sanitizeMovement} from '../../shared/protocol/input';
import {PixelPlayerModel} from '../../client/src/core/pixel-player-model';import type {CombatActor} from '../../shared/r01';
import {readFileSync} from 'node:fs';import {SkillTimeline,validatePresentationCatalog,type SkillPresentationCatalog} from '../../shared/skills/presentation';
function setup(){const p=initialProfile('p','a','CHR-WANG-LIN-CHIBI',1);p.chapter={...initialChapter(),scene:'outer',activity:'HN05',accepted:['HN05']};
 const a:CombatActor={id:'a',connected:true,x:640,y:490,direction:'south',moving:false,hp:100,mp:100,casts:0,practiceHits:0,nextSwordAt:0,nextThunderAt:0,nextWindAt:0,lastSpentAt:0,castId:'',castSkill:'',castStartedAt:0};
 const facts:ActorActionFact[]=[],activity=new ChapterActivity(a,p,10000,()=>{},()=>{},e=>facts.push(e));activity.prepare(p,true);a.y=490;return {p,a,facts,activity};}
const tick=(s:ReturnType<typeof setup>,n:number)=>{for(let i=0;i<n;i++){s.activity.before(1/30);s.activity.after(1/30,s.p);}};
test('three deliberate F presses rotate real clips without increasing damage or baseline attack frequency',()=>{
 const s=setup();assert.equal(s.activity.basic(s.p,{x:0,y:-1},'one'),true);s.activity.flushActions();assert.equal(s.facts.length,1);assert.equal(s.activity.view(s.p).enemy!.hp,60);tick(s,7);
 assert.equal(s.facts.filter(e=>e.type==='release').length,1);assert.equal(s.facts.filter(e=>e.type==='hit').length,1);assert.equal(s.activity.view(s.p).enemy!.hp,50);
 assert.equal(s.activity.basic(s.p,{x:0,y:-1},'too-fast'),false);tick(s,18);
 assert.equal(s.activity.basic(s.p,{x:0,y:-1},'two'),true);assert.equal(s.activity.view(s.p).basic!.action,'attack_2');tick(s,25);
 assert.equal(s.activity.basic(s.p,{x:0,y:-1},'three'),true);assert.equal(s.activity.view(s.p).basic!.action,'attack_3');tick(s,25);
 assert.equal(s.activity.view(s.p).enemy!.hp,30);assert.equal(s.a.mp,100);assert.equal(s.a.practiceHits,3);assert.equal(BASIC_RULES.cooldownMs,800);
});
test('movement before release cancels, cooldown stays charged; miss produces a trail but never confirmed hit',()=>{
 const s=setup();s.activity.basic(s.p,{x:0,y:-1},'cancel');s.activity.flushActions();s.activity.movement({x:1,y:0});tick(s,10);
 assert.equal(s.facts.some(e=>e.type==='cancel'),true);assert.equal(s.facts.some(e=>e.type==='release'||e.type==='hit'),false);assert.equal(s.activity.basic(s.p,{x:0,y:-1}),false);assert.equal(s.a.motionLocked,false);
 tick(s,20);s.a.x=200;s.a.y=700;s.activity.basic(s.p,{x:1,y:0},'miss');tick(s,15);assert.equal(s.facts.some(e=>e.type==='release'&&e.strikeId==='miss'),true);assert.equal(s.facts.some(e=>e.type==='hit'),false);
});
test('save/restart retains released strike, combo and pose clock without applying a second hit',()=>{
 const s=setup();s.activity.basic(s.p,{x:0,y:-1},'restart');tick(s,7);s.p.chapter!.activitySave={...s.activity.snapshot(),pausedAt:Date.now()};assert.equal(validChapter(s.p.chapter),true);
 const restored=new ChapterActivity(s.a,s.p,20000,()=>{},()=>{},e=>s.facts.push(e));for(let i=0;i<20;i++){restored.before(1/30);restored.after(1/30,s.p);}assert.equal(restored.view(s.p).enemy!.hp,50);assert.equal(s.facts.filter(e=>e.type==='hit').length,1);assert.equal(restored.snapshot().basic,undefined);
 restored.prepare(s.p,true);assert.notEqual(restored.view(s.p).enemy!.id,s.p.chapter!.activitySave.enemy!.id);assert.equal(restored.view(s.p).enemy!.hp,60);
});
test('fast modifier is finite and server/client use the same bounded speed; dash keeps its own speed',()=>{
 for(const movement of [applyChapterMovement,applyR01Movement]){const spawn=movement===applyChapterMovement?{x:640,y:704}:HANG_NHAC.world.spawn,plain={...spawn,direction:'south',moving:false},fast={...plain};movement(plain,{moveX:1,moveY:0},.1);movement(fast,{moveX:1,moveY:0,fast:true},.1);assert.ok(Math.abs((fast.x-spawn.x)/(plain.x-spawn.x)-1.5)<.001);}
 const bad={moveX:NaN,moveY:0,fast:true};sanitizeMovement(bad);assert.deepEqual(bad,{moveX:0,moveY:0,fast:false});
 const s={x:640,y:704,direction:'south',moving:false,motionLocked:true,dashVX:120,dashVY:0};applyChapterMovement(s,{moveX:1,moveY:0,fast:true},.1);assert.equal(s.x,652);
});
test('pure presentation preserves eight facings, travel phase, gathering interruption and absolute shot age',()=>{
 const m=new PixelPlayerModel(),a={id:'a',x:10,y:10,moving:false,direction:'south' as const,connected:true,hp:100,facingX:1,facingY:-1};assert.equal(m.sample(a,0).direction,'northeast');
 assert.equal(actorDirection(-1,1),'southwest');const e:ActorActionFact={type:'start',strikeId:'s',actorId:'a',action:'attack_3',at:0,x:10,y:10,dx:1,dy:1};m.event(e);assert.equal(m.sample(a,450).action,'attack_3');assert.equal(m.sample(a,900).action,'idle');
 m.event({...e,type:'gather',action:'gather',at:1000});assert.equal(m.sample(a,1100).action,'gather');assert.equal(m.sample({...a,moving:true,x:25,y:15},1200).action,'run');assert.ok(m.sample({...a,x:25,y:15},1300).distance>0);
 m.quest({id:'meditate',actorId:'a',kind:'cultivation',direction:'south',at:1400});assert.equal(m.sample({...a,x:15,y:15},1500).action,'meditate');m.quest({id:'end',actorId:'a',kind:'idle',direction:'south',at:1600});assert.equal(m.sample({...a,x:15,y:15},1700).action,'idle');
 assert.equal(readActorAction({...e,at:NaN}),undefined);
});
test('live Core catalog selects 24 real pixel cast bindings and their own wind ghosts; native avatars stay four-direction',()=>{
 const c=JSON.parse(readFileSync('client/public/assets/hang-nhac-pixel-player/skill-presentation.json','utf8')) as SkillPresentationCatalog;validatePresentationCatalog(c);
 for(const [dx,dy,d]of [[0,1,'south'],[-1,1,'southwest'],[-1,0,'west'],[-1,-1,'northwest'],[0,-1,'north'],[1,-1,'northeast'],[1,0,'east'],[1,1,'southeast']] as const)for(const skill of ['sword','thunder','wind'] as const){
  const t=new SkillTimeline(c),a={id:'a',avatarId:'CHR-WANG-LIN-CHIBI',direction:'south',x:500,y:500,connected:true};
  t.event({type:'cast',castId:'c',actorId:'a',skillId:skill,at:1000,x:500,y:500,dx,dy});t.sample(1000,[a],[]);t.sample(1100,[{...a,x:504,y:504}],[]);const frame=t.sample(1200,[{...a,x:510,y:510}],[]);
  assert.equal(frame.poses.get('a')?.clip,c.skills[skill].bindings[a.avatarId][d]);if(skill==='wind'){const ghosts=frame.effects.filter(e=>e.id.includes(':ghost:'));assert.equal(ghosts.length,2);assert.ok(ghosts.every(e=>e.clip===frame.poses.get('a')?.clip));}
 }
 const broken=structuredClone(c);delete broken.skills.sword.bindings['CHR-WANG-LIN-CHIBI'].northeast;assert.throws(()=>validatePresentationCatalog(broken),/eight-direction/);
 const t=new SkillTimeline(c),a={id:'b',avatarId:'CHR-SITU-NAN',direction:'north',x:500,y:500,connected:true};t.event({type:'cast',castId:'n',actorId:'b',skillId:'sword',at:1000,x:500,y:500,dx:1,dy:-1});assert.equal(t.sample(1100,[a],[]).poses.get('b')?.clip,c.skills.sword.bindings[a.avatarId].north);
});
test('continuing the held movement at F acceptance cannot cancel it; a new direction before release does',()=>{
 const s=setup();s.activity.basic(s.p,{x:0,y:-1},'held',{x:0,y:-1});s.activity.movement({x:0,y:-1});assert.equal(s.activity.basicLocked,true);s.activity.movement({x:1,y:0});assert.equal(s.activity.basicLocked,false);tick(s,9);assert.equal(s.facts.some(e=>e.type==='hit'),false);
});
test('avatars without the new combo art keep the existing single basic clip and damage/cooldown',()=>{
 const s=setup();s.p.avatarId='CHR-LI-MUWAN';assert.equal(s.activity.basic(s.p,{x:0,y:-1},'one'),true);tick(s,25);assert.equal(s.activity.basic(s.p,{x:0,y:-1},'two'),true);assert.equal(s.activity.view(s.p).basic!.action,'attack');assert.equal(s.activity.view(s.p).enemy!.hp,50);
});
test('a defeated actor remains at its world foot despite movement/Shift/dash input until preparation',()=>{
 const a={x:640,y:704,direction:'south',moving:true,hp:0,motionLocked:false,dashVX:384,dashVY:0};applyChapterMovement(a,{moveX:1,moveY:1,fast:true},.1);assert.equal(a.x,640);assert.equal(a.y,704);assert.equal(a.moving,false);
 const s=setup();s.a.hp=0;s.activity.stop('failed');s.activity.prepare(s.p,true);assert.equal(s.a.hp,100);assert.equal(s.activity.view(s.p).enemy!.hp,60);
});
