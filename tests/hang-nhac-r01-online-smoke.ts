import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client, type Room } from '@colyseus/sdk';
import type { CourtyardState } from '../server/src/state';
import type { CastResult, SkillEvent } from '../shared/r01';
import { HANG_NHAC, HANG_NHAC_AVATARS, HANG_NHAC_ROOM, hangNhacWalkable } from '../shared/hang-nhac';
import type { PublicProfile } from '../shared/profiles';
import { MoveInput } from '../shared/netcode';
// @ts-expect-error Shared process helper is JavaScript.
import { startService, waitFor } from './support/services.mjs';

const endpoint='http://127.0.0.1:2591';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-profile-check-'));
const env={PORT:'2591',GAME_DB_PATH:resolve(folder,'profiles.sqlite')};
let service=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,env);
const rooms:Room<CourtyardState>[]=[],checks:string[]=[];
const profileList=async(token:string):Promise<PublicProfile[]> => (await (await fetch(`${endpoint}/api/profiles`,{headers:{Authorization:`Bearer ${token}`}})).json()).profiles;
try{
  assert.equal((await fetch(`${endpoint}/api/profiles`)).status,401);
  assert.equal((await fetch(`${endpoint}/api/profile-session`,{method:'POST',headers:{Origin:'https://external.example'}})).status,403);
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as{token:string;profiles:PublicProfile[]};
  assert.equal(guest.profiles.length,3);assert.ok(guest.profiles.every(p=>p.skills.length===3));
  const client=new Client(endpoint),join=async(avatarId:string)=>{
    const room=await client.joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,{avatarId,mapVersion:HANG_NHAC.version,accountToken:guest.token});rooms.push(room);
    room.onMessage('profile:saved',()=>undefined);await waitFor(()=>room.state.players.get(room.sessionId)?.profileId,'profile state');return room;
  };
  let a=await join(HANG_NHAC_AVATARS[0]);const results:CastResult[]=[],events:SkillEvent[]=[];
  a.onMessage('skill:result',r=>results.push(r));a.onMessage('skill:event',e=>events.push(e));a.onMessage('training:result',()=>undefined);
  const peerGuest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json();
  const peer=await client.joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,{avatarId:HANG_NHAC_AVATARS[2],mapVersion:HANG_NHAC.version,accountToken:peerGuest.token});rooms.push(peer);
  peer.onMessage('profile:saved',()=>undefined);peer.onMessage('skill:event',()=>undefined);
  peer.onMessage('skill:result',()=>undefined);
  await waitFor(()=>peer.state.players.size===2,'peer state');
  assert.ok(Math.hypot(peer.state.players.get(peer.sessionId)!.x-a.state.players.get(a.sessionId)!.x,peer.state.players.get(peer.sessionId)!.y-a.state.players.get(a.sessionId)!.y)>30);
  checks.push('fresh_profiles_spread_around_owner_spawn');
  const heldInput=peer.input({type:MoveInput});heldInput.data.moveX=1;heldInput.send();
  await waitFor(()=>peer.state.players.get(peer.sessionId)!.ack>=heldInput.sentCount,'held input before cast');
  peer.send('skill:cast',{id:'held-gap',skillId:'sword',aimX:1,aimY:0,targetId:''});
  await waitFor(()=>!!peer.state.players.get(peer.sessionId)!.castId,'held cast begins');
  await new Promise(resolve=>setTimeout(resolve,50));heldInput.send();
  await waitFor(()=>peer.state.players.get(peer.sessionId)!.ack>=heldInput.sentCount,'same held input after empty ticks');
  assert.ok(peer.state.players.get(peer.sessionId)!.castId,'missing packets must not turn held input into a new move that cancels the cast');
  checks.push('input_gap_does_not_cancel_an_already_held_cast');
  await assert.rejects(join(HANG_NHAC_AVATARS[1]),/409|tab khác/);checks.push('three_separate_profiles_and_account_lease');
  a.send('training:start',{x:1,y:0});await waitFor(()=>a.state.targets.size===1,'practice target');
  const targetId=`practice-${a.sessionId}`,own=()=>a.state.players.get(a.sessionId)!;
  const sword={id:'persistent-sword',skillId:'sword',aimX:1,aimY:0,targetId};
  a.send('skill:cast',sword);a.send('skill:cast',sword);await waitFor(()=>results.length>=2&&a.state.targets.get(targetId)?.hp===70,'one sword hit');
  assert.equal(own().casts,1);assert.equal(own().practiceHits,1);assert.equal(results.filter(r=>r.duplicate).length,1);assert.equal(events.filter(e=>e.type==='hit').length,1);
  assert.equal(peer.state.players.get(peer.sessionId)!.hp,100);checks.push('sword_single_cost_and_hit_no_pvp');
  await waitFor(()=>!own().castId,'sword recovery');a.send('skill:cast',{id:'persistent-thunder',skillId:'thunder',aimX:1,aimY:0,targetId});
  await waitFor(()=>a.state.targets.get(targetId)?.hp===25,'selected thunder hit');assert.equal(own().practiceHits,2);
  await waitFor(()=>!own().castId,'thunder recovery');const beforeWind=own().x;
  a.send('skill:cast',{id:'persistent-wind',skillId:'wind',aimX:1,aimY:0,targetId:''});
  await waitFor(()=>own().casts===3&&!own().castId,'wind recovery');assert.ok(Math.abs(own().x-beforeWind-160)<.01);assert.ok(hangNhacWalkable(own()));
  assert.equal(events.filter(e=>e.type==='arrival').length,1);checks.push('thunder_selected_target_and_wind_actual_travel');
  const sessionId=a.sessionId,resume=a.reconnectionToken;
  a.reconnection.enabled=false;a.connection.close(4999);await waitFor(()=>peer.state.players.get(sessionId)?.connected===false,'drop');
  const recovered=await client.reconnect<CourtyardState>(resume);rooms.push(recovered);a=recovered;
  a.onMessage('profile:saved',()=>undefined);a.onMessage('skill:event',()=>undefined);await waitFor(()=>own()?.connected,'reconnect');
  assert.equal(a.sessionId,sessionId);assert.equal(own().casts,3);assert.ok(Math.abs(own().x-beforeWind-160)<.01);checks.push('same_profile_reconnect');
  a.send('profile:save');await waitFor(async()=> (await profileList(guest.token))[0].casts===3,'explicit save');
  const saved=(await profileList(guest.token))[0];await a.leave(true);await waitFor(()=>!peer.state.players.has(sessionId),'lease released');
  for(const id of HANG_NHAC_AVATARS.slice(1)){
    const room=await join(id),p=room.state.players.get(room.sessionId)!;
    assert.equal(p.casts,0);assert.equal(p.mp,100);assert.ok(hangNhacWalkable(p)&&Math.hypot(p.x-HANG_NHAC.world.spawn.x,p.y-HANG_NHAC.world.spawn.y)<100);assert.equal(p.progressionKind,id===HANG_NHAC_AVATARS[1]?'recovery':'cultivation');
    const other=room.state.players.get(peer.sessionId)!;assert.ok(Math.hypot(p.x-other.x,p.y-other.y)>=30,'a fresh profile avoids a spawn occupied after another player leaves');
    await room.leave(true);await waitFor(()=>!peer.state.players.has(room.sessionId),'character leaves');
  }
  checks.push('switching_characters_preserves_independent_resources_and_progression_kind');
  for(const room of rooms)room.reconnection.enabled=false;
  service.stop();await waitFor(()=>service.child.exitCode!==null||service.child.signalCode!==null,'server stopped');
  service=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,env);
  a=await join(HANG_NHAC_AVATARS[0]);a.onMessage('skill:result',r=>results.push(r));a.onMessage('skill:event',e=>events.push(e));
  assert.equal(own().profileId,saved.id);assert.equal(own().casts,3);assert.equal(own().practiceHits,2);
  assert.equal(own().nextThunderAt,saved.nextThunderAt);assert.equal(own().nextWindAt,saved.nextWindAt);assert.ok(Math.abs(own().x-saved.x)<.01);
  const priorResults=results.length,priorHits=events.filter(e=>e.type==='hit').length;
  a.send('skill:cast',sword);await waitFor(()=>results.length>priorResults,'persistent receipt');
  assert.equal(results.at(-1)!.duplicate,true);assert.equal(own().casts,3);assert.equal(a.state.projectiles.size,0);assert.equal(events.filter(e=>e.type==='hit').length,priorHits);
  checks.push('process_restart_preserves_position_resources_deadlines_and_idempotency');
  const report={passed:true,version:HANG_NHAC.version,checks,profileCount:3,casts:saved.casts,practiceHits:saved.practiceHits,storage:'sqlite',ownerGeometryUnchanged:true};
  await writeFile('artifacts/hang-nhac-r01-online-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{
  for(const room of rooms){room.reconnection.enabled=false;if(room.connection.transport.isOpen)await room.leave(true).catch(()=>undefined);}
  service.stop();
}
