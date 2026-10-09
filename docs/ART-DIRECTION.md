# Định hướng ART — TuTiên

**Phiên bản:** 1.8, ngày 08/10/2026.\
**Hướng hiện tại:** nhân vật pixel chibi trên nền stylized 2D, top-down ba phần tư; portrait/truyện/UI giữ tranh mực và giấy cổ. Frame nhân vật **64 × 96**, chân/điểm chiếu **(32,88)**, cỡ chơi mặc định **1×**.\
**Gameplay:** [GDD 0.28](GDD.md) cho chọn Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu; cùng Hằng Nhạc đến hết Ngưng Khí, phân hóa từ Trúc Cơ. Combat chủ động, idle hỗ trợ. Hai mẫu đệ tử còn dùng làm avatar kỹ thuật trong sân online, không là roster người chơi chính của hướng mới.\
**Tham chiếu:** [UX](UX-MVP-A.md), [UI](UI-COMPONENTS.md), [asset](ASSET-PLAN.md), [nhân vật](CHARACTERS.md), [gallery](design/characters/index.html).

## Hiện trạng ART và ưu tiên

- **Chibi:** [năm mẫu / 100 frame](CHIBI-ROSTER-SPEC.md), gồm bộ ba 60 và hai đệ tử 40; catalog còn bộ Vương Lâm trước 36 để đối chiếu, tổng **6 bộ / 136 frame**. Bộ ba đều đã có đứng/đi hoặc lướt bốn hướng. Vương Lâm là chuẩn tỷ lệ theo phản hồi tích cực; Lý Mộ Uyển native-v5 đã chấp nhận cho bản thử; Tư Đồ Nam chibi/hai đệ tử còn chờ đánh giá. Nhận diện Tư Đồ Nam đứng v3 trước đó chỉ tạm chấp nhận, tách với duyệt chibi.
- **Portrait:** [UI v1](design/characters/core-ui-v1/README.md) có ba chân dung PNG/WebP 512/160/64, còn chờ đánh giá; Lý Mộ Uyển cần đồng bộ với chibi native-v5 đã chọn. [Kế hoạch motion](CORE-CHARACTER-MOTION-PLAN.md) còn 12 frame lơ lửng tại chỗ và 4 luyện đan chưa vẽ, ngoài ngân sách gameplay cần lập sau.
- **Map:** bộ môi trường legacy, ART Hằng Nhạc v1/v2/v3 và hai bản thử vùng đi đã [xóa](MAP-ASSETS-RESET.md). [Concept tổng mới v1](design/world/hang-nhac-map-v1/README.md) đã tạo theo yêu cầu tiếp theo; chờ chủ dự án duyệt trước khi tách ART.
- **VFX:** [đợt P1–P5](design/vfx/STARTER-VFX-HANDOFF.md) đã đóng ngày 07/10: **15 skill / 646 PNG / 76 atlas** đã chấp nhận; chưa tích hợp gameplay. Pose thi triển dùng Vương Lâm hướng Đông làm mẫu, chưa có bộ combat đầy đủ cho cả ba.
- **Công cụ:** [preview](ANIMATION-PREVIEW-SPEC.md) TypeScript + Three.js và sân online dùng chung atlas/anchor; local xem bộ ba, online vẫn hai mẫu đệ tử. Framework không tự đổi ART phẳng thành map 3D hoặc triển khai chọn nhân vật/gameplay.

Sản xuất map theo [MAP-BUILDING-GUIDE.md](MAP-BUILDING-GUIDE.md): người phát triển tự bố trí map, layer/vùng đi/chặn; trợ lý làm asset rời và công cụ. Nền sạch, cụm tĩnh, đối tượng xếp theo chân, phần che alpha đúng mép và gameplay tách riêng. Nguồn nhiều part giữ chung canvas/pivot; kiểm kỹ thuật và duyệt hình riêng. Chưa tự mở nhiệm vụ/combat/loot/đột phá/portrait khi ưu tiên vẫn là map.

## 1. Cảm giác và cách thể hiện

Game có cảm giác như một quyển ghi chép hành trình tu luyện: giấy ấm, chữ mực rõ, cảnh sơn thủy có chiều sâu và ánh sáng linh khí vừa đủ để nhận ra trạng thái mới. Phần nhập môn giữ nét đời thường, sự bỡ ngỡ và bí ẩn của cơ duyên. Brief xuất thân Vương Lâm đã được sửa theo hồ sơ nguồn; mức sờn/hư hại trang phục phải gắn với cảnh cụ thể.

