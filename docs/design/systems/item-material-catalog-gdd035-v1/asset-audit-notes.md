# Đợt A · ghi chú kiểm kê asset theo GDD 0.35

**Ngày kiểm kê:** 15/10/2026 · **Phạm vi:** toàn bộ năm cảnh giới, VG01–VG11, bốn Pháp Bảo × ba Mốc, sáu ô trang bị, Tứ Nghệ, Nội Giới, tiền tệ và nhân duyên.

Danh mục máy đọc nằm trong [`asset-inventory.json`](asset-inventory.json). File này giải thích cách đọc danh mục, nối asset hiện có với item–nguồn–công thức và ghi phần còn thiếu. Đây là kiểm kê Đợt A; nó chưa phát hành item, chưa khóa balance và chưa mở ART/runtime approval.

## Cách đọc và giới hạn

Mỗi `assets[*]` là một asset cụ thể có file xuất và SHA-256 đã kiểm trên workspace. Nguồn sinh ảnh, bản native/export và icon UI được ghi thành provenance riêng. Một source PNG vắng mặt không được coi là đã kiểm hash; trường `limitations` ghi rõ tình trạng đó. Các gói nhân vật, quái, NPC và Boss được tổng hợp theo số clip/pose/sequence trong manifest vì chúng là actor art, không phải hàng nghìn item icon.

`reuseStatus` chỉ nói khả năng tái dùng trong phạm vi Đợt A. `approved-in-original-scope` chỉ dùng cho nền Vân Ngọc đã owner duyệt trong phạm vi background; nó không mở duyệt lớp map, loot hay runtime. QA, playback, GPU và review source không biến thành quyền dùng ART, motion, VFX, balance hoặc runtime.

## Kết quả đã xác minh

| Gói | Bằng chứng hiện có | Có thể dùng lại | Phần cần bổ sung |
| --- | --- | --- | --- |
| Vân Ngọc gameplay v1 | 14 record thực: 11 record icon với 33 bản 32/48/64 px và 3 prop; manifest khai 14 source PNG nhưng cả 14 source không còn trong workspace. `ownerApproved=false`, `artApproved=false`, `runtimeConsumable=false`. | Native icon/prop làm candidate để đối chiếu linh thảo, Lộ Thủy, khoáng, mực, phôi và trạm nghề. | Khôi phục hoặc tái ghim source trước khi sửa hình; gắn item ID GDD 0.35, nguồn, sink và khóa; owner review. Không bật recipe VP/HN/EX cũ. |
| `client/public/assets/g2-items` | Đúng 24 PNG 96×96, hash từng file trong JSON. Có 4 icon Pháp Bảo, 6 icon tu vi/tinh hồn/đột phá/sách/bản đồ, 3 mastery, 7 chân dung NPC và 4 chân dung Boss. | Đối chiếu hình thái bốn họ Pháp Bảo, tiến trình, công pháp, nhân duyên và encounter. | Không tính 24 PNG thành 24 vật phẩm; duyệt native và nối từng record. Còn thiếu phần lớn icon nguyên liệu, đan, phù/trận, cổ ấn, phôi và sáu ô. |
| `character-ui-v2` | 14 file UI/icon hiện có, hash từng file. | Reuse silhouette Mộc kiếm, Áo vải, đan, thảo dược, khoáng, sách, ngọc và ấn khi đúng semantic. | Đây là runtime/reference library, không phải danh mục GDD 0.35; không gộp item ID vì tên gần giống. |
| Vương Lâm V2 | 2 identity × 4 họ, 512 body clip, 3.048 body key, 64 neutral view, 64 gear view, 512 gear track, 40 FX sequence/240 key; `newProductionApproved=false`, `runtimeIntegrated=false`. | Dùng actor/body/gear/FX cho Kiếm linh, Hồn phiên, Xạ Thần Xa, Thiên Nghịch Châu; tránh vẽ lại nhân vật khi chỉ thêm icon/stat. | Gắn bốn họ và Mốc I–III vào item catalog; runtime binding và approval theo từng scope. Sáu ô trang bị cần icon/data độc lập, không tự suy ra từ gear track. |
| Quái/tinh anh | 11 actor (8 quái, 3 tinh anh), 440 clip/2.640 pose; VFX02 có 11 kit/33 sequence/198 frame. | Dùng identity/encounter để làm nguồn vật liệu, hồn và chủ hồn theo bảng GDD. | Chốt từng nguồn rơi, stack/instance, khóa và sink; body basis không duyệt VFX/socket/loot/runtime. |
| NPC Wave A V2 | 6 NPC, 144 clip/864 pose; 42 source cho bảy view mới, 18 clip pilot Đông Nam giữ nguyên. | Dùng Bạch Chỉ, Tống Thiết và các NPC đã có cho trạm Đan–Trận, rèn, tuyến nhân duyên và dịch vụ. | Bảy view vẫn candidate; cần nối dịch vụ/receipt và item catalog, không lấy portrait làm item art. |
| Boss/concept | 4 identity neutral Đông Nam; Lang Vương và Hắc Ấn03 có approval riêng theo neutral/scope; Tam Ấn/Cổ Mộc còn candidate. | Dùng body/identity Boss cho story fact, Ấn Ký/chủ hồn/vật liệu khi GDD xác định sink. | Story boss fact tách loot; cần skill/motion/VFX, nguồn rơi và khóa vật phẩm theo encounter. |
| Map/UI | Nền Vân Ngọc master 3.072×2.048 và web export đã owner duyệt background; map-asset-library rỗng. UI kit có 3 cặp source/runtime, Đạo Ấn V3 có 4 source pin. | Dùng nền map và UI hiện có để trình bày điểm thu thập, túi và công thức. | Không tạo điểm spawn, collider, navigation hay world prop mới trước brief item/interaction và gate owner. |

