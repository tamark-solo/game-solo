# Định hướng MMORPG — Hằng Nhạc và hành trình nhân vật

**Phiên bản:** 0.9 · **Ngày:** 11/10/2026 · **Tham chiếu:** [GDD 0.32](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [online](ONLINE-DIRECTION.md), [nhân vật](CHARACTERS.md).

**Hướng owner làm rõ:** sức mạnh có ý nghĩa, farm đồ/build, PvE/PvP và thể hiện nhân vật qua thời trang/tọa kỵ/pháp bảo là vòng xuyên suốt tu tiên/tu đạo. [Kế hoạch MMORPG](MMORPG-PROGRESSION-PLAN.md) có ma trận từng chặng; [Core/backend](MMORPG-SYSTEM-CONTRACTS.md) ghi phần phải mở rộng. Cốt truyện, Đạo đồ và lựa chọn tạo động lực cho vòng này. Quyết định sản phẩm không tự khóa loot/PvP/balance/monetization/ART cụ thể.

## 1. Hướng đã chốt

MMORPG web có idle. Người chơi chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, dùng map Hằng Nhạc để học game và tiến triển qua Ngưng Khí; sau map đầu mới mở sâu công pháp, tổ hợp và hành trình riêng từ Trúc Cơ.

Cả ba có Kiếm Khí, Lôi Ấn và Ngự Phong Bộ R01 ngay khi bắt đầu điều khiển. Tutorial dạy dùng thuật, không khóa quyền sau nhiệm vụ; runtime R01 đã có, số liệu vẫn baseline theo [hồ sơ gameplay](NGUNG-KHI-GAMEPLAY-SPEC.md). Map/layer/HUD và HN01–HN04 đã tích hợp. Ưu tiên RM0/RM1/RM2 là đặc tả/nền tối thiểu/HN05, không chờ làm lại map hoặc tự mở toàn MMO vì phân kỳ bên dưới đã có.

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

Chọn một pilot farm/PvE lặp, tỷ thí tự nguyện hoặc diện mạo theo gate sau nền RM2 đủ ổn để kiểm mục tiêu sớm; không cần đợi hoàn tất chợ/bang hội/toàn RM5. Farm mạnh lên có nguồn–chi/đích dùng, PvP có ruleset và vùng tham gia rõ, cosmetic có nguồn kiếm được và projection công khai riêng. Tuyến chính solo giữ nguyên; tranh đoạt tài nguyên là hoạt động riêng cần luật, không tự khóa quest của người yếu.

## 5. ART và thực trạng

Giữ nhận diện bộ ba đã duyệt/tạm chấp nhận trong hồ sơ ART. Mẫu đệ tử cũ chỉ dùng nghiên cứu và preview lịch sử, không là roster người chơi hiện hành. Không đổi pixel/animation hoặc runtime trong lần cập nhật định hướng.

Đợt VFX 15 skill R01–R05 đã được chấp nhận và đóng. R01/cast bộ ba đã nối runtime; có hình Hóa Thần không mở quyền dùng Hóa Thần tại nhập môn. Animation enemy/tọa kỵ/diện mạo và gameplay R02–R05 cần brief/gate riêng. [Bàn giao](design/vfx/STARTER-VFX-HANDOFF.md).

Client/backend có entry tài khoản/lưu bền vững local và gameplay nhập môn pilot; [trạng thái checkout](PROJECT-STATUS.md) ghi giới hạn. Loot/PvP/appearance/kinh tế/MMO production cần đặc tả và nghiệm thu theo gói. Ngân sách portrait/map/animation cũ và hạn mức người/phòng không được coi là công suất hoặc nghiệm thu sản phẩm mới.
