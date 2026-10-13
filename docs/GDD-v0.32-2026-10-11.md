# GDD — Vân Hải Đạo Đồ: MMORPG Tu Tiên

> **Bản lưu lịch sử trước đợt thiết kế 13/10/2026.** Bản thiết kế đề xuất mới: [GDD 0.33](GDD.md). Các ghi chú runtime 12/10 trong bản lưu phản ánh nội dung có tại lúc sao lưu.

**Bản trải nghiệm 12/10/2026 theo phạm vi owner chọn:** đã tích hợp [Hằng Nhạc HN01–HN12 và nhánh EX01–EX04](HANG-NHAC-CHAPTER-RUNTIME.md), sáu công thức, save/proof/checkpoint server và bộ pixel Vương Lâm mới. Các đoạn “chưa mở runtime” ở ghi chú nghiên cứu 10–11/10 bên dưới ghi trạng thái lúc thiết kế; xem tài liệu bản trải nghiệm để biết phần đã triển khai và phần còn thử. Map ngoại vi/ART hai nhân vật còn lại/tăng chỉ số M03–M04 vẫn cần hoàn thiện, không suy duyệt toàn bộ GDD từ tích hợp.

**Nhận diện 10/10/2026:** owner chốt tên **Vân Hải Đạo Đồ**, câu dẫn **“Đạo chưa có đường. Ta tự mở.”** Các ý tưởng mới về ân oán, mưu trí vượt cảnh giới và tự lập đạo đang ở bước thiết kế, chưa là gameplay đã triển khai. Đổi tên game chưa thay bộ ba nhân vật hoặc tuyến Hằng Nhạc hiện hành; các nhắc tới Tiên Nghịch bên dưới là nguồn truyện tham khảo.

**Đạo lộ/UI 11/10 theo yêu cầu owner:** từ **Hóa Thần** có chức năng **Đọa Ma**; khi trạng thái Đọa Ma được kích hoạt, UI–HUD chuyển sang bộ tương ứng. Đã vẽ mới hai bộ [Tu Đạo/Đọa Ma](design/ui/dao-dual-theme-v1/README.md) để đối chiếu theo map, [contract trình bày/backend](DAO-UI-SYSTEM.md) giữ trạng thái do server xác nhận. Chưa gameplay/cảnh giới/migration Đọa Ma, chưa chốt chi phí/tác động/hoàn nguyên hoặc duyệt ART mới; không biến hồ sơ nhập môn thành Hóa Thần từ lựa chọn preview.

**Phiên bản:** 0.32 · **Cập nhật:** 11/10/2026 · **Tên game:** Vân Hải Đạo Đồ.

**Trọng tâm MMORPG owner làm rõ 11/10:** tu tiên/tu đạo phải dẫn tới **sức mạnh có ý nghĩa, farm đồ và xây build, PvE/PvP, sưu tập và thể hiện nhân vật** qua trang bị, thời trang, tọa kỵ, pháp bảo và thành tựu. Đây là hướng sản phẩm đã chốt; điều kiện mở, luật loot/PvP, chỉ số, monetization và ART vẫn cần đặc tả/chơi thử. [Kế hoạch xuyên suốt](MMORPG-PROGRESSION-PLAN.md) nối từng chặng tu luyện với hoạt động, nguồn sức mạnh và diện mạo; [hợp đồng Core/backend](MMORPG-SYSTEM-CONTRACTS.md) ghi phần nền cần mở rộng. Cốt truyện/Đạo đồ tạo động lực và ghi hệ quả trong vòng MMORPG này.

**Tổ chức dữ liệu nội dung:** [taxonomy](GAME-CONTENT-TAXONOMY.md) phân loại nhiều trục theo domain, [control plan](GAME-CONTENT-CONTROL-PLAN.md) tách definition/sở hữu/simulation và nối Core/release/migration; [sổ catalog khởi đầu](design/systems/content-registry-v1/README.md) kiểm kê 48 record/45 quan hệ có kiểu từ code và đề xuất đã biết. Sổ là tham chiếu thiết kế, không loader hoặc nguồn gameplay mới; giữ ID/receipt/balance hiện hành.

**Registry catalog đã triển khai:** [schema/validator/Core/API và màn quản trị v1](GAME-CONTENT-CATALOG-RUNTIME.md) đọc sổ, kiểm ID/reference/source, tra cứu theo nhóm/nhóm con/trạng thái và xem nguồn–nơi dùng. Chỉ role admin có quyền đọc; không CRUD/publish/GM grant hoặc tự cấp gameplay từ các dòng đề xuất.

**Nhánh vật phẩm/luyện chế:** [nguồn Tiên Nghịch và reference đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md) bổ sung 3 game cùng sổ đọc 12 trang chương có giới hạn; [thiết kế item/crafting](ITEM-CRAFTING-DESIGN.md) có nguồn–công thức–công cụ–hoạt động hậu nhập môn, và [kế hoạch sản xuất VP0–VP4](ITEM-PRODUCTION-PLAN.md) chia đầu việc/asset/nghiệm thu. Ngày 12/10 theo ưu tiên owner đã tạo [bộ ART Vân Ngọc đầu tiên](design/gameplay/van-ngoc-gameplay-assets-v1/README.md): 11 trạng thái icon, ba đạo cụ và sáu công thức đối chiếu đúng plan, chờ duyệt hình. Nội dung mới là sáng tạo đề xuất, chưa đổi balance HN hoặc mở runtime luyện chế; các gói VP là nhánh của RM, không yêu cầu làm crafting đầy đủ trước HN05.

**Đợt nghiên cứu nội dung:** owner yêu cầu đào sâu game tu tiên và cốt truyện để thiết kế nhiệm vụ, tiến trình, đồ, thuật/pháp bảo có bản sắc. [Nghiên cứu nguồn](XIANXIA-GAME-RESEARCH.md), [hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md) và [kế hoạch nội dung](RPG-CONTENT-PLAN.md) bổ sung RM0. Ý tưởng mới là ứng viên để chọn, **không tự thay canon/roster, khóa số liệu hoặc trở thành feature đã duyệt**.

**Bước thiết kế tiếp theo đã bắt đầu:** [Chương Hằng Nhạc phương án A](HANG-NHAC-CHAPTER-PLAN.md) cụ thể hóa trục truyện/Đạo đồ thành graph, thẻ HN05–HN12, nhánh bộ ba và storyboard; [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) ghi đồ thật/đồ dự kiến, nền vận hành, quyền R01 và vòng luyện hóa. Các thay đổi so với bản cơ sở (như HN06 sau M02) được đánh dấu là đề xuất để đánh giá, chưa đổi runtime hoặc duyệt balance/ART.

**Hướng triển khai mới đã được owner đồng ý:** thiết kế rõ hệ thống nhân vật và nhiệm vụ trước khi mở rộng HN05. Thiết kế khung dài hạn, đặc tả chi tiết cho Hằng Nhạc và triển khai từng vòng chơi; không xây toàn bộ MMO hoặc sáu cây nâng cấp trước trận đầu. Sự đồng ý này không tự khóa số liệu, policy mới hoặc duyệt ART.

