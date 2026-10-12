# Kế hoạch nội dung RPG — nhiệm vụ, phát triển nhân vật, đồ, thuật và pháp bảo

**Bản 0.2 · 11/10/2026 · đề xuất để đánh giá, chưa triển khai.** Bổ sung lớp thiết kế trải nghiệm còn thiếu giữa GDD và hợp đồng kỹ thuật. Căn cứ [nghiên cứu có nguồn](XIANXIA-GAME-RESEARCH.md), [hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md), [nhân vật](CHARACTER-SYSTEM.md), [nhiệm vụ](QUEST-SYSTEM.md). Không tạo một bảng stat/tu vi thay thế song song; số thử vẫn ở [hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md), chỉ cập nhật khi chọn phương án.

**Trọng tâm MMORPG 11/10:** owner muốn mạnh/yếu, farm đồ để mạnh, PvE/PvP và khoe nhân vật qua thời trang/tọa kỵ/pháp bảo. [Kế hoạch xuyên chặng](MMORPG-PROGRESSION-PLAN.md) là ma trận dài hạn cho phần này; Đạo đồ/truyện/luyện chế hỗ trợ động lực, nguồn đồ và hệ quả của vòng chơi. Mỗi chặng cần trả lời cả ba: **mạnh hơn bằng gì → dùng sức mạnh ở đâu → thành quả nào nhìn thấy được**. Phạm vi cân bằng/policy/ART cụ thể vẫn là đề xuất.

**Đợt chi tiết tiếp theo đã bắt đầu theo yêu cầu owner:** [Chương Hằng Nhạc phương án A](HANG-NHAC-CHAPTER-PLAN.md) cụ thể hóa ND1–ND2 bằng đồ thị/cổng, thẻ HN05–HN12, nhánh bộ ba, lựa chọn báo cáo và storyboard; [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) cụ thể hóa ND3 và phần ND4. Đây là bản làm việc để đánh giá, không xác nhận duyệt mọi luật/thoại/cân bằng hoặc triển khai runtime.

**Lớp nguồn–recipe–sản xuất đã cụ thể hóa:** [nghiên cứu Tiên Nghịch/reference đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md) → [thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md) → [gói VP0–VP4 và IT01–IT12](ITEM-PRODUCTION-PLAN.md). Catalog sau HN12 có 5 nguyên liệu, mực và 2 công cụ; HN vẫn giữ phạm vi nhỏ. Số liệu recipe mới là đề xuất kiểm kế hoạch, không bảng cân bằng production hoặc chi tiết canon.

## 1. Kết luận kế hoạch

Không nên bắt đầu bằng “cần bao nhiêu skill/đồ/quest”. Bắt đầu bằng **người chơi đang gặp vấn đề gì, có lựa chọn nào, hệ thống nào cần xuất hiện để lựa chọn có nghĩa**.

Thứ tự thiết kế trong RM0:

**Động lực và xung đột → đường đi người chơi → thành quả mỗi chặng → nguồn/công dụng đồ và năng lực → luật online/save → UI/ART → một vòng chơi để kiểm.**

Hợp đồng nhân vật/quest v0.1 đã có là nền kỹ thuật, chưa thay storyboard hoặc catalog nội dung. Tất cả ý tưởng mới có nhãn; không sửa HN01–HN04 đã hoàn tất để người cũ làm lại.

## 2. Ma trận tiến trình mở dần

