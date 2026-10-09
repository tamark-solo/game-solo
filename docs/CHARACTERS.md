# Nhân vật — ba lựa chọn chơi được từ đầu

**Phiên bản:** 1.5 · **Ngày:** 08/10/2026 · **Tham chiếu:** [GDD](GDD.md), [tu tiên](CULTIVATION-SYSTEM.md), [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), [nguồn nhận diện bộ ba](CORE-CHARACTER-VISUAL-SPEC.md).

## 1. Vai trò hiện hành

Người chơi chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển ngay đầu game**. Cả ba trải qua Hằng Nhạc/Ngưng Khí chung về nền gameplay, có khác biệt nhẹ; lối chơi phân hóa sâu từ hành trình Trúc Cơ sau map nhập môn.

Vai “đệ tử người chơi riêng, bộ ba là NPC chỉ mở ở arc sau” đã bị thay. [Hồ sơ trước](archive/design-before-three-playable-characters/CHARACTERS.md) giữ nguồn hình, nghiên cứu đệ tử và roster cũ. [Roster thiết kế](data/character-roster.json) phân biệt quyền chọn gameplay từ đầu với mốc xuất hiện theo truyện/ngân sách cũ; không là schema runtime hoặc bằng chứng đã triển khai màn chọn ba người. ID và metadata/duyệt ART nguồn được giữ để truy nguyên.

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

Nhận diện concept/tĩnh v1 áo tím đã được chấp nhận trước đây; hiện giữ làm đối chiếu nguồn, cùng biến thể đỏ theo cảnh. Bộ chibi hiện hành **native-v5** có 20 frame đứng/đi bốn hướng, mặt/tóc/trang phục đã làm lại; tóc xanh đen rẽ lệch/buộc thấp, áo lavender hai lớp/cổ ngà, đã được chấp nhận làm chuẩn bản thử ngày 07/10. Portrait trước cần đồng bộ, không suy thành duyệt ART phát hành. Tự chơi được, không chỉ cung cấp đan cho Vương Lâm. Số phận/sinh mệnh và cách tiếp tục chơi ở arc sau phải biên tập riêng; không mặc định bất tử hay một kết thúc mới.

## 4. Diện mạo, NPC và nguồn cũ

Nhận diện Vương Lâm v2 đã duyệt, chibi Vương Lâm dùng làm chuẩn tỷ lệ. Lý Mộ Uyển chibi native-v5 đã chấp nhận cho bản thử; concept/tĩnh v1 là mốc trước. Tư Đồ Nam đứng v3 trước được tạm chấp nhận, còn bộ chibi native-v2 đứng/lướt mới chờ đánh giá. Phân biệt duyệt identity, chuẩn bản thử và duyệt animation/phát hành; vai chơi được không tự đổi các trạng thái nguồn. Các mẫu/tư thế theo chương dùng đúng ngữ cảnh, không suy trang phục từ level của mọi người chơi.

Catalog preview hiện có **6 bộ/136 frame**: năm bộ chibi 100 frame và Vương Lâm trước 36 frame; bộ ba chibi có 60 frame. Runtime Hằng Nhạc đã chọn/lưu ba hồ sơ riêng và dùng R01 từ đầu; [mở đầu HN01–HN02](HANG-NHAC-SECT-RUNTIME.md) có lời dẫn theo nhân vật. Sân fixture cũ giữ hai avatar kỹ thuật. Hai mẫu đệ tử không là lựa chọn chính của GDD mới; đang dùng làm hình thử cho bốn vai NPC tiếp dẫn/vận khí/luyện thuật/chuẩn bị. Đây chưa là tạo hình NPC production được duyệt. Roster A=7/B=10/arc=11 và ngân sách portrait cũ là tham chiếu; source/manifest/duyệt ART giữ nguyên.

[Dàn chibi hiện hành](CHIBI-ROSTER-SPEC.md), [thư viện concept trước](design/characters/core-trio-v1/index.html), [chân dung](design/characters/core-ui-v1/index.html) và [kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) tách tiến độ ART. Kế hoạch hiện có 60 frame core, dự toán thêm 16 thành 76 (chưa vẽ); tương tác/tu luyện/combat đầy đủ còn cần hồ sơ riêng và ưu tiên hiện tại vẫn là map. Phạm vi xuất hiện/ngân sách trước chibi được giữ lịch sử, cần đọc cùng GDD; source/manifest/duyệt ART đã khóa giữ nguyên.

## 5. Việc cần biên tập

[Đặc tả Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md) đã đề xuất mở đầu, ba nhánh HN06, bình cảnh HN07 và hướng xuất hành cho từng người. Lời dẫn, tên thuật và nguồn neo linh thể còn cần biên tập/duyệt; không suy rằng các đề xuất đã thành canon hoặc gameplay.

[Tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) đề xuất mốc gameplay 1/3/9/15, nhãn hồi phục I–IV của Tư Đồ Nam, ngân sách thưởng/stat chung và pháp khí nền. Phân bổ map/số liệu cần đánh giá; không biến ngân sách chung thành cùng cảnh giới canon, cùng cơ duyên hoặc cùng vận mệnh.

Lời dẫn chọn ba người từ đầu; trạng thái ban đầu của mỗi người; dấu nhận diện nhẹ; nhiệm vụ/pháp bảo/thuật nền; mốc hoàn thành Ngưng Khí/hồi phục; tuyến Trúc Cơ đầu; điều kiện tiếp tục điều khiển qua các biến cố riêng. Tài liệu này chưa xác nhận animation/skill gameplay ba người đã hoàn chỉnh.
