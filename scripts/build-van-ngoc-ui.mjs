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
const folder = resolve(root, 'docs/design/ui/van-ngoc-kit-v1');
const source = await readFile(resolve(folder, 'lotus-crest-source-v1.png'));
const metadata = await sharp(source).metadata();
if (!metadata.hasAlpha) throw new Error('Companion ornament must keep the generated alpha.');
// Uniform delivery export only; never repaint the generated artwork or change the approved HUD.
const runtime = await sharp(source).resize({ width: 1086, withoutEnlargement: true, kernel: 'lanczos3' })
  .webp({ quality: 92, alphaQuality: 100 }).toBuffer();
await writeFile(resolve(folder, 'lotus-crest-v1.webp'), runtime);
const target = resolve(root, 'client/public/assets/van-ngoc-ui');
await mkdir(target, { recursive: true }); await writeFile(resolve(target, 'lotus-crest-v1.webp'), runtime);
const exported = await sharp(runtime).metadata();
await writeFile(resolve(folder, 'asset.json'), JSON.stringify({
  tool: 'built_in_imagegen', artApproved: false, ownerApproved: false,
  source: 'lotus-crest-source-v1.png', sourceSize: [metadata.width, metadata.height],
  reference: '../desktop-skill-hud-v3/qi-v2/qi-on-detail.jpg', prompt: 'lotus-crest.prompt.txt',
  runtime: 'lotus-crest-v1.webp', runtimeSize: [exported.width, exported.height], bytes: runtime.length,
  sourceSha256: createHash('sha256').update(source).digest('hex'), sha256: createHash('sha256').update(runtime).digest('hex'),
  processing: 'Uniform Lanczos3 downsample and WebP export preserving alpha. No repaint, trim, blur, mask or independent scaling.',
  usage: 'Companion crest for entry and dialog headers; original hotbar artwork is unchanged.',
}, null, 2) + '\n');
console.log(`Vân Ngọc crest: ${exported.width} × ${exported.height}, ${runtime.length} bytes, alpha preserved.`);
