# Kho kế hoạch asset trước GDD 0.35

**Dọn ngày 15/10/2026 theo yêu cầu owner.** [Kế hoạch tổng thể GDD 0.35](../../ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) là kế hoạch áp dụng cho các đợt tiếp theo; [điểm vào asset](../../ASSET-PLAN.md), [mục lục docs](../../README.md) và [thư viện ART](../../design/README.md) dẫn cùng nguồn đó.

## Bốn kế hoạch đã ngừng áp dụng

| Hồ sơ lưu | Lý do thay thế |
| --- | --- |
| [ASSET-PLAN 1.6](ASSET-PLAN.md) | GDD 0.28, ba nhân vật playable, ngân sách frame/portrait cũ. |
| [ITEM-PRODUCTION-PLAN 0.2](ITEM-PRODUCTION-PLAN.md) | Lộ trình VP0–VP4/IT01–IT12 cho tuyến HN/EX. |
| [ITEM-CRAFTING-DESIGN 0.2](ITEM-CRAFTING-DESIGN.md) | Danh mục 13 định nghĩa/sáu recipe, không bao phủ năm cảnh giới. |
| [HANG-NHAC-VAN-NGOC-ASSET-PLAN](HANG-NHAC-VAN-NGOC-ASSET-PLAN.md) | Rà soát/ưu tiên asset 12/10 trước kế hoạch toàn GDD. |

Bản lưu có nhãn lịch sử và đã chỉnh gốc liên kết tương đối để đọc tại đây; những đích đã bị dọn trước đợt này giữ dưới dạng nhãn đường dẫn. [Manifest dọn tài liệu](manifest.json) ghi hash bản trước khi dọn, hash bản lưu, các liên kết đổi gốc và 21 file bằng chứng/runtime/map được đối chiếu nguyên trạng. Nội dung kế hoạch cũ không được dùng để suy ra số lượng cần làm hoặc quyền hiện hành.

## Phần giữ nguyên và cách triển khai tiếp

Nguồn hình/atlas, approval, basis, manifest production và dữ liệu items-v1 giữ nguyên. Đường dẫn gốc ASSET-PLAN trở thành mục dẫn; ba đường dẫn kế hoạch còn lại trở thành trang chuyển hướng để giữ liên hệ của manifest cũ. [Ghi chú items-v1](../../design/systems/items-v1/README.md) phân biệt snapshot lịch sử với danh mục mới chưa triển khai.

Ưu tiên đã thống nhất là A: kiểm kê toàn game và lập danh mục nguồn–recipe–đích tiêu–asset; B: nền vật phẩm dùng chung; C: sản xuất/ghép trọn Chặng 1 theo lượt nhỏ; D: VG07–VG11; E: các cảnh giới sau. Tận dụng nhân vật, quái và boss đã có, chỉ bổ sung phần thiếu. Chấp thuận kế hoạch không mở thêm ART/motion/balance/runtime approval.
