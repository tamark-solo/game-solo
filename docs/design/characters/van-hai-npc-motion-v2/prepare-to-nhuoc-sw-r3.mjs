// One explicit camera revision, derived own-NPC reference, no paid generation.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root = dirname(fileURLToPath(import.meta.url));
assert.equal(root.split(/[\\/]/).at(-1), 'van-hai-npc-motion-v2');
assert.ok(process.argv.slice(2).every(arg => arg === '--apply'), 'Only --apply is supported');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function local(file) {
  const path = resolve(root, file), rel = relative(root, path);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Outside new motion pack');
  return path;
}
const json = async file => JSON.parse(await readFile(local(file), 'utf8'));
const id = 'to-nhuoc-southwest', source = 'raw/to-nhuoc-southwest-r3.png';
const promptFile = 'prompts/to-nhuoc-southwest-r3.txt', specFile = 'specs/to-nhuoc-southwest-r3.json', assetPlan = 'plans/to-nhuoc-southwest-r3.json';
const referenceFile = 'inputs/to-nhuoc-south-neutral-nearest8x.png', referenceProvenanceFile = 'inputs/to-nhuoc-south-neutral-nearest8x.json';
const nativeFile = 'calibration/to-nhuoc-south.png', nativeBytes = await readFile(local(nativeFile));
const nativeMetadata = await sharp(nativeBytes).metadata();
assert.equal(nativeMetadata.width, 96); assert.equal(nativeMetadata.height, 96); assert.ok(nativeMetadata.hasAlpha);
const catalog = await json('catalog.json'), actor = catalog.actors.find(a => a.slug === 'to-nhuoc');
assert.equal(actor.views.south.neutralSprite, nativeFile);
assert.equal(hash(nativeBytes), actor.views.south.neutralSha256, 'Own SOUTH neutral calibration changed');
const referenceBytes = await sharp(nativeBytes).resize(768, 768, {kernel: 'nearest'}).png().toBuffer();
await writeFile(local(referenceFile), referenceBytes);
const provenance = {schema: 'npc-own-neutral-support-reference-1', date: '2026-10-13', actorId: actor.id, slug: actor.slug,
  sourceDirection: 'south', source: nativeFile, sourceSha256: hash(nativeBytes), sourceCanvas: [96, 96], sourcePivot: [48, 88],
  file: referenceFile, sha256: hash(referenceBytes), canvas: [768, 768], pivot: [384, 704],
  derivation: 'One nearest-neighbour 8x enlargement only; no recolour, paint, mirror, pose fitting or new identity',
  role: 'Same-NPC neutral identity/costume support only; live Wang SOUTHWEST remains PRIMARY anatomy/style/camera',
  sourceArtApprovalClaimed: false, artApproved: false, ownerApproved: false, runtimeImported: false};
