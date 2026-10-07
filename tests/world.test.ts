import assert from 'node:assert/strict';
import { test } from 'node:test';
import { move, isWalkable, WORLD, type Motion } from '../shared/world';
import { sanitizeMovement } from '../shared/netcode';

const start = (): Motion => ({ ...WORLD.spawn, direction: 'south', moving: false });
test('movement covers 80 px in one second independently of frame rate', () => {
  for (const rate of [20, 30, 60, 120]) {
    let p = start();
    for (let i = 0; i < rate; i++) p = move(p, { x: 1, y: 0 }, 1 / rate);
    assert.ok(Math.abs(p.x - WORLD.spawn.x - 80) < 1e-8);
    assert.equal(p.direction, 'east');
  }
});
test('diagonal input has the same speed as cardinal input', () => {
  let p = start();
  for (let i = 0; i < 60; i++) p = move(p, { x: -1, y: 1 }, 1 / 60);
  assert.ok(Math.abs(Math.hypot(p.x - WORLD.spawn.x, p.y - WORLD.spawn.y) - 80) < 1e-8);
});
test('thin obstacle blocks the foot collider even in a long movement step', () => {
  const p = move({ x: 600, y: 351, direction: 'east', moving: false }, { x: 1, y: 0 }, .25, 160);
  assert.ok(p.x <= 602);
  assert.ok(isWalkable(p));
});
test('map boundary remains solid and stopping retains the previous facing', () => {
  let p = start();
  for (let i = 0; i < 200; i++) p = move(p, { x: 0, y: 1 }, .05);
  assert.ok(p.y <= WORLD.bounds.y + WORLD.bounds.h - WORLD.radius);
  assert.ok(isWalkable(p));
  const stopped = move({ ...p, direction: 'west' }, { x: 0, y: 0 }, .05);
  assert.equal(stopped.direction, 'west'); assert.equal(stopped.moving, false);
});
test('native movement input cannot inject invalid axes into the simulation', () => {
  for (const value of [NaN, Infinity, -Infinity, 100, -2]) {
    const command = { moveX: value, moveY: 1 }; sanitizeMovement(command);
    assert.deepEqual(command, { moveX: 0, moveY: 0 });
  }
  const diagonal = { moveX: -1, moveY: 1 }; sanitizeMovement(diagonal);
  assert.deepEqual(diagonal, { moveX: -1, moveY: 1 });
});
