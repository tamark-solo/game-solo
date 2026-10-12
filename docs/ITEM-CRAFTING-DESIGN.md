# Vật phẩm và luyện chế — từ nhập môn tới vòng ngoại vi có chuẩn bị

**Thiết kế 0.2 · 11/10/2026 · đề xuất, chưa triển khai/khóa cân bằng.** Theo yêu cầu mở rộng roadmap đồ/nguyên liệu/pháp bảo bằng reference và truyện. [Nguồn đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md) giải thích ý tưởng và giới hạn canon. Tên `vh-*`, vật liệu, recipe và nhiệm vụ EX dưới đây là **sáng tạo game**, không vật phẩm/công thức Tiên Nghịch đã xác minh.

**Bổ sung hướng farm/PvE/PvP 11/10:** chuỗi EX dưới đây là thử nghiệm công cụ hữu hạn. Nguồn lặp cho mạnh lên nằm trong [kế hoạch MMORPG](MMORPG-PROGRESSION-PLAN.md) và **VP4-A/RM5-A** ở [kế hoạch sản xuất](ITEM-PRODUCTION-PLAN.md), có thể được chọn sớm sau nền RM2 đủ ổn mà không đợi hoàn tất EX/VP2/3. Gate của nhánh đó là encounter, loot/ledger, nguồn–chi/nơi dùng và stat/migration thật; không phát lại source grant EX/HN làm farm. Catalog/manifest 13 định nghĩa hiện tại chưa bao gồm món power pilot mới.

[Catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) vẫn sở hữu 5 định nghĩa cho HN; tài liệu này thiết kế bước **sau HN12** và nguyên tắc dài hạn. [Lộ trình sản xuất](ITEM-PRODUCTION-PLAN.md) ánh xạ vào RM, không đẩy tất cả việc vào HN05. [Manifest kế hoạch](design/systems/items-v1/plan.json) chỉ để kiểm phụ thuộc/nguyên liệu và đếm đầu việc, không nguồn runtime.

## 1. Lời hứa và giới hạn

**Biết tìm gì → biết vì sao vật đó phù hợp → chế/chuẩn bị → thử trong một việc cụ thể → thấy cách làm thay đổi.** Mỗi món cần câu trả lời cho sáu việc: nguồn, chủ sở hữu, đích dùng, điều kiện, đánh đổi và vòng đời. Đồ đẹp mà chưa có đích dùng không được tạo như vật phẩm thật.

Giữ: bộ ba/R01, HP/MP pilot, gear cũ, receipt/save, camera/va chạm owner. Không mở cường hóa, tiền, chợ, phẩm chất RNG, tuổi thọ, thời tiết toàn world hoặc phương pháp canon mới trong lát này. Không đổi 12 icon preview thành 12 món thật.

## 2. Phân loại để không trộn cơ chế

| Nhóm | Vai trò | Mô hình đề xuất | Không đồng nhất với |
| --- | --- | --- | --- |
| Gear | Nền trang bị, về sau có lựa chọn stat/hiệu lực | Instance + slot + nguồn thuộc tính | Pháp bảo kích hoạt hoặc quyền R01 |
| Nguyên liệu | Đầu vào recipe có nơi dùng | Stack đúng loại/owner/binding | Tiền tệ tự do hoặc bằng chứng quest |
| Thành phẩm tiêu hao | Chuẩn bị một lần, có nguồn thay thế | Stack + receipt tiêu dùng | Vật bắt buộc phải mua để thắng |
| Pháp khí nhập môn | Một công cụ dùng được, có điều kiện và chi phí | Instance raw/refined, active effect riêng | Mỗi món mạnh đều có quyền canon |
| Công cụ khảo sát | Một cách thao tác với nội dung thế giới | Instance thuộc chủ, dùng tại điểm hợp lệ | Pháp khí combat, radar soi tất cả bí mật |
| Cơ sở luyện chế | Nơi/quyền cho phép làm recipe | Service của NPC/địa điểm | Lò đồ sộ mang theo hoặc building tự đặt |
| Phương pháp/công thức | Tri thức đã tiếp cận | Unlock theo hồ sơ; có thể có vật chứa khi câu chuyện cần | Stack sách tích vô hạn, EXP nghề riêng ngay |
| Đạo đồ/chứng từ | Điều đã xảy ra/đã hiểu | Quest facts và journal | Túi vật phẩm, tiền thiện ác |

