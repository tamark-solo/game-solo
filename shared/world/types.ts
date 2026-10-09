export const DIRECTIONS = ['south', 'west', 'east', 'north'] as const;
export type Direction = typeof DIRECTIONS[number];
export type MotionState = 'stand' | 'walk';
export interface Position { x: number; y: number }
export interface Motion extends Position { direction: Direction; moving: boolean }
export interface Input { x: number; y: number }
export interface Rect { id: string; x: number; y: number; w: number; h: number }
