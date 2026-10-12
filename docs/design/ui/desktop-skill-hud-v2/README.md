# Thanh kỹ năng desktop 02 — giữ nguồn icon dùng trong HUD 03

Ba phương án thanh nhỏ 02 được thay bởi [HUD 03 Vân Ngọc đã duyệt](../desktop-skill-hud-v3/README.md). Ngày 12/10/2026, bảy ảnh chụp các phương án cũ đã được dọn theo yêu cầu làm nhẹ dự án; danh sách đường dẫn, dung lượng và SHA-256 nằm trong [biên bản dọn](../../../data/asset-cleanup-2026-10-12.json).

Icon Kiếm Khí / Lôi Ấn / Ngự Phong Bộ đang được game và các trang review dùng lại, nên giữ đủ nguồn sản xuất:

- [PNG nguồn](skill-icons-source.png), 2172 × 724, đầu ra built-in ImageGen ngày 09/10/2026.
- [Prompt](icons.prompt.txt) và [metadata/hash tại thời điểm sản xuất](icons.json).
- [Atlas WebP](skill-icons-v2.webp), 288 × 96, ba ô 96 × 96, 15.062 byte.

Atlas được thu mẫu đồng đều Lanczos3 và chuyển WebP chất lượng 92; PNG giữ nguyên. [Kiểm chứng 02](../../../data/desktop-skill-hud-v2-verification.json) giữ hồ sơ lịch sử, gồm các đường dẫn ảnh đã dọn. Phạm vi duyệt HUD 03 không sửa ngược cờ lịch sử của manifest icon.
