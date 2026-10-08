import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { AnimationPlayer, normalizeAtlas } from '../client/src/atlas';

const design = JSON.parse(readFileSync('docs/data/client-tech-preview-design.json', 'utf8'));
test('the source atlases match the content catalog and retain their anchors', () => {
  let count = 0;
  for (const asset of design.preview.assets) {
    const atlas = normalizeAtlas(JSON.parse(readFileSync(asset.metadataPath, 'utf8')), asset.previewOnlyDirection ? [asset.previewOnlyDirection] : undefined);
    assert.equal(atlas.actorId, asset.characterId); assert.deepEqual(atlas.anchor, [32, 88]);
    assert.equal(Object.keys(atlas.frames).length, asset.frameCount);
    assert.equal(atlas.canWalk, asset.availablePreviewStates.includes('walk'));
    count += Object.keys(atlas.frames).length;
  }
  assert.equal(count, design.preview.existingNativeFrameCount);
});
test('the preserved legacy static spirit does not invent movement frames', () => {
  const raw = JSON.parse(readFileSync('docs/design/characters/core-trio-v1/situ-nan/native-v4/atlas.json', 'utf8'));
  const animation = new AnimationPlayer(normalizeAtlas(raw));
  animation.set('walk', 'north'); animation.update(10);
  assert.equal(animation.state, 'stand'); assert.equal(animation.ids.length, 1);
  assert.equal(animation.atlas.hoverHeight, 4); assert.ok(animation.frameId.endsWith('north'));
});

test('the four new chibi sets have complete movement clips and keep the spirit glide explicit', () => {
  const models = JSON.parse(readFileSync(design.chibiRoster.modelManifestPath, 'utf8'));
  assert.equal(createHash('sha256').update(readFileSync(models.referenceAtlasPath)).digest('hex'), models.referenceAtlasSHA256);
  let total = 0;
  for (const model of models.models) {
    const asset = design.preview.assets.find((a: any) => a.characterId === model.characterId);
    const raw = JSON.parse(readFileSync(asset.metadataPath, 'utf8'));
    const atlas = normalizeAtlas(raw);
    assert.equal(asset.movementKind, model.movementKind);
    assert.equal(atlas.hoverHeight, model.hoverHeightPx);
    assert.equal(Object.keys(atlas.frames).length, 20);
    assert.deepEqual(atlas.anchor, [32, 88]);
    for (const direction of ['south', 'west', 'east', 'north'] as const) {
      assert.equal(atlas.animations[`stand_${direction}`].length, 1);
      assert.equal(atlas.animations[`walk_${direction}`].length, 4);
      const animation = new AnimationPlayer(atlas);
      animation.updateFromTravel(6, direction, true, 24);
      assert.ok(animation.frameId.includes(`walk_${direction}_`));
      animation.updateFromTravel(0, direction, false, 24);
      assert.ok(animation.frameId.endsWith(`stand_${direction}`));
    }
    total += Object.keys(atlas.frames).length;
  }
  assert.equal(total, 80);
  assert.equal(design.preview.assets.find((a: any) => a.characterId === 'CHR-SITU-NAN').movementKind, 'glide');
});
test('atlas loader rejects bad rectangles and absent frame references', () => {
  const raw = JSON.parse(readFileSync(design.preview.assets[0].metadataPath, 'utf8'));
  const outside = structuredClone(raw); Object.values<any>(outside.frames)[0].frame.x = 99999;
  assert.throws(() => normalizeAtlas(outside), /rectangle/);
  const missing = structuredClone(raw); missing.animations.walk_south = ['absent'];
  assert.throws(() => normalizeAtlas(missing), /thiếu frame/);
});
test('walk loops and manual backward stepping wrap safely for the source frame count', () => {
  const raw = JSON.parse(readFileSync(design.preview.assets[0].metadataPath, 'utf8'));
  const animation = new AnimationPlayer(normalizeAtlas(raw)); animation.set('walk', 'south');
  animation.update(.125); assert.equal(animation.frameIndex, 1);
  animation.update((animation.ids.length - 1) / animation.fps); assert.equal(animation.frameIndex, 0);
  animation.step(-1); assert.equal(animation.frameIndex, animation.ids.length - 1);
  animation.set('walk', 'north'); assert.equal(animation.frameIndex, 0);
});

