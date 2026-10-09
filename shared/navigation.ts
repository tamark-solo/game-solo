import type { Position } from './world/types';

export interface NavigationSurface {
  width: number; height: number; walkPolicy: 'full' | 'regions';
  walkable: Array<{ points: Position[] }>;
  blockers: Array<{ points: Position[] }>;
}

export function inside(p: Position, points: Position[]): boolean {
  let yes = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) yes = !yes;
  }
  return yes;
}

export function edgeDistance(p: Position, points: Position[]): number {
  let closest = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    closest = Math.min(closest, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return closest;
}

// Editor, client prediction and server authority use this same foot-circle test.
export function navigationWalkable(surface: NavigationSurface, p: Position, radius = 8): boolean {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < radius || p.y < radius ||
      p.x > surface.width - radius || p.y > surface.height - radius) return false;
  if (surface.walkPolicy === 'regions') {
    const walk = surface.walkable;
    if (!walk.some(r => inside(p, r.points))) return false;
    if (!walk.some(r => inside(p, r.points) && edgeDistance(p, r.points) >= radius)) {
      for (let i = 0; i < 32; i++) {
        const a = i * Math.PI / 16, q = { x: p.x + Math.cos(a) * (radius - .001), y: p.y + Math.sin(a) * (radius - .001) };
        if (!walk.some(r => inside(q, r.points))) return false;
      }
    }
  }
  return !surface.blockers.some(r => inside(p, r.points) || edgeDistance(p, r.points) < radius);
}
