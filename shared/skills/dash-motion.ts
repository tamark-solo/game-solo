import type {SkillDefinition} from './definitions';
import {SKILL_DEFINITIONS} from './definitions';
import type {R01MotionState} from './contracts';

export interface MotionInterval {previous:number;now:number}
export interface CastMotionState extends R01MotionState {
  castId?:string;castSkill?:string;castStartedAt?:number;castAimX?:number;castAimY?:number;
}

// A dash velocity is valid for ONE simulation interval, including partial edge
// ticks. Replaying a snapshot's velocity as a permanent speed overshoots its end.
export function dashVelocity(startedAt:number,dx:number,dy:number,time:MotionInterval,
  definition:Pick<SkillDefinition,'release'|'duration'|'range'>,dtSeconds=(time.now-time.previous)/1000):{vx:number;vy:number} {
  const dt=dtSeconds*1000,duration=definition.duration??0;
  if(!(dt>0&&duration>0))return {vx:0,vy:0};
  const begin=startedAt+definition.release,end=begin+duration;
  const overlap=Math.max(0,Math.min(time.now,end)-Math.max(time.previous,begin));
  const speed=definition.range/duration*1000*Math.min(dt,overlap)/dt;
  return {vx:dx*speed,vy:dy*speed};
}

// Only an already-confirmed wind cast can advance this timeline. No optimistic
// cast, cost, hit, authority or receipt is created by prediction.
export function prepareWindPrediction(state:CastMotionState,time:MotionInterval,dtSeconds:number):void {
  if(!state.castId||state.castSkill!=='wind'||!Number.isFinite(state.castStartedAt))return;
  const wind=SKILL_DEFINITIONS.wind;
  const v=dashVelocity(state.castStartedAt!,state.castAimX??0,state.castAimY??0,time,wind,dtSeconds);
  state.dashVX=v.vx;state.dashVY=v.vy;
  state.motionLocked=time.now-state.castStartedAt!<wind.recovery;
}