| Chặng | Câu hỏi người chơi | Hành động cốt lõi | Thành quả có nghĩa | Nội dung thêm tối thiểu | Chưa mở |
| --- | --- | --- | --- | --- | --- |
| HN01–HN02 / M01 | Tôi là ai, làm gì, tu vi khác MP thế nào? | Tương tác, vòng vận khí, xác nhận | Nền và hoạt động tích lũy | Dùng runtime, chỉ biên tập dẫn truyện nếu duyệt | Nghề, cây build, RNG căn cốt |
| HN03–HN04 | Dùng công cụ và tránh đòn thế nào? | Định hướng/target/đánh thường/đi bộ/Phong | Kỹ năng điều khiển của người chơi | Giữ bài an toàn và thưởng cũ | Cấp lại R01, thêm hit/miễn nhiễm |
| HN05 / M02 | Ngoài sân luyện tôi tự lo được không? | Đi/về, một trận E01, mang kết quả | Quyền bước tiếp, vật liệu có đích dùng | Ngoại vi nhỏ, E01, nguồn thưởng, một dấu gợi mở tùy duyệt | Full loot table, nhiều phe, party bắt buộc |
| HN06–HN07 | Vì sao biết hoặc có đủ vẫn chưa vận dụng được? | Quan sát/chuẩn bị riêng, kiểm chứng | Một kết luận có tác dụng mở nền | 3 biến thể ngắn trên bài chung; một entry Đạo đồ nếu chọn | Ba nghề/cây skill hoàn chỉnh |
| HN08 | Món này làm được gì, vì sao chưa dùng được? | Nhận biết → luyện hóa → trang bị/thử | Một công cụ phòng thủ có đánh đổi | Một phôi→một pháp khí; tiêu hao xác định | RNG phá đồ, cường hóa vô hạn |
| HN09 / M03 | Tôi phối hợp và chọn lúc dùng được chưa? | Bài tích hợp, xác nhận | Nền đoạn cuối, chuẩn bị HN10 | Một hồi đáp nhánh truyện nếu đã chọn | Yêu cầu combo tối ưu/điểm ẩn |
| HN10–HN12 / M04 | Đã sẵn sàng đi tiếp chưa? | Khảo nghiệm, tổng kết, chủ động xuất hành | Chốt nhập môn và mục tiêu riêng | E02/E03, phiên/checkpoint, 3 lời dẫn tiếp | Qua cổng tự Trúc Cơ/R02 |
| Pilot sau nền RM2 đủ / RM5-A/B/C | Farm để làm gì, build có hơn trước không, người khác thấy gì? | PvE lặp/kiếm vật liệu → một nơi tiêu → thử sức/tỷ thí tự nguyện → mặc phần thưởng | Tăng trưởng có đích dùng, một nguồn ngoại hình kiếm được | Chọn từng pilot theo gate ledger/damage peer/appearance; có thể cùng RM3–RM4 | Không điều kiện bắt buộc của HN05; chưa toàn chợ/party/bang chiến |
| Sau map / RM6 | Tôi muốn vận dụng theo cách nào? | Thử tổ hợp, chọn/đổi, làm tuyến riêng | Khác biệt hành động và chuẩn bị | Hai lựa chọn thử cho một nhánh trước rồi mở bộ ba | Mọi cảnh giới/mọi build cùng lúc |

**Nhịp chơi:** 15 tầng là dữ kiện/khung nguồn, không phải 15 nhiệm vụ bắt buộc hoặc 15 lần bấm menu. Bảng 1/3/9/15 và tốc độ tích lũy là giả thuyết; cần đo phần chờ từ HN09 tới HN10. Khuyến nghị dùng “chương Hằng Nhạc” gồm nhiều không gian hiện có/dự kiến, không nhồi toàn bộ vào sân môn phái. Thay số liệu/mốc cần D11, không tự triển khai trong nghiên cứu.

**Mẫu thẻ hoạt động lặp/PvP/sưu tập:** ngoài thẻ quest dưới đây, ghi eligibility, combat ruleset, cycle/nguồn grant, credit/loot, nơi tiêu/nâng sức mạnh, reward diện mạo, fail/drop/restart và tiêu chí trước/sau. Hoạt động lặp không reset câu chuyện/cơ duyên hoặc thưởng HN đã ghi; một callback truyện không thay cho nội dung farm có nhịp chơi và nơi dùng đồ thật.

## 3. Bộ quy tắc xây nhiệm vụ

Một nhiệm vụ mới cần một thẻ nội dung:

