import './hang-nhac.css';
import './quest-ui.css';
import './features/entry/entry.css';
import './features/entry/title.css';
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
import { prepareWindPrediction } from '@shared/skills/dash-motion';
import { SkillPresentation } from './skills/three-presentation';
import { SkillSession } from './skills/session';
import { SECT_STATIONS, progressionLabel, type SectResult, type SectView, type StationId } from '../../shared/sect';
import { QuestNavigation } from './core/quest-navigation';
import { SectUI } from './sect-ui';
import { LIVE_HANG_NHAC_NPCS, npcStationName } from './npc-life';
import { LessonPresentation } from './lesson-presentation';
import { QuestMotionPresentation } from './quest-motion-presentation';
import { GameShell } from './game-shell';
import { VanNgocUI } from './van-ngoc-ui';
import { CharacterSession } from './character-session';
import {GameApi} from './net/game-api';
import {createGameEntryState} from './core/game-entry-state';
import {EntryCoordinator} from './features/entry/coordinator';
import {attachFrameSurface} from './frame-surface';
import {initializeDaoRuntimeTheme} from './ui/dao-runtime-theme';
import {DaoRuntimeHud} from './ui/dao-runtime-hud';
import { hangNhacMapArt, loadHangNhacMapArt, parseHangNhacMapArt, type HangNhacMapArtId } from './hang-nhac-map-art';
import { PixelPlayerPresentation } from './pixel-player-runtime';
import {EncounterActorPresentation} from './encounter-actor-presentation';
import { readQuestMotion } from '@shared/quest-motion';
import {readActorAction} from '@shared/actor-actions';
import {ChapterUI} from './chapter-ui';
import {ChapterPresentation} from './chapter-presentation';
import chapterMinimapUrl from './chapter-activity-minimap.svg?url';
import {applyChapterMovement,CHAPTER_WORLD} from '@shared/chapter';
import './ui/dao-runtime-theme.css';
import './ui/dao-player-ux.css';

const el = <T extends HTMLElement>(id: string) => document.getElementById(id)! as T;
const stage = el<HTMLElement>('stage'), avatar = el<HTMLSelectElement>('avatar'), name = el<HTMLInputElement>('player-name');
initializeDaoRuntimeTheme(el('game-shell'));
const join = el<HTMLButtonElement>('join'), leave = el<HTMLButtonElement>('leave'), loading = el<HTMLElement>('loading');
const names: Record<string, string> = { 'CHR-WANG-LIN-CHIBI': 'Vương Lâm', 'CHR-SITU-NAN': 'Tư Đồ Nam', 'CHR-LI-MUWAN': 'Lý Mộ Uyển' };
const keys = new Set<string>(), touch = new Set<string>();
const navigation = new QuestNavigation();
let navigationProfile: string | undefined;
const navigationNotice = document.createElement('div'), navigationText = document.createElement('span'), navigationStop = document.createElement('button');
navigationNotice.id = 'quest-navigation'; navigationNotice.hidden = true;
navigationText.setAttribute('role','status'); navigationStop.type = 'button'; navigationStop.textContent = 'Dừng';
navigationStop.setAttribute('aria-label','Dừng tìm đường'); navigationStop.addEventListener('click',()=>{clearInput();stage.focus();});
navigationNotice.append(navigationText,navigationStop); el('sect-objective').append(navigationNotice);
const actors = new Map<string, RenderActor>();
const npcs: RenderActor[] = [];
let renderer: PreviewRenderer, local: RenderActor, ready = false, previous = performance.now(), accumulator = 0;
const endpoint = import.meta.env.VITE_SERVER_URL || `${location.protocol}//${location.hostname}:2567`;
const guestFixture=import.meta.env.DEV&&new URLSearchParams(location.search).get('devGuest')==='1';
let mapArtId = parseHangNhacMapArt(new URLSearchParams(location.search).get('mapArt'));
let changingMapArt = false;
const mapArtSelect = el<HTMLSelectElement>('map-art'), mapArtNote = el('map-art-note');
mapArtSelect.value = mapArtId;
mapArtNote.textContent = hangNhacMapArt(mapArtId).note;
const entry=guestFixture?undefined:new EntryCoordinator(createGameEntryState(),new GameApi(endpoint),el('entry-screen'),{
  play:()=>enter(),leave:()=>leaveGame(),settings:()=>shell.openMenu(),selected:(id,label)=>{avatar.value=id;avatar.dispatchEvent(new Event('change'));name.value=label;},
});
if(entry){document.body.classList.add('game-auth-mode');attachFrameSurface(entry.view.root);loading.textContent='Đang mở tiên lộ…';}
const profiles = entry?.profiles??new ProfileSession(endpoint);
let lessonPresentation:LessonPresentation;
let questMotion:QuestMotionPresentation;
let pixelPlayer:PixelPlayerPresentation;
let encounterActor:EncounterActorPresentation;
let chapterPresentation:ChapterPresentation,activityVisible=false;
let presentation: SkillPresentation, serverOffset = 0, opening = false, saveFailed = false;
let daoHud: DaoRuntimeHud | undefined;
let characterJournalProfile: string | undefined;
const shell = new GameShell({clearInput,focus:()=>stage.focus(),entryFocus:()=>{if(!entry)return false;entry.view.focus();return true;}});
const gameUI = new VanNgocUI();
const skills=new SkillSession({room:()=>network.room,online:()=>network.status==='connected',now:()=>Date.now()+serverOffset,feedback,focus:()=>stage.focus(),
  basic:()=>chapter.inActivity?chapter.basic():sect.basicAttack(skills.selectedTarget),
  resources:()=>{const saved=profiles.profiles.find(p=>p.avatarId===avatar.value);return {hp:saved?.hp??100,mp:saved?.mp??100};},
  movement:readInput,facing:()=>network.renderMotion(network.room?.sessionId??'')?.direction??network.room?.state.players?.get(network.room.sessionId)?.direction??local?.direction??'south',
  inputSequence:()=>network.nextInputSequence(),
  event:event=>{serverOffset=event.at-Date.now();presentation.event(event);}});
