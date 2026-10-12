import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Client} from '@colyseus/sdk';
import {DatabaseSync} from 'node:sqlite';
import {GameConnection} from '../../server/src/persistence/game-connection.ts';
import {sqliteGameRepositories} from '../../server/src/persistence/game-repositories.ts';
import {HANG_NHAC,HANG_NHAC_ROOM} from '../../shared/hang-nhac.ts';
import {startService,waitFor} from '../support/services.mjs';

await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/game-entry-online-')),path=resolve(folder,'profiles.sqlite');
const one='http://127.0.0.1:2640',two='http://127.0.0.1:2641',pass='fixture-game-password',adminPass='fixture-admin-password';
let server1,server2,production;const rooms=[],checks=[];
const start=(port)=>startService(['--import','tsx','server/src/index.ts'],`http://127.0.0.1:${port}/health`,{PORT:String(port),GAME_DB_PATH:path,GAME_BOOTSTRAP_ADMIN_LOGIN:'operator',GAME_BOOTSTRAP_ADMIN_PASSWORD:adminPass});
class Api {
  cookie='';csrf='';constructor(endpoint){this.endpoint=endpoint;}
  async request(route,method='GET',body,extra={}){
    const headers={'X-Game-Client':'h5',...(method==='GET'?{}:{'Content-Type':'application/json'}),...(this.cookie?{Cookie:this.cookie}:{}),...(this.csrf?{'X-Game-CSRF':this.csrf}:{}),...extra};
    const r=await fetch(this.endpoint+'/api/game'+route,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();
    const cookie=r.headers.get('set-cookie');if(cookie)this.cookie=cookie.split(';')[0];if(r.ok&&data.csrf)this.csrf=data.csrf;
    return {status:r.status,data,cookie,trace:r.headers.get('x-request-id')};
  }
}
const register=async(api,login)=>{const result=await api.request('/register','POST',{login,password:pass});assert.equal(result.status,201);return result;};
const create=async(api,name,requestId='new',realmId='hang-nhac-1',avatarId='CHR-WANG-LIN-CHIBI')=>api.request('/characters','POST',{requestId,realmId,avatarId,name});
const ticket=async(api,character)=>{const r=await api.request('/play-ticket','POST',{realmId:character.realmId,characterId:character.profile.id});assert.equal(r.status,200);return r.data;};
const join=async(endpoint,t)=>{const room=await new Client(endpoint).joinOrCreate(HANG_NHAC_ROOM,{entryTicket:t.ticket,realmId:t.realmId,characterId:'forged',avatarId:'CHR-LI-MUWAN',name:'forged',mapVersion:HANG_NHAC.version});rooms.push(room);room.onMessage('profile:saved',()=>{});room.onMessage('entry:revoked',()=>{});await waitFor(()=>room.state.players.get(room.sessionId)?.connected,'actor');return room;};
try{
  server1=await start(2640);server2=await start(2641);
  const api=new Api(one),admin=new Api(one),peer=new Api(one);const registered=await register(api,'playerone');await register(peer,'playertwo');
  assert.match(registered.cookie,/HttpOnly/i);assert.match(registered.cookie,/SameSite=Strict/i);assert.equal(registered.data.account.role,'player');assert.equal(registered.data.secret,undefined);assert.equal(registered.data.account.passwordHash,undefined);
  assert.deepEqual((await api.request('/characters?realmId=hang-nhac-1')).data.characters,[]);
  assert.equal((await api.request('/admin')).status,403);assert.equal((await api.request('/characters','POST',{requestId:'bad',realmId:'hang-nhac-1',avatarId:'CHR-WANG-LIN-CHIBI',name:'Bad',accountId:registered.data.account.id})).status,400);
  assert.equal((await api.request('/characters','POST',{requestId:'csrf',realmId:'hang-nhac-1',avatarId:'CHR-WANG-LIN-CHIBI',name:'Wrong'},{'X-Game-CSRF':'forged'})).status,403);
  const badOrigin=await api.request('/characters','POST',{}, {Origin:'https://attacker.invalid'});assert.equal(badOrigin.status,403);assert.ok(badOrigin.trace);
  checks.push('HttpOnly session, empty new account, strict input/CSRF/origin and admin access checks');
  const p1=(await create(api,'Đạo Hữu','character1')).data,p2=(await create(api,'Đạo Hữu Hai','character2')).data,p3=(await create(api,'Linh Thể','character3','hang-nhac-1','CHR-SITU-NAN')).data;
  assert.notEqual(p1.profile.id,p2.profile.id);assert.equal(p1.profile.avatarId,p2.profile.avatarId);assert.equal((await create(api,'Đạo Hữu','character1')).data.profile.id,p1.profile.id);
  assert.equal((await create(api,'Đổi tên','character1')).data.code,'request_reused');assert.equal((await create(api,'Thứ Tư','fourth')).data.code,'slots_full');
  assert.equal((await peer.request('/play-ticket','POST',{realmId:p1.realmId,characterId:p1.profile.id})).status,404);
  checks.push('Explicit named characters, same archetype twice, one-time creation, slots, ownership');
  const seed=new GameConnection(path);try{const repos=sqliteGameRepositories(seed),profile=repos.characters.get(p1.profile.id).profile;profile.x=1560;profile.y=1168;profile.hp=50;repos.profiles.save(profile);}finally{seed.close();}
  const t=await ticket(api,p1),room=await join(one,t),actor=()=>room.state.players.get(room.sessionId);assert.equal(actor().name,p1.profile.name);assert.equal(actor().avatarId,p1.profile.avatarId);assert.equal(actor().profileId,p1.profile.id);
  const sectResults=[],inventoryResults=[],inventoryViews=[];room.onMessage('sect:result',v=>sectResults.push(v));room.onMessage('sect:state',()=>{});room.onMessage('sect:animation',()=>{});room.onMessage('skill:event',()=>{});room.onMessage('character:result',v=>inventoryResults.push(v));room.onMessage('character:state',v=>inventoryViews.push(v));
  room.send('sect:command',{id:'entry-intro',action:'accept_intro'});await waitFor(()=>sectResults.length,'registered intro');assert.equal(sectResults[0].ok,true);
  room.send('character:sync');await waitFor(()=>inventoryViews.length,'registered inventory');const recovery=inventoryViews.at(-1).items.find(v=>v.definitionId==='recovery'),weapon=inventoryViews.at(-1).items.find(v=>v.definitionId==='wood-sword');assert.equal(recovery.quantity,2);
  room.send('character:command',{id:'entry-use',action:'use',itemId:recovery.id});await waitFor(()=>inventoryResults.length,'registered use');assert.equal(inventoryResults[0].ok,true);await waitFor(()=>actor().hp===80,'registered HP');
  const fault=new DatabaseSync(path);try{fault.exec("CREATE TRIGGER fixture_inventory_failure BEFORE INSERT ON game_profile_receipts BEGIN SELECT RAISE(ABORT,'fixture secret omitted'); END;");room.send('character:command',{id:'entry-fault',action:'protect',itemId:weapon.id,protected:true});await waitFor(()=>inventoryResults.length===2,'registered save failure');assert.equal(inventoryResults[1].reason,'save');assert.equal(inventoryViews.at(-1).items.find(v=>v.id===weapon.id).protected,false);}finally{fault.exec('DROP TRIGGER fixture_inventory_failure');fault.close();}
  checks.push('Registered profile uses existing NPC/inventory ports; confirmed supplies/HP and forced SQL failure rollback with safe debug event');
  await assert.rejects(new Client(one).joinOrCreate(HANG_NHAC_ROOM,{entryTicket:t.ticket,realmId:t.realmId,mapVersion:HANG_NHAC.version}),/hết|401|Phiên/i);
  const remote=new Api(two);remote.cookie=api.cookie.replace('game_session_2640','game_session_2641');remote.csrf=api.csrf;
  const remoteTicket=await ticket(remote,p1);await assert.rejects(new Client(two).joinOrCreate(HANG_NHAC_ROOM,{entryTicket:remoteTicket.ticket,realmId:p1.realmId,mapVersion:HANG_NHAC.version}),/409|phiên khác/i);
  const results=[];room.onMessage('skill:result',v=>results.push(v));room.send('skill:cast',{id:'entry-cast',skillId:'sword',aimX:1,aimY:0,targetId:''});await waitFor(()=>results.length,'cast result');assert.equal(results[0].accepted,true);
  await waitFor(()=>actor().casts===1,'one cast');await room.leave(true);
  checks.push('One-use ticket, server-owned name/avatar, durable multi-node lease, server R01');
  assert.equal((await admin.request('/login','POST',{login:'operator',password:adminPass})).status,200);
  const snapshot=(await admin.request('/admin')).data;assert.ok(snapshot.audit.some(v=>v.action==='character.create'));assert.ok(snapshot.accounts.every(v=>!('passwordHash' in v)));assert.ok(snapshot.characters.every(v=>v.accountId===registered.data.account.id));
  assert.equal((await admin.request('/admin/accounts/'+registered.data.account.id,'PATCH',{status:'blocked'})).status,200);assert.equal((await api.request('/session')).status,401);
  await admin.request('/admin/accounts/'+registered.data.account.id,'PATCH',{status:'active'});assert.equal((await api.request('/login','POST',{login:'playerone',password:pass})).status,200);
  const active=await join(one,await ticket(api,p2));let revoked=false;active.onMessage('entry:revoked',()=>revoked=true);
  await admin.request('/admin/realms/hang-nhac-1','PATCH',{name:'S1 · Hằng Nhạc',status:'maintenance',characterSlots:3,creationEnabled:true});await waitFor(()=>revoked&&!active.connection.isOpen,'maintenance ends active play');
  assert.equal((await api.request('/play-ticket','POST',{realmId:p2.realmId,characterId:p2.profile.id})).data.code,'maintenance');
  await admin.request('/admin/realms/hang-nhac-1','PATCH',{name:'S1 · Hằng Nhạc',status:'online',characterSlots:3,creationEnabled:true});
  checks.push('Management role, audit trace, account block revokes sessions and maintenance saves/disconnects');
  server1.stop();await waitFor(()=>server1.child.exitCode!==null||server1.child.signalCode!==null,'first node stop');server1=await start(2640);
  const restored=(await api.request('/characters?realmId=hang-nhac-1')).data.characters;assert.equal(restored.length,3);assert.equal(restored.find(c=>c.profile.id===p1.profile.id).profile.casts,1);assert.equal((await api.request('/session')).status,200);
  const after=await join(one,await ticket(api,p1));assert.equal(after.state.players.get(after.sessionId).casts,1);after.onMessage('skill:result',v=>results.push(v));after.send('skill:cast',{id:'entry-cast',skillId:'sword',aimX:1,aimY:0,targetId:''});await waitFor(()=>results.length===2,'duplicate cast receipt');assert.equal(results[1].duplicate,true);
  after.onMessage('sect:state',()=>{});after.onMessage('sect:result',v=>sectResults.push(v));after.onMessage('character:state',v=>inventoryViews.push(v));after.onMessage('character:result',v=>inventoryResults.push(v));after.onMessage('sect:animation',()=>{});
  after.send('sect:command',{id:'entry-intro',action:'accept_intro'});await waitFor(()=>sectResults.length===2,'registered intro receipt');assert.equal(sectResults[1].duplicate,true);
  after.send('character:command',{id:'entry-use',action:'use',itemId:recovery.id});await waitFor(()=>inventoryResults.length===3,'registered inventory receipt');assert.equal(inventoryResults[2].duplicate,true);assert.equal(after.state.players.get(after.sessionId).hp,80);assert.equal(inventoryViews.at(-1).sect.supplies,1);
  checks.push('Restart preserves account/session/characters/resources and original cast receipt');
  const raw=new DatabaseSync(path);try{assert.equal(raw.prepare('SELECT count(*) AS n FROM profiles').get().n,0);assert.equal(raw.prepare('SELECT count(*) AS n FROM game_characters').get().n,3);assert.ok(String(raw.prepare('SELECT password_hash FROM game_accounts WHERE login=?').get('playerone').password_hash).startsWith('scrypt$'));}finally{raw.close();}
  const productionUrl='http://127.0.0.1:2643';production=await startService(['--import','tsx','server/src/index.ts'],productionUrl+'/ready',{PORT:'2643',GAME_DB_PATH:resolve(folder,'production.sqlite'),NODE_ENV:'production',GAME_ALLOWED_ORIGINS:'https://game.example',GAME_ALLOW_GUEST:'1',GAME_BOOTSTRAP_ADMIN_LOGIN:'',GAME_BOOTSTRAP_ADMIN_PASSWORD:''});
  const productionApi=new Api(productionUrl),productionRegistration=await register(productionApi,'productionfixture');assert.match(productionRegistration.cookie,/^__Host-game_session=/);assert.match(productionRegistration.cookie,/Secure/);
  assert.equal((await fetch(productionUrl+'/api/profile-session',{method:'POST'})).status,404);assert.equal((await fetch(productionUrl+'/health').then(r=>r.json())).persistence.legacyGuestPreview,false);
  await assert.rejects(new Client(productionUrl).joinOrCreate(HANG_NHAC_ROOM,{mapVersion:HANG_NHAC.version,avatarId:'CHR-WANG-LIN-CHIBI'}),/401|đăng nhập/i);
  const preflight=await fetch(one+'/api/game/login',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'x-game-client,x-request-id,content-type'}});assert.equal(preflight.status,204);assert.match(preflight.headers.get('access-control-allow-headers'),/X-Game-Client/);
  checks.push('Production uses Secure __Host cookie, disables guest API/auth despite flag, and shared Colyseus CORS allows real H5 headers');
  const output=server1.output()+server2.output();assert.ok(!output.includes(pass)&&!output.includes(adminPass)&&!output.includes(registered.cookie)&&!output.includes(t.ticket)&&!output.includes('fixture secret omitted'));
  await writeFile('artifacts/game-entry-online-verification.json',JSON.stringify({date:'2026-10-10',passed:true,checks,fixtureOnly:true,ownerDataUsed:false,legacyProfilesAutoCreated:0},null,2)+'\n');console.log(`Game entry online: ${checks.length} groups passed.`);
}finally{for(const room of rooms){room.reconnection.enabled=false;if(room.connection.isOpen)await room.leave(true).catch(()=>{});}server1?.stop();server2?.stop();production?.stop();}