1. **Động lực:** ai cần việc gì, người chơi có lợi ích/rủi ro gì ngoài EXP?
2. **Kiến thức trước:** người chơi đã được dạy công cụ nào, thiếu thông tin gì có chủ ý?
3. **Hành động:** động từ thực tế — quan sát, đối chứng, định vị, chiến đấu, chuẩn bị, luyện hóa, báo cáo.
4. **Lựa chọn:** có thật sự thay cách làm/hệ quả hay chỉ hai câu thoại? Nếu không có lựa chọn có nghĩa thì không giả có.
5. **Bằng chứng:** server ghi fact gì, đúng phase/owner/attempt nào? Nguồn retroactive được cho phép hay không?
6. **Kết quả:** quyền/tri thức/quan hệ/đồ/tích lũy nào đổi; receipt, fail/retry, overflow và content version ra sao?
7. **Chi phí sản xuất:** map/AI/animation/UI/thoại mới hay dùng lại; bao nhiêu kết quả cần viết/test?
8. **Chơi thử:** người chơi giải thích được điều gì sau khi làm; ghi vấn đề, không chỉ đếm test pass.

### Danh mục nhiệm vụ nên có nhưng không mở tất cả ngay

| Loại | Ví dụ thiết kế | Thưởng phù hợp | Chặng |
| --- | --- | --- | --- |
| Bài nền | HN03/04 | Credit/hiểu thao tác, thưởng đầu đã có | Giữ |
| Vận dụng ngoài sân | HN05 | Kết quả nhiệm vụ và vật liệu đầu | RM2 |
| Điều tra nhỏ | Dấu niêm/lời kể/mẫu vật | Đầu mối/ký ức, không mặc định cộng tu vi mới | RM3 nếu D10 chọn |
| Cơ duyên cá nhân | Tìm nguồn tri thức đúng avatar | Quyền tiếp cận, không mặc định thần khí | RM3 nhẹ, RM6 sâu |
| Công cụ/pháp khí | HN08 | Một instance đã luyện hóa và cách dùng | RM3 |
| Khảo nghiệm | HN10 | Kết quả/mốc, không thêm kill reward | RM4 |
| Ủy thác lặp | Thu vật liệu hoặc giữ tuyến đã mở | Vật tư theo nguồn–chi, không replay thưởng truyện | RM5 |
| Hợp tác | Mỗi người giữ một phần công việc chung | Credit cá nhân đủ điều kiện; không last-hit | RM5 |

Không biến mọi việc thành giao vật phẩm giữa NPC. Nhiệm vụ tuyến chính cần đường solo/nguồn thay thế, nhánh tùy chọn không giấu item bắt buộc để vượt bình cảnh.

## 4. Đồ đạc: mỗi loại có một vai trò

| Loại | Vai trò / nguồn | Dùng/tiêu ở đâu | Binding và giới hạn đề xuất |
| --- | --- | --- | --- |
| Gear nền | Kiếm/áo nhập môn đã có, về sau đồ từ nội dung/crafting | Trang bị tạo nền, bonus chỉ khi đã chốt | Pilot không bonus; không thêm durability/cường hóa để tạo sink giả |
| Vật tư hồi phục | Nhiệm vụ hiện có; nguồn lặp sau này | Ngoài combat theo luật server | Một nguồn `sect.supplies` tới khi có migration; chưa giao dịch |
| Nguyên liệu luyện hóa nhiệm vụ | HN05/HN06 theo bảng thử | Công thức HN08 | Giữ riêng theo hồ sơ, không bán/tiêu vào việc khác trước khi hoàn thành |
| Nguyên liệu thường | Điểm thu hoạch được phép/ủy thác sau này | Đan, phù, vật dụng theo recipe đã có | Không sinh món vô dụng trước khi có nơi tiêu; trade riêng ở RM5 |
| Phôi pháp khí | Nguồn cấp rõ trong HN08 | Biến thành cùng món đã luyện hóa | Không giữ phôi bán được và nhận thêm món thưởng lần hai |
| Công thức/phương pháp | NPC, trải nghiệm, trao đổi có điều kiện | Mở quyền chế tác/vận hành | Quyền đã học khác cuốn vật phẩm; không nhân học/reward khi replay |
| Chứng từ/tín vật | Nguồn quest có tác giả/ngữ cảnh | Đọc/đối chứng/quyền truyện | Nếu chỉ là fact thì ghi J, không bắt chiếm slot túi |
| Pháp bảo vận dụng | Tuyến nội dung/crafting được duyệt | Kích hoạt/công cụ theo điều kiện | Không mọi đồ tốt đều là pháp bảo; không cấp châu canon chung |
| Tiền trao đổi | Chỉ khi có kinh tế lặp và nơi tiêu | Dịch vụ/chợ với giá/quy tắc rõ | Chưa thêm linh thạch vào HN05 chỉ để giống MMO |

