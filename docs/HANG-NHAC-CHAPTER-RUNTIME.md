# Hằng Nhạc và EX01–EX04 — bản chơi thử 12/10/2026

Theo yêu cầu owner, bản này mở tuyến HN05–HN12 cùng nguyên liệu/luyện chế EX01–EX04 trong game thật, tiếp nối HN01–HN04 và save hiện hành. Dùng [chương phương án A](HANG-NHAC-CHAPTER-PLAN.md), [thiết kế luyện chế](ITEM-CRAFTING-DESIGN.md) và [sáu công thức](design/systems/items-v1/plan.json) làm cơ sở chơi thử. Đây là bản kiểm vòng chơi; số liệu đề xuất và ART mới chưa được suy duyệt từ test.

## Vào chơi

[Mở Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html?mapArt=van-ngoc-detail). Dùng tài khoản/hồ sơ hiện có hoặc tạo tài khoản qua màn vào game. Không cần reset save. Hồ sơ cũ đọc được dù chưa có trường `chapter`.

- WASD/mũi tên: đi; E: nói chuyện NPC hoặc lấy/kiểm mẫu tại điểm có tên.
- J: nhật ký/chỉ đường HN01–HN12 và EX01–EX04. H: nhiệm vụ tiếp theo, nguyên liệu và sáu công thức.
- F: đánh thường; 1/2/3: Kiếm/Lôi/Phong; G: hộ thân sau khi luyện hóa và trang bị ngọc.
- I/C: hành trang/hồ sơ; bộ lọc nguyên liệu/công cụ và nút luyện chế mở cùng màn H.
- Trong hoạt động, dùng bảng bên phải để chuẩn bị, bắt đầu, chọn tuyến hoặc quay về. Mở màn H tạm chặn input di chuyển.

Nhận và xác nhận nhiệm vụ tại đúng NPC trong sân. Nút bị khóa khi đứng xa hoặc chưa đủ điều kiện; server kiểm lại mọi thao tác. Không đặt quái vào map Hằng Nhạc chung.

## Tiến trình chơi thử

| Bước | Việc làm và nơi xác nhận |
| --- | --- |
| HN01–HN04 | Giữ bài nhập môn hiện hành: người tiếp dẫn, vận khí, Kiếm/Lôi, né warning bằng đi bộ/Phong. |
| HN05 | Nhận ở người coi luyện thuật, chủ động vào hoạt động riêng, thắng E01 60 HP, quay về xác nhận. +100 tích lũy, 3 nguyên liệu HN, 2 vật tư. |
| M02 | Xác nhận tầng 3 và mốc M02 tại người hướng dẫn vận khí sau HN05; không tự cấp mốc. |
| HN06 | Người coi chuẩn bị: Vương Lâm đối chiếu A/B; Tư Đồ Nam đứng ổn định 2 giây rồi thử lại; Lý Mộ Uyển đặt vỏ tại A, so mẫu trần tại B. +120 tích lũy, 3 nguyên liệu HN. |
| HN07 | Bài kiểm chứng riêng theo nhân vật, quay về người hướng dẫn vận khí xác nhận. +240 tích lũy, mở cổng 1620/tầng 9. |
| HN08 | Người coi chuẩn bị: nhận phôi, nhận biết phương pháp, tiêu 4 nguyên liệu để luyện hóa cùng một món, trang bị, thử hộ thân chịu một đòn, quay về xác nhận. +300 tích lũy, 2 vật tư. |
| HN09 | Thắng E02 80 HP trong bài tích hợp; được làm trước tầng 9. Xác nhận tại người coi luyện thuật khi đã xác nhận tầng 9. +360 tích lũy, 2 vật tư; ghi M03 và mở cổng 3600/tầng 15. |
| HN10 | Sau M03/tầng 15/ngọc đã luyện hóa: khảo nghiệm riêng E01 → E02 → E03 240 HP. Chuẩn bị miễn phí giữa pha. Checkpoint 1/2/3 bền; thắng cuối ghi HN10/M04 một lần, không thưởng kill. |
| HN11–HN12 | Chủ động xác nhận tổng kết và xuất hành tại người tiếp dẫn; mở EX01. Không phát thêm tích lũy/vật phẩm. |
| EX01 | Đi lấy dược liệu, linh tuyền và cát; quay về xác nhận để nhận 2 dược thảo, 2 linh tuyền, 1 cát một lần. |
| EX02 | Kiểm sợi/ngọc rồi tới điểm kiểm chứng sơ chế; xác nhận để nhận 3 sợi, 3 ngọc, 1 cát một lần. |
| EX03 | Chuẩn bị chuyến ở NPC. Tuyến thủ công: ổn định 2 giây tại A rồi B → giao mẫu. Tuyến hộp niêm: qua điểm cát → giao mẫu. Cùng kết quả, không thưởng thêm vì có công cụ. |
| EX04 | Quan sát A+B rồi kiểm chứng, hoặc dùng Định Lưu Bàn tại A rồi tự đi kiểm chứng. Công cụ không bắt buộc. |

