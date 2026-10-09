import './hang-nhac.css';
import { AnimationPlayer } from './assets/animation';
import { type ActorDefinition } from './assets/atlas';
import { PreviewRenderer, type RenderActor } from './render/renderer';
import { NetworkSession } from './net/session';
import { INPUT_HZ } from '@shared/protocol/constants';
import { HANG_NHAC, HANG_NHAC_ROOM, HANG_NHAC_AVATARS, moveInHangNhac, hangNhacWalkable } from '../../shared/hang-nhac';
import type { Input, Motion } from '@shared/world/types';
import * as THREE from 'three';
import { ProfileSession } from './profiles';
import { CHARACTER_INFO, isAvatarId, type AvatarId } from '../../shared/profiles';
import { applyR01Movement } from '../../shared/skills/movement';
import { SkillPresentation } from './skills/three-presentation';
import { SkillSession } from './skills/session';
import { SECT_STATIONS, type SectResult, type SectView } from '../../shared/sect';
import { SectUI } from './sect-ui';

const el = <T extends HTMLElement>(id: string) => document.getElementById(id)! as T;
const stage = el<HTMLElement>('stage'), avatar = el<HTMLSelectElement>('avatar'), name = el<HTMLInputElement>('player-name');
const join = el<HTMLButtonElement>('join'), leave = el<HTMLButtonElement>('leave'), loading = el<HTMLElement>('loading');
const names: Record<string, string> = { 'CHR-WANG-LIN-CHIBI': 'Vương Lâm', 'CHR-SITU-NAN': 'Tư Đồ Nam', 'CHR-LI-MUWAN': 'Lý Mộ Uyển' };
const keys = new Set<string>(), touch = new Set<string>();
const actors = new Map<string, RenderActor>();
const npcs: RenderActor[] = [];
let renderer: PreviewRenderer, local: RenderActor, ready = false, previous = performance.now(), accumulator = 0;
const endpoint = import.meta.env.VITE_SERVER_URL || `${location.protocol}//${location.hostname}:2567`;
const profiles = new ProfileSession(endpoint);
let presentation: SkillPresentation, serverOffset = 0, opening = false, saveFailed = false;
const skills=new SkillSession({room:()=>network.room,online:()=>network.status==='connected',now:()=>Date.now()+serverOffset,feedback,focus:()=>stage.focus(),
  movement:readInput,facing:()=>network.renderMotion(network.room?.sessionId??'')?.direction??network.room?.state.players?.get(network.room.sessionId)?.direction??local?.direction??'south',
  inputSequence:()=>network.nextInputSequence(),
  event:event=>{serverOffset=event.at-Date.now();presentation.event(event);}});
const sect = new SectUI({send:command=>{
    if(!network.room?.connection.isOpen||network.status!=='connected')throw new Error('NPC transport unavailable');
    network.room.send('sect:command',command);
  },avatar:()=>avatar.value as AvatarId,
  position:()=>network.room?.state.players?.get(network.room.sessionId)??local??HANG_NHAC.world.spawn,
  online:()=>network.status==='connected'&&!!network.room?.state.players?.get(network.room.sessionId)?.connected,
  connectionMessage:()=>network.status==='connecting'||network.status==='reconnecting'?'Đang kết nối lại sân chung… NPC và thuật sẽ sẵn sàng khi khôi phục xong.':undefined,
  clock:()=>Date.now()+serverOffset,focus:()=>{clearInput();stage.focus();},
  training:()=>skills.practice()});
const attached = new WeakSet<object>();
const network = new NetworkSession(readInput, updateStatus, { roomName: HANG_NHAC_ROOM,
  recover: true,
  joinOptions: () => ({ mapVersion: HANG_NHAC.version, accountToken: profiles.token }), movementStep: applyR01Movement,
  motionFields: ['motionLocked','dashVX','dashVY'], resumeToken: () => profiles.active()?.avatarId === avatar.value ? profiles.active()?.reconnectionToken : undefined,
  connected: room => {
    profiles.remember(avatar.value as AvatarId,room.reconnectionToken);skills.attach(room);
    if (attached.has(room)) {room.send('sect:sync');return;} attached.add(room);
    room.onMessage('sect:state',(view:SectView)=>sect.state(view));
    room.onMessage('sect:result',(result:SectResult)=>sect.result(result));
    room.send('sect:sync');
    room.onMessage('profile:saved',(result:{ok:boolean}) => { saveFailed=!result.ok; });

  } });

