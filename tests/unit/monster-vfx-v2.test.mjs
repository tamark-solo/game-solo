import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cueGraph,reviewAge,presentationEnd,reviewBounds,effectSample} from '../../docs/design/vfx/van-hai-monster-vfx-v2/cues.mjs';
import {productionFrameAge,productionDuration} from '../../client/src/core/actor-animation-production.ts';
const body=JSON.parse(fs.readFileSync('docs/design/characters/van-hai-monster-animation-v1/catalog.json','utf8'));
const fx=JSON.parse(fs.readFileSync('docs/design/vfx/van-hai-monster-vfx-v2/catalog.json','utf8'));
test('every species/direction has three phases, separated hit/miss/cancel and terminal dissipation',()=>{
 assert.equal(fx.actors.length,11);
 for(const kit of fx.actors)for(const d of body.directions){
  const c=body.clips[kit.id+'-attack-'+d],release=productionFrameAge(c,3),charge=productionFrameAge(c,1),end=presentationEnd(c,kit,fx);
  assert.deepEqual(cueGraph(c,charge-1,'hit',kit,fx).nodes,[]);
  assert.deepEqual(cueGraph(c,(charge+release)/2,'hit',kit,fx).nodes.map(n=>n.phase),['charge']);
  const launch=cueGraph(c,release+1,'hit',kit,fx);assert.deepEqual(launch.nodes.map(n=>n.phase),['release']);
  const committed=cueGraph(c,launch.facts.hitAt+100,'hit',kit,fx);assert.ok(committed.nodes.some(n=>n.phase==='impact'));
  assert.equal(cueGraph(c,launch.facts.hitAt+100,'miss',kit,fx).nodes.some(n=>n.phase==='impact'),false);
  assert.deepEqual(cueGraph(c,launch.facts.hitAt+100,'cancel',kit,fx).nodes,[]);
  assert.deepEqual(cueGraph(c,end,'hit',kit,fx).nodes,[],'fractional frame duration cannot retain a zero-opacity terminal cue');
  assert.deepEqual(cueGraph(c,end+1,'hit',kit,fx).nodes,[],'tail never sticks when body has completed');
  assert.equal(reviewAge(c,end+1,false,kit,fx),end);
  assert.equal(reviewAge(c,end+250,true,kit,fx),0);
  const early=cueGraph(c,release+20,'hit',kit,fx),late=cueGraph(c,release+120,'hit',kit,fx);
  if(!early.profile.travel)assert.deepEqual(early.nodes.find(n=>n.phase==='release').point,late.nodes.find(n=>n.phase==='release').point,'recovery hand cannot drag release origin');
  const b=reviewBounds(c,kit,fx);assert.ok(b.every(Number.isFinite)&&b[2]>b[0]&&b[3]>b[1]);
  for(const age of [charge+20,release+100,launch.facts.hitAt+100])for(const n of cueGraph(c,age,'hit',kit,fx).nodes){
   assert.ok(n.sample.opacity>0&&n.sample.opacity<=1);assert.equal(n.sample.index,effectSample(n.clip,n.phase==='charge'?age-charge:age-(n.phase==='release'?release:launch.facts.hitAt),release-charge).index);
  }
 }
});
test('eleven releases have their own artwork; elites do not alias a normal creature FX',()=>{
 assert.equal(new Set(fx.actors.map(a=>fx.clips[a.release].atlasSha256)).size,11);
 for(const a of fx.actors.filter(a=>a.rank==='elite'))assert.ok(fx.clips[a.release].peakTargetWidth>=140);
 const c=fx.clips['wolf-caller-release'],duration=productionDuration(c);
 assert.equal(effectSample(c,duration,null),null);assert.equal(effectSample(c,-1,null),null);
 assert.ok(effectSample(c,duration-1,null).opacity<.01);
});
