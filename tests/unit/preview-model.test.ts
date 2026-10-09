import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AppState } from '../../client/src/core/state';
import { directionsForActor, inputForActor } from '../../client/src/features/preview/model';

// The preview rules only read the asset table, so a minimal fake state is enough.
function appWith(definitions: Record<string, { previewOnlyDirection?: 'east' }>): AppState {
  const assets = new Map(Object.entries(definitions).map(([id, definition]) => [id, { definition }]));
  return { renderer: { assets }, selectedId: Object.keys(definitions)[0] } as unknown as AppState;
}

test('a four-direction actor keeps every input axis', () => {
  const app = appWith({ FULL: {} });
  assert.deepEqual(directionsForActor(app), ['south', 'west', 'east', 'north']);
  assert.deepEqual(inputForActor(app, { x: -1, y: 1 }, 'FULL'), { x: -1, y: 1 });
});

test('an east-only pilot drops west and vertical input', () => {
  const app = appWith({ PILOT: { previewOnlyDirection: 'east' } });
  assert.deepEqual(directionsForActor(app), ['east']);
  assert.deepEqual(inputForActor(app, { x: -1, y: 1 }, 'PILOT'), { x: 0, y: 0 });
  assert.deepEqual(inputForActor(app, { x: 1, y: -1 }, 'PILOT'), { x: 1, y: 0 });
});
