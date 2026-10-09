import {parseExtraction,type AssetExtraction} from './asset-extraction.ts';
import {sampleSpline,MAX_SPLINE_ANCHORS,MAX_SPLINE_SAMPLES,type RegionSpline} from './region-spline.ts';
import { moveUsingCollision, type Motion, type Input, type Position } from './world.ts';
import { inside, navigationWalkable } from './navigation.ts';
export { inside, edgeDistance } from './navigation.ts';

export type LayerKind='ground'|'decor'|'depth'|'cover'|'regions';
export interface EditorLayer {id:string;name:string;kind:LayerKind;visible:boolean;locked:boolean;enabled:boolean}
export interface EditorAsset {id:string;name:string;width:number;height:number;pivot:Position;parts:Array<{id:string;file:string;cover:boolean}>;category?:'terrain'|'building'|'nature'|'prop'|'other';defaultLayer?:Exclude<LayerKind,'regions'>;extraction?:AssetExtraction}
export interface EditorObject {id:string;name:string;assetId:string;layerId:string;coverLayerId:string;x:number;y:number;scale:number;flipX:boolean;opacity:number;locked:boolean;pivot?:Position;groupId?:string}
export interface EditorRegion {id:string;name:string;layerId:string;kind:'walk'|'block'|'portal';points:Position[];enabled:boolean;targetLevelId:string;target:Position|null;groupId?:string;spline?:RegionSpline}
export interface EditorLevel {id:string;name:string;width:number;height:number;background:string;walkPolicy:'full'|'regions';spawn:Position;layers:EditorLayer[];objects:EditorObject[];regions:EditorRegion[]}
export interface EditorPrefab {id:string;name:string;layers:EditorLayer[];objects:EditorObject[];regions:EditorRegion[]}
export interface EditorProject {schema:'game-solo-map-editor-1';id:string;name:string;activeLevelId:string;assets:EditorAsset[];levels:EditorLevel[];prefabs?:EditorPrefab[]}
export const uid=()=>crypto.randomUUID();
export function newLevel(name='Level mới'):EditorLevel {
  return {id:uid(),name,width:1024,height:896,background:'#e4ddc9',walkPolicy:'full',spawn:{x:512,y:448},objects:[],regions:[],layers:[
    {id:uid(),name:'Nền',kind:'ground',visible:true,locked:false,enabled:true},
    {id:uid(),name:'Trang trí thấp',kind:'decor',visible:true,locked:false,enabled:true},
    {id:uid(),name:'Vật thể · theo chân',kind:'depth',visible:true,locked:false,enabled:true},
    {id:uid(),name:'Tán / mái · theo chân',kind:'cover',visible:true,locked:false,enabled:true},
    {id:uid(),name:'Vùng hoạt động',kind:'regions',visible:true,locked:false,enabled:true},
  ]};
}
export function newProject(assets:EditorAsset[]):EditorProject {const level=newLevel('Level 1');return {schema:'game-solo-map-editor-1',id:uid(),name:'Dự án map mới',activeLevelId:level.id,assets,levels:[level],prefabs:[]};}
export function regionActivity(level:EditorLevel,region:EditorRegion):'active'|'region-disabled'|'layer-disabled' {
  if(!region.enabled)return 'region-disabled';
  return level.layers.some(l=>l.id===region.layerId&&l.enabled)?'active':'layer-disabled';
}
export function regionsOnDisabledLayers(level:EditorLevel):EditorRegion[] {return level.regions.filter(r=>regionActivity(level,r)==='layer-disabled');}
export function enableRegionLayers(level:EditorLevel):void {
  const ids=new Set(regionsOnDisabledLayers(level).map(r=>r.layerId));
  for(const layer of level.layers)if(ids.has(layer.id))layer.enabled=true;
}
export function activeRegions(level:EditorLevel):EditorRegion[] {return level.regions.filter(r=>regionActivity(level,r)==='active');}
export function editorWalkable(level:EditorLevel,p:Position,radius=8):boolean {
  const regions=activeRegions(level);
  return navigationWalkable({width:level.width,height:level.height,walkPolicy:level.walkPolicy,
    walkable:regions.filter(r=>r.kind==='walk'),blockers:regions.filter(r=>r.kind==='block')},p,radius);
}
export function moveInEditor(level:EditorLevel,m:Motion,input:Input,dt:number,speed=80):Motion {return moveUsingCollision(m,input,dt,speed,p=>editorWalkable(level,p));}
export function portalAt(project:EditorProject,level:EditorLevel,p:Position):{level:EditorLevel;point:Position;region:EditorRegion}|null {
  const portal=activeRegions(level).find(r=>r.kind==='portal'&&inside(p,r.points));if(!portal)return null;
  const destination=project.levels.find(l=>l.id===portal.targetLevelId);if(!destination)return null;
  const point=portal.target??destination.spawn;if(!editorWalkable(destination,point))return null;
  return {level:destination,point:{...point},region:portal};
}
export function parseProject(value:unknown):EditorProject {
  const fail=(s:string):never=>{throw new Error(`Dữ liệu map không hợp lệ: ${s}`);};
  const record=(v:unknown):Record<string,any>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:fail('cấu trúc');
  const str=(v:unknown,max=120)=>typeof v==='string'&&v.length>0&&v.length<=max?v:fail('tên/id');
  const id=(v:unknown)=>{const s=str(v,80);if(!/^[a-zA-Z0-9_-]+$/.test(s))fail('id');return s;};
  const num=(v:unknown,min=-16384,max=16384)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:fail('tọa độ/kích thước');
  const bool=(v:unknown)=>typeof v==='boolean'?v:fail('trạng thái');
  const arr=(v:unknown,max:number)=>Array.isArray(v)&&v.length<=max?v:fail('số phần tử');
  const point=(v:unknown)=>{const p=record(v);return {x:num(p.x),y:num(p.y)};};
  const unique=(values:Array<{id:string}>)=>{if(new Set(values.map(v=>v.id)).size!==values.length)fail('id trùng');};
  const p=record(value);if(p.schema!=='game-solo-map-editor-1')fail('phiên bản schema');
  const assets=arr(p.assets,200).map(v=>{const a=record(v),parts=arr(a.parts,8).map(v=>{const r=record(v),file=str(r.file,7_000_000);if(!/^\/assets\/[a-zA-Z0-9_./-]+$/.test(file)&&!/^data:image\/(?:png|webp);base64,[A-Za-z0-9+/=]+$/.test(file))fail('đường dẫn PNG/WebP');if(file.includes('..'))fail('đường dẫn');return {id:id(r.id),file,cover:bool(r.cover)};});if(!parts.length)fail('asset thiếu ảnh');unique(parts);return {...(a.extraction!==undefined?{extraction:parseExtraction(a.extraction,a.width,a.height)}:{}),id:id(a.id),name:str(a.name),width:num(a.width,1,8192),height:num(a.height,1,8192),pivot:point(a.pivot),parts,...(a.category!==undefined?{category:(['terrain','building','nature','prop','other'].includes(a.category)?a.category:fail('nhóm asset')) as EditorAsset['category']} : {}),...(a.defaultLayer!==undefined?{defaultLayer:(['ground','decor','depth','cover'].includes(a.defaultLayer)?a.defaultLayer:fail('layer asset')) as EditorAsset['defaultLayer']} : {})};});unique(assets);
  const levels=arr(p.levels,64).map(v=>{const l=record(v),layers=arr(l.layers,64).map(v=>{const r=record(v);if(!['ground','decor','depth','cover','regions'].includes(r.kind))fail('loại layer');return {id:id(r.id),name:str(r.name),kind:r.kind as LayerKind,visible:bool(r.visible),locked:bool(r.locked),enabled:bool(r.enabled)};});if(!layers.length)fail('thiếu layer');unique(layers);
    const objects=arr(l.objects,10000).map(v=>{const r=record(v),layerId=id(r.layerId),coverLayerId=id(r.coverLayerId),assetId=id(r.assetId);if(!layers.some(l=>l.id===layerId&&l.kind!=='regions')||!layers.some(l=>l.id===coverLayerId&&l.kind==='cover')||!assets.some(a=>a.id===assetId))fail('tham chiếu object/layer');return {id:id(r.id),name:str(r.name),assetId,layerId,coverLayerId,x:num(r.x),y:num(r.y),scale:num(r.scale,.1,4),flipX:bool(r.flipX),opacity:num(r.opacity,0,1),locked:bool(r.locked),...(r.pivot!==undefined?{pivot:point(r.pivot)}:{}),...(r.groupId!==undefined?{groupId:id(r.groupId)}:{})};});unique(objects);
    const regions=arr(l.regions,3000).map(v=>{const r=record(v),layerId=id(r.layerId);let points=arr(r.points,r.spline===undefined?256:MAX_SPLINE_SAMPLES).map(point);let spline:RegionSpline|undefined;if(r.spline!==undefined){const source=record(r.spline),anchors=arr(source.anchors,MAX_SPLINE_ANCHORS).map(point);if(anchors.length<3||anchors.some((a,i)=>Math.hypot(a.x-anchors[(i+1)%anchors.length].x,a.y-anchors[(i+1)%anchors.length].y)<.001))fail('spline cần ít nhất 3 điểm, hai điểm kề không được trùng');spline={anchors,smoothness:num(source.smoothness,0,1)};points=sampleSpline(anchors,spline.smoothness).map(point);}if(!['walk','block','portal'].includes(r.kind)||!layers.some(l=>l.id===layerId&&l.kind==='regions')||points.length<3)fail('vùng');let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a.x*b.y-b.x*a.y;}if(Math.abs(area)<2)fail('vùng quá nhỏ');return {id:id(r.id),name:str(r.name),layerId,kind:r.kind as EditorRegion['kind'],points,enabled:bool(r.enabled),targetLevelId:r.targetLevelId===''?'':id(r.targetLevelId),target:r.target===null?null:point(r.target),...(spline?{spline}:{}),...(r.groupId!==undefined?{groupId:id(r.groupId)}:{})};});unique(regions);
    if(!/^#[0-9a-f]{6}$/i.test(l.background)||!['full','regions'].includes(l.walkPolicy))fail('nền/luật đi');return {id:id(l.id),name:str(l.name),width:num(l.width,64,8192),height:num(l.height,64,8192),background:l.background as string,walkPolicy:l.walkPolicy as EditorLevel['walkPolicy'],spawn:point(l.spawn),layers,objects,regions};});
  if(!levels.length)fail('thiếu level');unique(levels);const activeLevelId=id(p.activeLevelId);if(!levels.some(l=>l.id===activeLevelId))fail('level đang chọn');
  const prefabs=p.prefabs===undefined?undefined:arr(p.prefabs,64).map(v=>{const f=record(v),key=id(f.id),name=str(f.name),validated=parseProject({schema:'game-solo-map-editor-1',id:'prefab-validation',name,activeLevelId:key,assets,levels:[{id:key,name,width:8192,height:8192,background:'#ffffff',walkPolicy:'full',spawn:{x:8,y:8},layers:f.layers,objects:f.objects,regions:f.regions}]});return {id:key,name,layers:validated.levels[0].layers,objects:validated.levels[0].objects,regions:validated.levels[0].regions};});if(prefabs)unique(prefabs);
  return {schema:'game-solo-map-editor-1',id:id(p.id),name:str(p.name),activeLevelId,assets,levels,...(prefabs?{prefabs}:{})};
}
export function runtimeLevel(project:EditorProject,level:EditorLevel) {
  const regions=activeRegions(level).map(({spline,...region})=>region);
  return {schema:'game-solo-authored-level-1',id:level.id,name:level.name,world:{width:level.width,height:level.height,spawn:level.spawn,playerRadius:8},character:{frameSize:[64,96],anchor:[32,88]},walkPolicy:level.walkPolicy,layers:level.layers,assets:project.assets.filter(a=>level.objects.some(o=>o.assetId===a.id)),objects:level.objects,walkable:regions.filter(r=>r.kind==='walk'),blockers:regions.filter(r=>r.kind==='block'),portals:regions.filter(r=>r.kind==='portal')};
}
export function exportEditorLevel(project:EditorProject,level:EditorLevel){return {schema:'game-solo-editor-level-1',level:structuredClone(level),assets:project.assets.filter(a=>level.objects.some(o=>o.assetId===a.id))};}
export function mergeEditorLevel(project:EditorProject,value:unknown):EditorProject {
  if(!value||typeof value!=='object'||(value as any).schema!=='game-solo-editor-level-1')throw new Error('File không phải level của editor.');
  const raw=value as any,incoming=parseProject({schema:'game-solo-map-editor-1',id:uid(),name:'Nhập level',activeLevelId:raw.level?.id,assets:raw.assets,levels:[raw.level]}),result=structuredClone(project),l=incoming.levels[0];
  for(const asset of incoming.assets){const old=result.assets.find(a=>a.id===asset.id);if(!old){result.assets.push(asset);continue;}if(JSON.stringify(old)!==JSON.stringify(asset)){const id=uid();for(const o of l.objects)if(o.assetId===asset.id)o.assetId=id;asset.id=id;result.assets.push(asset);}}
  if(result.levels.some(x=>x.id===l.id)){const old=l.id;l.id=uid();l.name+=' (nhập)';for(const r of l.regions)if(r.targetLevelId===old)r.targetLevelId=l.id;}
  result.levels.push(l);result.activeLevelId=l.id;return parseProject(result);
}
