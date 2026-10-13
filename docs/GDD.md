# GDD — Vân Hải Đạo Đồ

**Phiên bản 0.33 · 13/10/2026 · Thiết kế lại theo phản hồi chơi thử.**

**Tạo hình đối thủ 13/10/2026:** theo ưu tiên mới, [8 quái thường và 3 tinh anh Pixel01](design/characters/van-hai-monster-concepts-v1/README.md) có identity master và sân đối chiếu với Vương Lâm/map1×. Mỗi mẫu một neutral Đông Nam; raw/body/shadow/VFX tách, giữ morphology theo loài. Đợi duyệt hình trước bảy hướng còn lại và năm nhóm animation; chưa thay NPC/quái live, behavior, reward hoặc mở farm. Đây là sản xuất concept của roster đã đề xuất, không nâng phiên bản GDD hoặc suy duyệt bằng test.

**NPC/sinh cảnh 13/10/2026:** owner chọn [chốt dàn NPC và brief concept trước](VAN-HAI-LIVING-WORLD-PLAN.md). Gói đề xuất có14 NPC (bốn station giữ nguyên +mười vai mới), tám quái thường, ba tinh anh và bốn boss nối dấu niêm→ngoại vi→khảo nghiệm→cổ lâm. [Review](design/world/van-hai-living-world-v1/index.html) và catalog96record tách role runtime với danh tính/ART mới. Chưa đổi map, nhiệm vụ/thưởng, HP/MP, NPC global state hoặc mở Đọa Ma; số liệu/cơ chế mới theo prototype/gate riêng. Đây là phụ lục thiết kế, chưa nâng số phiên bản hoặc duyệt toàn bộ nội dung.

**Bản trải nghiệm 12/10/2026 theo phạm vi owner chọn:** đã tích hợp [Hằng Nhạc HN01–HN12 và nhánh EX01–EX04](HANG-NHAC-CHAPTER-RUNTIME.md), sáu công thức, save/proof/checkpoint server và bộ pixel Vương Lâm mới. Các đoạn “chưa mở runtime” trong ghi chú nghiên cứu 10–11/10 và [GDD 0.32 lưu lịch sử](GDD-v0.32-2026-10-11.md) ghi trạng thái lúc thiết kế; xem tài liệu bản trải nghiệm để biết phần đã triển khai và phần còn thử. Map ngoại vi/ART hai nhân vật còn lại/tăng chỉ số M03–M04 vẫn cần hoàn thiện, không suy duyệt toàn bộ GDD từ tích hợp.

> Đạo chưa có đường. Ta tự mở.

Người chơi bước vào thế giới tu tiên với năng lực có giới hạn, tự kiếm tài nguyên, học cách vận dụng, xây quan hệ và chọn con đường vượt bình cảnh. Sức mạnh mới phải giúp giải một vấn đề từng khó; mỗi chương để lại một món đồ, một khả năng hoặc một người còn nhớ việc mình đã làm.

Bản này thay định hướng nhiệm vụ và nhịp tu luyện của [GDD 0.32](GDD-v0.32-2026-10-11.md). Đây là **phương án thiết kế mới**, chưa thay gameplay đang chạy, chưa khóa balance hoặc duyệt ART. Các lựa chọn sản phẩm đã thống nhất vẫn giữ: MMORPG web, chiến đấu chủ động, bộ ba nhân vật từ đầu, Hằng Nhạc chung, phân hóa sâu từ Trúc Cơ, farm/build/PvE/PvP/sưu tập. Không quay lại hướng nhân vật đệ tử tự tạo.

## 1. Bộ tài liệu dùng để triển khai hướng mới

