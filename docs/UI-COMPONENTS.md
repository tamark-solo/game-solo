# Bộ thành phần UI — tham chiếu và yêu cầu biên tập

> **Chuẩn hiện hành [GDD 0.28](GDD.md):** chọn Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển từ đầu, có sẵn cả ba thuật R01, Hằng Nhạc qua Ngưng Khí và phân hóa từ hành trình Trúc Cơ. Vai đệ tử riêng/bộ ba chỉ là NPC đã bị thay. [Trải nghiệm Hằng Nhạc](HANG-NHAC-NGUNG-KHI-SPEC.md), [tu tiên](CULTIVATION-SYSTEM.md) và [online](ONLINE-DIRECTION.md) xác định ngữ nghĩa cần dùng khi biên tập UI mới.

> **Các mục 1–5 giữ bộ thành phần/bản vẽ idle v0.6 để tham khảo:** điều hướng năm khu, E01–E08, import client, 480 tu vi/8 giờ và kết thúc tầng 1 không là UX hiện hành. C14 ở mục 6 nêu cách dùng chân dung theo vai chơi mới; không nâng trạng thái duyệt ART hoặc xác nhận hội thoại đã tích hợp.

**Phiên bản:** 0.3, ngày 07/10/2026.  
**Trạng thái:** bộ bản phác lịch sử và yêu cầu biên tập; SVG là hình tĩnh, chưa là bộ UI online hoàn chỉnh.\
**Tham chiếu:** [UX](UX-MVP-A.md), [chi tiết màn hình/trạng thái](UX-SCREENS-AND-STATES.md), [ART](ART-DIRECTION.md), [hệ thống](MVP-A-SPEC.md), [token](design/ui-tokens.json), [thư viện bản phác](design/README.md).

## 0. Mapping thành phần sang trải nghiệm hiện hành

| Nhóm | Điều cần giữ/biên tập |
| --- | --- |
| Chọn nhân vật | Cả ba từ đầu; danh tính/trạng thái riêng; không dùng hai mẫu đệ tử làm lựa chọn chính |
| Mục tiêu và điều kiện | Nhiệm vụ HN, bình cảnh, phần thiếu và thao tác chủ động; không gán E08 là kết thúc Hằng Nhạc |
| Tài nguyên/hoạt động | Tách tu vi khỏi linh lực; nhãn hồi phục Tư Đồ Nam; sản lượng/cap mới là đề xuất |
| Thế giới/thuật | Bộ R01 sẵn có, cooldown/linh lực/cast/hit/miss; input/HUD và mobile còn cần đặc tả |
| Hành trình/hồ sơ | Nội dung theo người đã chọn và nguồn nguyên tác/chuyển thể; châu chỉ thuộc tuyến Vương Lâm |
| Lưu/kết nối | Máy chủ xác nhận tiến trình; không dùng C12 import client để cấp quyền/tài nguyên |

Màu/chữ/nút và cách giải thích phần thiếu có thể được dùng làm tham chiếu; ngữ nghĩa, bố cục và tương tác cần kiểm chứng trong UX/prototype mới. Ưu tiên sản xuất vẫn là map trước vận hành gameplay.

## 1. Các thành phần trong bộ idle lịch sử

| ID | Thành phần | Nội dung/trạng thái bắt buộc | Quy tắc tương tác |
| --- | --- | --- | --- |
| C01 | Mục tiêu | Tên mục tiêu, điều kiện đạt/còn thiếu, nút khóa/sẵn sàng | Mở mốc đủ điều kiện; không tự hoàn thành mốc |
| C02 | Tài nguyên | Icon + tên + số hiện có/sức chứa | Thông tin; giải thích nguồn/dùng khi cần |
| C03 | Hoạt động | Tên, nơi thực hiện, chi phí/sản lượng, chu kỳ, lý do chờ | Chọn/Dừng/Tiếp tục theo trạng thái |
| C04 | Chọn hoạt động/tự động | Trạng thái đang chọn, hợp lệ, khóa, đang dừng | Chọn mới áp dụng luật đổi; chọn hoạt động đang chạy giữ tiến độ |
| C05 | Điều hướng | 5 khu vực; dấu đang chọn | Chỉ chuyển vùng xem, giữ hoạt động |
| C06 | Thẻ node | Tên, trạng thái, hoạt động/gặp gỡ đã biết | Xem giữ hoạt động; Bắt đầu mới đổi hoạt động |
| C07 | Cảnh truyện | Tiêu đề, đoạn, tranh, lời dẫn, chi phí/tác dụng ở đoạn cuối | Đọc mới dừng; lịch sử chỉ xem; nút cuối áp dụng mốc |
| C08 | Hồ sơ/vật phẩm | Tên, hình/thẻ tên, mô tả theo mốc | Chỉ hiện nội dung đã biết; đi tới hệ thống liên quan |
| C09 | Tổng kết offline | Vắng mặt/thời gian tính/thời gian có hoạt động, thay đổi ròng, lý do dừng | Đóng bảng không nhận thêm tài nguyên |
| C10 | Phản hồi | Lưu, đang chờ, mốc sẵn sàng, lỗi nhập/lưu | Nêu trạng thái và thao tác phù hợp bằng chữ |
| C11 | Thiết lập đọc | Cỡ chữ đang chọn, mẫu chữ, giảm chuyển động | Đổi cách trình bày; giữ hoạt động và tiến trình |
| C12 | So sánh bản lưu | Bản hiện tại/file được chọn, cảnh giới, mốc, tài nguyên | Chọn file chỉ mở xem trước; xác nhận riêng mới thay tiến trình |
| C13 | Kết quả đột phá | Cảnh giới mới, hoàn thành A, tài nguyên còn lại | Xem hành trình hoặc xuất; hiện sau khi áp dụng/lưu E08 |

