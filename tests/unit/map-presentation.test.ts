import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { authoredMapParts, type AuthoredMapScene } from '../../shared/map-presentation';
import { HANG_NHAC } from '../../shared/hang-nhac';

function fixture(): AuthoredMapScene {
  return {
    background: '#e4ddc9', world: { width: 300, height: 300 },
    layers: [{ id: 'depth', kind: 'depth', enabled: true }, { id: 'cover', kind: 'cover', enabled: true }],
    assets: [{ id: 'tree', width: 40, height: 30, pivot: { x: 10, y: 18 }, parts: [
      { id: 'body', file: '/assets/body.png', cover: false },
      { id: 'canopy', file: '/assets/canopy.png', cover: true },
    ] }],
    objects: [{ id: 'tree-instance', name: 'Tree', assetId: 'tree', layerId: 'depth', coverLayerId: 'cover',
      x: 100, y: 120, scale: 2, flipX: false, opacity: .8, locked: true }],
  };
}

test('multipart runtime keeps native canvas, common pivot, scale and instance opacity', () => {
  const parts = authoredMapParts(fixture());
  assert.equal(parts.length, 2);
  for (const part of parts) {
    assert.deepEqual([part.left, part.top, part.width, part.height], [80, 84, 80, 60]);
    assert.deepEqual([part.nativeWidth, part.nativeHeight, part.scale, part.footY, part.opacity], [40, 30, 2, 120, .8]);
  }
  assert.equal(parts[0].cover, false); assert.equal(parts[1].cover, true);
});

test('mirroring uses the reflected foot pivot rather than moving the full canvas arbitrarily', () => {
  const scene = fixture(); scene.objects[0].flipX = true;
  for (const part of authoredMapParts(scene)) {
    assert.equal(part.left, 40); assert.equal(part.top, 84); assert.equal(part.flipX, true);
  }
});

test('runtime activity excludes a disabled base and its cover, but a disabled cover does not remove the body', () => {
  const scene = fixture(); scene.layers[1].enabled = false;
  assert.deepEqual(authoredMapParts(scene).map(part => part.partId), ['body']);
  scene.layers[1].enabled = true; scene.layers[0].enabled = false;
  assert.deepEqual(authoredMapParts(scene), []);
});

test('ground and decor are fixed bands; depth parts are sorted by feet then body/cover', () => {
  const scene = fixture();
  scene.layers = [...scene.layers, { id: 'ground', kind: 'ground', enabled: true }, { id: 'decor', kind: 'decor', enabled: true }];
  scene.objects = [scene.objects[0], { ...scene.objects[0], id: 'ground-instance', layerId: 'ground', y: 280 },
    { ...scene.objects[0], id: 'decor-instance', layerId: 'decor', y: 250 }];
  const parts = authoredMapParts(scene);
  assert.equal(parts[0].band, 'ground'); assert.equal(parts[1].band, 'decor');
  const depth = parts.filter(part => part.band === 'depth');
  assert.ok(depth.every((part, index) => index === 0 || part.footY >= depth[index - 1].footY));
});

test('approved layered release has 22 objects, 32 independent parts, 10 covers and exact packaged image hashes', () => {
  const scene = HANG_NHAC.scene, parts = authoredMapParts(scene);
  assert.equal(scene.objects.length, 22); assert.equal(parts.length, 32);
  assert.equal(parts.filter(part => part.band === 'ground').length, 6);
  assert.equal(parts.filter(part => part.cover).length, 10);
  const images = new Map(scene.images.map(image => [image.url, image]));
  for (const part of parts) {
    assert.ok(!part.file.startsWith('data:'));
    const image = images.get(part.file)!; assert.ok(image);
    const bytes = readFileSync(`client/public${part.file}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.equal(bytes.length, image.bytes);
  }
  const packageData = JSON.parse(readFileSync('docs/design/world/hang-nhac-layered-v1/package.json', 'utf8'));
  assert.equal(scene.sourceProjectSha256, packageData.sourceProjectSha256);
  assert.equal(scene.sourceReviewSha256, packageData.sourceReviewSha256);
  assert.ok(packageData.images.every((image: { pixelsPreserved: boolean }) => image.pixelsPreserved));
  for (const asset of scene.assets.filter(asset => asset.parts.length > 1)) {
    const instance = scene.objects.find(object => object.assetId === asset.id)!;
    const ownParts = parts.filter(part => part.objectId === instance.id);
    assert.equal(new Set(ownParts.map(part => `${part.left},${part.top},${part.width},${part.height},${part.footY}`)).size, 1);
  }
});
