export const CONTENT_DOMAINS = {
  item:'Vật phẩm',quest:'Nhiệm vụ',activity:'Hoạt động',source:'Nguồn thưởng',recipe:'Công thức',skill:'Thuật pháp',
  cultivation:'Tu luyện',map:'Bản đồ',mount:'Tọa kỵ',cosmetic:'Diện mạo',companion:'Đồng hành',method:'Công pháp',
  npc:'NPC',encounter:'Đối thủ / trận',loot:'Gói loot',unlock:'Quyền mở khóa',achievement:'Thành tựu',title:'Danh hiệu',social:'Xã hội',currency:'Tiền tệ',
} as const;
export type ContentDomain = keyof typeof CONTENT_DOMAINS;
export const CONTENT_SUBTYPES:Record<ContentDomain,readonly string[]> = {
  item:['equipment','material','consumable','artifact','tool','intermediate'],quest:['main-story','side-story','character','training'],
  activity:['finite-quest-activity','farm','duel','dungeon','group'],source:['first-time-grant','cycle-grant','craft-grant'],recipe:['craft-or-transform'],
  skill:['projectile','targeted-strike','dash','active','passive'],cultivation:['gameplay-milestone','realm','layer'],map:['runtime-world','planned-world'],
  mount:['riding','flying'],cosmetic:['outfit','weapon-skin','artifact-skin','mount-skin','aura'],companion:['presentation','combat'],
  method:['cultivation-method','operation-method'],npc:['guide','service','story'],encounter:['training','mob','boss','trial'],loot:['personal','party','shared'],
  unlock:['content','method','recipe'],achievement:['pve','pvp','exploration','collection'],title:['achievement','rank','story'],social:['faction','guild-role','rule'],currency:['balance'],
};
export const CONTENT_RELATIONS = ['requires-progress','uses-grant-source','grants','consumes','keeps','produces','transforms-same-instance'] as const;
export const CONTENT_SUBTYPE_LABELS:Record<string,string>={equipment:'Trang bị',material:'Nguyên liệu',consumable:'Vật tư tiêu hao',artifact:'Pháp khí / pháp bảo',tool:'Công cụ',intermediate:'Thành phẩm trung gian','main-story':'Chính tuyến','side-story':'Nhánh truyện',character:'Nhánh nhân vật',training:'Bài luyện','finite-quest-activity':'Hoạt động hữu hạn',farm:'Farm',duel:'Tỷ thí',dungeon:'Bí cảnh',group:'Hoạt động nhóm','first-time-grant':'Thưởng lần đầu','cycle-grant':'Nguồn lặp','craft-grant':'Nguồn luyện chế','craft-or-transform':'Chế tác / biến đổi',projectile:'Đòn bay','targeted-strike':'Đòn chọn mục tiêu',dash:'Di chuyển',active:'Chủ động',passive:'Thụ động','gameplay-milestone':'Mốc vận hành',realm:'Cảnh giới',layer:'Tầng','runtime-world':'Map đã tích hợp','planned-world':'Map dự kiến',outfit:'Trang phục',aura:'Khí tức'};
export type ContentRelation = typeof CONTENT_RELATIONS[number];
export type ImplementationStatus='implemented-local'|'unreleased';
export interface ContentRef {domain:ContentDomain;id:string;relation:ContentRelation}
export interface ContentSource {path:string;symbol?:string;collection?:string;recordId?:string;section?:string}
export interface ContentRecord {
  domain:ContentDomain;id:string;displayName:string;
  classification:{subtype:string;functionTags?:string[];materialFamily?:string;gradeRef?:string;requirementsStatus?:string};
  status:{implementation:ImplementationStatus;decision:string;balance:string;art:string};
  source:ContentSource;relations:ContentRef[];ownershipScope?:'character'|'account'|'realm'|'content-release';storage?:string;
  stage?:string;repeatable?:boolean;runtimeNotes?:string;
}
export interface ContentCatalogDocument {
  documentSchema:1;id:string;date:string;status:'design-reference';runtimeConsumable:false;pathBase:'workspace-root';
  scope:string;authorityNote:string;approvalNote:string;taxonomyDoc:string;controlDoc:string;notInventoriedDomains:ContentDomain[];records:ContentRecord[];
}
export interface CatalogIssue {severity:'error'|'warning';code:string;path:string;message:string;recordKey?:string}
export interface CatalogValidation {catalog?:ContentCatalogDocument;issues:CatalogIssue[]}
export interface CatalogSnapshot extends CatalogValidation {hash:string|null;checkedAt:number;source:string}
export interface CatalogFilters {query:string;domain:ContentDomain|'';implementation:ImplementationStatus|'';subtype?:string}
export const contentKey=(record:Pick<ContentRecord,'domain'|'id'>)=>`${record.domain}:${record.id}`;
export const isContentDomain=(v:unknown):v is ContentDomain=>typeof v==='string'&&Object.hasOwn(CONTENT_DOMAINS,v);
export const safeContentPath=(v:unknown):v is string=>typeof v==='string'&&v.length<=240&&/^(docs\/|shared\/|server\/src\/|client\/src\/|scripts\/)[A-Za-z0-9_./-]+\.(ts|mjs|json|md|css|html|txt)$/.test(v)&&v.split('/').every(p=>p&&p!=='.'&&p!=='..');
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,max=600):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(v);
const only=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).every(k=>keys.includes(k));

