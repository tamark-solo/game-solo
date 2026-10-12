#!/usr/bin/env node
/** Game ART source previews only; importing this module does not touch files or credentials. */
import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveConfig, runGenerate, sanitizeError } from './imagegen-router.mjs';

export const MODEL = 'gpt-image-2';
const MODULE_PATH = fileURLToPath(import.meta.url);
const DEFAULT_WORKSPACE_ROOT = path.resolve(path.dirname(MODULE_PATH), '..');
const MAX_SPEC_BYTES = 64 * 1024;
const MAX_PROMPT_BYTES = 32 * 1024;
const TIMEOUT_MS = 300_000;
const INPUT_FIELDS = new Set(['assetType', 'name', 'prompt', 'size', 'quality', 'n']);
const COMMON_GUIDANCE = [
  'Follow the user brief exactly. The brief defines the subject, palette, costume, materials, view, and composition. Do not invent additional characters, objects, palettes, or labels.',
  'Make the requested subject readable with a deliberate silhouette, coherent materials, and clean visual hierarchy. Avoid accidental fragments at image edges. Do not add watermarks, UI text, grids, measurement marks, or decorative frames unless explicitly requested in the brief.',
  'This image is a source concept for owner review. Do not describe it as an approved, measured, native, layered, seamless, or production ready game asset.',
];
const CHROMA_GUIDANCE = 'Isolate the requested subject on a perfectly flat solid magenta background (#FF00FF), with no gradient, backdrop texture, scenic surroundings, contact shadow on the background, or magenta lighting on the subject. Keep the actual natural outline of the subject and leave clear empty margin around it. This is a chroma key source: do not draw a checkerboard or claim transparent pixels. A separate alpha extraction and edge review will be required.';
const REVIEW_NOTES = [
  'Keep the generated source bitmap unchanged and record its actual dimensions and hash; requested dimensions are not proof of delivered dimensions.',
  'Review the image with the native character at camera 1x, measure the required pivot after export, and save the source and review evidence before any production conversion.',
  'Technical checks never imply owner or ART approval. Nothing is imported into runtime, the editor library, an authored map, a save database, or browser drafts automatically.',
];

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}

