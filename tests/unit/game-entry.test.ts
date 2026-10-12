import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {join,resolve,dirname,basename} from 'node:path';
import {GameConnection} from '../../server/src/persistence/game-connection';
import {sqliteGameRepositories} from '../../server/src/persistence/game-repositories';
import {EntryService} from '../../server/src/application/entry-service';
import {ScryptPasswords} from '../../server/src/security/passwords';
import {cryptographicIdentity} from '../../server/src/security/identity';
import {GameObserver} from '../../server/src/observability/game-observer';
import {GameError} from '../../server/src/core/errors';
import {ProfileStore} from '../../server/src/profile-store';
import {validCharacterName,characterNameKey,entryPhase} from '../../shared/game/entry';

const passwords={hash:async(password:string)=>'fixture:'+password,verify:async(password:string,hash:string|undefined)=>hash==='fixture:'+password};
const logger={event:()=>{},failure:()=>{}};
const pass='fixture-password-only';
const setup=(allowLocalAdminShortPassword=false)=>{const connection=new GameConnection(':memory:'),repositories=sqliteGameRepositories(connection);let now=Date.now();
  repositories.realms.insert({id:'realm-1',name:'Realm One',status:'online',characterSlots:3,creationEnabled:true,updatedAt:now});
  const service=new EntryService({repositories,passwords,identity:cryptographicIdentity,logger,nodeId:'unit-node',clock:()=>now,allowLocalAdminShortPassword});
  return {connection,repositories,service,advance:(ms:number)=>now+=ms};};
const register=async(s:EntryService,login='tester')=>{const session=await s.register({login,password:pass},login,'register');return {...session,auth:s.authenticate(session.secret)};};
const create=(s:EntryService,auth:ReturnType<EntryService['authenticate']>,name='Đạo Hữu',requestId='create-1',realmId='realm-1')=>s.createCharacter(auth,{requestId,realmId,avatarId:'CHR-WANG-LIN-CHIBI',name},requestId);
const code=(error:unknown,expected:string)=>error instanceof GameError&&error.code===expected;

test('account locked while password verification waits cannot receive a new session',async()=>{
  const f=setup();try{
    const account=await register(f.service);let finish!:(value:boolean)=>void;
    const pendingPasswords={...passwords,verify:()=>new Promise<boolean>(resolve=>finish=resolve)};
    const delayed=new EntryService({repositories:f.repositories,passwords:pendingPasswords,identity:cryptographicIdentity,logger,nodeId:'unit-node'});
    const login=delayed.login({login:'tester',password:pass},'ip','race');
    f.repositories.accounts.status(account.auth.account.id,'blocked');finish(true);
    await assert.rejects(login,error=>code(error,'session_required'));
    assert.equal(f.connection.db.prepare('SELECT count(*) AS n FROM game_sessions').get()!.n,1);
  }finally{f.connection.close();}
});

