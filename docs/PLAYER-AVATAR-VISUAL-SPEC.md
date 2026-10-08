# Đệ tử người chơi — tạo hình và bộ pixel thử đầu tiên

> **Đối chiếu GDD 0.25 — 08/10/2026:** chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, Hằng Nhạc qua Ngưng Khí, phân hóa sau map đầu. Hai mẫu đệ tử trong hồ sơ này là nghiên cứu/preview lịch sử, không là roster nhân vật người chơi chính của GDD hiện hành. Xem [GDD](GDD.md) và [hệ thống tu tiên](CULTIVATION-SYSTEM.md). Quyết định mới được ưu tiên khi nội dung bên dưới mâu thuẫn.

**Phiên bản:** 0.1, ngày 07/10/2026.  
**Phạm vi:** hai mẫu `AVATAR-NOVICE-MALE/FEMALE`, cùng đồng phục nhập môn; tên riêng do người chơi đặt.  
**Trạng thái:** tạo hình v2 và bộ đứng/đi thử đã dựng để đánh giá; nhận diện và chuyển động đệ tử chưa được người phát triển duyệt.  
**Xem:** [trang so sánh và thử trên sân](design/characters/player-avatars-v2/index.html), [nguồn/prompt](design/characters/player-avatars-v2/README.md), [dữ liệu nghiên cứu](design/characters/player-avatars-v2/study.json), [roster](data/character-roster.json).

**Cập nhật bộ đi:** preview hiện dùng [bản sửa tay/chân](GAIT-CORRECTION.md), tám pose/hướng và 36 frame/mẫu. Bộ 28 frame dưới đây giữ làm lịch sử và tham chiếu nhận diện/palette; các frame đi mới chờ đánh giá.

## 1. Vai trò và nguồn thiết kế

Đây là hai mẫu nhân vật **do game bổ sung**, không phải người có tên trong tiểu thuyết. Hai mẫu dùng chung giữa tài khoản; một người chọn mẫu và đặt tên cho đệ tử riêng. Chọn mẫu hình không cộng/trừ chỉ số, không đổi tuyến tu luyện hoặc quyền sử dụng trang bị.

Giữ chất liệu, trang phục giản dị và ngôn ngữ hình ảnh nhập môn của game. Không gán tiểu sử hay vật phẩm độc hữu của Vương Lâm cho người chơi. Chưa sản xuất bộ đời thường, bộ áo đỏ hoặc ngoại hình cảnh giới cao trong gói này.

## 2. Nhận diện đề xuất v2

| Dấu hiệu | Đệ tử nam | Đệ tử nữ | Vương Lâm để đối chiếu |
| --- | --- | --- | --- |
| Tuổi thể hiện | Người trưởng thành trẻ, 20–22 | Người trưởng thành trẻ, 20–22 | Thiếu niên ở giai đoạn nhập môn |
| Mặt | Rộng, hàm hơi vuông, lông mày thẳng | Oval rộng, hàm mềm, lông mày rõ | Mặt trẻ, mảnh theo nhận diện đã duyệt |
| Tóc | Búi cao gọn; gáy không có tóc dài thả xuống | Một búi thấp sau gáy; ngôi giữa, sợi ngắn cạnh má | Tóc đen dài buộc nửa đầu, tóc sau dài |
| Dáng | Vai rộng hơn, đứng thẳng, khối thân chắc | Dáng gọn, đứng thẳng, cùng mức trang bị | Dáng thiếu niên mảnh |
| Đai | Xanh ngọc trầm, một vạt ngắn | Cùng xanh ngọc trầm, một vạt ngắn | Đai tối |
| Trang phục | Áo xám, cổ ngà, quần tối, quấn chân, giày vải | Cùng chất liệu và cấp trang phục; thuận tiện đi lại | Giữ áo xám theo chính truyện |

Chi tiết mặt/tóc và tuổi của đệ tử là lựa chọn ART. Màu đai là dấu nhận diện **mẫu hình**, không là mã phe phái hoặc phẩm chất trang bị. Không suy màu trang phục Vương Lâm từ cảnh giới của người chơi.

Bảng chân dung giữ tranh mực/giấy cổ. Sprite giản lược nếp vải, mặt và đường áo về các cụm pixel; không thu nhỏ nguyên bảng chân dung làm sprite. Gấu áo/sợi tóc dạng nét mực trong bảng là cách minh họa chất liệu, không là trạng thái hư hại của nhân vật.

