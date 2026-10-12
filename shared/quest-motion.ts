import { CYCLE_PHASE_MS, type SectView } from './sect';
import type { Direction } from './world/types';
import { DIRECTIONS } from './world/types';
import { clipFrame, type SkillClip } from './skills/presentation';

export type QuestMotionKind = 'basic' | 'greeting' | 'recovery' | 'cultivation' | 'idle';
export interface QuestMotionEvent { id:string; actorId:string; kind:QuestMotionKind; direction:Direction; at:number }
export interface QuestMotionCatalog { version:1; clips:Record<string,SkillClip>; bindings:Record<string,Record<string,string>> }
export const QUEST_MOTION_DURATION = { basic:400, greeting:800, recovery:800 } as const;
export function cultivationMotion(view:SectView,moving:boolean):boolean {
  return !moving&&!view.practising&&(view.activityStatus==='running'||
    view.cycleStep<3&&view.cycleReadyAt>0&&(view.cycleStatus==='settling'||view.cycleStatus==='ready'));
}
export function readQuestMotion(raw:unknown):QuestMotionEvent|undefined {
  if(!raw||typeof raw!=='object')return;
  const e=raw as QuestMotionEvent;
  if(typeof e.id!=='string'||!e.id||e.id.length>180||typeof e.actorId!=='string'||!e.actorId||e.actorId.length>80||
    !['basic','greeting','recovery','cultivation','idle'].includes(e.kind)||!DIRECTIONS.includes(e.direction)||!Number.isFinite(e.at))return;
  return {id:e.id,actorId:e.actorId,kind:e.kind,direction:e.direction,at:e.at};
}
// Cosmetic timelines only. No command, credit, collision, movement lock or save ownership.
export class QuestMotionTimeline {
  private shots=new Map<string,QuestMotionEvent>();
  private loops=new Map<string,QuestMotionEvent>();
  private seen=new Set<string>();
  private loopTimes=new Map<string,number>();
  event(event:QuestMotionEvent):void {
    if(this.seen.has(event.id))return;this.seen.add(event.id);
    while(this.seen.size>512)this.seen.delete(this.seen.values().next().value!);
    if(event.kind==='cultivation'||event.kind==='idle'){
      if(event.at<(this.loopTimes.get(event.actorId)??-Infinity))return;
      this.loopTimes.set(event.actorId,event.at);
      if(event.kind==='idle')this.loops.delete(event.actorId);else this.loops.set(event.actorId,event);
    }else if(event.at>=(this.shots.get(event.actorId)?.at??-Infinity))this.shots.set(event.actorId,event);
  }
  sample(catalog:QuestMotionCatalog,actor:{id:string;avatarId:string;moving:boolean;connected?:boolean},now:number,view?:SectView):{clip:string;index:number;kind:QuestMotionKind;direction?:Direction}|undefined {
    if(actor.connected===false){this.shots.delete(actor.id);this.loops.delete(actor.id);return;}
    const shot=this.shots.get(actor.id);
    if(shot){
      const age=now-shot.at,duration=QUEST_MOTION_DURATION[shot.kind as keyof typeof QUEST_MOTION_DURATION];
      if(age>=duration||actor.moving&&shot.kind!=='basic')this.shots.delete(actor.id);
      else {
        const key=shot.kind==='basic'?`basic-${shot.direction}`:shot.kind,clip=catalog.bindings[actor.avatarId]?.[key];
        const index=clip?clipFrame(catalog.clips[clip],age):undefined;
        if(index!==undefined)return {clip,index,kind:shot.kind,direction:shot.direction};
      }
    }
    if(actor.moving)return;
    let loop=this.loops.get(actor.id);const active=view?cultivationMotion(view,actor.moving):!!loop;
    if(!active)return;
    if(!loop){loop={id:`snapshot:${actor.id}`,actorId:actor.id,kind:'cultivation',direction:'south',at:view?.cycleReadyAt?view.cycleReadyAt-CYCLE_PHASE_MS:now};this.loops.set(actor.id,loop);}
    const clip=catalog.bindings[actor.avatarId]?.cultivation;
    const at=loop.at;
    const index=clip?clipFrame(catalog.clips[clip],Math.max(0,now-at)):undefined;
    if(index!==undefined)return {clip,index,kind:'cultivation'};
  }
  prune(ids:Set<string>):void {for(const map of [this.shots,this.loops,this.loopTimes])for(const id of map.keys())if(!ids.has(id))map.delete(id);}
  reset():void {this.shots.clear();this.loops.clear();this.seen.clear();this.loopTimes.clear();}
}