Người chơi chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển ngay từ đầu**, cùng trải qua map nhập môn **Hằng Nhạc và giai đoạn Ngưng Khí**, sau đó phát triển con đường riêng từ hành trình **Trúc Cơ** trở đi. Game là MMORPG web có chiến đấu chủ động, khám phá, nhiệm vụ và tu luyện idle. Cốt truyện Tiên Nghịch làm nền; cách tổ chức ba nhân vật cùng nhập môn là chuyển thể của game.

GDD này thay hướng “tạo đệ tử riêng, Vương Lâm là NPC trung tâm” và phạm vi “kết thúc tại Ngưng Khí tầng 1” của bản trước. [Bản cũ](archive/design-before-three-playable-characters/GDD.md) được giữ làm lịch sử. Lần biên tập này không triển khai gameplay hay thay các gói ART đã khóa.

**Nền đã có, đối chiếu checkout/hồ sơ 10/10/2026:** map owner và layer/HUD, R01, [HN01–HN02](HANG-NHAC-SECT-RUNTIME.md), [HN03–HN04](HANG-NHAC-LESSONS-RUNTIME.md), [entry tài khoản/server/tạo nhân vật](GAME-ENTRY-BACKEND.md) và [nhân vật/hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md). Entry là nền local, hành trang mới có gear/vật tư đầu; chưa là MMO sản xuất hoặc ba lô/kinh tế tổng quát. HN05–HN12, ngoại vi/chuyển cảnh, M02–M04, pháp khí/khảo nghiệm và offline còn tiếp tục. Số liệu vẫn baseline; đợt biên tập này không chạy kiểm runtime mới.

**Đọc theo thứ tự:** GDD này → [nghiên cứu nguồn](XIANXIA-GAME-RESEARCH.md) / [bản sắc và cốt truyện](VAN-HAI-CREATIVE-DIRECTION.md) → [kế hoạch nội dung xuyên hệ thống](RPG-CONTENT-PLAN.md) → [hệ thống nhân vật](CHARACTER-SYSTEM.md) + [hệ thống nhiệm vụ](QUEST-SYSTEM.md) → [lộ trình RM0–RM6](DEVELOPMENT-ROADMAP.md) → [backlog](MVP-BACKLOG.md). [Trạng thái dự án](PROJECT-STATUS.md) và hồ sơ runtime mô tả cái đã có; bản thiết kế mô tả cái cần xây. Lộ trình mới thống nhất các bước Hằng Nhạc và E0–E5, không làm lại entry/hành trang đã triển khai.

## 1. Quyết định đã chốt và phần còn thiết kế

| Nội dung | Hướng hiện hành | Trạng thái |
| --- | --- | --- |
| Thể loại/nền tảng | MMORPG tu tiên có idle, trình duyệt web | Đã chốt |
| Nhân vật | Vương Lâm / Tư Đồ Nam / Lý Mộ Uyển đều chọn được từ đầu | Đã chốt; không chờ arc sau mới mở lựa chọn |
| Map đầu | Hằng Nhạc, học game và tiến triển qua Ngưng Khí | Đã chốt |
| Chia cảnh Hằng Nhạc | Khu môn phái sinh hoạt/chuẩn bị → map ngoại vi farm riêng; khảo nghiệm vào phiên riêng | Chủ dự án chốt 08/10/2026; chưa triển khai chuyển cảnh hoặc khóa loot/spawn |
| Phân hóa | Nền nhập môn chung, dấu nhận diện nhẹ; phân hóa sâu sau map đầu, từ Trúc Cơ | Đã chốt về hướng; kỹ năng cụ thể chưa khóa |
| Skill khởi đầu | Cả ba có Kiếm Khí, Lôi Ấn, Ngự Phong Bộ R01 khi bắt đầu điều khiển | Đã chốt bộ chung; tutorial dạy vận dụng, không giữ quyền skill sau nhiệm vụ |
| Tu tiên | Cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ, hành trình cá nhân | Đã chốt khung; luật chi tiết là thiết kế cơ sở để đánh giá |
| Truyện | Theo nền nguyên tác rồi mở rộng; ghi rõ sáng tạo/chuyển thể | Đã chốt |
| ART | Pixel art chibi, nền stylized 2D, top-down ba phần tư; portrait/truyện/UI tranh mực và giấy cổ | Giữ quyết định hiện có |
| VFX | PNG frame-by-frame 24 FPS; bộ Kiếm/Lôi/Phong có tới Hóa Thần | Đợt ART đã duyệt/đóng; không phải gameplay đã tích hợp |
| Online | Máy chủ sở hữu tiến trình, tài nguyên, vị trí và kết quả hợp lệ | Giữ hướng online; đặc tả nghiệp vụ còn cần hoàn thiện |
| Công nghệ | TypeScript + Three.js; backend thử TypeScript + Node.js + Colyseus | Đã chọn cho preview/bản thử |
| Hồ sơ nhân vật | Account/realm/character khác avatar; một nhân vật điều khiển tại một thời điểm | Entry local đã có: mặc định 3 slot/realm, admin cấu hình, nhiều hồ sơ cùng mẫu; chuyển realm/kho chung/claim guest chưa có |
| Đồ nhập môn | Hai gear và vật tư thật, mang/tháo/bảo vệ/dùng theo server | Đã có pilot; owner chọn giữ max HP/MP hiện tại, chưa bonus/loot/container tổng quát |
| Thứ tự phát triển | Chốt khung nhân vật + nhiệm vụ + dữ liệu UI → nền tối thiểu → HN05 | Owner đồng ý hướng; chi tiết mới cần đánh giá theo gate roadmap |
| Cân bằng và nội dung chi tiết | Phân bổ tầng vào map, chi phí, stat, thời lượng, đối thủ, nhiệm vụ và phần thưởng | Có bảng thử ở hồ sơ tiến trình; chưa chốt, không kế thừa tự động số liệu cũ |
| Farm và sức mạnh | Đồ/nguyên liệu có nguồn lặp, nơi dùng và tác dụng build; mạnh hơn mở nội dung và phương án chơi | Owner chốt trọng tâm 11/10; loot/stat/nguồn–chi chưa khóa, gear pilot hiện vẫn không bonus |
| PvE/PvP | Sức mạnh, chuẩn bị và thao tác được vận dụng trong đấu quái/boss và giao chiến người chơi | Owner chốt mục tiêu; pilot farm/tỷ thí sớm sau nền đủ, party/credit/ruleset cần đặc tả |
| Sưu tập/hiện diện | Trang bị, thời trang, tọa kỵ, pháp bảo, danh hiệu/thành tựu tạo dấu nhận diện cho người khác thấy | Owner chốt hướng; quyền sở hữu/skin/hiệu lực và ngân sách ART chưa khóa |
| Kinh tế/xã hội | Nguồn–chi farm, phối hợp, trao đổi và hoạt động tông môn phục vụ vòng chơi | Phạm vi và policy mở từng gói; chưa có chợ/trade/bang chiến runtime |

