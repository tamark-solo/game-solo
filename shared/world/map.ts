import type { Position, Rect } from './types';

export const WORLD = {
  width: 960, height: 640,
  bounds: { x: 64, y: 210, w: 832, h: 242 },
  spawn: { x: 480, y: 370 },
  radius: 8,
  speed: 80,
  obstacles: [
    { id: 'left-platform', x: 68, y: 210, w: 192, h: 70 },
    { id: 'notice-board', x: 742, y: 210, w: 132, h: 75 },
    { id: 'test-pillar', x: 610, y: 339, w: 28, h: 24 },
  ] satisfies Rect[],
};

export function isWalkable(position: Position, radius = WORLD.radius): boolean {
  const b = WORLD.bounds;
  if (position.x - radius < b.x || position.x + radius > b.x + b.w ||
      position.y - radius < b.y || position.y + radius > b.y + b.h) return false;
  return !WORLD.obstacles.some(r => {
    const closestX = Math.max(r.x, Math.min(position.x, r.x + r.w));
    const closestY = Math.max(r.y, Math.min(position.y, r.y + r.h));
    return Math.hypot(position.x - closestX, position.y - closestY) < radius;
  });
}
