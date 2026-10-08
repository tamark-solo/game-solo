"""Activate the reviewable V3 edition without changing sealed historical payloads."""
import json, shutil
from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parent.parent
def read(p): return (root/p).read_text(encoding='utf8')
def write(p,s): (root/p).write_text(s,encoding='utf8')
with ZipFile(root/'releases/hoa-than-kit-2.0.0.zip') as z:
    write('HOA-THAN-KIT-V2.md',z.read('hoa-than-kit-2.0.0/HOA-THAN-KIT.md').decode('utf8'))
shutil.copyfile(root/'hoa-than-jade-kit.html',root/'hoa-than-kit.html')
lib=json.loads(read('library.json'));lib['version']='1.8.0'
for s in lib['skills']:
    if not s['id'].startswith('R05'): continue
    f=s['id'].split('-')[1].lower()
    s.update(version='3.0.0',packVersion='3.0.0',path=f'r05-{f}-v3',frames={'sword':38,'thunder':40,'wind':36}[f],pack=f'releases/skill-packs/r05-{f}-3.0.0.zip',edition='reference_jade_silk_and_golden_seals',artStatus='reference_redesigned_pending_owner_motion_review')
lib['milestones'][-1]['status']='R04_approved_R05_V3_reference_redesigned_pending_owner_motion_review'
lib['milestones'][-1]['stages'][-1]['status']='reference_redesigned_pending_owner_motion_review'
lib['validation']['automatedTests'].update(passed=87,failed=0)
lib['validation'].update(r05JadeOfflineCaptures=30,r05V2V3Comparisons=3,currentR05Edition='reference_jade_silk_and_golden_seals')
lib['release']='releases/hoa-than-kit-3.0.0.manifest.json';lib['releaseArchive']='releases/hoa-than-kit-3.0.0.zip'
write('library.json',json.dumps(lib,ensure_ascii=False,indent=2)+'\n')
selection=json.loads(read('production/r05-jade-art-selection.json'))
for f in ['sword','thunder','wind']:
    p=f'r05-{f}-v3'; skill=json.loads(read(p+'/skill.json'))
    provenance=dict(realm='R05',edition='3.0.0 reference_jade_silk_and_golden_seals',tool='built_in_imagegen',newArt=[s for s in selection if s['family']==f],reuse='56 PNGs across V3 retain V2 bytes; clips.json records reusedFrom',processing='Mechanical crop, semantic registration, uniform scale, RGBA export and atlas pack only',newFramesAcrossKit=58,oldReleasesPreserved=True,artStatus=skill['artStatus'])
    write(p+'/provenance.json',json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    write(p+'/README.md',f"# {skill['name']} · R05 V3\n\nNguồn: imagegen tích hợp, tham chiếu tạo hình chủ dự án gửi. Ngọc sáng, khí lụa, phù vàng; không có bia đá hay mảnh vật liệu trong impact. Xem [hồ sơ bộ](../HOA-THAN-KIT.md).\n\nPNG RGBA trong frames/ là nguồn chính; atlas là build output. 24 FPS, body tối đa 80 world px. skill.json chứa frame events và hợp đồng host, clips.json chứa anchor/rect/holds; provenance.json dẫn đến source và prompt chính xác.\n\nChờ chủ dự án xem motion. Chưa tích hợp gameplay, SFX, hướng đầy đủ hoặc crowd LOD. Sau khi artist sửa PNG chỉ chạy pack-atlases.mjs; không chạy lại initial extraction/merge trên frame đã sửa.\n")
html=read('skill-library.html').replace('hoa-than-kit-2.0.0.zip','hoa-than-kit-3.0.0.zip').replace('644 PNG','646 PNG').replace('72 kiểm tra','87 kiểm tra')
start=html.index('<section aria-labelledby="r05">');end=html.index('<details class="comparison" open>',start)
cards=[]
for f,name,desc,count,new,frame in [('sword','Ý Cảnh Kiếm','Kiếm chủ đạo và hai bóng kiếm dẫn khí; dòng ngọc sáng, phù vàng, chạm tan thành nét khí.',38,20,13),('thunder','Ý Cảnh Lôi','Trận phù nhiều vòng dưới chân; sét tím phân nhánh, điểm chạm trắng và dư âm vàng.',40,22,18),('wind','Ý Cảnh Phong','Dải lụa khí và lá theo bước lướt; tàn ảnh nhẹ phía sau, dư khí thu ở điểm đáp.',36,16,13)]:
    cards.append(f'<article class="card"><a href="hoa-than-kit.html?family={f}"><img src="r05-{f}-v3/review/F{frame}-2x.png" alt="Vương Lâm · {name} V3" width="960" height="640" loading="lazy"></a><div class="content"><span class="code">R05 · {f.upper()}</span><h3>{name}</h3><p>{desc}</p><div class="links"><a class="button" href="hoa-than-kit.html?family={f}">Xem chuyển động</a><a href="releases/skill-packs/r05-{f}-3.0.0.zip" download>Tải skill</a></div><span class="count">{count} PNG · {4 if f=="wind" else 5} atlas · {new} frame mới</span></div></article>')
section='<section aria-labelledby="r05"><div class="section-title"><h2 id="r05">Hóa Thần V3</h2><span class="status new">Ngọc / lụa khí / phù vàng · chờ xem motion</span></div><p class="intro">Thiết kế lại theo ảnh tham chiếu của chủ dự án. Giữ frame events, một đòn chủ đạo và thân 80 world px. Tốc độ xem 1×; rung camera mặc định tắt.</p><div class="grid">'+''.join(cards)+'</div></section>'
comparison='<details class="comparison" open><summary>Hóa Thần V2 → V3 theo tạo hình tham chiếu</summary><div class="grid">'+''.join(f'<figure><a href="review-r05-jade-{f}.png"><img src="review-r05-jade-{f}.png" alt="V2 trên, V3 dưới; cùng camera và cỡ người" loading="lazy"></a><figcaption>{label}</figcaption></figure>' for f,label in [('sword','Kiếm · khí ngọc và kiếm rõ hình.'),('thunder','Lôi · phân nhánh tự nhiên, vòng phù vàng.'),('wind','Phong · lụa khí, lá và tàn ảnh nhẹ.')])+'</div></details>'
html=html[:start]+section+comparison+html[end:].replace('<details class="comparison" open>','<details class="comparison">',1).replace('V1 → V2 tăng lực','V1 → V2 · lịch sử')
write('skill-library.html',html)
for file in ['README.md','NGUYEN-ANH-KIT.md','milestones/P5-NGUYEN-ANH.md']:
    s=read(file).replace('644','646').replace('918','1032').replace('109 atlas','123 atlas').replace('112 PNG','114 PNG').replace('112 / 14','114 / 14').replace('72 kiểm tra','87 kiểm tra').replace('hoa-than-kit-2.0.0.zip','hoa-than-kit-3.0.0.zip')
    if file=='README.md':
      s=s.replace('V2 vẽ lại attack/impact','V3 theo ảnh tham chiếu').replace('42 frame attack/impact mới / 70 PNG giữ nguyên từ R05 V1','58 frame mới / 56 PNG giữ nguyên từ R05 V2').replace('ZIP chung giữ thêm R04 V1 và R05 V1','ZIP chung giữ thêm R04 V1 và R05 V1/V2')
    if file.startswith('milestones/'):
      s=s.replace('42 frame attack/impact mới và 70 PNG nguyên byte từ R05 V1','58 frame mới và 56 PNG nguyên byte từ R05 V2').replace('R05 V2 chờ','R05 V3 chờ')
    s+='\nR05 V3 quay về ngọc sáng, khí lụa, sét tím và phù vàng theo ảnh chủ dự án gửi. 58 frame mới / 56 frame giữ nguyên; Phong có tối đa hai tàn ảnh từ vị trí host có timestamp, không tạo actor. Camera feedback mặc định tắt. [Hồ sơ V3]('+('../' if file.startswith('milestones/') else '')+'HOA-THAN-KIT.md).\n'
    write(file,s)
path=root.parents[1]/'VFX-ART-PROGRESSION.md';s=path.read_text(encoding='utf8')
s=s.replace('0.13','0.14').replace('112 PNG','114 PNG').replace('644 PNG','646 PNG').replace('918 PNG / 109 atlas','1032 PNG / 123 atlas').replace('72 kiểm tra','87 kiểm tra').replace('V2 42 attack/impact mới / 70 giữ nguyên','V3 58 frame mới / 56 giữ nguyên').replace('V2 có 42 frame attack/impact mới và 70 PNG nguyên byte từ R05 V1','V3 có 58 frame mới và 56 PNG nguyên byte từ R05 V2').replace('R05 V1 để kiểm','R05 V1/V2 để kiểm')
s+='\nR05 V3 khôi phục hướng mỹ thuật theo ảnh tham chiếu: kiếm ngọc sáng cùng hai bóng kiếm dẫn khí; sét tím tự nhiên và trận phù vàng; lụa khí/lá với tàn ảnh nhẹ. Một đòn chủ đạo, không tăng số damage event từ trang trí. Phong preview lướt F10→F15; tàn ảnh chỉ từ snapshot host có timestamp. Feedback camera mặc định tắt. 30 capture V3 ở 1×/2×, ba so sánh V2/V3; vẫn chờ chủ dự án xem motion.\n'
path.write_text(s,encoding='utf8')
# Add new version-specific packers; historical scripts remain unchanged.
s=read('production/package-force-skills.py').replace("skill['path'].endswith('-v2'):\n        skill_shared += ['production/r05-force", "skill['path'].endswith(('-v2','-v3')):\n        skill_shared += ['production/r05-force")
needle='    files.update(root / p for p in skill_shared'
s=s.replace(needle,"    if realm == 'R05' and skill['path'].endswith('-v3'):\n        skill_shared += ['production/r05-jade-model.mjs','production/r05-jade-controller.mjs','production/r05-jade-art-selection.json','reference-hoa-than-user-v3.png']\n"+needle)
write('production/package-jade-skills.py',s)
s=read('production/package-force-library.py').replace('R01-R05 V2','R01-R05 V3').replace('hoa-than-kit-2.0.0','hoa-than-kit-3.0.0').replace("'version': '2.0.0'","'version': '3.0.0'").replace("'newR05Frames': 42, 'reusedR05Frames': 70","'newR05Frames': 58, 'reusedR05Frames': 56").replace('918','1032').replace('109','123').replace('644','646').replace("'automatedTestsPassed': 72","'automatedTestsPassed': 87").replace("'redesigned_pending_owner_motion_review'","'reference_redesigned_pending_owner_motion_review'")
s=s.replace("files = {root / n for n in names}","names += ['HOA-THAN-KIT-V2.md','hoa-than-jade-kit.html','hoa-than-jade-preview.mjs','reference-hoa-than-user-v3.png']\nnames += [f'review-r05-jade-{f}.png' for f in ['sword','thunder','wind']]\nfiles = {root / n for n in names}")
s=s.replace("'r05-wind-v1', 'production'","'r05-wind-v1', 'r05-sword-v2','r05-thunder-v2','r05-wind-v2', 'production'")
write('production/package-jade-library.py',s)
