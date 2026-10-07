# Định hướng ART — Tiên Nghịch: Hành Trình Vương Lâm

**Phiên bản:** 1.6, ngày 07/10/2026.  
**Hướng hiện tại:** nhân vật pixel art + nền stylized 2D, top-down ba phần tư; portrait/truyện/UI giữ tranh mực và giấy cổ.  
**Trạng thái:** định hướng và bảng tham chiếu; màu/font/diện mạo cụ thể là đề xuất để xem trong bố cục UX.  
**Tham chiếu:** [UX](UX-MVP-A.md), [thành phần UI](UI-COMPONENTS.md), [asset](ASSET-PLAN.md), [bảng ART](design/art-reference-v1.png).

**Điều chỉnh online:** người chơi tạo đệ tử riêng, Vương Lâm là NPC trung tâm của chính truyện. [CHARACTERS.md](CHARACTERS.md) và [thư viện tạo hình v1](design/characters/index.html) là hồ sơ nhân vật hiện tại. Bộ UX v0.6 còn cần điều chỉnh theo [ONLINE-DIRECTION.md](ONLINE-DIRECTION.md).

**Thử ghép từ GDD v0.11:** nhân vật pixel + nền stylized đã có [thử ghép v1](design/world/hybrid-study/index.html), nền/sprite riêng, cỡ 80/96/112 px và cảnh 1×/2×. [WORLD-VISUAL-SPEC.md](WORLD-VISUAL-SPEC.md) ghi kết quả quan sát; tỷ lệ/palette/lưới native cần duyệt trước bộ đứng/đi. Sân v2 và hai sprite thử cũ được giữ làm nguồn tham chiếu.

**Nguồn diện mạo đã chốt:** mô tả tiểu thuyết, thiết kế riêng cho game. [WANG-LIN-VISUAL-SPEC.md](WANG-LIN-VISUAL-SPEC.md) xác định tuổi, ba bộ đồ, thần thái và biến thể cảnh; mặt/tóc, đường cắt áo và palette chi tiết vẫn là phần ART đề xuất.

**Bộ Vương Lâm v2:** đã có [tạo hình](design/characters/wang-lin-initiation-v2.png), [biểu cảm](design/characters/wang-lin-expressions-v2.png) và [pixel đứng áo xám](design/characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.png). Xem chung tại [thư viện nhân vật](design/characters/index.html); [manifest](design/characters/wang-lin-v2-study.json) trỏ tới prompt/input. Đây là nguồn nhận diện đã duyệt; bộ native được xuất riêng bên dưới.

**Nhận diện đã duyệt và native đầu tiên:** người phát triển đã duyệt Vương Lâm v2. [Bộ áo xám](design/characters/wang-lin-gray-walk-v1/index.html) có 28 frame native 64 × 96, palette 24 mục và điểm chân (32, 88); [spec sprite](WANG-LIN-SPRITE-SPEC.md) ghi nhịp/bộ hướng. Chuyển động là bản đầu cần xem thử; hai mẫu đệ tử vẫn cần duyệt riêng.

**Hai đệ tử v2:** đã có [nhận diện và bộ pixel thử](design/characters/player-avatars-v2/index.html), cùng lưới/anchor với Vương Lâm; 28 frame/mẫu, 56 frame tổng. Nam dùng búi cao/mặt góc cạnh/vai rộng, nữ dùng búi thấp/dáng gọn; cả hai có đai xanh trầm và cùng mức trang bị. [Hồ sơ đệ tử](PLAYER-AVATAR-VISUAL-SPEC.md) ghi palette chung, dấu phân biệt và điểm cần đánh giá. Nhận diện/chuyển động hai mẫu chưa được duyệt.