## Ma trận item theo toàn GDD 0.35

Tên trong bảng là semantic cần có trong master catalog. Tên legacy ở cột reuse là candidate hoặc alias cần đối chiếu, không phải ID phát hành.

| Nhóm GDD | Ngưng Khí | Trúc Cơ | Kết Đan → Hóa Thần | Nguồn cần nối | Asset hiện có / thiếu |
| --- | --- | --- | --- | --- | --- |
| Linh thảo và hạt giống | Thanh Linh Thảo, Bạch Lộ Hoa, Mộc Linh Dịch | Quyết Minh Tử Thảo, Hàn Đan Linh Lộ, Huyết Tinh Chi | Tu Ma Huyết Liên, Thiên Lôi Quả, Cổ Thần Huyết Thảo, Tinh Không Đạo Quả | Điểm hái/trồng, Phù Mộc Tinh, Nội Giới, chặng biển | `vh-clean-herb`, `clean-herb-clump`, `herb.webp` là candidate; thiếu từng loài và điểm tương tác theo chặng. |
| Đan và Lộ Thủy | Hồi Khí Tán, Tụ Khí Đan, Thanh Tâm Đan, Tị Độc Đan, Lộ Thủy, Trúc Cơ Đan cuối Ngưng Khí | Ngưng Nguyên Đan, Tẩy Tủy Đan, Bạo Khí Đan, Thiên Ly Đan trước VG11 | Chân Nguyên, Kim Đan Hộ Tâm, Phá Đan Hóa Anh, Nghịch Thiên Tục Mệnh, Hóa Thần Vấn Đạo | Bạch Chỉ/Lý Mộ Uyển, linh thảo, Lộ Thủy, recipe server | `lotus-pill.webp`, `spirit-pill.webp`, `vh-clear-water`, `kim-dan.png`, `truc-co-dai.png` là candidate/reference; thiếu phần lớn phẩm chất, độc tính, recipe và export. |
| Khoáng và đá tế luyện | Huyền Thiết, Đá Mài Kiếm, Vân Nha, Giáp Ngọc Trùng, Mảnh Khôi Lỗi | Hàn Thiết Tinh Kim, Huyết Văn Lụa, Âm Mộc, Thiên Lôi Thiết | Thiên Lôi Thần Thiết, Hải Hồn Tinh Thiết, Tử Kim Tiên Thiết, Tinh Không Thần Thạch | Mỏ/điểm thu thập, Vân Nha Lang, Ngọc Giáp Trùng, Khôi Lỗi | `ore.webp`, `vh-conductive-sand`, `vh-stable-jade` là candidate; thiếu icon/prop điểm mỏ, alias và nguồn từng cấp. |
| Hồn phách và tinh huyết | Du Hồn Sơ Cấp, Yêu Hồn Lang Tuần Sơn | Tinh Hồn Trúc Cơ, 2 Chủ Hồn khảo nghiệm ở VG07, Chấp Sự Giả Đan sau VG10 | Hung Hồn Tu Ma Hải, Chủ Hồn Yêu Vương, Nguyên Anh Chiến Hồn, Đế Hồn | Quái/tinh anh/Boss, phần thưởng VG, Nội Giới | `soul-orb.png` là progression icon; body/VFX quái có thể reuse; thiếu icon stack/instance, chủ hồn có danh tính và source/lock. |
| Phù, Trận, Cổ ấn, Giải niêm | Phá Cấm Phù, Thần Hành Phù, Kim Quang Hộ Phù, Cổ Ấn I, Giải Niêm I | Tụ Linh, Tứ Tượng, Tị Lôi Hộ Đạo Trận, Cổ Ấn II, Giải Niêm II | Trận bàn, cổ ấn và giải niêm Mốc III | Lục Văn/Tư Đồ Nam, Bào Tử/Hắc Phù, Tứ Nghệ, encounter | `vh-guiding-ink`, `vh-flow-compass`, `sect-seal.webp`, `hai-do-tu-ma.png` chỉ là candidate/reference; thiếu phần lớn icon, recipe và ba slot cổ ấn. |
| Khẩu quyết và tàn quyển | Khẩu quyết 4–6/7–9/10–12, Cổ Quyết tùy chọn, Quyển Thượng | Trúc Cơ Chân Quyết, Quyển Hạ; Quyển Trung phải có từ VG04 | Chứng ngộ Hóa Cảnh, Tâm pháp và Ý Cảnh | Lục Văn, Tư Đồ Nam, VG03/VG04/VG07, Nội Giới | `manual.webp`, `ngung-khi-quyet.png` là candidate; thiếu Quyển Trung/Hạ và mapping mastery riêng theo stance. |
| Sáu ô trang bị | Mộc kiếm, áo vải và phôi rèn nhập môn | bộ Quyết Minh/Hàn Thiết và phụ kiện | Tu Ma Huyết Hải, Thiên Lôi, Cổ Bảo/Tiên Khí | Tống Thiết, khoáng, rèn/tẩy/khảm | `wood-sword.webp`, `plain-robe.webp`, `hn-training-jade` là reference/candidate; thiếu 6 slot ID, phôi/thành phẩm, set và stat. |
| Chứng đạo và nhân duyên | Lệnh Bài Đen, Ấn Ký tinh anh, tín vật đột phá | Ngọc Giản Hộ Mệnh, Bản Đồ Tu Ma Hải, tín vật tuyến | Tái tạo nhục thân Tư Đồ Nam, Ngũ Hành bản nguyên, Tục Mệnh/Ý Cảnh | Boss story fact, NPC relationship, VG, Nội Giới | Chân dung NPC/Boss và `hai-do-tu-ma.png` giúp trình bày; thiếu tín vật độc bản, lock/instance, sink và receipt. |

