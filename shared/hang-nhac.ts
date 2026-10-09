import release from './data/hang-nhac.json';
import { navigationWalkable, type NavigationSurface } from './navigation';
import { moveUsingCollision } from './world/movement';
import { type Direction, type Input, type Motion, type Position } from './world/types';
import type { MovementState } from './world/movement';

export const HANG_NHAC = release;
export const HANG_NHAC_ROOM = 'hang_nhac';
export const HANG_NHAC_AVATARS = ['CHR-WANG-LIN-CHIBI', 'CHR-SITU-NAN', 'CHR-LI-MUWAN'] as const;
const surface: NavigationSurface = { ...release.world, walkPolicy: release.walkPolicy as NavigationSurface['walkPolicy'],
  walkable: release.walkable, blockers: release.blockers };
export const hangNhacWalkable = (p: Position, radius = release.world.playerRadius): boolean => navigationWalkable(surface, p, radius);
export const moveInHangNhac = (motion: Motion, input: Input, dt: number): Motion =>
  moveUsingCollision(motion, input, dt, release.movementSpeed, hangNhacWalkable);
export function applyHangNhacMovement(state: MovementState, command: { moveX: number; moveY: number }, dt: number): void {
  Object.assign(state, moveInHangNhac({ x: state.x, y: state.y, direction: state.direction as Direction, moving: state.moving },
    { x: command.moveX, y: command.moveY }, dt));
}

export function hangNhacSpawn(slot: number): Position {
  const origin = release.world.spawn;
  if (slot === 0) return { ...origin };
  // Spread arrivals only onto already walkable ground; never alter owner polygons.
  for (let ring = 1, seen = 0; ring <= 10; ring++) {
    for (let x = -ring; x <= ring; x++) for (let y = -ring; y <= ring; y++) {
      if (Math.abs(x) !== ring && Math.abs(y) !== ring) continue;
      const candidate = { x: origin.x + x * 32, y: origin.y + y * 32 };
      if (hangNhacWalkable(candidate) && ++seen === slot) return candidate;
    }
  }
  return { ...origin };
}
