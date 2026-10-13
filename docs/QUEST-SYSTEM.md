# Hệ thống nhiệm vụ — tiến trình cá nhân trong thế giới chung

> **Thiết kế tiếp nối 13/10/2026:** [GDD 0.33](GDD.md), [hệ tu tiên mới](CULTIVATION-REDESIGN-2026-10-13.md) và [Hằng Nhạc v2](HANG-NHAC-ONBOARDING-V2.md) thay đề xuất về nhịp nhập môn, HN04, xác nhận tầng/nhiệm vụ và thời điểm EX trong tài liệu này. Nội dung bên dưới giữ làm cơ sở/lịch sử; trạng thái đang chạy xem [runtime chương](HANG-NHAC-CHAPTER-RUNTIME.md). Bản thiết kế mới chưa thay code/save hoặc duyệt balance/ART.

**Phiên bản 0.1 · 10/10/2026 · GDD 0.29.** Thiết kế cơ sở theo hướng owner đồng ý: chốt hệ thống nhân vật/nhiệm vụ trước khi mở rộng HN05. Các quy tắc mở rộng ở đây là đề xuất để đánh giá, **chưa có quest engine tổng quát được triển khai**.

[Nhân vật](CHARACTER-SYSTEM.md) · [Tuyến Hằng Nhạc](HANG-NHAC-NGUNG-KHI-SPEC.md) · [Lộ trình](DEVELOPMENT-ROADMAP.md) · [UI hiện có](HANG-NHAC-QUEST-UI.md).

**Lớp biên tập bổ sung 10/10:** [hướng sáng tạo](VAN-HAI-CREATIVE-DIRECTION.md) và [kế hoạch nội dung](RPG-CONTENT-PLAN.md) bổ sung động lực, thẻ nhiệm vụ, lựa chọn/hệ quả và reward có công dụng. Tuyến “Dấu sai trên vân lộ” mới là ứng viên, không tự thay ID/credit/thưởng hoặc thêm một quest bắt buộc. Hợp đồng kỹ thuật dưới đây phải phục vụ nội dung được chọn, không thay storyboard.

**Bản chi tiết tiếp nối:** [Chương Hằng Nhạc phương án A](HANG-NHAC-CHAPTER-PLAN.md) có đồ thị/thẻ HN05–HN12, ba nhánh kiểm chứng và một lựa chọn 2 nhánh; [catalog](HANG-NHAC-CONTENT-CATALOG.md) ghi nguồn–chi của từng kết quả. Bản A đề xuất HN06 sau M02 và proof HN09 tách reward để tránh vòng khóa; chưa tự áp vào runtime hoặc đổi receipt cũ.

## 1. Mục đích và hiện trạng

Nhiệm vụ nối hành động với phát triển nhân vật: biết mục tiêu, thực hiện, hiểu kết quả và tiếp cận nội dung mới. Không chỉ là checklist giết/nhặt hoặc nguồn EXP lặp vô hạn. Mỗi bài chính tuyến nên có **một năng lực/hiểu biết cần học**, không buộc mọi người thực hiện một combo thắng duy nhất.

Hiện `shared/sect-quests.ts` là phép chiếu đọc snapshot, không phải engine ghi tiến trình. HN01–HN04 dùng luật `sect`/`training-lessons` trên server và receipt bền. HN05 hiện `unreleased`. Không thay lớp trình bày thành nơi quyết định thưởng; không coi tên quest hiển thị là bằng chứng quest đã chạy.

## 2. Nhóm nhiệm vụ và phạm vi

| Nhóm | Mục đích | Khi cần |
| --- | --- | --- |
| Chính tuyến nhập môn | Dạy thao tác và liên kết tu tiên, mở nội dung | HN01–HN05 trước, rồi HN06–HN12 |
| Nhánh nhân vật | Động lực/cơ duyên/cách giải phù hợp avatar | HN06 và tuyến sau map |
| Bài luyện lại | Thử thao tác/chuẩn bị, có phản hồi | Tái sử dụng bài đã mở; không lặp thưởng độc hữu |
| Nội dung phụ một lần | Lựa chọn chủ động để tích lũy/khám phá | Sau vòng HN05 cơ bản, nếu cần cho nhịp chơi |
| Hoạt động lặp / nhóm / thế giới | Farm hoặc hợp tác có credit/loot rõ | Thiết kế riêng; không mặc định daily/reset thưởng mỗi ngày |

