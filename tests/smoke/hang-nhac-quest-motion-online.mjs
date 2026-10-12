import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from '@colyseus/sdk';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { HANG_NHAC } from '../../shared/hang-nhac.ts';
import { SECT_STATIONS } from '../../shared/sect.ts';
import { MoveInput } from '../../shared/protocol/input.ts';
import { startService, waitFor } from '../support/services.mjs';
const endpoint='http://127.0.0.1:2625';await mkdir('artifacts',{recursive:true});
const folder=await mkdtemp(resolve('artifacts/hn-quest-motion-online-')),dbPath=resolve(folder,'profiles.sqlite');
const backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2625',GAME_DB_PATH:dbPath});
const peers=[],checks=[];
async function connect(station){
  const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());const store=new ProfileStore(dbPath);
  try{const p=store.get(store.authenticate(guest.token),'CHR-WANG-LIN-CHIBI');Object.assign(p,{x:station.x,y:station.y,hp:50,milestone:'M01',cultivation:100});
    Object.assign(p.sect,{hn01:true,hn02:true,foundation:'breathing',cycleStep:4,level:1,supplies:2});store.save(p);
  }finally{store.close();}
  const room=await new Client(endpoint).joinOrCreate('hang_nhac',{accountToken:guest.token,avatarId:'CHR-WANG-LIN-CHIBI',mapVersion:HANG_NHAC.version});room.reconnection.enabled=false;
  const p={room,motions:[],view:undefined,target:'',held:{x:0,y:0},pending:new Map()};peers.push(p);
  room.onMessage('sect:animation',e=>p.motions.push(e));room.onMessage('sect:state',v=>p.view=v);room.onMessage('sect:result',r=>p.pending.get(r.requestId)?.(r));
  room.onMessage('training:result',r=>{if(r.ok)p.target=r.targetId;});for(const kind of ['profile:saved','skill:result','skill:event'])room.onMessage(kind,()=>{});
  room.send('sect:sync');await waitFor(()=>room.state.players?.get(room.sessionId)?.connected&&p.view,'ready motion profile');
  const input=room.input({type:MoveInput,mode:'reliable'});p.timer=setInterval(()=>{if(room.connection.isOpen){input.data.moveX=p.held.x;input.data.moveY=p.held.y;input.send();}},1000/30);
  p.actor=()=>room.state.players.get(room.sessionId);
  p.command=(action,extra={},id=randomUUID())=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(action+' timeout')),6000);p.pending.set(id,r=>{clearTimeout(timer);p.pending.delete(id);resolve(r);});room.send('sect:command',{id,action,...extra});});
  p.close=async()=>{clearInterval(p.timer);if(room.connection.isOpen)await room.leave(true);};return p;
}
try{
  const actor=await connect(SECT_STATIONS[2]),observer=await connect(SECT_STATIONS[0]);
  assert.equal((await actor.command('lesson_start',{lesson:'arts'})).ok,true);await waitFor(()=>actor.target,'personal target');
  const bad=randomUUID();assert.equal((await observer.command('basic_attack',{targetId:actor.target},bad)).ok,false);
  assert.equal(observer.motions.some(e=>e.id.endsWith(bad)),false);
  const basic=randomUUID();assert.equal((await actor.command('basic_attack',{targetId:actor.target},basic)).ok,true);
  await waitFor(()=>observer.motions.some(e=>e.id.endsWith(basic)),'peer sees confirmed basic');
  const fact=observer.motions.find(e=>e.id.endsWith(basic));assert.equal(fact.kind,'basic');assert.equal(fact.direction,'south');
  assert.deepEqual(Object.keys(fact).sort(),['actorId','at','direction','id','kind']);
  assert.equal((await actor.command('basic_attack',{targetId:actor.target},basic)).duplicate,true);
  assert.equal(observer.motions.filter(e=>e.id.endsWith(basic)).length,1);
  const cooldown=randomUUID();assert.equal((await actor.command('basic_attack',{targetId:actor.target},cooldown)).ok,false);
  await waitFor(()=>actor.room.state.serverTime>=actor.view.lessons.nextBasicAt+1300,'basic practice recovery');
  assert.equal(observer.motions.some(e=>e.id.endsWith(cooldown)),false);
  const recovery=randomUUID();assert.equal((await actor.command('use_recovery',{},recovery)).ok,true);
  await waitFor(()=>observer.motions.some(e=>e.id.endsWith(recovery))&&actor.actor().hp===80,'confirmed recovery with HP');
  assert.equal((await actor.command('use_recovery',{},recovery)).duplicate,true);assert.equal(observer.motions.filter(e=>e.id.endsWith(recovery)).length,1);
  const talk=randomUUID();assert.equal((await actor.command('talk',{stationId:'training'},talk)).ok,true);await waitFor(()=>observer.motions.some(e=>e.id.endsWith(talk)),'NPC greeting broadcast');
  checks.push('one_shots_broadcast_only_after_success_rejected_and_duplicate_commands_emit_no_animation_private_progress_not_broadcast');
  const cultivator=await connect(SECT_STATIONS[1]);assert.equal((await cultivator.command('activity_start')).ok,true);
  await waitFor(()=>observer.motions.some(e=>e.actorId===cultivator.room.sessionId&&e.kind==='cultivation'),'peer sees cultivation loop');
  const late=await connect(SECT_STATIONS[0]);await waitFor(()=>late.motions.some(e=>e.actorId===cultivator.room.sessionId&&e.kind==='cultivation'),'late peer resumes active loop');
  assert.equal(late.motions.some(e=>e.kind==='basic'||e.kind==='recovery'||e.id.endsWith(talk)),false);
  cultivator.held={x:1,y:0};await waitFor(()=>observer.motions.some(e=>e.actorId===cultivator.room.sessionId&&e.kind==='idle'),'moving stops visible loop');cultivator.held={x:0,y:0};
  await waitFor(()=>observer.motions.filter(e=>e.actorId===cultivator.room.sessionId&&e.kind==='cultivation').length>=2,'standing resumes loop');
  const idleBefore=observer.motions.filter(e=>e.actorId===cultivator.room.sessionId&&e.kind==='idle').length;
  await cultivator.close();await waitFor(()=>observer.motions.filter(e=>e.actorId===cultivator.room.sessionId&&e.kind==='idle').length>idleBefore,'leave clears loop');
  checks.push('peer_loop_resume_on_join_movement_stop_resume_leave_and_no_old_one_shot_replay');
  const report={passed:true,checks,fixtureDatabase:dbPath,ownerDatabaseUsed:false,ownerMapEdited:false};await writeFile('artifacts/hang-nhac-quest-motion-online-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{for(const p of peers)await p.close().catch(()=>{});backend.stop();}
