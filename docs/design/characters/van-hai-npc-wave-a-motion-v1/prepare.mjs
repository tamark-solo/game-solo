import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sharp } from '../../../../scripts/actor-sprite-tools.mjs';

// Preparation only: never POST, rewrite an approved identity pack, or import runtime.
const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../../../..');
const neutralRoot = path.resolve(root, '../van-hai-npc-wave-a-concepts-v1');
const standard = path.resolve(root, '../van-hai-npc-visual-standard-v1');
const relative = file => path.relative(workspace, file).replaceAll('\\', '/');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = async file => sha(await readFile(file));
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const save = async (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
if (existsSync(path.join(root, 'production-plan.json'))) throw new Error('Motion pack already prepared; preserve provenance and use a new version.');
if (existsSync(path.join(root, 'raw')) && (await readdir(path.join(root, 'raw'))).length) throw new Error('Generated sources already exist; preparation cannot overwrite them.');
for (const folder of ['inputs', 'prompts', 'specs', 'plans', 'raw', 'review']) await mkdir(path.join(root, folder), { recursive: true });

const approvalFile = path.join(neutralRoot, 'approval.json');
const approval = await json(approvalFile);
if (!approval.ownerApproved || !approval.artApproved || approval.motionApproved !== false || approval.runtimeApproved !== false) throw new Error('Expected scoped static neutral approval only.');
if (approval.pinnedFiles.length !== 45) throw new Error('Unexpected approved neutral pin count.');
for (const pin of approval.pinnedFiles) if (await hash(path.join(neutralRoot, pin.file)) !== pin.sha256) throw new Error('Approved neutral pin changed: ' + pin.file);
const neutralCatalog = await json(path.join(neutralRoot, 'catalog.json'));
const neutralPlan = await json(path.join(neutralRoot, 'production-plan.json'));
const futureMotion = await json(path.join(neutralRoot, 'motion-plan.json'));
const gddFile = path.join(workspace, approval.basis.sourcePlan);
const gdd = await json(gddFile);
if (await hash(gddFile) !== approval.basis.sourcePlanSha256) throw new Error('GDD has changed from approved neutral basis.');
const basisFile = path.join(standard, 'basis.json');
const directionsFile = path.join(standard, 'directions.json');
const basis = await json(basisFile);
const directionalBasis = await json(directionsFile);
const se = directionalBasis.directions.find(item => item.direction === 'southeast');
if (!se) throw new Error('Missing real live Wang southeast.');
if (await hash(path.join(workspace, basis.sourceCatalog)) !== basis.sourceCatalogSha256) throw new Error('Current live Wang catalog changed.');
if (await hash(path.join(workspace, se.atlas)) !== se.atlasSha256) throw new Error('Current live Wang southeast atlas changed.');
for (const [file, expected] of [[se.native, se.nativeSha256], [se.nearest8x, se.nearest8xSha256]]) {
  if (await hash(path.join(standard, file)) !== expected) throw new Error('Live Wang input changed: ' + file);
  const destination = path.join(root, 'inputs', path.basename(file));
  if (existsSync(destination)) throw new Error('Input already exists: ' + destination);
  await copyFile(path.join(standard, file), destination);
}

const gestures = {
  'bach-chi': {
    origin: 'Editorial restrained sequence derived from authored herb basket, jade pestle and careful leaf-observation story',
    sequence: ['Exact own approved standing neutral, basket and pestle in the same hands', 'Incline head slightly to inspect the existing leaves in the held basket', 'Tilt the SAME small basket only a few degrees while retaining its original size and contents', 'Inspect the SAME jade pestle and tilt it only slightly with its original holding wrist just above the basket edge; no third leaf or hand', 'Settle basket and pestle towards their original angles', 'Exact frame1 standing neutral, same face and prop positions'],
    continuity: 'Basket remains on its original screen side and in its original hand throughout all18poses. Pestle remains in the other original hand, never becomes a staff or wand. No new leaf, bowl, counter or tool appears.'
  },
  'tong-thiet': {
    origin: 'Editorial restrained sequence derived from authored tongs, unfinished WOODEN sword blank and practical repair personality',
    sequence: ['Exact own approved standing neutral, tongs and wooden blank low', 'Glance down at the SAME compact wooden-sword blank', 'Rotate the SAME held blank slightly in its original hand below chest', 'Bring the SAME tongs tips close to the blank while keeping the tools visible below chest', 'Close the tongs once slightly, then begin restoring the original tool angles', 'Exact frame1 standing neutral, tools in their original hands and places'],
    continuity: 'Never exchange tongs and wooden blank between hands or screen sides. The blank remains WOODEN, small and unfinished. No metal sword substitution, hammer, anvil, flame, sparks or newly invented tool.'
  },
  'hua-hanh': {
    origin: 'Editorial compact seal-check adaptation from authored map tube, route paper, old sealing cord and seal side story; simplified from future map-unroll draft for this pilot',
    sequence: ['Exact own approved standing neutral, existing compact map/cord retained', 'Glance down towards the old seal of the SAME map tube or folded route paper', 'Open the SAME compact route paper just a little from its existing tube or fold at waist height, retained in the original hands; no detached sheet or duplicate tube', 'Touch or check the SAME old sealing cord once with the free hand, keeping prop holding hand fixed', 'Lower the free hand and restore the original map angle', 'Exact frame1 standing neutral with identical map, cord, patch and boots'],
    continuity: 'No new full map sheet, tube duplicate, added gear or large weapon. The existing map/cord keeps its attachment and original holding hand. Patch remains on the same cloak side and mud marks remain on the boots.'
  },
  'dinh-soc': {
    origin: 'Editorial restrained sequence derived from authored low diagonal spear, hip route tag and gate duty',
    sequence: ['Exact own approved standing guard neutral, SAME spear low in its original holding hand', 'Glance down at the existing hip route tag', 'Raise only the FREE hand a small amount towards that same route tag', 'Briefly check the existing hip tag with free fingers while the spear hand remains down and fixed', 'Lower the free hand and make only a tiny holding-wrist spear angle correction on the original screen side, then return head towards the original angle', 'Exact frame1 standing guard neutral, SAME spear and tag positions'],
    continuity: 'Spear stays in the SAME original holding hand and on its SAME original screen side for all18poses, low diagonal tip DOWN. No hand switching or spear disappearing. Preserve the already accepted short shaft, low tip and shoulder mark. Never raise spear above the crown or move it across the face. Root is the boot soles, not spear tip.'
  },
  'ky-an': {
    origin: 'Standing pilot adaptation from the authored loop đọc giản/đặt bầu nước/vận khí; gourd placement and seated variation deferred to avoid prop spawning and scale changes',
    sequence: ['Exact own approved standing neutral, short tied hair, existing gourd and bamboo slips retained', 'Lift the SAME compact bamboo slips only slightly towards low chest height', 'Glance down and read the SAME slips briefly', 'Correct standing shoulders and breathing posture subtly while the slips and gourd stay retained', 'Lower the SAME slips to their original resting position and settle shoulders', 'Exact frame1 standing neutral with identical short tied hair, gourd and slips'],
    continuity: 'Standing only, no seated pose or body-scale change. Gourd remains attached or in its original place throughout all18poses; it is never placed on ground, duplicated or spawned. Bamboo slips retain the same hand(s), shape and small size. Short tied hair never becomes a high bun or long ponytail. No qi glow or FX.'
  },
  'phung-da': {
    origin: 'Restrained in-place adaptation of the authored loop chỉnh thế/nhìn mũi kiếm/nghỉ tay',
    sequence: ['Exact own approved standing rest neutral, SAME wooden sword lowered', 'Adjust the existing sword grip subtly without changing its holding hand', 'Make a small outward wrist-angle correction at the visible flank, sword remains low and readable', 'Glance towards the SAME wooden sword tip without rotating the body or camera', 'Relax the wrist and begin returning the sword to its original angle', 'Exact frame1 standing rest neutral, sword in original hand and screen side'],
    continuity: 'Wooden sword never switches hand/side, vanishes or becomes steel. No waist-crossing sweep, attack, lunge, slash, damage, target or trail. Compact upright hair and red-brown wrist cloth remain identical.'
  }
};

const actors = [];
const requests = [];
const inputs = [];
for (const approvedActor of approval.scope.actors) {
  const neutral = neutralCatalog.actors.find(item => item.id === approvedActor.id);
  const description = neutralPlan.actors.find(item => item.id === approvedActor.id).description;
  const authored = gdd.npcs.find(item => item.id === approvedActor.id);
  const motionBrief = futureMotion.actors.find(item => item.id === approvedActor.id);
  const gesture = gestures[approvedActor.slug];
  if (!neutral || !authored || !gesture || !motionBrief) throw new Error('Missing six-NPC basis record.');
  const nativeReference = 'inputs/' + approvedActor.slug + '-approved-neutral-native.png';
  const enlargedReference = 'inputs/' + approvedActor.slug + '-approved-neutral-nearest8x.png';
  const rawReference = 'inputs/' + approvedActor.slug + '-approved-neutral-raw.png';
  const originalNative = path.join(neutralRoot, neutral.sprite);
  const originalRaw = path.join(neutralRoot, neutral.raw);
  if (await hash(originalNative) !== neutral.spriteSha256 || await hash(originalRaw) !== neutral.sourceSha256) throw new Error('Neutral identity changed for ' + approvedActor.slug);
  const nativeBytes = await readFile(originalNative);
  const nativeMeta = await sharp(nativeBytes).metadata();
  if (nativeMeta.width !== 64 || nativeMeta.height !== 96) throw new Error('Unexpected neutral canvas.');
  await copyFile(originalNative, path.join(root, nativeReference));
  await sharp(nativeBytes).resize(512, 768, { kernel: 'nearest' }).png().toFile(path.join(root, enlargedReference));
  await copyFile(originalRaw, path.join(root, rawReference));
  const imageFiles = ['inputs/' + path.basename(se.nearest8x), enlargedReference, rawReference];
  const inputHashes = await Promise.all(imageFiles.map(async file => ({ file, sha256: await hash(path.join(root, file)) })));
  const prompt = [
    'Use case: real sprite animation production. Produce one transparent RGBA source sheet for ' + approvedActor.name + ' in Van Hai Dao Do, EXACTLY6columns x3rows =18separated full-body poses. Output1536x1536 square. No labels, grid, text, scene, background, floor, shadow, FX, aura or particles.',
    'IMAGE1 is the actual live Wang Lin Pixel02 SOUTHEAST neutral frame, enlarged exactly8x with nearest sampling. It is the PRIMARY human anatomy, pixel-cluster, camera, material shading and game-scale standard. IMAGE2 is this SAME NPC\'s OWNER-APPROVED native neutral enlarged exactly8x; lock its OWN skull/face/hair/body identity, wardrobe and compact props. IMAGE3 is the SAME approved NPC raw source, supporting identity/costume/prop reading ONLY; never derive a new anatomy or scale from its source dimensions. Never use another NPC as a style basis. Do not copy Wang\'s face, hair or wardrobe.',
    'NPC identity: ' + description,
    'Authored look: ' + authored.look + ' Authored art brief: ' + authored.brief,
    'Every pose is the same human actor, same skull width/height, facial layout, hair, shoulders/torso/legs, costume, belt attachments, palette and props. Keep the owner-approved neutral identity from IMAGE2 recognizably identical across all3rows, with Wang\'s broad pixel treatment. No different body scale between rows; no taller torso, smaller head, wide gesture head, or costume substitution.',
    'All18poses stay in real SOUTHEAST front-right three-quarter facing screen down-right, exactly matching the approved neutral camera. No rotating, new view, mirror or profile. Six column centers and each row ground line are consistent, but generous clear transparent gutters separate full bodies and all prop pixels. Each cell has its entire head, hands, boots and props; no touching or clipped neighbors. Use broad crisp low-resolution pixel clusters and simple few-tone materials, no painterly smoothing or fine embroidery.',
    'Row1 IDLE6: frame1 EXACT own approved standing neutral calibration; frame2 small inhalation in shoulders/cloth only; frame3 small sleeve/shoulder breathing change; frame4 gentle exhalation; frame5 subtle blink or settled shoulder; frame6 EXACT frame1neutral. Keep both boot contact points and body physical scale fixed. Do not create breathing by translating/scaling the whole actor or recycling one static image six times.',
    'Row2 TALK6: frame1 EXACT own approved standing neutral; frame2 a small mouth-open speaking shape; frame3 a restrained head inclination/nod with small shoulder movement; frame4 another small mouth shape and the nod begins to settle; frame5 returns head/shoulders; frame6 EXACT frame1neutral. Keep both hands in their original low rest/prop positions throughout the dialogue; no open-palm both-hand gesture, no arm lift that hides props. A head nod changes angle gently without changing skull dimensions. Show genuine distinct speaking poses, not a static row.',
    'Row3 PROFESSION6: ' + gesture.sequence.map((item, index) => 'frame' + (index + 1) + ': ' + item).join('; ') + '.',
    'Prop continuity for ALL18poses: ' + gesture.continuity + ' Keep occlusion anatomically correct; props do not appear through the torso, hands do not grow extra fingers/limbs, and no prop size jump occurs. Held props retain identity even when naturally partly occluded by sleeve.',
    'Native human contract is base64x96, foot(32,88), nominal80px standing body. Motion canvas96x96, foot(48,88), is horizontal transparent PADDING ONLY, not a larger human. Keep head/main hair around half standing height with short compact torso/legs, matching own approved neutral and live Wang. Use one stable source-wide scale measured from row1frame1 calibration later; never fit individual poses. A natural head tilt or wrist motion cannot justify a different anatomy.',
    'Separate body from qi, forge flame, sword trail and cast shadow; this sheet contains no FX/shadow. This motion source is a candidate for owner review, not inherited motion/runtime approval from the static neutral approval.'
  ].join('\n\n') + '\n';
  const id = approvedActor.slug + '-southeast';
  const promptFile = 'prompts/' + id + '.txt';
  const specFile = 'specs/' + id + '.json';
  const assetPlan = 'plans/' + id + '.json';
  const source = 'raw/' + id + '.png';
  const spec = { assetType: 'character-concept', name: 'vn-npc-wave-a-motion-' + approvedActor.slug + '-se-v1', prompt, size: '1536x1536', quality: 'high', n: 1 };
  await writeFile(path.join(root, promptFile), prompt, { encoding: 'utf8', flag: 'wx' });
  await save(path.join(root, specFile), spec);
  const identityReference = { file: nativeReference, sha256: neutral.spriteSha256, canvas: [64, 96], pivot: [32, 88] };
  actors.push({
    ...approvedActor, role: authored.role, zone: authored.zone, identity: 'van-hai-npc-wave-a-concepts-v1', description,
    direction: 'southeast', source, prompt: promptFile, spec: specFile, assetPlan,
    images: imageFiles, inputHashes, identityReference,
    approvedNeutralSource: { file: '../van-hai-npc-wave-a-concepts-v1/' + neutral.raw, sha256: neutral.sourceSha256 },
    approvedNeutralVisualLimits: neutral.visualLimitations,
    authoredBrief: authored, authoredMotionBrief: motionBrief,
    gesture: gesture.sequence.join('; '), gestureOrigin: gesture.origin, gestureSequence: gesture.sequence,
    propContinuity: gesture.continuity,
    artApproved: false, ownerApproved: false, motionApproved: false, runtimeImported: false
  });
  requests.push({
    id, slug: approvedActor.slug, actorId: approvedActor.id, direction: 'southeast', source,
    prompt: promptFile, promptSha256: sha(Buffer.from(prompt)), spec: specFile, assetPlan,
    images: imageFiles, inputHashes, identityReference,
    referencePolicy: { stage: 'new-motion-sheet-with-neutral-calibration', editTargetFirst: false, primaryStyleImageIndex: 1, ownApprovedIdentityLocked: true },
    status: 'planned-awaiting-pure-asset-plan', artApproved: false, ownerApproved: false, motionApproved: false, runtimeImported: false
  });
  inputs.push({ actorId: approvedActor.id, slug: approvedActor.slug, identityReference,
    nearest8x: { file: enlargedReference, sha256: inputHashes[1].sha256, sourcePixelsUnchanged: true },
    rawSupport: { file: rawReference, sha256: neutral.sourceSha256, source: '../van-hai-npc-wave-a-concepts-v1/' + neutral.raw, role: 'Same NPC costume/props only' }
  });
}

const neutralApproval = { file: '../van-hai-npc-wave-a-concepts-v1/approval.json', sha256: await hash(approvalFile), pinnedCount: 45 };
await save(path.join(root, 'inputs/references.json'), {
  schema: 'npc-wave-a-motion-input-provenance-1', date: '2026-10-13', neutralApproval,
  primaryReference: { file: 'inputs/' + path.basename(se.native), sha256: se.nativeSha256, nearest8x: 'inputs/' + path.basename(se.nearest8x), nearest8xSha256: se.nearest8xSha256 },
  inputOrder: ['Image1 live same-direction Wang PRIMARY anatomy/style/camera', 'Image2 SAME NPC approved neutral nearest8x identity lock', 'Image3 SAME NPC approved raw costume/props support only'],
  noNpcToNpcStyleChain: true, actors: inputs
});
await save(path.join(root, 'production-plan.json'), {
  schema: 'van-hai-npc-wave-a-motion-pilot-plan-1', id: 'VH-NPC-WAVE-A-MOTION-01', date: '2026-10-13',
  ownerContinuation: approval.ownerFeedback,
  neutralApproval, basis: neutralApproval.file, basisSha256: neutralApproval.sha256,
  approvedNeutralPins: approval.pinnedFiles,
  sourcePlan: relative(gddFile), sourcePlanSha256: await hash(gddFile),
  primaryStandard: relative(basisFile), primaryStandardSha256: await hash(basisFile),
  directionalStandard: relative(directionsFile), directionalStandardSha256: await hash(directionsFile),
  generator: 'project-router-gpt-image-2-edit', skill: 'docs/skills/game-actor-animation-production/SKILL.md',
  status: 'southeast-motion-pilot-planned', scope: 'Six approved Wave A identities; first real Southeast idle/talk/profession pilot only',
  requestedSize: '1536x1536', quality: 'high', actions: ['idle', 'talk', 'profession'], framesPerClip: 6,
  authoredMinimum: ['idle', 'talk'], authoredDirections: 8,
  plannedDirections: ['southeast'], producedDirections: [], pendingDirections: ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east'],
  requiredSources: 6, requiredClips: 18, requiredPoses: 108,
  sheetLayout: { columns: 6, rows: 3, rowOrder: ['idle', 'talk', 'profession'], neutralCalibration: 'row1frame1', endReturn: 'frame6 each row returns to own exact standing neutral' },
  timings: { idle: { durationMs: 1200, loop: true }, talk: { durationMs: 1200, loop: true }, profession: { durationMs: 1500, loop: false } },
  canvas: [96, 96], pivot: [48, 88], neutralBodyHeightPx: 80, neutralHeight: 80,
  oneScalePerSourceFromNeutral: true, perPoseFitAllowed: false,
  actors, requests,
  artApproved: false, ownerApproved: false, motionApproved: false, runtimeImported: false, runtimeImplemented: false,
  retryPolicy: 'No automatic paid POST retry; previous V2 JSON retry authorization does not extend to this new pack.',
  sevenViewExpansion: 'Create a new version after review of this Southeast motion pilot; no eight-direction coverage claim yet'
});
console.log(JSON.stringify({ preparedSources: 6, plannedClips: 18, plannedPoses: 108, preservedNeutralPins: 45, paidRequests: 0 }));
