import type { AppState } from '../../core/state';
import { DIRECTIONS, type Direction, type Input } from '@shared/world/types';

// Pure rules for preview actors: no DOM access, so they can be unit tested.
export function directionsForActor(app: AppState, assetId = app.selectedId): readonly Direction[] {
  const direction = app.renderer?.assets.get(assetId)?.definition.previewOnlyDirection;
  return direction ? [direction] : DIRECTIONS;
}

// Drops the input axes that an actor has no animation for (for example the one-direction pilot).
export function inputForActor(app: AppState, input: Input, assetId: string): Input {
  const directions = directionsForActor(app, assetId);
  return {
    x: input.x > 0 ? (directions.includes('east') ? input.x : 0) : (directions.includes('west') ? input.x : 0),
    y: input.y > 0 ? (directions.includes('south') ? input.y : 0) : (directions.includes('north') ? input.y : 0),
  };
}
