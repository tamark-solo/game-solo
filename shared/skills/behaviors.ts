import { SKILL_DEFINITIONS as skills, type SkillDefinition } from './definitions';
import type { ActiveCast, CombatActor, Projectile, SkillEvent, TrainingTarget } from './contracts';
import type { Position } from '../world/types';
import { moveUsingCollision } from '../world/movement';
import { type Direction } from '../world/types';
import { hangNhacWalkable } from '../hang-nhac';

interface Validation {actor:CombatActor;dx:number;dy:number;target?:TrainingTarget;definition:SkillDefinition;walkable:typeof hangNhacWalkable;clearPath:(a:Position,b:Position)=>boolean}
export interface BehaviorContext {
  actor:CombatActor;cast:ActiveCast;now:number;previous:number;dt:number;definition:SkillDefinition;
  targets:Map<string,TrainingTarget>;projectiles:Map<string,Projectile>;
  clearPath:(a:Position,b:Position)=>boolean;
  emit:(type:SkillEvent['type'],point:Position,target?:Position)=>void;
  hit:(target:TrainingTarget,damage:number,point:Position)=>void;
  arrive:()=>void;
}
export interface SkillBehavior {
  required?:Array<keyof SkillDefinition>;
  validate?:(context:Validation)=>string|undefined;
  release?:(context:BehaviorContext)=>void;
  advance?:(context:BehaviorContext)=>void;
}
// Each mechanic owns only its special rules. Lifecycle, receipts and persistence stay in the engine.
export const SKILL_BEHAVIORS:Record<string,SkillBehavior>={
  projectile:{required:['speed','damage'],release:({actor,cast,now,projectiles})=>{
    projectiles.set(cast.id,{id:cast.id,ownerId:actor.id,castId:cast.id,skillId:cast.skill,...cast.origin,
      dx:cast.dx,dy:cast.dy,traveled:0,startedAt:now});
  }},
  'targeted-strike':{
    required:['resolve','damage'],
    validate:({actor,target,clearPath,definition})=>!target||target.ownerId!==actor.id||target.hp<=0||
      Math.hypot(target.x-actor.x,target.y-actor.y)>definition.range||!clearPath(actor,target)?'target':undefined,
    release:({actor,cast,targets,clearPath,definition})=>{
      const target=targets.get(cast.targetId);
      if(target?.ownerId===actor.id&&target.hp>0&&Math.hypot(target.x-actor.x,target.y-actor.y)<=definition.range&&clearPath(actor,target))cast.target={x:target.x,y:target.y};
    },
    advance:({actor,cast,now,targets,clearPath,hit,emit,definition})=>{
      if(cast.resolved||now-cast.startedAt+.001<definition.resolve!)return;
      cast.resolved=true;const target=targets.get(cast.targetId);
      if(cast.target&&target?.ownerId===actor.id&&target.hp>0&&Math.hypot(target.x-cast.target.x,target.y-cast.target.y)<=24&&clearPath(actor,cast.target))hit(target,definition.damage!,cast.target);
      else emit('miss',cast.target??actor);
    }
  },
  dash:{
    required:['duration'],
    validate:({actor,dx,dy,definition,walkable})=>{
      const test=moveUsingCollision({x:actor.x,y:actor.y,direction:actor.direction as Direction,moving:false},
        {x:dx,y:dy},definition.duration!/1000,definition.range/(definition.duration!/1000),walkable);
      return Math.hypot(test.x-actor.x,test.y-actor.y)<1?'blocked':undefined;
    },
    advance:({actor,cast,now,previous,dt,arrive,definition})=>{
      if(cast.arrived)return;
      const begin=cast.startedAt+definition.release,end=begin+definition.duration!;
      const overlap=Math.max(0,Math.min(now,end)-Math.max(previous,begin));
      const speed=definition.range/(definition.duration!/1000)*overlap/(dt*1000);
      actor.dashVX=cast.dx*speed;actor.dashVY=cast.dy*speed;
      if(now+.001>=end)arrive();
    }
  }
};
export function validateSkillDefinitions():void {
  for(const [id,definition] of Object.entries(skills)){
    const behavior=SKILL_BEHAVIORS[definition.behavior];if(!behavior)throw new Error(`Unknown mechanic: ${id}`);
    if(definition.aim!=='direction'&&definition.aim!=='target')throw new Error(`Invalid aim policy: ${id}`);
    if(!(definition.release<=definition.recovery&&definition.recovery<=definition.end))throw new Error(`Invalid cast lifecycle: ${id}`);
    for(const key of ['cost','cooldown','range',...(behavior.required??[])] as Array<keyof SkillDefinition>){
      const value=(definition as SkillDefinition)[key];if(typeof value!=='number'||!Number.isFinite(value)||value<=0)throw new Error(`Invalid skill definition: ${id}.${key}`);
    }
  }
}
