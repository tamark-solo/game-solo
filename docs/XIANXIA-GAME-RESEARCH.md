# Nghiên cứu game tu tiên và nguồn truyện — góc nhìn cho Vân Hải Đạo Đồ

**Bản 0.1 · tra cứu 10/10/2026.** Theo yêu cầu owner: đọc lại GDD/roadmap, đào sâu nhiệm vụ, nhân vật, đồ, kỹ năng, pháp bảo và tìm bản sắc riêng. Đây là nghiên cứu tài liệu/nguồn web, **không phải báo cáo đã chơi thử các game**, không chốt feature/cân bằng hoặc xác nhận quyền khai thác tác phẩm.

**Đợt 2 tiếp nối:** [Tiên Nghịch và reference luyện chế](TIEN-NGHICH-CRAFTING-REFERENCES.md) bổ sung Immortal Life, Yi Xian, The Lost Village và sổ khảo sát 12 trang chương, ghi rõ phần trích đoạn/không đủ bằng chứng. [Thiết kế vật phẩm](ITEM-CRAFTING-DESIGN.md) và [lộ trình sản xuất](ITEM-PRODUCTION-PLAN.md) chuyển ý tưởng thành nguồn–recipe–công dụng–đầu việc, chưa phát sinh runtime/ART hoặc quyết định canon mới.

Đọc tiếp: [đề xuất bản sắc/cốt truyện](VAN-HAI-CREATIVE-DIRECTION.md), [kế hoạch nội dung và hệ thống](RPG-CONTENT-PLAN.md), [roadmap](DEVELOPMENT-ROADMAP.md).

## 1. Phạm vi đọc và mức bằng chứng

Đã đọc trọn GDD 0.29, roadmap RM0–RM6, roadmap entry E0–E5, backlog; các hồ sơ `CHARACTER-SYSTEM`, `QUEST-SYSTEM`, `CULTIVATION-SYSTEM`, `CHARACTERS`, `STARTER-STORY`, `HANG-NHAC-NGUNG-KHI-SPEC`, `HANG-NHAC-PROGRESSION-REWARDS`, `NGUNG-KHI-GAMEPLAY-SPEC`, `HANG-NHAC-ENCOUNTERS-TRIAL`, `ONLINE-DIRECTION`, `MMORPG-DIRECTION`, `CHARACTER-UI-CULTIVATION-DIRECTION`. Không coi việc này là đã đọc hết mọi file archive/ART trong repo hoặc toàn bộ tiểu thuyết.

Phương pháp:

- Tìm nhiều hướng bằng tên Việt/Trung/Anh; ưu tiên trang developer/publisher và thông báo chính thức, sau đó fetch nội dung trực tiếp. Không lấy câu trả lời tổng hợp của công cụ tìm kiếm làm nguồn cuối.
- **Nguồn chính thức xác nhận một feature được mô tả**, không chứng minh feature vui/cân bằng/không có lỗi. Patch/article lịch sử chỉ chứng minh nội dung tại thời điểm đó.
- Không dùng tỷ lệ review, doanh thu, thời lượng chơi, số người online hoặc nhận xét cộng đồng làm số đo đã kiểm.
- Chương truyện được đối chiếu qua Wuxiaworld; một số trang chỉ cho trích đoạn. Không vượt paywall và không suy toàn chương từ trích đoạn.
- Không tải/copy ART, thoại dài, công thức hay bảng stat của game khác vào dự án. Các mảnh trích ngắn bên dưới chỉ để định vị luận cứ.

## 2. Kết quả rà soát nội bộ: còn thiếu gì thực sự?