function feedback(message: string): void { el('skill-feedback').textContent=message; }
async function enter(): Promise<void> {
  if (!ready || opening || network.room) return;
  opening=true; updateStatus(); clearInput();
  try { await presentation.prepareAvatar(avatar.value);await profiles.open(); await network.connect(endpoint,name.value.trim() || profiles.profiles.find(p=>p.avatarId===avatar.value)?.name || names[avatar.value],avatar.value); }
  catch (error) { feedback(error instanceof Error?error.message:String(error)); }
  finally { opening=false; updateStatus(); stage.focus(); }
}
function clearInput(): void {
  keys.clear(); touch.clear();
  skills.moveAim({x:0,y:0});
  document.querySelectorAll('.touch-pad button').forEach(b => b.classList.remove('active'));
}
function readInput(): Input {
  if (document.hidden || !document.hasFocus() || sect.modal || document.activeElement?.matches('input,select,textarea')) return { x: 0, y: 0 };
  return { x: Number(keys.has('d') || keys.has('arrowright') || touch.has('east')) - Number(keys.has('a') || keys.has('arrowleft') || touch.has('west')),
    y: Number(keys.has('s') || keys.has('arrowdown') || touch.has('south')) - Number(keys.has('w') || keys.has('arrowup') || touch.has('north')) };
}
function createActor(id: string, assetId: string, title: string, motion: Motion, own: boolean): RenderActor {
  const asset = renderer.assets.get(assetId);
  if (!asset) throw new Error(`Chưa nạp nhân vật ${assetId}.`);
  return { id, assetId, name: title, x: motion.x, y: motion.y, direction: motion.direction, moving: motion.moving,
    own, animation: new AnimationPlayer(asset.atlas) };
}
function advance(actor: RenderActor, next: Motion): void {
  const distance = Math.hypot(next.x - actor.x, next.y - actor.y);
  Object.assign(actor, next);
  actor.animation.updateFromTravel(distance, actor.direction, actor.moving,
    renderer.assets.get(actor.assetId)?.definition.defaultGaitCycleDistancePx ?? 48);
}
function updateStatus(): void {
  const online = !!network.room, connecting = network.status === 'connecting' || network.status === 'reconnecting';
  avatar.disabled = name.disabled = online || opening || connecting;
  join.hidden = online || connecting; join.disabled = !ready || opening || connecting; leave.hidden = !online && !connecting;
  el<HTMLElement>('status').textContent = network.status === 'connected' ? `Sân chung · ${network.players.size} người · ${Math.round(network.latency)} ms` :
    network.status === 'error' ? `Chưa vào được sân chung. ${network.detail}` :
    network.status === 'connecting' ? 'Đang vào Hằng Nhạc…' : network.status === 'reconnecting' ? 'Đang kết nối lại…' : 'Khám phá · chưa vào sân chung';
  const own=network.room?.state.players?.get(network.room.sessionId), info=CHARACTER_INFO[avatar.value as AvatarId];
  if (network.room?.state.serverTime) serverOffset=network.room.state.serverTime-Date.now();
  const saved=profiles.profiles.find(p=>p.avatarId===avatar.value);
  el('profile-summary').textContent=`${info.name} · ${info.introduction} · ${own?`${own.casts} lần dùng thuật · ${own.practiceHits} lần trúng · ${saveFailed?'Lưu đang gặp lỗi':own.savedAt?'Đã lưu '+new Date(own.savedAt).toLocaleTimeString('vi-VN'):'Đang lưu…'}`:saved?`Hồ sơ riêng · ${saved.casts} lần dùng thuật · Tiếp tục bản lưu`:'Hồ sơ riêng · ba thuật R01 có từ đầu'}`;
  el('resources').textContent=`HP ${Math.floor(own?.hp??saved?.hp??100)} / 100 · Linh lực ${Math.floor(own?.mp ?? saved?.mp ?? 100)} / 100`;
  skills.update();
  sect.update();
}
avatar.addEventListener('change', () => {
  if (ready && !network.room) local = createActor('local', avatar.value, names[avatar.value], local, true);
  sect.reset();
  skills.reset();
  name.value=profiles.profiles.find(p=>p.avatarId===avatar.value)?.name ?? ''; updateStatus();
});
el<HTMLFormElement>('entry').addEventListener('submit', event => {
  event.preventDefault(); clearInput();
  void enter();
});
leave.addEventListener('click', () => {
  const own = actors.get(network.room?.sessionId ?? '');
  if (own && hangNhacWalkable(own)) Object.assign(local, { x: own.x, y: own.y, direction: own.direction, moving: false });
  clearInput(); opening=true; profiles.clearActive();
  void network.leave().then(async () => {
    actors.clear(); skills.reset(); stage.focus();
    sect.reset();
    try { await profiles.refresh(); } catch { feedback('Chưa đọc được bản lưu mới nhất.'); }
    finally { opening=false; updateStatus(); }
  });
});
window.addEventListener('keydown', event => {
  if (document.activeElement?.matches('input,select,textarea,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  if(sect.modal)return;
  // IME can report "Process" instead of "e"; the physical key still identifies E.
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&(event.code==='KeyE'||key==='e')){event.preventDefault();clearInput();sect.interact();return;}
  const skill=skills.shortcut(event);if(skill){event.preventDefault();skills.cast(skill);return;}
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) { event.preventDefault(); keys.add(key); skills.moveAim(readInput()); }
});
window.addEventListener('keyup', event => {keys.delete(event.key.toLowerCase());skills.moveAim(readInput());});
window.addEventListener('blur', clearInput);
document.addEventListener('visibilitychange', clearInput);
stage.addEventListener('pointerdown', event => {
  if (!ready||sect.modal) return;
  if ((event.target as HTMLElement).closest('button,.skill-panel')) return;
  stage.focus(); const rect=stage.getBoundingClientRect(), point=new THREE.Vector3((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1,0).unproject(renderer.camera);
  const own=actors.get(network.room?.sessionId??'')??local, dx=point.x-own.x, dy=-point.y-own.y, magnitude=Math.hypot(dx,dy);
  if (magnitude>1) skills.setAim(dx,dy);
  skills.selectTarget(point.x,-point.y);
});
document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
  const direction = button.dataset.input!;
  button.addEventListener('pointerdown', event => { if(sect.modal)return;event.preventDefault();stage.focus();button.setPointerCapture(event.pointerId); touch.add(direction); button.classList.add('active');skills.moveAim(readInput()); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => { touch.delete(direction); button.classList.remove('active');skills.moveAim(readInput()); });
});