| Tài liệu | Sở hữu nội dung |
| --- | --- |
| [Thiết kế tu tiên và hành trình nhân vật](CULTIVATION-REDESIGN-2026-10-13.md) | Thuật ngữ, sức mạnh, công pháp/build, đại cảnh giới, cốt truyện, hệ MMO và thứ tự sản xuất |
| [Thiết kế lại Hằng Nhạc](HANG-NHAC-ONBOARDING-V2.md) | HN01–HN12/EX, HN04 thay thế, ngân sách tu vi, UX, tương thích save và tiêu chí chơi thử |
| [Dàn NPC, quái và boss Vân Hải](VAN-HAI-LIVING-WORLD-PLAN.md) | Kế hoạch owner: 14 NPC theo wave A/B, 15 encounter, 8 vật liệu và 3 map design; nguồn chính của roster, danh tính và brief concept |
| [NPC và sinh hoạt Hằng Nhạc](HANG-NHAC-NPC-LIFE-PLAN.md) | Phụ lục nối roster owner với bốn station hiện có, nơi dùng đế đối chứng và phản hồi theo chương; đề xuất sáu vai/sáu người nền cũ đã được thay thế |
| [Reference và bằng chứng](CULTIVATION-QUEST-REFERENCES-2026-10-13.md) | Nguồn truyện/game đã đọc, giới hạn bằng chứng, cơ chế học và cách chuyển hóa |
| [Bản runtime chương](HANG-NHAC-CHAPTER-RUNTIME.md) | Những gì đã chạy: HN01–HN12, M01–M04, EX01–EX04, sáu công thức, checkpoint |
| [Tự chọn nhiệm vụ và tìm đường](HANG-NHAC-QUEST-NAVIGATION.md) | Cải tiến UX đã làm trước đợt thiết kế này |

**Thứ tự ưu tiên:** GDD 0.33 và hai thiết kế mới sở hữu hành vi nhiệm vụ/tu luyện đề xuất. [Kế hoạch sinh cảnh owner](VAN-HAI-LIVING-WORLD-PLAN.md) và `design/world/van-hai-living-world-v1/plan.json` sở hữu roster, danh tính, brief và thứ tự sản xuất NPC/quái/boss; thay đề xuất sáu NPC/sáu người nền trước đó. Plan ghi basis 0.32 được giữ nguyên nguồn, không kéo lại vòng xác nhận HN04/từng tầng đã thay trong 0.33. Hồ sơ runtime/code sở hữu sự thật đang triển khai. Các spec ngày 08–12/10 giữ hợp đồng và lịch sử; câu “giữ HN04”, “xác nhận từng tầng”, “EX chỉ sau HN12” trong chúng không còn là yêu cầu của phương án mới. Thực thi cần phiên bản nội dung và migration, không sửa save thật để khớp thiết kế.

## 2. Vấn đề cần giải

| Quan sát từ bản thử/code | Quyết định thiết kế mới |
| --- | --- |
| Ngưng Khí, tích lũy, vận khí, tầng và M01–M04 xuất hiện cùng lúc nhưng tác dụng ít rõ | Chỉ hiện cảnh giới/tầng, thanh tu vi tới tầng kế và lợi ích sắp đạt; M01–M04 là thông tin nội bộ |
| HN02 bấm từng nhịp, trả lời câu hỏi rồi xác nhận; HN04 khởi động hai lần và quay NPC | Một lượt bài liền mạch; kiểm hiểu bằng hành động, hoàn tất/ghi thưởng tự động trong việc đã nhận |
| Có tu vi nhưng phải bấm xác nhận từng tầng | Tầng nhỏ tự ổn định khi đủ điều kiện; quyết định chủ động dành cho chọn build, tiêu tài nguyên và đại đột phá |
| Thiếu 600 tu vi trước tầng 9 và 1.620 trước tầng 15 theo tổng thưởng tối thiểu | Tuyến chính cung cấp đủ tiến trình qua hoạt động; không bắt chờ thổ nạp hoặc làm nhánh phụ để bù |
| Tầng tăng nhưng HP/MP vẫn 100, gear đầu không bonus, vai trò mốc chưa nhìn thấy | Làm bảng nguồn sức mạnh và tình huống kiểm trước/sau; chỉ bật tăng trưởng cùng encounter đã cân lại |
| Nhiều bước “tới điểm → E → quay về” và EX xuất hiện quá muộn | Cho thấy vấn đề trước, rồi lựa chọn chuẩn bị, hành động, hệ quả; mở nhánh khám phá từ giữa chương |

