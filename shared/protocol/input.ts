import { schema, t, type SchemaType } from '@colyseus/schema';

export const MoveInput = schema({ moveX: t.number(), moveY: t.number() }, 'PreviewMoveInput');
export type MoveInput = SchemaType<typeof MoveInput>;

export function sanitizeMovement(command: { moveX: number; moveY: number }): void {
  if (!Number.isFinite(command.moveX) || !Number.isFinite(command.moveY) ||
      Math.abs(command.moveX) > 1 || Math.abs(command.moveY) > 1) {
    command.moveX = 0; command.moveY = 0;
  }
}
