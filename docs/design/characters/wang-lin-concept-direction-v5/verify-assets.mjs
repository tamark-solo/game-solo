import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const json = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const manifest = await json('manifest.json');
const generation = await json('generation.json');
const registration = await json('registration.json');
const inspection = await json('review/source-inspection.json');
const checks = [], failures = [];
const check = (name, ok, evidence) => { checks.push({ name, ok, evidence }); if (!ok) failures.push(name); };
check('Concept pack is complete', manifest.pending.length === 0, manifest.pending);
check('Ten newly generated character concepts', manifest.nativeCount === 10 && manifest.identities.length === 2 && manifest.options.length === 8, { identities: manifest.identities.length, options: manifest.options.length });
check('Eight static direction boards across four families', manifest.boards.length === 8 && manifest.families.length === 4, { families: manifest.families.length, boards: manifest.boards.length });
check('No old identity patch policy or runtime approval', manifest.policy.fullCharacterIsNew && !manifest.policy.oldFaceHairPatchAllowed && !manifest.artApproved && !manifest.ownerApproved && !manifest.runtimeReady, manifest.policy);

for (const request of generation.requests) {
  const raw = await readFile(resolve(root, request.raw));
  check(`${request.id}: generated source hash`, sha(raw) === request.sha256, { expected: request.sha256, actual: sha(raw) });
  const metadata = await sharp(raw).metadata();
  check(`${request.id}: source PNG decodes at recorded dimensions`, metadata.format === 'png' && metadata.width === request.actualDimensions[0] && metadata.height === request.actualDimensions[1], { actual: [metadata.width, metadata.height] });
  if (request.original && await exists(request.original)) {
    check(`${request.id}: workspace raw retains exact ImageGen bytes`, raw.equals(await readFile(request.original)), request.original);
  }
  if (request.prompt && request.promptSha256) {
    const bytes = await readFile(resolve(root, request.prompt));
    check(`${request.id}: prompt hash`, sha(bytes) === request.promptSha256, { file: request.prompt, actual: sha(bytes) });
  }
  for (const input of request.inputs || []) {
    const bytes = await readFile(resolve(root, input.file));
    check(`${request.id}: input ${input.file}`, sha(bytes) === input.sha256, { actual: sha(bytes) });
  }
}

for (const concept of [...manifest.identities, ...manifest.options]) {
  const bytes = await readFile(resolve(root, concept.nativeFile));
  const nativeMeta = await sharp(bytes).metadata();
  const native = await sharp(bytes).ensureAlpha().raw().toBuffer();
  const source = await sharp(resolve(root, concept.raw)).ensureAlpha().raw().toBuffer();
  const [sw, sh] = concept.sourceSize;
  const [nw, nh] = concept.canvas, [px, py] = concept.pivot;
  check(`${concept.id}: native PNG hash`, sha(bytes) === concept.nativeSha256, { file: concept.nativeFile, actual: sha(bytes) });
  check(`${concept.id}: padded native frame`, nativeMeta.width === nw && nativeMeta.height === nh && nw >= 160 && nh >= 144 && nativeMeta.hasAlpha, { size: [nativeMeta.width, nativeMeta.height], pivot: concept.pivot });
  const reg = concept.registration;
  check(`${concept.id}: human scale from anatomical crown/soles`, Math.abs((reg.groundY - reg.crownY) * reg.scale - 80) < 1e-8 && reg.nativeGroundY === py && reg.nativeCrownY === py - 80 && !reg.bodyMeasurementIncludesGear, reg);
  check(`${concept.id}: no copied old identity or palette modification`, !concept.identityRestoredFromLive && !concept.pixelsModified && concept.transparentSourceAlphaPreserved, { identityRestored: concept.identityRestoredFromLive, pixelsModified: concept.pixelsModified });
  const sourceInspection = inspection.sources.find(source => source.id === concept.requestId && source.role !== 'superseded-source-history');
  check(`${concept.id}: complete selected source core within raw frame`, sourceInspection?.sourceCoreEdges && Object.values(sourceInspection.sourceCoreEdges).every(count => count === 0), sourceInspection?.sourceCoreEdges || null);
  let differences = 0, edgePixels = 0, softAlpha = 0, opaque = 0;
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const sx = Math.floor((x + 0.5 - px) / reg.scale + reg.rootX);
    const sy = Math.floor((y + 0.5 - py) / reg.scale + reg.groundY);
    const di = (y * nw + x) * 4;
    for (let c = 0; c < 4; c++) {
      const wanted = sx >= 0 && sy >= 0 && sx < sw && sy < sh ? source[(sy * sw + sx) * 4 + c] : 0;
      if (native[di + c] !== wanted) differences++;
    }
    const alpha = native[di + 3];
    if (alpha > 0 && (x === 0 || y === 0 || x === nw - 1 || y === nh - 1)) edgePixels++;
    if (alpha > 0 && alpha < 255) softAlpha++; else if (alpha === 255) opaque++;
  }
  check(`${concept.id}: whole registered concept is source RGBA only`, differences === 0, { differingChannels: differences, softAlpha, opaque });
  check(`${concept.id}: no canvas-edge clipping`, edgePixels === 0 && concept.bounds.left >= 1 && concept.bounds.top >= 1 && concept.bounds.right < nw - 1 && concept.bounds.bottom < nh - 1, { edgePixels, bounds: concept.bounds });
  const record = registration.records.find(record => record.id === concept.id);
  check(`${concept.id}: registration lineage`, record?.nativeSha256 === concept.nativeSha256 && record?.sourceSha256 === concept.sourceSha256, record ? { source: record.sourceSha256, native: record.nativeSha256 } : null);
}

for (const board of manifest.boards) {
  const bytes = await readFile(resolve(root, board.file));
  check(`${board.id}: board original bytes`, sha(bytes) === board.sha256 && board.animationClips === 0 && !board.runtimeReady, { file: board.file, sha256: sha(bytes) });
}

// Root creates an immutable baseline list for all previous packages. Support
// either files[] or pins[] without mutating those packages.
if (await exists(resolve(root, 'basis.json'))) {
  const basis = await json('basis.json');
  for (const pin of basis.files || basis.pins || []) {
    const bytes = await readFile(resolve(root, pin.file || pin.path));
    check(`Baseline unchanged: ${pin.file || pin.path}`, sha(bytes) === pin.sha256, { actual: sha(bytes) });
  }
}

const report = { schema: 'wang-lin-concept-asset-verification-5', passed: failures.length === 0, sourceCount: generation.requests.length, nativeCount: manifest.nativeCount, optionCount: manifest.optionCount, boardCount: manifest.boardCount, checks, failures, limitations: ['Height registration is a technical measurement, not proof of anatomy/style or owner ART approval.', 'All boards and character concepts are static. Animation, eight views, separated production layers and runtime are future work.'] };
await mkdir(resolve(root, 'review'), { recursive: true });
await writeFile(resolve(root, 'review/asset-verification.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ passed: report.passed, checks: checks.length, failures, sources: report.sourceCount, native: report.nativeCount, boards: report.boardCount }));
if (failures.length) process.exitCode = 1;
