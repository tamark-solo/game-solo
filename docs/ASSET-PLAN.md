# Kế hoạch asset — Tiên Nghịch: Hành Trình Vương Lâm

> **Ưu tiên hiện tại:** [đoạn ngoại viện native mẫu](MAP-COURTYARD-PILOT-PLAN.md) theo [quy tắc xây map](MAP-BUILDING-GUIDE.md), giữ ART tham chiếu và sprite64 × 96; nguồn sạch/cụm/layer trước mở rộng map. NPC/quest/combat/đồ/đột phá theo sau map đã duyệt; portrait để sau. [MVP mới](MVP-RPG-A.md) dự kiến204 frame combat bổ sung; dự toán portrait/map-node bên dưới giữ tham chiếu, không thay ngân sách7 PNG chính dự kiến của đoạn mẫu.

**Phiên bản:** 1.5, ngày 07/10/2026.  
**Trạng thái:** nhận diện Vương Lâm v2 đã duyệt; bộ áo xám 28 frame làm chuẩn thử. Hai đệ tử v2 đã có nhận diện và 56 frame đứng/đi thử; còn chờ đánh giá.  
**Tham chiếu:** [GDD](GDD.md), [ART direction](ART-DIRECTION.md), [bộ UI](UI-COMPONENTS.md), [map](WORLD-MAPS.md), [quái và gặp gỡ](ENCOUNTERS.md).

**Điều chỉnh online:** hai nguồn đệ tử `AS-PC-001/002` được bổ sung; Vương Lâm/cha mẹ và các nhân vật truyện là NPC. [CHARACTERS.md](CHARACTERS.md) và [roster](data/character-roster.json) xác định số người, vai trò và concept. Các map/cảnh/vị trí dùng ở phần dưới giữ làm tham chiếu, chờ tách tuyến người chơi theo [ONLINE-DIRECTION.md](ONLINE-DIRECTION.md).

**Điều chỉnh MMORPG v0.10:** nhân vật pixel art trên nền stylized 2D/top-down ba phần tư. [Mẫu Vương Lâm](design/characters/wang-lin-sprite-study/index.html) dùng tham chiếu phong cách; sân v2 (bộ cũ đã xóa) giữ tham chiếu nền/bố cục. Các tổng 20/22/30 chỉ dự toán portrait/minh họa; bộ pixel native/map/animation cần ngân sách sau khi duyệt cách ghép/tỷ lệ/động tác. Xem mục 14 và [WORLD-VISUAL-SPEC.md](WORLD-VISUAL-SPEC.md).

## 1. Khuyến nghị

Nên lập asset ngay ở giai đoạn thiết kế: mỗi asset có ID, vai trò, mốc truyện xuất hiện, hình dáng cần giữ, biến thể và nơi sử dụng. Sản xuất theo từng gói nội dung đã chơi được để tránh làm nhiều hình chưa có chỗ dùng.

Minh họa 2D cho chân dung/cảnh truyện, vector hoặc code cho icon/hiệu ứng tiếp tục là bộ tham chiếu. Màn thế giới MMORPG cần cảnh đi lại và nhân vật chuyển động riêng; ảnh nền/biểu tượng node chỉ phục vụ chính truyện và điều hướng tổng quan.

Asset gồm cả hình ảnh, hiệu ứng, âm thanh, văn bản và dữ liệu nội dung. Một địa điểm cần chức năng và điều kiện mở; một sinh vật cần vai trò và luật gặp gỡ trước khi có ảnh đẹp.

Hướng tranh mực/giấy cổ đã được người phát triển chọn. [Bảng ART v1](design/art-reference-v1.png), [bản phác UX](design/index.html) và [concept nhân vật](design/characters/index.html) thuộc gói V0 trong ART-DIRECTION, dùng làm tham chiếu. Dự toán nguồn game sau khi cộng mẫu đệ tử là 20 nguồn P0/P1 và 2 nguồn P2.

