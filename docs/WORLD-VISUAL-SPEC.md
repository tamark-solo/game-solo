# Hình ảnh trên map — nhân vật pixel art, nền stylized 2D

**Phiên bản:** 0.7, ngày 07/10/2026.  
**Hướng đã chọn:** nhân vật pixel art chibi đầu lớn/thân gọn + nền stylized 2D; top-down ba phần tư, thấy mặt/thân.  
**Mẫu mới:** [Vương Lâm chibi một hướng](GAIT-REFERENCE-REVIEW.md), 1 đứng + 4 pose đi, frame 64 × 96, palette 24 mục. **Còn đánh giá:** tỷ lệ/motion của mẫu và việc mở các hướng/nhân vật khác.  
**Tham chiếu:** [GDD](GDD.md), [MMORPG](MMORPG-DIRECTION.md), [ART](ART-DIRECTION.md), [nhân vật](CHARACTERS.md), [mẫu màn thế giới](design/world/index.html).

## 1. Ba nhóm hình dùng trong game

| Nhóm | Cách thể hiện | Mục đích |
| --- | --- | --- |
| Nhân vật trên map | Pixel art cho đệ tử và NPC xuất hiện trên map | Giữ dáng/tóc/trang phục rõ, dùng bộ frame cùng quy chuẩn |
| Nền/đạo cụ map | Stylized 2D giản lược, khối màu lớn, texture nhẹ | Đọc đường đi, kiến trúc và điểm tương tác |
| Chân dung/cảnh truyện/UI | Tranh mực và giấy cổ đã chọn, vùng chữ sáng | Đọc chính truyện và quản lý tiến trình |

Giữ nhận diện bằng tóc, màu áo và đai. Chi tiết khuôn mặt lấy từ concept khi làm portrait; hình trên map được giản lược để thấy dáng ở kích thước nhỏ. Tỷ lệ và độ chi tiết của các nhóm được quyết định theo công dụng từng hình.

Sau thử Vương Lâm, người phát triển ưu tiên pixel art cho nhân vật và chọn giữ nền stylized 2D. [Bản pixel thử](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.png) là tham chiếu phong cách, chưa xác nhận lưới native hoặc bộ frame. Quái trên map nên dùng cùng ngôn ngữ pixel là đề xuất cần biên tập theo gói combat.

### 1.1. Điều kiện phối hợp hai cách vẽ

- Nhân vật/nền có cùng camera, tỷ lệ chân–đất, hướng ánh sáng và palette xám/đất/ngọc trầm.
- Nhân vật giữ cạnh pixel rõ; nền dùng khối lớn và texture nhẹ để người nhỏ vẫn nổi bật.
- Chuẩn hóa nhân vật về lưới pixel và cỡ native trước animation; kiểm tra mức phóng nguyên và camera để cạnh pixel nhất quán.
- Tên, mục tiêu và phản hồi do UI vẽ; portrait hội thoại giữ mức chi tiết riêng.
- Thử cảnh ghép trước khi chốt palette/kích thước; đã có [nghiên cứu ghép v1](design/world/hybrid-study/index.html), các cỡ/lưới vẫn chờ duyệt.

## 2. Quy chuẩn góc nhìn

- Góc cố định từ trên chéo xuống: thấy mặt đất/mái nhà, đồng thời thấy mặt và thân người.
- Hướng bắc ở phía trên màn hình; sân và đường chính bố trí theo trục ngang/dọc của ảnh.
- Nhân vật, nhà, cây và đạo cụ dùng cùng hướng nhìn; chân nhân vật tiếp xúc nền rõ.
- Không gian đi lại và điểm tương tác đọc được ngay, vật cao được xét che khuất khi dựng map thật.

Đây là lựa chọn **2D top-down ba phần tư**. Client TypeScript + Three.js đã chọn; [thiết kế client](TECH-STACK.md) dùng camera orthographic cố định, đặt lớp ảnh trong mặt phẳng màn hình. Góc ba phần tư nằm trong ART; không nghiêng phối cảnh thêm lên ảnh nền đã vẽ. [Preview v1](ANIMATION-PREVIEW-SPEC.md) đã kiểm tra điểm neo, lưới/va chạm/lớp của fixture; [mẫu chibi](GAIT-REFERENCE-REVIEW.md) dùng chung renderer để xem tỷ lệ mới.

## 3. Tỷ lệ và kích thước thử

