# Kế hoạch asset — TuTiên

**Phiên bản:** 1.6, ngày 08/10/2026.\
**Hướng hiện hành:** [GDD 0.28](GDD.md) cho chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, cùng Hằng Nhạc đến hết Ngưng Khí, phân hóa từ Trúc Cơ. Combat chủ động, idle hỗ trợ.\
**Tham chiếu:** [ART](ART-DIRECTION.md), [nhân vật](CHARACTERS.md), [hệ thống tu tiên](CULTIVATION-SYSTEM.md), [map](WORLD-MAPS.md), [gặp gỡ](ENCOUNTERS.md).

## 1. Asset hiện có và cách đếm

| Gói | Nguồn hiện hành | Trạng thái |
| --- | --- | --- |
| Chibi bộ ba | Vương Lâm áo xám native-v2; Tư Đồ Nam linh thể native-v2; Lý Mộ Uyển lavender native-v5 | 3 bộ × 20 = **60 frame**, đủ đứng/đi hoặc lướt bốn hướng; Lý Mộ Uyển đã chấp nhận cho bản thử, Tư Đồ Nam còn chờ đánh giá |
| Chibi avatar kỹ thuật | Hai đệ tử nam/nữ native-v2 | **40 frame**, hiện dùng sân online; không là roster nhân vật chính của GDD mới |
| Catalog preview | Năm chibi 100 + Vương Lâm trước 36 để đối chiếu | **6 bộ / 136 frame**; không cộng lại atlas lịch sử |
| Chân dung UI v1 | Ba nguồn, PNG/WebP 512/160/64, 18 bản xuất | Còn chờ đánh giá; Lý Mộ Uyển cần đồng bộ native-v5 |
| Hằng Nhạc | [Concept tổng mới v1](design/world/hang-nhac-map-v1/README.md) | Concept chờ duyệt; ART v1/v2/v3 và hai bản thử vùng đi trước đã xóa; chưa tách ART mới |
| VFX P1–P5 | [15 skill](design/vfx/STARTER-VFX-HANDOFF.md), Ngưng Khí đến Hóa Thần | **646 PNG / 76 atlas**, đã chấp nhận/đóng ART ngày 07/10; chưa tích hợp gameplay |

Nguồn portrait, mẫu nhân vật, PNG frame, atlas và phiên bản xuất là các đơn vị riêng. VFX có frame dùng lại giữa cảnh giới; 646 không là số hình độc nhất. Metadata/prompt/approval nguồn lịch sử được giữ nguyên, không sửa để giả lập tiến độ mới.

## 2. Kế hoạch sản xuất hiện hành

| Ưu tiên | Việc cần làm | Điều kiện/phạm vi |
| --- | --- | --- |
| Hiện tại — map | Duyệt concept tổng mới trước khi tách ground/props/foreground | Theo [MAP-BUILDING-GUIDE](MAP-BUILDING-GUIDE.md); người phát triển bố trí map/layer/vùng, trợ lý làm asset rời/công cụ theo yêu cầu |
| Khi chuyển ưu tiên — nhân vật | Đồng bộ portrait; lập bộ tương tác/tu luyện/combat cho ba lựa chọn đầu game | Bộ đi/lướt đã có; 12 frame lơ lửng và 4 luyện đan vẫn chưa vẽ; chưa có ngân sách combat đầy đủ |
| Khi tích hợp gameplay | NPC/quái/đạo cụ/icon thật sự dùng trong HN01–HN12 | Nhiệm vụ/combat/tu luyện chưa chạy; sản xuất theo brief hệ thống và nơi dùng cụ thể |
| VFX tích hợp | Adapter host events, hướng/pose từng actor, SFX/icon, LOD và benchmark | Đợt ART hiện có đã đóng; không tự sản xuất cảnh giới mới |

