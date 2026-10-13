const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const images = new Map(), favorites = new Map();
const state = { artifact:'bead', outfit:'', color:'', zoom:window.matchMedia('(max-width:600px)').matches?1:2, background:'gray', fx:true, gear:true, roots:false };
let manifest, body, bodies, groups, mapBackground;
const artifactNames = { sword:'Tiên kiếm · Hứa Lập Quốc', banner:'Thập Ức Tôn Hồn Phiên', bead:'Thiên Nghịch Châu', chariot:'Xạ Thần Xa' };
const outfitNames = { original:'Vương Lâm live', 'sword-jade':'Kiếm tu thanh ngọc', 'sword-ink':'Kiếm tu mặc ảnh', 'banner-ashen':'Hành giả tro hồn', 'banner-ritual':'Đạo bào niêm hồn', 'bead-cloud':'Đạo bào vân ngà', 'bead-hermit':'Áo ẩn tu đá xám', 'chariot-bronze':'Chiến bào cổ đồng', 'chariot-thunder':'Chiến bào lôi thanh' };
const artifactShorts = { sword:'Kiếm linh', banner:'Hồn phiên', bead:'Châu nội giới', chariot:'Chiến xa' };
const artifactNotes = {
  sword:'Huyền kim, bạch ngọc và huyền mặc tạo ba cảm giác kim loại khác nhau. Phối với áo Vân Ngọc sáng hoặc Huyền Mặc trầm.',
  banner:'Ba tông huyền kim, u tím và mặc ngọc đi cùng áo Tàn Vân hoặc U Tế. Vải phiên và khí hồn được xem riêng với người.',
  bead:'Cổ thạch, vân ngọc và huyền thạch là ba cách đọc châu mới. Lõi đá và linh quang tách riêng; phối với Vân Bạch hoặc Ẩn Tu.',
  chariot:'Cổ đồng, thanh ngọc và lôi lam đổi cảm giác vật liệu của pháp khí triển khai cạnh người. Phối với Cổ Kim hoặc Lôi Huyền.'
};
function selection() { const group=groups.find(item=>item.id===state.artifact);return {group,outfit:bodies.find(item=>item.id===state.outfit),variant:group.variants.find(item=>item.id===state.color)}; }
function outfitsFor(group) { return bodies.filter(item=>item.id===body.id || group.bodyIds?.includes(item.id) || item.equipmentId===group.id || item.artifactId===group.id || item.artifactIds?.includes(group.id) || (!item.equipmentId && !item.artifactId && !item.artifactIds && item.id.startsWith(`${group.id}-`))); }
function gearFrame(variant) { return {canvas:variant.canvas ?? manifest.canvas ?? [256,224],pivot:variant.pivot ?? manifest.pivot ?? [96,200]}; }
function bodyFrame(outfit) { return {canvas:outfit.canvas ?? [64,96],pivot:outfit.pivot ?? [32,88]}; }
function gearPaths(variant) { const front=variant.frontFile ?? (!variant.rearFile?(variant.file ?? variant.fullFile):undefined);return [...new Set([variant.fxRearFile ?? variant.fxFile,variant.rearFile,front,variant.fxFrontFile].filter(Boolean))]; }
async function loadImage(path) { if(images.has(path))return images.get(path);const image=new Image();image.src=path;await image.decode();images.set(path,image);return image; }
function background(ctx,width,height,zoom) {
  if(state.background==='map' && mapBackground) { const map=images.get(mapBackground.file),sourceWidth=Math.min(map.width,Math.ceil(width/zoom)),sourceHeight=Math.min(map.height,Math.ceil(height/zoom));ctx.drawImage(map,Math.floor((map.width-sourceWidth)/2),Math.floor((map.height-sourceHeight)/2),sourceWidth,sourceHeight,0,0,sourceWidth*zoom,sourceHeight*zoom);return; }
  const palette={gray:['#808a83','#79837c'],light:['#eee9d8','#ded9c7'],dark:['#162820','#213c2b']},[base,line]=palette[state.background] ?? palette.gray;
  ctx.fillStyle=base;ctx.fillRect(0,0,width,height);const size=16*zoom;ctx.fillStyle=line;
  for(let y=0;y<height;y+=size)for(let x=0;x<width;x+=size)if((x/size+y/size)%2)ctx.fillRect(x,y,size,size);
}
function layer(ctx,path,pivot,x,y,zoom) { if(!path)return;const image=images.get(path);ctx.drawImage(image,Math.round(x-pivot[0]*zoom),Math.round(y-pivot[1]*zoom),image.width*zoom,image.height*zoom); }
function drawActor(ctx,outfit,variant,x,y,zoom) {
  const ownFrame=bodyFrame(outfit),frame=variant?gearFrame(variant):null;
  if(variant && state.fx)layer(ctx,variant.fxRearFile ?? variant.fxFile,frame.pivot,x,y,zoom);
  if(variant && state.gear)layer(ctx,variant.rearFile,frame.pivot,x,y,zoom);
  layer(ctx,outfit.file,ownFrame.pivot,x,y,zoom);
  if(variant && state.gear){if(variant.frontFile)layer(ctx,variant.frontFile,frame.pivot,x,y,zoom);else if(!variant.rearFile)layer(ctx,variant.file ?? variant.fullFile,frame.pivot,x,y,zoom);}
  if(variant && state.fx)layer(ctx,variant.fxFrontFile,frame.pivot,x,y,zoom);
  if(state.roots){ctx.strokeStyle=state.background==='light'?'#a24929':'#f3d579';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y+.5);ctx.lineTo(x+5,y+.5);ctx.moveTo(x+.5,y-5);ctx.lineTo(x+.5,y+5);ctx.stroke();}
}
function drawComposite(canvas,outfit,variant,zoom=state.zoom) { const frame=gearFrame(variant);canvas.width=frame.canvas[0]*zoom;canvas.height=frame.canvas[1]*zoom;canvas.style.width=`${canvas.width}px`;canvas.style.height=`${canvas.height}px`;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;background(ctx,canvas.width,canvas.height,zoom);drawActor(ctx,outfit,variant,frame.pivot[0]*zoom,frame.pivot[1]*zoom,zoom); }
function drawOutfit(canvas,outfit) { const frame=bodyFrame(outfit);canvas.width=frame.canvas[0];canvas.height=frame.canvas[1];const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;background(ctx,canvas.width,canvas.height,1);layer(ctx,outfit.file,frame.pivot,frame.pivot[0],frame.pivot[1],1); }
function renderWardrobe() {
  $('wardrobe-grid').innerHTML=bodies.map((outfit,index)=>{const group=groups.find(item=>outfitsFor(item).some(entry=>entry.id===outfit.id));return `<article class="wardrobe-card"><div class="wardrobe-image"><canvas id="wardrobe-${index}" role="img" aria-label="${escapeHTML(outfit.name)}, thân riêng ở 2×"></canvas></div><h3>${escapeHTML(outfit.name)}</h3><p>${outfit.id===body.id?'Mốc nhận diện live':escapeHTML(group?.name ?? 'Áo mới')}</p><button type="button" data-wardrobe="${escapeHTML(outfit.id)}" data-group="${escapeHTML(group?.id ?? '')}">${outfit.id===body.id?'So bản live':'Phối áo này'} →</button></article>`;}).join('');
  bodies.forEach((outfit,index)=>{const frame=bodyFrame(outfit),canvas=$(`wardrobe-${index}`);canvas.width=frame.canvas[0]*2;canvas.height=frame.canvas[1]*2;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;background(ctx,canvas.width,canvas.height,2);layer(ctx,outfit.file,frame.pivot,frame.pivot[0]*2,frame.pivot[1]*2,2);});
  for(const button of document.querySelectorAll('[data-wardrobe]'))button.addEventListener('click',()=>{if(button.dataset.wardrobe!==body.id && state.artifact!==button.dataset.group){state.artifact=button.dataset.group;state.color=groups.find(item=>item.id===state.artifact).variants[0].id;}state.outfit=button.dataset.wardrobe;update();$('choose').scrollIntoView({block:'start'});});
}
function drawPair() {
  const {group,outfit,variant}=selection(),frame=gearFrame(variant),scale=state.zoom,pad=20,gap=24,liveWidth=96,panelWidth=frame.canvas[0],labelHeight=34,canvas=$('pair');
  canvas.width=(liveWidth+panelWidth+pad*2+gap)*scale;canvas.height=(frame.canvas[1]+pad*2)*scale+labelHeight;canvas.style.width=`${canvas.width}px`;canvas.style.height=`${canvas.height}px`;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;background(ctx,canvas.width,canvas.height,scale);
  const y=(pad+frame.pivot[1])*scale,left=(pad+liveWidth/2)*scale,right=(pad+liveWidth+gap+frame.pivot[0])*scale;
  drawActor(ctx,body,null,left,y,scale);drawActor(ctx,outfit,variant,right,y,scale);ctx.font='13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
  [[(pad+liveWidth/2)*scale,'Vương Lâm live',liveWidth],[(pad+liveWidth+gap+panelWidth/2)*scale,`${outfit.name} · ${variant.name}`,panelWidth]].forEach(([x,text,width])=>{const labelWidth=Math.min(ctx.measureText(text).width+20,width*scale-8),labelY=canvas.height-18;ctx.fillStyle='#10281fee';ctx.fillRect(x-labelWidth/2,labelY-13,labelWidth,26);ctx.fillStyle='#f0e4c3';ctx.fillText(text,x,labelY,labelWidth-12);});
  canvas.setAttribute('aria-label',`Vương Lâm live cạnh ${outfit.name}, ${group.name}, màu ${variant.name}, ${scale}×`);
  $('scale-note').textContent=`${scale}× nearest · 1 pixel ảnh = ${scale} pixel CSS. ${scale===1?'Cỡ 1× để chọn theo hình trong game.':'Chọn 1× để đọc cỡ chơi.'} Cuộn ngang trên màn nhỏ để giữ tỷ lệ.`;
}
const comboKey=(artifact,outfit,color)=>`${artifact}/${outfit}/${color}`;
const currentKey=()=>comboKey(state.artifact,state.outfit,state.color);
function paletteHTML(variant) { const palette=variant.palette ?? variant.colors ?? [],colors=Array.isArray(palette)?palette:Object.values(palette);return `<span class="swatches" aria-hidden="true">${colors.slice(0,4).map(color=>`<i style="background:${/^#[0-9a-f]{3,8}$/i.test(color)?color:'#7d8c81'}"></i>`).join('')}</span>`; }
function renderChoices() {
  const {group,outfit,variant}=selection();
  $('artifact-tabs').innerHTML=groups.map(item=>`<button type="button" data-artifact="${escapeHTML(item.id)}" aria-pressed="${item.id===state.artifact}">${escapeHTML(item.name)}<small>${escapeHTML(artifactShorts[item.id] ?? 'Ba hướng màu · hai kiểu áo')}</small></button>`).join('');
  $('outfit-options').innerHTML=outfitsFor(group).map((item,index)=>`<button type="button" class="outfit-choice" data-outfit="${escapeHTML(item.id)}" aria-pressed="${item.id===outfit.id}"><span class="outfit-image"><canvas id="outfit-${index}" role="img" aria-label="${escapeHTML(item.name)}, thân riêng"></canvas></span><b>${escapeHTML(item.name)}</b><small>${item.id===body.id?'Mốc nhận diện':'Kiểu áo mới'}</small></button>`).join('');outfitsFor(group).forEach((item,index)=>drawOutfit($(`outfit-${index}`),item));
  $('color-options').innerHTML=group.variants.map(item=>`<button type="button" class="color-choice" data-color="${escapeHTML(item.id)}" aria-pressed="${item.id===variant.id}">${paletteHTML(item)}<span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.subtitle ?? item.material ?? item.paletteDescription ?? (group.id==='bead'?'Lõi đá xám · khí riêng':'Phương án vật liệu & màu'))}</small></span></button>`).join('');$('artifact-note').textContent=artifactNotes[group.id] ?? group.description ?? '';
  for(const button of document.querySelectorAll('[data-artifact]'))button.addEventListener('click',()=>selectArtifact(button.dataset.artifact));
  for(const button of document.querySelectorAll('[data-outfit]'))button.addEventListener('click',()=>{state.outfit=button.dataset.outfit;update();});
  for(const button of document.querySelectorAll('[data-color]'))button.addEventListener('click',()=>{state.color=button.dataset.color;update();});
}
function cardMarkup(group,outfit,variant,index,prefix) {
  const key=comboKey(group.id,outfit.id,variant.id),pinned=favorites.has(key),selected=key===currentKey();
  return `<article class="combination-card${selected?' selected':''}${pinned?' favorite':''}" data-key="${escapeHTML(key)}"><div class="card-heading"><div><h3>${escapeHTML(outfit.name)}</h3><p>${escapeHTML(variant.name)}${prefix==='favorite'?' · '+escapeHTML(group.name):''}</p></div><button type="button" class="star" data-pin="${escapeHTML(key)}" aria-pressed="${pinned}" aria-label="${pinned?'Bỏ ghim':'Ghim'} ${escapeHTML(outfit.name)}, ${escapeHTML(variant.name)}">${pinned?'★':'☆'}</button></div><button type="button" class="card-image" data-select="${escapeHTML(key)}" aria-label="Xem riêng ${escapeHTML(outfit.name)}, ${escapeHTML(variant.name)}"><canvas id="${prefix}-${index}" role="img" aria-label="${escapeHTML(outfit.name)} phối ${escapeHTML(variant.name)}"></canvas></button><div class="card-footer"><span>${state.zoom}× · ${state.fx?'FX bật':'FX tắt'}${selected?' · đang xem':''}</span><button type="button" data-select="${escapeHTML(key)}">Xem riêng →</button></div></article>`;
}
function lookupCombo({artifact,outfit,color}) { const group=groups.find(item=>item.id===artifact);return {group,outfit:bodies.find(item=>item.id===outfit),variant:group.variants.find(item=>item.id===color)}; }
function renderCards() {
  const {group}=selection(),combinations=outfitsFor(group).flatMap(outfit=>group.variants.map(variant=>({group,outfit,variant})));
  $('matrix-title').textContent=`${group.name} · ${combinations.length} tổ hợp`;$('matrix-note').textContent=`Mỗi hình ở ${state.zoom}×. Đổi cỡ xem, bật/tắt FX và đổi nền ở trên cũng áp dụng vào các tổ hợp, giúp đọc rõ áo và vật liệu.`;
  $('combination-grid').dataset.gridZoom=String(state.zoom);$('favorite-grid').dataset.gridZoom=String(state.zoom);
  $('combination-grid').innerHTML=combinations.map((entry,index)=>cardMarkup(entry.group,entry.outfit,entry.variant,index,'matrix')).join('');combinations.forEach((entry,index)=>drawComposite($(`matrix-${index}`),entry.outfit,entry.variant));
  const entries=[...favorites.values()].map(lookupCombo);$('favorite-grid').innerHTML=entries.map((entry,index)=>cardMarkup(entry.group,entry.outfit,entry.variant,index,'favorite')).join('');entries.forEach((entry,index)=>drawComposite($(`favorite-${index}`),entry.outfit,entry.variant));
  $('favorite-count').textContent=String(entries.length);$('empty-favorites').hidden=entries.length>0;$('clear-favorites').disabled=entries.length===0;
  for(const button of document.querySelectorAll('[data-pin]'))button.addEventListener('click',()=>toggleFavorite(button.dataset.pin));
  for(const button of document.querySelectorAll('[data-select]'))button.addEventListener('click',()=>{const [artifact,outfit,color]=button.dataset.select.split('/');Object.assign(state,{artifact,outfit,color});update();$('choose').scrollIntoView({block:'start'});});
}
function toggleFavorite(key) { if(favorites.has(key))favorites.delete(key);else{const [artifact,outfit,color]=key.split('/');favorites.set(key,{artifact,outfit,color});}renderCards();updatePinButton(); }
function updatePinButton() { const pinned=favorites.has(currentKey());$('pin-current').disabled=false;$('pin-current').setAttribute('aria-pressed',String(pinned));$('pin-current').textContent=pinned?'★ Đã ghim · bấm để bỏ':'☆ Ghim mẫu này'; }
function identityAssessment(outfit) {
  if(outfit.id===body.id)return 'Mốc đối chiếu: ảnh live được giữ nguyên. Đổi pháp bảo không đổi thân ở lựa chọn này.';
  const value=outfit.identityAssessment ?? outfit.identity?.assessment ?? outfit.assessment;if(typeof value==='string')return value;
  if(value && typeof value==='object')return Object.values(value).filter(item=>typeof item==='string').join(' ');
  return 'Áo mới được đăng ký cạnh thân live. Xem kỹ mặt, tóc, vai, tay và giày trước khi chọn.';
}
function pathOf(item,key) { return item[key] ?? item.source?.[key]; }
function sourceLinks(item) { const inputs=(item.inputs ?? item.input ?? []).map((input,index)=>[typeof input==='string'?input:input.file,`Input ${index+1}`]);const entries=[[pathOf(item,'raw'),'Nguồn AI'],[pathOf(item,'prompt'),'Prompt'],[item.file ?? item.fullFile,'Ảnh native'],[item.frontFile,'Lớp trước'],[item.rearFile,'Lớp sau'],[item.fxRearFile ?? item.fxFile,'FX riêng'],[item.measurementFile,'Phép đo'],...inputs];return [...new Map(entries.filter(([path])=>path).map(([path,label])=>[path,label]))].map(([path,label])=>`<a href="${escapeHTML(path)}" target="_blank" rel="noopener">${label}</a>`).join(''); }
function sourceCard(item,title,copy) { const raw=pathOf(item,'raw'),isLive=item.file===body.file,sourceStatus=isLive?'Nguồn live giữ nguyên':item.copyPrevious?'Nguồn v2 · giữ nguyên':'Nguồn ImageGen mới · concept';return `<article class="source-card"><p class="eyebrow">${sourceStatus}</p><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p>${raw?`<a class="source-image" href="${escapeHTML(raw)}" target="_blank" rel="noopener"><img src="${escapeHTML(raw)}" alt="Nguồn ${escapeHTML(title)}" loading="lazy"></a>`:`<div class="source-image"><span class="source-missing">${isLive?'Ảnh live nguyên pixel, xem ở lựa chọn áo trên.':'Nguồn gốc được ghi trong manifest.'}</span></div>`}<div class="links">${sourceLinks(item)}</div><p class="hint">${item.fxSelected===false?'Mẫu này xem lõi đá riêng; FX nguồn chưa được chọn.':isLive?'Mốc nhận diện live.':'Concept tĩnh Đông Nam · chờ xem và chọn.'}</p></article>`; }
function hashHTML(item,label) { const values={native:item.sha256 ?? item.nativeSha256 ?? item.hash,source:item.sourceSha256 ?? item.rawSha256 ?? item.source?.sha256,prompt:item.promptSha256 ?? item.source?.promptSha256,...(item.layerSha256 ?? {})};return `<div><h4>${escapeHTML(label)}</h4>${Object.entries(values).filter(([,value])=>value).map(([name,value])=>`<p class="hash">${escapeHTML(name)}: ${escapeHTML(value)}</p>`).join('')}</div>`; }
function renderSources() {
  const {group,outfit,variant}=selection(),frame=gearFrame(variant),ownFrame=bodyFrame(outfit);
  $('source-grid').innerHTML=sourceCard(outfit,outfit.name,outfit.description ?? identityAssessment(outfit))+sourceCard(variant,`${group.name} · ${variant.name}`,variant.description ?? group.description ?? '');
  $('technical-detail').innerHTML=`<dl><dt>Thân gốc</dt><dd>${body.canvas.join(' × ')} · chân (${body.pivot.join(', ')}) · live nguyên pixel</dd><dt>Áo đang xem</dt><dd>${ownFrame.canvas.join(' × ')} · chân (${ownFrame.pivot.join(', ')})</dd><dt>Pháp bảo</dt><dd>${frame.canvas.join(' × ')} · neo (${frame.pivot.join(', ')})</dd><dt>Thứ tự lớp</dt><dd>FX sau → pháp bảo sau → thân → pháp bảo trước → FX trước (nếu có)</dd><dt>Trạng thái</dt><dd>Neutral Đông Nam · concept tĩnh · ownerApproved/artApproved/runtimeReady false</dd><dt>Nhận diện</dt><dd>${escapeHTML(identityAssessment(outfit))}</dd></dl><div class="hash-grid">${hashHTML(outfit,'Thân / áo')}${hashHTML(variant,'Pháp bảo / FX')}</div>`;
}
function update() {
  const {group,outfit,variant}=selection();$('chosen-title').textContent=`${outfit.name} · ${variant.name}`;$('selection-description').textContent=variant.description ?? artifactNotes[group.id] ?? group.description ?? '';$('identity-note').textContent=outfit.id===body.id?'Vương Lâm live giữ nguyên để đối chiếu.':'Xem màu vải, vai, vạt áo và độ rộng tay áo cạnh Vương Lâm live. Chọn 1× để đánh giá cỡ chơi.';
  for(const button of document.querySelectorAll('button[data-zoom]'))button.setAttribute('aria-pressed',String(Number(button.dataset.zoom)===state.zoom));
  renderChoices();drawPair();renderCards();renderWardrobe();renderSources();updatePinButton();history.replaceState(null,'',`#${new URLSearchParams({artifact:state.artifact,outfit:state.outfit,color:state.color})}`);
}
function selectArtifact(id) { state.artifact=id;const group=groups.find(item=>item.id===id),choices=outfitsFor(group);state.outfit=choices.find(item=>item.id!==body.id)?.id ?? body.id;state.color=(group.id==='bead'?group.variants.find(item=>item.id==='cloud'):null)?.id ?? group.variants[0].id;update(); }
function normalize(data) { const original={...data.body,id:data.body.id ?? 'original',name:data.body.name ?? 'Vương Lâm live',generated:false},choices=data.bodies ?? data.bodyChoices ?? [];return {original,outfitList:[original,...choices.filter(item=>item.id!==original.id).map(item=>({...item,name:item.name ?? outfitNames[item.id] ?? item.id}))],groupList:(data.equipmentGroups ?? data.equipment ?? []).map(group=>({...group,name:group.name ?? artifactNames[group.id] ?? group.id,variants:(group.variants ?? [group]).map(item=>({...item,name:item.name ?? item.id}))}))}; }
function validate() {
  if(!body.file || body.canvas?.join(',')!=='64,96' || body.pivot?.join(',')!=='32,88')throw Error('Ảnh live phải đúng canvas 64×96 và chân (32,88).');
  if(groups.length!==4)throw Error('Bộ xem cần đủ bốn pháp bảo.');
  for(const outfit of bodies)if(!outfit.id || !outfit.file || bodyFrame(outfit).canvas.join(',')!=='64,96' || bodyFrame(outfit).pivot.join(',')!=='32,88')throw Error(`Áo chưa đúng frame người: ${outfit.id ?? 'không ID'}.`);
  for(const group of groups){if(!group.id || group.variants.length!==3 || outfitsFor(group).length!==3)throw Error(`${group.name}: cần live, hai áo và ba màu.`);for(const variant of group.variants)if(!variant.id || !gearPaths(variant).length)throw Error(`${group.name}: thiếu layer cho ${variant.id ?? 'một màu'}.`);}
}
async function start() {
  const response=await fetch('./manifest.json');if(!response.ok)throw Error(`Không đọc được manifest (${response.status}).`);manifest=await response.json();const normalized=normalize(manifest);body=normalized.original;bodies=normalized.outfitList;groups=normalized.groupList;mapBackground=manifest.mapBackground ?? manifest.review?.mapBackground;
  if(!mapBackground && manifest.mapBackgroundFile)mapBackground={file:manifest.mapBackgroundFile};if(typeof mapBackground==='string')mapBackground={file:mapBackground};validate();
  const assetPaths=[...new Set([...bodies.map(item=>item.file),...groups.flatMap(group=>group.variants.flatMap(gearPaths)),mapBackground?.file].filter(Boolean))];await Promise.all(assetPaths.map(loadImage));
  for(const outfit of bodies){const image=images.get(outfit.file),frame=bodyFrame(outfit);if(image.width!==frame.canvas[0] || image.height!==frame.canvas[1])throw Error(`Kích thước áo không khớp: ${outfit.file}.`);}
  for(const group of groups)for(const variant of group.variants){const frame=gearFrame(variant);for(const path of gearPaths(variant)){const image=images.get(path);if(image.width!==frame.canvas[0] || image.height!==frame.canvas[1])throw Error(`Kích thước pháp bảo không khớp: ${path}.`);}}
  if(!mapBackground)$('background').querySelector('[value="map"]').disabled=true;
  const requested=new URLSearchParams(location.hash.slice(1));state.artifact=groups.some(item=>item.id===requested.get('artifact'))?requested.get('artifact'):(groups.some(item=>item.id==='bead')?'bead':groups[0].id);
  const group=groups.find(item=>item.id===state.artifact),choices=outfitsFor(group);state.outfit=choices.some(item=>item.id===requested.get('outfit'))?requested.get('outfit'):(choices.find(item=>item.id!==body.id)?.id ?? body.id);state.color=group.variants.some(item=>item.id===requested.get('color'))?requested.get('color'):(group.id==='bead'?group.variants.find(item=>item.id==='cloud'):null)?.id ?? group.variants[0].id;
  for(const button of document.querySelectorAll('button[data-zoom]'))button.addEventListener('click',()=>{state.zoom=Number(button.dataset.zoom);update();});
  $('background').addEventListener('change',()=>{state.background=$('background').value;update();});for(const [id,key] of [['show-fx','fx'],['show-gear','gear'],['show-roots','roots']])$(id).addEventListener('change',()=>{state[key]=$(id).checked;update();});
  $('pin-current').addEventListener('click',()=>toggleFavorite(currentKey()));$('clear-favorites').addEventListener('click',()=>{favorites.clear();renderCards();updatePinButton();});update();
  $('pack-status').textContent=`${bodies.length-1} áo mới · ${groups.reduce((sum,item)=>sum+item.variants.length,0)} mẫu pháp bảo · chờ lựa chọn`;document.body.dataset.ready='true';
  window.equipmentOptionsReview=Object.freeze({manifest,body,bodies,groups,getState:()=>({...state}),getFavorites:()=>[...favorites.values()].map(item=>({...item})),getSelection:()=>selection(),drawComposite,selectArtifact});
}
start().catch(error=>{$('load-error').hidden=false;$('load-error').textContent=`${error.message} Mở trang qua HTTP để đọc hồ sơ và ảnh cùng thư mục.`;$('pack-status').textContent='Chưa nạp đủ hình';document.body.dataset.ready='error';console.error(error);});
