import type {SkillEvent,Projectile} from '../skills/contracts';
export const ANIMATION_ARENA_ROOM='actor_animation_arena';
export type ArenaKind='wang'|'wolf'|'boss';
export interface ArenaActor {
 id:ArenaKind;kind:ArenaKind;name:string;x:number;y:number;direction:string;moving:boolean;
 hp:number;maxHp:number;mp:number;radius:number;aimX:number;aimY:number;travel:number;
 action:string;actionAt:number;actionId:string;hitAt:number;deadAt:number;
 castId:string;castSkill:string;castStartedAt:number;castAimX?:number;castAimY?:number;
 nextSwordAt:number;nextThunderAt:number;nextWindAt:number;
}
export interface ArenaWarning {id:string;actorId:string;action:string;x:number;y:number;dx:number;dy:number;radius:number;range:number;releaseAt:number;locked:boolean}
export interface ArenaSnapshot {round:number;now:number;actors:ArenaActor[];projectiles:Projectile[];warnings:ArenaWarning[];ai:boolean;ack:number}
export interface ArenaEvent {round:number;event:SkillEvent}
export interface ArenaInput {round:number;seq:number;x:number;y:number;run:boolean}
export interface ArenaCommand {round:number;id:string;inputSeq:number;skill:string;aimX:number;aimY:number;targetId:string}
export interface ArenaResult {id:string;accepted:boolean;reason?:string;duplicate?:boolean}
