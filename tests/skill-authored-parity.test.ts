import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SkillTimeline, clipFrame, type SkillPresentationCatalog, type SpriteSample } from '../shared/skills/presentation';
import type { SkillEvent } from '../shared/skills/contracts';
// @ts-expect-error The authoring oracle is an existing JavaScript module.
import { SequencePlayer } from '../docs/design/vfx/frame-by-frame-r01/sequence-system.mjs';
// @ts-expect-error The authoring oracle is an existing JavaScript module.
import { SkillVfxController } from '../docs/design/vfx/frame-by-frame-r01/skill-vfx-controller.mjs';
// @ts-expect-error The authoring oracle is an existing JavaScript module.
import { P2VfxController } from '../docs/design/vfx/production/p2-controller.mjs';

const catalog=JSON.parse(readFileSync('client/public/assets/r01/clips.json','utf8')) as SkillPresentationCatalog;
const actor=()=>({id:'a',avatarId:'CHR-WANG-LIN-CHIBI',direction:'east',connected:true,x:500,y:500});
const fact=(skillId:SkillEvent['skillId'],type:SkillEvent['type']='cast',at=1000):SkillEvent=>
  ({skillId,type,at,castId:skillId,actorId:'a',x:500,y:500,dx:1,dy:0,targetX:660,targetY:500});
const sources=Object.fromEntries(Object.entries({sword:'frame-by-frame-r01',thunder:'r01-thunder-v1',wind:'r01-wind-v1'}).map(([id,folder])=>{
  const root=`docs/design/vfx/${folder}`;
  return [id,{root,skill:JSON.parse(readFileSync(`${root}/skill.json`,'utf8')),clips:JSON.parse(readFileSync(`${root}/clips.json`,'utf8')).clips}];
}));
function compare(expected:any[],actual:SpriteSample[],context:string){
  const fx=actual.filter(s=>!s.id.includes(':ghost:'));
  assert.equal(fx.length,expected.length,`${context}: active clip count`);
  for(const item of expected){
    const sample=fx.find(s=>s.clip===item.clip);assert.ok(sample,`${context}: ${item.clip}`);
    assert.equal(sample.index,item.sample.index,`${context}: ${item.clip} frame`);
    assert.ok(Math.abs(sample.x-item.point[0])<1e-6&&Math.abs(sample.y-item.point[1])<1e-6,`${context}: ${item.clip} anchor`);
  }
}

test('runtime retains every approved atlas byte, rect, hold, pivot and socket from the VFX/Skill handoff',()=>{
  for(const source of Object.values(sources))for(const [id,c] of Object.entries(source.clips) as Array<[string,any]>){
    const packed=catalog.clips[id];
    assert.deepEqual(packed.durations,c.durations);assert.deepEqual(packed.frames,c.frames.map((f:any)=>f.rect));
    assert.deepEqual(packed.anchor,c.anchor);assert.equal(packed.loop,c.loop);assert.equal(packed.fps,c.fps);
    assert.equal(createHash('sha256').update(readFileSync(`${source.root}/${c.atlas}`)).digest('hex'),packed.sha256);
    const runtimeBytes=readFileSync(`client/public${packed.atlasUrl}`);
    assert.deepEqual(runtimeBytes,readFileSync(`${source.root}/${c.atlas}`));
    for(const fps of [30,60,144])for(let i=0;i<fps*2;i++){
      const age=i/fps,expected=new SequencePlayer(c).sample(age);
      assert.equal(clipFrame(packed,age*1000),expected?.index,`${id}: ${fps} FPS, ${age}s`);
    }
  }
  for(const source of Object.values(sources))assert.deepEqual(catalog.clips[source.skill.character.clip].sockets,source.skill.sockets);
});

