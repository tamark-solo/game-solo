import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ProfileStore, ProfileLeases } from '../../server/src/profile-store';
import { HANG_NHAC_AVATARS } from '../../shared/hang-nhac';

function cleanTemporaryFixture(folder:string):void {
  const target=resolve(folder),base=resolve(tmpdir());
  if(dirname(target)!==base || !/^hn-(profiles|corrupt)-/.test(basename(target))) throw new Error('Refusing cleanup outside the allocated test fixture.');
  rmSync(target,{recursive:true});
}

test('three profiles seed once, separate resources and preserve identity across SQLite reopen',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-profiles-')),path=join(folder,'profiles.sqlite');
  let store=new ProfileStore(path);
  try {
    const account=store.createGuest(); assert.equal(store.authenticate(account.token),account.accountId);
    assert.equal(store.authenticate('invalid'),undefined);
    const profiles=store.list(account.accountId); assert.equal(profiles.length,3); assert.equal(new Set(profiles.map(p=>p.id)).size,3);
    assert.ok(profiles.every(p=>JSON.stringify(p.skills)==='["sword","thunder","wind"]'&&!('accountId' in p)));
    assert.equal(profiles[1].progressionKind,'recovery');
    const p=store.get(account.accountId,HANG_NHAC_AVATARS[0]); p.mp=65;p.x+=30;p.casts=2;p.nextThunderAt=Date.now()+5000;store.save(p);
    const stale={...p}; store.save(p);assert.throws(()=>store.save(stale),/revision conflict/);
    store.close();store=new ProfileStore(path);
    const loaded=store.get(store.authenticate(account.token)!,HANG_NHAC_AVATARS[0]);assert.equal(loaded.mp,65);assert.equal(loaded.x,p.x);assert.equal(loaded.nextThunderAt,p.nextThunderAt);
    assert.equal(store.get(account.accountId,HANG_NHAC_AVATARS[1]).mp,100);assert.equal(store.get(account.accountId,HANG_NHAC_AVATARS[2]).casts,0);
    assert.throws(()=>store.get('another-account',HANG_NHAC_AVATARS[0]),/belong/);
    const inspection=new DatabaseSync(path); const row=inspection.prepare('SELECT token_hash FROM accounts').get()!;assert.notEqual(row.token_hash,account.token);inspection.close();
  } finally {store.close();cleanTemporaryFixture(folder);}
});
test('cast receipt and resource save commit together or roll back together',()=>{
  const store=new ProfileStore(':memory:');
  try {
    const a=store.createGuest(), p=store.get(a.accountId,HANG_NHAC_AVATARS[0]);
    p.mp=90;p.casts=1;store.commitCast(p,'once',{accepted:true});assert.deepEqual(store.receipt(p.id,'once'),{accepted:true});
    const revision=p.revision;p.mp=80;assert.throws(()=>store.commitCast(p,'once',{accepted:true}));assert.equal(p.revision,revision);
    assert.equal(store.get(a.accountId,HANG_NHAC_AVATARS[0]).mp,90);
    const stale={...p};store.save(p);assert.throws(()=>store.commitCast(stale,'rollback',{accepted:true}),/revision conflict/);assert.equal(store.receipt(p.id,'rollback'),undefined);
  }finally{store.close();}
});
test('a corrupt save cannot silently unlock a different skill or change the character progression kind',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-corrupt-')),path=join(folder,'db.sqlite'),store=new ProfileStore(path);
  try{
    const a=store.createGuest(), p=store.get(a.accountId,HANG_NHAC_AVATARS[1]);const raw=new DatabaseSync(path);
    raw.prepare('UPDATE profiles SET data=? WHERE id=?').run(JSON.stringify({...p,skills:['sword','thunder','r02']}),p.id);
    assert.throws(()=>store.get(a.accountId,HANG_NHAC_AVATARS[1]),/validation/);raw.close();
  }finally{store.close();cleanTemporaryFixture(folder);}
});
test('account lease blocks another tab while active, preserves same-session reconnect and ignores an old release',()=>{
  const leases=new ProfileLeases();assert.equal(leases.acquire('a','first',0),true);leases.activate('a','first');
  assert.equal(leases.acquire('a','second',100000),false);assert.equal(leases.acquire('a','first',100000),true);leases.activate('a','first');
  leases.release('a','old');assert.equal(leases.acquire('a','second',100001),false);leases.release('a','first');assert.equal(leases.acquire('a','second',100002),true);
  assert.equal(leases.acquire('b','third',100002),true);
});
test('v1 JSON profiles upgrade without losing identity, R01 resources or durable receipts; sect ledger is atomic',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-profiles-')),path=join(folder,'db.sqlite');let store=new ProfileStore(path);
  try{
    const a=store.createGuest(),p=store.get(a.accountId,HANG_NHAC_AVATARS[0]);p.mp=65;p.casts=2;p.x+=20;
    store.commitCast(p,'old-cast',{accepted:true});store.close();
    const raw=new DatabaseSync(path);const {sect,schema,...old}=p;
    raw.prepare('UPDATE profiles SET data=? WHERE id=?').run(JSON.stringify({...old,schema:1}),p.id);raw.exec('PRAGMA user_version=1');raw.close();
    store=new ProfileStore(path);const upgraded=store.get(a.accountId,HANG_NHAC_AVATARS[0]);
    assert.equal(upgraded.schema,2);assert.equal(upgraded.id,p.id);assert.equal(upgraded.mp,65);assert.equal(upgraded.x,p.x);
    assert.deepEqual(store.receipt(p.id,'old-cast'),{accepted:true});assert.equal(upgraded.sect.hn01,false);
    upgraded.sect.hn01=true;upgraded.sect.supplies=2;store.commitSect(upgraded,'intro',{command:'accept_intro',result:{ok:true}});
    const stale={...upgraded,sect:{...upgraded.sect,supplies:10}};store.save(upgraded);
    assert.throws(()=>store.commitSect(stale,'rollback',{ok:true}),/revision conflict/);assert.equal(store.sectReceipt(p.id,'rollback'),undefined);
    assert.equal(store.get(a.accountId,HANG_NHAC_AVATARS[0]).sect.supplies,2);
    assert.deepEqual(store.sectReceipt(p.id,'intro'),{command:'accept_intro',result:{ok:true}});
  }finally{store.close();cleanTemporaryFixture(folder);}
});
