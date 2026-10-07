export const DIRECTIONS = ['south', 'west', 'east', 'north'] as const;
export type Direction = typeof DIRECTIONS[number];
export type MotionState = 'stand' | 'walk';
export interface Position { x: number; y: number }
export interface Motion extends Position { direction: Direction; moving: boolean }
export interface Input { x: number; y: number }
export interface Rect { id: string; x: number; y: number; w: number; h: number }

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

export function normalizeInput(input: Input): Input {
  const length = Math.hypot(input.x, input.y);
  return length > 1 ? { x: input.x / length, y: input.y / length } : input;
}

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

export function move(motion: Motion, rawInput: Input, dt: number, speed = WORLD.speed): Motion {
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
    if (isWalkable({ x: nextX, y })) x = nextX;
    const nextY = y + input.y * distance / steps;
    if (isWalkable({ x, y: nextY })) y = nextY;
  }
  return { x, y, direction, moving: Math.hypot(x - motion.x, y - motion.y) > 0.001 };
}
