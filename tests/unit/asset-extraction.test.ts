import assert from 'node:assert/strict';
import test from 'node:test';
import {cutOutline,cutBounds,cutPlacement,parseExtraction,type AssetExtraction} from '../../shared/asset-extraction.ts';
import {newProject,parseProject,type EditorAsset,type EditorObject} from '../../shared/map-editor.ts';
import {exportAssetLibrary,mergeAssetLibrary,duplicateAsset} from '../../shared/level-design.ts';
const anchors=[{x:20,y:30},{x:120,y:30},{x:120,y:100},{x:20,y:100}];
const extraction:AssetExtraction={sourceAssetId:'map-source',sourceName:'Map tổng',sourceWidth:200,sourceHeight:200,bounds:{x:20,y:30,width:100,height:70},shape:'rect',anchors,smoothness:1};
const asset:EditorAsset={id:'cut-asset',name:'Vật cắt',width:100,height:70,pivot:{x:50,y:60},category:'prop',defaultLayer:'depth',parts:[{id:'body',file:'data:image/png;base64,AAAA',cover:false},{id:'cover',file:'data:image/png;base64,AAAA',cover:true}],extraction};
test('cut bounds use native integer pixels, curve bulges and clip to source edges',()=>{
  assert.deepEqual(cutBounds(cutOutline('rect',anchors,1),200,200),extraction.bounds);
  const points=cutOutline('spline',anchors,1),b=cutBounds(points,200,200);assert.ok(points.length>20);assert.ok(b.x<20&&b.y<30&&b.width>100&&b.height>70);
  assert.deepEqual(cutBounds([{x:-5.5,y:-10},{x:30.2,y:0},{x:0,y:40.4}],20,30),{x:0,y:0,width:20,height:30});
});
test('reject malformed, crossed, duplicate, degenerate and oversize crop geometry',()=>{
  for(const points of [anchors.slice(0,2),[{x:0,y:0},{x:100,y:100},{x:0,y:100},{x:100,y:0}],[anchors[0],anchors[0],anchors[2]],anchors.map(p=>({x:p.x,y:NaN}))])assert.throws(()=>cutOutline('polygon',points,1));
  assert.throws(()=>cutOutline('spline',Array.from({length:65},(_,i)=>({x:i,y:i%2})),1));assert.throws(()=>cutOutline('polygon',anchors,2));assert.throws(()=>cutBounds([{x:220,y:0},{x:250,y:0},{x:230,y:20}],200,200));
});
test('cut placement preserves every source pixel at flip scale and custom instance pivot',()=>{
  const source={...asset,width:200,height:200,pivot:{x:0,y:0}};
  for(const flipX of [false,true])for(const scale of [.5,1,2]){
    const object:EditorObject={id:'source',name:'Nguồn',assetId:source.id,layerId:'depth',coverLayerId:'cover',x:400,y:300,scale,flipX,opacity:.7,locked:true,pivot:{x:80,y:140}};
    const p=cutPlacement(source,object,extraction.bounds,asset.pivot),sign=flipX?-1:1;
    for(const pixel of [{x:0,y:0},{x:37,y:41},{x:100,y:70}]){
      assert.equal(p.x+sign*(pixel.x-asset.pivot.x)*scale,object.x+sign*(extraction.bounds.x+pixel.x-object.pivot!.x)*scale);
      assert.equal(p.y+(pixel.y-asset.pivot.y)*scale,object.y+(extraction.bounds.y+pixel.y-object.pivot!.y)*scale);
    }
  }
});
test('source metadata, multipart canvas and pivot survive project and library round trips without source asset',()=>{
  const project=parseProject(newProject([asset]));assert.deepEqual(project.assets[0],asset);
  const library=exportAssetLibrary(project);assert.deepEqual(mergeAssetLibrary(newProject([]),library).assets[0],asset);
});
test('provenance validates dimensions, source coordinates and exact crop bounds',()=>{
  assert.deepEqual(parseExtraction(extraction,100,70),extraction);
  for(const value of [{...extraction,sourceAssetId:undefined},{...extraction,bounds:{...extraction.bounds,width:99}},{...extraction,sourceWidth:20},{...extraction,anchors:[{x:-1,y:30},...anchors.slice(1)]},{...extraction,shape:'unknown'},{...extraction,smoothness:NaN}])assert.throws(()=>parseExtraction(value,100,70));
  assert.throws(()=>parseExtraction(extraction,100,71));
});


test('duplicated assets are independent backups of all parts, pivot and extraction metadata',()=>{
 const project=newProject([structuredClone(asset)]),original=structuredClone(project.assets[0]),levels=structuredClone(project.levels),copy=duplicateAsset(project,asset.id);
 assert.notEqual(copy.id,asset.id);assert.equal(copy.name,'Vật cắt · bản sao');assert.deepEqual({...copy,id:asset.id,name:asset.name},asset);assert.deepEqual(project.levels,levels);
 assert.notEqual(copy.parts,project.assets[0].parts);assert.notEqual(copy.pivot,project.assets[0].pivot);assert.notEqual(copy.extraction!.anchors,project.assets[0].extraction!.anchors);
 copy.pivot.x=10;copy.parts[0].file='data:image/png;base64,BBBB';copy.parts[1].cover=false;copy.extraction!.anchors[0].x=30;assert.deepEqual(project.assets[0],original);
});
test('asset backup names remain unique and bounded, limits fail without changing project',()=>{
 const project=newProject([structuredClone(asset)]),first=duplicateAsset(project,asset.id),second=duplicateAsset(project,first.id);assert.equal(second.name,'Vật cắt · bản sao 2');
 project.assets[0].name='x'.repeat(120);assert.equal(duplicateAsset(project,asset.id).name.length,120);
 const before=structuredClone(project);assert.throws(()=>duplicateAsset(project,'missing'));assert.deepEqual(project,before);
 project.assets=Array.from({length:200},(_,i)=>({...structuredClone(asset),id:`a-${i}`}));const capped=structuredClone(project);assert.throws(()=>duplicateAsset(project,'a-0'),/200/);assert.deepEqual(project,capped);
});
