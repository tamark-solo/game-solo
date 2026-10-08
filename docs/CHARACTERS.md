# Nhân vật — ba lựa chọn chơi được từ đầu

**Phiên bản:** 1.5 · **Ngày:** 08/10/2026 · **Tham chiếu:** [GDD](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [nguồn nhận diện bộ ba](CORE-CHARACTER-VISUAL-SPEC.md).

## 1. Vai trò hiện hành

Người chơi chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển ngay đầu game**. Cả ba trải qua Hằng Nhạc/Ngưng Khí chung về nền gameplay, có khác biệt nhẹ; lối chơi phân hóa sâu từ hành trình Trúc Cơ sau map nhập môn.

Vai “đệ tử người chơi riêng, bộ ba là NPC chỉ mở ở arc sau” đã bị thay. [Hồ sơ trước](archive/design-before-three-playable-characters/CHARACTERS.md) giữ nguồn hình, nghiên cứu đệ tử và roster cũ. Chưa thay ID/role trong JSON runtime; dữ liệu cũ không là quyết định sản phẩm hiện hành.

## 2. Phạm vi lựa chọn

Cả ba có tại màn chọn, không phụ thuộc hoàn thành tuyến Vương Lâm. Đề xuất mỗi lần điều khiển một người; số hồ sơ/slot, đổi nhân vật và kho/tiện ích chung chưa chốt. Không mặc định điều khiển ba người cùng lúc, gacha hoặc chuyển vai giữa combat.

Khu online hiển thị nhãn nhân vật cùng biệt danh/ID hồ sơ. Tên tài khoản không đổi danh tính/quan hệ trong truyện. Nhiều hồ sơ cùng chọn Vương Lâm không chia sẻ một tiến trình hoặc thêm nhiều Vương Lâm vào canon.

## 3. Bản sắc và phát triển

| Nhân vật | Nhập môn | Sau map đầu — đề xuất |
| --- | --- | --- |
| Vương Lâm | Học tu luyện và đấu pháp nền, quan sát khảo nghiệm; cơ duyên riêng đúng mốc | Công pháp, thần thức, cấm chế/lĩnh ngộ; sức mạnh đặc biệt theo arc |
| Tư Đồ Nam | Linh thể bị hạn chế; khôi phục khả năng hiện diện/thi triển để đi qua bài học chung | Phục hồi năng lực và quyền vận dụng thuật đã biết |
| Lý Mộ Uyển | Tự combat được; dấu nhận diện dược liệu/đan/phù–trận nhẹ | Đan–trận, chuẩn bị, kiểm soát/bảo vệ và phối hợp |

**Bộ skill khởi đầu đã chốt:** cả ba có Kiếm Khí, Lôi Ấn và Ngự Phong Bộ bản R01 từ lúc bắt đầu điều khiển. Tutorial dạy vận dụng, không mới cấp quyền theo HN03/04/09. Cơ chế/cân bằng tại [hồ sơ gameplay](NGUNG-KHI-GAMEPLAY-SPEC.md) còn là đề xuất; dùng chung thuật nền không gán class kiếm/lôi/hồi máu hoặc khẳng định sự kiện học chung trong canon. Kỹ năng/tuyến đặc trưng về sau chưa khóa.

### Vương Lâm

Giữ thân thế/động lực và các cơ duyên then chốt từ nguyên tác. Thiên Nghịch Châu thuộc tuyến riêng, không cấp cho mọi lựa chọn. Cực Cảnh/Cổ Thần cần hồ sơ riêng khi tới mốc; không tự mở vì số tu vi cao. [Nhận diện](WANG-LIN-VISUAL-SPEC.md), [nguồn bộ ba](CORE-CHARACTER-VISUAL-SPEC.md).

### Tư Đồ Nam

Giữ nền cao thủ mất thân thể, tồn tại trong châu; nguồn [chương 47](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47). Không gọi ông là phàm nhân mới học Ngưng Khí, không xóa kiến thức để đồng bộ level. Mốc gameplay nhập môn phản ánh năng lực hiện dùng được và quá trình hồi phục; chiến lực đầu phải có giới hạn rõ.

Giữ concept linh thể đứng v3 tạm chấp nhận, mặt/tóc v2; tư thế đứng phục vụ gameplay là chuyển thể, dáng ngồi tham chiếu truyện vẫn được lưu. Chọn ông từ đầu không sửa nguồn thời điểm xuất hiện trong tuyến nguyên tác của Vương Lâm.

### Lý Mộ Uyển

Giữ nền luyện đan/trận pháp; nguồn [143](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143), [224](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-224). Nhập môn Hằng Nhạc là chuyển thể, không kể rằng lần gặp đầu nguyên tác xảy ra tại đây.

Giữ nhận diện v1 đã chấp nhận: tạo hình áo tím/biến thể đỏ theo hồ sơ cảnh. Tự chơi được, không chỉ cung cấp đan cho Vương Lâm. Số phận/sinh mệnh và cách tiếp tục chơi ở arc sau phải biên tập riêng; không mặc định bất tử hay một kết thúc mới.

## 4. Diện mạo, NPC và nguồn cũ

Nhận diện Vương Lâm v2, Lý Mộ Uyển v1 đã duyệt; Tư Đồ Nam đứng v3 tạm chấp nhận. Vai chơi được không tự đổi khuôn mặt/trang phục đã chọn. Các mẫu/tư thế theo chương được dùng theo ngữ cảnh, không suy trang phục NPC từ level của mọi người chơi.

Hai mẫu đệ tử nam/nữ giữ làm nghiên cứu/preview lịch sử, không là lựa chọn người chơi chính của GDD mới. Roster A=7/B=10/arc=11 và ngân sách portrait cũ là tham chiếu, chưa là roster NPC đã duyệt cho onboarding ba người. NPC hướng dẫn/nhiệm vụ cần lập theo tuyến chung và đoạn cá nhân.

[Thư viện nhận diện](design/characters/core-trio-v1/index.html), [chân dung](design/characters/core-ui-v1/index.html), [kế hoạch động tác cũ](CORE-CHARACTER-MOTION-PLAN.md) lưu tiến độ ART. Phạm vi xuất hiện trong các hồ sơ trước là lịch sử, cần đọc cùng GDD mới; source/manifest/asset đã khóa giữ nguyên.

## 5. Việc cần biên tập

[Đặc tả Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md) đã đề xuất mở đầu, ba nhánh HN06, bình cảnh HN07 và hướng xuất hành cho từng người. Lời dẫn, tên thuật và nguồn neo linh thể còn cần biên tập/duyệt; không suy rằng các đề xuất đã thành canon hoặc gameplay.

[Tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất mốc gameplay 1/3/9/15, nhãn hồi phục I–IV của Tư Đồ Nam, ngân sách thưởng/stat chung và pháp khí nền. Phân bổ map/số liệu cần đánh giá; không biến ngân sách chung thành cùng cảnh giới canon, cùng cơ duyên hoặc cùng vận mệnh.

Lời dẫn chọn ba người từ đầu; trạng thái ban đầu của mỗi người; dấu nhận diện nhẹ; nhiệm vụ/pháp bảo/thuật nền; mốc hoàn thành Ngưng Khí/hồi phục; tuyến Trúc Cơ đầu; điều kiện tiếp tục điều khiển qua các biến cố riêng. Tài liệu này chưa xác nhận animation/skill gameplay ba người đã hoàn chỉnh.