test('entry policy has explicit pre-game phases and Unicode name equality',()=>{
  assert.equal(entryPhase({loading:false,started:false,authenticated:false,realm:false,creating:false,entering:false,playing:false}),'title');
  assert.ok(validCharacterName('  Đạo  Hữu  '));assert.equal(characterNameKey('ĐẠO HỮU'),characterNameKey('Đạo Hữu'));assert.equal(validCharacterName('<script>'),false);
  assert.equal(entryPhase({loading:false,authenticated:false,realm:false,creating:false,entering:false,playing:false}),'login');
  assert.equal(entryPhase({loading:false,authenticated:true,realm:true,creating:true,entering:false,playing:false}),'create');
});
test('registration starts empty; role injection and invalid credentials fail; login rotates opaque session',async()=>{
  const f=setup();try{
    await assert.rejects(f.service.register({login:'attacker',password:pass,role:'admin'},'ip','id'),e=>code(e,'credentials'));
    const a=await register(f.service);assert.equal(a.view.account.role,'player');assert.deepEqual(f.service.characters(a.auth,'realm-1'),[]);
    await assert.rejects(f.service.login({login:'tester',password:'incorrect-password'},'ip','bad'),e=>code(e,'login_failed'));
    const next=await f.service.login({login:'TESTER',password:pass},'ip','login');assert.notEqual(next.secret,a.secret);assert.equal(next.view.account.id,a.view.account.id);
    assert.equal(JSON.stringify(next.view).includes('passwordHash'),false);assert.equal(JSON.stringify(next.view).includes(next.secret),false);
  }finally{f.connection.close();}
});
test('character creation is explicit, idempotent, name-unique per realm and independent for repeated avatar',async()=>{
  const f=setup();try{const a=await register(f.service),first=create(f.service,a.auth),second=create(f.service,a.auth,'Đạo Hữu Hai','create-2');
    assert.notEqual(first.profile.id,second.profile.id);assert.equal(first.profile.avatarId,second.profile.avatarId);assert.notDeepEqual(first.profile.inventory,second.profile.inventory);
    assert.equal(create(f.service,a.auth).profile.id,first.profile.id);assert.equal(f.service.characters(a.auth,'realm-1').length,2);
    assert.throws(()=>create(f.service,a.auth,'ĐẠO HỮU','other'),e=>code(e,'name_taken'));
    assert.throws(()=>create(f.service,a.auth,'Đổi tên','create-1'),e=>code(e,'request_reused'));
    f.repositories.realms.insert({id:'realm-2',name:'Realm Two',status:'online',characterSlots:3,creationEnabled:true,updatedAt:Date.now()});
    assert.notEqual(create(f.service,a.auth,'Đạo Hữu','create-other','realm-2').profile.id,first.profile.id);
  }finally{f.connection.close();}
});
test('slot limits and maintenance are server-owned; wrong account and realm cannot get play ticket',async()=>{
  const f=setup();try{const a=await register(f.service),p=create(f.service,a.auth),b=await register(f.service,'second');
    assert.throws(()=>f.service.ticket(b.auth,{realmId:'realm-1',characterId:p.profile.id},'wrong'),e=>code(e,'character_missing'));
    f.repositories.realms.update({...f.repositories.realms.get('realm-1')!,characterSlots:1});
    assert.throws(()=>create(f.service,a.auth,'Extra','extra'),e=>code(e,'slots_full'));
    f.repositories.realms.update({...f.repositories.realms.get('realm-1')!,status:'maintenance'});
    assert.throws(()=>f.service.ticket(a.auth,{realmId:'realm-1',characterId:p.profile.id},'closed'),e=>code(e,'maintenance'));
  }finally{f.connection.close();}
});
test('creation/profile receipt failures roll back character, resources, audit and receipt',async()=>{
  const f=setup();try{const a=await register(f.service),audit=f.repositories.audit.list(0,100).length;
    f.connection.db.exec("CREATE TRIGGER fixture_create_fail BEFORE INSERT ON game_create_receipts BEGIN SELECT RAISE(ABORT,'fixture'); END;");
    assert.throws(()=>create(f.service,a.auth));assert.equal(f.service.characters(a.auth,'realm-1').length,0);assert.equal(f.repositories.audit.list(0,100).length,audit);
    f.connection.db.exec('DROP TRIGGER fixture_create_fail');const value=create(f.service,a.auth),p=f.repositories.characters.get(value.profile.id)!.profile;
    f.connection.db.exec("CREATE TRIGGER fixture_save_fail BEFORE UPDATE ON game_characters BEGIN SELECT RAISE(ABORT,'fixture'); END;");
    const before=structuredClone(p);p.hp=70;assert.throws(()=>f.repositories.profiles.commitCharacter(p,'use',{ok:true}));assert.equal(f.repositories.profiles.characterReceipt(p.id,'use'),undefined);
    assert.equal(f.repositories.characters.get(p.id)!.profile.hp,before.hp);assert.equal(p.revision,before.revision);
  }finally{f.connection.close();}
});
test('tickets are one-use/session-bound, leases reject second controller and revocation stops renew',async()=>{
  const f=setup();try{const a=await register(f.service),p=create(f.service,a.auth),ticket=f.service.ticket(a.auth,{realmId:'realm-1',characterId:p.profile.id},'ticket');
    assert.throws(()=>f.service.claim(ticket.ticket,'wrong','client-1'),e=>code(e,'ticket_invalid'));
    const grant=f.service.claim(ticket.ticket,'realm-1','client-1');assert.equal(f.service.renew(grant,'client-1'),true);assert.throws(()=>f.service.claim(ticket.ticket,'realm-1','client-2'),e=>code(e,'ticket_invalid'));
    const next=f.service.ticket(a.auth,{realmId:'realm-1',characterId:p.profile.id},'another');assert.throws(()=>f.service.claim(next.ticket,'realm-1','client-2'),e=>code(e,'character_busy'));
    f.service.logout(a.auth,'logout');assert.equal(f.service.renew(grant,'client-1'),false);assert.throws(()=>f.service.session(a.secret),e=>code(e,'session_required'));assert.throws(()=>f.service.claim(next.ticket,'realm-1','client-2'),e=>code(e,'session_required'));
  }finally{f.connection.close();}
});
test('absolute/idle session expiry and CSRF are enforced and rate windows are bounded',async()=>{
  const f=setup();try{const a=await register(f.service);assert.throws(()=>f.service.checkCsrf(a.auth,'wrong'),e=>code(e,'csrf'));f.service.checkCsrf(a.auth,a.view.csrf);
    f.advance(86_400_001);assert.throws(()=>f.service.session(a.secret),e=>code(e,'session_required'));
    for(let n=0;n<3;n++)assert.equal(f.repositories.rates.consume('key',1,100,3),true);assert.equal(f.repositories.rates.consume('key',1,100,3),false);assert.equal(f.repositories.rates.consume('key',101,100,3),true);
  }finally{f.connection.close();}
});
test('management privileges are explicit and realm changes/account revocation are audited',async()=>{
  const f=setup();try{const p=await register(f.service);assert.throws(()=>f.service.snapshot(p.auth),e=>code(e,'admin_required'));
    await f.service.bootstrapAdmin('operator',pass);const session=await f.service.login({login:'operator',password:pass},'operator','login-admin'),auth=f.service.authenticate(session.secret);
    f.service.changeAccount(auth,p.view.account.id,{status:'blocked'},'block');assert.throws(()=>f.service.session(p.secret),e=>code(e,'session_required'));
    assert.throws(()=>f.service.changeAccount(auth,auth.account.id,{status:'blocked'},'self'),e=>code(e,'protected_admin'));
    f.service.changeRealm(auth,'new-realm',{name:'New Realm',status:'online',characterSlots:5,creationEnabled:true},'new',true);
    assert.equal(f.service.snapshot(auth).realms.length,2);assert.ok(f.service.snapshot(auth).audit.some(row=>row.action==='account.status'));
    await assert.rejects(f.service.bootstrapAdmin('tester',pass),/refusing elevation/);
  }finally{f.connection.close();}
});

