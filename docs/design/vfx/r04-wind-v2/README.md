# R04 wind · Linh ảnh khí ấn · 2.0.0

**Hồ sơ nguồn:** Snapshot nguồn R04 lúc sản xuất, giữ dữ liệu/frame nguyên trạng. Linh ảnh V2 hiện đã được chấp nhận, pack 2.0.1 ghi duyệt. Xem [trạng thái hiện hành](../NGUYEN-ANH-KIT.md) và [bàn giao](../STARTER-VFX-HANDOFF.md).

Nguồn spirit mới: `source/spirit-wind-sigil.png`; prompt: `prompts/spirit-wind-sigil.txt`. Imagegen tích hợp vẽ sáu frame nửa thân từ nét linh khí, không da/mặt/tóc/giày. PNG rời là nguồn chính; atlas là build output.

Giữ nguyên 40 frame còn lại từ V1. Linh ảnh dùng canvas 80×80, anchor 40,72 tại gốc khí, cao tối đa 48 world px, layer 0.5 sau body 1. Không tăng thân Vương Lâm; không actor/AI/collision/damage. Adapter V2: production/r04-sigil-controller.mjs, draw record có scale. Phong nhập vào vùng thân theo arrival thật, không thêm tàn ảnh người.

Nguồn và gói V1 giữ riêng. Trạng thái nguồn lúc sản xuất: chờ xem motion V2; chưa tích hợp runtime/hướng khác/SFX/LOD. Hồ sơ chung: NGUYEN-ANH-KIT.md.
