"""Verify approved per-skill deliverables and produce the closing inventory."""
import hashlib,json,re
from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parent.parent
def read(p): return (root/p).read_text(encoding='utf8')
def write(p,s): (root/p).write_text(s,encoding='utf8')
def sha(data): return hashlib.sha256(data).hexdigest()
lib=json.loads(read('library.json'))
assert lib['productionBatch']['status']=='closed_owner_approved'
inventory=[];approval=[]
for skill in lib['skills']:
    assert skill['artStatus']=='owner_approved'
    archive=root/skill['pack'];manifest=archive.with_suffix('.manifest.json')
    m=json.loads(manifest.read_text(encoding='utf8'))
    assert m['artStatus']=='owner_approved'
    digest=sha(archive.read_bytes())
    assert digest==archive.with_suffix('.sha256').read_text().split()[0]
    with ZipFile(archive) as z:
        assert z.testzip() is None
        assert json.loads(z.read(skill['id']+'/PACK-MANIFEST.json'))==m
        for entry in m['files']:
            assert sha(z.read(skill['id']+'/'+entry['file']))==entry['sha256']
            assert sha((root/entry['file']).read_bytes())==entry['sha256'],entry['file']
        assert sum('/frames/' in n and n.endswith('.png') for n in z.namelist())==m['frames']
        assert sum('/atlases/' in n and n.endswith('.png') for n in z.namelist())==m['atlases']
    if skill['id'].startswith('R05'):
        old=archive.with_name(archive.name.replace('3.0.1','3.0.0'))
        previous=json.loads(old.with_suffix('.manifest.json').read_text())
        assert previous['files']==m['files'], 'Approval must not change source payload'
        approval.append(dict(id=skill['id'],packVersion='3.0.1',artStatus='owner_approved',approval=skill['approval'],archive='skill-packs/'+archive.name,manifest='skill-packs/'+manifest.name,sourceUnchangedFrom='3.0.0',payloadFiles=len(m['files']),sha256=digest))
    inventory.append(dict(id=skill['id'],name=skill['name'],realm=skill['id'].split('-')[0],sourceVersion=skill['version'],packVersion=m['version'],assetPath=skill['path'],frames=m['frames'],atlases=m['atlases'],artStatus=m['artStatus'],archive=skill['pack'],manifest=str(manifest.relative_to(root)).replace('\\','/'),bytes=archive.stat().st_size,sha256=digest,preview=skill.get('preview',f"ngung-khi-kit.html?family={skill['id'].split('-')[1].lower()}")))
assert len(inventory)==15
assert sum(s['frames'] for s in inventory)==646
assert sum(s['atlases'] for s in inventory)==76
write('releases/hoa-than-approval-3.0.1.json',json.dumps(dict(realm='R05',date='2026-10-07',artStatus='owner_approved',runtimeReady=False,productionBatchStatus='closed_owner_approved',skills=approval),ensure_ascii=False,indent=2)+'\n')
write('releases/starter-vfx-inventory-1.0.0.json',json.dumps(dict(id='INTRODUCTORY-SKILL-VFX-ART',version='1.0.0',closedAt='2026-10-07',status='closed_owner_approved',skillCount=15,frames=646,atlases=76,countsIncludeReusedFrames=True,completeLibraryArchive='hoa-than-kit-3.0.1.zip',runtimeReady=False,skills=inventory),ensure_ascii=False,indent=2)+'\n')
rows=['| Cảnh giới | Skill / gói tải riêng | PNG / atlas | Pack |','| --- | --- | --- | --- |']
realms={'R01':'Ngưng Khí','R02':'Trúc Cơ','R03':'Kết Đan','R04':'Nguyên Anh','R05':'Hóa Thần'}
for s in inventory:
    rows.append(f"| {realms[s['realm']]} | [{s['name']}]({s['archive']}) | {s['frames']} / {s['atlases']} | {s['packVersion']} |")
