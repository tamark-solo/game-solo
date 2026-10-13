# Hằng Nhạc — bản thử NPC Wave A

**13/10/2026 · Đã nối bản thử Wave A; smoke NPC cuối đạt, hồi quy mở rộng còn timeout · Hình runtime vẫn là mẫu đệ tử.**

Theo [roster owner](VAN-HAI-LIVING-WORLD-PLAN.md), đợt này đưa danh tính và sinh hoạt Wave A vào hub để người chơi gặp được người có việc làm. [Phụ lục nhiệm vụ](HANG-NHAC-NPC-LIFE-PLAN.md) giữ liên hệ đế đối chứng/luồng HN mới; tích hợp NPC không tự hoàn thành thiết kế lại HN04.

## Phạm vi

- Wave A gồm **10 NPC**: bốn đầu mối hiện hữu mang tên riêng, bốn vai hỗ trợ/truyện, hai đệ tử sinh hoạt.
- Trần Duy/Diệp Tĩnh/Tạ Kiếm Sơn/Tô Nhược giữ `guide/cultivation/training/preparation`, cùng tọa độ và luồng lệnh server hiện hành.
- Bạch Chỉ, Tống Thiết, Hứa Hành, Đinh Sóc, Kỷ An và Phùng Dã bổ sung nhận diện/lời thoại quanh hub. Dịch vụ chưa nối báo “Chưa mở”; không mở chợ, thú cưỡi, farm mới hoặc quan hệ có thưởng.
- Lời đáp theo tiến trình đang có là trình bày cục bộ theo hồ sơ; không thêm callback giả hoặc ghi tiến trình mới từ client.
- Lục Văn, A Ly, Mạc Bà và Tiểu Nghiên thuộc Wave B, chưa đưa vào đợt này.

## Danh tính và khu

| NPC | Vai trò | Khu |
| --- | --- | --- |
| Trần Duy | Tiếp dẫn / `guide` | Sân môn phái; chân hiện hành (1536,1168) |
| Diệp Tĩnh | Giảng sư / `cultivation` | Vườn thổ nạp; chân hiện hành (736,944) |
| Tạ Kiếm Sơn | Giáo tập / `training` | Sân luyện đông; chân hiện hành (2464,880) |
| Tô Nhược | Tư Vật Các / `preparation` | Khu chuẩn bị; chân hiện hành (2392,1488) |
| Bạch Chỉ | Dược sư | Dược đình phía tây; chân (640,912) |
| Tống Thiết | Luyện khí sư | Xưởng đông nam; chân (2544,1472) |
| Hứa Hành | Người giữ tuyến | Đường tuần sơn/lối ngoại vi; chân (1600,1776) |
| Đinh Sóc | Hộ sơn | Cổng ngoại viện; chân (1504,1776) |
| Kỷ An | Đệ tử vận khí | Rìa vườn thổ nạp; chân (824,1056) |
| Phùng Dã | Đệ tử luyện kiếm | Rìa sân luyện đông; chân (2368,704) |

Sáu điểm mới dùng vùng đi có sẵn, không sửa authored map/navigation/chín blocker/bậc thang. Cả mười điểm qua kiểm bán kính 24 px và đường từ spawn (1616,992); [bản bố trí](design/world/van-hai-living-world-v1/placement.html) dùng cùng tọa độ. NPC chỉ đứng tại điểm với animation mẫu sẵn có; chưa có gesture nghề, patrol hoặc escort, không có collider mới.

## Nối vào client

`client/src/npc-life.ts` giữ danh tính, điểm đứng và lời đáp đọc từ tiến trình của hồ sơ đang chơi. `hang-nhac.ts` vẽ mười NPC bằng hai atlas đệ tử; `sect-ui.ts` dùng lại khung đối thoại hiện hành. Bốn station được ưu tiên khi vùng E chồng nhau; tên riêng đi cùng vai trò cũ trên tiêu đề, chỉ dẫn và ghim nhật ký.

Sáu hội thoại mới không có nút lệnh hoặc gửi `sect:command`/`chapter:command`. Tầm nói chuyện là 72 px và phải có đường nhìn thông theo va chạm hiện hành. Chỉ mở khi online, ở hub, nhân vật còn sống, hồ sơ khớp snapshot, trang đang hiện/có focus và không có modal khác, motion lock, thi triển hoặc bài luyện đang mở. Rời phạm vi, đổi hồ sơ, mất kết nối, chuyển scene hay ẩn trang đều đóng hội thoại; nối lại không tự mở. Lời đáp không cấp vật tư, reward, receipt hoặc ghi tiến trình.

## ART và hoạt động

[Pilot Trần Duy v2](design/characters/van-hai-npc-concepts-v2/index.html) theo skill actor dùng Pixel02 làm ảnh tham chiếu thật. Đầu cải thiện so v1 nhưng bề ngang native31px vẫn hẹp hơn basis khoảng44px; chưa đạt match anatomy. Một neutral Đông Nam, browser6case/mobile390 đạt; ownerApproved/artApproved/runtimeImported vẫn false. Ba NPC v2 còn lại mới có spec/plan/prompt, chưa tạo ảnh. Bộ v1 giữ làm tham chiếu nhận diện.

