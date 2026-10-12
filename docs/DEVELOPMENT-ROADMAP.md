# Lộ trình Vân Hải Đạo Đồ — từ nền hiện có tới RPG tu tiên online

**Phiên bản 0.5 · 11/10/2026 · GDD 0.32.** Owner đã đồng ý: **thiết kế rõ hệ thống nhân vật và nhiệm vụ trước khi mở rộng HN05**, đồng thời yêu cầu kế hoạch xuyên suốt **farm để mạnh, PvE/PvP và thể hiện nhân vật**. Lộ trình theo phụ thuộc và điều kiện hoàn tất, chưa cam kết ngày phát hành/nhân lực/thời lượng. Bản này là kế hoạch, không là lệnh chạy toàn bộ hoặc bằng chứng tính năng đã xong.

[Ma trận tu tiên/MMORPG](MMORPG-PROGRESSION-PLAN.md) nối nội dung từng chặng với sức mạnh, farm, đấu quái/đấu người và sưu tập. [Hợp đồng Core/backend](MMORPG-SYSTEM-CONTRACTS.md) ghi điều kiện mở loot/damage peer/appearance, migration và số đo scale. Mốc phát triển RM khác cảnh giới: một pilot RM5 có thể được xây sớm để phục vụ Ngưng Khí/Trúc Cơ, không đợi người chơi tới cảnh giới cao.

## 1. Một đường đọc và một thứ tự công việc

**[GDD](GDD.md) → [nghiên cứu nguồn](XIANXIA-GAME-RESEARCH.md) / [hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md) → [kế hoạch nội dung](RPG-CONTENT-PLAN.md) → [hệ thống nhân vật](CHARACTER-SYSTEM.md) + [hệ thống nhiệm vụ](QUEST-SYSTEM.md) → lộ trình này → [backlog GD](MVP-BACKLOG.md) → đặc tả đợt triển khai → code/kiểm/chơi thử.**

**Bổ sung theo yêu cầu nghiên cứu:** RM0 không chỉ là schema/receipt. Phải có động lực truyện, dòng phát triển, vai trò đồ/công pháp/thuật/pháp bảo và nét riêng muốn kiểm trước khi xây framework. Ba hồ sơ nghiên cứu/nội dung mới là bản đề xuất, chưa chốt đổi tuyến hoặc số liệu.

- GDD sở hữu lời hứa sản phẩm, quyết định và phạm vi; hồ sơ hệ thống sở hữu luật/quan hệ; roadmap sở hữu thứ tự và gate.
- [PROJECT-STATUS](PROJECT-STATUS.md) và các `*-RUNTIME`/backend ghi nền đã có. Đã có code local không đồng nghĩa đã phát hành sản xuất.
- Hồ sơ ART/approval và verification giữ sự kiện ở thời điểm tạo; không nâng duyệt hình/cân bằng bằng sửa tài liệu.
- Mã **RM0–RM6** dưới đây là chặng phát triển, không là cảnh giới, mốc M01–M04 hoặc tier R01–R05.

## 2. Điểm xuất phát — không xây lại những gì đã có

| Nhóm | Nền theo checkout/hồ sơ bàn giao | Còn thiếu |
| --- | --- | --- |
| Thế giới | Hằng Nhạc owner 3072 × 2048, 9 blocker, camera 1×; 22 object/32 part/10 cover | Ngoại vi, chuyển cảnh thật, encounter farm/khảo nghiệm |
| Nhân vật/chiến đấu | Bộ ba, R01, đòn thường và HN03/04 an toàn | AI gây damage/thất bại, tăng trưởng sau M01 và phân hóa |
| Nhiệm vụ/tu luyện | HN01–HN04, M01, ngưỡng đầu/tích lũy online, credit/receipt | Khung nhiệm vụ mở rộng, HN05–HN12, M02–M04, bình cảnh/pháp khí |
| Identity/lưu | Entry thật E0–E2 local, realm/character/lease, SQLite/CAS/ledger, giữ khách DEV | Recovery tài khoản, vận hành/scale nhiều máy và claim guest nếu cần |
| Đồ/UI | Hai gear và vật tư thật, C/I, J/NPC, Vân Ngọc/Linh Đài, title/entry | Container/nguồn thưởng tổng quát; các màn tu tiên chưa có gameplay |

