/**
 * Deterministic, I/O-free equipment fixture. All numbers are experimental.
 * This module does not import the live engine, change HP, save or grant items.
 */
export const SCHEMA = 'wang-lin-equipment-prototype-1';
export const CONTRACT_VERSION = 1;
export const LIMITS = Object.freeze({ casts: 128, targets: 128, blockers: 64, facts: 4096 });

const contract = (family, mode, name, timing, pulses, policy, geometry, extra = {}) => ({
  id: `${family}-${mode}`, family, mode, name, version: CONTRACT_VERSION,
  status: 'experimental-fixture-only', units: 'world-px-and-ms',
  timing, pulses, policy, geometry, ...extra,
});

const deepFreeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
};
export const CONTRACTS = deepFreeze({
  'sword-st': contract('sword', 'st', 'Kiếm Ý Nhất Tuyến',
    { warningMs: 160, releaseMs: 480, activeEndMs: 680, endMs: 1100 },
    [{ id: 'line', atMs: 480, cap: 1, kind: 'hit', magnitude: 10 }],
    { target: 'direction-enemy', range: 220, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'single-corridor', length: 210, start: 16, halfWidth: 10 }),
  'sword-aoe': contract('sword', 'aoe', 'Kiếm Trận Phá Giới',
    { warningMs: 260, releaseMs: 800, activeEndMs: 1640, endMs: 2180 },
    [800, 1120, 1440].map((atMs, i) => ({ id: `sword-wave-${i + 1}`, atMs, cap: 5, kind: 'hit', magnitude: 6 })),
    { target: 'point-enemies', range: 252, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'parallel-corridors', start: 24, length: 228, offsets: [-60, 0, 60], halfWidth: 16 },
    { canonNote: 'Ba tuyến song song theo board đã chọn; kiếm linh không tự thêm hit.' }),
  'banner-st': contract('banner', 'st', 'Chủ Hồn Dẫn Lộ',
    { warningMs: 200, releaseMs: 600, activeEndMs: 1120, endMs: 1560 },
    [600, 900].map((atMs, i) => ({ id: `soul-link-${i + 1}`, atMs, cap: 1, kind: 'hit', magnitude: 7 })),
    { target: 'locked-enemy', range: 224, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'locked-circle', radius: 26 }),
  'banner-aoe': contract('banner', 'aoe', 'Tam Môn Tụ Hồn',
    { warningMs: 280, releaseMs: 900, activeEndMs: 1940, endMs: 2500 },
    [900, 1300, 1700].map((atMs, i) => ({ id: `gate-wave-${i + 1}`, atMs, cap: 6, kind: 'hit', magnitude: 5 })),
    { target: 'point-enemies', range: 272, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'triangular-gates', anchors: [{ x: 64, y: -90 }, { x: 64, y: 90 }, { x: 224, y: 0 }], gateRadius: 34, streamHalfWidth: 18, innerGapRadius: 30 },
    { escapeNote: 'Tâm tam giác giữ khe trống; viền warning không gây hit.' }),
  'chariot-st': contract('chariot', 'st', 'Giải Niêm Dẫn Thú',
    { warningMs: 220, releaseMs: 700, activeEndMs: 960, endMs: 1480 },
    [{ id: 'beast-contact', atMs: 700, cap: 1, kind: 'hit', magnitude: 12 }],
    { target: 'direction-enemy', range: 250, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'single-corridor', start: 24, length: 238, halfWidth: 13 }),
  'chariot-aoe': contract('chariot', 'aoe', 'Lôi Thú Liệt Địa',
    { warningMs: 300, releaseMs: 850, activeEndMs: 1710, endMs: 2260 },
    [850, 1150, 1450].map((atMs, i) => ({ id: `stomp-${i + 1}`, atMs, cap: 4, kind: 'hit', magnitude: 8, node: i })),
    { target: 'point-enemies', range: 292, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'rails-and-nodes', rails: [-54, 54], railEnd: 270, railHalfWidth: 12, nodes: [90, 164, 238], nodeRadius: 48 },
    { escapeNote: 'Hai rail là đường báo; chỉ node đúng pulse gây contact. Có đường né ở hai bên.' }),
  'bead-st': contract('bead', 'st', 'Dẫn Giới Hộ Thân',
    { warningMs: 180, releaseMs: 600, activeEndMs: 820, endMs: 1380 },
    [{ id: 'ward', atMs: 600, cap: 1, kind: 'support', magnitude: 15, durationMs: 900 }],
    { target: 'locked-ally', range: 210, los: true, overlap: 'one-target-once-per-pulse' },
    { kind: 'locked-circle', radius: 42 },
    { creditPolicy: 'support-only-no-hit-or-practice-credit' }),
  'bead-aoe': contract('bead', 'aoe', 'Nội Giới Hộ Đạo',
    { warningMs: 280, releaseMs: 900, activeEndMs: 2050, endMs: 2640 },
    [900, 1350, 1800].map((atMs, i) => ({ id: `inner-world-${i + 1}`, atMs, cap: 3, kind: 'support', magnitude: 12, durationMs: 700, controlCap: 4, controlMagnitude: 0.35, controlDurationMs: 450 })),
    { target: 'point-allies-and-enemy-border', range: 274, los: true, overlap: 'one-target-once-per-pulse-and-effect-kind' },
    { kind: 'sanctuary-and-fold', anchors: [{ x: 72, y: -64 }, { x: 72, y: 64 }, { x: 168, y: 0 }], sanctuaryRadius: 34, fold: [{ x: 40, y: -104 }, { x: 224, y: -104 }, { x: 224, y: 104 }, { x: 40, y: 104 }], borderHalfWidth: 12, casterRingRadius: 38 },
    { creditPolicy: 'support-and-control-only-no-damage', canonNote: 'AOE bên ngoài là chuyển thể gameplay đề xuất, không canon damage, XP hay tích lũy offline.' }),
});