// Authoring metadata only. Validation never grants gameplay rights or evaluates effects.
export function validateContentCatalog(raw:unknown):CatalogValidation {
  const issues:CatalogIssue[]=[];
  const error=(code:string,path:string,message:string,recordKey?:string)=>issues.push({severity:'error',code,path,message,recordKey});
  if(!object(raw))return {issues:[{severity:'error',code:'shape',path:'$',message:'Catalog phải là một object.'}]};
  if(!only(raw,['documentSchema','id','date','status','runtimeConsumable','pathBase','scope','authorityNote','approvalNote','taxonomyDoc','controlDoc','notInventoriedDomains','records']))error('field','$','Có trường catalog chưa được hỗ trợ.');
  if(raw.documentSchema!==1||raw.status!=='design-reference'||raw.runtimeConsumable!==false||raw.pathBase!=='workspace-root')error('scope','$','Catalog biên tập phải dùng schema 1, design-reference và runtimeConsumable=false.');
  if(!id(raw.id)||!text(raw.date,10)||!/^\d{4}-\d{2}-\d{2}$/.test(String(raw.date)))error('identity','$','ID hoặc ngày catalog chưa hợp lệ.');
  for(const field of ['scope','authorityNote','approvalNote'])if(!text(raw[field],2000))error('text',field,'Thiếu mô tả phạm vi/nguồn.');
  for(const field of ['taxonomyDoc','controlDoc'])if(!safeContentPath(raw[field]))error('path',field,'Đường dẫn phải nằm trong workspace và không có .. hoặc đường dẫn tuyệt đối.');
  if(!Array.isArray(raw.notInventoriedDomains)||!raw.notInventoriedDomains.every(isContentDomain)||new Set(raw.notInventoriedDomains).size!==raw.notInventoriedDomains.length)error('domains','notInventoriedDomains','Danh sách domain chưa kiểm kê không hợp lệ.');
  if(!Array.isArray(raw.records)||raw.records.length>10000)return {issues:[...issues,{severity:'error',code:'records',path:'records',message:'Danh sách record thiếu hoặc vượt 10.000 hàng.'}]};
  const keys=new Map<string,Record<string,unknown>>();
  raw.records.forEach((r,i)=>{
    const p=`records[${i}]`;
    if(!object(r)){error('record',p,'Record phải là object.');return;}
    const key=isContentDomain(r.domain)&&id(r.id)?`${r.domain}:${r.id}`:undefined;
    if(!key)error('identity',p,'Domain hoặc ID chưa hợp lệ.');
    else if(keys.has(key))error('duplicate',p,'ID bị trùng trong cùng domain.',key);else keys.set(key,r);
    if(!only(r,['domain','id','displayName','classification','status','source','relations','ownershipScope','storage','stage','repeatable','runtimeNotes']))error('field',p,'Record có trường chưa được hỗ trợ.',key);
    if(!text(r.displayName,180))error('text',p+'.displayName','Tên hiển thị thiếu hoặc quá dài.',key);
    if(!object(r.classification)||!only(r.classification,['subtype','functionTags','materialFamily','gradeRef','requirementsStatus'])||!isContentDomain(r.domain)||!CONTENT_SUBTYPES[r.domain].includes(String(r.classification.subtype)))error('subtype',p+'.classification','Nhóm con không thuộc domain.',key);
    else{
      if(r.classification.functionTags!==undefined&&(!Array.isArray(r.classification.functionTags)||r.classification.functionTags.length>20||!r.classification.functionTags.every(v=>id(v))))error('tags',p+'.classification','Tag chưa hợp lệ.',key);
      for(const field of ['materialFamily','gradeRef','requirementsStatus'])if(r.classification[field]!==undefined&&!text(r.classification[field],100))error('classification',p+'.classification.'+field,'Dùng pending/not_applicable/see-source hoặc giá trị rõ; không để null.',key);
    }
    if(!object(r.status)||!only(r.status,['implementation','decision','balance','art'])||!['implemented-local','unreleased'].includes(String(r.status.implementation))||!['see-source','pending','not_applicable'].includes(String(r.status.decision))||!['baseline-see-source','see-source','pending','not_applicable'].includes(String(r.status.balance))||!['see-source','pending','not_applicable'].includes(String(r.status.art)))error('status',p+'.status','Trạng thái thiếu/không hợp lệ; index không tự cấp approval.',key);
    if(!object(r.source)||!only(r.source,['path','symbol','collection','recordId','section'])||!safeContentPath(r.source.path))error('source',p+'.source','Nguồn tham chiếu phải là đường dẫn workspace hợp lệ.',key);
    else{
      for(const field of ['symbol','collection','recordId','section'])if(r.source[field]!==undefined&&!text(r.source[field],120))error('source',p+'.source.'+field,'Selector nguồn chưa hợp lệ.',key);
      if(r.source.collection!==undefined&&r.source.recordId===undefined)error('source',p+'.source','Collection cần recordId.',key);
    }
    if(r.ownershipScope!==undefined&&!['character','account','realm','content-release'].includes(String(r.ownershipScope)))error('ownership',p,'Phạm vi sở hữu chưa hợp lệ.',key);
    for(const field of ['storage','stage','runtimeNotes'])if(r[field]!==undefined&&!text(r[field],field==='runtimeNotes'?1200:100))error('text',p+'.'+field,'Trường thiếu giá trị hoặc quá dài.',key);
    if(r.repeatable!==undefined&&typeof r.repeatable!=='boolean')error('repeatable',p,'repeatable phải là boolean.',key);
    if(!Array.isArray(r.relations)||r.relations.length>200){error('relations',p,'Danh sách quan hệ thiếu hoặc quá dài.',key);return;}
    const refs=new Set<string>();
    r.relations.forEach((a,j)=>{
      if(!object(a)||!only(a,['domain','id','relation'])||!isContentDomain(a.domain)||!id(a.id)||!CONTENT_RELATIONS.includes(a.relation as ContentRelation)){error('reference',`${p}.relations[${j}]`,'Quan hệ có kiểu chưa hợp lệ.',key);return;}
      const fingerprint=`${a.domain}:${a.id}:${a.relation}`;if(refs.has(fingerprint))error('duplicate_reference',p,'Quan hệ bị lặp.',key);refs.add(fingerprint);
      if(['grants','consumes','keeps','produces','transforms-same-instance'].includes(String(a.relation))&&a.domain!=='item')error('reference_type',p,'Quan hệ vật phẩm phải trỏ tới domain item.',key);
      if(a.relation==='requires-progress'&&!['quest','activity'].includes(a.domain))error('reference_type',p,'requires-progress phải trỏ tới quest/activity.',key);
      if(a.relation==='uses-grant-source'&&a.domain!=='source')error('reference_type',p,'uses-grant-source phải trỏ tới nguồn thưởng.',key);
    });
  });
  for(const [key,r] of keys)if(Array.isArray(r.relations))for(const a of r.relations)if(object(a)&&isContentDomain(a.domain)&&id(a.id)&&!keys.has(`${a.domain}:${a.id}`))error('missing_reference',key,'Không tìm thấy '+`${a.domain}:${a.id}`,key);
  if(Array.isArray(raw.notInventoriedDomains))for(const domain of raw.notInventoriedDomains)if(raw.records.some(r=>object(r)&&r.domain===domain))error('domains','notInventoriedDomains','Domain đã có record nhưng vẫn ghi chưa kiểm kê: '+domain);
  if(issues.some(v=>v.severity==='error'))return {issues};
  const catalog=raw as unknown as ContentCatalogDocument;
  for(const r of catalog.records)if(r.status.implementation==='unreleased')issues.push({severity:'warning',code:'unreleased',path:contentKey(r),recordKey:contentKey(r),message:'Nội dung đề xuất; chưa được kích hoạt trong gameplay.'});
  return {catalog,issues};
}

const fold=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLocaleLowerCase('vi');
export function filterContentRecords(records:ContentRecord[],filters:CatalogFilters):ContentRecord[]{
  const query=fold(filters.query.trim());
  return records.filter(r=>(!filters.domain||r.domain===filters.domain)&&(!filters.subtype||r.classification.subtype===filters.subtype)&&(!filters.implementation||r.status.implementation===filters.implementation)&&(!query||fold([r.id,r.displayName,r.domain,CONTENT_DOMAINS[r.domain],r.classification.subtype,CONTENT_SUBTYPE_LABELS[r.classification.subtype]??'',r.stage??'',...(r.classification.functionTags??[])].join(' ')).includes(query)));
}
export function contentNeighbors(records:ContentRecord[],key:string){
  const record=records.find(r=>contentKey(r)===key);
  return {record,outgoing:record?.relations??[],incoming:records.flatMap(r=>r.relations.filter(a=>`${a.domain}:${a.id}`===key).map(a=>({from:contentKey(r),relation:a.relation})))};
}