Main quest bắt buộc có đường solo cho cả ba. Không cần tổ đội, giao dịch hoặc trả phí để vượt nhập môn.

## 3. Ba loại dữ liệu phải tách

| Loại | Nội dung thiết kế |
| --- | --- |
| Định nghĩa nhiệm vụ | ID ổn định, phiên bản nội dung, nhóm, phạm vi/avatar, điều kiện xuất hiện/nhận, NPC đầu/cuối, mục tiêu, completion policy, reward policy, retry/replay policy, text/ART/route references |
| Tiến trình nhân vật | Hồ sơ sở hữu, quest ID/phiên bản áp dụng, đã nhận/hoàn tất, objective credit, nhánh, kết quả kiểm chứng và quyền thưởng đã ghi |
| Attempt đang chạy | Encounter/target/warning ID, chủ, map/room, trạng thái/clock/hit của lần thử; tồn tại theo luật hoạt động |

Client đọc view được giới hạn theo quyền. Không gửi toàn bộ định nghĩa bí mật/chương chưa mở, không tin field `completed`, quantity hoặc damage do client yêu cầu.

Định nghĩa dùng cấu trúc khai báo cho điều kiện/mục tiêu phổ biến; evaluator hành vi đặt trong module có tên rõ và test. Không xây ngôn ngữ script, event bus phân tán hoặc visual quest editor trước khi HN05 chứng minh nhu cầu.

## 4. Trạng thái nhiệm vụ và trạng thái kết nối

| Trạng thái view | Ý nghĩa | Thao tác |
| --- | --- | --- |
| `unreleased` | Nội dung chưa triển khai, không chỉ thiếu điều kiện | Giới thiệu ngắn nếu cần; không dẫn tới portal/nút nhận giả |
| `locked` | Đã có nội dung nhưng hồ sơ thiếu điều kiện | Nêu phần thiếu có thể biết, tránh spoil |
| `available` | Có thể nhận | Tới nguồn nhận hoặc dùng thao tác được cho phép |
| `active` | Đã bắt đầu, còn mục tiêu | Hướng dẫn bước còn thiếu |
| `ready` | Đủ mục tiêu, chờ xác nhận hợp lệ | Nêu nơi/thao tác xác nhận; chưa hiện thưởng đã nhận |
| `completed` | Kết quả/thưởng đã commit | Xem lại; luyện lại tách khỏi lần đầu |

Luồng thông thường: **locked → available → active → ready → completed**. Không ép mọi quest qua từng màn/bước: HN01 hiện là tương tác một bước nhận hướng dẫn/vật tư; adapter phải giữ hành vi đó. `locked/available/ready` có thể là view tính từ facts, không nhất thiết thêm tất cả vào schema lưu.

`pending`, offline/reconnecting, commit failed và dữ liệu cũ là trạng thái thao tác/đồng bộ, không đổi quest thành thất bại. Attempt chưa đạt cũng không tự xóa quest hoặc credit đã commit. Bỏ nhiệm vụ/reset tuyến chưa là tính năng; với bài hiện tại, Dừng bài chỉ hủy hoạt động theo luật cũ.

`ready` có thể trở lại `active` nếu mục tiêu yêu cầu đang sở hữu vật phẩm mà vật phẩm không còn đủ; UI phải nêu lý do và server kiểm lại lúc giao. Credit lịch sử đã ghi không bị xóa vì tình huống đó. `completed` không bị lùi do hết vật tư, đổi map hoặc thay text nhiệm vụ; mọi sửa chữa tiến trình cần chính sách riêng, không reset tự động.

## 5. Mục tiêu và bằng chứng hợp lệ

