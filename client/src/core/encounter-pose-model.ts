import {actorDirection,type ActorDirection,type EnemyPresentation} from '@shared/actor-actions';
import type {ChapterView} from '@shared/chapter';
/** Snapshot -> pose, using server phase/clock; presentation never resolves a warning. */
export function encounterPose(view:ChapterView,now:number):{actor:'wolf'|'boss';action:string;direction:ActorDirection;age:number}|undefined{
 const enemy=view.enemy;if(!enemy)return;const p=view.enemyPose;
 const actor=p?.actor??(enemy.maxHp===240?'boss':'wolf');let action=p?.action??(enemy.hp<=0?'death':'idle');
 if(actor==='wolf'&&(action==='cast_line'||action==='cast_field'))action='attack';
 return {actor,action,direction:actorDirection(p?.dx??0,p?.dy??1),age:Math.max(0,now-(p?.at??view.now))};
}
