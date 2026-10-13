import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeGroup,groupAt,drawCommands,nodeBounds,intersects,groupBounds} from '../../docs/design/characters/van-hai-monster-animation-v1/cluster-model.mjs';
const body=JSON.parse(fs.readFileSync('docs/design/characters/van-hai-monster-animation-v1/catalog.json','utf8')),fx=JSON.parse(fs.readFileSync('docs/design/vfx/van-hai-monster-vfx-v2/catalog.json','utf8'));
const base={actor:'jade-guard',count:6,spacing:110,timing:'salvo',aim:'converge',direction:'southeast'};
test('groups use existing clips, independent identities and clocks; same release for mixed windups',()=>{
 for(const preset of ['same','mixed','escort'])for(const count of [3,6,9,12,18]){
  const g=makeGroup({...base,preset,count},body,fx);assert.equal(g.actors.length,count);assert.equal(new Set(g.actors.map(a=>a.id)).size,count);
  assert.equal(new Set(g.actors.map(a=>a.start+a.releaseAt)).size,1);
  if(preset==='escort'){assert.equal(g.actors.filter(a=>a.actor.rank==='elite').length,1);assert.ok(g.actors.slice(1).every(a=>a.slug==='jade-scute'));}
  const time=g.actors[0].start+g.actors[0].releaseAt+160,state=groupAt(g,time,false,'hit',body,fx);
  for(const a of state.actors){assert.equal(a.clip,body.clips[a.clip.id]);for(const n of a.graph.nodes.filter(n=>n.phase==='impact'))for(let i=0;i<2;i++)assert.ok(Math.abs(n.point[i]+a.foot[i]-g.target[i])<1e-8);}
  const b=groupBounds(g,body,fx);assert.ok(b.every(Number.isFinite)&&b[2]>b[0]&&b[3]>b[1]);
  assert.equal(groupAt(g,g.period,true,'hit',body,fx).time,0);
  assert.ok(groupAt(g,g.period,false,'hit',body,fx).actors.every(a=>a.clip.action==='idle'&&!a.graph));
 }
});
test('staggered casts do not restart other actor clocks; miss/cancel never generate impacts',()=>{
 const g=makeGroup({...base,preset:'mixed',timing:'stagger',count:18},body,fx);
 assert.ok(new Set(g.actors.map(a=>a.start+a.releaseAt)).size>1);
 for(let t=0;t<g.period;t+=83){
  const a=groupAt(g,t,false,'hit',body,fx),b=groupAt(g,t,false,'hit',body,fx);assert.deepEqual(a.actors.map(a=>[a.pose.index,a.age]),b.actors.map(a=>[a.pose.index,a.age]));
  assert.ok(groupAt(g,t,false,'miss',body,fx).actors.every(a=>!a.graph?.nodes.some(n=>n.phase==='impact')));
  assert.ok(groupAt(g,t,false,'cancel',body,fx).actors.every(a=>!a.graph?.facts.cancel||a.graph.nodes.length===0));
 }
});
test('ground then world-foot order; managed crowd budget prevents alpha accumulation over player',()=>{
 const g=makeGroup({...base,preset:'mixed',count:18},body,fx),s=groupAt(g,800,false,'hit',body,fx),full=drawCommands(s,'full',true,true),managed=drawCommands(s,'managed',true,true);
 assert.ok(full.depth.every((c,i)=>!i||c.depth>=full.depth[i-1].depth));
 assert.equal(full.ground.filter(c=>c.kind==='warning').length,managed.ground.filter(c=>c.kind==='warning').length);
 const crowded=managed.depth.filter(c=>c.kind==='fx'&&c.node.layer==='above'&&intersects(nodeBounds(c.node,c.actor.foot)));
 assert.ok(crowded.length>5);assert.ok(crowded.reduce((sum,c)=>sum+c.opacity,0)<=.830001);
 assert.equal(full.depth.filter(c=>c.kind==='body').length,18);assert.equal(managed.depth.filter(c=>c.kind==='body').length,18);
 assert.equal(drawCommands(s,'managed',false,true).depth.filter(c=>c.kind==='fx').length,0);
});
