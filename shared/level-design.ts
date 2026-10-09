import {translateRegion} from './region-spline.ts';
import {type EditorAsset,type EditorLevel,type EditorObject,type EditorRegion,type EditorProject,type EditorPrefab,newProject,parseProject,runtimeLevel,editorWalkable,regionActivity,uid} from './map-editor.ts';
import type {Position} from './world.ts';

export interface EntitySelection {kind:'object'|'region';id:string}
export interface Box {left:number;top:number;w:number;h:number}
export const entityKey=(s:EntitySelection)=>`${s.kind}:${s.id}`;
export function entity(level:EditorLevel,s:EntitySelection):EditorObject|EditorRegion|undefined {return s.kind==='object'?level.objects.find(o=>o.id===s.id):level.regions.find(r=>r.id===s.id);}
export function objectBounds(o:EditorObject,a:EditorAsset):Box {const p=o.pivot??a.pivot;return {left:o.x-(o.flipX?a.width-p.x:p.x)*o.scale,top:o.y-p.y*o.scale,w:a.width*o.scale,h:a.height*o.scale};}
export function entityBounds(project:EditorProject,level:EditorLevel,s:EntitySelection):Box {
  if(s.kind==='object'){const o=level.objects.find(o=>o.id===s.id)!;return objectBounds(o,project.assets.find(a=>a.id===o.assetId)!);}
  const r=level.regions.find(r=>r.id===s.id)!,xs=r.points.map(p=>p.x),ys=r.points.map(p=>p.y);return {left:Math.min(...xs),top:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
}
const union=(boxes:Box[]):Box=>{const left=Math.min(...boxes.map(b=>b.left)),top=Math.min(...boxes.map(b=>b.top));return {left,top,w:Math.max(...boxes.map(b=>b.left+b.w))-left,h:Math.max(...boxes.map(b=>b.top+b.h))-top};};
export function selectionBounds(p:EditorProject,l:EditorLevel,items:EntitySelection[]):Box {return union(items.map(s=>entityBounds(p,l,s)));}
export function groupMembers(l:EditorLevel,s:EntitySelection):EntitySelection[] {const groupId=entity(l,s)?.groupId;if(!groupId)return [s];return [...l.objects.filter(o=>o.groupId===groupId).map(o=>({kind:'object' as const,id:o.id})),...l.regions.filter(r=>r.groupId===groupId).map(r=>({kind:'region' as const,id:r.id}))];}
export function translateEntities(l:EditorLevel,items:EntitySelection[],dx:number,dy:number):void {for(const s of items){if(s.kind==='object'){const o=l.objects.find(o=>o.id===s.id)!;o.x+=dx;o.y+=dy;}else {const r=l.regions.find(r=>r.id===s.id)!;translateRegion(r,dx,dy);}}}
export function duplicateEntities(l:EditorLevel,items:EntitySelection[],dx=32,dy=32):EntitySelection[] {
  const groups=new Map<string,string>(),out:EntitySelection[]=[];
  for(const s of items){const source=entity(l,s);if(!source)continue;const copy=structuredClone(source);copy.id=uid();copy.name+=' (bản sao)';if(copy.groupId){if(!groups.has(copy.groupId))groups.set(copy.groupId,uid());copy.groupId=groups.get(copy.groupId)!;}
    if(s.kind==='object'){(copy as EditorObject).locked=false;l.objects.push(copy as EditorObject);}else l.regions.push(copy as EditorRegion);out.push({kind:s.kind,id:copy.id});}
  translateEntities(l,out,dx,dy);return out;
}
export type Alignment='left'|'right'|'top'|'bottom'|'center-x'|'center-y'|'distribute-x'|'distribute-y';
export function alignEntities(p:EditorProject,l:EditorLevel,items:EntitySelection[],mode:Alignment):void {
  const units=new Map<string,EntitySelection[]>();for(const s of items){const key=entity(l,s)?.groupId??entityKey(s);units.set(key,[...(units.get(key)??[]),s]);}
  const rows=[...units.values()].map(items=>({items,b:selectionBounds(p,l,items)}));if(rows.length<2)return;const all=union(rows.map(r=>r.b));
  if(mode.startsWith('distribute')){if(rows.length<3)return;const axis=mode==='distribute-x'?'left':'top',size=axis==='left'?'w':'h';rows.sort((a,b)=>a.b[axis]-b.b[axis]);const gap=(all[size]-rows.reduce((sum,r)=>sum+r.b[size],0))/(rows.length-1);let next=all[axis];for(const row of rows){translateEntities(l,row.items,axis==='left'?next-row.b.left:0,axis==='top'?next-row.b.top:0);next+=row.b[size]+gap;}return;}
  for(const {items,b} of rows){let dx=0,dy=0;if(mode==='left')dx=all.left-b.left;if(mode==='right')dx=all.left+all.w-b.left-b.w;if(mode==='top')dy=all.top-b.top;if(mode==='bottom')dy=all.top+all.h-b.top-b.h;if(mode==='center-x')dx=all.left+all.w/2-b.left-b.w/2;if(mode==='center-y')dy=all.top+all.h/2-b.top-b.h/2;translateEntities(l,items,dx,dy);}
}
export function capturePrefab(p:EditorProject,l:EditorLevel,items:EntitySelection[],name:string):EditorPrefab {
  if(!items.length)throw new Error('Chọn vật thể/vùng trước khi lưu prefab.');const b=selectionBounds(p,l,items),origin={x:b.left,y:b.top};
  const f:EditorPrefab={id:uid(),name,layers:structuredClone(l.layers),objects:items.filter(s=>s.kind==='object').map(s=>structuredClone(l.objects.find(o=>o.id===s.id)!)),regions:items.filter(s=>s.kind==='region').map(s=>structuredClone(l.regions.find(r=>r.id===s.id)!))};
  for(const o of f.objects){o.x-=origin.x;o.y-=origin.y;delete o.groupId;}for(const r of f.regions){translateRegion(r,-origin.x,-origin.y);delete r.groupId;}return f;
}
export function instantiatePrefab(p:EditorProject,l:EditorLevel,f:EditorPrefab,point:Position):EntitySelection[] {
  if(f.objects.some(o=>!p.assets.some(a=>a.id===o.assetId)))throw new Error('Prefab thiếu asset. Nhập thư viện cùng prefab trước.');
  const needed=new Set([...f.objects.flatMap(o=>[o.layerId,o.coverLayerId]),...f.regions.map(r=>r.layerId)]),mapped=new Map<string,string>(),added=[];
  for(const source of f.layers.filter(x=>needed.has(x.id))){let dest=l.layers.find(x=>x.kind===source.kind&&x.name===source.name)??l.layers.find(x=>x.kind===source.kind);if(dest?.locked)throw new Error(`Layer đang khóa: ${dest.name}`);if(!dest){dest={...source,id:uid(),locked:false};added.push(dest);}mapped.set(source.id,dest.id);}
  l.layers.push(...added);const groupId=uid(),items:EntitySelection[]=[];
  for(const source of f.objects){const o={...structuredClone(source),id:uid(),groupId,locked:false,layerId:mapped.get(source.layerId)!,coverLayerId:mapped.get(source.coverLayerId)!,x:source.x+point.x,y:source.y+point.y};l.objects.push(o);items.push({kind:'object',id:o.id});}
  for(const source of f.regions){const r={...structuredClone(source),id:uid(),groupId,layerId:mapped.get(source.layerId)!,points:source.points.map(v=>({x:v.x+point.x,y:v.y+point.y}))};if(r.spline)r.spline.anchors=r.spline.anchors.map(v=>({x:v.x+point.x,y:v.y+point.y}));l.regions.push(r);items.push({kind:'region',id:r.id});}return items;
}
export function gridStroke(a:Position,b:Position,step:number):Position[] {if(!Number.isFinite(step)||step<1)throw new Error('Ô cọ phải lớn hơn 0.');const ax=Math.round(a.x/step),ay=Math.round(a.y/step),bx=Math.round(b.x/step),by=Math.round(b.y/step),n=Math.max(Math.abs(bx-ax),Math.abs(by-ay)),out=new Map<string,Position>();for(let i=0;i<=n;i++){const t=n?i/n:0,p={x:Math.round(ax+(bx-ax)*t)*step,y:Math.round(ay+(by-ay)*t)*step};out.set(`${p.x},${p.y}`,p);}return [...out.values()];}
export function duplicateAsset(project:EditorProject,assetId:string):EditorAsset {
  if(project.assets.length>=200)throw new Error('Thư viện tối đa 200 asset.');
  const source=project.assets.find(a=>a.id===assetId);if(!source)throw new Error('Chọn asset trong thư viện để nhân bản.');
  const stem=source.name.replace(/ · bản sao(?: \d+)?$/,'');let index=1,name:string;
  do {const suffix=` · bản sao${index===1?'':` ${index}`}`;name=stem.slice(0,120-suffix.length)+suffix;index++;}while(project.assets.some(a=>a.name===name));
  const copy:EditorAsset={...structuredClone(source),id:uid(),name};project.assets.push(copy);return copy;
}
export function exportAssetLibrary(p:EditorProject){return {schema:'game-solo-asset-library-1',assets:structuredClone(p.assets),prefabs:structuredClone(p.prefabs??[])};}
export function mergeAssetLibrary(p:EditorProject,value:unknown):EditorProject {
  if(!value||typeof value!=='object'||(value as any).schema!=='game-solo-asset-library-1')throw new Error('File không phải thư viện asset.');const raw=value as any,incoming=parseProject({...newProject(raw.assets),prefabs:raw.prefabs??[]}),out=structuredClone(p),ids=new Map<string,string>();
  const content=(v:{id:string})=>JSON.stringify({...v,id:''});
  for(const a of incoming.assets){const equivalent=out.assets.find(x=>content(x)===content(a));if(equivalent){ids.set(a.id,equivalent.id);continue;}const old=out.assets.find(x=>x.id===a.id);if(old){ids.set(a.id,uid());a.id=ids.get(a.id)!;}out.assets.push(a);}
  out.prefabs??=[];for(const f of incoming.prefabs??[]){for(const o of f.objects)o.assetId=ids.get(o.assetId)??o.assetId;if(out.prefabs.some(x=>content(x)===content(f)))continue;if(out.prefabs.some(x=>x.id===f.id))f.id=uid();out.prefabs.push(f);}return parseProject(out);
}
export interface LevelIssue {severity:'error'|'warning';levelId:string;entity?:EntitySelection;message:string}
export function auditProject(p:EditorProject):LevelIssue[] {
  const issues:LevelIssue[]=[];
  for(const l of p.levels){const add=(severity:LevelIssue['severity'],message:string,entity?:EntitySelection)=>issues.push({severity,levelId:l.id,message,entity});if(!editorWalkable(l,l.spawn))add('error','Spawn nằm ngoài vùng đi hoặc bị chặn.');
    for(const o of l.objects){const a=p.assets.find(a=>a.id===o.assetId)!,b=objectBounds(o,a);if(b.left<0||b.top<0||b.left+b.w>l.width||b.top+b.h>l.height)add('warning',`${o.name}: hình vượt mép level.`,{kind:'object',id:o.id});}
    for(const r of l.regions){const s={kind:'region' as const,id:r.id},active=regionActivity(l,r)==='active';if(regionActivity(l,r)==='layer-disabled')add('warning',`${r.name}: layer “${l.layers.find(x=>x.id===r.layerId)?.name??'thiếu layer'}” đang tắt Hoạt động trong game; vùng không có hiệu lực khi Test / xuất runtime.`,s);if(r.points.some(q=>q.x<0||q.y<0||q.x>l.width||q.y>l.height))add('warning',`${r.name}: vùng vượt mép level.`,s);
      const cross=(a:Position,b:Position,c:Position)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);let intersect=false;
      for(let i=0;i<r.points.length&&!intersect;i++)for(let j=i+2;j<r.points.length;j++){if(i===0&&j===r.points.length-1)continue;const a=r.points[i],b=r.points[(i+1)%r.points.length],c=r.points[j],d=r.points[(j+1)%r.points.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0){intersect=true;break;}}
      if(intersect)add('error',`${r.name}: các cạnh đa giác cắt nhau.`,s);
      if(r.kind==='portal'){const dest=p.levels.find(x=>x.id===r.targetLevelId);if(!dest)add(active?'error':'warning',`${r.name}: chưa có level đích.`,s);else if(!editorWalkable(dest,r.target??dest.spawn))add(active?'error':'warning',`${r.name}: điểm đến bị chặn.`,s);}
    }
  }
  const visited=new Set([p.levels[0].id]),queue=[p.levels[0]];for(let i=0;i<queue.length;i++)for(const r of queue[i].regions){if(r.kind!=='portal'||!r.enabled||!queue[i].layers.some(l=>l.id===r.layerId&&l.enabled))continue;const dest=p.levels.find(l=>l.id===r.targetLevelId);if(dest&&!visited.has(dest.id)&&editorWalkable(dest,r.target??dest.spawn)){visited.add(dest.id);queue.push(dest);}}
  for(const l of p.levels)if(!visited.has(l.id))issues.push({severity:'warning',levelId:l.id,message:'Chưa có luồng cửa từ level đầu đến đây.'});return issues;
}
export function exportRuntimeProject(p:EditorProject){const errors=auditProject(p).filter(i=>i.severity==='error');if(errors.length)throw new Error(`Còn ${errors.length} lỗi level. Chạy Kiểm level và sửa trước khi xuất runtime.`);return {schema:'game-solo-runtime-map-1',projectId:p.id,name:p.name,startLevelId:p.levels[0].id,character:{frameSize:[64,96],anchor:[32,88]},levels:p.levels.map(l=>({...runtimeLevel(p,l),objects:l.objects.filter(o=>l.layers.some(x=>x.id===o.layerId&&x.enabled))}))};}