### Sổ vật phẩm tối thiểu trước RM2/RM3

Giữ 2 gear + vật tư hiện tại. Đề xuất chỉ bổ sung **một loại nguyên liệu nhiệm vụ**, rồi **một phôi/một pháp khí** ở HN08. Dấu niêm là bản ghi nhiệm vụ nếu không cần di chuyển/tiêu hao như item. Không tự dùng 12 icon fixture làm 12 món thật.

Bảng mỗi item cần: ID ổn định, nguồn/quest, công dụng, stack/instance, số lượng và quy tắc đầy túi, được chuyển/bán hay không, bảo vệ, cách phục hồi khi mất, receipt cấp/tiêu, ART/status. Bỏ qua capacity ở lát đầu cũng phải ghi rõ là quyết định phạm vi, không để hành vi undefined.

Nếu giữ ngân sách thử: HN05 + HN06 cho 6 nguyên liệu, HN08 dùng 4, còn 2. **Hai món còn lại chưa có công dụng** là khoản nợ thiết kế cần giải: cho giữ với mô tả rõ chờ nội dung, gán nơi tiêu có ích sau, hoặc điều chỉnh số lượng trước phát hành. Không tự đổi thành tiền hoặc thêm recipe giả. Tổng thưởng tu vi 1.380 hiện hành không tự cộng thêm vì viết nhánh truyện mới.

## 5. Công pháp, thuật pháp và build

### Vai trò riêng

- **Công pháp:** thay cách tích lũy/vận hành/chuẩn bị, có nền và giới hạn. Không phải danh sách skill đổi tên.
- **Thuật:** hành động có targeting, timing, chi phí, tác dụng và cách đối phó.
- **Lĩnh ngộ:** bằng chứng hiểu một quan hệ cụ thể, mở quyền/cách vận dụng đúng ngữ cảnh.
- **Trang bị/pháp bảo:** nguồn nền hoặc công cụ bổ sung; không chồng tất cả thành cùng một % damage.

### Phạm vi đề xuất

1. Trong Hằng Nhạc giữ ba R01 và đòn thường. HN03/04 không cấp lại, HN07 không tước quyền.
2. Nền 1–3/4–9/10–15 là mức vận hành, không ba công pháp trang bị cùng lúc.
3. HN08 chỉ thêm một công cụ; phím/slot cần thiết kế trước nối HUD. Không tự dùng bảy ô trống để hứa bảy skill.
4. Sau HN12 thử **một nền công pháp đang vận dụng và một lựa chọn cách dùng có thể đổi ngoài combat**, nếu được chọn. Đây là đề xuất slot/loadout, chưa là luật đã duyệt.
5. Lựa chọn mới phải có tình huống tốt/xấu và trả giá; không cho học thêm nghĩa là cộng vĩnh viễn mọi bonus. Đổi cấu hình không reset cooldown/hồi đầy hoặc né chi phí cũ.

### Ba cặp hướng thử sau nhập môn — không đặt tên canon mới