const sect = new SectUI({send:command=>{
    if(!network.room?.connection.isOpen||network.status!=='connected')throw new Error('NPC transport unavailable');
    network.room.send('sect:command',command);
  },sendChapter:(nodeName,choice)=>chapter.sendNode(nodeName,choice),
  avatar:()=>avatar.value as AvatarId,
  mapBackground:()=>hangNhacMapArt(mapArtId).backgroundUrl,
  position:()=>network.room?.state.players?.get(network.room.sessionId)??local??HANG_NHAC.world.spawn,
  online:()=>network.status==='connected'&&!!network.room?.state.players?.get(network.room.sessionId)?.connected,
  connectionMessage:()=>network.status==='connecting'||network.status==='reconnecting'?'Đang kết nối lại sân chung… NPC và thuật sẽ sẵn sàng khi khôi phục xong.':undefined,
  clock:()=>Date.now()+serverOffset,focus:()=>{clearInput();shell.focus();},
  chapter:station=>chapter.openAtStation(station),
  chapterQuest:id=>chapter.openQuest(id),navigate:startNavigation,
  npcContext:()=>{const own=network.room?.state.players?.get(network.room.sessionId);return {
    position:own??HANG_NHAC.world.spawn,profileId:own?.profileId,view:sect.view,online:network.status==='connected'&&!!own?.connected,
    scene:own?.scene,visible:!document.hidden,focused:document.hasFocus(),alive:!!own&&own.hp>0,
    blocked:chapter.inActivity||chapter.modal||character.panel.modal||!!daoHud?.modal||shell.blocking||!!own?.motionLocked||!!sect.view?.practising,
  };},
  training:()=>skills.practice(),enter:()=>{void enter().catch(error=>entry?.failed(error));}});
const attached = new WeakSet<object>();
const network = new NetworkSession(readInput, updateStatus, { roomName: HANG_NHAC_ROOM,
  recover: true,
  joinOptions: () => entry?entry.profiles.joinOptions():({ mapVersion: HANG_NHAC.version, accountToken: profiles.token }), movementStep:(state,input,dt,interval)=>{prepareWindPrediction(state,interval,dt);((state as {scene?:string}).scene&&(state as {scene?:string}).scene!=='hub'?applyChapterMovement:applyR01Movement)(state,input,dt);},
  motionFields: ['motionLocked','dashVX','dashVY','scene','hp','castId','castSkill','castStartedAt','castAimX','castAimY'], resumeToken: () => profiles.active()?.avatarId === avatar.value ? profiles.active()?.reconnectionToken : undefined,
  connected: room => {
    questMotion.reset();
    pixelPlayer.reset();
    encounterActor.reset();
    profiles.remember(avatar.value as AvatarId,room.reconnectionToken);skills.attach(room);
    character.attach(room);
    chapter.attach(room);
    if (attached.has(room)) {room.send('sect:sync');return;} attached.add(room);
    if(entry)room.onMessage('entry:revoked',(event:{message:string})=>{void entry.revoked(event.message);});
    room.onMessage('sect:state',(view:SectView)=>sect.state(view));
    room.onMessage('sect:result',(result:SectResult)=>sect.result(result));
    room.onMessage('sect:animation',(event:unknown)=>{questMotion.event(event);const motion=readQuestMotion(event);if(motion)pixelPlayer.event(motion);});
    room.onMessage('actor:action',(raw:unknown)=>{const e=readActorAction(raw);if(!e)return;if(e.avatarId&&e.avatarId!=='CHR-WANG-LIN-CHIBI'){if(e.type==='start')questMotion.event({id:e.strikeId,actorId:e.actorId,kind:'basic',direction:Math.abs(e.dx)>Math.abs(e.dy)?e.dx>0?'east':'west':e.dy<0?'north':'south',at:e.at});}else pixelPlayer.action(e);});
    room.send('sect:sync');
    room.onMessage('profile:saved',(result:{ok:boolean}) => { saveFailed=!result.ok; });

  } });
