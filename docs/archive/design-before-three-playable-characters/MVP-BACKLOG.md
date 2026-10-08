# Backlog MVP — Tiên Nghịch: Hành Trình Vương Lâm

**Tham chiếu:** [GDD phiên bản 0.23](GDD.md), [MMORPG](MMORPG-DIRECTION.md), [hình trên map](WORLD-VISUAL-SPEC.md), [định hướng online](ONLINE-DIRECTION.md), [nhân vật](CHARACTERS.md), [hồ sơ Vương Lâm](WANG-LIN-VISUAL-SPEC.md), [sprite](WANG-LIN-SPRITE-SPEC.md), [đặc tả A tham chiếu](MVP-A-SPEC.md), [UX A](UX-MVP-A.md), [màn hình/trạng thái](UX-SCREENS-AND-STATES.md), [bộ UI](UI-COMPONENTS.md), [ART](ART-DIRECTION.md), [asset](ASSET-PLAN.md), [map](WORLD-MAPS.md), [gặp gỡ](ENCOUNTERS.md).  
**Đích bàn giao:** đệ tử riêng đạt Ngưng Khí tầng 1 trên web online; hai tài khoản có thể tương tác trong khu chung.

**Giai đoạn hiện tại:** đã có preview animation/map và backend online tối thiểu. PV01–PV04 đã được kiểm tra kỹ thuật; chất lượng motion cần người phát triển đánh giá. Gameplay tài nguyên/tu luyện/tài khoản/tiến trình trong B01–B20 chưa hoàn thành. Thứ tự ưu tiên theo phụ thuộc; chỉ sản xuất thêm nội dung sau khi vòng hiện tại chơi được.

Lộ trình đã chốt là **A → B**. B01–B20 là ID công việc của A, còn giai đoạn B là phần mở rộng sau A. Hướng MMORPG/khu môn phái đi lại đã xác nhận; phân bổ chiến đấu/trang bị và thế giới vào A/B cần xét lại. Các 9 node/3 gặp gỡ hiện có là chính truyện tham chiếu.

**Điều chỉnh online:** các con số/cảnh E và trường hợp lưu cục bộ trong backlog v0.6 là tham chiếu. B07–B09 đã đổi mục tiêu sang máy chủ; nhiệm vụ/map/UX phải được biên tập lại theo vai đệ tử trước lập trình. Các trường hợp xuất/nhập JSON và đồng hồ thiết bị ở mục 3 được thay bằng xác nhận trạng thái máy chủ; không đưa vào tiêu chí gameplay online.

## 0. Công việc thiết kế đang ưu tiên

| ID | Đầu ra | Trạng thái |
| --- | --- | --- |
| D-CHR | Roster, hồ sơ nguồn, nhận diện bộ ba trọng tâm và hai đệ tử | Ba chân dung UI/bộ đi sửa chờ đánh giá; kế hoạch core 44 → 108, 64 frame Tư Đồ Nam/Lý Mộ Uyển chưa vẽ; nhận diện giữ trạng thái riêng |
| D-VIEW | ART/góc nhìn, lưới và bộ chuyển động đầu tiên | [Bộ đi sửa tay/chân](GAIT-CORRECTION.md) có 8 pose/hướng cho Vương Lâm/hai đệ tử; đánh giá trong preview |
| D-TECH | Công nghệ client và thành phần preview dùng chung | TypeScript + Three.js; backend tối thiểu TypeScript + Node.js + Colyseus đã được đồng ý; DB/auth còn mở |
| D-PREVIEW | Adapters, map thử và nghiệm thu preview | 5 bộ/116 frame, hai chế độ cục bộ và sân online; [kết quả](data/preview-verification.json), chờ người phát triển đánh giá chuyển động |
| D-MMO | Phạm vi map/NPC/nhiệm vụ/chiến đấu/trang bị của A/B | Định hướng MMORPG đã xác nhận, chi tiết còn đề xuất |
| D-WORLD | Khu môn phái đi lại, điểm tương tác và vị trí người chơi | Hình thức khu chung đã chọn; cần bố cục/luật |
| D-P | Tuyến P của đệ tử tách E chính truyện, vật phẩm và map riêng | Cần biên tập sau tạo hình |
| D-ON | Hợp đồng tài khoản/phiên/thời gian/lưu máy chủ và tương tác hai người | Có định hướng; cần đặc tả |
| D-UX-ON | Tạo đệ tử, Công pháp, Đồng môn, tài khoản và trạng thái kết nối | Cần cập nhật sau D-P/D-ON |

