import type { Position } from './world/types';

export const BASIC_RANGE = 90;
export const BASIC_COOLDOWN_MS = 800;
export const BASIC_DAMAGE = 10;
export const LESSON_REWARD = 80;
export const WARNING_MS = 1500;
export const WARNING_RADIUS = 40;

export interface LessonProgress {
  hn03: boolean; hn04: boolean;
  active: 'none' | 'arts' | 'avoid';
  basic: boolean; sword: boolean; thunder: boolean;
  walk: boolean; wind: boolean;
  nextBasicAt: number;
}
export const initialLessonProgress = (): LessonProgress => ({ hn03:false,hn04:false,active:'none',
  basic:false,sword:false,thunder:false,walk:false,wind:false,nextBasicAt:0 });
export function validLessonProgress(raw: unknown, hn02: boolean): raw is LessonProgress {
  if (!raw || typeof raw !== 'object') return false;
  const p = raw as LessonProgress;
  return [p.hn03,p.hn04,p.basic,p.sword,p.thunder,p.walk,p.wind].every(value=>typeof value==='boolean') &&
    ['none','arts','avoid'].includes(p.active) && Number.isFinite(p.nextBasicAt) && p.nextBasicAt>=0 &&
    (hn02 || !p.hn03&&!p.hn04&&!p.basic&&!p.sword&&!p.thunder&&!p.walk&&!p.wind&&p.active==='none') &&
    (!p.hn03 || p.basic&&p.sword&&p.thunder) && (!p.hn04 || p.hn03&&p.walk&&p.wind) &&
    (!(p.walk||p.wind||p.active==='avoid') || p.hn03) &&
    (p.active!=='arts'||!p.hn03) && (p.active!=='avoid'||!p.hn04);
}
export interface LessonView {
  kind: 'arts' | 'avoid'; runId: string;
  status: 'training' | 'warning' | 'passed' | 'failed' | 'save_failed';
  targetId?: string;
  method?: 'walk' | 'wind';
  center?: Position; radius?: number; resolveAt?: number;
}

// Pure safe-warning evaluator. A telegraph never deals damage or invents a hit.
export interface AvoidAttempt {
  center: Position; startedAt: number; resolveAt: number; method:'walk'|'wind';
  previous: Position; walkingDistance:number; windCastId:string; windArrived:boolean; usedWind:boolean;
}
export function newAvoidAttempt(point: Position, method: 'walk'|'wind', now: number): AvoidAttempt {
  return { center:{x:point.x,y:point.y},previous:{x:point.x,y:point.y},method,startedAt:now,
    resolveAt:now+WARNING_MS,walkingDistance:0,windCastId:'',windArrived:false,usedWind:false };
}
export function observeAvoidMotion(attempt: AvoidAttempt, point: Position, walking: boolean, dashing: boolean, dt:number): void {
  const distance=Math.hypot(point.x-attempt.previous.x,point.y-attempt.previous.y);
  // Credit only continuous ordinary movement; the room still owns all physics.
  if(walking&&!dashing&&Number.isFinite(distance))attempt.walkingDistance+=Math.min(distance,80*Math.max(0,Math.min(dt,.1))+0.01);
  attempt.previous={x:point.x,y:point.y};
}
export function observeAvoidSkill(attempt: AvoidAttempt, event:{type:string;skillId:string;castId:string;at:number}):void {
  if(event.skillId!=='wind'||event.at<attempt.startedAt||event.at>attempt.resolveAt)return;
  if(event.type==='cast'){attempt.usedWind=true;attempt.windCastId=event.castId;}
  if(event.type==='arrival'&&attempt.windCastId&&event.castId===attempt.windCastId)attempt.windArrived=true;
}
export function resolveAvoidAttempt(attempt:AvoidAttempt, point:Position, now:number, connected:boolean, clearPath:boolean):'pending'|'passed'|'failed' {
  if(!connected)return 'failed';
  if(now<attempt.resolveAt)return 'pending';
  const escaped=Number.isFinite(point.x)&&Number.isFinite(point.y)&&clearPath&&
    Math.hypot(point.x-attempt.center.x,point.y-attempt.center.y)>WARNING_RADIUS+8;
  const method=attempt.method==='walk'?!attempt.usedWind&&attempt.walkingDistance>=20:attempt.windArrived;
  return escaped&&method?'passed':'failed';
}