function frame(now: number): void {
  const dt = Math.min(Math.max((now - previous) / 1000, 0), .1); previous = now;
  let visible: RenderActor[];
  skills.moveAim(readInput());
  if (network.room) {
    accumulator = 0; network.update(now);
    for (const [id, player] of network.players) {
      const motion = network.renderMotion(id) ?? player;
      let actor = actors.get(id);
      if (!actor || actor.assetId !== player.avatarId) {
        actor = createActor(id, player.avatarId, player.name, motion, id === network.room.sessionId); actors.set(id, actor);
      }
      advance(actor, motion); actor.connected = player.connected;
    }
    for (const id of actors.keys()) if (!network.players.has(id)) actors.delete(id);
    visible = [...actors.values()];
  } else {
    accumulator += dt;
    while (accumulator >= 1 / INPUT_HZ) { advance(local, moveInHangNhac(local, readInput(), 1 / INPUT_HZ)); accumulator -= 1 / INPUT_HZ; }
    visible = [local];
  }
  const own = visible.find(a => a.own) ?? local;
  const clamp = (value: number, size: number, viewport: number) => viewport >= size ? size / 2 : Math.max(viewport / 2, Math.min(size - viewport / 2, value));
  const target = { x: clamp(own.x, HANG_NHAC.world.width, stage.clientWidth), y: clamp(own.y - 50, HANG_NHAC.world.height, stage.clientHeight) };
  const blend = 1 - Math.exp(-14 * dt);
  renderer.cameraCenter.x += (target.x - renderer.cameraCenter.x) * blend;
  renderer.cameraCenter.y += (target.y - renderer.cameraCenter.y) * blend;
  presentation.update(network.room?.state,Date.now()+serverOffset,visible);
  renderer.mode = network.room ? 'online' : 'map'; renderer.render([...visible,...npcs]);
  requestAnimationFrame(frame);
}

