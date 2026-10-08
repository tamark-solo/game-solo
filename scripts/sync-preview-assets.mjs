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
  'CHR-WANG-LIN-CHIBI': 'Vương Lâm · chibi bốn hướng',
  'AVATAR-NOVICE-MALE': 'Đệ tử nam · chibi',
  'AVATAR-NOVICE-FEMALE': 'Đệ tử nữ · chibi',
  'CHR-SITU-NAN': 'Tư Đồ Nam · chibi linh thể',
  'CHR-LI-MUWAN': 'Lý Mộ Uyển · chibi áo tím',
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
    movementKind: asset.movementKind,
  });
}
if (nativeFrameCount !== design.preview.existingNativeFrameCount) throw new Error('Tổng frame không khớp thiết kế.');
await writeFile(resolve(target, 'catalog.json'), JSON.stringify({
  actors, nativeFrameCount,
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
if (design.chibiRoster) {
  const gallerySource = resolve(root, design.chibiRoster.sourceFolder);
  const galleryTarget = resolve(target, 'chibi-roster');
  await mkdir(galleryTarget, { recursive: true });
  for (const name of ['index.html', 'gallery.js']) await copyFile(resolve(gallerySource, name), resolve(galleryTarget, name));
  const script = await readFile(resolve(gallerySource, 'gallery-data.js'), 'utf8');
  const data = JSON.parse(script.slice(script.indexOf('=') + 1).trim().replace(/;$/, ''));
  for (const actor of data.actors) {
    const definition = actors.find(a => a.id === actor.id);
    if (!definition) throw new Error(`Thiếu nhân vật trong thư viện chibi: ${actor.id}`);
    actor.atlasUrl = definition.atlasUrl;
  }
  await writeFile(resolve(galleryTarget, 'gallery-data.js'), `window.ChibiRosterGallery = ${JSON.stringify(data)};\n`, 'utf8');
}
if (design.mapAssetKit) {
  const source=resolve(root,design.mapAssetKit.sourceFolder),folder=resolve(target,'map-kit');
  const manifest=JSON.parse(await readFile(resolve(source,'manifest.json'),'utf8'));
  await mkdir(folder,{recursive:true});
  const files=new Set(['index.html','README.md','manifest.json',...manifest.assets.flatMap(a=>[a.completeFile,...a.layers.map(p=>p.file)].filter(Boolean))]);
  for(const name of files){await mkdir(dirname(resolve(folder,name)),{recursive:true});await copyFile(resolve(source,name),resolve(folder,name));}
}
console.log(`Đã chuẩn bị ${actors.length} bộ / ${nativeFrameCount} frame; thư viện map theo manifest hiện tại.`);
