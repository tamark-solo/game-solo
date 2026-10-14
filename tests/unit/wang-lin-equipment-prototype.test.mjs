import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CONTRACTS, createPrototype, restorePrototype, createFactInbox, geometryFor,
  viewAt, exampleWorld, pointInShape, targetIntersectsShape, hasLineOfSight,
} from '../../docs/design/gameplay/wang-lin-equipment-prototype-v1/core.mjs';

const enemy = (id, x, y, extra = {}) => ({ id, lifeId: `${id}-1`, team: 'enemy', x, y, radius: 0, alive: true, ...extra });
const ally = (id, x, y, extra = {}) => ({ ...enemy(id, x, y, extra), team: 'ally' });
const command = (family = 'sword', mode = 'aoe', extra = {}) => ({ castId: 'cast-1', actorId: 'caster', family, mode, startedAt: 0, origin: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, ...extra });
const start = (targets, request = command(), blockers = []) => {
  const e = createPrototype({ targets, blockers });
  assert.equal(e.cast(request).accepted, true); return e;
};
const contacts = e => e.facts.filter(f => ['hit', 'support', 'control'].includes(f.type));

test('all eight contracts are frozen, experimental, and match the JSON handoff', async () => {
  const json = JSON.parse(await readFile(new URL('../../docs/design/gameplay/wang-lin-equipment-prototype-v1/contracts.json', import.meta.url), 'utf8'));
  assert.equal(json.runtimeIntegrated, false);
  assert.equal(json.contracts.length, 8);
  assert.deepEqual(json.contracts, Object.values(CONTRACTS));
  assert.throws(() => { CONTRACTS['sword-st'].pulses[0].cap = 99; }, TypeError);
});

for (const c of Object.values(CONTRACTS)) {
  test(`${c.id}: complete fixture has release, clocked contacts/miss, and no runtime credit`, () => {
    const e = createPrototype(exampleWorld());
    const result = e.cast(command(c.family, c.mode, { targetId: c.family === 'bead' ? 'ally-1' : 'enemy-1' }));
    assert.equal(result.accepted, true);
    e.advance(c.timing.endMs);
    assert.equal(e.facts.filter(f => f.type === 'release').length, 1);
    assert.equal(e.facts.at(-1).type, 'complete');
    assert.equal(e.facts.every(f => f.fixtureOnly), true);
    assert.equal(e.facts.filter(f => f.type === 'hit').every(f => f.creditPolicy === 'fixture-damage-only-no-runtime-credit'), true);
    assert.equal(new Set(e.facts.map(f => f.key)).size, e.facts.length);
  });
}

test('Sword has three parallel flat-ended corridors, with tangent circle boundary included', () => {
  const e = start([]), g = geometryFor(e.casts[0]);
  assert.equal(g.shapes.length, 3);
  assert.deepEqual(g.shapes.map(s => s.from.y), [-60, 0, 60]);
  const center = g.shapes[1];
  assert.equal(pointInShape({ x: 100, y: 16 }, center), true);
  assert.equal(pointInShape({ x: 100, y: 16.001 }, center), false);
  assert.equal(targetIntersectsShape({ x: 100, y: 24, radius: 8 }, center), true);
  assert.equal(targetIntersectsShape({ x: 100, y: 24.001, radius: 8 }, center), false);
  assert.equal(pointInShape({ x: 23.999, y: 0 }, center), false);
  assert.equal(pointInShape({ x: 228.001, y: 0 }, center), false);
});

test('zero aim and nonfinite coordinates reject before mutating the clock', () => {
  const e = createPrototype();
  assert.throws(() => e.cast(command('sword', 'st', { startedAt: 100, aim: { x: 0, y: 0 } })), /nonzero/);
  assert.equal(e.now, 0);
  assert.throws(() => e.cast(command('sword', 'st', { origin: { x: Infinity, y: 0 } })), /finite/);
  assert.throws(() => createPrototype({ targets: [enemy('bad', 0, 0, { alive: 'yes' })] }), /boolean/);
});

