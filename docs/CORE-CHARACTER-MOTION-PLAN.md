# Bộ ba người chơi — kế hoạch động tác

**Phiên bản:** 0.5, ngày 09/10/2026.\
**Hướng gameplay:** [GDD 0.28](GDD.md) cho chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu; cả ba trải qua Hằng Nhạc đến hết Ngưng Khí, phân hóa từ Trúc Cơ. Mốc xuất hiện trong nguyên tác là căn cứ biên tập truyện, không khóa quyền chọn nhân vật.\
**Hiện trạng:** bộ ba chibi có **60 frame đứng/đi/lướt**, chọn được trong sân Hằng Nhạc với hồ sơ riêng, R01 luyện thử và HN01–HN02/thổ nạp. [Core cast v1](design/characters/core-cast-v1/README.md) bổ sung **36 clip / 300 frame thi triển** cho ba thuật × ba nhân vật × bốn hướng; ART mới chờ đánh giá. Frame cast tính riêng với locomotion.\
**Tham chiếu:** [nhận diện](CORE-CHARACTER-VISUAL-SPEC.md), [chuẩn chibi](CHIBI-ROSTER-SPEC.md), [preview](ANIMATION-PREVIEW-SPEC.md), [dữ liệu kế hoạch](data/core-character-motion-plan.json), [chân dung UI](design/characters/core-ui-v1/index.html).

## 1. Bộ hiện có

| Nhân vật/hình thái | Nguồn đang dùng | Frame | Trạng thái hình |
| --- | --- | --- | --- |
| Vương Lâm áo xám chibi | [native-v2](design/characters/wang-lin-chibi-walk-v1/native-v2/atlas.json) | 4 đứng + 16 đi = 20 | Làm chuẩn tỷ lệ theo phản hồi tích cực; hướng Đông có một frame chỉnh cuối, không suy thành duyệt ART phát hành |
| Tư Đồ Nam linh thể đứng chibi | [native-v2](design/characters/chibi-roster-v1/situ-nan/native-v2/atlas.json) | 4 đứng + 16 lướt = 20 | Chibi/chuyển động còn chờ đánh giá; nhận diện đứng v3 trước đó chỉ được tạm chấp nhận |
| Lý Mộ Uyển chibi lavender | [native-v5](design/characters/chibi-roster-v1/li-muwan/native-v5/atlas.json) | 4 đứng + 16 đi = 20 | Đã chấp nhận làm chuẩn bản thử ngày 07/10; portrait trước cần đồng bộ |

Tổng **60 frame core** là ba bộ hiện hành. Catalog preview có thêm hai đệ tử chibi 40 frame và Vương Lâm trước 36 frame để đối chiếu, thành **6 bộ / 136 frame**. Các atlas tĩnh, bộ sáu/tám pose và dạng ngồi Tư Đồ Nam được giữ lịch sử; không cộng lại vào tổng core hiện hành.

## 2. Lưới và điểm đặt

- Frame **64 × 96 px**, hướng `south/west/east/north`; camera top-down ba phần tư, cỡ chơi mặc định 1×.
- Mỗi bộ chibi có palette 24 mục gồm trong suốt, alpha 0/255 và atlas **320 × 384**. Portrait tranh mực dùng quy chuẩn riêng.
- Điểm đặt **(32,88)** tính từ góc trên trái: chân cho Vương Lâm/Lý Mộ Uyển, điểm chiếu đất cho Tư Đồ Nam.
- Linh thể có đáy hình y = 84, cao **4 px** so với điểm chiếu; chân giữ duỗi khi lướt. Đứng hiện là một frame/hướng, chưa có vòng dao động tại chỗ.
- Bốn pha đi: tiếp đất A → đi qua B → tiếp đất B → đi qua A. Giữ đầu/thân, tóc/áo và hướng trái/phải đã vẽ riêng.
- `walk_*` là tên clip chung của adapter; `movementKind: glide` khiến UI ghi **Lướt** cho Tư Đồ Nam. Tên clip không biến lướt thành bước tiếp đất.

Inspector chibi mặc định 5 FPS. Map local thử 24 px/vòng và 40 px/s; sân online dùng tốc độ server và sải 48 px/vòng. Các số này phục vụ đánh giá hình, chưa là cân bằng gameplay cuối. Pha chân theo quãng đường, không tiến khi bị chặn; collider gắn điểm đất, không lấy toàn frame làm vật cản.

