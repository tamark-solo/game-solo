import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This preparer writes only this new neutral-concept root and never calls ImageGen.
const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../../../..');
const standard = path.join(workspace, 'docs/design/characters/van-hai-npc-visual-standard-v1');
const relative = file => path.relative(workspace, file).replaceAll('\\', '/');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = async file => sha(await readFile(file));
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const save = async (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });

if (existsSync(path.join(root, 'production-plan.json'))) throw new Error('Prepared pack exists. Do not overwrite its provenance.');
if (existsSync(path.join(root, 'raw')) && (await readdir(path.join(root, 'raw'))).length) throw new Error('Generated sources exist. Do not overwrite this pack.');
for (const folder of ['inputs', 'prompts', 'specs', 'plans', 'raw', 'review']) await mkdir(path.join(root, folder), { recursive: true });

const planFile = path.join(workspace, 'docs/design/world/van-hai-living-world-v1/plan.json');
const plan = await json(planFile);
const basisFile = path.join(standard, 'basis.json');
const directionFile = path.join(standard, 'directions.json');
const basis = await json(basisFile);
const directions = await json(directionFile);
const southeast = directions.directions.find(item => item.direction === 'southeast');
if (!southeast) throw new Error('Missing actual live southeast reference.');
const liveCatalog = path.join(workspace, basis.sourceCatalog);
if (await hash(liveCatalog) !== basis.sourceCatalogSha256) throw new Error('Live Wang catalog has changed; inspect references before preparing.');
if (await hash(path.join(workspace, southeast.atlas)) !== southeast.atlasSha256) throw new Error('Live southeast atlas has changed.');
for (const [source, expected] of [[southeast.native, southeast.nativeSha256], [southeast.nearest8x, southeast.nearest8xSha256]]) {
  const sourceFile = path.join(standard, source);
  if (await hash(sourceFile) !== expected) throw new Error('Live reference hash mismatch: ' + source);
  const target = path.join(root, 'inputs', path.basename(source));
  if (existsSync(target)) throw new Error('Input already exists: ' + target);
  await copyFile(sourceFile, target);
}

const definitions = [
  {
    id: 'NPC-HN-HERBALIST', slug: 'bach-chi',
    description: 'An adult woman herbalist about thirty. Warm tea-leaf green and ivory clothes; practical sleeves tied snugly. A compact herb basket and a small jade pestle visibly identify her profession. Soft-spoken but observant and discerning expression. Adult face, no child face. Hair is simply bound for work with no added ornament; the authored brief does not specify a hair arrangement.',
    pose: 'Relaxed standing neutral, the small herb basket held beside the lower waist and the small jade pestle resting in the other hand below the chest. Both hands and profession props remain readable without obscuring the face or boots.',
    cautions: 'Use warmer tea-leaf cloth green, distinct from smoky jade teaching robes. No large foliage bouquet, pharmacy counter, potion glow or magic effect.'
  },
  {
    id: 'NPC-HN-FORGE', slug: 'tong-thiet',
    description: 'An elderly male artificer with short silver-white hair and a direct practical expression. Ash-brown work apron and copper-toned shoulder cloth. A compact pair of tongs and an unfinished wooden-sword blank. A sturdy worker body while preserving the large chibi head, short torso and legs of the live Wang human contract. No large muscles or tall realistic anatomy.',
    pose: 'Relaxed planted standing neutral, small tongs and unfinished wooden-sword blank held below the chest. The blank stays compact, close to the body and leg silhouette; neither tool crosses the face.',
    cautions: 'No metal sword, giant hammer, full armor, forge, fire, sparks, light bloom or added weapons. The forge fire belongs to a separate prop layer.'
  },
  {
    id: 'NPC-HN-ROUTE-KEEPER', slug: 'hua-hanh',
    description: 'An adult male route keeper, practical and quietly tired. Short dusty-grey cloak patched asymmetrically on one side. Compact map tube, old sealing cord and muddy boots, with a small route-paper detail. Plain compact hair with no added decorative gear; the authored brief does not specify hair. His silhouette reads as a weary field route keeper, not an armored guard.',
    pose: 'Relaxed planted standing neutral with the short cloak hanging clearly and map tube close to the hip. A compact folded route paper rests low near one hand, held below the chest, keeping face and boots clear.',
    cautions: 'No large weapon, armor, staff, backpack, extra hanging gear or invented badge. The asymmetrical patch and small mud marks carry the work history.'
  },
  {
    id: 'NPC-HN-GATE-WARDEN', slug: 'dinh-soc',
    description: 'A young adult male gate disciple. Dark blue-green robe, light copper shoulder armor that marks his duty, a small slim long spear and a route tag hanging at the hip. Firm disciplined but approachable expression. Plain compact hair without added decoration; the authored brief does not specify hair. Keep the young-adult identity distinct from an elderly instructor.',
    pose: 'Calm planted standing guard neutral. The slim small spear lies diagonally low beside the lower body with the tip pointing DOWN, held below the chest. Keep the entire compact shaft and tip between crown and boot height; no weapon pixel above the crown or below the soles. The standing world foot is measured from the boot soles, never from the spear tip. The copper shoulder duty mark and hip route tag remain readable.',
    cautions: 'No huge polearm, heavy breastplate, full armor or combat stance. Do not hide the body or face behind the spear. Do not add a shield or extra weapon.'
  },
  {
    id: 'NPC-HN-DISCIPLE-WATER', slug: 'ky-an',
    description: 'An adult female cultivation disciple. Light pale-blue robe, short tied hair, a compact water gourd and a partially studied bamboo slip booklet. Earnest diligent expression, attentive and inclined to correct herself before asking. Adult face, no child face; the same compact human anatomy and broad pixel treatment as live Wang.',
    pose: 'Relaxed standing neutral with a compact water gourd near the hip and a small half-studied bamboo slip booklet resting low in the hands. Both boots are planted and fully visible, the head and facial plane clear.',
    cautions: 'Standing only for this neutral master. No seated pose, floating palms, qi breath glow, aura, extra weapon or oversized scroll. Any palm qi is separate FX.'
  },
  {
    id: 'NPC-HN-DISCIPLE-SWORD', slug: 'phung-da',
    description: 'An adult male sword-practice disciple. Compact upright spiked hair, grey-green robe, a scratched small wooden training sword and earthy red-brown wrist cloth. Competitive alert expression with an honest willingness to learn. Preserve the live Wang large chibi head and compact short torso and legs, retaining an adult face.',
    pose: 'Relaxed standing rest neutral with the scratched compact wooden sword lowered beside the body, wrists and red-brown hand cloth visible. Feet stay planted, face clear, no swing or lunge.',
    cautions: 'No steel sword, large weapon, instructor scar, armor, attack stance, slash trail or FX. The source is a static identity master, not a repeating attack.'
  }
];