export const ASSET_PROFILES = freezeDeep({
  icon: {
    title: 'Icon source', defaultSize: '1024x1024', defaultQuality: 'high', needsAlphaExtraction: true,
    promptGuidance: [
      'Create one isolated game icon subject from the brief, with a simple recognizable silhouette and legible major forms at a small display size. Do not add a button frame, caption, or extra icon tiles unless the brief requests them.',
      CHROMA_GUIDANCE,
    ],
    workflowNotes: ['Extract the magenta background to alpha separately, inspect edges on light and dark backgrounds, then choose and review an explicit native icon size. No icon size or crop is inferred from the source.'],
  },
  prop: {
    title: 'Prop source', defaultSize: '1024x1024', defaultQuality: 'high', needsAlphaExtraction: true,
    promptGuidance: [
      'Create the isolated prop described in the brief. Preserve its whole silhouette and visible base, with sufficient margin for later registration. Match the view explicitly requested; do not add a floor patch, scene, or companion objects.',
      CHROMA_GUIDANCE,
    ],
    workflowNotes: ['Extract alpha along the actual outline, measure the foot or base pivot after export, and review the prop beside the 64x96 character at scale 1. The bitmap does not supply collision or placement.'],
  },
  'environment-part': {
    title: 'Environment part source', defaultSize: '1024x1024', defaultQuality: 'high', needsAlphaExtraction: true,
    promptGuidance: [
      'Create only the environment object or part specified in the brief. Preserve the true natural edge of leaves, eaves, branches, stone, or architecture rather than cutting the ART to a rough polygon. Do not invent the omitted parts or background.',
      'If the brief specifies a multipart object, all requested parts must preserve one shared canvas, pivot, view, and registration. Do not crop parts independently or flatten parts with different before or after relationships to the player.',
      CHROMA_GUIDANCE,
    ],
    workflowNotes: ['Extract alpha with the true object outline. Related parts require the same measured canvas, pivot, and coordinates; verify by recomposition and native front, back, side, and under canopy views.', 'The environment source does not generate colliders, navigation, layered files, or the clean background beneath an occluder. Those require explicit later production work.'],
  },
  'character-concept': {
    title: 'Character concept', defaultSize: '1024x1536', defaultQuality: 'high', needsAlphaExtraction: false,
    promptGuidance: [
      'Create the character concept described in the brief with readable clothing, anatomy, and silhouette. Keep the entire figure and feet visible unless the brief requests a different crop. Use only the character, costume, palette, pose, and view supplied in the brief.',
      'Treat the source as concept art, not a sprite sheet or animation. The eventual native character frame is 64x96 pixels, with foot anchor (32,88) and gameplay scale 1; the generation canvas is not that native frame. Keep any requested aura visually separable from the body.',
    ],
    workflowNotes: ['Owner review of a static character concept is separate from animation, direction sheets, customization permission, and runtime integration. Build and review a native 64x96 body with foot anchor (32,88) separately; do not automatically scale or label this source as a native sprite.'],
  },
  'vfx-concept': {
    title: 'VFX concept', defaultSize: '1024x1024', defaultQuality: 'high', needsAlphaExtraction: false,
    promptGuidance: [
      'Create a static effect concept from the brief with a clear focal form and controlled visual density. Use only the requested motif, palette, and effect behavior; do not add a character, unrelated symbols, or an animation contact sheet unless requested.',
      'This is a static visual study. For later R01 production, the reference canvas is 96x96 pixels with body 80 and foot pivot (48,88), at scale 1. These are a later native export contract, not a measured property of this generated image.',
    ],
    workflowNotes: ['Review the static effect before separately authoring animation, timing, alpha, and composition with a native body. R01 uses canvas 96x96, body 80, pivot (48,88); no effect is automatically cast, attached, or exported.'],
  },
  'ui-art': {
    title: 'UI art concept', defaultSize: '1536x1024', defaultQuality: 'high', needsAlphaExtraction: false,
    promptGuidance: [
      'Create only the UI artwork described in the brief. Preserve deliberate visual hierarchy and readable negative space where the brief specifies controls or text. Do not invent interactions, resource values, labels, portraits, or gameplay.',
      'The existing desktop HUD uses a 760x140 pixel native frame. This is context for review only: it does not mean this source has that canvas, contains approved hotbar geometry, or is ready to replace an existing HUD. Do not copy or redesign the current HUD unless the brief asks for that.',
    ],
    workflowNotes: ['Review UI source art separately from interaction, layout, slicing, alpha, fonts, and native export. The existing desktop HUD760x140 is a preserved reference contract, not a claim about this source image.'],
  },
  'map-concept': {
    title: 'Map concept', defaultSize: '1536x1024', defaultQuality: 'high', needsAlphaExtraction: false,
    promptGuidance: [
      'Create a full map concept from the supplied brief and its GDD requirements. Use only the provided map role, camera, area, paths, objects, and palette. Show the requested layout coherently, without gameplay overlays, invented portals, navigation polygons, characters, or UI.',
      'Keep architecture, doors, paths, bridges, and stairs plausible beside a native 64x96 character at foot anchor (32,88), camera 1x. Concept canvas dimensions are not the final world dimensions. Never make the character smaller to imply a larger map.',
      'This is the concept stage of the approved workflow: GDD, full concept, native character scale review, selected style, overlapping detail sectors, registration and stitching, lightweight full background for the editor, owner navigation, then needed separate assets. A single concept is not a finished map or a layered environment source.',
    ],
    workflowNotes: ['Follow docs/MAP-CONCEPT-SECTOR-WORKFLOW.md. Full concept and native scale review come before overlapping detail sectors, registration, stitching, and a separate lightweight editor background.', 'The owner defines navigation and needed assets after review. No authored map, blocker, stairs, spawn, portal, world size, or existing layout is generated or changed by this tool.'],
  },
});