“Pháp khí/pháp bảo” trong phạm vi game là nhãn công cụ và cấp nội dung đang thiết kế, **không khẳng định phân hạng toàn bộ nguyên tác**. Pháp bảo truyện độc hữu phải có hồ sơ nguồn riêng.

## 3. Tầng nội dung — không phải cấp rarity

| Gói | Khi mở | Nội dung thật cần có | Vai trò tiến triển |
| --- | --- | --- | --- |
| VP0 | RM1–RM2, HN05 | Đồ cũ + nguyên liệu nhiệm vụ | Học nguồn thưởng/giữ tiến trình |
| VP1 | RM3–RM4, HN08–HN12 | Phôi→ngọc hộ thân, một recipe | Biết sở hữu khác vận dụng, dùng phòng thủ |
| VP2 | Sau HN12, phần nhỏ RM5 | Nguồn vật liệu kiểm được, mực/chế vật tư/hộp/niêm | Tự chuẩn bị một chuyến ngoại vi; chưa chợ hoặc nghề hoàn chỉnh |
| VP3 | Sau VP2, RM6 hoặc nội dung khám phá tương ứng | Định Lưu Bàn và bài khảo sát; một lựa chọn vận dụng | Công cụ mở phương án, không cộng tất cả bonus |
| VP4-A / VP4 mở rộng | Pilot nguồn lặp sau RM2 khi gate đủ; mở rộng từ dữ liệu chơi thử gói liên quan | Một nguồn–đích dùng trước, sau đó craft/giao dịch/đồ lâu dài được chọn | Mạnh lên có đích dùng, kinh tế và hợp tác có giới hạn/đối ứng |

VP là mã gói thiết kế/sản xuất, **không thêm cảnh giới, quest gate hoặc roadmap cạnh tranh với RM**. VP2 chưa cần làm để HN05/HN10 hoàn thành. Nếu chưa có nội dung sau HN12, chỉ giữ ở tài liệu; không bật nút chế tác/địa điểm giả.

## 4. Catalog mở rộng có giới hạn: tám định nghĩa mới

Cùng 5 định nghĩa nhập môn, tổng phạm vi tới VP3 là **13 định nghĩa**, trong đó 3 hiện có và 10 dự kiến. Recipe tạo thêm `recovery` không tạo loại thuốc mới trùng chức năng.

| ID thiết kế | Tên làm việc | Tag có nghĩa trong recipe | Nguồn đề xuất | Đích dùng | Binding giai đoạn thử |
| --- | --- | --- | --- | --- | --- |
| `vh-clean-herb` | Dược thảo sơ chế | Dược liệu | Thu ở điểm được phép rồi xác nhận sơ chế EX01 | CT02 chế vật tư hồi phục | Riêng hồ sơ |
| `vh-clear-water` | Linh tuyền đã lọc | Dung môi | Điểm lấy mẫu được phép EX01 | CT01 mực, CT02 vật tư | Riêng hồ sơ; không nước tạo bằng châu |
| `vh-soft-fiber` | Sợi vân bố | Vật liệu giữ/bao bọc | Công việc sơ chế ở điểm chuẩn bị EX02 | CT03 hộp, CT04 bàn khảo sát | Riêng hồ sơ |
| `vh-conductive-sand` | Cát dẫn khí | Dẫn khí | Lấy mẫu hợp lệ EX01/EX02 | CT01 mực, CT04 bàn khảo sát | Riêng hồ sơ |
| `vh-stable-jade` | Ngọc thô ổn khí | Giá thể | Nguồn khảo sát/sơ chế EX02 | CT03 hộp, CT04 bàn khảo sát | Riêng hồ sơ |
| `vh-guiding-ink` | Mực dẫn khí | Thành phẩm trung gian | CT01 | CT05 niêm một hộp cho một chuyến | Riêng hồ sơ, tiêu hao |
| `vh-sealed-case` | Hộp giữ khí | Công cụ mang mẫu | CT03 | Phương án chuẩn bị ở EX03 | Instance riêng; dùng lại, không bag +slot |
| `vh-flow-compass` | Định Lưu Bàn | Công cụ khảo sát | CT04 sau EX03 | Cách kiểm một dấu tại EX04 | Instance riêng; không công cụ combat |