UI sử dụng mặt giấy sáng, ít họa tiết dưới chữ/số. Tranh nằm ở khung địa điểm, chân dung và cảnh truyện; nét mực có thể loang ở rìa ảnh. Ánh sáng xanh ngọc tập trung vào linh dịch, châu và mộng cảnh.

## 2. Bảng tham chiếu lịch sử và nguồn nhận diện

[art-reference-v1.png](design/art-reference-v1.png) gồm đường núi/suối, phòng đệ tử, hai nghiên cứu áo xám/đỏ của Vương Lâm và một thử nghiệm mộng cảnh. Bảng được tạo bằng **imagegen tích hợp** theo [prompt đã dùng](design/art-reference-v1.prompt.txt).

| Phần | Mục đích tham chiếu | Chi tiết cần kiểm tra ở asset thật |
| --- | --- | --- |
| Đường núi/suối | Độ loang mực, tầng xa/gần, nước xanh dịu | Vùng cắt cho MAP-003/006, chỗ đặt hổ và thông tin cảnh |
| Phòng đệ tử | Vật dụng gỗ, không gian giản dị, tương phản sáng | Biến thể phòng chung/phòng riêng và đạo cụ theo mốc |
| Vương Lâm áo xám/đỏ | Cùng gương mặt, chuyển thân phận bằng trang phục | Tuổi/diện mạo giai đoạn A; chân dung đọc được ở 64 px |
| Mộng cảnh | Khoảng không, điểm sáng ngọc, khác ngoại giới | Bố cục thử nghiệm; chi tiết không gian phải biên tập với nguồn |

Diện mạo, cách buộc tóc và hình khối phong cảnh là lựa chọn minh họa. Các chi tiết có căn cứ nguyên tác như áo xám/đỏ, mốc châu và vai trò địa điểm được giữ theo hồ sơ nguồn trong GDD/ASSET-PLAN.

Bảng này là tài liệu lịch sử của UX idle trước, không là bố cục hoặc ngân sách map Hằng Nhạc hiện hành. Trong bản phác UX, tranh được cắt khung từ cùng bảng để xem phối hợp hình và UI. Các nguồn AS-ENV/AS-CHR trong catalog vẫn ở trạng thái cần sản xuất theo brief.

Đã bổ sung 3 bảng concept bằng imagegen tích hợp: [Vương Lâm nhập môn](design/characters/wang-lin-initiation-v1.png), [đệ tử nam](design/characters/player-male-novice-v1.png), [đệ tử nữ](design/characters/player-female-novice-v1.png). Prompt chính xác lưu cạnh từng hình, liên kết trong [CHARACTERS.md](CHARACTERS.md). Chúng bổ sung việc nghiên cứu mặt/tóc/trang phục; nguồn portrait game sẽ làm sau khi duyệt.

Các sân/ghép map trước và toàn bộ ART Hằng Nhạc v1/v2/v3 cùng hai bản thử vùng đi đã xóa. Concept tổng mới v1 là đề xuất mỹ thuật/bố cục đang chờ duyệt, chưa là nguồn ART sản xuất đã chọn. Lịch sử duyệt trước đó không áp cho concept mới hoặc là căn cứ khôi phục bộ đã xóa.

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

Ảnh minh họa truyện trong dự toán lịch sử dùng nguồn 1.600 × 900; map đi lại phải theo tỷ lệ native/camera và hợp đồng part trong [hướng dẫn map](MAP-BUILDING-GUIDE.md). Giữ chủ thể ở vùng có thể cắt cho thẻ và màn hình nhỏ; cung cấp vùng cắt riêng nếu crop tự động làm mất thông tin. Chữ truyện đặt trên mặt giấy riêng.

## 6. Chỉ đạo nhân vật và vật phẩm

Nhân vật trên map dùng **pixel chibi**. Năm bộ hiện hành giữ frame 64 × 96, palette riêng 24 mục và bốn hướng, 20 frame/người; các bộ tỷ lệ trước giữ đối chiếu. Giữ tóc/màu áo/đai của nhận diện đã duyệt khi giản lược. Nền giữ stylized 2D với khối lớn/texture nhẹ; portrait đọc truyện giữ tranh mực. Chuyển động, đồ và động tác tiếp theo theo spec riêng.

Vương Lâm có cùng gương mặt ở ba lớp trang phục đời thường → xám → đỏ. Tư thế bình tĩnh, ánh mắt kiên trì; đồ nhập môn giản dị. Model giai đoạn A chỉ chứa những chi tiết đã biết tại mốc đó.

Người chơi chọn một trong bộ ba từ đầu theo GDD; portrait, trang phục và hình thái cần khớp nhân vật đã chọn và cảnh được biên tập. Hai mẫu đệ tử áo xám/đai xanh vẫn là mẫu thử sân online: nam búi cao, nữ búi thấp. Màu áo và hình linh thể không tự cấp năng lực/cảnh giới hoặc cơ duyên nguyên tác.