## 2. Những gói cần chuẩn bị

| Gói | Nội dung | Khi sản xuất |
| --- | --- | --- |
| P0 — Prototype | 7 biểu tượng; thẻ tên cho 9 địa điểm và 6 hồ sơ; hiệu ứng cơ bản bằng code | Khi dựng vòng tài nguyên và hành trình |
| V0a — Tạo hình | Bộ Vương Lâm v2 và hai mẫu đệ tử v2 | Nhận diện Vương Lâm đã duyệt; hai mẫu đệ tử có bộ thử, còn chờ đánh giá |
| V0b — Bộ ba trọng tâm | Tư Đồ Nam linh thể đứng v3 giữ mặt/tóc v2; Lý Mộ Uyển v1, 4 mẫu tĩnh mỗi người | Lý Mộ Uyển đã chấp nhận; Tư Đồ Nam đứng v3 tạm chấp nhận làm chuẩn thiết kế |
| V0c — Chân dung/động tác bộ ba | Một chân dung/người, PNG/WebP 512/160/64; kế hoạch đứng/đi/lướt/luyện đan | Chân dung mới chờ đánh giá; 64 frame động tác bổ sung còn ở thiết kế |
| P1 — Chơi thử có hình | 6 nền, 4 nguồn chân dung NPC + 2 nguồn đệ tử, 1 hình hổ; hoàn thiện 7 biểu tượng | Sau khi tuyến P và chính truyện được biên tập/chơi được |
| P2 — Hoàn thiện nhập môn | Thêm chân dung tứ thúc và Vương Trác; chỉnh các lớp trang phục và trạng thái châu | Sau phản hồi đợt chơi thử |
| B — Thử chiến đấu | 2 nền mới, 3 chân dung, 3 biểu tượng; 2 hiệu ứng bằng code | Sau khi A đạt điều kiện chuyển giai đoạn trong backlog và vòng luyện thuật/giao đấu chạy được |
| Dài hạn | Gói theo từng arc, ưu tiên phần dùng lại từ các gói trước | Sau khi hoàn thành hồ sơ map, nhân vật và gặp gỡ của arc |

Theo lộ trình **A → B**, A online dự toán **20 nguồn đồ họa P0/P1**, **22 nếu làm thêm P2**. Gói B tham chiếu thêm 8 nguồn, đưa tổng lên **30**. Hai mẫu đệ tử thêm 2 nguồn vào kế hoạch cũ 18/20/28; concept trên giấy không tính thêm nguồn game. Dự toán chưa bao gồm hình mới nếu tuyến P/khu chung cần vật phẩm hoặc cảnh khác; cập nhật sau biên tập online. Điều kiện B nằm trong [backlog](MVP-BACKLOG.md).

## 3. Quy chuẩn hình ảnh đề xuất

| Nhóm | Kích thước nguồn đề xuất | Xuất dùng trên web | Mục tiêu dung lượng mỗi file |
| --- | --- | --- | --- |
| Nền cảnh | 1.600 × 900, bố cục 16:9 | WebP; giữ bản nguồn có lớp nếu có | ≤350 KB |
| Chân dung | 512 × 512, nhân vật ở giữa khung | WebP có alpha hoặc PNG khi cần | ≤120 KB |
| Sinh vật trong thẻ sự kiện | 768 × 768, có nền trong suốt | WebP có alpha hoặc PNG | ≤150 KB |
| Biểu tượng | ViewBox 128 × 128; nhận diện được ở 24 px | SVG | ≤10 KB |
| Hiệu ứng nhẹ | Mẫu thông số và lớp vẽ dùng lại | CSS/vector/canvas tùy công nghệ | Chưa cần sprite sheet |