Tag là thuộc tính khai báo giúp đọc recipe; **không engine hóa học tự suy mọi tổ hợp**, không ngũ hành damage/resist ở bản đầu. Không tự thêm thời hạn hỏng vật liệu theo giờ thực hoặc mùa thu hoạch gây mất đồ khi offline.

Tới khi có policy container hoàn chỉnh, nguồn thử một lần có vùng nhận được bảo đảm tương tự item nhiệm vụ. Không tuyên bố ba lô thường vô hạn. Có protection riêng; binding không được gỡ qua craft/đổi tên. Món thuộc hồ sơ không tự chia cho ba avatar hoặc tài khoản.

## 5. Bộ công thức thử đầu — số tự đặt để kiểm chuỗi, chưa balance

Mã **CT01–CT05** dưới đây là nhãn công thức, định danh đầy đủ bằng `vh-recipe-*`; không liên quan tier skill R01–R05. Không dùng mã ngắn làm ID giao thức. Mỗi lần xác nhận ghi nguyên liệu + kết quả + receipt cùng transaction.

| Nhãn / ID | Mở bởi | Nguyên liệu tiêu | Công cụ giữ lại | Kết quả | Nơi làm |
| --- | --- | --- | --- | --- | --- |
| CT01 — Mực / `vh-recipe-ink` | Hoàn tất EX01 | 1 cát dẫn khí + 1 linh tuyền | Không | 1 mực dẫn khí | Điểm chuẩn bị có dịch vụ |
| CT02 — Vật tư / `vh-recipe-recovery` | Hoàn tất EX01 | 2 dược thảo + 1 linh tuyền | Không | +1 `recovery` vào nguồn supplies hiện hành | Cùng dịch vụ; không thêm lò inventory |
| CT03 — Hộp / `vh-recipe-case` | Hoàn tất EX02 | 2 sợi vân bố + 1 ngọc thô | Không | 1 instance hộp | Điểm chuẩn bị |
| CT04 — Khảo sát / `vh-recipe-compass` | Hoàn tất EX03 | 1 sợi vân bố + 2 ngọc thô + 1 cát dẫn khí | Không | 1 instance Định Lưu Bàn | Điểm chuẩn bị |
| CT05 — Niêm / `vh-recipe-seal` | Nhận EX03 | 1 mực dẫn khí | 1 hộp đúng chủ | Seal hợp lệ cho đúng chuyến, **không item hộp thứ hai** | Trước khi bắt đầu chuyến |

Hộp/bàn là đồ dùng lâu dài: bản thử giới hạn một instance mỗi định nghĩa/hồ sơ, không recipe spam tạo rác. Craft lại nếu đã có bị từ chối trước trừ nguyên liệu. Không tháo thành vật liệu hoặc bán lại trong gói đầu, nên chưa có vòng chế–phá lời vô hạn.

Recipe vật tư **chỉ đổi nguồn nhận**, không đổi hiệu lực 30 HP/cooldown 10 giây hoặc điều kiện dùng hiện hành. Không craft trong combat/đang transfer để lách nguồn hồi; nghề Lý Mộ Uyển không độc quyền recipe cơ bản. Mỗi recipe mới cần validation version/storage của D02, không chỉ một dòng UI.

### 5.1. Quy tắc cấp, retry và kết quả

