# Giao diện người chơi · Đạo trình & Tư Vật Các

13/10/2026 · Tích hợp theo yêu cầu owner đồng bộ UI/UX với HUD và MMORPG tu tiên.

## Chất liệu và cấu trúc

Dùng lại khung cửa sổ/nút Tu Đạo hiện hành của [HUD và Nhân vật 04](HANG-NHAC-DAO-UI-RUNTIME.md), với lớp [Vân Ngọc 05](XIANXIA-PLAYER-UX-V5.md): nền mực ngọc, đồng ấm, giấy cổ cho nội dung, chữ tiêu đề Cambria. Không tạo bitmap mới hoặc đổi trạng thái duyệt ART.

`ChapterUI` nằm trong `#game-shell`, kế thừa theme và backing mask của khung. Ba tab tách mục đích sử dụng:

| Tab | Nội dung |
| --- | --- |
| Đạo trình | Danh sách HN05–HN12/EX01–EX04; chọn một bước để đọc lời dẫn, NPC, trạng thái, bước tiếp theo và thao tác nhận/vào bài/xác nhận. Không đưa tọa độ kỹ thuật vào chỉ dẫn người chơi. |
| Luyện chế | Sáu công thức hiện có; icon kết quả, lượng nguyên liệu trong túi/cần tiêu, món giữ lại, điều kiện và lý do chưa thể luyện. Một lệnh cho một lượt, chờ xác nhận server. |
| Chuẩn bị | M02, trạng thái ngọc, chuyến mang mẫu và báo cáo; chỉ hiện dịch vụ liên quan đến tiến trình hiện tại. |

Desktop có danh sách, trang chi tiết và túi vật liệu; bề ngang vừa giữ hai cột. Mobile dùng danh sách ngang cuộn, nội dung cuộn riêng, giữ tab/đóng/thông báo. Bảng bài ở ngoại vi có nút thu gọn và dùng cùng khung/nút của HUD.

## Lối vào và tương tác

| Lối vào | Kết quả |
| --- | --- |
| H / nút Đạo trình | Mở lại tab và mục đang đọc. Nút nằm trong nhóm trên phải của HUD05; ở mobile/màn ngang thấp, H và danh mục HUD giữ lối vào. |
| Chức năng → Luyện chế | Mở tab Luyện chế thật; chín chức năng đã mở, các hệ còn lại giữ “Chưa mở”. |
| Hành trang → Luyện chế | Chuyển trực tiếp sang tab Luyện chế. |
| Người coi chuẩn bị | Nút “Mở bàn luyện chế” vào tab Luyện chế. |
| Người hướng dẫn vận khí | Nút mốc tu luyện vào Chuẩn bị. |
| Người dẫn đường / hướng dẫn luyện thuật | Chọn bước đang làm hoặc có thể nhận thuộc NPC đó trong Đạo trình. |

Arrow Left/Right, Home/End đổi tab. Chọn mục mới đưa trang chi tiết về đầu; snapshot giữ mục, focus, cuộn dọc/ngang. Tích lũy cập nhật riêng, không dựng lại trang liên tục. Cửa sổ chặn đi/cast; Escape trả focus về game. ACK/retry dùng mã lệnh cũ; UI không sở hữu reward, kho hay tiến trình.

## Trang đối chiếu

`/gameplay-assets.html#recipe-workbench` dùng cùng chất liệu và sổ công thức có icon. Bàn thử chuyển lên trước bảng công thức, giữ select và thanh chọn đồng bộ. Túi mẫu, điều kiện giả định và kết quả dự kiến được ghi rõ; trang không gửi lệnh game hoặc thay hồ sơ.

## Kiểm chứng

- Typecheck/boundaries và build qua.
- `hang-nhac-chapter-browser`: học phương pháp → luyện ngọc → trang bị → vào HN08 → hộ thân thật → về hub; còn hai vật liệu, cùng một món ngọc. Kiểm tab/phím, focus, lý do khóa, lối vào NPC/Hành trang, viewport 1366×900, 390×844, 320×740 và 844×390.
- `test:hang-nhac-dao-ui`: năm nhóm, bảy bố cục HUD05; danh mục → Luyện chế thật và chặn input trong cửa sổ.
- `test:hang-nhac-character`: bốn nhóm online, 11 nhóm/21 bố cục browser.
- `test:hang-nhac-hud-layers`: kích thước HUD/native, server cast, alpha/thứ tự vẽ và reload qua.
- `test:hang-nhac-reload`: reload, reconnect, backend restart và rời game trong phục hồi qua.
- `van-ngoc-gameplay-assets-smoke`: sáu công thức mẫu, icon native, chọn công thức, responsive, không viết storage hoặc gọi API game.

Ảnh/báo cáo fixture nằm ở `artifacts/hang-nhac-chapter/`, `artifacts/hang-nhac-dao-ui/` và `artifacts/van-ngoc-gameplay-assets/`. Kiểm kỹ thuật không thay nghiệm thu hình; map/navigation/save owner và gameplay server không đổi.
