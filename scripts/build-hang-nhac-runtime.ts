import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProject, runtimeLevel } from '../shared/map-editor';
import { auditProject, objectBounds } from '../shared/level-design';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function publishJson(path: string, contents: string): Promise<void> {
  try { if (await readFile(path, 'utf8') === contents) return; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, contents);
  await rename(temporary, path);
}
const folder = resolve(root, 'docs/design/world/hang-nhac-map-v1');
const metadata = JSON.parse(await readFile(resolve(folder, 'map.json'), 'utf8'));
const source = await readFile(resolve(folder, metadata.authoredProjectPath));
const project = parseProject(JSON.parse(source.toString('utf8')));
assert.deepEqual(auditProject(project), [], 'Owner project must pass the saved level audit.');
const level = project.levels.find(l => l.id === project.activeLevelId)!;
const { assets, objects, ...navigation } = runtimeLevel(project, level);
assert.deepEqual(navigation, JSON.parse(await readFile(resolve(folder, metadata.ownerNavigationPath), 'utf8')),
  'Navigation differs from the approved export. Save/review the owner handoff before releasing.');
assert.equal(objects.length, 1, 'This release supports the approved baked background.');
const object = objects[0], asset = assets.find(a => a.id === object.assetId)!;
const bounds = objectBounds(object, asset);
assert.deepEqual(bounds, { left: 0, top: 0, w: level.width, h: level.height });
assert.ok(!object.flipX && object.opacity === 1 && asset.parts.length === 1 && !asset.parts[0].cover);
assert.ok(level.layers.some(l => l.id === object.layerId && l.enabled && l.visible && l.kind === 'ground'));
const bytes = await readFile(resolve(folder, metadata.imagePath));
const hash = (data: Uint8Array | string) => createHash('sha256').update(data).digest('hex');
const backgroundHash = hash(bytes);
assert.equal(backgroundHash, metadata.sha256);
assert.equal(hash(Buffer.from(asset.parts[0].file.split(',')[1], 'base64')), backgroundHash,
  'The released WebP must match the image saved by the owner.');
// Approved multipart review is packaged independently of the owner's authoring file.
// Ordinary assets/build never reads another worktree or rewrites authored-maps.
const layeredFolder = resolve(root, 'docs/design/world/hang-nhac-layered-v1');
const packageData = JSON.parse(await readFile(resolve(layeredFolder, 'package.json'), 'utf8')) as {
  ownerProjectSha256: string; projectSha256: string; sourceProjectSha256: string; sourceReviewSha256: string;
  images: Array<{ file: string; url: string; sha256: string; bytes: number }>;
  preview: { file: string; url: string; sha256: string; bytes: number };
};
assert.equal(hash(source), packageData.ownerProjectSha256, 'Owner navigation has changed; review the layered handoff before releasing.');
const layeredBytes = await readFile(resolve(layeredFolder, 'project.json'));
assert.equal(hash(layeredBytes), packageData.projectSha256, 'Packaged project hash mismatch.');
const layeredProject = parseProject(JSON.parse(layeredBytes.toString('utf8')));
assert.deepEqual(auditProject(layeredProject), [], 'Layered project must pass the level audit.');
const layeredLevel = layeredProject.levels.find(l => l.id === layeredProject.activeLevelId)!;
const layered = runtimeLevel(layeredProject, layeredLevel);
for (const key of ['world', 'character', 'walkPolicy', 'walkable', 'blockers', 'portals'] as const)
  assert.deepEqual(layered[key], navigation[key], `Layered ${key} differs from approved navigation.`);
const imageUrls = new Set(packageData.images.map(image => image.url));
for (const asset of layered.assets) for (const part of asset.parts)
  assert.ok(imageUrls.has(part.file), `Unpackaged map part: ${part.file}`);
const payload = {
  schema: 'game-solo-hang-nhac-runtime-1', id: 'hang-nhac', name: 'Hằng Nhạc', projectId: project.id, levelId: level.id,
  sourceSha256: hash(source),
  background: { url: packageData.preview.url, sha256: packageData.preview.sha256, bytes: packageData.preview.bytes },
  world: navigation.world, character: navigation.character, movementSpeed: 80,
  walkPolicy: navigation.walkPolicy, walkable: navigation.walkable, blockers: navigation.blockers, portals: navigation.portals,
  scene: {
    projectId: layeredProject.id, levelId: layeredLevel.id, background: layeredLevel.background,
    sourceProjectSha256: packageData.sourceProjectSha256, sourceReviewSha256: packageData.sourceReviewSha256,
    world: layered.world, layers: layered.layers, assets: layered.assets, objects: layered.objects,
    images: packageData.images.map(({ url, sha256, bytes }) => ({ url, sha256, bytes })),
  },
};
const release = { ...payload, version: hash(JSON.stringify(payload)) };
await mkdir(resolve(root, 'shared/data'), { recursive: true });
await mkdir(resolve(root, 'client/public/assets/hang-nhac/layers'), { recursive: true });
// Validate every source before publishing a manifest pointing to it.
for (const image of [...packageData.images, packageData.preview]) {
  assert.ok(/^\/assets\/hang-nhac\/(?:layers\/part-[a-f0-9]{20}\.(?:png|webp)|overview-[a-f0-9]{20}\.webp)$/.test(image.url));
  assert.ok(/^(?:images\/part-[a-f0-9]{20}\.(?:png|webp)|overview\.webp)$/.test(image.file));
  const sourcePath = resolve(layeredFolder, image.file), imageBytes = await readFile(sourcePath);
  assert.equal(hash(imageBytes), image.sha256, `Map image hash mismatch: ${image.file}`);
  assert.equal(imageBytes.length, image.bytes);
  await copyFile(sourcePath, resolve(root, `client/public${image.url}`));
}
const json = JSON.stringify(release, null, 2) + '\n';
await publishJson(resolve(root, 'shared/data/hang-nhac.json'), json);
await publishJson(resolve(root, 'client/public/assets/hang-nhac/manifest.json'), json);
console.log(`Hằng Nhạc: ${release.world.width} × ${release.world.height}, ${release.blockers.length} blockers, ${layered.objects.length} objects / ${packageData.images.length} parts, ${release.version.slice(0, 12)}.`);
