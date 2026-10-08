# Định hướng online nhiều người — điều chỉnh GDD

> **Archived reference:** current gameplay scope is [RPG-A](MVP-RPG-A.md), with the [new backlog](MVP-BACKLOG.md).

**Phiên bản:** 0.5, ngày 07/10/2026.  
**Đã xác nhận:** web online, đệ tử riêng, idle kết hợp khu môn phái có nhân vật đi lại; người phát triển muốn trải nghiệm giống MMORPG.  
**ART/góc nhìn hiện tại:** nhân vật pixel art trên nền stylized 2D, top-down ba phần tư.  
**Đang đề xuất:** phạm vi A/B theo MMORPG, tuyến người chơi/chính truyện, tỷ lệ/animation và giới hạn tu luyện khi vắng mặt.  
**Tham chiếu:** [GDD](GDD.md), [nhân vật](CHARACTERS.md), [backlog](MVP-BACKLOG.md).

## 1. Quyết định sản phẩm

Game hướng tới **MMORPG tu luyện có idle**, có tài khoản và nhân vật cá nhân. Khu môn phái đi lại chung là vùng khởi đầu; mục tiêu dài hạn mở thêm map/nhiệm vụ/chiến đấu theo arc. Map theo nút cũ còn dùng tham chiếu chính truyện và điều hướng tổng quan. [MMORPG-DIRECTION.md](MMORPG-DIRECTION.md) ghi điều chỉnh mới và phần cần xét lại trong A → B.

| Phần | Quyết định/đề xuất |
| --- | --- |
| Người chơi | Mỗi tài khoản đề xuất 1 đệ tử đang hoạt động trong A; chọn tên và mẫu hình |
| Trục truyện | Vương Lâm là NPC trung tâm; nhân vật người chơi có hành trình riêng trong cùng bối cảnh |
| Tiến trình | Cảnh giới, tài nguyên, hoạt động và chương cá nhân thuộc từng đệ tử |
| Thế giới chung | Khu môn phái có nhân vật đi lại đã chọn; tương tác/NPC cụ thể đang đề xuất |
| Máy chủ | Xác nhận hoạt động, chi phí, phần thưởng, mốc truyện và lưu tiến trình |
| Khi đóng trang | Máy chủ tính thời gian tu luyện đã được chọn; kết quả xuất hiện khi trở lại |

Số người đồng thời, số máy chủ, công nghệ đăng nhập và cấu hình hạ tầng chưa chốt. Phạm vi tương tác dưới đây là đề xuất để thiết kế A; cần thử ít nhất hai tài khoản cùng phiên thế giới trước khi coi A là bản online hoàn chỉnh.

## 2. Chính truyện và hành trình đệ tử

Các mốc E01–E08 đã viết kể sự kiện của **Vương Lâm**. Giữ chúng làm hồ sơ chính truyện; không thay tên Vương Lâm thành tên người chơi hoặc chuyển quan hệ cha mẹ/sư phụ sang mọi tài khoản.

Đề xuất thêm tuyến `P01–P08` cho đệ tử: nhập môn, làm việc, học công pháp, tích lũy tu vi và đột phá đầu. Chương chính truyện mở cùng mức tiến trình để người chơi hiểu Vương Lâm đã trải qua gì. Điều kiện/cost/reward của tuyến P phải được biên tập riêng trước prototype; đây chưa phải bộ nhiệm vụ đã đặc tả.

| Nội dung hiện tại | Cách dùng trong bản online |
| --- | --- |
| E01/E02, gia đình và khảo nghiệm của Vương Lâm | Chương truyện; người chơi có màn tạo đệ tử và nhiệm vụ nhập môn riêng |
| E03, hổ/hang/hạt châu | Cảnh truyện của Vương Lâm; không cấp một hạt châu độc hữu cho từng đệ tử |
| Nước → nước chứa linh khí → tu luyện | Giữ vòng tài nguyên làm giả thuyết cân bằng; đề xuất nước dưỡng khí được chuẩn bị tại trận tụ linh của môn phái |
| Châu và mộng cảnh | Hồ sơ/cảnh chính truyện; không là trang quản lý vật phẩm thuộc người chơi |
| E05/E06, công pháp và trở ngại của Vương Lâm | Không mặc định người chơi là đệ tử riêng của Tôn Đại Trụ hoặc có cùng tư chất |
| E08 | Đạt Ngưng Khí tầng 1 cho đệ tử qua mốc P tương ứng; xem sự kiện đột phá Vương Lâm trong chính truyện |
| Giao đấu của Vương Lâm ở B | Cảnh chính truyện; luyện thuật/giao đấu của người chơi có đối thủ và luật riêng khi B được biên tập |

**Trận tụ linh, nước dưỡng khí và tuyến đệ tử mới là cơ chế chuyển thể đề xuất của game.** Chúng không được trình bày là sự kiện có sẵn trong nguyên tác. Các số liệu 10 giây/chu kỳ, 480 tu vi, kho 120/30 và 8 giờ là dữ liệu tham chiếu của thiết kế trước; cân bằng tuyến P chưa được xác nhận.

## 3. Không gian chung và cảnh cá nhân

| Loại không gian | Nội dung | Quy tắc |
| --- | --- | --- |
| Môn phái chung | Hình đệ tử đi lại, đồng môn, điểm NPC và hồ sơ công khai | Người chơi cùng khu thấy nhau di chuyển; tương tác theo luật máy chủ |
| Tu luyện cá nhân | Hoạt động/tài nguyên của đệ tử | Người khác không lấy tài nguyên hoặc làm đổi tiến trình |
| Chương truyện cá nhân | Vương Lâm và các NPC tại đúng mốc người đọc | Không áp dụng kết quả chương của một tài khoản cho cả thế giới |
| Cảnh chiến đấu B | Phiên riêng được mở theo nhiệm vụ | Kết quả cốt truyện và thưởng cá nhân kiểm tra ở máy chủ |

