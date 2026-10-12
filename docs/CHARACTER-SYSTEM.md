# Hệ thống nhân vật — nền RPG tu tiên

**Phiên bản 0.1 · 10/10/2026 · GDD 0.29.** Owner đã đồng ý hướng thiết kế hệ thống nhân vật/nhiệm vụ trước khi mở rộng HN05. Tài liệu này là **thiết kế cơ sở để đánh giá**, không xác nhận mọi luật mới đã được duyệt hoặc triển khai. Phạm vi chi tiết là Hằng Nhạc; arc sau giữ đường mở rộng, không sản xuất toàn bộ MMO ngay.

Đọc cùng [GDD](GDD.md), [sáu phần tu tiên](CULTIVATION-SYSTEM.md), [nhiệm vụ](QUEST-SYSTEM.md) và [lộ trình](DEVELOPMENT-ROADMAP.md). Truyện/nhận diện thuộc [CHARACTERS](CHARACTERS.md); đây không phải tài liệu vẽ UI hay thay ngoại hình.

**Lớp nội dung bổ sung 10/10:** [kế hoạch phát triển RPG](RPG-CONTENT-PLAN.md) nối chặng nhiệm vụ với công pháp/thuật/đồ/pháp bảo, nguồn–chi, lựa chọn hậu nhập môn và phạm vi MMO. [Hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md) là ứng viên để đánh giá; không tự thêm slot, bonus, recipe hoặc cảnh giới vào hợp đồng hiện tại.

## 1. Mục tiêu và nền hiện có

**Bổ sung theo GDD 0.32 ngày 11/10:** [kế hoạch MMORPG xuyên chặng](MMORPG-PROGRESSION-PLAN.md) đặt tăng sức mạnh/farm/build, PvE/PvP và hiện diện nhân vật vào hành trình. [Contract Core](MMORPG-SYSTEM-CONTRACTS.md) tách nguồn power, item ownership, appearance entitlement/đang hiển thị và public projection; đây là phần cần mở rộng, chưa schema runtime. Avatar/cảnh giới canon khác năng lực gameplay dùng để ghép đấu. Đổi thời trang không tự đổi avatar identity hoặc stat; hiệu lực nếu có phải nguồn riêng được công khai/cân bằng. Giữ gear/max HP/MP pilot và save tới khi đặc tả tăng trưởng/migration được chốt.

Người chơi phải trả lời được: **tôi là ai → hiện dùng được gì → muốn tiến tiếp còn thiếu gì → phải làm gì để đạt được → kết quả đã lưu chưa**. Sức mạnh có nguồn và giới hạn, không chỉ một số chiến lực hoặc nhiều thanh EXP.

| Nền checkout 10/10 | Giới hạn cần giữ |
| --- | --- |
| [Entry thật](GAME-ENTRY-BACKEND.md): account/session/realm/character, tên riêng, vé chơi và lease | Mặc định 3 slot/realm, admin cấu hình; nhiều hồ sơ có thể cùng avatar. Chưa phải hạ tầng MMO nhiều máy/khôi phục tài khoản hoàn chỉnh |
| [R01](HANG-NHAC-R01-RUNTIME.md), [HN01–HN02](HANG-NHAC-SECT-RUNTIME.md), [HN03–HN04](HANG-NHAC-LESSONS-RUNTIME.md) | Bộ R01 có sẵn, tích lũy và tầng 1–3 thử, mốc profile mới tới M01. Không coi tầng 3 là đã có M02 |
| [Nhân vật/hành trang nhập môn](HANG-NHAC-CHARACTER-RUNTIME.md) | Hai gear, mang/tháo/bảo vệ; vật tư thật phản chiếu `sect.supplies`. Chưa container/loot/bonus tổng quát |
| C/I và UI Vân Ngọc/Linh Đài | Dữ liệu/bonus/12 món của trang preview không phải catalog gameplay |

Đợt thiết kế này không sửa các nền trên. Nâng hệ thống bằng adapter/migration có kiểm, không bắt người chơi tạo lại hồ sơ.

## 2. Danh tính, sở hữu và phiên chơi

