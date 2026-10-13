// Scoped canonical export. All v1 ART, live player, owner map and DB remain read-only.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
import {labelAlpha, containedPoseLabels, maskedPose} from './review/measurement-helper.mjs';

const root = dirname(fileURLToPath(import.meta.url)), workspace = resolve(root, '../../../..');
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-motion-v2');
const partial = process.argv.includes('--partial');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function safe(base, file) {
  const path = resolve(base, file), rel = relative(base, path);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Outside allowed root: ' + file);
  return path;
}
const local = file => safe(root, file), inWorkspace = file => safe(workspace, file);
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const optionalJson = async file => {try {return await json(file);} catch (e) {if (e.code === 'ENOENT') return null; throw e;}};
const write = async (file, value) => {
  await mkdir(dirname(local(file)), {recursive: true});
  await writeFile(local(file), JSON.stringify(value, null, 2) + '\n');
};
assert.equal(await optionalJson(local('approval.json')), null, 'Owner-approved pack: create a new version');
const plan = await json(local('production-plan.json'));
const input = await json(local('registration-input.json'));
const actions = ['idle', 'talk', 'profession'];
const directions = ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'];
const newDirections = directions.filter(d => d !== 'southeast');
const expectedActors = ['tran-duy', 'diep-tinh', 'ta-kiem-son', 'to-nhuoc'];
const contract = {canvas: [96, 96], pivot: [48, 88], standingHeight: 80, baseHumanCanvas: [64, 96], paddingOnly: true, sampling: 'nearest', atlasPadding: 2};
assert.deepEqual(new Set(plan.actors.map(a => a.slug)), new Set(expectedActors), 'Four approved pilot actors required');
assert.equal(plan.actors.length, 4);
assert.equal(plan.requests.length, 28, 'Four actors × seven real directional sources required');
const requestKeys = plan.requests.map(r => r.slug + '/' + r.direction);
assert.equal(new Set(requestKeys).size, 28, 'Unique actor/direction requests required');
for (const request of plan.requests) assert.ok(expectedActors.includes(request.slug) && newDirections.includes(request.direction), 'Unknown actor/direction request');
assert.ok(Array.isArray(input.sources));
assert.equal(new Set(input.sources.map(s => s.slug + '/' + s.direction)).size, input.sources.length, 'Duplicate source registration');
if (!partial) assert.equal(input.sources.length, 28, 'Use --partial only for an honest incomplete preview');

