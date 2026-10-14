const $=id=>document.getElementById(id);
const escape=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const conceptRoot='../wang-lin-concept-direction-v5/';
const displayName=(v='')=>String(v).replaceAll('Huyền Tâm','Huyễn Tâm');
const strings=v=>Array.isArray(v)?v:typeof v==='string'?[v]:[];
const text=v=>typeof v==='string'?v: v?.summary||v?.description||v?.name||'';
const source=v=>typeof v==='string'?v:v?.image||v?.file||v?.raw||'';
const number=v=>new Intl.NumberFormat('vi-VN').format(v);
let plan,manifest,approval,filter='all',stages=1;
const filters=[{id:'all',name:'Tất cả'},{id:'art',name:'Nhân vật & FX'},{id:'integration',name:'Gameplay & bàn giao'}];
const familyLabels={sword:'Kiếm linh',banner:'Hồn phiên',chariot:'Xạ Thần Xa',bead:'Thiên Nghịch Châu'};
const familySignatures={sword:'Kiếm linh hiện hình · ba tuyến kiếm có khe né',banner:'Dòng hồn định hướng · ba cổng dựng hồn vực',chariot:'Xích trấn dị thú · lôi dậm theo tuyến',bead:'Cổ châu nhỏ · nội giới rộng, vân ấn và ranh giới'};
function phases(){return plan.phases||plan.stages||[];}
function isIntegration(p){return ['P2','P6','P7','P8'].includes(p.id)||/core|runtime|integrat|gameplay|delivery|encounter|server/i.test([p.id,p.category,p.track,p.title,p.name].join(' '));}
function renderApproval(){
  const count=approval.pinCount||approval.counts?.pins||approval.pins?.length||approval.files?.length||approval.approvedFiles?.length||86;
  const sources=approval.coverage?.selectedSources||approval.counts?.sourceImages||approval.counts?.sources||18,natives=approval.coverage?.nativeConceptPreviews||approval.counts?.nativeImages||approval.counts?.nativePreviews||10;
  $('approval-stats').innerHTML=[[count,'file được ghim'],[sources,'ảnh nguồn'],[natives,'preview native']].map(([n,label])=>`<div><strong>${number(n)}</strong><span>${label}</span></div>`).join('');
  $('approval-note').textContent='Duyệt hướng concept cho cả hai nhân vật và bốn họ pháp bảo. Neutral, motion, FX và gameplay có đầu ra kiểm riêng trong lộ trình.';
}
function renderCharacters(){
  const identities=manifest.identityMasters||manifest.identities||[];
  $('character-grid').innerHTML=identities.map((identity,i)=>`<article class="character-card" data-character="${escape(identity.id)}"><a class="character-art" href="${escape(conceptRoot+source(identity))}" target="_blank" rel="noopener"><img src="${escape(conceptRoot+source(identity))}" alt="Concept master ${i===0?'Huyễn Tâm':'Tịch Bạch'} đã duyệt"></a><div class="character-copy"><p class="eyebrow">MASTER ${String.fromCharCode(65+i)} / SẢN XUẤT RIÊNG</p><h3>${i===0?'Huyễn Tâm':'Tịch Bạch'}</h3><p>${escape(displayName(identity.description||identity.summary))}</p><div class="character-status">Đã chốt nhận diện.<br>Cả bốn bộ trang bị và ba mốc phát triển.</div></div></article>`).join('');
  $('family-grid').innerHTML=(manifest.families||[]).map((f,i)=>`<article class="family-card" data-family="${escape(f.id)}"><small>0${i+1} / CONCEPT ĐÃ DUYỆT</small><h3>${escape(familyLabels[f.id]||f.name)}</h3><p>${escape(familySignatures[f.id]||f.signature||f.description)}</p><a href="${conceptRoot}index.html#family=${f.id}&identity=a&option=${f.id}-a&palette=${f.id}-a&milestone=awakening&mode=aoe&phase=release">Xem concept đã chốt ↗</a></article>`).join('');
}
function renderPilot(){
  const pilot=plan.pilot||plan.firstDeliverable||{};
  $('pilot-title').textContent=pilot.title||pilot.name||'Pilot Kiếm linh · cả hai nhân vật';
  $('pilot-summary').textContent='Trước tiên: 8 neutral body và 8 bộ trang bị Đông Nam cho cả hai nhân vật, cùng prototype 8 cơ chế ST / AOE trên fixture. Sau đó làm Kiếm linh ở Đông Nam và Bắc: idle, run, chiêu đơn và AOE. Kiểm nhận diện, chuyển động, cách cầm và FX trên cùng sân 1× trước khi mở rộng.';
  const deliverables=[{value:pilot.bodyClips,label:'clip body dự kiến',note:'2 nhân vật × 2 hướng × 4 action'},{value:pilot.nominalBodyPoses,label:'key pose danh nghĩa',note:'6 pose / clip; nhịp thật được chốt khi làm motion'},{value:pilot.fxSequences,label:'sequence FX dự kiến',note:'1 kit Kiếm linh; dùng chung theo socket'},{value:pilot.nominalFxKeys,label:'key FX danh nghĩa',note:'6 frame / sequence; nguồn FX riêng'}];
  $('pilot-deliverables').innerHTML=deliverables.map(d=>`<div class="pilot-deliverable"><strong>${number(d.value)}</strong><span>${escape(d.label)}</span><small>${escape(d.note)}</small></div>`).join('');
  $('pilot-gate').textContent=text(pilot.gate)||'Điểm kiểm: xem native 1× / 2× cả hai nhân vật, một đòn đơn và AOE đủ báo vùng → khóa → bộc phát → tan; thấy rõ nhân vật và đường né.';
  const sword=manifest.families.find(f=>f.id==='sword');const board=source(sword.combatBoard||sword.battleBoard||sword.aoeBoard);
  $('pilot-board').src=conceptRoot+board;$('pilot-board-link').href=conceptRoot+board;
}
function renderPhases(){
  $('phase-filters').innerHTML=filters.map(f=>`<button data-filter="${f.id}" aria-pressed="${f.id===filter}">${f.name}</button>`).join('');
  const all=phases();const current=all.filter(p=>filter==='all'||(filter==='integration'?isIntegration(p):!isIntegration(p)));
  $('phase-grid').innerHTML=current.map(p=>{const i=all.indexOf(p);const dependencies=strings(p.dependsOn||p.dependencies).map(id=>all.find(x=>x.id===id)?.title||all.find(x=>x.id===id)?.name||id);return `<article class="phase-card" data-phase="${escape(p.id||i)}"><div class="phase-top"><span class="phase-number">${String(i+1).padStart(2,'0')}</span><span class="phase-label">${/approved|complete|locked/.test(p.status||'')?'HỒ SƠ ĐÃ CHỐT':'DỰ KIẾN TRIỂN KHAI'}<br>${isIntegration(p)?'GAMEPLAY & BÀN GIAO':'NHÂN VẬT & FX'}</span></div><h3>${escape(displayName(p.title||p.name))}</h3><p>${escape(displayName(text(p.summary||p.description)))}</p><ul>${strings(p.deliverables||p.outputs).map(d=>`<li>${escape(displayName(text(d)))}</li>`).join('')}</ul><div class="phase-gate"><strong>ĐIỂM KIỂM ĐỂ ĐI TIẾP</strong>${escape(displayName(text(p.gate||p.acceptance||p.reviewGate)))}</div>${dependencies.length?`<div class="phase-dependency">Sau: ${escape(dependencies.join(' · '))}</div>`:''}</article>`}).join('');
}
function renderScope(){
  $('scope-description').textContent=stages===1?'Hoàn thiện mốc II · Luyện hóa thành bản sắc trước: cả hai nhân vật, bốn bộ trang bị, tám hướng và chiêu đơn / AOE. Mốc I / III được chuẩn bị neutral và luồng mở khóa; phạm vi motion được cập nhật sau pilot.':'Cả ba mốc: I · Tự mở đường → II · Luyện hóa thành bản sắc → III · Đạo của chính mình. Nếu mỗi mốc đổi toàn bộ áo và cần motion riêng, phạm vi dự kiến dưới đây áp dụng cho 24 appearance; thực hiện lần lượt sau khi đo pilot.';
  const quantities=plan.quantities;const base=quantities.baseBodyClips*stages,combo=quantities.conditionalComboClips*stages,total=base+combo;
  $('scope-totals').innerHTML=[{n:base,label:'clip body nền dự kiến',note:`2 nhân vật × 4 kit × 8 hướng × 8 action × ${stages} mốc`},{n:total,label:'clip nếu thêm combo ba đòn',note:`Bao gồm ${number(combo)} clip combo có điều kiện; cần prototype trước khi sản xuất`},{n:quantities.fxSequencesPerMilestone*stages,label:'sequence FX dùng chung',note:'10 sequence / kit / mốc; cùng hướng FX cho hai nhân vật, origin / socket riêng'}].map(t=>`<div class="scope-total"><strong>${number(t.n)}</strong><span>${t.label}</span><small>${t.note}</small></div>`).join('');
  const rows=[['Neutral / tám view',`2 nhân vật × 4 kit × 8 hướng × ${stages} mốc`,64*stages+' pose','Nhận diện, anatomy, cách cầm và foot root ở native 1×'],['Body nền',`2 × 4 × 8 × 8 action × ${stages} mốc`,base+' clip','Idle, run, hit, death, meditate, gather, ST và AOE'],['Combo ba đòn · có điều kiện',`2 × 4 × 8 × 3 đòn × ${stages} mốc`,combo+' clip','Sau prototype input và pose; không cộng vào gói body nền'],['Pháp bảo · trạng thái nghỉ',`8 appearance × 8 hướng × ${stages} mốc`,64*stages+' view','Tách lớp rear / front khỏi body; không mặc định tái dùng giữa các nhận diện'],['Pháp bảo · ST và AOE',`8 appearance × 8 hướng × 2 action × ${stages} mốc`,128*stages+' track','Socket, grip và layer thật; số frame tùy chuyển động'],['FX đơn mục tiêu / AOE',`4 kit × 2 loại × 5 phase × ${stages} mốc`,40*stages+' sequence','Đơn: warning / charge / release / resolve / tail. AOE: warning / deploy / active / contact / collapse']];
  $('scope-rows').innerHTML=rows.map(([label,formula,count,note])=>`<tr><td>${escape(label)}</td><td>${escape(formula)}</td><td>${escape(count)}</td><td>${escape(note)}</td></tr>`).join('');
  $('scope-caption').textContent=`Khối lượng dự kiến cho ${stages===1?'mốc II':'ba mốc, nếu đổi toàn bộ áo'} · chưa phải tài sản đã sản xuất`;
  $('scope-note').textContent='Số clip / track là đơn vị lập kế hoạch. 6 key pose / sequence là mốc để ước tính và chuẩn bị review, chưa khóa số frame, thời lượng, sát thương hoặc balance. Khi có pose tương đương và ghép socket qua được kiểm, có thể giảm trùng lặp giữa các bộ trang bị.';
  document.querySelectorAll('[data-stages]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stages)===stages)));
}
document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.dataset.filter){filter=button.dataset.filter;renderPhases();}else if(button?.dataset.stages){stages=Number(button.dataset.stages);renderScope();}});
try{
  [plan,manifest,approval]=await Promise.all([fetch('plan.json').then(r=>{if(!r.ok)throw new Error(`plan.json: HTTP ${r.status}`);return r.json();}),fetch(conceptRoot+'manifest.json').then(r=>r.json()),fetch(conceptRoot+'approval.json').then(r=>{if(!r.ok)throw new Error(`approval.json: HTTP ${r.status}`);return r.json();})]);
  renderApproval();renderCharacters();renderPilot();renderPhases();renderScope();
  document.body.dataset.ready='true';window.__implementationPlan={getState:()=>({filter,stages}),counts:{characters:2,families:4,phases:phases().length},status:'concept-approved-implementation-planned'};
}catch(error){document.body.dataset.ready='error';$('approval-note').textContent=error.message;$('approval-card')?.classList.add('error');console.error(error);}
