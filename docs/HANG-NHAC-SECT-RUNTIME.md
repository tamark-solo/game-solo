# Hằng Nhạc — tiếp dẫn, vận khí và thổ nạp

**08/10/2026 · _MMO · runtime 0.12.0 · GDD 0.28.** Bản đầu của bước 3: HN01–HN02, nhật ký/chỉ đường, hoạt động nền và vật tư hồi phục. Tiếp nối [hồ sơ/R01](HANG-NHAC-R01-RUNTIME.md), giữ TypeScript + Three.js / Node.js + Colyseus. HN03–HN12, ngoại vi và khảo nghiệm chưa hoàn tất.

## Chơi thử

Mở [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html), chọn nhân vật và vào sân chung. **Nhật ký / Bản đồ** hiển thị vị trí người chơi, bốn điểm chức năng và đường gợi ý tránh blocker. Đi tới gần NPC rồi nhấn **E** hoặc **Nói chuyện**. Đóng đối thoại để tiếp tục di chuyển; đối thoại dừng input đi bộ.

**Sửa tương tác 09/10/2026:** nhận phím vật lý E khi bộ gõ gửi `key=Process`, vẫn giữ nhập tên và tổ hợp Ctrl/Alt/Meta riêng. Nếu chưa vào sân chung hoặc yêu cầu đối thoại bị từ chối/chưa nhận xác nhận, thông báo hiện ngay trên khung hành trình, kể cả khi đối thoại chưa mở. Browser regression tái hiện trường hợp IME trước sửa, rồi kiểm lại E thường, E qua IME, chế độ khám phá và nhập tên. Xem [kiểm chứng sửa E](data/hang-nhac-npc-e-verification.json).

**Sửa phục hồi sau build 09/10/2026:** tái hiện thêm lỗi reload sau reconnect: SDK phát `onReconnect` trước khi thay reconnection token, khiến client lưu token đã hết hạn. Callback ứng dụng nay chạy sau handshake để lưu token mới. Nếu backend restart làm mất phòng cũ, Hằng Nhạc thử phục hồi cùng hồ sơ từ SQLite có giới hạn; không tự vào lại sau khi người chơi chọn Rời sân, không gửi lại thao tác nhiệm vụ/phần thưởng. Trong lúc phục hồi, khung hành trình báo đang nối lại và khóa thao tác đến khi nhân vật sẵn sàng. `npm.cmd run test:hang-nhac-reload` kiểm E và nút Nói chuyện qua ba reload, ba reconnect → reload, restart không tải lại trang và hủy phục hồi bằng Rời sân. Xem [kiểm chứng phục hồi](data/hang-nhac-reload-interaction-verification.json).

1. **HN01:** gặp người tiếp dẫn tại sân môn phái, nhận hướng dẫn và 2 vật tư hồi phục một lần.
2. **HN02:** tới vườn thổ nạp, chọn nền vận khí. Đứng yên 3 giây hợp lệ cho mỗi nhịp Hít → Dẫn → Thu và tự xác nhận từng nhịp. Đổi vị trí hoặc luyện thuật làm nhịp hiện tại đợi lại; các nhịp đã xác nhận được lưu.
3. Chọn đúng ý nghĩa tu vi/tích lũy hồi phục khác linh lực, rồi **chủ động xác nhận M01**. Thành quả +100 tích lũy ghi một lần; Vương Lâm/Lý Mộ Uyển có nhãn tầng 1 gameplay, Tư Đồ Nam có nhãn Hồi phục I.
4. Chọn **Bắt đầu thổ nạp / hồi phục nền**. Có thể đi lại trong sân an toàn; tạm dừng khi thi triển, projectile còn chạy và khoảng nghỉ luyện thuật. Có thể dừng hoạt động qua NPC hoặc Nhật ký.

Người coi luyện thuật giải thích bộ R01 và tạo mục tiêu cá nhân bằng chức năng hiện có; đánh lại không cho tu vi/loot và chưa hoàn thành HN03. Người coi chuẩn bị cho xem/dùng vật tư: +30 HP ngoài luyện thuật, không vượt 100, cooldown 10 giây; HP đầy không tiêu vật tư. Chưa có pháp khí, kho chung hoặc map đích để mở cửa.

## Baseline đang thử

| Nội dung | Bản đang chạy |
| --- | --- |
| Bộ thuật | Kiếm Khí/Lôi Ấn/Ngự Phong Bộ có từ đầu; nhiệm vụ không khóa hoặc cấp lại |
| HN01 / HN02 | 2 vật tư / 100 tích lũy, theo bảng đề xuất tiến trình |
| Vòng vận khí | 3 nhịp × 3 giây server hợp lệ, thêm câu hỏi và xác nhận; thời lượng bài là lựa chọn prototype |
| Tích lũy nền | 120/phút online, một hoạt động/hồ sơ; walking không nhân tốc độ |
| Ngưỡng | 100/220/360; xác nhận từng ngưỡng tại người hướng dẫn, không tự tiến tầng |
| Cổng nền 1–3 | Dừng tích lũy nền ở 360; chưa mở nền 4–9. Ngưỡng 3 chưa tự ghi M02 vì còn cần HN05 |
| Offline | Chưa tính; đề xuất cap 30 phút trong thiết kế chưa triển khai |
| Stat | HP/MP tối đa vẫn 100; M01 không tăng stat và không tăng damage/cự ly/cooldown R01 |