const v1Root = inWorkspace('docs/design/characters/van-hai-npc-motion-v1');
const approvalFile = resolve(v1Root, 'approval.json');
const approvalBytes = await readFile(approvalFile), approval = JSON.parse(approvalBytes);
assert.equal(plan.basisSha256, hash(approvalBytes), 'Production plan pilot approval pin changed');
assert.ok(approval.ownerApproved && approval.artApproved && approval.motionApproved);
assert.equal(approval.scope.clips, 12); assert.equal(approval.scope.poses, 72);
assert.deepEqual(approval.scope.directions, ['southeast']);
async function verifyPilotPins() {
  for (const entry of approval.pinnedFiles) assert.equal(hash(await readFile(safe(v1Root, entry.file))), entry.sha256, 'Approved v1 baseline changed: ' + entry.file);
  assert.equal(hash(await readFile(approvalFile)), hash(approvalBytes), 'v1 approval changed during export');
}
await verifyPilotPins();
const v1Catalog = await json(resolve(v1Root, 'catalog.json'));
const standardRoot = inWorkspace('docs/design/characters/van-hai-npc-visual-standard-v1');
const basisBytes = await readFile(resolve(standardRoot, 'basis.json')), directionBytes = await readFile(resolve(standardRoot, 'directions.json'));
const basis = JSON.parse(basisBytes), liveDirections = JSON.parse(directionBytes);
assert.equal(plan.primaryStandardSha256, hash(basisBytes), 'Production plan live primary reference pin changed');
assert.equal(hash(await readFile(inWorkspace(basis.sourceCatalog))), basis.sourceCatalogSha256, 'Live player catalog changed');
assert.equal(hash(await readFile(inWorkspace(basis.atlas))), basis.atlasSha256, 'Live player primary atlas changed');
for (const d of liveDirections.directions) {
  assert.equal(hash(await readFile(inWorkspace(d.atlas))), d.atlasSha256, 'Live direction atlas changed: ' + d.direction);
  assert.equal(hash(await readFile(resolve(standardRoot, d.native))), d.nativeSha256, 'Live native reference changed');
  assert.equal(hash(await readFile(resolve(standardRoot, d.nearest8x))), d.nearest8xSha256, 'Live nearest reference changed');
}
const morphologyBasis = {
  primaryActor: basis.primaryActor, primaryReference: basis.primaryReference,
  basisFile: 'docs/design/characters/van-hai-npc-visual-standard-v1/basis.json', basisSha256: hash(basisBytes),
  directionsFile: 'docs/design/characters/van-hai-npc-visual-standard-v1/directions.json', directionsSha256: hash(directionBytes),
  directionReferences: liveDirections.directions.map(d => ({direction: d.direction, native: '../van-hai-npc-visual-standard-v1/' + d.native, nativeSha256: d.nativeSha256, nearest8xSha256: d.nearest8xSha256, canvas: d.canvas, pivot: d.pivot})),
  rule: 'New neutral/views use live Wang Lin as Image1. Explicit action corrections may edit the same NPC and direction first, with same-direction live Wang Lin remaining the primary style/anatomy reference at the recorded input index. Own NPC pilot locks identity; every action is compared directly at native1x. One neutral scale per source; padding never enlarges anatomy.'
};
const pilotBasis = {file: '../van-hai-npc-motion-v1/approval.json', sha256: hash(approvalBytes), pinnedFilesVerified: approval.pinnedFiles.length, approvedDirections: ['southeast'], scope: approval.scope};
const gddFile = 'docs/design/world/van-hai-living-world-v1/plan.json', gdd = {file: gddFile, sha256: hash(await readFile(inWorkspace(gddFile)))};
const actors = plan.actors.map(actor => ({...actor, canvas: contract.canvas, pivot: contract.pivot, views: {}, artApproved: false, ownerApproved: false, runtimeImported: false}));
const clips = {}, sources = [], registrations = [];
function pilotPath(file) {return '../van-hai-npc-motion-v1/' + file;}
for (const actor of actors) {
  const approvedActor = v1Catalog.actors.find(a => a.slug === actor.slug);
  assert.ok(approvedActor && approval.scope.actors.some(a => a.id === actor.id));
  const view = {direction: 'southeast', neutralSprite: pilotPath(approvedActor.neutralSprite), neutralSha256: approvedActor.neutralSha256,
    clips: {}, source: pilotPath(approvedActor.source), sourceSha256: approvedActor.sourceSha256, sourceDimensions: approvedActor.sourceDimensions,
    sourceScale: approvedActor.sourceScale, neutralHeight: approvedActor.neutralHeight, importedPilot: true, ownerApproved: true, artApproved: true, motionApproved: true,
    approval: pilotBasis.file};
  for (const action of actions) {
    const original = approvedActor.clips[action];
    const clip = {...original, atlas: pilotPath(original.atlas), frames: original.frames.map(frame => ({...frame, file: pilotPath(frame.file)})),
      artApproved: true, ownerApproved: true, motionApproved: true, approval: pilotBasis.file, importedPilot: true};
    view.clips[action] = clip; clips[clip.id] = clip;
  }
  actor.views.southeast = view;
}