Bộ môi trường trước đã [reset](MAP-ASSETS-RESET.md), không khôi phục theo kế hoạch lịch sử. Danh mục **20/22/30 nguồn** và tuyến **A → B / E01–E08 / MAP-001…** ở mục 4–13 là hồ sơ minh họa/chính truyện trước. Giữ ID/brief/chương nguồn để truy nội dung và dùng lại khi phù hợp; chúng không còn là ngân sách, danh sách nhân vật được chọn hoặc lộ trình triển khai Hằng Nhạc hiện hành. Chưa chốt tổng asset mới khi gameplay/map chưa hoàn thiện.

## 3. Hợp đồng hiện hành và ngân sách UX lịch sử

**Hợp đồng hiện hành:** nhân vật native 64 × 96, điểm chân/chiếu (32,88), cỡ chơi 1×; map giữ nguồn/part native theo camera và alpha đúng silhouette, xem [hướng dẫn map](MAP-BUILDING-GUIDE.md). VFX dùng PNG RGBA sequence, 24 FPS tác giả và atlas build output; host sở hữu hit/di chuyển, xem [bàn giao](design/vfx/STARTER-VFX-HANDOFF.md).

**Bảng dưới là ngân sách UX/minh họa lịch sử:** 1.600 × 900 và ≤350 KB áp cho nền thẻ truyện trước, không là hợp đồng nền Hằng Nhạc. Hiệu ứng CSS/vector trước không thay thư viện skill PNG đã sản xuất.

| Nhóm | Kích thước nguồn đề xuất | Xuất dùng trên web | Mục tiêu dung lượng mỗi file |
| --- | --- | --- | --- |
| Nền cảnh | 1.600 × 900, bố cục 16:9 | WebP; giữ bản nguồn có lớp nếu có | ≤350 KB |
| Chân dung | 512 × 512, nhân vật ở giữa khung | WebP có alpha hoặc PNG khi cần | ≤120 KB |
| Sinh vật trong thẻ sự kiện | 768 × 768, có nền trong suốt | WebP có alpha hoặc PNG | ≤150 KB |
| Biểu tượng | ViewBox 128 × 128; nhận diện được ở 24 px | SVG | ≤10 KB |
| Hiệu ứng nhẹ | Mẫu thông số và lớp vẽ dùng lại | CSS/vector/canvas tùy công nghệ | Chưa cần sprite sheet |

WebP phục vụ ảnh nén và hỗ trợ alpha; SVG phù hợp hình vector cần đổi kích thước. Đây là lựa chọn định dạng dựa trên [hướng dẫn định dạng ảnh của MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types). Kích thước và ngân sách dung lượng trong bảng là mục tiêu riêng của dự án, chưa được đo bằng asset thật.

Mục tiêu lịch sử cho minh họa/portrait: lần mở đầu ≤1 MB, gói A ≤4 MB, tải cảnh khi cần. Chưa có đo tổng tải/map/VFX runtime theo GDD 0.28; ngân sách này không áp cho toàn thư viện animation hoặc nền Hằng Nhạc. Khung nhân vật 64 × 96, điểm chân (32,88), cỡ 1× và part map theo [hướng dẫn map](MAP-BUILDING-GUIDE.md).

Giữ palette nhất quán: sắc đất và giấy cho phàm nhân, xám/đỏ cho thân phận ở môn phái, ánh sáng xanh nhạt cho phản hồi linh khí. Không đặt chữ hoặc tên vật phẩm trực tiếp trong ảnh; giao diện vẽ chữ để giữ khả năng đổi cỡ và sửa bản dịch.

## 4. Hồ sơ lịch sử — Danh mục 6 nền dùng cho 9 địa điểm

Mô tả bố cục là chỉ đạo mỹ thuật của game. Mốc và địa điểm đối chiếu ở [WORLD-MAPS.md](WORLD-MAPS.md).

