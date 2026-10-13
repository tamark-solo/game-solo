import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {trial,contains,bossOffset,contactOnce,escapeBudget,ms,vector} from '../../docs/design/characters/cloud-wolf-king-animation-v1/fixture.mjs';
import {productionSample,productionDuration,productionFrameAge} from '../../client/src/core/actor-animation-production.ts';

const root=new URL('../../docs/design/characters/cloud-wolf-king-animation-v1/',import.meta.url);
const kit=JSON.parse(await readFile(new URL('kit.json',root),'utf8'));
const catalog=JSON.parse(await readFile(new URL('catalog.json',root),'utf8'));
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];

test('solo fixture stays separate from current game rules',()=>{
 assert.equal(kit.runtimeImplemented,false);assert.equal(kit.gameplayTimingApproved,false);
 assert.equal(kit.playerSpeed,80);assert.equal(kit.fps,24);
 assert.ok(kit.deferred.some(x=>x.includes('server')));
});

for(const action of Object.keys(kit.skills)){
 test(`${action}: normal-speed escape clears the locked attack in all eight views`,()=>{
  for(const direction of directions){
   const hit=trial(kit,action,direction,'hit'),miss=trial(kit,action,direction,'miss');
   assert.equal(hit.origin,'isolated-review-fixture');assert.equal(hit.hit,true,action+'/'+direction);
   assert.equal(miss.hit,false,action+'/'+direction+' must actually escape');
   assert.equal(miss.lockedAim,direction);
   assert.equal(miss.factsAt(miss.resolve+1).contactAge,null);
   assert.ok(hit.factsAt(hit.resolve+1).contactAge>=0);
   const start=miss.playerAt(miss.lock+kit.readReactionMs+kit.latencyFixtureMs);
   assert.deepEqual(start,miss.playerAt(0));
   assert.ok(Math.hypot(...miss.playerAt(miss.resolve).map((p,i)=>p-start[i]))>0);
   assert.deepEqual(miss.playerAt(miss.end+10000),miss.playerAt(miss.resolve));
  }
 });
 test(`${action}: release, confirmed contact and pre-release cancellation use absolute time`,()=>{
  for(const direction of directions){
   const hit=trial(kit,action,direction,'hit'),cancel=trial(kit,action,direction,'cancel');
   assert.equal(hit.factsAt(hit.release-1).releaseAge,null);
   assert.equal(hit.factsAt(hit.release).releaseAge,0);
   assert.equal(hit.factsAt(hit.resolve-1).contactAge,null);
   assert.equal(hit.factsAt(hit.resolve).contactAge,0);
   assert.equal(hit.factsAt(hit.end+120).contactAge,hit.end+120-hit.resolve);
   for(const age of [cancel.cancelAt,cancel.release,cancel.resolve,cancel.end+10000]){
    const facts=cancel.factsAt(age);assert.equal(facts.cancelled,true);
    assert.equal(facts.warning,false);assert.equal(facts.releaseAge,null);assert.equal(facts.contactAge,null);
    assert.equal(Math.hypot(...facts.bossOffset),0);
   }
  }
 });
}

test('Vân Nha holds arrival through recovery and never snaps to its launch point',()=>{
 const k=kit.skills.van_nha,release=ms(k.releaseTick),arrival=release+ms(k.travelTicks);
 for(const direction of directions){
  const endpoint=vector(direction).map(n=>n*k.range);
  for(const age of [arrival,ms(k.endTick),ms(k.endTick)+10000])for(let i=0;i<2;i++)assert.ok(Math.abs(bossOffset(kit,'van_nha',direction,age)[i]-endpoint[i])<1e-9);
  const half=bossOffset(kit,'van_nha',direction,release+ms(k.travelTicks)/2);
  for(let i=0;i<2;i++)assert.ok(Math.abs(half[i]-endpoint[i]/2)<1e-9);
  assert.equal(Math.hypot(...bossOffset(kit,'van_nha',direction,release-1)),0);
  // Cancelling motion after it has begun freezes the reached point.
  assert.deepEqual(bossOffset(kit,'van_nha',direction,arrival+300,release+ms(k.travelTicks)/2),half);
 }
 assert.ok(escapeBudget(kit,'van_nha')>kit.skills.van_nha.halfWidth+kit.playerFootRadius+8);
});

test('Hồi Phong leaves the locked rear opening and the hollow center clear',()=>{
 for(const direction of directions){
  const v=vector(direction),at=(distance,angle)=>{
   const c=Math.cos(angle),s=Math.sin(angle);return [distance*(v[0]*c-v[1]*s),distance*(v[0]*s+v[1]*c)];
  };
  assert.equal(contains(kit,'hoi_phong',direction,[0,0]),false);
  assert.equal(contains(kit,'hoi_phong',direction,at(74,0)),true);
  assert.equal(contains(kit,'hoi_phong',direction,at(74,Math.PI)),false);
  assert.equal(contains(kit,'hoi_phong',direction,at(74,Math.PI+Math.PI/8)),false);
  assert.equal(contains(kit,'hoi_phong',direction,at(74,Math.PI+Math.PI/3)),true);
  assert.equal(contains(kit,'hoi_phong',direction,at(kit.skills.hoi_phong.outerRadius+kit.playerFootRadius+1,0)),false);
 }
});

test('impact receipt dedup rejects unconfirmed and unrelated events',()=>{
 const seen=new Set(),event={origin:'isolated-review-fixture',id:'cast/1/target',confirmed:true};
 assert.equal(contactOnce(seen,{...event,confirmed:false}),false);assert.equal(seen.size,0);
 assert.equal(contactOnce(seen,{...event,origin:'local-frame'}),false);assert.equal(seen.size,0);
 assert.equal(contactOnce(seen,event),true);assert.equal(contactOnce(seen,event),false);
 assert.equal(contactOnce(seen,{...event,id:'cast/2/target'}),true);assert.equal(seen.size,2);
});

test('64 bindings use Core clock, including release frame and sustained final corpse',()=>{
 assert.equal(Object.keys(catalog.clips).length,64);assert.deepEqual(catalog.coverage.missing,[]);
 assert.equal(catalog.coverage.poses,384);assert.deepEqual(catalog.directions,directions);
 for(const action of catalog.actions)for(const direction of directions){
  const clip=catalog.clips[action+'-'+direction];assert.ok(clip);
  assert.equal(clip.frames.length,6);assert.equal(clip.durations.length,6);
  assert.deepEqual(clip.frameSize,catalog.frameSize);assert.deepEqual(clip.pivot,catalog.pivot);
  for(let i=0;i<6;i++)assert.equal(productionSample(clip,productionFrameAge(clip,i)).index,i);
  if(kit.skills[action]){
   assert.equal(productionDuration(clip),ms(kit.skills[action].endTick));
   assert.equal(productionFrameAge(clip,3),ms(kit.skills[action].releaseTick));
  }
  if(clip.loop){assert.equal(productionSample(clip,productionDuration(clip)).index,0);assert.equal(productionSample(clip,productionDuration(clip)).complete,false);}
  else{assert.equal(productionSample(clip,productionDuration(clip)+10000).index,5);assert.equal(productionSample(clip,productionDuration(clip)+10000).complete,true);}
 }
});
