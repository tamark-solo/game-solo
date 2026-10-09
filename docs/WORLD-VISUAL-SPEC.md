# Hình ảnh trên map — nhân vật pixel art, nền stylized 2D

**Phiên bản:** 0.9, ngày 08/10/2026.

**Hướng đã chọn:** nhân vật pixel art chibi đầu lớn/thân gọn + nền stylized 2D; top-down ba phần tư, thấy mặt/thân.  
**Chuẩn runtime/editor:** frame 64 × 96 và chân (32,88). Preview có năm mẫu chibi 20 frame/mẫu cùng bộ Vương Lâm trước 36 frame, tổng sáu bộ/136 frame; xem [roster](CHIBI-ROSTER-SPEC.md) và [catalog nguồn](data/client-tech-preview-design.json). GDD chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu; sân online hiện vẫn chỉ nhận hai mẫu đệ tử thử.
**Tham chiếu:** [GDD](GDD.md), [MMORPG](MMORPG-DIRECTION.md), [ART](ART-DIRECTION.md), [nhân vật](CHARACTERS.md), mẫu màn thế giới (bộ cũ đã xóa).

**Map hiện tại:** [map đầy đủ Hằng Nhạc mới](design/world/hang-nhac-map-v1/README.md) là nền thiết kế level, camera orthographic/top-down ba phần tư, world 3072 × 2048 và sprite native 1×. Concept/nền/ba asset thử đã xóa; chủ dự án vẽ luồng đi/chặn trước, asset rời sau. Nguồn imagegen 1536 × 1024 phục hồi cục bộ rồi xuất 2×, chưa là ART tách lớp hoặc map MMO.

**Chuẩn dựng map:** đọc [quy tắc](MAP-BUILDING-GUIDE.md), [phân công](MAP-ASSET-PRODUCTION-NOTES.md) và [Level Design](MAP-LEVEL-DESIGN.md). Giữ nguồn rõ ở 1×, gom cụm cùng quan hệ trước/sau, tách phần che cần điều khiển; nền dưới đầy đủ và alpha sạch. MP01–MP07/MAP03 cùng native pilot legacy đã dừng sau reset; không dùng chúng làm kế hoạch hoặc khôi phục nguồn.

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
- Thử cảnh ghép trước khi chốt palette/kích thước. Map đầy đủ mới đang chờ đánh giá; nguồn ART tách lớp và tỷ lệ phải kiểm riêng. Bộ Hằng Nhạc đã xóa không còn là mốc để tiếp tục sửa lớp/footprint.

## 2. Quy chuẩn góc nhìn

- Góc cố định từ trên chéo xuống: thấy mặt đất/mái nhà, đồng thời thấy mặt và thân người.
- Hướng bắc ở phía trên màn hình; sân và đường chính bố trí theo trục ngang/dọc của ảnh.
- Nhân vật, nhà, cây và đạo cụ dùng cùng hướng nhìn; chân nhân vật tiếp xúc nền rõ.
- Không gian đi lại và điểm tương tác đọc được ngay, vật cao được xét che khuất khi dựng map thật.

Đây là lựa chọn **2D top-down ba phần tư**. Client TypeScript + Three.js đã chọn; [thiết kế client](TECH-STACK.md) dùng camera orthographic cố định, đặt lớp ảnh trong mặt phẳng màn hình. Góc ba phần tư nằm trong ART; không nghiêng phối cảnh thêm lên ảnh nền đã vẽ. [Preview v1](ANIMATION-PREVIEW-SPEC.md) đã kiểm tra điểm neo, lưới/va chạm/lớp của fixture; [mẫu chibi](GAIT-REFERENCE-REVIEW.md) dùng chung renderer để xem tỷ lệ mới.

## 3. Tỷ lệ và kích thước thử

