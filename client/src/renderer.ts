import * as THREE from 'three';
import { WORLD, type Motion } from '../../shared/world';
import { AnimationPlayer, normalizeAtlas, type ActorDefinition, type Atlas } from './atlas';
import { imageAlpha, cropAlpha, opaqueMasksOverlap, type AlphaMask, type PlacedMask } from './occlusion';

export interface LoadedActor { definition: ActorDefinition; atlas: Atlas; texture: THREE.Texture; alpha: AlphaMask; frameMasks: Map<string,AlphaMask> }
export interface RenderActor extends Motion {
  id: string; name: string; assetId: string; own: boolean; connected?: boolean;
  animation: AnimationPlayer;
}
export interface MapLayout {
  width: number; height: number; color: string;
  ground: Array<{ x: number; y: number; w: number; h: number; color: string }>;
  obstacles: Array<{ x: number; y: number; w: number; h: number; color: string; visualHeight: number }>;
}
interface Visual {
  actor: RenderActor; sprite: THREE.Sprite; texture: THREE.Texture;
  shadow: THREE.Sprite; collider: THREE.LineLoop; anchor: THREE.LineSegments;
  label: HTMLDivElement;
}
export interface MapDepthItem {
  mesh: THREE.Mesh | THREE.Sprite; y: number;
  sortPriority?: number;
  opacityOverride?: number;
  fadeRegion?: { x: number; y: number; w: number; h: number };
  occlusionMask?: PlacedMask;
}
function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Không tạo được canvas phụ.');
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.generateMipmaps = false;
  return texture;
}
function line(points: THREE.Vector3[], color: number): THREE.LineLoop {
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 }));
}