test('origin and normalized aim stay locked when caller, world and returned copies change', () => {
  const input = command('sword', 'aoe', { aim: { x: 0, y: 4 } });
  const e = start([], input);
  input.origin.x = 700; input.aim.x = 4;
  const exposed = e.casts; exposed[0].origin.y = 900;
  e.updateWorld({ targets: [enemy('moved', 0, 100)] }, 700);
  assert.deepEqual(e.casts[0].origin, { x: 0, y: 0 });
  assert.deepEqual(e.casts[0].aim, { x: 0, y: 1 });
  assert.deepEqual(geometryFor(e.casts[0]).shapes[1].to, { x: 0, y: 228 });
  e.advance(800);
  assert.equal(contacts(e)[0].targetId, 'moved');
});

test('overlapping Sword corridors give a large target one contact per pulse', () => {
  const e = start([enemy('overlap', 130, 30, { radius: 40 })]);
  e.advance(2180);
  const hits = contacts(e);
  assert.equal(hits.length, 3);
  assert.equal(new Set(hits.map(f => f.pulseId)).size, 3);
});

test('per-pulse cap picks nearest eligible targets, deterministic ID tie, ignores allies', () => {
  const targets = [enemy('far', 220, 0), enemy('e', 150, 0), enemy('d', 140, 0), enemy('c', 130, 0), enemy('b', 120, 0), enemy('a', 120, 0), ally('friend', 25, 0)];
  const e = start(targets.reverse()); e.advance(800);
  assert.deepEqual(contacts(e).map(f => f.targetId), ['a', 'b', 'c', 'd', 'e']);
  e.advance(800);
  assert.equal(contacts(e).length, 5);
});

test('LOS blocks line contacts at a wall, including tangency, but not an adjacent wall', () => {
  const origin = { x: 0, y: 0 }, t = enemy('victim', 150, 0);
  assert.equal(hasLineOfSight(origin, t, [{ x: 70, y: 0, width: 10, height: 20 }]), false);
  assert.equal(hasLineOfSight(origin, t, [{ x: 70, y: 0.001, width: 10, height: 20 }]), true);
  const e = start([t], command('sword', 'st'), [{ x: 70, y: -10, width: 10, height: 20 }]);
  e.advance(480);
  assert.equal(contacts(e).length, 0);
  assert.equal(e.facts.at(-1).type, 'miss');
});

test('a wall inserted at release is respected; an update later cannot change prior facts', () => {
  const e = start([enemy('victim', 150, 0)], command('sword', 'st'));
  e.updateWorld({ blockers: [{ x: 70, y: -10, width: 10, height: 20 }] }, 480);
  assert.equal(contacts(e).length, 0);
  e.updateWorld({ blockers: [] }, 600);
  assert.equal(contacts(e).length, 0);
});

test('target leaves a locked Banner point; cast does not chase its new position', () => {
  const e = start([enemy('victim', 150, 0)], command('banner', 'st', { targetId: 'victim' }));
  e.updateWorld({ targets: [enemy('victim', 210, 0)] }, 599);
  e.advance(900);
  assert.deepEqual(e.casts[0].targetLock.point, { x: 150, y: 0 });
  assert.equal(contacts(e).length, 0);
  assert.equal(e.facts.filter(f => f.type === 'miss').length, 2);
});

test('dead and replaced locked life cannot receive Banner contacts', () => {
  for (const replacement of [enemy('victim', 150, 0, { alive: false }), enemy('victim', 150, 0, { lifeId: 'victim-2' })]) {
    const e = start([enemy('victim', 150, 0)], command('banner', 'st', { targetId: 'victim' }));
    e.updateWorld({ targets: [replacement] }, 599);
    e.advance(1560);
    assert.equal(contacts(e).length, 0);
  }
});

