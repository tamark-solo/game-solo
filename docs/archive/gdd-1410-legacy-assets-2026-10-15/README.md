# GDD 14/10 legacy asset cleanup · 15/10/2026

Bản test đã retire các asset source main/NPC/map/runtime cũ theo yêu cầu owner. Gói GDD mới giữ tại `docs/design/characters/gdd-character-animation-v1`; adapter runtime/public asset sẽ làm ở lượt sau.

`manifest.json` ghi commit gốc, root và dung lượng trước khi dọn. Khôi phục toàn bộ bằng Git từ commit `cb9e843d`; không lưu ZIP để giữ checkout nhẹ.

Không xóa database/save/server logic; các asset G2/Đạo Ấn mới và source GDD mới được giữ lại.

Các thư mục generated trong `client/public/assets` là ignored và không thuộc Git patch, nên 448 file cache cũ vẫn còn trong checkout hiện tại. Chúng được liệt kê riêng trong `manifest.json` dưới `ignoredGeneratedRootsPendingCleanup`; không dùng chúng làm nguồn runtime mới. Các lệnh `assets`, map smoke và actor smoke hiện vẫn trỏ vào source đã retire, vì adapter GDD mới chưa được triển khai.