“Đã chốt hướng” không đồng nghĩa tính năng đã triển khai. Bảng số liệu và quy tắc mới chỉ được khóa sau đặc tả, prototype và đánh giá.

## 2. Trải nghiệm cốt lõi

Người chơi nhận ra mình đang điều khiển ai, hiểu bình cảnh và chủ động chuẩn bị để vượt qua. Tích lũy, farm đồ và lựa chọn công pháp–thuật–pháp bảo tạo sức mạnh nhận thấy được: vượt đối thủ trước đó khó, tiếp cận vùng/boss mới, có vai trò trong nhóm và tranh tài với người khác. Chỉ số mạnh hơn và cách vận dụng mới phải có nơi sử dụng; diện mạo và thành tựu giúp người khác nhận ra hành trình đã đạt.

Nguyên tắc:

1. **Nhập môn dễ hiểu:** dạy từng hệ thống qua nhiệm vụ; không đưa nhiều cây kỹ năng và sáu thanh tích lũy ngay đầu game.
2. **Cảnh giới đổi khả năng:** đại cảnh giới mở cách vận dụng mới, không chỉ nhân HP/sát thương.
3. **Bản sắc nhân vật:** chung khung tu luyện nhưng khác cơ duyên, trạng thái và cách giải bình cảnh.
4. **Lựa chọn có tác dụng:** tổ hợp công pháp–thuật–pháp bảo có đánh đổi; lựa chọn đầu tiên thử/chỉnh được trước đầu tư sâu.
5. **Idle hỗ trợ chơi trực tiếp:** tích lũy và chuẩn bị; truyện, khảo nghiệm, lĩnh ngộ then chốt và đột phá cần tương tác.
6. **Nội dung đi trước mở khóa:** có ART không tự cấp hiệu lực kỹ năng/cảnh giới.
7. **Mạnh lên có đích dùng:** mỗi chặng có PvE, cơ hội tranh tài và phần thưởng sưu tập phù hợp; không để farm chỉ phục vụ một con số hoặc truyện kết thúc là hết việc chơi.

### 2.1. Giả thuyết bản sắc cần kiểm chứng

Đề xuất nét riêng trong nội dung truyện: **manh mối → chuẩn bị → vận dụng → hệ quả → con đường tiếp**. Ba ứng viên là Đạo đồ ghi điều đã kiểm chứng, nhân duyên hữu hạn nhớ lựa chọn, và pháp khí mở cách tiếp cận/khám phá. Khuyến nghị chọn Đạo đồ làm nét truyện chính, thử một hậu quả quan hệ sau; không làm đồng thời simulation NPC, cây đạo đức và cả hệ pháp bảo khám phá. Những ứng viên này hỗ trợ vòng mạnh lên–farm–PvE/PvP–sưu tập, không thay mục tiêu MMORPG owner vừa làm rõ.

Đây là tổng hợp thiết kế từ các nguồn ở [nghiên cứu](XIANXIA-GAME-RESEARCH.md), không tuyên bố cơ chế độc nhất thị trường. [Tuyến “Dấu sai trên vân lộ”](VAN-HAI-CREATIVE-DIRECTION.md) là câu chuyện sáng tạo ứng viên nối vật liệu–tri thức–bình cảnh, chưa là chính tuyến được duyệt. Giữ HN01–HN04 và nguồn thưởng cũ; không thêm EXP mới chỉ vì thêm nhánh thoại.

**Cần chọn D09–D12:** mức nguyên tác/chuyển thể hoặc hướng IP độc lập dài hạn; nét riêng ưu tiên; nhịp chương/15 tầng; phạm vi nội dung chung và cá nhân. Trước khi quyết định khác, tiếp tục bộ ba/Hằng Nhạc hiện hành. Tên game mới không tự chuyển quyền sử dụng nhân vật/truyện; cần rà phạm vi/quyền khai thác trước phát hành.

## 3. Ba nhân vật và ranh giới chuyển thể

### 3.1. Lựa chọn từ đầu

Màn chọn có cả ba, giới thiệu danh tính, trạng thái nhập môn và hướng phát triển về sau. Không bắt hoàn thành Vương Lâm để mở hai người còn lại. Không mặc định gacha, nhân vật trả phí hoặc đổi nhân vật tự do giữa trận.

| Nhân vật | Hằng Nhạc: chung nền, khác nhẹ | Sau nhập môn: hướng thiết kế, chưa phải danh sách thuật đã duyệt |
| --- | --- | --- |
| Vương Lâm | Học dùng linh lực, thuật cơ bản, quan sát và khảo nghiệm; cơ duyên châu ở mốc riêng | Đấu pháp, thần thức, cấm chế, lĩnh ngộ và truyền thừa theo truyện |
| Tư Đồ Nam | Linh thể bị hạn chế hiện diện/thi triển; dùng phần năng lực hiện có để học thao tác chung | Khôi phục trạng thái, năng lực và quyền tiếp cận thuật pháp |
| Lý Mộ Uyển | Tự chiến đấu được; dấu nhận diện nhẹ qua dược liệu, đan hoặc phù/trận đơn giản | Đan–trận, chuẩn bị chiến đấu, bảo vệ/kiểm soát khu vực và phối hợp |

Không khóa ba người thành kiếm sĩ / pháp sư lôi / người chỉ hồi máu. Tên công pháp, tác dụng và build phải được biên tập theo nhân vật và nguồn truyện.

### 3.2. Hằng Nhạc chung không phải lịch sử nguyên tác

Không kể ba người vốn cùng nhập môn Hằng Nhạc trong truyện. Dùng mở đầu gameplay chung và các cảnh cá nhân có nguồn. Lý Mộ Uyển chơi được từ đầu không chuyển mốc gặp đầu trong nguyên tác sang Hằng Nhạc.

Tư Đồ Nam không mất kiến thức để trở thành tu sĩ Ngưng Khí mới. Tiến trình nhập môn chung của ông biểu thị **khả năng hiện diện/thi triển đang phục hồi**. UI phân biệt trạng thái/cảnh giới trong truyện với mốc gameplay, không ghi cảnh giới nguyên tác của ông là Ngưng Khí. Chi tiết tại [hệ thống tu tiên](CULTIVATION-SYSTEM.md).

Nguồn truyện, tiến trình gameplay và trạng thái dùng trong chế độ chơi là ba thông tin khác nhau. Tuyến thay số phận hoặc phát triển ngoài mốc nguyên tác phải ghi là mở rộng game; không tự áp kết thúc mới vào chính truyện.

### 3.3. Nhiều người cùng chọn một nhân vật