WebP phục vụ ảnh nén và hỗ trợ alpha; SVG phù hợp hình vector cần đổi kích thước. Đây là lựa chọn định dạng dựa trên [hướng dẫn định dạng ảnh của MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types). Kích thước và ngân sách dung lượng trong bảng là mục tiêu riêng của dự án, chưa được đo bằng asset thật.

Mục tiêu: đồ họa lần mở đầu ≤1 MB, toàn bộ gói A ≤4 MB; tải cảnh tiếp theo khi cần. Ngân sách này chỉ tính đồ họa, không bao gồm mã ứng dụng và âm thanh tùy chọn.

Giữ palette nhất quán: sắc đất và giấy cho phàm nhân, xám/đỏ cho thân phận ở môn phái, ánh sáng xanh nhạt cho phản hồi linh khí. Không đặt chữ hoặc tên vật phẩm trực tiếp trong ảnh; giao diện vẽ chữ để giữ khả năng đổi cỡ và sửa bản dịch.

## 4. Danh mục 6 nền dùng cho 9 địa điểm

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

## 5. Danh mục 6 chân dung

Sáu nguồn dưới đây thể hiện **7 NPC** vì cha mẹ chung một hình. Hai mẫu đệ tử là nguồn riêng, được bổ sung sau bảng.

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

| Asset ID | Mẫu người chơi | Brief | Concept | Ưu tiên |
| --- | --- | --- | --- | --- |
| AS-PC-001 | Đệ tử nam | Trưởng thành trẻ, tóc búi cao, mặt cởi mở, áo xám/đai xanh trầm; tên do người chơi đặt | [v1](design/characters/player-male-novice-v1.png) | P1 |
| AS-PC-002 | Đệ tử nữ | Trưởng thành trẻ, búi tóc thấp, vẻ tập trung; cùng cấp trang bị với mẫu nam | [v1](design/characters/player-female-novice-v1.png) | P1 |

Vương Lâm cũng có [concept nhập môn v1](design/characters/wang-lin-initiation-v1.png). Cả ba bảng được tạo bằng imagegen tích hợp, prompt lưu trong [thư viện nhân vật](design/characters/index.html); chúng chưa là portrait 512 × 512 có alpha. Danh mục NPC dài hạn nằm trong [CHARACTERS.md](CHARACTERS.md).

## 6. Sinh vật và 7 biểu tượng

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

## 7. Bốn brief quan trọng để sản xuất

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

[Bộ native đầu tiên](WANG-LIN-SPRITE-SPEC.md) đã xuất 4 đứng và 24 đi áo xám: frame 64 × 96, atlas 448 × 384, palette 24 mục, điểm chân (32, 88). [Trang animation](design/characters/wang-lin-gray-walk-v1/index.html) cho xem vòng lặp và thử bước; đánh giá motion trước gói đệ tử/đồ còn lại. Đây là một bộ nhân vật 28 frame, tách khỏi số nguồn portrait.

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

## 8. Hiệu ứng và âm thanh

| ID | Phản hồi | Cách làm đề xuất | Mốc |
| --- | --- | --- | --- |
| FX-001 | Nước nhận linh khí | Vòng sáng và vài giọt/điểm sáng | Hoàn thành ủ nước |
| FX-002 | Thổ nạp | Nhịp sáng đồng bộ thanh chu kỳ | Luyện thổ nạp/tu luyện thường |
| FX-003 | Mộng cảnh hoạt động | Lớp sáng nhẹ trên nền; giảm chuyển động vẫn có thanh tiến độ | Sau E07 |
| FX-004 | Đột phá | Vòng khí mở rộng và thay đổi nhãn cảnh giới | E08 |

Đây là 4 mẫu hiệu ứng bằng code, không tính thành 4 file đồ họa trong ngân sách 20 asset gốc.

Âm thanh tùy chọn: UI bấm, nhận mốc và đột phá. Nhạc nền, tiếng suối và bộ âm thanh chiến đấu được sản xuất khi trải nghiệm đã cần đến chúng. Gói chơi thử vẫn phải hiểu được với âm thanh tắt.