| Avatar | Hướng A | Hướng B | Bài kiểm chứng / tránh |
| --- | --- | --- | --- |
| Vương Lâm | Quan sát và chốt một cửa sổ ra tay, đổi sự linh hoạt lấy hiệu quả khi chọn đúng lúc | Giữ khoảng cách, áp lực đều nhưng không bùng mạnh | Đối thủ di chuyển so với đối thủ có recovery; không ngầm đổi R01 cũ thành xuyên/homing |
| Tư Đồ Nam | Bộc lộ một khoảng năng lực ngắn rồi cần ổn định lại | Hiện diện bền, ít đỉnh sức mạnh hơn | Trận nhịp ngắn/dài; không bất tử, không hồi phục vô hạn |
| Lý Mộ Uyển | Chuẩn bị một vùng có lợi, bị hạn chế khi phải đổi vị trí liên tục | Công cụ mang theo linh hoạt, hiệu lực nhỏ hơn vùng chuẩn bị | Tình huống cơ động/giữ vị trí; luôn có đường solo, không class chỉ hồi máu |

Đây là **các bài toán lựa chọn**, chưa phải sáu skill đã được đặt hiệu lực. Chỉ thiết kế chi tiết một cặp trước, kiểm hành vi mới có thực sự khác rồi mới nhân phạm vi. Không chép R02–R05 từ ART thành lời giải có sẵn.

### Hồ sơ một năng lực trước code

Nguồn/nhãn sáng tạo, vai trò, mốc học, đối tượng, tầm/đường nhìn, chi phí/cooldown, windup–release–recovery, cancel, hit/expiry, tương tác status/gear, counterplay, điều kiện đổi cấu hình, quyền PvE/PvP, server fact, presentation binding, missing assets, trường hợp test. Mọi biến thể thêm hit/AoE/immune phải có hợp đồng mới; không chỉ sửa metadata FX.

## 6. Pháp khí/pháp bảo: tiến trình dùng được, không kho sưu tập

| Giai đoạn món đồ | Người chơi làm gì | Sản phẩm hệ thống |
| --- | --- | --- |
| Biết tới | Nghe nguồn/tìm dấu, biết món giải quyết việc gì | Thông tin không đồng nghĩa sở hữu |
| Nhận/sở hữu | Hoàn thành nguồn hợp lệ | Một instance có owner/provenance |
| Nhận biết | Hiểu tác dụng, giới hạn và nguyên liệu cần | View cho biết thiếu gì, không giấu rủi ro |
| Luyện hóa | Xác nhận recipe/tiêu hao, hoàn thành bước theo luật | Chuyển trạng thái một lần, không RNG phá đồ tutorial |
| Vận dụng | Trang bị/kích hoạt ở tình huống hợp lệ | Hiệu lực gameplay có authority, không dựa animation |
| Điều chỉnh/nuôi dưỡng | Chọn hướng có đánh đổi sau nội dung tương ứng | Chỉ làm khi có lựa chọn thật, không tăng cấp vô tận |

**Món thứ nhất:** Ngọc hộ thân luyện tập (tên làm việc đã có trong hồ sơ). Học thời điểm phòng thủ, không thay né, không chặn cả chuỗi. Số MP/cooldown/phần trăm cũ là ứng viên cần chơi thử, không khóa bằng tài liệu mới.

**Ứng viên tiếp:** Định Lưu Bàn trong hồ sơ sáng tạo — công cụ đọc một dấu/vùng được thiết kế. Để sau HN08 hoặc RM6; không cần xây để hoàn thành HN05. Pháp bảo khám phá và pháp bảo combat có thể dùng cơ chế khác, không ép cả hai cùng cooldown/rarity.

**Bản mệnh/khí linh:** nghiên cứu học từ S02/S04, chưa đưa vào nhập môn. Trước làm cần trả lời vì sao gắn bó với một món, thay đổi lựa chọn gì, cách sửa hướng, ngân sách truyện/ART và giới hạn PvP. Không biến nội dung này thành gacha mặc định.

## 7. Nghề, môi trường và kinh tế

### Thứ tự mở đề xuất