Đợt roadmap chỉ đối chiếu hồ sơ/mã, không chạy lại gameplay hoặc nâng trạng thái kiểm chứng. Không ghi “chưa có hành trang/login” một cách tuyệt đối; phần có thật là pilot/local với giới hạn cụ thể.

## 3. Lộ trình chính

| Chặng | Sản phẩm bàn giao | Phụ thuộc | Điều kiện được đi tiếp |
| --- | --- | --- | --- |
| **RM0 — Chốt thiết kế nền và nội dung** | Trục truyện/bản sắc; hành trình, catalog và vai trò năng lực; mô hình nhân vật/quest/UI; HN05/lifecycle/migration | Nền hiện có, nghiên cứu nguồn, hướng owner đã đồng ý | Có storyboard/nội dung hữu hạn và không còn câu hỏi chặn RM1/RM2; luật có authority/kiểm. Có bản thiết kế không tự đánh dấu gate đã qua |
| **RM1 — Nền RPG tối thiểu** | Adapter nhiệm vụ hiện có, evaluator/receipt dùng lại, item/nguồn thưởng tối thiểu, snapshot phục vụ UI; giữ HN01–HN04 | RM0 chốt phần liên quan | Save cũ và mới tương thích, một nguồn ghi/đếm, không lặp thưởng/đồ, hồi quy không đổi gameplay cũ |
| **RM2 — HN05 / hoàn tất lát A** | Ngoại vi nhỏ, đi/về, E01 cá nhân theo policy đã chọn, tài nguyên nhiệm vụ, thử lại và M02 | RM1 + map đích/navigation/release + ART cần dùng | Cả ba hoàn thành vòng nhập môn đến HN05, hai tài khoản riêng, lifecycle đúng, nhịp trận được chơi thử |
| **RM3 — HN06–HN09 / lát B1** | Dấu riêng, bình cảnh, pháp khí/luyện hóa, bài phối hợp và M03 | RM2 và kết quả chơi thử | Người chơi hiểu vì sao bị chặn, chuẩn bị/kiểm chứng có tác dụng, cả ba solo được |
| **RM4 — HN10–HN12 / lát B2** | Khảo nghiệm phiên riêng, checkpoint/kết quả, M04, tổng kết/quyền xuất hành | RM3 + balance/encounter/checkpoint đã chốt | Cả ba hoàn tất Hằng Nhạc, không lặp thưởng/chi phí; đích sau chưa có thì kết thúc bản thử minh bạch |
| **RM5 — Vòng lặp MMO mở rộng** | Farm chung/credit/loot, nhóm và tiện ích xã hội/kinh tế chọn lọc phục vụ vòng chơi | Hợp đồng ownership/credit từ RM0–RM2; nội dung/lưu đủ ổn định | Hoạt động nhiều người không chiếm tiến trình/bắt buộc solo; kinh tế có nguồn–chi và giới hạn được đo |
| **RM6 — Phân hóa sau map / lát C** | Một lựa chọn công pháp–thuật–pháp bảo và tuyến đầu Trúc Cơ/hồi phục sâu hơn | RM4 + hồ sơ từng nhân vật; chỉ cần phần RM5 mà nội dung thực sự dùng | Khác biệt thể hiện bằng hành động/lựa chọn; có thử/chỉnh hướng, không chỉ đổi màu/stat |