## 9. Asset cho phương án chiến đấu B

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

## 10. Gói asset dài hạn

| Gói nội dung | Nguồn hình mới nên ưu tiên | Thành phần có thể dùng lại |
| --- | --- | --- |
| Mở rộng Triệu Quốc | 2–3 nền đặc trưng; 2–4 nhân vật thực sự xuất hiện; hình đối thủ theo arc | Kiến trúc môn phái, hang, rừng, icon tài nguyên |
| Hỏa Phần | Núi lửa và khu tu luyện bị ảnh hưởng; hình hỏa thú sau hồ sơ nguồn | Đá, hang, lớp linh khí; hiệu ứng đổi palette |
| Tu Ma Hải | Cảnh sương và nơi trú/đô thị; nhân vật hoặc đối thủ của arc | Nền phòng, vật phẩm, khung gặp gỡ |
| Cổ Thần chi địa | Cảnh thử luyện và cấm chế đặc trưng | Hiệu ứng lực, ánh sáng, mẫu cảnh hang |
| Yêu Linh chi địa / La Thiên | Cảnh và biểu tượng cho lớp bản đồ mới, sản xuất từng gói nhỏ | Renderer map theo nút, khung nhân vật, thông báo và các mẫu combat |

Kế hoạch số lượng theo từng gói nằm trong [WORLD-MAPS.md](WORLD-MAPS.md). Tên địa điểm tương lai là danh sách để nghiên cứu và sản xuất theo arc, không tự mở tất cả trong MVP.

## 11. Hồ sơ, đặt tên và quy trình duyệt

Mỗi hồ sơ asset có: ID, nhóm, gói, mốc xuất hiện, nguồn sự kiện, mô tả hình, kích thước, định dạng, biến thể, địa điểm sử dụng, mức ưu tiên, tác giả/nguồn file và trạng thái.

Tên file đề xuất: `as-env-002-mountain-spring.webp`, `as-chr-001-wang-lin.webp`, `as-ico-004-stone-bead.svg`. ID giữ nguyên khi thay file; các nơi dùng trỏ theo ID.

Trình tự duyệt:

1. Chốt vai trò, mốc và brief.
2. Phác một bản để kiểm tra bố cục và nhận diện.
3. Duyệt chi tiết liên quan nguyên tác.
4. Hoàn thiện và xuất bản web theo ngân sách.
5. Đặt vào cảnh thật; kiểm tra ở màn hình nhỏ, nền sáng/tối và chế độ giảm chuyển động.

Quy trình này áp dụng cho hình tự vẽ, hình thuê sản xuất hoặc hình tạo bằng công cụ AI. Luôn duyệt cùng một bộ quy chuẩn và giữ thông tin nguồn sản xuất trong hồ sơ.

## 12. Tiêu chí nghiệm thu

- Mỗi map, nhân vật và vật phẩm trỏ tới asset đã duyệt hoặc placeholder hợp lệ.
- Mọi asset P1 có ít nhất một nơi dùng cụ thể; không có cảnh mới chỉ vì khác tên node.
- Hạt châu và trang phục đổi trạng thái đúng mốc, kể cả sau lưu/mở lại.
- Icon nước và linh dịch phân biệt được bằng hình khi bỏ màu.
- Nền và chân dung không cắt mất chủ thể ở bố cục 360 px.
- Asset thiếu không chặn hành trình; vẫn hiện tên và thông tin hoạt động.
- Đạt ngân sách đồ họa hoặc ghi rõ khoản vượt và lý do khi có file thật.

Danh mục cũ cho chính truyện/asset A: [mvp-content-catalog.json](data/mvp-content-catalog.json), đã đánh dấu chờ chuyển online. [character-roster.json](data/character-roster.json) bổ sung hai mẫu đệ tử, tách số người khỏi số nguồn chân dung và theo dõi concept.