Các con số là baseline thử từ [tiến trình/phần thưởng](HANG-NHAC-PROGRESSION-REWARDS.md), chưa khóa cân bằng. Tu vi và MP là hai nguồn riêng. Luật tích lũy nền không cắt phần dư của thưởng nhiệm vụ tương lai; chưa có endpoint client tự cộng thưởng.

Tư Đồ Nam giữ kiến thức đã có; bài học diễn giải ổn định linh thể, không biến ông thành phàm nhân học tu luyện từ đầu hoặc gán cảnh giới canon Ngưng Khí. Lý Mộ Uyển có lời dẫn tự luyện/chuẩn bị đan–trận, không cần một Vương Lâm khác. Các vai NPC/lời dẫn là nội dung chuyển thể game.

## Điểm tương tác và ART

| Vai | Tọa độ chân runtime | Hình thử |
| --- | --- | --- |
| Tiếp dẫn | (1536,1168) | Mẫu đệ tử nam hiện có |
| Hướng dẫn vận khí | (736,944) | Mẫu đệ tử nữ hiện có |
| Coi luyện thuật | (2464,880) | Mẫu đệ tử nam hiện có |
| Coi chuẩn bị | (2392,1488) | Mẫu đệ tử nữ hiện có |

Điểm nằm trên khoảng trống của map hiện hành, kiểm được đường từ Spawn bằng cùng polygon owner. Đây là điểm gameplay prototype, không sửa dữ liệu authoring. Server kiểm khoảng cách tối đa 84 px **và đường chân không cắt blocker**, không cho nói chuyện xuyên tường. NPC không thêm collider, dùng lại hai atlas đệ tử 64 × 96/chân (32,88); chưa là tạo hình NPC production được duyệt. Không đặt bản sao bộ ba playable làm NPC hướng dẫn.

Nền access-v5-clean-v1, 3072 × 2048, 9 blocker, Spawn (1616,992), camera 1×, source/background/release hash và ART nguồn giữ nguyên. Không tạo raster mới hoặc khôi phục map lỗi.

## Server, lưu và phục hồi

- Hồ sơ JSON **schema 2**, SQLite `user_version=2`. Đọc schema 1 hợp lệ và bổ sung tiến trình trống; lần save tiếp ghi schema 2. Giữ ID, vị trí, MP/HP, R01, cooldown, counters và cast receipts. Không seed lại hồ sơ đang có.
- HN01/HN02, nền, nhịp đã xác nhận, ngưỡng, lựa chọn hoạt động, tích lũy, phần thời gian lẻ, vật tư và cooldown dùng vật tư lưu riêng cho từng nhân vật.
- Lệnh `sect:command` gồm ID và action được whitelist; server kiểm vị trí, thứ tự nhịp, thời gian hợp lệ, đáp án, ngưỡng và tài nguyên. Client không gửi trạng thái hoàn thành hoặc số thưởng.
- `sect_receipts` và profile CAS lưu trong **cùng transaction**. Gửi lại ID giữ kết quả đã ghi, không cấp thưởng/trừ vật tư lần nữa; tái dùng ID cho lệnh khác bị từ chối. Lệnh xác nhận ngưỡng mang ngưỡng hiện tại để gói cũ không vô tình xác nhận tầng tiếp.
- Khi save thất bại, thay đổi nhiệm vụ/phần thưởng/vật tư chưa áp dụng. Tích lũy nền online được autosave khoảng 1 giây, cùng giới hạn mất phần chưa autosave khi tiến trình bị kill đột ngột.
- Drop/reload giữ nhịp đã xác nhận; khi tiếp tục nhịp đang đợi, cần chọn tiếp tục và đứng yên lại. Không dùng đồng hồ vắng mặt để hoàn thành nhịp hoặc tính tu vi offline.
- `sect:sync` đăng ký nhận `sect:state` riêng cho hồ sơ của phiên; `sect:result` xác nhận thao tác. Tiến trình nhiệm vụ không broadcast cho người khác. Lease một nhân vật/tài khoản của bước 2 tiếp tục ngăn chạy nhiều tab để nhân tích lũy.

## Kiểm chứng và phần tiếp nối

`npm.cmd run test:hang-nhac-sect` dùng DB/browser context cô lập trong `artifacts/`; không sửa DB/map/draft của owner. Kiểm proximity, thưởng một lần, ba nhịp đúng thời gian, hiểu nguồn lực, reload giữa bài, reconnect/restart, pause/no offline, vật tư, tiến trình bộ ba và mobile. Browser test đặt tọa độ bắt đầu từng chặng trong DB fixture để kiểm UI; unit test kiểm toàn đường đi tới cả bốn điểm trên blocker thật. Build/typecheck và hồi quy map/R01 cũng được chạy.

Xem [biên bản](data/hang-nhac-sect-verification.json). Tiếp nối **HN03–HN04**: đòn đánh cơ bản, minh chứng Kiếm/Lôi trúng mục tiêu và bài đọc báo đòn/đi bộ/Phong. Sau đó mới nối HN05 tới map ngoại vi riêng, rồi các chặng cá nhân/chuẩn bị/bình cảnh/khảo nghiệm. Chưa báo hoàn tất toàn bước 3 hoặc toàn GDD.