Tiền tệ **Linh Thạch, Tiên Ngọc Khóa, Tiên Ngọc Không Khóa, Công Huân** cần tồn tại như balance/điểm theo hợp đồng, không tạo icon stack chỉ vì UI có hình. `Tu vi`, `Độ thuần`, `Đan độc`, `mastery`, `refinementTotalRank` và `InnerRealmLevel` là state/ledger; không biến mỗi state thành loot item.

## Nguồn, công thức và chuyển đổi legacy

Gói `items-v1` còn 13 item, 6 recipe và 5 nguồn một lần. Chúng được giữ để truy lineage vì `van-ngoc-gameplay-assets-v1/assets.json` và `production.json` pin SHA-256 của `items-v1/plan.json`. Bảng dưới là dữ liệu cũ cần chuyển đổi, không phải recipe đang mở:

| Legacy record | Đầu vào/đầu ra được khai báo | Cách xử lý trong GDD 0.35 |
| --- | --- | --- |
| `hn-refine-training-jade` | 4 `hn-refining-material` → giữ 1 `hn-training-jade`; yêu cầu HN08/`hn-guard-method` | Có thể làm mẫu cho phôi → thành phẩm Mốc I sau khi thay VG/đạo cơ; không giữ điều kiện HN08. |
| `vh-recipe-ink` | 1 cát dẫn khí + 1 linh tuyền → 1 mực dẫn khí; EX01 | Giữ mô hình vật tư Đan–Phù nếu recipe mới có sink; đổi thành VG/nguồn repeatable. |
| `vh-recipe-recovery` | 2 dược thảo + 1 linh tuyền → vật tư hồi phục; EX01 | Candidate cho Hồi Khí/Thanh Tâm/Tị Độc; cần tách item ID và phẩm chất. |
| `vh-recipe-case` | 2 sợi vân bố + 1 ngọc thô → Hộp Giữ Khí; EX02 | Candidate cho công cụ/đóng gói; chưa phải công thức GDD 0.35. |
| `vh-recipe-compass` | 1 sợi + 2 ngọc + 1 cát → Định Lưu Bàn; EX03 | Candidate cho trận bàn/Định Lưu; cần điều kiện Nội Giới và sink thật. |
| `vh-recipe-seal` | 1 mực dẫn khí + giữ Hộp Giữ Khí; EX03 | Candidate cho giải niêm/phù; không dùng tên `trip-not-started` trong GDD mới. |