| Khái niệm | Trách nhiệm |
| --- | --- |
| `accountId` | Chủ sở hữu tài khoản, phiên đăng nhập và quyền truy cập; không phải khóa tiến trình dùng chung |
| `realmId` | Phạm vi server lưu nhân vật; không đồng nghĩa máy vật lý hoặc room |
| `characterId` | Danh tính hồ sơ playable trong entry; tiến trình, nhiệm vụ và đồ thuộc đúng hồ sơ đã xác thực |
| `avatarId` | Mẫu Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển; không dùng thay ID hồ sơ |
| Map / room / encounter | Nơi và phiên hoạt động; đổi room không đổi nhân vật hoặc chủ sở hữu |
| Lease điều khiển | Một tài khoản điều khiển một nhân vật tại một thời điểm theo entry hiện có |

`CharacterProfile.id` và liên kết entry/persistence hiện có phải được giữ khi bổ sung mô hình; các tên ở đây là khái niệm, không yêu cầu đổi tên trường/ID trong save. Khách DEV và nhân vật đăng ký không được ghép theo tên/avatar. Claim guest, chuyển realm và kho tài khoản cần thiết kế riêng.

## 3. Bốn lớp trạng thái

| Lớp | Nội dung | Quy tắc |
| --- | --- | --- |
| Danh tính và diễn giải | Avatar, tên, trạng thái truyện, nhãn tu luyện/hồi phục | Không suy cảnh giới nguyên tác từ stat hoặc mốc gameplay |
| Tiến trình bền | Tu vi, tầng/mốc xác nhận, công pháp, quyền thuật, lĩnh ngộ, chương, nhiệm vụ, đồ, vị trí an toàn | Server lưu; migration giữ thành quả và receipt |
| Năng lực tính ra | HP/MP tối đa, tác dụng đòn, hiệu lực công pháp/trang bị nếu đã mở | Tính từ nguồn hợp lệ; client không gửi tổng chỉ số để được chấp nhận |
| Trạng thái hoạt động | HP/MP hiện tại, cooldown, đang cast/luyện/chiến đấu/chuyển cảnh, target và warning | Một phần cần lưu qua restart; không coi toàn bộ là tạm và reset cooldown/HP khi reconnect |

Attempt, projectile và warning không trở thành chiến thắng đã lưu. HP/MP, deadline và kết quả đã commit phục hồi theo luật từng hoạt động. Menu không pause simulation khu chung.

## 4. Sáu phần phát triển và cách nối

| Phần | Trạng thái tối thiểu cần thiết kế | Tác dụng trong Hằng Nhạc | Không làm |
| --- | --- | --- | --- |
| Cảnh giới / hồi phục | Tích lũy, tầng/ngưỡng đã xác nhận, mốc, điều kiện thiếu | Cho biết năng lực đang được vận dụng và bình cảnh tiếp | Tự vượt mốc do thanh đầy hoặc đổi map |
| Công pháp | Nguồn học, nền đã hiểu, nền đang dùng, giới hạn | Nền vận khí/hồi phục; HN07 mở cách vận hành tiếp | Đồng nhất công pháp với nút skill |
| Thuật pháp | Quyền dùng, điều kiện, bộ đang vận dụng | Ba R01 từ đầu; HN03/04 hướng dẫn, HN09 phối hợp | Cấp lại R01 hoặc mở R02–R05 từ ART |
| Pháp bảo | Sở hữu, nhận biết, luyện hóa, trang bị, khả năng kích hoạt | HN08 giới thiệu một pháp khí có tác dụng/đánh đổi | Nhặt được là dùng toàn lực, mọi gear là pháp bảo |
| Lĩnh ngộ | Vấn đề đã gặp, kiểm chứng, kết luận, điều kiện được giải | HN07 giải một bình cảnh bằng hành động | EXP trí tuệ từ mọi kill hoặc cấp ý cảnh cao |
| Hành trình | Chương, nhánh đúng avatar, cơ duyên và quyền nội dung | HN06 khác nhẹ; HN11/12 dẫn sang tuyến tiếp | Cùng nhiệm vụ là cùng lịch sử/cơ duyên nguyên tác |

Luồng tổng: **nhiệm vụ/khám phá → tài nguyên hoặc điều đã hiểu → đủ điều kiện → xác nhận vận dụng → khả năng mới → thử trong nội dung tiếp**. Không cần sáu menu ngay đầu.

## 5. Tích lũy, tầng và mốc là ba việc khác nhau

1. **Tu vi/tiến triển hồi phục:** tổng tích lũy; không phải MP và không bị trừ khi cast.
2. **Tầng/ngưỡng xác nhận:** phần đã được phép vận dụng theo điều kiện nền.
3. **M01–M04:** cột mốc trải nghiệm; còn cần nhiệm vụ/khảo nghiệm tương ứng.