M1 chỉ bắt đầu sau các đặc tả D-P/D-ON cần cho vòng chơi. Preview duyệt ART được triển khai trước M1 và trước bộ animation mới; không cần chờ backend.

## 1. Các mốc bàn giao

| Mốc | Kết quả kiểm tra được | Công việc |
| --- | --- | --- |
| M1 — Có vòng tài nguyên | Chạy chu kỳ và thấy nước/linh dịch/tu vi đúng luật bằng giao diện tối thiểu | B01–B03 |
| M2 — Chơi được hành trình | Hoàn thành tuyến P tới tầng đầu và các chương chính truyện tương ứng; map theo nút, thưởng đúng chủ thể | B04–B06, B13–B15 |
| M3 — Quay lại chơi được | Lưu máy chủ, kết nối lại, vắng mặt và lệnh lặp/nhiều phiên đúng luật | B07–B09, B16, B18 |
| M4 — Đủ để chơi thử online | Giao diện/nội dung/asset và tương tác hai tài khoản hoạt động, không có lỗi chặn hành trình | B10–B12, B17, B19 |

Bản **PV01–PV04: preview chung TypeScript + Three.js** bằng các bộ sprite hiện có đã chạy và kiểm tra kỹ thuật. Bổ sung **NET01: sân chung tối thiểu** với hai phiên đệ tử, server xử lý vị trí/va chạm và kết nối lại. Sau đánh giá ART và biên tập D-P/D-ON, mốc gameplay **M1 / B01–B03** dựng vòng tài nguyên/tu luyện tại máy chủ. Các mốc thiết kế D1–D4 được theo dõi riêng trong GDD.

| ID preview | Đầu ra triển khai | Phụ thuộc | Nghiệm thu |
| --- | --- | --- | --- |
| PV01 | Ứng dụng TypeScript + Three.js, UI và camera orthographic cố định | D-TECH, D-PREVIEW | Có hai chế độ và trạng thái nạp/lỗi; giữ ART 2D đã chọn |
| PV02 | Loader/adapters và xem animation | PV01 | Nạp 5 bộ/116 frame, đúng điểm neo/hướng; Play/Pause/bước frame; khóa động tác chưa có |
| PV03 | Di chuyển trên map thử, va chạm/lớp | PV02 | Tốc độ độc lập FPS, reset/dừng/đổi hướng; vật cao che khuất theo điểm chiếu; không dùng nền vẽ sẵn nhân vật |
| PV04 | Kiểm tra hiển thị, điều khiển và số liệu preview | PV02, PV03 | Desktop/360 px, nền sáng/tối, zoom nguyên; hai hình cùng atlas ở frame khác nhau; ghi số liệu với 1/5/20 hình |

PV là công cụ duyệt ART; NET01 dùng chung renderer và luật di chuyển để thử hai client trong cùng phòng. [Hướng dẫn](PREVIEW-RUNBOOK.md) ghi thao tác, [hợp đồng backend](BACKEND-PREVIEW.md) ghi giới hạn phiên tạm. Sau phản hồi tay/chân đã có bộ đi vẽ lại để đánh giá; hai phiên thử và số đo preview không thay nghiệm thu hai tài khoản/tiến trình của A.

## 2. Công việc triển khai

