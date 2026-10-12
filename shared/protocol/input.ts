import { schema, t, type SchemaType } from '@colyseus/schema';

export const MoveInput = schema({ moveX: t.number(), moveY: t.number(), fast:t.boolean() }, 'PreviewMoveInput');
export type MoveInput = SchemaType<typeof MoveInput>;

export function sanitizeMovement(command: { moveX: number; moveY: number; fast?:boolean }): void {
  if ('fast' in command) command.fast = command.fast === true;
  if (!Number.isFinite(command.moveX) || !Number.isFinite(command.moveY) ||
      Math.abs(command.moveX) > 1 || Math.abs(command.moveY) > 1) {
    command.moveX = 0; command.moveY = 0; if ('fast' in command) command.fast = false;
  }
}
