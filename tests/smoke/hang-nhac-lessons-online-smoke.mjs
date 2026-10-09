import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from '@colyseus/sdk';
import { ProfileStore } from '../../server/src/profile-store.ts';
import { HANG_NHAC, HANG_NHAC_AVATARS } from '../../shared/hang-nhac.ts';
import { MoveInput } from '../../shared/protocol/input.ts';
import { SECT_STATIONS } from '../../shared/sect.ts';
import { startService, waitFor } from '../support/services.mjs';

const endpoint='http://127.0.0.1:2597';
await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-lessons-online-')),dbPath=resolve(folder,'profiles.sqlite');
let backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2597',GAME_DB_PATH:dbPath});
const peers=[],checks=[];
async function guest(){
  const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());
  const store=new ProfileStore(dbPath);
  try{for(const avatar of HANG_NHAC_AVATARS){const p=store.get(store.authenticate(guest.token),avatar);
    Object.assign(p,{x:SECT_STATIONS[2].x,y:SECT_STATIONS[2].y,milestone:'M01',cultivation:100});
    Object.assign(p.sect,{hn01:true,hn02:true,foundation:avatar==='CHR-SITU-NAN'?'spirit':'breathing',cycleStep:4,level:1});store.save(p);
  }}finally{store.close();}return guest;
}
async function connect(token,avatar){
  const room=await new Client(endpoint).joinOrCreate('hang_nhac',{accountToken:token,avatarId:avatar,mapVersion:HANG_NHAC.version});
  room.reconnection.enabled=false;
  const p={room,view:undefined,held:{x:0,y:0},pending:new Map(),targetId:'',events:[]};
  room.onMessage('sect:state',view=>p.view=view);
  room.onMessage('sect:result',result=>p.pending.get(result.requestId)?.(result));
  room.onMessage('training:result',result=>{if(result.ok)p.targetId=result.targetId;});
  room.onMessage('profile:saved',()=>{});room.onMessage('skill:result',()=>{});room.onMessage('skill:event',event=>p.events.push(event));
  room.send('sect:sync');
  await waitFor(()=>room.state.players?.get(room.sessionId)?.connected&&p.view,'profile and private quest view');
  const input=room.input({type:MoveInput,mode:'reliable'});
  p.timer=setInterval(()=>{if(room.connection.isOpen){input.data.moveX=p.held.x;input.data.moveY=p.held.y;input.send();}},1000/30);
  p.actor=()=>room.state.players.get(room.sessionId);
  p.command=(action,extra={},id=randomUUID())=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{p.pending.delete(id);reject(new Error('Command timeout '+action));},6000);
    p.pending.set(id,result=>{clearTimeout(timer);p.pending.delete(id);resolve(result);});room.send('sect:command',{id,action,...extra});
  });
  p.cast=skill=>room.send('skill:cast',{id:randomUUID(),skillId:skill,aimX:0,aimY:1,targetId:p.targetId});
  p.close=async()=>{clearInterval(p.timer);await room.leave(true);};peers.push(p);return p;
}
async function returnToTrainer(p){
  p.held={x:0,y:-1};await waitFor(()=>Math.abs(p.actor().y-SECT_STATIONS[2].y)<20,'return to trainer',8000);p.held={x:0,y:0};
  await new Promise(resolve=>setTimeout(resolve,200));
}
try{
  const g=await guest(),other=await guest();
  const peer=await connect(other.token,HANG_NHAC_AVATARS[0]);
  for(const avatar of HANG_NHAC_AVATARS){
    const p=await connect(g.token,avatar);
    assert.equal((await p.command('lesson_confirm',{lesson:'arts',reward:99999,hn03:true})).reason,'lesson_incomplete');
    assert.equal((await p.command('lesson_start',{lesson:'avoid'})).reason,'hn03');
    assert.equal((await p.command('lesson_start',{lesson:'arts'})).ok,true);
    await waitFor(()=>p.room.state.targets?.has(p.targetId),'lesson target replicated');
    const target=p.targetId,baseMp=p.actor().mp;
    assert.equal((await peer.command('basic_attack',{targetId:target})).reason,'target');
    const basicId=randomUUID();assert.equal((await p.command('basic_attack',{targetId:target},basicId)).ok,true);
    await waitFor(()=>p.view.lessons.basic&&p.room.state.targets.get(target).hp===90,'basic hit committed before damage');
    const hits=p.actor().practiceHits;
    assert.equal((await p.command('basic_attack',{targetId:target},basicId)).duplicate,true);
    assert.equal(p.room.state.targets.get(target).hp,90);assert.equal(p.actor().mp,baseMp);
    p.cast('sword');await waitFor(()=>p.view.lessons.sword,'confirmed sword lesson credit');
    await waitFor(()=>!p.actor().castId,'sword finished');
    p.cast('thunder');await waitFor(()=>p.view.lessons.thunder,'confirmed targeted thunder lesson credit');
    await waitFor(()=>!p.actor().castId&&p.room.state.serverTime>=p.actor().lastSpentAt+2100,'practice recovery');
    const confirm3=randomUUID();assert.equal((await p.command('lesson_confirm',{lesson:'arts'},confirm3)).ok,true);
    await waitFor(()=>p.view.lessons.hn03,'HN03 durable confirmation');assert.equal(p.view.cultivation,180);
    assert.equal((await p.command('lesson_confirm',{lesson:'arts'},confirm3)).duplicate,true);
    assert.equal((await p.command('lesson_confirm',{lesson:'arts'})).reason,'already_complete');
    assert.equal(p.view.cultivation,180);assert.equal(peer.view.lessons.hn03,false);
    assert.equal((await p.command('lesson_start',{lesson:'avoid'})).ok,true);
    await waitFor(()=>p.view.lessonView?.status==='failed','standing inside warning fails safely');
    assert.equal(p.actor().hp,100);assert.equal(p.view.lessons.walk,false);
    assert.equal((await p.command('lesson_start',{lesson:'avoid'})).ok,true);
    p.held={x:0,y:1};await waitFor(()=>p.view.lessons.walk,'ordinary walking avoids at deadline');p.held={x:0,y:0};
    await returnToTrainer(p);
    assert.equal((await p.command('lesson_start',{lesson:'avoid'})).ok,true);
    p.cast('wind');await waitFor(()=>p.view.lessons.wind,'confirmed Phong arrival avoids at deadline');
    await returnToTrainer(p);
    await waitFor(()=>p.room.state.serverTime>=p.actor().lastSpentAt+2100,'Phong recovery');
    const confirm4=randomUUID();assert.equal((await p.command('lesson_confirm',{lesson:'avoid'},confirm4)).ok,true);
    await waitFor(()=>p.view.lessons.hn04,'HN04 durable confirmation');assert.equal(p.view.cultivation,260);
    assert.equal((await p.command('lesson_confirm',{lesson:'avoid'},confirm4)).duplicate,true);
    assert.equal((await p.command('lesson_confirm',{lesson:'avoid'})).reason,'already_complete');
    assert.equal(p.view.cultivation,260);assert.equal(p.view.milestone,'M01');assert.equal(p.actor().hp,100);
    assert.equal(p.actor().practiceHits,hits+2);assert.equal(peer.view.lessons.hn04,false);
    checks.push({avatar,basicZeroMp:true,peerTargetRejected:true,hn03:true,hn04:true,oneTimeRewards:true,totalCultivation:260,noM02:true});
    await p.close();
  }
  await peer.close();backend.stop();
  backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2597',GAME_DB_PATH:dbPath});
  for(const avatar of HANG_NHAC_AVATARS){const p=await connect(g.token,avatar);
    assert.equal(p.view.lessons.hn03,true);assert.equal(p.view.lessons.hn04,true);assert.equal(p.view.cultivation,260);
    assert.equal(p.view.lessonView,undefined);assert.equal((await p.command('lesson_confirm',{lesson:'avoid'})).reason,'already_complete');await p.close();}
  checks.push({restartPreservesTrio:true,oldRewardsNotRepeated:true});
  const report={passed:true,checks,ownerDatabaseUsed:false,ownerMapEdited:false,fixtureDatabase:dbPath};
  await writeFile('artifacts/hang-nhac-lessons-online-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(error){console.error(JSON.stringify({checks,peers:peers.map(p=>({view:p.view,actor:p.actor?.()?.toJSON(),events:p.events.slice(-8)})),backend:backend.output()},null,2));throw error;}
finally{for(const p of peers){clearInterval(p.timer);if(p.room.connection.isOpen)await p.room.leave(true).catch(()=>{});}backend.stop();}
