// Compatibility facade for the R01 protocol and existing saves.
export { SKILL_DEFINITIONS as R01 } from './skills/definitions';
export { SkillEngine as R01Engine } from './skills/engine';
export { readCastCommand, commandKey, cooldownField } from './skills/commands';
export { applyR01Movement } from './skills/movement';
export type { R01MotionState, CombatActor, CastCommand, CastResult, TrainingTarget, Projectile, SkillEvent } from './skills/contracts';
