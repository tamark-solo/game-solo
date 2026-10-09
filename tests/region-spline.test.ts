import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleSpline, splineOutline, nearestSplineEdge, SPLINE_TOLERANCE, translateRegion } from '../shared/region-spline';
import { newProject, newLevel, uid, parseProject, editorWalkable, moveInEditor, exportEditorLevel, mergeEditorLevel, type EditorRegion } from '../shared/map-editor';
import { capturePrefab, instantiatePrefab, duplicateEntities, exportRuntimeProject } from '../shared/level-design';
const anchors=[{x:300,y:200},{x:500,y:400},{x:300,y:600},{x:100,y:400}];
function region(level:ReturnType<typeof newLevel>,kind:EditorRegion['kind']='block'):EditorRegion {
  const spline={anchors:structuredClone(anchors),smoothness:1};
  return {id:uid(),name:'Spline fixture',layerId:level.layers.find(l=>l.kind==='regions')!.id,kind,spline,points:sampleSpline(spline.anchors),enabled:true,targetLevelId:'',target:null};
}
const close=(a:number,b:number,epsilon=1e-5)=>assert.ok(Math.abs(a-b)<=epsilon,`${a} != ${b}`);

test('closed spline passes its anchors, samples a curved boundary and maps edge insertions back to source segments',()=>{
  const {points,edges}=splineOutline(anchors);
  assert.ok(points.length>anchors.length);assert.equal(edges.length,points.length);
  for(const anchor of anchors)assert.ok(points.some(p=>p.x===anchor.x&&p.y===anchor.y));
  assert.notDeepEqual(points[0],points.at(-1));assert.deepEqual(sampleSpline(anchors,0),anchors);
  // Equal knot intervals have this analytic Catmull-Rom midpoint on segment 0.
  const midpoint={x:425,y:275},edge=nearestSplineEdge({anchors,smoothness:1},midpoint);
  assert.equal(edge.index,0);assert.ok(edge.distance<=SPLINE_TOLERANCE);
  const uneven=sampleSpline([{x:0,y:0},{x:1,y:1},{x:5000,y:10},{x:5100,y:2000}]);
  assert.ok(uneven.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
  assert.ok(sampleSpline([{x:0,y:0},{x:0,y:0},{x:100,y:50}]).every(p=>Number.isFinite(p.x)),'coincident live drag stays finite');
});

test('adaptive outline stays within world tolerance of an independently evaluated cubic curve',()=>{
  const polygon=sampleSpline(anchors),distance=(p:{x:number;y:number})=>Math.min(...polygon.map((a,i)=>{const b=polygon[(i+1)%polygon.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}));
  for(let i=0;i<=1000;i++){
    const t=i/1000,t2=t*t,t3=t2*t,p0=anchors[3],p1=anchors[0],p2=anchors[1],p3=anchors[2];
    const coordinate=(key:'x'|'y')=>.5*((2*p1[key])+(-p0[key]+p2[key])*t+(2*p0[key]-5*p1[key]+4*p2[key]-p3[key])*t2+(-p0[key]+3*p1[key]-3*p2[key]+p3[key])*t3);
    assert.ok(distance({x:coordinate('x'),y:coordinate('y')})<=SPLINE_TOLERANCE+1e-5);
  }
});

test('project and standalone level preserve spline editing data and derive collision from anchors rather than stale samples',()=>{
  const p=newProject([]),l=p.levels[0],r=region(l);l.regions.push(r);const canonical=parseProject(p);
  assert.deepEqual(canonical,p);const forged=structuredClone(p);forged.levels[0].regions[0].points=[{x:0,y:0},{x:10,y:0},{x:0,y:10}];assert.deepEqual(parseProject(forged).levels[0].regions[0].points,r.points);
  const imported=mergeEditorLevel(newProject([]),exportEditorLevel(p,l));assert.deepEqual(imported.levels.at(-1)!.regions[0].spline,r.spline);
  for(const invalid of [NaN,-.1,1.1]){const bad=structuredClone(p);bad.levels[0].regions[0].spline!.smoothness=invalid;assert.throws(()=>parseProject(bad));}
  const bad=structuredClone(p);bad.levels[0].regions[0].spline!.anchors[1]={...anchors[0]};assert.throws(()=>parseProject(bad),/trùng/);
  bad.levels[0].regions[0].spline!.anchors=Array.from({length:65},(_,i)=>({x:i,y:i*i}));assert.throws(()=>parseProject(bad));
});

test('spline collision blocks a curved bulge and movement while runtime retains the polygon contract',()=>{
  const p=newProject([]),l=p.levels[0];l.regions=[region(l)];
  assert.equal(editorWalkable(l,{x:420,y:285},0),false,'inside the curve but outside the control polygon');
  assert.equal(editorWalkable(l,{x:540,y:400}),true);assert.equal(editorWalkable(l,{x:507,y:400}),false,'foot clearance');
  let player={x:600,y:400,direction:'west' as const,moving:false};for(let i=0;i<180;i++)player=moveInEditor(l,player,{x:-1,y:0},1/60,120) as typeof player;
  assert.ok(player.x>=508&&player.x<=511);assert.equal(player.moving,false);
  const runtime=exportRuntimeProject(p);assert.deepEqual(runtime.levels[0].blockers[0].points,l.regions[0].points);assert.equal('spline' in runtime.levels[0].blockers[0],false);
  l.walkPolicy='regions';l.spawn={x:300,y:400};l.regions[0].kind='walk';assert.equal(editorWalkable(l,{x:420,y:300}),true);assert.equal(editorWalkable(l,{x:540,y:400}),false);
});

test('translation, duplicate and prefab move spline anchors and sampled boundaries together',()=>{
  const p=newProject([]),l=p.levels[0],r=region(l),source=structuredClone(r);l.regions.push(r);
  translateRegion(r,31,-12);r.points.forEach((v,i)=>{close(v.x,source.points[i].x+31);close(v.y,source.points[i].y-12);});assert.deepEqual(r.spline!.anchors[0],{x:331,y:188});
  const chosen=[{kind:'region' as const,id:r.id}],copy=duplicateEntities(l,chosen);assert.deepEqual(l.regions[1].spline!.anchors[0],{x:363,y:220});assert.notEqual(copy[0].id,r.id);
  const prefab=capturePrefab(p,l,chosen,'Spline prefab'),destination=newLevel();p.levels.push(destination);instantiatePrefab(p,destination,prefab,{x:700,y:800});
  const placed=destination.regions[0],parsed=parseProject(p).levels[1].regions[0];assert.deepEqual(placed.spline,parsed.spline);placed.points.forEach((v,i)=>{close(v.x,parsed.points[i].x);close(v.y,parsed.points[i].y);});
  assert.equal(placed.spline!.anchors[0].x,900);assert.equal(placed.spline!.anchors[0].y,800);assert.deepEqual(source.spline!.anchors,anchors);
});
