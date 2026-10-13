import assert from 'node:assert/strict';
import test from 'node:test';
import { QuestNavigation } from '../../client/src/core/quest-navigation';
import { HANG_NHAC, hangNhacWalkable, moveInHangNhac } from '../../shared/hang-nhac';
import { clearSectPath, nearStation, SECT_STATIONS } from '../../shared/sect';
import { sectRoute } from '../../shared/sect-route';
import type { Motion, Position } from '../../shared/world/types';

const direct = (from: Position, to: Position): Position[] => [{ ...from }, { ...to }];
const openOptions = { route: direct, clearPath: () => true };

test('autoroute follows real owner collision to all four NPC stations, including obstacle detours', () => {
  const originalMap = JSON.stringify(HANG_NHAC);
  let sawDetour = false;
  for (const station of SECT_STATIONS) {
    const from = HANG_NHAC.world.spawn;
    const route = sectRoute(from, station)!;
    if (!clearSectPath(from, station)) { assert.ok(route.length > 2); sawDetour = true; }
    let actor: Motion = { ...from, direction: 'south', moving: false };
    const navigation = new QuestNavigation();
    assert.equal(navigation.start(actor, station, station.name, 0), true);
    for (let frame = 1; frame <= 5000 && navigation.status === 'moving'; frame++) {
      navigation.update(actor, frame * 1000 / 30);
      const input = navigation.input;
      if (navigation.status === 'moving') {
        assert.equal(input.fast, true);
        assert.ok(Math.hypot(input.x, input.y) <= 1.000001);
      }
      const next = moveInHangNhac(actor, input, 1 / 30);
      assert.ok(hangNhacWalkable(next), `${station.id}: ${JSON.stringify(next)}`);
      assert.ok(Math.hypot(next.x - actor.x, next.y - actor.y) <= 4.000001, 'no teleport or speed increase');
      actor = next;
    }
    assert.equal(navigation.status, 'arrived', `${station.id}: ${JSON.stringify(navigation.diagnostics)}`);
    assert.ok(nearStation(actor, station.id));
    assert.equal(navigation.diagnostics.replans, 0, `${station.id}: a valid path should not need a retry`);
    assert.deepEqual(navigation.input, { x: 0, y: 0 });
  }
  assert.equal(sawDetour, true);
  assert.equal(JSON.stringify(HANG_NHAC), originalMap);
});

test('arrival needs both proximity and a clear path to the destination', () => {
  const navigation = new QuestNavigation({ route: direct, clearPath: from => from.y === 0 });
  assert.equal(navigation.start({ x: 0, y: 0 }, { x: 100, y: 0 }, 'NPC'), true);
  navigation.update({ x: 99, y: 4 }, 100);
  assert.equal(navigation.status, 'moving', 'close on the far side of a wall is not arrival');
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
  navigation.update({ x: 84, y: 0 }, 600);
  assert.equal(navigation.status, 'arrived');
  assert.equal(navigation.label, 'NPC');
  assert.deepEqual(navigation.remainingRoute, []);
});

test('starting within clear arrival range is already complete and does not run pathfinding', () => {
  const navigation = new QuestNavigation({ clearPath: () => true, route: () => { throw new Error('unneeded route'); } });
  assert.equal(navigation.start({ x: 90, y: 0 }, { x: 100, y: 0 }), true);
  assert.equal(navigation.status, 'arrived');
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
});

test('unreachable endpoints stop immediately without synthetic movement', () => {
  const navigation = new QuestNavigation();
  const blocked = HANG_NHAC.blockers[0].points[0];
  assert.equal(navigation.start(HANG_NHAC.world.spawn, blocked), false);
  assert.equal(navigation.status, 'blocked');
  assert.equal(navigation.reason, 'no-route');
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
  assert.deepEqual(navigation.remainingRoute, []);
});

test('passed vertices advance forward but only when the next segment is collision clear', () => {
  let allowNext = false;
  const navigation = new QuestNavigation({ arrivalRadius: 1,
    route: (from, to) => [from, { x: 20, y: 0 }, to],
    clearPath: (_from, to) => to.y === 0 || allowNext });
  navigation.start({ x: 0, y: 0 }, { x: 20, y: 100 }, '', 0);
  navigation.update({ x: 23, y: 0 }, 100);
  assert.ok(navigation.input.x < 0, 'cannot skip the waypoint through a blocked corner');
  assert.equal(navigation.input.y, 0);
  allowNext = true;
  navigation.update({ x: 23, y: 0 }, 200);
  assert.ok(navigation.input.y > .99, 'moves along next segment after a small overshoot');
  assert.equal(navigation.remainingRoute.length, 2);
});