Chẩn đoán dựa trên bản checkout hiện hành, không coi mục tiêu thời lượng bên dưới là kết quả playtest đã đo.

## 3. Lời hứa trải nghiệm

1. **Có việc đáng làm ngay:** trong vài phút đầu đã điều khiển, dùng thuật và thấy một bất thường cần mình xử lý.
2. **Tu luyện có công dụng:** người chơi biết cần gì để tiến tiếp, được gì và sẽ dùng ở đâu.
3. **Mạnh lên bằng cả chuẩn bị và thao tác:** trang bị/công pháp mở lựa chọn; đọc đòn, giữ vị trí, dùng thời cơ vẫn quan trọng.
4. **Nhân vật có hành trình riêng:** điều đã làm và quyết định của mình được nhắc lại bằng tình huống, không chỉ câu chúc mừng.
5. **Nghịch thiên có giới hạn:** lúc yếu có thể giữ mục tiêu, thoát hoặc phá điều kiện của đối thủ; về sau trở lại đối đầu. Không mặc định thắng cao thủ bằng một nút.
6. **Chơi trực tiếp đủ tiến triển:** idle hỗ trợ người muốn nghỉ, không là cổng bắt buộc trong tuyến tân thủ.

Vòng chơi: **thấy trở ngại → chọn mục tiêu → chuẩn bị/build → chiến đấu hoặc khám phá → nhận thành quả → dùng sức mạnh mới → gặp lựa chọn/hệ quả tiếp theo**.

## 4. Những khái niệm người chơi cần hiểu

| Khái niệm | Nghĩa và công dụng |
| --- | --- |
| Cảnh giới / tầng | Mức năng lực đã đạt. Ngưng Khí có 15 tầng; các đại cảnh giới sau chia giai đoạn theo spec riêng |
| Tu vi | Tích lũy bền để tiến tầng; dùng thuật không trừ tu vi, tăng tầng không tiêu lại số tổng đã tích lũy |
| Linh lực / MP | Năng lượng thi triển trong trận; giảm và hồi theo luật combat |
| Vận khí / thổ nạp | Hành động vận hành/tu luyện. Không tạo một loại tiền “điểm vận khí” riêng |
| Công pháp | Nền đang vận hành, đổi ưu/nhược của build; không đồng nghĩa tầng hoặc một nút đánh |
| Lĩnh ngộ | Điều cụ thể đã trải qua và kiểm chứng, mở cách vận dụng; không thêm thanh EXP “đạo tâm” |
| Linh thạch, vật liệu | Dùng chuẩn bị/chế tác/giao dịch khi hệ tương ứng mở; mỗi nguồn phải có nơi tiêu rõ |

Không đồng nhất **vận khí** với **vận may/khí vận**. Bản đầu không thêm chỉ số may mắn ẩn chi phối đột phá hoặc phần thưởng bắt buộc.

## 5. Nhập môn và chương Hằng Nhạc

**Hướng dẫn HN01–HN05:** mục tiêu 15–20 phút chơi chủ động, tới tầng 3. HN04 thay bài hai lần né bằng “Qua trận dẫn khí”: một lượt 60–90 giây, đi bộ luôn qua được, Phong là lựa chọn đường ngắn. Không quay NPC giữa các đoạn.

**Phần còn lại HN06–HN12:** chương đầu có khám phá, chuẩn bị, nhân duyên và khảo nghiệm; mục tiêu tổng chương 60–90 phút ở lượt đầu thông thường. Giữ 15 tầng trong toàn chương, không nhồi thành 15 lần xác nhận của tutorial. Thời lượng là giả thuyết cần đo; nếu thiếu nội dung thú vị, thu gọn chương trước khi thêm kill/chờ.

Trục truyện sáng tạo **“Dấu sai trên vân lộ”** được phát triển thành việc liên quan trực tiếp tới cơ hội tu luyện của người chơi: mẫu vật bị hao khí, một người bị quy trách nhiệm, đường vật tư bị đình lại. Người chơi tìm ra điều kiện gây sai, tự chế công cụ và đưa ra cách xử lý. Chương kết thúc bằng tuyến được sửa, một lời hứa được đáp lại và mục tiêu xuất hành riêng; không chỉ đậu bài thi.

