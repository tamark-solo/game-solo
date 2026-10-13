// Review-only link: leaves the pinned authored plan/catalog and runtime intact.
import {readFile, writeFile} from 'node:fs/promises';
const file='docs/design/world/van-hai-living-world-v1/index.html';
let html=await readFile(file,'utf8');
const insert="const bossPack=await fetch('../../characters/van-hai-boss-concepts-v1/production.json').then(r=>{if(!r.ok)throw Error('Không đọc được boss concept');return r.json()});\nconst bossConcepts=new Map(bossPack.actors.map(a=>[a.id,a]));\n";
if(html.includes('const bossConcepts='))throw Error('Boss review already linked; inspect before editing.');
const anchor="const $=id=>document.getElementById(id),esc=";
if(!html.includes(anchor))throw Error('Review script anchor missing');
html=html.replace(anchor,insert+anchor);
html=html.replace("${n.concept?'Art concept · chờ duyệt hình':'Brief concept · chờ duyệt'}","${n.concept||bossConcepts.has(n.id)?'Art concept · chờ duyệt hình':'Brief concept · chờ duyệt'}");
const branch=' }else{if(n.concept){';
const newBranch=' }else{if(bossConcepts.has(n.id)){const a=bossConcepts.get(n.id);html+=`<div style="overflow-x:auto;background:#d1d3bd;border:1px solid #a7ad91;border-radius:6px;margin:20px 0"><img src="../../characters/van-hai-boss-concepts-v1/${esc(a.sprite)}" alt="Concept ${esc(n.name)}" width="${a.canvas[0]*2}" height="${a.canvas[1]*2}" style="image-rendering:pixelated;display:block;max-width:none;margin:auto"></div><p class="map-note">Art concept · một neutral Đông Nam · thân đo ${a.measuredBodyHeightPx}px · VFX tách riêng, chưa animation/live. <a href="../../characters/van-hai-boss-concepts-v1/index.html#actor=${esc(n.id)}">So với Vương Lâm và cùng họ ở camera1× →</a></p>`;}if(n.concept){';
if(!html.includes(branch))throw Error('Enemy detail branch missing');
html=html.replace(branch,newBranch);
html=html.replace('Quái và tinh anh nay có tạo hình concept; NPC và boss giữ brief để triển khai tiếp.','Quái, tinh anh và bốn boss nay có tạo hình concept; NPC giữ brief để triển khai tiếp.');
html=html.replace('Thiết kế + 11 concept quái/tinh anh · chờ duyệt hình','Thiết kế + 11 concept quái/tinh anh + 4 boss · chờ duyệt hình');
html=html.replace('</p><nav aria-label="Bộ nội dung">','</p><p><a href="../../characters/van-hai-boss-concepts-v1/index.html" style="color:#e0c08a">Xem bốn boss và tỷ lệ cùng họ →</a></p><nav aria-label="Bộ nội dung">');
await writeFile(file,html,'utf8');
console.log('Linked four boss concepts into the world review; plan/catalog unchanged.');