test('AOE can contact a fresh spawn life on a later pulse without repeating the old life', () => {
  const e = start([enemy('victim', 150, 0)]); e.advance(800);
  e.updateWorld({ targets: [enemy('victim', 150, 0, { lifeId: 'victim-2' })] }, 1000);
  e.advance(1120);
  assert.deepEqual(contacts(e).map(f => f.targetLifeId), ['victim-1', 'victim-2']);
  assert.notEqual(contacts(e)[0].effectId, contacts(e)[1].effectId);
});

test('locked target requires correct team, range, life and LOS before cast', () => {
  const e = createPrototype({ targets: [enemy('enemy', 40, 0), ally('ally', 40, 0), enemy('far', 300, 0)] });
  assert.equal(e.cast(command('bead', 'st', { targetId: 'enemy' })).reason, 'invalid-target');
  assert.equal(e.cast(command('banner', 'st', { targetId: 'ally' })).reason, 'invalid-target');
  assert.equal(e.cast(command('banner', 'st', { targetId: 'far' })).reason, 'target-range-or-los');
  assert.equal(e.cast(command('banner', 'st', { targetId: 'enemy', targetLifeId: 'enemy-old' })).reason, 'stale-target-life');
  assert.equal(e.facts.length, 0);
});

test('Banner gates leave the center open and warning perimeter gives no damage', () => {
  const e = start([enemy('center', 352 / 3, 0), enemy('gate', 64, -90)], command('banner', 'aoe'));
  const g = geometryFor(e.casts[0]);
  assert.equal(g.anchors.length, 3);
  assert.equal(g.shapes.filter(s => s.role === 'warning').length, 1);
  e.advance(900);
  assert.deepEqual(contacts(e).map(f => f.targetId), ['gate']);
});

test('Chariot rails are warnings; three node pulses resolve in order with unique effect IDs', () => {
  const e = start([enemy('first', 90, 0), enemy('second', 164, 0), enemy('third', 238, 0), enemy('rail-only', 200, 54)], command('chariot', 'aoe'));
  const g = geometryFor(e.casts[0]);
  assert.equal(g.shapes.filter(s => s.role === 'warning').length, 2);
  e.advance(2260);
  assert.deepEqual(contacts(e).map(f => [f.pulseId, f.targetId]), [['stomp-1', 'first'], ['stomp-2', 'second'], ['stomp-3', 'third']]);
  assert.equal(new Set(contacts(e).map(f => f.effectId)).size, 3);
});

test('Bead sanctuary supports allies, border controls enemies, neither generates hit credit', () => {
  const targets = [ally('protected', 72, -64), enemy('inside', 140, 0), enemy('border', 224, 72), enemy('enemy-in-sanctuary', 72, -64), ally('ally-on-border', 224, 72)];
  const e = start(targets, command('bead', 'aoe')); e.advance(900);
  assert.deepEqual(contacts(e).map(f => [f.type, f.targetId]), [['support', 'protected'], ['control', 'border']]);
  assert.equal(e.facts.some(f => f.type === 'hit'), false);
  assert.equal(contacts(e).every(f => f.creditPolicy.includes('no-hit') || f.creditPolicy.includes('no-damage')), true);
  assert.equal(geometryFor(e.casts[0]).anchors.length, 3);
});

test('Bead has separate support and control caps, closed border tangency and no filled interior', () => {
  const targets = Array.from({ length: 5 }, (_, i) => ally(`a${i}`, 72 + i, -64));
  targets.push(...Array.from({ length: 6 }, (_, i) => enemy(`e${i}`, 224, i)));
  const e = start(targets, command('bead', 'aoe')); e.advance(900);
  assert.equal(contacts(e).filter(f => f.type === 'support').length, 3);
  assert.equal(contacts(e).filter(f => f.type === 'control').length, 4);
  const border = geometryFor(e.casts[0]).shapes.find(s => s.id === 'fold-border');
  assert.equal(pointInShape({ x: 236, y: 0 }, border), true);
  assert.equal(pointInShape({ x: 236.001, y: 0 }, border), false);
  assert.equal(pointInShape({ x: 140, y: 0 }, border), false);
});