Hub Hằng Nhạc dùng sinh hoạt/chuẩn bị, ngoại vi dùng khám phá/chiến đấu, khảo nghiệm dùng phiên riêng. Giữ map owner, 9 blocker và ART hiện hành. Các cảnh mới cần thiết kế không gian riêng trước khi sản xuất, không tự đặt hazard lên hub.

**Bổ sung sau phản hồi map trống:** bốn NPC chức năng prototype chưa tạo thành một tông môn đang sống. [Kế hoạch owner](VAN-HAI-LIVING-WORLD-PLAN.md) có 14 NPC: Wave A gồm tám đầu mối và Kỷ An/Phùng Dã sinh hoạt, Wave B gồm bốn vai mở cùng nội dung tương ứng. Bốn station hiện hành giữ ID, mang danh tính đề xuất Trần Duy/Diệp Tĩnh/Tạ Kiếm Sơn/Tô Nhược. [Phụ lục Hằng Nhạc](HANG-NHAC-NPC-LIFE-PLAN.md) nối phản hồi theo chương và điểm dùng đế đối chứng cạnh khu chuẩn bị đông nam hoặc trong sân bài riêng; vị trí chân/collider chưa chốt. NPC có việc đang làm, không biến toàn bộ roster thành điểm nhận/trả. Thiết kế mới chưa xuất hiện trong game.

## 6. Sức mạnh và hệ thống mở dần

| Chặng | Thành quả phải chơi được | Hoạt động dùng thành quả |
| --- | --- | --- |
| Ngưng Khí 1–3 | Hiểu MP/tu vi, dùng bộ R01, cảm nhận tăng lực nhỏ | Trận đầu, vượt trận dẫn khí, chuyến ngoại vi |
| Ngưng Khí 4–9 | Một lựa chọn vận hành đổi được, ngọc hộ thân, biết chuẩn bị | Hai cách xử lý cùng chuyến đi, EX, đối thủ đọc được |
| Ngưng Khí 10–15 | Kết hợp công cụ/kỹ năng, giữ mục tiêu dưới áp lực | Chuyến thực địa nhiều tình huống, HN10 ba pha |
| Trúc Cơ | Công pháp phân hóa, cấu hình thuật/pháp khí có đánh đổi, nguồn farm mục tiêu | Bí cảnh nhỏ, tổ đội 2–3 người, tỷ thí tự nguyện |
| Kết Đan | Pháp bảo gắn bó lâu dài, chuyên môn nghề và build rõ | Boss nhóm, truyền thừa, hoạt động tông môn |
| Nguyên Anh | Năng lực thần thức/linh hồn được đặc tả riêng theo nhân vật | Bí cảnh nhiều lớp mục tiêu và đối thủ có điều kiện |
| Hóa Thần | Hành trình lĩnh ngộ, cách vận dụng ý cảnh; Đọa Ma là lựa chọn có hệ quả | Thử thách con đường, đối thủ ngang chặng, hoạt động nhóm cao |

Bộ ba có Kiếm/Lôi/Phong R01 từ đầu. HN03/HN04 dạy sử dụng, không cấp lại quyền. Hệ sau phải có nguồn, nơi dùng, tác dụng và giới hạn trước khi mở menu. R02–R05/ART đã có không tự trở thành gameplay.

## 7. Nhân vật và cốt truyện

- **Vương Lâm:** ít lợi thế ban đầu, quan sát, chịu đựng, thử nghiệm và giữ bí mật cơ duyên. Thiên Nghịch Châu có tuyến riêng, không là quà chung cho mọi người chơi.
- **Tư Đồ Nam:** đã có tri thức, bị giới hạn hiện diện/thi triển; tiến trình gameplay biểu thị hồi phục khả năng vận dụng. Không viết ông thành thiếu niên Ngưng Khí mất trí nhớ.
- **Lý Mộ Uyển:** có mục tiêu và lựa chọn độc lập; đan–trận/chuẩn bị phải giúp cô tự chiến đấu, cứu điều mình coi trọng và có quyền quyết định. Không chỉ là người cấp thuốc cho Vương Lâm.