| Đã có trong GDD/roadmap | Khoảng trống | Hệ quả nếu không xử lý |
| --- | --- | --- |
| Ranh giới identity, lưu, quest/attempt/receipt khá rõ | Chưa có xung đột truyện trung tâm nối các bài học | HN01–HN12 dễ thành chuỗi đi gặp NPC và thi bài |
| Sáu phần tu tiên đã được phân biệt | Chưa có bảng mỗi phần mở vào lúc nào và thay đổi quyết định nào | Nhiều tab nhưng ít cách chơi |
| Ngưỡng 1/3/9/15 và thưởng thử có bảng | Chưa đo nhịp chơi/chờ, chưa chốt hết 15 tầng trong nhập môn | Tầng tăng nhanh nhưng cảm giác tiến bộ chỉ là số |
| Hành trang pilot có gear/vật tư thật | Chưa đủ nguồn–chi, binding, nhận khi đầy, đường thay thế | Đồ mới dễ thành vật trang trí hoặc gây kẹt tuyến |
| R01 đủ nền định hướng/target/di chuyển | Chưa có triết lý mở rộng build sau map | Dễ cấp R02 chỉ vì có ART, hoặc làm nhiều skill cùng chức năng |
| Pháp khí HN08 có đề xuất hộ thân | Chưa có bản sắc sử dụng/nguồn gốc dài hạn cho từng món | Pháp bảo thành gear cộng chỉ số hoặc skill thứ tư không ngữ cảnh |
| MMORPG là mục tiêu | Phần chung/cá nhân và lợi ích hợp tác còn thiếu nội dung cụ thể | Hoặc chỉ là game solo nhìn thấy nhau, hoặc party khóa tutorial |
| Tên game mới, nguồn Tiên Nghịch giữ lại | Chưa chốt mức độc lập của thế giới, roster, nguyên tác/chuyển thể | Bản sắc mới dễ bị nhầm là đã đổi IP hoặc viết lại canon |

**Sai khác cần xử lý khi đặc tả, không sửa gameplay trong nghiên cứu:** `shared/world/map.ts` đang có tốc độ 80 px/s, radius 8; hồ sơ encounter cũ tính 160 px/s/radius 18. Với E02 dấu tròn bán kính 64, thời gian từ khóa đến resolve 0,8 giây, người ở tâm đi được 64 px ở tốc độ 80; cần hơn 64+8=72 px để thoát giao collider, chưa tính độ trễ/lề an toàn. Vì vậy phép tính “đi bộ né được” trong bảng cũ không dùng nguyên xi cho runtime. Điều chỉnh đòn/sân/timing sau prototype, không tăng tốc hoặc sửa map owner để che lệch này.

Các file thiết kế đời 08/10 còn câu “map chưa có collider/chờ map” hoặc “chưa có login”. Chúng là mốc cũ; trạng thái mới đọc ở GDD/PROJECT-STATUS/runtime. Không nâng số liệu đề xuất thành cân bằng vì một đoạn đã được code.

## 3. Ma trận game tham khảo

| Game / loại trải nghiệm | Nguồn xác nhận | Điều nên học | Không bê nguyên sang MMO hành động của mình |
| --- | --- | --- | --- |
| **Mịch Trường Sinh / 觅长生** — RPG tu tiên thiên về hệ thống | S01: công pháp, ngũ hành linh khí/thần thông, lĩnh ngộ, pháp bảo/đan phối hợp; luyện chế và NPC | Sức mạnh là một tổ hợp; nguồn tri thức và chuẩn bị có vai trò thật | Đồng hồ hàng nghìn năm/tuổi thọ và lựa chọn bế quan tua thời gian cá nhân; không biến combat R01 thành hệ thẻ/khí ngũ hành ngay |
| **Quỷ Cốc Bát Hoang / Tale of Immortal** — sandbox cá nhân | S02: NPC có quan hệ/quá trình riêng, kỳ ngộ, môn phái, artifact/spirit | Hậu quả khiến thế giới có ký ức; pháp bảo có câu chuyện/khả năng ngoài stat | Không cho một người giết NPC bắt buộc của mọi người, không mô phỏng toàn bộ NPC tự trị ngay |
| **Amazing Cultivation Simulator / 了不起的修仙模拟器** — quản lý môn phái/simulation | S03: bố trí ngũ hành/phong thủy, vật liệu truyền tính chất vào sản phẩm, luật tu luyện và chế tác | Môi trường và vật liệu có nghĩa; chuẩn bị tạo khác biệt | Không chuyển game sang quản lý cả tông môn, puzzle phong thủy khổng lồ hoặc phạt chết bất ngờ |
| **Nhất Niệm Tiêu Dao / 一念逍遥** — mobile idle có xã hội | S04–S05: pháp bảo bản mệnh có hướng phát triển/tên riêng; nội dung tông môn/chợ/bảng hoạt động | Một món theo người lâu dài; mở hệ thống theo nhu cầu; nơi sinh hoạt có chức năng | Nguồn còn quảng bá offline đánh quái/last-hit: trái hướng hiện tại, không học theo; không kế thừa shop/tiền/cross-server/bảng lực chiến |
| **Tru Tiên Thế Giới / 诛仙世界** — MMO tiên hiệp | S06–S07: tuyến truyện, du lịch/kỳ ngộ, nội dung nhóm, pháp bảo mở năng lực khám phá | Tách các lớp nội dung, khả năng mới mở cách đọc thế giới; map không chỉ chứa mob | Quy mô dungeon/raid, season gear, số menu/điểm mua sắm và hoạt động lịch cố định không phù hợp nguồn lực bản đầu |