| Nội dung | Giá trị thử | Trạng thái |
| --- | --- | --- |
| Tỷ lệ nhân vật trên map | Chibi đầu lớn/thân gọn khoảng 2,5–3 đầu | Giữ chuẩn Vương Lâm đã được dùng cho dàn mới |
| Khung cảnh để xem tỷ lệ | 960 × 640 px | Khung minh họa của trang thiết kế |
| Chiều cao nhân vật hiển thị | Bộ native áo xám đầu tiên khoảng 80–82 px ở 1× | Đã xuất; xem trên sân tham chiếu |
| Hướng nhân vật | 4 hướng đứng/đi/lướt theo bộ | Năm mẫu chibi có 4 đứng/16 chuyển động mỗi mẫu |
| Frame runtime/editor | 64 × 96; chân (32, 88) | Hợp đồng đang chạy; độc lập ô map/va chạm |
| Hợp đồng VFX R01 | Canvas 96 × 96; body 80; chân (48,88) | Nguồn ART/VFX riêng, chưa thay frame runtime hoặc chốt tỷ lệ của concept mới |
| Tham số chân đi | Runtime/editor: bán kính 8, tốc độ thử 80 px/s | Thông số prototype, chưa là gameplay vận hành đã khóa |

Mục tiêu 80–96 px ở bảng là cỡ hiển thị đã đề xuất trước; cỡ native và hệ số phóng pixel cần thiết kế riêng. Hai PNG thử 1.254 × 1.254 là ảnh tham chiếu lớn, không tự trở thành frame native 64 × 96.

Khung 360 px trong trang mẫu cắt vùng quanh nhân vật từ cùng ảnh hiển thị, giữ cỡ người. Đây là phép kiểm tra tỷ lệ; chưa xác định camera bám nhân vật hoặc UX mobile cuối cùng. Khi làm màn nhỏ phải duyệt cả vùng nhìn, điểm bấm và cách mở bảng tu luyện/nhiệm vụ.

## 4. Lịch sử mẫu màn thế giới v1, ART sân legacy v2 — nguồn đã xóa

Phần này ghi lại quá trình trước reset. Nguồn môi trường/trang mẫu đã xóa; không còn là mẫu có thể mở hoặc kế hoạch sản xuất. Khi đó ảnh dùng nghiên cứu nền/camera/UI, ba người nét mịn đã nằm sẵn trong ảnh.

Ảnh ART v2 (bộ cũ đã xóa) có sân trống ở giữa, nhà phía trên, cổng phía dưới, bệ ngồi bên trái và bảng việc bên phải. Có đệ tử trung tâm, một đồng môn và hình đại diện điểm NPC. Đây là bố cục game để nghiên cứu, không là bản đồ nguyên tác đã xác minh hoặc nhiệm vụ đã duyệt.

Nguồn khi đó được tạo bằng imagegen tích hợp, hai ảnh 1.536 × 1.024; trang mẫu dùng v2 cùng nhãn/thẻ UI HTML/CSS để xem khung 960 × 640 và 360 px. Ảnh/prompt/trang mẫu legacy đã xóa. Cảnh/nhân vật từng chung một ảnh; không là map hoặc sprite runtime.

Đánh giá ban đầu: góc nhìn/điểm trong sân rõ, nhân vật nhỏ và cùng palette nhập môn. V2 gom tán cây/mái/đá thành khối rõ và giảm texture, giữ bố cục/camera/ba người của v1. Khi làm nguồn game còn cần duyệt tỷ lệ NPC và kiểm tra che khuất ở cổng/mái. Bản mẫu chưa là chuẩn sản xuất cuối cùng. Ảnh chụp desktop (bộ cũ đã xóa) và khung 360 px (bộ cũ đã xóa) ghi bố cục UI của trang mẫu.

## 5. Lịch sử ghép Vương Lâm pixel trên nền stylized — môi trường đã xóa

Trang nghiên cứu (bộ cũ đã xóa) ghép [PNG Vương Lâm gốc](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v1.png) lên nền sân riêng (bộ cũ đã xóa). Imagegen đã bỏ ba người/bóng chân khỏi sân v2 để giữ nền/bố cục. Trong trang xem, nền và sprite là hai lớp riêng; sprite có chế độ hiển thị cạnh pixel, bóng chân/nhãn bằng UI.

Trang trước từng cho chọn khung sprite **80/96/112 px**, cảnh **1×/2×** và khung **960 × 640/360 px**. 96 px là mốc hiển thị PNG lớn khi đó, không là frame runtime hiện hành. Khung nhỏ giữ cỡ người và cắt cảnh. Bản thử không có di chuyển/animation/va chạm hoặc server; trang/môi trường này đã xóa.

