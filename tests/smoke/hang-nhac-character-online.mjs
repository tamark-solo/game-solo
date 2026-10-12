import assert from 'node:assert/strict';import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {Client} from '@colyseus/sdk';import {ProfileStore} from '../../server/src/profile-store.ts';
import {HANG_NHAC,HANG_NHAC_ROOM,HANG_NHAC_AVATARS} from '../../shared/hang-nhac.ts';import {ownedItemId} from '../../shared/character-inventory.ts';
import {startService,waitFor} from '../support/services.mjs';
const endpoint='http://127.0.0.1:2628';await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-character-online-')),path=resolve(folder,'profiles.sqlite');
let service=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2628',GAME_DB_PATH:path});
const rooms=[],checks=[],views=[],results=[],events=[];let room;
const create=()=>fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());
const guest=await create();let store=new ProfileStore(path);let p=store.get(store.authenticate(guest.token),HANG_NHAC_AVATARS[0]);p.hp=50;p.sect.hn01=true;p.sect.supplies=2;store.save(p);store.close();
const client=new Client(endpoint),join=async(avatar,token=guest.token)=>{
  const r=await client.joinOrCreate(HANG_NHAC_ROOM,{mapVersion:HANG_NHAC.version,avatarId:avatar,accountToken:token});rooms.push(r);
  r.onMessage('profile:saved',()=>{});r.onMessage('sect:state',()=>{});r.onMessage('sect:result',()=>{});r.onMessage('skill:event',()=>{});
  r.onMessage('character:state',v=>{if(r===room)views.push(v);});r.onMessage('character:result',v=>{if(r===room)results.push(v);});r.onMessage('sect:animation',event=>{if(r===room)events.push(event);});
  await waitFor(()=>r.state.players.get(r.sessionId)?.connected,'own state');return r;
};
const sync=async()=>{const n=views.length;room.send('character:sync');await waitFor(()=>views.length>n,'character sync');return views.at(-1);};
const command=async cmd=>{const n=results.length;room.send('character:command',cmd);await waitFor(()=>results.length>n,'character ack');await sync();return results.at(-1);};
try{
  room=await join(HANG_NHAC_AVATARS[0]);let view=await sync();assert.equal(view.items.length,3);assert.equal(view.hp,50);assert.equal(view.items.find(i=>i.definitionId==='recovery').quantity,2);assert.equal('accountId' in view,false);
  const peerGuest=await create(),peer=await join(HANG_NHAC_AVATARS[2],peerGuest.token),peerViews=[];peer.onMessage('character:state',v=>peerViews.push(v));peer.send('character:sync');await waitFor(()=>peerViews.length,'peer inventory');
  assert.notEqual(peerViews.at(-1).profileId,view.profileId);assert.equal(peerViews.at(-1).items.length,2);
  const weapon=ownedItemId(p.id,'wood-sword'),recovery=ownedItemId(p.id,'recovery');
  assert.equal((await command({id:'unequip1',action:'unequip',itemId:weapon})).ok,true);assert.equal(views.at(-1).equipment.weapon,undefined);assert.equal(room.state.players.get(room.sessionId).mp,100);
  assert.equal((await command({id:'protect1',action:'protect',itemId:weapon,protected:true})).ok,true);assert.equal(views.at(-1).items.find(i=>i.id===weapon).protected,true);
  assert.equal((await command({id:'equip1',action:'equip',itemId:weapon})).ok,true);assert.equal(views.at(-1).equipment.weapon,weapon);
  assert.equal((await command({id:'foreign',action:'equip',itemId:peerViews.at(-1).items[0].id})).reason,'item');
  const n=results.length;room.send('character:command',{id:'tamper',action:'use',itemId:recovery,quantity:999});await waitFor(()=>results.length>n,'tamper rejected');assert.equal(results.at(-1).ok,false);
  assert.equal((await command({id:'use1',action:'use',itemId:recovery})).ok,true);assert.equal(views.at(-1).hp,80);assert.equal(views.at(-1).items.find(i=>i.id===recovery).quantity,1);
  assert.equal((await command({id:'use1',action:'use',itemId:recovery})).duplicate,true);assert.equal(views.at(-1).items.find(i=>i.id===recovery).quantity,1);assert.equal(events.filter(event=>event.id===`character:${room.sessionId}:use1`).length,1);
  assert.equal((await command({id:'use1',action:'protect',itemId:recovery,protected:true})).reason,'request_reused');
  assert.equal((await command({id:'use2',action:'use',itemId:recovery})).reason,'cooldown');
  assert.equal(peerViews.at(-1).items.length,2);assert.equal(peerViews.some(view=>view.profileId===p.id),false);
  checks.push('private snapshots, real supplies, per-profile ownership, injection rejection, one committed use/FX, durable command identity and cooldown');
  const token=room.reconnectionToken,session=room.sessionId;room.reconnection.enabled=false;room.connection.close(4999);await waitFor(()=>peer.state.players.get(session)?.connected===false,'drop');
  room=await client.reconnect(token);rooms.push(room);room.onMessage('profile:saved',()=>{});room.onMessage('character:state',v=>views.push(v));room.onMessage('character:result',v=>results.push(v));room.onMessage('sect:animation',()=>{});
  await waitFor(()=>room.state.players.get(room.sessionId)?.connected,'reconnected');view=await sync();assert.equal(view.profileId,p.id);assert.equal(view.items.find(i=>i.id===recovery).quantity,1);
  checks.push('same-session reconnect restores real inventory without replay');
  await room.leave(true);await waitFor(()=>!peer.state.players.has(session),'lease release');
  for(const avatar of HANG_NHAC_AVATARS.slice(1)){room=await join(avatar);view=await sync();assert.equal(view.items.length,2);assert.ok(view.items.every(i=>i.id.startsWith(view.profileId+'_')));assert.ok(view.items.every(i=>!i.protected));await room.leave(true);}
  checks.push('three independent profiles and stable starter gear');
  for(const r of rooms)r.reconnection.enabled=false;service.stop();await waitFor(()=>service.child.exitCode!==null||service.child.signalCode!==null,'backend stopped');
  service=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2628',GAME_DB_PATH:path});room=await join(HANG_NHAC_AVATARS[0]);view=await sync();
  assert.equal(view.hp,80);assert.equal(view.items.find(i=>i.id===weapon).protected,true);assert.equal(view.equipment.weapon,weapon);assert.equal(view.items.length,3);
  assert.equal((await command({id:'use1',action:'use',itemId:recovery})).duplicate,true);assert.equal(views.at(-1).items.find(i=>i.id===recovery).quantity,1);assert.equal(views.at(-1).hp,80);
  checks.push('process restart preserves equipment/protection/supplies/receipts without starter duplication or repeated use');
  await writeFile('artifacts/hang-nhac-character-online-verification.json',JSON.stringify({date:'2026-10-10',passed:true,checks,view:views.at(-1)},null,2)+'\n');console.log(`Character online: ${checks.length} groups passed.`);
}finally{for(const r of rooms){r.reconnection.enabled=false;if(r.connection.isOpen)await r.leave(true).catch(()=>{});}service.stop();}