RM5 không phải điều kiện bắt buộc để một người qua HN10 hoặc bắt đầu thiết kế RM6. Sau nền RM2 đủ an toàn, có thể chọn pilot farm/tỷ thí/diện mạo bên dưới chạy cùng RM3–RM4; không đợi làm xong toàn RM5. Không biến các pilot thành phạm vi bắt buộc của HN05. Offline có cap, shop/kho, PvP/bang hội không mặc nhiên nằm trong RM2.

### 3.1. Nhánh kiểm vòng MMORPG sớm

| Nhánh chọn theo phụ thuộc | Phạm vi pilot | Gate trước code | Kết quả cần chơi thử |
| --- | --- | --- | --- |
| RM5-A — Farm/PvE lặp | Một đối thủ/hoạt động lặp, một nguồn vật liệu, một nơi tiêu thành món/upgrade có tác dụng thật; loot cá nhân trước | RM2 ổn, release/AI/lifecycle, item codec/nguồn–chi/business receipt/capacity, tăng trưởng đã đặc tả | Farm tạo lựa chọn và sức mạnh trước/sau nhận thấy được; không lặp thưởng HN/EX hoặc bắt craft toàn nghề |
| RM5-B — Tỷ thí | Mời/chấp thuận hai người trong vùng hợp lệ, ruleset có nhãn, thắng/thua/rời/drop/điểm trở về | Damage peer/target policy, quyền/eligibility và cooldown/stat/lifecycle server; nền RM2 đủ | Hai profile đấu thật và trở lại hợp lệ; power/build có giá trị theo mode, không cần rank/loot ngay |
| RM5-C — Hiện diện | Một nguồn ngoại hình/pháp khí kiếm được, xem trước/mặc/tháo, peer thấy và inspect giới hạn | Ownership/appearance projection, nguồn unlock và native render/readability | Người khác thấy thành quả, không lộ inventory hoặc sinh bonus từ UI; tọa kỵ có brief/contract riêng trước ART |
| RM5 mở rộng | Boss/nhóm, farm chia sẻ, xếp hạng, tông môn/tranh đoạt hoặc trade được chọn từng gói | Credit/loot/ruleset/nguồn–chi và số đo tải theo gói | Có hợp tác/cạnh tranh hữu ích, không chiếm main quest/softlock người mới hoặc farm thưởng vô hạn |

Đây là nhánh của RM5, không roadmap cạnh tranh hoặc lịch phát hành mới. Chọn một pilot để kiểm trước rồi mở phần tiếp; không xây cả nhóm/chợ/tọa kỵ/đấu trường trước trận đầu. Việc đổi số liệu cho power pilot phải có profile migration/stat-source, không lấy bonus UI mẫu. Cơ sở current vẫn giữ gear không bonus và HP/MP hiện hành tới khi có đặc tả đổi.

## 4. RM0 — công việc đang ưu tiên

### 4.1. Đầu ra cụ thể

**Sổ nội dung để kiểm soát:** [taxonomy](GAME-CONTENT-TAXONOMY.md), [control plan](GAME-CONTENT-CONTROL-PLAN.md) và [catalog index](design/systems/content-registry-v1/README.md) đã có bản thiết kế/kiểm kê. Dùng chúng chọn ID/source–use cho lát HN05; typed definition/validator/migration cần cho lát đó thuộc RM1. Không yêu cầu làm loader mọi domain hoặc admin editor live trước RM2, không import design JSON vào runtime.

