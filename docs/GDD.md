# GDD — MMORPG tu luyện theo Tiên Nghịch

**Phiên bản:** 0.35, ngày08/10/2026. **Ưu tiên hiện tại:** [Map Editor](MAP-EDITOR.md) để người phát triển tự ghép asset, bố trí layer và vẽ vùng hoạt động của từng level. Trợ lý tạo asset rời và phát triển công cụ theo [phân công](MAP-ASSET-PRODUCTION-NOTES.md), giữ tham chiếu/tỷ lệ chibi. Sau map mới thiết kế nhiệm vụ → đánh → nhận đồ → đột phá; portrait tiếp tục để sau.

**Nguồn gameplay hiện tại:** [MVP RPG-A 1.0](MVP-RPG-A.md), [kịch bản](STARTER-STORY.md), [map](STARTER-REGION-MAP.md), [dữ liệu](data/mvp-rpg-content.json), [backlog](MVP-BACKLOG.md). Các số liệu/số lượng là thiết kế khởi đầu cần chơi thử.

**Công cụ đang dùng:** [editor](http://127.0.0.1:5173/map-editor.html), thư viện trống và PNG tự nhập; từng level có kích thước/Spawn/layer/vùng/portal riêng, lưu file dự án/level, xuất/nhập và Test cục bộ. Người phát triển tự bố trí map.

**Reset ngày 08/10/2026:** người phát triển yêu cầu xóa asset map cũ để làm lại từ đầu. Nguồn ART, bản xuất/chunk/mask, thư viện/ZIP và builder cũ đã gỡ. Giữ nhân vật, editor, dữ liệu gameplay nháp và map tự lưu. [Thư viện mới](design/world/map-asset-library/README.md) có 0 asset; chưa chốt tham chiếu hoặc bố cục mới. Xem [biên bản reset](MAP-ASSETS-RESET.md).

**Level Design đã triển khai:** [hướng dẫn](MAP-LEVEL-DESIGN.md), chọn nhiều/nhóm/căn chỉnh, cọ/tileset, prefab kèm vùng thủ công, quản lý part/pivot, thư viện JSON, minimap, kiểm lỗi và xuất runtime. Chưa nối map tự biên tập vào server MMO.

## 1. Các quyết định

| Nội dung | Hướng hiện tại | Trạng thái |
| --- | --- | --- |
| Thể loại/nền tảng | MMORPG tu luyện có idle trên web | Người phát triển đã chọn |
| Nhân vật người chơi | Đệ tử riêng; hai mẫu nam/nữ | Đã chọn; bộ chibi hiện có |
| Chính truyện | Vương Lâm trung tâm; Tư Đồ Nam/Lý Mộ Uyển là trục dài hạn | Ba trọng tâm đã chốt; thời điểm theo arc |
| ART/camera | Nhân vật pixel chibi, nền stylized 2D, top-down ba phần tư | Đã chọn; giữ tỷ lệ hiện tại |
| Combat | Chọn mục tiêu/tự đánh thường; kỹ năng và né chủ động | Người phát triển chọn ngày 07/10/2026 |
| Map mới | Người phát triển tự dựng trong editor | Bắt đầu lại sau khi xóa ART cũ ngày 08/10/2026 |
| MAP03 đi thử | Prototype trước đã dừng | Nguồn/bản xuất cũ đã xóa |
| Đoạn native mẫu | Bộ asset trước đã xóa | Chưa chọn bộ asset mới |
| Map Editor | Asset kéo thả, layer/vùng/portal, file riêng mỗi level, lưu/xuất/nhập/Test | Bản0.12.0 có Level Design, thư viện trống; người phát triển tự thiết kế bố cục |
| Nhịp đầu | Quái đầu phút 2–3, tầng 1 phút 5–7, boss phút 25–35 | Mục tiêu đề xuất cần đo |
| Phạm vi A | 10 chính/2 phụ/2 lặp, 4 quái thường/1 tinh anh/1 boss, tầng 1–3 | Phạm vi thiết kế theo yêu cầu mở combat/farm vào MVP |
| Tỷ lệ | Frame64 × 96, chân(32,88), thân khoảng80px ở1× | Giữ như bộ đã thử; mở vùng bằng kích thước thế giới |
| Vương Lâm | Chibi làm chuẩn tỷ lệ, 20 frame | Phản hồi tích cực, nguồn giữ nguyên |
| Lý Mộ Uyển | Chibi native-v5, tóc xanh đen/áo lavender | Chấp nhận làm chuẩn bản thử |
| Tư Đồ Nam | Linh thể đứng/lướt, ngực khuyết, cao4px | Concept đứng tạm chấp nhận; bộ chibi/lướt còn đánh giá |
| Nhân lực/lộ trình | Một người phát triển, A → B | Đã chọn; B nay tập trung tổ đội/arc sau |
| Client/backend | TypeScript + Three.js; Node.js + Colyseus | Preview/room tạm đã chạy |
| Tiến trình lâu dài | Tài khoản/lưu tại server | Chưa triển khai; chọn auth/DB trong A1 |

## 2. Trải nghiệm và vòng chơi

Người chơi đăng ký làm đệ tử, nhận việc, đi ra vùng ngoài, đánh quái/thu thập, quay về chế đồ và tự đột phá. Khi đã học pháp quyết có thể bế quan để tích lũy thêm. Tốc độ nhập môn được thiết kế cho bản RPG, không lặp nhiều chục phút lấy nước trước chiến đấu.

**Nhiệm vụ → khám phá/đánh/thu thập → tu vi và vật liệu → trang bị/chế tạo → kỹ năng/đột phá → boss → vòng farm.**

Lượt đầu mục tiêu35–45 phút tới tầng 3; sau đó chơi tiếp nhiệm vụ lặp/boss. Đây là giả thuyết cân bằng. Luật, cửa tầng và quyền thưởng tại máy chủ; client gửi thao tác và trình bày hình ảnh.

## 3. Bối cảnh truyện và kịch bản

Hằng Nhạc, áo ký danh xám/phòng ở/tạp vụ, suối phía đông, Trương Hổ kiếm củi và dược viên Tôn Đại Trụ là căn cứ nhập môn từ [chương10](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-10), [11](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-11), [17](https://www.wuxiaworld.com/novel/renegade-immortal/rge-chapter-17).

Người chơi là đệ tử mới do game bổ sung; các nhiệm vụ, quái/boss, bố cục địa hình, thuật pháp người chơi và tốc độ tăng tầng là chuyển thể. Hạt châu thuộc Vương Lâm, không phát đại trà. Hổ thoát hiểm ở chương7 giữ trong chính truyện, không làm mục tiêu farm. Lý Mộ Uyển/Tư Đồ Nam giữ B/arc sau.

[Kịch bản](STARTER-STORY.md) có ba hồi: áo xám/đường lấy nước; dược viên/tuần rừng; chuẩn bị/thử thách hang. Thoại ngắn, thẻ truyện15–30 giây có thể xem lại. Không buộc xem đoạn dài để tiếp tục chơi.

## 4. Thế giới và tỷ lệ

Ngoại viện an toàn ↔ suối; ngoại viện ↔ rừng; suối/rừng ↔ lối ngoài dược viên ↔ khe đá → hang boss riêng. Cổng dược viên hạn chế và hang bí mật của Vương Lâm tách khỏi khu farm.

[Map mới](STARTER-REGION-MAP.md) giữ sprite/camera/1× như preview: mở số pixel thế giới, camera cuộn theo người, không kéo ảnh sân hoặc thu nhỏ nhân vật. Map lớn chia lớp mặt đất/đạo cụ/che khuất, ô bố trí64px độc lập collider8px. Minimap chỉ là tổng quan.

[Bản đi thử](http://127.0.0.1:5173/starter-region.html) dùng hình khối để kiểm đường/POI/portal và tỷ lệ. Phòng online cũ vẫn960 × 640; nối vùng mới vào server là mốc A1.

[Map phân lớp](MAP-LAYERED-DESIGN.md) hiện dùng ảnh tổng năm khu phóng để đối chiếu; 12 chunk, 8 phần che, polygon đường/nước/cầu/footprint. Kỹ thuật đi thử đã kiểm, ART/mask còn lỗi. [Đoạn native mẫu](MAP-COURTYARD-PILOT-PLAN.md) sẽ xác lập nguồn sạch, cụm/layer và chất lượng trước khi mở rộng. Nút đặt người chỉ để review; chưa streaming hoặc thử tải online.

## 5. Combat, farm và phần thưởng

A có đánh thường, Linh khí chỉ, Hộ thân thuật, bình hồi phục, né bằng di chuyển. Chọn mục tiêu không giành quyền đi khi né. Cự ly/đường nhìn/cooldown/MP/damage/HP/chết do server xử lý; frame vẽ không tự quyết định sát thương.

4 quái thường cung cấp da/sơn thảo/nanh; tinh anh cho mảnh linh thạch; boss cho tinh hạch và đồ hiếm. Lần boss đầu cho chọn kiếm hoặc áo chắc chắn. Lượt farm hiếm có pity, không là cổng bắt buộc trước Q10. Túi đầy giữ thưởng chờ nhận, gửi lại không roll lại.

Quái ngoài vùng là chung, credit cho contributor hợp lệ, loot cá nhân. Boss A đề xuất phiên1 người; B thêm nhóm2–4 và boss nhóm. Không có PvP/giao dịch trong A.

## 6. Tiến trình, kinh tế và idle

Tu vi tích lũy100/400/900 + Q03/Q06/Q10 để chủ động đạt tầng 1/2/3. Tuyến chính đủ lượng tu vi và vật liệu Q09 dù không rơi rare; không cần nhiệm vụ phụ để qua A.

16 vật phẩm, túi24ô/stack99, 4 ô trang bị; hai số dư tiền/cống hiến. Chế bình/hộ phù/+1 chắc chắn. Vắng mặt chỉ tính bế quan đã chọn, 4 tu vi/phút, tối đa8giờ, dừng tại gate; không tạo kill/loot. Farm và bế quan không chạy cùng lúc.

## 7. Online và dữ liệu

Giữ tiến trình tại máy chủ, một phiên điều khiển mỗi nhân vật. Auth/DB, giao dịch cấp thưởng/đột phá, khôi phục restart, idempotency và nhiều tab phải có trước nghiệm thu A. Colyseus room state hiện chỉ trong bộ nhớ.

Mục tiêu thử8 client thật là yêu cầu đề xuất cần đo; số FPS của20 hình local không chứng minh tải MMORPG. [Dữ liệu RPG-A](data/mvp-rpg-content.json) chọn ID/nhiệm vụ/đồ/gate. Catalog/save idle cũ chỉ giữ tham chiếu.

## 8. UX và ART

Màn thế giới cần target/HP/linh lực/kỹ năng, tracker nhiệm vụ, túi/trang bị, minimap và tương tác NPC. Mobile giữ cỡ người, nút chạm rõ, vùng báo đòn đọc được. Nhật ký đọc lại truyện; màn hoàn thành A mở farm thay vì dừng mọi hoạt động.

Năm bộ chibi có100 frame; thêm Vương Lâm trước36 để đối chiếu. Chân dung/truyện/UI giữ mực/giấy. Đồng bộ portrait hoãn; ART map và combat ưu tiên một avatar/một quái trước mở cả gói204 frame dự kiến.

## 9. Lộ trình và nghiệm thu

MAP01–MAP04: tổng quan ART → cảnh chi tiết/tỷ lệ → lớp/đường/collider → duyệt map. Trong MAP03, thực hiện MP01–MP07 cho một đoạn ngoại viện native trước; sau đánh giá mới mở rộng cùng phương pháp sang các khu khác. D-GAME sau đó thiết kế nhiệm vụ/combat/đồ/đột phá theo map. A1 nối online/lưu; A2 làm vòng nhập môn, rồi A3–A5 mở farm/boss/chơi thử. [Backlog](MVP-BACKLOG.md) quy định phụ thuộc và checklist.

Hai tài khoản phải qua trọn A, đăng nhập lại giữ tiến trình; quái chung/thưởng riêng đúng, túi đầy/replay/mất mạng không mất hoặc nhân loot. Thử tải và thời gian thật trước B. B mở tổ đội/arc mới; world boss, PvP, giao dịch/bang hội cần đặc tả riêng.

## 10. Tham chiếu lịch sử

[GDD trước v0.26](GDD-IDLE-REFERENCE-v0.26.md), [backlog idle](MVP-BACKLOG-IDLE-REFERENCE.md), [MVP-A-SPEC](MVP-A-SPEC.md), 9node và cảnh E01–E08 lưu làm hồ sơ hành trình Vương Lâm. Các ngưỡng480, kho120/30, kết thúc tại tầng 1 và luật save cục bộ không là nghiệm thu RPG-A mới.

[Preview runbook](PREVIEW-RUNBOOK.md), [quy chuẩn chibi](CHIBI-ROSTER-SPEC.md), [công nghệ](TECH-STACK.md), [online](ONLINE-DIRECTION.md) giữ nguồn triển khai và quyết định liên quan.