test('short admin passwords require local opt-in and never relax player credentials or reset existing admins',async()=>{
  const f=setup(true),strict=setup(),short='localpass1';try{
    await assert.rejects(strict.service.bootstrapAdmin('operator',short),/configured limits/);
    await assert.rejects(f.service.register({login:'player',password:short},'ip','short-register'),e=>code(e,'credentials'));
    for(const invalid of ['1234567','x'.repeat(129),'local\0pass'])await assert.rejects(f.service.bootstrapAdmin('operator',invalid),/configured limits/);
    await f.service.bootstrapAdmin('operator',short);
    await f.service.bootstrapAdmin('operator',pass);
    const session=await f.service.login({login:'operator',password:short},'ip','short-login');assert.equal(session.view.account.role,'admin');
    f.service.snapshot(f.service.authenticate(session.secret));
    await assert.rejects(f.service.login({login:'operator',password:pass},'ip','not-reset'),e=>code(e,'login_failed'));
    const noOptIn=new EntryService({repositories:f.repositories,passwords,identity:cryptographicIdentity,logger,nodeId:'strict-node'});
    await assert.rejects(noOptIn.login({login:'operator',password:short},'ip','disabled'),e=>code(e,'credentials'));
    f.repositories.accounts.insert({id:'fixture-short-player',login:'player',passwordHash:await passwords.hash(short),role:'player',status:'active',createdAt:Date.now()});
    await assert.rejects(f.service.login({login:'player',password:short},'ip','short-player'),e=>code(e,'login_failed'));
    await assert.rejects(f.service.bootstrapAdmin('player',short),/refusing elevation/);
  }finally{f.connection.close();strict.connection.close();}
});

