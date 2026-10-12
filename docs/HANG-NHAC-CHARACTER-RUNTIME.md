# Nhân vật và hành trang Hằng Nhạc — đợt đầu

**UI 12/10:** [Thanh Ngọc / Nhân vật 04](HANG-NHAC-DAO-UI-RUNTIME.md) đã thay presentation Linh Đài 02. Nhóm Nhân vật có Tổng quan/Thuộc tính/Tu luyện/Thuật; Hành trang thêm tìm không dấu và lọc vị trí. Các hợp đồng đồ/server/lưu bên dưới giữ nguyên.

**12/10 · Hồi phục thống nhất:** NPC và Hành trang dùng cùng luật server trong `performSectCommand`: 1 vật tư hồi 30 HP, tối đa 100, cooldown chung 10 giây. Chặn suốt bài HN03/HN04 còn mở, kể cả đang đứng yên; cũng chặn khi thi triển, projectile còn chạy hoặc chưa hết khoảng nghỉ đòn/thuật. HP đầy, hết vật tư, đang cooldown, mất kết nối hoặc HP bằng 0 đều không tiêu vật tư. Hai đường trả cùng lý do từ chối, kể cả hết vật tư trong bài luyện. UI NPC hiện lý do chờ bài luyện; nguồn vật tư, schema, transaction và receipt cũ giữ nguyên. Unit kiểm cùng kết quả/candidate và không sửa đầu vào; smoke lessons/sect kiểm cả server lẫn nút NPC sau reload trên fixture.

**Cập nhật 10/10:** [entry thật](GAME-ENTRY-BACKEND.md) đã có đăng nhập/server/tạo/chọn nhân vật trước game. C/I và các thao tác dưới đây được dùng lại trên hồ sơ đăng ký qua `ProfilePersistence`; đồ nhập môn/vật tư và max HP/MP giữ nguyên. Phần kiểm khách bên dưới là bằng chứng pilot ban đầu; chưa là ba lô tổng quát/kho/loot. Không tự nhận save khách vào tài khoản mới.

Ngày 10/10/2026, owner yêu cầu bắt đầu triển khai sau khi chấp nhận diện mạo [Linh Đài 02](CHARACTER-UI-PREVIEW.md). Owner chọn: **“Đồ nhập môn và vật tư thật trước; giữ HP/MP hiện tại để hoàn thiện hành trang, trang bị và lưu hồ sơ”**. Bản runtime dùng dữ liệu của hồ sơ đang chơi, qua server và SQLite.

## Mở và sử dụng

Vào [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html), nhấn **C** để xem Tổng quan, **I/B** để mở Hành trang, **V** để xem Tu luyện, **K** để đọc Thuật hoặc dùng menu Chức năng. Ba nhóm Nhân vật / Hành trang / Trang bị dùng chất liệu Thanh Ngọc và sprite native từ atlas hiện hành. Đang mở cửa sổ thì phím di chuyển/cast và chạm map không điều khiển nhân vật. Escape đóng cửa sổ; trên mobile, Escape ở chi tiết quay về danh sách và giữ vị trí/focus trước.

- Tổng quan đọc tên, avatar, HP/MP, tu vi, mốc nhập môn và nhiệm vụ thật. Tư Đồ Nam dùng nhãn tiến trình hồi phục hiện diện. Ba thuật R01 vẫn có từ đầu.
- Hành trang có tìm tên, lọc, sắp xếp, chọn món, xem số lượng/tác dụng/nguồn/điều kiện. Vùng đọc và các thao tác giữ quy tắc `ui-reading.css`; khung và nền chung box qua `attachFrameSurface`.
- Trang bị cho phép mang/tháo mộc kiếm và áo vải. Hai món không thay max HP/MP, chi phí R01 hoặc khả năng cast. So sánh hiển thị baseline 100 → 100. Không đổi sprite trang phục trong map.
- Bảo vệ là cờ lưu riêng của từng món/stack; chưa có bán, vứt hoặc trao đổi. Cờ này không ngăn dùng vật tư hồi phục.
- “Xem vận khí” chỉ đổi tư thế xem hồ sơ. Thổ nạp/tích lũy vẫn thực hiện qua người hướng dẫn vận khí; cửa sổ không gửi lệnh tu luyện.

## Đồ và tài nguyên thật

Mỗi hồ sơ có **Mộc kiếm nhập môn** và **Áo vải môn phái**, mặc định trang bị. ID được tạo cố định từ ID hồ sơ và loại đồ; đọc lại hồ sơ cũ, reload hoặc restart không cấp thêm bản sao. Vị trí Ngọc sức / pháp bảo giữ trạng thái trống; chưa tạo pháp bảo giả.

**Vật tư hồi phục** đọc trực tiếp `profile.sect.supplies`: số lượng hiện có từ luồng HN01, không tạo một kho đếm thứ hai. Số lượng bằng 0 thì stack không xuất hiện. Dùng 1 hồi 30 HP, tối đa 100, cooldown 10 giây chung với thao tác hồi phục ở NPC. Sinh lực đầy, mất kết nối hoặc đang luyện thuật/bài học thì server từ chối và giữ vật tư. Tên/ART dùng bình hồi phục trong pack 02; không đưa các đan dược/bonus minh họa khác của prototype vào gameplay.

