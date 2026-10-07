import { schema, t, type SchemaType } from '@colyseus/schema';
import { move, type Direction } from './world';

export const MoveInput = schema({ moveX: t.number(), moveY: t.number() }, 'PreviewMoveInput');
export type MoveInput = SchemaType<typeof MoveInput>;
export interface MovementState { x: number; y: number; direction: string; moving: boolean }
export const INPUT_HZ = 30;
export const PATCH_MS = 50;

export function sanitizeMovement(command: { moveX: number; moveY: number }): void {
  if (!Number.isFinite(command.moveX) || !Number.isFinite(command.moveY) ||
      Math.abs(command.moveX) > 1 || Math.abs(command.moveY) > 1) {
    command.moveX = 0; command.moveY = 0;
  }
}

// The client replays exactly the same movement/collision step as the server.
export function applyMovement(state: MovementState, command: { moveX: number; moveY: number }, dt: number): void {
  Object.assign(state, move({ x: state.x, y: state.y, direction: state.direction as Direction, moving: state.moving },
    { x: command.moveX, y: command.moveY }, dt));
}
