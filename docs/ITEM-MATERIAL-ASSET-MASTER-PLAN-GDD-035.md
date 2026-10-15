# Kế hoạch tổng thể vật phẩm, nguyên liệu và asset theo GDD 0.35

15/10/2026 · Owner đã đồng ý phạm vi và thứ tự triển khai · Chưa sản xuất hình hoặc mở nội dung runtime.

Căn cứ: [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [chiều sâu MMO](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md), [tiến trình](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) và [Artwork–Logic](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md). Hợp đồng thống nhất sở hữu điều kiện mở khóa khi bảng ví dụ ở tài liệu khác chưa đủ cụ thể.

**Ưu tiên đã thống nhất:** xây nền vật phẩm và chế tác cho toàn bộ GDD trước, sau đó sản xuất/ghép theo chặng. Bản tổng thể phải nhìn đủ năm cảnh giới và sáu luồng phát triển; đợt production đầu bao phủ Chặng 1 tới Trúc Cơ, được chia thành các lượt nhỏ có thể kiểm. VG01–VG02 là lát kiểm chứng sớm trong đợt ấy, không phải toàn bộ phạm vi thiết kế vật phẩm.

Đây là kế hoạch tổng thể áp dụng cho các đợt tiếp theo. [Điểm vào asset](ASSET-PLAN.md) dẫn tới kế hoạch này; các bản VP/IT/HN và dự toán ba nhân vật cũ đã được [chuyển sang lịch sử](archive/asset-plans-before-gdd-035-2026-10-15/README.md). Chấp thuận kế hoạch chưa chốt mọi tên món, công thức, số lượng hình hoặc duyệt ART/balance.

Không đặt trước tổng số icon từ số nhóm/Tier. Một item có thể có nhiều kích thước xuất, nhiều phẩm chất hoặc nhiều trạng thái; một icon dùng chung không biến các item khác luật thành cùng một ID. Số hình mới chỉ chốt sau bảng đối chiếu item–nguồn–công thức–asset.

## 1. Vật phẩm phải phục vụ đủ sáu luồng phát triển

| Luồng theo GDD | Vật phẩm/tài nguyên phải có trong kế hoạch | Điểm cần giữ đúng |
| --- | --- | --- |
| Cảnh giới và Đạo Cơ | Đan Tu vi, Lộ Thủy, giải độc, đan đột phá, khẩu quyết vật lý, linh vật/ấn ký chứng đạo. | Tu vi, độ thuần và đan độc là state; hoàn thành thử thách là fact, không tự tạo món loot cho mọi thanh/fact. Hai nhánh Trúc Cơ tầng 12/15 đều có nguồn đan. |
| Bốn pháp bảo bản mệnh | Item sở hữu Kiếm/Phiên/Xa/Châu; vật tư tế luyện; Du Hồn/chủ hồn; giải niêm; Ngũ Hành; cổ ấn. | Bốn họ × ba mốc là 12 hình thái thiết kế, không phải 12 pháp bảo rơi độc lập cần nhận lại từ đầu. Tổng bậc 0–30 kế thừa. |
| Công pháp và Tâm pháp | Khẩu quyết, Quyển Thượng/Trung/Hạ, sách Tâm pháp phụ nếu là vật phẩm, nguồn chứng ngộ. | Khẩu quyết mở cảnh giới khác sách nâng lĩnh ngộ; mastery lưu riêng. Quyển Trung có từ VG04, Quyển Hạ từ VG07. |
| Trang bị tu sĩ | Pháp Y, Hộ Uyển, Linh Ngoa, Yêu Đái, Ngọc Bội, Linh Giới; phôi rèn; vật tư cường hóa/tẩy luyện/khảm. | Sáu ô phòng cụ/phụ kiện tách khỏi bốn pháp bảo. Cường hóa gắn ô; không đòi vẽ lại quần áo trên hàng nghìn frame. |
| Tứ Nghệ và Nội Giới | Linh thảo/hạt giống, khoáng, nguyên liệu/phôi, đan, phù, trận bàn; vật tư nâng Nội Giới và nuôi dưỡng. | Đan–Khí–Phù–Trận đều có nguồn, recipe và đầu ra tiêu được. Cấp Nội Giới khác bậc tế luyện Châu. |
| Nhân Duyên và danh vọng | Ngọc Giản Hộ Mệnh, tín vật NPC, vật liệu chuỗi Tư Đồ Nam/Lý Mộ Uyển, phần thưởng danh vọng. | Tín vật độc bản và trạng thái hảo cảm khác hàng hóa farm; không suy mở trợ chiến chỉ từ icon/portrait. |

Ngoài item cất trong túi, cần mô hình tiền tệ: Linh Thạch, Tiên Ngọc Khóa, Tiên Ngọc Không Khóa và Công Huân. Đây là các số dư/điểm theo kiến trúc kinh tế GDD; không mặc định tất cả là item stack trong hành trang.

## 2. Tám nhóm vật phẩm cần thiết kế

Các tên dưới đây lấy từ GDD/báo cáo/hợp đồng, không phải danh sách item ID đã phát hành.

| Nhóm | Ngưng Khí | Trúc Cơ | Kết Đan | Nguyên Anh–Hóa Thần | Vai trò xuyên suốt |
| --- | --- | --- | --- | --- | --- |
| 1. Linh thảo/hạt giống | Thanh Linh Thảo, Bạch Lộ Hoa, Mộc Linh Dịch, Thanh Mộc Linh Tâm. | Quyết Minh Tử Thảo, Hàn Đan Linh Lộ, Huyết Tinh Chi, linh dược trăm năm. | Tu Ma Huyết Liên, Thiên Lôi Quả, dược liệu biển. | Cổ Thần Huyết Thảo, Tinh Không Đạo Quả, Sinh Tử Dược; bậc cụ thể còn cần đặc tả. | Hái/trồng → luyện đan; vật liệu chủ dược Boss tách khỏi thảo dược phổ thông. |
| 2. Đan/Lộ Thủy | Hồi Khí Tán, Tụ Khí Đan, Thanh Tâm Đan, Tị Độc Đan, Lộ Thủy; Trúc Cơ Đan có trước cuối chặng. | Ngưng Nguyên Đan, Tẩy Tủy Đan, Bạo Khí Đan; Thiên Ly Đan có từ VG09 trước VG11. | Chân Nguyên Đan, Kim Đan Hộ Tâm Đan. | Phá Đan Hóa Anh Đan, Nghịch Thiên Tục Mệnh Đan, Hóa Thần Vấn Đạo Đan. | Hồi phục, tăng tu luyện, giải độc, chuẩn bị đột phá; bốn phẩm chất đan cần phân biệt rõ. |
| 3. Khoáng/đá tế luyện | Huyền Thiết, Đá Mài Kiếm sơ cấp, Vân Nha, Giáp Ngọc Trùng, Mảnh Khôi Lỗi. | Hàn Thiết Tinh Kim, Huyết Văn Lụa, Âm Mộc, Thiên Lôi Thiết và vật tư bậc tương ứng. | Thiên Lôi Thần Thiết, Hải Hồn Tinh Thiết, Kim Đan Yêu Cốt. | Tử Kim Tiên Thiết, Tinh Không Thần Thạch, Cổ Thần Chi Tinh. | Rèn sáu ô, tế luyện, nuôi dưỡng và tái chế. Vật tư Mốc I phải kiếm được khi còn Ngưng Khí. |
| 4. Hồn phách/tinh huyết | Du Hồn Sơ Cấp, Yêu Hồn Lang Tuần Sơn, các chủ hồn phụ theo nguồn đã định. | Tinh Hồn Trúc Cơ; hai chủ hồn khảo nghiệm Lang Tuần Sơn/Phù Sư Hắc Lụa từ VG07; Chấp Sự Giả Đan sau VG10. | Hung Hồn Tu Ma Hải, Chủ Hồn Yêu Vương Kết Đan. | Nguyên Anh Chiến Hồn, Đế Hồn theo chặng Mốc III. | Nuôi Phiên/khí linh. Hồn phổ thông có thể stack; chủ hồn có danh tính/phẩm chất cần record riêng. |
| 5. Phù/Trận/Cổ ấn/giải niêm | Phá Cấm Phù, Thần Hành Phù, Kim Quang Hộ Phù, Cổ Ấn bậc 1, Giải Niêm I. | Tụ Linh/Tứ Tượng/Tị Lôi Hộ Đạo Trận, Cổ Ấn bậc 2, Giải Niêm II. | Trận bàn/cổ ấn cao cấp theo bí cảnh. | Cổ ấn/giải niêm Mốc III và trận bàn Đạo Vực theo đặc tả tiếp nối. | Công cụ chiến thuật và build; ba ô cổ ấn mỗi pháp bảo, chín khóa Xa. |
| 6. Khẩu quyết/Tàn Quyển | Khẩu quyết 4–6/7–9/10–12; Cổ Quyết 13–15 tùy chọn; Quyển Thượng/Trung. | Trúc Cơ Chân Quyết, Quyển Hạ, Tâm pháp phụ theo mốc. | Chứng ngộ Hóa Cảnh và Tâm pháp ô thứ ba. | Thần thông/Ý Cảnh theo thiết kế chặng sau. | Tách sách cầm trong túi khỏi tri thức đã học; chứng ngộ có thể chỉ là fact, không tự có icon loot. |
| 7. Trang bị sáu ô/phôi rèn | Thanh Vân, Vân Nha, Huyền Thiết; phôi/chi tiết theo từng món. | Quyết Minh Đan Tâm, Hàn Thiết Kiếm Ma. | Tu Ma Huyết Hải, Thiên Lôi Trấn Pháp. | Phòng cụ Cổ Bảo/Tiên Khí theo bộ chưa phân rã. | Săn đồ, chế tác, set 2/4/6 món; phải liệt kê từng món thực có, không tự coi mọi tên bộ là đã đủ sáu món. |
| 8. Chứng đạo/nhân duyên | Lệnh Bài Đen; ba Ấn Ký Tinh Anh Lang/Tam/Cổ; tín vật đột phá. | Ngọc Giản Hộ Mệnh, Bản Đồ Tu Ma Hải và tín vật tuyến truyện. | Vật liệu/tín vật chuỗi tái tạo nhục thân Tư Đồ Nam. | Ngũ Hành bản nguyên cấp cao, tín vật Tục Mệnh/Ý Cảnh theo chặng sau. | Mở đường truyện, nâng phẩm chất Đạo Cơ, nhân duyên; khóa/độc bản theo hợp đồng. |

Tiêu chuẩn phân chặng là **thời điểm kiếm được**, đồng thời lưu cảnh giới/mốc mà vật phẩm phục vụ. Vì vậy Trúc Cơ Đan thuộc lượt sản xuất Ngưng Khí cuối chặng; Thiên Ly Đan và Tị Lôi Hộ Đạo Trận thuộc lượt Trúc Cơ trước Kết Đan. Không chờ sản xuất cảnh giới đích mới tạo món dùng để vào cảnh giới đó.

## 3. Nối tài nguyên với NPC, quái và Boss hiện có

| Nguồn đang có trong thiết kế/thư viện | Gắn vào vòng vật phẩm | Tận dụng và phần cần bổ sung |
| --- | --- | --- |
| Bạch Chỉ, Lý Mộ Uyển | Đan cơ bản/giải độc → Trúc Cơ Đan → Thiên Ly Đan, Đan–Trận/nhân duyên. | Dùng NPC phù hợp hiện có; bổ sung dữ liệu recipe, giao diện craft và những pose còn thiếu. |
| Tống Thiết | Rèn/tế luyện, sáu ô trang bị, tẩy luyện/phân giải. | Dùng bộ NPC và nơi tương tác hiện hành; asset đầu ra/phôi phải có manifest riêng. |
| Lục Văn, Tư Đồ Nam | Khẩu quyết/Tàn Quyển, phù, Cổ Quyết, giám định và giải niêm. | Dùng đúng vai trò thư viện/Nội Giới; không dựng thêm NPC trùng chức năng. |
| Vân Nha Lang / Lang Tuần Sơn | Vân Nha; Du Hồn/Yêu Hồn; chủ hồn khảo nghiệm Trúc Cơ. | Dùng ART quái/tinh anh đã sản xuất, nguồn rơi phân biệt theo encounter; không vẽ lại cả loài vì tăng bậc. |
| Phù Mộc Tinh | Mộc Linh Dịch. | Vật tư Đan/Khí/Châu theo recipe; dùng body/FX hiện có. |
| Ngọc Giáp Trùng / Thiết Giáp Linh Trùng | Giáp Ngọc Trùng, vật tư rèn/Xa. | Chốt alias với Mảnh Ngọc Giáp trong roster; nguồn tinh anh/chủ hồn phụ chỉ mở khi có đích tiêu. |
| Khôi Lỗi Rạn Ngọc | Mảnh Khôi Lỗi/vật tư cơ quan. | Tách vật liệu quái thường khỏi Lõi Tam Ấn/chứng đạo Boss. |
| Tán Tu Hắc Phù / Phù Sư Hắc Lụa | Mảnh Hắc Phù; chủ hồn khảo nghiệm Trúc Cơ, sách/vật tư theo bảng nguồn cụ thể. | Mảnh Hắc Phù thường khác Mảnh Phù Giải Niêm; không dùng chung item ID chỉ vì đều là mảnh phù. |
| Lang Vương / Tam Ấn / Cổ Mộc | Fact thắng truyện, vật liệu chủ dược/mở Xa/Ngũ Hành, ba Ấn Ký Tinh Anh riêng cho Đạo Cơ cao. | Dùng kit Boss hiện có đúng trạng thái. Thưởng truyện, vật liệu thường và chứng đạo nâng cao có ID/fact riêng. |
| Hắc Ấn | Thử thách cuối chặng; chân thân cấp hồn Chấp Sự sau VG10. | Reuse kit cho phân thân/chân thân; Neutral03/VFX02 đã duyệt, Motion01 còn candidate; chỉ thêm phần thiếu. |
| Nội Giới, ủy thác, Vấn Đạo | Lộ Thủy, linh điền, nguồn sách bảo đảm, khảo nghiệm bù đắp, quỹ thưởng tuần. | Nguồn bảo đảm solo, có lặp hợp lệ. Vật tư cá nhân Khóa được tách khỏi hàng hóa thực địa. |

Roster thế giới cũ còn **Mặc Dực, Bào Tử Giữ Khí, Tĩnh Niệm Tro** từ Mặc Dực Bức/Thực Linh Khuẩn/U Niệm. GDD 0.35 chưa chốt công thức tiêu tương ứng. Giữ làm ứng viên cần thiết kế đích tiêu, không tự bật loot hoặc đưa vào danh sách bắt buộc phải sản xuất. Có thể dùng ba loài này cho encounter/nguồn chung hợp lệ trước khi quyết định giữ nguyên liệu riêng.

## 4. Asset nào cần làm và asset nào chỉ cần dùng lại

| Lớp asset | Phạm vi cần quản lý | Nguyên tắc sản xuất |
| --- | --- | --- |
| Icon vật phẩm | Tám nhóm trên, bốn pháp bảo, tiền tệ/điểm khi cần biểu tượng. | Nguồn tự chứa; xem 32/48/64 px trên hành trang/tooltip/shop. Số export khác số artwork gốc. |
| Trạng thái/phẩm chất | Đan Hạ/Trung/Thượng/Đan Văn, phôi/thành phẩm, mốc pháp bảo, chủ hồn/phẩm chất. | Chia rõ thay artwork và chỉ thay metadata/overlay. Khóa/số lượng/rarity không bắt vẽ lại bitmap từng tổ hợp. |
| Body/gear/FX nhân vật | Huyễn Tâm/Tịch Bạch × bốn họ; nội dung đã có và phần thiếu theo mốc. | Reuse V1/V2, giữ source đã pin; sáu món trang bị dùng icon/stat, không mặc định thêm sáu bộ quần áo động. |
| Điểm thu thập tương tác | Cây thuốc, mỏ hoặc điểm linh tài thực sự cần ở nội dung mới. | Phân biệt icon túi, prop thế giới, vùng tương tác và loot. Chỉ làm prop rời cần thiết; giữ owner map/navigation. |
| Lò/trận bàn/công cụ | Thành phần craft/đặt trận cần trình bày trong cảnh hoặc Nội Giới. | Rà đạo cụ bake và thư viện hiện có trước; không đặt trùng hub. Trận bàn chiến thuật cần thể hiện đúng phạm vi và lifecycle. |
| Feedback thu thập/craft | Nhặt đồ, tiêu nguyên liệu, hoàn thành rèn/đan, khảm/giải niêm. | Tận dụng FX/animation phù hợp; thêm tín hiệu còn thiếu. UI nhận kết quả server, không giả grant bằng animation. |

Hai identity dùng chung icon khi sở hữu cùng item có cùng hình; chỉ tách khi hình thái/item khác thật. Icon đọc theo chất liệu và silhouette từng nhóm, đặt trong UI Đạo Ấn; không biến mọi tài nguyên thành một dấu triện hoặc chỉ đổi màu để phân bậc.

## 5. Kiểm kê đã có trong repo

Kết quả Đợt A được lưu trong [bộ danh mục vật phẩm và nguyên liệu GDD 0.35](design/systems/item-material-catalog-gdd035-v1/README.md): [123 record item/state/currency](design/systems/item-material-catalog-gdd035-v1/items.json), [60 record asset và 82 file đã kiểm hash](design/systems/item-material-catalog-gdd035-v1/asset-inventory.json), [25 nguồn và 18 recipe/mẫu cấu trúc](design/systems/item-material-catalog-gdd035-v1/recipes-and-sources.json). Các số này là kiểm kê thiết kế/provenance; chưa phải số item release, drop table hoặc ngân sách artwork mới.

| Nguồn | Đã xác minh từ file | Cách sử dụng trong kế hoạch mới |
| --- | --- | --- |
| [Vân Ngọc gameplay v1](design/gameplay/van-ngoc-gameplay-assets-v1/README.md) | 11 trạng thái icon, xuất 32/48/64; ba đạo cụ; sáu công thức review. Manifest ghi ownerApproved/artApproved/runtimeConsumable false. | Rà hình dược thảo/nước/sợi/mực/ngọc/công cụ để tái dùng nếu hợp. Plan HN/EX và các recipe cũ là lịch sử, không tự thành recipe VG hoặc approval mới. |
| [Icon G2 hiện có](../client/public/assets/g2-items/) | 24 PNG: bốn pháp bảo, ba khuynh hướng, portrait NPC/Boss và biểu tượng tiến trình/vùng/hồn. | Là nguồn đối chiếu/candidate; phần lớn là icon hệ thống/portrait, không được tính thành 24 item nguyên liệu. Cần xem native và provenance trước khi chốt tái dùng. |
| [GDD character animation pack](design/characters/gdd-character-animation-v1/README.md) | Gói source animation mới theo GDD 14/10; runtimeReady=false cho tới khi có adapter. | Dùng làm nguồn tiếp nối cho bản test, không suy runtime approval từ QA. |
| [Roster sinh cảnh](design/world/van-hai-living-world-v1/plan.json) | 14 NPC, 8 quái thường, 3 tinh anh, 4 Boss; tám nguyên liệu của kế hoạch trước. | Dùng làm đầu vào nối nguồn–đích tiêu; không đồng nhất record trong plan với ART đã duyệt hoặc loot đang chạy. |

Trong lượt đề xuất này mới kiểm metadata, đường dẫn và tên file; chưa đánh giá lại mỹ thuật từng icon. Chưa có căn cứ để đưa ra số lượng artwork mới cuối cùng.

## 6. Thứ tự triển khai tổng thể

| Đợt | Phạm vi | Bàn giao cần có trước khi chuyển đợt |
| --- | --- | --- |
| A — Danh mục toàn game | Tám nhóm × năm cảnh giới; bốn pháp bảo/ba mốc; sáu ô; Tứ Nghệ; tiền tệ và quy tắc giao dịch. | Master catalog phân biệt: có GDD cụ thể / dự kiến / thiếu nguồn / thiếu recipe / có hình / cần hình. Chặng 1–2 phân rã chi tiết; Chặng 3–5 giữ khung và phần chưa chốt. |
| B — Nền hệ thống dùng xuyên chặng | Item stack/instance; lô Khóa/Không Khóa; nguồn–recipe–đầu ra; equip slot; tổng bậc tế luyện; giao diện và kết quả server. | Các kiểu dữ liệu và quy tắc không bị phụ thuộc tên HN cũ; kiểm tiêu–trao một lần, thiếu vật tư, reconnect và giữ giá trị qua đổi mốc/đồ. |
| C — Production Chặng 1 | Ngưng Khí VG01–VG06; tám nhóm có liên quan; pháp bảo Mốc I; các bộ phòng cụ; đan và chứng đạo vào Trúc Cơ. | Nhóm đầu VG01–VG02 chứng minh vòng nhặt–túi–rèn/đan–chiến đấu, sau đó hoàn tất tới VG06 và hai nhánh Trúc Cơ. Mỗi lượt chỉ gen phần thiếu đã có brief/đích tiêu. |
| D — Production Chặng 2 | Trúc Cơ VG07–VG11; vật tư Mốc II, chủ hồn, Ngũ Hành, Nội Giới/nghề, sách/phòng cụ, hộ pháp và đan vào Kết Đan. | Mở pháp bảo đúng thứ tự, nguồn vật tư trước cổng; solo hoàn tất, nguồn giao dịch/nguồn Khóa tách rõ. Dùng lại quái/tinh anh/Boss theo encounter mới phù hợp. |
| E — Mở rộng Chặng 3–5 | Kết Đan → Nguyên Anh → Hóa Thần, vật tư/đồ/đan/nhân duyên bậc cao và Mốc III. | Chốt content và recipe từng chặng trước production; duy trì họ hình, dữ liệu và cơ chế kế thừa. Chưa tự đặt thêm mã hồi sau VG11 hay số lượng Boss/recipe mà GDD chưa phân rã. |

Đợt A phải nhìn trọn GDD để tránh thiếu trang bị, cổ ấn, vật tư nghề hoặc tài nguyên Nội Giới. Đợt C/D là thứ tự sản xuất cụ thể; có thể triển khai dữ liệu và gói icon theo lượt mà không chờ toàn bộ asset cảnh giới cao hoàn thành.

## 7. Mỗi record trong master catalog phải trả lời được

| Trường | Nội dung |
| --- | --- |
| Định danh | ID ổn định, tên chuẩn, alias tên cũ, nhóm/subtype; stack hay instance. |
| Mốc mở | Cảnh giới/act/phase kiếm được sớm nhất; cảnh giới/mốc mà món phục vụ; điều kiện recipe. |
| Nguồn | Quái/encounter, thu thập, NPC/craft, Nội Giới, nhiệm vụ hoặc quỹ tuần; lặp hay một lần. |
| Đích tiêu | Recipe cụ thể, tế luyện, khảm, equip, giải độc, đột phá hoặc tín vật. Món chưa có đích tiêu mang trạng thái chờ thiết kế. |
| Khóa và giao dịch | Khóa/Không Khóa theo nguồn; đầu ra kế thừa khóa; recipe có cho giao dịch không. Không chỉ gắn một cờ trade chung cho mọi lô cùng item. |
| Kế thừa | Slot enhancement, refinementTotalRank, giữ khí linh/cổ ấn; điều kiện nâng mốc không đòi đồ từ hồi sau. |
| ART | Asset ID/nguồn/hash, kích thước xuất, reuse/candidate/missing, phạm vi duyệt; prop/pivot riêng khi có đối tượng trong cảnh. |
| Balance | Số lượng, drop, chi phí, trần theo kỳ và chỉ số có nhãn fixture/đã kiểm. Trường chưa chốt không biến thành số production mặc định. |

Các alias cần rà đầu tiên: Vân Nha/Nanh Sói; Mảnh Ngọc Giáp/Giáp Ngọc Trùng; Lõi Khôi Lỗi Rạn/Mảnh Khôi Lỗi. Nanh thường khác Ấn Ký Lang Vương; Mảnh Hắc Phù khác Giải Niêm; raw/refined của cùng instance khác hai item nhận mới. Không gộp bằng tên gần giống trước khi đối chiếu luật.

## 8. Điều kiện đủ cho một lượt production

Một lượt hoàn tất khi item có nguồn đến được trước cổng cần dùng, có đích tiêu thực, đủ hình/metadata cho UI và giao dịch/khóa đúng luật. Kiểm cả người mới/server mới/solo; replay hoặc reconnect không nhân đôi loot/craft. Chỉ tạo vật tư hiếm khi nguồn nội dung tương ứng đã xác định; ba chứng đạo và chủ hồn có danh tính không hợp thành 5:1.

Tỷ lệ rơi, chi phí, số giờ và pity còn là fixture hoặc thiếu định lượng; lập bảng và mô phỏng trước khi khóa. Phường Thị/cày–nạp tiếp nối nguồn–sink đã đo, không lấy việc có icon/thẻ tháng làm bằng chứng kinh tế đã cân bằng.

**Bàn giao ưu tiên ngay:** master catalog toàn GDD + bảng nguồn/recipe cho trọn VG01–VG11 + bảng tái sử dụng/thiếu ART; từ đó xuất brief production Chặng 1 và các lượt kiểm nhỏ. Đây là bước nền để sản xuất asset đúng nhu cầu, tận dụng dàn nhân vật/quái/Boss và mở rộng bằng cách bổ sung.
