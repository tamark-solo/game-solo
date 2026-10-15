# Đợt A · độ phủ danh mục item theo GDD 0.35

Danh mục [items.json](items.json) có 123 record lập kế hoạch, gồm bốn họ pháp bảo, 12 hình thái Mốc I–III, vật phẩm/nguyên liệu của tám nhóm, tiền tệ và các state/fact được tách khỏi túi. ID trong JSON là planning ID ASCII; alias giữ tên nguồn để truy vết. Các record chưa phải runtime item ID.

## Độ phủ theo nhóm và cảnh giới

| Nhóm | Ngưng Khí | Trúc Cơ | Kết Đan | Nguyên Anh | Hóa Thần | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| Linh thảo/hạt giống | Thanh Linh Thảo, Bạch Lộ Hoa, Mộc Linh Dịch | Quyết Minh Tử Thảo, Hàn Đan Linh Lộ, Huyết Tinh Chi | Tu Ma Huyết Liên, Thiên Lôi Quả | Cổ Thần Huyết Thảo, dược liệu cấp cao | Tinh Không Đạo Quả, Sinh Tử Dược | Tên và vai trò đã có; điểm hái/trồng, icon, chu kỳ và recipe còn thiếu. |
| Đan/Lộ Thủy | Hồi Khí Tán, Tụ Khí Đan, Thanh Tâm Đan, Tị Độc Đan, Lộ Thủy, Trúc Cơ Đan | Ngưng Nguyên, Tẩy Tủy, Bạo Khí, Thiên Ly | Chân Nguyên, Kim Đan Hộ Tâm | Phá Đan Hóa Anh, Nghịch Thiên Tục Mệnh | Hóa Thần Vấn Đạo | Tên/đích dùng được ghi; phẩm chất, lượng, độc tính và công thức cần fixture. |
| Khoáng/đá tế luyện | Huyền Thiết, Đá Mài Kiếm, Vân Nha, Giáp Ngọc Trùng, Mảnh Khôi Lỗi | Hàn Thiết Tinh Kim, Huyết Văn Lụa, Âm Mộc, Thiên Lôi Thiết | Thiên Lôi Thần Thiết, Hải Hồn Tinh Thiết, Kim Đan Yêu Cốt | Tử Kim Tiên Thiết, Tinh Không Thần Thạch | Cổ Thần Chi Tinh | Nguồn quái/mỏ và alias còn phải chốt; chưa có bảng drop. |
| Hồn phách/tinh huyết | Du Hồn Sơ Cấp, Yêu Hồn Lang Tuần Sơn | Tinh Hồn Trúc Cơ, hai Chủ Hồn VG07, hồn Chấp Sự VG10 | Hung Hồn Tu Ma Hải, Chủ Hồn Yêu Vương | Nguyên Anh Chiến Hồn | Đế Hồn | Stack và instance chủ hồn phải tách; nguồn lặp/khóa còn thiếu. |
| Phù/Trận/Cổ ấn/Giải niêm | Phá Cấm, Thần Hành, Kim Quang Hộ, Cổ Ấn I, Giải Niêm I | Tụ Linh, Tứ Tượng, Tị Lôi, Cổ Ấn II, Giải Niêm II | Trận bàn/cổ ấn cao cấp | Trận Đạo Vực và giải niêm | Cổ ấn Mốc III | GDD xác định vai trò; chín khóa Xa, recipe và icon chưa đầy đủ. |
| Khẩu quyết/Tàn quyển | Tầng 4–6, 7–9, 10–12; Cổ Quyết 13–15; Quyển Thượng | Trúc Cơ Chân Quyết, Quyển Hạ; Quyển Trung mở từ VG04 | Chứng ngộ Hóa Cảnh | Thần thông/Ý Cảnh | Cổ Thần chiến kỹ | Sách trong túi tách khỏi mastery/fact; nguồn từng quyển chưa đủ. |
| Trang bị sáu ô/phôi | Thanh Vân, Vân Nha, Huyền Thiết, Mộc kiếm/áo nhập môn | Quyết Minh Đan Tâm, Hàn Thiết Kiếm Ma | Tu Ma Huyết Hải, Thiên Lôi Trấn Pháp | Cổ Bảo | Tiên Khí/Tiên Khí Toái Phiến | Sáu slot có khung; từng món, stat, set, phôi và icon cần phân rã. |
| Chứng đạo/nhân duyên | Lệnh Bài Đen, Ấn Ký Lang/Tam/Cổ, tín vật đột phá | Ngọc Giản Hộ Mệnh, Bản Đồ Tu Ma Hải, tín vật tuyến | Tái tạo nhục thân Tư Đồ Nam | Ngũ Hành bản nguyên, Tục Mệnh | Ý Cảnh/tín vật chặng cuối | Nhiều mục là độc bản hoặc fact; không biến portrait/boss fact thành item farm. |

