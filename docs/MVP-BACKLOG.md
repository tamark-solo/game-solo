# Backlog MVP — MMORPG nhập môn Hằng Nhạc

**Phiên bản:** 0.14, ngày08/10/2026. **Ưu tiên:** người phát triển thiết kế map trong [editor](MAP-EDITOR.md); trợ lý cung cấp asset/công cụ. [RPG-A 1.0](MVP-RPG-A.md) và A → B giữ lộ trình, biên tập gameplay sau map.

**Đã có:** preview nhân vật, hai phiên online di chuyển trên sân tạm; kịch bản/nội dung và bản bố trí vùng mới. **Chưa có gameplay:** tài khoản bền vững, quái/loot/combat/nhiệm vụ/tu luyện. [Backlog idle trước](MVP-BACKLOG-IDLE-REFERENCE.md) lưu tham chiếu, không dùng nghiệm thu A mới.

**Ưu tiên mới:** người phát triển yêu cầu thiết kế hình ảnh map để nhìn/duyệt trước, rồi mới thiết kế nhiệm vụ → đánh → nhận đồ → đột phá theo địa điểm. Bản khối/tỷ lệ trước đã chấp nhận làm tham chiếu; [ART map](MAP-ART-DESIGN.md) còn cần duyệt. Vị trí nhiệm vụ/quái và số liệu RPG-A là nháp để điều chỉnh sau map.

**Reset map 08/10/2026:** asset map cũ và builder đã xóa theo yêu cầu. [Thư viện mới](design/world/map-asset-library/README.md) trống; giữ editor/nhân vật/dữ liệu tự lưu. Không tiếp tục MP01–MP07/MAP03 cũ. Người phát triển chọn và tự dựng map mới trước gameplay.

**LD01–LD05 đã triển khai trong 0.12.0:** thao tác nhiều đối tượng/nhóm/căn chỉnh; thư viện/part/tileset/brush; prefab hình + vùng; minimap/kiểm level; xuất runtime và lưu/mở metadata mới. [Hướng dẫn Level Design](MAP-LEVEL-DESIGN.md). Người phát triển dựng level mới, không tự khôi phục ART cũ.

## 1. Các mốc thực hiện

**MAP-EDITOR01 đã triển khai:** thư viện/kéo thả/PNG riêng, layer/pivot/khóa/undo, vùng chữ nhật/đa giác, level/Spawn/portal riêng, file workspace/project/level, xuất/nhập và Test. **MAP-EDITOR02 tiếp theo:** người phát triển dựng level cụ thể, ghi asset cần thêm và phản hồi công cụ; trợ lý không tự bố trí thay. **MAP-EDITOR03:** nối map đã biên tập vào runtime/server khi được yêu cầu. Các mốc map bên dưới là lịch sử của đoạn thử đã dừng; không dùng để khôi phục bộ cũ.

| Mốc | Đầu ra review được | Phụ thuộc |
| --- | --- | --- |
| MAP01 — Tổng quan có ART | Cảnh các khu/đường nối, kiến trúc/địa hình và không khí | Bản khối và style đã chọn |
| MAP02 — Cảnh chi tiết/tỷ lệ | Ngoại viện/suối, sprite gốc ở 1×/2× và mobile | MAP01 |
| MAP03 — Map/lớp đi lại | Đoạn ngoại viện native MP01–MP07, rồi mở rộng; cụm/layer/alpha/footprint bám ART tổng | MAP02 |
| MAP04 — Duyệt map | Đối chiếu ART tổng; hoàn thiện native ART/mask/va chạm theo bố cục, đi thử đường nối và tỷ lệ | MAP03 |
| D-GAME — Thiết kế gameplay theo map | NPC/nhiệm vụ, đánh/farm, đồ/phần thưởng, đột phá gắn địa điểm | MAP04 |
| A1 — Vùng online và lưu đệ tử | Hai tài khoản đi qua các khu, reconnect giữ vị trí/tiến trình | MAP04, D-GAME |
| A2 — Một vòng chơi 5–7 phút | Q01–Q03, 1 quái, target/tự đánh/kỹ năng/loot/tầng 1 | A1 |
| A3 — Farm và chuẩn bị | Q04–Q09, 4 quái + tinh anh, túi/trang bị/chế tạo/tầng 2 | A2 |
| A4 — Boss và kết thúc nhập môn | Boss báo vùng, Q10, đồ đầu chắc chắn/tầng 3, chơi tiếp | A3 |
| A5 — Chơi thử nhóm | Mất mạng/lệnh lặp/túi đầy, 8 client thật, mobile và nhịp chơi | A4 |
| B — RPG nhóm và arc sau | Tổ đội 2–4, boss nhóm, thêm một vùng/kỹ năng/trang bị | A5 đạt nghiệm thu |