| Gói | Đầu ra | Tình trạng ở bản tài liệu này |
| --- | --- | --- |
| Nghiên cứu và bản sắc | Đợt 1: 5 game; đợt 2: 3 game mới và 12 trang chương khảo sát có giới hạn | [Đợt 1](XIANXIA-GAME-RESEARCH.md), [nguồn luyện chế/Tiên Nghịch đợt 2](TIEN-NGHICH-CRAFTING-REFERENCES.md); chưa chơi trực tiếp, không nói đã đọc hết truyện |
| Nội dung/luồng phát triển | Đồ thị/cổng HN05–HN12, thẻ nhiệm vụ, góc nhìn bộ ba, một lựa chọn 2 nhánh và storyboard HN05 | [Chương phương án A](HANG-NHAC-CHAPTER-PLAN.md) đã có bản chi tiết làm việc ND1–ND2; chưa duyệt thoại/luật mới |
| Catalog đầu | 3 item ID hiện có + 2 định nghĩa dự kiến; nền vận hành, R01 bảo toàn, recipe và hộ thân | [Catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) bản chi tiết ND3/phần ND4; chưa codec/schema hoặc ART mới |
| Vật phẩm sau nhập môn | 8 định nghĩa mới, 5 recipe và EX01–EX04 hữu hạn, nguồn–chi/đường thủ công | [Thiết kế](ITEM-CRAFTING-DESIGN.md), [gói sản xuất](ITEM-PRODUCTION-PLAN.md), [manifest chỉ kiểm kế hoạch](design/systems/items-v1/plan.json); chưa kinh tế lặp hoặc runtime |
| Nhân vật | Danh tính/ownership, bốn lớp state, sáu phần tu tiên, nguồn stat, milestone, UI và tương thích | Bản cơ sở ở [CHARACTER-SYSTEM](CHARACTER-SYSTEM.md) |
| Nhiệm vụ | Định nghĩa/tiến trình/attempt, state, mục tiêu, credit, reward, versioning/migration | Bản cơ sở ở [QUEST-SYSTEM](QUEST-SYSTEM.md) |
| HN05 để kiểm thiết kế | Nhận → đi ngoại vi → E01 → proof/clue → quay về nhận gói → xác nhận ngưỡng/M02 | [Storyboard chương A](HANG-NHAC-CHAPTER-PLAN.md) đã mô tả; D04–D06 vẫn chặn bật portal/encounter |
| Quyết định trước code | Các lựa chọn có khuyến nghị, nơi phụ thuộc và người chốt | Bảng dưới; chưa coi owner đã duyệt chi tiết |

### 4.2. Những điểm cần chốt theo từng gate

| ID / quyết định | Khuyến nghị để giữ phạm vi nhỏ | Người chốt / chặn chặng |
| --- | --- | --- |
| D01 — Chuyển mô hình nhiệm vụ | Adapter HN01–HN04 trước, giữ command/receipt; chỉ refactor phần HN05 cần, không viết lại hàng loạt | Kỹ thuật đề xuất theo chính sách save, owner duyệt thay đổi trải nghiệm nếu có; RM1 |
| D02 — Item/tài nguyên HN05 | Gói thưởng theo nhiệm vụ, không random drop; một nguồn supplies; chốt stack/container/sức chứa hoặc rõ chưa áp giới hạn | Thiết kế + kỹ thuật, owner chốt phạm vi; RM1 |
| D03 — M02 và tăng trưởng | HN05 + tầng 3 xác nhận; đủ điều kiện hiển thị xác nhận mốc, không cấp skill lại. Chốt giữ baseline hay bật bước stat thử, và HP/MP khi chuyển mốc | Owner chốt trải nghiệm/cân bằng sau đề xuất; RM2 |
| D04 — Thua/rời/mất mạng HN05 | Một encounter cá nhân, đường chuẩn bị/thử lại không cần farm; kết quả thắng đã ghi được giữ. Chốt grace/AI/reset/HP/MP/cooldown và điểm trở về | Thiết kế + kỹ thuật, owner chọn policy; RM2 |
| D05 — Ngoại vi/chuyển cảnh | Vào tuyến sau HN04, nhận HN05 trước bắt đầu trận; có đích và quay về, không cần M02 để đi làm HN05 | Owner chốt bố cục/navigation, kỹ thuật chốt transfer một writer; RM2 |
| D06 — Đối thủ/ART | Một E01; không gán cao thủ canon làm boss nhập môn; đối chiếu collider chân 8 px và ngân sách animation | Owner chốt tạo hình/nguồn; kỹ thuật và chơi thử chốt readability; RM2 |
| D07 — HN06–HN09 | Chốt hành động riêng, điều kiện bình cảnh, pháp khí/tác dụng/chi phí và nguồn tài nguyên đủ | Owner/thiết kế; RM3, không chặn RM1 |
| D08 — Khảo nghiệm/ngoài map | Chốt HN10/checkpoint/timeout/ngưỡng cuối và mục tiêu HN12; đích chưa có thì không tạo map rỗng | Owner/thiết kế/kỹ thuật; RM4 |
| D09 — Nguồn truyện và mức độc lập | Trước mắt giữ bộ ba/Hằng Nhạc, thêm tuyến sáng tạo có nhãn; chốt hướng nguyên tác/chuyển thể và rà quyền khai thác trước public | Owner/biên tập; chặn sản xuất truyện/nhận diện mới, không chặn sửa lỗi nền |
| D10 — Nét riêng ưu tiên | Đạo đồ là lịch sử kiểm chứng; một nhân duyên/callback sau; pháp khí khám phá để tiếp nối, không làm tất cả ngay | Owner chọn giả thuyết; HN05 chỉ một dấu gợi mở, RM3 thử hệ quả |
| D11 — Nhịp chương và ngân sách | Phân bố Hằng Nhạc qua môn phái/ngoại vi/khảo nghiệm; rà tầng/thưởng/thời gian chờ và nguồn–chi item, không tự tăng EXP vì thêm nhánh | Thiết kế + owner/chơi thử; phần liên quan trước RM2, nhịp toàn chương trước RM3–RM4 |
| D12 — Nội dung riêng/chung | Main quest solo và choice riêng; hợp tác tự nguyện có credit nhiều loại, không last-hit; không simulation NPC toàn realm | Thiết kế/owner/kỹ thuật; scope HN05 trước RM2, party/farm chung trước RM5 |