## Các cổng VG cần giữ trong catalog

- **VG01–VG02:** nguồn đầu cho Kiếm I, Châu, Du Hồn và Yêu Hồn; Phiên I dùng 100 Du Hồn + 5 Yêu Hồn Lang Tuần Sơn.
- **VG03–VG04:** Tư Đồ Nam, Quyển Trung, khẩu quyết 10–12, Phá Cấm Phù và lõi Xa; fact thắng Boss tách khỏi vật phẩm.
- **VG05–VG06:** Thanh Mộc Linh Tâm, Trúc Cơ Đan và hai nhánh Trúc Cơ tầng 12/Cổ Cảnh 15; Hắc Ấn là điều kiện/fact chung, không tự cấp tầng.
- **VG07:** Nội Giới mở chức năng; Phiên II cần 1.000 Tinh Hồn Trúc Cơ + hai Chủ Hồn khảo nghiệm. Hồn Chấp Sự chưa được dùng làm điều kiện này.
- **VG08–VG09:** Kiếm II sau Hứa Lập Quốc; Xa II và khóa 4–6 trước Hộ Đạo Đan Thất; Thiên Ly Đan/Ngọc Giản là kết quả sau giữ lò.
- **VG10–VG11:** Châu II trước trận với Nội Giới cấp 5, Ngũ Hành và Châu I +10; hồn Chấp Sự bổ sung sau VG10; Thiên Ly Đan và Tị Lôi Hộ Đạo Trận trước ba pha Kiếp Lôi.

## Alias phải duyệt trước khi đóng master catalog

`Vân Nha`/`Nanh Sói`; `Mảnh Ngọc Giáp`/`Giáp Ngọc Trùng`; `Lõi Khôi Lỗi Rạn`/`Mảnh Khôi Lỗi`; `Mảnh Hắc Phù`/`Mảnh Phù Giải Niêm`; `Lộ Thủy`/`Ngưng Lộ Thủy`; `Hồi Khí Tán`/`Tụ Khí Đan` là các tên gần nghĩa nhưng chưa được gộp tự động. Chỉ gộp khi source, sink, storage và binding giống nhau.

## Phần loại khỏi inventory

HP/MP snapshot, Tu vi, Chu Thiên, Độ thuần, Đan độc, mastery, refinementTotalRank, InnerRealmLevel, completion fact, boss victory fact, approval và portrait là state/fact/metadata. Chúng xuất hiện trong JSON để ghi ranh giới thiết kế, nhưng không phải item stack. `Linh Thạch`, `Tiên Ngọc Khóa`, `Tiên Ngọc Không Khóa` và `Công Huân` là balance; chỉ tạo icon khi UI cần trình bày, không coi chúng là loot item mặc định.

Các tên Mặc Dực, Bào Tử Giữ Khí và Tĩnh Niệm Tro là ứng viên roster cũ chưa có sink trong GDD 0.35. Chúng được giữ ở trạng thái pending, chưa đưa vào loot hoặc recipe bắt buộc.

## Gap cần giải quyết sau Đợt A

Master catalog tiếp theo cần chốt source activity/receipt, repeatability, lock propagation, item alias, whitelist recipe 5:1, lượng/rate, quality roll, sáu món từng set, ba slot Cổ Ấn và icon/prop còn thiếu. Chỉ sau khi các trường này ổn định mới brief icon/điểm thu thập hoặc ghép fixture VG01–VG06.
