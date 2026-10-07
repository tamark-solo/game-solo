import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const design = JSON.parse(await readFile(resolve(root, 'docs/data/client-tech-preview-design.json'), 'utf8'));
const target = resolve(root, 'client/public/assets');
await mkdir(target, { recursive: true });
const names = {
  'CHR-WANG-LIN': 'Vương Lâm · bộ trước',
  'CHR-WANG-LIN-CHIBI-EAST-PILOT': 'Vương Lâm · chibi (mẫu mới)',
  'AVATAR-NOVICE-MALE': 'Đệ tử nam',
  'AVATAR-NOVICE-FEMALE': 'Đệ tử nữ',
  'CHR-SITU-NAN': 'Tư Đồ Nam · linh thể',
  'CHR-LI-MUWAN': 'Lý Mộ Uyển · áo tím',
};
const actors = [];
let nativeFrameCount = 0;
for (const asset of design.preview.assets) {
  const metadata = JSON.parse(await readFile(resolve(root, asset.metadataPath), 'utf8'));
  if (Object.keys(metadata.frames).length !== asset.frameCount) throw new Error(`Sai số frame: ${asset.characterId}`);
  nativeFrameCount += asset.frameCount;
  const folder = resolve(target, asset.characterId);
  await mkdir(folder, { recursive: true });
  await copyFile(resolve(root, asset.atlasPath), resolve(folder, 'atlas.png'));
  await copyFile(resolve(root, asset.metadataPath), resolve(folder, 'atlas.json'));
  const atlasVersion = createHash('sha256').update(await readFile(resolve(folder, 'atlas.png'))).digest('hex').slice(0, 16);
  const metadataVersion = createHash('sha256').update(await readFile(resolve(folder, 'atlas.json'))).digest('hex').slice(0, 16);
  actors.push({
    id: asset.characterId,
    name: names[asset.characterId],
    role: asset.role,
    frameCount: asset.frameCount,
    atlasUrl: `/assets/${asset.characterId}/atlas.png?v=${atlasVersion}`,
    metadataUrl: `/assets/${asset.characterId}/atlas.json?v=${metadataVersion}`,
    sourcePath: asset.metadataPath,
    previewOnlyDirection: asset.previewOnlyDirection,
    defaultAnimationFPS: asset.defaultAnimationFPS,
    defaultGaitCycleDistancePx: asset.defaultGaitCycleDistancePx,
    defaultMovementSpeedPxPerSecond: asset.defaultMovementSpeedPxPerSecond,
  });
}
await copyFile(resolve(root, design.preview.backgroundPath), resolve(target, 'courtyard.png'));
if (nativeFrameCount !== design.preview.existingNativeFrameCount) throw new Error('Tổng frame không khớp thiết kế.');
await writeFile(resolve(target, 'catalog.json'), JSON.stringify({
  actors, backgroundUrl: '/assets/courtyard.png', nativeFrameCount,
  defaultActorId: design.preview.defaultActorId,
  defaultDirection: design.preview.defaultDirection,
}, null, 2) + '\n', 'utf8');
if (design.preview.gaitReviewPath) {
  const reviewSource = resolve(root, dirname(design.preview.gaitReviewPath));
  const reviewTarget = resolve(target, 'gait-review');
  const reviewScript = await readFile(resolve(reviewSource, 'review-data.js'), 'utf8');
  const review = JSON.parse(reviewScript.slice(reviewScript.indexOf('=') + 1).trim().replace(/;$/, ''));
  await mkdir(reviewTarget, { recursive: true });
  await copyFile(resolve(reviewSource, 'index.html'), resolve(reviewTarget, 'index.html'));
  for (const actor of review.actors) {
    for (const key of ['legacy', 'next']) {
      const source = resolve(reviewSource, actor[key], 'atlas.png');
      const relative = `${actor.id}/${key}`;
      await mkdir(resolve(reviewTarget, relative), { recursive: true });
      await copyFile(source, resolve(reviewTarget, relative, 'atlas.png'));
      actor[key] = relative;
    }
  }
  await writeFile(resolve(reviewTarget, 'review-data.js'), `window.GaitReviewData = ${JSON.stringify(review)};\n`, 'utf8');
}
if (design.chibiPilot) {
  const folder = resolve(target, 'chibi-pilot');
  await mkdir(folder, { recursive: true });
  for (const name of ['atlas.png', 'atlas.json']) await copyFile(resolve(root, design.chibiPilot.nativeFolder, name), resolve(folder, name));
}
console.log(`Đã chuẩn bị ${actors.length} bộ / ${nativeFrameCount} frame và nền sân; nguồn ART giữ tại docs/design.`);