Đợt này chưa triển khai loot, shop, sức chứa, kho chung, cường hóa, crafting, phẩm chất hay bonus trang bị. Trang `/character-ui.html` giữ fixture độc lập để xem thiết kế; 12 món và các bonus của trang mẫu không phải đồ thật.

## Server và lưu hồ sơ

`CharacterProfile.inventory` dùng cấu trúc version 1 trong JSON hồ sơ schema 2. SQLite thêm bảng `character_receipts`; bảng hồ sơ, cast/sect receipt và `user_version=2` giữ tương thích. Hồ sơ schema 1/2 thiếu inventory được bổ sung lười khi đọc, giữ ID, tọa độ, tài nguyên và receipt cũ. Inventory có sẵn nhưng sai cấu trúc bị từ chối, không âm thầm reset đồ.

`character:sync` trả snapshot **riêng cho client sở hữu hồ sơ**. `character:command` nhận ID yêu cầu, thao tác và ID món; server lấy hồ sơ từ phiên đã xác thực, kiểm sở hữu/loại đồ/trạng thái. Không nhận HP, số lượng hoặc ID hồ sơ do client áp đặt. Candidate và receipt ghi cùng transaction với kiểm revision; lỗi ghi rollback cả hai, cached profile/actor chỉ đổi sau commit.

Receipt khóa theo hồ sơ + UUID yêu cầu, lưu fingerprint thao tác. Gửi trùng cùng nội dung trả kết quả cũ; dùng lại mã cho nội dung khác bị từ chối. Dùng hồi phục phát animation sau commit, không phát lại khi nhận receipt trùng. Animation công khai chỉ chứa sự kiện trình bày; hành trang không broadcast cho người khác.

Client giữ trạng thái đang xử lý đến khi nhận snapshot sau kết quả. Mất kết nối hoặc timeout chỉ đọc lại snapshot; **không queue/replay lệnh trang bị hoặc dùng đồ**, không tự trừ vật tư/đổi HP. Đổi nhân vật xóa view cũ; ba hồ sơ có đồ, bảo vệ và vật tư riêng. Reload/reconnect/backend restart phục hồi trạng thái đã ghi.

## Nguồn và kiểm chứng

Đợt thống nhất hồi phục 12/10: [biên bản mới](data/recovery-and-cleanup-verification-2026-10-12.json) ghi 157 unit test đạt, ma trận 13 trường hợp hai đường hồi phục, cùng smoke lessons/sect/character/reload/R01/HUD. Các số liệu bên dưới thuộc biên bản triển khai ban đầu.

| Phần | Nguồn |
| --- | --- |
| Hợp đồng/catalog/validator | `shared/character-inventory.ts`, `shared/profiles.ts` |
| Luật/transaction/private snapshot | `server/src/character-inventory.ts`, `profile-store.ts`, `HangNhacRoom.ts` |
| UI và transport | `client/src/character-panel.ts`, `character-session.ts`, `character-runtime.css` |
| ART có sẵn | [Linh Đài 02](design/ui/character-van-ngoc-v2/README.md), [Vân Ngọc 02](design/ui/van-ngoc-kit-v2/README.md) |

Chạy `npm.cmd run test:hang-nhac-character`: backend fixture ở 2628; browser fixture 2630/5238 với DB, cache và context riêng. Kiểm ownership/injection, equip/unequip/protection, quantity/cooldown/full HP, receipt trùng, transaction lỗi, riêng ba hồ sơ và lifecycle. Browser kiểm C/I, chặn input, tìm kiếm, focus, khung/nền và 21 cấu hình viewport/chữ. Unit kiểm migration và ghi atomic. Không ghi test vào DB, authored map hoặc browser draft của owner.

Bằng chứng tổng hợp: [verification](data/hang-nhac-character-verification.json). **194 unit test qua**, gồm 8 kiểm inventory mới; **4 nhóm online**, **9 nhóm browser** và **21 cấu hình bố cục/chữ** qua. Hồi quy lessons, R01, sect, reload, aim, HUD/layer, UI, game shell và prototype qua; typecheck/boundary/build qua. Hai kiểm HN04/aim nhạy thời gian dùng renderer mặc định của Chrome cùng fallback SwiftShader thay vì ép software rendering; giữ nguyên assertion gameplay.

Ảnh runtime trong `artifacts/character-runtime/` đã được xem trên desktop/mobile. Đã sửa sự kiện đóng cũ ẩn cửa sổ vừa mở, Escape desktop/mobile và selector tab nhận nhầm focus lên khung mỹ thuật. Diện mạo prototype 02 đã được owner chấp nhận; kết quả test runtime không tự suy thành duyệt mỹ thuật hoặc chốt cân bằng trang bị.
