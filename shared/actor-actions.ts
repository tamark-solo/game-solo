/** Gameplay timings are explicit contracts, independent of sprite frame counts. */
export const ACTOR_DIRECTIONS=['south','southwest','west','northwest','north','northeast','east','southeast'] as const;
export type ActorDirection=typeof ACTOR_DIRECTIONS[number];
export function actorDirection(dx:number,dy:number,fallback:ActorDirection='south'):ActorDirection{
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.001)return fallback;
 return (['east','southeast','south','southwest','west','northwest','north','northeast'] as const)[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
}
export const BASIC_ACTIONS=['attack','attack_2','attack_3'] as const;
export type BasicAction=typeof BASIC_ACTIONS[number];
export const BASIC_RULES={damage:10,cooldownMs:800,comboWindowMs:1600,range:90,coneCos:.4,
 timing:{attack:{release:200,end:400},attack_2:{release:1000/3,end:2000/3},attack_3:{release:1250/3,end:750}}} as const;
export interface BasicStrike {id:string;action:BasicAction;startedAt:number;at:number;endAt:number;dx:number;dy:number;released:boolean;held?:{x:number;y:number}}
export interface ActorActionFact {
 type:'start'|'release'|'hit'|'cancel'|'gather';strikeId:string;actorId:string;action:BasicAction|'gather';at:number;
 x:number;y:number;dx:number;dy:number;avatarId?:string;targetId?:string;targetX?:number;targetY?:number;targetHeight?:number;
}
export function readActorAction(raw:unknown):ActorActionFact|undefined{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;const e=raw as ActorActionFact;
 if(!['start','release','hit','cancel','gather'].includes(e.type)||![...BASIC_ACTIONS,'gather'].includes(e.action)||
  ![e.strikeId,e.actorId].every(s=>typeof s==='string'&&s.length>0&&s.length<=200)||![e.at,e.x,e.y,e.dx,e.dy].every(Number.isFinite)||Math.hypot(e.dx,e.dy)<.001)return;
 if(e.type==='hit'&&(typeof e.targetId!=='string'||e.targetId.length>200||![e.targetX,e.targetY,e.targetHeight].every(Number.isFinite)))return;
 if(e.avatarId!==undefined&&(typeof e.avatarId!=='string'||e.avatarId.length>80))return;
 return {...e};
}
export function validBasicStrike(b:BasicStrike):boolean{return !!b&&typeof b.id==='string'&&b.id.length>0&&b.id.length<=200&&BASIC_ACTIONS.includes(b.action)&&
 [b.startedAt,b.at,b.endAt,b.dx,b.dy].every(Number.isFinite)&&b.at>=b.startedAt&&b.endAt>=b.at&&typeof b.released==='boolean'&&Math.hypot(b.dx,b.dy)>.001&&(!b.held||[b.held.x,b.held.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=1));}
export interface EnemyPresentation {actor:'wolf'|'boss';action:'idle'|'walk'|'attack'|'cast_field'|'cast_line'|'hit'|'death'|'appear';at:number;releaseAt?:number;dx:number;dy:number;lifeId:string}
