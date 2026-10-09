import { uid, type EditorAsset, type EditorObject } from '../../shared/map-editor';
import type { Position } from '../../shared/world';
import { sampleSpline, nearestSplineEdge } from '../../shared/region-spline';
import { cutOutline, cutBounds, type AssetExtraction, type CutShape } from '../../shared/asset-extraction';

interface CutContext { asset: EditorAsset; object?: EditorObject }
interface CutOptions {
  assets: () => EditorAsset[];
  backup: (source: EditorAsset) => EditorAsset;
  context: (id?: string) => CutContext | undefined;
  image: (file: string) => HTMLImageElement;
  add: (asset: EditorAsset, context: CutContext, place: boolean) => Promise<void>;
  status: (message: string) => void;
}
type State = { shape: CutShape; anchors: Position[]; closed: boolean; pivot: Position | null; smoothness: number };
const safe = (s: string) => s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!));

export function setupAssetCut(options: CutOptions) {
  const dialog = document.createElement('dialog');
  dialog.id = 'asset-cut-dialog';
  dialog.setAttribute('aria-labelledby', 'cut-title');
  dialog.innerHTML = `<div class="cut-heading"><div><h2 id="cut-title">Cắt asset từ map</h2><p>Vẽ đường viền → chọn điểm chân → thêm vào thư viện</p></div><button id="cut-close" aria-label="Đóng công cụ cắt">×</button></div>
  <div class="cut-toolbar"><label>Ảnh nguồn <select id="cut-source" aria-label="Ảnh nguồn để cắt"></select></label><button id="cut-backup" title="Nhân bản ảnh nguồn trong Assets, giữ đường cắt đang vẽ">⧉ Backup ảnh nguồn</button><span class="tab-spacer"></span><button id="cut-fit">Vừa ảnh</button><button id="cut-native">1×</button><span id="cut-zoom">1×</span></div>
  <div class="cut-body"><section class="cut-workspace"><div class="cut-tools"><select id="cut-shape" aria-label="Hình đường viền cắt"><option value="spline">Spline · cong</option><option value="polygon">Đa giác · thẳng</option><option value="rect">Chữ nhật</option></select><button id="cut-draw" class="active">Vẽ đường viền</button><button id="cut-edit">Sửa điểm</button><button id="cut-pivot">Đặt điểm chân</button><button id="cut-finish">Khép vùng · Enter</button><button id="cut-reset">Vẽ lại</button></div><div id="cut-viewport" tabindex="0" aria-label="Vẽ đường viền trên ảnh nguồn"><canvas id="cut-canvas"></canvas><span id="cut-source-size"></span></div><p id="cut-instructions">Bấm từng điểm theo mép vật thể. Enter hoặc bấm điểm đầu để khép.</p><p class="cut-camera-hint">Cuộn: zoom · Space / chuột giữa + kéo: pan · Ctrl Z: hoàn tác đường cắt</p></section>
  <aside class="cut-inspector"><div class="cut-preview-heading"><h3>Asset sau khi cắt</h3><select id="cut-preview-bg" aria-label="Nền xem trước"><option value="checker">Ô trong suốt</option><option value="light">Sáng</option><option value="dark">Tối</option></select></div><div id="cut-preview-wrap" data-background="checker"><canvas id="cut-preview"></canvas><span id="cut-preview-empty">Chưa có vùng cắt</span></div><p id="cut-dimensions" class="hint">Giữ pixel gốc · PNG trong suốt</p>
  <label class="form-row">Tên asset<input id="cut-name" maxlength="120" /></label><div class="form-pair"><label class="form-row">Phân loại<select id="cut-category"><option value="building">Công trình</option><option value="nature">Thiên nhiên</option><option value="prop">Đạo cụ</option><option value="terrain">Nền / tile</option><option value="other">Khác</option></select></label><label class="form-row">Layer<select id="cut-layer"><option value="depth">Theo chân</option><option value="ground">Nền</option><option value="decor">Trang trí thấp</option><option value="cover">Tán / mái</option></select></label></div>
  <label id="cut-smooth-row" class="form-row">Độ cong · 0 thẳng / 1 mềm<input id="cut-smoothness" type="number" min="0" max="1" step=".1" value="1" /></label><div class="form-pair"><label class="form-row">Điểm chân X<input id="cut-pivot-x" type="number" /></label><label class="form-row">Điểm chân Y<input id="cut-pivot-y" type="number" /></label></div><p class="hint">Tọa độ trong ảnh cắt. Bấm Đặt điểm chân rồi chọn chân đế trên ảnh nguồn.</p>
  <label id="cut-cover-row" class="check-row"><input id="cut-cover" type="checkbox" /> Asset là phần che</label><label class="check-row cut-place-row"><input id="cut-place" type="checkbox" /> Đặt bản cắt đúng vị trí trên map</label><p id="cut-placement-note" class="hint"></p><p class="cut-note">Ảnh bake giữ nền bên trong đường viền. Cắt không tự vẽ bù nền sau vật thể.</p></aside></div>
  <div class="cut-footer"><p id="cut-message" role="status">Chọn vùng cần tách.</p><button id="cut-download">Tải PNG</button><button id="cut-add" class="primary">Thêm vào Assets</button></div>`;
  document.body.append(dialog);
  const el = <T extends HTMLElement=HTMLElement>(id: string) => dialog.querySelector<T>(`#${id}`)!;
  const input = (id: string) => el<HTMLInputElement>(id);
  const canvas=el<HTMLCanvasElement>('cut-canvas'), viewport=el('cut-viewport'), ctx=canvas.getContext('2d')!, preview=el<HTMLCanvasElement>('cut-preview');
  let context: CutContext | undefined, state: State={shape:'spline',anchors:[],closed:false,pivot:null,smoothness:1}, mode:'draw'|'edit'|'pivot'='draw';
  let view={x:0,y:0,zoom:1}, hover:Position|null=null, space=false, busy=false, frame=0;
  let drag: { kind:'pan'|'rect'|'vertex'|'move'; start:Position; screen:Position; before:State; index?:number; view:{x:number;y:number} } | null=null;
  const undo:State[]=[], redo:State[]=[];
  let output: { canvas:HTMLCanvasElement; bounds:AssetExtraction['bounds']; points:Position[] } | null=null;
  const message=(s:string)=>{el('cut-message').textContent=s;};
  const remember=()=>{undo.push(structuredClone(state));if(undo.length>40)undo.shift();redo.length=0;};
  const point=(e:{clientX:number;clientY:number})=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left-view.x)/view.zoom,y:(e.clientY-r.top-view.y)/view.zoom};};
  const clamp=(p:Position):Position=>({x:Math.max(0,Math.min(context!.asset.width,Math.round(p.x))),y:Math.max(0,Math.min(context!.asset.height,Math.round(p.y)))});
  const rect=(a:Position,b:Position)=>{const l=Math.min(a.x,b.x),r=Math.max(a.x,b.x),t=Math.min(a.y,b.y),d=Math.max(a.y,b.y);return [{x:l,y:t},{x:r,y:t},{x:r,y:d},{x:l,y:d}];};
  function fit() {if(!context)return;view.zoom=Math.min(1,(viewport.clientWidth-50)/context.asset.width,(viewport.clientHeight-50)/context.asset.height);view.x=(viewport.clientWidth-context.asset.width*view.zoom)/2;view.y=(viewport.clientHeight-context.asset.height*view.zoom)/2;paint();}
  function zoom(z:number, p={x:viewport.clientWidth/2,y:viewport.clientHeight/2}) {const wx=(p.x-view.x)/view.zoom,wy=(p.y-view.y)/view.zoom;view.zoom=Math.min(16,Math.max(.02,z));view.x=p.x-wx*view.zoom;view.y=p.y-wy*view.zoom;paint();}
  function path(c:CanvasRenderingContext2D, points:Position[], close=true) {c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(close)c.closePath();}
  function crop(points:Position[], b:AssetExtraction['bounds'], files=context!.asset.parts.map(p=>p.file)) {
    if(b.width*b.height>16_777_216)throw new Error('Vùng cắt vượt 16 triệu pixel. Chia thành vùng nhỏ hơn.');
    const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d')!;
    x.imageSmoothingEnabled=false;x.translate(-b.x,-b.y);path(x,points);x.clip();for(const f of files)x.drawImage(options.image(f),0,0);return c;
  }
  function regenerate() {
    output=null;
    if(state.closed&&context)try {const points=cutOutline(state.shape,state.anchors,state.smoothness),bounds=cutBounds(points,context.asset.width,context.asset.height);output={canvas:crop(points,bounds),bounds,points};if(!state.pivot)state.pivot={x:bounds.x+bounds.width/2,y:bounds.y+bounds.height};message('Kiểm đường viền và chọn điểm chân trước khi thêm asset.');}catch(error){message((error as Error).message);}
    sync();paint();
  }
  function sync() {
    const b=output?.bounds;
    el<HTMLButtonElement>('cut-backup').disabled=busy||!context||options.assets().length>=200;
    el<HTMLButtonElement>('cut-add').disabled=busy||!output;
    el<HTMLButtonElement>('cut-download').disabled=busy||!output;
    el<HTMLButtonElement>('cut-finish').disabled=busy||state.closed||state.anchors.length<3||state.shape==='rect';
    el<HTMLButtonElement>('cut-edit').disabled=busy||!state.closed;
    el<HTMLButtonElement>('cut-pivot').disabled=busy||!output;
    el('cut-smooth-row').hidden=state.shape!=='spline';
    for(const name of ['draw','edit','pivot'])el(`cut-${name}`).classList.toggle('active',mode===name);
    el('cut-instructions').textContent=mode==='pivot'?'Bấm vào chân đế vật thể để đặt pivot.':mode==='edit'?'Kéo điểm hoặc bên trong để sửa · Shift+bấm cạnh thêm điểm · Alt+bấm điểm xóa.':state.shape==='rect'?'Kéo từ một góc đến góc đối diện để tạo khung.':'Bấm từng điểm · Enter / điểm đầu để khép · Backspace bỏ điểm cuối.';
    input('cut-pivot-x').disabled=input('cut-pivot-y').disabled=!b||busy;
    input('cut-pivot-x').value=b&&state.pivot?String(state.pivot.x-b.x):'';input('cut-pivot-y').value=b&&state.pivot?String(state.pivot.y-b.y):'';
    el('cut-dimensions').textContent=b?`${b.width} × ${b.height} px · nguồn (${b.x}, ${b.y}) · ${state.anchors.length} điểm · ${context!.asset.parts.length} part`:'Giữ pixel gốc · PNG trong suốt';
    el('cut-preview-empty').hidden=Boolean(output);paintPreview();
  }
  function paintPreview() {
    const width=el('cut-preview-wrap').clientWidth,height=190;preview.width=Math.max(1,width);preview.height=height;const c=preview.getContext('2d')!;c.clearRect(0,0,width,height);
    if(!output)return;const b=output.bounds, z=Math.min(1,(width-28)/b.width,(height-20)/b.height),x=(width-b.width*z)/2,y=(height-b.height*z)/2;
    c.imageSmoothingEnabled=false;c.drawImage(output.canvas,x,y,b.width*z,b.height*z);
    if(state.pivot){const px=x+(state.pivot.x-b.x)*z,py=y+(state.pivot.y-b.y)*z;c.strokeStyle='#ffc568';c.lineWidth=2;c.beginPath();c.moveTo(px-7,py);c.lineTo(px+7,py);c.moveTo(px,py-7);c.lineTo(px,py+7);c.stroke();}
  }
  function paint() {if(!frame)frame=requestAnimationFrame(draw);}
  function draw() {
    frame=0;if(!dialog.open||!context)return;
    const dpr=window.devicePixelRatio||1,w=viewport.clientWidth,h=viewport.clientHeight;canvas.width=Math.max(1,w*dpr);canvas.height=Math.max(1,h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.translate(view.x,view.y);ctx.scale(view.zoom,view.zoom);ctx.imageSmoothingEnabled=false;
    for(const part of context.asset.parts)ctx.drawImage(options.image(part.file),0,0);
    ctx.strokeStyle='#606e84';ctx.lineWidth=1/view.zoom;ctx.strokeRect(0,0,context.asset.width,context.asset.height);
    let points=state.anchors;
    if(state.closed&&output) {ctx.fillStyle='#070b13aa';ctx.beginPath();ctx.rect(0,0,context.asset.width,context.asset.height);points=output.points;points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill('evenodd');}
    else if(state.shape==='spline'&&points.length>1)try {points=sampleSpline(state.closed?points:[...points,...(!state.closed&&hover?[hover]:[])],state.smoothness,state.closed);}catch{/* Keep control points visible while fixing a draft. */}
    else if(!state.closed&&hover&&mode==='draw'&&state.shape!=='rect')points=[...points,hover];
    path(ctx,points,state.closed);ctx.strokeStyle='#7dceff';ctx.lineWidth=2/view.zoom;ctx.stroke();
    state.anchors.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,(i===0&&!state.closed?6:4)/view.zoom,0,Math.PI*2);ctx.fillStyle=i===0&&!state.closed?'#ffd28a':'#1e2e43';ctx.fill();ctx.stroke();});
    if(state.pivot&&state.closed){const p=state.pivot;ctx.strokeStyle='#ffc568';ctx.lineWidth=2/view.zoom;ctx.beginPath();ctx.moveTo(p.x-10/view.zoom,p.y);ctx.lineTo(p.x+10/view.zoom,p.y);ctx.moveTo(p.x,p.y-10/view.zoom);ctx.lineTo(p.x,p.y+10/view.zoom);ctx.stroke();}
    el('cut-zoom').textContent=`${view.zoom.toFixed(2)}×`;
  }
  function reset() {remember();state.anchors=[];state.closed=false;state.pivot=null;hover=null;mode='draw';regenerate();message('Vẽ đường viền mới trên ảnh nguồn.');}
  function closePath() {if(state.closed||state.anchors.length<3)return;remember();state.closed=true;mode='edit';regenerate();}
  function loadSource(id:string) {
    context=options.context(id);if(!context)return;
    state={shape:el<HTMLSelectElement>('cut-shape').value as CutShape,anchors:[],closed:false,pivot:null,smoothness:1};undo.length=redo.length=0;mode='draw';hover=null;drag=null;output=null;
    input('cut-name').value=`${context.asset.name.slice(0,100)} · cắt`;input('cut-smoothness').value='1';el<HTMLSelectElement>('cut-category').value=context.asset.category==='terrain'?'prop':context.asset.category??'other';el<HTMLSelectElement>('cut-layer').value='depth';input('cut-cover').checked=context.asset.parts.length===1&&context.asset.parts[0].cover;
    el('cut-cover-row').hidden=context.asset.parts.length>1;input('cut-place').checked=false;input('cut-place').disabled=!context.object;
    el('cut-placement-note').textContent=context.object?`Tọa độ dựa theo “${context.object.name}”; giữ tỷ lệ và lật ngang.`:'Ảnh chưa đặt trên map. Thêm vào Assets rồi kéo vào Scene.';
    el('cut-source-size').textContent=`${context.asset.width} × ${context.asset.height} px · pixel nguồn`;
    message('Vẽ đường viền mới trên ảnh nguồn.');sync();fit();
  }
  function exportAsset():EditorAsset {
    if(!output||!context||!state.pivot)throw new Error('Chưa có vùng cắt hợp lệ.');
    const name=input('cut-name').value.trim();if(!name)throw new Error('Đặt tên cho asset.');
    const b=output.bounds,points=output.points;
    let visible=false;
    const parts=context.asset.parts.map(part=>{const c=crop(points,b,[part.file]),pixels=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;for(let i=3;!visible&&i<pixels.length;i+=4)if(pixels[i])visible=true;const file=c.toDataURL('image/png');if(file.length>7_000_000)throw new Error('PNG vượt giới hạn asset. Cắt vùng nhỏ hơn.');return {id:part.id,file,cover:context!.asset.parts.length===1?input('cut-cover').checked:part.cover};});
    if(!visible)throw new Error('Vùng cắt không có pixel hiển thị.');
    const pivot={x:state.pivot.x-b.x,y:state.pivot.y-b.y};if(!Number.isFinite(pivot.x)||!Number.isFinite(pivot.y)||Math.abs(pivot.x)>16384||Math.abs(pivot.y)>16384)throw new Error('Điểm chân không hợp lệ.');
    return {id:uid(),name,width:b.width,height:b.height,pivot,parts,category:el<HTMLSelectElement>('cut-category').value as EditorAsset['category'],defaultLayer:el<HTMLSelectElement>('cut-layer').value as EditorAsset['defaultLayer'],extraction:{sourceAssetId:context.asset.id,sourceName:context.asset.name,sourceWidth:context.asset.width,sourceHeight:context.asset.height,bounds:{...b},shape:state.shape,anchors:structuredClone(state.anchors),smoothness:state.smoothness}};
  }
  viewport.addEventListener('pointerdown',e=>{
    if(!context||busy)return;viewport.focus();const p=point(e),q=clamp(p),before=structuredClone(state);viewport.setPointerCapture(e.pointerId);
    const begin=(kind:NonNullable<typeof drag>['kind'],index?:number)=>{drag={kind,start:q,screen:{x:e.clientX,y:e.clientY},before,index,view:{x:view.x,y:view.y}};};
    if(e.button===1||space){e.preventDefault();begin('pan');return;}if(e.button!==0)return;
    if(mode==='pivot'&&output){remember();state.pivot=q;mode='edit';sync();paint();return;}
    if(mode==='draw'){if(state.closed)reset();if(state.shape==='rect'){begin('rect');state.anchors=rect(q,q);paint();return;}if(state.anchors.length>=3&&Math.hypot(q.x-state.anchors[0].x,q.y-state.anchors[0].y)<9/view.zoom){closePath();return;}if(state.anchors.length>=(state.shape==='spline'?64:256)){message('Đã tới giới hạn điểm đường viền.');return;}if(state.anchors.length&&Math.hypot(q.x-state.anchors.at(-1)!.x,q.y-state.anchors.at(-1)!.y)<.001)return;remember();state.anchors.push(q);sync();paint();return;}
    if(mode==='edit'&&state.closed){const index=state.anchors.findIndex(a=>Math.hypot(a.x-q.x,a.y-q.y)<8/view.zoom);if(index>=0){if(e.altKey){if(state.anchors.length<=3){message('Giữ ít nhất 3 điểm.');return;}remember();if(state.shape==='rect'){state.shape='polygon';el<HTMLSelectElement>('cut-shape').value='polygon';}state.anchors.splice(index,1);regenerate();}else begin('vertex',index);return;}
      if(e.shiftKey){try{let edge:{index:number;point:Position;distance:number};if(state.shape==='spline')edge=nearestSplineEdge({anchors:state.anchors,smoothness:state.smoothness},q);else {const candidates=state.anchors.map((a,index)=>{const b=state.anchors[(index+1)%state.anchors.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy||1))),point={x:a.x+t*dx,y:a.y+t*dy};return {index,point,distance:Math.hypot(q.x-point.x,q.y-point.y)};});edge=candidates.sort((a,b)=>a.distance-b.distance)[0];}if(edge.distance<10/view.zoom){if(state.anchors.length>=(state.shape==='spline'?64:256))throw new Error('Đã tới giới hạn điểm.');remember();if(state.shape==='rect'){state.shape='polygon';el<HTMLSelectElement>('cut-shape').value='polygon';}state.anchors.splice(edge.index+1,0,edge.point);regenerate();}}catch(error){message((error as Error).message);}return;}
      if(output){const points=output.points;let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>q.y)!==(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}if(inside)begin('move');}
    }
  });
  viewport.addEventListener('pointermove',e=>{if(!context||busy)return;const q=clamp(point(e));hover=q;
    if(drag?.kind==='pan'){view.x=drag.view.x+e.clientX-drag.screen.x;view.y=drag.view.y+e.clientY-drag.screen.y;paint();return;}
    if(drag?.kind==='rect'){state.anchors=rect(drag.start,q);paint();return;}
    if(drag?.kind==='vertex'){if(state.shape==='rect')state.anchors=rect(drag.before.anchors[(drag.index!+2)%4],q);else state.anchors[drag.index!]=q;regenerate();return;}
    if(drag?.kind==='move'){const a=drag.before.anchors,dx=Math.max(-Math.min(...a.map(p=>p.x)),Math.min(context.asset.width-Math.max(...a.map(p=>p.x)),q.x-drag.start.x)),dy=Math.max(-Math.min(...a.map(p=>p.y)),Math.min(context.asset.height-Math.max(...a.map(p=>p.y)),q.y-drag.start.y));state.anchors=a.map(p=>({x:p.x+dx,y:p.y+dy}));if(drag.before.pivot)state.pivot={x:drag.before.pivot.x+dx,y:drag.before.pivot.y+dy};regenerate();return;}paint();
  });
  const endDrag=()=>{if(!drag)return;const d=drag;drag=null;if(d.kind==='rect'){state.closed=true;mode='edit';}if(d.kind!=='pan'&&JSON.stringify(d.before)!==JSON.stringify(state)){undo.push(d.before);redo.length=0;regenerate();}};
  viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',()=>{if(drag&&drag.kind!=='pan'){state=drag.before;regenerate();}drag=null;});
  viewport.addEventListener('wheel',e=>{if(busy)return;e.preventDefault();const r=canvas.getBoundingClientRect();zoom(view.zoom*Math.exp(-e.deltaY*.001),{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});
  dialog.addEventListener('keydown',e=>{const form=/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName);if(form||busy)return;if(e.code==='Space'){e.preventDefault();space=true;}if(e.key==='Enter'){e.preventDefault();closePath();}if(e.key==='Backspace'&&!state.closed){e.preventDefault();remember();state.anchors.pop();sync();paint();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();const source=e.shiftKey?redo:undo,target=e.shiftKey?undo:redo;if(source.length){target.push(structuredClone(state));state=source.pop()!;el<HTMLSelectElement>('cut-shape').value=state.shape;input('cut-smoothness').value=String(state.smoothness);mode=state.closed?'edit':'draw';regenerate();}}});
  dialog.addEventListener('keyup',e=>{if(e.code==='Space')space=false;});
  viewport.addEventListener('blur',()=>{space=false;});
  dialog.addEventListener('cancel',e=>{if(busy){e.preventDefault();return;}if(!state.closed&&state.anchors.length){e.preventDefault();reset();}});
  dialog.addEventListener('close',()=>{space=false;drag=null;output=null;context=undefined;preview.width=1;preview.height=1;});
  el('cut-close').addEventListener('click',()=>{if(!busy)dialog.close();});el('cut-fit').addEventListener('click',fit);el('cut-native').addEventListener('click',()=>zoom(1));
  el('cut-backup').addEventListener('click',()=>{if(!context||busy)return;try{const copy=options.backup(structuredClone(context.asset));el<HTMLSelectElement>('cut-source').add(new Option(`${copy.name} · ${copy.width} × ${copy.height}`,copy.id));sync();message(`Đã backup “${copy.name}” trong Assets. Đường cắt đang vẽ được giữ; Ctrl+S lưu dự án sau khi đóng.`);}catch(error){message((error as Error).message);}});
  el('cut-source').addEventListener('change',()=>loadSource(el<HTMLSelectElement>('cut-source').value));
  el('cut-shape').addEventListener('change',()=>{remember();const shape=el<HTMLSelectElement>('cut-shape').value as CutShape;if(shape==='rect'||state.anchors.length>(shape==='spline'?64:256)){state.anchors=[];state.closed=false;state.pivot=null;mode='draw';}state.shape=shape;regenerate();});
  el('cut-draw').addEventListener('click',reset);el('cut-reset').addEventListener('click',reset);el('cut-edit').addEventListener('click',()=>{mode='edit';sync();});el('cut-pivot').addEventListener('click',()=>{mode='pivot';sync();viewport.focus();});el('cut-finish').addEventListener('click',closePath);
  input('cut-smoothness').addEventListener('change',()=>{remember();state.smoothness=Number(input('cut-smoothness').value);regenerate();});
  for(const [id,key] of [['cut-pivot-x','x'],['cut-pivot-y','y']] as const)input(id).addEventListener('change',()=>{if(!output||!state.pivot)return;remember();const value=Number(input(id).value);if(!Number.isFinite(value)){message('Điểm chân không hợp lệ.');return;}state.pivot[key]=value+(key==='x'?output.bounds.x:output.bounds.y);sync();paint();});
  el('cut-preview-bg').addEventListener('change',()=>{el('cut-preview-wrap').dataset.background=el<HTMLSelectElement>('cut-preview-bg').value;});
  el('cut-download').addEventListener('click',()=>{try{const asset=exportAsset();for(const [i,part] of asset.parts.entries()){const a=document.createElement('a');a.href=part.file;a.download=`${asset.name.replace(/[<>:"/\\|?*]/g,'-')}${asset.parts.length>1?`-part-${i+1}`:''}.png`;a.click();}message('Đã xuất PNG gốc; các part giữ cùng canvas và pivot.');}catch(error){message((error as Error).message);}});
  el('cut-add').addEventListener('click',async()=>{try{const asset=exportAsset(),source=structuredClone(context!),place=input('cut-place').checked;busy=true;dialog.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('input,button,select').forEach(n=>n.disabled=true);await options.add(asset,source,place);dialog.close();options.status(`Đã cắt “${asset.name}” · ${asset.width} × ${asset.height} px. Ảnh nguồn giữ nguyên; Ctrl+Z hoàn tác.`);}catch(error){message((error as Error).message);}finally{busy=false;dialog.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('input,button,select').forEach(n=>n.disabled=false);input('cut-place').disabled=!context?.object;sync();}});
  new ResizeObserver(()=>{if(dialog.open){paint();paintPreview();}}).observe(viewport);
  return { open(id?:string) {const initial=options.context(id);if(!initial){options.status('Nhập ảnh map vào Assets trước khi cắt.');return;}el<HTMLSelectElement>('cut-source').innerHTML=options.assets().map(a=>`<option value="${safe(a.id)}">${safe(a.name)} · ${a.width} × ${a.height}</option>`).join('');el<HTMLSelectElement>('cut-source').value=initial.asset.id;dialog.showModal();loadSource(initial.asset.id);viewport.focus();} };
}
