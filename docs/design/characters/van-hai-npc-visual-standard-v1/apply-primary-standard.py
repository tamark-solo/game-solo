"""Apply the owner's primary NPC style rule without changing image provenance."""
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[4]
NOTICE = """**Chuẩn NPC owner chốt 13/10:** lấy Vương Lâm Pixel02 đang dùng trong game làm chuẩn gốc tỷ lệ, anatomy người, nét pixel và đổ màu. Đọc docs/design/characters/van-hai-npc-visual-standard-v1/basis.json và directions.json (frame thật từ atlas live, pin hash). Khi tạo human NPC neutral, image1 là Vương Lâm cùng hướng; concept NPC chỉ cung cấp nhận diện/phục trang ở input hỗ trợ. Trần Duy v3 là NPC đối chiếu, không thay Vương Lâm làm chuẩn hoặc tạo chuỗi NPC→NPC. Khi làm action, khóa nhận diện riêng của NPC và so trực tiếp với Vương Lâm ở native1×.

"""

for name in ['AGENTS.md', 'docs/ACTOR-ANIMATION-PRODUCTION.md', 'docs/skills/game-actor-animation-production/SKILL.md', 'docs/skills/game-actor-animation-production/references/production.md']:
    path = WORKSPACE / name
    text = path.read_text(encoding='utf-8')
    if 'Chuẩn NPC owner chốt 13/10' in text:
        continue
    if name.endswith('SKILL.md'):
        marker = '# Sản xuất animation nhân vật Vân Hải'
        assert marker in text
        text = text.replace(marker, marker + '\n\n' + NOTICE, 1)
    else:
        lines = text.splitlines(keepends=True)
        text = lines[0] + '\n' + NOTICE + ''.join(lines[1:])
    path.write_text(text, encoding='utf-8')

root = WORKSPACE / 'docs/design/characters/van-hai-npc-concepts-v4'
path = root / 'index.html'
text = path.read_text(encoding='utf-8')
for old, new in [
    ('Đối chiếu Pixel02 và Trần Duy v3', 'Chuẩn Vương Lâm trong game'),
    ('THEO MỐC TỶ LỆ V3', 'CHUẨN GỐC · VƯƠNG LÂM TRONG GAME'),
    ('Trần Duy v3 · mốc tỷ lệ / phong cách', 'Chuẩn tỷ lệ / phong cách · Vương Lâm trong game'),
    ('Trần Duy v3 tiếp tục là mốc tỷ lệ/phong cách.', 'Vương Lâm trong game là chuẩn gốc tỷ lệ/phong cách. Trần Duy v3 chỉ là NPC đối chiếu.')
]:
    text = text.replace(old, new)
path.write_text(text, encoding='utf-8')

path = root / 'review.mjs'
text = path.read_text(encoding='utf-8')
text = text.replace("'../wang-lin-pixel-production-v2/masters/southeast.png'", "'../van-hai-npc-visual-standard-v1/inputs/wang-lin-live-southeast-native.png'")
text = text.replace('Trần Duy v3 là mốc tỷ lệ / phong cách được chủ dự án xác nhận. Mỗi NPC mới vẫn cần đánh giá đầu, tóc, vai, thân, nét pixel và màu áo cạnh hai mẫu.', 'Chuẩn gốc là Vương Lâm đang dùng trong game: so trực tiếp đầu, tóc, vai, thân, nét pixel và đổ màu. Trần Duy v3 chỉ là một NPC để đối chiếu.')
text = text.replace('Trần Duy v3 · mốc phong cách', 'Trần Duy v3 · NPC đối chiếu')
path.write_text(text, encoding='utf-8')

path = root / 'review/verify.mjs'
text = path.read_text(encoding='utf-8').replace('live-Pixel02-and-owner-confirmed-Tran-Duy-v3-proportions', 'live-Wang-Lin-Pixel02-primary-reference')
path.write_text(text, encoding='utf-8')

note = """**Chỉ dẫn mới nhất 13/10:** owner yêu cầu lấy [Vương Lâm đang dùng trong game](../van-hai-npc-visual-standard-v1/README.md) làm chuẩn gốc. Trần Duy v3 chỉ là NPC so sánh. Các mô tả dùng v3 làm basis ở mốc trước là lịch sử trước chỉ dẫn này; raw/prompt/input/hash cũ giữ nguyên.

"""
for folder in ['van-hai-npc-concepts-v3', 'van-hai-npc-concepts-v4']:
    path = WORKSPACE / 'docs/design/characters' / folder / 'README.md'
    text = path.read_text(encoding='utf-8')
    if 'Chỉ dẫn mới nhất 13/10' not in text:
        path.write_text(text.replace('\n\n', '\n\n' + note, 1), encoding='utf-8')

print('Applied live Wang Lin primary style rule to project skill, guidance and review.')