Tu luyện nền giữ **120/phút online**, dừng trong bài riêng/thi triển và khi mất kết nối. Ngưỡng `10 × tầng × (tầng + 9)`; cổng 360/1620/3600 chỉ mở theo tiến trình. Theo nguồn thưởng baseline, chờ khoảng **5 phút trước tầng 9** và **13,5 phút trước tầng 15** nếu bắt đầu từ đúng tổng thưởng tối thiểu. Người chơi cần chủ động bật hoạt động nền và xác nhận từng ngưỡng tại NPC. Không có tăng tốc thử hoặc cấp tầng vào DB thật.

Sau HN09 có báo cáo tùy chọn và hồi đáp cá nhân được lưu: `record` là đối chứng/gửi dữ kiện trước, `test` là giúp khắc phục rồi kiểm chứng. Không thay reward hoặc chặn HN10; người chơi được xem lại/đổi thứ tự xử lý trong bản thử. HN11 tổng kết lỗi bảo quản và trách nhiệm báo chậm, không biến E03 thành phản diện truyện. Thoại là bản thử của phương án A, chưa coi là canon/ART đã chốt.

## Nguyên liệu và sáu công thức

| Công thức | Tiêu hao | Kết quả/điều kiện |
| --- | --- | --- |
| Luyện ngọc hộ thân | 4 nguyên liệu HN | HN08 đã nhận + đã biết phương pháp; phôi chuyển sang luyện hóa, giữ cùng ID; không tạo ngọc thứ hai. |
| Pha mực dẫn khí | 1 cát + 1 linh tuyền | 1 mực, sau EX01. |
| Chế vật tư hồi phục | 2 dược thảo + 1 linh tuyền | +1 vào `sect.supplies` hiện hành, sau EX01. |
| Chế Hộp giữ khí | 2 sợi + 1 ngọc | Một công cụ bền, sau EX02; không tăng ô túi. |
| Chế Định Lưu Bàn | 1 sợi + 2 ngọc + 1 cát | Một công cụ bền, sau EX03. |
| Niêm hộp | 1 mực; giữ Hộp | EX03 đã nhận, chuyến đã chuẩn bị/chưa bắt đầu. Hiệu lực một chuyến; hủy trước khởi hành hoàn mực một lần, sau khởi hành không hoàn. |

Hai nguyên liệu HN còn lại được giữ; không đổi sang nguồn EX hoặc tạo công thức tiêu thụ thêm. Nguồn EX hữu hạn, không hồi node để farm lặp. Tuyến thủ công hoàn tất được khi chưa chế hộp/bàn. Cả NPC và hành trang vẫn dùng cùng luật hồi phục: 1 vật tư/+30 HP/tối đa 100/cooldown 10 giây, chặn trong HN03/HN04 kể cả đứng yên và trong hoạt động riêng đang chạy. Không có kho vật tư hay receipt thay thế.

Hộ thân: **15 MP, hồi 12 giây, hiệu lực 1 giây, giảm 50% một đòn dương đầu tiên**. Chỉ server tính hit/proof. Đây là khả năng phòng thủ của ngọc, không mở thuật damage R02.

## Nhân vật và hình ảnh

Vương Lâm dùng bộ pixel mới đã pull: 80 clip/8 hướng, gồm 40 clip locomotion/Phong nguồn đã duyệt và 40 clip combat ứng viên để chơi thử. Idle/run ở canvas 64 × 96; action dùng canvas nguồn 112/160 với chân Y88, camera 1×. Đi/chạy theo quãng đường; Kiếm/Lôi/Phong/F/phản ứng trúng đòn/chết bám trạng thái server. Hash duyệt nguồn được giữ; tích hợp không tự đánh dấu 40 clip ứng viên là ART đã duyệt.

F giữ luật đòn thường đơn 10 sát thương/0 MP/0,8 giây của GDD hiện hành; hai clip combo tiếp theo có trong gói nguồn nhưng chưa nối thành combo gameplay. Không tự thay luật F từ trang animation review.

