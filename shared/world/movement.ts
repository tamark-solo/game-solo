import { WORLD, isWalkable } from './map';
import type { Direction, Input, Motion, Position } from './types';

export function normalizeInput(input: Input): Input {
  const length = Math.hypot(input.x, input.y);
  return length > 1 ? { x: input.x / length, y: input.y / length } : input;
}

export function move(motion: Motion, rawInput: Input, dt: number, speed = WORLD.speed): Motion {
  return moveUsingCollision(motion, rawInput, dt, speed, position => isWalkable(position));
}

export function moveUsingCollision(motion: Motion, rawInput: Input, dt: number, speed: number,
  walkable: (position: Position) => boolean): Motion {
  const input = normalizeInput(rawInput);
  let direction = motion.direction;
  if (Math.abs(input.x) > Math.abs(input.y)) direction = input.x > 0 ? 'east' : 'west';
  else if (Math.abs(input.y) > Math.abs(input.x)) direction = input.y > 0 ? 'south' : 'north';
  else if (input.x !== 0 && input.y !== 0) {
    const horizontal = direction === 'east' || direction === 'west';
    direction = horizontal ? (input.x > 0 ? 'east' : 'west') : (input.y > 0 ? 'south' : 'north');
  }
  let x = motion.x;
  let y = motion.y;
  // Small spatial steps prevent a long frame or fast input from crossing a thin obstacle.
  const distance = Math.max(0, Math.min(dt, 0.25)) * speed;
  const steps = Math.max(1, Math.ceil(distance / 4));
  for (let i = 0; i < steps; i++) {
    const nextX = x + input.x * distance / steps;
    if (walkable({ x: nextX, y })) x = nextX;
    const nextY = y + input.y * distance / steps;
    if (walkable({ x, y: nextY })) y = nextY;
  }
  return { x, y, direction, moving: Math.hypot(x - motion.x, y - motion.y) > 0.001 };
}

export interface MovementState { x: number; y: number; direction: string; moving: boolean }

// The client replays exactly the same movement/collision step as the server.
export function applyMovement(state: MovementState, command: { moveX: number; moveY: number }, dt: number): void {
  Object.assign(state, move({ x: state.x, y: state.y, direction: state.direction as Direction, moving: state.moving },
    { x: command.moveX, y: command.moveY }, dt));
}
