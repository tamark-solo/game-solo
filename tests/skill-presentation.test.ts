import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SkillTimeline,clipFrame,validatePresentationCatalog,type SkillPresentationCatalog,type PresentationActor} from '../shared/skills/presentation';
import {R01_IDS,type SkillId,type AvatarId} from '../shared/profiles';
import {HANG_NHAC_AVATARS} from '../shared/hang-nhac';
import type {SkillEvent} from '../shared/skills/contracts';
const catalog=JSON.parse(readFileSync('client/public/assets/r01/clips.json','utf8')) as SkillPresentationCatalog;
const actor=(avatarId:AvatarId=HANG_NHAC_AVATARS[0]):PresentationActor=>({id:'a',avatarId,x:500,y:500,direction:'east',connected:true});
const event=(skillId:SkillId='sword',type:SkillEvent['type']='cast',at=1000):SkillEvent=>({skillId,type,at,castId:`a-${skillId}`,actorId:'a',x:500,y:500,dx:1,dy:0,targetX:660,targetY:500});
test('all 36 actor/skill/direction bindings exist and original approved Wang Lin east clips keep priority',()=>{
  validatePresentationCatalog(catalog);
  for(const id of R01_IDS)for(const avatar of HANG_NHAC_AVATARS)for(const direction of ['south','west','east','north']){
    const clip=catalog.clips[catalog.skills[id].bindings[avatar][direction as 'south']!];assert.ok(clip);
    assert.equal(clip.anchor[1],88);assert.equal(clip.frameSize[1],96);assert.ok(clip.frameSize[0]>=64);assert.ok(clip.frames.length>=8);
  }
  assert.equal(catalog.skills.sword.bindings[HANG_NHAC_AVATARS[0]].east,'wanglin-cast-east');
  assert.equal(catalog.skills.thunder.bindings[HANG_NHAC_AVATARS[0]].east,'wanglin-thunder-east');
  assert.equal(catalog.skills.wind.bindings[HANG_NHAC_AVATARS[0]].east,'wanglin-wind-east');
});
test('authored holds sample by absolute time rather than render FPS; end does not loop the cast',()=>{
  const clip=catalog.clips['wanglin-cast-east'];assert.equal(clipFrame(clip,-1),undefined);
  assert.equal(clipFrame(clip,166.667),4);assert.equal(clipFrame(clip,208.333),4);assert.equal(clipFrame(clip,250),5);
  assert.equal(clipFrame(clip,1000),undefined);assert.equal(clipFrame(clip,1000,true),11);
  for(const fps of [30,60,144])assert.equal(clipFrame(clip,Math.round(.25*fps)*1000/fps),5);
});
test('cast crop metadata covers every new frame and rejects rectangles that can expose neighbouring cells',()=>{
  const cropped=Object.values(catalog.clips).filter(c=>c.frameCrops);
  assert.equal(cropped.length,33);assert.equal(cropped.reduce((n,c)=>n+c.frameCrops!.length,0),264);
  assert.equal(catalog.clips['wanglin-wind-east'].frameCrops,undefined,'approved original east frame is preserved');
  for(const crop of [{x:-1,y:0,w:96,h:96},{x:0,y:0,w:0,h:96},{x:0,y:90,w:96,h:10},{x:0,y:NaN,w:96,h:96}]){
    const bad=structuredClone(catalog);bad.clips['wang-wind-south'].frameCrops![0]=crop;
    assert.throws(()=>validatePresentationCatalog(bad),/Invalid skill clip/);
  }
  const missing=structuredClone(catalog);missing.clips['wang-wind-south'].frameCrops!.pop();
  assert.throws(()=>validatePresentationCatalog(missing),/Invalid skill clip/);
  const hole=structuredClone(catalog);hole.clips['wang-wind-south'].frameCutouts![7][0].w=500;
  assert.throws(()=>validatePresentationCatalog(hole),/Invalid skill clip/);
});
test('a confirmed cast selects the actor own clip, advances poses and returns control to locomotion',()=>{
  for(const avatar of HANG_NHAC_AVATARS){const t=new SkillTimeline(catalog),a=actor(avatar);t.event(event());
    const before=t.sample(1000,[a],[]).poses.get('a')!,release=t.sample(1270,[a],[]).poses.get('a')!;
    assert.equal(before.clip,catalog.skills.sword.bindings[avatar].east);assert.notEqual(before.index,release.index);
    t.event(event());assert.equal(t.sample(1270,[a],[]).poses.get('a')!.index,release.index,'retry cannot restart timeline');
    assert.equal(t.sample(1700,[a],[]).poses.size,0);
  }
});
test('late join/reconnect resumes active pose from snapshot without inventing an old impact',()=>{
  const t=new SkillTimeline(catalog),a={...actor(),castId:'resume',castSkill:'thunder',castStartedAt:1000,castAimX:1,castAimY:0};
  const frame=t.sample(1450,[a],[]);assert.ok(frame.poses.get('a')!.index>=6);
  assert.ok(!frame.effects.some(e=>e.clip==='thunder-impact'||e.clip==='thunder-bolt'));
  assert.ok(t.diagnostics().trace.some(e=>e.type==='snapshot-resume'));
});
test('no predicted hit; confirmed hit is deduplicated and thunder contact delay is independent of body animation',()=>{
  const t=new SkillTimeline(catalog),a=actor();t.event(event('thunder'));
  assert.ok(!t.sample(1500,[a],[]).effects.some(e=>e.clip==='thunder-impact'));
  const hit=event('thunder','hit',1500);t.event(hit);t.event(hit);
  assert.equal(t.sample(1501,[a],[]).effects.filter(e=>e.clip==='thunder-bolt').length,1);
  assert.ok(!t.sample(1550,[a],[]).effects.some(e=>e.clip==='thunder-impact'));
  const late=t.sample(1750,[a],[]);assert.equal(late.poses.size,0);assert.equal(late.effects.filter(e=>e.clip==='thunder-impact').length,1);
});
test('cancelled pose cannot resurrect from a stale snapshot and an old cancel cannot remove a new cast',()=>{
  const t=new SkillTimeline(catalog),a=actor();t.event(event());t.event(event('sword','cancel',1050));
  assert.equal(t.sample(1100,[{...a,castId:'a-sword',castSkill:'sword',castStartedAt:1000}],[]).poses.size,0);
  t.event({...event(),castId:'new',at:1200});t.event({...event('sword','cancel',1210),castId:'other-old'});
  assert.equal(t.sample(1300,[a],[]).poses.size,1);
});