async function init(): Promise<void> {
  renderer = new PreviewRenderer(stage, el<HTMLElement>('world-labels')); renderer.zoom = 1; renderer.debug = false;
  const response = await fetch('/assets/catalog.json'); if (!response.ok) throw new Error('Không nạp được bộ nhân vật.');
  const catalog = await response.json() as { actors: ActorDefinition[] };
  const definitions = catalog.actors.filter(a => HANG_NHAC_AVATARS.some(id => id === a.id)||SECT_STATIONS.some(s=>s.avatarId===a.id));
  if (definitions.length !== 5) throw new Error('Thiếu bộ ba nhân vật hoặc mẫu NPC. Chạy lại bước chuẩn bị assets.');
  await Promise.all([renderer.loadActors(definitions), renderer.loadBackgroundMap(HANG_NHAC.background.url, HANG_NHAC.world.width, HANG_NHAC.world.height)]);
  presentation=new SkillPresentation(renderer.scene); await presentation.load(avatar.value);
  for (const asset of renderer.assets.values()) {
    if (JSON.stringify(asset.atlas.frameSize) !== JSON.stringify(HANG_NHAC.character.frameSize) ||
        JSON.stringify(asset.atlas.anchor) !== JSON.stringify(HANG_NHAC.character.anchor)) throw new Error('Tỷ lệ nhân vật khác bản đã chốt.');
  }
  local = createActor('local', avatar.value, names[avatar.value], { ...HANG_NHAC.world.spawn, direction: 'south', moving: false }, true);
  for(const station of SECT_STATIONS)npcs.push(createActor(`npc:${station.id}`,station.avatarId,station.name,{x:station.x,y:station.y,direction:'south',moving:false},false));
  renderer.cameraCenter = { x: local.x, y: local.y - 50 };
  renderer.mode = 'map'; renderer.render([local]);
  ready = true; loading.hidden = true; updateStatus(); stage.focus();
  Object.assign(window, { __hangNhacDiagnostics: () => ({ ready, mapId: HANG_NHAC.id, version: HANG_NHAC.version,
    world: HANG_NHAC.world, zoom: renderer.zoom, cameraCenter:{...renderer.cameraCenter}, blockers: HANG_NHAC.blockers.length, status: network.status,
    connectionDetail: network.detail,
    sessionId: network.room?.sessionId, roomId: network.room?.roomId,
    serverMapVersion: network.room?.state.mapVersion, backgroundBytes: HANG_NHAC.background.bytes,
    actors: (network.room ? [...actors.values()] : [local]).map(a => ({ id: a.id, assetId: a.assetId, x: a.x, y: a.y,
      own: a.own, direction: a.direction, moving: a.moving, frame: a.animation.frameId, walkable: hangNhacWalkable(a),
      frameSize: a.animation.atlas.frameSize, anchor: a.animation.atlas.anchor })),
    sprites: renderer.scene.children.filter(o => o.type === 'Sprite' && o.userData.entityId).map(o => ({ id: o.userData.entityId, scale: o.scale.toArray(),clip:o.userData.clip,frameIndex:o.userData.frameIndex,anchor:o.userData.anchor,animationSource:o.userData.animationSource,crop:o.userData.frameCrop,cutouts:o.userData.frameCutouts })) }),
    __hangNhacR01: () => ({ avatarId:avatar.value,profileId:network.room?.state.players?.get(network.room.sessionId)?.profileId,
      profiles:profiles.profiles,own:network.room?.state.players?.get(network.room.sessionId)?.toJSON(),
      targets:network.room?.state.targets?.toJSON(),vfx:presentation.diagnostics(),selectedTarget:skills.selectedTarget,input:skills.diagnostics() }),
    __hangNhacSect:()=>sect.diagnostics(),
    __hangNhacSkills:()=>presentation.diagnostics(),
  });
  previous = performance.now(); requestAnimationFrame(frame);
  if (profiles.token) { try { await profiles.open(); } catch(error) { feedback(error instanceof Error?error.message:String(error)); } updateStatus(); }
  const active=profiles.active(); if(active&&isAvatarId(active.avatarId)) { avatar.value=active.avatarId; local=createActor('local',avatar.value,names[avatar.value],local,true); await enter(); }
}
void init().catch(error => { ready = false; loading.textContent = `Không mở được Hằng Nhạc: ${error instanceof Error ? error.message : String(error)}`; renderer?.dispose(); });
window.addEventListener('pagehide', () => { clearInput(); network.suspend(); presentation?.dispose(); renderer?.dispose(); });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
