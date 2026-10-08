import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STARTER, starterScene, isStarterWalkable, moveInStarter } from '../shared/starter-region';
import type { Position } from '../shared/world';

test('starter region keeps native character dimensions and every shared POI reachable', () => {
  assert.deepEqual(STARTER.art.frameSizePx,[64,96]); assert.equal(STARTER.art.worldPixelPerNativePixel,1);
  const scene=starterScene(STARTER.world.mainSceneId);assert.deepEqual([scene.width,scene.height],[3840,2560]);
  const key=(p:Position)=>`${p.x},${p.y}`;const visited=new Set([key(scene.spawn)]);const queue:Position[]=[scene.spawn];
  for(let index=0;index<queue.length;index++) {
    const p=queue[index];for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]) {
      const next={x:p.x+dx,y:p.y+dy};const id=key(next);
      if(!visited.has(id)&&isStarterWalkable(scene.id,next)){visited.add(id);queue.push(next);}
    }
  }
  for(const z of STARTER.world.zones.filter(z=>z.sceneId===scene.id))assert.ok(visited.has(key(z.entry)),`Isolated zone ${z.id}`);
  for(const p of [...STARTER.world.npcs,...STARTER.world.pois,...STARTER.encounters]) {
    if(STARTER.world.zones.find(z=>z.id===p.zoneId)!.sceneId===scene.id)assert.ok(visited.has(key(p.point)),`Unreachable ${p.id}`);
  }
  assert.ok(!isStarterWalkable(scene.id,{x:16,y:16}));
  const boss=starterScene('INSTANCE-WOLF');assert.ok(isStarterWalkable(boss.id,boss.spawn));
});

test('region movement normalizes diagonals and cannot cross a house or leave navigation', () => {
  const scene=STARTER.world.mainSceneId;const start={x:640,y:656,direction:'south' as const,moving:false};
  const diagonal=moveInStarter(scene,start,{x:1,y:1},.1);assert.ok(Math.abs(Math.hypot(diagonal.x-start.x,diagonal.y-start.y)-8)<1e-6);
  let blocked={x:384,y:432,direction:'north' as const,moving:false};
  for(let n=0;n<60;n++)blocked={...moveInStarter(scene,blocked,{x:0,y:-1},.1),direction:'north'};
  assert.ok(blocked.y>=392);assert.ok(isStarterWalkable(scene,blocked));
  const stopped=moveInStarter(scene,blocked,{x:0,y:0},.1);assert.equal(stopped.moving,false);assert.equal(stopped.y,blocked.y);
});

test('the mandatory quest path reaches each realm gate and Q09 without a rare drop or side quest', () => {
  const main=STARTER.quests.filter(q=>q.kind==='main');assert.equal(main.length,10);
  const inventory=new Map<string,number>();let tuvi=0,coins=0,realm=0;
  const add=(id:string,n:number)=>inventory.set(id,(inventory.get(id)??0)+n);
  for(const quest of main) {
    assert.ok(realm>=quest.minimumRealmLayer!,`Realm softlock before ${quest.id}`);
    for(const objective of quest.objectives) {
      if(objective.type==='kill') {
        const enemy=STARTER.encounters.find(e=>e.id===objective.targetId)!;assert.ok(enemy);tuvi+=enemy.tuvi*objective.count;
        for(const drop of enemy.loot)if(drop.chance===1)add(drop.itemId,drop.quantity*objective.count);
      }
      if(objective.type==='gather') {
        const node=STARTER.world.pois.find(p=>p.id===objective.targetId);
        if(node?.gather && 'itemId' in node.gather)add(node.gather.itemId!,node.gather.quantity!*objective.count);
      }
    }
    tuvi+=quest.rewardTuvi;
    if(quest.rewards.items)for(const [id,n] of quest.rewards.items)add(String(id),Number(n));
    coins+=quest.rewards.coins??0;
    if(quest.id==='Q08') {
      assert.ok((inventory.get('MAT-RESIN')??0)>=2 && (inventory.get('MAT-HIDE')??0)>=2 && (inventory.get('MAT-HERB')??0)>=2 && coins>=15,'Mandatory crafting depends on optional rewards or RNG');
    }
    const gate=STARTER.progression.realmThresholds.find(g=>g.questId===quest.id);
    if(gate){assert.ok(tuvi>=gate.cumulativeTuvi,`Tuvi softlock at ${quest.id}`);realm=gate.layer;}
  }
  assert.equal(tuvi,STARTER.progression.minimumMainPathTuvi);
  assert.equal(STARTER.economy.firstBossGearSelectionGuaranteed,true);
  const known=new Set([...STARTER.items,...STARTER.world.npcs,...STARTER.world.pois,...STARTER.encounters,...STARTER.recipes,...STARTER.storyCards].map(v=>v.id));
  for(const q of STARTER.quests)for(const o of q.objectives) {
    if(o.type==='equip_slot')assert.ok(STARTER.scope.equipmentSlots.includes(o.targetId));else assert.ok(known.has(o.targetId),`Missing objective target ${o.targetId}`);
  }
});
