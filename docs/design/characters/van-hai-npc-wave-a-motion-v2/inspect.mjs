// Progressive, read-only source analysis. Writes evidence only in this new pack.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha, orderMainBodies, suggestContactRoot, suggestBootPairBandRoot, silhouetteDiagnostics, containedPoseLabels, maskedPose} from '../van-hai-npc-motion-v2/review/measurement-helper.mjs';

const root = dirname(fileURLToPath(import.meta.url));
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-wave-a-motion-v2');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const args = process.argv.slice(2);
const arg = (name, fallback = null) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const onlySlug = arg('--slug'), onlyDirection = arg('--direction'), threshold = Number(arg('--alpha-threshold', 128));
assert.ok(Number.isInteger(threshold) && threshold > 0 && threshold <= 255);
function local(file) {
  const path = resolve(root, file), rel = relative(root, path);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Outside motion pack');
  return path;
}
try {await readFile(local('approval.json'));assert.fail('Approved motion pack is immutable; inspect a new version');} catch(e) {if(e.code!=='ENOENT')throw e;}
const plan = JSON.parse(await readFile(local('production-plan.json'), 'utf8'));
const expected=[['bach-chi','NPC-HN-HERBALIST'],['tong-thiet','NPC-HN-FORGE'],['hua-hanh','NPC-HN-ROUTE-KEEPER'],['dinh-soc','NPC-HN-GATE-WARDEN'],['ky-an','NPC-HN-DISCIPLE-WATER'],['phung-da','NPC-HN-DISCIPLE-SWORD']];
const newDirections=['south','southwest','west','northwest','north','northeast','east'];
assert.equal(plan.actors.length,6,'Six Wave A actors required');
assert.deepEqual(new Set(plan.actors.map(a=>a.id)),new Set(expected.map(a=>a[1])),'Unexpected Wave A IDs');
assert.equal(plan.requests.length,42,'Six actors × seven real directional sources required');
assert.equal(new Set(plan.requests.map(q=>q.slug+'/'+q.direction)).size,42,'Duplicate actor/direction request');
for(const [slug,id] of expected){assert.equal(plan.actors.find(a=>a.slug===slug)?.id,id);for(const direction of newDirections)assert.ok(plan.requests.some(q=>q.slug===slug&&q.direction===direction),'Missing authored actor/direction');}
assert.ok(plan.requests.every(q=>newDirections.includes(q.direction)&&expected.some(a=>a[0]===q.slug)),'Seven new actual views only; southeast remains immutable pilot');
let registration = {sources: []};
try {registration = JSON.parse(await readFile(local('registration-input.json'), 'utf8'));} catch (e) {if (e.code !== 'ENOENT') throw e;}
const requests = plan.requests.filter(r => (!onlySlug || r.slug === onlySlug) && (!onlyDirection || r.direction === onlyDirection));
assert.ok(requests.length, 'No requests selected');
await mkdir(local('review'), {recursive: true});
const sources = [], missing = [];
for (const request of requests) {
  const {slug, direction, source} = request;
  assert.ok(/^[a-z0-9-]+$/.test(slug) && /^[a-z]+$/.test(direction));
  let bytes;
  try {bytes = await readFile(local(source));} catch (e) {if (e.code === 'ENOENT') {missing.push({slug, direction, source}); continue;} throw e;}
  const {data, info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const measured = registration.sources?.find(r => r.slug === slug && r.direction === direction && r.sourceSha256 === hash(bytes));
  const {labels, components} = labelAlpha(data, info.width, info.height, threshold);
  const {ordered, countMatches, candidates} = orderMainBodies(components);
  const frames = ordered.map(f => {
    const confirmed = measured?.frames?.find(m => m.index === f.index);
    const rootCandidate = suggestContactRoot(labels, info.width, f);
    return {...f, contactRootCandidate: rootCandidate, bootPairBandCandidate: suggestBootPairBandRoot(labels, info.width, f),
      ...(confirmed ? {measuredRoot: [confirmed.rootX, confirmed.rootY]} : {})};
  });
  const neutral = frames[0], neutralRoot = neutral?.contactRootCandidate;
  const proposedNeutralHeight = neutral && neutralRoot ? neutralRoot.rootY - neutral.top : null;
  const proposedScale = proposedNeutralHeight ? 80 / proposedNeutralHeight : null;
  let opaque = 0, soft = 0, zero = 0;
  for (let i = 3; i < data.length; i += 4) {if (data[i] >= threshold) opaque++; else if (data[i]) soft++; else zero++;}
  const escaped = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const lines = frames.map(f => {
    const r = f.contactRootCandidate, b = f.bootPairBandCandidate, color = ['#55d98d', '#ffd36e', '#6dc6ff'][f.row] ?? '#ff9673';
    return '<rect x="' + f.left + '" y="' + f.top + '" width="' + f.width + '" height="' + f.height + '" fill="none" stroke="' + color + '" stroke-width="3"/><text x="' + f.left + '" y="' + Math.max(20, f.top - 7) + '" fill="#16271e" stroke="#fff" stroke-width=".8" paint-order="stroke" font-family="Segoe UI" font-size="20">' + f.index + ' ' + escaped(f.action ?? 'unassigned') + '</text><circle cx="' + r.rootX + '" cy="' + r.rootY + '" r="7" fill="none" stroke="#ec466b" stroke-width="2"/><path d="M' + (b.rootX - 5) + ',' + b.rootY + 'h10M' + b.rootX + ',' + (b.rootY - 5) + 'v10" stroke="#3276db" stroke-width="2"/>';
  }).join('');
  const guide = 'review/' + slug + '-' + direction + '-source-components.png';
  await sharp({create: {width: info.width, height: info.height, channels: 4, background: '#eee7d7'}})
    .composite([{input: bytes, left: 0, top: 0}, {input: Buffer.from('<svg width="' + info.width + '" height="' + info.height + '">' + lines + '</svg>'), left: 0, top: 0}]).png().toFile(local(guide));
  const nativeLayers = [], diagnostics = [];
  for (const f of frames) {
    if (proposedScale === null || f.index === undefined || !f.action) continue;
    const r = f.contactRootCandidate, scale = measured?.scale ?? proposedScale;
    diagnostics.push({index: f.index, action: f.action, frame: f.frame, ...silhouetteDiagnostics(labels, info.width, f, scale, r)});
    const selection = containedPoseLabels(components, f);
    const {pixels} = maskedPose(data, info.width, info.height, labels, selection.labels, f);
    const cutWidth = Math.max(1, Math.round(f.width * scale)), cutHeight = Math.max(1, Math.round(f.height * scale));
    const cut = await sharp(pixels, {raw: {width: f.width, height: f.height, channels: 4}}).resize(cutWidth, cutHeight, {kernel: 'nearest'}).raw().toBuffer();
    const tile = Buffer.alloc(96 * 96 * 4), offsetX = Math.round(48 - (r.rootX - f.left) * scale), offsetY = Math.round(88 - (r.rootY - f.top) * scale);
    for (let y = 0; y < cutHeight; y++) for (let x = 0; x < cutWidth; x++) {
      const dx = x + offsetX, dy = y + offsetY;
      if (dx < 0 || dx >= 96 || dy < 0 || dy >= 96) continue;
      cut.copy(tile, (dy * 96 + dx) * 4, (y * cutWidth + x) * 4, (y * cutWidth + x + 1) * 4);
    }
    const tilePng = await sharp(tile, {raw: {width: 96, height: 96, channels: 4}}).png().toBuffer();
    nativeLayers.push({input: tilePng, left: f.frame * 96, top: f.row * 96});
  }
  const strip = 'review/' + slug + '-' + direction + '-native-calibration-candidates.png';
  if (nativeLayers.length) await sharp({create: {width: 576, height: 288, channels: 4, background: '#e9e6db'}}).composite(nativeLayers).png().toFile(local(strip));
  const proposal = {slug, direction, source, sourceSha256: hash(bytes), alphaThreshold: threshold, neutralIndex: 0,
    neutralHeight: proposedNeutralHeight, scale: proposedScale, visuallyReviewed: false, proposalOnly: true,
    frames: frames.map(f => ({index: f.index, action: f.action, frame: f.frame, left: f.left, top: f.top, width: f.width, height: f.height,
      rootX: f.contactRootCandidate.rootX, rootY: f.contactRootCandidate.rootY, rootBasis: 'UNCONFIRMED occupied-bottom-contact candidate'}))};
  await writeFile(local('review/' + slug + '-' + direction + '-registration-proposal.json'), JSON.stringify(proposal, null, 2) + '\n');
  sources.push({slug, direction, source, sourceSha256: hash(bytes), sourceDimensions: [info.width, info.height], alphaThreshold: threshold,
    alpha: {opaqueAtThreshold: opaque, softBelowThreshold: soft, zero}, connectedComponents: components, detectedFrames: frames,
    expectedFrames: 18, unassignedTinyComponents: components.filter(c=>c.area<250&&!frames.some(f=>c.left>=f.left&&c.top>=f.top&&c.left+c.width<=f.left+f.width&&c.top+c.height<=f.top+f.height)), bodyCandidates: candidates, detectedCountMatches: countMatches, guide, calibrationStrip: nativeLayers.length ? strip : null,
    diagnosticScale: measured?.scale ?? proposedScale, diagnostics,
    registrationStatus: measured?.visuallyReviewed ? 'manually-reviewed-source-found' : 'manual-world-root-measurement-required',
    notes: 'Source ordering/root candidates and silhouette measurements require manual review. Diagnostic strips may clip out-of-canvas candidates; canonical pack rejects any dropped opaque pixel. No ART approval is inferred.'});
}
// Merge progressive evidence without removing the reports for other sources.
let previous = [];
try {previous = JSON.parse(await readFile(local('review/source-components.json'), 'utf8')).sources ?? [];} catch (e) {if (e.code !== 'ENOENT') throw e;}
const keys = new Set(sources.map(s => s.slug + '/' + s.direction));
const report = {schema: 'npc-motion-source-components-2', date: '2026-10-13',
  sources: [...previous.filter(s => !keys.has(s.slug + '/' + s.direction)), ...sources], missing,
  artApproved: false, ownerApproved: false, runtimeModified: false};
await writeFile(local('review/source-components.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({sources: sources.map(s => ({slug: s.slug, direction: s.direction, size: s.sourceDimensions, components: s.connectedComponents.length, candidates: s.bodyCandidates, countMatches: s.detectedCountMatches, guide: s.guide})), missing, manualRootsRequired: true}));
