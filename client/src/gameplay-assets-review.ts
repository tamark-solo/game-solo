import './gameplay-assets-review.css';
import { previewRecipe, type PreviewBag, type PreviewItemDefinition, type PreviewIssue, type PreviewRecipe } from './gameplay-recipe-preview';

interface ArtFile{url:string;width:number;height:number}
interface Asset{id:string;itemId:string|null;label:string;stage:string;state:string|null;assetType:'icon'|'prop';files:ArtFile[];pivot:{x:number;y:number}|null}
type Recipe=PreviewRecipe;
interface Manifest{assets:Asset[];recipes:Recipe[];itemDefinitions:PreviewItemDefinition[];sources:{id:string;condition:string;grant:Record<string,number>}[];existingItems:{id:string;name:string;url:string}[];character:{url:string;frame:number[];anchor:number[]}}
const root=document.querySelector<HTMLElement>('#gameplay-art')!;
const safe=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const stages:Record<string,string>={VP0:'HN05 · nhập môn',VP1:'HN08 · hộ thân',VP2:'Sau HN12 · chuẩn bị',VP3:'EX04 · khảo sát',hub:'Sân luyện Hằng Nhạc','hub-and-VP2':'Điểm chuẩn bị'};
const labels:Record<string,string>={'hn-refine-training-jade':'Luyện hóa ngọc hộ thân','vh-recipe-ink':'Pha mực dẫn khí','vh-recipe-recovery':'Chế vật tư hồi phục','vh-recipe-case':'Chế hộp giữ khí','vh-recipe-compass':'Chế Định Lưu Bàn','vh-recipe-seal':'Niêm hộp cho một chuyến'};
const unlocks:Record<string,string>={'HN08-accepted':'Đã nhận HN08','hn-guard-method':'Đã nhận biết phương pháp hộ thân','EX01-completed':'Hoàn tất EX01','EX02-completed':'Hoàn tất EX02','EX03-completed':'Hoàn tất EX03','EX03-accepted':'Đã nhận EX03','trip-not-started':'Chuyến chưa bắt đầu'};
const sources:Record<string,string>={'hn-refining-material':'HN05 +3, HN06 +3 · luyện hóa tiêu 4; 2 còn lại chưa có công thức tiếp.','hn-training-jade':'Nhận phôi một lần ở HN08; luyện hóa đổi trạng thái của cùng một món.','vh-clean-herb':'EX01 · sơ chế dược liệu tại điểm được phép.','vh-clear-water':'EX01 · lấy mẫu và lọc linh tuyền.','vh-soft-fiber':'EX02 · sơ chế ở điểm chuẩn bị.','vh-conductive-sand':'EX01 / EX02 · lấy mẫu dẫn khí hợp lệ.','vh-stable-jade':'EX02 · khảo sát và sơ chế ngọc.','vh-guiding-ink':'Pha từ cát dẫn khí và linh tuyền; dùng niêm hộp.','vh-sealed-case':'Chế tại điểm chuẩn bị; giữ lại hộp sau chuyến.','vh-flow-compass':'Chế sau EX03; hỗ trợ đọc dấu khảo sát ở EX04.'};
let m:Manifest;
function art(id:string,state?:string){return m.assets.find(a=>a.itemId===id&&(!state||a.state===state))??m.existingItems.find(a=>a.id===id);}
function item(id:string,count:number,state?:string){const a=art(id,state);if(!a)throw new Error('Thiếu hình cho công thức');const url='files'in a?a.files.find(f=>f.width===48)!.url:a.url,name='label'in a?a.label:a.name;return `<span class="formula-item"><img src="${safe(url)}" width="48" height="48" alt=""><span><b>${safe(name)}</b><small>${count} ${id==='hn-training-jade'?'món':'đơn vị'}</small></span></span>`;}
function recipe(r:Recipe){
 const inputs=Object.entries(r.consume).map(([id,n])=>item(id,n)).join('<span class="operator" aria-hidden="true">+</span>');
 let output=Object.entries(r.produce).map(([id,n])=>item(id,n)).join('');
 if(r.transform)output=item(r.transform.item,1,r.transform.to);
 if(r.effect)output='<span class="seal-result"><b>Hộp được niêm cho một chuyến</b><small>Giữ nguyên hộp · không tạo món thứ hai</small></span>';
 const keep=Object.entries(r.keep).map(([id,n])=>item(id,n,r.transform?.from)).join('');
 const note=r.transform?'Phôi → ngọc luyện tập, giữ nguyên một món. Thử hộ thân chưa đạt vẫn giữ ngọc đã luyện hóa.':r.effect?'Hủy trước khi khởi hành: hoàn mực đúng một lần và gỡ niêm. Đã khởi hành: không hoàn; kết thúc chuyến gỡ niêm, giữ hộp.':r.id==='vh-recipe-recovery'?'Thêm 1 vật tư vào nguồn hiện có. Hồi 30 HP, cooldown 10 giây; giữ luật cấm dùng hiện hành.':r.id==='vh-recipe-case'?'Công cụ mang mẫu, dùng lại sau chuyến; không tăng số ô hành trang.':r.id==='vh-recipe-compass'?'Hỗ trợ đọc dấu tại điểm khảo sát; cách quan sát thủ công vẫn hoàn tất được.':'Một mực dẫn khí cho bước niêm hộp.';
 return `<article class="recipe-card" data-stage="${r.stage}"><div class="card-heading"><span>${stages[r.stage]}</span><h3>${labels[r.id]}</h3></div><div class="formula">${inputs}<span class="operator" aria-label="cho kết quả">→</span>${output}</div>${keep?`<div class="keep"><span>${r.transform?'Phôi giữ lại để chuyển trạng thái':'Công cụ giữ lại'}</span>${keep}</div>`:''}<p class="recipe-note">${note}</p><p class="unlock">${r.requires.map(k=>unlocks[k]??k).map(safe).join(' · ')}</p><button type="button" class="try-recipe" data-recipe="${r.id}">Thử công thức →</button></article>`;
}