- Mẫu trong activity là minh chứng thu/sơ chế. Item chỉ được cấp khi xác nhận **gói nguồn** EX01/EX02, không vừa nhặt từng node rồi nhận lại cùng số ở quest.
- Source grant lần đầu có business key theo hồ sơ + nguồn; request mới không nhân đồ. Thử lại/chuyển map không reset nguồn.
- Học công thức là unlock riêng; consume vật phẩm không xóa quyền đã học. Đã biết recipe nhưng chưa có nguyên liệu thì nút có lý do khóa.
- Craft không có RNG hỏng đồ hoặc timer dài ở bản thử. Lỗi lưu không trừ gì; mất phản hồi đọc receipt/snapshot. Batch craft tương lai cần policy capacity, không áp bằng vòng click client.
- `vh-recipe-seal` ghi theo trip ID và owner, kiểm một hộp chưa có seal khác đang hoạt động. Chuyến chưa bắt đầu có thể bỏ chuẩn bị và hoàn đúng một mực bằng receipt hoàn một lần; không thể vừa giữ seal vừa nhận hoàn. Khi chuyến đã bắt đầu, no refund; bỏ/chưa đạt vẫn có đường thủ công miễn phí.

## 6. Hai công cụ phải thay đổi việc làm như thế nào?

### Hộp giữ khí — chuẩn bị đổi tuyến, không bán slot túi

**Bài sử dụng:** mang mẫu khảo sát qua một khu có dòng khí gây nhiễu mẫu. Hai phương án:

- Không hộp/không seal: đi đường ổn định dài hơn, hoặc đặt mẫu ở điểm an toàn rồi vượt đoạn và lấy lại theo luật bài. Bản đầu ưu tiên đường ổn định để không phải làm hệ đặt đồ vật lý.
- Có hộp niêm trước chuyến: mang mẫu qua tuyến ngắn nhiễu khí mà proof mẫu vẫn hợp lệ. HP của người chơi không được hộp bảo vệ, không miễn damage, không xuyên blocker.

Không khí hậu mô phỏng toàn map: chỉ các vùng đánh dấu thuộc đúng activity, có tín hiệu và hai tuyến được kiểm walkable. Hộp không tăng capacity, không chứa đồ người khác, không gộp item vào một container lồng trong inventory.

**Vòng đời:** created → seal pending → trip active → kết thúc/bỏ chuyến → seal cleared, hộp vẫn còn. Mẫu là quest fact/cargo của activity, không thành item bán được. Trước khi rời/kết thúc người chơi biết seal sẽ hết. Không tiếp tục đếm hỏng mẫu khi offline; proof đã lưu được giữ, chưa có proof thì trở về checkpoint an toàn theo policy hoạt động. Không reset khoản vật tư đã tiêu chỉ vì reload.

**Vì sao đáng giữ:** công cụ của nhiều chuyến có địa hình/mục tiêu thích hợp; không cần tạo một hộp mới mỗi nhiệm vụ. Nếu prototype không có hai phương án thực sự khác, bỏ hộp khỏi gói, không giữ chỉ vì có icon đẹp.

### Định Lưu Bàn — giúp đọc dấu, không tự giải mọi bí mật

**Bài sử dụng:** một cụm hai dấu khảo sát có phương án quan sát thủ công từ hai điểm an toàn. Người có bàn được thực hiện một lần đọc tại node hợp lệ để biết hướng cần đối chiếu, giảm số lượt đi; vẫn phải tự kiểm kết quả ở điểm đích.

- Cùng thông tin cốt lõi và reward cho cách thủ công/công cụ; không item bắt buộc ẩn sau máy dò.
- Dùng bằng tương tác ngữ cảnh ở node, ngoài combat và khi đứng yên; không thêm skill vào hotbar. Chưa cần thêm equip slot: mang tool là quyền action ngữ cảnh, không bonus thụ động. Owner duyệt input/UI trước nối.
- Prototype đề xuất đọc một nhịp ngắn có thể hủy bằng đi bộ; duration cần đo, chưa đặt 1–5 giây thành luật. Không MP/phí tiêu hao ở gói đầu để tránh thêm nguồn power/tiền không cần; không kích hoạt đồng thời nhiều lần. Thành công ghi một observation theo node/chuyến, replay không tạo thưởng.
- Không radar theo thời gian thực, soi người chơi/loot, mở cổng, teleport, tự cast hoặc thấy quest người khác. Không tác dụng lên mọi điểm map chỉ vì có tool.
- Không expiry theo giờ thực, không reset kết quả đã chốt khi tháo/đổi hồ sơ. Node đã đọc trong cùng activity trả kết quả cũ.