**Bộ ba trọng tâm:** người phát triển ưu tiên nhận diện Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển trước NPC phụ. [Gói tạo hình](design/characters/core-trio-v1/index.html) bổ sung hai concept và tám mẫu tĩnh; [hồ sơ nguồn](CORE-CHARACTER-VISUAL-SPEC.md) tách lời thoại/dạng nguyên anh của Tư Đồ Nam và áo đỏ/tím của Lý Mộ Uyển. Tư Đồ Nam đứng v3 và Lý Mộ Uyển dùng khung 64 × 96; dạng ngồi Tư Đồ Nam 128 × 128 được lưu riêng. Lý Mộ Uyển v1 đã được chấp nhận. Tư Đồ Nam đứng v3 giữ mặt rộng/tóc đen buộc thấp của v2; điểm chiếu (32, 88), hình lơ lửng cao 4 px. Tư thế đứng là ART cho tương tác MMORPG, mẫu v3 đã tạm chấp nhận làm chuẩn thiết kế, ART sẽ hoàn thiện theo phản hồi sau.

**Chân dung UI v1:** [ba chân dung](design/characters/core-ui-v1/index.html) dùng nhận diện hiện tại, tranh mực có alpha trên nền UI giấy/tối. Một biểu cảm/người, PNG/WebP 512/160/64; nguồn/master giữ riêng, WebP giao web đạt ngân sách 120/24/8 KB. Hình mới chờ đánh giá. [Kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) ghi thêm 64 frame sau khi sản xuất các bộ theo giai đoạn, chưa là animation đã có.

**Preview trước animation mới:** client đã chọn TypeScript + Three.js. [Đặc tả preview](ANIMATION-PREVIEW-SPEC.md) dùng camera orthographic cố định, texture pixel lấy mẫu nearest và điểm chiếu từ metadata; nền/portrait giữ sampling mượt. Dùng năm bộ hiện có để kiểm công cụ trước sản xuất thêm động tác. Framework đồ họa không tự đổi ART 2D thành map 3D.

## 1. Cảm giác và cách thể hiện

Game có cảm giác như một quyển ghi chép hành trình tu luyện: giấy ấm, chữ mực rõ, cảnh sơn thủy có chiều sâu và ánh sáng linh khí vừa đủ để nhận ra trạng thái mới. Phần nhập môn giữ nét đời thường, sự bỡ ngỡ và bí ẩn của cơ duyên. Brief xuất thân Vương Lâm đã được sửa theo hồ sơ nguồn; mức sờn/hư hại trang phục phải gắn với cảnh cụ thể.

UI sử dụng mặt giấy sáng, ít họa tiết dưới chữ/số. Tranh nằm ở khung địa điểm, chân dung và cảnh truyện; nét mực có thể loang ở rìa ảnh. Ánh sáng xanh ngọc tập trung vào linh dịch, châu và mộng cảnh.

## 2. Bảng tham chiếu đầu tiên

[art-reference-v1.png](design/art-reference-v1.png) gồm đường núi/suối, phòng đệ tử, hai nghiên cứu áo xám/đỏ của Vương Lâm và một thử nghiệm mộng cảnh. Bảng được tạo bằng **imagegen tích hợp** theo [prompt đã dùng](design/art-reference-v1.prompt.txt).

| Phần | Mục đích tham chiếu | Chi tiết cần kiểm tra ở asset thật |
| --- | --- | --- |
| Đường núi/suối | Độ loang mực, tầng xa/gần, nước xanh dịu | Vùng cắt cho MAP-003/006, chỗ đặt hổ và thông tin cảnh |
| Phòng đệ tử | Vật dụng gỗ, không gian giản dị, tương phản sáng | Biến thể phòng chung/phòng riêng và đạo cụ theo mốc |
| Vương Lâm áo xám/đỏ | Cùng gương mặt, chuyển thân phận bằng trang phục | Tuổi/diện mạo giai đoạn A; chân dung đọc được ở 64 px |
| Mộng cảnh | Khoảng không, điểm sáng ngọc, khác ngoại giới | Bố cục thử nghiệm; chi tiết không gian phải biên tập với nguồn |

Diện mạo, cách buộc tóc và hình khối phong cảnh là lựa chọn minh họa. Các chi tiết có căn cứ nguyên tác như áo xám/đỏ, mốc châu và vai trò địa điểm được giữ theo hồ sơ nguồn trong GDD/ASSET-PLAN.