Hằng Nhạc chung của ba người là chuyển thể game. Chương cá nhân theo hồ sơ không thay canon toàn server; nhiều người chọn cùng mẫu không sinh nhiều bản Thiên Nghịch Châu trong kinh tế chung. Nội dung mang nhãn **nguyên tác có nguồn / chuyển thể / sáng tạo mới**. Các arc cao chưa đủ nguồn chỉ ở mức brief, không bịa tình tiết rồi gán cho Tiên Nghịch.

## 8. MMORPG có trọng tâm

Giữ mục tiêu farm đồ/build, PvE/PvP, sưu tập và thể hiện nhân vật. Thứ tự mở: một vòng farm có đích dùng → bí cảnh nhóm nhỏ → tỷ thí → tông môn/kinh tế. Solo vẫn có đường tới năng lực nền. Chợ, open PK, bang chiến và hàng chục tiền tệ chưa cần cho chương đầu.

Loot cá nhân theo đóng góp hợp lệ, không tranh last-hit của tutorial. Đồ thiết yếu có đường chắc chắn; đồ hiếm mở lựa chọn/sưu tập và có tiến độ bảo đảm khi thiết kế nguồn lặp. Thành tựu, áo, hình pháp bảo/tọa kỵ là dấu hành trình; không mặc định mỗi ngoại hình cộng chỉ số.

Nhân duyên mở bằng một người nhớ một quyết định, kỳ ngộ bằng một chuỗi có điều kiện, tông môn bằng một công việc cộng tác. Mở rộng sau khi chúng tạo trải nghiệm tốt, không mô phỏng cả xã hội ngay.

## 9. UX, sản xuất và kiểm chứng

Tự chuyển mục tiêu sau kết quả đã lưu; **bấm mục tiêu để tìm đường**, di chuyển tay để hủy. Không tự chiến đấu, chọn truyện, tiêu nguyên liệu hoặc đại đột phá. Trong việc đã nhận, bước kế và thưởng chắc chắn nối tự động; không thêm nút “đồng ý đã hoàn thành”. Chỉ quay NPC khi có đối thoại, lựa chọn hoặc kết quả đáng xem.

Phân kỳ: **P0 rõ tiến trình/giảm thao tác → P1 HN04 và mạch HN mới → P2 sức mạnh/build/nguồn farm → P3 Trúc Cơ và xã hội nhỏ → P4 cảnh giới sau**. Không triển khai toàn bộ GDD một lần. P0/P1 bảo toàn save/receipt và không thay owner map; chi tiết nghiệm thu/migration trong bản Hằng Nhạc v2.

Đây là phân kỳ gameplay. `productionWaves` P0–P3 trong kế hoạch sinh cảnh là các đợt sản xuất dàn nhân vật/đối thủ riêng; áp ưu tiên owner mới nhất quái/tinh anh trước NPC/boss, không suy hai bảng cùng mã là cùng phạm vi thực hiện.

Kiểm cảm giác với 5 lượt người mới: ít nhất 4 người phân biệt được tu vi và MP, biết mục tiêu tiếp mà không hỏi; không có chờ idle bắt buộc; ít nhất 4 người nêu được một lợi ích mới và một hệ quả của lựa chọn. Dữ liệu thời gian/menu/retry hỗ trợ quan sát, không thay phản hồi. Bản hiện tại chưa đạt các tiêu chí này chỉ vì test kỹ thuật đã qua.

Hợp đồng kỹ thuật tiếp tục theo [kiến trúc](ARCHITECTURE.md), [nhân vật](CHARACTER-SYSTEM.md), [nhiệm vụ](QUEST-SYSTEM.md), [nội dung](GAME-CONTENT-CONTROL-PLAN.md) và [MMORPG](MMORPG-SYSTEM-CONTRACTS.md). Runtime, balance và duyệt hình là ba kết quả riêng. Mọi thay đổi tương lai kiểm trên fixture; không reset DB/map/draft của owner.
