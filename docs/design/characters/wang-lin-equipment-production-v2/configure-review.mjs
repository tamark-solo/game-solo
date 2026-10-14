import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
try{await fs.access(path.join(root,'approval.json'));throw Error('Approved V2 is immutable');}catch(e){if(e.code!=='ENOENT')throw e;}
let html=await fs.readFile(path.join(root,'index.html'),'utf8');
if(!html.includes('href="v2.css"'))html=html.replace('</head>','<link rel="stylesheet" href="v2.css"></head>');
html=html.replace('Sản xuất đầu tiên','Tám hướng / Bốn đạo đồ').replaceAll('PRODUCTION 01','PRODUCTION 02');
html=html.replace('Tạo hình sản xuất tách thân và pháp bảo. Sân cơ chế kiểm tám chiêu, vùng tác động và từng mục tiêu trước khi nối gameplay.','Tám hướng thật cho mỗi nhân vật và bộ áo. Tách thân, trang bị và FX; xem cùng tuổi chuyển động và thử đơn mục tiêu/AOE của bốn họ.');
html=html.replace('Nguồn sản xuất mới là candidate. Concept đã duyệt được giữ theo hash.','Pilot đã được duyệt và giữ nguyên theo hash. Artwork mở rộng được review trong gói mới.');
const dirs={north:'Bắc',northeast:'Đông Bắc',east:'Đông',southeast:'Đông Nam',south:'Nam',southwest:'Tây Nam',west:'Tây',northwest:'Tây Bắc'};
const options=Object.entries(dirs).map(([id,name])=>`<option value="${id}"${id==='southeast'?' selected':''}>${name}</option>`).join('');
if(!html.includes('id="field-direction"'))html=html.replace('<label>Zoom FX<select id="proto-zoom">',`<label>Hướng nhân vật<select id="field-direction">${options}</select></label><label>Zoom FX<select id="proto-zoom">`);
if(!html.includes('id="family-progress"'))html=html.replace('<div id="load-note"', '<section class="section"><div class="section-heading"><div><p class="eyebrow">P4 → P5 / TIẾN ĐỘ THẬT</p><h2>Kiếm → Phiên → Xa → Châu.</h2></div><p>Mỗi họ: hai nhân vật × tám hướng × tám action. Chọn một ô đã đóng gói để xem.</p></div><div id="family-progress" class="family-progress"></div></section><div id="load-note"');
if(!html.includes('id="direction-grid"'))html=html.replace('<section class="section documents">', '<section class="section"><div class="section-heading"><div><p class="eyebrow">ĐỐI CHIẾU / CÙNG ACTION</p><h2>Tám hướng cùng một nhịp.</h2></div><p>Các ô dùng frame thật từ nguồn cùng nhân vật, cùng bộ áo. Chưa sản xuất sẽ hiện thiếu; không mirror hoặc thay bằng Vương Lâm.</p></div><div id="direction-grid" class="direction-grid"></div></section><section class="section documents">');
await fs.writeFile(path.join(root,'index.html'),html);
console.log('V2 selectors and true-coverage panels configured');