test('stuck movement retries a bounded number of times and ends with zero input', () => {
  let plans = 0;
  const navigation = new QuestNavigation({ ...openOptions, stuckMs: 500, maxReplans: 2,
    route: (from, to) => { plans++; return direct(from, to); } });
  const position = { x: 0, y: 0 };
  navigation.start(position, { x: 100, y: 0 }, '', 0);
  navigation.update(position, 500);
  navigation.update(position, 1000);
  assert.equal(navigation.status, 'moving');
  navigation.update(position, 1500);
  assert.equal(navigation.status, 'blocked');
  assert.equal(navigation.reason, 'stuck');
  assert.equal(navigation.diagnostics.replans, 2);
  assert.equal(plans, 3);
  navigation.update({ x: 25, y: 0 }, 2000);
  assert.equal(plans, 3, 'blocked route cannot silently restart');
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
});

test('replanning failures stop and blocked path attempts cannot run every frame', () => {
  let clear = true, plans = 0;
  const navigation = new QuestNavigation({ clearPath: () => clear, maxReplans: 2,
    route: (from, to) => ++plans < 3 ? direct(from, to) : undefined });
  const position = { x: 0, y: 0 };
  navigation.start(position, { x: 100, y: 0 }, '', 0);
  clear = false;
  navigation.update(position, 50);
  assert.equal(plans, 2);
  for (let now = 60; now < 500; now += 10) navigation.update(position, now);
  assert.equal(plans, 2);
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
  navigation.update(position, 550);
  assert.equal(plans, 3);
  assert.equal(navigation.reason, 'no-route');
  assert.equal(navigation.status, 'blocked');
});

test('manual or lifecycle cancellation clears route and cannot restart without explicit start', () => {
  const navigation = new QuestNavigation(openOptions);
  for (const reason of ['manual-input', 'offline', 'scene-change', 'profile-change']) {
    navigation.start({ x: 0, y: 0 }, { x: 100, y: 0 });
    navigation.cancel(reason);
    navigation.update({ x: 50, y: 0 }, 1000);
    assert.equal(navigation.status, 'cancelled');
    assert.equal(navigation.reason, reason);
    assert.deepEqual(navigation.input, { x: 0, y: 0 });
    assert.deepEqual(navigation.remainingRoute, []);
  }
  assert.equal(navigation.start({ x: 0, y: 0 }, { x: 0, y: 100 }), true);
  assert.equal(navigation.status, 'moving');
  assert.equal(navigation.reason, '');
  assert.deepEqual(navigation.input, { x: 0, y: 1, fast: true });
});

test('input and diagnostics reads have no clock or movement side effects', () => {
  const navigation = new QuestNavigation({ ...openOptions, stuckMs: 500 });
  const from = { x: 0, y: 0 }, to = { x: 100, y: 0 };
  navigation.start(from, to);
  navigation.update(from, 100000);
  const expected = navigation.diagnostics;
  from.x = 99; to.y = 500;
  for (let i = 0; i < 100; i++) {
    navigation.input.x = 0;
    navigation.remainingRoute[1].x = -100;
    assert.deepEqual(navigation.diagnostics, expected);
    assert.deepEqual(navigation.input, { x: 1, y: 0, fast: true });
  }
  assert.equal(navigation.diagnostics.replans, 0, 'clock starts at first update when omitted at start');
});

test('non-finite coordinates stop before they can reach pathfinding or network input', () => {
  const navigation = new QuestNavigation(openOptions);
  assert.equal(navigation.start({ x: NaN, y: 0 }, { x: 100, y: 0 }), false);
  assert.equal(navigation.reason, 'invalid-position');
  navigation.start({ x: 0, y: 0 }, { x: 100, y: 0 });
  navigation.update({ x: Infinity, y: 0 }, 100);
  assert.equal(navigation.status, 'blocked');
  assert.deepEqual(navigation.input, { x: 0, y: 0 });
});