export function listAssetProfiles() {
  return Object.entries(ASSET_PROFILES).map(([assetType, profile]) => ({ assetType, ...structuredClone(profile) }));
}

function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) throw new Error('Asset input must be a JSON object.');
  if (Object.keys(input).some((key) => !INPUT_FIELDS.has(key))) throw new Error('Asset input has an unknown field. Allowed fields: assetType, name, prompt, size, quality, n.');
  if (typeof input.assetType !== 'string' || !Object.hasOwn(ASSET_PROFILES, input.assetType)) throw new Error('assetType must be icon, prop, environment-part, character-concept, vfx-concept, ui-art, or map-concept.');
  if (typeof input.name !== 'string' || input.name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.name)) throw new Error('name must be a lowercase ASCII slug with letters, digits, and single hyphens, at most 64 characters.');
  if (typeof input.prompt !== 'string' || !input.prompt.trim() || Buffer.byteLength(input.prompt, 'utf8') > MAX_PROMPT_BYTES || input.prompt.includes('\0')) throw new Error('prompt must contain text, without NUL, and be at most 32768 UTF-8 bytes.');
  const profile = ASSET_PROFILES[input.assetType];
  const size = input.size === undefined ? profile.defaultSize : input.size;
  if (size !== 'auto') {
    const dimensions = typeof size === 'string' ? /^([1-9]\d{0,3})x([1-9]\d{0,3})$/.exec(size) : null;
    const width = Number(dimensions?.[1]);
    const height = Number(dimensions?.[2]);
    const pixels = width * height;
    if (!dimensions || width > 3840 || height > 3840 || width % 16 !== 0 || height % 16 !== 0 || Math.max(width, height) / Math.min(width, height) > 3 || pixels < 655_360 || pixels > 8_294_400) throw new Error('size must be auto or WIDTHxHEIGHT: each edge a multiple of 16 up to 3840, aspect ratio at most 3:1, and pixel count 655360 through 8294400.');
  }
  const quality = input.quality === undefined ? profile.defaultQuality : input.quality;
  if (!['auto', 'high', 'medium', 'low'].includes(quality)) throw new Error('quality must be auto, high, medium, or low.');
  const n = input.n === undefined ? 1 : input.n;
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('n must be an integer from 1 through 4.');
  return { input: structuredClone(input), profile, size, quality, n };
}

function contract(profile, assetType) {
  return {
    character: { frame: { width: 64, height: 96 }, anchor: { x: 32, y: 88 }, scale: 1 },
    vfxR01: { canvas: { width: 96, height: 96 }, body: 80, pivot: { x: 48, y: 88 }, scale: 1 },
    desktopHud: { frame: { width: 760, height: 140 }, status: 'existing-reference-only' },
    sourceIsNativeArtifact: false,
    nativeArtifact: { status: 'not-produced', path: null, automaticResize: false },
    pivot: { status: 'pending-measurement-and-review', value: null },
    needsAlphaExtraction: profile.needsAlphaExtraction,
    alpha: { status: profile.needsAlphaExtraction ? 'pending-chroma-key-extraction-and-edge-review' : 'pending-production-decision', background: profile.needsAlphaExtraction ? '#FF00FF' : 'from-user-brief', extracted: false },
    multipart: { status: assetType === 'environment-part' ? 'pending-shared-canvas-pivot-registration-and-review' : 'not-produced', sharedCanvasAndPivotRequired: assetType === 'environment-part' },
    gameplayData: { produced: false, collision: false, navigation: false },
  };
}