| Asset ID | Nền gốc | Chi tiết cần có | Dùng tại | Biến thể dùng lại | Ưu tiên |
| --- | --- | --- | --- | --- | --- |
| AS-ENV-001 | Thôn và nhà Vương Lâm | Nhà đời thường, sân, vật dụng gỗ; không gian gần gũi | MAP-001 | Sân nhà/khung cảnh ly hương qua vị trí cắt ảnh | P1 |
| AS-ENV-002 | Đường núi và suối | Đường mòn và một nhánh suối trong cùng bố cục; có hai vùng cắt ảnh rõ | MAP-003, MAP-006 | Cắt vào đường cho nguy hiểm; cắt vào nước cho hoạt động tài nguyên | P1 |
| AS-ENV-003 | Hang bên vách núi | Hang đá nhỏ, khe tối, cửa hướng ra sườn dốc; dấu tích thú là đạo cụ | MAP-004 | Lớp lực hút và điểm chú ý vào hạt châu | P1 |
| AS-ENV-004 | Kiến trúc Hằng Nhạc | Cổng, bậc đá, mái nhà; khuôn viên có chỗ đặt đạo cụ vườn | MAP-002, MAP-007 | Khảo nghiệm/cổng; dược viên qua lớp cây và đạo cụ | P1 |
| AS-ENV-005 | Phòng ở trong môn phái | Bàn, giường, ánh đèn; lớp đạo cụ cho phòng chung và phòng riêng | MAP-005, MAP-007, MAP-008 | Hai giường ở phòng chung; phòng riêng có bầu nước và chỗ ngồi tu luyện | P1 |
| AS-ENV-006 | Mộng cảnh | Khoảng không rộng, các điểm sáng; cảm giác khác ngoại giới | MAP-009 | Cường độ sáng và lớp linh khí khi tu luyện | P1 |

Nền dược viên là bối cảnh truyện; hoạt động luyện thổ nạp diễn ra ở phòng đệ tử thuộc khu đó. Thẻ địa điểm phân biệt rõ phòng ở với luống dược thảo.

## 5. Hồ sơ lịch sử — Danh mục 6 chân dung

Dự toán chính truyện trước ghi sáu nguồn cho **7 nhân vật** vì cha mẹ chung một hình; đây không là roster gameplay mới. Vương Lâm nay là lựa chọn người chơi. Hai mẫu đệ tử được lưu riêng cho preview kỹ thuật.

| Asset ID | Nhân vật | Yêu cầu nhận diện | Mốc đầu | Biến thể | Ưu tiên |
| --- | --- | --- | --- | --- | --- |
| AS-CHR-001 | Vương Lâm | Thiếu niên ở giai đoạn đầu, nét mặt kiên trì; diện mạo nhất quán | E01 | Đời thường → áo xám ở E04 → áo đỏ sau E05; lớp trang phục dùng lại | P1 |
| AS-CHR-002 | Cha mẹ | Một chân dung nhóm thể hiện quan hệ gia đình; trang phục đời thường | E01 | Biểu cảm qua lời dẫn; chưa cần nhiều hình riêng | P1 |
| AS-CHR-003 | Tứ thúc | Nhân vật trưởng thành của gia đình; phân biệt với cha | E01 | 1 hình | P2 |
| AS-CHR-004 | Vương Trác | Thiếu niên cùng thế hệ, phong thái tự tin; không nhầm với Vương Lâm | E02 | 1 hình; trang phục gắn mốc xuất hiện | P2 |
| AS-CHR-005 | Trương Hổ | Đệ tử làm việc trong môn phái, áo xám; diện mạo riêng | E04 | 1 hình | P1 |
| AS-CHR-006 | Tôn Đại Trụ | Nhân vật trưởng thành, gắn dược viên và vai trò sư phụ | E05 | 1 hình | P1 |

Áo xám cho giai đoạn đệ tử ký danh và áo đỏ sau khi được nhận làm đệ tử có căn cứ ở [chương 10](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-10) và [chương 17](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17). Những đặc điểm khuôn mặt chưa có hồ sơ nguồn được coi là lựa chọn minh họa tạm, cần biên tập trước khi duyệt.

