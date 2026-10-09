import { schema, t, type SchemaType } from '@colyseus/schema';

export const Disciple = schema({
  name: t.string(), avatarId: t.string(),
  x: t.number(), y: t.number(), direction: t.string(),
  moving: t.boolean(), connected: t.boolean(), ack: t.number(),
  id: t.string(), profileId: t.string(), progressionKind: t.string(),
  hp: t.number(), mp: t.number(), casts: t.number(), practiceHits: t.number(), savedAt: t.number(),
  nextSwordAt: t.number(), nextThunderAt: t.number(), nextWindAt: t.number(), lastSpentAt: t.number(),
  castId: t.string(), castSkill: t.string(), castStartedAt: t.number(),
  castAimX: t.number(), castAimY: t.number(),
  motionLocked: t.boolean(), dashVX: t.number(), dashVY: t.number(),
}, 'PreviewDisciple');
export type Disciple = SchemaType<typeof Disciple>;
export const TrainingTargetState = schema({ id: t.string(), ownerId: t.string(), x: t.number(), y: t.number(), hp: t.number(), maxHp: t.number(), radius: t.number() }, 'TrainingTarget');
export const ProjectileState = schema({ id: t.string(), ownerId: t.string(), castId: t.string(), skillId:t.string(), x: t.number(), y: t.number(), dx: t.number(), dy: t.number(), traveled: t.number(), startedAt: t.number() }, 'R01Projectile');
export const CourtyardState = schema({
  players: t.map(Disciple), tick: t.number(), mapId: t.string(), mapVersion: t.string(),
  serverTime: t.number(), targets: t.map(TrainingTargetState), projectiles: t.map(ProjectileState),
}, 'PreviewCourtyardState');
export type CourtyardState = SchemaType<typeof CourtyardState>;