| Mục tiêu | Server kiểm | Tránh |
| --- | --- | --- |
| Tương tác NPC | Đúng NPC/quest/phase, proximity và hành động hợp lệ | Client chỉ gửi “đã đọc lời thoại” rồi nhận thưởng |
| Tới vùng / chuyển map | Vị trí/vùng và transfer đã xác nhận | Tải xong ảnh map là tính tới nơi |
| Vận khí/xác nhận hiểu | Nền, thứ tự, nhịp và câu trả lời/hành động theo bài | Thời gian client hoặc AFK thay thao tác bắt buộc |
| Hit bằng loại đòn | Đúng target, owner, thời điểm sau nhận bài và hit server | Cast hụt, mục tiêu tự do hoặc mục tiêu peer cũng tính |
| Né theo phương pháp | Warning/attempt, movement/arrival và deadline server | Dùng Phong thay bài đi bộ hoặc chỉ nhìn animation |
| Thắng encounter | Attempt đúng chủ, điều kiện thắng/thua và kết quả bền | Client báo quái chết, last-hit người khác hoặc spawn mới cấp lại thưởng |
| Thu nhận / giao vật phẩm | Nguồn hợp lệ, item/quantity, chính sách sở hữu/tiêu hao | Một sự kiện nhận đồ bị đếm nhiều lần hoặc đồ người khác |
| Vận dụng công cụ/giải bình cảnh | Đúng điều kiện và kết quả kiểm chứng | Chỉ mở menu hoặc đầy tu vi là tự lĩnh ngộ |

Mỗi mục tiêu phải nói rõ: kiểm **sự kiện đã xảy ra**, **tổng số nhận từ nguồn sau khi nhận quest**, hay **đang sở hữu tại lúc giao**. Ba cách này khác nhau. Nếu cần giao đồ tiêu hao, server kiểm lại lúc commit; không chỉ tin credit từng có. Đồ bắt buộc không thể mất vĩnh viễn do dùng/bán nhầm mà thiếu đường khôi phục.

Nhóm điều kiện dùng AND/OR có chủ đích; phân nhánh theo avatar. Không thay điều kiện thắng hợp lệ bằng điểm combo ẩn. Nhiệm vụ mới mặc định không tính hành động trước khi nhận, trừ prerequisite/retroactive policy được ghi rõ trong định nghĩa.

## 6. Quyền credit trong MMO

| Phạm vi | Chính sách thiết kế |
| --- | --- |
| Khu môn phái chung | NPC không tranh lượt; lời thoại/quest theo từng hồ sơ |
| Bài luyện cá nhân hiện có | Đúng owner/target/attempt, giữ luật HN03/04 |
| HN05 đầu | **Đề xuất:** encounter cá nhân trên tuyến ngoại vi; không tranh last-hit, kết quả và tài nguyên nhiệm vụ riêng |
| Farm chung tương lai | Cần chốt threat, eligibility tham gia, credit, spawn/leash và loot trước khi mở |
| Tổ đội tương lai | Eligibility từng người; không tự hoàn tất quest cho người chưa nhận/chưa đủ điều kiện |

Mỗi fact xử lý nội bộ cần đủ context để loại event cũ/sai: actor/owner, quest hoặc activity, encounter/attempt, target, map/room, event identity/thứ tự theo hợp đồng và thời điểm server. Không cho hai room cùng ghi một encounter hoặc hai client cùng điều khiển profile. Không yêu cầu lưu mọi frame/tick vào DB: chỉ lưu điểm tiến trình/kết quả cần bền, với phương án chống đếm lại sự kiện khi phục hồi.

## 7. Xác nhận, thưởng và mốc nhân vật

Luồng nghiệp vụ đề xuất:

1. Client gửi ý định nhận/tiếp tục/xác nhận với request ID, không gửi phần thưởng.
2. Server lấy hồ sơ từ phiên, kiểm version/revision, prerequisite, proximity và mục tiêu hiện tại.
3. Tạo candidate gồm quest result, tiêu hao nếu có, vật phẩm/tích lũy, quyền nội dung và receipt tương ứng.
4. Commit atomic qua persistence/CAS. Nếu lỗi thì không áp dụng một phần vào actor/UI.
5. Trả snapshot/kết quả đã ghi; notification/animation chỉ phản ánh commit, không là authority.

Cần **hai lớp chống lặp**: request ID/fingerprint cho cùng thao tác gửi lại; khóa nghiệp vụ thưởng lần đầu theo hồ sơ + quest/reward grant ổn định, để request ID mới cũng không nhận lại. Phiên bản văn bản/nội dung không tự tạo khóa thưởng mới. Nếu sau này có repeatable quest, phải thiết kế cycle ID và ledger riêng, không xóa receipt lần đầu.

