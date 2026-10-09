import { HANG_NHAC, HANG_NHAC_AVATARS } from './hang-nhac';
import type { Direction } from './world/types';
import { initialSectProgress, type SectProgress } from './sect';

export type AvatarId = typeof HANG_NHAC_AVATARS[number];
export const R01_IDS = ['sword', 'thunder', 'wind'] as const;
export type SkillId = typeof R01_IDS[number];
export const CHARACTER_INFO: Record<AvatarId, { name: string; progressionKind: 'cultivation' | 'recovery'; introduction: string }> = {
  'CHR-WANG-LIN-CHIBI': { name: 'Vương Lâm', progressionKind: 'cultivation', introduction: 'Nhập môn · tu luyện' },
  'CHR-SITU-NAN': { name: 'Tư Đồ Nam', progressionKind: 'recovery', introduction: 'Linh thể · hồi phục hiện diện' },
  'CHR-LI-MUWAN': { name: 'Lý Mộ Uyển', progressionKind: 'cultivation', introduction: 'Nhập môn · nền đan–trận' },
};
export function isAvatarId(value: unknown): value is AvatarId { return HANG_NHAC_AVATARS.some(id => id === value); }
export function cleanPlayerName(value: unknown, fallback: string): string {
  return (typeof value === 'string' ? value : '').normalize('NFC').replace(/[\u0000-\u001f\u007f<>&]/g, '').trim().slice(0, 24) || fallback;
}
export interface CharacterProfile {
  schema: 2; id: string; accountId: string; avatarId: AvatarId; name: string;
  mapId: string; mapVersion: string; x: number; y: number; direction: Direction;
  progressionKind: 'cultivation' | 'recovery'; milestone: 'introduction' | 'M01'; cultivation: number; sect: SectProgress;
  skills: SkillId[]; hp: number; mp: number; casts: number; practiceHits: number;
  nextSwordAt: number; nextThunderAt: number; nextWindAt: number; lastSpentAt: number;
  revision: number; createdAt: number; updatedAt: number;
}
export function initialProfile(id: string, accountId: string, avatarId: AvatarId, now: number): CharacterProfile {
  return { schema: 2, id, accountId, avatarId, name: CHARACTER_INFO[avatarId].name,
    mapId: HANG_NHAC.id, mapVersion: HANG_NHAC.version, ...HANG_NHAC.world.spawn, direction: 'south',
    progressionKind: CHARACTER_INFO[avatarId].progressionKind, milestone: 'introduction', cultivation: 0, sect: initialSectProgress(),
    skills: [...R01_IDS], hp: 100, mp: 100, casts: 0, practiceHits: 0,
    nextSwordAt: 0, nextThunderAt: 0, nextWindAt: 0, lastSpentAt: 0, revision: 0, createdAt: now, updatedAt: now };
}
export type PublicProfile = Omit<CharacterProfile, 'accountId'>;
export function publicProfile(profile: CharacterProfile): PublicProfile { const { accountId, ...value } = profile; return value; }
