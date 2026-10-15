# Điểm vào kế hoạch asset — GDD 0.35

**Cập nhật 15/10/2026 · owner đã đồng ý kế hoạch tổng thể.** Mọi đề xuất sản xuất asset mới bắt đầu từ [kế hoạch vật phẩm, nguyên liệu và asset toàn game](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md), dựa trên [GDD 0.35](GDD.md) và [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md).

## Tài liệu áp dụng

| Phạm vi | Nguồn đọc | Vai trò |
| --- | --- | --- |
| Toàn game, năm cảnh giới, sáu luồng phát triển | [Kế hoạch tổng thể](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) | Một thứ tự triển khai A–E; lập danh mục nguồn–recipe–đích tiêu–asset trước khi chốt số hình mới. |
| Chặng truyện và điều kiện mở | [Hợp đồng](GDD-035-UNIFIED-CONTRACT.md), [tiến trình](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md), [Artwork–Logic](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md) | VG01–VG11, hai đường Trúc Cơ, pháp bảo và phần bổ sung theo chặng. |
| Huyễn Tâm/Tịch Bạch và bốn pháp bảo | [Kế hoạch triển khai chuyên ngành](WANG-LIN-IMPLEMENTATION-PLAN.md), [GDD character animation pack](design/characters/gdd-character-animation-v1/README.md) | Dùng source GDD mới; runtime adapter và phần thiếu sẽ làm lại theo từng bước. |
| Quái, tinh anh, NPC và boss | [Thư viện ART](design/README.md), [roster thế giới](VAN-HAI-LIVING-WORLD-PLAN.md), [bộ chiêu boss](BOSS-SKILL-ANIMATION-PLAN.md) | Tái dùng đúng identity, trạng thái nguồn và approval của từng gói. |
| Nền và đạo cụ map | [Chuẩn Vân Ngọc V2](HANG-NHAC-VAN-NGOC-BASELINE.md) | Giữ nguồn và navigation owner; danh mục mới ghi rõ asset nào đã có trong nền. |
| UI/HUD | [Đạo Ấn V3](HANG-NHAC-DAO-AN-V3.md), [định hướng UI theo GDD](UI-UX-HUD-REFERENCE-DIRECTION-2026-10-15.md) | Kiểm icon/vật phẩm trong UI hiện hành; hotbar F + 1–7. |

## Trạng thái và cách đếm

Danh mục thiết kế, dữ liệu runtime, artwork, bản xuất và approval là các lớp riêng. Quyết định làm kế hoạch không duyệt thêm ART, balance hoặc ghép game. Số icon mới được tính sau kiểm kê; không dùng tổng 60/100/136 frame hay 13 item của kế hoạch cũ làm ngân sách GDD 0.35. Tư Đồ Nam và Lý Mộ Uyển có vai trò theo GDD hiện tại, không là hai tuyến playable bổ sung.

## Kế hoạch cũ

Bốn bản kế hoạch trước GDD 0.35 đã chuyển sang [kho lịch sử và biên bản dọn](archive/asset-plans-before-gdd-035-2026-10-15/README.md). [Manifest items-v1](design/systems/items-v1/README.md) và gói hình liên quan giữ nguyên để truy nguồn/kiểm tương thích. Các đường dẫn ITEM-PRODUCTION-PLAN, ITEM-CRAFTING-DESIGN và HANG-NHAC-VAN-NGOC-ASSET-PLAN còn lại chỉ hướng tới kế hoạch này và bản lịch sử.
