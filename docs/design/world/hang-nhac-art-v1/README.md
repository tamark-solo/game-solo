# Hằng Nhạc — nền mỹ thuật v1

**Ngày:** 08/10/2026 · **Trạng thái:** bản mỹ thuật để duyệt, chưa tích hợp game/chưa có lớp va chạm.

> **Phản hồi chất lượng:** chủ dự án nhận xét nền mờ so với nhân vật ở camera 1×. V1 chưa đạt nền gameplay; xem [kiểm chứng sân chính native v2](../hang-nhac-art-v2/index.html). Chưa sửa chất lượng các khu còn lại.

Tạo bằng **imagegen tích hợp**, theo [prompt đầy đủ](hang-nhac-map-v1.prompt.txt) và [bố cục v0.1](../../../HANG-NHAC-MAP-LAYOUT.md). Không dùng CLI/API dự phòng. [Nguồn nền](hang-nhac-map-v1.png) được giữ nguyên sau khi tạo; không chỉnh ảnh bằng script. [Metadata](art-review.json) lưu kích thước, hash và điểm xem thủ công.

Mở [bản xem mỹ thuật](index.html) để xem toàn map, chọn khu theo khung 960 × 640, bật nhãn và ghép frame Vương Lâm R01 làm tham chiếu tỷ lệ. Nhân vật là lớp riêng; không vẽ thêm người/VFX/UI vào nền. Frame nguồn được tái sử dụng nguyên trạng, không thay gói VFX đã khóa.

**Thử tỷ lệ và camera:** [bản camera 1×](camera-study.html) giữ body Vương Lâm 80 px, desktop tối đa 960 × 640, khung hẹp 360 × 520 cắt vùng nhìn; có bám/cố định camera và đặt vị trí. [Ghi chú](CAMERA-STUDY.md) làm rõ neo chân, vùng nhìn và phạm vi thử; dùng pose đứng, chưa có animation di chuyển/va chạm.

[Ảnh sân trung tâm với Vương Lâm](camera-hn-z02-960.png) và [thước đo 80 px](camera-hn-z02-guide.png) cho thấy tỷ lệ thực trong camera 1×. [Kiểm tra camera](camera-verification.json) đạt ở màn 1280/736/360/320 px; bản xem toàn map bên dưới vẫn là chế độ fit để xem bố cục, không thay bản camera này.

## Những gì bản v1 thể hiện

- Sơn môn phía nam, sân trung tâm rộng, đình thổ nạp phía tây, sân luyện phía đông, ngoại vi phía tây nam, chuẩn bị phía đông nam và khảo nghiệm phía bắc.
- Hai cánh chính điện chừa hành lang giữa; đường từ sân lên đài không bị một mái lớn chắn kín.
- Hai vòng đi lại tây/đông; nền có đá núi, thông, trúc, lan can và mây ngoài các sân.
- Sân trung tâm không có đạo cụ đứng ở giữa; sân luyện để phần lớn diện tích trống. Hoa văn đá là chi tiết nền, không phải hitbox hoặc VFX.
- Một sơn môn dùng cho Z01/Z08; đài khảo nghiệm là lối vào phiên riêng, không thay arena chiến đấu ba pha.

## Tỷ lệ và giới hạn cần xử lý

Nền gốc **1448 × 1086 px**, RGB, đúng tỷ lệ 4:3. World 2400 × 1800 là tham chiếu thiết kế; bản xem chỉ ánh xạ ảnh vào world, không có thêm chi tiết như ảnh native 2400 × 1800. Không xuất lại ảnh phóng lớn rồi gọi đó là nguồn chất lượng cao hơn.

Tranh giữ quan hệ không gian nhưng **chưa trùng footprint/tọa độ blockout**: sân trung tâm, đình thổ nạp và sân luyện dịch lên phía bắc; một số bậc thang/lối nối hẹp hơn chiều rộng thử. Các neo trong metadata được quan sát trên ảnh để xem gần, không là spawn/collider/NPC runtime. Chưa sửa nguồn layout theo tranh và chưa coi diện tích trong tranh là vùng chiến đấu được duyệt.

Source hiện là một ảnh tổng hợp có mái, tán cây, lan can, đá và nền chung. Chưa có ground-only, lớp tiền cảnh, collider, occlusion hoặc atlas/chunk; đây là đầu vào duyệt mỹ thuật, không phải bộ map sản xuất hoàn chỉnh. Cần bảo đảm các đường vòng không bị collider/mái che, thử body/VFX R01 với camera thật và kiểm tra độ đọc khi đông người.

## Bước hoàn thiện sau duyệt mỹ thuật

1. Chọn giữ tọa độ blockout hay hiệu chỉnh chúng theo tranh; đo lại mặt đất và độ rộng các lối nối trước khi khóa.
2. Sản xuất nền mặt đất và các lớp kiến trúc/cây/đạo cụ riêng; bảo vệ đường đi và khoảng trống chiến đấu.
3. Đặt NPC/điểm tương tác, spawn, collider và cách xử lý che khuất; chơi thử tuyến HN01–HN12.
4. Làm nền arena riêng cho bài luyện/HN10 theo hợp đồng đã có; không thu arena vào footprint của lối vào.
5. Khi map hoàn thiện, tiếp tục đặc tả vận hành theo yêu cầu chủ dự án.

Không sửa runtime, bản sân cũ, nhân vật hoặc source ART/VFX trong lần sản xuất nền này.

## Kiểm tra bản xem

[Kết quả kiểm tra](verification.json): nền và frame nguồn nạp đúng, chọn đủ tám khu, khung camera đúng tỷ lệ 960:640, bật/tắt nhân vật/nhãn hoạt động; không lỗi script/tràn ngang/nhãn đè nhau ở màn 320, 736 và 1280 px. Khung camera desktop giới hạn rộng 960 px để xem body R01 ở 1×; màn hẹp thu khung theo tỷ lệ. [Toàn cảnh](review-overview.png), [sân trung tâm](review-zone-2.png), [sân luyện](review-zone-4.png) và [màn hẹp](review-mobile.png) được chụp từ bản xem, không là nguồn nền mới.
