import type { NetworkSession } from '../net/session';
import type { PreviewRenderer, RenderActor } from '../render/renderer';
import type { Direction, MotionState } from '@shared/world/types';

export type Mode = 'inspector' | 'map' | 'online';

// Shared state of the main page. Features read and write this object directly.
export interface AppState {
  mode: Mode;
  paused: boolean;
  desiredState: MotionState;
  selectedDirection: Direction;
  selectedId: string;
  localActor?: RenderActor;
  localActors: RenderActor[];
  onlineActors: Map<string, RenderActor>;
  elapsed: number;
  lastTime: number;
  hudTime: number;
  fpsTime: number;
  renderedFrames: number;
  renderFPS: number;
  renderer?: PreviewRenderer;
  readonly network: NetworkSession;
  readonly secondPlayer: boolean;
}

export function createAppState(network: NetworkSession, secondPlayer: boolean): AppState {
  const now = performance.now();
  return {
    mode: 'inspector', paused: false, desiredState: 'walk', selectedDirection: 'south',
    selectedId: 'CHR-WANG-LIN-CHIBI', localActors: [], onlineActors: new Map(),
    elapsed: 0, lastTime: now, hudTime: 0, fpsTime: now, renderedFrames: 0, renderFPS: 0,
    network, secondPlayer,
  };
}
