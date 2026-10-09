import { PreviewRenderer, type RenderActor } from './render/renderer';
import { AnimationPlayer } from './assets/animation';
import { type ActorDefinition } from './assets/atlas';
import { STARTER, starterScene, starterZoneAt, moveInStarter, isStarterWalkable } from '../../shared/starter-region';
import type { Direction, Position } from '@shared/world/types';

const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = element('stage');
const actorSelect = element<HTMLSelectElement>('actor');
const zoneSelect = element<HTMLSelectElement>('zone-select');
const questSelect = element<HTMLSelectElement>('quest-select');
const keys = new Set<string>();
const touch = new Set<Direction>();
let sceneId = STARTER.world.mainSceneId;
let player: RenderActor;
let renderer: PreviewRenderer;
let npc: RenderActor | undefined;
let lastTime = performance.now();
let currentZoneId = '';
let pointLabels: Array<{ point: Position; label: HTMLDivElement; id: string }> = [];
const clearInput = () => { keys.clear(); touch.clear(); document.querySelectorAll('[data-direction]').forEach(b => b.classList.remove('active')); };

const allNames = new Map<string,string>([...STARTER.world.npcs, ...STARTER.world.pois, ...STARTER.encounters, ...STARTER.items, ...STARTER.recipes].map(v => [v.id,v.name]));
const mainQuests = STARTER.quests.filter(q => q.kind === 'main');
zoneSelect.replaceChildren(...STARTER.world.zones.map(z => new Option(z.name, z.id)));
questSelect.replaceChildren(...mainQuests.map(q => new Option(`${q.id} · ${q.name}`, q.id)));

function updateQuest(): void {
  const q = mainQuests.find(q => q.id === questSelect.value)!;
  element('quest-title').textContent = q.name;
  element('quest-dialogue').textContent = `${allNames.get(q.giverNpcId) ?? q.giverNpcId}: “${q.dialogue}”`;
  const verbs: Record<string,string> = { talk:'Nói chuyện', kill:'Hạ', gather:'Thu thập tại', train:'Luyện tập tại', meditate_seconds:'Thổ nạp tại', discover:'Tìm đường đến', craft:'Chế tạo', equip_slot:'Trang bị ô', claim_first_clear:'Nhận thưởng tại' };
  element('quest-objectives').replaceChildren(...q.objectives.map(o => {
    const li = document.createElement('li');
    li.textContent = `${verbs[o.type] ?? o.type}: ${allNames.get(o.targetId) ?? (o.targetId === 'amulet' ? 'hộ phù' : o.targetId)} · ${o.count}${o.type === 'meditate_seconds' ? ' giây' : ''}`; return li;
  }));
  element('quest-reward').textContent = `Tu vi: ${q.rewardTuvi}. ${q.prerequisites.length ? `Sau ${q.prerequisites.join(', ')}.` : 'Nhiệm vụ đầu.'} Thưởng và mở khóa theo thiết kế MVP.`;
}
questSelect.addEventListener('change', updateQuest); updateQuest();