test('cancel strictly before release yields no release/contact even after clock passes end', () => {
  const e = start([enemy('victim', 150, 0)]);
  e.cancel('cast-1', 799); e.advance(10000);
  assert.deepEqual(e.facts.map(f => f.type), ['cast', 'cancel']);
  assert.equal(viewAt(e.casts[0], 10000).phase, 'cancelled');
});

test('cancel at release keeps confirmed first pulse and stops every future pulse', () => {
  const e = start([enemy('victim', 150, 0)]);
  e.cancel('cast-1', 800); e.advance(3000);
  assert.deepEqual(e.facts.map(f => f.type), ['cast', 'release', 'hit', 'cancel']);
  assert.equal(e.facts.at(-1).afterRelease, true);
  assert.equal(e.facts.at(-1).cancelPolicy, 'stop-future-pulses-keep-confirmed-effects');
});

test('confirmed support duration survives cancelling a released Bead field', () => {
  const e = start([ally('protected', 72, -64)], command('bead', 'aoe'));
  e.advance(900); e.cancel('cast-1', 950); e.advance(3000);
  const inbox = createFactInbox(); inbox.ingest(e.facts, 950);
  assert.equal(inbox.effectsAt(1000).filter(f => f.type === 'support').length, 1);
  assert.equal(inbox.effectsAt(1600).filter(f => f.type === 'support').length, 0);
  assert.equal(contacts(e).length, 1);
});

test('duplicate command and repeated cancel do not produce additional contacts or receipts', () => {
  const e = start([enemy('victim', 150, 0)]);
  assert.equal(e.cast(command()).reason, 'duplicate-cast-id');
  e.cancel('cast-1', 100); const count = e.facts.length;
  e.cancel('cast-1', 200); e.advance(5000);
  assert.equal(e.facts.length, count);
});

test('actor cannot cast concurrently; a different actor or a cancelled cast can proceed', () => {
  const e = start([]);
  assert.equal(e.cast(command('sword', 'st', { castId: 'cast-2' })).reason, 'actor-busy');
  assert.equal(e.cast(command('sword', 'st', { castId: 'cast-3', actorId: 'other' })).accepted, true);
  e.cancel('cast-1', 100);
  assert.equal(e.cast(command('sword', 'st', { castId: 'cast-4', startedAt: 100 })).accepted, true);
});

test('large clock jumps equal stepped evaluation for a world that has not moved', () => {
  const request = command('chariot', 'aoe');
  const targets = [enemy('first', 90, 0), enemy('second', 164, 0), enemy('third', 238, 0)];
  const fast = start(targets, request), slow = start(targets, request);
  fast.advance(3000);
  for (let at = 25; at <= 3000; at += 25) slow.advance(at);
  assert.deepEqual(fast.facts, slow.facts);
});

test('world snapshot exactly at pulse changes that pulse, but not earlier pulses', () => {
  const e = start([enemy('victim', 150, 0)]);
  e.updateWorld({ targets: [enemy('victim', 150, 300)] }, 1120);
  assert.deepEqual(contacts(e).map(f => f.pulseId), ['sword-wave-1']);
  assert.equal(e.facts.filter(f => f.type === 'miss')[0].at, 1120);
});

test('view seek is absolute, independent from engine state and generates no facts', () => {
  const e = start([]), cast = e.casts[0], initial = e.facts;
  assert.equal(viewAt(cast, 100).phase, 'warning');
  assert.equal(viewAt(cast, 500).phase, 'charge');
  assert.equal(viewAt(cast, 820).phase, 'release');
  assert.equal(viewAt(cast, 1250).phase, 'active');
  assert.equal(viewAt(cast, 1800).phase, 'residual');
  assert.equal(viewAt(cast, 2500).phase, 'complete');
  assert.equal(viewAt(cast, -20).phase, 'pending');
  assert.deepEqual(e.facts, initial);
  e.advance(100); assert.throws(() => e.advance(99), /backwards/);
});

