import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const folder = resolve(root, 'docs/design/ui/van-ngoc-kit-v2');
const publicFolder = resolve(root, 'client/public/assets/van-ngoc-ui');
await mkdir(publicFolder, { recursive: true });
const manifest = JSON.parse(await readFile(resolve(folder, 'assets.json'), 'utf8'));
const frame = manifest.assets.find(asset => asset.id === 'window-frame');
const source = await readFile(resolve(folder, frame.runtime));
const sha256 = createHash('sha256').update(source).digest('hex');
if (sha256 !== frame.sha256) throw new Error('Frame hash differs from reviewed delivery metadata.');
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const slice = Number.parseFloat(frame.slice) / 100;
if (!(slice > 0 && slice < .5)) throw new Error('Invalid frame slice.');

// Trace only the transparent aperture enclosed by the artwork, starting at its center.
// This exports a code-native SVG clipping resource; the frame/paper images are untouched.
const hole = new Uint8Array(info.width * info.height), queue = new Int32Array(hole.length);
let head = 0, tail = 0;
const start = Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2);
if (data[start * 4 + 3] > 32) throw new Error('Frame center is not clear.');
hole[start] = 1; queue[tail++] = start;
while (head < tail) {
  const index = queue[head++], x = index % info.width, y = Math.floor(index / info.width);
  if (!x || !y || x === info.width - 1 || y === info.height - 1) throw new Error('Frame aperture is not enclosed.');
  for (const next of [index - 1, index + 1, index - info.width, index + info.width]) {
    if (hole[next] || data[next * 4 + 3] > 32) continue;
    hole[next] = 1; queue[tail++] = next;
  }
}
const xCuts = [0, info.width * slice, info.width * (1 - slice), info.width];
const yCuts = [0, info.height * slice, info.height * (1 - slice), info.height];
const tiles = [];
const names = [['tl', 't', 'tr'], ['l', 'c', 'r'], ['bl', 'b', 'br']];
for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
  const left = xCuts[column], top = yCuts[row], right = xCuts[column + 1], bottom = yCuts[row + 1];
  const runs = [];
  for (let y = Math.floor(top); y < Math.ceil(bottom); y++) {
    let x = Math.floor(left);
    while (x < Math.ceil(right)) {
      if (!hole[y * info.width + x]) { x++; continue; }
      const begin = x;
      while (x < Math.ceil(right) && hole[y * info.width + x]) x++;
      const startX = Math.max(begin, left), endX = Math.min(x, right);
      const startY = Math.max(y, top), endY = Math.min(y + 1, bottom);
      if (endX > startX && endY > startY) runs.push(`M${startX} ${startY}h${endX - startX}v${endY - startY}h${startX - endX}Z`);
    }
  }
  const name = `frame-aperture-${names[row][column]}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${right - left} ${bottom - top}" preserveAspectRatio="none"><path fill="white" d="${runs.join('')}"/></svg>\n`;
  await writeFile(resolve(folder, name), svg); await writeFile(resolve(publicFolder, name), svg);
  tiles.push({ file: name, viewBox: [left, top, right - left, bottom - top], bytes: Buffer.byteLength(svg) });
}
await writeFile(resolve(folder, 'frame-aperture.json'), JSON.stringify({
  type: 'derived_vector_aperture', source: frame.runtime, sourceSha256: sha256,
  sourceSize: [info.width, info.height], alphaThreshold: 32, slice: frame.slice,
  filledPixels: tail, enclosed: true, tiles,
  processing: 'Center-connected transparent aperture traced into nine SVG viewBoxes using the artwork slice. No modification of frame, paper or authored artwork.',
}, null, 2) + '\n');
console.log(`Frame aperture: ${tail} enclosed pixels, ${tiles.length} SVG slices, ${tiles.reduce((sum, tile) => sum + tile.bytes, 0)} bytes.`);
