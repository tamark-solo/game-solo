# Navigation và chức năng HUD 04

**11/10/2026 · bản thiết kế mới, chờ đối chiếu.** [Lý do/reference/luồng/thông tin cần phát triển](../../../XIANXIA-FUNCTION-UX-REDESIGN.md). [Trang thử](http://127.0.0.1:5174/ui-material-review.html) có HUD, menu tìm/ghim và Đối chiếu icon.

## Nguồn gốc

- 38 glyph SVG nguyên bản viết trong [dao-hud-glyph.ts](../../../../client/src/ui/dao-hud-glyph.ts); không dùng hình hoặc đường path của game khác.
- Canvas 64×64, hình chính lớn và khoảng trống rộng, nét phụ 3.5–4 đơn vị; kiểm ở 24/32/40px. Theme giữ hình nhận diện, đổi màu vật liệu qua token presentation.
- Tu Đạo: mảng ngà `#f7eed7`, chi tiết âm `#202620`, điểm ngọc `#a7d3c0`. Đọa Ma: ngà `#f5e9d6`, chi tiết âm `#28232a`, điểm huyết đồng `#e5a18a`.
- Đây là code-native navigation, không ImageGen/raster. ART vật phẩm/skill và khung cũ vẫn là nguồn riêng. [48 bitmap 03](../dao-system-hud-v1/README.md) giữ để so trực tiếp.

## Index và ownership

[Index chức năng](../../../../client/src/core/dao-hud-system.ts) định nghĩa 38 ID, bảy nhóm, mục đích, trường đọc, luồng dự kiến, liên kết và shortcut. [Snapshot bàn giao](functions-v04.json) xuất từ đúng index để designer tra; không là loader gameplay, content definition hoặc quyền backend.

State tìm/ghim trong Core của review, renderer/glyph/CSS ở UI, adapter gốc nối input/focus; không fetch API game, room, browser storage hoặc SQLite. Năm ghim chỉ là tùy chọn trình bày trong phiên review. Không sửa owner map/nhân vật.

## Trạng thái

`ownerApproved=false`, `artApproved=false`, `runtimeIntegrated=false`. Hình glyph, nhóm/luồng và các đề xuất cần đối chiếu; kiểm kỹ thuật không tự là nghiệm thu usability. [Verification 04](../../../data/dao-system-hud-v4-verification.json) giữ layout, route và interaction riêng.
