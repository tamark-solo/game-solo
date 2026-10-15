# Lộ trình xây dựng vật phẩm, nguyên liệu và pháp bảo

> **LỊCH SỬ · ngừng dùng làm kế hoạch ngày 15/10/2026.** Các trạng thái “hiện hành”, số lượng và ưu tiên bên dưới thuộc thời điểm viết. Thiết kế áp dụng xem [GDD 0.35](../../GDD.md), [hợp đồng thống nhất](../../GDD-035-UNIFIED-CONTRACT.md) và [kế hoạch asset tổng thể](../../ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md).

**Cập nhật chơi thử 12/10:** owner chọn Hằng Nhạc và EX01–EX04; runtime chương (đường dẫn lịch sử: `HANG-NHAC-CHAPTER-RUNTIME.md`, tài liệu đã được dọn trước đợt này) nay có nguồn hữu hạn/sáu công thức/công cụ thật, hành trang và lưu server. Bàn recipe-workbench vẫn là dữ liệu mẫu riêng; các ghi chú chưa mở codec/craft/EX phía dưới là lịch sử trước phạm vi mới. ART/quyền production và VP4-A farm lặp vẫn tách riêng.

**Ưu tiên tiếp tục owner đồng ý 12/10:** tập trung icon/nguyên liệu/vật phẩm/công thức; map Hằng Nhạc đã đủ khu/đạo cụ tĩnh, ba mẫu rời giữ dự phòng. [Bàn thử](http://127.0.0.1:5173/gameplay-assets.html#recipe-workbench) kiểm sáu công thức trên túi/tiến trình mẫu, không craft hoặc cấp đồ thật. Đây là bước đối chiếu trước VP0/VP1, không đổi thứ tự IT01–IT04 hoặc mở VP2/3.

**ART 12/10/2026 đã có bộ xem đầu:** owner ưu tiên nguyên liệu/đạo cụ/icon/công thức trong lúc làm lại nhân vật. [Vân Ngọc gameplay v1](../../design/gameplay/van-ngoc-gameplay-assets-v1/README.md) có 11 trạng thái icon, ba đạo cụ rời và sáu thẻ công thức theo đúng plan; nguồn/alpha/native đã giữ. ART chờ owner duyệt; chưa codec, grant, craft engine, drop hoặc nội dung EX mới. Các dòng “chưa tạo” dưới đây là snapshot kế hoạch 11/10.

**Bản 0.2 · 11/10/2026 · kế hoạch, chưa thi công.** Theo [thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md), [catalog HN](../../HANG-NHAC-CONTENT-CATALOG.md) và [nghiên cứu nguồn đợt 2](../../TIEN-NGHICH-CRAFTING-REFERENCES.md). Đây là nhánh chi tiết của [RM0–RM6](../../DEVELOPMENT-ROADMAP.md), không thêm điều kiện phải làm cả crafting/MMO trước HN05.

**Hướng owner làm rõ 11/10:** farm để mạnh lên và dùng sức mạnh trong PvE/PvP là vòng chơi xuyên chặng. [Kế hoạch MMORPG](../../MMORPG-PROGRESSION-PLAN.md) bổ sung **VP4-A / RM5-A**: một nguồn lặp và một nơi tiêu có tác dụng thật có thể thử sau nền RM2, độc lập với thứ tự chuỗi công cụ EX hữu hạn. [Core/backend](../../MMORPG-SYSTEM-CONTRACTS.md) là gate codec/loot/stat/lifecycle. Đây là phạm vi đề xuất cần chọn, chưa cấp item/bonus hoặc sửa nguồn HN/EX hiện có.

## 1. Từ nhìn xa tới làm gần

```text
RM0: nội dung + nguồn + catalog + ledger mẫu
  → VP0 / RM1–RM2: thưởng HN05, item tối thiểu, nguồn số lượng duy nhất
  → VP1 / RM3–RM4: HN08 một phôi → một pháp khí → dùng trong bài
  → VP2 / phần RM5 sau HN12: nguồn vật liệu → recipe → hộp/niêm → một chuyến
  → VP3 / khám phá RM6 hoặc nội dung tương ứng: bàn khảo sát + cách thủ công
  → VP4 / phần mở rộng RM5–RM6: nguồn lặp, gear lựa chọn, kinh tế/công pháp sâu hơn
```

Sơ đồ trên là nhánh thử công cụ hữu hạn. Nhánh **VP0 → nền encounter/loot/nguồn–chi → VP4-A (pilot farm)** có thể được chọn sớm sau RM2, không đợi VP2/3. VP4 mở rộng nghề/trade vẫn cần dữ liệu chơi thử và nội dung tiêu vật liệu thật; JSON catalog không tự mở tính năng. Không trì hoãn RM2 tới khi xong VP2/3. Có thể thiết kế dài hạn song song UI; mỗi gói runtime phải có phạm vi/owner rõ trước đổi file chung.

## 2. Phạm vi từng gói và điều kiện nghiệm thu

| Gói | Đầu vào | Bàn giao hữu hạn | Điều kiện xong | Chưa làm |
| --- | --- | --- | --- | --- |
| VP0 | D01/D02, HN05/nguồn thưởng | Giữ 3 ID cũ, thêm material HN, atomic reward, UI snapshot riêng | Save cũ giữ identity/credit/đồ; nguồn không lặp/đếm hai lần; lỗi ghi không thưởng một phần | Recipe tổng quát, farm/currency |
| VP1 | HN07/08, input pháp khí/slot/policy CD | Instance raw/refined, recipe HN08, proof dùng ngọc, checkpoint bước | Tiêu 4 một lần, một instance; giảm đúng một hit; đổi đồ/restart không reset CD hoặc luyện lại | Công cụ khám phá, craft gear bonus |
| VP2 | HN12, release ngoại vi mở rộng, quyền dịch vụ | 5 vật liệu + mực + hộp; EX01–EX03, 4 recipe của gói (mực/vật tư/hộp/niêm) | Hai cách giao mẫu đều đạt; grant/craft/niêm không dup; lỗi/retry không softlock main quest | Chợ/giá bán, timer nghề, bản mệnh |
| VP3 | EX03, node khảo sát thật và UI hành động ngữ cảnh | Một Định Lưu Bàn, recipe còn lại, EX04 thủ công hoặc tool | Công cụ thay đổi cách quan sát; thông tin/reward tương đương; không soi/cast vượt quyền | Radar world, pháp khí combat mới |
| VP4-A / RM5-A | RM2 đủ ổn + encounter lặp/codec/ledger/nguồn–chi/stat được đặc tả | Một nguồn farm cá nhân, một món/upgrade có nơi dùng; tách grant HN05 khỏi cycle farm | Trước/sau mạnh hơn có mục tiêu kiểm, kill/source không dup, vật liệu có đích tiêu thật | Toàn nghề/trade, farm quest độc hữu, tự mở cơ số drop/stat |
| VP4 mở rộng | Chơi thử gói liên quan (VP2/3 khi mở rộng công cụ, hoặc VP4-A khi mở rộng farm) + backlog có nơi dùng tài nguyên | Chọn **một** trong: mở rộng nguồn / cặp gear / cặp công pháp / trade pilot | Nguồn–chi hữu hạn, có lý do dùng/đổi, chống abuse; không công thức sinh lời vô hạn | Làm mọi nghề/khí linh/tọa kỵ cùng lúc |

Tài khoản/realm/lưu đã có, không xây lại auth. Item codec/validator pilot hiện chỉ cho hai gear: mở rộng phải có migration/test, không UI tự thêm item. `sect.supplies` tiếp tục là nguồn recovery tới khi có migration được kiểm.

## 3. Danh sách việc theo thứ tự phụ thuộc

Mã IT là đầu việc thiết kế/kỹ thuật, không cam kết ngày hoặc lệnh chạy tự động.

| ID | Việc cụ thể | Phụ thuộc | Bằng chứng cần có |
| --- | --- | --- | --- |
| IT01 | Chốt catalog/nguồn/binding; chọn cách xử lý 2 nguyên liệu HN dư trước phát hành | RM0/D02/D11 | Một bảng số được duyệt; save đã cấp không bị trừ khi đổi số tương lai |
| IT02 | Thiết kế codec item/state và adapter gear/supplies cũ | IT01 | Save schema cũ/đăng ký/khách đọc giữ đúng, dữ liệu hỏng báo lỗi, không tự cấp món mới |
| IT03 | Reward plan theo nguồn + business receipt + CAS/transaction | IT02 | Duplicate request/new request cho cùng grant, lỗi commit/timeout, đổi nhân vật không nhân đồ |
| IT04 | Nối HN05/HN06 material vào NPC/J/I | IT03 + quest/encounter thật | Không client authority; mới chỉ grant ở xác nhận, quantity và credit khớp |
| IT05 | Raw/refined + recipe HN08 giữ instance | IT02/03 + HN07 | Tiêu/refine atomic, mất phản hồi không trừ lần hai, chưa xong bài vẫn giữ đồ |
| IT06 | Activation hộ thân + input/feedback | IT05 + contract skill/HP/CD | Một hit, expiry/cancel/duplicate/drop đúng; không tăng stat/đụng R01 cũ |
| IT07 | Đặt hoạt động nguồn EX01/02 trong release được duyệt | VP1/RM4 hoàn tất + nội dung ngoại vi | Không yêu cầu chính tool đang đi lấy vật liệu chế; nguồn cá nhân, không tranh node tutorial |
| IT08 | Recipe mực/recovery/hộp, preview input/output/nguồn | IT02/03 + IT07 | Quantities/ownership/output capacity, craft nhầm thứ tự vẫn không khóa main quest |
| IT09 | Hộp/niêm/trip và EX03 hai phương án | IT08 + 2 tuyến đi đã kiểm | Seal thuộc owner/trip; hoàn tiền trước bắt đầu đúng một lần; no refund sau bắt đầu; hộp không duplicate |
| IT10 | Bàn khảo sát/recipe/EX04 | IT09 + node có dấu/đường quan sát | Công cụ không quyết reward; replay observation không cộng gì, không soi peer |
| IT11 | Chơi thử luồng vật liệu–dụng cụ bằng bộ ba | IT07–10 | Nhận ra nguồn/đích/cách dùng, thực hiện cả phương án thủ công/tool; số liệu chưa đo không báo pass |
| IT12 | Chọn nguồn lặp hoặc cặp lựa chọn tiếp theo | IT11 + yêu cầu sản phẩm | Có ngân sách nguồn–chi/load/anti-abuse trước thêm currency/trade hoặc nhiều recipe |

**Thứ tự code gần nhất vẫn IT01–IT04 cùng RM1/RM2**, sau khi D04–D06 của encounter/transfer được chốt. IT07 trở đi là kế hoạch chuẩn bị, không mở portal/scene mới trong đợt tài liệu.

## 4. Sản xuất asset theo nội dung, không theo số icon muốn lấp

| Gói | Hình cần cho chức năng | Ước lượng phạm vi ban đầu | Nguồn/trạng thái |
| --- | --- | --- | --- |
| VP0 | Nguyên liệu HN nhận diện được ở inventory | 1 icon | Chưa tạo/duyệt; không tự coi icon fixture là đồ thật |
| VP1 | Ngọc raw/refined, tín hiệu hộ thân/tiêu một hit | 2 trạng thái icon cho cùng món; 1 bộ tín hiệu cần brief | Không lấy Thiên Nghịch Châu làm đồ chung; body/cast hiện có giữ |
| VP2 | 5 nguyên liệu + mực + hộp | 7 icon; badge niêm/state có thể là UI, không nhất thiết raster mới | Chỉ tạo sau catalog/recipe được chọn |
| VP3 | Định Lưu Bàn và trạng thái đọc dấu | 1 icon; tín hiệu node/action chưa khóa số frame | Không reuse pháp bảo game khác hoặc phóng ART lên map |
| Nguồn thế giới | Điểm dược/nước/cát, nguồn sợi/ngọc và bàn chuẩn bị | Brief theo level được duyệt, có thể dùng cụm/đạo cụ hiện có phù hợp | Không coi 5 nguyên liệu đồng nghĩa 5 map mới hoặc tự đặt vật trong map owner |

Tới VP3: **11 trạng thái icon mới ước lượng** = 1 material HN + 2 jade states + 7 VP2 + 1 VP3; không 11 loại đồ đã được duyệt. 3 icon runtime hiện có giữ nguyên. Với 8 định nghĩa mở rộng sau HN, không cần 8 character animation mới.

Trước tạo raster phải có: silhouette/chất liệu đối chiếu UI Vân Ngọc, kích thước hiển thị cần đọc, state nào dùng chung bitmap, prompt/input/source, metadata/hash, kiểm alpha/crop và lịch sử duyệt riêng. Nếu cần đặt đồ thật trên map, đọc quy trình map và chốt pivot/layer/navigation trước. Không sinh ART chỉ để minh họa tài liệu hoặc xâm phạm phần UI owner đang làm.

## 5. Dữ liệu, UI và trách nhiệm ghép

| Phần | Trách nhiệm cần giữ |
| --- | --- |
| Định nghĩa/recipe/validator thuần | ID/loại/state/điều kiện/effect; không DOM/Three/SQLite |
| Application gameplay | Lấy owner từ phiên, kiểm nguồn/hoạt động, lập plan tiêu/grant/craft |
| Persistence | Item/quest/reward/cost/CAS trong transaction; version/fingerprint/receipt |
| Room/HTTP | Adapter session/activity/transfer; không để hai room cùng ghi stock |
| C/I/J/NPC | Đọc quantity/raw/refined/seal/recipe từ snapshot, hiển thị thiếu/chờ/lỗi rõ |
| Input/HUD/FX | Chỉ ý định và trình bày; context tool khác quyền skill combat; không tự gán ô trống |
| Content/release | Source point, activity/node/trip scope, story labels, ngân sách và kiểm link |

Item private không broadcast cho peer. Log ghi ID nguồn/recipe/trip/request có kiểm soát, không credentials hoặc toàn inventory người chơi. Preview fixture tách khỏi runtime, save thật không dùng để seed/test.

## 6. Ma trận sự cố bắt buộc trước mở rộng

| Trường hợp | Kết quả chấp nhận |
| --- | --- |
| Nhận nguồn, mất phản hồi rồi nhận lại | Cùng grant một lần; snapshot/receipt đọc được |
| Craft đủ input nhưng output không thể ghi | Không mất input/tiền/quyền; không tạo nửa item |
| Recipe mới với item pilot cũ | Không đổi ID/protection/equip/supplies; migration rõ |
| Craft vật tư trong khi NPC dùng vật tư | CAS/transaction chống lost update, một quantity chung |
| Hai lệnh tranh cùng input | Chỉ một plan hợp lệ được commit; bên còn lại có lý do từ chối |
| Seal trước trip rồi hủy | Đúng một khoản hoàn mực và seal bị hủy, không vừa dùng vừa hoàn |
| Seal/trip sau bắt đầu, drop/restart | Không refund/replay; phục hồi phase/proof theo server, không tính hỏng theo thời gian client |
| Bỏ craft hoặc tiêu vật liệu trước | EX03/04 vẫn có đường thủ công; không main quest/paywall softlock |
| Chuyển room sau craft/nhận proof | Một quyền ghi, không nhân công cụ hoặc mất thành quả |
| Người ngoài gửi item/source/trip ID | Bị từ chối, không nhận thông tin riêng hoặc thao tác hộ |
| Đổi text/phiên bản nội dung | Không thay grant ID để phát lại; migration policy nếu sửa điều kiện thật |
| Mở nguồn lặp sau này | Reset cycle theo server, giới hạn/anti-abuse được đo; không farm recipe hoặc proof cũ |

Đổi nhịp/cost hoặc thêm trạng thái item vẫn cần hồi quy entry/character/R01/sect/lessons/reload và UI/input bị chạm. Không chạy các test đó trong đợt chỉ viết tài liệu này.

## 7. Điều kiện chọn tính năng thay vì thêm vô hạn

- Công cụ mới phải mở **một thao tác hoặc một phương án tiếp cận**, không chỉ một dòng stat khác màu.
- Nguyên liệu mới cần ít nhất một nguồn thật và một recipe/use thật; chưa có thì giữ concept, không phát loot.
- Recipe đầu xác định được kết quả; khi thêm RNG phải có mục đích/đường bảo đảm/hệ quả công khai, không áp cho item tuyến bắt buộc.
- Vật phẩm có chi phí asset/lưu/UI/kinh tế/kiểm thử; tăng số lượng phải kèm nội dung tiêu và ngân sách, không chỉ viết thêm tên.
- Nguồn truyện chưa đủ: dùng nhãn sáng tạo hoặc tiếp tục đọc hợp pháp, không tự gán canon.

**Đầu ra đợt này:** 3 reference mới + sổ đọc 12 trang chương có giới hạn; thiết kế 8 định nghĩa/5 recipe/4 nhiệm vụ hậu nhập môn và manifest chỉ dùng để kiểm kế hoạch. **Chưa có:** ART mới, map đích, codec/recipe engine, craft/loot/runtime hoặc cân bằng được duyệt. Đây là kế hoạch có thể tách việc, không báo đã xây hệ đồ.
