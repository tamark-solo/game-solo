import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(import.meta.url)('C:/Users/AnhLT/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const base = resolve(root, 'docs/design/world/hang-nhac-van-ngoc-detail-v2');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function save(path, bytes) {
  try { if (hash(await readFile(path)) !== hash(bytes)) throw new Error(`Existing input differs: ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; await writeFile(path, bytes); }
}
await mkdir(resolve(base, 'regions/inputs'), { recursive: true });
await mkdir(resolve(base, 'regions/prompts'), { recursive: true });
await mkdir(resolve(base, 'regions/generated'), { recursive: true });
const master = await readFile(resolve(base, 'regions/inputs/layout-master.png'));
const style = await readFile(resolve(base, 'R01-native.png'));
const regions = [];
for (const [row, y] of [0, 448, 896, 1344].entries()) {
  for (const [column, x] of [0, 592, 1184, 1776, 2368].entries()) {
    const id = `D${String(regions.length + 1).padStart(2, '0')}`;
    const native = await sharp(master).extract({ left: x, top: y, width: 704, height: 704 }).png().toBuffer();
    const guide = await sharp(native).resize(1254, 1254, { kernel: 'lanczos3' }).png().toBuffer();
    await save(resolve(base, `regions/inputs/${id}-native.png`), native);
    await save(resolve(base, `regions/inputs/${id}-guide.png`), guide);
    const prompt = `Use case: precise environment redraw. Redraw existing Van Ngoc game map region ${id}, world rectangle [${x},${y},${x + 704},${y + 704}].\nImage 1 is the exact 1254x1254 spatial guide of this 704x704 world region. Image 2 is the owner-selected clarity sample R01, shown at native world resolution 704x704, for LINE QUALITY, MATERIALS, PALETTE and SHADING ONLY. Never borrow its stairs, doors, objects, ground pattern or composition.\nREDRAW the materials and contours as finished hand-drawn 2D game environment art. Match the clean firm dark contour edges and controlled cel shading of Image 2. Replace fuzzy painted edges and smeared microdetail with distinct designed lines and planes. Preserve the Van Ngoc ivory/celadon stone, petrol-teal roof tiles, restrained antique bronze, pine green and warm lighting of Image 1. Make stone bevels, roof tile groups, rail posts, stair treads, trunks, planters and foliage clusters legible beside a crisp 64x96 actor at camera1x. Clouds and distant atmosphere can remain soft; nearby architecture and walkable edges must be clearly drawn.\nFinal review is at 704x704, the same native scale as Image 2. Important contours should be approximately 2 to 3 pixels on the 1254 canvas to survive reduction. Keep walkable stone calm and readable with coherent slab joints, not random grain. No bokeh, depth-of-field, mist over foreground architecture, airbrush softness, sharpening halos, noisy pseudo-detail, pixel-art conversion, or new ornamentation.\nSPATIAL LOCK: SAME 1254 square canvas, camera and framing as Image 1. Every roof, door, stair tread, bridge, railing, column, planter, tree, rock, water edge and path keeps EXACT location and size. Preserve partial objects cut by all four edges. No zoom, crop, recenter, shift, rotation, margins, redesign, moved steps, added or removed objects, characters, text, UI, logos or watermark. Neighbor regions will be registered and stitched. Return one opaque square bitmap of only this region.\n`;
    await save(resolve(base, `regions/prompts/${id}.txt`), Buffer.from(prompt));
    regions.push({ id, row, column, rect: [x, y, x + 704, y + 704], nativeSize: [704, 704],
      layout: `inputs/${id}-native.png`, guide: `inputs/${id}-guide.png`, style: '../R01-native.png',
      prompt: `prompts/${id}.txt`, generated: `generated/${id}.png`, generationMetadata: `generated/${id}.json`,
      inputHashes: { native: hash(native), guide: hash(guide), style: hash(style), prompt: hash(Buffer.from(prompt)) },
      ownerApproved: false, artApproved: false, visualReview: { status: 'pending' } });
  }
}
const manifest = { schema: 'game-solo-map-native-clarity-regions-1', worldSize: [3072, 2048],
  nativeRegionSize: [704, 704], columns: 5, rows: 4, horizontalOverlapPx: 112, verticalOverlapPx: 256,
  source: { path: 'inputs/layout-master.png', width: 3072, height: 2048, sha256: hash(master) },
  selectedStyle: { path: '../R01-native.png', width: 704, height: 704, sha256: hash(style),
    ownerSelected: true, scope: 'contour clarity and shading direction only, selected in chat 12/10/2026; full map ART is pending' },
  preparation: { croppedSourcePixels: true, guideResampling: '1254x1254 spatial input only; not delivered ART',
    wholeMapUpscale: false, wholeMapSharpen: false, wholeMapBlur: false },
  character: { frame: [64, 96], anchor: [32, 88], cameraScale: 1 }, regions,
  ownerApproved: false, artApproved: false, navigationModified: false, authoredMapsModified: false };
await save(resolve(base, 'regions/inputs.json'), Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
console.log(`Prepared ${regions.length} regions: native 704x704, overlaps 112/256; owner-selected clarity style, full ART pending.`);