Bảng này là tài liệu tham chiếu. Trong bản phác UX, tranh được cắt khung từ cùng bảng để xem phối hợp hình và UI. Các nguồn AS-ENV/AS-CHR trong catalog vẫn ở trạng thái cần sản xuất theo brief.

Đã bổ sung 3 bảng concept bằng imagegen tích hợp: [Vương Lâm nhập môn](design/characters/wang-lin-initiation-v1.png), [đệ tử nam](design/characters/player-male-novice-v1.png), [đệ tử nữ](design/characters/player-female-novice-v1.png). Prompt chính xác lưu cạnh từng hình, liên kết trong [CHARACTERS.md](CHARACTERS.md). Chúng bổ sung việc nghiên cứu mặt/tóc/trang phục; nguồn portrait game sẽ làm sau khi duyệt.

[ART sân môn phái v2](design/world/sect-courtyard-topdown-v2.png) được tạo bằng imagegen tích hợp: [v1](design/world/sect-courtyard-topdown-v1.png)/[prompt đầu](design/world/sect-courtyard-topdown-v1.prompt.txt), rồi chỉnh mức chi tiết theo [prompt v2](design/world/sect-courtyard-topdown-v2.prompt.txt). Hình thử khối cảnh và tỷ lệ người nhỏ; [mẫu UI v1](design/world/index.html) dùng v2 và cho xem khung 960/360 px. Cảnh/nhân vật còn chung một ảnh, chưa là tileset hoặc sprite đã duyệt.

## 3. Bảng màu UI đề xuất

Các giá trị máy đọc được nằm trong [ui-tokens.json](design/ui-tokens.json).

| Vai trò | Màu | Cách dùng |
| --- | --- | --- |
| Giấy nền | `#F3EBDD` | Nền toàn màn hình; khoảng trống giữa thẻ |
| Mặt giấy đọc | `#FBF7EE` | Thẻ số liệu, lời dẫn, menu; vùng chữ phẳng |
| Mực chính | `#252722` | Nội dung, số tài nguyên, tiêu đề |
| Mực phụ | `#605E54` | Chú thích, lý do chờ, điều kiện còn thiếu |
| Ngọc đậm | `#245C53` | Nút chính, tiến độ, dấu đang hoạt động |
| Ngọc nhạt | `#DCE9E0` | Nền trạng thái chọn/đang chạy |
| Ánh linh khí | `#8FCBBE` | Hiệu ứng và chi tiết tranh; không làm chữ trên giấy |
| Đỏ áo | `#873B35` | Trang phục sau E05; dấu đang xem node trong bản phác |
| Viền giấy | `#CFC1A8` | Viền trang trí/thẻ |
| Viền điều khiển | `#7A7464` | Ranh giới nút đang sử dụng được |

Màu không thay nhãn trạng thái. Đang xem, đang thực hiện, lịch sử và khóa đều có chữ riêng. Màu đỏ trang phục không được hiểu là kết quả thất bại hoặc có quái xuất hiện.

