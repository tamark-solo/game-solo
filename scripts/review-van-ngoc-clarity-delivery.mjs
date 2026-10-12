// Read-only source/delivery QA. Writes review crops only; never changes ART or runtime data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/AnhLT/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(root, 'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions');
const out = resolve(base, 'review/delivery');
await mkdir(out, { recursive: true });
const composition = JSON.parse(await readFile(resolve(base, 'composition.json'), 'utf8'));
assert.equal(composition.freshCompositionWritten, true);
assert.equal(composition.regionCount, 20);
const web = await readFile(resolve(base, composition.web.path));
const master = await readFile(resolve(base, composition.master.path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(web), composition.web.sha256);
assert.equal(sha(master), composition.master.sha256);
const [decoded, original] = await Promise.all([web, master].map(bytes => sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
assert.deepEqual(decoded.info, original.info);
assert.ok(decoded.data.equals(original.data), 'Lossless delivery must preserve every master RGB pixel.');
assert.deepEqual([decoded.info.width, decoded.info.height], [3072, 2048]);

const seamReviews = [];
for (const seam of composition.seams) {
  const crops = [];
  for (const [index, fraction] of [0.2, 0.5, 0.8].entries()) {
    const [x, y] = seam.pathPx[Math.round((seam.pathPx.length - 1) * fraction)];
    const rect = { left: Math.max(0, Math.min(2816, Math.round(x) - 128)),
      top: Math.max(0, Math.min(1824, Math.round(y) - 112)), width: 256, height: 224 };
    const pixels = await sharp(web).extract(rect).png().toBuffer();
    const filename = `${seam.id || seam.name || seam.label || seamReviews.length}-${index + 1}.png`;
    await writeFile(resolve(out, filename), pixels);
    crops.push({ filename, rect, pixels });
  }
  seamReviews.push({ id: seam.id || seam.name || seam.label || String(seamReviews.length),
    orientation: seam.orientation, crops });
}
for (let i = 0; i < seamReviews.length; i += 4) {
  const batch = seamReviews.slice(i, i + 4);
  await sharp({ create: { width: 768, height: 224 * batch.length, channels: 3, background: '#10272c' } })
    .composite(batch.flatMap((seam, row) => seam.crops.map((crop, col) => ({ input: crop.pixels, left: col * 256, top: row * 224 }))))
    .png().toFile(resolve(out, `seams-${String(i / 4 + 1).padStart(2, '0')}.png`));
}

const catalog = JSON.parse(await readFile(resolve(root, 'client/public/assets/catalog.json'), 'utf8'));
const actors = [];
for (const id of ['CHR-WANG-LIN-CHIBI', 'CHR-SITU-NAN', 'CHR-LI-MUWAN']) {
  const actor = catalog.actors.find(a => a.id === id);
  const publicPath = url => resolve(root, 'client/public', url.split('?')[0].replace(/^\//, ''));
  const metadata = JSON.parse(await readFile(publicPath(actor.metadataUrl), 'utf8'));
  assert.deepEqual(metadata.frameSizePx, [64, 96]);
  assert.deepEqual(metadata.footAnchorPx, [32, 88]);
  const [frameId, { frame }] = Object.entries(metadata.frames).find(([key]) => /stand_south|idle_south/.test(key));
  const atlas = await readFile(publicPath(actor.atlasUrl));
  const pixels = await sharp(atlas).extract({ left: frame.x, top: frame.y, width: frame.w, height: frame.h }).png().toBuffer();
  actors.push({ id, frameId, atlasSha256: sha(atlas), pixels });
}
const prior = await readFile(resolve(base, 'inputs/layout-master.png'));
const scenes = [
  { name: 'door-stairs', rect: { left: 1260, top: 480, width: 600, height: 400 }, foot: [1600, 840] },
  { name: 'courtyard', rect: { left: 1260, top: 870, width: 600, height: 400 }, foot: [1616, 992] },
  { name: 'west-bridge', rect: { left: 352, top: 1424, width: 600, height: 400 }, foot: [600, 1774] },
];
for (const [index, scene] of scenes.entries()) {
  const overlay = [{ input: actors[index].pixels,
    left: scene.foot[0] - scene.rect.left - 32, top: scene.foot[1] - scene.rect.top - 88 }];
  const left = await sharp(prior).extract(scene.rect).composite(overlay).png().toBuffer();
  const right = await sharp(web).extract(scene.rect).composite(overlay).png().toBuffer();
  await writeFile(resolve(out, `${scene.name}-native.png`), right);
  await sharp({ create: { width: 1216, height: 400, channels: 3, background: '#10272c' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 616, top: 0 }])
    .png().toFile(resolve(out, `${scene.name}-comparison.png`));
}
const report = { schema: 'game-solo-clarity-delivery-review-1',
  masterSha256: sha(master), webSha256: sha(web), webBytes: web.length,
  losslessDecodedRgbMatchesMaster: true, sourceDimensions: [3072, 2048], decodedRgbaBytes: 3072 * 2048 * 4,
  nativeCameraScale: 1, actorFrame: [64, 96], actorAnchor: [32, 88], actorResized: false,
  actors: actors.map(({ pixels, ...record }) => record), scenes,
  seams: seamReviews.map(seam => ({ ...seam, crops: seam.crops.map(({ pixels, ...record }) => record) })),
  visualReview: 'pending', ownerApproved: false, artApproved: false, navigationModified: false };
await writeFile(resolve(out, 'review.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ lossless: true, seams: seamReviews.length,
  nativeSeamCrops: seamReviews.length * 3, nativeActorComparisons: scenes.length, out }));