Đây là danh sách quyết định hữu hạn để triển khai, không yêu cầu thiết kế hết cảnh giới cao rồi mới làm. Mỗi quyết định ghi lựa chọn/lý do/ảnh hưởng save/UI/kiểm thử khi được chốt. Không dùng sự đồng ý với hướng tổng thể để suy duyệt toàn bộ khuyến nghị hoặc số liệu.

### 4.3. Hàng đợi thiết kế nội dung

[ND1–ND6](RPG-CONTENT-PLAN.md) là sáu đầu ra trong RM0, không thêm sáu chặng code:

1. **ND1:** trục truyện, nguồn/canon/chuyển thể, động lực và nét riêng được chọn.
2. **ND2:** đồ thị HN05–HN12 và bảng mỗi chặng làm gì/mở gì/dùng gì tiếp.
3. **ND3:** catalog tối thiểu item/phương pháp/pháp khí, nguồn–chi và ownership.
4. **ND4:** một bình cảnh mẫu theo người, vai trò năng lực, E01 theo tốc độ/collider thật; hậu nhập môn chỉ thiết kế hướng.
5. **ND5:** phạm vi riêng/chung và một hệ quả nhìn thấy nếu chọn; chưa xây engine mọi quan hệ NPC.
6. **ND6:** storyboard HN05 và liên kết HN06–HN08, failure/retry và ngân sách asset để chốt slice.

**Tiến độ sau yêu cầu bắt đầu:** ND1–ND2 có [bản chương A](HANG-NHAC-CHAPTER-PLAN.md), ND3 có [catalog](HANG-NHAC-CONTENT-CATALOG.md); ND4 có bài mẫu/contract hộ thân, ND5 thu gọn một lựa chọn có hồi đáp, ND6 mới là storyboard giấy. Đã cụ thể hóa phương án, chưa đánh dấu các gate đã qua. Bản A đề xuất HN06 sau M02 (khác điều kiện HN05-only cũ), giữ cùng instance phôi/refined và tách thưởng HN09 khỏi proof bài — các điểm này được ghi rõ để đánh giá, không đổi runtime.