| Nội dung | Giá trị thử | Trạng thái |
| --- | --- | --- |
| Tỷ lệ nhân vật trên map | Chibi đầu lớn/thân gọn; thử khoảng 2,5–3 đầu | Người phát triển chọn học cả tỷ lệ reference; mẫu mới chờ đánh giá |
| Khung cảnh để xem tỷ lệ | 960 × 640 px | Khung minh họa của trang thiết kế |
| Chiều cao nhân vật hiển thị | Bộ native áo xám đầu tiên khoảng 80–82 px ở 1× | Đã xuất; xem trên sân tham chiếu |
| Hướng nhân vật | 4 hướng đứng/đi | Đã có 4 đứng/24 đi cho Vương Lâm áo xám |
| Frame nhân vật | 64 × 96; chân (32, 88) | Chuẩn bộ đầu tiên; độc lập ô map/va chạm |

Mục tiêu 80–96 px ở bảng là cỡ hiển thị đã đề xuất trước; cỡ native và hệ số phóng pixel cần thiết kế riêng. Hai PNG thử 1.254 × 1.254 là ảnh tham chiếu lớn, không tự trở thành frame native 64 × 96.

Khung 360 px trong trang mẫu cắt vùng quanh nhân vật từ cùng ảnh hiển thị, giữ cỡ người. Đây là phép kiểm tra tỷ lệ; chưa xác định camera bám nhân vật hoặc UX mobile cuối cùng. Khi làm màn nhỏ phải duyệt cả vùng nhìn, điểm bấm và cách mở bảng tu luyện/nhiệm vụ.

## 4. Mẫu màn thế giới v1, ART sân môn phái v2

Mẫu dưới đây được làm trước khi ưu tiên pixel art cho nhân vật. Nó dùng tham chiếu **nền, camera và bố cục UI**; ba người nét mịn đã nằm sẵn trong ảnh. Chưa trình bày được cách ghép cuối cùng đã chọn.

[Ảnh ART v2](design/world/sect-courtyard-topdown-v2.png) có sân trống ở giữa, nhà phía trên, cổng phía dưới, bệ ngồi bên trái và bảng việc bên phải. Có đệ tử trung tâm, một đồng môn và hình đại diện điểm NPC. Đây là bố cục game để nghiên cứu, không là bản đồ nguyên tác đã xác minh hoặc nhiệm vụ đã duyệt.

Tạo bằng **imagegen tích hợp**: [v1](design/world/sect-courtyard-topdown-v1.png) theo [prompt đầu](design/world/sect-courtyard-topdown-v1.prompt.txt), sau đó chỉnh mức chi tiết thành v2 theo [prompt chỉnh hình](design/world/sect-courtyard-topdown-v2.prompt.txt). Hai ảnh nguồn 1.536 × 1.024; v1 giữ làm nghiên cứu, trang mẫu dùng v2. [Trang mẫu](design/world/index.html) ghép nhãn/thẻ UI bằng HTML/CSS để xem khung 960 × 640 và 360 px. Cảnh/nhân vật còn chung một ảnh; chưa là map hoặc sprite game.

Đánh giá ban đầu: góc nhìn/điểm trong sân rõ, nhân vật nhỏ và cùng palette nhập môn. V2 gom tán cây/mái/đá thành khối rõ và giảm texture, giữ bố cục/camera/ba người của v1. Khi làm nguồn game còn cần duyệt tỷ lệ NPC và kiểm tra che khuất ở cổng/mái. Bản mẫu chưa là chuẩn sản xuất cuối cùng. [Ảnh chụp desktop](design/world/world-desktop-v1.png) và [khung 360 px](design/world/world-360-v1.png) ghi bố cục UI của trang mẫu.

## 5. Thử ghép Vương Lâm pixel trên nền stylized — v1

[Trang nghiên cứu](design/world/hybrid-study/index.html) ghép [PNG Vương Lâm gốc](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.png) lên [nền sân riêng](design/world/hybrid-study/sect-courtyard-empty-v1.png). Imagegen đã bỏ ba người/bóng chân khỏi sân v2 để giữ nền/bố cục. Trong trang xem, nền và sprite là hai lớp riêng; sprite có chế độ hiển thị cạnh pixel, bóng chân/nhãn bằng UI.

Có thể chọn khung sprite **80/96/112 px**, cảnh **1×/2×** và khung **960 × 640/360 px**. 96 px là mốc thử ban đầu; cỡ đó chỉ là khung hiển thị PNG nguồn, chưa chốt frame native. Khung nhỏ giữ cỡ nhân vật và cắt vùng cảnh. Bản thử chưa có di chuyển/animation/va chạm hoặc server.