function itemName(id:string){return m.itemDefinitions.find(item=>item.id===id)?.name??id;}
function icon(id:string,state?:string){const a=art(id,state);if(!a)return '';const url='files'in a?a.files.find(f=>f.width===32)!.url:a.url;return `<img src="${safe(url)}" width="32" height="32" alt="">`;}
function issueText(issue:PreviewIssue){
 switch(issue.kind){
  case 'missing':return `Thiếu ${issue.quantity} ${itemName(issue.item)}.`;
  case 'locked':return `Cần: ${unlocks[issue.requirement]??issue.requirement}.`;
  case 'state':return `${itemName(issue.item)} cần ở trạng thái phôi chưa luyện hóa.`;
  case 'capacity':return `Chỉ giữ tối đa ${issue.limit} ${itemName(issue.item)}; mẫu này đã có món đó.`;
  case 'invalid-quantity':return `Số lượng ${itemName(issue.item)} phải là số nguyên không âm trong giới hạn tính toán.`;
  case 'already-sealed':return 'Hộp đã được niêm cho chuyến này; không tiêu thêm mực.';
 }
}

function setupWorkbench(){
 const select=root.querySelector<HTMLSelectElement>('#preview-recipe')!;
 const fields=root.querySelector<HTMLElement>('#preview-inputs')!;
 const result=root.querySelector<HTMLElement>('#preview-result')!;
 const preset=root.querySelector<HTMLButtonElement>('#preview-enough')!;
 const sourcePreset=root.querySelector<HTMLButtonElement>('#preview-hn-source')!;
 const clear=root.querySelector<HTMLButtonElement>('#preview-clear')!;
 let current=m.recipes[0];
 let ids:string[]=[];

 function readBag():PreviewBag{
  const quantities=Object.fromEntries([...fields.querySelectorAll<HTMLInputElement>('input[data-quantity]')].map(input=>[input.dataset.quantity!,input.value===''?0:input.valueAsNumber]));
  const state=fields.querySelector<HTMLSelectElement>('#preview-jade-state');
  return {quantities,states:state?{'hn-training-jade':state.value}:{},unlocked:[...fields.querySelectorAll<HTMLInputElement>('input[data-requirement]:checked')].map(input=>input.dataset.requirement!),sealed:fields.querySelector<HTMLInputElement>('#preview-sealed')?.checked??false};
 }
 function update(){
  const bag=readBag(),calculation=previewRecipe(current,bag,m.itemDefinitions);
  result.dataset.ready=String(calculation.ready);
  if(!calculation.after){
   result.innerHTML=`<h4>Chưa đủ điều kiện</h4><ul>${calculation.issues.map(issue=>`<li>${safe(issueText(issue))}</li>`).join('')}</ul><p>Nguyên liệu và công cụ trong mẫu được giữ nguyên.</p>`;
   return;
  }
  const after=calculation.after;
  result.innerHTML=`<h4>Đủ điều kiện theo mẫu thử</h4><div class="preview-table-scroll"><table><caption>Kết quả dự kiến cho một lần thực hiện</caption><thead><tr><th>Vật phẩm</th><th>Có</th><th>Tiêu</th><th title="Còn lại hoặc nhận được">Sau</th></tr></thead><tbody>${ids.map(id=>`<tr data-result-item="${safe(id)}"><th>${icon(id,after.states[id])}<span>${safe(itemName(id))}${after.states[id]==='refined'?'<small>Đã luyện hóa · cùng một món</small>':''}${current.keep[id]&&id!=='hn-training-jade'?'<small>Công cụ được giữ lại</small>':''}</span></th><td>${bag.quantities[id]??0}</td><td>${current.consume[id]??0}</td><td data-after="${after.quantities[id]??0}">${after.quantities[id]??0}</td></tr>`).join('')}</tbody></table></div>${current.effect?'<p class="preview-effect">Hộp được niêm cho một chuyến, giữ nguyên món hiện có. Hủy trước khởi hành hoàn mực một lần; đã khởi hành không hoàn.</p>':''}${current.id==='vh-recipe-recovery'?'<p class="preview-effect">Số vật tư này thuộc nguồn hồi phục đang dùng; mỗi lần sử dụng hồi 30 HP, cách nhau 10 giây.</p>':''}<p>Số lượng trong mẫu không thay đổi. Đây là kết quả dự kiến, chưa thực hiện luyện chế trong game.</p>`;
 }
 function choose(id:string){
  current=m.recipes.find(recipe=>recipe.id===id)!;select.value=id;
  ids=[...new Set([...Object.keys(current.consume),...Object.keys(current.keep),...Object.keys(current.produce)])];
  fields.innerHTML=`<fieldset class="preview-quantities"><legend>Số lượng trong túi mẫu</legend>${ids.map(id=>`<label class="quantity-row">${icon(id,current.transform?.item===id?current.transform.from:undefined)}<span>${safe(itemName(id))}<small>${current.consume[id]?`Tiêu ${current.consume[id]}`:current.keep[id]?`Giữ ${current.keep[id]}`:'Kết quả nhận thêm'}${current.produce[id]?` · nhận ${current.produce[id]}`:''}</small></span><input type="number" min="0" step="1" max="${Number.MAX_SAFE_INTEGER}" value="0" data-quantity="${safe(id)}" aria-label="Số lượng ${safe(itemName(id))}"></label>`).join('')}${current.transform?'<label class="preview-state">Trạng thái ngọc<select id="preview-jade-state"><option value="raw">Phôi chưa luyện hóa</option><option value="refined">Đã luyện hóa</option></select></label>':''}</fieldset><fieldset class="preview-progress"><legend>Giả định tiến trình</legend>${current.requires.map(key=>`<label><input type="checkbox" data-requirement="${safe(key)}"><span>${safe(unlocks[key]??key)}</span></label>`).join('')}${current.effect?'<label><input type="checkbox" id="preview-sealed"><span>Hộp đã niêm cho chuyến này</span></label>':''}</fieldset>`;
  sourcePreset.hidden=id!=='hn-refine-training-jade';update();
 }
 select.addEventListener('change',()=>choose(select.value));
 fields.addEventListener('input',update);fields.addEventListener('change',update);fields.addEventListener('submit',event=>event.preventDefault());
 preset.addEventListener('click',()=>{
  fields.querySelectorAll<HTMLInputElement>('input[data-quantity]').forEach(input=>input.value=String((current.consume[input.dataset.quantity!]??0)+(current.keep[input.dataset.quantity!]??0)));
  fields.querySelectorAll<HTMLInputElement>('input[data-requirement]').forEach(input=>input.checked=true);
  const state=fields.querySelector<HTMLSelectElement>('#preview-jade-state');if(state)state.value='raw';
  const sealed=fields.querySelector<HTMLInputElement>('#preview-sealed');if(sealed)sealed.checked=false;
  update();
 });
 sourcePreset.addEventListener('click',()=>{
  const sources=m.sources.filter(source=>['hn05-first','hn06-first','hn08-first-blank'].includes(source.id));
  fields.querySelectorAll<HTMLInputElement>('input[data-quantity]').forEach(input=>input.value=String(sources.reduce((quantity,source)=>quantity+(source.grant[input.dataset.quantity!]??0),0)));
  fields.querySelectorAll<HTMLInputElement>('input[data-requirement]').forEach(input=>input.checked=sources.some(source=>source.condition===input.dataset.requirement));
  fields.querySelector<HTMLSelectElement>('#preview-jade-state')!.value='raw';update();
 });
 clear.addEventListener('click',()=>choose(current.id));
 root.querySelectorAll<HTMLButtonElement>('.try-recipe').forEach(button=>button.addEventListener('click',()=>{
  choose(button.dataset.recipe!);root.querySelector('#recipe-workbench')!.scrollIntoView({block:'start'});select.focus({preventScroll:true});
 }));
 choose(current.id);
}
async function propCanvas(canvas:HTMLCanvasElement,asset:Asset){
 const images=await Promise.all(['/assets/van-ngoc-gameplay-v1/map-crop.png',asset.files[0].url,m.character.url].map(url=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;})));
 const [backdrop,prop,actor]=images;const context=canvas.getContext('2d')!;context.imageSmoothingEnabled=false;
 const draw=(position:string)=>{context.clearRect(0,0,600,240);context.drawImage(backdrop,0,0);const p={x:230,y:168},a=position==='behind'?{x:230,y:148}:position==='left'?{x:112,y:168}:position==='right'?{x:355,y:168}:{x:230,y:188};
  const objects=[{y:p.y,draw:()=>context.drawImage(prop,p.x-asset.pivot!.x,p.y-asset.pivot!.y)},{y:a.y,draw:()=>context.drawImage(actor,a.x-32,a.y-88)}];objects.sort((l,r)=>l.y-r.y).forEach(o=>o.draw());canvas.dataset.position=position;canvas.dataset.ready='true';
 };
 draw('front');const card=canvas.closest<HTMLElement>('.prop-card')!;card.querySelector('select')!.addEventListener('change',event=>draw((event.target as HTMLSelectElement).value));
}
async function start(){
 const response=await fetch('/assets/van-ngoc-gameplay-v1/review.json');if(!response.ok)throw new Error('Chưa nạp được bộ vật phẩm');m=await response.json();
 root.innerHTML=`<header class="hero"><p class="eyebrow">VÂN HẢI ĐẠO ĐỒ · THƯ VIỆN GAMEPLAY</p><h1>Vật phẩm & luyện chế</h1><p>Nguyên liệu, công cụ và đạo cụ theo GDD, cùng nét ngọc–teal–đồng của map Vân Ngọc.</p><div class="hero-meta"><span>11 trạng thái icon</span><span>3 đạo cụ</span><span>6 công thức</span><span>Chờ duyệt hình</span></div><nav><a href="#items">Vật phẩm</a><a href="#recipes">Công thức</a><a href="#props">Đạo cụ</a><a href="/hang-nhac.html?mapArt=van-ngoc-detail">Vào Hằng Nhạc ↗</a></nav></header><section id="items"><div class="section-heading"><div><p class="eyebrow">NGUỒN → CHUẨN BỊ → VẬN DỤNG</p><h2>Nguyên liệu & công cụ</h2></div><div class="controls"><label>Chặng <select id="stage-filter"><option value="all">Tất cả</option><option value="VP0">HN05</option><option value="VP1">HN08</option><option value="VP2">Sau HN12</option><option value="VP3">EX04</option></select></label><button id="theme-toggle" type="button" aria-pressed="false">Nền sáng</button></div></div><p class="section-copy">Mỗi icon hiển thị đúng 32 / 48 / 64 px. Ngọc hộ thân có hai trạng thái của cùng một món. Các công thức giữ số lượng thiết kế hiện hành.</p><div class="item-grid">${m.assets.filter(a=>a.assetType==='icon').map(a=>`<article class="item-card" data-stage="${a.stage}"><span class="stage">${stages[a.stage]}</span><div class="icon-sizes">${a.files.map(f=>`<figure><img src="${f.url}" width="${f.width}" height="${f.height}" alt="${safe(a.label)}"><figcaption>${f.width}px</figcaption></figure>`).join('')}</div><h3>${safe(a.label)}</h3><p>${safe(sources[a.itemId!]??'')}</p></article>`).join('')}</div><aside class="existing"><b>Đồ nhập môn đang có</b>${m.existingItems.map(a=>`<span><img src="${a.url}" width="32" height="32" alt="">${safe(a.name)}</span>`).join('')}</aside></section><section id="recipes"><div class="section-heading"><div><p class="eyebrow">SÁU CÔNG THỨC THEO CHẶNG</p><h2>Luyện hóa & chuẩn bị</h2></div></div><p class="section-copy">Đây là bảng đối chiếu thiết kế. Quyền công thức đi theo tiến trình HN08 / EX; các hoạt động EX vẫn có cách hoàn tất thủ công.</p><div class="recipe-grid">${m.recipes.map(recipe).join('')}</div></section><section id="props"><div class="section-heading"><div><p class="eyebrow">TỶ LỆ CAMERA 1×</p><h2>Đạo cụ rời</h2></div><a class="download" href="/assets/van-ngoc-gameplay-v1/editor-library.json" download="van-ngoc-gameplay-v1-editor-library.json">Tải thư viện Editor ↓</a></div><p class="section-copy">So cạnh người 64 × 96, chân (32,88). Chọn vị trí người để xem trước/sau/hai cạnh. Khóm dược dành cho nội dung EX01; thư viện chưa đặt vật vào map.</p><div class="prop-grid">${m.assets.filter(a=>a.assetType==='prop').map(a=>`<article class="prop-card"><header><div><span class="stage">${stages[a.stage]}</span><h3>${safe(a.label)}</h3></div><label>Vị trí người<select aria-label="Vị trí người cạnh ${safe(a.label)}"><option value="front">Phía trước</option><option value="behind">Phía sau</option><option value="left">Bên trái</option><option value="right">Bên phải</option></select></label></header><div class="native-scene"><canvas width="600" height="240" data-prop="${a.id}" aria-label="${safe(a.label)} cạnh nhân vật ở cỡ chơi 1×"></canvas></div><footer>${a.files[0].width} × ${a.files[0].height} px · chân (${a.pivot!.x},${a.pivot!.y}) · alpha rời</footer></article>`).join('')}</div></section><footer class="page-footer">Nguồn: GDD · Catalog Hằng Nhạc · Item Crafting Design · VP0–VP3. Bộ ART mới chờ bạn đánh giá nét và tỷ lệ; phần thu nhận/luyện chế trong game cần triển khai theo từng chặng.</footer>`;
 root.querySelector('#recipes')!.insertAdjacentHTML('beforeend',`<article id="recipe-workbench" class="recipe-workbench"><div class="workbench-heading"><div><p class="eyebrow">KIỂM TRA NGUYÊN LIỆU & KẾT QUẢ</p><h3>Bàn thử công thức</h3><p>Chỉnh túi mẫu và tiến trình để xem lượng tiêu, món giữ lại và kết quả dự kiến. Mẫu thử không thay đổi hành trang trong game.</p></div><label>Công thức<select id="preview-recipe">${m.recipes.map(r=>`<option value="${r.id}">${safe(labels[r.id])}</option>`).join('')}</select></label></div><div class="preview-actions"><button type="button" id="preview-enough">Mẫu đủ điều kiện</button><button type="button" id="preview-hn-source">Mẫu nguồn HN05–HN08</button><button type="button" id="preview-clear">Xóa mẫu</button></div><div class="preview-layout"><form id="preview-inputs"></form><div id="preview-result" class="preview-result" aria-live="polite" aria-atomic="true"></div></div></article>`);
 root.querySelector('#props h2')!.textContent='Đạo cụ dự phòng';
 root.querySelector('#props .section-copy')!.textContent='Hằng Nhạc đã có các khu và đạo cụ tĩnh trên nền chuẩn. Các mẫu rời dưới đây giữ trong thư viện, dùng khi cần tương tác hoặc thay thế riêng. Khóm dược dành cho EX01. So với người 64 × 96 ở camera 1×; chưa đặt vào map.';
 setupWorkbench();
 root.querySelector<HTMLButtonElement>('#theme-toggle')!.addEventListener('click',event=>{const button=event.currentTarget as HTMLButtonElement,light=root.dataset.theme!=='light';root.dataset.theme=light?'light':'dark';button.setAttribute('aria-pressed',String(light));button.textContent=light?'Nền tối':'Nền sáng';});
 root.querySelector<HTMLSelectElement>('#stage-filter')!.addEventListener('change',event=>{const stage=(event.target as HTMLSelectElement).value;root.querySelectorAll<HTMLElement>('.item-card,.recipe-card').forEach(card=>card.hidden=stage!=='all'&&card.dataset.stage!==stage);});
 await Promise.all([...root.querySelectorAll<HTMLCanvasElement>('canvas[data-prop]')].map(canvas=>propCanvas(canvas,m.assets.find(a=>a.id===canvas.dataset.prop)!)));
 root.dataset.ready='true';
}
start().catch(error=>{root.textContent=error instanceof Error?error.message:'Chưa nạp được bộ asset.';root.dataset.error='true';});