Ảnh ghép, prompt nền/ghép và dữ liệu nghiên cứu môi trường đã xóa trong reset. Hai ảnh cảnh khi đó có kích thước 1.536 × 1.024; sprite nhân vật 1.254 × 1.254 được giữ riêng. Không khôi phục môi trường legacy từ mô tả này.

Quan sát ở khung 96 px: đường viền/tóc/áo xám tách được khỏi nền đá sáng; chi tiết mặt/nếp áo nhỏ và khá dày. Nền/nhân vật có tông đất/xám tương thích. Trước animation cần chuẩn hóa về lưới native và giản lược cụm màu theo cỡ thực; chưa duyệt tỷ lệ hoặc palette thành chuẩn cuối. Đã xem desktop 1× (bộ cũ đã xóa), 2× (bộ cũ đã xóa) và khung 360 px (bộ cũ đã xóa).

## 6. Điều kiện duyệt trước bộ sprite

1. Nhân vật đọc được ở cỡ 80–96 px; tóc/áo/đai nhất quán với concept đã duyệt.
2. Cùng camera giữa nhân vật/cảnh/đạo cụ và giữa các góc animation.
3. Điểm tương tác không chìm vào texture; tên/trạng thái đặt bằng UI.
4. Mặt đất và khoảng đi lại giữ tương phản vừa phải; vật cao có luật hiển thị khi che người.
5. Thử khung nhỏ vẫn thấy nhân vật và thao tác cần thiết; không lấy việc thu nhỏ toàn cảnh làm UX mobile cuối.
6. Chốt hướng, động tác và biến thể trang phục trước khi lập ngân sách frame.

## 7. Tham chiếu bộ native và trang animation đầu tiên

Nhận diện Vương Lâm v2 đã được người phát triển duyệt. [Spec sprite](WANG-LIN-SPRITE-SPEC.md) quy định 64 × 96, palette 24 mục, alpha nhị phân và điểm chân (32, 88). [Trang animation](design/characters/wang-lin-gray-walk-v1/index.html) dùng [atlas native](design/characters/wang-lin-gray-walk-v1/native-v2/atlas.png), chạy bốn hướng, cho bước từng frame/phóng nguyên lần và thử đi/dừng trên nền sân.

Trang animation nhân vật được giữ làm tham chiếu lịch sử. Các nguồn môi trường legacy đã xóa; không lấy nền hoặc nghiên cứu ghép trước làm nguồn map hiện tại. Runtime preview chung có movement/collision của fixture sân thử; nhiệm vụ/combat và map Hằng Nhạc mới chưa được tích hợp.

## 8. Tham chiếu hai mẫu đệ tử trước và so sánh cùng Vương Lâm

[Trang thử đệ tử](design/characters/player-avatars-v2/index.html) đặt ba sprite cùng frame 64 × 96 và điểm chân (32, 88). Nam búi cao, nữ búi thấp, Vương Lâm tóc dài buộc nửa đầu. Đai của hai người chơi dùng xanh trầm; palette đệ tử chung 24 mục và tách với palette Vương Lâm.

Mỗi mẫu đệ tử có 4 frame đứng/24 frame đi theo [hồ sơ](PLAYER-AVATAR-VISUAL-SPEC.md). Trang cho xem chung hướng/frame, phóng nguyên lần, nền sáng/tối, thử đi/dừng của nam hoặc nữ trên sân. Tên/vòng chọn có thể tắt để đánh giá ART ở cỡ 1×. UI chỉ biểu thị mẫu đang thử, chưa là hệ thống chọn người chơi online.

Trang này mô tả hai mẫu trước khi chuyển sang chibi 20 frame. Sân online đang dùng hai mẫu đệ tử chibi; đây là giới hạn prototype, không quyết định roster gameplay. GDD hiện chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu, vì vậy vai trò NPC tham chiếu của Vương Lâm trong mẫu cũ không là luật gameplay hiện hành. Ngân sách hai avatar thử cũng chưa xác nhận ngoại hình độc nhất hoặc sức chứa MMO.