const copy = value => JSON.parse(JSON.stringify(value));
const finite = n => typeof n === 'number' && Number.isFinite(n);
const requireFinite = (n, label) => { if (!finite(n)) throw new TypeError(`${label} must be finite`); return n; };
const isId = s => typeof s === 'string' && s.length > 0 && s.length <= 120;
const requireId = (s, label) => { if (!isId(s)) throw new TypeError(`${label} must be a nonempty ID <= 120 characters`); return s; };
const point = (p, label = 'point') => {
  const x = requireFinite(p?.x, `${label}.x`), y = requireFinite(p?.y, `${label}.y`);
  if (Math.abs(x) > 1e6 || Math.abs(y) > 1e6) throw new RangeError(`${label} outside fixture bounds`);
  return { x, y };
};
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const sameLife = (target, lock) => target.id === lock.id && target.lifeId === lock.lifeId;

export function normalizeAim(aim) {
  const p = point(aim, 'aim');
  const length = Math.hypot(p.x, p.y);
  if (length < 1e-9) throw new TypeError('aim must be a nonzero finite vector');
  return { x: p.x / length, y: p.y / length };
}

function sanitizeTargets(targets) {
  if (!Array.isArray(targets) || targets.length > LIMITS.targets) throw new TypeError('invalid target roster');
  const ids = new Set();
  return targets.map(t => {
    requireId(t.id, 'target.id'); requireId(t.lifeId, 'target.lifeId');
    if (ids.has(t.id)) throw new TypeError('duplicate target ID');
    ids.add(t.id);
    if (t.team !== 'enemy' && t.team !== 'ally') throw new TypeError('target.team must be enemy or ally');
    if (t.alive !== undefined && typeof t.alive !== 'boolean') throw new TypeError('target.alive must be boolean');
    const p = point(t, 'target');
    const radius = t.radius ?? 8;
    if (!finite(radius) || radius < 0 || radius > 64) throw new TypeError('target.radius outside fixture bounds');
    return { id: t.id, lifeId: t.lifeId, ...p, radius, team: t.team, alive: t.alive !== false };
  });
}