**Nguồn nguyên liệu → một công thức cố định → tác dụng thật → đường nhận lại hợp lệ → nhiều công thức có lựa chọn → giao dịch khi ledger/anti-abuse sẵn sàng.**

- Luyện đan: khởi đầu từ công cụ chuẩn bị, không buff bắt buộc để chơi main quest. Lý Mộ Uyển có cách nhận biết/chọn tốt hơn ở tuyến riêng, không độc quyền vật tư hồi phục của cả server.
- Luyện khí: khởi đầu HN08 một phôi; vật liệu có tag tương thích sau, không random affix/cường hóa liên tiếp ngay.
- Trận pháp: ban đầu một tình huống giới hạn, không xây hệ đặt công trình toàn world.
- Động phủ/trồng trọt: giữ nghiên cứu dài hạn; cần vòng sản xuất và tiêu thụ trước tính timer offline.
- Tông môn: nơi quan hệ/nội dung trước, không tự tương đương bang hội người chơi. Đăng ký hội, đóng góp, chiến tranh cần thiết kế riêng.

### Nguồn–chi phải kiểm trước mở lặp

| Nguồn | Chỗ dùng | Rủi ro cần kiểm |
| --- | --- | --- |
| Thưởng truyện lần đầu | Chuẩn bị/bài tiếp, quyền mở nội dung | Nhân thưởng qua request/version/đổi nhân vật |
| Vật tư phiên luyện | Chỉ trong phiên, thu hồi theo luật | Mang ra bán hoặc chuyển thành đồ tài khoản |
| Thu thập/ủy thác lặp tương lai | Recipe/dịch vụ có giá trị | Bot, tồn kho tăng mãi, farm bắt buộc |
| Dịch vụ mua/đổi tương lai | Tiêu tiền/tài nguyên đúng nhu cầu | Vòng mua–bán lời vô hạn, mất item bắt buộc |
| Trao đổi người chơi tương lai | Nhu cầu khác nhau, luật binding | Duplication, RMT/abuse, lừa UI, nguồn đồ không rõ |

Không có nhu cầu tiêu thì chưa nên sinh tiền/material lặp. Không dùng timer/daily bắt buộc để kéo dài nhập môn. Chưa thiết kế monetization trong đợt này; tránh lợi thế trả phí làm vô nghĩa lựa chọn/chuẩn bị.

## 8. Thế giới online: ý nghĩa của gặp người khác

Ba lớp nội dung đề xuất:

1. **Nơi chung:** gặp nhau, quan sát cách vận dụng, NPC có dịch vụ không tranh lượt. Không spoil lựa chọn/cơ duyên của người khác.
2. **Tuyến cá nhân:** bài bắt buộc, quest proof, lựa chọn và milestone riêng. Không bắt có một avatar khác mới hoàn thành.
3. **Hoạt động hợp tác tự nguyện:** mỗi người giải một phần mục tiêu chung, có đóng góp thay vì chỉ damage; main quest vẫn có đường riêng.

Ví dụ RM5: khôi phục một điểm tiếp ứng — một người giữ nguy hiểm tránh xa, một người mang vật tư, một người kiểm/khởi động thiết bị. Đây là **vai trong hoạt động**, không khóa theo Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển. Nhóm nhỏ có thể làm tuần tự, nhóm đủ người làm đồng thời nếu luật cho phép. Chưa chốt kích thước party hoặc thưởng.

Phải thiết kế: cùng/khác chương, ai khởi động, late join, AI target/leash, support credit, người AFK, chia đồ, disconnect, bỏ phiên, giới hạn lặp. Một người chọn đáp án không bỏ phiếu quyết đời nhân vật của cả nhóm. Dữ liệu truyện cá nhân, phiên hoạt động và trạng thái world tách nhau.

## 9. Những hệ khác: phải thấy vị trí nhưng chưa sản xuất tất cả