test('local admin password opt-in is rejected before opening storage on production or non-loopback hosts',()=>{
  const folder=mkdtempSync(join(tmpdir(),'game-admin-guard-'));try{
    for(const [mode,host] of [['production','127.0.0.1'],['development','0.0.0.0']]){
      const child=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {createGameRuntime} from './server/src/game-runtime.ts'; await createGameRuntime();"],{
        encoding:'utf8',env:{...process.env,NODE_ENV:mode,HOST:host,GAME_LOCAL_ADMIN_SHORT_PASSWORD:'1',GAME_ALLOWED_ORIGINS:'https://game.example',GAME_DB_PATH:join(folder,'unused.sqlite')}});
      assert.notEqual(child.status,0);assert.match(child.stderr,/allowed only on a non-production loopback server/);
    }
  }finally{rmSync(folder,{recursive:true,force:true});}
});
test('separate DB connections arbitrate account lease, preserve saves, and do not alter legacy schema/receipts',async()=>{
  const folder=mkdtempSync(join(tmpdir(),'game-entry-')),path=join(folder,'db.sqlite');let c1:GameConnection|undefined,c2:GameConnection|undefined,legacy:ProfileStore|undefined;
  try{legacy=new ProfileStore(path);const guest=legacy.createGuest(),old=legacy.get(guest.accountId,'CHR-WANG-LIN-CHIBI');legacy.commitCast(old,'old',{accepted:true});
    c1=new GameConnection(path);const r1=sqliteGameRepositories(c1);r1.realms.insert({id:'realm-1',name:'Realm',status:'online',characterSlots:3,creationEnabled:true,updatedAt:Date.now()});
    const one=new EntryService({repositories:r1,passwords,identity:cryptographicIdentity,logger,nodeId:'node-1'}),a=await register(one),p=create(one,a.auth),ticket=one.ticket(a.auth,{realmId:'realm-1',characterId:p.profile.id},'one');
    one.claim(ticket.ticket,'realm-1','client-1');c2=new GameConnection(path);const r2=sqliteGameRepositories(c2),two=new EntryService({repositories:r2,passwords,identity:cryptographicIdentity,logger,nodeId:'node-2'});
    const second=two.ticket(two.authenticate(a.secret),{realmId:'realm-1',characterId:p.profile.id},'two');assert.throws(()=>two.claim(second.ticket,'realm-1','client-2'),e=>code(e,'character_busy'));
    r2.leases.recoverNode('node-2');assert.equal(r1.leases.count(Date.now()),1);r1.leases.recoverNode('node-1');assert.equal(two.claim(second.ticket,'realm-1','client-2').profile.id,p.profile.id);
    assert.deepEqual(legacy.receipt(old.id,'old'),{accepted:true});assert.equal(legacy.get(guest.accountId,old.avatarId).id,old.id);assert.equal(c1.db.prepare('PRAGMA user_version').get()!.user_version,2);
    c1.close();c1=new GameConnection(path);assert.equal(sqliteGameRepositories(c1).characters.get(p.profile.id)!.profile.id,p.profile.id);
  }finally{c1?.close();c2?.close();legacy?.close();const target=resolve(folder);if(dirname(target)!==resolve(tmpdir())||!basename(target).startsWith('game-entry-'))throw new Error('Unsafe fixture cleanup.');rmSync(target,{recursive:true});}
});
test('passwords use salted async scrypt; logs reject credential fields and omit exception messages',async()=>{
  const hashing=new ScryptPasswords(),a=await hashing.hash(pass),b=await hashing.hash(pass);assert.notEqual(a,b);assert.ok(await hashing.verify(pass,a));assert.equal(await hashing.verify('another-password',a),false);assert.equal(await hashing.verify(pass,undefined),false);
  const logs:string[]=[],observer=new GameObserver('test-node',line=>logs.push(line));try{observer.event('fixture',{requestId:'trace',password:pass,cookie:pass,ticket:pass});observer.failure('fixture-fail',{code:'save'},new Error(pass));assert.ok(logs.every(line=>!line.includes(pass)));assert.equal(JSON.parse(logs[0]).requestId,'trace');}finally{observer.dispose();}
});