test('an older snapshot cannot replace a newer confirmed cast or spam resume after the pose ended',()=>{
  const t=new SkillTimeline(catalog),a=actor();
  t.event({...event('wind'),at:1300,castId:'newer'});
  const stale={...a,castId:'old',castSkill:'sword',castStartedAt:1000,castAimX:1,castAimY:0};
  assert.equal(t.sample(1400,[stale],[]).poses.get('a')?.clip,'wanglin-wind-east');
  const ended={...a,castId:'newer',castSkill:'wind',castStartedAt:1300};
  t.sample(2000,[ended],[]);t.sample(2016,[ended],[]);
  assert.equal(t.diagnostics().casts,0);
  assert.ok(!t.diagnostics().trace.some(e=>e.type==='snapshot-resume'));
});
test('wind ghosts use historical host positions; ending cast clears them and actor removal clears visual state',()=>{
  const t=new SkillTimeline(catalog),a=actor();t.event(event('wind'));
  t.sample(1200,[a],[]);a.x=560;t.sample(1250,[a],[]);a.x=620;
  const frame=t.sample(1320,[a],[]),ghosts=frame.effects.filter(e=>e.id.includes(':ghost:'));
  assert.ok(ghosts.length>0);assert.ok(ghosts.every(g=>g.x<620));assert.ok(ghosts.every(g=>g.opacity<.5));
  assert.equal(t.sample(1600,[a],[]).effects.filter(e=>e.id.includes(':ghost:')).length,0);
  assert.equal(t.sample(1700,[],[]).poses.size,0);assert.equal(t.diagnostics().casts,0);
});
test('presentation capacities and trace remain bounded under bursts; malformed timing rejects before use',()=>{
  const t=new SkillTimeline(catalog,8);
  for(let i=0;i<1500;i++)t.event({...event(),castId:`burst-${i}`,actorId:`actor-${i}`});
  assert.ok(t.diagnostics().effects<=8);assert.ok(t.diagnostics().casts<=8);assert.ok(t.diagnostics().trace.length<=128);assert.ok(t.diagnostics().dropped>0);
  const bad=structuredClone(catalog);bad.skills.sword.characterEnd+=100;assert.throws(()=>validatePresentationCatalog(bad),/timing mismatch/);
  const bounds=structuredClone(catalog);bounds.clips['wanglin-cast-east'].atlasSize[0]=1;assert.throws(()=>validatePresentationCatalog(bounds),/Invalid skill clip/);
  const track=structuredClone(catalog);track.skills.sword.tracks[0].duration=NaN;assert.throws(()=>validatePresentationCatalog(track),/Invalid presentation track/);
});
