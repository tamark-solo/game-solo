import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client, type Room } from '@colyseus/sdk';
import type { CourtyardState } from '@shared/protocol/courtyard-state';
import { HANG_NHAC, HANG_NHAC_ROOM } from '../../shared/hang-nhac';
import { MoveInput } from '@shared/protocol/input';
import type { CastCommand, CastResult, SkillEvent } from '../../shared/skills/contracts';
// @ts-expect-error Existing JavaScript process helper.
import { startService, waitFor } from '../support/services.mjs';

const endpoint='http://127.0.0.1:2598';await mkdir('artifacts',{recursive:true});
const folder=await mkdtemp(resolve('artifacts/hn-skill-input-'));
const backend=await startService(['--import','tsx','server/src/index.ts'],`${endpoint}/health`,{PORT:'2598',GAME_DB_PATH:resolve(folder,'profiles.sqlite')});
const rooms:Room<CourtyardState>[]=[],checks:string[]=[],results:CastResult[]=[],events:SkillEvent[]=[];
try {
  const guest=await(await fetch(`${endpoint}/api/profile-session`,{method:'POST'})).json() as {token:string};
  const client=new Client(endpoint),join=async()=>{
    const room=await client.joinOrCreate<CourtyardState>(HANG_NHAC_ROOM,{avatarId:'CHR-WANG-LIN-CHIBI',mapVersion:HANG_NHAC.version,accountToken:guest.token});rooms.push(room);
    room.onMessage('skill:result',(r:CastResult)=>results.push(r));room.onMessage('skill:event',(e:SkillEvent)=>events.push(e));room.onMessage('profile:saved',()=>undefined);
    await waitFor(()=>room.state.players?.get(room.sessionId)?.connected,'own snapshot');return room;
  };
  let room=await join();const own=()=>room.state.players.get(room.sessionId)!;
  const command:CastCommand={id:'input-boundary',skillId:'sword',aimX:-1,aimY:0,targetId:'',inputSeq:1};
  room.send('skill:cast',command);await new Promise(resolve=>setTimeout(resolve,80));assert.equal(own().casts,0);
  const input=room.input({type:MoveInput});input.data.moveX=1;input.data.moveY=0;input.send();
  await waitFor(()=>events.some(e=>e.type==='release'&&e.castId?.endsWith(command.id)),'queued cast release');
  assert.equal(own().casts,1);assert.equal(own().direction,'west');assert.equal(events.filter(e=>e.type==='cancel').length,0);
  checks.push('waits_for_consumed_input_without_extra_physics_or_self_cancel');
  await waitFor(()=>!own().castId,'cast end');
  room.send('skill:cast',{...command,id:'no-input',inputSeq:2});
  await waitFor(()=>results.some(r=>r.requestId==='no-input'&&r.reason==='input'),'missing input expires');assert.equal(own().casts,1);
  room.send('skill:cast',{...command,id:'too-far',inputSeq:67});
  await waitFor(()=>results.some(r=>r.requestId==='too-far'&&r.reason==='input'),'sequence bound');assert.equal(own().casts,1);
  checks.push('missing_or_distant_input_rejects_without_cost');
  // A pending cast must never reappear after the player leaves and opens the saved profile again.
  room.send('skill:cast',{...command,id:'leave-pending',skillId:'wind',inputSeq:2});await room.leave();room=await join();assert.equal(own().casts,1);
  room.send('skill:cast',command);await waitFor(()=>results.some(r=>r.requestId===command.id&&r.duplicate),'durable receipt before any new input');assert.equal(own().casts,1);
  room.send('skill:cast',{...command,inputSeq:2});await waitFor(()=>results.some(r=>r.requestId===command.id&&r.reason==='request_reused'),'receipt includes input sequence');
  checks.push('leave_discards_pending_cast_and_durable_retry_survives_reset_input_channel');
  const next=room.input({type:MoveInput});next.data.moveX=1;next.data.moveY=0;next.send();
  room.send('skill:cast',{...command,id:'new-direction',aimX:1,inputSeq:1});await waitFor(()=>!!own().castId,'second accepted cast');
  next.data.moveX=0;next.data.moveY=-1;next.send();await waitFor(()=>events.some(e=>e.type==='cancel'&&e.castId.endsWith('new-direction')),'real direction change cancels');
  assert.equal(own().casts,2);assert.ok(!events.some(e=>e.type==='release'&&e.castId.endsWith('new-direction')));
  checks.push('direction_change_after_acceptance_still_cancels_unreleased_sword');
  const report={passed:true,date:new Date().toISOString(),checks,realOwnerStorageWritten:false};await writeFile('artifacts/hang-nhac-skill-input-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){console.error(JSON.stringify({checks,results,events,backend:backend.output()},null,2));throw error;}
finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));backend.stop();}