Khi client mất phản hồi, đọc lại snapshot/receipt qua luồng được phép; không tự replay chuỗi lệnh nhiệm vụ sau reconnect. Tài nguyên, kết quả và mốc cùng cập nhật nếu thuộc một thao tác hợp lệ. Nếu mốc còn thiếu ngưỡng hoặc cần xác nhận riêng, giữ nhiệm vụ đã xong và hiển thị mốc đang chờ; không cấp stat sớm, không bắt nhận lại thưởng.

HN05 thưởng nhiệm vụ không cộng thêm kill reward của E01. Thổ nạp không nhân theo số tab. Mốc/tài nguyên riêng từng character, không dùng avatar làm khóa.

## 8. Bản đặc tả HN05 để kiểm khung — chưa triển khai

| Mục | Đề xuất cho đợt đầu |
| --- | --- |
| Mục đích học | Tự đọc đòn, dùng bộ đã học, thắng và mang kết quả về; không chỉ làm checklist ba skill lần nữa |
| Điều kiện nhận | HN04 đã xác nhận; nhận tại Người coi luyện thuật hiện có, chưa thêm NPC canon mới |
| Tiếp cận | Map ngoại vi có spawn/đường quay về; quyền vào tuyến theo HN04, bắt đầu encounter cần HN05 active |
| Encounter | Một E01 áp sát; loại đòn, timing, hình học theo prototype đã đối chiếu runtime 8 px, không bê collider 18 px cũ |
| Thắng | E01 bị hạ bởi hoạt động hợp lệ của chính hồ sơ; người chơi còn HP > 0 tại chốt kết quả. Đòn thường/Kiếm/Lôi đều có thể thắng |
| Tài nguyên nhiệm vụ | Kết quả thắng ghi bền quyền thu nhận/tài nguyên nhiệm vụ không giao dịch; **đề xuất bản đầu tự ghi credit**, chưa cần nhặt random drop trên đất |
| Xác nhận | Quay về NPC; kiểm proof đúng owner, cấp gói thưởng lần đầu và hoàn tất atomic |
| M02 | Chỉ sẵn sàng khi HN05 hoàn tất và ngưỡng 3 đã xác nhận; thao tác xác nhận mốc thống nhất theo quyết định RM0 |
| Phần thưởng | Bảng thử cũ đề xuất +100 tích lũy, 3 nguyên liệu luyện hóa nhiệm vụ, 2 vật tư. Chỉ dùng sau chốt item/nguồn/số lượng; không seed những món này từ UI |
| Luyện lại | Có thể thiết kế luyện không thưởng sau này; không mặc định được farm gói HN05 |

**Không tạo vòng khóa:** chưa có M02 vẫn phải vào được encounter dùng để đạt M02. Đủ tu vi mà chưa thắng không được M02. Tài nguyên quest/proof nêu trên là quyền ghi kết quả, không tự tạo một loại tiền tệ hoặc vật phẩm dùng chung thứ hai.

Nếu giữ thưởng thử cũ, HN02–HN05 cho 100 + 80 + 80 + 100 = 360 tích lũy khi không chạy nền; đủ ngưỡng thử không thay hành động xác nhận. Đây chỉ là đối chiếu thiết kế, không báo runtime đã có HN05.

## 9. Thất bại và vòng đời

| Tình huống | Bắt buộc bảo đảm | Quyết định HN05 còn cần chốt |
| --- | --- | --- |
| Bị hạ/chưa đạt | Không hoàn tất/nhận thưởng; giữ nhiệm vụ và thành quả bền trước attempt | Điểm trả về, HP/MP/cooldown và đường chuẩn bị miễn phí cho bài bắt buộc |
| Dừng/rời giữa trận | Dọn actor/đòn của attempt, không làm mất reward đã ghi | Điều kiện được rời, attempt reset hay checkpoint |
| Disconnect giữa trận | Ngừng nhận input không hợp lệ; không client-authoritative win | Grace/timeout và AI có tiếp tục hay không; không copy pause 30 giây của đề xuất HN10 |
| Backend restart trước kết quả bền | Không tự suy thắng từ animation hoặc HP cache | Tiếp tục attempt hoặc reset về điểm an toàn theo policy đã chốt |
| Thắng đã ghi, chưa xác nhận NPC | Giữ proof/credit, trở về đúng bước | Không spawn lại và buộc thắng thêm để nhận cùng thưởng |
| Commit xong, mất phản hồi | Đọc đúng kết quả, không cấp lại | UI hiển thị “đã ghi” sau đồng bộ |
| Chuyển map lỗi | Không có hai actor/writer hoặc profile ở map không tồn tại | Rollback/return destination của hợp đồng transfer |

