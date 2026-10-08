"""Record human approval and close the authorized first ART production batch."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
def read(p): return (root/p).read_text(encoding='utf8')
def write(p,s): (root/p).write_text(s,encoding='utf8')
lib=json.loads(read('library.json'))
evidence={'date':'2026-10-07','evidence':'User reviewed Hoa Than V3, said it looks quite good, requested packaging into skill/VFX sets and ending the introductory skill/VFX batch.','userMessage':'nhìn khá tốt rồi giờ tiếp tục đống gói thành các bộ skill/vfx. Kết thúc vfx/skill nhập môn'}
for s in lib['skills']:
    if s['id'].startswith('R05'):
        s.update(artStatus='owner_approved',packVersion='3.0.1',pack=s['pack'].replace('3.0.0','3.0.1'),approval=evidence)
for m in lib['milestones']:
    m['status']='art_approved_release_saved'
    for stage in m.get('stages',[]): stage['status']='art_approved_release_saved'
lib.update(version='1.9.0',release='releases/hoa-than-kit-3.0.1.manifest.json',releaseArchive='releases/hoa-than-kit-3.0.1.zip',approvedR05Release='releases/hoa-than-approval-3.0.1.json')
lib['productionBatch']={'id':'INTRODUCTORY-SKILL-VFX-ART','status':'closed_owner_approved','closedAt':'2026-10-07','scope':['R01','R02','R03','R04','R05'],'skillCount':15,'activeFrames':646,'activeAtlases':76,'nextRealmProductionPlanned':False,'runtimeReady':False,'closureNote':'ART source and presentation deliverables completed for the agreed first batch; runtime/SFX/directions/LOD are separate work.'}
write('library.json',json.dumps(lib,ensure_ascii=False,indent=2)+'\n')
for file in ['hoa-than-kit.html','hoa-than-jade-kit.html','skill-library.html','README.md','HOA-THAN-KIT.md','milestones/P5-NGUYEN-ANH.md']:
    s=read(file).replace('hoa-than-kit-3.0.0.zip','hoa-than-kit-3.0.1.zip')
    if file=='skill-library.html':
        s=s.replace('chờ xem motion','đã chấp nhận').replace('chờ xem motion','đã chấp nhận').replace('Hóa Thần đã sản xuất, chờ xem motion','Hóa Thần đã được chấp nhận; đợt ART đã đóng')
        for f in ['sword','thunder','wind']: s=s.replace(f'r05-{f}-3.0.0.zip',f'r05-{f}-3.0.1.zip')
        s=s.replace('<footer>','<footer>Đợt skill/VFX nhập môn và nâng cấp đã chốt: 15 skill được chấp nhận. <a href="STARTER-VFX-HANDOFF.md">Hồ sơ bàn giao</a>.<br>')
    elif file=='README.md':
        s=s.replace('V3 theo ảnh tham chiếu, chờ xem motion','Đã chấp nhận; source 3.0.0 / pack 3.0.1').replace('Hóa Thần chưa được duyệt motion','Hóa Thần đã được chủ dự án chấp nhận').replace('P5 đã sản xuất ART cả R04/R05','P5 đã chốt ART cả R04/R05')
    elif file=='HOA-THAN-KIT.md':
        s=s.replace('· 3.0.0','· pack 3.0.1 / source 3.0.0',1).replace('Source/pack V3 là 3.0.0, **chờ chủ dự án xem motion**; không ghi duyệt thay người dùng.','Source V3 giữ nguyên 3.0.0; pack 3.0.1 ghi **chủ dự án đã chấp nhận ngày 07/10/2026**.').replace('chưa xác minh vì quyền localhost bị từ chối ở phiên trước','chưa xác minh tự động vì quyền localhost bị từ chối ở phiên trước')
        s+='\nĐợt skill/VFX nhập môn và nâng cấp đã đóng theo yêu cầu chủ dự án. [Bàn giao toàn bộ 15 skill](STARTER-VFX-HANDOFF.md) · [Bằng chứng duyệt](releases/hoa-than-approval-3.0.1.json). Source metadata lưu trạng thái lúc sinh ART; library và PACK-MANIFEST ghi trạng thái duyệt hiện tại.\n'
    elif file.startswith('milestones/'):
        s=s.replace('R05 V3 chờ xem motion','R05 V3 đã được chấp nhận').replace('Hóa Thần chưa được duyệt','Hóa Thần đã được duyệt')
        s+='\n**P5 đóng ngày 07/10/2026:** chủ dự án chấp nhận Hóa Thần V3 và yêu cầu kết thúc đợt ART. Source 3.0.0 giữ nguyên, pack 3.0.1 lưu duyệt; không mở thêm cảnh giới.\n'
    write(file,s)
write('README.md',read('README.md')+'\n**Đợt ART đã kết thúc ngày 07/10/2026:** cả 15 skill được chấp nhận. [Hồ sơ bàn giao](STARTER-VFX-HANDOFF.md).\n')
p=root.parents[1]/'VFX-ART-PROGRESSION.md'
s=p.read_text(encoding='utf8').replace('0.14','0.15',1).replace('R05 chờ xem motion','R05 được chấp nhận').replace('vẫn chờ chủ dự án xem motion','đã được chủ dự án chấp nhận')
s+='\n**Đóng đợt ART ngày 07/10/2026:** chủ dự án chấp nhận Hóa Thần V3, yêu cầu đóng gói và kết thúc VFX/skill nhập môn. Chốt P1–P5, 15 skill / 646 PNG / 76 atlas. Source R05 3.0.0 không đổi, pack 3.0.1 lưu duyệt. [Bàn giao](design/vfx/STARTER-VFX-HANDOFF.md). Không tiếp tục sản xuất cảnh giới mới trong đợt này. Runtime/SFX/hướng đầy đủ/LOD là hạng mục riêng.\n'
p.write_text(s,encoding='utf8')
# New approval release script; no mutation of historical release builders.
s=read('production/package-jade-library.py').replace('hoa-than-kit-3.0.0','hoa-than-kit-3.0.1').replace("'version': '3.0.0'","'version': '3.0.1'").replace("'owner_approved' if realm != 'R05' else 'reference_redesigned_pending_owner_motion_review'","'owner_approved'")
s=s.replace('files = {root / n for n in names}',"names += ['STARTER-VFX-HANDOFF.md','releases/hoa-than-approval-3.0.1.json','releases/starter-vfx-inventory-1.0.0.json']\nfiles = {root / n for n in names}")
s=s.replace("'primaryRealm': 'R05',", "'productionBatchStatus': 'closed_owner_approved', 'sourceR05Version': '3.0.0', 'primaryRealm': 'R05',")
write('production/package-approved-jade-library.py',s)