## 3. Phần bổ sung chưa sản xuất

| Bộ | Hiện có tái dùng | Vẽ thêm đã dự toán | Tổng nếu hoàn thành |
| --- | --- | --- | --- |
| Vương Lâm đứng/đi áo xám | 20 | 0 | 20 |
| Tư Đồ Nam đứng/lướt + lơ lửng tại chỗ | 20 | 12 cho 4 hướng × 4 frame lơ lửng, tái dùng 4 đứng | 32 |
| Lý Mộ Uyển đứng/đi + luyện đan | 20 | 4 luyện đan hướng trước | 24 |
| Tổng core | **60** | **16** | **76** |

12 frame lơ lửng và 4 frame luyện đan **chưa được vẽ**. Đây là dự toán ART cho thử nghiệm; ưu tiên hiện tại vẫn là map. Lò/bàn/dược liệu tách khỏi frame nhân vật, cần bố cục trước gói luyện đan. Vương Lâm có tùy chọn tương tác 4 frame và tu luyện 4 frame một hướng; nếu chọn cả hai thì thêm 8 vào 76, không coi là đầu ra đã có.

Thi triển ba thuật R01/bộ ba/bốn hướng đã sản xuất và nối [skill core](SKILL-CORE.md): 33 clip mới × 8 pose, cộng ba chuỗi Vương Lâm Đông × 12 pose đã bàn giao. Canvas cast riêng cao 96/anchor y88/body tối đa 80, Tư Đồ Nam giữ hover 4 px; không thay frame 64 × 96 của đứng/đi/lướt. Trúng đòn, đòn thường, trang phục/cảnh giới khác và thân thể phục hồi Tư Đồ Nam chưa có ngân sách motion đầy đủ.

## 4. Chuyển trạng thái và nhận diện

| Nhân vật | Chuyển trạng thái | Quy tắc |
| --- | --- | --- |
| Vương Lâm / Lý Mộ Uyển | đứng → đi → đứng | Giữ hướng vừa đi, điểm chân và tỷ lệ; đổi hướng giữ pha theo adapter |
| Tư Đồ Nam | đứng lơ lửng → lướt → đứng lơ lửng | Giữ điểm chiếu, khoảng cách đất và chân duỗi; không thêm tiếp đất |
| Lý Mộ Uyển tại bàn/lò | đứng → luyện đan → đứng, khi có gói | Giữ bố cục tương tác; đạo cụ không dính vào mọi frame di chuyển |

Chân dung và sprite cần cùng phiên bản nhận diện/hình thái. Bộ UI v1 đang chờ đánh giá và đặc biệt cần đồng bộ Lý Mộ Uyển với chibi native-v5. Dạng ngồi Tư Đồ Nam [128 × 128](design/characters/core-trio-v1/situ-nan/native-v2/atlas.png) giữ riêng cho dàn cảnh tham chiếu chương 112; không thay bộ linh thể đứng đang dùng trên map.

## 5. Đánh giá và thứ tự tiếp theo

1. Map owner đã chốt và runtime đã có; đợt R01/cast được owner yêu cầu riêng. Xem ART mới ở [trang pose](design/characters/core-cast-v1/index.html) và trong Hằng Nhạc, giữ navigation/native locomotion đã chốt.
2. Xem cả ba chibi ở 1×, nền sáng/tối và khi đổi hướng: chân trụ/tay đối nhịp, tỷ lệ thân, tóc/gấu áo, nối cuối → đầu; linh thể giữ khoảng khuyết alpha và chân duỗi.
3. Đồng bộ portrait và nhận diện sau phản hồi; khi chuyển sang gameplay, lập ngân sách tương tác/tu luyện/combat cho ba nhân vật chọn từ đầu theo GDD và hệ thống tu tiên.
4. Sản xuất phần bổ sung theo nhu cầu đã biên tập, dùng phiên bản nguồn mới và kiểm riêng kỹ thuật/duyệt hình.

Kết quả atlas/hash/browser xác nhận cách nạp và trình bày; không tự duyệt chuyển động hoặc gameplay. Ngân sách trước chibi **44 → 108 frame, cần thêm 64** được giữ trong `history` của [JSON](data/core-character-motion-plan.json) để truy quyết định cũ, không còn là kế hoạch sản xuất hiện hành.
