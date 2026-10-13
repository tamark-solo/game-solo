# Hắc Ấn03 · chỉnh đồng bộ người Pixel02

**Duyệt neutral13/10:** owner nhận xét “nhìn ổn rồi đó” và hỏi tiếp bộ skill/animation. [Approval pin hash](approval.json) áp một thân Đông Nam80/style03, chưa view mới/motion/VFX/Core hoặc các boss khác. `production.json`/biên bản trước giữ record sinh ảnh candidate ban đầu; acceptance nằm ở approval riêng. [Bước tiếp đề xuất](../../../BOSS-SKILL-ANIMATION-PLAN.md).

13/10/2026 · Owner báo Hắc Ấn khi so Vương Lâm khác style và tạo hình chưa ổn. [Sân so03](index.html), [bảng cùng nearest4×](review/style-4x.png), [bản02 giữ để đối chiếu](../van-hai-boss-concepts-v2/README.md).

Bản02 có mảng tô phẳng, vai dựng và vạt áo dài; chiều cao80 đã bằng người nhưng chưa giữ tỷ lệ đầu–thân/chất pixel của master. Bản03 **dựng mới từ master Vương Lâm**, không dùng officer02 làm input ảnh để tránh kế thừa lệch này. Chỉ style/anatomy tham chiếu, thân phận/costume mới: tóc hoa râm, mày nghiêm/râu ngắn, áo vải than/ngà compact, dải đỏ đất, thẻ ấn nhỏ gắn đai. Giày/chân rõ; bỏ vai giáp/cổ dựng/vạt áo kéo dài.

Một neutral Đông Nam, body80, canvas64×96/chân(32,88), lift0; alpha/bóng/FX riêng. **Candidate chờ duyệt**: `artApproved=false`, `ownerApproved=false`, `runtimeConsumable=false`, `animationProduced=false`. Cùng height không thay kiểm anatomy/style; owner đánh giá hình riêng, chưa tám view/motion/VFX/gameplay hoặc approval boss người. Lang Vương/Tam/Cổ và nguồn02 giữ nguyên byte.

Built-in ImageGen dùng một input `inputs/wang-lin-southeast-8x.png`, bản sao nearest8× nguyên pixel của masterSE. `production.json` pin master/input/prompt/raw/native, source plan và11file ART/metadataBoss02; không sửa master. Nguồn gen ở `raw/officer.png`, prompt `prompts/identity.txt`, tool/path/input tại `generation.json`.

`registration.json` ghi sole foreground boot support witness, source bounds/size, một scale từ neutral, translation và native bounds. Native resample nearest, alpha body≥210, không paint/xóa component/scale đầu hoặc thân riêng; raw RGBA giữ nguyên. Đây là phép đóng frame concept, chưa là root/socket/motion registration đầy đủ. Morphology tốt phải xem cùng master, không chứng minh bằng height80/test.

Sân so Vương Lâm / Hắc02 / Hắc03 ở zoom1×/2×/4×, sáng/tối/Vân Ngọc, silhouette/chân/bóng và canvas padding. Nền sáng mặc định để kiểm nét/khối, không dùng khí tức che lệch body. Giữ CSS px native, cuộn ngang trên mobile. Không animation clock/command/API/storage write. Vị trí là fixture ART, không spawn/nav mới.

Kịch bản Đạo Ấn/Phân Phù/Ấn Hồi theo [plan sinh cảnh](../../world/van-hai-living-world-v1/plan.json) giữ nguyên; FX/dư ảnh và nguồn đòn thật tách body, quyền hit/loot do Core/server. Hắc03 không tự chuyển đạo lộ/Đọa Ma. Sau duyệt neutral mới pin morphology/tám view/action/socket/FX; không làm lại các boss khác hoặc actor runtime trong đợt này.

Scoped `scripts/pack-dark-seal-officer-v3.py` chỉ ghi root03; dùng Python có Pillow. Kiểm `npm.cmd run test:dark-seal-officer-v3`; [biên bản](../../../data/dark-seal-officer-v3-2026-10-13.json). Giữ323player/3171body quái/map/navigation/DB/draft owner, không owner map builder hoặc thay actor live.