| Hệ | Giá trị kỳ vọng | Chặng / điều kiện mở |
| --- | --- | --- |
| Sổ tri thức/Đạo đồ | Hiểu năng lực và nguyên nhân bình cảnh | Thử một entry ở RM3, tái dùng C/J |
| Quan hệ/nhân duyên | Hậu quả lựa chọn và đầu mối tiếp | Một quan hệ ở RM3 nếu chọn D10; mở rộng RM6 |
| Ngũ hành/status | Tạo counterplay và tổ hợp | Sau baseline combat, một quan hệ để thử; không năm bảng resist ngay |
| Thân pháp/khám phá | Đường đi và cách tiếp cận mới | Năng lực phải đi cùng nội dung thật, không xuyên blocker owner |
| Offline | Hỗ trợ tích lũy đã chọn | Chốt cap/clock/gate/anti-double-count, không offline combat |
| Chat/bạn bè/tổ đội | Gặp người khác có ích | Từng phần RM5, kèm moderation/block/report khi mở public |
| PvP | So cách vận dụng công bằng | Hồ sơ riêng về ghép mốc, consent và counterplay; không gank tutorial |
| Bang hội/công trình/sự kiện world | Mục tiêu tập thể dài hạn | Sau nhóm và kinh tế ổn, ownership/cap/season riêng |
| Linh thú/tọa kỵ/khí linh | Đồng hành hoặc cách di chuyển/công cụ mới | Chỉ khi có vai gameplay và ART đủ; chưa nhập môn |
| Tuổi thọ/tâm ma/thiên kiếp | Áp lực và ý nghĩa vượt mốc | Cần quyết định sản phẩm riêng, không bê tử vong/lịch single-player sang MMO |
| Audio/readability/accessibility | Nhận biết lock/resolve/đồ/lỗi mà không chỉ màu | Theo từng vòng gameplay, không đợi cuối roadmap |
| Account/ops/abuse | Giữ dữ liệu và môi trường chơi | Nhánh vận hành trước public, không bị bỏ quên vì thêm content |

## 10. Các gói thiết kế cần hoàn thành trong RM0

Các mã ND dưới đây là gói biên tập, không milestone gameplay hoặc chặng code mới.

| Gói | Đầu ra hữu hạn | Phụ thuộc | Tiêu chí đủ cho triển khai |
| --- | --- | --- | --- |
| **ND1 — Trục truyện và nguồn** | Một trang định vị, ranh giới nguyên tác/chuyển thể, động cơ bộ ba/NPC, mở–giữa–kết chương | D09; bản sáng tạo hiện là ứng viên | Người đọc hiểu vì sao chơi tiếp; từng tên/sự kiện có nhãn nguồn |
| **ND2 — Đồ thị hành trình** | HN05–HN12, cổng M02–M04, nhánh tùy chọn, chỗ mở từng hệ, bản ghi nguồn–thưởng | ND1 + D03/D07/D08/D11 | Không vòng khóa, không thiếu vật liệu/đường solo, không main quest cần random drop |
| **ND3 — Catalog đầu** | Gear/vật tư giữ; nguyên liệu, phôi, pháp khí, phương pháp và một recipe với nguồn–chi/ownership | ND2 + D02 | Mỗi món có nơi nhận/dùng, receipt/migration, chỗ UI, không item chỉ để lấp icon |
| **ND4 — Vận dụng và khác biệt** | R01 bảo toàn, E01 dùng tốc độ thật, một bình cảnh mẫu mỗi avatar; một cặp build hậu nhập môn trên giấy | ND2 + D03/D06/D07 | Đánh đổi/counterplay rõ, chưa tự thêm skill cao hoặc stat |
| **ND5 — Thế giới và hệ quả** | Phạm vi riêng/chung, một callback nhân duyên nếu chọn, rules party khác tiến độ ở mức thiết kế | ND1 + D04/D05/D10/D12 | Không spoil/chiếm tiến trình peer; một lựa chọn không sửa toàn realm |
| **ND6 — Storyboard và lát kiểm** | Đi qua HN05, sơ đồ HN06–HN08, trạng thái lỗi/thua/retry, ngân sách asset và các câu hỏi chơi thử | ND2–ND5 phần liên quan | Có thể chỉ ra action/snapshot/asset cần code; không dùng UI fake che chỗ luật chưa có |

