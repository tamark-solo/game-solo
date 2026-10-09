import { HANG_NHAC, hangNhacWalkable } from '../hang-nhac';
import { moveUsingCollision, type Position, type Direction } from '../world';
import type { R01MotionState } from './contracts';

export function applyR01Movement(state: R01MotionState, command: { moveX: number; moveY: number }, dt: number): void {
  const vx = state.dashVX ?? 0, vy = state.dashVY ?? 0, speed = Math.hypot(vx, vy);
  const input = speed > 0 ? { x: vx / speed, y: vy / speed } : state.motionLocked ? { x: 0, y: 0 } : { x: command.moveX, y: command.moveY };
  Object.assign(state, moveUsingCollision({ x: state.x, y: state.y, direction: state.direction as Direction, moving: state.moving },
    input, dt, speed || HANG_NHAC.movementSpeed, hangNhacWalkable));
}
export function clearPath(from: Position, to: Position, radius = 8): boolean {
  const distance = Math.hypot(to.x - from.x, to.y - from.y), steps = Math.max(1, Math.ceil(distance / 4));
  for (let i = 0; i <= steps; i++) if (!hangNhacWalkable({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }, radius)) return false;
  return true;
}
