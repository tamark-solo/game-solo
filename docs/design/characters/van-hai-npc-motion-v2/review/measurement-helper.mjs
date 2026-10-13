// Pure source diagnostics. A root suggestion is never a confirmed world root.
import assert from 'node:assert/strict';

export function labelAlpha(data, width, height, threshold = 128) {
  assert.equal(data.length, width * height * 4);
  const labels = new Uint32Array(width * height);
  const queue = new Int32Array(labels.length);
  const components = [];
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || data[start * 4 + 3] < threshold) continue;
    const label = components.length + 1;
    let head = 0, tail = 0, left = width, top = height, right = -1, bottom = -1;
    labels[start] = label; queue[tail++] = start;
    while (head < tail) {
      const p = queue[head++], x = p % width, y = Math.floor(p / width);
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
      for (const q of [p - 1, p + 1, p - width, p + width]) {
        if (q < 0 || q >= labels.length || Math.abs(q % width - x) > 1 || labels[q] || data[q * 4 + 3] < threshold) continue;
        labels[q] = label; queue[tail++] = q;
      }
    }
    components.push({label, left, top, width: right - left + 1, height: bottom - top + 1, area: tail});
  }
  return {labels, components};
}

const inside = (component, rect) => component.left >= rect.left && component.top >= rect.top &&
  component.left + component.width <= rect.left + rect.width && component.top + component.height <= rect.top + rect.height;
const rectDistance = (a, b) => Math.hypot(
  Math.max(0, a.left - b.left - b.width, b.left - a.left - a.width),
  Math.max(0, a.top - b.top - b.height, b.top - a.top - a.height)
);

export function orderMainBodies(components, expected = 18, minimumBodyArea = 250) {
  const ranked = components.filter(c => c.area >= minimumBodyArea).sort((a, b) => b.area - a.area);
  const candidates = ranked.slice(0, expected).sort((a, b) => (a.top + a.height / 2) - (b.top + b.height / 2));
  if (candidates.length !== expected) return {ordered: candidates.map((c, index) => ({...c, index})), countMatches: false, candidates: ranked.length};
  const ordered = [0, 1, 2].flatMap(row => candidates.slice(row * 6, row * 6 + 6)
    .sort((a, b) => a.left - b.left)
    .map((c, frame) => ({...c, row, frame, index: row * 6 + frame, action: ['idle', 'talk', 'profession'][row]})));
  return {ordered, countMatches: ranked.length === expected, candidates: ranked.length};
}

export function containedPoseLabels(components, rect, explicitLabels) {
  if (explicitLabels) {
    assert.ok(Array.isArray(explicitLabels) && explicitLabels.length > 0, 'componentLabels must identify a measured full pose');
    const selected = components.filter(c => explicitLabels.includes(c.label));
    assert.equal(selected.length, new Set(explicitLabels).size, 'Unknown source component label');
    assert.ok(selected.every(c => inside(c, rect)), 'Measured rect must contain every selected component');
    assert.ok(selected.some(c => c.area >= 250), 'Measured pose needs a complete body');
    return {labels: new Set(selected.map(c => c.label)), bodies: selected.filter(c => c.area >= 250), islands: selected.filter(c => c.area < 250), method: 'manually-pinned-component-labels'};
  }
  const big = components.filter(c => c.area >= 250);
  const bodies = big.filter(c => inside(c, rect));
  assert.equal(bodies.length, 1, 'Rect contains zero or multiple bodies: use exact full-body rect or explicit componentLabels');
  const body = bodies[0];
  const islands = components.filter(c => c.area < 250 && inside(c, rect)).filter(c => {
    const ordered = big.map(b => ({label: b.label, distance: rectDistance(c, b)})).sort((a, b) => a.distance - b.distance);
    // Ambiguous touching islands require a manually authored component list.
    return ordered[0]?.label === body.label && (ordered.length === 1 || ordered[0].distance < ordered[1].distance);
  });
  return {labels: new Set([body.label, ...islands.map(c => c.label)]), bodies, islands, method: 'complete-body-and-unambiguous-contained-small-islands'};
}

