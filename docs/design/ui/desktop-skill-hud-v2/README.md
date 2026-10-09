# Thanh kỹ năng desktop 02 — ba phương án nhỏ

**Lịch sử:** sau bản này, chủ dự án cung cấp mẫu khung liền / cầu tài nguyên / dãy kỹ năng. Trang tương tác hiện dùng [bản 03 Vân Ngọc](../desktop-skill-hud-v3/README.md); các ảnh 02 và icon gốc giữ lại để đối chiếu / dùng lại.

[Mở so sánh / xem riêng A–B–C](http://127.0.0.1:5173/skill-bar-desktop.html) · [Đặc tả](../../../DESKTOP-SKILL-HUD.md) · [Kiểm kỹ thuật](../../../data/desktop-skill-hud-v2-verification.json).

| Phương án | Thanh / ô | Ảnh riêng |
| --- | --- | --- |
| A — Đồng cổ | 184 × 62 px / ô 48 × 48 | [A trên map](bronze-desktop.jpg) |
| B — Ngọc giản | 174 × 62 px / ô 44 × 52 | [B trên map](jade-desktop.jpg) |
| C — Ấn thuật | 178 × 60 px / ô tròn 48 | [C trên map](seal-desktop.jpg) |

[So sánh 1024 × 768](compare-1024.jpg) · [1366 × 768](compare-1366.jpg) · [1920 × 1080](compare-1920.jpg). Nền và nhân vật ở tỷ lệ chơi 1×; chiều rộng màn hình không phóng to thanh kỹ năng. Bản này phục vụ lựa chọn hình thức, desktop trước; mobile làm sau.

## Artwork

Icon Kiếm Khí / Lôi Ấn / Ngự Phong Bộ được tạo bằng **built-in ImageGen** trong phiên 09/10/2026:

- [PNG nguồn](skill-icons-source.png), 2172 × 724, giữ nguyên kết quả sinh.
- [Prompt đã dùng](icons.prompt.txt).
- [Atlas WebP](skill-icons-v2.webp), 288 × 96, ba ô 96 × 96, 15.062 byte.
- [Metadata / hash / trạng thái duyệt](icons.json).

Xuất atlas bằng thu mẫu đồng đều Lanczos3 và chuyển WebP chất lượng 92, giữ PNG gốc. Khung, phím, vòng hồi thuật và linh lực là HTML/CSS; artwork không chứa chữ. Chưa ghi nhận duyệt icon hoặc phương án HUD; không suy duyệt từ kết quả kỹ thuật.
