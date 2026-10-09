# Kịch bản nhập môn — ba nhân vật tại Hằng Nhạc

**Bản:** 2.0 · **Ngày:** 08/10/2026 · **Trạng thái:** brief biên tập theo [GDD 0.28](GDD.md) và [trải nghiệm Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md); lời dẫn/thoại chi tiết chưa được duyệt hoặc triển khai.

Bản này thay kịch bản đệ tử mới Q01–Q10 ngày 07/10. [Nguyên bản 1.0](archive/design-before-three-playable-characters/STARTER-STORY.md) được giữ để đối chiếu, không dùng thoại “bạn đến đây với tên của mình”, Vương Lâm là NPC và boss/tầng 3 làm mở đầu hiện hành.

## 1. Quyết định cần giữ khi viết

Người chơi chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu; cả ba học nền gameplay tại Hằng Nhạc qua Ngưng Khí, có đoạn cá nhân nhẹ, rồi phân hóa sâu từ hành trình Trúc Cơ. Kiếm Khí, Lôi Ấn và Ngự Phong Bộ R01 có sẵn khi bắt đầu điều khiển. Nhiệm vụ hướng dẫn cách vận dụng, không đóng vai cổng nhận ba thuật.

Hằng Nhạc chung là mở đầu chuyển thể của game. Các chương theo nguyên tác vẫn giữ nguồn và niên biểu riêng; không kể ba người vốn cùng nhập môn, không chuyển lần gặp đầu của Lý Mộ Uyển sang Hằng Nhạc hoặc xóa kiến thức/cảnh giới của Tư Đồ Nam để đồng bộ level. Nhiệm vụ, lời dẫn và đối thủ sáng tạo phải ghi rõ phần chuyển thể.

## 2. Lời dẫn theo nhân vật cần biên tập

| Nhân vật | Nội dung phải làm rõ lúc vào game | Ranh giới |
| --- | --- | --- |
| Vương Lâm | Danh tính, động lực tu luyện đầu và mục tiêu học vận dụng linh lực | Thiên Nghịch Châu/cơ duyên thuộc tuyến riêng đúng mốc; không phát cho mọi hồ sơ |
| Tư Đồ Nam | Trạng thái linh thể bị hạn chế, kiến thức vốn có và phần năng lực hiện đang phục hồi | Tutorial là thử/khôi phục vận dụng; không kể ông mới học Ngưng Khí lần đầu |
| Lý Mộ Uyển | Mở đầu gameplay chuyển thể; khả năng tự chiến đấu và nét chuẩn bị đan–trận | Không giới thiệu là người chỉ chữa/hỗ trợ Vương Lâm; không đổi lịch sử gặp gỡ nguyên tác |

Nguồn neo/biểu hiện linh thể Tư Đồ Nam, thoại mở đầu và danh tính NPC tiếp dẫn còn cần biên tập/duyệt. Brief không tự tạo một vật phẩm canon hoặc pháp quyết chung mới để giải thích preset.

## 3. Khung tuyến HN01–HN12 đề xuất

Các ID, điều kiện và phần thưởng theo [đặc tả trải nghiệm](HANG-NHAC-NGUNG-KHI-SPEC.md); bảng này chỉ dẫn biên tập, chưa là script runtime.