Sáu hồ sơ truyện luôn có đủ tên và mô tả. Chân dung P2 có thể dùng biểu tượng tạm cho đến khi được sản xuất.

| Asset ID | Mẫu avatar thử nghiệm | Brief lịch sử | Concept | Ưu tiên trước |
| --- | --- | --- | --- | --- |
| AS-PC-001 | Đệ tử nam | Trưởng thành trẻ, tóc búi cao, mặt cởi mở, áo xám/đai xanh trầm; tên do người chơi đặt | [v1](design/characters/player-male-novice-v1.png) | P1 |
| AS-PC-002 | Đệ tử nữ | Trưởng thành trẻ, búi tóc thấp, vẻ tập trung; cùng cấp trang bị với mẫu nam | [v1](design/characters/player-female-novice-v1.png) | P1 |

Vương Lâm cũng có [concept nhập môn v1](design/characters/wang-lin-initiation-v1.png). Cả ba bảng được tạo bằng imagegen tích hợp, prompt lưu trong [thư viện nhân vật](design/characters/index.html); chúng chưa là portrait 512 × 512 có alpha. Danh mục NPC dài hạn nằm trong [CHARACTERS.md](CHARACTERS.md).

## 6. Hồ sơ lịch sử — Sinh vật và 7 biểu tượng

| Asset ID | Tên | Chi tiết và biến thể | Dùng tại | Ưu tiên |
| --- | --- | --- | --- | --- |
| AS-CRE-001 | Hổ trắng | Hổ trắng lớn, mắt đỏ; dáng đe dọa. Hiển thị ở sự kiện thoát hiểm | MAP-003 / ENC-001 | P1 |
| AS-ICO-001 | Nước suối | Giọt nước rõ hình; chỉ một biến thể cơ bản | Bảng tài nguyên, lấy nước | P0 |
| AS-ICO-002 | Linh dịch | Giọt nước có dấu sáng nhận diện, phân biệt bằng nét với nước thường | Bảng tài nguyên, ủ nước, mộng cảnh | P0 |
| AS-ICO-003 | Tu vi | Biểu tượng dòng khí/tiến triển; không thể hiện như món đồ có thể mua bán | Bảng tu vi, đột phá | P0 |
| AS-ICO-004 | Hạt châu | Đá xám, lớp hoa văn theo trạng thái; mô tả chi tiết ở mục 7 | Hành trang, khám phá, sự kiện E03/E07 | P0 |
| AS-ICO-005 | Bầu nước | Bầu dùng đựng nước; có lớp đánh dấu thường/chứa linh khí | Hành trang, hoạt động, sự kiện | P0 |
| AS-ICO-006 | Công pháp nhập môn | Quyển sách nhỏ; tên được vẽ bằng giao diện | E05, luyện thổ nạp | P0 |
| AS-ICO-007 | Túi trữ vật | Túi nhỏ, nhận diện được ở kích thước icon | Hành trang sau E05 | P0 |

Hổ trắng và hạt châu có căn cứ lần lượt ở [chương 7](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-7) và [chương 8](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-8). Vai trò hổ trong MVP là gây nguy hiểm dẫn đến thoát hiểm. Chim chết và xương trong hang dùng như chi tiết nền, không cần loại quái hay asset chiến đấu riêng.

## 7. Hồ sơ lịch sử — Bốn brief quan trọng để sản xuất

### 7.1. Hạt châu — AS-ICO-004

- Bản gốc: đá xám cũ, hình tròn, không có chữ giao diện trong ảnh.
- Tách hình châu, hoa văn và hiệu ứng thành các lớp dùng lại.
- Trạng thái sau E03: năm đám mây; sau cụm E04: bảy; sau E06: chín.
- E07: chuyển tiếp đủ mười đám mây, rồi chuyển sang trạng thái có dấu/chữ trên châu; hoa văn mây trước đó mất đi.
- Trạng thái mở mộng cảnh dùng lớp phản hồi ánh sáng do game thiết kế. Không đưa lai lịch tương lai vào tooltip trước mốc tiết lộ.
- Các trạng thái cùng trỏ về một asset gốc; `variantKey` chọn lớp tương ứng.