## 2. Nút và trạng thái

| Trạng thái | Hình thức đề xuất | Nội dung |
| --- | --- | --- |
| Chính | Nền ngọc đậm, chữ giấy sáng | Một hành động chính trong thẻ/cảnh |
| Phụ | Mặt giấy, viền điều khiển đậm | Xem, Dừng, Để đọc sau, Xuất bản lưu |
| Đang chọn | Nền ngọc nhạt, viền ngọc, nhãn/dấu chọn | Khu vực hoặc hoạt động đang dùng |
| Khóa | Nền giấy xám, chữ mực phụ | Điều kiện còn thiếu hiện ngoài nút |
| Hover | Viền/độ đậm đổi nhẹ | Không mở tooltip bắt buộc để biết điều kiện |
| Focus | Vòng ngọc 3 px có khoảng cách 2 px | Hiển thị vị trí thao tác bằng bàn phím |
| Đang xử lý mốc | Khóa nút hoàn thành trong khi áp dụng/lưu | Giữ nội dung, ngăn bấm lặp |

Chiều cao nút thường 48 px, vùng bấm tối thiểu 44 px. Các thông số là mục tiêu riêng của dự án. Giảm chuyển động giữ phản hồi chữ và trạng thái nút.

## 3. Thứ bậc và bố cục

Tu luyện đọc theo thứ tự nhân vật → mục tiêu → tài nguyên → hoạt động → lựa chọn kế tiếp. Một màn hình có một mục tiêu chính; các lựa chọn chuẩn bị luôn thấy chi phí trước khi chọn.

Desktop 1.440 × 960 dùng điều hướng 196 px, nội dung chính 816 px và khung minh họa 312 px trong bản phác. Khoảng ngoài/giữa là 24–32 px. Đây là mẫu bố cục, không khóa giao diện thực tế vào một kích thước màn hình.

Màn hình nhỏ 360 px dùng lề 16 px, một cột 328 px, bảng tài nguyên dạng hàng và các lựa chọn thành lưới hai cột. Nội dung cuộn; điều hướng 5 khu vực có nhãn xuống hai dòng. Đặt khoảng đệm cuối để thanh điều hướng không che nút.

Khi tăng cỡ chữ, ưu tiên tăng chiều cao thẻ và xuống dòng; ảnh thu gọn trước thông tin/hành động chính. Kiểm tra reflow và bàn phím ở prototype, vì SVG tĩnh chỉ cho xem hình thức và thứ tự thông tin.

## 4. Bộ 14 bản phác hiện có

| Bản phác | Snapshot thiết kế | Điểm cần xem |
| --- | --- | --- |
| [Tu luyện desktop](design/cultivation-desktop.svg) | E07 hoàn thành; phàm nhân; nước 0, linh dịch 6, tu vi 120; mộng cảnh thủ công 6/10 giây | Mục tiêu và chi phí rõ; Đột phá còn khóa; tự động có thể bật |
| [Tu luyện mobile](design/cultivation-mobile.svg) | Cùng snapshot với desktop, chiều rộng 360 px | Đọc số, vùng bấm, thứ tự cuộn và điều hướng |
| [Hành trình desktop](design/journey-desktop.svg) | Sau E07; xem thôn trong khi lấy nước tại suối | Node đang xem khác node hoạt động; node lịch sử không khởi động lại sự kiện |
| [Cảnh truyện desktop](design/story-desktop.svg) | Đoạn cuối E05; có 2 linh dịch, chi phí 1 chưa trừ | Tranh/lời dẫn, trạng thái dừng và nút hoàn thành một lần |
| [Hạt châu desktop](design/bead-desktop.svg) | E07 hoàn thành; châu có dấu, không còn mây | Công dụng đã biết; nút Xem điều hướng, chưa chạy hoạt động |
| [Hành trang desktop](design/inventory-desktop.svg) | E05 hoàn thành; chọn công pháp; 4 vật phẩm | Hướng dẫn luyện thử; tài nguyên và vật phẩm có vai trò riêng |
| [Cài đặt desktop](design/settings-desktop.svg) | Chữ 18 px; giảm chuyển động tắt; bản đã lưu | Mẫu chữ, chọn thiết lập, xuất/nhập |
| [Xem trước bản nhập](design/save-import-desktop.svg) | Bản hiện tại sau E07; file sau E05; chưa thay | So sánh và nhãn hành động rõ trước khi thay tiến trình |
| [Offline desktop](design/offline-desktop.svg) | Tự động từ kho trống sau E07; vắng 10 giờ | Giới hạn 8 giờ, có hoạt động 24 phút, +480 tu vi ròng; vẫn phàm nhân |
| [Offline mobile](design/offline-mobile.svg) | Cùng snapshot, rộng 360 px | Ba loại thời gian, số hiện có và nút toàn chiều rộng |
| [Kết thúc A](design/end-desktop.svg) | E08 đã hoàn thành; Ngưng Khí/1; nước 4, linh dịch 2, tu vi 480 | Giữ tài nguyên; xem lại/xuất save |
| [Trạng thái hoạt động](design/activity-states.svg) | 8 ví dụ độc lập | Lý do thiếu/chờ và hướng xử lý hợp lệ |
| [Trạng thái truyện/vật phẩm](design/story-bead-states.svg) | Thu gọn, lịch sử, trước nút cuối E08, trạng thái trống và biến thể châu | Phân biệt đang đọc/đã hoàn thành và hình của cảnh/vật phẩm |
| [Trạng thái lưu/offline](design/system-states.svg) | 6 ví dụ độc lập | Offline không hoạt động, lỗi ghi/nhập, phiên bản và quyền chơi |

