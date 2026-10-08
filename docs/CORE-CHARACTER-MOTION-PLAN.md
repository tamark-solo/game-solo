# Bộ ba trọng tâm — kế hoạch động tác

**Phiên bản:** 0.4, ngày 07/10/2026.

**Trạng thái:** bộ ba chibi có **60 frame** đứng/đi/lướt trong preview 0.5.1. Vương Lâm làm chuẩn; Lý Mộ Uyển native-v5 đã chấp nhận cho bản thử, Tư Đồ Nam chibi mới còn chờ đánh giá.

**Tham chiếu:** [quy chuẩn dàn chibi](CHIBI-ROSTER-SPEC.md), [gallery](design/characters/chibi-roster-v1/index.html), [nguồn/prompt](design/characters/chibi-roster-v1/README.md), [dữ liệu động tác](data/core-character-motion-plan.json).

**Ưu tiên mới:** theo yêu cầu người phát triển, map/kịch bản/combat [RPG-A](MVP-RPG-A.md) làm trước đồng bộ portrait, lơ lửng tại chỗ và luyện đan NPC. Ngân sách 16 frame bổ sung dưới đây giữ kế hoạch sau; bộ đứng/đi/lướt hiện có dùng tiếp, không đổi tỷ lệ.

## 1. Bộ đang dùng

| Nhân vật | Đã có | Trạng thái |
| --- | --- | --- |
| Vương Lâm áo xám chibi | 4 đứng + 16 đi = 20 | Chuẩn tỷ lệ đã chọn; frame cuối Đông đã sửa |
| Tư Đồ Nam linh thể chibi | 4 đứng lơ lửng + 16 lướt = 20 | Vòng dao động tại chỗ chưa vẽ |
| Lý Mộ Uyển chibi mới | 4 đứng + 16 đi = 20 | Native-v5 chấp nhận làm chuẩn bản thử |

Hai đệ tử có 40 frame riêng, nên năm bộ chibi là 100 frame. Catalog thêm Vương Lâm bộ trước 36 frame để đối chiếu, thành sáu bộ/136. Mẫu tĩnh, portrait và atlas lịch sử không cộng vào core đang dùng. Thời điểm xuất hiện B/arc sau giữ theo nội dung đã biên tập.

## 2. Lưới và nhịp

- Frame **64 × 96**, palette 24 mục/bộ gồm trong suốt; atlas **320 × 384**, hàng xuống/trái/phải/lên.
- Điểm đặt **(32,88)**: người đi dùng điểm chân, linh thể dùng điểm chiếu. Đáy người đi y = 88; Tư Đồ Nam y = 84, cao 4 px.
- Một đứng và bốn chuyển động mỗi hướng; trái/phải có hình riêng. Đầu/thân ổn định, tay gần hông và bước nhỏ.
- Linh thể giữ chân duỗi, áo gợn nhẹ, ngực có lỗ alpha thật. Clip `walk_*` dùng chung bộ điều khiển; UI ghi **Lướt** theo `movementKind: glide`.
- Nhịp thử 5 FPS tại chỗ, 24 px/vòng và 40 px/s trên map cục bộ. Online dùng tốc độ server/sải 48 px đã có; đây là thông số duyệt ART.

## 3. Phần còn dự kiến

| Bộ | Hiện có | Vẽ thêm dự kiến | Tổng |
| --- | --- | --- | --- |
| Vương Lâm đứng/đi | 20 | 0 | 20 |
| Tư Đồ Nam lơ lửng/lướt | 20 | 12 lơ lửng tại chỗ | 32 |
| Lý Mộ Uyển đứng/đi/luyện đan | 20 | 4 luyện đan, một hướng trước | 24 |
| Tổng core | **60** | **16** | **76** |

Vòng lơ lửng dự kiến bốn frame/hướng, tái dùng bốn hình đứng và vẽ thêm 12; điểm chiếu cố định, dao động nhỏ khoảng 1 px. Luyện đan được làm khi có bố cục bàn/lò, đạo cụ tách khỏi sprite. **16 frame trong bảng chưa vẽ.**

Tùy chọn Vương Lâm: tương tác bốn frame và tu luyện bốn frame, một hướng mỗi động tác; nếu làm cả hai, tổng core là 84. Trang phục khác, thân thể phục hồi và chiến đấu có ngân sách riêng. Dự toán trước chibi 44 → 108 lưu lịch sử trong JSON.

## 4. Chuyển trạng thái và duyệt hình

Đứng → đi/lướt → đứng giữ hướng cuối và điểm đặt. Đổi hướng giữ pha; dừng không kéo hình trôi trong pose đứng. Tư Đồ Nam không dùng bước tiếp đất; đứng lơ lửng hiện là một hình/hướng. Luyện đan không tự chạy khi di chuyển.

Lý Mộ Uyển native-v5 có mặt mềm, tóc xanh đen rẽ lệch/buộc thấp, áo lavender hai lớp/cổ ngà; người phát triển đã chấp nhận làm chuẩn bản thử. Chân dung UI cần đồng bộ với nhận diện này. Dạng ngồi Tư Đồ Nam và các biến thể theo truyện giữ trong [hồ sơ nguồn](CORE-CHARACTER-VISUAL-SPEC.md).

Gallery cho xem cùng hướng, từng pose, nối cuối → đầu, nền sáng/tối và cỡ 1×/2×/4×. Preview Three.js cho thử đi/dừng, va chạm và che khuất; hai avatar chibi dùng trên sân online. Kiểm tra frame/palette/alpha/điểm đặt xác nhận kỹ thuật; duyệt nhận diện và nhịp chân/tay cần xem chuyển động thực tế.
