# Ba nhân vật trọng tâm — nhận diện và gói tạo hình đầu tiên

**Hướng hiện hành — GDD 0.28:** chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu; cả ba cùng trải qua Hằng Nhạc đến hết Ngưng Khí, phân hóa từ Trúc Cơ. Nguồn diện mạo/mốc nguyên tác dưới đây phục vụ ART và truyện; không khóa quyền chọn nhân vật. Xem [GDD](GDD.md) và [hệ thống tu tiên](CULTIVATION-SYSTEM.md).

**Phiên bản:** 0.5, ngày 08/10/2026.\
**Đã chốt:** trục nhân vật của game gồm **Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển**; ưu tiên làm nhận diện hai người còn lại trước nhóm NPC phụ.  
**Trạng thái:** hồ sơ nguồn và concept trước chibi. Vương Lâm làm chuẩn tỷ lệ; Tư Đồ Nam đứng trước được tạm chấp nhận. Lý Mộ Uyển native-v5 đã chấp nhận làm chuẩn bản thử sau khi làm lại toàn bộ mặt/tóc/trang phục.
**Xem:** [thư viện ba nhân vật](design/characters/core-trio-v1/index.html), [nguồn/prompt](design/characters/core-trio-v1/README.md), [manifest](design/characters/core-trio-v1/study.json), [roster](data/character-roster.json).

**Cập nhật sản xuất:** [dàn chibi](CHIBI-ROSTER-SPEC.md) có 20 frame/người; bộ ba 60 frame, đủ đứng/đi/lướt bốn hướng. Lý Mộ Uyển native-v5 đổi mặt, tóc xanh đen rẽ lệch/buộc thấp và áo lavender hai lớp/cổ ngà. Các hình cũ trong tài liệu này được giữ để đối chiếu nguồn; portrait v1 còn chờ đánh giá và cần đồng bộ với nhận diện chibi native-v5 đã chấp nhận.

## 1. Phạm vi ba nhân vật

| Nhân vật | Vai trò gameplay hiện hành | Mốc nguyên tác làm căn cứ ART | Phạm vi ART đang dùng |
| --- | --- | --- | --- |
| Vương Lâm | Lựa chọn người chơi từ đầu | Nhập môn và các arc tiếp theo | Nhận diện v2 đã duyệt; chibi áo xám 20 frame đứng/đi |
| Tư Đồ Nam | Lựa chọn người chơi từ đầu | Tuyến hạt châu; dạng ngồi chương 112 | Chibi linh thể 20 frame đứng/lướt chờ đánh giá; nhận diện đứng v3 trước tạm chấp nhận |
| Lý Mộ Uyển | Lựa chọn người chơi từ đầu | Hỏa Phần/Tu Ma Hải, áo đỏ/tím theo cảnh | Chibi native-v5 20 frame đứng/đi đã chấp nhận cho bản thử; concept/portrait trước giữ đối chiếu |

Hai mẫu đệ tử là avatar kỹ thuật của sân online hiện tại, không thuộc ba lựa chọn nhân vật chính trong GDD. Catalog preview có 6 bộ/136 frame; việc có asset bộ ba chưa triển khai chọn nhân vật hoặc tiến trình Hằng Nhạc online. Roster NPC theo nội dung được biên tập riêng.

## 2. Căn cứ và giới hạn nguồn

Dùng mô tả tiểu thuyết và diện mạo riêng của game. Giữ các trạng thái/trang phục theo cảnh; không dùng ảnh hoạt hình hoặc game khác làm nguồn gương mặt.