Mỗi hồ sơ là một phiên trải nghiệm của tài khoản, không phải một nhân vật mới được thêm vào canon. Khu chung dùng tên hồ sơ/biệt danh và nhãn nhân vật; không cần công khai tên đăng nhập tài khoản. Chương cá nhân/tổ đội theo tiến trình của người tham gia; hoàn thành chương của một người không thay tiến trình toàn server hoặc số phận NPC ở mọi phiên.

## 4. Vòng chơi

**Mục tiêu truyện hoặc hoạt động → khám phá/PvE/farm → đồ, nguyên liệu hoặc tri thức → chuẩn bị/build/tu luyện/luyện hóa → kiểm sức mạnh trong PvE/PvP → giải bình cảnh/đột phá hoặc hồi phục → mở nội dung và diện mạo mới → hành trình tiếp.**

Idle đã chọn hỗ trợ tích lũy; không thay vòng khám phá và khảo nghiệm.

Vòng ngắn: một trận/lượt farm, nhiệm vụ, lần luyện thuật hoặc điều chỉnh chuẩn bị. Vòng trung: kiếm một món, thử tổ hợp, đánh boss hoặc tỷ thí/hoạt động nhóm. Vòng dài: vượt bình cảnh, mở chặng mới, xây con đường riêng và bộ sưu tập có dấu nhận diện. Nhịp lặp cần có nguồn–chi và hoạt động thật, không phát lại thưởng nhiệm vụ độc hữu.

[Kế hoạch nội dung](RPG-CONTENT-PLAN.md) nối mỗi chặng với câu hỏi người chơi, hành động, quyền/tri thức/đồ nhận được, nơi dùng tiếp và phạm vi sản xuất. Gear nền, vật tư, nguyên liệu, tín vật, phương pháp và pháp bảo có vai trò khác nhau; mỗi món cần nguồn–chi và điều kiện sử dụng. Công pháp đổi cách vận hành, thuật là hành động, lĩnh ngộ là kết quả kiểm chứng; không tất cả cùng thành bonus damage. Chưa gán thời lượng; mục tiêu 30–45 phút/tầng 1 và chu kỳ 10 giây của thiết kế trước chỉ là lịch sử.

## 5. Hằng Nhạc — nhập môn qua Ngưng Khí

Trải nghiệm, tuyến nhiệm vụ, bình cảnh, khảo nghiệm và điều kiện xuất hành được đề xuất tại [Đặc tả Hằng Nhạc — Ngưng Khí v0.4](HANG-NHAC-NGUNG-KHI-SPEC.md). [Gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md) xác định bộ khởi đầu và luật skill; [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md) bổ sung ngưỡng, nền vận hành, vật tư/idle; [đối thủ và HN10](HANG-NHAC-ENCOUNTERS-TRIAL.md) đề xuất AI, ba pha, checkpoint và luật kết nối lại. Chi tiết mới cần đánh giá; chưa xác nhận gameplay đã triển khai.

Hằng Nhạc là vùng có thể đi lại, gặp người chơi/NPC, nhận nhiệm vụ, tu luyện và thử chiến đấu. Đồ thị chín node truyện cũ không phải map online đã hoàn thiện.

**Quyết định bổ sung 08/10/2026:** concept hiện tại là khu môn phái sinh hoạt: NPC, nhiệm vụ, tu luyện, luyện thuật và chuẩn bị. Khám phá/đánh quái/thu tài nguyên nằm trong map ngoại vi riêng, nối qua lối ra và cho quay lại môn phái ngay trong giai đoạn Ngưng Khí; không phải đợi hoàn thành Hằng Nhạc. Khảo nghiệm dùng phiên riêng. Lối ra ngoại vi khác với xuất hành HN12 sang hành trình sau nhập môn; quyền mở khu/nhiệm vụ, spawn, loot và hình thức chia sẻ farm vẫn cần thiết kế. Chủ dự án chọn tỷ lệ vật thể/nhân vật tương ứng nền concept 2×, giữ sprite/camera chơi 1×; không lấy hệ số này làm quyết định kích thước map cuối.

Map Hằng Nhạc đã tích hợp: nền owner 3072 × 2048, 9 blocker, Spawn (1616,992), camera 1×; [scene 22 object/32 part/10 cover](HANG-NHAC-HUD-LAYERS.md) đã có y-sort/alpha. Không còn ở bước chờ nạp map hoặc chờ làm che người. [Kế hoạch tích hợp gốc](HANG-NHAC-IMPLEMENTATION-PLAN.md) giữ lịch sử các bước.

Ưu tiên hiện tại là **RM0: chốt nhân vật/nhiệm vụ và đặc tả HN05 trước mở rộng gameplay**. Khi làm ngoại vi, giữ quy trình [concept tổng → owner chốt navigation → asset/layer](MAP-CONCEPT-SECTOR-WORKFLOW.md); không tự sửa blocker Hằng Nhạc hoặc dùng tọa độ [HN-Z v0.1](HANG-NHAC-MAP-LAYOUT.md) thay dữ liệu owner. Bộ concept/nền sạch/ba asset thử đã [xóa](data/hang-nhac-review-reset-2026-10-08.json), không khôi phục.

| Chặng | Nội dung cần học | Kết quả |
| --- | --- | --- |
| Vào Hằng Nhạc | Chọn nhân vật, di chuyển, tương tác, mục tiêu | Biết danh tính và trạng thái nhập môn |
| Chuẩn bị tu luyện | Tài nguyên, công pháp nền, thổ nạp | Hiểu tích lũy; Tư Đồ Nam có diễn giải hồi phục riêng |
| Luyện thuật | Kỹ năng nền, linh lực, khoảng cách, né đòn | Tự vượt khảo nghiệm chiến đấu đơn giản |
| Tiến triển Ngưng Khí | Nhiệm vụ môn phái, luyện tập, đồ/pháp bảo nền | Vận dụng ổn định, đọc được điều kiện bình cảnh |
| Khảo nghiệm cuối | Vận dụng điều đã học, không chỉ kiểm tu vi | Đủ năng lực hoàn thành nhập môn |
| Rời map | Chốt nhập môn, mục tiêu chuẩn bị Trúc Cơ | Bắt đầu tuyến riêng; không tự đột phá chỉ vì qua cổng |

Đạt Ngưng Khí tầng 1 là mốc sớm, không phải kết thúc map. Nguyên tác nêu 15 tầng tại [chương 17](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17). Đề xuất map chuyển thể bao phủ hết 15 tầng, bốn mốc trải nghiệm tương ứng 1/3/9/15; Tư Đồ Nam dùng nhãn hồi phục. Phạm vi này, ngưỡng và số liệu chưa được duyệt chi tiết; không kể đó là hành trình Hằng Nhạc giống nguyên tác.

