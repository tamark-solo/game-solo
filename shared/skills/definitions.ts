import type { SkillId } from '../profiles';
import type { SkillAimPolicy } from './aim';
export interface SkillDefinition {
  name:string;behavior:string;aim:SkillAimPolicy;cooldownField:'nextSwordAt'|'nextThunderAt'|'nextWindAt';interruptible:boolean;shortcut:string;
  cost:number;cooldown:number;release:number;recovery:number;end:number;range:number;
  speed?:number;damage?:number;resolve?:number;duration?:number;
}
// Stable gameplay IDs are persisted in profiles. New rights require a profile migration.
export const SKILL_DEFINITIONS = {
  sword: { name:'Kiếm Khí', behavior:'projectile', aim:'direction', cooldownField:'nextSwordAt', interruptible:true,shortcut:'1',
    cost:10, cooldown:1500, release:250, recovery:375, end:666.667, range:360, speed:480, damage:30 },
  thunder: { name:'Lôi Ấn', behavior:'targeted-strike', aim:'target', cooldownField:'nextThunderAt', interruptible:true,shortcut:'2',
    cost:25, cooldown:5000, release:333.333, recovery:583.333, end:708.333, range:280, resolve:500, damage:45 },
  wind: { name:'Ngự Phong Bộ', behavior:'dash', aim:'direction', cooldownField:'nextWindAt', interruptible:false,shortcut:'3',
    cost:10, cooldown:3000, release:166.667, recovery:416.667, end:583.333, range:160, duration:250 },
} as const satisfies Record<SkillId,SkillDefinition>;