Chỉ phần liên quan đến lát kế tiếp phải chốt trước code; không đợi có mọi nghề/pháp bảo/cảnh giới. D01–D06 vẫn chặn implementation tương ứng, ý tưởng truyện không thay hợp đồng save/lifecycle. Nếu không chọn tuyến sáng tạo ứng viên, thay ND1/ND2 chứ không phải bỏ nền hệ thống.

### 4.4. Nhánh vật phẩm/luyện chế — thiết kế xa, xây từng gói

[VP0–VP4](ITEM-PRODUCTION-PLAN.md) là gói nội dung/đầu việc trong các RM, không roadmap cạnh tranh:

- **VP0 / RM1–RM2:** nguồn thưởng HN05/06, nguyên liệu và codec giữ đồ/supplies cũ.
- **VP1 / RM3–RM4:** recipe phôi→hộ thân, activation và proof bài HN08.
- **VP2 / phần RM5 sau HN12:** 5 nguyên liệu, mực/hộp, nguồn một lần EX01/02, EX03 có hai cách giao mẫu.
- **VP3 / khám phá RM6 hoặc chặng tương ứng:** Định Lưu Bàn/EX04, không cần để vượt HN10 hoặc đột phá mặc định.
- **VP4:** chỉ chọn nguồn lặp/gear/công pháp/trade khi lát thu–chế–dùng có tác dụng, có budget nguồn–chi; không tự làm toàn nghề/khí linh/tọa kỵ.

D02/D11 phải chọn định mức và policy item theo từng gói; D05/D12 chốt release/phạm vi activity. Không thêm một bộ quyết định chặn HN05 vì đang thiết kế crafting sau map. Công cụ không có nội dung thì chưa sản xuất; định mức recipe mới là số thử sáng tạo, không số nguyên tác hoặc cân bằng đã duyệt.

**Bổ sung 11/10:** VP4-A là phần nguồn farm/đích dùng được chọn để phục vụ RM5-A sớm sau RM2, không bắt hoàn tất chuỗi công cụ EX01–EX04/VP2–VP3 trước. Nó cần nguồn–chi/loot/lifecycle/balance riêng và nơi dùng thật. Nguồn HN/EX hữu hạn giữ nguyên; không mở lại receipt cũ làm farm. Phần nghề/trade/khí linh sâu của VP4 vẫn mở sau số đo và nhu cầu tương ứng.

## 5. RM1 — xây phần chung vừa đủ, không làm framework trước game

Thứ tự kỹ thuật đề xuất:

1. Lập mapping profile/sect/inventory/entry hiện có; mỗi giá trị chỉ có một nguồn sự thật. Giữ mốc/credit/receipt đã tồn tại.
2. Định nghĩa hợp đồng thuần và view adapter cho quest/nhân vật; so với HN01–HN04 bằng fixture. Không buộc HN01 thêm bước nhận/xác nhận mới.
3. Bổ sung evaluator/transaction cần cho kết quả encounter và phần thưởng item; kiểm request dedup lẫn reward dedup theo nguồn.
4. Mở item model tối thiểu HN05 cần; chốt migration `sect.supplies` trước chuyển số lượng. Gear ban đầu không tự thêm bonus.
5. Nối các snapshot/action vào UI đã cập nhật, có pending/lý do khóa/sync. Ghi rõ preview khác runtime.

**Không làm trong RM1:** quest editor, microservices, generic scripting, sáu cây EXP, kho/shop đầy đủ, trang bị random/cường hóa, R02–R05, reset tài khoản hoặc thay blocker/renderer để tiện test.

Gate: unit cho luật/migration; integration transaction/receipt lỗi; browser đúng hồ sơ/focus; hồi quy entry, character, lessons, R01, sect, reload và các phần UI/input bị chạm trên DB fixture. Tên lệnh xem [runbook](PREVIEW-RUNBOOK.md), không dùng DB thật để seed tiến trình.