Cả ba có **Kiếm Khí, Lôi Ấn và Ngự Phong Bộ bản R01** làm skill khởi đầu ngay khi bắt đầu điều khiển. HN03/04 hướng dẫn sử dụng, HN09 luyện phối hợp; không cần làm nhiệm vụ để mới được quyền học ba thuật này. Bộ chung là chuyển thể gameplay, không phải ba class hoặc ba công pháp canon. Cả ba tự hoàn thành được nhiệm vụ đơn lẻ, có lời dẫn/biểu hiện và dấu nhận diện nhẹ; phân hóa sâu sau map đầu. Slot toàn game, tác dụng và số liệu cần đánh giá theo hồ sơ; R02–R05 không tự cấp ở Hằng Nhạc.

Điều kiện hoàn thành đề xuất: tuyến chung và đoạn nhận diện riêng đã xong, đạt mốc Ngưng Khí/hồi phục tương ứng, sử dụng được năng lực nền, vượt khảo nghiệm cuối, hiểu mục tiêu kế tiếp; máy chủ xác nhận mốc và thưởng một lần.

## 6. Sáu phần phát triển tu tiên

| Phần phát triển | Ý nghĩa trong game | Quan hệ |
| --- | --- | --- |
| **Cảnh giới** | Năng lực tu luyện và những khả năng có thể tiếp cận | Điều kiện năng lực; không thay công pháp, thành thạo hoặc điều kiện truyện |
| **Công pháp** | Cách hấp thu, vận hành và sử dụng sức mạnh | Định hướng tu luyện và cách vận dụng các thuật |
| **Thuật pháp** | Bộ kỹ năng chiến đấu, phòng thủ, di chuyển và hỗ trợ | Học, luyện và lựa chọn; cần nền tảng hoặc cơ duyên phù hợp |
| **Pháp bảo** | Công cụ tạo thêm cách chơi, được tìm kiếm, luyện hóa và sử dụng | Bổ sung khả năng; có giới hạn vận dụng và điều kiện sở hữu |
| **Lĩnh ngộ** | Hiểu công pháp, giải quyết bình cảnh và hình thành nhận thức về đạo | Trải nghiệm có nghĩa mở cách dùng hoặc giải yêu cầu đột phá |
| **Hành trình cá nhân** | Cơ duyên, quan hệ, truyền thừa và biến cố quyết định hướng phát triển | Cho ngữ cảnh/quyền tiếp cận và khác biệt giữa nhân vật |

Sáu phần không phải sáu loại EXP hoặc sáu tiền tệ bắt buộc farm. UI mở dần. [CULTIVATION-SYSTEM.md](CULTIVATION-SYSTEM.md) chi tiết hóa trạng thái, cách phát triển, quan hệ và ví dụ.

Khung đầu: **Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần**. Anh Biến/Vấn Đỉnh và giai đoạn sau là định hướng dài hạn; chưa mở đợt sản xuất mới. [Chương 20](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-20), [chương 410](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-410).

| Mốc gameplay | Thay đổi trải nghiệm đề xuất |
| --- | --- |
| Ngưng Khí | Học nền, linh lực, thuật và khảo nghiệm |
| Trúc Cơ | Bắt đầu công pháp/tổ hợp riêng; khám phá/chuẩn bị có trọng tâm |
| Kết Đan | Năng lực chủ đạo rõ, phối hợp công pháp–thuật–pháp bảo |
| Nguyên Anh | Nội dung thần thức/linh hồn phù hợp nhân vật và nguồn |
| Hóa Thần | Lĩnh ngộ/ý cảnh thay đổi cách vận dụng sức mạnh |
| Về sau | Vòng chơi mới theo arc và nguồn sức mạnh; thiết kế riêng |

Đây là mục tiêu gameplay, không tự cấp phân thân/triệu hồi/bất tử từ tên cảnh giới. Cổ Thần/Cực Cảnh của Vương Lâm có hồ sơ riêng khi tới mốc; không biến thành bậc EXP chung của cả ba.

### 6.1. Hợp đồng hệ thống nhân vật

[CHARACTER-SYSTEM.md](CHARACTER-SYSTEM.md) cụ thể hóa sáu phần thành bốn lớp: danh tính/diễn giải; tiến trình bền; năng lực tính từ nguồn; trạng thái hoạt động. Tách tu vi, tầng đã xác nhận và mốc trải nghiệm: tầng 3 không tự là M02, nhặt đồ không tự là đã luyện hóa, có quyền skill không phụ thuộc hoàn thành tutorial.

Nguồn stat phải truy được: baseline, mốc, công pháp, trang bị/pháp bảo và hiệu ứng hợp lệ. Nguồn chưa mở không có bonus; không đưa số liệu preview vào runtime. Trước mở tăng trưởng M02 cần chốt tác dụng và cách xử lý HP/MP/cooldown; đợt nền giữ HP/MP, quyền R01 và đồ/save hiện tại.

### 6.2. Vật phẩm, nguyên liệu và pháp bảo theo chặng

[Thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md) tách gear, nguyên liệu, thành phẩm tiêu hao, pháp khí, công cụ khảo sát, cơ sở, công thức và chứng từ. Mỗi món có nguồn/chủ/đích dùng/điều kiện/đánh đổi/vòng đời; không gộp thành một bảng phẩm màu. Bảo toàn R01, gear và vật tư hiện có.

Phạm vi đề xuất: HN05 chỉ nguyên liệu nhiệm vụ; HN08 một phôi→một ngọc hộ thân; sau HN12 mới thử 5 nguyên liệu thường + mực + hộp giữ khí + Định Lưu Bàn trong một chuỗi hữu hạn EX01–EX04. Mỗi việc có đường thủ công, không công cụ/recipe bắt buộc để hoàn tất tuyến HN. Nguồn lặp, giá bán/giao dịch, gear có lựa chọn, bản mệnh/khí linh là các gói về sau có gate riêng, không tự phát sinh từ catalog.

Nguyên tắc lấy từ nghiên cứu: sở hữu khác nhận biết/vận dụng; giá trị phụ thuộc tình huống; cơ duyên có giới hạn. Không lấy khả năng thời gian của châu làm idle/nguồn nguyên liệu chung. [Lộ trình sản xuất](ITEM-PRODUCTION-PLAN.md) nối content, migration, source/receipt, UI và ngân sách asset; không sinh ART chỉ để lấp icon.

### 6.3. Hợp đồng hệ thống nhiệm vụ

[QUEST-SYSTEM.md](QUEST-SYSTEM.md) tách **định nghĩa → tiến trình hồ sơ → attempt hoạt động**. Nhiệm vụ có prerequisite, mục tiêu, nguồn bằng chứng, credit, completion/reward/retry policy; UI chỉ chiếu trạng thái server. Đủ mục tiêu, chờ xác nhận và đã lưu thưởng là ba thông tin khác nhau.

HN01–HN04 là trường hợp kiểm khung chung, không bị viết lại chỉ để giống engine mới. HN05 dùng khung này nối chuyển cảnh/encounter/tài nguyên/M02. Đề xuất đầu là encounter cá nhân trên tuyến ngoại vi; farm chung và tổ đội cần luật credit/loot riêng. Giữ receipt lần đầu cả khi client đổi request ID; cùng quest ở hai hồ sơ cùng avatar vẫn riêng.

