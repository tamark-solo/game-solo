import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newProject,newLevel,uid,editorWalkable,moveInEditor,portalAt,parseProject,runtimeLevel,exportEditorLevel,mergeEditorLevel,type EditorRegion} from '../shared/map-editor';
const rectangle=(level:ReturnType<typeof newLevel>,kind:EditorRegion['kind'],x:number,y:number,w:number,h:number):EditorRegion=>({id:uid(),name:kind,layerId:level.layers.find(l=>l.kind==='regions')!.id,kind,points:[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}],enabled:true,targetLevelId:'',target:null});

test('authored walk regions join at shared edges and blockers keep a foot-radius clearance',()=>{
 const l=newLevel();l.walkPolicy='regions';l.regions=[rectangle(l,'walk',0,0,300,600),rectangle(l,'walk',300,0,300,600),rectangle(l,'block',450,100,30,400)];
 for(let x=280;x<=320;x++)assert.equal(editorWalkable(l,{x,y:300}),true);
 assert.equal(editorWalkable(l,{x:444,y:300}),false);assert.equal(editorWalkable(l,{x:440,y:300}),true);
 let p={x:400,y:300,direction:'east' as const,moving:false};for(let i=0;i<120;i++)p=moveInEditor(l,p,{x:1,y:0},1/60,120) as typeof p;
 assert.ok(p.x<=442&&editorWalkable(l,p));assert.equal(p.moving,false);
});
test('hiding data layers does not disable collision, but explicit activity toggles do',()=>{
 const l=newLevel(),r=rectangle(l,'block',400,300,100,100);l.regions.push(r);const layer=l.layers.find(x=>x.id===r.layerId)!;
 layer.visible=false;assert.equal(editorWalkable(l,{x:450,y:350}),false);layer.enabled=false;assert.equal(editorWalkable(l,{x:450,y:350}),true);
 layer.enabled=true;r.enabled=false;assert.equal(editorWalkable(l,{x:450,y:350}),true);
});
test('portal transitions resolve independent levels and reject missing or blocked destinations',()=>{
 const p=newProject([]),a=p.levels[0],b=newLevel('Suối');p.levels.push(b);const portal=rectangle(a,'portal',450,400,120,100);portal.targetLevelId=b.id;a.regions.push(portal);
 const resolved=portalAt(p,a,a.spawn);assert.equal(resolved?.level.id,b.id);assert.deepEqual(resolved?.point,b.spawn);
 b.regions.push(rectangle(b,'block',480,420,80,80));assert.equal(portalAt(p,a,a.spawn),null);portal.targetLevelId='missing';assert.equal(portalAt(p,a,a.spawn),null);
});
test('project serialization retains authored geometry and rejects malformed paths/references without accepting executable assets',()=>{
 const p=newProject([{id:'house',name:'House',width:64,height:96,pivot:{x:32,y:88},parts:[{id:'body',file:'/assets/map-kit/images/house.png',cover:false}]}]);
 const l=p.levels[0];l.objects.push({id:uid(),name:'House',assetId:'house',layerId:l.layers[2].id,coverLayerId:l.layers[3].id,x:200,y:300,scale:1,flipX:false,opacity:1,locked:false});l.regions.push(rectangle(l,'walk',20,20,400,400));
 assert.deepEqual(parseProject(JSON.parse(JSON.stringify(p))),p);assert.deepEqual(runtimeLevel(p,l).walkable[0].points,l.regions[0].points);
 const bad=structuredClone(p);bad.assets[0].parts[0].file='https://example.com/tracker.png';assert.throws(()=>parseProject(bad));
 bad.assets[0].parts[0].file='/assets/../secret.png';assert.throws(()=>parseProject(bad));bad.assets[0].parts[0].file=p.assets[0].parts[0].file;bad.levels[0].objects[0].layerId='missing';assert.throws(()=>parseProject(bad));
});
test('standalone level export/import preserves inactive editing data without replacing an existing level',()=>{
 const p=newProject([]),l=p.levels[0],r=rectangle(l,'block',200,200,120,90);r.enabled=false;l.regions.push(r);
 const file=exportEditorLevel(p,l),merged=mergeEditorLevel(p,JSON.parse(JSON.stringify(file)));
 assert.equal(merged.levels.length,2);assert.equal(merged.id,p.id);assert.notEqual(merged.levels[0].id,merged.levels[1].id);assert.deepEqual(merged.levels[1].regions[0].points,r.points);assert.equal(merged.levels[1].regions[0].enabled,false);assert.deepEqual(p.levels,[l]);
});
