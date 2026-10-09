import type { MovementState } from '../world/movement';
import type { SkillId } from '../profiles';
import type { Position, Input } from '../world/types';

export interface R01MotionState extends MovementState { motionLocked?: boolean; dashVX?: number; dashVY?: number }
export interface CombatActor extends R01MotionState {
  id: string; connected: boolean; hp: number; mp: number; casts: number; practiceHits: number;
  nextSwordAt: number; nextThunderAt: number; nextWindAt: number; lastSpentAt: number;
  castId: string; castSkill: string; castStartedAt: number; castAimX?: number; castAimY?: number;
}
export interface CastCommand { id: string; skillId: SkillId; aimX: number; aimY: number; targetId: string; inputSeq?:number }
export interface CastResult { requestId: string; accepted: boolean; reason?: string; castId?: string; skillId?: SkillId; duplicate?: boolean }
export interface TrainingTarget extends Position { id: string; ownerId: string; hp: number; maxHp: number; radius: number }
export interface Projectile extends Position { skillId?: SkillId; id: string; ownerId: string; castId: string; dx: number; dy: number; traveled: number; startedAt: number }
export interface SkillEvent extends Position {
  type: 'cast' | 'release' | 'cancel' | 'hit' | 'miss' | 'arrival'; castId: string; actorId: string; skillId: SkillId; at: number;
  dx: number; dy: number; targetId?: string; targetX?: number; targetY?: number; damage?: number;
}
export interface ActiveCast { id: string; skill: SkillId; startedAt: number; dx: number; dy: number; origin: Position;
  targetId: string; target?: Position; released: boolean; resolved: boolean; arrived: boolean; held: Input; movementReleased: boolean }
export interface Receipt { command: string; result: CastResult }