## 6. RM2 — một vòng chơi HN05 hoàn chỉnh

### Nhánh bản đồ và nhánh gameplay

- Sau khi biết không gian encounter cần gì, thiết kế ngoại vi theo [quy trình map](MAP-CONCEPT-SECTOR-WORKFLOW.md): concept tổng đúng tỷ lệ → owner vẽ/chốt navigation → export → asset/layer cần thiết. Không tự dùng tọa độ HN-Z cũ hoặc đổi blocker Hằng Nhạc.
- Nền chuyển cảnh cần kiểm realm/character/lease, map release, spawn hợp lệ và quyền nội dung; rollback khi đích lỗi, không để hai room cùng điều khiển/ghi hồ sơ.
- E01 có vòng tiếp cận → báo đòn → khóa → resolve → recovery; chỉ một mẫu, không đội quái/boss/world event ngay.
- Gắn thắng/thua, proof/tài nguyên, quay về/xác nhận vào quest/character đã chuẩn bị ở RM1.

### Nghiệm thu lát A

| Tình huống | Kết quả cần thấy |
| --- | --- |
| Tạo nhân vật mới theo từng avatar, đi từ HN01 đến HN05 | Có đường hoàn thành, hiểu tu vi khác MP; không seed bỏ qua bài rồi tuyên bố đã nghiệm thu toàn tuyến |
| Thiếu MP hoặc chưa thành thạo Phong | Đòn thường/đi bộ còn đường thắng; telegraph có đường né hợp lệ |
| Hai tài khoản, kể cả cùng avatar | Thấy nhau ở nơi dùng chung; quest/đồ/kết quả riêng; không tranh last-hit tutorial |
| Thua hoặc rời | Biết lý do/điểm quay lại, có đường chuẩn bị và thử lại không trả phí |
| Disconnect/reload/restart trước và sau kết quả | Khôi phục đúng phase; không nhân thưởng, không giữ actor/đòn mồ côi |
| Transfer hỏng/đích không sẵn sàng | Ở lại hoặc phục hồi tại map hợp lệ; không mất quyền điều khiển hoặc nhân actor |
| Đủ một trong hai điều kiện M02 | Hiển thị thiếu điều kiện còn lại, không tự cấp mốc/stat |
| Chơi thực trên desktop/màn nhỏ | Đọc đòn, target, HP và mục tiêu; panel không che hành động bắt buộc |

Ngoài test, ghi nhận người mới có tìm được đường/giải thích bước tiếp, lỗi đọc đòn, số lần thử và thời gian chơi/chờ. Ngưỡng chấp nhận chỉ đặt sau quan sát; không bịa KPI hoặc thời gian hoàn thành đã đo.

## 7. RM3–RM4 — chất tu tiên và hoàn tất Hằng Nhạc

**RM3 chia nhỏ:** HN06 cho thấy khác biệt nhẹ → HN07 cho một bình cảnh có nguyên nhân và cách giải → HN08 nhận biết/luyện hóa/vận dụng pháp khí → HN09 phối hợp và M03. Không làm ba nghề/cây skill hoàn chỉnh. Trước HN07 phải nói được “tích lũy đủ nhưng thiếu gì”, và hành động giải quyết phần thiếu phải kiểm được.

**RM4 chia nhỏ:** luật phiên/checkpoint → HN10 ba pha → chốt kết quả/M04 → HN11 tổng kết → HN12 quyền xuất hành. Không lấy stat M04 để cân HN10. Mất mạng và thử lại có policy riêng; HN05 không tự thừa hưởng pause của khảo nghiệm. Không tự cấp Trúc Cơ hoặc đẩy vào map chưa có.

Kết thúc RM4 mới đủ phạm vi để đánh giá toàn Hằng Nhạc theo GDD, không phải chỉ vì UI đã có tab cảnh giới/pháp bảo.

## 8. Phối hợp với đợt UI hiện tại