## 7. Tu luyện, bình cảnh và đột phá

Thiết kế cơ sở cho đại đột phá:

1. **Tích lũy:** đủ tu vi/tài nguyên phù hợp; tu vi khác linh lực tiêu trong trận.
2. **Năng lực:** hiểu công pháp, đạt luyện thuật/khảo nghiệm nếu mốc yêu cầu.
3. **Hành trình:** cơ duyên hoặc mốc riêng khi có căn cứ.
4. **Chuẩn bị:** thấy chi phí, điều kiện thiếu, tác dụng và rủi ro đã biết.
5. **Chủ động vượt mốc:** khảo nghiệm/bế quan hoặc hồi phục được xác nhận.
6. **Ổn định:** làm quen năng lực mới, lưu kết quả một lần và mở mục tiêu tiếp.

Không bắt mọi tầng nhỏ trải qua đủ quy trình đại cảnh giới. Không áp xác suất thất bại/thiên kiếp chung; rủi ro nếu có phải có nguyên nhân, cách chuẩn bị và hệ quả rõ. Chưa chốt chết vĩnh viễn, mất cảnh giới hay phá vật phẩm.

Idle không tự đột phá vì đủ thời gian. Mốc hồi phục Tư Đồ Nam không viết lại lịch sử cảnh giới; giới hạn chiến lực hiện dùng được phải cân bằng riêng.

## 8. Phân hóa sau Hằng Nhạc

Mở công pháp đặc trưng, cách vận dụng thuật, pháp bảo và tuyến riêng từ hành trình chuẩn bị Trúc Cơ. Khác biệt nằm ở hành động/lựa chọn/chuẩn bị, không chỉ màu VFX.

| Nhân vật | Vòng phát triển đề xuất | Giới hạn |
| --- | --- | --- |
| Vương Lâm | Khám phá/đấu pháp → cơ duyên/tri thức → vận dụng → giải bình cảnh | Không mở Cực Cảnh/Cổ Thần tùy tiện hoặc cho PvP thắng ngay |
| Tư Đồ Nam | Khôi phục trạng thái → hiện diện/thi triển → phục hồi năng lực/thuật | Kiến thức cao không cấp toàn bộ chiến lực lúc đầu |
| Lý Mộ Uyển | Dược liệu/tri thức → đan/trận → chuẩn bị/kiểm soát → giải yêu cầu riêng | Tự chơi được; không chỉ làm kho đan; thuật/ý cảnh sáng tạo không ghi là canon |

Nguồn nền đan–trận: [chương 143](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-143), [224](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-224). Nguồn trạng thái Tư Đồ Nam: [47](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-47). Quãng khắc tượng/lĩnh ngộ Vương Lâm: [271](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-271). Không suy ra cả ba phải làm cùng một thử thách hoặc cùng ý cảnh từ các nguồn này.

## 9. Online, chiến đấu và idle

Hằng Nhạc chung cho thấy nhau, di chuyển và tương tác. Khảo nghiệm/truyện riêng hoặc tổ đội có điều kiện và quyền thưởng riêng; không buộc mọi tài khoản tới cùng chương. Quy mô phòng, quyền loot, ghép nhóm và đồng bộ chương nhóm cần đặc tả.

Máy chủ xác nhận tài nguyên, tu vi, học thuật, pháp bảo, truyện, vị trí, hit/damage và movement/arrival. Gửi lại lệnh/nhiều tab không nhân thời gian, thưởng hay đột phá. Trình duyệt chỉ giữ cache/tùy chọn, không nhập JSON để thay trạng thái hợp lệ.

Idle tiếp tục hoạt động đã chọn, dừng ở thiếu tài nguyên/kho/bình cảnh/cổng tương tác. Không tự hoàn thành truyện, combat, lĩnh ngộ then chốt hoặc đại đột phá. Không mặc định farm combat khi đóng game. Giới hạn 8 giờ cũ chưa được chốt lại cho thiết kế ba nhân vật.

PvP cần hồ sơ riêng: đề xuất nhóm theo năng lực gameplay hiện dùng được, mốc và sức mạnh phù hợp, giữ giá trị gear/build/chuẩn bị trong mode sức mạnh thật. Tỷ thí luyện tập chuẩn hóa, nếu chọn, là ruleset riêng có nhãn; không mặc định chuẩn hóa toàn game. Không lấy cảnh giới canon của Tư Đồ Nam làm quyền ghép đấu hoặc chuyển khả năng đặc biệt trong truyện thành thắng ngay mọi trận online. Giao dịch đan/pháp bảo và kinh tế còn mở.

### 9.1. PvE, farm và PvP xuyên chặng

[Kế hoạch MMORPG](MMORPG-PROGRESSION-PLAN.md) là ma trận thiết kế Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần, không thêm tier ngoài nguồn hoặc ngày phát hành. Nhập môn vẫn có đường solo. Sau HN05/nền RM2 đủ ổn có thể chọn một pilot farm/PvE lặp và tỷ thí tự nguyện theo gate RM5-A/B, chạy cùng nhánh nội dung; không đợi làm xong chợ/tông môn/crafting lớn hoặc toàn RM5. Boss nhóm, farm chia sẻ, đấu trường và tranh đoạt tài nguyên mở từng gói khi credit/loot/lifecycle và cân bằng đã được kiểm.

HN05/E01 và EX01–EX04 giữ nguồn lần đầu hữu hạn. Nguồn farm lặp có spawn/cycle, grant và nơi tiêu riêng; không reset quest cũ để tạo nguồn. RNG nếu chọn chỉ dùng nơi có đường tiến triển bảo đảm; số drop, chi phí, trần tăng trưởng, mức phạt thua và lịch reset chưa chốt. Chênh lệch sức mạnh có giá trị nhưng nội dung phải nói rõ luật tham gia/ghép đấu/vùng rủi ro; không để PvP tự chặn main quest hoặc săn người mới ở khu nhập môn.

### 9.2. Thành quả được nhìn thấy

Thiết kế tách **đồ có hiệu lực**, **quyền sở hữu ngoại hình** và **diện mạo đang hiển thị**. Trang bị/pháp bảo có thể tạo cả sức mạnh lẫn vẻ ngoài; thời trang/skin là lớp nhận diện. Nếu thêm hiệu lực từ thời trang/tọa kỵ phải có nguồn stat công khai và luật cân bằng riêng, không suy từ tên hoặc độ đẹp. Chưa chốt bán skin, gacha, VIP hoặc bonus sưu tập.

Mỗi chặng chọn một phần thưởng nhìn thấy được phù hợp: vũ khí/pháp khí, trang phục, danh hiệu, tọa kỵ hoặc khí quang. Nguồn có thể là nhiệm vụ, chế tác, boss, thành tựu hoặc tranh tài theo gói đã duyệt. Người chơi cần xem trước/kiếm/mặc/tháo và người khác thấy qua projection công khai; không broadcast inventory riêng. Tọa kỵ cần contract triệu hồi/di chuyển/vùng dùng, ART/layer/pivot và readability riêng; không phóng sprite, đổi camera/hitbox hoặc sửa map owner để lấp tính năng.