await writeFile(local(referenceProvenanceFile), JSON.stringify(provenance, null, 2) + '\n');
const prompt = [
  'Create a production pixel game sprite animation sheet: exactly 18 isolated FULL BODY poses, six columns by three rows, transparent RGBA background. Request 1536 x 1536, high quality. No text, labels, grid, floor, shadow, scene, aura, glow or particles.',
  'IMAGE 1 is live Wang Lin Pixel02 SOUTHWEST from the actual game. It is PRIMARY camera, human anatomy, pixel clusters, palette density and physical scale reference. IMAGE 2 is the SAME NPC Tô Nhược SOUTH neutral calibration, enlarged nearest 8x, and supplies ONLY adult female identity, bun, face, costume and small props. Do not copy its straight-front SOUTH camera. No WEST profile or southeast sheet is supplied. Draw a genuinely new front-left SOUTHWEST view; never flip/mirror an existing bitmap.',
  'NEVER copy Wang Lin identity, male face, long loose hair, charcoal robe or equipment. Tô Nhược is an adult female supplies clerk with a compact dark bun, muted jade robe, IVORY CLOTH APRON, earthy-red tied ledger, small sealed wooden case and small brush. Keep her adult face, bun/skull, robe/apron layers, ledger attachment and small rectangular case/seal. No beard or child face. Case and brush stay in the same anatomical hands in all actions.',
  'MANDATORY SOUTHWEST CAMERA FOR ALL 18 POSES: TRUE FRONT-LEFT THREE-QUARTER at approximately 45 degrees, matching IMAGE 1. Head and body face screen DOWN-LEFT, and the nose/chin point LEFT within a FRONT-LEFT face. BOTH EYES MUST BE VISIBLE when open: one full near eye and a SMALL but visible far eye on the far facial plane. The far eye is foreshortened, not hidden entirely. Blink closes these same eyes. Keep a broad visible FRONT FACE plane and broad visible FRONT CHEST/APRON plane. The ivory apron remains clearly readable across the front torso, not a narrow side strip. Both front shoulder planes are discernible in the three-quarter view.',
  'DO NOT produce a one-eye full WEST/LEFT PROFILE: that was the previous error. Do not turn the skull completely sideways, hide the entire far eye, reduce the apron to a thin edge or stack both legs like a strict side view. Also do not produce straight SOUTH/front, a RIGHT-pointing nose, southeast/front-right or a back view. Camera stays FRONT-LEFT/DOWN-LEFT during idle, talk and inspection; never swivel toward front-right to reveal props.',
  'Layout: six columns, three rows, generous transparent gutters. Complete hair, hands, boots, ledger, case and brush in each pose, with no neighbouring-pose contact. Every figure has ONE physical scale: large chibi skull about half standing height, compact torso, short legs, stable skull/face/torso/boots across rows. Neutral crown-to-boot height about 240 source pixels. Never resize a gesture row to fit. Feet planted, no stepping, root translation or whole-body bounce. Use crisp broad low-resolution pixel clusters, not a smooth illustration intended to shrink.',
  'ROW 1 IDLE SIX: neutral calibration; subtle inhale; gentle shoulder/sleeve breathing continuation; exhale; soft blink; exact neutral again. Props remain attached and consistent.',
  'ROW 2 TALK SIX: same neutral; small mouth change and forearm adjustment; small calm explanation toward DOWN-LEFT; hold with another small mouth shape; retract; exact neutral. BOTH eyes remain visible in the correct three-quarter face whenever open. Case/brush do not disappear to free a hand and never swap hands.',
  'ROW 3 PROFESSION SIX: neutral; bring same small sealed case to waist; tilt slightly to inspect its seal; trace or tap seal ONCE with the same small brush; lower case; exact neutral. First/last match row 1 calibration. Face keeps its 45-degree front-left angle, with a small visible far eye; only a restrained gaze toward the case is allowed. Keep the broad front apron plane and fixed planted boots. Case remains the same size, material, shape, seal and holding hand; ledger remains tied in place. No crafting FX.',
  'Nominal human standing height 80 world pixels; base64x96 foot(32,88). Clip96x96 foot(48,88) adds padding ONLY. These are real independently drawn pose changes with stable identity, not cloned static pictures. This new SOUTHWEST revision remains a review candidate; no ART/runtime approval is implied.'
].join('\n\n') + '\n';
const spec = {assetType: 'character-concept', name: 'vn-npc-motion-to-nhuoc-southwest-r3-v2', prompt, size: '1536x1536', quality: 'high', n: 1};
await writeFile(local(promptFile), prompt); await writeFile(local(specFile), JSON.stringify(spec, null, 2) + '\n');
const images = ['inputs/wang-lin-live-southwest-nearest8x.png', referenceFile], inputHashes = [];
for (const file of images) inputHashes.push({file, sha256: hash(await readFile(local(file)))});
if (process.argv.includes('--apply')) {
  await json(assetPlan); // Actual MCP plan must exist before selecting the new request.
  const latestBytes = await readFile(local('production-plan.json')), plan = JSON.parse(latestBytes);
  const request = plan.requests.find(q => q.id === id); assert.ok(request);
  const sourceRevisions = [...(request.sourceRevisions ?? [])];
  if (request.source !== source) {
    const oldHash = hash(await readFile(local(request.source)));
    if (!sourceRevisions.some(r => r.source === request.source && r.sha256 === oldHash)) sourceRevisions.push({
      source: request.source, sha256: oldHash, prompt: request.prompt, assetPlan: request.assetPlan ?? null,
      status: 'superseded-needs-source-correction', reason: 'R2 faces left but is a full one-eye WEST profile with narrow apron; regenerate true 45-degree FRONT-LEFT SOUTHWEST with both eyes and broad front apron plane.'
    });
  }
  Object.assign(request, {source, prompt: promptFile, spec: specFile, assetPlan, images, inputHashes, sourceRevisions, revision: 3,
    referencePolicy: {stage: 'new-neutral-or-view', editTargetFirst: false, primaryStyleImageIndex: 1},
    derivedIdentityReference: {...provenance, provenanceFile: referenceProvenanceFile, provenanceSha256: hash(await readFile(local(referenceProvenanceFile)))},
    status: 'front-left-camera-correction-planned'});
  assert.equal(hash(await readFile(local('production-plan.json'))), hash(latestBytes), 'Plan changed concurrently; rerun to merge safely');
  await writeFile(local('production-plan.json'), JSON.stringify(plan, null, 2) + '\n');
}
console.log(JSON.stringify({id, source, prompt: promptFile, spec: specFile, assetPlan, inputHashes, referenceProvenanceFile,
  appliedOnlyOneRequest: process.argv.includes('--apply'), paidApiCalled: false}));
