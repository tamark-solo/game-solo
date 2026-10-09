import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { HANG_NHAC, HANG_NHAC_AVATARS, hangNhacSpawn, hangNhacWalkable, moveInHangNhac } from '../shared/hang-nhac';
import { activeRegions, moveInEditor, parseProject } from '../shared/map-editor';
import { inside, navigationWalkable } from '../shared/navigation';
import { moveUsingCollision, type Motion } from '../shared/world';

test('release preserves approved owner geometry, source hash, background and native scale', () => {
  const bytes = readFileSync('docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json');
  const project = parseProject(JSON.parse(bytes.toString())), level = project.levels.find(l => l.id === HANG_NHAC.levelId)!;
  assert.equal(createHash('sha256').update(bytes).digest('hex'), HANG_NHAC.sourceSha256);
  assert.deepEqual(HANG_NHAC.blockers, activeRegions(level).filter(r => r.kind === 'block').map(({ spline, ...r }) => r));
  assert.equal(HANG_NHAC.blockers.length, 9);
  assert.deepEqual(HANG_NHAC.world.spawn, { x: 1616, y: 992 });
  assert.deepEqual(HANG_NHAC.character, { frameSize: [64, 96], anchor: [32, 88] });
  const image = readFileSync(`client/public${HANG_NHAC.background.url}`);
  assert.equal(createHash('sha256').update(image).digest('hex'), HANG_NHAC.background.sha256);
  assert.ok(HANG_NHAC.background.bytes < 3_000_000);
  for (let i = 0; i < 20; i++) assert.ok(hangNhacWalkable(hangNhacSpawn(i)));
  assert.equal(new Set(Array.from({ length: 20 }, (_, i) => JSON.stringify(hangNhacSpawn(i)))).size, 20);
  assert.equal(HANG_NHAC_AVATARS.length, 3);
});

test('walking across the real plaza stops at owner blockers with the same position as Editor Test', () => {
  const project = parseProject(JSON.parse(readFileSync('docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json', 'utf8')));
  const level = project.levels.find(l => l.id === HANG_NHAC.levelId)!;
  for (const input of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 1 }, { x: -1, y: -1 }]) {
    let runtime: Motion = { ...HANG_NHAC.world.spawn, direction: 'south', moving: false }, editor = { ...runtime };
    for (let i = 0; i < 500; i++) {
      runtime = moveInHangNhac(runtime, input, 1 / 30); editor = moveInEditor(level, editor, input, 1 / 30);
      assert.deepEqual(runtime, editor); assert.ok(hangNhacWalkable(runtime));
      assert.ok(!HANG_NHAC.blockers.some(r => inside(runtime, r.points)));
    }
    if (input.y === 0) assert.ok(!runtime.moving, 'cardinal movement must stop at the plaza side blockers');
  }
});

test('foot circle cannot tunnel through a thin polygon during a long frame', () => {
  const surface = { width: 300, height: 300, walkPolicy: 'full' as const, walkable: [], blockers: [
    { points: [{ x: 100, y: 0 }, { x: 102, y: 0 }, { x: 102, y: 300 }, { x: 100, y: 300 }] },
  ] };
  const next = moveUsingCollision({ x: 80, y: 150, direction: 'east', moving: false }, { x: 1, y: 0 }, 4, 800,
    p => navigationWalkable(surface, p));
  assert.ok(next.x <= 92); assert.ok(navigationWalkable(surface, next));
  assert.equal(navigationWalkable(surface, { x: NaN, y: 150 }), false);
});