| ID | Công việc | Phụ thuộc | Điều kiện nghiệm thu |
| --- | --- | --- | --- |
| B01 | Tạo client game TypeScript + Three.js và máy chủ tối thiểu theo công nghệ backend được chọn | D-ON, D-TECH | Client kết nối máy chủ phát triển; tái dùng phần dựng cảnh từ preview, trạng thái game/cân bằng tách renderer |
| B02 | Bộ trạng thái và xử lý một chu kỳ | D-P, B01 | Luật hoạt động đệ tử đã biên tập chạy tại máy chủ; nhánh/đầu vào/đầu ra/bộ đếm/kho đúng; cổng tu vi theo tuyến P |
| B03 | Xử lý thời gian và chế độ tự động | B02 | Giữ chu kỳ dở qua lần cập nhật; chọn hành động theo thứ tự ưu tiên; đổi hoạt động hủy phần chu kỳ dở |
| B04 | Tuyến đệ tử P và chương chính truyện E | D-P, B02 | Trình tự đã biên tập; điều kiện/chi phí/thưởng thuộc đúng đệ tử hoặc chương truyện; nút cuối/lệnh xử lý một lần; khôi phục đoạn đọc |
| B05 | Đột phá và kết thúc A của đệ tử | B04 | Mốc P và ngưỡng tu vi đã duyệt; chủ động đạt tầng 1 một lần; kết quả đệ tử tách sự kiện E08 của Vương Lâm |
| B06 | Hồ sơ đệ tử, NPC và vật phẩm | D-CHR, B04 | Dùng roster: 7 NPC ở A, 6 nguồn portrait NPC và 2 mẫu đệ tử; vật phẩm của người chơi tách vật phẩm chính truyện; chỉ tiết lộ nội dung đã mở |
| B07 | Lưu máy chủ và phục hồi | D-ON, B03, B05, B18 | Trạng thái phiên bản, thời gian máy chủ, chu kỳ dở và mốc của từng đệ tử được lưu; kết nối lại giữ tiến trình |
| B08 | Tu luyện khi vắng mặt và tổng kết | B07 | Bộ xử lý máy chủ dùng cùng luật; giới hạn đã duyệt theo quãng mất kết nối; kho/mốc đúng; tổng kết không phát thưởng lại |
| B09 | Lệnh xử lý một lần và nhiều phiên | B07 | Gửi lại lệnh/đột phá không lặp tác dụng; nhiều tab/thiết bị không nhân thời gian; JSON trình duyệt không thay tiến trình máy chủ |
| B10 | Giao diện hoàn chỉnh và hướng dẫn | B05, B06, B08, B14 | Có 5 khu vực; dùng bộ UI/token, hướng tranh mực/giấy; Hành trình có mốc/map; mục tiêu/chờ rõ; thao tác được ở chiều rộng 360 px |
| B11 | Kiểm tra hành trình, map và các trường hợp thời gian/lưu | B09, B10, B16, B17, B19 | Đạt tiêu chí GDD v0.22 và bộ trường hợp đã cập nhật, gồm hai tài khoản di chuyển/tương tác; lỗi chặn hoặc nhân đôi tiến trình được sửa |
| B12 | Biên tập và chơi thử | B11 | Chuẩn hóa tên Việt và tóm tắt; ghi phản hồi khoảng 5 người; cập nhật GDD theo số liệu quan sát |
| B13 | Nạp dữ liệu map/gặp gỡ/asset vào game | D-P, B01, B04, B06 | ID/tham chiếu hợp lệ; tách node truyện/đệ tử/khu chung; dự toán 22 nguồn hình khi làm P2; các mốc kiểm tra điều kiện riêng |
| B14 | Giao diện node và địa điểm hoạt động | B13 | Tách node đang xem và nơi hoạt động; biết/khóa/lịch sử đúng cảnh; map và danh sách dọc có cùng hành động |
| B15 | Cảnh và gặp gỡ theo nguyên tác | B04, B14 | Hổ/lực hút/kiếm linh đúng cảnh; không có loot riêng; E03 là nơi duy nhất nhận hạt châu; đọc lại không chạy tác dụng |
| B16 | Lưu cảnh/map và kiểm tra với offline | B07, B08, B15 | Khôi phục cảnh đang đọc và node đã biết; offline chỉ chạy hoạt động; không giải quyết gặp gỡ hoặc lặp tác dụng |
| B17 | Sản xuất và tích hợp asset P0/P1 | D-CHR, B05, B06, B10 | Theo ART-DIRECTION; dự toán 7 icon, 6 nền, 4 portrait NPC + 2 mẫu đệ tử, 1 hình hổ hoặc bản được duyệt tương đương; cập nhật nếu D-P phát sinh hình mới |
| B18 | Tài khoản và tạo đệ tử | D-ON, D-CHR, B01 | Hai tài khoản có ID/đệ tử/tiến trình riêng; chọn tên/mẫu hình; xác nhận truy cập và phiên tại máy chủ |
| B19 | Khu chung và tương tác đồng môn | B18, B10, B20 | Hai người thấy nhau đi lại, xem hồ sơ và tương tác; dữ liệu tiến trình riêng được giữ |
| B20 | Map môn phái, sprite và di chuyển online | D-VIEW, D-WORLD, B18 | Hiện nhân vật trên map; chuyển động/hướng/vị trí được máy chủ kiểm tra; đi và tương tác được với ít nhất hai tài khoản |