const primaryInput = 'inputs/' + path.basename(southeast.nearest8x);
const actors = [];
const requests = [];
for (const definition of definitions) {
  const authored = plan.npcs.find(item => item.id === definition.id);
  if (!authored || authored.wave !== 'A') throw new Error('Missing authored Wave A record: ' + definition.id);
  const prompt = [
    'Use case: style-transfer. Produce ONE static neutral southeast human NPC sprite for Van Hai Dao Do.',
    'IMAGE 1 is the actual live Wang Lin Pixel02 southeast idle frame enlarged exactly 8x with nearest sampling. It is the ONLY image reference and PRIMARY source for human anatomy, large chibi head proportions, camera, coarse pixel clusters, material shading and game scale. Create the distinct NPC below by changing identity, age, gender, hair, clothing and authored compact profession props. Do not copy Wang\'s clothes or hairstyle as NPC identity. Do not use any other NPC as a style basis.',
    'Authored actor: ' + authored.name + ' / ' + authored.role + '.',
    'Subject identity and costume: ' + definition.description,
    'Neutral pose: ' + definition.pose,
    'Authored look in Vietnamese: ' + authored.look,
    'Authored art brief in Vietnamese: ' + authored.brief,
    'Authored personality: ' + authored.personality,
    'Art contract: orthographic top-down game camera, real front-right three-quarter SOUTHEAST facing screen down-right, matching IMAGE 1 exactly. The entire head, body, all props and both boots are visible with generous transparent padding. Head and main hair occupy approximately half the full standing height, with short compact torso and legs. A standing height of80 alone does not prove anatomy: preserve IMAGE 1 skull, face-to-body, shoulders and torso proportions while retaining this NPC identity.',
    'Target logical human sprite canvas64x96, world foot(32,88), nominal standing body80 world pixels. Render a large integer enlargement of those broad readable low-resolution pixel shapes, NOT detailed illustration. Clothing and props use few broad three-tone material clusters, no fine painterly texture, no subpixel anti-aliased smoothing or intricate embroidery. This is one human static neutral master, not a sheet, portrait or multiple views.',
    'Transparent RGBA output. No floor, cast shadow, scene, ground plate, grid, text, logo, frame, halo, haze, glow, bloom, particles or FX. Keep body and hand props readable at native1x. ' + definition.cautions,
    'This source is a concept candidate awaiting owner visual review; it does not authorize animation, gameplay or runtime integration.'
  ].join('\n') + '\n';
  const name = 'vn-npc-' + definition.slug + '-wave-a-neutral-v1';
  const promptFile = 'prompts/' + definition.slug + '.txt';
  const specFile = 'specs/' + definition.slug + '.json';
  const assetPlan = 'plans/' + definition.slug + '.json';
  await writeFile(path.join(root, promptFile), prompt, { encoding: 'utf8', flag: 'wx' });
  const spec = { assetType: 'character-concept', name, size: '1024x1536', quality: 'high', n: 1, prompt };
  await save(path.join(root, specFile), spec);
  const actor = {
    id: definition.id, slug: definition.slug, name: authored.name, role: authored.role,
    description: definition.description, poseBrief: definition.pose, zone: authored.zone,
    source: 'raw/' + definition.slug + '.png', raw: 'raw/' + definition.slug + '.png',
    prompt: promptFile, spec: specFile, assetPlan, sprite: 'sprites/' + definition.slug + '.png',
    direction: 'southeast', pose: 'neutral', canvas: [64, 96], pivot: [32, 88], bodyHeightPx: 80,
    authoredBrief: authored,
    briefInterpretation: 'English costume/pose translation from authored GDD. Hair left plain where unspecified. No invented weapon or profession gear.',
    references: [primaryInput], status: 'neutral-planned-not-generated',
    artApproved: false, ownerApproved: false, motionApproved: false, runtimeImported: false
  };
  actors.push(actor);
  requests.push({
    id: definition.slug + '-southeast', slug: definition.slug, actorId: definition.id,
    direction: 'southeast', pose: 'neutral', name, source: actor.source, prompt: promptFile,
    promptSha256: sha(Buffer.from(prompt)), spec: specFile, assetPlan,
    images: [primaryInput], inputHashes: [{ file: primaryInput, sha256: southeast.nearest8xSha256 }],
    referencePolicy: { stage: 'new-neutral-or-view', editTargetFirst: false, primaryStyleImageIndex: 1, onlyImageReference: 'Wang Lin live southeast' },
    status: 'planned-awaiting-pure-asset-plan', artApproved: false, ownerApproved: false, runtimeImported: false
  });
}