/** Pure and deterministic: validation and string compilation only; no clock, randomness, filesystem, or credentials. */
export function planGameAsset(input, { workspaceRoot = DEFAULT_WORKSPACE_ROOT } = {}) {
  const validated = validateInput(input);
  if (typeof workspaceRoot !== 'string' || !workspaceRoot.trim()) throw new Error('workspaceRoot must be a nonempty path.');
  const root = path.resolve(workspaceRoot);
  const directoryTemplate = path.join(root, 'output', 'imagegen', 'game-assets', `${input.name}-<unique-version>`);
  const compiledPrompt = [
    `GAME ASSET SOURCE PREVIEW — ${validated.profile.title}`,
    ...COMMON_GUIDANCE,
    '', 'PROFILE REQUIREMENTS', ...validated.profile.promptGuidance,
    '', 'USER BRIEF — retain exactly as provided below', input.prompt,
  ].join('\n');
  return {
    version: 1, assetType: input.assetType, name: input.name, input: validated.input, model: MODEL, compiledPrompt,
    routerParameters: { model: MODEL, prompt: compiledPrompt, size: validated.size, quality: validated.quality, n: validated.n, timeoutMs: TIMEOUT_MS },
    outputPlan: { directoryTemplate, sourceStemTemplate: path.join(directoryTemplate, 'source'), requestPathTemplate: path.join(directoryTemplate, 'request.json'), manifestPathTemplate: path.join(directoryTemplate, 'manifest.json'), reservation: 'exclusive-new-directory-at-generation-time', pathIsReserved: false },
    workflow: { stage: 'source-concept-preview', notes: [...validated.profile.workflowNotes, ...REVIEW_NOTES], automaticRuntimeImport: false, automaticNativeExport: false },
    runtimeContract: contract(validated.profile, input.assetType),
    review: { status: 'preview-only', ownerApproved: false, artApproved: false, visualReview: 'pending', nativeReview: 'pending', pivotReview: 'pending' },
  };
}