## 3. Trường hợp cần xác minh khi có prototype

Đây là danh sách hành vi cần kiểm tra, chưa phải các bài test đã viết hoặc đã chạy.

| Trạng thái bắt đầu | Thao tác/thời gian | Kết quả mong muốn |
| --- | --- | --- |
| Sau E04, nước 0; đang lấy nước | 60 giây | Nước 12; bộ đếm lấy nước tăng 6 |
| Sau E04, nước 12, linh dịch 0; đang ủ nước | 60 giây | Nước 0, linh dịch 6; bộ đếm ủ tăng 6 |
| Sau E05, chưa E06; đang luyện thổ nạp | 30 giây | Tu vi 0; bộ đếm thổ nạp 3; chờ và chỉ dẫn sang E06 |
| Sau E07, linh dịch 6, tu vi 0; đang luyện mộng cảnh | 60 giây | Linh dịch 0; tu vi 60 |
| Sau E07, cả ba tài nguyên 0; bật chuẩn bị tự động | 180 giây | Tu vi 60; nước và linh dịch về 0 |
| Sau E07, cả ba tài nguyên 0; bật chuẩn bị tự động | 1.440 giây | Tu vi 480; dừng chờ đột phá; cảnh giới vẫn là phàm nhân |
| Sau E04, kho nước 0; đang lấy nước | Vắng mặt 8 giờ | Nước 120; hoạt động dừng vì kho đầy sau 600 giây |
| Cùng trạng thái hợp lệ, không qua sự kiện chủ động | Online và offline cùng thời gian đủ điều kiện | Tài nguyên, bộ đếm, chu kỳ dở và điều kiện chờ trùng nhau |
| Hoạt động lấy nước đã chạy 7 giây | Lưu rồi mở lại sau 3 giây | Hoàn thành đúng 1 chu kỳ, nhận 2 nước |
| Hoạt động lấy nước đã chạy 7 giây | Đổi sang hoạt động khác | Hủy 7 giây dở; không nhận nước và không trừ tài nguyên |
| Tu vi 475, linh dịch 1; E07 hoàn thành | Luyện mộng cảnh 10 giây | Tu vi 480, linh dịch 0; không vượt ngưỡng |
| Tu vi 480; chưa bấm đột phá | Đóng rồi mở lại | Giữ phàm nhân; có nút đột phá; không tự hoàn thành E08 |
| Đã nhận tổng kết offline | Mở lại ngay | Không nhận lại quãng thời gian vừa xử lý; chu kỳ mới chỉ tính từ mốc mới |
| Vắng mặt lâu hơn 8 giờ | Mở game | Chỉ mô phỏng tối đa 8 giờ; lần mở tiếp không bù phần thời gian đã loại bỏ |
| Đồng hồ hiện tại thấp hơn `lastProcessedAt` | Mở game | Không sinh phần thưởng thời gian âm; giữ mốc xử lý trước |
| E05/E06/E07 chưa đủ linh dịch | Bấm tiếp tục hoặc gọi xử lý nhiều lần | Không hoàn thành mốc, không tạo tài nguyên âm |
| Đột phá đã được nhận | Bấm nhanh nhiều lần hoặc tải lại | Cảnh giới chỉ đổi một lần; không nhận lại sự kiện |
| Có save hợp lệ | Nhập JSON lỗi, sai phiên bản, số âm hoặc mốc truyện sai thứ tự | Báo lỗi; giữ save hợp lệ đang chơi |
| Game đang mở một tab có quyền ghi | Mở tab thứ hai | Tab thứ hai không đồng thời mô phỏng và ghi thêm tiến trình |
| Đang lấy nước tại MAP-006 | Mở MAP-001 để đọc hồ sơ | Hoạt động lấy nước vẫn chạy đúng nơi; xem map không đổi hoạt động |
| Đã hoàn thành cảnh hổ trong E03 | Bấm lại MAP-003 | Chỉ xem lịch sử; không nhận tu vi/loot và không chạy lại cảnh hang |
| Chờ một gặp gỡ trong E03 | Lưu, đóng và mở lại | Giữ cảnh đang đọc; gặp gỡ không tự hoàn thành bởi thời gian offline |
| Đã nhận hạt châu từ E03 | Mở lại cảnh hang/gặp gỡ lực hút | Hạt châu không được cấp thêm lần nữa |
| Chưa hoàn thành E07 | Mở map hoặc gọi hoạt động mộng cảnh | Không bắt đầu tu luyện mộng cảnh; giữ điều kiện khóa |
| Sau E05/E06/E07 | Lưu rồi mở lại | Trang phục, lớp châu và địa điểm chuẩn bị đúng mốc |
| File hình thiếu hoặc chưa sản xuất | Mở node/hồ sơ tương ứng | Hiện tên và thông tin; vẫn đi tiếp được bằng luật game |

