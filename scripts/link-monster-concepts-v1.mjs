import fs from 'node:fs';
const root='docs/design/characters/van-hai-monster-concepts-v1';
const planFile='docs/design/world/van-hai-living-world-v1/plan.json';
const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
const art=JSON.parse(fs.readFileSync(root+'/production.json','utf8'));
for(const actor of art.actors){
 const enemy=plan.enemies.find(e=>e.id===actor.id);
 if(!enemy||enemy.rank==='boss')throw Error('Concept selector outside mob/elite roster');
 enemy.status='concept-art-candidate';
 enemy.concept={package:root+'/production.json',sprite:root+'/'+actor.sprite,raw:root+'/'+actor.raw,
   prompt:root+'/'+actor.prompt,review:root+'/index.html#actor='+actor.id,
   directions:['southeast'],poses:1,animationProduced:false,artApproved:false,
   measuredBodyHeightPx:actor.measuredBodyHeightPx,canvas:actor.canvas,pivot:actor.pivot,liftPx:actor.liftPx};
}
plan.monsterConceptProduction={package:root+'/production.json',review:root+'/index.html',
  mobs:8,elites:3,viewsPerActor:1,posesPerActor:1,artApproved:false,runtimeImplemented:false,
  order:'Owner13/10: produce mob/elite identities before NPC/boss ART; eight-direction animation follows visual review.'};
fs.writeFileSync(planFile,JSON.stringify(plan,null,2)+'\n');
const reviewFile='docs/design/world/van-hai-living-world-v1/index.html';
let html=fs.readFileSync(reviewFile,'utf8');
html=html.replace('Đây là bản để duyệt nội dung và giao brief concept.','Quái và tinh anh nay có tạo hình concept; NPC và boss giữ brief để triển khai tiếp.');
html=html.replace('Đề xuất thiết kế · tạo hình chưa sản xuất · không thay map hoặc gameplay','Thiết kế + 11 concept quái/tinh anh · chờ duyệt hình');
if(!html.includes('Xem 11 tạo hình quái/tinh anh'))html=html.replace('<nav aria-label="Bộ nội dung">','<p><a href="../../characters/van-hai-monster-concepts-v1/index.html" style="color:#e0c08a">Xem 11 tạo hình quái/tinh anh và tỷ lệ trên map →</a></p><nav aria-label="Bộ nội dung">');
html=html.replace('<span class="tag pending">Brief concept · chờ duyệt</span>','<span class="tag pending">${n.concept?\'Art concept · chờ duyệt hình\':\'Brief concept · chờ duyệt\'}</span>');
html=html.replace(" }else{html+=`<div class=\"quote\">", " }else{if(n.concept){const c=n.concept,slug=c.sprite.split('/').pop();html+=`<div style=\"display:flex;align-items:center;justify-content:center;background:#d1d3bd;border:1px solid #a7ad91;border-radius:6px;margin:20px 0;overflow:hidden\"><img src=\"../../characters/van-hai-monster-concepts-v1/sprites/${esc(slug)}\" alt=\"Concept ${esc(n.name)}\" width=\"${c.canvas[0]*3}\" height=\"${c.canvas[1]*3}\" style=\"image-rendering:pixelated;max-width:100%;object-fit:contain\"></div><p class=\"map-note\">Một pose Đông Nam · body đo ${c.measuredBodyHeightPx}px · chưa phải bộ animation. <a href=\"../../characters/van-hai-monster-concepts-v1/index.html#actor=${esc(n.id)}\">Đối chiếu với Vương Lâm / camera 1× →</a></p>`;}html+=`<div class=\"quote\">");
fs.writeFileSync(reviewFile,html);
console.log('Linked eleven candidate ART records to the existing design roster; runtime and approval flags remain false.');
