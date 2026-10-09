# Hằng Nhạc — HN03, HN04 và đòn thường

**09/10/2026 · nhánh `_MMO` · runtime 0.12.0 · GDD 0.28.** Nối tiếp HN01–HN02/M01 bằng hai bài luyện an toàn. Không thay map, navigation, artwork, bộ R01, HUD đã duyệt hoặc cơ chế tài khoản khách.

## Chơi thử

Chạy `npm.cmd run dev` từ worktree `_MMO`, mở `/hang-nhac.html`. Nếu đang chạy bản cũ, khởi động lại client/backend, giữ nguyên `GAME_DB_PATH` và token khách; **không xóa SQLite hoặc save để làm nhiệm vụ mới xuất hiện**.

Sau khi HN02 và M01 đã xác nhận, dùng Nhật ký để tìm **Người coi luyện thuật** ở sân phía đông, chân `(2464,880)`. Tới gần và nhấn **E** hoặc **Nói chuyện**.

### HN03 — Vận dụng thuật nền

1. Chọn **Nhận / tiếp tục bài HN03**. Đối thoại đóng và server tạo mục tiêu riêng tại một điểm đi được gần người chơi.
2. Chạm mục tiêu để ngắm. Dùng **F / Đánh thường**, **1 / Kiếm** và **2 / Lôi**, mỗi loại có ít nhất một hit hợp lệ vào mục tiêu của bài.
3. Bảng hướng dẫn hiển thị credit đã lưu. Đánh thường: 10 damage, 0 MP, cự ly chân 90 px, cooldown 800 ms; không đánh mục tiêu người khác, mục tiêu hết HP hoặc xuyên blocker.
4. Nếu làm hết HP mục tiêu trước khi đủ credit, tới NPC hoặc dùng **Tiếp tục / tạo lại mục tiêu** khi ở gần NPC. Những credit đã lưu không bị xóa.
5. Khi có đủ ba loại hit, quay lại NPC và chọn **Xác nhận HN03 · +80 tích lũy**. Hit không tự nhận thưởng; ba thuật vốn có không được cấp lại.

Đòn thường dùng phản hồi chữ, HP mục tiêu và counter server. **Chưa có animation attack production**; không lấy clip Kiếm của một nhân vật làm giả động tác đánh thường hoặc tái vẽ ART trong đợt này. Mục tiêu luyện tự do vẫn dùng để thử thuật trước nhiệm vụ nhưng không tự cấp credit HN03 hoặc tu vi/loot khi đánh lại.

### HN04 — Nhìn đòn mà tiến

1. Sau khi xác nhận HN03, nhận **Luyện né bằng đi bộ** tại NPC.
2. Vòng vàng ở chân nhân vật báo trước **1,5 giây**, bán kính **40 px**. Tại deadline server, chân phải ở ngoài vòng cộng clearance chân 8 px, có chuyển động đi bộ thực. Phong không thay thế phần đi bộ.
3. Quay lại gần NPC, chọn **Tiếp tục / thử lại** để luyện phần **Phong**. Ngắm một hướng trống và dùng **3 / Phong**; credit yêu cầu cast và arrival hợp lệ trong attempt, đồng thời đứng ngoài vòng ở deadline.
4. Không né đúng hoặc chạy lại vào vòng: attempt thất bại. **Không trừ HP**, không mất tích lũy hoặc credit đã ghi; Phong vẫn dùng chi phí/cooldown thực hiện có, không miễn nhiễm hay xuyên blocker.
5. Hoàn tất hai phương pháp, trở lại NPC và chọn **Xác nhận HN04 · +80 tích lũy**.

Giá trị damage/cự ly/cooldown và thời gian warning là **baseline prototype**, chưa phải cân bằng đã khóa. Tích lũy từ HN02–HN04 là 100 + 80 + 80 = **260** nếu không chạy thêm hoạt động nền. Không tự ghi M02: mốc đó còn cần HN05 và điều kiện riêng.

## Điều khiển và trạng thái

- **F / Đánh thường** là thao tác nền riêng, không chiếm bảy ô skill chưa gán trong HUD.
- 1/2/3, hướng WASD/mũi tên/nút mobile, ngắm bằng pointer, E/NPC và modal giữ luồng hiện có.
- Bảng bài học cho biết thao tác thiếu, còn bao lâu tới deadline và lý do phải thử lại.
- Tạo mục tiêu tự do bị chặn khi có runtime bài đang chạy để không thay target của bài học. Dừng bài rồi tạo mục tiêu tự do nếu cần.
- Thổ nạp/hồi phục nền được chọn trước đó tạm dừng trong bài và khoảng nghỉ sau luyện; **Dừng bài** hoặc xác nhận hoàn tất đưa hoạt động về luật hiện có. Không cộng thời gian nền cho quãng tạm dừng/vắng mặt.
- Không tự hoàn tất bài vì dùng skill trước lúc nhận nhiệm vụ, ở mục tiêu khác hoặc xem animation xong.

