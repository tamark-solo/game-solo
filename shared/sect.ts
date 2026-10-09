import { hangNhacWalkable } from './hang-nhac';
import type { AvatarId, CharacterProfile } from './profiles';
import type { Position } from './world/types';

// Runtime interaction points on owner-authored walkable ground, not new map geometry.
export const SECT_STATIONS = [
  { id: 'guide', name: 'Người tiếp dẫn', area: 'Sân môn phái', x: 1536, y: 1168, avatarId: 'AVATAR-NOVICE-MALE' },
  { id: 'cultivation', name: 'Người hướng dẫn vận khí', area: 'Vườn thổ nạp', x: 736, y: 944, avatarId: 'AVATAR-NOVICE-FEMALE' },
  { id: 'training', name: 'Người coi luyện thuật', area: 'Sân luyện thuật phía đông', x: 2464, y: 880, avatarId: 'AVATAR-NOVICE-MALE' },
  { id: 'preparation', name: 'Người coi chuẩn bị', area: 'Khu chuẩn bị đông nam', x: 2392, y: 1488, avatarId: 'AVATAR-NOVICE-FEMALE' },
] as const;
export type StationId = typeof SECT_STATIONS[number]['id'];
export const INTERACTION_RANGE = 84;
export const CYCLE_PHASE_MS = 3000;
export const CULTIVATION_GATE = 360;
export const LEVEL_THRESHOLDS = [0, 100, 220, 360] as const;
export interface SectProgress {
  hn01: boolean; hn02: boolean; foundation: 'none' | 'breathing' | 'spirit';
  cycleStep: number; level: number; activity: boolean; remainderMs: number;
  supplies: number; nextRecoveryAt: number;
}
export const initialSectProgress = (): SectProgress => ({ hn01: false, hn02: false, foundation: 'none',
  cycleStep: 0, level: 0, activity: false, remainderMs: 0, supplies: 0, nextRecoveryAt: 0 });
export type SectAction = 'talk' | 'accept_intro' | 'cycle_start' | 'cycle_step' | 'understanding' |
  'confirm_m01' | 'activity_start' | 'activity_stop' | 'confirm_level' | 'use_recovery';
export interface SectCommand { id: string; action: SectAction; stationId?: StationId; step?: number; level?: number; answer?: 'cultivation' | 'mp' }
export interface SectResult { requestId?: string; ok: boolean; reason?: string; duplicate?: boolean; stationId?: StationId }
export interface SectView extends SectProgress {
  profileId: string; cultivation: number; milestone: CharacterProfile['milestone']; savedAt: number;
  hp:number; practising:boolean;
  activityStatus: 'locked' | 'stopped' | 'running' | 'paused' | 'gate' | 'offline';
  cycleStatus: 'idle' | 'settling' | 'ready' | 'away' | 'combat' | 'confirm' | 'complete';
  cycleReadyAt: number;
}
export function readSectCommand(raw: unknown): SectCommand | undefined {
  if (!raw || typeof raw !== 'object') return;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(r.id) ||
    !['talk','accept_intro','cycle_start','cycle_step','understanding','confirm_m01','activity_start','activity_stop','confirm_level','use_recovery'].includes(String(r.action))) return;
  if (r.action === 'talk' && !SECT_STATIONS.some(s => s.id === r.stationId)) return;
  if (r.action === 'cycle_step' && (!Number.isInteger(r.step) || (r.step as number) < 0 || (r.step as number) > 2)) return;
  if (r.action === 'understanding' && r.answer !== 'cultivation' && r.answer !== 'mp') return;
  if (r.action === 'confirm_level' && r.level !== 1 && r.level !== 2) return;
  return { id: r.id, action: r.action as SectAction, ...(r.action === 'talk' ? { stationId: r.stationId as StationId } : {}),
    ...(r.action === 'cycle_step' ? { step: r.step as number } : {}), ...(r.action === 'understanding' ? { answer: r.answer as 'cultivation' | 'mp' } : {}),
    ...(r.action === 'confirm_level' ? { level:r.level as number } : {}) };
}
export const sectCommandKey = (command: SectCommand): string => JSON.stringify([command.action,command.stationId,command.step,command.answer,command.level]);
export function clearSectPath(from: Position, to: Position): boolean {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/4));
  for (let i=0;i<=steps;i++) if (!hangNhacWalkable({ x:from.x+(to.x-from.x)*i/steps, y:from.y+(to.y-from.y)*i/steps })) return false;
  return true;
}
export function nearStation(point: Position, id: StationId): boolean {
  const station = SECT_STATIONS.find(s=>s.id===id)!;
  return Math.hypot(point.x-station.x,point.y-station.y)<=INTERACTION_RANGE && clearSectPath(point,station);
}
export function progressionLabel(avatarId: AvatarId, level: number): string {
  return avatarId === 'CHR-SITU-NAN' ? level ? `Hồi phục I · tiến triển ${level}/3` : 'Linh thể · chưa xác nhận hồi phục nền' :
    level ? `Ngưng Khí tầng ${level} · mốc gameplay` : 'Chưa xác nhận tầng đầu';
}
export function guideText(avatarId: AvatarId): string {
  if (avatarId==='CHR-SITU-NAN') return 'Kiến thức tu luyện của ông vẫn còn. Lần vận hành này giúp ổn định sự hiện diện và khả năng thi triển của linh thể. Ba thuật đã có sẵn; đây là tiến trình hồi phục của chế độ chơi.';
  if (avatarId==='CHR-LI-MUWAN') return 'Hãy ổn định nền vận khí trước khi vận dụng đan–trận. Cô có thể tự luyện tập và chuẩn bị cho hành trình của mình. Kiếm Khí, Lôi Ấn và Ngự Phong Bộ đã dùng được từ đầu.';
  return 'Hãy bắt đầu bằng một vòng vận khí trong vườn thổ nạp. Tu vi tích lũy lâu dài, còn linh lực dùng để thi triển thuật. Kiếm Khí, Lôi Ấn và Ngự Phong Bộ đã dùng được từ đầu.';
}
export function validSectProgress(value: unknown, profile: Pick<CharacterProfile,'milestone'|'cultivation'|'avatarId'>): value is SectProgress {
  if (!value || typeof value!=='object') return false;
  const t=value as SectProgress;
  return typeof t.hn01==='boolean' && typeof t.hn02==='boolean' && typeof t.activity==='boolean' &&
    ['none','breathing','spirit'].includes(t.foundation) &&
    [t.cycleStep,t.level,t.supplies].every(n=>Number.isInteger(n)&&n>=0) && t.cycleStep<=4 && t.level<=3 &&
    Number.isFinite(t.remainderMs) && t.remainderMs>=0 && t.remainderMs<500 && Number.isFinite(t.nextRecoveryAt) && t.nextRecoveryAt>=0 &&
    (t.foundation==='none' || t.hn01 && t.foundation===(profile.avatarId==='CHR-SITU-NAN'?'spirit':'breathing')) &&
    (t.cycleStep===0 || t.foundation!=='none') && (!t.activity || t.hn02) &&
    (t.hn02 ? t.hn01 && t.cycleStep===4 && t.level>=1 && profile.milestone==='M01' && profile.cultivation>=LEVEL_THRESHOLDS[t.level]! :
      t.level===0 && profile.milestone==='introduction');
}