Map khối cũ giữ để nghiên cứu. Nhiệm vụ/combat/loot chưa được coi là chốt trước khi duyệt map; animation một avatar/một quái làm khi sang D-GAME/A2. Chân dung UI tiếp tục hoãn.

## 2. Kế hoạch đoạn mẫu trước — giữ tham chiếu

MP00 tài liệu/quy tắc/ảnh review đã lưu; đoạn native đã có source/part và preview. Sau phản hồi lệch, người phát triển chọn tự bố trí map trong editor. Bảng dưới giữ quy trình kiểm asset, không là yêu cầu tiếp tục tự ghép.

| ID | Công việc | Phụ thuộc | Đầu ra/điều kiện |
| --- | --- | --- | --- |
| MP01 | Khoanh/đo nhà tây–bồn tây nam–cổng nam | MP00 | Brief vị trí/cỡ/lối đi và hình đối chiếu, sprite gốc1× |
| MP02 | Phân cụm/layer, anchor, footprint, quy tắc che | MP01 | Bảng asset/lớp; chỉ gom phần cùng quan hệ trước/sau |
| MP03 | Nền sạch native | MP02 | Sân/bậc/đường đầy đủ dưới vật, rõ ở1× |
| MP04 | Nhà/bồn/thân-tán/chân-mái cổng | MP02, nền MP03 để so | 7 PNG chính dự kiến, alpha sạch; thân/cột hoàn chỉnh |
| MP05 | Ghép và dựng preview đoạn mẫu | MP03, MP04 | Vị trí giữ tham chiếu, xếp lớp/collider đúng, sprite64 × 96 |
| MP06 | Review hình/đường/kỹ thuật và sửa | MP05 | Trước/sau/cạnh/dưới, alpha0/0.35/1, biên chunk, desktop/mobile |
| MP07 | Bàn giao và ghi đánh giá | MP06 | Nguồn/ảnh/metadata/lỗi; ghi phạm vi người phát triển chấp nhận |

[Kế hoạch chi tiết](MAP-COURTYARD-PILOT-PLAN.md) giữ lịch sử; việc tiếp theo theo MAP-EDITOR02 là người phát triển biên tập level và yêu cầu asset/công cụ còn thiếu. MAP04 vẫn cần duyệt map trước D-GAME. Ảnh lỗi cũ (bộ cũ đã xóa) giữ làm các trường hợp kiểm alpha/nền dưới.

## 3. Công việc và nghiệm thu gameplay