ND1–ND3 hiện đã có **bản chi tiết làm việc** ở hồ sơ chương/catalog: đồ thị HN05–HN12, nguồn–chi và vòng phôi→pháp khí. ND4 có bình cảnh mẫu/contract hộ thân; ND5 chỉ một lựa chọn 2 nhánh; ND6 có storyboard HN05 trên giấy, chưa prototype. Không báo các gói đã duyệt hoặc mọi câu hỏi kỹ thuật đã chốt. Để bắt RM1/RM2 không cần ND4/ND5 làm hết arc: chỉ chốt phần đụng HN05, nguồn vật liệu HN08 và khả năng mở rộng. Dành phần sâu cho RM3/RM6, tránh dùng “cần thiết kế hết” làm lý do không có vòng chơi.

## 11. Trình tự xây sau khi chọn thiết kế

- **RM0:** ND1 → ND2; ND3/ND4 chạy theo cùng graph; ND5 chốt scope; ND6 đối chiếu. D01–D08 kỹ thuật/cân bằng vẫn phải giải, không bị câu chuyện thay thế.
- **RM1:** contract/adapter/item/reward vừa đủ cho slice đã chọn. Không engine mọi loại quest trước nội dung.
- **RM2:** HN05/E01/ngoại vi đi–về, một manh mối nếu duyệt, no heavy branching. Chơi từ HN01 đến đây trên save fixture mới và kiểm save cũ.
- **RM3:** một chuỗi HN06–HN08 có câu chuyện + bình cảnh + món đồ thật; kiểm Đạo đồ/nhân duyên nhỏ nếu duyệt. HN09 nối kết quả.
- **RM4:** HN10–HN12 nghiệm thu chương, không thêm power từ callback truyện làm boss mất nghĩa.
- **RM5/RM6:** mở rộng hợp tác/nguồn đồ và phân hóa theo nhu cầu thực, không cần hoàn tất mọi tiện ích MMO trước tuyến riêng.

## 12. Đánh giá: không chỉ “đã có nút và test qua”

| Câu hỏi | Cách thu bằng chứng sau này | Quyết định nếu không đạt |
| --- | --- | --- |
| Người chơi biết vì sao nhận quest? | Nhờ họ kể lại mục tiêu bằng lời sau đoạn đầu | Sửa động lực/text/route, không thêm reward để che |
| Công cụ mới đổi cách làm gì? | Quan sát hai tình huống có/không dùng, không bắt dùng để được pass | Bỏ món dư hoặc đổi tác dụng/encounter |
| Bình cảnh được hiểu hay chỉ chờ? | Ghi hành động tìm điều kiện, thời gian chơi/chờ, lời giải thích | Sửa nhịp/cổng/nội dung chủ động |
| Lựa chọn có hậu quả thấy được? | Xem người chơi có nhận ra callback và liên hệ với hành động | Thu gọn nhánh nếu chỉ đổi text vô nghĩa |
| Bộ ba có bản sắc mà solo được? | Cùng mục tiêu, 3 hồ sơ, so lý do chọn cách làm | Sửa bài/nguồn lực, không bắt đổi avatar |
| Đồ có vai trò/nguồn rõ? | Người chơi nói được kiếm đâu, dùng đâu, vì sao chưa dùng được | Sửa catalog/UI, không bày nhiều icon hơn |
| Nhiều người có ích mà không gây hại? | Hai client/party khác tiến độ, kiểm support/credit/reconnect | Giữ nội dung cá nhân tới khi policy đủ rõ |

Chưa đo/đặt KPI thành công ở đợt nghiên cứu. Tách ba nhóm bằng chứng: luật/lưu kỹ thuật; cảm giác/hiểu biết qua chơi thử; mỹ thuật/nhận diện được owner duyệt. Không suy một nhóm thay nhóm còn lại.