NPC trong chương cá nhân dùng diện mạo theo mốc; cùng một NPC có thể được hai người xem ở hai chương khác nhau. Khu chung không hiển thị biến cố tương lai của NPC khi người chơi chưa tới chương đó. Các map 001–009 hiện là **bản đồ tham chiếu hành trình Vương Lâm**; map hoạt động của đệ tử và điểm tới khu chung cần bản điều chỉnh riêng.

## 4. Tương tác nhiều người trong A → B

| Giai đoạn | Tương tác đề xuất | Điều kiện nghiệm thu bổ sung |
| --- | --- | --- |
| A | Đệ tử đi lại trong khu môn phái chung; đề xuất tương tác NPC, xem hồ sơ đồng môn và lời chào | Hai tài khoản thấy nhau di chuyển và tương tác; tiến trình riêng đúng; phạm vi NPC/nhiệm vụ cần biên tập |
| B | Đề xuất thêm vùng thử vòng RPG chiến đấu, kỹ năng/đồ; sau đó cân nhắc tỷ thí hoặc nhóm nhỏ | Xét lại B theo MMORPG; tách trận của đệ tử khỏi cảnh truyện Vương Lâm; có luật sở hữu phần thưởng |
| Sau B | Tổ đội, môn phái người chơi, trao đổi vật phẩm và hoạt động thế giới theo arc | Có thiết kế kinh tế, quyền sở hữu và luật giải quyết kết quả |

Lời chào có sẵn đủ tạo tương tác thật ở A mà ít nội dung UI. Chat tự do, PvP, tổ đội và giao dịch còn cần đặc tả riêng; chọn online không tự động đưa mọi tính năng này vào MVP.

## 5. Lưu và thời gian

Tiến trình gameplay hợp lệ nằm trên máy chủ. Trình duyệt có thể lưu tùy chọn hiển thị/cache; JSON do người chơi nhập không được dùng để thay tài nguyên, cảnh giới hoặc mốc thưởng trên máy chủ. Các màn xuất/nhập save và đổi bản lưu trong UX v0.6 là thiết kế cũ cần thay bằng tài khoản/trạng thái đồng bộ.

Đề xuất giữ giới hạn tu luyện khi vắng mặt **8 giờ cho mỗi quãng mất kết nối**, chịu giới hạn kho và cổng mốc. Khi có kết nối, máy chủ xử lý đến thời điểm hiện tại theo luật hoạt động, không dùng đồng hồ thiết bị. Quy tắc xác định phiên mất kết nối và quãng vắng mặt phải đặc tả trước lập trình để nhiều tab/thiết bị không làm nhân thời gian.

Mỗi lệnh có ID và phiên bản tiến trình; máy chủ xử lý thời gian, kiểm tra điều kiện, áp dụng chi phí/tác dụng và lưu trong cùng một giao dịch. Gửi lại một lệnh không áp dụng lại tác dụng. Nhiều tab/thiết bị đọc cùng tiến trình; đề xuất một phiên điều khiển tại một thời điểm, được máy chủ quyết định. Tổng kết khi quay lại chỉ trình bày kết quả đã xử lý.

Mất mạng hiện trạng thái chờ kết nối; lệnh hoạt động/đột phá cần máy chủ xác nhận. Hình ảnh hoặc thông báo thành công chỉ hiện sau xác nhận. Chi tiết đăng nhập, phục hồi tài khoản, xử lý máy chủ gián đoạn và tổng kết nhiều phiên sẽ được đặc tả trong bước online kế tiếp.

## 6. UX và asset chịu ảnh hưởng

- Thêm màn vào tài khoản và tạo đệ tử; tách chân dung người chơi khỏi portrait Vương Lâm trong truyện.
- Đề xuất đổi khu **Hạt châu** thành **Công pháp** của đệ tử; hồ sơ châu chuyển vào Chính truyện/Hành trình.
- Thêm bảng Đồng môn trong khu chung, nhãn kết nối và xác nhận lưu máy chủ.
- Thêm màn thế giới có avatar đi lại và điểm tương tác; vị trí/chuyển động do máy chủ kiểm tra. Cần sprite/animation và map riêng ngoài nguồn portrait.
- Thay màn nhập save bằng luồng tài khoản/phiên; đổi nhãn tổng kết thành **Tu luyện khi vắng mặt**.
- Hai nguồn hình đệ tử được cộng vào ngân sách nhân vật; trang phục xám/đỏ của Vương Lâm không tự áp dụng cho mọi người chơi.

Các bản phác v0.6 vẫn hữu ích để tham chiếu bố cục mực/giấy, nhưng chưa thể dùng làm UX hoàn chỉnh cho online. Đã có preview chạy được và backend phòng tối thiểu, ghi tại [BACKEND-PREVIEW.md](BACKEND-PREVIEW.md); chưa triển khai tài khoản/tiến trình và luật tu luyện.

## 7. Phần thiết kế tiếp theo

Ưu tiên hiện tại là đánh giá chuyển động bằng preview và sân chung tối thiểu. Sau đó biên tập tuyến P, tách dữ liệu đệ tử/chính truyện, cập nhật map/UX và viết hợp đồng tài khoản/tiến trình máy chủ. Các điều kiện chuyển A → B phải bổ sung đăng nhập, kết nối lại, lưu máy chủ và tương tác hai tài khoản; tiêu chí xuất/nhập save cục bộ trước đây được thay thế. Hai phiên tạm trong preview không thay nghiệm thu hai tài khoản có tiến trình riêng.
