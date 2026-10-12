import assert from 'node:assert/strict';import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,resolve,dirname,basename} from 'node:path';
import {initialProfile} from '../../shared/profiles';import {initialCharacterInventory,validCharacterInventory,characterItems,ownedItemId,readCharacterCommand,characterCommandKey} from '../../shared/character-inventory';
import {performCharacterCommand} from '../../server/src/character-inventory';import {ProfileStore} from '../../server/src/profile-store';
import {performSectCommand} from '../../server/src/sect-progress';
import type {CombatActor} from '../../shared/r01';
const actor=(hp=72)=>({connected:true,hp,castId:'',lastSpentAt:0} as CombatActor);
const profile=()=>initialProfile('profile1','account1','CHR-WANG-LIN-CHIBI',1000);
function cleanFixture(folder:string){const target=resolve(folder);if(dirname(target)!==resolve(tmpdir())||!/^hn-(character|char-ledger)-/.test(basename(target)))throw new Error('Refusing cleanup outside character fixture.');rmSync(target,{recursive:true});}
test('initial inventory uses stable personal IDs; equipment and supplies share no duplicate quantity store',()=>{
  const p=profile();assert.equal(validCharacterInventory(p.inventory,p.id),true);assert.deepEqual(initialCharacterInventory(p.id),p.inventory);
  p.sect.supplies=2;const items=characterItems(p);assert.equal(items.length,3);assert.equal(items.find(i=>i.definitionId==='recovery')!.quantity,2);
  p.sect.supplies=0;assert.equal(characterItems(p).length,2);assert.equal(validCharacterInventory(p.inventory,'someone-else'),false);
});
test('wire command rejects owner/stat/quantity injection and protection is a boolean',()=>{
  const base={id:'x',action:'use',itemId:'profile1_recovery'};
  for(const extra of [{quantity:999},{profileId:'other'},{hp:100},{protected:true}])assert.equal(readCharacterCommand({...base,...extra}),undefined);
  assert.equal(readCharacterCommand({...base,itemId:'../item'}),undefined);assert.equal(readCharacterCommand({...base,action:'protect',protected:'true'}),undefined);
  const valid=readCharacterCommand({...base,action:'protect',protected:true})!;assert.ok(valid);assert.notEqual(characterCommandKey(valid),characterCommandKey({...valid,protected:false} as typeof valid));
});
test('equip/unequip/protect return a candidate; resources and original profile stay unchanged',()=>{
  const p=profile(),before=structuredClone(p),itemId=p.inventory.gear[0].id;
  const out=performCharacterCommand(p,actor(),{id:'remove',action:'unequip',itemId},10000);assert.equal(out.result.ok,true);assert.equal(out.candidate!.inventory.equipment.weapon,undefined);
  assert.deepEqual(p,before);assert.equal(out.candidate!.hp,100);assert.equal(out.candidate!.mp,100);
  const equip=performCharacterCommand(out.candidate!,actor(),{id:'equip',action:'equip',itemId},10000);assert.equal(equip.candidate!.inventory.equipment.weapon,itemId);
  const protect=performCharacterCommand(p,actor(),{id:'protect',action:'protect',itemId,protected:true},10000);assert.equal(protect.candidate!.inventory.gear[0].protected,true);assert.equal(p.inventory.gear[0].protected,false);
});
test('foreign item, wrong action, inactive actor and active lesson cannot mutate gear/resources',()=>{
  const p=profile(),id=p.inventory.gear[0].id;
  assert.equal(performCharacterCommand(p,actor(),{id:'x',action:'equip',itemId:'another_wood-sword'},10000).result.reason,'item');
  assert.equal(performCharacterCommand(p,actor(),{id:'x',action:'use',itemId:id},10000).result.reason,'kind');
  assert.equal(performCharacterCommand(p,{...actor(),connected:false},{id:'x',action:'equip',itemId:id},10000).result.reason,'inactive');
  p.sect.lessons.active='arts';assert.equal(performCharacterCommand(p,actor(),{id:'x',action:'unequip',itemId:id},10000).result.reason,'combat');
});
test('recovery reuses real supply count, full-HP guard and cooldown; no optimistic resource update',()=>{
  const p=profile();p.hp=72;p.sect.supplies=2;const command={id:'once',action:'use' as const,itemId:ownedItemId(p.id,'recovery')};
  const out=performCharacterCommand(p,actor(),command,10000);assert.equal(out.candidate!.hp,100);assert.equal(out.candidate!.sect.supplies,1);assert.equal(out.candidate!.sect.nextRecoveryAt,20000);assert.equal(p.hp,72);assert.equal(p.sect.supplies,2);
  assert.equal(performCharacterCommand(out.candidate!,actor(72),{...command,id:'twice'},11000).result.reason,'cooldown');
  assert.equal(performCharacterCommand(p,actor(100),command,10000).result.reason,'full_hp');
});
test('NPC and inventory share recovery eligibility and preserve resources on every rejection',()=>{
  const cases: Array<{name:string;reason?:string;change?:(p:ReturnType<typeof profile>,a:CombatActor)=>void;projectile?:boolean}>=[
    {name:'ready'},
    {name:'HN03 idle',reason:'combat',change:p=>{p.sect.lessons.active='arts';}},
    {name:'HN04 idle',reason:'combat',change:p=>{p.sect.lessons.active='avoid';}},
    {name:'casting',reason:'combat',change:(_p,a)=>{a.castId='cast';}},
    {name:'projectile',reason:'combat',projectile:true},
    {name:'cast recovery',reason:'combat',change:(_p,a)=>{a.lastSpentAt=9000;}},
    {name:'basic recovery',reason:'combat',change:p=>{p.sect.lessons.nextBasicAt=9500;}},
    {name:'cooldown',reason:'cooldown',change:p=>{p.sect.nextRecoveryAt=10001;}},
    {name:'full HP',reason:'full_hp',change:(_p,a)=>{a.hp=100;}},
    {name:'no supplies',reason:'supplies',change:p=>{p.sect.supplies=0;}},
    {name:'no supplies during lesson',reason:'combat',change:p=>{p.sect.supplies=0;p.sect.lessons.active='arts';}},
    {name:'disconnected',reason:'inactive',change:(_p,a)=>{a.connected=false;}},
    {name:'dead',reason:'inactive',change:(_p,a)=>{a.hp=0;}},
  ];
  for(const scenario of cases){
    const p=profile(),a=actor(72);p.hp=72;p.sect.supplies=2;scenario.change?.(p,a);
    const before=structuredClone(p),beforeActor=structuredClone(a),id='parity';
    const npc=performSectCommand(p,a,{id,action:'use_recovery'},10000,0,scenario.projectile);
    const inventory=performCharacterCommand(p,a,{id,action:'use',itemId:ownedItemId(p.id,'recovery')},10000,scenario.projectile);
    assert.deepEqual(inventory,npc,scenario.name);
    assert.equal(npc.result.ok,!scenario.reason,scenario.name);assert.equal(npc.result.reason,scenario.reason,scenario.name);
    if(scenario.reason)assert.equal(npc.candidate,undefined,scenario.name);
    else{assert.equal(npc.candidate!.hp,100);assert.equal(npc.candidate!.sect.supplies,1);assert.equal(npc.candidate!.sect.nextRecoveryAt,20000);}
    assert.deepEqual(p,before,scenario.name);assert.deepEqual(a,beforeActor,scenario.name);
  }
});
test('invalid inventory is rejected: duplicate gear, wrong slot, foreign equipment and invalid protection',()=>{
  const v=initialCharacterInventory('p');
  for(const invalid of [{...v,gear:[v.gear[0],v.gear[0]]},{...v,equipment:{weapon:v.gear[1].id}},{...v,equipment:{weapon:'foreign'}},{...v,recoveryProtected:1}])assert.equal(validCharacterInventory(invalid,'p'),false);
});
test('old schema 2 save adds starter gear once while preserving resources, progress and old receipts',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-character-')),path=join(folder,'db.sqlite');let store=new ProfileStore(path);
  try{
    const guest=store.createGuest(),p=store.get(guest.accountId,'CHR-WANG-LIN-CHIBI');p.hp=72;p.mp=65;p.sect.hn01=true;p.sect.supplies=2;
    store.commitSect(p,'intro',{command:'old',result:{ok:true}});store.commitCast(p,'cast',{accepted:true});store.close();
    const raw=new DatabaseSync(path);const {inventory,...legacy}=p;raw.prepare('UPDATE profiles SET data=? WHERE id=?').run(JSON.stringify(legacy),p.id);raw.close();
    store=new ProfileStore(path);let loaded=store.get(guest.accountId,'CHR-WANG-LIN-CHIBI');assert.equal(loaded.inventory.gear.length,2);assert.equal(loaded.hp,72);assert.equal(loaded.mp,65);assert.equal(loaded.sect.supplies,2);
    assert.deepEqual(store.sectReceipt(p.id,'intro'),{command:'old',result:{ok:true}});assert.deepEqual(store.receipt(p.id,'cast'),{accepted:true});
    store.save(loaded);store.close();store=new ProfileStore(path);loaded=store.get(guest.accountId,'CHR-WANG-LIN-CHIBI');assert.equal(loaded.inventory.gear.length,2);assert.deepEqual(loaded.inventory,inventory);
  }finally{store.close();cleanFixture(folder);}
});
test('character receipt and candidate are atomic across conflict, duplicate and database reopen',()=>{
  const folder=mkdtempSync(join(tmpdir(),'hn-char-ledger-')),path=join(folder,'db.sqlite');let store=new ProfileStore(path);
  try{
    const guest=store.createGuest(),p=store.get(guest.accountId,'CHR-WANG-LIN-CHIBI');p.inventory.gear[0].protected=true;store.commitCharacter(p,'once',{command:'protect',result:{ok:true}});
    const stale=structuredClone(p);store.save(p);stale.inventory.gear[0].protected=false;
    assert.throws(()=>store.commitCharacter(stale,'conflict',{ok:true}),/revision conflict/);assert.equal(store.characterReceipt(p.id,'conflict'),undefined);assert.equal(store.get(guest.accountId,p.avatarId).inventory.gear[0].protected,true);
    assert.throws(()=>store.commitCharacter(p,'once',{ok:true}));store.close();store=new ProfileStore(path);assert.deepEqual(store.characterReceipt(p.id,'once'),{command:'protect',result:{ok:true}});assert.equal(store.get(guest.accountId,p.avatarId).inventory.gear[0].protected,true);
  }finally{store.close();cleanFixture(folder);}
});