**Đánh đổi:** đầu tư nguyên liệu/quyền phương pháp trước, để tiện quan sát chứ không mạnh hơn trong mọi combat. Không gọi đây là Niệm Tâm Đăng hoặc năng lực thần thức canon.

## 7. Một vòng nhiệm vụ hậu nhập môn để kiểm catalog

Mã EX chỉ là ID thiết kế dự kiến, **không HN13–HN16 đã mở**, không buộc làm để HN12 hoàn tất. Điều kiện chung: HN12 đã ghi quyền xuất hành, content release VP2 có thật và hồ sơ được phép vào; có thể dùng ngoại vi mở rộng còn lấy Hằng Nhạc làm hub, không cần bịa map Trúc Cơ đã có.

| Nhiệm vụ | Việc làm / kết quả | Nguồn vật liệu một lần | Vì sao không kẹt |
| --- | --- | --- | --- |
| EX01 — Nhận biết nguồn | Kiểm điểm dược liệu/nước/cát được phép, xác nhận sơ chế; mở recipe mực/vật tư | 2 dược thảo, 2 nước, 1 cát | Không cần công cụ chế từ chính nguyên liệu đang đi tìm; không phải craft/dùng thuốc khi HP đầy để chốt |
| EX02 — Vật liệu thành công cụ | Đối chiếu hai vật liệu tại điểm chuẩn bị, hoàn tất công việc sơ chế; mở recipe hộp | 3 sợi, 3 ngọc, 1 cát | Không cần hộp/Định Lưu Bàn mới lấy được ngọc; source không phụ thuộc recipe thành phẩm |
| EX03 — Chọn cách mang mẫu | Tự chọn đường ổn định hoặc hộp có seal, giao mẫu hợp lệ | Không thêm vật liệu/tu vi; proof mở phương pháp bàn khảo sát | Không craft cũng có đường hoàn thành, cùng giá trị quyền; seal đã tiêu không là điều kiện phải trả phí thử lại |
| EX04 — Đọc dấu rồi kiểm chứng | Quan sát thủ công hoặc đọc bằng bàn rồi tới điểm đối chứng, lưu Đạo đồ | Không gói power mới; kết quả thử dụng cụ và đầu mối nội dung tiếp | Không bàn vẫn có đường kiểm; dấu không tự thành quái/loot mới |

Nguồn lặp chưa bật: đây là một **lát nội dung hữu hạn** để kiểm vòng thu–chế–dùng, không gọi là kinh tế MMO đã hoàn chỉnh. Đường làm không cần các vật liệu cấp lần đầu tồn tại vô hạn.

### 7.1. Tính một lượt mẫu, không phải cân bằng đã đo

Tổng nguồn EX01+EX02: **2 dược thảo, 2 nước, 2 cát, 3 sợi, 3 ngọc**. Một lượt lần lượt chế mực, chế vật tư, chế hộp, niêm/hoàn tất EX03, chế bàn, làm EX04:

- 1 cát + 1 nước → mực; 2 dược thảo + 1 nước → +1 recovery.
- 2 sợi + 1 ngọc → hộp; 1 mực → seal của chuyến, hộp giữ.
- Sau EX03: 1 sợi + 2 ngọc + 1 cát → bàn.
- Còn: hộp, bàn, +1 recovery chưa dùng; không âm nguyên liệu, không recipe đòi output của chính nó. Chuyến kết thúc không còn seal active.

Người bỏ craft hoặc đi đường thủ công có thể giữ vật liệu, không cưỡng ép craft hết cho bảng số đẹp. Ví dụ chế mực hai lần sẽ dùng hết 2 nước/2 cát, không còn nước chế recovery hoặc cát chế bàn; UI phải cho xem kế hoạch nguyên liệu/cảnh báo trước. Main quest và EX03/04 vẫn hoàn thành thủ công. Bản hữu hạn **không hứa có nguồn farm bù ngay**; trước mở recipe lặp rộng cần policy nguồn bù thực, không tự cấp lại grant. Một lượt tối ưu chứng minh khả thi, không chứng minh mọi thứ tự craft đều có đủ đồ.