Fixture trong [mockup-fixtures.json](design/mockup-fixtures.json) ghi trạng thái minh họa. Các snapshot là ví dụ riêng, không phải một lượt chơi đã được mô phỏng. Desktop/mobile có thể dùng chung snapshot; bảng trạng thái chứa nhiều ví dụ trên một bản vẽ.

## 5. Phạm vi duyệt và kiểm chứng

- Đã có bản vẽ C01/C03/C07/C08/C09/C10 cho thiếu đầu vào, đầy kho, đủ luyện thử, dừng, đọc tiếp/lịch sử, hình châu, offline, lỗi và quyền chơi.
- C11/C12/C13 bổ sung thiết lập đọc, so sánh bản lưu và kết quả cuối A. Luồng và nhãn hành động chi tiết nằm trong [UX-SCREENS-AND-STATES](UX-SCREENS-AND-STATES.md).
- Bảng trạng thái phục vụ duyệt từng thành phần; giao diện chơi chỉ hiện trạng thái phù hợp tại thời điểm đó.
- Bộ bản phác đủ tham khảo bố cục idle; trước khi ghép UI hiện hành cần biên tập màn chọn ba người, HUD/thế giới, tu tiên và lưu máy chủ theo mapping mục 0.
- Chữ 22 px, reflow, focus, thao tác bàn phím, tải lại, quyền chơi và hành vi lỗi cần kiểm chứng trong giao diện thật.

Kiểm tra hình tĩnh và dữ liệu thiết kế không thay cho chơi thử. Các nguồn hình game vẫn theo ngân sách A và trạng thái sản xuất trong catalog.

## 6. Chân dung nhân vật — C14 theo vai hiện hành

[Ba chân dung UI](design/characters/core-ui-v1/index.html) là gói thử đầu: 512 px lưu ART, 160 px hội thoại, 64 px danh sách; hình mới chờ đánh giá. Có alpha, PNG/master và WebP giao web; [manifest](design/characters/core-ui-v1/manifest.json) ghi trang phục/mốc.

- Hội thoại: ảnh 160 × 160 cạnh tên nhân vật và lời thoại; màn nhỏ có thể xếp ảnh/tên phía trên, không thu nhỏ chữ để giữ ảnh.
- Danh sách: thumbnail 64 × 64 với tên/nhãn vai trò. Giữ toàn khung vuông để không cắt tóc; chưa dùng mask tròn.
- Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển đều là lựa chọn chơi từ đầu. UI đang điều khiển dùng đúng danh tính/trạng thái người đã chọn; nhiều tài khoản chọn cùng người vẫn có ID/biệt danh và tiến trình riêng.
- Portrait/cảnh truyện dùng đúng trang phục và trạng thái nguồn: bản xám không thay bản đỏ/đồ thường; Tư Đồ Nam giữ nhận diện linh thể; Lý Mộ Uyển dùng biến thể phù hợp cảnh. Nguồn ART hoặc thời điểm xuất hiện trong tuyến nguyên tác không là cổng khóa lựa chọn gameplay.
- Tên vẫn có mặt khi hình chưa tải/thiếu; trạng thái chưa mở dùng hình trống theo luật nội dung.
- [Trang xem](design/characters/core-ui-v1/index.html) có nền giấy/tối và ví dụ chọn nhân vật để đối chiếu. Đây là thiết kế thành phần, chưa là hội thoại online đã tích hợp.
