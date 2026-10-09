import { SKILL_DEFINITIONS } from './definitions';
import type { SkillEvent } from './contracts';
import { R01_IDS, type SkillId } from '../profiles';
import type { Direction, Position } from '../world/types';

export interface ClipRect {x:number;y:number;w:number;h:number}
export interface SkillClip {
  fps:number;frameSize:[number,number];anchor:[number,number];loop:boolean;durations:number[];
  atlasSize:[number,number];atlasUrl:string;sampling:'nearest'|'linear';frames:ClipRect[];
  /** Valid drawing region in each full frame's local pixel coordinates. Does not change its pivot/canvas. */
  frameCrops?:ClipRect[];
  /** Detached neighbouring-cell pieces that overlap the valid rectangle. */
  frameCutouts?:ClipRect[][];
  sockets?:Array<[number,number]>;sha256?:string;bytes?:number;
}
export interface PresentationTrack {
  id:string;clip:string;trigger:'cast'|'hit'|'miss'|'arrival';delay:number;duration:number;
  anchor:'hand'|'body'|'origin'|'target'|'hit';layer:'ground'|'air'|'impact';
  rotate?:boolean;stopOn?:SkillEvent['type'][];offset?:[number,number];
  holdLastUntilResolve?:boolean;frameStart?:number;frameCount?:number;projectileAnchor?:boolean;
  resolveOn?:SkillEvent['type'][];
}
export interface SkillPresentationDefinition {
  fps:number;characterEnd:number;bindings:Record<string,Partial<Record<Direction,string>>>;
  tracks:PresentationTrack[];projectileClip?:string;
  ghosts?:{lagMs:number[];opacity:number[]};
}
export interface SkillPresentationCatalog {version:number;skills:Record<SkillId,SkillPresentationDefinition>;clips:Record<string,SkillClip>}
export interface PresentationActor extends Position {
  id:string;avatarId:string;direction:string;connected?:boolean;
  castId?:string;castSkill?:string;castStartedAt?:number;castAimX?:number;castAimY?:number;
}
export interface PresentationProjectile extends Position {id:string;ownerId:string;castId:string;dx:number;dy:number;startedAt:number;skillId?:string}
export interface SpriteSample extends Position {id:string;clip:string;index:number;layer:'ground'|'air'|'impact'|'body';rotation:number;opacity:number;actorId?:string}
interface Cast extends SkillEvent {type:'cast';snapshot:boolean}
interface Effect {id:string;castId:string;actorId:string;track:PresentationTrack;start:number;end:number;x:number;y:number;dx:number;dy:number;resolved:boolean}
export interface PresentationFrame {poses:Map<string,SpriteSample>;effects:SpriteSample[]}
const direction=(dx:number,dy:number):Direction=>Math.abs(dx)>Math.abs(dy)?dx>0?'east':'west':dy>0?'south':'north';
const aimFromDirection=(d:string):[number,number]=>d==='east'?[1,0]:d==='west'?[-1,0]:d==='north'?[0,-1]:[0,1];
export function clipFrame(clip:SkillClip,age:number,hold=false):number|undefined {
  if(!Number.isFinite(age)||age<0)return;
  const total=clip.durations.reduce((s,v)=>s+v,0);
  let tick=Math.floor(age*clip.fps/1000+1e-7);
  if(clip.loop)tick%=total;
  else if(tick>=total){if(!hold)return;tick=total-1;}
  let index=0;while(index<clip.durations.length-1&&tick>=clip.durations[index])tick-=clip.durations[index++];
  return index;
}
export function validatePresentationCatalog(catalog:SkillPresentationCatalog):void {
  if(catalog.version!==2)throw new Error('Unsupported skill presentation catalog.');
  for(const [id,c] of Object.entries(catalog.clips)){
    const validCrop=(r:ClipRect)=>[r.x,r.y,r.w,r.h].every(Number.isInteger)&&r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=c.frameSize[0]&&r.y+r.h<=c.frameSize[1];
    if(!c.frames.length||c.frames.length!==c.durations.length||c.durations.some(v=>!Number.isInteger(v)||v<=0)||!Number.isFinite(c.fps)||c.fps<=0||
      c.frameSize.length!==2||c.frameSize.some(v=>!Number.isInteger(v)||v<=0)||c.atlasSize.length!==2||c.atlasSize.some(v=>!Number.isInteger(v)||v<=0)||
      !c.atlasUrl||c.anchor.length!==2||c.anchor.some((v,i)=>!Number.isFinite(v)||v<0||v>c.frameSize[i])||
      c.frames.some(r=>!Number.isInteger(r.x)||!Number.isInteger(r.y)||r.w!==c.frameSize[0]||r.h!==c.frameSize[1]||r.x<0||r.y<0||r.x+r.w>c.atlasSize[0]||r.y+r.h>c.atlasSize[1])||
      c.sockets&&(c.sockets.length!==c.frames.length||c.sockets.some(s=>s.length!==2||s.some(v=>!Number.isFinite(v))))||
      c.frameCrops&&(c.frameCrops.length!==c.frames.length||c.frameCrops.some(r=>!validCrop(r)))||
      c.frameCutouts&&(c.frameCutouts.length!==c.frames.length||c.frameCutouts.some(rows=>rows.some(r=>!validCrop(r)))))throw new Error(`Invalid skill clip ${id}.`);
  }
  for(const id of R01_IDS)if(!catalog.skills[id])throw new Error(`Missing skill presentation: ${id}`);
  for(const [id,skill] of Object.entries(catalog.skills)){
    if(!SKILL_DEFINITIONS[id as SkillId]||Math.abs(skill.characterEnd-SKILL_DEFINITIONS[id as SkillId].end)>.01)throw new Error(`Gameplay/presentation timing mismatch: ${id}`);
    const referenced=[...Object.values(skill.bindings).flatMap(d=>Object.values(d)),...skill.tracks.map(t=>t.clip),...(skill.projectileClip?[skill.projectileClip]:[])];
    if(referenced.some(c=>!catalog.clips[c!]))throw new Error(`Missing clip in ${id}.`);
    for(const clip of Object.values(skill.bindings).flatMap(d=>Object.values(d))){
      const c=catalog.clips[clip!],end=c.durations.reduce((s,v)=>s+v,0)*1000/c.fps;
      if(c.loop||Math.abs(end-skill.characterEnd)>.01)throw new Error(`Invalid body timeline: ${id}.`);
    }
    if(skill.tracks.some(t=>!Number.isFinite(t.delay)||t.delay<0||!Number.isFinite(t.duration)||t.duration<=0||
      t.frameStart!==undefined&&(!Number.isInteger(t.frameStart)||t.frameStart<0)||
      t.frameCount!==undefined&&(!Number.isInteger(t.frameCount)||t.frameCount<=0)||
      (t.frameStart??0)+(t.frameCount??catalog.clips[t.clip].frames.length)>catalog.clips[t.clip].frames.length))throw new Error(`Invalid presentation track: ${id}.`);
    if(skill.ghosts&&(skill.ghosts.lagMs.length!==skill.ghosts.opacity.length||skill.ghosts.lagMs.some(v=>!Number.isFinite(v)||v<=0)||
      skill.ghosts.opacity.some(v=>!Number.isFinite(v)||v<0||v>1)))throw new Error(`Invalid ghost samples: ${id}.`);
  }
}

