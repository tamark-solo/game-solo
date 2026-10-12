import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const folder = resolve(root, 'docs/design/ui/van-ngoc-kit-v2');
const target = resolve(root, 'client/public/assets/van-ngoc-ui');
await mkdir(target, { recursive: true });
const assets = [];
const hash = data => createHash('sha256').update(data).digest('hex');
for (const [id, alpha] of [['window-frame', true], ['jade-button', true], ['silk-paper', false]]) {
  const sourceName = `${id}-source-v2.png`, runtimeName = `${id}-v2.webp`;
  const source = await readFile(resolve(folder, sourceName));
  const metadata = await sharp(source).metadata();
  if (alpha && !metadata.hasAlpha) throw new Error(`${id} needs generated alpha.`);
  let crop, centerAlphaMax;
  if (alpha) {
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = -1, bottom = -1;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] <= (id === 'jade-button' ? 1 : 0)) continue;
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    if (right < 0) throw new Error(`${id} is empty.`);
    // The button canvas contains isolated alpha=1 export specks far outside the artwork.
    // Keep an 8px native safety margin around its visible alpha bounds; never repaint pixels.
    const pad = id === 'jade-button' ? 8 : 0;
    left = Math.max(0, left - pad); top = Math.max(0, top - pad);
    right = Math.min(info.width - 1, right + pad); bottom = Math.min(info.height - 1, bottom + pad);
    crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
    if (id === 'window-frame') {
      centerAlphaMax = 0;
      for (let y = Math.ceil(top + crop.height * .3); y < top + crop.height * .7; y++)
        for (let x = Math.ceil(left + crop.width * .3); x < left + crop.width * .7; x++) centerAlphaMax = Math.max(centerAlphaMax, data[(y * info.width + x) * 4 + 3]);
      // ImageGen leaves isolated alpha=1 specks in its clear center. Preserve source pixels;
      // reject any visible fill rather than masking or repainting the hole in code.
      if (centerAlphaMax > 1) throw new Error('Frame central hole has visible fill; review the generated source.');
    }
  }
  let pipeline = sharp(source);
  if (crop) pipeline = pipeline.extract(crop);
  const runtime = await pipeline.resize({ width: id === 'jade-button' ? 900 : 1024, withoutEnlargement: true, kernel: 'lanczos3' })
    .webp({ quality: 94, alphaQuality: 100 }).toBuffer();
  await writeFile(resolve(folder, runtimeName), runtime); await writeFile(resolve(target, runtimeName), runtime);
  const out = await sharp(runtime).metadata();
  assets.push({ id, source: sourceName, sourceSize: [metadata.width, metadata.height], crop,
    runtime: runtimeName, runtimeSize: [out.width, out.height], bytes: runtime.length,
    hasAlpha: out.hasAlpha, centerAlphaMax, sourceSha256: hash(source), sha256: hash(runtime),
    slice: id === 'window-frame' ? '36%' : id === 'jade-button' ? '24%' : null,
    artApproved: false, ownerApproved: false });
}
await writeFile(resolve(folder, 'assets.json'), JSON.stringify({
  tool: 'built_in_imagegen', status: 'implemented_pending_visual_review', artApproved: false,
  reference: '../desktop-skill-hud-v3/cultivation-frame-v3.webp',
  processing: 'Delivery crop: frame all nonzero alpha bounds; button visible alpha>1 bounds plus 8px native safety margin (isolated alpha=1 specks outside retained crop are omitted). Uniform Lanczos3 downsample and WebP export. Sources kept unchanged; no repaint, recolor, blur, mask or independent part scaling.',
  assets,
}, null, 2) + '\n');
console.log(JSON.stringify(assets.map(({ id, runtimeSize, bytes }) => ({ id, runtimeSize, bytes }))));
await import('./build-van-ngoc-frame-mask.mjs');