Đây là **ma trận phù hợp thiết kế**, không xếp hạng chất lượng các game. Ba game đầu không cung cấp sẵn lời giải ownership/clock/credit cho MMO; hai game online cũng không mặc nhiên phù hợp với khả năng sản xuất của dự án.

## 4. Bài học theo hệ thống

### 4.1. Tu luyện phải thay đổi cách giải vấn đề

S01 gắn thần thông với công pháp/lĩnh ngộ và công cụ; S03 gắn luyện tập với môi trường/vật liệu. Áp dụng đề xuất: mỗi bình cảnh yêu cầu một bước hiểu/vận dụng có thể chỉ ra, thay vì thêm một nguyên liệu màu mới để đủ thanh. HN07 là nơi kiểm đầu tiên; không sửa luật HN02 đã có.

Rủi ro: quá nhiều tương khắc làm người mới phải tra wiki. Giảm bằng một quan hệ rõ trong bài đầu, có cách thử lại và phản hồi tại chỗ. Chưa cần mô hình đủ ngũ hành, kinh mạch, căn cốt, tâm ma, tuổi thọ đồng thời.

### 4.2. Nhiệm vụ cần để lại điều gì ngoài EXP

S02 mô tả sự kiện và quan hệ; S06 chia chính tuyến/du lịch/kỳ ngộ; S07 có điều tra bằng chứng. Áp dụng: mỗi chặng chính có một câu hỏi truyện, một hành động, một kết quả thay đổi cách chuẩn bị hoặc người đáng tin. Quest engine chỉ lưu facts; không tự tuyên bố người chơi đã giác ngộ từ một số kill.

Không sao chép bảng quan hệ NPC khổng lồ hoặc khóa tuyến chính sau lựa chọn đạo đức bí mật. Một lựa chọn ban đầu chỉ cần một hậu quả thấy lại sau đó, không cây phân nhánh vô hạn.

### 4.3. Đồ cần nguồn gốc và công dụng, không chỉ phẩm màu

S03 nêu sản phẩm kế thừa tính chất vật liệu, S01 cho phối vật liệu/phương thuốc. Áp dụng nhỏ: vật liệu nhiệm vụ có nguồn rõ; công thức khai báo vật liệu nào được dùng, kết quả là gì. Có thể thêm tag phục vụ bài như “giữ khí/ổn định” sau, không tự cho mọi nguyên liệu tương tác với mọi thuật.

Gear tạo nền; consumable hỗ trợ chuẩn bị; pháp khí tạo hành động; tín vật mở câu chuyện. Không ép tất cả thành cùng một vòng +1/+2, không triển khai random affix trước khi một đồ có tác dụng đã chơi được.

### 4.4. Pháp bảo nên là công cụ và bạn đồng hành của hành trình

S04 giới thiệu hướng phát triển và việc đặt tên bản mệnh; S07 minh họa một pháp bảo mở khả năng giải đố. Áp dụng: HN08 vẫn là một pháp khí hộ thân; về sau một pháp khí khám phá có thể giúp **thấy cách tiếp cận** thay vì chỉ gây damage lớn hơn. Không copy tên/cơ chế của Niệm Tâm Đăng hoặc cấp một châu canon chung.

Mở bản mệnh/khí linh rất tốn truyện, ART và balance; chưa đưa vào HN05. Khả năng đặt tên không đủ tạo độc đáo nếu cách dùng vẫn y hệt.

### 4.5. Chất MMO không đồng nghĩa tranh thưởng

S06 chứng minh một game có thể đặt truyện, kỳ ngộ, nhóm và sự kiện trong các lớp nội dung khác nhau. Áp dụng: tuyến nhập môn solo; hoạt động cùng nhau có đóng góp riêng và thuận tiện hơn, nhưng không khóa tiến trình người chơi ít bạn. Không lấy last-hit trong S04 làm luật tutorial.

