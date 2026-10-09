import { R01_IDS, type SkillId } from '../profiles';
import type { CastCommand } from './contracts';
import { SKILL_DEFINITIONS } from './definitions';

export function readCastCommand(raw: unknown): CastCommand | undefined {
  if (!raw || typeof raw !== 'object') return;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(r.id) || !R01_IDS.some(id => id === r.skillId) ||
      typeof r.aimX !== 'number' || typeof r.aimY !== 'number' || !Number.isFinite(r.aimX) || !Number.isFinite(r.aimY) ||
      Math.abs(r.aimX) > 1 || Math.abs(r.aimY) > 1 || Math.hypot(r.aimX, r.aimY) < .001 ||
      typeof r.targetId !== 'string' || r.targetId.length > 80 ||
      (r.inputSeq!==undefined&&(typeof r.inputSeq!=='number'||!Number.isSafeInteger(r.inputSeq)||r.inputSeq<1||r.inputSeq>0x7fffffff))) return;
  return { id: r.id, skillId: r.skillId as SkillId, aimX: r.aimX, aimY: r.aimY, targetId: r.targetId,...(r.inputSeq!==undefined?{inputSeq:r.inputSeq as number}:{}) };
}
// Preserve keys of legacy receipts; new sequenced commands include their input boundary.
export const commandKey = (r: CastCommand): string => JSON.stringify([r.skillId, r.aimX, r.aimY, r.targetId,...(r.inputSeq!==undefined?[r.inputSeq]:[])]);
export const cooldownField = (skill: SkillId) => SKILL_DEFINITIONS[skill].cooldownField;