### 7.2. Vai trò đối thoại và câu chuyện của chuỗi EX

EX nối đầu mối “dấu sai” đã giải ở Hằng Nhạc sang việc tự chuẩn bị, không điều tra lại cùng thủ phạm. Cả hai nhánh báo cáo HN09 hoặc người để sau đều tiếp cận cùng chuỗi; chỉ lời mời thay cách nhắc lại quá khứ. Bản thử dùng vai chuẩn bị/giữ tuyến đã có trong thiết kế, chưa cần trưởng lão/đan sư canon mới.

- **EX01:** người phụ trách chuẩn bị hỏi vì sao chọn nguồn này, người chơi kiểm điểm được phép rồi sơ chế; không thi trivia hay hái trộm dược viên.
- **EX02:** nguồn vật liệu đã rõ nhưng một thùng vải thường không giữ mẫu; người chơi nhận phương pháp làm giá thể/vỏ bọc, không được phát sẵn tất cả thành phẩm.
- **EX03:** người giữ tuyến giao một mẫu đã biết tính chất, công khai hai phương án. Đường dài là lựa chọn thận trọng hợp lệ, không bị chê hoặc mất thưởng vì chưa craft.
- **EX04:** dấu ở điểm đến khác mô tả; dùng quan sát/tool rồi đối chứng. Kết thúc bằng kết luận có căn cứ trong Đạo đồ, không mở bí mật lớn hoặc cấp cảnh giới chỉ vì có dụng cụ.

Mỗi đoạn một lời dẫn ngắn, một hành động rõ và một kết quả nhìn thấy; không bốn lần bấm giao–nhận đứng nguyên tại NPC. Source point, tuyến và marker chỉ được đặt khi level/release được duyệt.

### 7.3. Hai nguyên liệu nhiệm vụ HN dư: không lén đổi ngân sách

Catalog HN vẫn 3+3−4=2. Gói VP2 **không tự đổi** nguyên liệu nhiệm vụ thành ngọc hoặc tiền; không mở đường farm HN cũ.

Khuyến nghị để owner chọn trước phát hành toàn chương: nếu chỉ cần một recipe HN08 thì giảm **nguồn mới chưa phát hành HN06 từ 3 xuống 1**, giữ HN05 3, tạo tổng 4 vừa đủ; đây là **phương án điều chỉnh**, chưa đổi bảng v0.2 hoặc số trong manifest hiện hành. Nếu đã cấp vào save ở đợt thử sau này, giữ số đã cấp, không trừ 2 của người cũ. Phương án giữ 2 chờ công thức tiếp vẫn hợp lệ nhưng cần nói rõ chưa dùng, không thêm một recipe giả chỉ để xóa dư.

## 8. Chất lượng, thuộc tính và đồ lâu dài

Bốn khái niệm không được gộp thành màu:

1. **Loại/vai trò:** nguyên liệu, thuốc, công cụ, gear, pháp khí.
2. **Tình trạng dùng được:** raw/refined, chưa biết/đã hiểu, đang mang/chưa, seal đang chuẩn bị/đã dùng.
3. **Phẩm chất sản xuất:** chưa có hệ ngẫu nhiên ở bản đầu; chỉ khi nhiều chất lượng tạo lựa chọn thực thì mới mở.
4. **Quyền giai đoạn:** mốc/công pháp/nguồn để dùng; không đồ cấp cao nhặt được là vượt cảnh giới.

Đường mở gear sau pilot: xác định một tình huống cần lựa chọn → làm hai phương án cùng ngân sách → hiện nguồn bonus → thử không mặc/cả hai → mới mở stat/slot. Chưa đặt tên “kiếm +10%/áo +20 HP” vì chưa có combat đủ để đánh giá. Không vứt mọi gear cũ theo màu mới, không khóa R01 vì bỏ kiếm.

Pháp bảo lâu dài: **tìm nguồn → nhận biết giới hạn → có phương pháp → luyện hóa → thử → chọn cách vận dụng → sửa hướng theo policy**. Dấu sở hữu/luyện hóa trong game là authority profile, không bằng chứng có thể cướp/đoạt đồ của người khác. Bản mệnh/khí linh/cường hóa cần truyện và hợp đồng riêng, chưa sản xuất.