function isInside(root, destination) {
  const relative = path.relative(root, destination);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

async function assertDirectoryInside(root, directory) {
  const info = await fs.lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Asset output parents must be ordinary directories, without symbolic links.');
  const actual = await fs.realpath(directory);
  if (!isInside(root, actual)) throw new Error('Asset output resolves outside the workspace.');
}

async function reserveOutputDirectory(root, name, now) {
  // Resolve the selected workspace itself first, then refuse redirected output parents.
  const actualRoot = await fs.realpath(root);
  let parent = actualRoot;
  for (const component of ['output', 'imagegen', 'game-assets']) {
    parent = path.join(parent, component);
    try { await fs.mkdir(parent); } catch (error) { if (error?.code !== 'EEXIST') throw error; }
    await assertDirectoryInside(actualRoot, parent);
  }
  const date = new Date(now());
  if (!Number.isFinite(date.getTime())) throw new Error('now must return a valid timestamp.');
  const timestamp = date.toISOString().replace(/[:.]/g, '-');
  for (let attempt = 0; attempt < 5; attempt++) {
    const directory = path.join(parent, `${name}-${timestamp}-${randomBytes(8).toString('hex')}`);
    try { await fs.mkdir(directory); }
    catch (error) { if (error?.code === 'EEXIST') continue; throw error; }
    await assertOutputPath(actualRoot, directory);
    return { actualRoot, directory, timestamp: date.toISOString() };
  }
  throw new Error('Could not reserve a unique asset output directory.');
}

async function assertOutputPath(root, directory) {
  const relative = path.relative(root, directory);
  if (!isInside(root, directory)) throw new Error('Asset output is outside the workspace.');
  let parent = root;
  for (const component of relative.split(path.sep).filter(Boolean)) {
    parent = path.join(parent, component);
    await assertDirectoryInside(root, parent);
  }
}

async function writeJsonExclusive(filename, value) {
  await fs.writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
}

/** Exactly one router POST, no retries and no approval or native export inferred from the response. */
export async function generateGameAsset(input, { workspaceRoot = DEFAULT_WORKSPACE_ROOT, env = process.env, config, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const plan = planGameAsset(input, { workspaceRoot });
  const reserved = await reserveOutputDirectory(path.resolve(workspaceRoot), input.name, now);
  const requestPath = path.join(reserved.directory, 'request.json');
  const manifestPath = path.join(reserved.directory, 'manifest.json');
  const common = {
    version: 1, status: 'preview-only', ownerApproved: false, artApproved: false,
    assetType: plan.assetType, name: plan.name, input: plan.input, model: MODEL,
    compiledPrompt: plan.compiledPrompt, routerParameters: plan.routerParameters,
    workflow: plan.workflow, runtimeContract: plan.runtimeContract, review: plan.review,
    outputDirectory: reserved.directory, requestPath, manifestPath, requestedAt: reserved.timestamp,
  };
  let resolvedConfig;
  const secrets = [env?.IMAGEGEN_ROUTER_API_KEY, config?.apiKey];
  try {
    await writeJsonExclusive(requestPath, { ...common, generationStatus: 'request-saved-before-network' });
    resolvedConfig = config ?? await resolveConfig({ env });
    secrets.push(resolvedConfig?.apiKey);
    if (resolvedConfig?.model !== undefined && resolvedConfig.model !== MODEL) throw new Error('Game asset generation requires configured model gpt-image-2. No request was sent; update the router configuration explicitly.');
    // Recheck all existing parents just before the paid router operation.
    await assertOutputPath(reserved.actualRoot, reserved.directory);
    const result = await runGenerate({
      config: { ...resolvedConfig, model: MODEL }, prompt: plan.compiledPrompt,
      out: path.join(reserved.directory, 'source'), size: plan.routerParameters.size,
      quality: plan.routerParameters.quality, n: plan.routerParameters.n, timeoutMs: TIMEOUT_MS,
      force: false, fetchImpl, now,
    });
    const manifest = {
      ...common, generationStatus: 'completed', generationVerified: result.generationVerified,
      generatedAt: new Date(now()).toISOString(), endpoint: result.endpoint,
      requestedCount: result.requestedCount, returnedCount: result.returnedCount,
      ...(result.requestId ? { requestId: result.requestId } : {}),
      files: result.files.map((file) => ({ ...file, sourcePath: file.path, role: 'generated-source-preview', nativeArtifact: { status: 'not-produced', path: null }, pivot: { status: 'pending-measurement-and-review', value: null }, needsAlphaExtraction: plan.runtimeContract.needsAlphaExtraction })),
      warnings: [...result.warnings],
    };
    await writeJsonExclusive(manifestPath, manifest);
    return manifest;
  } catch (error) {
    const safeError = sanitizeError(error, secrets);
    const failure = { ...common, generationStatus: 'failed', generationVerified: false, files: [], warnings: [], error: safeError, retryPerformed: false };
    try {
      await assertOutputPath(reserved.actualRoot, reserved.directory);
      await writeJsonExclusive(manifestPath, failure);
    } catch { /* Retain the request and sanitized original error if the filesystem is unavailable. */ }
    const publicError = new Error(safeError);
    publicError.manifestPath = manifestPath;
    publicError.outputDirectory = reserved.directory;
    throw publicError;
  }
}

export const HELP = `Game asset source previews through the configured gpt-image-2 router.

Usage:\n  node scripts/game-assetgen.mjs profiles
  node scripts/game-assetgen.mjs plan --spec-file asset.json
  node scripts/game-assetgen.mjs generate --spec-file asset.json
  node scripts/game-assetgen.mjs generate --spec '{"assetType":"prop","name":"test-prop","prompt":"Describe the requested prop"}'

Input is one strict JSON object: assetType, name, prompt, optional size, quality, n.
Types: icon, prop, environment-part, character-concept, vfx-concept, ui-art, map-concept.
name: lowercase ASCII slug, maximum 64 characters. prompt: maximum 32768 UTF-8 bytes.
size: auto or WIDTHxHEIGHT; edges must be multiples of 16 and at most 3840,
aspect ratio at most 3:1, pixel count 655360 through 8294400.
quality: auto, high, medium, low.
n: integer 1 through 4, default 1. Profile quality defaults to high.
Supply exactly one --spec JSON or --spec-file UTF-8-PATH for plan/generate.
--dry-run makes generate behave as plan: no files, config, credentials, or network.
--help shows this text. Normal command results and errors are JSON.

generate sends one POST with a 300 second deadline and never retries or changes model.
Files go to a new version directory under output/imagegen/game-assets/ in this workspace.
Every result is a source preview awaiting ART and owner review; no game asset is imported.
Chroma key profiles require separate alpha extraction. No native resize or pivot is inferred.
`;

function parseArgs(argv) {
  const tokens = [...argv];
  let command = tokens.shift() ?? 'help';
  if (['--help', '-h'].includes(command)) command = 'help';
  if (!['profiles', 'plan', 'generate', 'help'].includes(command)) throw new Error('Unknown command. Use --help.');
  const parsed = { command };
  const seen = new Set();
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const split = token.indexOf('=');
    const option = split > 0 ? token.slice(0, split) : token;
    if (seen.has(option)) throw new Error('An option was supplied more than once.');
    seen.add(option);
    if (['--help', '-h', '--dry-run'].includes(option)) {
      if (split > 0) throw new Error('Boolean flags do not accept values.');
      parsed[option === '--dry-run' ? 'dryRun' : 'help'] = true;
    } else if (['--spec', '--spec-file'].includes(option)) {
      const value = split > 0 ? token.slice(split + 1) : tokens[++index];
      if (value === undefined || (split < 0 && value.startsWith('--'))) throw new Error('Missing JSON or file value.');
      parsed[option === '--spec' ? 'spec' : 'specFile'] = value;
    } else throw new Error('Unknown option or positional argument. Use --help.');
  }
  if (parsed.help || command === 'help') return { command: 'help' };
  if (command === 'profiles') {
    if (Object.keys(parsed).length !== 1) throw new Error('profiles accepts no options.');
  } else {
    if ((parsed.spec === undefined) === (parsed.specFile === undefined)) throw new Error('Supply exactly one of --spec or --spec-file.');
    if (parsed.dryRun && command !== 'generate') throw new Error('--dry-run is supported with generate only; use plan directly.');
  }
  return parsed;
}

async function readSpec(args) {
  let bytes;
  if (args.spec !== undefined) bytes = Buffer.from(args.spec, 'utf8');
  else {
    try {
      const filename = path.resolve(args.specFile);
      const stat = await fs.stat(filename);
      if (!stat.isFile() || stat.size > MAX_SPEC_BYTES) throw new Error('Invalid file');
      bytes = await fs.readFile(filename);
    } catch { throw new Error('Could not read a regular UTF-8 spec file within the 64 KiB limit.'); }
  }
  if (bytes.length > MAX_SPEC_BYTES) throw new Error('JSON spec exceeds the 64 KiB limit.');
  let decoded;
  try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('The JSON spec must be valid UTF-8.'); }
  try { return JSON.parse(decoded); }
  catch { throw new Error('The asset spec contains invalid JSON.'); }
}