Trước farm chung phải có eligibility/support credit, anti-AFK, nhóm khác tiến độ và reward cap/source. Ký ức truyện cá nhân không tự đổi NPC toàn realm. Không thể áp nút tua thời gian single-player cho clock thế giới chung.

## 5. Truyện Tiên Nghịch: chất liệu nào có thể chuyển thành gameplay?

| Nguồn truyện đã đọc được | Điều đoạn nguồn hỗ trợ | Ý tưởng chuyển thể, không phải luật canon |
| --- | --- | --- |
| N01 — chương 33 | Vương Lâm dùng tài nguyên đổi phần phương pháp còn thiếu và đề phòng người nhòm ngó | Tri thức là quyền tiếp cận; có tài nguyên cần cân nhắc khi trao đổi, không chỉ mua sách theo level |
| N02 — chương 47 | Tư Đồ Nam mất thân thể, bị giới hạn trong châu; kiến thức không đồng nghĩa tự do sử dụng sức mạnh | Tuyến hồi phục phải có giới hạn hiện diện/cách vận dụng, không reset thành người mới |
| N03 — trích đoạn chương 143 | Lý Mộ Uyển thao tác trận và đánh giá vật liệu từ con rồng | Nhận biết tài nguyên/chuẩn bị mở cách giải, vẫn cho cô tự chơi; không mặc định class chữa trị |
| N04 — trích đoạn chương 224 | Lý Mộ Uyển nhận định đan dược, chất lượng/thời điểm và chuẩn bị cho Vương Lâm | Công cụ có điều kiện và cách dùng; không biến số rank/tình tiết đoạn này thành công thức nhập môn |
| N05 — trích đoạn chương 271 | Khắc tượng gợi lại người đã gặp và suy ngẫm nhân quả | “Đạo đồ” ghi trải nghiệm có nghĩa; không cho mọi avatar khắc tượng để mua điểm ý cảnh |

Bài học đề xuất: **năng lực + tri thức + thời cơ + hệ quả**. Không rút chất truyện thành trả thù liên tục, cũng không viện “nghịch thiên” để cho người level thấp thắng mọi cao thủ bằng một nút. Những arc/khả năng chưa đối chiếu không viết thành chính sử.

### Câu hỏi sản phẩm phải quyết định

Tên Vân Hải Đạo Đồ không tự làm roster/địa danh/tình tiết Tiên Nghịch thành IP độc lập. Có hai đường cần owner định hướng:

- **Tiếp tục chuyển thể có ranh giới:** giữ bộ ba/Hằng Nhạc hiện hành, sáng tạo tuyến phụ/cách vận dụng, phân biệt nguồn và mở rộng.
- **Thế giới/nhân vật độc lập về dài hạn:** phải có một đợt sáng tác và rà quyền khai thác riêng; không chỉ đổi tên nhân vật rồi coi là độc lập.

Trong lúc chưa quyết định khác, nghiên cứu **giữ đường hiện hành**, không thay roster/map/ART. Trước phát hành cần làm rõ quyền sử dụng tên, nhân vật, cốt truyện và hình ảnh; đây là điểm cần rà, không khẳng định dự án đã có hoặc chưa có giấy phép.

## 6. Sổ nguồn truy xuất

Tất cả URL dưới đây đã fetch/đọc ngày 10/10/2026. Dấu trích chỉ là đoạn định vị; kết luận áp dụng thuộc nhóm thiết kế, không phải tác giả nguồn bảo chứng.