Nguồn hình dạng ban đầu và biến đổi: [chương 8](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-8), [chương 14](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-14), [chương 20](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-20), [chương 23](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23).

### 7.2. Vương Lâm — AS-CHR-001

- Nguồn diện mạo: mô tả tiểu thuyết, thiết kế riêng theo [hồ sơ Vương Lâm](WANG-LIN-VISUAL-SPEC.md); chi tiết mặt/tóc và đường cắt áo là đề xuất ART.
- Một khuôn mặt gốc cho giai đoạn MVP, ba lớp trang phục.
- Đời thường ở E01–E03; áo xám khi làm việc lấy nước; áo đỏ sau E05.
- Bộ thường gọn, bộ xám có gấu nguyên vẹn; biến thể `cave_damage` chỉ minh họa đúng đoạn trong E03-CAVE, không tăng số nguồn chân dung trong dự toán.
- Đọc tốt ở thẻ chân dung 64 px và khung hội thoại 160 px.
- Nghiên cứu hy vọng, thận trọng, tập trung và mệt; số ảnh biểu cảm xuất game tùy cảnh thật sự cần. Sprite dùng dáng và hình khối, portrait dùng mắt/miệng.
- Gương mặt và trang phục được duyệt trước khi tạo chân dung khác để giữ nhất quán.