HN03/04 giữ cleanup/credit hiện có. Không áp quy tắc thất bại combat thật ngược vào bài né an toàn. Khuyến nghị HN05 có đường chuẩn bị/thử lại không cần farm hay trả phí; cơ chế và chống lạm dụng cần chốt trước code encounter.

## 10. UI dùng chung, không mở màn giả

Tracker chỉ có mục tiêu hiện tại và hành động kế; J chứa chi tiết, lịch sử và điều kiện; NPC trình bày hành động thực. C/I đọc kết quả về nhân vật/đồ từ cùng nguồn. Trạng thái action gồm khả dụng, thiếu điều kiện có lý do, pending, mất kết nối và đã ghi.

Không dùng màu đơn độc để phân biệt đã đạt; không báo completed trước commit. Chưa triển khai khác chưa mở theo tiến trình. Bản đồ chỉ dẫn tới map/NPC có thực; không tự đi, teleport hoặc mở portal từ nút chỉ đường. Tái sử dụng Vân Ngọc và [vùng đọc](GAME-UI-READING.md), không tạo UI engine thứ hai cho HN05.

## 11. Nối HN01–HN04 và phiên bản nội dung

1. Giữ ID HN/khóa receipt/cờ và credit hiện hành; tạo adapter để đọc thành quest view chung.
2. So evaluator mới với kết quả cũ trên fixture trước chuyển nguồn ghi. Một domain chỉ có một writer/ledger có hiệu lực; không shadow-write thưởng.
3. HN01 một bước; HN02 vòng/understanding/M01; HN03 ba hit; HN04 hai phương thức né là các ví dụ kiểm chứ không bị ép đổi luật cho vừa schema mới.
4. Save thiếu trường mở rộng nhận mặc định chưa làm; không suy đã làm HN05 vì có tầng 3 hoặc đủ 360.
5. Quest đang làm giữ version phù hợp hoặc có mapping migration rõ. Đổi text không reset tiến độ; sửa điều kiện/reward cần policy cho người đã nhận/đã hoàn tất. Dữ liệu mâu thuẫn báo lỗi, không xóa save.

Giữ cả ledger khách và ledger đăng ký qua `ProfilePersistence`; inventory/sect/cast receipts không bị thay bằng bảng mới thiếu migration. Kiến trúc theo [ARCHITECTURE](ARCHITECTURE.md): shared thuần, server điều phối và persist, room/HTTP/DOM là adapter. Không đặt quyền quest trong hotbar/animation.

## 12. Điều kiện nghiệm thu hệ thống tối thiểu

- HN01–HN04 biểu diễn được mà không đổi phần thưởng, quyền skill hoặc thao tác xác nhận hiện có.
- HN05 có đặc tả đầy đủ cho thắng, thua, rời, mất mạng, restart và chuyển map; mỗi case biết nguồn sự thật.
- Request trùng và request ID mới cho thưởng đã nhận đều không cấp thêm; lỗi lưu rollback toàn bộ.
- Credit sai target/owner/map/attempt, event trước nhận bài hoặc event lặp đều bị loại theo policy.
- Hai hồ sơ cùng avatar vẫn có quest/đồ riêng; no last-hit stealing ở HN05 cá nhân.
- Migration giữ kết quả/cờ/receipt cũ; không reset nguồn supplies hoặc cấp lại gear.
- UI đọc đúng available/active/ready/completed/unreleased, giữ focus và chặn input map khi modal.

Những kiểm này thuộc RM1/RM2 của [lộ trình](DEVELOPMENT-ROADMAP.md), chưa được chạy trong đợt tài liệu. Không yêu cầu quest editor, daily, nhóm hoặc toàn HN01–HN12 trước khi nghiệm thu một vòng HN05.