## 10. UX và ART

| Khu vực | Nội dung ưu tiên |
| --- | --- |
| Chọn nhân vật | Cả ba từ đầu; danh tính/trạng thái/hướng tương lai; chưa ép build |
| Thế giới | Nhân vật điều khiển, nhiệm vụ, tương tác, thuật đang dùng và linh lực |
| Tu tiên | Mốc cảnh giới/hồi phục, tu vi, công pháp, hoạt động và bình cảnh |
| Thuật/pháp bảo | Nguồn học, điều kiện sử dụng, tổ hợp và lý do khóa |
| Hành trình | Chương riêng, cơ duyên, quan hệ, lĩnh ngộ; nhãn nguyên tác/chuyển thể |
| Farm/build/PvE/PvP | Biết nơi kiếm/đích dùng đồ, chênh lệch sức mạnh, luật tham gia và kết quả thưởng đã ghi |
| Diện mạo/sưu tập | Xem trước/mặc/tháo thời trang/pháp khí/tọa kỵ, nguồn kiếm, danh hiệu và thông tin nhân vật được phép công khai |
| Tài khoản/cài đặt | Kết nối/lưu, slot nếu có, giảm chuyển động và tùy chọn |

Sáu phần tu tiên mở theo nhiệm vụ; không là sáu menu bắt buộc ngay đầu. Tu vi là tiến triển dài hạn, linh lực là nguồn dùng năng lực. Nhãn Tư Đồ Nam biểu thị hồi phục, không kể ông bắt đầu tu lại từ Ngưng Khí.

Đợt UI hiện tại tiếp tục dùng Vân Ngọc/Linh Đài và [quy tắc vùng đọc](GAME-UI-READING.md). C/I/J/NPC đọc cùng hồ sơ/snapshot, có lý do khóa/pending/mất kết nối/đã ghi. Hệ thống quyết định dữ liệu và hành động; UI quyết định bố cục/trình bày, không quyết định thưởng/đột phá. Có thể review màn tương lai bằng fixture riêng, không mở nút gameplay giả hoặc biến bảy ô skill chưa gán thành chức năng chưa có.

Chuẩn VFX hiện có: body tối đa 80 world px, world tham chiếu ART 960×640 (không phải kích thước map Hằng Nhạc), 24 FPS, alpha thường; rìa glow không phải hitbox. Impact dùng cho nhân vật/quái/boss/PvP, không phụ thuộc bia đá. [Bàn giao](design/vfx/STARTER-VFX-HANDOFF.md). Chân dung/diện mạo theo hồ sơ ART đã duyệt; vai gameplay mới không tự đổi nhận diện.

## 11. Phân kỳ kiểm chứng và nghiệm thu

Map qua Ngưng Khí là mục tiêu sản phẩm, không phải cam kết sản xuất toàn map trong một bước. Thay phân kỳ cũ A “không combat, tới tầng 1” / B “thêm một trận” bằng các lát đề xuất:

| Lát | Nội dung | Đánh giá |
| --- | --- | --- |
| A — Lát nhập môn online | Cả ba, Hằng Nhạc, nhiệm vụ/tu luyện đầu và combat đơn giản | Ba lựa chọn vào được; hai tài khoản có tiến trình riêng; hiểu nền |
| B — Hoàn thiện Hằng Nhạc | Ngưng Khí, luyện thuật, pháp bảo nền, khảo nghiệm cuối | Cả ba tự hoàn thành; điều kiện rời map/thưởng nhất quán |
| C — Phân hóa sau map đầu | Chuẩn bị/đột phá Trúc Cơ, công pháp/tổ hợp/tuyến riêng | Khác hành động/lựa chọn; thử/chỉnh hướng đầu được |
| Arc sau | Kết Đan và cao hơn, nội dung nhóm/kinh tế | Vòng chơi, nguồn truyện và ngân sách riêng |

Thứ tự hiện hành nằm ở [lộ trình phát triển](DEVELOPMENT-ROADMAP.md):

| Chặng | Phạm vi | Điểm hoàn tất |
| --- | --- | --- |
| RM0 — đang ưu tiên thiết kế | Trục truyện/bản sắc, hành trình người chơi, catalog đồ/thuật/pháp khí; nối nhân vật/quest/UI/migration và quyết định HN05 | Gói ND1–ND6 đủ phần liên quan cho một slice; tài liệu/ý tưởng chưa duyệt không tự vượt gate |
| RM1 | Nền RPG tối thiểu, tương thích HN01–HN04 và hành trang đã có | Một nguồn dữ liệu, không mất/lặp credit/đồ/thưởng |
| RM2 — kết thúc lát A | HN05, ngoại vi nhỏ, đi/về, E01, tài nguyên nhiệm vụ, M02 | Cả ba chơi trọn từ nhập môn tới trận đầu; lifecycle và nhịp trận được kiểm |
| RM3 — B1 | HN06–HN09: dấu riêng, bình cảnh, pháp khí, phối hợp/M03 | Điều đã hiểu và chuẩn bị làm thay đổi vận dụng |
| RM4 — B2 | HN10–HN12: khảo nghiệm, M04, tổng kết/xuất hành | Đủ phạm vi nghiệm thu toàn Hằng Nhạc |
| RM5 / RM6 | MMO xã hội/kinh tế chọn lọc / phân hóa sau map | Hồ sơ riêng; không bắt hoàn tất mọi tiện ích MMO mới được sang lát C |

Owner đã đồng ý hướng thiết kế hệ thống trước nội dung tiếp; chi tiết các chặng và thời gian chưa là cam kết phát hành. HN05 vẫn là nội dung kế tiếp, không phải lý do để làm toàn bộ framework/kinh tế trước. Sau nền RM2, các pilot RM5-A farm, RM5-B tỷ thí và RM5-C diện mạo có thể được chọn theo phụ thuộc để kiểm sớm mục tiêu MMORPG; không bắt chạy cả ba cùng lúc hoặc thay điều kiện hoàn tất tuyến HN. Hạ tầng vận hành là nhánh song song, có gate riêng trước mở public. Một lát dừng ở tầng đầu không được gọi là hoàn tất Hằng Nhạc.

Nghiệm thu toàn map: ba người chơi được từ đầu; vòng chuẩn bị–tu luyện–luyện thuật–combat; dấu nhận diện riêng nhẹ; khảo nghiệm cuối; kết nối lại/lưu riêng; không thưởng/đột phá lặp; rời map có mục tiêu tuyến riêng. Cân bằng cần chơi thử, không suy từ số atlas hoặc test kỹ thuật.

## 12. Hiện trạng, câu hỏi mở và tài liệu

