import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
test('static spirit keeps its 4 px air gap without inventing walk frames', () => {
  const raw = JSON.parse(readFileSync(design.preview.assets[3].metadataPath, 'utf8'));
  const animation = new AnimationPlayer(normalizeAtlas(raw));
  animation.set('walk', 'north'); animation.update(10);
  assert.equal(animation.state, 'stand'); assert.equal(animation.ids.length, 1);
  assert.equal(animation.atlas.hoverHeight, 4); assert.ok(animation.frameId.endsWith('north'));
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
