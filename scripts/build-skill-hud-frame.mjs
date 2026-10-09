import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/AnhLT/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const folder = resolve(root, 'docs/design/ui/desktop-skill-hud-v3');
const source = resolve(folder, 'cultivation-frame-source.png');
const metadata = await sharp(source).metadata();
if (metadata.width !== 2172 || metadata.height !== 724 || !metadata.hasAlpha) throw new Error('Frame source changed; review its crop and socket alignment first.');
// Trim transparent top/bottom margins only, leaving every painted pixel intact.
const crop = { left: 0, top: 159, width: 2172, height: 400 };
const runtime = await sharp(source).extract(crop).resize({ width: 1520, kernel: 'lanczos3' }).webp({ quality: 94, alphaQuality: 100 }).toBuffer();
await writeFile(resolve(folder, 'cultivation-frame-v3.webp'), runtime);
const exported = await sharp(runtime).metadata();
await writeFile(resolve(folder, 'frame.json'), JSON.stringify({
  tool: 'built_in_imagegen', artApproved: false,
  source: 'cultivation-frame-source.png', reference: 'layout-reference.png', prompt: 'frame.prompt.txt',
  sourceSize: [metadata.width, metadata.height], crop,
  runtime: 'cultivation-frame-v3.webp', runtimeSize: [exported.width, exported.height],
  displayWidth: 760, bytes: runtime.length, sha256: createHash('sha256').update(runtime).digest('hex'),
  processing: 'Trim transparent margins, uniform Lanczos3 downsample, WebP conversion preserving alpha; no repainting or sharpening.',
}, null, 2) + '\n');
console.log(`Prepared ${exported.width} × ${exported.height} alpha frame, ${runtime.length} bytes.`);