export async function main(argv = process.argv.slice(2), { workspaceRoot = DEFAULT_WORKSPACE_ROOT, env = process.env, config, fetchImpl = globalThis.fetch, now = Date.now, stdout = process.stdout, stderr = process.stderr } = {}) {
  try {
    const args = parseArgs(argv);
    if (args.command === 'help') { stdout.write(HELP); return 0; }
    let result;
    if (args.command === 'profiles') result = { model: MODEL, profiles: listAssetProfiles() };
    else {
      const input = await readSpec(args);
      result = args.command === 'plan' || args.dryRun
        ? planGameAsset(input, { workspaceRoot })
        : await generateGameAsset(input, { workspaceRoot, env, config, fetchImpl, now });
    }
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    stderr.write(`${JSON.stringify({ error: sanitizeError(error, [env?.IMAGEGEN_ROUTER_API_KEY, config?.apiKey]), ...(error?.manifestPath ? { manifestPath: error.manifestPath } : {}) })}\n`);
    return 1;
  }
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (process.platform === 'win32' ? entryPath.toLowerCase() === MODULE_PATH.toLowerCase() : entryPath === MODULE_PATH) {
  main().then((code) => { process.exitCode = code; }).catch(() => { process.stderr.write('{"error":"Unexpected game asset tool failure."}\n'); process.exitCode = 1; });
}
