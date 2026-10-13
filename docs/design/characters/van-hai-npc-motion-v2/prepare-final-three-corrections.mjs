// Prepare three explicit source revisions only. No credentials or paid API calls.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
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
const plan = await json('production-plan.json');
const shared = [
  'Production pixel game animation sheet: 18 isolated complete FULL BODY poses in exactly six columns and three rows. Request 1536 x 1536 pixels, high quality, transparent RGBA. No text, labels, grid, floor, scene, shadow, glow, aura or particles.',
  'Match live Wang Lin Pixel02 human anatomy and pixel treatment: large chibi skull about half standing height, compact torso, short legs, crisp broad pixel clusters and game palette density. Wang remains PRIMARY style/anatomy reference, independent of edit-target order. NEVER copy Wang identity, long loose hair, male face, charcoal robe, costume or equipment. Keep this NPC identity.',
  'One physical scale across all 18 poses; the same skull, torso, leg length, boot spread and costume construction across rows. Neutral crown-to-boot height approximately 240 source pixels. Generous transparent gaps around complete figures; no clipped hands, boots or props and no neighbouring-pose contact. Do not fit or resize separate rows. Feet planted, no steps, root translation or whole-body bounce. Base human 64 x 96, foot (32,88), standing 80 world pixels. Animation 96 x 96, foot (48,88), is padding only. Draw real animation differences with stable anatomy; no repeated static neutral masquerading as motion.',
  'ROW 1 IDLE, six poses: exact neutral calibration; gentle inhalation; small breathing continuation; calm exhalation; restrained blink only if an eye is visible; return to exact neutral.',
  'ROW 2 TALK, six poses: same neutral; small explanatory forearm movement and mouth movement only if visible; small calm gesture in the requested facing direction; hold; retract; exact neutral. Never turn toward the viewer to reveal a face or a prop.'
].join('\n\n');
const targets = [
  {
    id: 'diep-tinh-northwest', revision: 3, source: 'raw/diep-tinh-northwest-r3.png',
    prompt: 'prompts/diep-tinh-northwest-r3.txt', spec: 'specs/diep-tinh-northwest-r3.json', assetPlan: 'plans/diep-tinh-northwest-r3.json',
    name: 'vn-npc-motion-diep-tinh-northwest-r3-v2',
    images: ['inputs/wang-lin-live-northwest-nearest8x.png', 'raw/diep-tinh-north-r2.png'],
    reason: 'Northwest revision still leaks front-facing eye/cheek; new true back-left camera from live Wang NW and correct own north identity.',
    policy: {stage: 'new-neutral-or-view', editTargetFirst: false, primaryStyleImageIndex: 1},
    detail: [
      'IMAGE 1 is live Wang Lin facing NORTHWEST, PRIMARY camera/anatomy/style. IMAGE 2 is Diệp Tĩnh own correct NORTH/back sheet and supplies only her identity, grey bun, ivory/smoky jade robe, jade beads, bamboo scroll and breathing gestures. Rotate this same NPC into a newly drawn NORTHWEST view. No wrong northwest source is supplied; do not invent a front face.',
      'Diệp Tĩnh is an elderly woman cultivation teacher, not a young heroine or a male Wang copy. Preserve her compact grey-salt bun, ivory/smoky jade robe, jade string and closed bamboo scroll.',
      'ALL 18 POSES face screen UP-LEFT in TRUE THREE-QUARTER BACK-LEFT. Show the BACK of skull/bun and BACK of robe. The face is turned away beyond the cheek plane. NO visible eyes, eyebrows, nose, mouth or front facial mask in ANY frame. At most the ear and a very narrow non-facial side-head contour can be visible. Do not draw a one-eye left FRONT profile, a front-left face, or a southeast face. Use IMAGE 1 exact back-left orientation for head, shoulders, torso and boots throughout all actions. A gesture must never swivel the head to expose an eye.',
      'ROW 3 PROFESSION, six poses: neutral; draw palms near abdomen; gently separate palms; hold inward palms; close hands; exact neutral. This gesture is seen from BEHIND-LEFT. Hands in front of abdomen are naturally occluded by the torso; only anatomically visible sleeve/elbow/hand edges may show. Do not paint palms, jade beads or scroll through the back of the robe. Jade string stays attached and props keep the same anatomical hand/waist placement. No qi or FX. First and last poses match row 1 neutral.',
      'This is a new true generated NORTHWEST view, not a mirrored bitmap. Earlier southeast approval does not approve this source.'
    ]
  },
  {
    id: 'to-nhuoc-north', revision: 2, source: 'raw/to-nhuoc-north-r2.png',
    prompt: 'prompts/to-nhuoc-north-r2.txt', spec: 'specs/to-nhuoc-north-r2.json', assetPlan: 'plans/to-nhuoc-north-r2.json',
    name: 'vn-npc-motion-to-nhuoc-north-r2-v2',
    images: ['raw/to-nhuoc-north.png', 'inputs/wang-lin-live-north-nearest8x.png'],
    reason: 'Back-view profession poses 2–5 show case/hands/brush painted through the robe; preserve valid back neutral intent and correct anatomical front-prop occlusion.',
    policy: {stage: 'action-correction', editTargetFirst: true, primaryStyleImageIndex: 2, editTargetFile: 'raw/to-nhuoc-north.png', neutralIntentPreserved: true},
    detail: [
      'ACTION-ONLY CORRECTION OF THE EXISTING SAME NPC AND SAME NORTH CAMERA. IMAGE 1 is Tô Nhược own NORTH sheet, the edit target, originally produced with live Wang NORTH as primary reference. Its back neutral identity/camera and physical anatomy are the desired intent. Preserve that identity and camera, including idle and talk sequences. IMAGE 2 is live Wang NORTH and remains PRIMARY human anatomy/pixel style/camera reference. Do not turn this woman into Wang Lin, copy his long hair/charcoal robe or redesign the neutral.',
      'Tô Nhược is an adult female supplies clerk: compact dark bun, muted jade robe, ivory apron, earthy-red tied ledger, small sealed wooden case and small brush. Preserve identity, robe layers, bun, belt and prop ownership. Keep case and brush in their same anatomical hands.',
      'ALL 18 POSES are STRAIGHT BACK, facing screen UP. Back of skull/bun and robe only. No eyes, eyebrows, nose, mouth or frontal face. Keep this fixed camera during inspection.',
      'REPAIR ROW 3 PROFESSION POSES 2–5: the existing case, hands and brush are incorrectly painted like transparent x-ray shapes on the middle of her back. The case is held IN FRONT OF HER ABDOMEN; palms and brush work IN FRONT OF HER BODY. The opaque torso/back robe must properly OCCLUDE them. Never paint the box, fingers, palm or brush across the central back or through the robe. The case can be fully hidden behind the torso in a strict back view. A genuinely exposed small side edge, sleeve, elbow or wrist may appear only outside the torso silhouette when anatomically justified. Hidden props remain owned by the same hands; they do not teleport or change shape.',
      'ROW 3 six poses: neutral; bring the small case to front waist level; tilt it slightly IN FRONT to inspect seal; trace/tap seal ONCE with same brush; lower case IN FRONT; exact neutral. Show action through restrained sleeve/elbow movement and valid occlusion from behind. Do not rotate to reveal the hidden task. First/last poses match existing neutral intent. Do not move arms behind the back just to display props.',
      'This preserves neutral identity/camera intent without a claim that generated neutral pixels are immutable. Corrected pixels remain review candidates; no ART/runtime approval is implied.'
    ]
  },
  {
    id: 'to-nhuoc-southwest', revision: 2, source: 'raw/to-nhuoc-southwest-r2.png',
    prompt: 'prompts/to-nhuoc-southwest-r2.txt', spec: 'specs/to-nhuoc-southwest-r2.json', assetPlan: 'plans/to-nhuoc-southwest-r2.json',
    name: 'vn-npc-motion-to-nhuoc-southwest-r2-v2',
    images: ['inputs/wang-lin-live-southwest-nearest8x.png', 'raw/to-nhuoc-west.png', 'raw/to-nhuoc-south.png'],
    reason: 'Southwest source reads southeast/right-facing; regenerate all 18 poses in true front-left/down-left orientation.',
    policy: {stage: 'new-neutral-or-view', editTargetFirst: false, primaryStyleImageIndex: 1},
    detail: [
      'IMAGE 1 is live Wang Lin SOUTHWEST, PRIMARY camera/anatomy/style. IMAGE 2 is Tô Nhược own correct WEST profile, identity/costume only. IMAGE 3 is her own SOUTH front sheet, identity/action continuity only. Supporting cameras NEVER override IMAGE 1. No southeast sheet is supplied. Draw a new genuine SOUTHWEST view; do not flip/mirror a bitmap.',
      'Tô Nhược is an adult female supplies clerk: compact dark bun, muted jade robe, ivory cloth apron, earthy-red tied ledger, small sealed wooden case and small brush. Preserve this woman, adult face, bun/skull, costume layers, small case shape/seal and prop ownership. No beard or Wang identity. Case/brush stay in SAME ANATOMICAL HANDS and the tied red ledger stays attached.',
      'ALL 18 POSES face screen DOWN-LEFT in TRUE FRONT-LEFT THREE-QUARTER SOUTHWEST. Nose points visibly LEFT; near-left facial plane leads and far eye is foreshortened according to live Wang SW. Chest, apron, shoulders, boots and gesture turn consistently DOWN-LEFT. Do not draw a RIGHT-pointing nose, southeast/front-right face, straight SOUTH frontal face or straight WEST profile. Never switch to southeast during talk or inspection. Head angle remains down-left even while looking at the case.',
      'ROW 3 PROFESSION, six poses: neutral; bring same small sealed case to waist; tilt slightly to inspect seal; trace/tap seal ONCE with same small brush; lower it; exact neutral. First/last match row 1 neutral. Case retains small rectangular shape/material and original holding hand. Brush/ledger never disappear, swap hands, enlarge or become weapons. Feet planted, no stepping or crafting effects.',
      'This is a new true generated SOUTHWEST view. Southeast pilot approval does not approve this new direction.'
    ]
  }
];
const summaries = [];
for (const target of targets) {
  const request = plan.requests.find(q => q.id === target.id);
  assert.ok(request, 'Missing explicit request: ' + target.id);
  const prompt = shared + '\n\n' + target.detail.join('\n\n') + '\n';
  const spec = {assetType: 'character-concept', name: target.name, prompt, size: '1536x1536', quality: 'high', n: 1};
  for (const dir of ['prompts', 'specs', 'plans']) await mkdir(local(dir), {recursive: true});
  await writeFile(local(target.prompt), prompt);
  await writeFile(local(target.spec), JSON.stringify(spec, null, 2) + '\n');
  const inputHashes = [];
  for (const file of target.images) inputHashes.push({file, sha256: hash(await readFile(local(file)))});
  if (!process.argv.includes('--apply')) {
    summaries.push({id: target.id, prompt: target.prompt, spec: target.spec, source: target.source, images: target.images, inputHashes, paidApiCalled: false});
    continue;
  }
  await json(target.assetPlan); // Actual MCP plan must have been saved first.
  // Re-read before each mutation to preserve other actors/requests.
  const latestBytes = await readFile(local('production-plan.json')), latest = JSON.parse(latestBytes);
  const current = latest.requests.find(q => q.id === target.id);
  assert.ok(current);
  const sourceRevisions = [...(current.sourceRevisions ?? [])];
  if (current.source !== target.source) {
    const oldSha256 = hash(await readFile(local(current.source)));
    if (!sourceRevisions.some(r => r.source === current.source && r.sha256 === oldSha256)) sourceRevisions.push({
      source: current.source, sha256: oldSha256, prompt: current.prompt, assetPlan: current.assetPlan ?? null,
      status: 'superseded-needs-source-correction', reason: target.reason
    });
  }
  const policy = {...target.policy};
  if (policy.stage === 'action-correction') {
    policy.editTargetSha256 = inputHashes[0].sha256;
    assert.ok(sourceRevisions.some(r => r.source === policy.editTargetFile && r.sha256 === policy.editTargetSha256),
      'Action edit target must be retained in source revisions');
    const originalMetadata = await json(policy.editTargetFile.replace(/\.png$/i, '.json'));
    assert.equal(originalMetadata.inputImages?.[0]?.sha256, inputHashes[1].sha256, 'Action target must originally be same-direction Wang-first');
  }
  Object.assign(current, {source: target.source, prompt: target.prompt, spec: target.spec, assetPlan: target.assetPlan,
    images: target.images, inputHashes, sourceRevisions, revision: target.revision,
    referencePolicy: policy, status: policy.stage === 'action-correction' ? 'action-correction-planned' : 'targeted-view-correction-planned'});
  assert.equal(hash(await readFile(local('production-plan.json'))), hash(latestBytes), 'Plan changed concurrently; rerun to merge safely');
  await writeFile(local('production-plan.json'), JSON.stringify(latest, null, 2) + '\n');
  summaries.push({id: target.id, source: target.source, planned: true, primaryStyleImageIndex: policy.primaryStyleImageIndex, paidApiCalled: false});
}
console.log(JSON.stringify({requests: summaries, appliedOnlyExplicitThree: process.argv.includes('--apply'), paidApiCalled: false}));