[Bộ v2](design/characters/index.html#wang-lin) đã có bảng tạo hình, bốn biểu cảm nghiên cứu và một mẫu pixel áo xám trong suốt; nhận diện được duyệt. Các hình/prompt v1 được giữ; [manifest](design/characters/wang-lin-v2-study.json) ghi input. Số NPC/nguồn portrait trong dự toán giữ theo roster; ngân sách chuyển động tính riêng theo bộ/frame.

[Bộ native đầu tiên](WANG-LIN-SPRITE-SPEC.md) đã xuất 4 đứng và 24 đi áo xám: frame 64 × 96, atlas 448 × 384, palette 24 mục, điểm chân (32, 88). [Trang animation](design/characters/wang-lin-gray-walk-v1/index.html) cho xem vòng lặp và thử bước; Bộ 28 frame này là lịch sử; hiện dùng chibi 20 frame và bộ 36 frame đối chiếu. Bộ đi/lướt bốn hướng của cả ba đã có. Đây là một bộ nhân vật 28 frame, tách khỏi số nguồn portrait.

### 7.3. Hổ trắng — AS-CRE-001

- Một hình toàn thân hoặc ba phần tư, nền trong suốt, trọng tâm rõ.
- Màu trắng và mắt đỏ theo đoạn truyện; tư thế đe dọa là chỉ đạo mỹ thuật.
- Đặt được trên nền đường núi mà không che nút tiếp tục.
- Vùng tên và thông báo “thoát hiểm” do giao diện vẽ.
- Chỉ cần một hình trong MVP; chuyển cảnh và chuyển động nhẹ tạo bằng code.

### 7.4. Mộng cảnh — AS-ENV-006

- Khoảng không, các vật/điểm sáng; tránh đưa kiến trúc cụ thể chưa có nguồn vào nền.
- Một nền gốc và lớp sáng chuyển động nhẹ dùng lại.
- Phản hồi linh khí xuất hiện khi tu luyện; nước vẫn được chuẩn bị ở ngoại giới.
- Có chế độ giảm chuyển động giữ nguyên thông tin hoạt động.
- Tooltip nguồn gốc, thuật ngữ và tác dụng mở theo hành trình.

Mô tả không gian và giới hạn mang vật có linh khí được đối chiếu ở [chương 23](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-23) và [chương 24](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-24).

## 8. Hồ sơ lịch sử — Hiệu ứng và âm thanh

| ID | Phản hồi | Cách làm đề xuất | Mốc |
| --- | --- | --- | --- |
| FX-001 | Nước nhận linh khí | Vòng sáng và vài giọt/điểm sáng | Hoàn thành ủ nước |
| FX-002 | Thổ nạp | Nhịp sáng đồng bộ thanh chu kỳ | Luyện thổ nạp/tu luyện thường |
| FX-003 | Mộng cảnh hoạt động | Lớp sáng nhẹ trên nền; giảm chuyển động vẫn có thanh tiến độ | Sau E07 |
| FX-004 | Đột phá | Vòng khí mở rộng và thay đổi nhãn cảnh giới | E08 |

Đây là 4 mẫu hiệu ứng bằng code, không tính thành 4 file đồ họa trong ngân sách 20 asset gốc.

Âm thanh tùy chọn: UI bấm, nhận mốc và đột phá. Nhạc nền, tiếng suối và bộ âm thanh chiến đấu được sản xuất khi trải nghiệm đã cần đến chúng. Gói chơi thử vẫn phải hiểu được với âm thanh tắt.

## 9. Hồ sơ lịch sử — Asset cho phương án chiến đấu B

| ID | Nội dung mới | Dùng tại | Điều kiện biên tập |
| --- | --- | --- | --- |
| AS-ENV-007 | Hậu sơn, vách có động tu luyện | MAP-011 | Đối chiếu [chương 35](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-35) |
| AS-ENV-008 | Sân giao lưu trên đỉnh núi, cột ngọc | MAP-013 | Đối chiếu [chương 47](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47) |
| AS-CHR-007 | Vương Hạo | MAP-010 và mốc liên quan | Hồ sơ theo [chương 33](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-33) |
| AS-CHR-008 | Tư Đồ Nam | Giao tiếp trong châu ở mốc B tương ứng | Dạng đứng v3 giữ mặt/tóc v2, tạm chấp nhận làm chuẩn thiết kế; dạng ngồi chương 112 lưu riêng trong [hồ sơ](CORE-CHARACTER-VISUAL-SPEC.md) |
| AS-CHR-009 | Chu Bằng / Zhou Peng, tên Việt chờ biên tập | Giao đấu ở MAP-013 | Hồ sơ theo [chương 52](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-52) |
| AS-ICO-008 | Dẫn Lực, tên Việt chờ chuẩn hóa | Luyện thuật và chiến đấu | Thiết kế biểu tượng; thuật tham chiếu [chương 27](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-27) |
| AS-ICO-009 | Kiếm được nhận trước giao lưu | MAP-012, hành trang | Kiếm mạ vàng theo [chương 39](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-39) |
| AS-ICO-010 | Vật phẩm gây mùi dùng trong giao đấu | Mốc trước trận/đoạn truyện | Đối chiếu [chương 49](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-49), [chương 52](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-52) |

Hai mẫu FX bổ sung cho B là lực kéo/khống chế và phản hồi trúng đòn. Các mục tiêu luyện thuật dùng hình bầu nước và đạo cụ sẵn có, không tạo thêm hai sinh vật chỉ để làm bài thử.

## 10. Hồ sơ lịch sử — Gói asset dài hạn

| Gói nội dung | Nguồn hình mới nên ưu tiên | Thành phần có thể dùng lại |
| --- | --- | --- |
| Mở rộng Triệu Quốc | 2–3 nền đặc trưng; 2–4 nhân vật thực sự xuất hiện; hình đối thủ theo arc | Kiến trúc môn phái, hang, rừng, icon tài nguyên |
| Hỏa Phần | Núi lửa và khu tu luyện bị ảnh hưởng; hình hỏa thú sau hồ sơ nguồn | Đá, hang, lớp linh khí; hiệu ứng đổi palette |
| Tu Ma Hải | Cảnh sương và nơi trú/đô thị; nhân vật hoặc đối thủ của arc | Nền phòng, vật phẩm, khung gặp gỡ |
| Cổ Thần chi địa | Cảnh thử luyện và cấm chế đặc trưng | Hiệu ứng lực, ánh sáng, mẫu cảnh hang |
| Yêu Linh chi địa / La Thiên | Cảnh và biểu tượng cho lớp bản đồ mới, sản xuất từng gói nhỏ | Renderer map theo nút, khung nhân vật, thông báo và các mẫu combat |

Kế hoạch số lượng theo từng gói nằm trong [WORLD-MAPS.md](WORLD-MAPS.md). Tên địa điểm tương lai là danh sách để nghiên cứu và sản xuất theo arc, không tự mở tất cả trong MVP.

## 11. Hồ sơ lịch sử — Hồ sơ, đặt tên và quy trình duyệt

Mỗi hồ sơ asset có: ID, nhóm, gói, mốc xuất hiện, nguồn sự kiện, mô tả hình, kích thước, định dạng, biến thể, địa điểm sử dụng, mức ưu tiên, tác giả/nguồn file và trạng thái.

Tên file đề xuất: `as-env-002-mountain-spring.webp`, `as-chr-001-wang-lin.webp`, `as-ico-004-stone-bead.svg`. ID giữ nguyên khi thay file; các nơi dùng trỏ theo ID.

Trình tự duyệt:

1. Chốt vai trò, mốc và brief.
2. Phác một bản để kiểm tra bố cục và nhận diện.
3. Duyệt chi tiết liên quan nguyên tác.
4. Hoàn thiện và xuất bản web theo ngân sách.
5. Đặt vào cảnh thật; kiểm tra ở màn hình nhỏ, nền sáng/tối và chế độ giảm chuyển động.

Quy trình này áp dụng cho hình tự vẽ, hình thuê sản xuất hoặc hình tạo bằng công cụ AI. Luôn duyệt cùng một bộ quy chuẩn và giữ thông tin nguồn sản xuất trong hồ sơ.

## 12. Hồ sơ lịch sử — Tiêu chí nghiệm thu

- Mỗi map, nhân vật và vật phẩm trỏ tới asset đã duyệt hoặc placeholder hợp lệ.
- Mọi asset P1 có ít nhất một nơi dùng cụ thể; không có cảnh mới chỉ vì khác tên node.
- Hạt châu và trang phục đổi trạng thái đúng mốc, kể cả sau lưu/mở lại.
- Icon nước và linh dịch phân biệt được bằng hình khi bỏ màu.
- Nền và chân dung không cắt mất chủ thể ở bố cục 360 px.
- Asset thiếu không chặn hành trình; vẫn hiện tên và thông tin hoạt động.
- Đạt ngân sách đồ họa hoặc ghi rõ khoản vượt và lý do khi có file thật.

Danh mục lịch sử chính truyện/asset A: [mvp-content-catalog.json](data/mvp-content-catalog.json), không là dữ liệu gameplay hiện hành. [character-roster.json](data/character-roster.json) bổ sung hai mẫu đệ tử, tách số người khỏi số nguồn chân dung và theo dõi concept.

## 13. Hồ sơ lịch sử — Vị trí asset trong các màn hình A — tham chiếu UX v0.6

| Màn hình/cảnh | Asset dùng lại | Điều kiện và cách trình bày |
| --- | --- | --- |
| Tu luyện | AS-CHR-001; AS-ICO-001/002/003; nền của hoạt động | Trang phục theo mốc hiện tại; luôn có tên tài nguyên; nền không che mục tiêu |
| Hạt châu | AS-ICO-004; lớp FX-001/003 đã đề xuất | Chỉ hiện khi có châu; biến thể theo mốc hoàn thành; 10 đám mây là chuyển tiếp trong E07 |
| Hành trình/địa điểm | AS-ENV-001…006; AS-CHR-001…006 | Node theo cảnh đã giới thiệu; hồ sơ thiếu chân dung có thẻ tên; MAP-007 phân biệt vườn/phòng |
| Hành trang | AS-ICO-004/005/006/007 | Chỉ hiện vật phẩm đã nhận; bầu/túi không tăng sức chứa của A |
| Cảnh E03-TRAIL | AS-ENV-002; AS-CRE-001; AS-CHR-001 | Đe dọa/thoát hiểm, nút tiếp tục luôn đọc và bấm được |
| Cảnh E07-DREAM | AS-ENV-006; AS-ICO-004; FX-003 | Lớp minh họa cảnh có thể khác trạng thái vật phẩm trước khi hoàn thành mốc |
| Kết thúc A | AS-ENV-005; AS-CHR-001; AS-ICO-003; FX-004 | Hiệu ứng sau khi kết quả đã lưu; giảm chuyển động giữ cùng nội dung |
| Cài đặt/tổng kết offline | Thành phần chữ, nút và icon tài nguyên đã có | Không yêu cầu hình nền/nhân vật mới |

Chi tiết bố cục cũ ở [UX-MVP-A.md](UX-MVP-A.md). Ma trận UX v0.6 và tổng 18+2/20+2 ghi lịch sử. Luồng hiện hành dùng nhân vật đã chọn trong bộ ba; portrait/nhiệm vụ/vật phẩm theo GDD và mốc nội dung được biên tập, chưa triển khai gameplay.

## 14. Asset đi lại và gameplay theo GDD hiện hành

| Nhóm | Đã có | Còn cần khi triển khai |
| --- | --- | --- |
| Bộ ba trên map | 60 frame chibi, đứng/đi/lướt bốn hướng, frame 64 × 96, anchor (32,88) | Duyệt chibi Tư Đồ Nam; lập tương tác/tu luyện/combat theo actor, không chờ mốc nguyên tác B/arc sau để cho chọn |
| Avatar sân online | Hai đệ tử chibi 40 frame | Thay/triển khai luồng chọn bộ ba theo thiết kế; online hiện chưa hỗ trợ bộ ba |
| Map Hằng Nhạc | ART cũ đã xóa; concept tổng mới v1 chờ duyệt | Sau khi concept được chọn, tách ART và ghép trong Map Design theo [hợp đồng map](MAP-BUILDING-GUIDE.md) |
| NPC/quái/đạo cụ | Placeholder/data và hồ sơ nguồn theo nội dung | Chọn danh sách thực sự cần cho HN01–HN12; không dùng dự toán NPC A/B cũ làm backlog hiện hành |
| Combat/VFX | Thư viện 15 skill đã bàn giao; pose Vương Lâm hướng Đông | Luật combat/host events, hướng/pose ba actor, quái/đối thủ, SFX/icon và kiểm khả năng đọc/hiệu năng |

## 15. Portrait và motion bộ ba

[Gói chân dung UI v1](design/characters/core-ui-v1/README.md) có AS-CHR-001 Vương Lâm áo xám, AS-CHR-008 Tư Đồ Nam linh thể, AS-CHR-010 Lý Mộ Uyển áo tím. Ba cỡ 512/160/64, PNG/WebP = 18 bản xuất từ ba nguồn. WebP khoảng 94–99 KB/14 KB/3,5 KB theo cỡ, PNG giữ master; [manifest](design/characters/core-ui-v1/manifest.json) lưu số đo chính xác. Portrait chưa duyệt; nhận diện cũ Lý Mộ Uyển không thay bản chibi native-v5 đã chấp nhận.

[Kế hoạch motion](CORE-CHARACTER-MOTION-PLAN.md) hiện có **60 frame**, dự toán thêm **16** (12 lơ lửng Tư Đồ Nam + 4 luyện đan Lý Mộ Uyển) thành **76**; phần thêm chưa vẽ. Hai mẫu đệ tử, Vương Lâm trước 36 và Tư Đồ Nam ngồi 128 × 128 không cộng vào 60. Tương tác/tu luyện Vương Lâm tùy chọn thêm 8; combat/trang phục mới cần ngân sách riêng sau thiết kế gameplay. Ưu tiên hiện tại vẫn là map.