Nguồn cũ HN05/HN06/HN08 và EX01/EX02 không được dùng để cấp vật phẩm VG. Từ GDD 0.35 cần lập source record cho **VG01–VG11**: thu thập repeatable, NPC craft, encounter quái/tinh anh, boss story fact, Nội Giới, tuần/ủy thác, và nguồn bảo đảm solo. Bảng nguồn phải ghi `earliestAvailableAct`, `servesRealm`, `repeatable`, `lock`, `sink` và `serverFact` trước khi xuất icon production.

### Mapping nguồn đang có

| Nguồn | Item/material/hệ quả có thể gắn | Ranh giới |
| --- | --- | --- |
| Bạch Chỉ, Lý Mộ Uyển | linh thảo, đan, giải độc, Thiên Ly, Đan–Trận, tín vật nhân duyên | NPC art/portrait không tự mở recipe; recipe và receipt phải được định danh. |
| Tống Thiết | khoáng, phôi, sáu ô, cường hóa/tẩy/khảm | Dùng motion/NPC hiện có; chưa có manifest đầu ra sáu ô. |
| Lục Văn, Tư Đồ Nam | khẩu quyết/tàn quyển, phù, cổ quyết, giải niêm, hồn chỉ điểm | Sách đã học là mastery/fact; không cấp sách vô hạn từ portrait. |
| 8 quái + 3 tinh anh | vật liệu thường, Du Hồn/Tinh Hồn, Ấn Ký tinh anh | Body/VFX đã có nhưng loot source, drop, lock, stack chưa khóa. |
| Lang Vương, Tam Ấn, Cổ Mộc, Hắc Ấn | story fact, chủ hồn/ấn ký/vật liệu chủ chặng theo GDD | Boss fact tách record thưởng; không tự gắn mọi concept với loot. |
| Nội Giới, ủy thác, Vấn Đạo | Lộ Thủy, linh điền, sách bảo đảm, bù đắp Đạo Cơ, quỹ tuần | Map library/placement rỗng; cần source logic và server receipt trước prop. |