await save(path.join(root, 'inputs/references.json'), {
  schema: 'npc-wave-a-live-wang-inputs-1', date: '2026-10-13',
  inputOrder: ['Image1 live Wang Lin southeast nearest8x PRIMARY anatomy/camera/pixel/style'],
  npcToNpcStyleChain: false,
  images: [
    { file: 'inputs/' + path.basename(southeast.native), sha256: southeast.nativeSha256, role: 'Direct native1x comparison, not a second input' },
    { file: primaryInput, sha256: southeast.nearest8xSha256, role: 'Only multipart input, nearest8x unchanged pixels' }
  ],
  liveCatalog: { file: relative(liveCatalog), sha256: basis.sourceCatalogSha256 },
  liveAtlas: { file: southeast.atlas, sha256: southeast.atlasSha256 },
  primaryStandard: { file: relative(basisFile), sha256: await hash(basisFile) },
  directionalStandard: { file: relative(directionFile), sha256: await hash(directionFile) }
});
await save(path.join(root, 'production-plan.json'), {
  schema: 'npc-wave-a-six-neutral-plan-1', id: 'VH-NPC-WAVE-A-CONCEPTS-01', date: '2026-10-13',
  ownerContinuation: 'tôi đồng ý làm tiếp nhóm tiếp theo',
  sourcePlan: relative(planFile), sourcePlanSha256: await hash(planFile),
  primaryStandard: relative(basisFile), primaryStandardSha256: await hash(basisFile),
  directionalStandard: relative(directionFile), directionalStandardSha256: await hash(directionFile),
  skill: 'docs/skills/game-actor-animation-production/SKILL.md',
  scope: 'Six remaining authored Wave A NPC identities, one neutral southeast each before any motion expansion',
  generator: 'project-router-gpt-image-2-edit', requestedSize: '1024x1536', quality: 'high',
  actors, requests, canvas: [64, 96], pivot: [32, 88], neutralHeight: 80,
  requiredNeutralSources: 6, directionsProduced: [], directionsPlanned: ['southeast'],
  directionsPending: ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east'],
  animationProduced: false, sourceStatus: 'planned-not-generated',
  retryPolicy: 'No automatic paid POST retry; V2 JSON retry authorization does not apply to this new pack.',
  artApproved: false, ownerApproved: false, motionApproved: false, runtimeImported: false, runtimeConsumable: false
});
console.log(JSON.stringify({ prepared: 6, scope: 'neutral southeast only', sourcePlanSha256: await hash(planFile), paidRequests: 0 }));
