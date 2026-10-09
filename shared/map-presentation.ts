import type { EditorAsset, EditorObject } from './map-editor';

export interface AuthoredMapScene {
  background: string;
  world: { width: number; height: number };
  layers: ReadonlyArray<{ id: string; kind: string; enabled: boolean }>;
  assets: ReadonlyArray<Pick<EditorAsset, 'id' | 'width' | 'height' | 'pivot' | 'parts'>>;
  objects: readonly EditorObject[];
}

export interface AuthoredMapPart {
  objectId: string;
  assetId: string;
  partId: string;
  file: string;
  nativeWidth: number;
  nativeHeight: number;
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  flipX: boolean;
  opacity: number;
  footY: number;
  band: 'ground' | 'decor' | 'depth';
  cover: boolean;
  layerOrder: number;
  objectOrder: number;
}

// The same native canvas/pivot and active-layer semantics as Editor Test.
// Visibility and locking are authoring concerns, not runtime activity switches.
export function authoredMapParts(scene: AuthoredMapScene): AuthoredMapPart[] {
  const assets = new Map(scene.assets.map(asset => [asset.id, asset]));
  const layers = new Map(scene.layers.map((layer, index) => [layer.id, { ...layer, index }]));
  const parts: AuthoredMapPart[] = [];
  scene.objects.forEach((object, objectOrder) => {
    const base = layers.get(object.layerId);
    if (!base?.enabled) return;
    const asset = assets.get(object.assetId);
    if (!asset) throw new Error(`Map: thiếu asset ${object.assetId}.`);
    const pivot = object.pivot ?? asset.pivot;
    for (const part of asset.parts) {
      const layer = layers.get(part.cover ? object.coverLayerId : object.layerId);
      if (!layer?.enabled) continue;
      parts.push({
        objectId: object.id, assetId: asset.id, partId: part.id, file: part.file,
        nativeWidth: asset.width, nativeHeight: asset.height,
        left: object.x - (object.flipX ? asset.width - pivot.x : pivot.x) * object.scale,
        top: object.y - pivot.y * object.scale,
        width: asset.width * object.scale, height: asset.height * object.scale,
        scale: object.scale, flipX: object.flipX, opacity: object.opacity, footY: object.y,
        band: layer.kind === 'ground' ? 'ground' : layer.kind === 'decor' ? 'decor' : 'depth',
        cover: part.cover || layer.kind === 'cover', layerOrder: layer.index, objectOrder,
      });
    }
  });
  const band = { ground: 0, decor: 1, depth: 2 };
  return parts.sort((a, b) => band[a.band] - band[b.band] ||
    (a.band === 'depth' ? a.footY - b.footY || Number(a.cover) - Number(b.cover) : a.layerOrder - b.layerOrder) ||
    a.objectOrder - b.objectOrder);
}