## 9. Liên kết công pháp/thuật với đồ, không thêm sáu cây EXP

| Nhóm | Dấu mở | Đồ đóng vai gì | Không cho đồ thay |
| --- | --- | --- | --- |
| Nền vận hành | HN02/07/09 | Mẫu/chứng cứ/recipe giúp hiểu chuẩn bị | Điều kiện hoạt động/thao tác xác nhận |
| R01 | Quyền từ đầu | Gear nhập môn không bonus, hộ thân bổ sung lựa chọn | Hit/target/cooldown hoặc quyền skill đã có |
| Cách vận dụng hậu nhập môn | Một phương pháp qua nội dung phù hợp avatar | Tool/vật liệu giúp kiểm điều kiện, không tăng mọi chỉ số | Công pháp canon hoặc R02 từ asset |
| Lĩnh ngộ | Kết quả kiểm chứng | Đồ là bằng chứng/công cụ, không tiền lĩnh ngộ | “Mua hiểu biết” bằng 100 nguyên liệu |
| Pháp bảo | Quyền riêng từng món | Instance/sở hữu/refine/mode | Cảnh giới, toàn bộ tri thức hoặc skip encounter |

VP2 chung cho cả ba. Khác biệt nhẹ: WL đọc dấu; TDN tách điều kiện tool với giới hạn hiện diện; LMW nhận biết chuẩn bị. Không cần code 3 recipe/cơ số thưởng khác nhau hoặc gọi cả ba cùng học nghề luyện đan.

Trong nhánh công cụ EX, sau VP3 mới thử một cặp build có đánh đổi theo [kế hoạch nội dung](RPG-CONTENT-PLAN.md). Mỗi effect mới phải chỉ ra thời điểm/counterplay/khả năng đổi ngoài combat và tương tác với cooldown; không gắn item tag để tự sửa damage toàn bộ R01.

## 10. Nền kinh tế và online trước nguồn lặp

- **Bound trước, trade sau:** lát đầu không chợ, không giá bán NPC, không salvage. Nguồn cấp–tiêu theo hồ sơ; cùng avatar không cùng stock.
- **Không bắt tranh spawn:** nguồn bài đầu riêng theo quyền, không last-hit. Farm chung sau cần contribution, reset cycle theo server, giới hạn và chống AFK/bot.
- **Dừng nguồn vô nghĩa:** sau có đủ tool và chưa có hoạt động lặp dùng vật liệu, không daily ép tích kho. Mở thêm nguồn khi có nội dung tiêu thật; không biến hỏng đồ thành sink phạt ngẫu nhiên.
- **Trade cần giá trị thật:** chỉ mở nếu có nhu cầu giữa người chơi, ownership/binding/fingerprint/atomic transfer/audit. Recipe không được giặt đồ bound thành đồ unbound.
- **Không tự sửa clock:** thời điểm chế/niêm/nhận đều server; chưa offline sản xuất/thu hoạch. Cơ chế thời gian châu là nguồn truyện riêng, không máy in vật liệu cho toàn server.
- **Proof/cargo khác item:** tách thành quả nhiệm vụ đã lưu khỏi vật đang mang; lỗi transfer không có hai room cùng tiêu/ghi stock.

## 11. Điều kiện chốt bản thiết kế này

Các quyết định cụ thể đề xuất để thử: 8 định nghĩa mới, 5 recipe hữu hạn, EX01–EX04 sau HN12, tool không chiếm hotbar/không MP và main quest không bắt craft. Chưa ownerApproved/balanceApproved.

Trước code VP2/3 phải có: release vùng/điểm và hai tuyến thật; policy thất bại/chuyển cảnh; codec/container phù hợp; cách xác nhận nguồn; action ngữ cảnh; duration/feedback tool; xử lý craft sai thứ tự/nguồn lặp nếu mở; giới hạn art/performance. [Lộ trình sản xuất](ITEM-PRODUCTION-PLAN.md) chia việc và acceptance. Không tăng phạm vi RM1 để code tất cả chỉ vì catalog đã chi tiết.
