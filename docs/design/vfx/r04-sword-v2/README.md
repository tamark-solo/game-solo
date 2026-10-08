# R04 sword · Linh ảnh khí ấn · 2.0.0

Nguồn spirit mới: `source/spirit-sword-sigil.png`; prompt: `prompts/spirit-sword-sigil.txt`. Imagegen tích hợp vẽ sáu frame nửa thân từ nét linh khí, không da/mặt/tóc/giày. PNG rời là nguồn chính; atlas là build output.

Giữ nguyên 50 frame còn lại từ V1. Linh ảnh dùng canvas 80×80, anchor 40,72 tại gốc khí, cao tối đa 48 world px, layer 0.5 sau body 1. Không tăng thân Vương Lâm; không actor/AI/collision/damage. Adapter V2: production/r04-sigil-controller.mjs, draw record có scale. Phong nhập vào vùng thân theo arrival thật, không thêm tàn ảnh người.

Nguồn và gói V1 giữ riêng. Chờ xem motion V2; chưa tích hợp runtime/hướng khác/SFX/LOD. Hồ sơ chung: NGUYEN-ANH-KIT.md.
