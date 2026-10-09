# HUD Vân Ngọc — desktop 03

[Mở bản thử trên map](http://127.0.0.1:5173/skill-bar-desktop.html) · [Đặc tả](../../../DESKTOP-SKILL-HUD.md) · [Kiểm kỹ thuật](../../../data/desktop-skill-hud-v3-verification.json).

Hướng theo Type 2 trong mẫu chủ dự án: khung liền, cầu sinh lực bên trái, linh lực bên phải, dãy 10 ô ở giữa. Đồng cổ / ngọc / mây / sen thay chất gothic; ô 36 px, khung 760 × 140 px, nhân vật native 1×. Ba thuật hiện có thao tác thử được, bảy ô chưa gán không có hành động. Desktop trước; mobile làm sau. Chưa ghi nhận duyệt hình hoặc tích hợp game.

**Bản tương tác hiện có [Khí quang 02](qi-v2/README.md):** vật liệu khí xoáy ImageGen trong hai cầu, vòng trận pháp, ánh hắt khung và phản hồi dùng thuật. Có nút Linh quang để đối chiếu với nền 03; các ảnh dưới đây giữ bản khung trước khi thêm FX.

## Đối chiếu

- [Ảnh ở cửa sổ hiện tại](desktop-native.jpg).
- [Chi tiết thanh HUD](hud-detail.jpg).
- [1024 × 768](desktop-1024.jpg), [1366 × 768](desktop-1366.jpg), [1920 × 1080](desktop-1920.jpg).
- [Sinh lực thấp](low-health.jpg), [thiếu linh lực](low-mana.jpg), [mô tả skill](tooltip.jpg).

## Nguồn

Khung được tạo bằng **built-in ImageGen**:

- [Ảnh mẫu](layout-reference.png) — tham chiếu bố cục, không là chỉ dẫn gameplay.
- [Prompt đã dùng](frame.prompt.txt).
- [PNG nguồn](cultivation-frame-source.png) — 2172 × 724, giữ nguyên alpha/kết quả sinh.
- [WebP sản phẩm](cultivation-frame-v3.webp) — 1520 × 280, 169.946 byte.
- [Metadata / crop / hash / trạng thái duyệt](frame.json).

Xuất bằng [build-skill-hud-frame.mjs](../../../../scripts/build-skill-hud-frame.mjs): cắt lề trong suốt và thu mẫu đồng đều, không tái vẽ hoặc sharpening. Dùng lại [icon / prompt 02](../desktop-skill-hud-v2/README.md); nút, số và vòng hồi thuật là UI thực. Ngọc cầu dùng mức tài nguyên của snapshot, không chứa số hoặc tài nguyên cố định trong tranh khung.