Catalog locomotion cơ sở có **6 bộ/136 frame**, không đại diện toàn bộ animation hiện có: [skill core](SKILL-CORE.md) đã nối 36 clip cast bộ ba/bốn hướng, [động tác nhiệm vụ](HANG-NHAC-QUEST-MOTION.md) bổ sung chào/vận khí/chưởng/hồi phục. [Runtime Hằng Nhạc](HANG-NHAC-RUNTIME.md), R01 và HN01–HN04 đã có bản thử. [Entry](GAME-ENTRY-BACKEND.md) giữ identity/server/nhân vật và persistence; [hành trang](HANG-NHAC-CHARACTER-RUNTIME.md) có gear/vật tư ban đầu. Không đánh đồng đồ fixture với đồ thật hoặc số room với công suất MMO. Level Design/Map Editor **0.12.0** lưu dữ liệu biên tập, khác save người chơi. Xem [trạng thái](PROJECT-STATUS.md) và giới hạn từng runtime; bản thử không tự khóa cân bằng.

ART Hằng Nhạc v1/v2/v3 và cả hai walk study đã xóa trong đợt dọn ngày 08/10/2026; [biên bản](data/hang-nhac-art-removal-2026-10-08.json) ghi 203 file, gồm 121 PNG. Đợt concept/nền/asset thử sau đó cũng đã xóa theo chỉ dẫn mới; [map đầy đủ hiện hành](design/world/hang-nhac-map-v1/README.md) phục vụ thiết kế navigation trước, asset rời sau. Editor và dữ liệu biên tập của chủ dự án được giữ.

Đợt ART R01–R05 đã chốt **15 skill / 646 PNG / 76 atlas**, gồm frame dùng lại; các gói duyệt giữ nguyên. R01 đã được nối cho bộ ba với cast/động tác bổ sung; điều này không xác nhận đủ animation enemy/pháp khí hoặc runtime R02–R05. Quyền dùng R01 chung giữ nguyên; công pháp/tác dụng/cân bằng và quyền học giai đoạn sau cần hồ sơ riêng.

Còn mở ưu tiên trước HN05: động lực/nội dung đầu của chương, ranh giới nguồn và nét riêng muốn kiểm, rồi cách nối quest cũ, nguồn vật phẩm/container, điều kiện/xác nhận/tác dụng M02, thất bại–mất mạng encounter, map/transfer và E01/ART. [Danh sách D01–D12](DEVELOPMENT-ROADMAP.md) ghi khuyến nghị, trách nhiệm và chặng bị chặn. Các gói ND1–ND6 trong kế hoạch nội dung là đầu ra biên tập, không thêm sáu giai đoạn gameplay. Xa hơn còn phân bổ tầng/thời lượng, bình cảnh/pháp khí, phân hóa, kho chung/chuyển realm, loot/tổ đội/PvP/kinh tế, offline và vận hành sản xuất. Slot/tạo/đổi nhân vật local đã có chính sách entry, không còn là khoảng trống toàn bộ. Không kế thừa 480 tu vi, kho 120/30, 10 giây/chu kỳ hoặc 30–45 phút như số liệu đã duyệt.

Tài liệu hiện hành:

- [Kế hoạch MMORPG xuyên chặng](MMORPG-PROGRESSION-PLAN.md): sức mạnh/build, farm/PvE/PvP, nguồn–chi, sưu tập/thời trang/tọa kỵ/pháp bảo và các pilot trong RM.
- [Hợp đồng Core cho MMO](MMORPG-SYSTEM-CONTRACTS.md): giới hạn schema/target hiện có, migration, loot/duel/appearance, một writer, debug và gate scale.
- [Nghiên cứu game tu tiên và nguồn truyện](XIANXIA-GAME-RESEARCH.md): năm game, luận cứ chính thức, hạn chế bằng chứng và khoảng trống GDD.
- [Bản sắc/cốt truyện đề xuất](VAN-HAI-CREATIVE-DIRECTION.md): ba trụ cột ứng viên, tuyến sáng tạo, lựa chọn/hệ quả và ranh giới canon.
- [Kế hoạch nội dung RPG](RPG-CONTENT-PLAN.md): ma trận nhiệm vụ/tiến trình/đồ/công pháp/thuật/pháp bảo/kinh tế/MMO, gói thiết kế và thứ tự xây.
- [Hệ thống nhân vật](CHARACTER-SYSTEM.md): mô hình dữ liệu/ownership, sáu phần, nguồn stat, mốc, đồ và tương thích.
- [Hệ thống nhiệm vụ](QUEST-SYSTEM.md): state/mục tiêu/credit/thưởng/lifecycle, adapter HN01–HN04 và đề xuất HN05.
- [Lộ trình phát triển](DEVELOPMENT-ROADMAP.md): RM0–RM6, gate, quyết định còn mở, phối hợp UI và vận hành.
- [Đặc tả trải nghiệm Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md): hành trình, nhiệm vụ chung/riêng, bình cảnh, khảo nghiệm và xuất hành.
- [Hồ sơ gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md): bộ R01 chung, trạng thái ba người, luật skill/frame event và baseline thử nghiệm.
- [Tiến trình tu luyện và phần thưởng Hằng Nhạc](HANG-NHAC-PROGRESSION-REWARDS.md): bảng 15 ngưỡng thử, nền vận hành, thưởng nhiệm vụ, vật tư và idle.
- [Đối thủ và khảo nghiệm nhập môn](HANG-NHAC-ENCOUNTERS-TRIAL.md): ba mẫu AI, vùng/timing đòn, ba pha HN10, checkpoint và nghiệm thu.
- [Hệ thống tu tiên](CULTIVATION-SYSTEM.md): sáu phần, trạng thái và quan hệ.
- [Nhân vật](CHARACTERS.md): ba lựa chọn từ đầu và hành trình riêng.
- [Online](ONLINE-DIRECTION.md), [MMORPG](MMORPG-DIRECTION.md): tổ chức thế giới và tiến trình.
- [Backlog](MVP-BACKLOG.md): việc cần đặc tả trước triển khai.
- [Phạm vi MVP RPG](MVP-RPG-A.md), [brief kịch bản nhập môn](STARTER-STORY.md): tổng hợp theo tuyến ba nhân vật; nguyên bản đệ tử/Q01–Q10 giữ trong lịch sử.
- [Nguồn tạo hình bộ ba](CORE-CHARACTER-VISUAL-SPEC.md), [ART](ART-DIRECTION.md), [công nghệ](TECH-STACK.md).

MVP-A-SPEC, UX idle, node WORLD-MAPS và catalog/save minh họa đã được ghi rõ là tham chiếu lịch sử và dẫn đặc tả hiện hành. Bộ UX online ba nhân vật còn cần đặc tả/chơi thử; mapping thành phần không là bộ màn hình mới đã duyệt. Metadata thiết kế có thể ghi hướng mới, nhưng ID/số liệu/schema của snapshot hoặc preview cũ không chứng minh gameplay, tài khoản/lưu đã triển khai.