## 13. Vị trí asset trong các màn hình A — tham chiếu UX v0.6

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

Chi tiết bố cục cũ ở [UX-MVP-A.md](UX-MVP-A.md). Khi chuyển online, Tu luyện/kết thúc của đệ tử dùng AS-PC-001/002; portrait Vương Lâm và icon châu giữ trong chính truyện. Ma trận v0.6 dùng kế hoạch cũ 18+2; dự toán hiện tại đã cộng hai nguồn player thành 20+2 như mục 2.

## 14. Bộ hình cho khu đi lại và hướng MMORPG

| Nhóm | Đầu ra cần thiết kế | Điều kiện trước sản xuất |
| --- | --- | --- |
| Đệ tử trên map | Pixel art đứng, đi, tu luyện cho hai mẫu người chơi | Lưới native, tỷ lệ/palette và hướng/động tác được duyệt qua cảnh ghép |
| Map môn phái | Nền/đạo cụ stylized 2D, điểm tương tác và đường đi | Cùng camera/tỷ lệ/palette với nhân vật pixel; bố cục khu chung được biên tập |
| NPC trên map | Pixel art đứng/tương tác cho NPC thật sự cần | Danh sách NPC/mốc đã biên tập, cùng quy chuẩn sprite đệ tử |
| Màn thế giới | Tên, điểm tương tác, nhiệm vụ và bảng điều khiển idle | UX tương tác khi nhân vật di chuyển |
| Bộ combat | Quái/đối thủ, động tác đòn/thuật, vật phẩm và phản hồi | Phạm vi chiến đấu A/B và luật trận được chốt |

Không quy đổi một sheet nhiều khung thành một nguồn portrait trong dự toán cũ. [Bộ thử đệ tử](PLAYER-AVATAR-VISUAL-SPEC.md) theo dõi **2 bộ × 28 frame = 56 frame**, cùng frame 64 × 96 và palette 24 mục; mỗi bộ gồm 4 đứng/24 đi. Cộng bộ Vương Lâm đã có thành 84 frame thử của ba mẫu, không tăng số NPC hoặc số nguồn portrait A. Nhận diện và motion đệ tử còn chờ đánh giá; tu luyện/tương tác/combat/trang phục khác chưa nằm trong 56 frame này.

## 15. Chân dung UI bộ ba và ngân sách động tác

[Gói chân dung](design/characters/core-ui-v1/index.html) tạo một nguồn UI cơ bản cho AS-CHR-001 (Vương Lâm áo xám), AS-CHR-008 (Tư Đồ Nam linh thể), AS-CHR-010 (Lý Mộ Uyển áo tím). Ba cỡ 512/160/64, PNG/WebP; tổng 18 bản xuất từ ba nguồn. Các file/cỡ không cộng thành nhân vật hoặc nguồn portrait mới trong dự toán A.

WebP 512 hiện khoảng 94–99 KB, 160 khoảng 14 KB, 64 khoảng 3,5 KB; PNG giữ làm master. [Manifest](design/characters/core-ui-v1/manifest.json) và [nguồn/prompt](design/characters/core-ui-v1/README.md) ghi dung lượng chính xác. Chân dung mới chờ đánh giá; trang phục khác và biểu cảm đặc thù tách theo cảnh.

[Kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) hiện dùng [dàn chibi mới](CHIBI-ROSTER-SPEC.md): bộ ba có 60 frame riêng; thêm 12 lơ lửng tại chỗ và 4 luyện đan còn dự kiến, tổng mục tiêu 76. Hai đệ tử có 40 frame chibi riêng, dùng trong sân online. Các ngân sách 28 frame/mẫu và mẫu tĩnh phía trên thuộc giai đoạn trước. Lý Mộ Uyển đã làm lại mặt/tóc/trang phục; bộ mới chờ đánh giá, portrait cần đồng bộ sau khi chọn diện mạo.