Các roster cũ **Mặc Dực, Bào Tử Giữ Khí, Tĩnh Niệm Tro** chưa có sink trong GDD 0.35. Giữ chúng là `pending-design`; không tạo loot, icon hoặc recipe bắt buộc cho đến khi có đích tiêu.

## Phần dùng lại và phần cần bổ sung

**Dùng lại ngay ở mức dữ liệu/provenance:** 36 native export icon Vân Ngọc đã hash-verified; 24 PNG G2 đã hash-verified; 14 icon/UI hiện có; map Vân Ngọc master/web trong scope background; các manifest/approval/basis của Vương Lâm, quái/tinh anh, NPC và Boss; actor/gear/FX V2 cho bốn họ pháp bảo.

**Cần bổ sung trước production:** master item records cho 8 nhóm × 5 cảnh giới; bảng nguồn–sink–recipe trọn VG01–VG11; ID/alias và lock/instance; 6 slot trang bị; 3 slot cổ ấn; icon linh thảo/đan/khoáng/hồn/phù/trận/giải niêm/tín vật; prop điểm thu thập và trạm nghề khi brief world đã chốt; runtime binding cho item catalog sau khi fixture kiểm.

**Cần giữ riêng:** story boss facts, currencies/balances, state ledger, portrait NPC/Boss, body/gear/FX actor, map background, UI textures. Không chuyển các loại này thành vật phẩm chỉ vì chúng xuất hiện trong cùng thư mục hoặc cùng một PNG export.

## Hàng đợi kiểm tiếp theo của Đợt A

1. Tạo master catalog record cho từng semantic ở ma trận trên, bắt đầu VG01–VG06 nhưng vẫn điền đích dùng cho VG07–VG11 để tránh thiếu nguyên liệu hồi sau.
2. Đối chiếu alias `Vân Nha/Nanh Sói`, `Mảnh Ngọc Giáp/Giáp Ngọc Trùng`, `Lõi Khôi Lỗi Rạn/Mảnh Khôi Lỗi`, `Mảnh Hắc Phù/Giải Niêm` trước khi tạo ID mới.
3. Gắn mỗi source vào encounter/NPC/điểm thu thập và kiểm earliest gate, repeatable, lock, sink, recipe whitelist 5:1 và inheritance theo Hợp đồng 0.35.
4. Chọn candidate icon đã có; chỉ brief phần thiếu sau khi item record có đích tiêu. Không re-generate 14 icon Vân Ngọc khi source high-res chưa được phục hồi hoặc re-pin.
5. Sau khi catalog freeze, lập gói C cho VG01–VG06 và kiểm túi–craft–equip–loot server trên fixture; đây là dữ liệu/fixture, không phải approval ART/runtime live.

## Vấn đề cần theo dõi

- Source PNG của 14 record Vân Ngọc vắng mặt nhưng manifest vẫn lưu hash cũ; mọi chỉnh sửa bitmap phải dừng ở candidate cho tới khi provenance được phục hồi.
- `items-v1/plan.json` và production/assets manifest hash-pinned; không sửa byte chỉ để đổi tên HN/VP. Chuyển đổi phải tạo record GDD mới và giữ lineage cũ.
- Bảy view NPC mới, VFX02 quái, nhiều boss neutral và toàn bộ actor V2 có trạng thái review/candidate; QA không mở quyền loot hay runtime.
- Map library đang rỗng; nền Vân Ngọc owner-approved không cho phép tự thêm node, collider, spawn hoặc navigation.
- GDD 0.35 chưa định lượng cuối drop, chi phí, pity, số giờ, giá trị giao dịch; các trường đó phải mang nhãn fixture/unmeasured cho tới khi có bảng cân bằng.
