from pathlib import Path
r=Path(__file__).resolve().parent.parent
p=r/'README.md'
s=p.read_text(encoding='utf8').replace('nhịp tĩnh/mực/sương','nhịp tĩnh/khí ngọc').replace('\\nV2','\nBản V2 lịch sử').replace('lịch sử.\\n','lịch sử.\n')
p.write_text(s,encoding='utf8')
p=r/'milestones/P5-NGUYEN-ANH.md'
s=p.read_text(encoding='utf8').replace('phản hồi mực/sương','phản hồi khí ngọc').replace('R05 V2 xử lý thiếu lực','Bản R05 V2 lịch sử xử lý thiếu lực')
p.write_text(s,encoding='utf8')
p=r.parents[1]/'VFX-ART-PROGRESSION.md'
s=p.read_text(encoding='utf8').replace('môi trường quanh đường kiếm phản hồi bằng mực/sương','khí ngọc cong và phù vàng quanh đường kiếm').replace('R05 V2 vẫn chờ chủ dự án xem motion.','R05 V2 là bản lịch sử đã được thay bằng V3 theo phản hồi mỹ thuật.')
p.write_text(s,encoding='utf8')
p=r/'production/package-jade-library.py'
s=p.read_text(encoding='utf8').replace("names += ['HOA-THAN-KIT-V2.md'","names += ['HOA-THAN-KIT-V3.md','HOA-THAN-KIT-V2.md'")
p.write_text(s,encoding='utf8')