## 3. Chuẩn pixel dùng lại

Lấy bộ áo xám Vương Lâm làm chuẩn thử theo phản hồi của người phát triển. Chuẩn này quy định **frame nhân vật**, không quy định ô map hay va chạm.

| Hạng mục | Giá trị cho mỗi mẫu |
| --- | --- |
| Frame | **64 × 96 px** |
| Hình trong frame hiện tại | Nam cao 78–82 px; nữ 77–82 px, theo hướng/tư thế |
| Điểm chân | **(32, 88)** |
| Hướng | `south/west/east/north` |
| Đứng | 1 frame/hướng; 4 frame tổng |
| Đi | 6 frame/hướng; 24 frame tổng |
| Tổng | **28 frame/mẫu; 56 frame cho hai mẫu** |
| Nhịp thử | 8 FPS; 0,75 giây/vòng |
| Atlas | 7 cột × 4 hàng; **448 × 384 px** |
| Alpha | 0 hoặc 255 |
| Palette | Chung 24 mục gồm trong suốt; tông xám/ngà/da cộng 3 sắc xanh trầm |
| Cỡ xem | 1× trên sân; 2×/4×/8× để xem pixel |

Nam và nữ dùng chung palette, anchor và cấu trúc atlas. Palette đệ tử giữ tông của Vương Lâm và thêm màu xanh; không khẳng định cả ba dùng một palette đồng nhất. PNG native và JSON nằm trong gói riêng của từng mẫu.

## 4. Nhận diện trong thế giới online

Ở cỡ 1×, tóc và khối người phải đọc được; chi tiết hàm/mắt chủ yếu thể hiện ở portrait. Trang so sánh cho tắt tên/vòng chọn trên sân để kiểm tra phần nhận diện đến từ ART.

Hai mẫu chỉ phân biệt loại hình cơ bản. Nhiều người chọn cùng mẫu vẫn có ngoại hình giống nhau, vì A chỉ có hai mẫu và tên; đây chưa là hệ thống tùy biến đầy đủ. UI của game cần tên người chơi, chỉ báo đệ tử của mình và trạng thái đồng đội theo đặc tả online. Không thêm màu sáng/chỉ số/vũ khí vào concept chỉ để phân biệt tài khoản.

Nhãn **Vương Lâm · NPC** luôn tách với mẫu người chơi. Trang xem chỉ cho hai mẫu đệ tử thử đi; Vương Lâm đứng làm tham chiếu. Đây là công cụ xem ART, chưa phải thế giới multiplayer.

## 5. Nguồn và đóng gói

Imagegen tích hợp vẽ bảng nhận diện và các hướng/tư thế trong nguồn. [Script xuất native](design/characters/player-avatars-v2/export-native.ps1) kế thừa phương pháp xuất bộ Vương Lâm: tìm hình tách biệt theo alpha, lấy mẫu nearest-neighbor bằng một tỷ lệ chung trong từng bộ, khóa palette và đăng ký điểm chân. Script không vẽ thêm tư thế hay bộ phận cơ thể.

Một lần xuất gồm atlas PNG indexed, 28 PNG rời, JSON và bản dữ liệu JS tương đương để xem bằng file HTML. Lần xuất trước và prompt chính xác được giữ theo phiên bản; không ghi đè nguồn hình v1 hoặc bộ Vương Lâm.

## 6. Những điểm cần xem trước khi chốt

- Búi cao của nam, búi thấp của nữ và tóc dài của Vương Lâm đọc khác nhau ở cả bốn hướng.
- Hai mẫu giữ cùng mặt/tóc/trang phục giữa chân dung và nguồn pixel; áo không tự đổi theo hướng.
- Cổ áo, đai xanh, cả hai giày và padding còn rõ ở 1×.
- Bước đi đổi chân, frame cuối về đầu ít giật; đầu/thân không biến hình khi đi.
- Đổi đi sang đứng giữ điểm chân và hướng; chuyển mẫu không kéo theo trạng thái đi của mẫu trước.
- Xem trên nền sáng/tối và sân stylized; khung nhỏ giữ cỡ pixel, vùng sân có thể cuộn.

Đây là bộ thử để xem nhận diện và chuyển động cùng nhau, chưa là quyết định phát hành ART. Sau phản hồi, chỉnh theo phiên bản mới rồi mới mở thêm trang phục/động tác và tùy biến.