Cha mẹ là một chân dung nhóm; Trương Hổ và Tôn Đại Trụ có dáng riêng để phân biệt khi thu nhỏ. Tứ thúc/Vương Trác giữ thẻ tên cho tới gói P2. Mỗi chân dung nguồn 512 × 512, chủ thể không chạm rìa crop 64 px.

Hạt châu giữ chất đá xám cũ. Hình dạng 5/7/9 đám mây được dựng thành lớp rõ số lượng; lớp 10 chỉ dùng trong chuyển tiếp E07 rồi thay bằng dấu/chữ. Hoa văn trên icon thật phải kiểm tra từng mốc, không lấy từ một bảng moodboard chung.

Hổ trắng giữ mắt đỏ và dáng đe dọa theo hồ sơ sự kiện. Tỷ lệ/hình hổ phục vụ cảnh thoát hiểm, chừa vị trí cho nút tiếp tục. Bầu nước, công pháp và túi dùng hình đơn giản theo brief; vai trò tương tác giữ theo đặc tả A.

## 7. Phản hồi UI lịch sử và VFX gameplay

| Hiệu ứng | Ngôn ngữ hình | Hành vi |
| --- | --- | --- |
| Ủ nước | Một điểm sáng ngọc chạy qua bầu/giọt | Phản hồi chu kỳ hoàn thành, không che con số |
| Thổ nạp | Nét khí mềm, nhịp nhẹ | Khi đang luyện; trước E06 không ngụ ý đã tăng tu vi |
| Mộng cảnh | Điểm sáng và lớp mực nhẹ | Hoạt động hiện tại; giảm chuyển động giữ hình tĩnh |
| Đột phá | Vòng sáng ngắn và dấu hoàn thành | Chạy sau khi kết quả đã lưu; không trì hoãn thao tác xem lại |

Bảng trên giữ brief phản hồi UI của phương án idle trước; chu kỳ 10 giây và E01–E08 không là luật runtime hiện hành. [VFX gameplay đã bàn giao](VFX-ART-PROGRESSION.md) là bộ sequence riêng; thời điểm hit/di chuyển do host xác nhận, không lấy nhịp ART làm damage/cooldown.

## 8. Thứ tự hiện hành

| Bước | Đầu ra/việc còn lại | Trạng thái và thời điểm |
| --- | --- | --- |
| Map Hằng Nhạc | Duyệt concept tổng mới v1 trước khi tách ART | Bộ ART và bản thử vùng đi trước đã xóa; concept mới chưa duyệt |
| Bộ ba chibi | Xem đồng bộ tỷ lệ/nhận diện/chuyển động | 60 frame có đủ bốn hướng; Tư Đồ Nam còn chờ đánh giá |
| Portrait/motion bổ sung | Đồng bộ UI và lập ngân sách tương tác/tu luyện/combat cho cả ba | Chỉ mở sau khi người phát triển chuyển ưu tiên khỏi map |
| Tích hợp gameplay | Nhiệm vụ Hằng Nhạc, combat chủ động, tu luyện hỗ trợ và tiến trình | Thiết kế theo GDD; chưa triển khai |
| VFX tích hợp | Gắn host events, pose theo actor/hướng và kiểm khả năng đọc | Đợt ART 15 skill đã đóng; hướng/SFX/icon/LOD/benchmark là hạng mục riêng |

Các tổng portrait/minh họa **20/22/30** và gói **A → B** trước là dự toán lịch sử, không đại diện ngân sách nhập môn ba nhân vật hoặc map/runtime hiện hành. Số nguồn, frame, atlas và nhân vật được theo dõi riêng trong [ASSET-PLAN](ASSET-PLAN.md).

## 9. Nghiệm thu hướng hình

1. UI dễ đọc khi đặt cạnh tranh mực và khi không có tranh.
2. Các icon và node phân biệt được bằng hình/chữ khi bỏ màu.
3. Cắt về màn hình 360 px vẫn giữ mặt nhân vật, chủ thể cảnh và nút.
4. Trang phục/hạt châu đúng mốc; lịch sử dùng minh họa của cảnh mà không đổi trạng thái hiện tại.
5. Chữ có dấu không bị cắt và cỡ chữ có thể tăng trong prototype.
6. Cùng kiểu nét, màu giấy và mức chi tiết giữa các nguồn; ánh linh khí không lấn vùng đọc.
7. Từng asset thật được kiểm tra theo hồ sơ nguồn và ngân sách định dạng trong ASSET-PLAN.