test('map walk phase follows distance, retains phase on turns and does not advance while blocked', () => {
  const raw = JSON.parse(readFileSync(design.preview.assets[0].metadataPath, 'utf8'));
  const animation = new AnimationPlayer(normalizeAtlas(raw));
  const frameDistance = 48 / animation.atlas.animations.walk_south.length;
  animation.updateFromTravel(frameDistance, 'south', true, 48); assert.equal(animation.frameIndex, 1);
  animation.updateFromTravel(0, 'east', true, 48); assert.equal(animation.frameIndex, 1);
  animation.updateFromTravel(0, 'east', false, 48); assert.equal(animation.state, 'stand');
  animation.updateFromTravel(0, 'east', true, 48); assert.equal(animation.frameIndex, 1);
  animation.updateFromTravel(48 - frameDistance, 'east', true, 48); assert.equal(animation.frameIndex, 0);
});

test('equal travel gives equal gait phase at different movement speeds', () => {
  const raw = JSON.parse(readFileSync(design.preview.assets[0].metadataPath, 'utf8'));
  const slow = new AnimationPlayer(normalizeAtlas(raw)), fast = new AnimationPlayer(normalizeAtlas(raw));
  for (let i = 0; i < 20; i++) slow.updateFromTravel(1.2, 'east', true, 48);
  for (let i = 0; i < 10; i++) fast.updateFromTravel(2.4, 'east', true, 48);
  assert.equal(slow.frameId, fast.frameId);
});

test('a one-direction art pilot requires explicit opt-in and is rejected by the full actor loader', () => {
  const raw = JSON.parse(readFileSync('docs/design/characters/wang-lin-chibi-pilot-v1/native-v1/atlas.json', 'utf8'));
  assert.throws(() => normalizeAtlas(raw), /Thiếu hướng đứng/);
  const atlas = normalizeAtlas(raw, ['east']);
  assert.equal(Object.keys(atlas.frames).length, 5);
  assert.equal(atlas.animations.walk_east.length, 4);
  assert.equal(atlas.animations.stand_east.length, 1);
  assert.equal(atlas.animations.walk_north, undefined);
});

test('the default chibi fixes only the last east pose and retains the other 19 frames', () => {
  assert.equal(design.preview.defaultActorId, 'CHR-WANG-LIN-CHIBI');
  const asset = design.preview.assets.find((a: any) => a.characterId === design.preview.defaultActorId);
  assert.equal(asset.previewOnlyDirection, undefined);
  const raw = JSON.parse(readFileSync(asset.metadataPath, 'utf8'));
  const atlas = normalizeAtlas(raw);
  const east = JSON.parse(readFileSync('docs/design/characters/wang-lin-chibi-pilot-v1/native-v1/atlas.json', 'utf8'));
  assert.deepEqual(raw.palette, east.palette);
  const player = new AnimationPlayer(atlas);
  for (const direction of ['south', 'west', 'east', 'north'] as const) {
    assert.equal(atlas.animations[`stand_${direction}`].length, 1);
    assert.equal(atlas.animations[`walk_${direction}`].length, 4);
    player.updateFromTravel(6, direction, true, 24);
    assert.ok(player.frameId.includes(`walk_${direction}_`));
    player.updateFromTravel(0, direction, false, 24);
    assert.equal(player.frameId, `wanglin_chibi_stand_${direction}`);
  }
  const baselinePath = 'docs/design/characters/wang-lin-chibi-walk-v1/native-v1';
  const baseline = JSON.parse(readFileSync(`${baselinePath}/atlas.json`, 'utf8'));
  const changed = 'wanglin_chibi_walk_east_03';
  assert.deepEqual(raw.changedFrameIds, [changed]);
  assert.deepEqual(raw.animations, baseline.animations);
  assert.deepEqual(raw.meta.size, baseline.meta.size);
  for (const [id, value] of Object.entries<any>(baseline.frames)) {
    assert.deepEqual(raw.frames[id].frame, value.frame);
    if (id === changed) assert.notEqual(raw.frames[id].pixelHash, value.pixelHash);
    else assert.equal(raw.frames[id].pixelHash, value.pixelHash);
  }
  for (const [id, value] of Object.entries<any>(east.frames)) {
    if (id !== changed) assert.equal(raw.frames[id].pixelHash, value.pixelHash);
  }
});