| ID | Công việc | Phụ thuộc | Nghiệm thu |
| --- | --- | --- | --- |
| RPG01 | Biên tập NPC/nhiệm vụ/combat/đồ/đột phá theo map đã chọn | MAP04 | ID/vị trí/đường, vật phẩm và nguồn nhất quán với ART; nhiệm vụ không đóng trước map |
| RPG02 | Tài khoản và lưu đệ tử | RPG01 | Chọn cơ chế đăng nhập/DB; một phiên điều khiển; reconnect và restart giữ dữ liệu của đúng người |
| RPG03 | Vùng chung mới và portal server | RPG01, RPG02 | Chia room/shard; vị trí/va chạm do server; hai tài khoản qua 5 khu, thấy nhau; portal giữ quyền truy cập |
| RPG04 | NPC/quest Q01–Q03 và journal | RPG03 | Nhận/tiến/trả riêng từng đệ tử; thoại ngắn, bỏ qua đọc không tự nhận thưởng |
| RPG05 | Target/đánh thường/quái đầu | RPG03 | Cự ly/LOS/cooldown/aggro/leash/HP/chết trên server; ngoài tầm ngừng đánh; target không giành điều khiển lúc né |
| RPG06 | Animation combat thử | RPG05 | Một avatar/một quái; va chạm/sát thương không phụ thuộc frame vẽ; không đổi tỷ lệ đứng/đi |
| RPG07 | Loot/túi 24 ô/trang bị | RPG02, RPG05 | 4 ô đồ, stack99, thưởng cá nhân, khóa xử lý một lần; túi đầy có chờ nhận; không mất đồ nhiệm vụ |
| RPG08 | Tu vi/tầng/2 kỹ năng | RPG04, RPG05, RPG07 | Gate Q03/Q06/Q10 + 100/400/900; đột phá chủ động; kỹ năng kiểm MP/cooldown, bình kiểm tồn kho |
| RPG09 | Q04–Q09, 4 quái và tinh anh | RPG06–RPG08 | Tất cả điểm farm có nguồn vật liệu; mini-boss dạy né; contributor nhận credit riêng |
| RPG10 | Chế đồ và +1 | RPG07, RPG09 | Tuyến chính đủ bình/hộ phù không cần rare drop; công thức server nguyên tử, thành công chắc chắn |
| RPG11 | Boss riêng và Q10 | RPG08–RPG10 | Gate vào hang; runId riêng; 3 đòn báo vùng, không chồng đòn bắt buộc không thể né; chết/reset/reconnect đúng |
| RPG12 | Thưởng đầu/pity/farm lặp | RPG11 | Thưởng đầu chọn kiếm/áo; pity kiếm ở lần hạ thứ 5; gửi lại không reroll; chờ vào lại45 giây |
| RPG13 | Idle/bế quan/vắng mặt | RPG02, RPG08 | 4 tu vi/phút, tối đa8giờ; dừng tại gate; không tạo kill/loot offline hoặc chạy cùng farm |
| RPG14 | Waypoint, journal, nhiệm vụ phụ/lặp | RPG09–RPG12 | 2 phụ/2 lặp; gate quay về theo tuyến; kill trước khi nhận không hoàn thành vòng nhiệm vụ mới |
| RPG15 | ART gameplay/biến thể theo khu sau map | RPG01, RPG06 | Mở rộng đạo cụ/biến thể theo nội dung trên map đã duyệt; giữ quy tắc native/cụm/layer của MP01–MP07 |
| RPG16 | Nhóm/mobile/khả năng phục vụ | RPG03–RPG15 | 2 tài khoản trọn hành trình; 8 client thật thử tải; 360px đọc được vùng đòn, giữ cỡ người |
| RPG17 | Quan sát nhịp và sửa cân bằng | RPG16 | Ghi time-to-first-kill/tầng 1/tầng 2/boss/trọnA, chết/túiđầy; chỉnh theo lượt chơi thật |

RPG02 thiết kế backend/auth trước khi nối tiến trình thật; chọn DB và phương án đăng nhập theo môi trường triển khai. Colyseus room state trong bộ nhớ không tự thay thế lưu bền vững. RPG03/AI có thể chia vùng cập nhật, giữ tốc độ mô phỏng cố định và kiểm tải thật.

## 4. Checklist hoàn thành A

- Hai tài khoản mới làm Q01–Q10, đạt tầng 3, chế hộ phù/bình, nhận đồ boss đầu và quay lại sau restart.
- Không cần drop hiếm trước Q10 để đi tiếp; trường hợp túi đầy vẫn giữ thưởng đã roll.
- Hai người cùng đánh quái, contributor/quest credit riêng; một người mất mạng không ảnh hưởng tiến trình người kia.
- Server từ chối teleport/speed/damage/loot giả, kỹ năng ngoài tầm/cooldown, replay lệnh và hai phiên điều khiển.
- Boss chết/reset/reconnect, đòn báo vùng và portal/runId nhất quán; không lặp thưởng đầu hoặc reset pity bằng refresh.
- Bế quan không nhân thời gian qua nhiều tab; offline không sinh loot.
- Đi từ hub qua rừng/suối/dược viên/khe đá; collider/điểm tương tác và lớp che đúng, scale nhân vật không đổi.
- Mục tiêu thời gian và sức chứa được đo, ghi kết quả; không dùng số FPS 20 hình mô phỏng để kết luận năng lực MMORPG.

## 5. Nội dung B và dài hạn

B thêm tổ đội, chia thưởng/AI boss nhóm, một vùng mới theo arc và chiều sâu trang bị. World boss, PvP, giao dịch, bang hội, đấu giá, chế tạo nhiều cấp và cảnh giới cao có thiết kế kinh tế/phạm vi riêng. Dàn trọng tâm vẫn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển; không mở hai nhân vật arc sau vào A chỉ vì đã có sprite.

Nguồn: [MVP mới](MVP-RPG-A.md), [kịch bản](STARTER-STORY.md), [map](STARTER-REGION-MAP.md), [JSON nội dung](data/mvp-rpg-content.json), [preview hiện có](PREVIEW-RUNBOOK.md).
