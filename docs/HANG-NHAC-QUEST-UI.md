# Hằng Nhạc — nhiệm vụ hiện diện trong HUD

**Trạng thái UI 10/10/2026:** đã sửa chữ/tab tràn và mật độ đọc; sổ dùng accordion, nhóm Lời dẫn / Mục tiêu / Bước tiếp theo / Phần thưởng, chuyển một cột ở ≤980 px. Tracker giữ vùng đọc cuộn và nút chạm 44 px; nút đóng sổ luôn truy cập được khi cuộn. Owner xác nhận bản hiện tại tốt. [Quy tắc tái sử dụng](GAME-UI-READING.md), [90 lượt kiểm chữ](data/hang-nhac-ui-reading-verification.json), [tổng hợp các vấn đề đã xử lý](HANG-NHAC-VAN-NGOC-UI.md#trạng-thái-chốt-ngày-10102026).

## Vấn đề và phạm vi

Owner phản hồi không thấy hệ thống nhiệm vụ và trải nghiệm còn giống trang thử hơn một MMO-RPG tu tiên. Backend đã có HN01–HN04, nhưng UI cũ chỉ có một thanh chữ bên ngoài canvas, nhật ký văn bản và bảng bài luyện ẩn trước khi nhận bài. Có logic nhiệm vụ và test gameplay không đồng nghĩa người chơi nhận ra mục tiêu hoặc có một MMORPG hoàn chỉnh.

Bản sửa này đưa nhiệm vụ vào màn chơi và làm rõ vòng **nhận → thực hiện → đủ điều kiện → về NPC xác nhận → tiến tới bài tiếp**. Không bổ sung HN05, quái/loot, map ngoại vi, portal, M02, hành trang hoặc hệ thống kinh tế. CSS mới là trình bày kỹ thuật, không ghi nhận owner duyệt mỹ thuật.

## Giao diện

- Tracker “Nhiệm vụ chính tuyến” hiện trong canvas khi đang chơi. [Game shell H5](HANG-NHAC-GAME-SHELL.md) thay trang preview: trước khi vào sân có overlay chọn người và nút Hành trình nhập môn để đọc sổ; không điều khiển nhân vật phía sau.
- Tên bài, trạng thái, checklist từ snapshot, hành động tiếp theo và thưởng lần đầu.
- Tổng số nhiệm vụ hoàn thành trong bốn bài hiện có.
- Tu vi / tích lũy hồi phục và thanh tích lũy nền riêng với linh lực skill.
- “Vào Hằng Nhạc” / “Tiếp tục hành trình” trên màn chọn dùng luồng vào sân hiện có, không tạo lệnh nhận nhiệm vụ khi offline.
- “Gặp người hướng dẫn” / “Về NPC xác nhận”: khi gần đúng NPC, mở đối thoại; khi xa, mở sổ nhiệm vụ và đường gợi ý. Không tự di chuyển, teleport hoặc bỏ qua kiểm tra proximity.
- Phím **J** hoặc “Sổ nhiệm vụ” mở danh sách HN01–HN04 cùng trạng thái/điều kiện/thưởng và bản đồ chỉ đường; J hoặc Đóng trả focus về màn chơi.
- Phím **E** và nút nói chuyện vẫn theo NPC gần nhất, không đổi hợp đồng.
- HN05 ghi rõ “Chưa triển khai”, không có nút dẫn tới nội dung chưa có.
- Mobile: bảng cuộn/gọn, nút nhiệm vụ ít nhất 44 px; tách khỏi d-pad, skill utility và hotbar.

## Kiến trúc và an toàn

- `shared/sect-quests.ts`: catalogue và phép chiếu thuần từ `SectView`; không sở hữu gameplay, không cấp thưởng, không gửi command và không ghi save.
- `client/src/quest-ui.ts` / `.css`: DOM trình bày, checklist, trạng thái, sổ nhiệm vụ, thanh tích lũy. Không sở hữu transport hoặc animation.
- `client/src/sect-ui.ts`: giữ luồng lệnh/đối thoại cũ, ghép QuestUI và chỉ đường.
- `client/src/hang-nhac.ts`: ghép CSS, callback vào sân, J và chặn pointer của tracker khỏi ngắm map/cast.
- `client/hang-nhac.html`: đặt tracker bên trong stage, giữ id của các nút/bảng cũ cho native interaction.
- Không đổi server, schema save, receipt, skill core, approved hotbar, navigation, blocker hoặc camera zoom 1×.
- Mất kết nối không tự tick checklist; kết quả đã lưu còn hiển thị và trạng thái kết nối báo riêng. Đổi nhân vật xóa snapshot UI trước khi đọc hồ sơ mới.
- Đủ checklist không coi là đã hoàn thành: HN02 vẫn cần xác nhận M01; HN03/HN04 vẫn cần `lesson_confirm` do server xử lý. Thưởng một lần tiếp tục thuộc server/SQLite.
- Tư Đồ Nam giữ cách gọi hồi phục/linh thể, không đổi sang cảnh giới Ngưng Khí nguyên tác.
- Thanh tích lũy dừng hình ở cổng 360 nhưng con số giữ nguyên phần dư. Đầy thanh không tự xác nhận tầng hoặc mở M02.

## Chơi thử

Mở `/hang-nhac.html`, tải lại trang để lấy layout mới. Không xóa localStorage/token hoặc SQLite để làm nhiệm vụ hiện.

1. Nếu chưa vào sân, chọn nhân vật trên overlay và bấm Vào Hằng Nhạc / Tiếp tục hành trình. Tracker hiện sau khi own player được server xác nhận.
2. HN01: tới người tiếp dẫn, E, nhận hướng dẫn. Tracker chuyển HN02 sau server xác nhận.
3. HN02: tới vườn thổ nạp, chọn nền, tự xác nhận ba nhịp, trả lời câu hỏi nguồn lực và xác nhận M01.
4. HN03: tới người coi luyện thuật phía đông, nhận bài; F / 1 / 2 trúng mục tiêu riêng; quay về xác nhận +80.
5. HN04: nhận bài né, hoàn thành đi bộ rồi Phong; quay về xác nhận +80.
6. Hết HN04: sổ ghi 4/4; HN05 chưa triển khai. Không xuất hiện portal hoặc M02 giả.

## Kiểm tra

```powershell
npm.cmd run test:hang-nhac-quests
npm.cmd run test:hang-nhac-lessons
npm.cmd run test:hang-nhac-sect
npm.cmd run test:hang-nhac-reload
npm.cmd run test:hang-nhac-hud-layers
npm.cmd run test:hang-nhac-r01
npm.cmd run test:skill-aim
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Quest smoke dùng backend 2599, Vite 5203, SQLite và map-store fixture trong `artifacts/`, không gọi server owner ở 2567/5173. Unit test kiểm phép chiếu không mutate save, status ready, partial credit và hồ sơ riêng. Smoke kiểm màn chọn/trợ giúp trước kết nối, J, tracker trong phiên, nhận HN01 thật, chỉ đường khi xa, reload, ba hồ sơ với tiến độ khác nhau, HN03 chỉ nhận thưởng sau NPC xác nhận, click UI không cast/đổi hướng và mobile không che d-pad.

Bằng chứng: `artifacts/hang-nhac-quests-verification.json`; ảnh `hang-nhac-quests-desktop.png`, `hang-nhac-quests-journal.png`, `hang-nhac-quests-mobile.png`. Test kỹ thuật và duyệt hình ảnh vẫn là hai bước độc lập.

## Khoảng trống trải nghiệm còn lại

Tracker là bước sửa luồng nhập môn, không phải bằng chứng game đã là một MMORPG hoàn chỉnh. Theo kế hoạch hiện hành, tiếp nối có giá trị chơi là HN05/encounter và map ngoại vi riêng, rồi tài nguyên/chuẩn bị và khảo nghiệm. Các hệ thống giao tiếp MMO, hành trang, pháp khí, bình cảnh và vòng chơi lặp phải có gameplay, lưu và kiểm thử thật; không dùng nút trống hoặc mock phần thưởng để tạo cảm giác đã triển khai.
