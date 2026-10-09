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
const backgroundUrl = `/assets/hang-nhac/map-${backgroundHash.slice(0, 16)}.webp`;
const payload = {
  schema: 'game-solo-hang-nhac-runtime-1', id: 'hang-nhac', name: 'Hằng Nhạc', projectId: project.id, levelId: level.id,
  sourceSha256: hash(source), background: { url: backgroundUrl, sha256: backgroundHash, bytes: bytes.length },
  world: navigation.world, character: navigation.character, movementSpeed: 80,
  walkPolicy: navigation.walkPolicy, walkable: navigation.walkable, blockers: navigation.blockers, portals: navigation.portals,
};
const release = { ...payload, version: hash(JSON.stringify(payload)) };
await mkdir(resolve(root, 'shared/data'), { recursive: true });
await mkdir(resolve(root, 'client/public/assets/hang-nhac'), { recursive: true });
const json = JSON.stringify(release, null, 2) + '\n';
await publishJson(resolve(root, 'shared/data/hang-nhac.json'), json);
await copyFile(resolve(folder, metadata.imagePath), resolve(root, `client/public${backgroundUrl}`));
await publishJson(resolve(root, 'client/public/assets/hang-nhac/manifest.json'), json);
console.log(`Hằng Nhạc: ${release.world.width} × ${release.world.height}, ${release.blockers.length} blockers, WebP ${bytes.length} bytes, ${release.version.slice(0, 12)}.`);
