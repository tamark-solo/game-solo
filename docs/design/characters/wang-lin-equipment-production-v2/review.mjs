const $ = id => document.getElementById(id);
const names = {a:'Huyễn Tâm',b:'Tịch Bạch'};
const families = {sword:'Kiếm linh',banner:'Hồn phiên',chariot:'Xạ Thần Xa',bead:'Thiên Nghịch Châu'};
const directionNames={north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam',south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc'},actionNames={idle:'Thả lỏng',run:'Chạy',hit:'Trúng đòn',death:'Ngã',meditate:'Thổ nạp',gather:'Thu thập','cast-single-target':'Phát chiêu đơn','cast-aoe':'Mở trận AOE'};
const clipName=c=>c.name??`${names[c.identityId]??c.identityId} · ${families[c.familyId]??c.familyId} · ${directionNames[c.direction]??c.direction} · ${actionNames[c.action]??c.action}`;
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = async file => {const r=await fetch(file);if(!r.ok)throw Error(`Chưa có ${file}`);return r.json();};
const images = new Map(), failedImages = new Set(), decodedEver=new Set(), imageBytes=new Map(), pendingImages=new Map();
const cacheBudget=16*1024*1024;let cacheBytes=0,cacheEvictions=0;
const image = async file => {if(!file||failedImages.has(file))return null;if(images.has(file)){const img=images.get(file);images.delete(file);images.set(file,img);return img;}if(pendingImages.has(file))return pendingImages.get(file);const request=(async()=>{const img=new Image();img.src=file;try{await img.decode();images.set(file,img);decodedEver.add(file);if(file!==mapFile){const bytes=img.naturalWidth*img.naturalHeight*4;imageBytes.set(file,bytes);cacheBytes+=bytes;for(const [old,oldImage] of images){if(cacheBytes<=cacheBudget)break;if(old===mapFile||old===file||appearances.some(a=>fileOf(a.body)===old||a.layers.some(l=>fileOf(l)===old))||fileOf(reference)===old)continue;cacheBytes-=imageBytes.get(old)??0;imageBytes.delete(old);images.delete(old);oldImage.src='';cacheEvictions++;}}return img;}catch{failedImages.add(file);$('load-note').classList.add('error');$('load-note').textContent=`Chưa đọc được asset: ${file}. Coverage thiếu được giữ rõ trong review.`;return null;}})();pendingImages.set(file,request);try{return await request;}finally{pendingImages.delete(file);}};
const fileOf = x => typeof x==='string'?x:x?.file ?? x?.image ?? x?.sprite ?? x?.nativeFile ?? x?.nativeImage;
const asLayer = (x,defaults={}) => typeof x==='string'?{...defaults,file:x}:{...defaults,...x,file:fileOf(x)};
let manifest, core, appearances=[], selected, reference, mapFile='../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp',fxSequences=[],fxLoad;
let protoEngine, protoCast, protoAge=0, protoPlaying=false, protoStart=0, hasCast=false, castNumber=0;
let mutations=[], repeatedFacts=0, acceptedFacts=[], deliveredKeys=new Set();
let protoAim={x:550,y:310}, protoOrigin={x:240,y:310};
let initialTargets = [
  {id:'enemy-1',lifeId:'enemy-1-life-1',x:438,y:247,radius:12,team:'enemy',alive:true},
  {id:'enemy-2',lifeId:'enemy-2-life-1',x:504,y:224,radius:12,team:'enemy',alive:true},
  {id:'enemy-3',lifeId:'enemy-3-life-1',x:566,y:250,radius:12,team:'enemy',alive:true},
  {id:'enemy-4',lifeId:'enemy-4-life-1',x:529,y:294,radius:12,team:'enemy',alive:true},
  {id:'enemy-5',lifeId:'enemy-5-life-1',x:618,y:319,radius:12,team:'enemy',alive:true},
  {id:'ally-1',lifeId:'ally-1-life-1',x:509,y:182,radius:12,team:'ally',alive:true},
  {id:'ally-2',lifeId:'ally-2-life-1',x:552,y:293,radius:12,team:'ally',alive:true},
  {id:'ally-3',lifeId:'ally-3-life-1',x:628,y:242,radius:12,team:'ally',alive:true}
];
let worldTargets=structuredClone(initialTargets), motionClips=[], motionClip, motionAge=0, motionPlaying=false, motionStart=0;
let visibleFactEffects=[];
let prototypeGearTrace=null;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function normalizedAppearance(a,i) {
  const id=a.id ?? `${a.familyId}-${a.identityId}`;
  const identityId=a.identityId ?? a.sourceIdentityId ?? (id.endsWith('-b')?'b':'a');
  const familyId=a.familyId ?? a.family ?? id.split('-')[0];
  const body=asLayer(a.body ?? a.sprite ?? a.nativeFile ?? a.nativeImage,{canvas:a.canvas ?? [64,96],pivot:a.pivot ?? [32,88]});
  const g=a.gear ?? {}, layers=(g.layers ?? a.gearLayers ?? (Array.isArray(g)?g:[...g.rear?[asLayer(g.rear,{role:'rear'})]:[],...g.front?[asLayer(g.front,{role:'front'})]:[],...g.occlusion?[asLayer(g.occlusion,{role:'occlusion'})]:[]])).map(l=>asLayer(l,{canvas:g.canvas ?? a.gearCanvas ?? [160,160],pivot:g.pivot ?? a.gearPivot ?? [64,144]}));
  if(g.handOcclusion&&!layers.some(l=>l.role==='occlusion'))layers.push(asLayer(g.handOcclusion,{role:'occlusion',cropInBody:true}));
  const concept=a.concept ?? `../wang-lin-concept-direction-v5/sources/${familyId}-${identityId}${familyId==='banner'&&identityId==='a'?'-r2':''}.png`;
  const master=a.identityMaster ?? `../wang-lin-concept-direction-v5/sources/identity-${identityId}.png`;
  return {...a,id,identityId,familyId,name:a.name ?? `${names[identityId]} / ${families[familyId]}`,body,layers,concept,master};
}
function drawLayer(ctx,layer,x,y,z=1,silhouette=false) {
  const file=fileOf(layer),img=images.get(file);if(!img)return false;images.delete(file);images.set(file,img);
  const rotation=layer.rotationDeg??layer.angleDeg??0;if(rotation){const offset=layer.offset??[0,0];ctx.save();ctx.translate(Math.round(x+offset[0]*z),Math.round(y+offset[1]*z));ctx.rotate(rotation*Math.PI/180);drawLayer(ctx,{...layer,rotationDeg:0,angleDeg:0,offset:[0,0]},0,0,z,silhouette);ctx.restore();return true;}
  const pivot=layer.pivot ?? [0,0], offset=layer.offset ?? [0,0], left=Math.round(x+(offset[0]-pivot[0])*z), top=Math.round(y+(offset[1]-pivot[1])*z);
  if(layer.rect&&(layer.cropInBody||['occlusion','body-occlusion','hand'].includes(layer.role))){const r=layer.rect,rx=r.x??r[0],ry=r.y??r[1],rw=r.width??r[2],rh=r.height??r[3];ctx.drawImage(img,rx,ry,rw,rh,left+rx*z,top+ry*z,rw*z,rh*z);}
  else if(layer.useAtlas&&layer.rect){const r=layer.rect;ctx.drawImage(img,r.x??r[0],r.y??r[1],r.width??r[2],r.height??r[3],left,top,(r.width??r[2])*z,(r.height??r[3])*z);}
  else if(silhouette){const mask=document.createElement('canvas');mask.width=img.naturalWidth;mask.height=img.naturalHeight;const m=mask.getContext('2d');m.drawImage(img,0,0);m.globalCompositeOperation='source-in';m.fillStyle='#142821';m.fillRect(0,0,mask.width,mask.height);ctx.drawImage(mask,left,top,img.naturalWidth*z,img.naturalHeight*z);}
  else ctx.drawImage(img,left,top,img.naturalWidth*z,img.naturalHeight*z);
  return true;
}
function background(ctx,width,height,scene,z=1) {
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  if(scene==='map'&&images.has(mapFile)){ctx.drawImage(images.get(mapFile),1616-width/(2*z),990-height/(2*z),width/z,height/z,0,0,width,height);return;}
  ctx.fillStyle=scene==='light'?'#eee6d0':'#243c2b';ctx.fillRect(0,0,width,height);ctx.strokeStyle=scene==='light'?'#d8d0ba':'#36533a';
  for(let x=0;x<width;x+=32*z){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}for(let y=0;y<height;y+=32*z){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
}
function rootMark(ctx,x,y,label='') {ctx.strokeStyle='#d5bb75';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();if(label){ctx.fillStyle='#e7d8a4';ctx.font='10px Segoe UI';ctx.fillText(label,x+8,y-5);}}
function compose(ctx,a,x,y,z,gear=true,body=a.body) {
  const silhouette=$('show-silhouette').checked;
  if(gear&&$('show-rear').checked)for(const l of a.layers.filter(l=>['rear','gear-rear','back'].includes(l.role ?? l.layer)))drawLayer(ctx,l,x,y,z,silhouette);
  const ok=drawLayer(ctx,body,x,y,z,silhouette);
  if(gear)for(const l of a.layers.filter(l=>!['rear','gear-rear','back'].includes(l.role ?? l.layer))){const role=l.role??l.layer;if(['occlusion','hand','body-occlusion'].includes(role)?$('show-hand').checked:$('show-front').checked)drawLayer(ctx,l,x,y,z,silhouette);}
  return ok;
}
function resizeStage() {const c=$('native-stage'),w=Math.round(c.parentElement.clientWidth-2),z=Number($('zoom').value);c.width=Math.max(300,w);c.height=z===4?620:432;drawNative();}
function drawNative() {
  if(!selected)return;const c=$('native-stage'),ctx=c.getContext('2d'),z=Number($('zoom').value),floor=c.height-48,refX=Math.round(c.width*.24),actorX=Math.round(c.width*.7);
  background(ctx,c.width,c.height,$('scene').value,z);drawLayer(ctx,reference,refX,floor,z,$('show-silhouette').checked);
  if(!compose(ctx,selected,actorX,floor,z,$('show-gear').checked)){ctx.fillStyle='#ddd9b6';ctx.font='13px Segoe UI';ctx.fillText('Body chưa đóng gói',actorX-55,floor-50);}
  if($('show-roots').checked){rootMark(ctx,refX,floor);rootMark(ctx,actorX,floor);for(const socket of Object.values(selected.sockets ?? selected.gear?.sockets ?? {})){if(!socket)continue;const p=socket.position ?? socket.xy ?? (Array.isArray(socket)?socket:null);if(p)rootMark(ctx,actorX+(p[0]-(selected.body.pivot?.[0]??32))*z,floor+(p[1]-(selected.body.pivot?.[1]??88))*z,'grip');}}
}
function selectAppearance() {
  selected=appearances.find(a=>a.identityId===$('identity').value&&a.familyId===$('family').value);
  if(!selected){$('asset-detail').innerHTML='<div class="empty">Chưa có body riêng cho lựa chọn này.</div>';return;}
  $('selected-stage-label').textContent=selected.name;
  for(const card of document.querySelectorAll('.neutral-card'))card.setAttribute('aria-pressed',String(card.dataset.appearance===selected.id));
  const bodyFile=fileOf(selected.body),layers=selected.layers.filter(l=>images.has(fileOf(l)));
  const notes=[selected.assessment,selected.visualLimitations].flat().filter(v=>typeof v==='string');
  $('asset-detail').innerHTML=`<h3>${esc(selected.name)}</h3><p>Body riêng · Đông Nam · ${esc(selected.bodyHeightPx ?? selected.bodyHeight ?? 80)} px · ${layers.length} lớp trang bị đã đọc.</p><dl><dt>Canvas body</dt><dd>${esc((selected.body.canvas ?? [64,96]).join(' × '))}</dd><dt>Điểm chân</dt><dd>(${esc((selected.body.pivot ?? [32,88]).join(', '))})</dd><dt>Lớp gear</dt><dd>${esc(layers.map(l=>l.role ?? l.layer ?? 'front').join(' → ')||'Chưa đóng gói')}</dd><dt>Trạng thái</dt><dd>Neutral Đông Nam từ pilot đã duyệt</dd></dl>${notes.map(n=>`<p>${esc(n)}</p>`).join('')}<div class="detail-links">${[{file:bodyFile,label:'Body native'},...layers.map(l=>({file:fileOf(l),label:`Gear ${l.role ?? l.layer ?? 'front'}`})),{file:selected.raw ?? selected.source,label:'Nguồn body'},{file:selected.prompt,label:'Prompt'}].filter(l=>l.file).map(l=>`<a href="${esc(l.file)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>`;
  $('concept-pair').innerHTML=`<figure><img src="${esc(selected.master)}" alt="Master nhận diện ${esc(names[selected.identityId])}" width="1024" height="1536"><figcaption>Master nhận diện đã duyệt</figcaption></figure><figure><img src="${esc(selected.concept)}" alt="Concept ${esc(selected.name)}" width="1024" height="1536"><figcaption>Concept áo / trang bị đã duyệt</figcaption></figure>`;
  const p=new URLSearchParams(location.hash.slice(1));p.set('identity',selected.identityId);p.set('family',selected.familyId);history.replaceState(null,'','#'+p.toString());drawNative();
}
function cards() {
  $('neutral-grid').innerHTML=appearances.map(a=>`<button class="neutral-card" data-appearance="${esc(a.id)}" aria-pressed="false"><canvas width="320" height="192" aria-label="Vương Lâm và body ${esc(a.name)}"></canvas><div class="card-caption"><strong>${esc(names[a.identityId])}</strong><p>${esc(families[a.familyId])} · body riêng · Đông Nam</p><span class="card-state">${images.has(fileOf(a.body))?'NEUTRAL ĐÃ ĐÓNG GÓI':'BODY ĐANG SẢN XUẤT'}</span></div></button>`).join('');
  for(const card of document.querySelectorAll('.neutral-card')){const a=appearances.find(a=>a.id===card.dataset.appearance),ctx=card.querySelector('canvas').getContext('2d');background(ctx,320,192,'dark');drawLayer(ctx,reference,90,180,2);drawLayer(ctx,a.body,232,180,2);ctx.font='9px Segoe UI';ctx.fillStyle='#adc2a8';ctx.fillText('Wang / tỷ lệ',43,18);ctx.fillText(names[a.identityId],202,18);card.onclick=()=>{$('identity').value=a.identityId;$('family').value=a.familyId;selectAppearance();$('layers').scrollIntoView({block:'start'});};}
}
function getContracts() {return Array.isArray(core?.CONTRACTS)?core.CONTRACTS:Object.values(core?.CONTRACTS ?? {});}
function selectedContract() {const list=getContracts();return list.find(c=>(c.family ?? c.familyId)===$('proto-family').value&&(c.mode ?? c.targetMode)===$('proto-mode').value) ?? core?.CONTRACTS?.[`${$('proto-family').value}-${$('proto-mode').value}`] ?? core?.CONTRACTS?.[$('proto-family').value]?.[$('proto-mode').value];}
function blockers() {return $('blocker').checked?[{x:370,y:176,width:20,height:156}]:[];}
function targetOptions() {const current=$('proto-target').value;$('proto-target').innerHTML=initialTargets.filter(t=>$('proto-family').value==='bead'&&$('proto-mode').value==='st'?t.team==='ally':t.team==='enemy').map(t=>`<option value="${t.id}">${t.id==='caster'?'Người thi triển':`${t.team==='ally'?'Đồng minh':'Địch'} ${t.id.split('-')[1]}`}</option>`).join('');if([...$('proto-target').options].some(o=>o.value===current))$('proto-target').value=current;}
function allFacts() {return protoEngine?.facts ?? [];}
function rebuildCore() {
  if(!core)return;worldTargets=structuredClone(initialTargets);protoEngine=core.createPrototype({targets:worldTargets,blockers:blockers(),now:0});
  const result=protoEngine.cast({castId:`review-${$('proto-family').value}-${$('proto-mode').value}-${castNumber}`,actorId:`review-${$('identity').value}`,family:$('proto-family').value,mode:$('proto-mode').value,startedAt:0,origin:protoOrigin,aim:{x:protoAim.x-protoOrigin.x,y:protoAim.y-protoOrigin.y},targetId:$('proto-target').value});protoCast=result.cast ?? protoEngine.casts?.[0];
  for(const mutation of mutations.filter(m=>m.at<=protoAge).sort((a,b)=>a.at-b.at)){if(mutation.type==='cancel')protoEngine.cancel(protoCast.id ?? protoCast.castId,mutation.at);else {worldTargets=worldTargets.map(t=>t.id===mutation.targetId?{...t,lifeId:mutation.lifeId}:t);protoEngine.updateWorld({targets:worldTargets,blockers:blockers()},mutation.at);}}
  protoEngine.advance(protoAge);protoCast=protoEngine.casts?.[0] ?? protoCast;acceptedFacts=[];deliveredKeys=new Set();ingestFacts(allFacts());drawPrototype();
}
function ingestFacts(facts,duplicate=false) {const cutoff=protoAge-($('late-facts').checked?320:0);for(const fact of facts){if(!hasCast||fact.at>cutoff)continue;const key=fact.key ?? fact.effectId ?? [fact.castId,fact.type,fact.pulseId,fact.targetId,fact.targetLifeId].join(':');if(deliveredKeys.has(key)){if(duplicate)repeatedFacts++;continue;}deliveredKeys.add(key);acceptedFacts.push(fact);}}
function points(shape) {return shape.points ?? shape.vertices ?? [];}
function paintGeometry(ctx,geometry,phase) {
  const list=Array.isArray(geometry)?geometry:geometry?.shapes ?? geometry?.regions ?? (geometry?[geometry]:[]);
  const light=$('proto-scene').value!=='dark';
  for(const s of list){const kind=s.type ?? s.kind,role=s.role ?? 'damage';ctx.strokeStyle=light?(role==='support'?'#294939':role==='control'?'#2b3e49':'#443a25'):(role==='support'?'#acd5c5':role==='control'?'#8eadae':'#d0bd82');ctx.fillStyle=light?'#443b221a':role==='support'?'#90c9ba20':role==='control'?'#9ab9c020':phase==='active'||phase==='release'?'#e3c78333':'#c9b88014';ctx.lineWidth=1.5;ctx.setLineDash(phase==='warning'||phase==='charge'?[7,5]:[]);ctx.beginPath();
    if(kind==='corridor'||kind==='line'){const a=s.from ?? s.start,b=s.to ?? s.end,w=s.halfWidth ?? (s.width ?? 12)/2;if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1,ox=-dy/n*w,oy=dx/n*w;ctx.moveTo(a.x+ox,a.y+oy);ctx.lineTo(b.x+ox,b.y+oy);ctx.lineTo(b.x-ox,b.y-oy);ctx.lineTo(a.x-ox,a.y-oy);ctx.closePath();}
    else if(kind==='circle'){const p=s.center ?? s.origin;ctx.arc(p.x,p.y,s.radius,0,Math.PI*2);}
    else if(kind==='polygon'){const ps=points(s);if(!ps.length)continue;ctx.moveTo(ps[0].x,ps[0].y);for(const p of ps.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();}
    else continue;if(!s.outlineOnly)ctx.fill();ctx.stroke();}
  ctx.setLineDash([]);
}
function fx(id) {return fxSequences.find(s=>s.id===id&&s.familyId===$('proto-family').value);}
function fxFrame(ctx,id,age,x,y,angle=0) {
  const sequence=fx(id);if(!sequence||age<0||age>=durationOf(sequence))return false;
  const frame=frameAt(sequence,age),layer=asLayer(frame,{pivot:sequence.pivot,canvas:sequence.canvas}),file=fileOf(layer);
  if(!images.has(file)){if(!failedImages.has(file))image(file).then(()=>drawPrototype());return false;}
  ctx.save();ctx.translate(Math.round(x),Math.round(y));if(angle)ctx.rotate(angle);drawLayer(ctx,layer,0,0,1);ctx.restore();
  return true;
}
function phaseFx(ctx,id,elapsed,span,x,y,angle=0){
 if($('proto-family').value==='sword')return fxFrame(ctx,id,elapsed,x,y,angle);
 const sequence=fx(id);if(!sequence||elapsed<0||elapsed>=span)return false;
 const age=elapsed*durationOf(sequence)/span;
 return fxFrame(ctx,id,age,x,y,angle);
}
function casterHand(){
 const family=$('proto-family').value,action=$('proto-mode').value==='aoe'?'cast-aoe':'cast-single-target',direction=$('field-direction').value;
 const clip=motionClips.find(c=>c.identityId===$('identity').value&&c.familyId===family&&c.direction===direction&&c.action===action),frame=clip?frameAt(clip,protoAge):null;
 const grip=frame?.grip??selected?.grip,pivot=frame?.pivot??selected?.body.pivot;
 if(!grip?.native||!pivot||grip.selection?.includes('placeholder'))return null;
 return {x:protoOrigin.x+grip.native[0]-pivot[0],y:protoOrigin.y+grip.native[1]-pivot[1]};
}
function drawBitmapFx(ctx,geometry,where) {
  if(!$('bitmap-fx').checked||!hasCast||!protoCast)return;
  const contract=selectedContract(),mode=$('proto-mode').value,release=acceptedFacts.find(f=>f.type==='release'),releaseAt=contract.timing.releaseMs,activeEnd=Math.min(contract.timing.activeEndMs,protoCast.cancelledAt??Infinity),angle=Math.atan2(protoCast.aim.y,protoCast.aim.x);
  if(where==='rear'){
    if(mode==='aoe'){
      if(protoAge<releaseAt&&protoCast.cancelledAt===null)for(const a of geometry.anchors??[])phaseFx(ctx,'aoe-warning',protoAge,releaseAt,a.x,a.y);
      if(release){
        const family=$('proto-family').value,anchors=geometry.anchors??[];
        if(family==='chariot'){
          for(const [i,a] of anchors.entries()){const pulse=contract.pulses[i];if(!pulse)continue;const span=Math.min(300,activeEnd-pulse.atMs);phaseFx(ctx,'aoe-deploy',protoAge-pulse.atMs,span,a.x,a.y);phaseFx(ctx,'aoe-active',protoAge-pulse.atMs,span,a.x,a.y);}
        }else{
          for(const a of anchors)phaseFx(ctx,'aoe-deploy',protoAge-releaseAt,Math.min(380,activeEnd-releaseAt),a.x,a.y);
          const fieldCenter=anchors.length?{x:anchors.reduce((n,a)=>n+a.x,0)/anchors.length,y:anchors.reduce((n,a)=>n+a.y,0)/anchors.length}:protoOrigin;
          const position=fx('aoe-active')?.anchor==='caster'||family==='sword'?protoOrigin:fieldCenter;
          if(protoAge<activeEnd)phaseFx(ctx,'aoe-active',protoAge-releaseAt,activeEnd-releaseAt,position.x,position.y);
        }
      }
      if(release&&protoAge>=activeEnd)for(const a of geometry.anchors??[])phaseFx(ctx,'aoe-collapse',protoAge-activeEnd,contract.timing.endMs-contract.timing.activeEndMs,a.x,a.y);
    }else{
      const line=geometry.shapes?.find(s=>s.type==='corridor'),circle=geometry.shapes?.find(s=>s.type==='circle'),mid=line?{x:(line.from.x+line.to.x)/2,y:(line.from.y+line.to.y)/2}:circle?.center;if(!mid)return;
      if(protoAge<releaseAt&&protoCast.cancelledAt===null){phaseFx(ctx,'st-warning',protoAge,releaseAt,mid.x,mid.y);const hand=$('proto-family').value==='sword'&&$('field-direction').value==='southeast'?{x:protoOrigin.x+15,y:protoOrigin.y-36}:casterHand();if(hand)phaseFx(ctx,'st-charge',protoAge-contract.timing.warningMs,releaseAt-contract.timing.warningMs,hand.x,hand.y);}
      const fxAngle=$('proto-family').value==='sword'||fx('st-release')?.orientationPolicy==='vector-beam'?angle:0;
      if(release)phaseFx(ctx,'st-release',protoAge-releaseAt,activeEnd-releaseAt,mid.x,mid.y-22,fxAngle);
      if(release)phaseFx(ctx,'st-tail',protoAge-activeEnd,contract.timing.endMs-contract.timing.activeEndMs,mid.x,mid.y-22,fxAngle);
    }
  }else for(const fact of acceptedFacts.filter(f=>['hit','support','control'].includes(f.type))){
    const target=fact.position??worldTargets.find(t=>t.id===fact.targetId&&t.lifeId===fact.targetLifeId);if(!target)continue;
    const id=mode==='aoe'?'aoe-contact':'st-resolve',elapsed=protoAge-fact.at;
    const drawn=['support','control'].includes(fact.type)?phaseFx(ctx,id,elapsed,fact.durationMs,target.x,target.y):fxFrame(ctx,id,elapsed,target.x,target.y);
    if(drawn)visibleFactEffects.push({key:fact.key,type:fact.type,targetId:fact.targetId,targetLifeId:fact.targetLifeId,at:fact.at,durationMs:fact.durationMs,age:elapsed});
  }
}
function prototypeActor(ctx) {
  const mode=$('proto-mode').value,action=mode==='aoe'?'cast-aoe':'cast-single-target',family=$('proto-family').value,direction=$('field-direction').value,castClip=motionClips.find(c=>c.identityId===$('identity').value&&c.familyId===family&&c.direction===direction&&c.action===action),idleClip=motionClips.find(c=>c.identityId===$('identity').value&&c.familyId===family&&c.direction===direction&&c.action==='idle');
  const clip=hasCast&&protoCast?.cancelledAt===null&&castClip&&protoAge<durationOf(castClip)?castClip:idleClip;
  if(clip){const age=clip===castClip?protoAge:protoAge%durationOf(clip),frame=frameAt(clip,age),layers=frameLayers(frame,clip),missing=[fileOf(layers.body),...layers.gear.map(fileOf)].filter(file=>file&&!images.has(file)&&!failedImages.has(file));if(missing.length)Promise.all([...new Set(missing)].map(image)).then(drawPrototype);if(!images.has(fileOf(layers.body)))return;
   const releaseSuppressed=frame.gearPresentation?.releaseRequiresCoreFact===true&&!acceptedFacts.some(f=>f.type==='release'&&f.castId===(protoCast.castId??protoCast.id));
   prototypeGearTrace={clipId:clip.id,frameIndex:frame.index,mode:frame.gearMode,releaseSuppressed};
   if(selected)compose(ctx,{...selected,layers:releaseSuppressed?[]:layers.gear},protoOrigin.x,protoOrigin.y,1,true,layers.body);else drawLayer(ctx,layers.body,protoOrigin.x,protoOrigin.y);
  }
  else if(selected&&images.has(fileOf(selected.body)))compose(ctx,selected,protoOrigin.x,protoOrigin.y,1,true);
  else{ctx.fillStyle='#c7d2b0';ctx.beginPath();ctx.arc(protoOrigin.x,protoOrigin.y-9,10,0,Math.PI*2);ctx.fill();}
}
function drawPrototype() {
  if(!core||!protoCast)return;visibleFactEffects=[];prototypeGearTrace=null;const canvas=$('arena'),ctx=canvas.getContext('2d'),zoom=Number($('proto-zoom').value);canvas.width=800*zoom;canvas.height=432*zoom;canvas.style.width=canvas.width+'px';canvas.style.maxWidth='none';ctx.setTransform(zoom,0,0,zoom,0,0);background(ctx,800,432,$('proto-scene').value);
  const view=core.viewAt(protoCast,protoAge),phase=view.phase ?? 'warning',geometry=view.geometry ?? core.geometryFor(protoCast);
  if(!hasCast||!['complete','cancelled'].includes(phase))paintGeometry(ctx,geometry,phase);
  drawBitmapFx(ctx,geometry,'rear');
  for(const b of blockers()){ctx.fillStyle='#2b332a';ctx.fillRect(b.x,b.y,b.width,b.height);ctx.strokeStyle='#a8a184';ctx.strokeRect(b.x,b.y,b.width,b.height);}
  const hits=acceptedFacts.filter(f=>['hit','support','control'].includes(f.type));
  for(const t of worldTargets){if(t.id==='caster')continue;const fact=hits.filter(f=>f.targetId===t.id&&f.targetLifeId===t.lifeId&&(f.type==='hit'||protoAge<f.at+f.durationMs)).at(-1),hit=!!fact;ctx.fillStyle=t.team==='ally'?'#7ca998':'#9b9e78';ctx.beginPath();ctx.arc(t.x,t.y,t.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle=hit?'#e7dc9e':'#344e38';ctx.lineWidth=hit?3:1;ctx.stroke();ctx.fillStyle='#c2d1b0';ctx.font='10px Segoe UI';ctx.textAlign='center';ctx.fillText(`${t.team==='ally'?'A':'E'}${t.id.split('-')[1]}`,t.x,t.y+27);if(fact){ctx.fillStyle=fact.type==='hit'?'#ead095':'#abd7c3';ctx.fillText(fact.type,t.x,t.y-23);}}
  prototypeActor(ctx);drawBitmapFx(ctx,geometry,'front');
  rootMark(ctx,protoOrigin.x,protoOrigin.y);ctx.strokeStyle='#bed1a2';ctx.beginPath();ctx.moveTo(protoAim.x-7,protoAim.y);ctx.lineTo(protoAim.x+7,protoAim.y);ctx.moveTo(protoAim.x,protoAim.y-7);ctx.lineTo(protoAim.x,protoAim.y+7);ctx.stroke();ctx.font='10px Segoe UI';ctx.fillStyle='#b0c5a6';ctx.textAlign='left';ctx.fillText(hasCast?'Điểm ngắm đã khóa':'Bấm sân để đổi điểm ngắm',24,403);
  const contract=selectedContract();$('skill-name').textContent=contract?.name ?? `${families[$('proto-family').value]} · ${$('proto-mode').value==='aoe'?'AOE':'đơn mục tiêu'}`;
  $('contract-note').textContent=contract?.description ?? contract?.summary ?? `${contract?.pulses?.length??0} nhịp tác động · tầm ${contract?.policy?.range??'—'} px · ${contract?.policy?.los?'có kiểm LOS':'không kiểm LOS'}. ${contract?.creditPolicy??contract?.escapeNote??contract?.canonNote??'Facts riêng cho từng pulse, target và life.'}`;
  $('core-stats').innerHTML=`<div><strong>${new Set(hits.map(f=>f.targetId)).size}</strong><span>MỤC TIÊU TÁC ĐỘNG</span></div><div><strong>${hits.length}</strong><span>FACTS HIT / HỘ ĐẠO</span></div><div><strong>${repeatedFacts}</strong><span>FACTS LẶP ĐÃ CHẶN</span></div>`;
  $('core-state').textContent=hasCast?`${phase} · ${Math.round(protoAge)} ms${$('late-facts').checked?' · nhận facts trễ 320 ms':''}${mutations.some(m=>m.type==='cancel'&&m.at<=protoAge)?' · đã yêu cầu hủy':''}${fxSequences.some(s=>s.familyId===$('proto-family').value)?' · bitmap FX thật':''}`:'Chưa phát chiêu · xem trước hình vùng đã khóa';
  $('fact-log').innerHTML=acceptedFacts.length?acceptedFacts.map(f=>`<div class="fact-line ${esc(f.type)}"><b>${esc(f.type)}</b> @${esc(f.at)} ${esc(f.pulseId??'')} ${esc(f.targetId??'')} ${esc(f.targetLifeId??'')}</div>`).join(''):'Chưa nhận facts.';
  $('phase-track').innerHTML=['warning','charge','release','active','residual','complete'].map(p=>`<span class="${p===phase?'active':''}">${p}</span>`).join('');$('age').textContent=`${Math.round(protoAge)} ms`;$('seek').value=Math.round(protoAge);
}
function resetPrototype({cast=false}={}) {protoPlaying=false;$('play').textContent='Chạy';protoAge=0;hasCast=cast;mutations=[];repeatedFacts=0;if(!cast)protoAim={x:protoOrigin.x+310,y:protoOrigin.y};castNumber++;targetOptions();rebuildCore();if(cast&&!matchMedia('(prefers-reduced-motion: reduce)').matches){protoPlaying=true;protoStart=performance.now();$('play').textContent='Dừng';}}
function frameLayers(frame,clip) {const body=asLayer(frame?.body ?? frame,{pivot:clip.pivot ?? [48,88],canvas:clip.canvas ?? [96,96]});const gear=(frame?.gearLayers ?? frame?.gear ?? []).map?.(l=>asLayer(l)) ?? [];return {body,gear};}
function durationOf(clip) {return clip.durationMs ?? clip.duration ?? (clip.frames?.length ?? 0)*(1000/(clip.fps ?? 8));}
function frameAt(clip,age) {const frames=clip.frames ?? [];if(!frames.length)return null;let elapsed=0;for(const frame of frames){const duration=frame.durationMs ?? frame.holdMs ?? 1000/(clip.fps ?? 8);elapsed+=duration;if(age<elapsed)return frame;}return frames.at(-1);}
function drawMotion() {
  const c=$('motion-stage'),ctx=c.getContext('2d'),z=Number($('motion-zoom').value);c.width=Math.max(300,Math.round(c.parentElement.clientWidth));c.height=z===4?520:360;background(ctx,c.width,c.height,$('scene').value,z);
  if(!motionClip){ctx.fillStyle='#c2c9a5';ctx.textAlign='center';ctx.font='15px Segoe UI';ctx.fillText('Chưa có clip body đóng gói',c.width/2,162);ctx.font='11px Segoe UI';ctx.fillText('Neutral và sơ đồ Core được review ở phía trên.',c.width/2,189);return;}
  const f=frameAt(motionClip,motionAge),layers=frameLayers(f,motionClip),a=appearances.find(a=>a.id===motionClip.appearanceId) ?? appearances.find(a=>a.identityId===motionClip.identityId&&a.familyId===motionClip.familyId),x=Math.round(c.width/2),y=c.height-48;
  const gear=layers.gear.length?layers.gear:[];
  if(a)compose(ctx,{...a,layers:gear},x,y,z,true,layers.body);else drawLayer(ctx,layers.body,x,y,z);
  rootMark(ctx,x,y);$('motion-age').textContent=`${Math.round(motionAge)} ms`;$('motion-seek').value=Math.round(motionAge);drawDirectionGrid();
}
function configureMotionFilters(){
 const controls=$('motion-clip').closest('.controls');
 const sets=[['motion-identity','Nhân vật',names,$('identity').value],['motion-family','Trang bị',families,$('family').value],['motion-direction','Hướng',directionNames,'southeast'],['motion-action','Chuyển động',actionNames,'idle']];
 const params=new URLSearchParams(location.hash.slice(1));
 for(const [id,title,values,initial] of sets){const label=document.createElement('label');label.textContent=title;const select=document.createElement('select');select.id=id;select.innerHTML=Object.entries(values).map(([key,value])=>`<option value="${key}">${esc(value)}</option>`).join('');const key=id.slice(7);select.value=values[params.get(key)]?params.get(key):initial;label.append(select);controls.prepend(label);select.onchange=filterMotion;}
}
async function filterMotion(){
 motionPlaying=false;motionClip=null;
 const identity=$('motion-identity').value,family=$('motion-family').value,direction=$('motion-direction').value,action=$('motion-action').value;
 const list=motionClips.filter(c=>c.identityId===identity&&c.familyId===family&&c.direction===direction&&c.action===action);
 $('motion-clip').innerHTML=list.map(c=>`<option value="${esc(c.id)}">${esc(clipName(c))}</option>`).join('');
 for(const id of ['motion-clip','motion-play','motion-seek'])$(id).disabled=!list.length;
 const prototypeSelectionChanged=$('identity').value!==identity||$('proto-family').value!==family;
 $('identity').value=identity;$('family').value=family;selectAppearance();$('proto-family').value=family;
 if(core&&prototypeSelectionChanged)resetPrototype();
 const params=new URLSearchParams({identity,family,direction,action});history.replaceState(null,'','#'+params.toString());
 if(list.length)await setMotion();else{$('motion-detail').innerHTML='<div class="empty">Binding này chưa được sản xuất. Coverage thiếu được ghi rõ.</div>';drawMotion();drawDirectionGrid();}
}
function familyProgress(){
 $('family-progress').innerHTML=(manifest.completeness??[]).map(c=>`<button type="button" data-family="${c.familyId}"><strong>${families[c.familyId]}</strong><span>${c.clips}/128 clip · ${c.gearTrackClips}/128 gear track</span><span>${c.gearViews}/16 gear view · ${c.fxSequences}/10 FX</span><b>${c.missing.length?'Đang sản xuất':'Body đủ tám hướng'}</b></button>`).join('');
 for(const button of $('family-progress').querySelectorAll('button'))button.onclick=()=>{$('motion-family').value=button.dataset.family;filterMotion();$('motion').scrollIntoView({block:'start'});};
}
function drawDirectionGrid(){
 if(!$('motion-identity'))return;
 const identity=$('motion-identity').value,family=$('motion-family').value,action=$('motion-action').value;
 const grid=$('direction-grid');
 if(!grid.children.length)grid.innerHTML=Object.entries(directionNames).map(([id,name])=>`<article data-direction="${id}"><h3>${name}</h3><div class="direction-canvas"><canvas width="224" height="224"></canvas></div><p></p></article>`).join('');
 for(const tile of grid.children){const clip=motionClips.find(c=>c.identityId===identity&&c.familyId===family&&c.direction===tile.dataset.direction&&c.action===action),ctx=tile.querySelector('canvas').getContext('2d');background(ctx,224,224,$('scene').value);tile.querySelector('p').textContent=clip?`${clip.frames.length} key · ${clip.ownerApproved?'pilot đã duyệt':clip.bodyOwnerApproved?'body pilot · gear mới':'nguồn mới'}`:'Chưa sản xuất';if(!clip){ctx.fillStyle='#b4c5ac';ctx.font='12px Segoe UI';ctx.fillText('Chưa có binding',55,115);continue;}const f=frameAt(clip,Math.min(motionAge,durationOf(clip))),layers=frameLayers(f,clip);const missing=[fileOf(layers.body),...layers.gear.map(fileOf)].filter(p=>p&&!images.has(p)&&!failedImages.has(p));if(missing.length)Promise.all([...new Set(missing)].map(image)).then(drawDirectionGrid);compose(ctx,{layers:layers.gear},112,208,1,true,layers.body);rootMark(ctx,112,208);}
}
async function setMotion() {
  motionPlaying=false;motionAge=0;motionClip=motionClips.find(c=>c.id===$('motion-clip').value);if(!motionClip)return;
  const requestedClip=motionClip;
  const paths=(requestedClip.frames ?? []).flatMap(f=>{const l=frameLayers(f,requestedClip);return [fileOf(l.body),...l.gear.map(fileOf)];}).filter(Boolean);await Promise.all([...new Set(paths)].map(image));
  if(motionClip!==requestedClip)return;
  $('motion-loop').checked=Boolean(motionClip.loop);
  $('motion-seek').max=Math.round(durationOf(motionClip));$('motion-play').textContent='Chạy clip';$('motion-detail').innerHTML=`<h3>${esc(clipName(motionClip))}</h3><p>${(motionClip.frames??[]).length} frame thật · ${directionNames[motionClip.direction]??esc(motionClip.direction)}.</p><p>Tuổi tuyệt đối · canvas ${esc((motionClip.canvas??[96,96]).join(' × '))} · điểm chân (${esc((motionClip.pivot??[48,88]).join(', '))}).</p><p>${paths.length>0?'Playback từ file canonical trong manifest.':'Chưa có frame canonical.'}</p><div class="detail-links">${motionClip.raw??motionClip.source?`<a href="${esc(motionClip.raw??motionClip.source)}">Nguồn motion ↗</a>`:''}</div>`;drawMotion();
}
async function initialize() {
  try{manifest=await json('./manifest.json');appearances=(manifest.appearances ?? manifest.actors ?? []).map(normalizedAppearance);reference=asLayer(manifest.reference ?? manifest.liveReference ?? manifest.primaryReference,{canvas:[64,96],pivot:[32,88]});mapFile=fileOf(manifest.mapReference) ?? mapFile;
    await Promise.all([...new Set([fileOf(reference),mapFile,...appearances.flatMap(a=>[fileOf(a.body),...a.layers.map(fileOf)])].filter(Boolean))].map(image));
    try{const assessment=await json('../wang-lin-equipment-production-v1/body/assessment.json');appearances=appearances.map(a=>{const item=assessment.items?.find(i=>i.id===a.id);return {...a,assessment:a.assessment??item?.observation};});}catch{}
    const p=new URLSearchParams(location.hash.slice(1));if(['a','b'].includes(p.get('identity')))$('identity').value=p.get('identity');if(families[p.get('family')])$('family').value=p.get('family');cards();selectAppearance();resizeStage();
    motionClips=(manifest.motions?.clips ?? manifest.clips ?? []).filter(c=>c.frames?.length);
    for(const entry of manifest.fxManifests??[]){const data=await json(entry.file),prefix=entry.file.slice(0,entry.file.lastIndexOf('/')+1);fxSequences.push(...(data.sequences??[]).map(s=>({...s,familyId:entry.familyId,atlas:s.atlas?{...(typeof s.atlas==='string'?{}:s.atlas),file:prefix+(typeof s.atlas==='string'?s.atlas:s.atlas.file)}:null,frames:s.frames.map(f=>({...f,file:prefix+f.file}))})));}if(fxSequences.length)$('bitmap-fx').disabled=false;
    $('coverage').innerHTML=[{n:appearances.filter(a=>images.has(fileOf(a.body))).length,label:'BODY NEUTRAL / 8'},{n:appearances.filter(a=>a.layers.some(l=>images.has(fileOf(l)))).length,label:'BỘ GEAR / 8'},{n:motionClips.length,label:'CLIP BODY THẬT'},{n:fxSequences.length,label:'SEQUENCE FX THẬT'}].map(s=>`<div class="stat"><strong>${s.n}</strong><span>${s.label}</span></div>`).join('');
    $('load-note').textContent=`Đã đọc ${appearances.filter(a=>images.has(fileOf(a.body))).length}/8 body neutral và ${appearances.filter(a=>a.layers.some(l=>images.has(fileOf(l)))).length}/8 bộ gear. ${motionClips.length} clip body đã đóng gói. Các phần thiếu được giữ trạng thái đang sản xuất.`;
    configureMotionFilters();familyProgress();
    if(motionClips.length){$('motion-clip').disabled=false;$('motion-play').disabled=false;$('motion-seek').disabled=false;await filterMotion();}else{$('motion-detail').innerHTML='<div class="empty">Chưa có clip body cho lựa chọn này.</div>';drawMotion();}
  }catch(e){$('load-note').classList.add('error');$('load-note').textContent=e.message;$('neutral-grid').innerHTML='<div class="empty">Tài sản đang được tạo trong gói mới. Review sẽ đọc coverage thực khi manifest được đóng.</div>';$('motion-detail').innerHTML='<div class="empty">P3 chưa có clip body trong manifest.<p>Không dùng ảnh neutral để thay frame motion.</p></div>';drawMotion();}
  try{core=await import('../../gameplay/wang-lin-equipment-prototype-v1/core.mjs');initialTargets=core.exampleWorld(protoOrigin,{x:1,y:0}).targets;targetOptions();rebuildCore();}catch(e){$('core-state').textContent=`Core prototype chưa sẵn sàng: ${e.message}`;for(const id of ['cast','play','cancel','target-life','duplicate','reset','seek'])$(id).disabled=true;}
  document.body.dataset.ready='true';
}
for(const id of ['identity','family'])$(id).addEventListener('change',()=>{selectAppearance();if(id==='family')$('proto-family').value=$('family').value;resetPrototype();});
for(const id of ['zoom','scene','show-gear','show-rear','show-front','show-hand','show-roots','show-silhouette'])$(id).addEventListener('change',()=>{resizeStage();drawMotion();drawPrototype();});
for(const id of ['proto-family','proto-mode'])$(id).addEventListener('change',()=>{if(id==='proto-family'&&appearances.length){$('family').value=$('proto-family').value;selectAppearance();}resetPrototype();});
$('bitmap-fx').onchange=drawPrototype;
$('field-direction').onchange=drawPrototype;
$('proto-scene').onchange=drawPrototype;
$('proto-zoom').onchange=drawPrototype;
for(const id of ['proto-target','blocker','late-facts'])$(id).addEventListener('change',()=>{if(hasCast)rebuildCore();else resetPrototype();});
$('arena').addEventListener('click',event=>{if(hasCast)return;const r=$('arena').getBoundingClientRect();protoAim={x:clamp((event.clientX-r.left)/r.width*800,0,800),y:clamp((event.clientY-r.top)/r.height*432,0,432)};rebuildCore();});
$('cast').onclick=()=>resetPrototype({cast:true});$('reset').onclick=()=>resetPrototype();
$('play').onclick=()=>{if(!hasCast){resetPrototype({cast:true});return;}protoPlaying=!protoPlaying;protoStart=performance.now()-protoAge;$('play').textContent=protoPlaying?'Dừng':'Chạy';};
$('cancel').onclick=()=>{if(!hasCast){hasCast=true;}mutations.push({type:'cancel',at:Math.round(protoAge)});protoPlaying=false;$('play').textContent='Chạy';rebuildCore();};
$('target-life').onclick=()=>{const targetId=$('proto-target').value;mutations.push({type:'life',targetId,lifeId:`${targetId}-life-${mutations.filter(m=>m.type==='life'&&m.targetId===targetId).length+2}`,at:Math.round(protoAge)});rebuildCore();};
$('duplicate').onclick=()=>{ingestFacts(allFacts(),true);drawPrototype();};
$('restore').onclick=()=>{if(!protoEngine||!core)return;protoEngine=core.restorePrototype(protoEngine.snapshot());protoCast=protoEngine.casts[0];ingestFacts(allFacts());drawPrototype();$('core-state').textContent+=' · snapshot đã khôi phục';};
$('seek').oninput=()=>{protoPlaying=false;$('play').textContent='Chạy';protoAge=Number($('seek').value);rebuildCore();};
$('motion-clip').onchange=setMotion;$('motion-play').onclick=()=>{motionPlaying=!motionPlaying;motionStart=performance.now()-motionAge;$('motion-play').textContent=motionPlaying?'Dừng clip':'Chạy clip';};
$('motion-zoom').onchange=drawMotion;
$('motion-seek').oninput=()=>{motionPlaying=false;$('motion-play').textContent='Chạy clip';motionAge=Number($('motion-seek').value);drawMotion();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){protoPlaying=false;motionPlaying=false;$('play').textContent='Chạy';$('motion-play').textContent='Chạy clip';}});
window.addEventListener('offline',()=>{protoPlaying=false;motionPlaying=false;$('play').textContent='Chạy';$('motion-play').textContent='Chạy clip';});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){protoPlaying=false;motionPlaying=false;$('play').textContent='Chạy';$('motion-play').textContent='Chạy clip';}});
window.addEventListener('resize',()=>{resizeStage();drawMotion();});
for(const link of document.querySelectorAll('a[href^="#"]'))link.addEventListener('click',event=>{const target=document.getElementById(link.getAttribute('href').slice(1));if(target){event.preventDefault();target.scrollIntoView({block:'start'});}});
function tick(now) {if(protoPlaying&&core){protoAge=Math.min(Number($('seek').max),now-protoStart);protoEngine.advance(protoAge);ingestFacts(allFacts());drawPrototype();if(protoAge>=Number($('seek').max)){protoPlaying=false;$('play').textContent='Chạy';}}if(motionPlaying&&motionClip){const duration=durationOf(motionClip),rawAge=now-motionStart;motionAge=$('motion-loop').checked?rawAge%duration:Math.min(rawAge,duration);drawMotion();if(!$('motion-loop').checked&&rawAge>=duration){motionPlaying=false;$('motion-play').textContent='Chạy clip';}}requestAnimationFrame(tick);}
window.__equipmentReview={get manifest(){return manifest;},get appearances(){return appearances;},get decodedImages(){return [...decodedEver];},get failedImages(){return [...failedImages];},get pendingImages(){return pendingImages.size;},get fx(){return {sequences:fxSequences};},get cache(){return {decodedBytes:cacheBytes,budget:cacheBudget,evictions:cacheEvictions,mapExcluded:true};},get prototype(){return {cast:protoCast,age:protoAge,facts:allFacts(),deliveredFacts:acceptedFacts,visibleFactEffects:[...visibleFactEffects],gear:prototypeGearTrace,duplicateCount:repeatedFacts,playing:protoPlaying,targets:worldTargets,aim:protoAim,hasCast};},get motion(){return {clips:motionClips,clip:motionClip,age:motionAge,playing:motionPlaying};}};
await initialize();requestAnimationFrame(tick);

