// Generate explicitly selected measurement candidates. No approval or confirmation.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha, containedPoseLabels, maskedPose, suggestBootPairBandRoot} from './measurement-helper.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-motion-v2');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const args = process.argv.slice(2);
assert.ok(args.every(arg => !arg.startsWith('--') || ['--ids', '--refresh'].includes(arg)), 'Unknown option');
const ids = [...new Set(args.filter(arg => !arg.startsWith('--')).flatMap(arg => arg.split(',')).filter(Boolean))];
assert.ok(ids.length && ids.every(id => /^[a-z0-9-]+$/.test(id)), 'Explicit slug-direction IDs required');
function local(file) {
  const path = resolve(root, file), rel = relative(root, path);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Outside new motion pack');
  return path;
}
const json = async file => JSON.parse(await readFile(local(file), 'utf8'));
const optionalJson = async file => {try {return await json(file);} catch (e) {if (e.code === 'ENOENT') return null; throw e;}};
const plan = await json('production-plan.json'), report = await json('review/source-components.json');
const registration = await optionalJson('registration-input.json');
assert.equal(await optionalJson('approval.json'), null, 'Approved pack is immutable; create a new version');
await mkdir(local('review'), {recursive: true});
const summaries = [];
for (const id of ids) {
  const request = plan.requests.find(r => r.slug + '-' + r.direction === id);
  assert.ok(request, 'ID not in the directional plan: ' + id);
  const file = 'review/' + id + '-root-review.json';
  const bytes = await readFile(local(request.source)), sourceSha256 = hash(bytes);
  const evidence = report.sources.find(s => s.slug === request.slug && s.direction === request.direction);
  assert.ok(evidence && evidence.source === request.source && evidence.sourceSha256 === sourceSha256, 'Inspect this exact selected source first: ' + id);
  const confirmed = registration?.sources?.find(s => s.slug === request.slug && s.direction === request.direction);
  if (confirmed) {
    assert.equal(confirmed.sourceSha256, sourceSha256, 'Confirmed source changed; explicit revision required');
    summaries.push({id, skipped: 'existing confirmed registration preserved'}); continue;
  }
  const prior = await optionalJson(file);
  if (prior && !args.includes('--refresh')) {
    assert.equal(prior.sourceSha256, sourceSha256, 'Root review source changed; explicit --refresh required');
    summaries.push({id, skipped: 'existing root proposal/overrides preserved', proposal: file, strip: prior.reviewStrip}); continue;
  }
  const {data, info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const threshold = evidence.alphaThreshold ?? 128;
  const {labels, components} = labelAlpha(data, info.width, info.height, threshold);
  const fullBodies = components.filter(c => c.area >= 250);
  assert.equal(fullBodies.length, 18, 'Extra/missing full components require manual pose/component selection: ' + id);
  assert.equal(evidence.detectedCountMatches, true, 'Ambiguous source ordering requires manual inspection');
  const ordered = evidence.detectedFrames.sort((a, b) => a.index - b.index);
  assert.equal(ordered.length, 18);
  assert.deepEqual(ordered.map(f => f.index), Array.from({length: 18}, (_, i) => i));
  const frames = ordered.map(f => {
    const contact = suggestBootPairBandRoot(labels, info.width, f);
    assert.ok(Number.isFinite(contact.rootX) && Number.isFinite(contact.rootY));
    return {index: f.index, action: f.action, frame: f.frame, left: f.left, top: f.top, width: f.width, height: f.height,
      rootX: contact.rootX, rootY: contact.rootY, rootBasis: 'UNCONFIRMED occupied lower-band boot-pair contact proposal',
      bootPairBandCandidate: contact};
  });
  const neutral = frames[0], neutralHeight = neutral.rootY - neutral.top, scale = 80 / neutralHeight;
  const layers = [], diagnostics = [];
  for (const frame of frames) {
    const selection = containedPoseLabels(components, frame, frame.componentLabels);
    const {pixels: crop, opaque} = maskedPose(data, info.width, info.height, labels, selection.labels, frame);
    const size = [Math.max(1, Math.round(frame.width * scale)), Math.max(1, Math.round(frame.height * scale))];
    const pixels = await sharp(crop, {raw: {width: frame.width, height: frame.height, channels: 4}}).resize(size[0], size[1], {kernel: 'nearest'}).raw().toBuffer();
    const offset = [Math.round(48 - (frame.rootX - frame.left) * scale), Math.round(88 - (frame.rootY - frame.top) * scale)];
    const native = Buffer.alloc(96 * 96 * 4);
    let clippedOpaquePixels = 0, nativeOpaquePixels = 0;
    for (let y = 0; y < size[1]; y++) for (let x = 0; x < size[0]; x++) {
      const src = (y * size[0] + x) * 4;
      if (!pixels[src + 3]) continue;
      const dx = x + offset[0], dy = y + offset[1];
      if (dx < 0 || dx >= 96 || dy < 0 || dy >= 96) {clippedOpaquePixels++; continue;}
      pixels.copy(native, (dy * 96 + dx) * 4, src, src + 4); nativeOpaquePixels++;
    }
    const bodyPng = await sharp(native, {raw: {width: 96, height: 96, channels: 4}}).png().toBuffer();
    const guide = '<svg width="96" height="96"><path d="M0 88H96" stroke="#73988c" stroke-width=".5"/><path d="M44 88H52M48 84V92" stroke="#dc4766" stroke-width="1"/><text x="2" y="95" font-family="monospace" font-size="5" fill="#53645b">' + frame.index + ' ' + frame.action + '</text></svg>';
    const tile = await sharp({create: {width: 96, height: 96, channels: 4, background: '#e9e6db'}})
      .composite([{input: Buffer.from(guide), left: 0, top: 0}, {input: bodyPng, left: 0, top: 0}]).png().toBuffer();
    layers.push({input: tile, left: frame.frame * 96, top: ['idle', 'talk', 'profession'].indexOf(frame.action) * 96});
    diagnostics.push({index: frame.index, sourceOpaque: opaque, nativeOpaquePixels, clippedOpaquePixels, nativeSize: size, offset,
      crownToRootNative: +((frame.rootY - frame.top) * scale).toFixed(2), sourceLabels: [...selection.labels]});
  }
  const strip = 'review/' + id + '-root-review-2x.png';
  const sheet = await sharp({create: {width: 576, height: 288, channels: 4, background: '#e9e6db'}}).composite(layers).png().toBuffer();
  await sharp(sheet).resize(1152, 576, {kernel: 'nearest'}).png().toFile(local(strip));
  const proposal = {schema: 'npc-motion-world-root-review-proposal-1', date: '2026-10-13', slug: request.slug, direction: request.direction,
    source: request.source, sourceSha256, sourceDimensions: [info.width, info.height], prompt: request.prompt, alphaThreshold: threshold,
    neutralIndex: 0, neutralHeight, neutralTopY: neutral.top, scale, frames, diagnostics, reviewStrip: strip,
    canvas: [96, 96], pivot: [48, 88], proposalOnly: true, visuallyReviewed: false,
    needsManualAdjustment: diagnostics.some(d => d.clippedOpaquePixels > 0),
    basis: 'Boot pair proposal uses only actual occupied pixels in the lower four percent; inspect both soles, robe hem and prop tip.',
    rootReviewPolicy: 'View this exact source and native strip, then manually confirm or override roots. Shared neutral scale only; no per-pose fitting.',
    artApproved: false, ownerApproved: false, runtimeImported: false};
  await writeFile(local(file), JSON.stringify(proposal, null, 2) + '\n');
  summaries.push({id, proposal: file, strip, scale, needsManualAdjustment: proposal.needsManualAdjustment});
}
console.log(JSON.stringify({proposals: summaries, explicitManualConfirmationRequired: true}));