| Có thể làm song song | Cần hợp đồng trước nối gameplay | Chưa mở như tính năng thật |
| --- | --- | --- |
| Khung/token/chữ/resize/focus/mobile và material | Nguồn dữ liệu C/I/J, trạng thái quyền/điều kiện, action/pending/error | Tab công pháp/pháp bảo/đột phá nếu chỉ có fixture |
| Vùng bố cục cho target/feedback/kết quả | HP/phase/attempt và thắng/thua server | Phần thưởng, cấp bậc hoặc item tạo chỉ để lấp UI |
| Read-only preview trạng thái tương lai có nhãn | Catalog/slot/hiệu lực thật trước mang/dùng/luyện hóa | Bảy ô hotbar chưa gán không nhận hành động giả |
| Preview diện mạo/inspect/kết quả farm–tỷ thí | Appearance ownership/public projection, power-source, loot receipt và ruleset/lifecycle | Thời trang/tọa kỵ/đấu trường chỉ có fixture không hiện là chức năng thật |

Người làm UI sở hữu markup/token/ART/interaction presentation; người làm hệ thống sở hữu contract/luật/persistence; điểm ghép được thống nhất trước khi hai luồng sửa cùng file. Mỗi đợt tích hợp nhận snapshot mẫu đủ trạng thái cùng callback có nghĩa, không để layout quyết định luật tăng trưởng.

Giữ HUD 760 × 140, native map/sprite và ranh giới hotbar snapshot/callback. Duyệt kỹ thuật, chơi thử UX và duyệt ART được ghi riêng theo phiên bản.

## 9. Nhánh vận hành chạy song song, không trì hoãn tới cuối

Entry local đã có, nhưng trước thử nghiệm công khai cần: recovery tài khoản theo phương thức đã chọn, HTTPS/WSS/cookie/origin/trusted proxy, backup–restore được diễn tập, migration có phục hồi, log/metric không lộ secret, đo tải/DB contention và kế hoạch abuse/rate limit. Chỉ chuyển PostgreSQL/Redis/routing nhiều máy khi nhu cầu và số đo cho thấy cần; giữ transaction/lease/ownership tương đương.

Các việc này không bắt RM0 phải viết lại auth hoặc chạy load test ngay. Quyết định mở public có gate vận hành riêng; số room cap hoặc việc admin thêm realm không chứng minh công suất MMO.

## 10. Cách cập nhật tiến độ

Mỗi gói ghi riêng: **thiết kế nháp → quyết định đủ cho triển khai → code local → kiểm kỹ thuật → chơi thử → phát hành**; ART có approval riêng. Một gói có thể đã code nhưng chưa chơi thử, không gộp thành một nhãn “xong”.

Bàn giao một chặng cần: phạm vi đã làm/chưa làm, quyết định mới, file/hợp đồng thay đổi, migration/rollback nếu có, kiểm trên fixture, bằng chứng và rủi ro còn lại. Chưa ước lượng thời gian khi D01–D06 hoặc ngân sách map/ART chưa chốt; sau RM0 mới tách ticket và ước lượng theo năng lực thực tế.

**Việc kế tiếp sau bản chương/catalog:** đánh giá các lựa chọn cụ thể của phương án A (HN06 sau M02, 2 nhánh báo cáo, policy vật liệu và hộ thân), rồi chốt D01–D06 cho RM1/RM2 thành hợp đồng kỹ thuật: nguồn item/codec/migration, milestone/stat, lifecycle/transfer và E01 ở thông số runtime. Đồng thời chọn nguồn sức mạnh, một đích dùng PvE và một phần thưởng nhìn thấy được cho chặng đầu theo kế hoạch MMORPG; phương án truyện phải giải thích lợi ích/xung đột đó. Storyboard HN05 là lát để triển khai và kiểm; không code hết HN05–HN12 hoặc làm lại nền/UI. Phạm vi IP dài hạn D09 và production vẫn cần quyết định riêng, không suy từ sự đồng ý bắt đầu bước thiết kế.