const character=new CharacterSession({room:()=>network.room,online:()=>network.status==='connected',avatar:()=>avatar.value as AvatarId,clock:()=>Date.now()+serverOffset,
  craft:()=>chapter.open('crafting'),
  opened:()=>{clearInput();},closed:()=>{clearInput();if(!sect.modal&&!daoHud?.modal)shell.focus();},journal:questId=>{
    clearInput();characterJournalProfile=network.room?.state.players?.get(network.room.sessionId)?.profileId;sect.journal(questId);
  }});
const chapter=new ChapterUI({room:()=>network.room,position:()=>network.room?.state.players?.get(network.room.sessionId)??local??HANG_NHAC.world.spawn,
  sect:()=>sect.view,online:()=>network.status==='connected',focus:()=>stage.focus(),clear:clearInput,feedback,navigate:startNavigation,select:id=>{skills.selectedTarget=id;},changed:()=>syncChapterScene(),inputSequence:()=>network.nextInputSequence()});
function syncChapterScene(){
  if(!chapterPresentation)return;
  const active=chapter.inActivity&&!!network.room;if(active===activityVisible)return;
  activityVisible=active;clearInput();skills.reset();
  pixelPlayer.reset();encounterActor?.reset();
  if(active){chapterPresentation.enter();renderer.cameraCenter={x:CHAPTER_WORLD.spawn.x,y:CHAPTER_WORLD.spawn.y-50};mapArtSelect.disabled=true;}
  else{chapterPresentation.leave();void loadHangNhacMapArt(renderer,mapArtId).then(()=>{mapArtSelect.disabled=false;}).catch(error=>feedback(String(error)));}
  el('sect-objective').hidden=active;
  daoHud?.update({connected:network.status==='connected',map:mapArtSnapshot()});
}
el('sect-dialog').addEventListener('close',()=>{
  const profileId=characterJournalProfile;characterJournalProfile=undefined;
  const own=network.room?.state.players?.get(network.room.sessionId);
  if(profileId&&own?.profileId===profileId&&own.connected&&!shell.blocking&&!sect.modal&&!daoHud?.modal)character.resumeFromJournal();
});
daoHud=new DaoRuntimeHud(stage,{
  attachSurface:attachFrameSurface,
  openCharacter:tab=>{if(shell.blocking||sect.modal)return;clearInput();character.open(tab);},
  openJournal:()=>{if(shell.blocking)return;clearInput();sect.journal();},
  openSettings:()=>shell.openMenu(),feedback,focus:()=>{if(!character.panel.modal&&!sect.modal)shell.focus();},
  openCrafting:()=>{if(shell.blocking||sect.modal)return;chapter.open('crafting');},
  modalChanged:()=>clearInput(),
});
daoHud.update({connected:false,map:mapArtSnapshot()});
function mapArtSnapshot() {
  if(activityVisible)return {name:chapter.view?.progress.scene==='trial'?'Khảo nghiệm':'Ngoại vi thử luyện',width:CHAPTER_WORLD.width,height:CHAPTER_WORLD.height,backgroundUrl:chapterMinimapUrl,pins:CHAPTER_WORLD.nodes.map(n=>({...n,area:'Ngoại vi thử luyện'}))};
  return {name:HANG_NHAC.name,width:HANG_NHAC.world.width,height:HANG_NHAC.world.height,
    backgroundUrl:hangNhacMapArt(mapArtId).backgroundUrl};
}
mapArtSelect.addEventListener('change', () => { void changeMapArt(); });
async function changeMapArt(): Promise<void> {
  if (!ready || changingMapArt || chapter.inActivity) return;
  const next: HangNhacMapArtId = parseHangNhacMapArt(mapArtSelect.value);
  if (next === mapArtId) return;
  clearInput(); changingMapArt = true; mapArtSelect.disabled = true;
  mapArtNote.textContent = 'Đang nạp nền…';
  try {
    await loadHangNhacMapArt(renderer, next);
    mapArtId = next;
    daoHud?.update({connected:network.status==='connected',map:mapArtSnapshot()});
    const url = new URL(location.href);
    url.searchParams.set('mapArt', next);
    history.replaceState(history.state, '', url);
    mapArtNote.textContent = hangNhacMapArt(next).note;
  } catch (error) {
    mapArtSelect.value = mapArtId;
    mapArtNote.textContent = `Không đổi được nền: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    changingMapArt = false; mapArtSelect.disabled = false;
  }
}
el('character-open').addEventListener('click',()=>{if(!shell.blocking&&!sect.modal)character.open();});
el<HTMLButtonElement>('game-logout').hidden=!entry;
el('game-logout').addEventListener('click',()=>{el<HTMLDialogElement>('game-menu').close();void entry?.logout();});
el<HTMLButtonElement>('game-home').hidden=!entry;
el('game-home').addEventListener('click',()=>{el<HTMLDialogElement>('game-menu').close();void entry?.home();});

function feedback(message: string): void { el('skill-feedback').textContent=message; skills.announce(message); }
async function enter(): Promise<void> {
  if (!ready || opening || network.room) return;
  opening=true; updateStatus(); clearInput();
  try { await presentation.prepareAvatar(avatar.value);await profiles.open(); await network.connect(endpoint,name.value.trim() || profiles.profiles.find(p=>p.avatarId===avatar.value)?.name || names[avatar.value],avatar.value);if(entry&&network.status==='error')throw new Error(network.detail); }
  catch (error) { feedback(error instanceof Error?error.message:String(error));if(entry)throw error; }
  finally { opening=false; updateStatus(); shell.focus(); }
}
let clearingInput = false;
function clearInput(): void {
  if (clearingInput) return;
  clearingInput = true;
  try {
    navigation.cancel(); navigationNotice.hidden = true;
    keys.clear(); touch.clear();
    skills.moveAim({x:0,y:0});
    document.querySelectorAll('.touch-pad button').forEach(b => b.classList.remove('active'));
  } finally { clearingInput = false; }
}
function readInput(): Input {
  if(navigation.status==='moving')return navigation.input;
  if (document.hidden || !document.hasFocus() || sect.modal || chapter.modal || character.panel.modal || daoHud?.modal || shell.blocking || document.activeElement?.matches('input,select,textarea')) return { x: 0, y: 0 };
  return { x: Number(keys.has('d') || keys.has('arrowright') || touch.has('east')) - Number(keys.has('a') || keys.has('arrowleft') || touch.has('west')),
    y: Number(keys.has('s') || keys.has('arrowdown') || touch.has('south')) - Number(keys.has('w') || keys.has('arrowup') || touch.has('north')),fast:keys.has('shift') };
}
let startingNavigation = false;
function startNavigation(stationId: StationId): void {
  if (startingNavigation) return;
  startingNavigation = true;
  try {
  stage.focus();
  const own=network.room?.state.players?.get(network.room.sessionId),station=SECT_STATIONS.find(s=>s.id===stationId);
  if(!station||network.status!=='connected'||!own?.connected||own.scene!=='hub'||sect.modal||chapter.modal||character.panel.modal||daoHud?.modal||shell.blocking||document.hidden)return;
  if(own.motionLocked||sect.view?.practising||sect.view?.lessonView?.status==='warning'){feedback('Đợi thao tác luyện thuật kết thúc rồi tìm đường.');return;}
  clearInput();stage.focus();navigationProfile=own.profileId;
  const position=network.renderMotion(network.room!.sessionId)??own;
  if(!navigation.start(position,station,npcStationName(station.id),performance.now()))feedback('Chưa tìm được đường từ vị trí này. Di chuyển ra chỗ trống rồi thử lại.');
  else if(navigation.status==='arrived'){feedback(`Đã tới ${npcStationName(station.id)}.`);sect.interact();}
  } finally { startingNavigation = false; }
}
function updateNavigation(now:number):void {
  if(navigation.status!=='moving'){navigationNotice.hidden=true;return;}
  const own=network.room?.state.players?.get(network.room.sessionId);
  if(network.status!=='connected'||!own?.connected||own.profileId!==navigationProfile||own.scene!=='hub'||own.hp<=0||own.motionLocked||document.hidden||sect.modal||chapter.modal||character.panel.modal||daoHud?.modal||shell.blocking){clearInput();return;}
  navigation.update(network.renderMotion(network.room!.sessionId)??own,now);
  const status=navigation.diagnostics.status;
  navigationNotice.hidden=status!=='moving';
  const route=navigation.remainingRoute,distance=route.slice(1).reduce((total,p,i)=>total+Math.hypot(p.x-route[i].x,p.y-route[i].y),0);
  navigationText.textContent=`🧭 Đang tự tìm đường tới ${navigation.label} · ${Math.max(1,Math.ceil(distance/120))} giây`;
  if(status==='arrived'){feedback(`Đã tới ${navigation.label} · Mở đối thoại NPC.`);sect.interact();}
  if(status==='blocked')feedback('Đường đi đang bị chặn. Tự di chuyển ra chỗ trống rồi bấm Tìm đường lại.');
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
  const playerName=own?.name??saved?.name??names[avatar.value];
  el('character-name').textContent=playerName;el('character-name').title=playerName;
  const progression=sect.view?progressionLabel(avatar.value as AvatarId,sect.view.level).replace(' · mốc gameplay',''):info.name;
  el('profile-summary').textContent=progression;el('profile-summary').title=progression;
  el('save-status').textContent=saveFailed?'Lưu đang gặp lỗi':own?.savedAt?'Đã lưu tự động':own?'Đang lưu…':'Hồ sơ riêng';
  el('entry-description').textContent=info.introduction;
  el('entry-profile').textContent=saved?'Tiếp tục bản lưu của nhân vật này. Không nhận lại phần thưởng đã ghi.':'Hồ sơ riêng · Kiếm Khí, Lôi Ấn và Ngự Phong Bộ có từ đầu.';
  join.textContent=saved?'Tiếp tục hành trình':'Vào Hằng Nhạc';
  el('menu-status').textContent=el('status').textContent;
  el('resources').textContent=`HP ${Math.floor(own?.hp??saved?.hp??100)} / 100 · Linh lực ${Math.floor(own?.mp ?? saved?.mp ?? 100)} / 100`;
  skills.update();
  sect.update();
  shell.sync({ready,opening,status:network.status,ownConnected:!!own?.connected});
  gameUI.sync(avatar.value as AvatarId, network.status, saveFailed);
  character.update();
  chapter.update();syncChapterScene();
  const selectedTarget=network.room?.state.targets?.get(skills.selectedTarget);
  daoHud?.update({connected:network.status==='connected'&&!!own?.connected,name:playerName,cultivation:sect.view?.cultivation??0,
    realm:avatar.value==='CHR-SITU-NAN'?'Linh thể · Hằng Nhạc':'Tu đạo · Hằng Nhạc',x:own?.x,y:own?.y,
    target:selectedTarget?{name:activityVisible?`Đối luyện ${selectedTarget.maxHp===60?'E01':selectedTarget.maxHp===80?'E02':'E03'}`:'Mục tiêu luyện',x:selectedTarget.x,y:selectedTarget.y,hp:selectedTarget.hp,maxHp:selectedTarget.maxHp}:null});
  entry?.syncNetwork(!!own?.connected,opening||connecting||network.status==='connected'&&!own?.connected,network.status==='error'?network.detail:undefined);
  el<HTMLButtonElement>('game-logout').disabled=!entry?.state.session;
}
avatar.addEventListener('change', () => {
  clearInput();
  characterJournalProfile=undefined;
  character.reset();
  if (ready && !network.room) local = createActor('local', avatar.value, names[avatar.value], local, true);
  sect.reset();
  chapter.reset();syncChapterScene();
  questMotion?.reset();
  skills.reset();
  name.value=profiles.profiles.find(p=>p.avatarId===avatar.value)?.name ?? ''; updateStatus();
});
el<HTMLFormElement>('entry').addEventListener('submit', event => {
  event.preventDefault(); clearInput();
  void enter().catch(error=>entry?.failed(error));
});
el('entry-journal').addEventListener('click',()=>{clearInput();sect.journal();});
async function leaveGame():Promise<void> {
  characterJournalProfile=undefined;
  daoHud?.close();
  character.reset();
  chapter.reset();
  const own = actors.get(network.room?.sessionId ?? '');
  if (own && hangNhacWalkable(own)) Object.assign(local, { x: own.x, y: own.y, direction: own.direction, moving: false });
  clearInput(); opening=true; profiles.clearActive();
  try {await network.leave();
    actors.clear(); skills.reset(); questMotion.reset(); stage.focus();
    sect.reset();
    try { await profiles.refresh(); } catch { feedback('Chưa đọc được bản lưu mới nhất.'); }
    finally { opening=false; updateStatus(); }
  }finally{opening=false;updateStatus();}
}
leave.addEventListener('click',()=>{void leaveGame();});
window.addEventListener('keydown', event => {
  if (document.activeElement?.matches('input,select,textarea,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  if(shell.menuOpen)return;
  if(daoHud?.modal)return;
  if(character.panel.modal)return;
  if(chapter.modal)return;
  if(entry&&shell.blocking)return;
  if(!event.repeat&&event.code==='KeyH'){event.preventDefault();chapter.open();return;}
  if(!event.repeat&&event.code==='KeyG'&&chapter.inActivity){event.preventDefault();chapter.command('guard');return;}
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&(event.code==='KeyC'||event.code==='KeyI')&&!shell.blocking&&!sect.modal){event.preventDefault();clearInput();character.open(event.code==='KeyI'?'inventory':'overview');return;}
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&(event.code==='KeyJ'||key==='j')){
    event.preventDefault();clearInput();sect.toggleJournal();return;
  }
  if(sect.modal)return;
  if(key==='escape'&&navigation.status==='moving'){event.preventDefault();clearInput();stage.focus();return;}
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!shell.blocking){
    if(event.code==='KeyM'){event.preventDefault();clearInput();daoHud?.openMap();return;}
    if(event.code==='KeyV'||event.code==='KeyK'||event.code==='KeyB'){event.preventDefault();clearInput();character.open(event.code==='KeyV'?'cultivation':event.code==='KeyK'?'spells':'inventory');return;}
  }
  if(key==='escape'&&!shell.blocking&&document.activeElement===stage){event.preventDefault();shell.openMenu();return;}
  // IME can report "Process" instead of "e"; the physical key still identifies E.
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&(event.code==='KeyE'||key==='e')){event.preventDefault();clearInput();if(chapter.inActivity)chapter.interact();else sect.interact();return;}
  if(shell.blocking)return;
  if(!event.repeat&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&(event.code==='KeyF'||key==='f')){event.preventDefault();navigation.cancel();skills.basic();return;}
  const skill=skills.shortcut(event);if(skill){event.preventDefault();navigation.cancel();skills.cast(skill);return;}
  if (['shift','w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) { event.preventDefault(); navigation.cancel();keys.add(key); skills.moveAim(readInput()); }
});
window.addEventListener('keyup', event => {keys.delete(event.key.toLowerCase());skills.moveAim(readInput());});
window.addEventListener('blur',()=>{if(navigation.status!=='moving')clearInput();sect.updateNpcLife();});
document.addEventListener('visibilitychange',()=>{if(document.hidden||navigation.status!=='moving')clearInput();sect.updateNpcLife();});
document.addEventListener('click',event=>{if((event.target as HTMLElement).closest('[data-hotbar-skill],#basic-attack,#training'))navigation.cancel();},true);
stage.addEventListener('pointerdown', event => {
  if (!ready||sect.modal||chapter.modal||character.panel.modal||daoHud?.modal||shell.blocking) return;
  if ((event.target as HTMLElement).closest('button,[data-game-ui],#hotbar-mount')) return;
  navigation.cancel();
  stage.focus(); const rect=stage.getBoundingClientRect(), point=new THREE.Vector3((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1,0).unproject(renderer.camera);
  const own=actors.get(network.room?.sessionId??'')??local, dx=point.x-own.x, dy=-point.y-own.y, magnitude=Math.hypot(dx,dy);
  if (magnitude>1) skills.setAim(dx,dy);
  skills.selectTarget(point.x,-point.y);
});
document.querySelectorAll<HTMLButtonElement>('[data-input]').forEach(button => {
  const direction = button.dataset.input!;
  button.addEventListener('pointerdown', event => { if(sect.modal||chapter.modal||character.panel.modal||daoHud?.modal||shell.blocking)return;event.preventDefault();navigation.cancel();stage.focus();button.setPointerCapture(event.pointerId); touch.add(direction); button.classList.add('active');skills.moveAim(readInput()); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => { touch.delete(direction); button.classList.remove('active');skills.moveAim(readInput()); });
});

function frame(now: number): void {
  const dt = Math.min(Math.max((now - previous) / 1000, 0), .1); previous = now;
  sect.updateNpcLife();
  let visible: RenderActor[];
  updateNavigation(now);
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
    const scene=network.room.state.players?.get(network.room.sessionId)?.scene??'hub';
    visible = [...actors.values()].filter(a=>(network.room!.state.players?.get(a.id)?.scene??'hub')===scene);
  } else {
    accumulator += dt;
    while (accumulator >= 1 / INPUT_HZ) { advance(local, moveInHangNhac(local, readInput(), 1 / INPUT_HZ)); accumulator -= 1 / INPUT_HZ; }
    visible = [local];
  }
  const own = visible.find(a => a.own) ?? local;
  if(!activityVisible)for(const npc of npcs)npc.animation.update(dt);
  const clamp = (value: number, size: number, viewport: number) => viewport >= size ? size / 2 : Math.max(viewport / 2, Math.min(size - viewport / 2, value));
  const world=activityVisible?CHAPTER_WORLD:HANG_NHAC.world;
  const target = { x: clamp(own.x, world.width, stage.clientWidth), y: clamp(own.y - 50, world.height, stage.clientHeight) };
  const blend = 1 - Math.exp(-14 * dt);
  renderer.cameraCenter.x += (target.x - renderer.cameraCenter.x) * blend;
  renderer.cameraCenter.y += (target.y - renderer.cameraCenter.y) * blend;
  presentation.update(network.room?.state,Date.now()+serverOffset,visible);
  questMotion.update(visible,Date.now()+serverOffset,network.status==='connected',sect.view);
  pixelPlayer.update(visible,network.room?.state,Date.now()+serverOffset,sect.view,chapter.view,network.status==='connected');
  lessonPresentation.update(network.status==='connected'?sect.view?.lessonView:undefined,Date.now()+serverOffset);
  const enemyActor=encounterActor.update(activityVisible?chapter.view:undefined,Date.now()+serverOffset);
  renderer.mode = network.room ? 'online' : 'map'; if(!entry||network.room)renderer.render([...visible,...(activityVisible?enemyActor?[enemyActor]:[]:npcs)]);
  chapterPresentation.update(activityVisible?chapter.view:undefined,own);chapter.update();
  character.update();
  requestAnimationFrame(frame);
}

async function init(): Promise<void> {
  renderer = new PreviewRenderer(stage, el<HTMLElement>('world-labels')); renderer.zoom = 1; renderer.debug = false;
  const response = await fetch('/assets/catalog.json'); if (!response.ok) throw new Error('Không nạp được bộ nhân vật.');
  const catalog = await response.json() as { actors: ActorDefinition[] };
  const definitions = catalog.actors.filter(a => HANG_NHAC_AVATARS.some(id => id === a.id)||SECT_STATIONS.some(s=>s.avatarId===a.id));
  if (definitions.length !== 5) throw new Error('Thiếu bộ ba nhân vật hoặc mẫu NPC. Chạy lại bước chuẩn bị assets.');
  await Promise.all([renderer.loadActors(definitions), loadHangNhacMapArt(renderer, mapArtId)]);
  gameUI.prepare(renderer.assets);
  entry?.prepare(Object.fromEntries([...renderer.assets.values()].filter(asset=>isAvatarId(asset.definition.id)).map(asset=>[asset.definition.id,{url:asset.definition.atlasUrl,atlasWidth:asset.atlas.width,atlasHeight:asset.atlas.height,frame:asset.atlas.frames[asset.atlas.animations.stand_south[0]]}])));
  presentation=new SkillPresentation(renderer.scene); await presentation.load(avatar.value,'/assets/hang-nhac-pixel-player/skill-presentation.json');
  lessonPresentation=new LessonPresentation(renderer.scene);
  questMotion=new QuestMotionPresentation(renderer.scene);await questMotion.load();
  pixelPlayer=new PixelPlayerPresentation(renderer);await pixelPlayer.load();
  encounterActor=new EncounterActorPresentation(renderer);await encounterActor.load();
  chapterPresentation=new ChapterPresentation(renderer,el('world-labels'));await chapterPresentation.load();
  for (const asset of renderer.assets.values()) {
    if (JSON.stringify(asset.atlas.frameSize) !== JSON.stringify(HANG_NHAC.character.frameSize) ||
        JSON.stringify(asset.atlas.anchor) !== JSON.stringify(HANG_NHAC.character.anchor)) throw new Error('Tỷ lệ nhân vật khác bản đã chốt.');
  }
  local = createActor('local', avatar.value, names[avatar.value], { ...HANG_NHAC.world.spawn, direction: 'south', moving: false }, true);
  for(const npc of LIVE_HANG_NHAC_NPCS)npcs.push(createActor(`npc:${npc.stationId??npc.id}`,npc.assetId,`${npc.name} · ${npc.role}`,{x:npc.x,y:npc.y,direction:'south',moving:false},false));
  renderer.cameraCenter = { x: local.x, y: local.y - 50 };
  renderer.mode = 'map'; renderer.render([local]);
  ready = true; loading.hidden = true; mapArtSelect.disabled = false; updateStatus(); shell.focus();
  Object.assign(window, { __hangNhacDiagnostics: () => ({ ready, mapId: HANG_NHAC.id, version: HANG_NHAC.version,
    world: HANG_NHAC.world, zoom: renderer.zoom, shell:shell.diagnostics(),viewport:{width:stage.clientWidth,height:stage.clientHeight},cameraCenter:{...renderer.cameraCenter}, blockers: HANG_NHAC.blockers.length, status: network.status,
    mapParts:renderer.mapDiagnostics(),mapArt:hangNhacMapArt(mapArtId),mapBackground:renderer.backgroundMapDiagnostics(),
    connectionDetail: network.detail,
    sessionId: network.room?.sessionId, roomId: network.room?.roomId,
    serverMapVersion: network.room?.state.mapVersion, backgroundBytes: hangNhacMapArt(mapArtId).bytes,input:network.movementDiagnostics(),
    actors: (network.room ? [...actors.values()] : [local]).map(a => ({ id: a.id, assetId: a.assetId, x: a.x, y: a.y,
      own: a.own, direction: a.direction, moving: a.moving, frame: a.animation.frameId, walkable: hangNhacWalkable(a),
      frameSize: a.animation.atlas.frameSize, anchor: a.animation.atlas.anchor })),
    sprites: renderer.scene.children.filter(o => o.type === 'Sprite' && o.userData.entityId).map(o => ({ id: o.userData.entityId, order:o.renderOrder,scale: o.scale.toArray(),clip:o.userData.clip,frameIndex:o.userData.frameIndex,anchor:o.userData.anchor,animationSource:o.userData.animationSource,crop:o.userData.frameCrop,cutouts:o.userData.frameCutouts })) }),
    __hangNhacR01: () => ({ avatarId:avatar.value,profileId:network.room?.state.players?.get(network.room.sessionId)?.profileId,
      profiles:profiles.profiles,own:network.room?.state.players?.get(network.room.sessionId)?.toJSON(),
      targets:network.room?.state.targets?.toJSON(),vfx:presentation.diagnostics(),selectedTarget:skills.selectedTarget,input:skills.diagnostics() }),
    __hangNhacSect:()=>sect.diagnostics(),
    __hangNhacNpcs:()=>({visible:!activityVisible&&(!entry||!!network.room),npcs:LIVE_HANG_NHAC_NPCS}),
    __hangNhacNavigation:()=>({status:navigation.status,reason:navigation.reason,label:navigation.label,remainingRoute:navigation.remainingRoute}),
    __hangNhacSkills:()=>presentation.diagnostics(),
    __hangNhacQuestMotion:()=>questMotion.diagnostics(),
    __hangNhacPixelPlayer:()=>pixelPlayer.diagnostics(),
    __hangNhacEncounterActor:()=>encounterActor.diagnostics(),
    __hangNhacChapter:()=>chapter.diagnostics(),
    __hangNhacCharacter:()=>character.diagnostics(),
  });
  if(import.meta.env.DEV&&entry)Object.assign(window,{__gameEntry:()=>entry.diagnostics()});
  previous = performance.now(); requestAnimationFrame(frame);
  if(entry){await entry.bootstrap(new URLSearchParams(location.search).get('screen')==='title');updateStatus();}
  else{
    if (profiles.token) { try { await profiles.open(); } catch(error) { feedback(error instanceof Error?error.message:String(error)); } updateStatus(); }
    const active=profiles.active(); if(active&&isAvatarId(active.avatarId)) { avatar.value=active.avatarId; local=createActor('local',avatar.value,names[avatar.value],local,true); await enter(); }
  }
}
void init().catch(error => {
  ready = false; loading.hidden = false;
  loading.textContent = `Không mở được Hằng Nhạc: ${error instanceof Error ? error.message : String(error)}`;
  shell.sync({ready:false,opening:false,status:network.status,ownConnected:false});
  renderer?.dispose();
});
window.addEventListener('pagehide', () => { clearInput(); daoHud?.dispose();entry?.dispose();character.dispose(); chapter.dispose();chapterPresentation?.dispose();encounterActor?.dispose();gameUI.dispose(); shell.dispose(); network.suspend(); skills.dispose(); questMotion?.dispose(); pixelPlayer?.dispose();lessonPresentation?.dispose(); presentation?.dispose(); renderer?.dispose(); });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