| Chặng | Mục đích lời dẫn | Điều không được kể thành mở khóa mới |
| --- | --- | --- |
| HN01 — Tiếp dẫn | Nhận diện người đang điều khiển, di chuyển/tương tác và mục tiêu trước mắt | Tạo đệ tử vô danh thay nhân vật đã chọn |
| HN02 — Vận hành đầu | Giải thích tích lũy khác linh lực; diễn giải hồi phục riêng cho Tư Đồ Nam | Nhận toàn bộ R01 sau thổ nạp hoặc nhận châu chung |
| HN03–HN04 — Luyện thuật/đổi vị trí | Học định hướng Kiếm, mục tiêu/điểm khóa Lôi, Phong/đi bộ theo báo đòn | Nhiệm vụ mới cấp quyền một skill vốn có |
| HN05 — Trận nhỏ | Vận dụng nền trong encounter có đường solo | Cần người khác hoặc một class bắt buộc để tiến |
| HN06 — Đoạn riêng | Cho thấy một nét nhận diện nhẹ của người đã chọn | Mở cả nghề/cây kỹ năng riêng ngay nhập môn |
| HN07 — Bình cảnh | Nêu phần thiếu và bài vận dụng để tự giải | Đầy tu vi tự vượt mốc hoặc trivia đổi lấy lĩnh ngộ |
| HN08–HN09 — Chuẩn bị/phối hợp | Sở hữu khác luyện hóa/vận dụng; kiểm năng lực nền ổn định | Tự cấp R02–R05 hoặc thuật đặc trưng chưa có hồ sơ |
| HN10 — Khảo nghiệm cuối | Kiểm phối hợp điều đã học, có thử lại/khôi phục rõ | Boss nguyên tác bị đánh bại theo stat chuyển thể chưa duyệt |
| HN11–HN12 — Tổng kết/xuất hành | Giải thích thành quả và mục tiêu riêng tiếp theo; xác nhận đi tiếp | Qua cổng tự có Trúc Cơ hoặc báo map sau đã có khi chưa triển khai |

Mốc 1/3/9/15 và phạm vi hết 15 tầng trong Hằng Nhạc là đề xuất cần đánh giá; lời dẫn không biến cách phân bổ game thành niên biểu nguyên tác. Bản thử có thể dừng ở lát nhỏ, nhưng phải gọi đúng phạm vi đã có.

## 4. HN06 và HN07: dấu nhận diện nhẹ

Theo [HN06/HN07](HANG-NHAC-NGUNG-KHI-SPEC.md):

- Vương Lâm quan sát mục tiêu/đường thuật và chọn khoảng cách/góc; bình cảnh được giải bằng đọc nhịp vận dụng. Không tự mở thần thức/cấm chế cao.
- Tư Đồ Nam nhận ra “biết” khác “hiện thi triển được”; ổn định biểu hiện linh thể và thử lại năng lực nền. Không xóa tri thức truyện.
- Lý Mộ Uyển nhận biết nhu cầu, chọn chuẩn bị phù hợp rồi tự thử trận; không bắt chữa cho người khác. Vật tư/công thức mẫu là chuyển thể chưa khóa.

Mỗi đoạn giữ một nét riêng và dùng lại nền nhập môn. Lời kết ghi điều đã hiểu hoặc khả năng đã ổn định, không biến mọi trải nghiệm thành một thanh EXP mới. Tác dụng/số liệu và bài kiểm chứng chi tiết cần chơi thử theo hồ sơ gameplay.

## 5. Luật trình bày và quyền nội dung

Thoại ngắn, mục tiêu hiện tại và phần còn thiếu phải dễ tìm; UI mở dần theo nhiệm vụ. Tu vi là tích lũy dài hạn, linh lực là nguồn dùng thuật trong trận; nhãn Tư Đồ Nam ưu tiên trạng thái/hồi phục. Khu chung không công bố cơ duyên hoặc chương riêng của tài khoản khác.

Đọc/bỏ qua lời dẫn không tự nhận thưởng hay xác nhận vượt mốc. Máy chủ xác nhận kết quả, chi phí và thưởng một lần; replay chỉ xem/luyện theo luật riêng. Idle không tiếp tục truyện, combat, lĩnh ngộ then chốt hoặc xác nhận đột phá khi vắng mặt. Các tương tác, khoảng cách tới điểm chân, marker và kiểm đường nhìn cần hợp đồng UX/kỹ thuật trước triển khai.

## 6. Việc còn cần chốt

Biên tập/đối chiếu nguồn lời mở và ba tuyến cá nhân; chọn danh tính NPC; khóa điều kiện/mốc với [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md); khớp khảo nghiệm với [đối thủ/HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md); xác định đoạn xuất hành và tuyến Trúc Cơ đầu. Thoại Q01–Q10, tên quái/boss và số liệu của bản 1.0 không được chép sang tuyến mới như quyết định đã duyệt.

Ưu tiên vẫn là map trước vận hành gameplay theo [MVP RPG](MVP-RPG-A.md); ART cũ đã xóa, đang chờ kế hoạch map mới. Brief này cung cấp ngữ cảnh để biên tập sau map, không xác nhận nhiệm vụ/combat/lưu tài khoản đã hoạt động.