| Mốc | Đề xuất điều kiện trải nghiệm | Tình trạng |
| --- | --- | --- |
| M01 | HN02, vòng vận khí và xác nhận nền đầu | Đã có runtime |
| M02 | HN05 hoàn tất + ngưỡng 3 đã xác nhận | Thiết kế; chưa có runtime M02 |
| M03 | HN09 + HN07/08 trong chuỗi + ngưỡng 9 đã xác nhận | Thiết kế |
| M04 | HN10 hợp lệ + điều kiện vào ngưỡng cuối | Thiết kế; không cấp stat sau trận trước trận |

**Ví dụ phải hỗ trợ:** người đã tích lũy/xác nhận tầng 3 nhưng mới xong HN04 vẫn chưa có M02. Ngược lại, nếu chính sách sau này cho hoàn tất HN05 trước ngưỡng 3, nhiệm vụ đã hoàn tất giữ nguyên; M02 chờ điều kiện còn thiếu, không bắt đánh lại hoặc nhận lại thưởng. Đánh giá mốc cần chạy khi bất kỳ điều kiện liên quan thay đổi, không chỉ lúc bấm nhận thưởng.

Phần thưởng vượt cổng tích lũy giữ đủ; không clamp mất thưởng hoặc tự mở nền kế. Idle dừng ở gate theo luật, không tự xác nhận tầng/nhiệm vụ. Phân bổ 15 tầng và mốc 1/3/9/15 ở [hồ sơ tiến trình](HANG-NHAC-PROGRESSION-REWARDS.md) vẫn là bảng thử, không phải cân bằng đã khóa.

## 6. Thuộc tính và nguồn tăng trưởng

Đề xuất mỗi năng lực tính ra có bảng nguồn: **baseline → mốc đã xác nhận → nền công pháp đang hợp lệ → đồ/pháp bảo đang vận dụng → hiệu ứng có hạn**. Nguồn chưa triển khai đóng góp bằng 0; không lấy bonus fixture UI.

| Nhóm | Cần quyết định | Baseline phải bảo toàn khi làm nền hệ thống |
| --- | --- | --- |
| HP/MP | Max, hồi phục, khi max thay đổi có giữ số tuyệt đối/tỷ lệ hay không | Hiện max 100/100, gear nhập môn không cộng bonus; thay max không được ngầm coi là hồi đầy |
| Đòn và phòng ngự | Nguồn damage, loại giảm trừ nếu có, thời điểm chốt stat mỗi cast | Giữ công thức/chi phí/hit R01 hiện hành; chưa thêm crit, né ngẫu nhiên hoặc chỉ số chiến lực |
| Di chuyển/va chạm | Hiệu ứng thay tốc độ nếu cần | Camera 1×, locomotion 64 × 96, chân (32,88), collider 8 px; không dùng collider 18 px của đề xuất encounter cũ |
| Gear/công pháp | Slot, điều kiện, thứ tự cộng/nhân và trần | Chưa chốt bonus mới hoặc nhiều slot công pháp; không thay stat chỉ để màn so sánh có số xanh |

Trước bật tăng stat tại M02 phải có bảng tác dụng, quy tắc HP/MP/cooldown khi đổi nguồn và kiểm bằng cả ba avatar. Không đổi luật R01 trong một migration nhân vật.

## 7. Đồ, trang bị và pháp khí

- **Item definition:** loại, nguồn, stack policy, slot, điều kiện, tác dụng, ART. **Đồ sở hữu:** ID/stack, chủ, số lượng, nơi chứa, bảo vệ/ràng buộc. Hai loại dữ liệu không trộn.
- Gear đang trang bị và nơi chứa phải có invariant rõ; không có một instance đồng thời ở hai vị trí sử dụng. Cách UI liệt kê đồ đang mang không tạo bản sao.
- Vật tư hồi phục hiện có đúng một số lượng ở `sect.supplies`. Mở container phải quyết định giữ adapter hay chuyển nguồn một lần; không đồng thời cộng stack mới và số cũ.
- Reward nhiệm vụ và reward kill là nguồn khác nhau. HN05 không tự có random drop/kill reward thêm vào gói nhiệm vụ.
- Nếu áp sức chứa, phải có cách nhận phần thưởng bắt buộc mà không mất đồ/khóa tuyến; chốt trước khi bật giới hạn. Không mặc định xây mailbox/kho chung chỉ để xử lý việc này.
- Số slot, stack max, sức chứa, giao dịch, rarity, cường hóa và crafting là quyết định riêng. Chỉ mở phần tối thiểu phục vụ HN05 ở RM1; HN08 mới cần vòng luyện hóa pháp khí.

