import { moveUsingCollision, type Motion, type Input, type Position, type Rect } from './world';
import data from '../docs/data/mvp-rpg-content.json';

export const STARTER = data;
export type StarterScene = typeof STARTER.world.scenes[number];
export type StarterZone = typeof STARTER.world.zones[number];
export const REGION_RADIUS = 8;

export function starterScene(id: string): StarterScene {
  const scene = STARTER.world.scenes.find(s => s.id === id);
  if (!scene) throw new Error(`Không có scene: ${id}`);
  return scene;
}
export function inRect(point: Position, rect: Pick<Rect, 'x' | 'y' | 'w' | 'h'>, padding = 0): boolean {
  return point.x >= rect.x + padding && point.x <= rect.x + rect.w - padding &&
    point.y >= rect.y + padding && point.y <= rect.y + rect.h - padding;
}
export function starterZoneAt(sceneId: string, point: Position): StarterZone | undefined {
  return STARTER.world.zones.find(z => z.sceneId === sceneId && inRect(point, z.rect));
}
export function isStarterWalkable(sceneId: string, point: Position, radius = REGION_RADIUS): boolean {
  const scene = starterScene(sceneId);
  if (point.x < radius || point.y < radius || point.x > scene.width - radius || point.y > scene.height - radius) return false;
  const areas = STARTER.world.zones.filter(z => z.sceneId === sceneId).map(z => z.rect);
  if (sceneId === STARTER.world.mainSceneId) areas.push(...STARTER.world.corridors.map(c => c.rect));
  if (!areas.some(r => inRect(point, r, radius))) return false;
  return !STARTER.world.obstacles.filter(r => r.sceneId === sceneId).some(({ rect: r }) => {
    const cx = Math.max(r.x, Math.min(point.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(point.y, r.y + r.h));
    return Math.hypot(point.x - cx, point.y - cy) < radius;
  });
}
export function moveInStarter(sceneId: string, motion: Motion, input: Input, dt: number, speed = 80): Motion {
  return moveUsingCollision(motion, input, dt, speed, point => isStarterWalkable(sceneId, point));
}
