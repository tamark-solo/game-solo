# Boss · bộ chiêu, animation và VFX tiếp nối

> Cập nhật15/10: artwork/animation/VFX boss thuộc bộ GDD cũ đã [lưu trữ](archive/gdd-legacy-enemies-2026-10-15/README.md). Các liên kết ART lịch sử dưới đây dẫn đến thông báo retirement. Tài liệu giữ nguyên brief mechanics/đường né tham khảo; không mở lại workflow sản xuất ART cũ. [Tạo hình GDD mới đã duyệt](design/characters/gdd-character-concepts-v1/index.html).

**Tiếp nối VFX Hắc02:** theo phản hồi owner, [Triện Thuật02](design/vfx/dark-seal-officer-vfx-v2/README.md) làm lại riêng hiệu ứng và trải nghiệm A/B ba chiêu;8sequence/48frame, body/kit/fixture01 nguyên byte. Tụ/phát có hình riêng, contact theo fact trúng, Phân Phù cổng giấy/dư ảnh mờ, Ấn Hồi radius112 và khe90° theo hướng khóa. ART/VFX02 đã được owner duyệt theo [106hash](design/vfx/dark-seal-officer-vfx-v2/approval.json); nhịp gameplay/AI/server/loot vẫn cần bước riêng.

13/10/2026 · Owner chấp nhận Hắc Ấn03 và đồng ý bắt đầu theo thứ tự đề xuất. Đợt đầu đã sản xuất [Lang Vương solo Motion01](design/characters/cloud-wolf-king-animation-v1/README.md): 64clip/384pose action tám hướng và năm sequence VFX/30frame riêng. Nanh cắn, Vân Nha và Hồi Phong dùng nhịp fixture để xem hình và đường né; Owner đã duyệt ART/motion/VFX của bộ đang xem qua [approval556hash](design/characters/cloud-wolf-king-animation-v1/approval.json); balance/AI/live còn riêng. Tiếp theo đã sản xuất [Hắc Ấn Motion01](design/characters/dark-seal-officer-animation-v1/README.md),72clip/432pose tám hướng và6FX/36frame, mới chờ duyệt hình. [Brief gốc](design/world/van-hai-living-world-v1/plan.json) giữ nguyên hash.

Neutral đã được ghi duyệt riêng: [Lang Vương01](design/characters/van-hai-boss-concepts-v1/approval-wolf.json), [Hắc Ấn03](design/characters/van-hai-dark-seal-officer-v3/approval.json). Phạm vi hai approval neutral là một thân Đông Nam. Lang Motion01 có approval riêng mới; không suy duyệt Hắc motion, gameplay hoặc Tam/Cổ từ feedback đó. Tam128/Cổ160 vẫn là concept đề xuất, không scale runtime đã chốt.

## Chốt chiêu trước khi sản xuất motion

Mỗi chiêu cần intent, dấu hiệu body, vùng/hướng báo, mốc khóa mục tiêu, release/resolve, recovery/cửa phản công, quy tắc bị đánh/hủy và chuyển pha. Prototype đường né bằng di chuyển thường80px/s, xét footprint và độ trễ; Shift/Phong có ích nhưng không là điều kiện né duy nhất. HP/damage/timing/quota/drop chưa khóa từ tên hoặc ảnh skill.

| Boss | Bộ dự kiến từ brief | Mốc cần kiểm |
| --- | --- | --- |
| Lang Vương | Vân Nha: chồm thẳng; Hồi Phong: quét vòng; Lang Khiếu: gọi đàn ở bước mở rộng | Solo với hai chiêu trước; khóa trục chồm, vòng có lối thoát và hồi thế rõ. Gọi đàn cần luật vị trí/nhịp/FX riêng. |
| Tam Ấn | Ấn Thân: cung trước; Ấn Khí: vòng khóa điểm; Ấn Thuật: đường ấn | Giữ HN10 hiện hành; double line đã báo. Body mới không tự dùng64clip Khôi Lỗi02 hoặc thay quy tắc chỉ vì tên chiêu. |
| Cổ Mộc | Rễ khóa tuần tự; Khí phản tia hành lang; Mở lõi là cửa phản công | Mở lõi là state/recovery, không tự thêm damage. Prototype rễ/vùng thoát trước party và ART chuỗi dài; không bít sân hoặc sửa blocker để diễn chiêu. |
| Hắc Ấn | Đạo Ấn: tia khóa; Phân Phù: dư ảnh; Ấn Hồi: vòng thu có khe | Nguồn thật phân bằng hình/pose; dư ảnh là presentation trước, không tự có hit/loot/entity mới. Giữ đường né thường và hồi thế. |

## Bộ sản xuất

1. **Bảy view còn lại:** tám hướng thật cùng identity/scale của neutral đã chốt, kiểm cả mặt trước/lưng/điểm chân. Không mirror hoặc fit pose để đủ số.
2. **Action nền:** idle, di chuyển phù hợp morphology, attack, hit, death; thêm appear và hai–ba motion skill theo kit. Rooted Cổ Mộc cần chốt idle/replant/turn phù hợp, không ép walk của người hoặc sói. Warning/prepare/release/recovery có thể là phase trong clip, không nhất thiết tách mỗi phase thành action độc lập.
3. **VFX riêng:** warning, release, contact và aura/prop/dư ảnh tách body. Hit chỉ từ fact server; hụt không contact, hủy trước release không phát thuật, tail có tuổi hết hạn/dedup riêng. Không dùng animation callback làm damage/loot.
4. **Sân kiểm:** cùng Player native1×; tám view, chuyển action, locked aim, hit/miss/cancel và seek theo clock Core. Có nhóm thì phối hợp [giãn vị trí, dàn nhịp và FX chồng](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md). ART/QA/cân bằng/runtime được ghi phạm vi riêng.

## Thứ tự đề xuất

**Lang Vương trước:** neutral đã chốt, họ sói/animation thường đã có để đối chiếu, kit solo dễ kiểm. Làm trọn body tám hướng + Vân Nha/Hồi Phong + FX và sân review; Lang Khiếu/adds tiếp nối sau khi nhịp solo ổn.

**Hắc Ấn sau:** neutral03 đã chốt; giữ anatomy Pixel02 khi cast, một thân và dư ảnh/ấn riêng. Tam Ấn tiếp nối theo body/scale được xác nhận và facts HN10; Cổ Mộc sau prototype rễ/địa hình. Thứ tự này không thay kế hoạch gameplay P0–P3 hoặc boss đang chạy.

Khi owner chuyển sang sản xuất, đọc [skill actor](skills/game-actor-animation-production/SKILL.md), dùng root version mới, pin approval inputs và scoped pack/test. Giữ người/quái/boss nguồn hiện hành, authored map/navigation/DB/draft; không owner map builder hoặc tự mở farm/party/Đọa Ma.