## 8. Bản sắc ba nhân vật

| Nhân vật | Nhãn/ý nghĩa | Cách thể hiện nhập môn | Không đánh đổi |
| --- | --- | --- | --- |
| Vương Lâm | Tu luyện, quan sát và vận dụng | HN06 quan sát dấu hiệu/chọn thời cơ | Không cấp cơ duyên châu cho cả ba |
| Tư Đồ Nam | Linh thể, hồi phục hiện diện/thi triển | HN06 ổn định khả năng đã biết | Không xóa kiến thức; không tự miễn damage |
| Lý Mộ Uyển | Tu luyện, nền đan–trận và chuẩn bị | HN06 chọn chuẩn bị rồi tự kiểm chứng | Không biến thành người chỉ hồi máu, cần đồng đội mới chơi được |

Đây là hướng của đặc tả, chưa khóa hành động/đối thoại HN06. Nền điều khiển/R01 chung giúp so sánh độ khó; sâu hơn sau Hằng Nhạc phải khác lựa chọn/hành động chứ không chỉ màu/stat. Nhận diện Vân Hải Đạo Đồ và ý tưởng ân oán/nghịch thiên không tự thay roster hoặc thành hệ thiện ác đã có.

## 9. Hợp đồng trình bày và quyền quyết định

Snapshot riêng cần cho UI biết: danh tính hồ sơ, revision/trạng thái đồng bộ, tài nguyên, tiến trình, nguồn thuộc tính, quyền đang dùng, điều kiện thiếu và action khả dụng/lý do khóa. Đây là danh mục thiết kế, không khẳng định đã có một endpoint tổng hợp.

- C: hiện tại, nguồn tăng trưởng và mục tiêu kế; I: đồ thật/hiệu lực/điều kiện; J: việc cần làm để tiến tiếp.
- Học được, sở hữu, đã luyện hóa, đang trang bị và đang dùng được là trạng thái khác nhau.
- UI chỉ phát ý định theo ID; backend kiểm hồ sơ từ phiên, điều kiện và quyền sở hữu. Không tin ID chủ sở hữu/số thưởng/bonus client gửi.
- Khi chờ phản hồi khóa thao tác gây tiêu hao; mất mạng đọc lại snapshot, không tự replay dùng đồ/vượt mốc. View mới không giữ đồ/nhiệm vụ hồ sơ cũ sau đổi nhân vật.
- Công khai cho peer chỉ thông tin cần render/đánh nhau; inventory/quest/receipt không broadcast tùy tiện.

## 10. Tương thích và phạm vi triển khai

Theo [kiến trúc](ARCHITECTURE.md): hợp đồng/evaluator thuần, application server điều phối, persistence transaction/CAS/receipt, room/HTTP/DOM là adapter. Chưa tách microservice hoặc viết lại account/skill core.

Thứ tự chuyển tiếp: kiểm kê dữ liệu → view adapter tương thích → evaluator mới so kết quả với luật cũ trên fixture → migration nếu thật sự cần → chuyển từng nguồn ghi. Không để mô hình cũ và mới cùng cấp thưởng hoặc sở hữu số lượng. Giữ receipt `cast/sect/inventory`, identity, mốc, credit, đồ, HP/MP và deadline; dữ liệu hỏng báo lỗi, không reset để vào game.

## 11. Điều kiện hoàn tất thiết kế / kiểm chứng sau này

Thiết kế sẵn sàng cho RM1 khi đã có: bảng sở hữu/nguồn dữ liệu; nguồn stat và quy tắc chuyển mốc; các điều kiện HN05/M02; item tối thiểu; mapping UI; bảng migration/lifecycle. Câu hỏi còn mở được theo dõi ở [RM0](DEVELOPMENT-ROADMAP.md), không quyết ngầm trong code.

Kiểm runtime sau triển khai: hai hồ sơ cùng avatar vẫn riêng; một profile không có hai writer; save cũ đọc đủ; không mất vật tư khi nguồn chuyển; lỗi commit không đổi actor/đồ; reconnect không hồi đầy/lặp cooldown/thưởng; M02 chỉ khi cả hai điều kiện đủ; Tư Đồ Nam đúng nhãn; C/I/J cùng một trạng thái server. Unit/integration/browser và duyệt ART là các bằng chứng khác nhau.
