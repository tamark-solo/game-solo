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
const folder = resolve(root, 'docs/design/ui/desktop-skill-hud-v3/qi-v2');
const source = resolve(folder, 'orb-textures-source.png');
const metadata = await sharp(source).metadata();
if (metadata.width !== metadata.height * 2) throw new Error('Qi source must have two equal square cells. Review the source before export.');
// Keep the original artwork. Only uniformly downsample the two-cell atlas and encode it.
const runtime = await sharp(source).resize({ width: 512, kernel: 'lanczos3' }).webp({ quality: 92 }).toBuffer();
await writeFile(resolve(folder, 'orb-textures-v2.webp'), runtime);
await writeFile(resolve(folder, 'orb-textures.json'), JSON.stringify({
  tool: 'built_in_imagegen', artApproved: false,
  source: 'orb-textures-source.png', prompt: 'orb-textures.prompt.txt',
  sourceSize: [metadata.width, metadata.height], runtime: 'orb-textures-v2.webp', runtimeSize: [512, 256],
  cells: { health: [0, 0, 256, 256], mana: [256, 0, 256, 256] },
  display: '67 × 67 px circular glass socket; clipped at the live resource level; no scale by resource percentage.',
  bytes: runtime.length, sha256: createHash('sha256').update(runtime).digest('hex'),
  processing: 'Uniform Lanczos3 downsample and WebP conversion; no repainting, sharpening, blur or copied external assets.',
}, null, 2) + '\n');
console.log(`Prepared qi atlas 512 × 256, ${runtime.length} bytes.`);