## Lưu và chống lặp

Giữ JSON profile **schema 2** và SQLite `user_version=2`; thêm trường `sect.lessons`. Khi đọc schema 2 cũ thiếu trường này, tạo bài trống, giữ identity, vị trí, HP/MP, tiến trình, quyền R01, revision và receipts. Schema 1 tiếp tục đi qua migration hiện có. Trường bài bị hỏng hoặc trạng thái hoàn tất mâu thuẫn bị từ chối, không tự mở nhiệm vụ.

`sect.lessons` lưu HN03/HN04, bài đang chọn, credit `basic/sword/thunder/walk/wind` và deadline cooldown đòn thường. **Target, vòng warning và attempt không lưu như một thành công đã hoàn tất.** Drop/reload/leave/restart hủy runtime attempt; credit đã ghi bền được giữ, sau khi vào lại phải tiếp tục hoặc tạo lại phần còn thiếu. Chọn dừng bài không xóa credit.

Lệnh whitelist chỉ nhận ID/action/lesson/target; bỏ qua số thưởng/cờ hoàn thành client gửi. Credit Kiếm/Lôi lấy từ event hit server, đúng target riêng và thời điểm sau lúc nhận bài. Credit né lấy từ physics/movement và arrival do server xác nhận. Client không gửi damage hay kết quả né.

Đòn thường lập candidate hồ sơ và receipt trước khi sửa HP target. Lệnh cùng ID không gây thêm damage hoặc counter. Xác nhận HN03/HN04 dùng `commitSect`: receipt và profile CAS cùng transaction, save thất bại không cấp thưởng. Khóa receipt HN01–HN02 cũ giữ nguyên. Thưởng nhiệm vụ +80 được giữ cả khi tổng vượt gate tích lũy nền; không tự xác nhận tầng hoặc mở nền 4–9.

## Module

| Tệp | Trách nhiệm |
| --- | --- |
| `shared/lesson-contracts.ts` | Hợp đồng tiến trình/view và evaluator thuần warning/movement/arrival |
| `shared/sect.ts` | Whitelist command, receipt key tương thích và validation tiến trình |
| `server/src/training-lessons.ts` | Kế hoạch bắt đầu/đòn thường/xác nhận và credit hit từ facts server |
| `server/src/HangNhacRoom.ts` | Tick attempt, nối engine skill, lưu credit/receipt, cleanup và view cá nhân |
| `server/src/profile-store.ts` | Migration trường bài thiếu và SQLite CAS/transaction |
| `server/src/sect-progress.ts` | Pause tích lũy/vận khí/vật tư theo trạng thái luyện |
| `client/src/sect-ui.ts` | Nhật ký, hướng dẫn, đối thoại, feedback và thao tác bài |
| `client/src/lesson-presentation.ts` | Vòng báo trước cá nhân từ view đã xác nhận; không damage/credit authority |
| `client/src/skills/session.ts`, `hang-nhac.ts` | F/nút đòn thường, target/skill session và vòng lặp trang |

## Kiểm chứng

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:hang-nhac-lessons
npm.cmd run test:hang-nhac-r01
npm.cmd run test:hang-nhac-sect
npm.cmd run test:hang-nhac-reload
npm.cmd run test:hang-nhac-hud-layers
npm.cmd run test:skill-aim
```

Test bài dùng DB/browser fixture riêng trong `artifacts/`, không ghi map, DB thật hoặc nháp owner. Smoke online kiểm **cả ba hồ sơ**, peer target, duplicate damage/reward, thất bại né an toàn, +80 một lần và restart. Browser kiểm F/hotbar, reload giữa HN03, reload giữa warning, đi bộ/Phong, xác nhận và mobile; fixtures chỉ seed HN02/M01 để bắt đầu tại lát đang kiểm, không tuyên bố đã chơi toàn GDD.

Ảnh và log mới trong `artifacts/`; [biên bản](data/hang-nhac-lessons-verification.json) ghi trạng thái của đợt này. Kiểm kỹ thuật không thay đánh giá cảm giác điều khiển hoặc khóa cân bằng.

## Phần tiếp theo

**HN05 và map ngoại vi riêng** là lát kế tiếp: thiết kế map đích, Spawn, đường quay về, encounter cá nhân/credit và phần thưởng trước khi mở portal. Chưa triển khai HN05–HN12, combat farm, loot, pháp khí, M02, khảo nghiệm cuối, offline hoặc login production. Đây là hoàn thành lát bài HN03–HN04, không phải hoàn tất toàn Hằng Nhạc hay GDD.