for (const measurement of input.sources) {
  const {slug, direction, source} = measurement;
  const request = plan.requests.find(r => r.slug === slug && r.direction === direction);
  assert.ok(request, 'Registered source is not in the production plan');
  assert.equal(request.source, source, 'Plan must pin the selected source path');
  const actor = actors.find(a => a.slug === slug);
  const bytes = await readFile(local(source)), sourceSha256 = hash(bytes);
  assert.equal(sourceSha256, measurement.sourceSha256, 'Measured source changed: ' + slug + '/' + direction);
  assert.equal(measurement.visuallyReviewed, true, 'Manual source/root review required');
  assert.equal(measurement.proposalOnly ?? false, false, 'Diagnostic proposals are not confirmed measurements');
  const threshold = measurement.alphaThreshold ?? 128;
  assert.ok(Number.isInteger(threshold) && threshold > 0 && threshold <= 255);
  const {data, info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const {labels, components} = labelAlpha(data, info.width, info.height, threshold);
  assert.equal(measurement.frames.length, 18, 'Eighteen actual poses per source required');
  assert.deepEqual(new Set(measurement.frames.map(f => f.index)), new Set(Array.from({length: 18}, (_, i) => i)));
  assert.equal(measurement.neutralIndex, 0, 'Neutral must be idle frame0');
  const neutral = measurement.frames.find(f => f.index === 0);
  assert.equal(neutral.action, 'idle'); assert.equal(neutral.frame, 0);
  const neutralTop = measurement.neutralTopY ?? neutral.top;
  const {neutralHeight, scale} = measurement;
  assert.ok(Number.isFinite(neutralHeight) && neutralHeight > 0 && Number.isFinite(scale) && scale > 0);
  assert.ok(Math.abs(scale - 80 / neutralHeight) < 1e-9, 'Exactly one neutral-derived scale is required');
  assert.ok(Math.abs(neutralHeight - (neutral.rootY - neutralTop)) < 1, 'Neutral height must use measured crown and world root');
  const mapped = [];
  const extracted = new Map();
  const usedBodyLabels = new Set();
  async function extract(frame) {
    if (extracted.has(frame.index)) return extracted.get(frame.index);
    const {left, top, width, height, rootX, rootY} = frame;
    for (const value of [left, top, width, height]) assert.ok(Number.isInteger(value) && value >= 0, 'Invalid source rect');
    assert.ok(width > 0 && height > 0 && left + width <= info.width && top + height <= info.height);
    assert.ok(Number.isFinite(rootX) && Number.isFinite(rootY) && rootX >= left && rootX <= left + width && rootY >= top && rootY <= top + height,
      'Manually measured world root must be inside the source rect');
    assert.ok(!String(frame.rootBasis ?? measurement.rootBasis ?? '').includes('UNCONFIRMED'), 'Unconfirmed root proposal cannot be packed');
    const selection = containedPoseLabels(components, frame, frame.componentLabels);
    for (const component of selection.bodies) {
      assert.ok(!usedBodyLabels.has(component.label), 'One actual source body was registered as multiple motion poses');
      usedBodyLabels.add(component.label);
    }
    const {pixels: crop, opaque} = maskedPose(data, info.width, info.height, labels, selection.labels, frame);
    const selectedArea = [...selection.labels].reduce((sum, label) => sum + components.find(c => c.label === label).area, 0);
    assert.equal(opaque, selectedArea, 'Measured component pixels lost');
    const size = [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
    const offset = [Math.round(48 - (rootX - left) * scale), Math.round(88 - (rootY - top) * scale)];
    const pixels = await sharp(crop, {raw: {width, height, channels: 4}}).resize(size[0], size[1], {kernel: 'nearest'}).raw().toBuffer();
    const canvas = Buffer.alloc(96 * 96 * 4), bounds = [96, 96, -1, -1];
    let nativeOpaque = 0;
    for (let y = 0; y < size[1]; y++) for (let x = 0; x < size[0]; x++) {
      const src = (y * size[0] + x) * 4;
      if (!pixels[src + 3]) continue;
      const dx = x + offset[0], dy = y + offset[1];
      assert.ok(dx >= 0 && dx < 96 && dy >= 0 && dy < 96, 'Native pose would lose pixels; revise source/root, never shrink individual pose: ' + slug + '/' + direction + '/' + frame.index);
      pixels.copy(canvas, (dy * 96 + dx) * 4, src, src + 4);
      nativeOpaque++; bounds[0] = Math.min(bounds[0], dx); bounds[1] = Math.min(bounds[1], dy); bounds[2] = Math.max(bounds[2], dx); bounds[3] = Math.max(bounds[3], dy);
    }
    assert.ok(nativeOpaque > 0);
    const buffer = await sharp(canvas, {raw: {width: 96, height: 96, channels: 4}}).png().toBuffer();
    mapped.push({...frame, sourceRect: {left, top, width, height}, sourcePivot: [rootX, rootY], scale, offset, nativeCutoutSize: size,
      nativeBounds: [bounds[0], bounds[1], bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1], nativeOpaque,
      extraction: selection.method, componentLabels: [...selection.labels], sourceBodyPixels: selection.bodies.reduce((sum, c) => sum + c.area, 0),
      extractedSourcePixels: opaque, bodyPixelsDropped: 0, opaquePixelsDropped: 0, alphaThreshold: threshold,
      rootMethod: frame.rootBasis ?? measurement.rootBasis ?? 'Manually pinned world root; no bbox centre or per-pose fitting',
      pixelsResampled: true, resampling: 'nearest-once', rgbPainted: false});
    extracted.set(frame.index, buffer); return buffer;
  }
  const view = {direction, neutralSprite: 'calibration/' + slug + '-' + direction + '.png', clips: {}, source, sourceSha256,
    sourceDimensions: [info.width, info.height], sourceScale: scale, neutralHeight, artApproved: false, ownerApproved: false, runtimeImported: false};
  const neutralBuffer = await extract(neutral);
  await mkdir(local('calibration'), {recursive: true}); await writeFile(local(view.neutralSprite), neutralBuffer);
  view.neutralSha256 = hash(neutralBuffer);
  for (const action of actions) {
    const selected = measurement.frames.filter(f => f.action === action).sort((a, b) => a.frame - b.frame);
    assert.deepEqual(selected.map(f => f.frame), [0, 1, 2, 3, 4, 5], 'Six real poses required per action');
    const durationMs = action === 'profession' ? 1500 : 1200, frames = [], layers = [], nativeHashes = [];
    for (const [index, frame] of selected.entries()) {
      const buffer = await extract(frame), file = 'frames/' + slug + '-' + action + '-' + direction + '/' + String(index + 1).padStart(3, '0') + '.png';
      await mkdir(dirname(local(file)), {recursive: true}); await writeFile(local(file), buffer);
      const rect = {x: 2 + index * 100, y: 2, w: 96, h: 96}, digest = hash(buffer);
      frames.push({...rect, rect, file, sha256: digest, durationMs: durationMs / 6}); nativeHashes.push(digest); layers.push({input: buffer, left: rect.x, top: rect.y});
    }
    assert.ok(new Set(nativeHashes).size > 1, 'Actual motion must not collapse to repeated neutral');
    const atlas = await sharp({create: {width: 600, height: 100, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}}).composite(layers).png().toBuffer();
    const atlasFile = 'atlases/' + slug + '-' + action + '-' + direction + '.png';
    await mkdir(local('atlases'), {recursive: true}); await writeFile(local(atlasFile), atlas);
    const clip = {id: slug + '-' + action + '-' + direction, actor: actor.id, action, direction, atlas: atlasFile, atlasSha256: hash(atlas), atlasSize: [600, 100], atlasPadding: 2,
      canvas: contract.canvas, frameSize: contract.canvas, pivot: contract.pivot, frames, fps: action === 'profession' ? 4 : 5, durations: Array(6).fill(1), durationMs,
      loop: action !== 'profession', holdLast: false, phases: [{at: 0, label: action}], uniqueFrames: new Set(nativeHashes).size, artApproved: false, ownerApproved: false};
    view.clips[action] = clip; clips[clip.id] = clip;
  }
  const metadataFile = source.replace(/\.png$/i, '.json'), metadataBytes = await readFile(local(metadataFile)), metadata = JSON.parse(metadataBytes);
  assert.equal(metadata.model, 'gpt-image-2'); assert.equal(metadata.image.sha256, sourceSha256, 'Router source differs');
  assert.equal(metadata.operation, 'edit', 'Motion source must record the actual referenced-image edit');
  const inputImages = [];
  for (const image of metadata.inputImages ?? []) {
    const path = inWorkspace(image.path);
    assert.equal(hash(await readFile(path)), image.sha256, 'Generation input changed');
    inputImages.push({...image, path: relative(workspace, path).replaceAll('\\', '/')});
  }
  const directionReference = liveDirections.directions.find(d => d.direction === direction);
  assert.ok(inputImages.length >= 2, 'Live Wang and own NPC identity inputs required');
  let primaryStyleImageIndex = 1;
  let referencePolicy = {stage: 'new-neutral-or-view', editTargetFirst: false, primaryStyleImageIndex: 1};
  if (request.referencePolicy?.stage === 'action-correction') {
    const policy = request.referencePolicy;
    assert.equal(policy.editTargetFirst, true, 'Action correction must explicitly declare its existing NPC edit target');
    assert.equal(policy.primaryStyleImageIndex, 2, 'Action correction keeps live Wang Lin as primary style/anatomy in Image2');
    assert.equal(policy.neutralIntentPreserved, true, 'Action correction requires existing neutral identity/camera intent');
    assert.ok(typeof policy.editTargetFile === 'string' && typeof policy.editTargetSha256 === 'string', 'Pinned action edit target required');
    const sameDirectionPattern = new RegExp('^raw/' + slug + '-' + direction + '(?:-[a-z0-9]+)*\\.png$');
    assert.ok(sameDirectionPattern.test(policy.editTargetFile), 'Action target must be this same NPC and actual direction');
    assert.notEqual(policy.editTargetFile, source, 'Action edit target cannot be the newly generated source');
    const revision = request.sourceRevisions?.find(r => r.source === policy.editTargetFile && r.sha256 === policy.editTargetSha256);
    assert.ok(revision, 'Action target must be retained in the request’s pinned source revisions');
    const targetBytes = await readFile(local(policy.editTargetFile));
    assert.equal(hash(targetBytes), policy.editTargetSha256, 'Action correction original source changed');
    const targetMetadata = await json(local(policy.editTargetFile.replace(/\.png$/i, '.json')));
    assert.equal(targetMetadata.model, 'gpt-image-2');
    assert.equal(targetMetadata.operation, 'edit');
    assert.equal(targetMetadata.image.sha256, policy.editTargetSha256, 'Original target router source differs');
    assert.equal(targetMetadata.inputImages?.[0]?.sha256, directionReference.nearest8xSha256,
      'Existing neutral/view target must have been created with same-direction live Wang Lin as Image1');
    for (const originalInput of targetMetadata.inputImages ?? []) {
      assert.equal(hash(await readFile(inWorkspace(originalInput.path))), originalInput.sha256, 'Original action-target generation input changed');
    }
    assert.equal(inputImages[0].sha256, policy.editTargetSha256, 'Action correction Image1 must be the pinned same-NPC/same-direction target');
    assert.equal(inputImages[1].sha256, directionReference.nearest8xSha256, 'Action correction Image2 must be same-direction live Wang Lin');
    primaryStyleImageIndex = 2;
    referencePolicy = {...policy, validationScope: 'Same NPC/direction existing neutral intent and input provenance; no immutable-pixel or ART approval claim'};
  } else {
    assert.ok(!request.referencePolicy || request.referencePolicy.stage === 'new-neutral-or-view', 'Unknown reference stage cannot bypass the live-Wang-first guard');
    assert.equal(inputImages[0].sha256, directionReference.nearest8xSha256, 'Image1 must be live Wang Lin in the same actual direction');
    if (request.referencePolicy) {
      assert.equal(request.referencePolicy.editTargetFirst ?? false, false, 'New neutral/view creation requires live Wang Lin first');
      assert.equal(request.referencePolicy.primaryStyleImageIndex ?? 1, 1, 'New neutral/view primary reference must be Image1');
      referencePolicy = {...request.referencePolicy, editTargetFirst: false, primaryStyleImageIndex: 1};
    }
  }
  if (request.inputHashes) {
    assert.equal(inputImages.length, request.inputHashes.length, 'Actual input count differs from the planned references');
    for (const [index, planned] of request.inputHashes.entries()) {
      assert.equal(hash(await readFile(local(planned.file))), planned.sha256, 'Pinned production input changed');
      assert.equal(inputImages[index].sha256, planned.sha256, 'Actual input order/hash differs from the production plan');
    }
  }
  const promptFile = measurement.prompt ?? request.prompt;
  assert.ok(promptFile, 'Recorded prompt path required');
  const promptBytes = await readFile(local(promptFile));
  assert.equal(metadata.prompt.trim(), promptBytes.toString('utf8').trim(), 'Actual router prompt differs');
  sources.push({actor: actor.id, slug, direction, file: source, sha256: sourceSha256, size: [info.width, info.height], prompt: promptFile,
    promptSha256: hash(promptBytes), routerMetadata: metadataFile, routerMetadataSha256: hash(metadataBytes), inputs: inputImages,
    primaryStyleImageIndex, referencePolicy, scale, neutralHeight, alphaThreshold: threshold});
  registrations.push({slug, direction, source, sourceSha256, neutralIndex: 0, neutralHeight, neutralTopY: neutralTop, scale,
    sourceDimensions: [info.width, info.height], alphaThreshold: threshold, worldRootPolicy: 'Manually pinned actual roots; no bbox centre or per-pose fitting',
    frames: mapped.sort((a, b) => a.index - b.index)});
  actor.views[direction] = view;
}
const missing = actors.flatMap(actor => directions.filter(direction => !actor.views[direction]).map(direction => ({actorId: actor.id, slug: actor.slug, direction, actions})));
const producedClips = Object.keys(clips).length;
const coverage = {actors: 4, requiredClips: 96, requiredPoses: 576, producedClips, clips: producedClips,
  poses: Object.values(clips).reduce((sum, clip) => sum + clip.frames.length, 0), newSources: sources.length, newClips: sources.length * 3, newPoses: sources.length * 18,
  importedPilotClips: 12, importedPilotPoses: 72, actions, requiredDirections: directions,
  producedDirectionsByActor: Object.fromEntries(actors.map(a => [a.id, directions.filter(d => a.views[d])])),
  missing, fullDirectionalSet: missing.length === 0};
const registration = {schema: 'npc-motion-registration-2', date: '2026-10-13', registrationInput: 'registration-input.json',
  registrationInputSha256: hash(await readFile(local('registration-input.json'))), contract, morphologyBasis, pilotBasis, gdd, sources: registrations,
  artApproved: false, ownerApproved: false, runtimeImported: false};
await write('registration.json', registration);
await write('catalog.json', {schema: 'npc-motion-catalog-2', id: 'van-hai-npc-motion-v2', version: 2, date: '2026-10-13',
  status: missing.length ? 'partial-real-direction-preview' : 'four-npc-eight-real-direction-owner-review-pending',
  generator: 'project-router-gpt-image-2-edit', pixelsResampled: true, contract, morphologyBasis, pilotBasis, gdd, actors, clips, sources,
  registration: 'registration.json', coverage, artApproved: false, ownerApproved: false, runtimeImported: false});
await write('production.json', {...plan, schema: 'npc-motion-production-2', id: 'van-hai-npc-motion-v2', date: '2026-10-13',
  status: missing.length ? 'partial-real-direction-preview' : 'eight-direction-motion-owner-review-pending',
  contract, morphologyBasis, pilotBasis, gdd, sources, registration: 'registration.json',
  registrationSha256: hash(await readFile(local('registration.json'))), coverage, artApproved: false, ownerApproved: false, runtimeImported: false});
await verifyPilotPins();
console.log(JSON.stringify({actors: actors.length, clips: producedClips, poses: coverage.poses, newSources: sources.length, missing: missing.length,
  fullDirectionalSet: coverage.fullDirectionalSet, pilotPinnedFilesVerified: approval.pinnedFiles.length, runtimeImported: false}));
