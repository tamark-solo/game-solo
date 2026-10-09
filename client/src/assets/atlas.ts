import { DIRECTIONS, type Direction, type MotionState } from '@shared/world/types';

export interface ActorDefinition {
  id: string; name: string; role: 'story_npc' | 'player_template'; frameCount: number;
  atlasUrl: string; metadataUrl: string; sourcePath: string;
  previewOnlyDirection?: Direction;
  defaultAnimationFPS?: number;
  defaultGaitCycleDistancePx?: number;
  defaultMovementSpeedPxPerSecond?: number;
  movementKind?: 'walk' | 'glide' | 'static';
}
export interface FrameRect { x: number; y: number; w: number; h: number }
export interface Atlas {
  actorId: string; width: number; height: number;
  frameSize: [number, number]; anchor: [number, number]; hoverHeight: number;
  frames: Record<string, FrameRect>;
  animations: Record<string, string[]>;
  canWalk: boolean;
}
function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name}: cần một object.`);
  return value as Record<string, unknown>;
}
function pair(value: unknown, name: string): [number, number] {
  if (!Array.isArray(value) || value.length !== 2 || value.some(n => typeof n !== 'number' || !Number.isFinite(n)))
    throw new Error(`${name}: cần hai số hữu hạn.`);
  return [value[0], value[1]];
}
export function normalizeAtlas(raw: unknown, requiredDirections: readonly Direction[] = DIRECTIONS): Atlas {
  if (!requiredDirections.length || new Set(requiredDirections).size !== requiredDirections.length || requiredDirections.some(d => !DIRECTIONS.includes(d)))
    throw new Error('Danh sách hướng preview không hợp lệ.');
  const data = record(raw, 'Atlas');
  if (!['pixel-atlas-1', 'pixel-static-atlas-1'].includes(String(data.schemaVersion))) throw new Error('Schema atlas chưa được hỗ trợ.');
  const frameSize = pair(data.frameSizePx, 'frameSizePx');
  const anchor = pair(data.anchorPx ?? data.footAnchorPx, 'anchorPx');
  if (frameSize.some(n => !Number.isInteger(n) || n <= 0) || anchor.some((n, i) => n < 0 || n > frameSize[i])) throw new Error('Kích thước/điểm neo nằm ngoài frame.');
  const size = record(record(data.meta, 'meta').size, 'meta.size');
  const width = Number(size.w), height = Number(size.h);
  if (![width, height].every(n => Number.isInteger(n) && n > 0)) throw new Error('Kích thước atlas không hợp lệ.');
  const frames: Atlas['frames'] = {};
  for (const [id, value] of Object.entries(record(data.frames, 'frames'))) {
    const entry = record(value, id), rect = record(entry.frame, `${id}.frame`);
    const r = { x: Number(rect.x), y: Number(rect.y), w: Number(rect.w), h: Number(rect.h) };
    if (entry.rotated || entry.trimmed || !Object.values(r).every(Number.isInteger) || r.x < 0 || r.y < 0 ||
        r.w !== frameSize[0] || r.h !== frameSize[1] || r.x + r.w > width || r.y + r.h > height)
      throw new Error(`Frame ${id}: rectangle/cắt hình không hợp lệ.`);
    if (entry.anchorPx && pair(entry.anchorPx, id).some((n, i) => n !== anchor[i])) throw new Error(`Frame ${id}: điểm neo không nhất quán.`);
    frames[id] = r;
  }
  if (!Object.keys(frames).length) throw new Error('Atlas không có frame.');
  const animations: Atlas['animations'] = {};
  for (const [name, value] of Object.entries(record(data.animations, 'animations'))) {
    if (!Array.isArray(value) || !value.length || value.some(id => typeof id !== 'string' || !frames[id])) throw new Error(`Animation ${name}: thiếu frame.`);
    animations[name.replace(/^static_/, 'stand_')] = value;
  }
  for (const d of requiredDirections) if (!animations[`stand_${d}`]) throw new Error(`Thiếu hướng đứng ${d}.`);
  const walkingDirections = requiredDirections.filter(d => animations[`walk_${d}`]);
  if (walkingDirections.length !== 0 && walkingDirections.length !== requiredDirections.length) throw new Error('Bộ đi chưa đủ các hướng yêu cầu.');
  if (typeof data.characterId !== 'string') throw new Error('Thiếu characterId.');
  return { actorId: data.characterId, width, height, frameSize, anchor,
    hoverHeight: typeof data.hoverHeightPx === 'number' ? data.hoverHeightPx : 0,
    frames, animations, canWalk: walkingDirections.length === requiredDirections.length };
}