export function maskedPose(data, sourceWidth, sourceHeight, labels, selection, rect) {
  assert.ok(Number.isInteger(rect.left) && Number.isInteger(rect.top) && Number.isInteger(rect.width) && Number.isInteger(rect.height));
  assert.ok(rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.left + rect.width <= sourceWidth && rect.top + rect.height <= sourceHeight);
  const pixels = Buffer.alloc(rect.width * rect.height * 4);
  let opaque = 0;
  for (let y = 0; y < rect.height; y++) for (let x = 0; x < rect.width; x++) {
    const p = (rect.top + y) * sourceWidth + rect.left + x;
    if (!selection.has(labels[p])) continue;
    const dst = (y * rect.width + x) * 4, src = p * 4;
    data.copy(pixels, dst, src, src + 3); pixels[dst + 3] = 255; opaque++;
  }
  return {pixels, opaque};
}

export function suggestContactRoot(labels, width, component) {
  // Only actual occupied pixels close to the low contact line are considered.
  // This is a boot/hem contact candidate, not a bounding-box centre.
  const groundY = component.top + component.height;
  const contacts = [];
  for (let y = Math.max(component.top, groundY - 4); y < groundY; y++) {
    for (let x = component.left; x < component.left + component.width; x++) if (labels[y * width + x] === component.label) contacts.push(x);
  }
  contacts.sort((a, b) => a - b);
  return {rootX: contacts[Math.floor(contacts.length / 2)] ?? null, rootY: groundY,
    method: 'occupied-bottom-contact-median-candidate', confirmed: false,
    warning: 'Manual world-foot/root confirmation required; robe hems and props can reach below boots.'};
}

export function suggestBootPairBandRoot(labels, width, component) {
  const groundY = component.top + component.height;
  const bandHeight = Math.max(4, Math.ceil(component.height * .04));
  const rows = [];
  let left = Infinity, right = -1;
  for (let y = Math.max(component.top, groundY - bandHeight); y < groundY; y++) {
    const runs = [];
    let start = null;
    for (let x = component.left; x <= component.left + component.width; x++) {
      const occupied = x < component.left + component.width && labels[y * width + x] === component.label;
      if (occupied && start === null) start = x;
      if (!occupied && start !== null) {runs.push([start, x - 1]); left = Math.min(left, start); right = Math.max(right, x - 1); start = null;}
    }
    if (runs.length) rows.push({y, runs});
  }
  return {rootX: Number.isFinite(left) ? (left + right) / 2 : null, rootY: groundY, occupiedBandSpan: [left, right], bandHeight, rows,
    method: 'occupied-lower-four-percent-boot-pair-span-candidate', confirmed: false,
    warning: 'Manual sole/hem/prop discrimination required: sword tips, long robes and foreshortened feet can bias this candidate.'};
}

export function silhouetteDiagnostics(labels, width, frame, scale, root) {
  let upperLeft = Infinity, upperRight = -1, bodyLeft = Infinity, bodyRight = -1;
  const upperEnd = frame.top + frame.height * .35;
  for (let y = frame.top; y < frame.top + frame.height; y++) {
    for (let x = frame.left; x < frame.left + frame.width; x++) {
      if (labels[y * width + x] !== frame.label) continue;
      if (y < upperEnd) {upperLeft = Math.min(upperLeft, x); upperRight = Math.max(upperRight, x);}
      else {bodyLeft = Math.min(bodyLeft, x); bodyRight = Math.max(bodyRight, x);}
    }
  }
  return {crownToRootNative: +(scale * (root.rootY - frame.top)).toFixed(2),
    upperSilhouetteWidthNative: +(Math.max(0, upperRight - upperLeft + 1) * scale).toFixed(2),
    lowerSilhouetteWidthNative: +(Math.max(0, bodyRight - bodyLeft + 1) * scale).toFixed(2),
    note: 'Silhouette regions are diagnostic only; they do not locate a chin, establish anatomy, or approve ART.'};
}