test('late contacts retain their original age; duplicate delivery and expired effects never restart', () => {
  const e = start([enemy('victim', 150, 0)], command('sword', 'st')); e.advance(1100);
  const hit = contacts(e)[0], inbox = createFactInbox();
  assert.equal(inbox.ingest([hit], 520)[0].age, 40);
  assert.equal(inbox.effectsAt(520)[0].age, 40);
  assert.equal(inbox.ingest([hit], 600).length, 0);
  assert.equal(inbox.effectsAt(660).length, 0);
  const late = createFactInbox();
  assert.equal(late.ingest([hit], 1100)[0].expired, true);
  assert.equal(late.effectsAt(1100).length, 0);
  assert.equal(late.seenCount, 1);
});

test('multi-target contact and later life facts each remain distinct in presentation dedup', () => {
  const e = start([enemy('a', 120, 0), enemy('b', 150, 0)]); e.advance(800);
  e.updateWorld({ targets: [enemy('a', 120, 0, { lifeId: 'a-2' }), enemy('b', 150, 0)] }, 1000); e.advance(1120);
  const inbox = createFactInbox(); inbox.ingest(contacts(e), 1130);
  assert.equal(inbox.seenCount, 4);
  assert.equal(inbox.ingest(contacts(e), 1130).length, 0);
  assert.equal(inbox.effectsAt(1130).length, 2);
});

test('reconnect snapshot JSON resumes pending pulses once with exactly the uninterrupted ledger', () => {
  const targets = [enemy('a', 120, 0), enemy('b', 150, 0)];
  const uninterrupted = start(targets), paused = start(targets);
  uninterrupted.advance(2500); paused.advance(900);
  const resumed = restorePrototype(JSON.stringify(paused.snapshot()));
  assert.equal(resumed.cast(command('sword', 'st', { startedAt: 900 })).reason, 'duplicate-cast-id');
  const fresh = resumed.advance(2500);
  assert.equal(fresh.some(f => f.pulseId === 'sword-wave-1'), false);
  assert.deepEqual(resumed.facts, uninterrupted.facts);
  assert.equal(resumed.advance(2500).length, 0);
});

test('cancelled reconnect stays terminal and old cancellation cannot interrupt a new cast', () => {
  const e = start([enemy('a', 120, 0)]); e.cancel('cast-1', 100);
  const restored = restorePrototype(e.snapshot());
  assert.equal(restored.cast(command('sword', 'st', { castId: 'cast-2', startedAt: 100 })).accepted, true);
  restored.cancel('cast-1', 200); restored.advance(1200);
  assert.deepEqual(contacts(restored).map(f => f.castId), ['cast-2']);
});

test('unsupported, duplicate or corrupted reconnect data rejects instead of repeating effects', () => {
  const e = start([enemy('a', 120, 0)]); e.advance(800);
  const old = e.snapshot(); old.contractVersion = 999;
  assert.throws(() => restorePrototype(old), /unsupported/);
  const duplicate = e.snapshot(); duplicate.facts.push(duplicate.facts.at(-1));
  assert.throws(() => restorePrototype(duplicate), /duplicate/);
  const corrupt = e.snapshot(); corrupt.facts[0].key = 'bad';
  assert.throws(() => restorePrototype(corrupt), /invalid/);
  const repeatedSeen = e.snapshot(); repeatedSeen.seen[1] = repeatedSeen.seen[0];
  assert.throws(() => restorePrototype(repeatedSeen), /dedup/);
  const movingAim = e.snapshot(); movingAim.casts[0].aim.x = 2;
  assert.throws(() => restorePrototype(movingAim), /locked aim/);
});

test('clock orders release before contact, contacts before complete across simultaneous actors', () => {
  const e = start([enemy('a', 120, 0)], command('sword', 'st', { castId: 'z' }));
  assert.equal(e.cast(command('sword', 'st', { castId: 'a', actorId: 'other' })).accepted, true);
  e.advance(1100);
  assert.deepEqual(e.facts.filter(f => f.at === 480).map(f => `${f.type}:${f.castId}`), ['release:a', 'release:z', 'hit:a', 'hit:z']);
});
