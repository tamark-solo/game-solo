"""Record the specific visually inspected snapshot; never bless later production."""
from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=read(R/'manifest.json');ledger=read(R/'generation.json');h=read(R/'history/limb-audit-r1/manifest.json')
assert m['coverage']['bodyClips']==208 and m['coverage']['bodyKeys']==1239,'New clips require a new visual review, do not infer this audit'
notes={
 'tich-bach-entry-run-north':('foot-cycle','Chạy Bắc Tịch Bạch Ngoại Môn: thay nguồn để thấy hai chân đổi trụ, giày và cổ chân còn liền với cẳng chân.'),
 'huyen-tam-entry-run-northwest':('foot-cycle','Chạy Tây Bắc Huyễn Tâm Ngoại Môn: thay chu kỳ gần lặp nửa đầu bằng sáu phase mới, tay và chân đổi silhouette theo nhịp.'),
 'tich-bach-domain-run-north':('foot-cycle','Chạy Bắc Tịch Bạch Ý cảnh: nguồn mới giữ dải áo ngọc cùng bên, chân đổi trụ và tay thay lớp che; nguồn thử đảo áo đã loại.'),
 'huyen-tam-domain-run-west':('missing-run','Chạy Tây Huyễn Tâm Ý cảnh: bổ sung clip sáu key độc lập; nguồn cũ có hàng pose dính nên chưa có clip hoạt động.'),
 'huyen-tam-entry-cast-aoe-south':('oversized-palms','AOE Nam Huyễn Tâm Ngoại Môn: giảm bàn tay/ngón xòe nhọn thành bàn tay nhỏ, cụm ngón gọn, cổ tay nối vào cuff.'),
 'tich-bach-entry-cast-aoe-south':('oversized-palms','AOE Nam Tịch Bạch Ngoại Môn: thu gọn hai bàn tay mở ở charge/release, giữ tư thế thân và hai chân trụ.'),
}
repairs=[]
for id,(kind,note) in notes.items():
 c=next(c for c in m['clips'] if c['id']==id);old=next((c for c in h['clips'] if c['id']==id),None)
 repairs.append({'clipId':id,'kind':kind,'sourceJob':c['sourceJob'],'sourceSha256':c['sourceSha256'],'activeKeys':len(c['frames']),'oldClipArchived':bool(old),'oldSourceSha256':old['sourceSha256'] if old else None,'resultVi':note,'assessment':'model visually reviewed candidate; not owner ART/motion approval'})
audit=read(R/'review/limb-audit-v1/audit.json')
assert audit['manifestSha256']==sha(R/'manifest.json')
for board in audit['boards']:
 board.update(manualLimbReview='model-reviewed-anatomy-and-occlusion-candidate',boardSha256=sha(R/board['file']),observations='No obvious detached/canvas-cut wrist, knee or boot in board; rear occlusion retained. Motion approval is separate.')
audit.update(status='reviewed-with-scoped-corrections-candidate',findings='review/limb-audit-v1/findings.json',ownerArtApprovalInferred=False,ownerMotionApprovalInferred=False)
write(R/'review/limb-audit-v1/audit.json',audit)
report={'schema':'gdd-main-limb-audit-1','date':'2026-10-15','status':'reviewed-with-scoped-corrections-candidate','actualCoverage':m['coverage'],'manifestSha256':sha(R/'manifest.json'),'reviewedActorDirectionBoards':len(audit['boards']),'repairs':repairs,'beforeSources':[s for s in m['sources'] if any(c['sourceJob']==s['id'] for c in h['clips'])],'rejectedNewSources':[{'id':j['id'],'file':j['source'],'sha256':j.get('sourceSha256'),'reason':j.get('sourceAssessment')} for j in ledger['jobs'] if j.get('sourceViewed') and j.get('sourcePackingAllowed') is False and ('limbs-r' in j['id'] or 'aoe-hands' in j['id'])],
 'limits':['Native hands are compact pixel shapes; this does not certify anatomically separate five digits in every occluded pose.','Run leg identity/arm depth assessed visually, not inferred from connected-component counts.','Existing automatic boot witnesses and low-pose projections remain candidates, not completed manual world-root registration.','Future main northwest/northeast/east action views and the rest of the 824-clip roster are still pending.'],
 'tools':'built-in ImageGen for every art correction; existing threshold-alpha/nearest pipeline for canonical/atlas registration','ownerMotionApprovalInferred':False,'runtimeIntegrated':False}
write(R/'review/limb-audit-v1/findings.json',report)
progress=read(R/'progress.json');progress.update(totalSourceJobs=len(ledger['jobs']),generatedSources=sum(j['status']!='planned' for j in ledger['jobs']),packedBodyClips=m['coverage']['bodyClips'],packedBodyKeys=m['coverage']['bodyKeys'],sourceSheetsPacked=m['coverage']['sourceSheetsPacked'],correctiveSourceJobs=sum(bool(j.get('corrective')) for j in ledger['jobs']),latestTechnicalStatus='limb-audit-corrections-awaiting-browser-check',limbAudit='review/limb-audit-v1/findings.json')
write(R/'progress.json',progress)
p=R/'index.html';s=p.read_text(encoding='utf-8');needle='<section class="workspace">'
if 'id="limb-audit"' not in s:
 s=s.replace(needle,'<p class="muted"><a id="limb-audit" href="review/limb-audit-v1/index.html">Kiểm tra tay và chân · xem 6 clip vừa xử lý, so trước–sau ở 1×–4× →</a></p>\n'+needle,1);p.write_text(s,encoding='utf-8')
p=R/'review/limb-audit-v1/index.html';s=p.read_text(encoding='utf-8')
if '[hidden]{' not in s:s=s.replace(':root{','[hidden]{display:none!important}:root{',1)
s=s.replace('display:grid;place-items:center;overflow:auto','display:flex;align-items:center;justify-content:safe center;overflow:auto')
s=s.replace('canvas{image-rendering:pixelated;max-width:100%','canvas{image-rendering:pixelated;max-width:none')
p.write_text(s,encoding='utf-8')
print(json.dumps({'coverage':m['coverage'],'boardsReviewed':len(audit['boards']),'changedClips':5,'addedClips':1,'newSourcesKept':len(report['rejectedNewSources'])+len(repairs)}))
