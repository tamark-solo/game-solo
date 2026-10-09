import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client, type Room } from '@colyseus/sdk';
import type { CourtyardState } from '../server/src/state';
import { ProfileStore } from '../server/src/profile-store';
import { HANG_NHAC, HANG_NHAC_AVATARS, HANG_NHAC_ROOM } from '../shared/hang-nhac';
import type { PublicProfile, AvatarId } from '../shared/profiles';
import { SECT_STATIONS, type SectCommand, type SectResult, type SectView } from '../shared/sect';
// @ts-expect-error Shared process helper is JavaScript.
import { startService, waitFor } from './support/services.mjs';

const endpoint='http://127.0.0.1:2593';await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-sect-online-'));
const dbPath=resolve(folder,'profiles.sqlite'),env={PORT:'2593',GAME_DB_PATH:dbPath};
let service=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,env);
const checks:string[]=[],rooms:Room<CourtyardState>[]=[];
let view:SectView|undefined;const results=new Map<string,SectResult>();let serial=0;
const list=async(token:string):Promise<PublicProfile[]> => (await(await fetch(`${endpoint}/api/profiles`,{headers:{Authorization:`Bearer ${token}`}})).json()).profiles;
const stop=async()=>{service.stop();await waitFor(()=>service.child.exitCode!==null||service.child.signalCode!==null,'service stopped');};
try {
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as {token:string};
  const seed=(avatarId:AvatarId,stationIndex:number,hp?:number)=>{const store=new ProfileStore(dbPath);try{const p=store.get(store.authenticate(guest.token)!,avatarId);p.x=SECT_STATIONS[stationIndex]!.x+24;p.y=SECT_STATIONS[stationIndex]!.y;if(hp!==undefined)p.hp=hp;store.save(p);}finally{store.close();}};
  seed(HANG_NHAC_AVATARS[0],0);
  const connect=async(avatarId:AvatarId,resume?:string)=>{
    const client=new Client(endpoint);view=undefined;
    const room=resume?await client.reconnect<CourtyardState>(resume):await client.joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,{avatarId,mapVersion:HANG_NHAC.version,accountToken:guest.token});
    rooms.push(room);room.onMessage('profile:saved',()=>undefined);room.onMessage('skill:event',()=>undefined);room.onMessage('skill:result',()=>undefined);room.onMessage('training:result',()=>undefined);
    room.onMessage('sect:state',(state:SectView)=>{view=state;});room.onMessage('sect:result',(result:SectResult)=>{if(result.requestId)results.set(result.requestId,result);});
    room.send('sect:sync');await waitFor(()=>!!view&&!!room.state.players.get(room.sessionId),'sect state');return room;
  };
  let room=await connect(HANG_NHAC_AVATARS[0]);
  const peer=await new Client(endpoint).joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,{avatarId:HANG_NHAC_AVATARS[2],mapVersion:HANG_NHAC.version});rooms.push(peer);
  peer.onMessage('skill:event',()=>undefined);await waitFor(()=>peer.state.players.size===2,'independent drop observer');
  const command=async(action:SectCommand['action'],extra:Partial<SectCommand>={})=>{
    const cmd={id:`sect-${++serial}`,action,...extra};results.delete(cmd.id);room.send('sect:command',cmd);
    await waitFor(()=>results.has(cmd.id),action);return {cmd,result:results.get(cmd.id)!};
  };
  assert.equal((await command('activity_start')).result.reason,'distance');
  assert.equal((await command('talk',{stationId:'guide'})).result.ok,true);
  const intro=await command('accept_intro');assert.equal(intro.result.ok,true);await waitFor(()=>view?.hn01,'intro committed');
  assert.equal(view!.supplies,2);const introRepeat=await command('accept_intro');assert.equal(introRepeat.result.reason,'already_complete');assert.equal(view!.supplies,2);
  room.send('sect:command',intro.cmd);await waitFor(()=>results.get(intro.cmd.id)?.duplicate,'intro retry');assert.equal((await list(guest.token))[0]!.sect.supplies,2);
  checks.push('proximity_and_one_time_intro_supplies');
  await room.leave(true);seed(HANG_NHAC_AVATARS[0],1);room=await connect(HANG_NHAC_AVATARS[0]);
  assert.equal((await command('confirm_m01')).result.ok,false);await command('cycle_start');await waitFor(()=>!!view?.cycleReadyAt,'cycle begun');
  assert.equal((await command('cycle_step',{step:0})).result.reason,'settling');
  for(let step=0;step<3;step++){
    await waitFor(()=>view?.cycleStatus==='ready','timed cycle phase',7000);
    const phase=await command('cycle_step',{step});assert.equal(phase.result.ok,true);await waitFor(()=>view?.cycleStep===step+1,'saved phase');
    room.send('sect:command',phase.cmd);await waitFor(()=>results.get(phase.cmd.id)?.duplicate,'phase retry');assert.equal(view!.cycleStep,step+1);
    if(step===0){const resume=room.reconnectionToken,id=room.sessionId;room.reconnection.enabled=false;room.connection.close(4999);
      await waitFor(()=>peer.state.players.get(id)?.connected===false,'cycle dropped');room=await connect(HANG_NHAC_AVATARS[0],resume);
      assert.equal(room.sessionId,id);assert.equal(view!.cycleStep,1);assert.equal(view!.cycleStatus,'idle');await command('cycle_start');}
  }
  assert.equal((await command('understanding',{answer:'mp'})).result.reason,'understanding');
  await command('understanding',{answer:'cultivation'});await waitFor(()=>view?.cycleStep===4,'understanding committed');
  const m01=await command('confirm_m01');assert.equal(m01.result.ok,true);await waitFor(()=>view?.hn02,'M01 committed');assert.equal(view!.cultivation,100);assert.equal(view!.level,1);
  await command('confirm_m01');assert.equal(view!.cultivation,100);checks.push('three_timed_phases_resume_understanding_and_one_time_m01');
  const activity=await command('activity_start');await waitFor(()=>view!.cultivation>=102,'server accumulation');
  room.send('skill:cast',{id:'pause-cultivation',skillId:'sword',aimX:1,aimY:0,targetId:''});
  await waitFor(()=>view?.activityStatus==='paused','practice pause');const paused=view!.cultivation;
  await new Promise(resolve=>setTimeout(resolve,500));room.send('sect:sync');await waitFor(()=>view?.activityStatus==='paused','paused state');assert.equal(view!.cultivation,paused);
  await waitFor(()=>view?.activityStatus==='running','practice finished');await command('activity_stop');await waitFor(()=>view?.activity===false,'stopped');
  const stopped=view!.cultivation;room.send('sect:command',activity.cmd);await waitFor(()=>results.get(activity.cmd.id)?.duplicate,'old activity receipt');
  await new Promise(resolve=>setTimeout(resolve,600));room.send('sect:sync');assert.equal(view!.activity,false);assert.equal(view!.cultivation,stopped);
  checks.push('server_timed_cultivation_practice_pause_and_old_receipt_never_restarts_activity');
  await room.leave(true);seed(HANG_NHAC_AVATARS[0],1,50);room=await connect(HANG_NHAC_AVATARS[0]);
  const recovery=await command('use_recovery');assert.equal(recovery.result.ok,true);await waitFor(()=>room.state.players.get(room.sessionId)?.hp===80,'recovery HP');assert.equal(view!.supplies,1);
  room.send('sect:command',recovery.cmd);await waitFor(()=>results.get(recovery.cmd.id)?.duplicate,'recovery retry');assert.equal(view!.supplies,1);assert.equal(room.state.players.get(room.sessionId)!.hp,80);
  assert.equal((await command('use_recovery')).result.reason,'cooldown');await command('activity_start');
  const droppedId=room.sessionId;room.reconnection.enabled=false;room.connection.close(4999);await waitFor(()=>peer.state.players.get(droppedId)?.connected===false,'drop observed');
  const dropped=(await list(guest.token))[0]!;await new Promise(resolve=>setTimeout(resolve,1600));const afterDrop=(await list(guest.token))[0]!;
  assert.equal(afterDrop.cultivation,dropped.cultivation);await stop();service=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,env);
  room=await connect(HANG_NHAC_AVATARS[0]);assert.equal(view!.hn02,true);assert.equal(view!.milestone,'M01');assert.equal(view!.supplies,1);
  assert.ok(view!.cultivation-afterDrop.cultivation<=2,'restart cannot catch up wall-clock absence');
  room.send('sect:command',m01.cmd);await waitFor(()=>results.get(m01.cmd.id)?.duplicate,'M01 after restart');assert.ok(view!.cultivation<150);
  checks.push('recovery_spend_atomic_restart_restores_progress_no_offline_reward');
  await room.leave(true);
  for(const avatarId of HANG_NHAC_AVATARS.slice(1)){
    seed(avatarId,0);room=await connect(avatarId);assert.equal(view!.hn01,false);assert.equal(view!.cultivation,0);await command('accept_intro');await room.leave(true);
    seed(avatarId,1);room=await connect(avatarId);await command('cycle_start');await waitFor(()=>view?.foundation!=='none','individual foundation');
    assert.equal(view!.foundation,avatarId===HANG_NHAC_AVATARS[1]?'spirit':'breathing');assert.equal(view!.hn02,false);await room.leave(true);
  }
  const profiles=await list(guest.token);assert.equal(profiles[0]!.sect.hn02,true);assert.ok(profiles.slice(1).every(p=>!p.sect.hn02&&p.cultivation===0&&p.skills.length===3));
  checks.push('trio_separate_tutorial_and_spirit_foundation');
  await writeFile('artifacts/hang-nhac-sect-online-verification.json',JSON.stringify({passed:true,date:new Date().toISOString(),checks,mapVersion:HANG_NHAC.version,realOwnerDbWritten:false},null,2));
  console.log(JSON.stringify({ok:true,checks},null,2));
}finally{for(const room of rooms){room.reconnection.enabled=false;room.connection.close(4000);}await stop();}