function miniMap(): void {
  const scene = starterScene(sceneId);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox',`0 0 ${scene.width} ${scene.height}`);
  const rect = (r: {x:number;y:number;w:number;h:number}, color:string) => { const node = document.createElementNS(ns,'rect'); Object.entries({x:r.x,y:r.y,width:r.w,height:r.h,fill:color}).forEach(([k,v])=>node.setAttribute(k,String(v))); svg.append(node); };
  if (sceneId === STARTER.world.mainSceneId) STARTER.world.corridors.forEach(c=>rect(c.rect,'#e6d9bc'));
  for (const z of STARTER.world.zones.filter(z=>z.sceneId===sceneId)) {
    rect(z.rect,z.color);const name = document.createElementNS(ns,'text');name.textContent=z.name;name.setAttribute('x',String(z.rect.x+32));name.setAttribute('y',String(z.rect.y+90));name.setAttribute('font-size',sceneId===STARTER.world.mainSceneId?'110':'38');name.setAttribute('fill','#252722');svg.append(name);
  }
  const dot = document.createElementNS(ns,'circle');dot.id='minimap-player';dot.setAttribute('r',sceneId===STARTER.world.mainSceneId?'34':'10');dot.setAttribute('fill','#963f33');dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','12');svg.append(dot);
  element('minimap').replaceChildren(svg);
}
function buildLayout(): void {
  const scene = starterScene(sceneId);
  const zones = STARTER.world.zones.filter(z=>z.sceneId===sceneId);
  renderer.setMapLayout({ width:scene.width,height:scene.height,color:'#a4ad95',
    ground:[...zones.map(z=>({...z.rect,color:z.color})), ...(sceneId===STARTER.world.mainSceneId ? STARTER.world.corridors.map(c=>({...c.rect,color:'#e1d3b5'})) : [])],
    obstacles:STARTER.world.obstacles.filter(o=>o.sceneId===sceneId).map(o=>({...o.rect,color:o.color,visualHeight:o.visualHeight})) });
  const visibleZoneIds = new Set(zones.map(z=>z.id));
  const marks = [
    ...STARTER.world.npcs.filter(n=>visibleZoneIds.has(n.zoneId) && n.id!=='CHR-WANG-LIN').map(n=>({...n,kind:'npc'})),
    ...STARTER.world.pois.filter(p=>visibleZoneIds.has(p.zoneId)),
    ...STARTER.encounters.filter(e=>visibleZoneIds.has(e.zoneId)).map(e=>({...e,kind:'monster'}))
  ];
  element('point-labels').replaceChildren();
  pointLabels = marks.map(p=>{const label=document.createElement('div');label.className=`point-label ${p.kind}`;label.textContent=p.name;element('point-labels').append(label);return {point:p.point,label,id:p.id};});
  npc = undefined;
  if (sceneId===STARTER.world.mainSceneId && player.assetId!=='CHR-WANG-LIN-CHIBI') {
    const wang=renderer.assets.get('CHR-WANG-LIN-CHIBI')!;const point=STARTER.world.npcs.find(n=>n.id==='CHR-WANG-LIN')!.point;
    npc={id:'wang-lin-npc',name:'Vương Lâm · áo xám',assetId:wang.definition.id,own:false,...point,direction:'south',moving:false,animation:new AnimationPlayer(wang.atlas)};
  }
  miniMap(); currentZoneId='';
}
function visitZone(id: string, point?: Position): void {
  const zone = STARTER.world.zones.find(z=>z.id===id)!;
  sceneId=zone.sceneId;const spawn=point ?? zone.entry;
  if (!isStarterWalkable(sceneId,spawn)) throw new Error('Điểm đến bị chặn.');
  Object.assign(player,spawn,{direction:'south',moving:false});player.animation.set('stand','south');clearInput();buildLayout();
  zoneSelect.value=zone.id; element('zone-description').textContent=zone.narrative;
  stage.focus({preventScroll:true});
}
element('visit-zone').addEventListener('click',()=>visitZone(zoneSelect.value));
zoneSelect.addEventListener('change',()=>{element('zone-description').textContent=STARTER.world.zones.find(z=>z.id===zoneSelect.value)!.narrative;});
element<HTMLSelectElement>('zoom').addEventListener('change',event=>{renderer.zoom=Number((event.target as HTMLSelectElement).value);});
actorSelect.addEventListener('change',()=>{
  const asset=renderer.assets.get(actorSelect.value)!;player.assetId=asset.definition.id;player.name=asset.definition.name;player.animation=new AnimationPlayer(asset.atlas);player.animation.fps=5;clearInput();buildLayout();
});
function nearestPortal() {
  return STARTER.world.pois.find(p=>p.kind==='portal' && STARTER.world.zones.find(z=>z.id===p.zoneId)!.sceneId===sceneId && Math.hypot(p.point.x-player.x,p.point.y-player.y)<=96);
}
function interact(): void {
  const portal=nearestPortal();
  if (!portal) return;
  if (portal.id==='PORTAL-WOLF') visitZone('ZONE-CAVE');
  else visitZone('ZONE-RAVINE',STARTER.world.pois.find(p=>p.id==='PORTAL-WOLF')!.point);
}
element('interact').addEventListener('click',interact);
window.addEventListener('keydown',event=>{
  if (event.ctrlKey || event.altKey || event.metaKey || (event.target as HTMLElement).closest('input,select,textarea,button')) return;
  const key=event.key.toLowerCase();
  if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) { keys.add(key);event.preventDefault(); }
  if (key==='e' && !event.repeat) {interact();event.preventDefault();}
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',clearInput);
stage.addEventListener('pointerdown',()=>stage.focus({preventScroll:true}));
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>{
  const d=button.dataset.direction as Direction;
  button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);touch.add(d);button.classList.add('active');stage.focus({preventScroll:true});});
  const end=()=>{touch.delete(d);button.classList.remove('active');};button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',end);
});
function loop(now:number): void {
  const dt=Math.min((now-lastTime)/1000,.1);lastTime=now;
  const canMove=document.hasFocus() && !document.hidden && !document.activeElement?.matches('input,select,textarea,button');
  const input=canMove?{x:Number(keys.has('d')||keys.has('arrowright')||touch.has('east'))-Number(keys.has('a')||keys.has('arrowleft')||touch.has('west')),y:Number(keys.has('s')||keys.has('arrowdown')||touch.has('south'))-Number(keys.has('w')||keys.has('arrowup')||touch.has('north'))}:{x:0,y:0};
  const prior={x:player.x,y:player.y};Object.assign(player,moveInStarter(sceneId,player,input,dt));
  player.animation.updateFromTravel(Math.hypot(player.x-prior.x,player.y-prior.y),player.direction,player.moving,24);
  const scene=starterScene(sceneId);const halfW=stage.clientWidth/(2*renderer.zoom),halfH=stage.clientHeight/(2*renderer.zoom);
  const clamp=(value:number,half:number,limit:number)=>limit<2*half?limit/2:Math.max(half,Math.min(limit-half,value));
  renderer.cameraCenter={x:clamp(player.x,halfW,scene.width),y:clamp(player.y,halfH,scene.height)};renderer.render(npc?[player,npc]:[player]);
  const zone=starterZoneAt(sceneId,player);
  if (zone && zone.id!==currentZoneId) {currentZoneId=zone.id;element('zone-label').textContent=zone.name;}
  if (!zone) { currentZoneId=''; element('zone-label').textContent='Đường nối giữa các khu'; }
  element('position-label').textContent=`${Math.round(player.x)}, ${Math.round(player.y)} · ${renderer.zoom}× · 64 × 96`;
  const portal=nearestPortal();element('interact').setAttribute('aria-disabled',String(!portal));
  element('nearby').textContent=portal?`${portal.name} · E để đi thử qua cửa.`:'WASD / phím mũi tên · giữ cỡ người, camera cuộn theo vị trí.';
  for (const p of pointLabels) {const x=(p.point.x-renderer.cameraCenter.x)*renderer.zoom+stage.clientWidth/2;const y=(p.point.y-renderer.cameraCenter.y)*renderer.zoom+stage.clientHeight/2;p.label.hidden=!element<HTMLInputElement>('markers').checked||x<0||y<0||x>stage.clientWidth||y>stage.clientHeight;p.label.style.left=`${Math.round(x)}px`;p.label.style.top=`${Math.round(y)}px`;}
  const dot=document.getElementById('minimap-player');dot?.setAttribute('cx',String(player.x));dot?.setAttribute('cy',String(player.y));
  requestAnimationFrame(loop);
}
async function start(): Promise<void> {
  const response=await fetch('/assets/catalog.json',{cache:'no-store'});if(!response.ok)throw new Error('Không nạp được catalog nhân vật.');
  const catalog=await response.json() as {actors:ActorDefinition[];backgroundUrl?:string};
  renderer=new PreviewRenderer(stage,element('world-labels'));renderer.mode='map';renderer.zoom=1;renderer.debug=false;
  await renderer.loadActors(catalog.actors.filter(a=>['AVATAR-NOVICE-MALE','AVATAR-NOVICE-FEMALE','CHR-WANG-LIN-CHIBI'].includes(a.id)),catalog.backgroundUrl);
  const asset=renderer.assets.get(actorSelect.value)!;
  player={id:'region-player',name:asset.definition.name,assetId:asset.definition.id,own:true,...starterScene(sceneId).spawn,direction:'south',moving:false,animation:new AnimationPlayer(asset.atlas)};
  buildLayout();
  element('zone-description').textContent=STARTER.world.zones.find(z=>z.id===zoneSelect.value)!.narrative;
  (window as unknown as {__starterDiagnostics:()=>unknown}).__starterDiagnostics=()=>({sceneId,worldSize:[starterScene(sceneId).width,starterScene(sceneId).height],zoneId:starterZoneAt(sceneId,player)?.id,zoom:renderer.zoom,frameSize:renderer.assets.get(player.assetId)!.atlas.frameSize,player:{x:player.x,y:player.y,moving:player.moving,direction:player.direction,frame:player.animation.frameId,assetId:player.assetId},walkable:isStarterWalkable(sceneId,player),loadedAssets:renderer.assets.size,nearestPortalId:nearestPortal()?.id,combatImplemented:false});
  requestAnimationFrame(loop);
}
start().catch(error=>{element('error').hidden=false;element('error').textContent=String(error);element('zone-label').textContent='Lỗi nạp map';});