function sanitizeBlockers(blockers) {
  if (!Array.isArray(blockers) || blockers.length > LIMITS.blockers) throw new TypeError('invalid blocker roster');
  return blockers.map((b, i) => {
    const p = point(b, 'blocker');
    if (!finite(b.width) || !finite(b.height) || b.width <= 0 || b.height <= 0) throw new TypeError('invalid blocker dimensions');
    return { id: isId(b.id) ? b.id : `blocker-${i}`, ...p, width: b.width, height: b.height };
  });
}

export function localToWorld(cast, p) {
  return { x: cast.origin.x + cast.aim.x * p.x - cast.aim.y * p.y, y: cast.origin.y + cast.aim.y * p.x + cast.aim.x * p.y };
}

function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, denom = dx * dx + dy * dy;
  const t = denom === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / denom));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function polygonInside(p, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if (segmentDistance(p, a, b) <= 1e-9) return true;
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Circle-vs-shape intersection; closed boundaries include tangency. */
export function targetIntersectsShape(target, shape) {
  const p = point(target), radius = target.radius ?? 0;
  if (shape.type === 'circle') return distance(p, shape.center) <= shape.radius + radius + 1e-9;
  if (shape.type === 'corridor') {
    // A corridor is a rectangle with flat ends, not a capsule beyond range.
    const dx = shape.to.x - shape.from.x, dy = shape.to.y - shape.from.y, len = Math.hypot(dx, dy);
    if (!len) return distance(p, shape.from) <= radius;
    const along = ((p.x - shape.from.x) * dx + (p.y - shape.from.y) * dy) / len;
    const cross = Math.abs(((p.x - shape.from.x) * -dy + (p.y - shape.from.y) * dx) / len);
    const beyond = Math.max(0, -along, along - len);
    const outside = Math.max(0, cross - shape.halfWidth);
    return Math.hypot(beyond, outside) <= radius + 1e-9;
  }
  if (shape.type === 'polygon') {
    if (shape.outlineOnly) return shape.points.some((a, i) => segmentDistance(p, a, shape.points[(i + 1) % shape.points.length]) <= shape.halfWidth + radius + 1e-9);
    return polygonInside(p, shape.points) || shape.points.some((a, i) => segmentDistance(p, a, shape.points[(i + 1) % shape.points.length]) <= radius + 1e-9);
  }
  throw new TypeError(`Unknown geometry type ${shape.type}`);
}

export function pointInShape(p, shape) { return targetIntersectsShape({ ...p, radius: 0 }, shape); }

function segmentIntersectsRect(a, b, r) {
  // Closed slab clipping: a wall touching the sight segment blocks LOS.
  let lo = 0, hi = 1;
  for (const [origin, delta, min, max] of [[a.x, b.x - a.x, r.x, r.x + r.width], [a.y, b.y - a.y, r.y, r.y + r.height]]) {
    if (Math.abs(delta) < 1e-12) { if (origin < min || origin > max) return false; }
    else {
      const t0 = (min - origin) / delta, t1 = (max - origin) / delta;
      lo = Math.max(lo, Math.min(t0, t1)); hi = Math.min(hi, Math.max(t0, t1));
      if (lo > hi) return false;
    }
  }
  return hi >= 0 && lo <= 1;
}

export function hasLineOfSight(origin, target, blockers = []) { return !blockers.some(b => segmentIntersectsRect(origin, target, b)); }

/** All geometry is locked from cast acceptance. No actor/aim lookup at render time. */
export function geometryFor(cast) {
  const c = CONTRACTS[cast.contractId ?? `${cast.family}-${cast.mode}`];
  if (!c) throw new TypeError('unknown contract');
  const g = c.geometry, shapes = [], anchors = [];
  const line = (id, a, b, width, role = 'damage', pulseId) => shapes.push({ id, type: 'corridor', from: localToWorld(cast, a), to: localToWorld(cast, b), halfWidth: width, role, ...(pulseId ? { pulseId } : {}) });
  const circle = (id, center, radius, role = 'damage', pulseId) => shapes.push({ id, type: 'circle', center: localToWorld(cast, center), radius, role, ...(pulseId ? { pulseId } : {}) });
  if (g.kind === 'single-corridor') line('line', { x: g.start, y: 0 }, { x: g.length, y: 0 }, g.halfWidth);
  if (g.kind === 'parallel-corridors') g.offsets.forEach((y, i) => {
    line(`corridor-${i + 1}`, { x: g.start, y }, { x: g.length, y }, g.halfWidth);
    anchors.push({ id: `stake-near-${i + 1}`, ...localToWorld(cast, { x: g.start, y }) }, { id: `stake-far-${i + 1}`, ...localToWorld(cast, { x: g.length, y }) });
  });
  if (g.kind === 'locked-circle') shapes.push({ id: 'locked-point', type: 'circle', center: copy(cast.targetLock.point), radius: g.radius, role: c.family === 'bead' ? 'support' : 'damage' });
  if (g.kind === 'triangular-gates') {
    const center = { x: g.anchors.reduce((n, p) => n + p.x, 0) / 3, y: 0 };
    g.anchors.forEach((a, i) => {
      const d = distance(a, center), end = { x: center.x + (a.x - center.x) * g.innerGapRadius / d, y: center.y + (a.y - center.y) * g.innerGapRadius / d };
      circle(`gate-${i + 1}`, a, g.gateRadius);
      line(`soul-stream-${i + 1}`, a, end, g.streamHalfWidth);
      anchors.push({ id: `gate-${i + 1}`, ...localToWorld(cast, a) });
    });
    shapes.push({ id: 'triangle-warning', type: 'polygon', points: g.anchors.map(p => localToWorld(cast, p)), outlineOnly: true, halfWidth: 2, role: 'warning' });
  }
  if (g.kind === 'rails-and-nodes') {
    g.rails.forEach((y, i) => line(`rail-${i + 1}`, { x: 0, y }, { x: g.railEnd, y }, g.railHalfWidth, 'warning'));
    g.nodes.forEach((x, i) => { circle(`node-${i + 1}`, { x, y: 0 }, g.nodeRadius, 'damage', c.pulses[i].id); anchors.push({ id: `node-${i + 1}`, ...localToWorld(cast, { x, y: 0 }) }); });
  }
  if (g.kind === 'sanctuary-and-fold') {
    g.anchors.forEach((p, i) => { circle(`sanctuary-${i + 1}`, p, g.sanctuaryRadius, 'support'); anchors.push({ id: `sanctuary-${i + 1}`, ...localToWorld(cast, p) }); });
    shapes.push({ id: 'fold-border', type: 'polygon', points: g.fold.map(p => localToWorld(cast, p)), outlineOnly: true, halfWidth: g.borderHalfWidth, role: 'control' });
    circle('caster-ring', { x: 0, y: 0 }, g.casterRingRadius, 'warning');
  }
  return { family: c.family, mode: c.mode, kind: g.kind, origin: copy(cast.origin), aim: copy(cast.aim), shapes, anchors, experimental: true };
}

export function viewAt(cast, now) {
  requireFinite(now, 'now');
  const c = CONTRACTS[cast.contractId], age = now - cast.startedAt;
  let phase = age < 0 ? 'pending' : age < c.timing.warningMs ? 'warning' : age < c.timing.releaseMs ? 'charge' : age < c.timing.releaseMs + 100 ? 'release' : age < c.timing.activeEndMs ? 'active' : age < c.timing.endMs ? 'residual' : 'complete';
  if (cast.cancelledAt !== null && cast.cancelledAt <= now) phase = 'cancelled';
  const latest = [...c.pulses].reverse().find(p => age >= p.atMs);
  return { castId: cast.castId, family: cast.family, mode: cast.mode, phase, age, releaseAt: cast.startedAt + c.timing.releaseMs, endAt: cast.startedAt + c.timing.endMs, geometry: geometryFor(cast), currentPulseId: latest?.id ?? null, pulses: c.pulses.map(p => ({ id: p.id, at: cast.startedAt + p.atMs, age: now - (cast.startedAt + p.atMs) })), experimental: true };
}

export function factKey(fact) {
  const target = ['hit', 'support', 'control'].includes(fact.type);
  return JSON.stringify(target
    ? [fact.castId, fact.pulseId, fact.targetId, fact.targetLifeId, fact.effectId, fact.type]
    : [fact.castId, fact.type, fact.pulseId ?? null]);
}

class Prototype {
  constructor({ targets = [], blockers = [], now = 0 } = {}) {
    this._now = requireFinite(now, 'now');
    this._targets = sanitizeTargets(targets); this._blockers = sanitizeBlockers(blockers);
    this._casts = []; this._facts = []; this._seen = new Set();
  }
  get now() { return this._now; }
  get casts() { return copy(this._casts); }
  get facts() { return copy(this._facts); }
  get world() { return { targets: copy(this._targets), blockers: copy(this._blockers) }; }

  _emit(base) {
    const f = { ...base, fixtureOnly: true, contractVersion: CONTRACT_VERSION };
    f.key = factKey(f);
    if (this._seen.has(f.key)) return;
    if (this._facts.length >= LIMITS.facts) throw new RangeError('fixture fact capacity reached; start a new fixture');
    this._seen.add(f.key); this._facts.push(f);
  }

  _base(cast, type, at) { return { type, at, castId: cast.castId, actorId: cast.actorId, family: cast.family, mode: cast.mode, origin: copy(cast.origin), aim: copy(cast.aim) }; }

  cast(request) {
    const c = CONTRACTS[`${request?.family}-${request?.mode}`];
    if (!c) return { accepted: false, reason: 'unknown-contract', facts: [] };
    requireId(request.castId, 'castId'); requireId(request.actorId, 'actorId');
    requireFinite(request.startedAt, 'startedAt');
    const origin = point(request.origin, 'origin'), aim = normalizeAim(request.aim);
    if (request.startedAt < this._now) return { accepted: false, reason: 'stale-command', facts: [] };
    const before = this._facts.length;
    this.advance(request.startedAt);
    if (this._casts.some(x => x.castId === request.castId)) return { accepted: false, reason: 'duplicate-cast-id', facts: this.facts.slice(before) };
    if (this._casts.length >= LIMITS.casts) return { accepted: false, reason: 'cast-capacity', facts: this.facts.slice(before) };
    if (this._casts.some(x => x.actorId === request.actorId && x.cancelledAt === null && request.startedAt < x.startedAt + CONTRACTS[x.contractId].timing.endMs)) return { accepted: false, reason: 'actor-busy', facts: this.facts.slice(before) };
    let targetLock = null;
    if (c.policy.target.startsWith('locked-')) {
      const team = c.policy.target === 'locked-ally' ? 'ally' : 'enemy';
      const id = request.targetId ?? (team === 'ally' ? request.actorId : null);
      const target = this._targets.find(t => t.id === id && t.alive && t.team === team);
      if (!target) return { accepted: false, reason: 'invalid-target', facts: this.facts.slice(before) };
      if (request.targetLifeId !== undefined && request.targetLifeId !== target.lifeId) return { accepted: false, reason: 'stale-target-life', facts: this.facts.slice(before) };
      if (distance(origin, target) > c.policy.range || !hasLineOfSight(origin, target, this._blockers)) return { accepted: false, reason: 'target-range-or-los', facts: this.facts.slice(before) };
      targetLock = { id: target.id, lifeId: target.lifeId, point: { x: target.x, y: target.y } };
    }
    const cast = { castId: request.castId, actorId: request.actorId, family: c.family, mode: c.mode, contractId: c.id, contractVersion: c.version, startedAt: request.startedAt, origin, aim, targetLock, released: false, nextPulse: 0, cancelledAt: null, completed: false };
    this._casts.push(cast);
    this._emit({ ...this._base(cast, 'cast', cast.startedAt), contractId: cast.contractId, targetLock: copy(targetLock), effectId: `${cast.castId}/cast` });
    return { accepted: true, cast: copy(cast), facts: this.facts.slice(before) };
  }

  _pulse(cast, pulse) {
    const c = CONTRACTS[cast.contractId], at = cast.startedAt + pulse.atMs, g = geometryFor(cast);
    const kinds = pulse.kind === 'support' && pulse.controlCap !== undefined ? ['support', 'control'] : [pulse.kind];
    let contacts = 0;
    for (const kind of kinds) {
      const team = kind === 'support' ? 'ally' : 'enemy', role = kind === 'hit' ? 'damage' : kind;
      const shapes = g.shapes.filter(s => s.role === role && (!s.pulseId || s.pulseId === pulse.id));
      const candidates = this._targets.filter(t => t.alive && t.team === team && (!cast.targetLock || sameLife(t, cast.targetLock)))
        .map(t => ({ target: t, shape: shapes.find(s => targetIntersectsShape(t, s)) }))
        .filter(x => x.shape && distance(cast.origin, x.target) <= c.policy.range + x.target.radius && hasLineOfSight(cast.origin, x.target, this._blockers))
        .sort((a, b) => distance(cast.origin, a.target) - distance(cast.origin, b.target) || a.target.id.localeCompare(b.target.id));
      const cap = kind === 'control' ? pulse.controlCap : pulse.cap;
      for (const { target, shape } of candidates.slice(0, cap)) {
        const effectId = `${cast.castId}/${pulse.id}/${kind}/${shape.id}/${target.id}/${target.lifeId}`;
        this._emit({ ...this._base(cast, kind, at), pulseId: pulse.id, targetId: target.id, targetLifeId: target.lifeId, effectId, shapeId: shape.id, position: { x: target.x, y: target.y }, magnitude: kind === 'control' ? pulse.controlMagnitude : pulse.magnitude, durationMs: kind === 'control' ? pulse.controlDurationMs : pulse.durationMs ?? 180, creditPolicy: kind === 'hit' ? 'fixture-damage-only-no-runtime-credit' : kind === 'support' ? 'support-only-no-hit-or-practice-credit' : 'control-only-no-damage', targetsConsidered: candidates.length, cap });
        contacts++;
      }
    }
    if (!contacts) this._emit({ ...this._base(cast, 'miss', at), pulseId: pulse.id, effectId: `${cast.castId}/${pulse.id}/miss`, reason: 'no-live-eligible-target-in-locked-geometry' });
  }

  _process(until, inclusive) {
    const due = [];
    for (const cast of this._casts) {
      if (cast.cancelledAt !== null || cast.completed) continue;
      const c = CONTRACTS[cast.contractId], compare = at => inclusive ? at <= until : at < until;
      if (!cast.released && compare(cast.startedAt + c.timing.releaseMs)) due.push({ cast, type: 'release', at: cast.startedAt + c.timing.releaseMs, order: 0 });
      for (let i = cast.nextPulse; i < c.pulses.length; i++) if (compare(cast.startedAt + c.pulses[i].atMs)) due.push({ cast, type: 'pulse', pulse: c.pulses[i], index: i, at: cast.startedAt + c.pulses[i].atMs, order: 1 });
      if (compare(cast.startedAt + c.timing.endMs)) due.push({ cast, type: 'complete', at: cast.startedAt + c.timing.endMs, order: 2 });
    }
    due.sort((a, b) => a.at - b.at || a.order - b.order || a.cast.castId.localeCompare(b.cast.castId));
    for (const event of due) {
      const cast = event.cast;
      if (event.type === 'release') { cast.released = true; this._emit({ ...this._base(cast, 'release', event.at), effectId: `${cast.castId}/release` }); }
      if (event.type === 'pulse') { this._pulse(cast, event.pulse); cast.nextPulse = event.index + 1; }
      if (event.type === 'complete') { cast.completed = true; this._emit({ ...this._base(cast, 'complete', event.at), effectId: `${cast.castId}/complete` }); }
    }
  }

  advance(now, worldUpdate) {
    requireFinite(now, 'now');
    if (now < this._now) throw new RangeError('fixture clock cannot move backwards; use viewAt for seek');
    const before = this._facts.length;
    if (worldUpdate !== undefined) {
      // A snapshot stamped t affects events exactly at t; earlier events see the previous snapshot.
      const targets = worldUpdate.targets === undefined ? this._targets : sanitizeTargets(worldUpdate.targets);
      const blockers = worldUpdate.blockers === undefined ? this._blockers : sanitizeBlockers(worldUpdate.blockers);
      this._process(now, false); this._targets = targets; this._blockers = blockers;
    }
    this._process(now, true); this._now = now;
    return this.facts.slice(before);
  }

  updateWorld(world, at) { return this.advance(at, world); }

  cancel(castId, at, reason = 'fixture-input') {
    requireFinite(at, 'at');
    if (at < this._now) throw new RangeError('cancel cannot move fixture clock backwards');
    const before = this._facts.length;
    // At release time the fixture authority releases first. Only strictly earlier cancellation stops release.
    this.advance(at);
    const cast = this._casts.find(c => c.castId === castId);
    if (!cast || cast.completed || cast.cancelledAt !== null) return this.facts.slice(before);
    cast.cancelledAt = at;
    this._emit({ ...this._base(cast, 'cancel', at), reason, effectId: `${cast.castId}/cancel`, afterRelease: cast.released, cancelPolicy: cast.released ? 'stop-future-pulses-keep-confirmed-effects' : 'no-release-no-contact' });
    return this.facts.slice(before);
  }

  snapshot() {
    return { schema: SCHEMA, contractVersion: CONTRACT_VERSION, fixtureOnly: true, now: this._now, targets: copy(this._targets), blockers: copy(this._blockers), casts: copy(this._casts), facts: copy(this._facts), seen: [...this._seen] };
  }
}

export function createPrototype(initial = {}) { return new Prototype(initial); }

/** Reconnect fixture only. This is not a validator for untrusted persisted gameplay. */
export function restorePrototype(snapshot) {
  const s = typeof snapshot === 'string' ? JSON.parse(snapshot) : copy(snapshot);
  if (s.schema !== SCHEMA || s.contractVersion !== CONTRACT_VERSION || s.fixtureOnly !== true) throw new TypeError('unsupported fixture snapshot');
  if (!Array.isArray(s.casts) || s.casts.length > LIMITS.casts || !Array.isArray(s.facts) || s.facts.length > LIMITS.facts) throw new TypeError('invalid fixture snapshot capacities');
  const p = new Prototype(s), ids = new Set();
  for (const cast of s.casts) {
    requireId(cast.castId, 'castId'); requireId(cast.actorId, 'actorId'); requireFinite(cast.startedAt, 'startedAt');
    if (ids.has(cast.castId) || !CONTRACTS[cast.contractId] || cast.contractVersion !== CONTRACT_VERSION || !Number.isInteger(cast.nextPulse) || cast.nextPulse < 0 || cast.nextPulse > CONTRACTS[cast.contractId].pulses.length) throw new TypeError('invalid fixture cast state');
    const c = CONTRACTS[cast.contractId];
    if (cast.family !== c.family || cast.mode !== c.mode || cast.startedAt > s.now || typeof cast.released !== 'boolean' || typeof cast.completed !== 'boolean' || (cast.cancelledAt !== null && (!finite(cast.cancelledAt) || cast.cancelledAt < cast.startedAt || cast.cancelledAt > s.now))) throw new TypeError('invalid fixture cast lifecycle');
    point(cast.origin); normalizeAim(cast.aim);
    if (Math.abs(Math.hypot(cast.aim.x, cast.aim.y) - 1) > 1e-9) throw new TypeError('invalid locked aim');
    if (c.policy.target.startsWith('locked-')) { requireId(cast.targetLock?.id, 'targetLock.id'); requireId(cast.targetLock?.lifeId, 'targetLock.lifeId'); point(cast.targetLock?.point, 'targetLock.point'); }
    else if (cast.targetLock !== null) throw new TypeError('invalid target lock');
    ids.add(cast.castId);
  }
  const seen = new Set();
  for (const f of s.facts) {
    if (!ids.has(f.castId) || !['cast', 'release', 'hit', 'support', 'control', 'miss', 'cancel', 'complete'].includes(f.type) || !finite(f.at) || f.at > s.now || f.fixtureOnly !== true || f.contractVersion !== CONTRACT_VERSION || f.key !== factKey(f) || seen.has(f.key)) throw new TypeError('invalid or duplicate fixture fact');
    seen.add(f.key);
  }
  if (!Array.isArray(s.seen) || s.seen.length !== seen.size || new Set(s.seen).size !== seen.size || s.seen.some(k => !seen.has(k))) throw new TypeError('invalid fixture dedup ledger');
  p._casts = s.casts; p._facts = s.facts; p._seen = seen;
  return p;
}

/** Presentation inbox: late facts keep their original age, never trigger damage. */
export function createFactInbox() {
  const seen = new Set(), facts = [];
  return {
    ingest(incoming, now) {
      requireFinite(now, 'now');
      if (!Array.isArray(incoming)) throw new TypeError('facts must be an array');
      const accepted = [];
      for (const fact of incoming) {
        if (!fact || !finite(fact.at) || fact.fixtureOnly !== true || fact.contractVersion !== CONTRACT_VERSION || fact.key !== factKey(fact)) throw new TypeError('invalid fixture presentation fact');
        if (seen.has(fact.key)) continue;
        if (seen.size >= LIMITS.facts) throw new RangeError('presentation inbox capacity reached');
        seen.add(fact.key); facts.push(copy(fact)); accepted.push({ fact: copy(fact), age: now - fact.at, expired: now >= fact.at + (fact.durationMs ?? 180) });
      }
      return accepted;
    },
    effectsAt(now) {
      requireFinite(now, 'now');
      return facts.filter(f => ['hit', 'support', 'control', 'release'].includes(f.type) && now >= f.at && now < f.at + (f.durationMs ?? 180)).map(f => ({ ...copy(f), age: now - f.at }));
    },
    get seenCount() { return seen.size; },
    get facts() { return copy(facts); },
  };
}

export function exampleWorld(origin = { x: 0, y: 0 }, aim = { x: 1, y: 0 }) {
  const cast = { origin: point(origin), aim: normalizeAim(aim) };
  const positions = [
    ['enemy-1', 'enemy', 92, 0], ['enemy-2', 'enemy', 148, -54], ['enemy-3', 'enemy', 148, 54],
    ['enemy-4', 'enemy', 226, 0], ['enemy-5', 'enemy', 64, -90], ['enemy-6', 'enemy', 64, 90],
    ['enemy-7', 'enemy', 164, 0],
    ['enemy-border', 'enemy', 224, 72], ['ally-1', 'ally', 72, -64], ['ally-2', 'ally', 72, 64],
    ['ally-3', 'ally', 168, 0], ['caster', 'ally', 0, 0],
  ];
  return { targets: positions.map(([id, team, x, y]) => ({ id, team, lifeId: `${id}-life-1`, ...localToWorld(cast, { x, y }), radius: 8, alive: true })), blockers: [] };
}