Tư Đồ Nam và Lý Mộ Uyển giữ ART native hiện có và có nhánh HN06/HN07 riêng. Chưa sản xuất hai bộ pixel tương đương, animation thổ nạp mới hoặc tùy biến lúc tạo nhân vật. Thư viện concept owner muốn giữ không bị dọn hay tự đưa vào runtime.

Hành trang dùng bộ icon Vân Ngọc đã có, đúng nguyên liệu/công cụ/phôi–ngọc. Map Hằng Nhạc Vân Ngọc đã chốt, navigation 9 blocker, spawn và camera giữ nguyên. Ngoại vi/khảo nghiệm dùng **nền hoạt động thử 1280 × 896 bằng code** và hình người đối luyện hiện có để đánh giá gameplay/tỷ lệ; chưa có ART môi trường hoặc quái sản xuất đã duyệt. Đây là cảnh tách riêng, không ghi vào `authored-maps`.

Giữ baseline **100 HP/100 MP** theo hợp đồng hiện hành. Đã ghi M03/M04/quyền tiến trình, nhưng bảng tăng chỉ số M03/M04 trong GDD vẫn là đề xuất cân bằng; chưa tự áp 120/110 hoặc sửa người native để khớp bảng. R02, offline cultivation, farm vô hạn, PvP/chợ và các cảnh giới sau chưa thuộc bản này.

## Server, lưu và phục hồi

`shared/chapter.ts` sở hữu definition/command/schema. `server/src/chapter-progress.ts` kiểm điều kiện/candidate; `chapter-activity.ts` chạy encounter; `HangNhacRoom` là writer duy nhất, commit bằng đường receipt hiện hành với namespace `chapter-v1`. Client chỉ gửi ý định, không gửi damage/reward/owner. Retry mất ACK giữ cùng mã thao tác để tránh trừ nguyên liệu hai lần. Stock, jade/công cụ, proof, mốc và checkpoint lưu cùng hồ sơ SQLite; schema 2/save cũ/receipt cũ giữ tương thích.

Hoạt động riêng dùng cùng collision/prediction/R01, actor scene và mục tiêu/projectile theo chủ. Warning hình quạt khóa hướng trước resolve, circle/line có vùng né ở tốc độ native 80 và bán kính chân 8. E03 luân phiên ba dạng; dưới nửa HP, line có hai xung cách 600 ms, hộ thân chỉ giảm một hit. Thua giữ checkpoint đã đạt, chuẩn bị lại miễn phí; không cho kill reward hoặc credit từ hit muộn sau khi đã chết.

HN10 mất mạng đóng băng đồng hồ/HP/MP/cast/projectile và giữ quyền writer **30 giây**. Reconnect trong hạn phục hồi cùng attempt; restart trong cửa sổ phục hồi snapshot. Hết hạn quay về chuẩn bị tại checkpoint đã commit. Bài/lifecycle cũ vẫn giữ cửa sổ cũ. HP, cooldown và scene được room đồng bộ sau transaction; transaction lỗi khôi phục candidate/engine.

## Kiểm tra và nguồn đối chiếu

- `npm.cmd run assets:hang-nhac-pixel-player`: kiểm hash catalog/80 atlas rồi đồng bộ nguồn runtime.
- `npm.cmd run test:hang-nhac-chapter`: unit definition/parity/recovery/snapshot/Schema movement, online toàn tuyến/sáu công thức/restart, avatar/thủ công/reconnect lease, browser desktop/mobile.
- Kết quả: `artifacts/hang-nhac-chapter-online-verification.json`, `artifacts/hang-nhac-chapter-alternatives-verification.json`, `artifacts/hang-nhac-chapter/verification.json`.
- Hồi quy đã chạy: R01, sect, HN03–HN04, character, reload, HUD/layer; typecheck/unit/build được ghi khi bàn giao.

Kiểm lần bàn giao: typecheck **348 tệp/23 module**, **192 unit** đạt, build Vite đạt; Dao UI đạt 4 nhóm/6 bố cục HUD. Bản build còn cảnh báo kích thước chunk renderer >500 kB và import extension của config Vite hiện hành, không có lỗi build.

Mọi test dùng DB/public fixture riêng, không reset account/map/DB hoặc draft trình duyệt owner. Test online toàn tuyến chỉ seed ngưỡng 9/15 trong **DB fixture** để không phải chờ baseline; đây không phải quyền tăng tốc runtime. Build/test xác nhận kỹ thuật và vòng chơi, không xác nhận ART hoặc khóa balance.
