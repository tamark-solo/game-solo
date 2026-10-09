import type { Sprite } from 'three';
import type { AppState } from '../core/state';
import { directionsForActor } from '../features/preview/model';

// Test hooks used by the smoke tests. Installed only in development builds.
export function installDebugHooks(app: AppState): void {
  Object.assign(window, {
    // 4010 is Colyseus MAY_TRY_RECONNECT, also used by the SDK on browser offline.
    __previewDropConnection: () => app.network.room?.connection.close(4010),
    __previewDiagnostics: () => ({
      mode: app.mode, loadedAssets: app.renderer!.assets.size, selectedActorId: app.selectedId, availableDirections: directionsForActor(app),
      sessionId: app.network.room?.sessionId, connectionStatus: app.network.status,
      nativeFrames: [...app.renderer!.assets.values()].reduce((n, a) => n + Object.keys(a.atlas.frames).length, 0),
      camera: { x: app.renderer!.camera.position.x, y: -app.renderer!.camera.position.y, zoom: app.renderer!.zoom },
      serverActors: [...app.network.players.values()],
      actors: [...(app.mode === 'online' ? app.onlineActors.values() : app.localActors)].map(a => ({ id: a.id, x: a.x, y: a.y, moving: a.moving, direction: a.direction, frame: a.animation.frameId })),
      sprites: app.renderer!.scene.children.filter(o => o.type === 'Sprite' && o.userData.entityId).map(o => ({ id: o.userData.entityId, center: (o as Sprite).center.toArray(), order: o.renderOrder,
        offset: (o as Sprite).material.map?.offset.toArray(), position: o.position.toArray() })),
    }),
  });
}
