import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {Client} from '@colyseus/sdk';
import {ProfileStore} from '../../server/src/profile-store.ts';import {HANG_NHAC,HANG_NHAC_AVATARS} from '../../shared/hang-nhac.ts';import {CHAPTER_WORLD,CHAPTER_QUESTS,initialChapter} from '../../shared/chapter.ts';import {SECT_STATIONS} from '../../shared/sect.ts';import {MoveInput} from '../../shared/protocol/input.ts';import {startService,waitFor} from '../support/services.mjs';
const endpoint='http://127.0.0.1:2614';await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/hn-chapter-alternatives-')),db=resolve(folder,'profiles.sqlite');let backend,p;const checks=[];
try{
 backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2614',GAME_DB_PATH:db});const guest=await fetch(endpoint+'/api/profile-session',{method:'POST'}).then(r=>r.json());
 const seed=(avatar,edit)=>{const store=new ProfileStore(db);try{const v=store.get(store.authenticate(guest.token),avatar);edit(v);store.save(v);}finally{store.close();}};
 const read=avatar=>{const s=new ProfileStore(db);try{return s.get(s.authenticate(guest.token),avatar);}finally{s.close();}};
 const base=(v)=>{Object.assign(v,{x:SECT_STATIONS[3].x,y:SECT_STATIONS[3].y,cultivation:460,milestone:'M02',chapter:initialChapter()});Object.assign(v.sect,{hn01:true,hn02:true,cycleStep:4,foundation:v.avatarId==='CHR-SITU-NAN'?'spirit':'breathing',level:3});Object.assign(v.sect.lessons,{hn03:true,hn04:true,basic:true,sword:true,thunder:true,walk:true,wind:true});};
 for(const avatar of HANG_NHAC_AVATARS)seed(avatar,v=>{base(v);Object.assign(v.chapter,{accepted:['HN05','HN06'],completed:['HN05'],activity:'HN06',scene:'outer'});});
 async function attach(room){room.reconnection.enabled=false;const peer={room,view:undefined,held:{x:0,y:0},pending:new Map(),actor:()=>room.state.players.get(room.sessionId)};
  room.onMessage('chapter:state',v=>peer.view=v);for(const name of ['chapter:result','skill:result'])room.onMessage(name,r=>peer.pending.get(r.requestId)?.(r));for(const name of ['profile:saved','skill:event','sect:animation','training:result','sect:state','character:state'])room.onMessage(name,()=>{});
  room.send('chapter:sync');await waitFor(()=>peer.view&&peer.actor()?.connected,'private activity');const input=room.input({type:MoveInput,mode:'reliable'});peer.timer=setInterval(()=>{if(room.connection.isOpen){input.data.moveX=peer.held.x;input.data.moveY=peer.held.y;input.send();}},1000/30);
  peer.cmd=(action,extra={},channel='chapter:command')=>new Promise((resolve,reject)=>{const id=randomUUID(),timer=setTimeout(()=>reject(Error('command '+action)),6000);peer.pending.set(id,r=>{clearTimeout(timer);peer.pending.delete(id);resolve(r);});room.send(channel,{id,...(action?{action}:{}),...extra});});
  peer.close=async()=>{clearInterval(peer.timer);if(room.connection.isOpen)await room.leave(true);await new Promise(r=>setTimeout(r,200));};return peer;
 }
 const connect=avatar=>new Client(endpoint).joinOrCreate('hang_nhac',{accountToken:guest.token,avatarId:avatar,mapVersion:HANG_NHAC.version}).then(attach);
 const cmd=async(action,extra={},channel)=>{const r=await p.cmd(action,extra,channel);assert.equal(r.ok??r.accepted,true,JSON.stringify({action,r}));await new Promise(r=>setTimeout(r,80));};
 const movePoint=async(point,label)=>{await waitFor(async()=>{const dx=point.x-p.actor().x,dy=point.y-p.actor().y;if(Math.hypot(dx,dy)<10){p.held={x:0,y:0};return true;}p.held={x:Math.abs(dx)<5?0:Math.sign(dx),y:Math.abs(dy)<5?0:Math.sign(dy)};return false;},'walk to '+label,25000);await new Promise(r=>setTimeout(r,150));};
 const move=id=>movePoint(CHAPTER_WORLD.nodes.find(n=>n.id===id),id);
 for(const avatar of ['CHR-SITU-NAN','CHR-LI-MUWAN']){
  p=await connect(avatar);
  if(avatar==='CHR-SITU-NAN'){await move('stable');assert.equal((await p.cmd('interact',{node:'stable'})).ok,false);await waitFor(()=>p.view.stableReady,'stable interval');await cmd('interact',{node:'stable'});}
  else{await move('sample-a');await cmd('interact',{node:'sample-a',choice:'case'});await move('sample-b');await cmd('interact',{node:'sample-b'});}
  assert.equal(p.view.progress.facts.includes('HN06-proof'),true);await cmd('leave');await cmd('confirm',{quest:'HN06'});assert.equal(p.view.progress.stock['hn-refining-material'],3);checks.push(avatar+' HN06 distinct branch and one source');await p.close();p=undefined;
  // Only NPC relocation is seeded. Evidence requires the live private simulation and a confirmed hit.
  seed(avatar,v=>Object.assign(v,{x:SECT_STATIONS[1].x,y:SECT_STATIONS[1].y}));p=await connect(avatar);
  await cmd('accept',{quest:'HN07'});await cmd('enter',{quest:'HN07'});
  if(avatar==='CHR-LI-MUWAN'){await move('stable');await cmd('interact',{node:'stable'});assert.equal(p.view.prepared,true);}
  await cmd('start');
  if(avatar==='CHR-SITU-NAN'){await move('stable');await waitFor(()=>p.view.stableReady,'TDN same-attempt stability');}
  await movePoint({x:640,y:670},'timed hit');
  if(avatar==='CHR-LI-MUWAN')await waitFor(()=>p.view.warning&&p.view.warning.resolveAt-p.view.now<250,'LMW recovery window');
  const target=p.view.enemy,dx=target.x-p.actor().x,dy=target.y-p.actor().y,d=Math.hypot(dx,dy)||1;
  await cmd(undefined,{skillId:'thunder',aimX:dx/d,aimY:dy/d,targetId:target.id},'skill:cast');
  await waitFor(()=>p.view.progress.facts.includes('HN07-proof'),'avatar HN07 proof');await cmd('leave');
  await waitFor(()=>p.room.state.serverTime>=p.actor().lastSpentAt+2100,'post-hit NPC recovery');await cmd('confirm',{quest:'HN07'});
  assert.equal(p.view.progress.completed.includes('HN07'),true);checks.push(avatar+' HN07 preparation/stability and actual hit proof');await p.close();p=undefined;
 }
 const wang=HANG_NHAC_AVATARS[0];seed(wang,v=>{base(v);v.cultivation=3600;v.milestone='M04';v.sect.level=15;Object.assign(v.chapter,{accepted:CHAPTER_QUESTS.slice(0,10),completed:CHAPTER_QUESTS.slice(0,10),jade:'refined',jadeEquipped:true,checkpoint:3,stock:{'vh-clean-herb':2,'vh-clear-water':2,'vh-conductive-sand':2,'vh-soft-fiber':3,'vh-stable-jade':3}});});
 p=await connect(wang);const stock=structuredClone(p.view.progress.stock);await cmd('report',{choice:'record'});assert.equal(p.view.progress.report,'record');assert.deepEqual(p.view.progress.stock,stock);
 await cmd('accept',{quest:'EX03'});await cmd('enter',{quest:'EX03'});await cmd('trip_start',{choice:'stable'});
 for(const id of ['observe-a','observe-b']){await move(id);await waitFor(()=>p.view.stableReady,'manual sample stabilizes');await cmd('interact',{node:id});}await move('deliver');await cmd('interact',{node:'deliver'});await cmd('leave');await cmd('confirm',{quest:'EX03'});
 await cmd('accept',{quest:'EX04'});await cmd('enter',{quest:'EX04'});for(const id of ['observe-a','observe-b','verify']){await move(id);await cmd('interact',{node:id});}await cmd('leave');await cmd('confirm',{quest:'EX04'});
 assert.deepEqual(p.view.progress.stock,stock);assert.equal(p.view.progress.caseOwned,false);assert.equal(p.view.progress.compassOwned,false);checks.push('EX03/04 complete by actual walking/manual checks without crafting, materials unchanged');await p.close();p=undefined;
 // HN10 snapshot resumes the same private simulation, and a reserved account cannot have two writers.
 seed(wang,v=>{v.chapter.completed=v.chapter.completed.filter(q=>!['HN10','HN11','HN12','EX01','EX02','EX03','EX04'].includes(q));v.milestone='M03';v.chapter.checkpoint=1;v.chapter.activity='HN10';v.chapter.scene='trial';delete v.chapter.activitySave;});
 p=await connect(wang);await cmd('start');const enemy=p.view.enemy;await cmd(undefined,{skillId:'sword',aimX:0,aimY:-1,targetId:enemy.id},'skill:cast');await new Promise(r=>setTimeout(r,100));
 const token=p.room.reconnectionToken,id=p.room.sessionId;clearInterval(p.timer);p.room.connection.close(4999);
 await waitFor(()=>read(wang).chapter.activitySave?.pausedAt>0,'persisted pause');const paused=read(wang),saved=paused.chapter.activitySave;await new Promise(r=>setTimeout(r,500));const still=read(wang);assert.equal(still.hp,paused.hp);assert.equal(still.mp,paused.mp);assert.deepEqual(still.chapter.activitySave.engine,saved.engine);
 await assert.rejects(()=>connect(wang));p=await attach(await new Client(endpoint).reconnect(token));assert.equal(p.room.sessionId,id);assert.equal(p.view.status,'running');assert.equal(p.actor().hp,paused.hp);assert.ok(Math.abs(p.actor().mp-paused.mp)<.01);assert.equal(p.view.progress.checkpoint,1);checks.push('HN10 drop freezes cast/HP/MP, account lease blocks another writer, reconnect restores same attempt');
 await cmd('guard');const persisted=read(wang);assert.equal(persisted.chapter.activitySave.status,'running');clearInterval(p.timer);backend.stop();p=undefined;await new Promise(r=>setTimeout(r,300));
 backend=await startService(['--import','tsx','server/src/index.ts'],endpoint+'/health',{PORT:'2614',GAME_DB_PATH:db});p=await connect(wang);
 assert.equal(p.view.status,'running');assert.equal(p.view.enemy.id,persisted.chapter.activitySave.enemy.id);assert.equal(p.view.progress.checkpoint,1);assert.equal(p.actor().hp,persisted.hp);assert.equal(p.view.progress.report,'record');
 assert.ok(p.actor().mp>=persisted.mp&&p.actor().mp<persisted.mp+2);assert.ok(p.view.progress.guardReadyAt-p.view.now>11000);
 checks.push('HN10 backend restart restores active enemy/HP/MP/guard cooldown at same checkpoint');await p.close();p=undefined;
 const report={passed:true,checks,ownerDatabaseUsed:false,ownerMapEdited:false,fixtureDatabase:db};await writeFile('artifacts/hang-nhac-chapter-alternatives-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}catch(e){console.error({checks,view:p?.view,actor:p?.actor()?.toJSON(),backend:backend?.output()});throw e;}finally{await p?.close().catch(()=>{});backend?.stop();}