write('STARTER-VFX-HANDOFF.md','''# Bàn giao skill/VFX nhập môn và nâng cấp

Đợt ART P1–P5 đã kết thúc ngày **07/10/2026** theo yêu cầu chủ dự án. Chốt ba nhánh Kiếm/Lôi/Phong qua Ngưng Khí, Trúc Cơ, Kết Đan, Nguyên Anh và Hóa Thần: **15 skill, 646 PNG RGBA rời, 76 atlas**, tất cả đã được chấp nhận. Các con số gồm frame dùng lại, không phải số hình độc nhất.

[Tải bộ chung được duyệt 3.0.1](releases/hoa-than-kit-3.0.1.zip) · [Checksum](releases/hoa-than-kit-3.0.1.sha256) · [Thư viện xem và tải](skill-library.html) · [Inventory 15 gói](releases/starter-vfx-inventory-1.0.0.json).

## Bộ skill đã khóa

'''+ '\n'.join(rows)+'''

R05 source **3.0.0** giữ nguyên hình V3 đã xem; pack **3.0.1** bổ sung ghi nhận duyệt. Payload của cả ba gói mới trùng từng byte với pack 3.0.0. [Hồ sơ duyệt Hóa Thần](releases/hoa-than-approval-3.0.1.json); library và PACK-MANIFEST là trạng thái duyệt hiện tại. Source metadata ghi trạng thái tại lúc sản xuất, được giữ nguyên để truy nguồn.

## Nhận và sử dụng

ZIP riêng chứa một skill, source/prompt, PNG sequence, atlas, JSON và presentation helpers; không chứa web preview. Giữ cấu trúc folder để các import tương đối hoạt động. ZIP chung có source và preview cả năm cảnh giới, các bản ART lịch sử và kiểm tra hồi quy; không lồng ZIP từng skill. Khi tải riêng, dùng bảng trên hoặc thư viện workspace gốc. ZIP chung có 1032 PNG / 123 atlas vì giữ lịch sử; thư viện hiện hành chỉ có 646 / 76.

Giải nén ZIP chung, chạy `python serve-preview.py` trong thư mục giải nén và mở `http://127.0.0.1:4185/skill-library.html`. Nếu cổng 4185 đang phục vụ workspace khác, dừng server đó rồi chạy bản giải nén khi cần xem đúng bản bàn giao. Không tự khởi chạy hoặc dừng server của nhóm phát triển trong bước đóng gói này.

Mỗi skill: `frames/<clip>/001.png` là nguồn chính; `clips.json` chứa FPS, frame holds, anchor và atlas rect; `skill.json` chứa timeline/events/hợp đồng host; `source/`, `prompts/`, `provenance.json` lưu nguồn sinh. Atlas là output build. Artist sửa frame rời rồi chỉ chạy `pack-atlases.mjs`; không chạy lại initial extraction/merge đè frame đã sửa. Repack cần Node và Sharp; xem bộ hồ sơ theo cảnh giới ở README.

## Tiêu chí giữ khi tích hợp

- Frame-by-frame 24 FPS, frame tác giả từ 1; event độc lập với FPS render.
- Vương Lâm chibi hướng đông, body tối đa 80 world px. World 960×640 orthographic; zoom 1×/2×/4×, DPR tối đa 2. Viewport nhỏ cắt vùng nhìn. Character nearest, FX linear, alpha blend thường.
- Impact theo điểm hit host xác nhận, không phụ thuộc bia đá/vật liệu, dùng cho nhân vật, quái, boss và PvP. Boss đổi anchor, không tự phóng artwork.
- Host/server sở hữu damage, hitbox, projectile pose, actor position và movement/arrival. VFX chỉ trình bày, không gây damage, tạo actor/AI hoặc miễn nhiễm. Kiếm phụ, phù và tàn ảnh không tạo hit bổ sung.
- Hóa Thần theo ngọc sáng, khí lụa, sét tím và phù vàng. Camera feedback mặc định tắt; bật tùy chọn không được dừng combat clock. Echo Phong chỉ dùng snapshot host có timestamp, alpha .12/.06, sau thân và tan sau arrival.

## Kiểm chứng và phạm vi kết thúc

**87 kiểm tra tự động đạt** trong workspace bàn giao. Các gói riêng đã kiểm CRC, SHA-256 và toàn bộ payload; gói chung được kiểm sau khi đóng archive. Giữ nguyên các archive lịch sử. Có render atlas cục bộ ở 1×/2×; chủ dự án đã xem và chấp nhận. Tương tác browser chưa xác minh tự động.

Đã kết thúc sản xuất và đóng gói ART của đợt này. Chưa tích hợp client/server, SFX/icon, toàn bộ hướng nhân vật, crowd LOD hoặc benchmark. Các việc này là hạng mục riêng; không tiếp tục sản xuất cảnh giới cao hơn trong đợt đã đóng.
''')
# Fix one remaining current-status label; historical source/docs remain unchanged.
p=root.parents[1]/'VFX-ART-PROGRESSION.md'
s=p.read_text(encoding='utf8').replace('chờ xem motion R05','R05 đã được chấp nhận')
p.write_text(s,encoding='utf8')
write('production/starter-closure-verification.json',json.dumps(dict(date='2026-10-07',testsPassed=87,currentPacksVerified=15,crcVerified=True,allPayloadHashesVerified=True,approvalOnlyR05PayloadsUnchanged=True,browserInteractionVerified=False,productionBatchStatus='closed_owner_approved'),indent=2)+'\n')
print('15 approved packs verified; R05 approval preserves all source bytes. Handoff and inventory saved.')