Mười NPC dùng mẫu đệ tử sẵn có trong bản thử. [Bốn concept mới](design/characters/van-hai-npc-concepts-v1/README.md) là master neutral Đông Nam của bốn đầu mối, **chưa duyệt hình và chưa ghép runtime**. Không dùng một ảnh neutral để tuyên bố đã có idle/talk/tám hướng; không sao chép playable làm NPC.

Đế đối chứng hai mẫu vẫn thuộc [gói asset nhập môn](design/gameplay/hang-nhac-onboarding-assets-v1/README.md), chưa đặt trên map. Việc thêm NPC không tự đặt đế hoặc mở bài đối chứng mới.

## Kiểm tích hợp

- `node --import tsx --test tests/unit/npc-life.test.ts`: **3/3 đạt**, gồm roster, khớp tọa độ bản bố trí, khoảng trống/đường tới mười điểm, ưu tiên station, tầm/LOS, hồ sơ/lifecycle và khóa lore khi bài luyện còn mở dù `practising=false`.
- `node --import tsx tests/smoke/hang-nhac-npc-life-smoke.mjs`: **7 tương tác đạt** (sáu lore và Diệp Tĩnh), kiểm lore không gửi lệnh, Escape/ẩn trang đóng; DB và storage fixture riêng, hash map owner giữ nguyên. [Kết quả](../artifacts/hn-npc-life-eSL551/result.json), [ảnh đối thoại](../artifacts/hn-npc-life-eSL551/herbalist-dialog.png).
- `npm.cmd run typecheck`: đạt sau nối adapter và sửa đóng ngay ở `blur`/`visibilitychange`.

Lượt smoke trên dùng điểm Bạch Chỉ (620,925) trước khi chốt (640,912). **Lượt cuối đã đạt cả bảy tương tác với tọa độ cuối và gate bài luyện hiện hành**: [kết quả](../artifacts/hn-npc-life-7z83Mn/result.json), [ảnh Bạch Chỉ](../artifacts/hn-npc-life-7z83Mn/herbalist-dialog.png). Hash map owner giữ nguyên; sáu lore không gửi lệnh gameplay.

Hồi quy đã đạt: chapter browser (HN08 chuyển HN09 sau snapshot xác nhận, đọc lại thủ công, tìm đường/Esc và mobile), chapter online/alternatives, wind motion và HUD layers. `quest-selection` đạt 5/5. Smoke chapter chờ trạng thái `practising=false` do server công bố trước khi xác nhận HN08, đúng khóa hai giây sau dùng hộ thân; không đổi luật gameplay.

Hai trang quản trị/review cũng đạt: [living-world](../artifacts/living-world-review/verification.json) kiểm tìm kiếm, ghim, mobile, không API/storage gameplay; [content catalog](../artifacts/content-catalog-verification.json) kiểm năm nhóm và bốn kích thước, dùng catalog/DB fixture riêng.

Chưa có kết quả đạt cho toàn bộ hồi quy mở rộng trong lượt này: [sect](../artifacts/npc-rerun-sect.log) timeout sau click mở nhật ký; [reload](../artifacts/npc-rerun-reload.log) qua ba lượt asset reload và ba lượt reconnect nhưng timeout khi nói chuyện sau restart backend; [quests](../artifacts/npc-rerun-quests.log) timeout chờ bắt đầu tìm đường; [R01](../artifacts/npc-rerun-r01.log) timeout tải lại trang. Các log có mất nhịp input/reconnect và máy đang chịu tải lớn; chưa đủ bằng chứng để kết luận các timeout đều do môi trường hoặc do sản phẩm. Không sửa gameplay để che lỗi, không ghi vào DB/map owner.

Kết quả kỹ thuật không duyệt ART mới và không xác nhận thiết kế lại HN04.

## Mốc tỷ lệ NPC 13/10 và ba neutral tiếp nối

Owner xác nhận Trần Duy v3 giống tỷ lệ/concept Vương Lâm trong game. [Mốc pin hash](design/characters/van-hai-npc-concepts-v3/style-approval.json) chỉ áp cho tỷ lệ/phong cách neutral. [Bộ v4](design/characters/van-hai-npc-concepts-v4/index.html) thêm Diệp Tĩnh, Tạ Kiếm Sơn, Tô Nhược với input ảnh thật, raw/metadata/prompt/hash và native đã đo; browser18 trường hợp/mobile390 đạt. Mỗi người còn một view/tư thế tĩnh; nhận diện/đầu vẫn có giới hạn ghi trong registration, chưa suy duyệt ART/motion từ test. Game tiếp tục dùng atlas NPC placeholder hiện hành.
