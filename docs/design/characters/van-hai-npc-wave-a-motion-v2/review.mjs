const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json=async path=>{const response=await fetch(path);if(!response.ok)throw Error(`Chưa có ${path}`);return response.json();};
const hashFile=async path=>{const response=await fetch(path);if(!response.ok)throw Error(`Chưa có ${path}`);const bytes=await response.arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');};
const expectedIds=['NPC-HN-HERBALIST','NPC-HN-FORGE','NPC-HN-ROUTE-KEEPER','NPC-HN-GATE-WARDEN','NPC-HN-DISCIPLE-WATER','NPC-HN-DISCIPLE-SWORD'];
const actionNames={idle:'Idle · đứng chờ',talk:'Talk · nói chuyện',profession:'Profession · theo nghề'};
const standardPath='../van-hai-npc-visual-standard-v1/';
const directionNames={north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam',south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc'};
const directions=Object.keys(directionNames);
const mapPath='../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';
const neutralRoot='../van-hai-npc-wave-a-concepts-v1/';
const stagePositions=[220,560,920],footY=470;
try{
 const [catalog,plan,standard]=await Promise.all([json('./catalog.json'),json('../../world/van-hai-living-world-v1/plan.json'),json(standardPath+'directions.json')]);
 const live=Object.fromEntries(standard.directions.map(item=>[item.direction,{...item,path:standardPath+item.native}]));
 for(const direction of directions)if(!live[direction]||await hashFile(live[direction].path)!==live[direction].nativeSha256)throw Error('Chuẩn live cùng hướng không khớp hash: '+direction);
 const actors=catalog.actors.map(actor=>({...actor,brief:actor.brief??plan.npcs.find(npc=>npc.id===actor.id)}));
 if(actors.length!==6||new Set(actors.map(actor=>actor.id)).size!==6||expectedIds.some(id=>!actors.some(actor=>actor.id===id))||actors.some(actor=>!actor.brief))throw Error('Cần catalog đủ sáu NPC Wave A và brief.');
 if(catalog.coverage.clips!==144||catalog.coverage.poses!==864||catalog.coverage.fullDirectionalSet!==true)throw Error('Bộ này cần đủ 144 clip / 864 pose và tám hướng thật.');
 if(catalog.artApproved!==false||catalog.runtimeImported!==false)throw Error('Catalog pilot mới cần giữ trạng thái motion đang xem hình.');
 for(const actor of actors)for(const direction of directions)for(const action of Object.keys(actionNames)){
  const clip=actor.views?.[direction]?.clips[action];
  if(!clip||clip.direction!==direction||clip.frames.length!==6||JSON.stringify(clip.canvas)!=='[96,96]'||JSON.stringify(clip.pivot)!=='[48,88]')throw Error(`Clip ${actor.name}/${action} chưa đủ hợp đồng.`);
  if(!clip.frames.every(frame=>frame.durationMs>0&&frame.w===96&&frame.h===96)||Math.abs(clip.frames.reduce((sum,frame)=>sum+frame.durationMs,0)-clip.durationMs)>.01)throw Error(`Clip ${actor.name}/${action} chưa đủ hold/rect.`);
  if(clip.loop!==(action!=='profession'))throw Error(`Loop ${actor.name}/${action} chưa đúng nhịp pilot.`);
 }
 if(!catalog.neutralApproval?.file)throw Error('Thiếu mốc duyệt neutral của nhóm sáu.');
 const approval=await json(catalog.neutralApproval.file),scopeIds=approval.scope?.actors?.map(actor=>actor.id)??[];
 if(await hashFile(catalog.neutralApproval.file)!==catalog.neutralApproval.sha256||approval.ownerApproved!==true||approval.artApproved!==true||approval.motionApproved!==false||approval.scope?.pose!=='neutral'||approval.scope?.clips!==0||approval.scope?.poses!==6||JSON.stringify(approval.scope?.directions)!=='["southeast"]'||scopeIds.length!==6||expectedIds.some(id=>!scopeIds.includes(id))||approval.pinnedFiles?.length!==45)throw Error('Mốc duyệt phải chỉ đúng sáu neutral Đông Nam theo hash.');
 const neutralCatalog=await json(neutralRoot+'catalog.json'),catalogPin=approval.pinnedFiles.find(file=>file.file==='catalog.json');
 if(await hashFile(neutralRoot+'catalog.json')!==catalogPin?.sha256)throw Error('Catalog neutral đã duyệt bị thay đổi.');
 for(const actor of actors){
  const identity=actor.identityReference,approved=neutralCatalog.actors.find(item=>item.id===actor.id);
  if(!identity||!approved||identity.sha256!==approved.spriteSha256||JSON.stringify(identity.canvas)!=='[64,96]'||JSON.stringify(identity.pivot)!=='[32,88]'||await hashFile(identity.file)!==identity.sha256)throw Error(`Nhận diện đã duyệt của ${actor.name} chưa khớp nguyên byte.`);
 }
 $('neutral-basis-status').textContent='Owner đã duyệt sáu neutral Đông Nam · 45 file nguồn được pin.';
 const pilotApprovalFile='../van-hai-npc-wave-a-motion-v1/approval.json',pilotApproval=await json(pilotApprovalFile);
 if(await hashFile(pilotApprovalFile)!=='0a3e8e5600961652f43189e4e48f5297890288d606f8857bac904bc4b4ccf300'||pilotApproval.ownerApproved!==true||pilotApproval.motionApproved!==true||pilotApproval.scope?.clips!==18||pilotApproval.scope?.poses!==108||pilotApproval.pinnedFiles?.length!==219)throw Error('Thiếu mốc duyệt motion Đông Nam nguyên byte.');
 for(const item of actors){if(item.views.southeast.artApproved!==true||directions.some(direction=>direction!=='southeast'&&item.views[direction].artApproved!==false))throw Error('Phạm vi duyệt chỉ áp motion Đông Nam.');}
 $('neutral-basis-status').textContent='Owner đã duyệt sáu neutral và 18 clip Đông Nam; bảy hướng mới đang xem hình.';
 document.body.dataset.neutralApproved='true';
 const images=new Map(),silhouettes=new Map();
 async function load(path){if(images.has(path))return images.get(path);const image=new Image();image.src=path;await image.decode();images.set(path,image);return image;}
 await Promise.all([...new Set([mapPath,...directions.map(direction=>live[direction].path),...actors.flatMap(actor=>[actor.identityReference.file,...Object.values(actor.views).flatMap(view=>[view.neutralSprite,...Object.values(view.clips).map(clip=>clip.atlas)])])])].map(load));
 for(const actor of actors){const identity=images.get(actor.identityReference.file);if(identity.naturalWidth!==64||identity.naturalHeight!==96)throw Error('Canvas nhận diện SE không đúng.');for(const view of Object.values(actor.views)){const neutral=images.get(view.neutralSprite);if(neutral.naturalWidth!==96||neutral.naturalHeight!==96)throw Error('Canvas calibration không đúng.');}}
 const params=new URLSearchParams(location.hash.slice(1));let selected=actors[0].id;if(actors.some(actor=>actor.id===params.get('actor')))selected=params.get('actor');
 const state={selected,direction:directions.includes(params.get('direction'))?params.get('direction'):'southeast',action:Object.hasOwn(actionNames,params.get('action'))?params.get('action'):'idle',zoom:1,ageMs:0,startedAt:performance.now(),speed:1,playing:false};
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');let rafId=null,motionWatcher=null,reducedMotionApplied=null,online=navigator.onLine,pageActive=true;
 const actor=()=>actors.find(item=>item.id===state.selected),view=()=>actor().views[state.direction],clip=()=>view().clips[state.action];
 function age(now=performance.now()){if(!state.playing)return state.ageMs;const elapsed=state.ageMs+Math.max(0,now-state.startedAt)*state.speed;return clip().loop?elapsed%clip().durationMs:Math.min(elapsed,clip().durationMs);}
 function frameAt(ms,item=clip()){let cursor=0;for(let index=0;index<item.frames.length;index++){cursor+=item.frames[index].durationMs;if(ms<cursor||index===item.frames.length-1)return index;}return item.frames.length-1;}
 const frameStart=(index,item=clip())=>item.frames.slice(0,index).reduce((sum,frame)=>sum+frame.durationMs,0);
 function stop(ms=age()){if(rafId!==null)cancelAnimationFrame(rafId);rafId=null;state.ageMs=ms;state.startedAt=performance.now();state.playing=false;$('play').textContent='Phát';$('play').setAttribute('aria-pressed','false');}
 function setPlaying(value){motionPreference();const ms=age();stop(ms);if(value&&!document.hidden&&online&&pageActive&&!reduceMotion.matches){state.ageMs=ms>=clip().durationMs?0:ms;state.startedAt=performance.now();state.playing=true;$('play').textContent='Dừng';$('play').setAttribute('aria-pressed','true');rafId=requestAnimationFrame(tick);}draw();}
 function seek(ms){stop();state.ageMs=Math.max(0,Math.min(clip().durationMs,ms));draw();}
 function crop(ctx,item,frame,x,y,zoom,shadow=false){
  const left=Math.round(x-item.pivot[0]*zoom),top=Math.round(y-item.pivot[1]*zoom),image=images.get(item.atlas);
  if(shadow){ctx.fillStyle='#112b2255';ctx.beginPath();ctx.ellipse(x,y,15*zoom,4*zoom,0,0,Math.PI*2);ctx.fill();}
  if($('silhouette').checked){const key=[item.atlas,frame.x,frame.y,frame.w,frame.h].join('|');if(!silhouettes.has(key)){const mask=document.createElement('canvas');mask.width=frame.w;mask.height=frame.h;const ink=mask.getContext('2d');ink.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);ink.globalCompositeOperation='source-in';ink.fillStyle='#172b29';ink.fillRect(0,0,frame.w,frame.h);silhouettes.set(key,mask);}ctx.drawImage(silhouettes.get(key),left,top,frame.w*zoom,frame.h*zoom);}
  else ctx.drawImage(image,frame.x,frame.y,frame.w,frame.h,left,top,frame.w*zoom,frame.h*zoom);
 }
 function marker(ctx,x,y,label){if($('roots').checked){ctx.strokeStyle='#c03939';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();}ctx.font='14px Segoe UI';ctx.textAlign='center';const width=ctx.measureText(label).width;ctx.fillStyle='#132922ee';ctx.fillRect(x-width/2-8,y+16,width+16,29);ctx.fillStyle='#f2e7cd';ctx.fillText(label,x,y+36);}
 function draw(now=performance.now()){
  const item=clip(),ms=age(now),index=frameAt(ms,item),frame=item.frames[index],ctx=$('stage').getContext('2d'),zoom=state.zoom,scene=$('scene').value;
  if(state.playing&&!item.loop&&ms>=item.durationMs)stop(item.durationMs);
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1120,600);
  if(scene==='map')ctx.drawImage(images.get(mapPath),1616-560/zoom,944-300/zoom,1120/zoom,600/zoom,0,0,1120,600);
  else{ctx.fillStyle=scene==='light'?'#eee7d3':'#203d34';ctx.fillRect(0,0,1120,600);ctx.strokeStyle=scene==='light'?'#d0cbb7':'#38594a';for(let x=0;x<1120;x+=32*zoom){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke();}for(let y=0;y<600;y+=32*zoom){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1120,y);ctx.stroke();}}
  ctx.fillStyle='#142c25eb';ctx.fillRect(18,17,680,62);ctx.fillStyle='#ebdbb6';ctx.font='15px Segoe UI';ctx.textAlign='left';ctx.fillText(`${zoom}× · ${directionNames[state.direction]} · ${actionNames[state.action]} · pose ${index+1}/6`,31,42);ctx.font='12px Segoe UI';ctx.fillText('Vương Lâm live, calibration và chuyển động cùng hướng, cùng mặt đất.',31,63);
  crop(ctx,{atlas:live[state.direction].path,pivot:[32,88]},{x:0,y:0,w:64,h:96},stagePositions[0],footY,zoom,$('shadows').checked);
  crop(ctx,{atlas:view().neutralSprite,pivot:[48,88]},{x:0,y:0,w:96,h:96},stagePositions[1],footY,zoom,$('shadows').checked);
  crop(ctx,item,frame,stagePositions[2],footY,zoom,$('shadows').checked);
  marker(ctx,stagePositions[0],footY,`Vương Lâm live · ${directionNames[state.direction]}`);marker(ctx,stagePositions[1],footY,`${actor().name} · calibration ${directionNames[state.direction]}`);marker(ctx,stagePositions[2],footY,`${actor().name} · ${state.action}`);
  $('seek').max=item.durationMs;$('seek').value=Math.round(ms);$('clock').value=`${Math.round(ms)} / ${Math.round(item.durationMs)} ms`;$('frame-info').textContent=`Pose ${index+1} / 6 · hold ${Math.round(frame.durationMs)}ms · ${item.loop?'clip lặp':'cử chỉ một lần, giữ pose cuối'} · tốc độ ${state.speed}×`;
  for(const button of $('frames').querySelectorAll('[data-action]'))button.setAttribute('aria-pressed',String(button.dataset.action===state.action&&Number(button.dataset.index)===index));
  document.body.dataset.frame=String(index);document.body.dataset.action=state.action;document.body.dataset.actor=state.selected;
 }
 function renderCards(){
  $('cards').innerHTML=actors.map(item=>`<button class="actor-card" data-id="${esc(item.id)}" aria-pressed="${item.id===state.selected}"><canvas width="96" height="96" aria-label="Pose idle đầu của ${esc(item.name)}"></canvas><div class="caption"><strong>${esc(item.name)}</strong><small>${esc(item.brief.role)}</small><small>8 hướng · 144 pose</small></div></button>`).join('');
  for(const button of $('cards').querySelectorAll('button')){const item=actors.find(item=>item.id===button.dataset.id),ctx=button.querySelector('canvas').getContext('2d'),frame=item.views.southeast.clips.idle.frames[0];ctx.imageSmoothingEnabled=false;ctx.drawImage(images.get(item.views.southeast.clips.idle.atlas),frame.x,frame.y,96,96,0,0,96,96);button.onclick=()=>{choose(item.id);$('playback').scrollIntoView({block:'start'});};}
 }
 function contactSheet(){
  const item=view();$('frames').innerHTML=Object.keys(actionNames).flatMap(action=>item.clips[action].frames.map((frame,index)=>`<button class="pose" data-action="${action}" data-index="${index}" aria-pressed="false"><canvas width="192" height="192" aria-label="${esc(actor().name)} ${directionNames[state.direction]} ${action} pose ${index+1}"></canvas><span>${action} ${index+1} · ${Math.round(frame.durationMs)}ms</span></button>`)).join('');
  for(const button of $('frames').querySelectorAll('button')){const action=button.dataset.action,index=Number(button.dataset.index),motion=item.clips[action],frame=motion.frames[index],ctx=button.querySelector('canvas').getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(images.get(motion.atlas),frame.x,frame.y,96,96,0,0,192,192);button.onclick=()=>{changeAction(action);seek(frameStart(index));};}
 }
 function identityPair(){const ctx=$('identity-pair').getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,400,192);ctx.drawImage(images.get(actor().identityReference.file),36,0,128,192);ctx.drawImage(images.get(view().neutralSprite),204,0,192,192);}
 function detail(){
  const item=actor(),current=view(),n=item.brief,notes=Array.isArray(current.visualLimitations)?current.visualLimitations:(Array.isArray(item.visualLimitations)?item.visualLimitations:[]);
  $('detail').innerHTML=`<h3>${esc(item.name)}</h3><div class="meta">${esc(n.role)} · ${esc(n.zone)}</div><div class="grid"><div><p><b>Nhận diện đã chốt:</b> ${esc(n.look)}</p><p><b>Tính cách:</b> ${esc(n.personality)}</p><blockquote>${esc(n.quote)}</blockquote></div><div><p><b>Vai trò:</b> ${esc(n.task)}</p><p><b>Brief dáng và nghề:</b> ${esc(n.brief)}</p>${n.ambientLoop?`<p><b>Sinh hoạt GDD:</b> ${esc(n.ambientLoop.join(' → '))}. ${esc(n.loopScope)}</p>`:''}${item.gestureSummary?`<p><b>Cử chỉ trong pilot:</b> ${esc(item.gestureSummary)}</p>`:''}</div></div>${notes.length?`<div class="limitations"><b>Điểm cần xem kỹ qua motion:</b><ul>${notes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></div>`:''}<p class="meta">18 pose thật · ${directionNames[state.direction]} · canvas96×96 / chân(48,88) là padding quanh người. Một scale từ neutral của nguồn áp cho cả ba action; xem trực tiếp với neutral đã duyệt và Vương Lâm live.</p><div class="detail-links"><a href="${esc(item.identityReference.file)}">Nhận diện neutral Đông Nam đã duyệt</a><a href="${esc(current.neutralSprite)}">Calibration nguồn motion</a>${current.source?`<a href="${esc(current.source)}">Nguồn motion</a>`:''}${current.prompt?`<a href="${esc(current.prompt)}">Prompt</a>`:''}<a href="catalog.json">Atlas / hold</a><a href="registration.json">Đo chân / scale</a></div>`;
 }
 function updateHash(){history.replaceState(null,'',`#actor=${encodeURIComponent(state.selected)}&direction=${state.direction}&action=${state.action}`);}
 function choose(id){stop();state.selected=id;state.ageMs=0;$('actor').value=id;updateHash();renderCards();directionMatrix();contactSheet();identityPair();detail();draw();}
 function changeDirection(direction){stop();state.direction=direction;state.ageMs=0;$('direction').value=direction;updateHash();directionMatrix();contactSheet();identityPair();detail();draw();}
 function directionMatrix(){
  $('direction-matrix').innerHTML=directions.map(direction=>'<button class="direction-card" data-direction="'+direction+'" aria-pressed="'+(direction===state.direction)+'"><canvas width="352" height="192" aria-label="'+esc(actor().name)+' đối chiếu Vương Lâm cùng hướng '+directionNames[direction]+' ở 2×"></canvas><span>'+directionNames[direction]+' · '+(actor().views[direction].artApproved?'Đông Nam đã duyệt':'18 pose mới')+'</span></button>').join('');
  for(const button of $('direction-matrix').querySelectorAll('button')){const direction=button.dataset.direction,ctx=button.querySelector('canvas').getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(images.get(live[direction].path),16,0,128,192);ctx.drawImage(images.get(actor().views[direction].neutralSprite),160,0,192,192);button.onclick=()=>{changeDirection(direction);$('playback').scrollIntoView({block:'start'});};}
 }
 function changeAction(action){stop();state.action=action;state.ageMs=0;$('action').value=action;updateHash();draw();}
 $('actor').innerHTML=actors.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');$('actor').disabled=false;$('action').value=state.action;$('direction').innerHTML=directions.map(direction=>'<option value="'+direction+'">'+directionNames[direction]+'</option>').join('');$('direction').value=state.direction;$('direction').onchange=()=>changeDirection($('direction').value);
 $('actor').onchange=()=>choose($('actor').value);$('action').onchange=()=>changeAction($('action').value);$('play').onclick=()=>setPlaying(!state.playing);$('reset').onclick=()=>seek(0);$('seek').oninput=()=>seek(Number($('seek').value));$('previous').onclick=()=>seek(frameStart(Math.max(0,frameAt(age())-1)));$('next').onclick=()=>seek(frameStart(Math.min(5,frameAt(age())+1)));
 $('speed').onchange=()=>{state.ageMs=age();state.startedAt=performance.now();state.speed=Number($('speed').value);draw();};
 for(const button of document.querySelectorAll('[data-zoom]'))button.onclick=()=>{state.zoom=Number(button.dataset.zoom);for(const other of document.querySelectorAll('[data-zoom]'))other.setAttribute('aria-pressed',String(other===button));draw();};
 for(const id of ['scene','roots','shadows','silhouette'])$(id).onchange=()=>draw();
 function stopMotionWatcher(){if(motionWatcher!==null)clearInterval(motionWatcher);motionWatcher=null;}
 function syncMotionWatcher(){const watch=reducedMotionApplied===true&&!state.playing&&!document.hidden&&online&&pageActive;if(watch&&motionWatcher===null)motionWatcher=setInterval(motionPreference,250);else if(!watch)stopMotionWatcher();}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopMotionWatcher();draw();}else motionPreference();});window.addEventListener('offline',()=>{online=false;stop();stopMotionWatcher();draw();});window.addEventListener('online',()=>{online=true;motionPreference();});window.addEventListener('focus',()=>motionPreference());window.addEventListener('pagehide',()=>{pageActive=false;stop();stopMotionWatcher();});window.addEventListener('pageshow',()=>{pageActive=true;motionPreference();});
 function motionPreference(event){
  const reduced=typeof event?.matches==='boolean'?event.matches:reduceMotion.matches;
  const changed=reduced!==reducedMotionApplied;
  if(changed){reducedMotionApplied=reduced;if(reduced)stop();$('play').disabled=reduced;$('motion-preference').hidden=!reduced;}
  // Reconcile the getter when an engine delays or omits its media change event.
  // Only the reduced, paused mode needs this watcher; it redraws on transitions.
  syncMotionWatcher();
  if(changed)draw();
 }
 reduceMotion.addEventListener('change',motionPreference);
 window.__npcMotionReview=()=>{const ms=age(),item=clip(),index=frameAt(ms,item);return{actor:state.selected,action:state.action,zoom:state.zoom,playing:state.playing,timeMs:ms,durationMs:item.durationMs,loop:item.loop,speed:state.speed,frameIndex:index,frameRect:item.frames[index],atlas:item.atlas,direction:state.direction,primaryPath:live[state.direction].path,primaryHash:live[state.direction].nativeSha256,identityReference:actor().identityReference,neutralSprite:view().neutralSprite,viewArtApproved:view().artApproved,available:true,positions:stagePositions.map(x=>[x,footY]),neutralApproved:true,motionArtApproved:false,reducedMotion:reduceMotion.matches,scheduled:rafId!==null,mediaWatcherActive:motionWatcher!==null,online,pageActive};};
 function tick(now){rafId=null;motionPreference();if(!state.playing)return;draw(now);if(state.playing)rafId=requestAnimationFrame(tick);}
 $('coverage-counts').innerHTML='<span>6 NPC</span><span>144 clip / 864 pose</span><span>8 hướng thật</span><span>Đông Nam đã duyệt</span><span>7 hướng mới chờ xem hình</span><span>Chưa tích hợp game</span>';
 choose(state.selected);motionPreference();$('status').hidden=true;document.body.dataset.ready='true';
}catch(error){$('status').textContent=`Bản xem chưa sẵn sàng: ${error.message}`;document.body.dataset.ready='error';console.error(error);}
