import test from 'node:test';
import assert from 'node:assert/strict';
import catalogData from '../../docs/design/characters/quest-motion-v1/clips.json';
import { QuestMotionTimeline, cultivationMotion, readQuestMotion, type QuestMotionCatalog, type QuestMotionEvent } from '../../shared/quest-motion';
import { initialSectProgress, type SectView } from '../../shared/sect';
const catalog=catalogData as unknown as QuestMotionCatalog;
const actor={id:'a',avatarId:'CHR-WANG-LIN-CHIBI',moving:false,connected:true};
const event=(kind:QuestMotionEvent['kind'],at=1000):QuestMotionEvent=>({id:`${kind}-${at}`,actorId:'a',kind,direction:'south',at});
const view=():SectView=>({...initialSectProgress(),profileId:'p',cultivation:0,milestone:'introduction',savedAt:0,hp:100,practising:false,activityStatus:'stopped',cycleStatus:'settling',cycleReadyAt:4000});
test('one-shot uses absolute age, does not replay duplicate/late events, and returns to locomotion',()=>{
  const timeline=new QuestMotionTimeline();timeline.event(event('basic'));
  assert.equal(timeline.sample(catalog,actor,1050)?.index,0);
  assert.equal(timeline.sample(catalog,actor,1150)?.index,1);
  assert.equal(timeline.sample(catalog,actor,1250)?.index,2);
  assert.equal(timeline.sample(catalog,actor,1350)?.index,3);
  assert.equal(timeline.sample(catalog,actor,1400),undefined);
  timeline.event(event('basic'));assert.equal(timeline.sample(catalog,actor,1500),undefined);
  timeline.event(event('basic',2000));timeline.event(event('basic',1700));assert.equal(timeline.sample(catalog,actor,2050)?.index,0);
});
test('all avatars have independent four-direction basic strikes and three gestures',()=>{
  assert.equal(Object.keys(catalog.clips).length,21);
  for(const avatarId of Object.keys(catalog.bindings)){
    for(const direction of ['south','west','east','north'] as const){const timeline=new QuestMotionTimeline();timeline.event({...event('basic'),direction});
      assert.match(timeline.sample(catalog,{...actor,avatarId},1200)!.clip,new RegExp(`basic-${direction}$`));}
    for(const kind of ['greeting','recovery','cultivation'] as const){const timeline=new QuestMotionTimeline();timeline.event(event(kind));assert.ok(timeline.sample(catalog,{...actor,avatarId},1250));}
  }
});
test('cultivation follows valid state, paused/walking/disconnected states stop it and snapshots advance',()=>{
  const v=view(),timeline=new QuestMotionTimeline();assert.equal(cultivationMotion(v,false),true);
  assert.equal(cultivationMotion({...v,practising:true},false),false);assert.equal(cultivationMotion(v,true),false);
  assert.equal(cultivationMotion({...v,cycleStatus:'away'},false),false);
  assert.equal(timeline.sample(catalog,actor,1100,v)?.index,0);assert.equal(timeline.sample(catalog,actor,1700,v)?.index,2);
  assert.equal(timeline.sample(catalog,{...actor,moving:true},1800,v),undefined);
  assert.equal(timeline.sample(catalog,{...actor,connected:false},1800,v),undefined);
  const activity={...v,cycleReadyAt:0,cycleStatus:'complete' as const,activityStatus:'running' as const};
  assert.equal(timeline.sample(catalog,actor,2500,activity)?.index,0);assert.equal(timeline.sample(catalog,actor,2800,activity)?.index,1);
});
test('idle cancels only the loop; moving cancels greeting, malformed facts rejected, reset has no replay',()=>{
  const timeline=new QuestMotionTimeline();timeline.event(event('cultivation'));timeline.event(event('basic',1100));timeline.event(event('idle',1200));
  assert.equal(timeline.sample(catalog,actor,1250)?.kind,'basic');assert.equal(timeline.sample(catalog,actor,1600),undefined);
  timeline.event(event('greeting',1700));assert.equal(timeline.sample(catalog,{...actor,moving:true},1750),undefined);assert.equal(timeline.sample(catalog,actor,1800),undefined);
  timeline.reset();assert.equal(timeline.sample(catalog,actor,1800),undefined);
  assert.equal(readQuestMotion({...event('basic'),at:NaN}),undefined);assert.equal(readQuestMotion({...event('basic'),direction:'diagonal'}),undefined);
});