export class PreviewRenderer {
  readonly assets = new Map<string, LoadedActor>();
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-480, 480, 320, -320, 0.1, 100);
  readonly webgl: THREE.WebGLRenderer;
  private visuals = new Map<string, Visual>();
  private mapLayout?: THREE.Group;
  private mapDepthItems: MapDepthItem[] = [];
  private background?: THREE.Mesh;
  private grid: THREE.Mesh;
  private fixture: THREE.Sprite;
  private debugGroup = new THREE.Group();
  private shadowTexture: THREE.Texture;
  private width = 960;
  private height = 640;
  private resizeObserver: ResizeObserver;
  zoom = 2;
  debug = true;
  backdrop = 'paper';
  mode: 'inspector' | 'map' | 'online' = 'inspector';
  cameraCenter = { x: 480, y: 320 };

  constructor(private stage: HTMLElement, private labels: HTMLElement) {
    this.webgl = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'high-performance' });
    this.webgl.outputColorSpace = THREE.SRGBColorSpace;
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.webgl.domElement.setAttribute('aria-hidden', 'true');
    stage.prepend(this.webgl.domElement);
    this.camera.position.z = 10;
    this.shadowTexture = canvasTexture(64, 24, ctx => {
      ctx.fillStyle = '#19392e55'; ctx.beginPath(); ctx.ellipse(32, 12, 29, 8, 0, 0, Math.PI * 2); ctx.fill();
    });
    const gridTexture = canvasTexture(256, 256, ctx => {
      ctx.fillStyle = '#f3ebdd'; ctx.fillRect(0, 0, 256, 256);
      for (let n = 0; n <= 256; n += 8) {
        ctx.strokeStyle = n % 64 === 0 ? '#c4b798' : '#e4d9c6'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(n + .5, 0); ctx.lineTo(n + .5, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, n + .5); ctx.lineTo(256, n + .5); ctx.stroke();
      }
    });
    gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(3000 / 256, 3000 / 256);
    gridTexture.magFilter = THREE.NearestFilter;
    this.grid = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshBasicMaterial({ map: gridTexture, depthTest: false, depthWrite: false }));
    this.grid.position.set(480, -320, 0); this.grid.renderOrder = -11000; this.scene.add(this.grid);
    const pillarTexture = canvasTexture(64, 96, ctx => {
      ctx.fillStyle = '#6a7565'; ctx.fillRect(14, 73, 36, 15);
      ctx.fillStyle = '#bac0a1'; ctx.fillRect(14, 69, 36, 8);
      ctx.fillStyle = '#8b957e'; ctx.fillRect(21, 38, 22, 35);
      ctx.fillStyle = '#c4c8ac'; ctx.fillRect(18, 34, 28, 10);
      ctx.fillStyle = '#666f63'; ctx.fillRect(19, 14, 26, 22);
      ctx.fillStyle = '#c4c8ac'; ctx.fillRect(16, 10, 32, 9);
      ctx.fillStyle = '#e5d7a1'; ctx.fillRect(28, 21, 8, 10);
      ctx.strokeStyle = '#536052'; ctx.lineWidth = 2; ctx.strokeRect(18, 34, 28, 10); ctx.strokeRect(14, 69, 36, 8);
    });
    this.fixture = new THREE.Sprite(new THREE.SpriteMaterial({ map: pillarTexture, depthTest: false, depthWrite: false, transparent: true }));
    this.fixture.center.set(.5, 1 - 88 / 96); this.fixture.scale.set(64, 96, 1); this.fixture.position.set(624, -351, 0); this.scene.add(this.fixture);
    const b = WORLD.bounds;
    for (const r of [b, ...WORLD.obstacles]) {
      const l = line([new THREE.Vector3(r.x, -r.y, 0), new THREE.Vector3(r.x + r.w, -r.y, 0),
        new THREE.Vector3(r.x + r.w, -r.y - r.h, 0), new THREE.Vector3(r.x, -r.y - r.h, 0)], r === b ? 0x245c53 : 0x963f33);
      l.renderOrder = 11000; this.debugGroup.add(l);
    }
    this.scene.add(this.debugGroup);
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(stage);
    this.resize();
  }

  async loadActors(definitions: ActorDefinition[], backgroundUrl?: string): Promise<void> {
    const loader = new THREE.TextureLoader();
    const errors: string[] = [];
    const results = await Promise.allSettled(definitions.map(async definition => {
      const response = await fetch(definition.metadataUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${definition.metadataUrl}: HTTP ${response.status}`);
      const atlas = normalizeAtlas(await response.json(), definition.previewOnlyDirection ? [definition.previewOnlyDirection] : undefined);
      if (atlas.actorId !== definition.id || Object.keys(atlas.frames).length !== definition.frameCount) throw new Error(`${definition.name}: ID/số frame khác catalog.`);
      const texture = await loader.loadAsync(definition.atlasUrl);
      if (texture.image.width !== atlas.width || texture.image.height !== atlas.height) {
        texture.dispose(); throw new Error(`${definition.name}: PNG khác kích thước JSON.`);
      }
      texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      this.assets.set(definition.id, { definition, atlas, texture, alpha:imageAlpha(texture.image), frameMasks:new Map() });
    }));
    results.forEach((result, i) => { if (result.status === 'rejected') errors.push(`${definitions[i].name}: ${String(result.reason)}`); });
    if (backgroundUrl) {
      const backgroundTexture = await loader.loadAsync(backgroundUrl);
      backgroundTexture.colorSpace = THREE.SRGBColorSpace;
      this.background = new THREE.Mesh(new THREE.PlaneGeometry(WORLD.width, WORLD.height),
        new THREE.MeshBasicMaterial({ map: backgroundTexture, depthTest: false, depthWrite: false }));
      this.background.position.set(480, -320, 0); this.background.renderOrder = -10000; this.scene.add(this.background);
    }
    if (errors.length) throw new Error(errors.join('\n'));
  }

  setMapLayout(layout: MapLayout): void {
    if (this.mapLayout) {
      this.scene.remove(this.mapLayout);
      this.mapLayout.traverse(object => {
        if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); }
      });
    }
    this.mapLayout = new THREE.Group(); this.mapDepthItems = [];
    const rectangle = (r: { x: number; y: number; w: number; h: number }, color: string, order: number) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h),
        new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, toneMapped: false }));
      mesh.position.set(r.x + r.w / 2, -r.y - r.h / 2, 0); mesh.renderOrder = order;
      this.mapLayout!.add(mesh); return mesh;
    };
    rectangle({ x: 0, y: 0, w: layout.width, h: layout.height }, layout.color, -12000);
    layout.ground.forEach(r => rectangle(r, r.color, -10000));
    for (const r of layout.obstacles) {
      const body = rectangle(r, r.color, -9500);
      body.userData.mapObstacle = true;
      const roof = rectangle({ x: r.x - 8, y: r.y - r.visualHeight, w: r.w + 16, h: r.visualHeight + 16 }, r.color, 0);
      this.mapDepthItems.push({ mesh: roof, y: r.y + r.h });
    }
    this.scene.add(this.mapLayout);
  }

  setMapDepthItems(items: MapDepthItem[]): void { this.mapDepthItems = items; }

  private resize(): void {
    this.width = Math.max(1, this.stage.clientWidth); this.height = Math.max(1, this.stage.clientHeight);
    this.webgl.setSize(this.width, this.height, false);
    this.updateCamera();
  }
  private updateCamera(): void {
    this.camera.left = -this.width / (2 * this.zoom); this.camera.right = this.width / (2 * this.zoom);
    this.camera.top = this.height / (2 * this.zoom); this.camera.bottom = -this.height / (2 * this.zoom);
    // Smooth the painted background; snap sprites in screen space separately.
    this.camera.position.x = this.cameraCenter.x; this.camera.position.y = -this.cameraCenter.y;
    this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
  }

  render(actors: RenderActor[]): void {
    this.updateCamera();
    const isMap = this.mode !== 'inspector';
    if (this.background) this.background.visible = isMap && !this.mapLayout;
    this.fixture.visible = isMap && !this.mapLayout;
    this.debugGroup.visible = isMap && this.debug && !this.mapLayout;
    this.grid.visible = !isMap && this.backdrop === 'grid';
    this.scene.background = new THREE.Color(this.backdrop === 'dark' ? '#1c2425' : '#efe6d3');
    const wanted = new Set(actors.map(a => a.id));
    for (const [id, visual] of this.visuals) if (!wanted.has(id)) { this.remove(visual); this.visuals.delete(id); }
    const sorted = [...actors].sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
    const depthItems = sorted.map(a => ({ id: a.id, y: a.y, priority:10 }));
    if (isMap && !this.mapLayout) depthItems.push({ id: '__pillar', y: 351,priority:0 });
    this.mapDepthItems.forEach((item, i) => depthItems.push({ id: `__map-${i}`, y: item.y,priority:item.sortPriority??0 }));
    depthItems.sort((a, b) => a.y - b.y || a.priority-b.priority || a.id.localeCompare(b.id));
    const orders = new Map(depthItems.map((a, i) => [a.id, i]));
    this.fixture.renderOrder = orders.get('__pillar') ?? 0;
    const ownActor = actors.find(a => a.own);
    let ownMask:PlacedMask|undefined;
    if(ownActor){
      const asset=this.assets.get(ownActor.assetId)!;
      let mask=asset.frameMasks.get(ownActor.animation.frameId);
      if(!mask){mask=cropAlpha(asset.alpha,asset.atlas.frames[ownActor.animation.frameId]);asset.frameMasks.set(ownActor.animation.frameId,mask);}
      ownMask={mask,left:ownActor.x-asset.atlas.anchor[0],top:ownActor.y-asset.atlas.anchor[1]};
    }
    this.mapDepthItems.forEach((item, i) => {
      item.mesh.renderOrder = orders.get(`__map-${i}`) ?? 0;
      const r = item.fadeRegion;
      const overlaps = ownActor && ownActor.y < item.y && (item.occlusionMask&&ownMask ? opaqueMasksOverlap(item.occlusionMask,ownMask) :
        r && ownActor.x > r.x - 24 && ownActor.x < r.x + r.w + 24 && ownActor.y > r.y && ownActor.y - 80 < r.y + r.h);
      const material = item.mesh.material as THREE.MeshBasicMaterial | THREE.SpriteMaterial;
      material.opacity = item.opacityOverride ?? (overlaps ? .35 : 1);
    });
    for (const actor of sorted) {
      const asset = this.assets.get(actor.assetId); if (!asset) continue;
      let visual = this.visuals.get(actor.id);
      if (visual && visual.actor.assetId !== actor.assetId) { this.remove(visual); this.visuals.delete(actor.id); visual = undefined; }
      if (!visual) { visual = this.createVisual(actor, asset); this.visuals.set(actor.id, visual); }
      visual.actor = actor;
      const frame = asset.atlas.frames[actor.animation.frameId];
      visual.texture.repeat.set(frame.w / asset.atlas.width, frame.h / asset.atlas.height);
      visual.texture.offset.set(frame.x / asset.atlas.width, 1 - (frame.y + frame.h) / asset.atlas.height);
      const screenX = (actor.x - this.cameraCenter.x) * this.zoom + this.width / 2;
      const screenY = (actor.y - this.cameraCenter.y) * this.zoom + this.height / 2;
      const renderedX = this.cameraCenter.x + (Math.round(screenX) - this.width / 2) / this.zoom;
      const renderedY = this.cameraCenter.y + (Math.round(screenY) - this.height / 2) / this.zoom;
      visual.sprite.position.set(renderedX, -renderedY, 0);
      visual.sprite.renderOrder = orders.get(actor.id) ?? 0;
      visual.sprite.material.opacity = actor.connected === false ? .5 : 1;
      visual.shadow.position.set(actor.x, -actor.y, 0); visual.shadow.visible = isMap;
      visual.collider.position.set(actor.x, -actor.y, 0); visual.collider.visible = this.debug && isMap;
      visual.anchor.position.set(renderedX, -renderedY, 0); visual.anchor.visible = this.debug;
      visual.label.textContent = `${actor.name}${actor.own && this.mode === 'online' ? ' · bạn' : ''}`;
      visual.label.className = `world-label${actor.own ? ' own' : ''}${actor.connected === false ? ' offline' : ''}`;
      visual.label.hidden = !isMap;
      const projected = new THREE.Vector3(renderedX, -renderedY + asset.atlas.anchor[1] + 8, 0).project(this.camera);
      visual.label.style.left = `${Math.round((projected.x + 1) * this.width / 2)}px`;
      visual.label.style.top = `${Math.round((1 - projected.y) * this.height / 2)}px`;
    }
    this.webgl.render(this.scene, this.camera);
  }

  private createVisual(actor: RenderActor, asset: LoadedActor): Visual {
    const texture = asset.texture.clone();
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
    const sprite = new THREE.Sprite(material);
    sprite.userData.entityId = actor.id;
    sprite.scale.set(...asset.atlas.frameSize, 1);
    sprite.center.set(asset.atlas.anchor[0] / asset.atlas.frameSize[0], 1 - asset.atlas.anchor[1] / asset.atlas.frameSize[1]);
    const shadow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.shadowTexture, transparent: true, depthTest: false, depthWrite: false }));
    shadow.scale.set(28, 10, 1); shadow.renderOrder = -1000;
    const collider = line(Array.from({ length: 32 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 16) * WORLD.radius, Math.sin(i * Math.PI / 16) * WORLD.radius, 0)), 0x1c6f5c);
    collider.renderOrder = 12000;
    const anchor = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0), new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0),
    ]), new THREE.LineBasicMaterial({ color: 0xb6533c, depthTest: false, transparent: true })); anchor.renderOrder = 12001;
    const label = document.createElement('div'); label.className = 'world-label'; this.labels.append(label);
    this.scene.add(sprite, shadow, collider, anchor);
    return { actor, sprite, texture, shadow, collider, anchor, label };
  }

  private remove(v: Visual): void {
    this.scene.remove(v.sprite, v.shadow, v.collider, v.anchor); v.label.remove();
    v.sprite.material.dispose(); v.texture.dispose(); v.shadow.material.dispose();
    v.collider.geometry.dispose(); (v.collider.material as THREE.Material).dispose();
    v.anchor.geometry.dispose(); (v.anchor.material as THREE.Material).dispose();
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    for (const v of this.visuals.values()) this.remove(v);
    this.scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      for (const material of materials) { (material as THREE.MeshBasicMaterial).map?.dispose(); material.dispose(); }
    });
    for (const asset of this.assets.values()) asset.texture.dispose();
    this.shadowTexture.dispose(); this.webgl.dispose();
  }
}