// Pure presentation: absolute server clock + confirmed facts in, sprite descriptors out.
// It has no input, resource, movement, collision, persistence or damage authority.
export class SkillTimeline {
  private casts=new Map<string,Cast>();
  private effects=new Map<string,Effect>();
  private seen=new Set<string>();
  private terminal=new Set<string>();
  private poses=new Map<string,SpriteSample>();
  private samples:SpriteSample[]=[];
  private trace:Array<{type:string;castId:string;at:number;detail?:string}>=[];
  private missing=new Set<string>();
  private history=new Map<string,Array<{at:number;castId:string;pose:SpriteSample}>>();
  private projectileAnchors=new Map<string,{at:number;offset:[number,number]}>();
  private dropped=0;
  constructor(readonly catalog:SkillPresentationCatalog,private capacity=128){validatePresentationCatalog(catalog);}
  private record(type:string,castId:string,at:number,detail?:string):void {
    this.trace.push({type,castId,at,...(detail?{detail}:{})});if(this.trace.length>128)this.trace.shift();
  }
  event(event:SkillEvent):void {
    const key=`${event.castId}:${event.type}`;
    if(this.seen.has(key))return;
    this.seen.add(key);if(this.seen.size>1024)this.seen.delete(this.seen.values().next().value!);
    this.record(event.type,event.castId,event.at,event.skillId);
    const definition=this.catalog.skills[event.skillId];if(!definition)return;
    if(event.type==='cancel'){
      this.terminal.add(event.castId);if(this.terminal.size>512)this.terminal.delete(this.terminal.values().next().value!);
      if(this.casts.get(event.actorId)?.castId===event.castId)this.casts.delete(event.actorId);
      for(const [id,e] of this.effects)if(e.castId===event.castId&&e.track.trigger==='cast')this.effects.delete(id);
      return;
    }
    if(event.type==='cast'){
      if(this.terminal.has(event.castId))return;
      if(this.casts.size>=this.capacity&&!this.casts.has(event.actorId)){this.dropped++;return;}
      this.casts.set(event.actorId,{...event,type:'cast',snapshot:false});
    }
    for(const [id,e] of this.effects)if(e.castId===event.castId){
      if(e.track.resolveOn?.includes(event.type))e.resolved=true;
      if(e.track.stopOn?.includes(event.type))this.effects.delete(id);
      else if(event.type==='release'&&e.track.anchor==='target'&&event.targetX!==undefined){e.x=event.targetX;e.y=event.targetY!;}
    }
    for(const track of definition.tracks)if(track.trigger===event.type){
      if(this.effects.size>=this.capacity){this.dropped++;continue;}
      const id=`${event.castId}:${track.id}`;
      const target=track.anchor==='target';if(target&&event.targetX===undefined)continue;
      this.effects.set(id,{id,castId:event.castId,actorId:event.actorId,track,start:event.at+track.delay,end:event.at+track.delay+track.duration,
        x:target?event.targetX!:event.x,y:target?event.targetY!:event.y,dx:event.dx,dy:event.dy,resolved:false});
    }
    if(this.terminal.size>512)this.terminal.delete(this.terminal.values().next().value!);
  }
  private binding(cast:Cast,actor:PresentationActor):string|undefined {
    const facing=direction(cast.dx,cast.dy),clip=this.catalog.skills[cast.skillId]?.bindings[actor.avatarId]?.[facing];
    if(!clip)this.missing.add(`${actor.avatarId}:${cast.skillId}:${facing}`);
    return clip;
  }
  sample(now:number,actors:readonly PresentationActor[],projectiles:readonly PresentationProjectile[]):PresentationFrame {
    const byId=new Map(actors.map(a=>[a.id,a]));this.poses=new Map();this.samples=[];
    for(const actor of actors){
      if(actor.connected===false)continue;
      const existing=this.casts.get(actor.id),skill=actor.castSkill as SkillId;
      if(actor.castId&&actor.castStartedAt&&this.catalog.skills[skill]&&!this.terminal.has(actor.castId)&&existing?.castId!==actor.castId&&
        now-actor.castStartedAt<this.catalog.skills[skill].characterEnd&&(!existing||actor.castStartedAt>=existing.at)){
        const [dx,dy]=actor.castAimX||actor.castAimY?[actor.castAimX??0,actor.castAimY??0]:aimFromDirection(actor.direction);
        const event:SkillEvent={type:'cast',castId:actor.castId,actorId:actor.id,skillId:skill,at:actor.castStartedAt,x:actor.x,y:actor.y,dx,dy};
        // Resume pose/charge from its actual age. Completed hits are never invented or replayed.
        this.event(event);const cast=this.casts.get(actor.id);
        if(cast?.castId===actor.castId){cast.snapshot=true;this.record('snapshot-resume',actor.castId,now);}
      }
    }
    for(const [id,cast] of this.casts){
      const actor=byId.get(id),def=this.catalog.skills[cast.skillId],age=now-cast.at;
      if(!actor||actor.connected===false){this.casts.delete(id);continue;}
      const clip=this.binding(cast,actor);if(!clip)continue;
      if(def.projectileClip&&!this.projectileAnchors.has(cast.castId)){
        const c=this.catalog.clips[clip],release=clipFrame(c,SKILL_DEFINITIONS[cast.skillId].release);
        this.projectileAnchors.set(cast.castId,{at:cast.at,offset:c.sockets?.[release!]??[0,-36]});
      }
      if(age>=def.characterEnd){this.casts.delete(id);continue;}
      const index=clipFrame(this.catalog.clips[clip],age,true);if(index===undefined)continue;
      this.poses.set(id,{id:`${cast.castId}:body`,clip,index,x:actor.x,y:actor.y,layer:'body',rotation:0,opacity:1,actorId:id});
      const history=this.history.get(id)??[];
      history.push({at:now,castId:cast.castId,pose:{...this.poses.get(id)!}});
      while(history.length>90||history[0]?.at<now-1000)history.shift();this.history.set(id,history);
      if(def.ghosts&&age>=SKILL_DEFINITIONS[cast.skillId].release&&age<SKILL_DEFINITIONS[cast.skillId].recovery){
        def.ghosts.lagMs.forEach((lag,i)=>{
          let past:typeof history[number]|undefined;
          for(let j=history.length-1;j>=0;j--)if(history[j].castId===cast.castId&&history[j].at<=now-lag){past=history[j];break;}
          if(past)this.samples.push({...past.pose,id:`${cast.castId}:ghost:${i}`,opacity:def.ghosts!.opacity[i],layer:'ground'});
        });
      }
    }
    for(const [id,e] of this.effects){
      const actor=byId.get(e.actorId);
      if(now>=e.end||(e.track.trigger==='cast'&&(!actor||actor.connected===false))){this.effects.delete(id);continue;}
      const clip=this.catalog.clips[e.track.clip],first=e.track.frameStart??0,count=e.track.frameCount??clip.frames.length;
      const sequence=first||count!==clip.frames.length?{...clip,durations:clip.durations.slice(first,first+count),frames:clip.frames.slice(first,first+count)}:clip;
      const frame=clipFrame(sequence,now-e.start,e.track.holdLastUntilResolve&&!e.resolved);
      if(frame===undefined){if(now>=e.start)this.effects.delete(id);continue;}
      const index=frame+first;
      let x=e.x,y=e.y;
      if(e.track.anchor==='body'||e.track.anchor==='hand'){
        if(!actor)continue;x=actor.x;y=actor.y;
        if(e.track.anchor==='hand'){
          const pose=this.poses.get(e.actorId),socket=pose?this.catalog.clips[pose.clip].sockets?.[pose.index]:undefined;
          if(socket){x+=socket[0];y+=socket[1];}else{x+=e.dx*22;y+=-36+e.dy*10;}
        }
      }
      if(e.track.projectileAnchor){const offset=this.projectileAnchors.get(e.castId)?.offset??[0,-36];x+=offset[0];y+=offset[1];}
      this.samples.push({id,clip:e.track.clip,index,x,y,layer:e.track.layer,rotation:e.track.rotate?-Math.atan2(e.dy,e.dx):0,opacity:1,actorId:e.actorId});
      const sample=this.samples[this.samples.length-1];sample.x+=e.track.offset?.[0]??0;sample.y+=e.track.offset?.[1]??0;
    }
    for(const projectile of projectiles){
      const skill=(projectile.skillId||'sword') as SkillId,clip=this.catalog.skills[skill]?.projectileClip;if(!clip)continue;
      const projection=this.projectileAnchors.get(projectile.castId),offset=projection?.offset??[0,-36];
      const start=projection?projection.at+SKILL_DEFINITIONS[skill].release:projectile.startedAt;
      const index=clipFrame(this.catalog.clips[clip],now-start);if(index===undefined)continue;
      this.samples.push({id:`projectile:${projectile.id}`,clip,index,x:projectile.x+offset[0],y:projectile.y+offset[1],layer:'air',rotation:-Math.atan2(projectile.dy,projectile.dx),opacity:1,actorId:projectile.ownerId});
    }
    if(this.samples.length>this.capacity){this.dropped+=this.samples.length-this.capacity;this.samples.length=this.capacity;}
    for(const id of this.history.keys())if(!byId.has(id))this.history.delete(id);
    for(const [id,p] of this.projectileAnchors)if(now-p.at>=8000)this.projectileAnchors.delete(id);
    while(this.projectileAnchors.size>this.capacity)this.projectileAnchors.delete(this.projectileAnchors.keys().next().value!);
    return {poses:this.poses,effects:this.samples};
  }
  reset():void {this.casts.clear();this.effects.clear();this.seen.clear();this.terminal.clear();this.poses.clear();this.samples=[];this.missing.clear();this.history.clear();this.projectileAnchors.clear();}
  diagnostics(){return {casts:this.casts.size,effects:this.effects.size,poses:[...this.poses.values()],samples:this.samples.length,
    frames:this.samples.map(s=>({...s})),missingBindings:[...this.missing],dropped:this.dropped,trace:[...this.trace]};}
}