test('sword matches the authored hand charge, looping projectile and confirmed impact controller',()=>{
  const source=sources.sword,a=actor(),t=new SkillTimeline(catalog);
  const original=new SkillVfxController(source.skill,source.clips);
  original.beginCast({castId:'sword',startedAt:1,foot:[500,500],direction:[1,0]});t.event(fact('sword'));
  const releaseIndex=new SequencePlayer(source.clips[source.skill.character.clip]).sample(.25).index;
  const offset=source.skill.sockets[releaseIndex];
  for(const age of [0,1/24,4/24,6/24,7/24,.45,.55,.7]){
    const p={id:'p',ownerId:'a',castId:'sword',dx:1,dy:0,x:500+Math.max(0,age-.25)*480,y:500,startedAt:1250};
    // Production supplies the host's confirmed trajectory in the same hand-relative world projection.
    original.setProjectilePose('sword',{tip:[p.x+offset[0],p.y+offset[1]],direction:[1,0]});
    const expected=original.update(1+age),actual=t.sample(1000+age*1000,[a],age>=.25?[p]:[]);
    const body=expected.find((s:any)=>s.type==='character');assert.equal(actual.poses.get('a')?.index,body?.sample.index);
    compare(expected.filter((s:any)=>s.type!=='character'),actual.effects,`sword ${age}`);
  }
  const hit={...fact('sword','hit',1800),x:750,y:500};t.event(hit);
  original.confirmHit({castId:'sword',hitId:'hit',targetId:'target',worldPosition:[hit.x+offset[0],hit.y+offset[1]],incomingDirection:[1,0],confirmedAt:1.8});
  for(const age of [.8,.84,1,1.29,1.31])compare(original.update(1+age).filter((s:any)=>s.type!=='character'),t.sample(1000+age*1000,[a],[]).effects,`sword hit ${age}`);
});

test('thunder matches authored seal/ring/bolt/contact and only holds the ring after its natural sequence',()=>{
  for(const confirmedAge of [.5,1.25]){
    const source=sources.thunder,a=actor(),t=new SkillTimeline(catalog),original=new P2VfxController(source.skill,source.clips);
    original.beginCast({castId:'thunder',startedAt:1,foot:[500,500],targetFoot:[660,500]});t.event(fact('thunder'));
    let confirmed=false;
    for(let i=0;i<=60;i++){
      const age=i/24;
      if(!confirmed&&age>=confirmedAge){confirmed=true;
        t.event({...fact('thunder','hit',1000+confirmedAge*1000),x:660});
        original.confirmHit({castId:'thunder',hitId:'hit',worldPosition:[660,500],confirmedAt:1+confirmedAge});
      }
      const expected=original.update(1+age),actual=t.sample(1000+age*1000,[a],[]);
      compare(expected.filter((s:any)=>s.clip!==source.skill.character.clip),actual.effects,`thunder ${confirmedAge}/${age}`);
    }
  }
});

test('wind matches authored foot anchors and a late real arrival keeps the trail alive until confirmation',()=>{
  const source=sources.wind,a=actor(),t=new SkillTimeline(catalog),original=new P2VfxController(source.skill,source.clips);
  original.beginCast({castId:'wind',startedAt:1,foot:[500,500]});t.event(fact('wind'));
  for(const age of [0,.125,4/24,.25,.5,.8]){
    a.x=500+Math.min(160,Math.max(0,age-4/24)*640);original.setActorFoot([a.x,a.y]);
    compare(original.update(1+age).filter((s:any)=>s.clip!==source.skill.character.clip),t.sample(1000+age*1000,[a],[]).effects,`wind ${age}`);
  }
  t.event({...fact('wind','arrival',1900),x:660});
  original.confirmArrival({castId:'wind',worldFoot:[660,500],arrivedAt:1.9});
  for(const age of [.9,1,1.39,1.41])compare(original.update(1+age).filter((s:any)=>s.clip!==source.skill.character.clip),t.sample(1000+age*1000,[a],[]).effects,`wind arrival ${age}`);
});

test('a sword miss uses exactly approved impact frames 009–012 and never leaves a held final frame',()=>{
  const t=new SkillTimeline(catalog),a=actor();t.event(fact('sword'));t.sample(1250,[a],[]);
  t.event(fact('sword','miss',1800));
  for(let i=0;i<4;i++){
    const fx=t.sample(1800+i*1000/24,[a],[]).effects;
    assert.equal(fx.length,1);assert.equal(fx[0].clip,'qi-impact');assert.equal(fx[0].index,8+i);
  }
  assert.equal(t.sample(1800+4*1000/24,[a],[]).effects.length,0);
});

test('non-cardinal sword impacts and wind trails use the incoming direction without rotating body poses',()=>{
  const t=new SkillTimeline(catalog),a=actor(),dx=Math.SQRT1_2,dy=-Math.SQRT1_2;
  t.event({...fact('sword'),dx,dy});t.sample(1250,[a],[]);t.event({...fact('sword','hit',1500),dx,dy});
  assert.ok(Math.abs(t.sample(1501,[a],[]).effects.find(s=>s.clip==='qi-impact')!.rotation-Math.PI/4)<1e-6);
  const wind=new SkillTimeline(catalog);wind.event({...fact('wind'),dx,dy});
  const frame=wind.sample(1250,[a],[]);assert.equal(frame.poses.get('a')!.rotation,0);
  assert.ok(Math.abs(frame.effects.find(s=>s.clip==='wind-trail')!.rotation-Math.PI/4)<1e-6);
});
