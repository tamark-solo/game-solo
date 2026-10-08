# Định hướng MMORPG — Hằng Nhạc và hành trình nhân vật

**Phiên bản:** 0.8 · **Ngày:** 08/10/2026 · **Tham chiếu:** [GDD](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [online](ONLINE-DIRECTION.md), [nhân vật](CHARACTERS.md).

## 1. Hướng đã chốt

MMORPG web có idle. Người chơi chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, dùng map Hằng Nhạc để học game và tiến triển qua Ngưng Khí; sau map đầu mới mở sâu công pháp, tổ hợp và hành trình riêng từ Trúc Cơ.

Không dùng mô hình tạo đệ tử mới hoặc chờ arc sau mới mở nhân vật. [Bản trước](archive/design-before-three-playable-characters/MMORPG-DIRECTION.md) giữ làm lịch sử. Pixel art chibi trên nền stylized 2D/top-down ba phần tư, UI/truyện tranh mực–giấy cổ giữ theo quyết định ART.

## 2. Nền nhập môn và phân hóa

| Giai đoạn | Nội dung chung | Khác biệt |
| --- | --- | --- |
| Hằng Nhạc/Ngưng Khí | Di chuyển, NPC, nhiệm vụ, tài nguyên, tu luyện, thuật nền, combat/né, pháp bảo đơn giản, khảo nghiệm cuối | Lời dẫn, trạng thái và dấu nhận diện nhẹ; Tư Đồ Nam là hồi phục phần năng lực |
| Sau map đầu/Trúc Cơ | Vòng khám phá–chuẩn bị–tu luyện–khảo nghiệm | Công pháp, cách vận dụng thuật, pháp bảo và tuyến riêng |
| Các arc cao hơn | Mốc nội dung và hoạt động nhóm mới | Bình cảnh, cơ duyên, lĩnh ngộ và truyền thừa theo từng người |

Một lựa chọn đầu game phải có bản sắc nhưng không buộc người mới đọc nhiều cây build. Sau Hằng Nhạc, khác biệt phải thay đổi lựa chọn/hành động, không chỉ số hoặc màu skill. Cả ba tự chơi được, không bắt buộc có một người khác để hoàn thành nhập môn.

## 3. Phân kỳ đề xuất

| Lát | Kết quả cần kiểm chứng |
| --- | --- |
| A — Nhập môn online hẹp | Cả ba chọn được, bước vào Hằng Nhạc, hai tài khoản thấy nhau và có nhiệm vụ/tiến trình riêng; tu luyện đầu và combat đơn giản |
| B — Toàn map Hằng Nhạc | Tiến triển Ngưng Khí, luyện thuật, pháp bảo nền và khảo nghiệm cuối; mục tiêu chuẩn bị Trúc Cơ khi rời map |
| C — Phân hóa | Công pháp/tổ hợp và tuyến riêng đầu tiên, điều chỉnh lựa chọn trước đầu tư sâu |
| Arc sau | Mỗi arc có vòng chơi, map/NPC/đối thủ, nguồn truyện và ngân sách riêng |

Thay A cũ “không combat tới tầng 1” / B “một trận truyện”. Số nhiệm vụ/map, thứ tự kỹ thuật và lịch phát hành chưa khóa. Lát A dừng ở mốc đầu không đồng nghĩa Hằng Nhạc đã hoàn thành.

## 4. Truyện, thế giới và hoạt động lặp

Hằng Nhạc chung cho cả ba là chuyển thể. Không kể lại rằng họ cùng nhập môn trong nguyên tác. Chương cá nhân/tổ đội giữ nguồn và trạng thái theo tuyến; một người hoàn thành không đổi toàn server. Các người cùng chọn một nhân vật là các hồ sơ gameplay riêng.

Node WORLD-MAPS cũ tham chiếu hành trình Vương Lâm, chưa là địa lý/map đi lại đã duyệt. Không tự biến mọi nhân vật/sinh vật của một biến cố truyện thành quái farm. Hoạt động lặp, loot, party, boss/PvP/giao dịch cần hồ sơ riêng, không phát sinh tự động từ nhãn MMORPG.

## 5. ART và thực trạng

Giữ nhận diện bộ ba đã duyệt/tạm chấp nhận trong hồ sơ ART. Mẫu đệ tử cũ chỉ dùng nghiên cứu và preview lịch sử, không là roster người chơi hiện hành. Không đổi pixel/animation hoặc runtime trong lần cập nhật định hướng.

Đợt VFX 15 skill R01–R05 đã được chấp nhận và đóng. Có hình Hóa Thần không mở quyền dùng Hóa Thần tại nhập môn; chưa có đầy đủ animation chiến đấu của cả ba hoặc luật gameplay của từng thuật. [Bàn giao](design/vfx/STARTER-VFX-HANDOFF.md).

Client/backend preview hiện có là công cụ kỹ thuật; tài khoản/lưu bền vững và gameplay cần đặc tả tiếp. Ngân sách portrait/map/animation cũ và hạn mức người/phòng không được coi là nghiệm thu sản phẩm mới.