[Ảnh ghép imagegen](design/world/hybrid-study/wang-lin-courtyard-composite-v1.png) là tham chiếu tổng thể riêng, theo [prompt ghép](design/world/hybrid-study/wang-lin-courtyard-composite-v1.prompt.txt). [Prompt nền](design/world/hybrid-study/sect-courtyard-empty-v1.prompt.txt) và [dữ liệu nghiên cứu](design/world/hybrid-study/study.json) được lưu để đối chiếu. Hai ảnh cảnh mới 1.536 × 1.024; sprite nguồn vẫn giữ 1.254 × 1.254.

Quan sát ở khung 96 px: đường viền/tóc/áo xám tách được khỏi nền đá sáng; chi tiết mặt/nếp áo nhỏ và khá dày. Nền/nhân vật có tông đất/xám tương thích. Trước animation cần chuẩn hóa về lưới native và giản lược cụm màu theo cỡ thực; chưa duyệt tỷ lệ hoặc palette thành chuẩn cuối. Đã xem [desktop 1×](design/world/hybrid-study/hybrid-desktop-v1.png), [2×](design/world/hybrid-study/hybrid-zoom-v1.png) và [khung 360 px](design/world/hybrid-study/hybrid-360-v1.png).

## 6. Điều kiện duyệt trước bộ sprite

1. Nhân vật đọc được ở cỡ 80–96 px; tóc/áo/đai nhất quán với concept đã duyệt.
2. Cùng camera giữa nhân vật/cảnh/đạo cụ và giữa các góc animation.
3. Điểm tương tác không chìm vào texture; tên/trạng thái đặt bằng UI.
4. Mặt đất và khoảng đi lại giữ tương phản vừa phải; vật cao có luật hiển thị khi che người.
5. Thử khung nhỏ vẫn thấy nhân vật và thao tác cần thiết; không lấy việc thu nhỏ toàn cảnh làm UX mobile cuối.
6. Chốt hướng, động tác và biến thể trang phục trước khi lập ngân sách frame.

## 7. Bộ native và trang animation đầu tiên

Nhận diện Vương Lâm v2 đã được người phát triển duyệt. [Spec sprite](WANG-LIN-SPRITE-SPEC.md) quy định 64 × 96, palette 24 mục, alpha nhị phân và điểm chân (32, 88). [Trang animation](design/characters/wang-lin-gray-walk-v1/index.html) dùng [atlas native](design/characters/wang-lin-gray-walk-v1/native-v2/atlas.png), chạy bốn hướng, cho bước từng frame/phóng nguyên lần và thử đi/dừng trên nền sân.

Nền giữ stylized 2D, nhân vật vẽ ở 1× trên khung 960 × 640. Khung nhỏ cắt sân và giữ cỡ người. Trang là công cụ xem ART; lưới/va chạm, nhiệm vụ và server thuộc đặc tả gameplay. Nguồn/thử ghép trước đó được giữ để truy quá trình.

## 8. Hai mẫu đệ tử và so sánh cùng Vương Lâm

[Trang thử đệ tử](design/characters/player-avatars-v2/index.html) đặt ba sprite cùng frame 64 × 96 và điểm chân (32, 88). Nam búi cao, nữ búi thấp, Vương Lâm tóc dài buộc nửa đầu. Đai của hai người chơi dùng xanh trầm; palette đệ tử chung 24 mục và tách với palette Vương Lâm.

Mỗi mẫu đệ tử có 4 frame đứng/24 frame đi theo [hồ sơ](PLAYER-AVATAR-VISUAL-SPEC.md). Trang cho xem chung hướng/frame, phóng nguyên lần, nền sáng/tối, thử đi/dừng của nam hoặc nữ trên sân. Tên/vòng chọn có thể tắt để đánh giá ART ở cỡ 1×. UI chỉ biểu thị mẫu đang thử, chưa là hệ thống chọn người chơi online.

Hai mẫu hiện là bộ thử chờ đánh giá nhận diện/motion. Ngân sách hai mẫu không tạo ra ngoại hình độc nhất cho mọi tài khoản; tên và chỉ báo người chơi vẫn thuộc UX thế giới. Vương Lâm luôn là NPC tham chiếu; không dùng mẫu của ông làm avatar.