Trường hợp bổ sung về cảnh chủ động, nút cuối và lựa chọn hoạt động nằm trong [MVP-A-SPEC.md](MVP-A-SPEC.md); trường hợp hướng dẫn/màn hình nằm trong [UX-MVP-A.md](UX-MVP-A.md) và [UX-SCREENS-AND-STATES.md](UX-SCREENS-AND-STATES.md). Chúng là kế hoạch nghiệm thu khi có prototype.

## 4. Những quyết định để lúc triển khai

- Client TypeScript + Three.js đã chốt; framework máy chủ, cơ sở dữ liệu và đăng nhập cần đặc tả.
- Bản dịch tiếng Việt dùng để chuẩn hóa tên và thuật ngữ.
- Số giờ phát triển thực tế để dự tính lịch bàn giao.
- Nhịp chơi sau MVP: tập trung các phiên ngắn hay quãng bế quan dài hơn.
- Mục tiêu phát hành, quy mô người đồng thời và quyền điều khiển giữa thiết bị.

Những chi tiết hạ tầng có thể chọn khi triển khai; đặc tả tuyến P, quyền sở hữu tiến trình và hợp đồng phiên/lệnh phải có trước prototype online.

## 5. Điều kiện chuyển từ A sang B

B bắt đầu khi A đạt các điều kiện sau; đây là tiêu chí nghiệm thu, chưa phải kết quả đã kiểm tra:

1. Hoàn thành M1–M4; đệ tử hoàn thành tuyến P đã biên tập, xem chính truyện tương ứng và đạt Ngưng Khí tầng 1 bằng giao diện, không cần lệnh phát triển.
2. Đạt tiêu chí GDD v0.22 và bộ trường hợp cập nhật: lưu máy chủ/kết nối lại, chu kỳ dở, quãng vắng mặt, map đi lại, lệnh lặp và nhiều phiên. Hai tài khoản thấy nhau di chuyển và tương tác trong khu môn phái; không còn lỗi chặn hành trình hoặc nhân đôi tiến trình. D-MMO phải cập nhật điều kiện A/B nếu phạm vi thay đổi.
3. Giao diện/nhiệm vụ đã tách đệ tử khỏi chính truyện; portrait người chơi và NPC đúng vai. Asset P0/P1 gồm hai mẫu đệ tử được tích hợp hoặc có hình tạm được duyệt. Hai chân dung NPC P2 vẫn tùy chọn.
4. Chơi thử khoảng 5 người, mục tiêu ít nhất 4 người tự đạt mốc tu luyện nâng cao của tuyến P và giải thích được tài nguyên linh khí; ít nhất hai người thử tương tác trong khu chung. Chỉ tiêu cũ mở mộng cảnh đổi theo D-P; ghi số liệu/chỉnh hướng dẫn trước B.

## 6. Giai đoạn B — Luyện thuật và giao đấu

B đã được chọn là giai đoạn sau A. Công việc dưới đây thuộc B; số liệu combat, điều kiện mở và kết quả truyện cần được biên tập, kiểm chứng khi triển khai.

1. Biên tập B-E01…B-E06: học/luyện thuật, trao đổi, hậu sơn, nhận kiếm, nhân vật trong châu và giao lưu.
2. Thêm 4 node MAP-010…MAP-013 và điều kiện theo tuyến đã biên tập.
3. Thêm hoạt động luyện thuật và hai mục tiêu CP-001/CP-002 dùng đạo cụ có sẵn.
4. Dựng trận 1 đấu 1, HP/linh lực phiên trận, đòn thường và Dẫn Lực; kiểm chứng số học trong ENCOUNTERS.md.
5. Gắn đối thủ CP-003 vào mốc đã đối chiếu đầy đủ; kết quả và phần thưởng một lần.
6. Tích hợp tối đa 8 nguồn đồ họa thêm; biên tập cả vật phẩm và hành động của trận nguồn.
7. Kiểm tra lưu/diễn luyện/thử lại và chơi thử trước khi mở farm dài hạn.