| ID | Nguồn / thời điểm nội dung | Đoạn định vị ngắn | Giới hạn |
| --- | --- | --- | --- |
| S01 | [觅长生 — developer trên Steam](https://store.steampowered.com/app/1189490/?l=schinese), trang có thể cập nhật | “功法和大道领悟的加成”; “自由组合材料炼制的法宝” | Mô tả hệ thống, không bằng chứng độ sâu/cân bằng thực tế |
| S02 | [Tale of Immortal — developer trên Steam](https://store.steampowered.com/app/1468810/?l=english), trang có thể cập nhật | “their own friends, family, and life trajectory”; “Refine your own Artifacts” | Sandbox được quảng bá; chưa kiểm hành vi AI hoặc hiệu quả lựa chọn |
| S03 | [Amazing Cultivation Simulator — developer trên Steam](https://store.steampowered.com/app/955900/?l=english) | “inherit the traits of the original materials”; “Adhere to Feng Shui” | Không dùng số lượng laws/recipe của mô tả làm yêu cầu sản xuất |
| S04 | [一念逍遥 — bản mệnh pháp bảo](https://xian.leiting.com/news/37.html), bài lịch sử khoảng 03/2021 theo asset trong trang | “法宝的名字，均可由仙友定义” | Bài ghi một số biến thể kỹ năng chưa mở tại lúc viết; không khẳng định trạng thái hiện tại |
| S05 | [一念逍遥 — giới thiệu nhân giới](https://xian.leiting.com/news/1.html), 03/12/2020 | “通过宗门的藏经阁学习更多神通” | Bài thời phát triển; không là mô tả chính xác mọi phiên bản 2026 |
| S06 | [诛仙世界 — tổng quan 孤心撼海](https://zxsj.wanmei.com/news/gamenews/20250709/257351.shtml), 09/07/2025 | “根据活动界面内的线索提示触发奇遇任务”; “任务日志-剧情回顾” | Có nội dung liên động thời hạn; không nói các sự kiện vẫn mở lúc nghiên cứu |
| S07 | [诛仙世界 — thông báo bảo trì 17/12/2025](https://zxsj.wanmei.com/news/gamebroad/20251211/259804.shtml) | “收集证据与证词”; “温养法宝后可获得【入念】技能” | Patch cụ thể; không bê season gear/currency vào game mình |
| N01 | [Renegade Immortal — chương 33](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-33) | “I only want the chants for the 4th layer or later.” | Đọc văn bản chương được trả về, không suy quyền truyện/luật giao dịch chung |
| N02 | [Renegade Immortal — chương 47](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47) | “resulting in me losing my body” | Nguồn trạng thái, không xác nhận linh thể đi lại tại Hằng Nhạc là canon |
| N03 | [Renegade Immortal — chương 143](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143) | “Would the bones of this dragon be enough for the formation?” | Chỉ trích đoạn được trả về (~1.066 ký tự), không toàn chương |
| N04 | [Renegade Immortal — chương 224](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-224) | “We must have missed the correct time to open the seal” | Chỉ phần đầu được trả về (~2.120 ký tự), không toàn chương |
| N05 | [Renegade Immortal — chương 271](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-271) | “That was karma. Where there is life, there is also death.” | Chỉ trích đoạn (~1.014 ký tự); không đủ phân tích toàn arc Hóa Thần |

Định danh phiên công cụ để đối chiếu nếu còn lưu: tìm kiếm `mv2di7a8680f1c`, `mv2do7449tu2ai`; fetch trực tiếp `mv2diluosyx8p8`, `mv2doijzn7kain`, `mv2dqdkxdiu9v6`. Các ID tạm không thay URL/bằng chứng ngắn đã lưu trong bảng.

## 7. Cần đào tiếp bằng chơi thử, không giả đã có kết quả

| Mẫu cần quan sát trực tiếp | Câu hỏi | Đầu ra cần ghi |
| --- | --- | --- |
| Một lần học công pháp/đột phá ở Mịch Trường Sinh | Người chơi hiểu điều kiện từ game hay phải tra ngoài? | Các bước, thời gian chơi/chờ, điểm vướng; không chép stat |
| Một kỳ ngộ/quan hệ/pháp bảo ở Quỷ Cốc | Hệ quả thực sự khác hay chỉ đổi text/bonus? | Đồ thị trước–lựa chọn–sau và chi phí nội dung |
| Một vật liệu→đồ trong ACS | Tính chất vật liệu đọc được và dự đoán được không? | Ví dụ nguyên nhân/kết quả, phần phù hợp thu nhỏ |
| Một pháp bảo bản mệnh trong Nhất Niệm | Đổi hướng có trả giá gì, món cũ có còn giá trị? | UI đổi/tác dụng; tách article lịch sử khỏi phiên bản đang chơi |
| Một tuyến du lịch/pháp bảo khám phá trong Tru Tiên Thế Giới | Cá nhân/party khác tiến độ có va chạm không? | Quyền tương tác, chia credit và điều kiện map |

Chưa có video được phân tích theo timestamp hoặc phép đo trực tiếp trong đợt này. Kết luận hiện đủ chọn giả thuyết thiết kế để thử, không đủ tuyên bố “độc nhất thị trường”, “chắc chắn vui” hoặc chốt balance/monetization.
