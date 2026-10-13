import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {HANG_NHAC_NPCS,LIVE_HANG_NHAC_NPCS,nearLifeNpc,nearbyLifeNpc,npcLifeAvailable,npcLore,npcStationName,type NpcLifeContext} from '../../client/src/npc-life';
import {HANG_NHAC,hangNhacWalkable} from '../../shared/hang-nhac';
import {initialSectProgress,SECT_STATIONS,type SectView} from '../../shared/sect';
import {initialChapter} from '../../shared/chapter';
import {sectRoute} from '../../shared/sect-route';

const view=():SectView=>({...initialSectProgress(),profileId:'npc-fixture',cultivation:0,milestone:'introduction',savedAt:0,hp:100,practising:false,activityStatus:'locked',cycleStatus:'idle',cycleReadyAt:0,chapter:initialChapter()});
const lore=LIVE_HANG_NHAC_NPCS.filter(n=>!n.stationId);
const context=():NpcLifeContext=>({position:lore[0],profileId:'npc-fixture',view:view(),online:true,scene:'hub',visible:true,focused:true,blocked:false,alive:true});

test('Wave A follows the roster and existing stations while all points have a path from spawn',()=>{
 const plan=JSON.parse(readFileSync('docs/design/world/van-hai-living-world-v1/plan.json','utf8'));
 const placement=JSON.parse(readFileSync('docs/design/world/van-hai-living-world-v1/placement.json','utf8'));
 assert.equal(HANG_NHAC_NPCS.length,14);assert.equal(LIVE_HANG_NHAC_NPCS.length,10);assert.equal(lore.length,6);
 for(const npc of LIVE_HANG_NHAC_NPCS){
  assert.equal(npc.wave,'A');assert.ok(hangNhacWalkable(npc,24),`${npc.name}: standing clearance`);
  assert.ok(sectRoute(HANG_NHAC.world.spawn,npc),`${npc.name}: route`);
  assert.ok(JSON.stringify(plan).includes(npc.id));
  const pin=placement.npcs.find((pin:{id:string})=>pin.id===npc.id);assert.deepEqual({x:pin.x,y:pin.y},{x:npc.x,y:npc.y},`${npc.name}: placement preview matches runtime`);
  if(npc.stationId){const s=SECT_STATIONS.find(s=>s.id===npc.stationId)!;assert.equal(npc.x,s.x);assert.equal(npc.y,s.y);assert.equal(npc.assetId,s.avatarId);assert.ok(npcStationName(s.id).includes(s.name));}
 }
 assert.equal(HANG_NHAC_NPCS.find(n=>n.name==='Kỷ An')?.assetId,'AVATAR-NOVICE-FEMALE');
});

test('lore requires matching profile, live hub, proximity, sight and prioritizes station E',()=>{
 const c=context();assert.equal(npcLifeAvailable(c),true);assert.equal(nearbyLifeNpc(c)?.name,'Bạch Chỉ');
 for(const patch of [{online:false},{scene:'outer'},{visible:false},{focused:false},{blocked:true},{alive:false},{profileId:'other'},{view:undefined}])assert.equal(nearbyLifeNpc({...c,...patch}),undefined);
 const away={...c,position:{x:lore[0].x+73,y:lore[0].y}};assert.equal(nearbyLifeNpc(away),undefined);
 assert.equal(nearLifeNpc({x:0,y:0},{...lore[0],x:0,y:0}),false,'blocked ground cannot talk through sight check');
 const overlap={...c,position:{x:688,y:925}};assert.equal(nearLifeNpc(overlap.position,lore[0]),true);assert.equal(nearbyLifeNpc(overlap),undefined,'cultivation station wins overlap');
 const outer=view();outer.chapter!.scene='outer';assert.equal(npcLifeAvailable({...c,view:outer}),false);
 for(const active of ['arts','avoid'] as const){const lesson=view();lesson.lessons.active=active;assert.equal(lesson.practising,false);assert.equal(npcLifeAvailable({...c,view:lesson}),false,'an open lesson blocks lore even between casts');}
 const casting=view();casting.practising=true;assert.equal(npcLifeAvailable({...c,view:casting}),false);
 const resumed=view();assert.equal(npcLifeAvailable({...c,view:resumed}),true,'lore becomes available after the lesson ends');
});

test('lore reads per-profile facts without changing progress or issuing commands',()=>{
 const v=view(),before=JSON.stringify(v),keeper=lore.find(n=>n.name==='Hứa Hành')!;
 for(const npc of lore)assert.ok(npcLore(npc,v)[0]===npc.quote);
 assert.equal(JSON.stringify(v),before);
 const reported=view();reported.chapter!.report='test';assert.match(npcLore(keeper,reported).join(' '),/giữ được khí/);
 assert.doesNotMatch(npcLore(keeper,v).join(' '),/giữ được khí/);
 for(const name of ['Bạch Chỉ','Tống Thiết','Đinh Sóc','Phùng Dã'])assert.match(npcLore(lore.find(n=>n.name===name)!,v).join(' '),/Chưa mở/);
});
