const [manifest,plan,story]=await Promise.all([fetch('view-masters.json').then(r=>r.json()),fetch('../production-plan.json').then(r=>r.json()),fetch('../view-masters/story-views.json').then(r=>r.json())]);
const $=id=>document.getElementById(id),order=['north','northeast','east','southeast','south','southwest','west','northwest'],labels={north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam',south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc'},cache=new Map(),actorIds=[...new Set(manifest.records.map(v=>v.actorId))];
const route=new URLSearchParams(location.hash.slice(1)),state={actor:actorIds.includes(route.get('actor'))?route.get('actor'):actorIds[0],direction:order.includes(route.get('direction'))?route.get('direction'):'southeast',zoom:2,background:'dark'};let token=0;
async function img(file){if(!cache.has(file))cache.set(file,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=file;}));return cache.get(file);}
async function render(){const request=++token,record=manifest.records.find(v=>v.actorId===state.actor&&v.direction===state.direction),actor=plan.actors.find(a=>a.id===state.actor),wang=story.wangReferences.find(v=>v.direction===state.direction),z=state.zoom;
 const [master,reference,own]=await Promise.all([img('../../gdd-character-concepts-v1/'+actor.file),img('../../van-hai-npc-visual-standard-v1/'+wang.native),img('../'+record.file)]);if(request!==token)return;
 const canvas=$('view-canvas');canvas.width=768*z;canvas.height=240*z;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);if(state.background==='light'){c.fillStyle='#ddd9cf';c.fillRect(0,0,canvas.width,canvas.height);}$('view-viewport').classList.toggle('light',state.background==='light');
 for(const [image,pivot,x]of [[master,actor.pivot,128],[reference,wang.pivot,384],[own,record.pivot,640]]){c.drawImage(image,(x-pivot[0])*z,(208-pivot[1])*z,image.width*z,image.height*z);c.strokeStyle='#62818c';c.beginPath();c.moveTo((x-118)*z,208*z+.5);c.lineTo((x+118)*z,208*z+.5);c.stroke();}
 $('view-title').textContent=actor.name+' / '+labels[state.direction];$('view-coverage').textContent='8 / 8 hướng đứng · thân '+actor.bodyNominalPx+'px';$('view-note').textContent=record.alphaPolicy==='preserved-soft-RGBA'?'Linh thể không có giày/chân chạm đất. Giữ alpha vạt áo; điểm chiếu ước lượng, sai số 3 px.':'Canvas chỉ thêm khoảng trống. Điểm chân đo theo nguồn vẫn là candidate cần xem cùng chuyển động.';$('view-source').href='../'+record.raw;$('view-native').href='../'+record.file;$('view-animation').href='../index.html#actor='+encodeURIComponent(state.actor)+'&action=idle&direction='+state.direction;
 document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.direction===state.direction)));document.querySelectorAll('[data-thumb]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.thumb===state.direction)));
 $('view-legend').style.width=canvas.width+'px';$('view-viewport').scrollLeft=Math.max(0,640*z-$('view-viewport').clientWidth/2);
 window.__enemyViews={state:{...state},manifest,record,neutralOnly:true,animationClips:0};document.body.dataset.ready='true';
}
async function thumbnails(){
 const request=state.actor,loads=[];$('view-strip').replaceChildren();
 for(const direction of order){
  const record=manifest.records.find(v=>v.actorId===request&&v.direction===direction),b=document.createElement('button'),canvas=document.createElement('canvas'),span=document.createElement('span');
  canvas.width=record.canvas[0];canvas.height=record.canvas[1];b.dataset.thumb=direction;span.textContent=labels[direction];b.append(canvas,span);b.onclick=()=>{state.direction=direction;render();};$('view-strip').append(b);
  loads.push(img('../'+record.file).then(image=>{if(request===state.actor)canvas.getContext('2d').drawImage(image,0,0);}));
 }
 await Promise.all(loads);
}
$('view-count').textContent=manifest.records.length+' hướng đứng thật / '+actorIds.length+' tạo hình · chưa suy thành animation.';
for(const id of actorIds)$('view-actor').append(new Option(plan.actors.find(a=>a.id===id).name,id));$('view-actor').value=state.actor;$('view-actor').onchange=()=>{state.actor=$('view-actor').value;thumbnails();render();};
for(const direction of ['northwest','north','northeast','west',null,'east','southwest','south','southeast']){if(!direction){$('view-directions').append(document.createElement('span'));continue;}const b=document.createElement('button');b.dataset.direction=direction;b.textContent=labels[direction];b.onclick=()=>{state.direction=direction;render();};$('view-directions').append(b);}
$('view-zoom').onchange=()=>{state.zoom=Number($('view-zoom').value);render();};$('view-background').onchange=()=>{state.background=$('view-background').value;render();};await thumbnails();await render();