| Nguồn | Chi tiết đã đọc | Áp dụng cho brief |
| --- | --- | --- |
| [Tư Đồ Nam — chương 46](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-46) | Giọng già xuất hiện trong mộng cảnh, tính khí ngạo nghễ và gay gắt | Lần giới thiệu dùng lời thoại; chân dung minh họa là cách trình bày của game |
| [Chương 47](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47) | Tự nhận tên; đã mất thân thể và bị giữ trong châu | Dạng linh hồn, không dùng thân thể phục hồi làm mặc định |
| [Chương 112 — bản công khai](https://novelfire.net/book/renegade-immortal/chapter-112) | Nguyên anh rất lớn, lơ lửng xếp bằng, thân không đặc, ngực có khoảng khuyết, mắt nhắm | Dạng ngồi lưu trong v2; đặc điểm linh thể làm căn cứ cho ART chuyển thể, tách tư thế đứng do game bổ sung |
| [Lý Mộ Uyển — chương 130](https://novelfull.com/renegade-immortal/chapter-130-sudden-arrival-of-nascent-soul.html), [131](https://novelfull.com/renegade-immortal/chapter-131-is-he-a-fat-sheep.html) | Cô gái áo đỏ đi cùng anh được gọi Uyển Nhi; chương kế xác nhận tên Lý Mộ Uyển và khả năng đan dược của môn phái | Biến thể áo đỏ của mốc gặp đầu |
| [Chương 141](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-141) | Có khả năng luyện đan; thận trọng ở Tu Ma Hải | Giữ vẻ chú ý/thận trọng, không luôn mỉm cười lãng mạn |
| [Chương 144 — bản công khai](https://novelfull.com/renegade-immortal/chapter-144-core-formation-1.html) | Cảnh phòng luyện đan có áo tím, tóc buộc đuôi và lò đan | Bộ áo tím và tóc dài buộc của mẫu hiện tại |

Wuxiaworld là nguồn đối chiếu tên chương; các trang [112](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-112), [130](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-130), [131](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-131), [144](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-144) hiện chỉ đọc được teaser trong lần kiểm tra. Chi tiết ngoài teaser được đối chiếu với bản văn công khai đã liên kết, không ghi thành phần đã đọc đầy đủ trên Wuxiaworld. Số chương theo bản dịch này; tên Việt theo tài liệu game.

Các nguồn trên chưa xác định đầy đủ hình mắt/mũi, đường cắt áo, màu tóc nguyên bản hoặc tuổi biểu kiến chính xác. Các lựa chọn ở mục 3–4 là ART; không chuyển chúng thành dữ kiện nguyên tác.

## 3. Tư Đồ Nam — linh thể đứng v3 cho tương tác

Người phát triển yêu cầu dạng linh thể **đứng** ngày 07/10/2026 để phục vụ hướng MMORPG. [Bảng đứng v3](design/characters/core-trio-v1/situ-nan-spirit-standing-v3.png) giữ mặt/tóc v2; đây là thay tư thế và cách hiện diện trong game, không đổi nhận diện lần nữa.

- **Mặt/tóc:** hàm rộng, cằm chắc, mũi thẳng và chân mày đậm; nét cười tự tin/châm chọc. Tóc đen vuốt sau, một búi nhỏ thấp tại gáy, vài sợi bạc ở thái dương. Tuổi biểu kiến 40–50 và các chi tiết này là ART riêng.
- **Dáng mặc định cho tương tác:** thân thẳng, hai chân duỗi, tay thả tự nhiên; lơ lửng nhẹ. Mắt mở để đọc thần thái trong cảnh trò chuyện.
- **Chất linh thể:** áo xanh mực, cổ ngà/xám, đai tối; khoảng rỗng ở ngực và mép gấu/đầu bàn chân đứt nhẹ. Giữ đường mặt và khối người rõ; hiệu ứng sương vừa đủ.
- **Di chuyển hiện có:** chibi có 16 pose lướt bốn hướng; chân giữ duỗi và áo/viền linh khí theo sau. Gói tĩnh `core-trio-v1` dưới đây là nguồn trước chibi; vòng dao động lơ lửng tại chỗ chưa sản xuất.
- **Cảnh tu luyện/nguyên tác:** [bản ngồi v2](design/characters/core-trio-v1/situ-nan-spirit-identity-v2.png) và bộ pixel 128 × 128 được lưu riêng cho cảnh phù hợp trạng thái chương 112. Tư thế đứng/mắt mở là chuyển thể cho game, không ghi thành mô tả của chương đó.
- **Nơi sử dụng:** nhân vật người chơi từ đầu theo GDD; truyện hạt châu/cảnh cá nhân vẫn biên tập theo mốc tiết lộ. Chọn hình linh thể không đồng nghĩa đã triển khai năng lực nguyên tác/cảnh giới cao hoặc NPC thường trú.

### Lưới và điểm đặt

Bốn mẫu đứng tĩnh hiện tại dùng **64 × 96 px**, cùng lưới nhân vật map; palette 24 mục gồm trong suốt. Điểm chiếu xuống mặt đất **(32, 88)**; đáy hình nằm ở y = 84, cách điểm chiếu **4 px** để biểu thị lơ lửng. Điểm chiếu phục vụ đặt nhân vật/sắp lớp; không gọi mép gấu đang bay là bàn chân chạm đất.

Khung này là kích thước asset tương tác. Cảnh nguyên anh rất lớn theo truyện phải có dàn cảnh/tỷ lệ riêng. Dạng ngồi giữ [spec v2](design/characters/core-trio-v1/situ-nan/pixel-spec-v2-seated.json) và native-v2 để không nhầm khung/điểm đặt khi dùng lại.

V1 và mẫu chỉnh mặt đầu được giữ để đối chiếu. Ngày 07/10/2026, người phát triển phản hồi **“tạm chấp nhận được rồi”**. Bảng đứng v3 và bốn hướng pixel được **tạm chấp nhận làm chuẩn thiết kế**; mức duyệt này cho phép tiếp tục GDD/ART. Hình có thể chỉnh khi hoàn thiện; chưa ghi thành duyệt ART phát hành.

## 4. Lý Mộ Uyển — nguồn nhận diện trước chibi và bản hiện hành

- **Mặt:** oval hơi dài, cằm mềm, chân mày cong nhẹ, mắt chú ý; khác mặt oval rộng và dáng thực dụng của avatar nữ. Tuổi biểu kiến đầu/giữa tuổi hai mươi là lựa chọn ART.
- **Tóc:** tóc đen dài buộc đuôi phía sau, có phần cạnh mặt/tai; cách buộc thấp/vừa, dây vải tím trầm là thiết kế game. Không dùng búi thấp tròn của avatar nữ.
- **Thần thái:** dịu và tập trung khi nghiên cứu/luyện đan; có thận trọng và mệt theo cảnh. Không tự gán vai trò healer chiến đấu từ công việc luyện đan.
- **Áo đỏ:** biến thể tham chiếu lần gặp đầu ở chương 130, cùng nhận diện.
- **Áo tím:** bộ nghiên cứu chính theo cảnh chương 144; cổ trong ngà, đai tím sẫm, áo dài gọn và giày vải là đường cắt/chất liệu do ART đề xuất.
- **Đạo cụ:** lò đan/dược liệu chỉ là nghiên cứu cảnh, không đeo thành trang sức hoặc bắt mọi frame mang theo. Không dùng bộ cung trang xanh đính ngọc của người phụ nữ khác ở chương 130.

Nhận diện v1 được chấp nhận ngày 07/10/2026 qua phản hồi về bộ ba; mẫu tĩnh là chuẩn ART đầu tiên, chưa là duyệt animation hoặc nội dung arc. Mẫu tĩnh trong gói trước dùng **áo tím**, frame **64 × 96 px**, bốn hướng đứng để đối chiếu camera. Bộ hiện hành là **chibi native-v5**, 20 frame đứng/đi bốn hướng, mặt mềm, tóc xanh đen rẽ lệch/buộc thấp, áo lavender hai lớp/cổ ngà; đã được chấp nhận ngày 07/10. Bộ đỏ, luyện đan và diện mạo arc khác chưa sản xuất.

## 5. Chân dung UI và kế hoạch động tác

[Trang chân dung UI](design/characters/core-ui-v1/index.html) có một hình cơ bản mỗi người: Vương Lâm áo xám/nét chú ý, Tư Đồ Nam linh thể/cười tự tin và Lý Mộ Uyển áo tím/tập trung. Bản 512 px lưu ART, 160 px hội thoại, 64 px thumbnail; mỗi cỡ có PNG/WebP trong suốt. [Nguồn và prompt](design/characters/core-ui-v1/README.md) ghi input riêng từng người; các chân dung mới chờ đánh giá.

Tư Đồ Nam được crop đầu/vai phía trên vùng ngực khuyết; không chuyển linh thể thành thân thể phục hồi. Trang phục và thời điểm xuất hiện theo cảnh. Bộ ba là nhân vật người chơi trong GDD hiện hành; portrait v1 là nguồn ART trước chibi, chưa tích hợp UI gameplay.

[Kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) và [dữ liệu](data/core-character-motion-plan.json) hiện ghi 60 frame chibi, mục tiêu 76 khi thêm 12 lơ lửng tại chỗ và 4 luyện đan. Gói chân dung UI trước được giữ tham chiếu; 16 frame bổ sung chưa vẽ.

### Gói xem và bàn giao

- Hai bảng nhận diện giữ tranh mực/giấy cổ; có các góc thân và nghiên cứu mặt.
- Hai nguồn pixel trong suốt: linh thể Tư Đồ Nam và Lý Mộ Uyển áo tím, mỗi người bốn hướng tĩnh.
- Mẫu native có palette/khung riêng theo hình thái, atlas/PNG rời/metadata và trang so sánh cùng Vương Lâm.
- Prompt/input, nguồn và trạng thái duyệt được lưu trong manifest; hình nguồn lớn không thay PNG native.

Các mẫu tĩnh trong gói nguồn chưa bổ sung gameplay. Quyền chọn bộ ba từ đầu theo GDD; truyện, năng lực, biểu cảm và trang phục theo từng mốc vẫn cần biên tập riêng.

## 6. Thứ tự sau gói này

1. Giữ ưu tiên map theo [hướng dẫn](MAP-BUILDING-GUIDE.md); chưa mở sản xuất portrait/động tác mới.
2. Khi chuyển sang nhân vật, đánh giá chibi Tư Đồ Nam và hai đệ tử; đồng bộ chân dung UI với bộ chibi hiện hành, đặc biệt Lý Mộ Uyển native-v5.
3. Lập bộ tương tác/tu luyện/combat cho cả ba lựa chọn đầu game theo GDD; NPC phụ chỉ sản xuất khi nội dung Hằng Nhạc cần.
4. Tách duyệt mỹ thuật, kiểm kỹ thuật và tích hợp gameplay; không dùng mốc xuất hiện nguyên tác làm khóa chọn nhân vật.
