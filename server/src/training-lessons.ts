import type { CharacterProfile } from '../../shared/profiles';
import type { CombatActor, TrainingTarget, SkillEvent } from '../../shared/skills/contracts';
import type { SectCommand, SectResult } from '../../shared/sect';
import { clearSectPath, nearStation } from '../../shared/sect';
import { hangNhacWalkable } from '../../shared/hang-nhac';
import { BASIC_COOLDOWN_MS, BASIC_DAMAGE, BASIC_RANGE, LESSON_REWARD,
  newAvoidAttempt, WARNING_RADIUS, type AvoidAttempt, type LessonView } from '../../shared/lesson-contracts';
import { isPractising } from './sect-progress';

export type LessonRuntime = { kind:'arts'; runId:string; startedAt:number; targetId:string } |
  { kind:'avoid'; runId:string; attempt:AvoidAttempt; status:LessonView['status'] };
export interface LessonOutcome {
  result:SectResult; candidate?:CharacterProfile;
  start?:LessonRuntime; target?:TrainingTarget; basicTarget?:TrainingTarget; stop?:boolean;
}
export const copyLessonProfile = (p:CharacterProfile):CharacterProfile =>
  ({...p,sect:{...p.sect,lessons:{...p.sect.lessons}}});
export function lessonView(runtime:LessonRuntime|undefined):LessonView|undefined {
  if(!runtime)return;
  return runtime.kind==='arts'?{kind:'arts',runId:runtime.runId,status:'training',targetId:runtime.targetId}:
    {kind:'avoid',runId:runtime.runId,status:runtime.status,method:runtime.attempt.method,
      center:runtime.attempt.center,radius:WARNING_RADIUS,resolveAt:runtime.attempt.resolveAt};
}
export function performLessonCommand(profile:CharacterProfile,actor:CombatActor,command:SectCommand,now:number,
  targets:ReadonlyMap<string,TrainingTarget>,runtime:LessonRuntime|undefined,projectile:boolean):LessonOutcome {
  const reject=(reason:string):LessonOutcome=>({result:{requestId:command.id,ok:false,reason}});
  const already=():LessonOutcome=>({result:{requestId:command.id,ok:true,reason:'already_complete'}});
  if(!actor.connected||actor.hp<=0)return reject('inactive');
  if(command.action==='lesson_stop') {
    const candidate=copyLessonProfile(profile);candidate.sect.lessons.active='none';
    return {result:{requestId:command.id,ok:true},candidate,stop:true};
  }
  if(command.action==='basic_attack') {
    if(actor.castId||projectile)return reject('combat');
    const target=targets.get(command.targetId!);
    if(!target||target.ownerId!==actor.id||target.hp<=0)return reject('target');
    if(Math.hypot(actor.x-target.x,actor.y-target.y)>BASIC_RANGE||!clearSectPath(actor,target))return reject('basic_range');
    if(profile.sect.lessons.nextBasicAt>now)return reject('basic_cooldown');
    const candidate=copyLessonProfile(profile);candidate.sect.lessons.nextBasicAt=now+BASIC_COOLDOWN_MS;
    candidate.practiceHits=actor.practiceHits+1;
    if(runtime?.kind==='arts'&&runtime.targetId===target.id&&candidate.sect.lessons.active==='arts')candidate.sect.lessons.basic=true;
    return {result:{requestId:command.id,ok:true,reason:'basic_hit'},candidate,basicTarget:target};
  }
  if(!nearStation(actor,'training'))return reject('distance');
  if(isPractising(actor,now,projectile,profile.sect.lessons.nextBasicAt))return reject('combat');
  const candidate=copyLessonProfile(profile),t=candidate.sect.lessons;
  if(!candidate.sect.hn02)return reject('hn02');
  if(command.lesson==='avoid'&&!t.hn03)return reject('hn03');
  if(command.lesson==='arts'?t.hn03:t.hn04)return already();
  if(command.action==='lesson_confirm') {
    if(command.lesson==='arts'?!t.basic||!t.sword||!t.thunder:!t.walk||!t.wind)return reject('lesson_incomplete');
    if(command.lesson==='arts')t.hn03=true;else t.hn04=true;
    t.active='none';candidate.cultivation+=LESSON_REWARD;
    return {result:{requestId:command.id,ok:true,reason:'lesson_reward'},candidate,stop:true};
  }
  if(command.action!=='lesson_start')return reject('invalid');
  if(runtime?.kind==='avoid'&&runtime.status==='warning')return reject('lesson_running');
  const runId=`${actor.id}-${command.id}`;
  if(command.lesson==='arts') {
    // Place one target nearby on existing owner ground. No collider or map edit.
    const choices=[{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0}];
    const point=choices.map(d=>({x:actor.x+d.x*72,y:actor.y+d.y*72}))
      .find(p=>hangNhacWalkable(p,16)&&clearSectPath(actor,p));
    if(!point)return reject('blocked');
    const target:TrainingTarget={id:`lesson-${runId}`,ownerId:actor.id,...point,hp:100,maxHp:100,radius:16};
    t.active='arts';
    return {result:{requestId:command.id,ok:true},candidate,target,start:{kind:'arts',runId,targetId:target.id,startedAt:now}};
  }
  const method=t.walk?'wind':'walk';
  if(method==='wind'&&actor.mp<10)return reject('resource');
  if(method==='wind'&&actor.nextWindAt>now)return reject('skill_cooldown');
  // A safe exercise must have an exit on current navigation; do not alter geometry to make it pass.
  const exits=[{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0}]
    .some(d=>clearSectPath(actor,{x:actor.x+d.x*(method==='wind'?160:64),y:actor.y+d.y*(method==='wind'?160:64)}));
  if(!exits)return reject('blocked');
  t.active='avoid';
  return {result:{requestId:command.id,ok:true},candidate,start:{kind:'avoid',runId,
    attempt:newAvoidAttempt(actor,method,now),status:'warning'}};
}

export function creditLessonHit(profile:CharacterProfile,runtime:LessonRuntime|undefined,event:SkillEvent):CharacterProfile|undefined {
  if(runtime?.kind!=='arts'||profile.sect.lessons.active!=='arts'||event.type!=='hit'||
    event.targetId!==runtime.targetId||event.at<runtime.startedAt||!['sword','thunder'].includes(event.skillId))return;
  const key=event.skillId as 'sword'|'thunder';
  if(profile.sect.lessons[key])return;
  const candidate=copyLessonProfile(profile);candidate.sect.lessons[key]=true;return candidate;
}
export const basicDamage = BASIC_DAMAGE;