Chữ thường đặt mục tiêu tương phản ít nhất 4,5:1 với nền đọc; các dấu điều khiển cần thiết đặt mục tiêu 3:1. Các mốc này tham chiếu [W3C về tương phản chữ](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) và [tương phản thành phần không phải chữ](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Kiểm tra cặp màu phẳng không thay thế việc kiểm tra giao diện và thao tác khi có prototype.

## 4. Chữ và ngôn ngữ hình

- Tiêu đề dùng serif với dáng sách; bản phác dùng Cambria và Times New Roman dự phòng. Nội dung dùng Segoe UI/Arial hoặc sans hệ thống. Cambria được chọn sau khi kiểm tra các dấu tiếng Việt trong bản render.
- Nội dung mặc định 18 px; tiêu đề khu vực 32 px; số liệu 24–26 px; chú thích 14 px. Chữ Việt có dấu phải giữ đủ khoảng dòng và không cắt dấu.
- Thư pháp là điểm nhấn của tên game hoặc trang trí khi có nguồn font phù hợp. Luật chơi, nút và số liệu dùng chữ dễ đọc.
- Khung thẻ có đường viền mảnh, bo nhẹ. Dùng khoảng trống và thứ bậc chữ để phân nhóm.
- Biểu tượng có nét rõ, hình khác nhau: nước là giọt; linh dịch thêm dấu sáng; tu vi là dòng khí. Khi bỏ màu vẫn nhận ra chức năng.

## 5. Chỉ đạo nền cảnh

| Nhóm nền | Nét mực/ánh sáng | Bố cục và chỗ dùng |
| --- | --- | --- |
| Thôn | Màu đất ấm, đường nét gần gũi | Chủ thể đời thường; khung cắt để xem nhà/sân |
| Đường núi/suối | Mực lớp xa nhẹ, lớp gần rõ; nước ngọc dịu | Hai điểm nhìn của cùng nền; đường đủ rõ để đặt hình hổ |
| Hang | Đá xám, tương phản tập trung vào điểm chú ý | Khe/cửa hang đọc được khi thu nhỏ; dấu tích nằm ở lớp nền |
| Môn phái/dược viên | Kiến trúc mộc, mái và cây có nhịp rõ | Tách cổng/vườn bằng lớp đạo cụ; nội dung luyện ở phòng |
| Phòng | Ánh sáng tĩnh, đồ gỗ giản dị | Chừa vùng cho portrait; phân biệt phòng chung và riêng bằng đạo cụ |
| Mộng cảnh | Ít chi tiết cứng, mực nhẹ và điểm sáng ngọc | Tâm điểm có khoảng trống; độ sáng của hiệu ứng không che chữ |

Ảnh nền theo quy chuẩn 1.600 × 900 đã có trong ASSET-PLAN. Giữ chủ thể ở vùng có thể cắt cho thẻ và màn hình nhỏ; cung cấp vùng cắt riêng nếu crop tự động làm mất thông tin. Chữ truyện đặt trên mặt giấy riêng.

## 6. Chỉ đạo nhân vật và vật phẩm

Nhân vật trên map dùng **pixel art**. Bộ Vương Lâm áo xám đầu tiên đặt chuẩn 64 × 96, palette 24 mục và bốn hướng để đánh giá trước khi áp dụng cho đệ tử/NPC. Giữ tóc/màu áo/đai của nhận diện đã duyệt khi giản lược. Nền giữ stylized 2D với khối lớn/texture nhẹ; portrait đọc truyện giữ tranh mực. Chuyển động, đồ và động tác tiếp theo theo spec riêng.

Vương Lâm có cùng gương mặt ở ba lớp trang phục đời thường → xám → đỏ. Tư thế bình tĩnh, ánh mắt kiên trì; đồ nhập môn giản dị. Model giai đoạn A chỉ chứa những chi tiết đã biết tại mốc đó.

Người chơi có hai mẫu đệ tử trưởng thành trẻ; cùng chất liệu áo xám/đai xanh trầm và mức trang bị, gương mặt riêng. Tóc búi cao ở mẫu nam và búi thấp ở mẫu nữ là lựa chọn hình của game. Giao diện tu luyện dùng portrait/tên đệ tử; Vương Lâm dùng portrait trong chính truyện. Bộ đồ đỏ của NPC không tự cấp cho người chơi khi đạt cùng tầng tu luyện.

Cha mẹ là một chân dung nhóm; Trương Hổ và Tôn Đại Trụ có dáng riêng để phân biệt khi thu nhỏ. Tứ thúc/Vương Trác giữ thẻ tên cho tới gói P2. Mỗi chân dung nguồn 512 × 512, chủ thể không chạm rìa crop 64 px.

Hạt châu giữ chất đá xám cũ. Hình dạng 5/7/9 đám mây được dựng thành lớp rõ số lượng; lớp 10 chỉ dùng trong chuyển tiếp E07 rồi thay bằng dấu/chữ. Hoa văn trên icon thật phải kiểm tra từng mốc, không lấy từ một bảng moodboard chung.

Hổ trắng giữ mắt đỏ và dáng đe dọa theo hồ sơ sự kiện. Tỷ lệ/hình hổ phục vụ cảnh thoát hiểm, chừa vị trí cho nút tiếp tục. Bầu nước, công pháp và túi dùng hình đơn giản theo brief; vai trò tương tác giữ theo đặc tả A.

## 7. Hiệu ứng

| Hiệu ứng | Ngôn ngữ hình | Hành vi |
| --- | --- | --- |
| Ủ nước | Một điểm sáng ngọc chạy qua bầu/giọt | Phản hồi chu kỳ hoàn thành, không che con số |
| Thổ nạp | Nét khí mềm, nhịp nhẹ | Khi đang luyện; trước E06 không ngụ ý đã tăng tu vi |
| Mộng cảnh | Điểm sáng và lớp mực nhẹ | Hoạt động hiện tại; giảm chuyển động giữ hình tĩnh |
| Đột phá | Vòng sáng ngắn và dấu hoàn thành | Chạy sau khi kết quả đã lưu; không trì hoãn thao tác xem lại |

Thời lượng hiệu ứng hoàn thành đề xuất 0,4–0,8 giây; chuyển vùng UI 0,15–0,2 giây. Đây là tham số mỹ thuật, không đổi thời gian chu kỳ 10 giây hoặc điều kiện nhận tài nguyên.

## 8. Thứ tự làm UX và ART

| Bước | Đầu ra | Thời điểm |
| --- | --- | --- |
| V0 — Thiết kế | Luồng UX tham chiếu, 14 bản phác, token, bảng ART và 3 concept nhân vật | Giai đoạn GDD hiện tại; UX đang chuyển sang online |
| V0a — Duyệt tạo hình | Gương mặt/tóc/trang phục Vương Lâm và hai mẫu đệ tử | Ưu tiên hiện tại, trước khi đi sâu vào prototype |
| V0b — Hình trên map | Nhân vật pixel + nền stylized/top-down, bộ áo xám 64 × 96 và trang animation | Đã xuất 28 frame; motion cần đánh giá trước bộ đệ tử |
| V1 — Đặt vào prototype | Thẻ/nút/icon P0 và tranh tham chiếu hoặc hình tạm | Khi dựng vòng tài nguyên và truyện |
| V2 — Sản xuất hình A | Dự toán 6 nền, 6 nguồn chân dung P1, hổ, 7 icon và lớp biến thể | Sau khi tuyến P/chính truyện được biên tập và chơi được |
| V3 — Chỉnh sau chơi thử | Crop, tương phản, bố cục, mức chi tiết và P2 nếu cần | Theo vấn đề quan sát được |
| V4 — Mở rộng B | Giữ ngôn ngữ mực/giấy; thêm gói hình của B | Sau điều kiện hoàn thành A |

Các bảng concept V0 là tài liệu tham chiếu, không được tính như portrait game đã sản xuất. Ngân sách cũ **20 nguồn P0/P1 + 2 P2** chỉ dự toán bộ portrait/minh họa, chưa gồm sprite/animation/map MMORPG. Roster theo dõi concept; ngân sách cần lập lại sau lựa chọn ART/góc nhìn và phạm vi A/B.

## 9. Nghiệm thu hướng hình

1. UI dễ đọc khi đặt cạnh tranh mực và khi không có tranh.
2. Các icon và node phân biệt được bằng hình/chữ khi bỏ màu.
3. Cắt về màn hình 360 px vẫn giữ mặt nhân vật, chủ thể cảnh và nút.
4. Trang phục/hạt châu đúng mốc; lịch sử dùng minh họa của cảnh mà không đổi trạng thái hiện tại.
5. Chữ có dấu không bị cắt và cỡ chữ có thể tăng trong prototype.
6. Cùng kiểu nét, màu giấy và mức chi tiết giữa các nguồn; ánh linh khí không lấn vùng đọc.
7. Từng asset thật được kiểm tra theo hồ sơ nguồn và ngân sách định dạng trong ASSET-PLAN.
