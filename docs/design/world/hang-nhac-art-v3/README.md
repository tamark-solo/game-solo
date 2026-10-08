# Toàn map Hằng Nhạc — nền v3

Ngày 08/10/2026. Toàn nền v3 đã được chủ dự án chấp nhận và yêu cầu commit; nguồn tạo bằng **imagegen tích hợp**. Đây là mốc duyệt mỹ thuật, chưa tích hợp game hoặc kiểm chứng map vận hành.

Mở [bản xem toàn map](index.html), chọn **Toàn Hằng Nhạc** để xem bố cục, hoặc chọn địa điểm rồi **Xem khu ở 1×**. Bấm nền để đặt Vương Lâm, dùng WASD/mũi tên hoặc các nút dịch để xem camera. Khung hẹp giữ cỡ nhân vật và cắt vùng nhìn.

## Phạm vi toàn map

- Sơn môn phía Nam dùng chung tiếp dẫn và xuất hành.
- Sân môn phái ở giữa, giữ nền trống cho di chuyển và đọc VFX.
- Đình thổ nạp ở Tây Bắc, thông cổ và hồ nhỏ làm dấu nhận diện.
- Sân luyện thuật phía Đông, giá vũ khí/bia tập nằm ở rìa.
- Ngoại vi/hậu sơn phía Tây Nam, đường vòng nối về đình.
- Chuẩn bị/luyện hóa phía Đông Nam, bàn dược liệu và lò đặt ở mép sân; đường vòng nối sân luyện.
- Lối vào khảo nghiệm ở Bắc, trục giữa đi qua hai cánh chính điện. Đây là cửa vào; không phải nền arena HN10 riêng.

Cả bảy địa điểm nằm trên cùng world tham chiếu **2400 × 1800**. Các điểm xem trên tranh được quan sát thủ công; không thay tọa độ trong [blockout](../hang-nhac-layout-v1/layout.json), spawn, collider hoặc điểm tương tác đã duyệt.

## Nguồn và độ phân giải

Một tranh toàn cảnh mới vẫn chỉ đạt 1448 × 1086, thấp hơn world đề xuất. Vì vậy `full-map-style-reference.png` chỉ là tham chiếu bố cục/màu, không được dùng làm nền 1× trong bản v3.

Bốn vùng được vẽ mới từ các crop tham chiếu, có phần chồng mép. Mỗi nguồn **1448 × 1086** đặt vào vùng **1320 × 990** world px: khoảng **1,097 pixel nguồn/world px**, không phóng lớn ảnh nguồn ở camera 1×.

| Nguồn | Vùng world x/y/w/h | Prompt |
| --- | --- | --- |
| [Tây Bắc](northwest-native.png) | 0 / 0 / 1320 / 990 | [northwest](northwest.prompt.txt) |
| [Đông Bắc](northeast-native.png) | 1080 / 0 / 1320 / 990 | [northeast](northeast.prompt.txt) |
| [Tây Nam](southwest-native.png) | 0 / 810 / 1320 / 990 | [southwest](southwest.prompt.txt) |
| [Đông Nam](southeast-native.png) | 1080 / 810 / 1320 / 990 | [southeast](southeast.prompt.txt) |

Chồng mép ngang 240 px, dọc 180 px. Đợt ghép đầu có lỗi nối tại trục giữa, hoa văn sân, mái sơn môn và hai đường vòng. Năm phần này đã được vẽ sửa riêng bằng imagegen; mỗi nguồn **1536 × 1024** cho vùng **960 × 640** world px, tương đương **1,6 pixel nguồn/world px**.

| Nguồn sửa | Vị trí world x/y | Prompt |
| --- | --- | --- |
| [Đường vòng Tây](west-loop-repair.png) | 0 / 600 | [west-loop](west-loop.prompt.txt) |
| [Đường vòng Đông](east-loop-repair.png) | 1440 / 600 | [east-loop](east-loop.prompt.txt) |
| [Trục Bắc](north-axis-repair.png) | 720 / 0 | [north-axis](north-axis.prompt.txt) |
| [Sân giữa](courtyard-join-repair.png) | 720 / 515,2 | [courtyard-join](courtyard-join.prompt.txt) |
| [Sơn môn](gate-join-repair.png) | 720 / 1108,2 | [gate-join](gate-join.prompt.txt) |

[map-art.js](map-art.js) và [map-art.css](map-art.css) ghép nền trong bản duyệt. Các phần sửa chuyển mép 32 px; lựa chọn chuyển mép 24 px của bốn vùng chỉ để đối chiếu. Không dùng bộ lọc sharpen để tạo cảm giác có thêm chi tiết. Số vùng ART này không quyết định chunk streaming, số atlas hay cách tải map trong runtime.

[Ảnh toàn map 2400 × 1800](full-map-review-native.png) là **ảnh phẳng xuất từ bản ghép trong trình duyệt**, không chứa nhân vật/UI. Nó dùng duyệt toàn cảnh; nguồn vẽ độc lập vẫn là các PNG ở hai bảng trên. Không gọi đây là một ảnh toàn cảnh được imagegen vẽ trực tiếp ở 2400 × 1800.

[art-manifest.json](art-manifest.json) lưu kích thước thật, SHA-256, vị trí ghép, prompt và giới hạn. Các crop `ref-*` / `*-edit-target` cùng prompt được giữ để truy nguyên lần vẽ. Nguồn v1/v2 và bộ nhân vật/VFX không bị thay thế.

## Tỷ lệ và kiểm tra

Camera 1×: 1 world px = 1 CSS px. Body Vương Lâm R01 cao 80 px trong canvas 96 × 96, neo chân (48,88). Màn hẹp giảm vùng nhìn, không scale sprite. Dáng đứng chỉ dùng thử vị trí/camera; các nút dịch không phải animation đi bộ.

[verification.json](verification.json): kiểm tra bằng Chrome/Playwright đủ bảy khu, kích thước nguồn so với vùng world, chuyển toàn cảnh/camera, camera cố định/bám, bấm nền, phím dịch, thước 80, các lựa chọn mép ghép và màn 736/360/320 px. Không có lỗi script hoặc tràn ngang trong các khung kiểm tra. Ảnh `hn-z*-camera.png` và `camera-mobile-*` dùng kiểm tra trực quan cùng Vương Lâm.

Quan sát ART xác nhận toàn nền đủ bảy địa điểm, trục giữa và hai đường vòng; các lỗi ghép lớn đã được sửa. Chưa coi mọi mép/chi tiết là source sản xuất đã duyệt. Các bậc thang, lan can, tán cây và chân kiến trúc còn phải đo/tách theo vùng chân đi thật.

## Còn cần hoàn thiện trước vận hành

1. Hoàn thiện các chi tiết/mép nguồn cho sản xuất từ nền v3 đã chấp nhận; giữ tỷ lệ 1× khi kiểm tra.
2. Tách mặt đất, mái/cây/đạo cụ cao để xử lý che nhân vật. Hiện tất cả môi trường là background phẳng.
3. Khớp footprint thực tế với blockout, đặt vùng đi/collider và kiểm tra đường vòng bằng di chuyển thật.
4. Thử cả ba nhân vật và bộ R01 trong runtime; chưa kiểm tra combat, crowd, network, hitbox hoặc ngân sách render từ bản duyệt này.
5. Vẽ nền riêng cho sân luyện/khảo nghiệm cần phiên riêng, sau đó mới chốt đặc tả vận hành theo yêu cầu chủ dự án.

Prompt tham chiếu toàn cảnh: [full-map-native.prompt.txt](full-map-native.prompt.txt). Prompt cuối cho các asset được dùng là bốn prompt vùng và năm prompt sửa trong hai bảng trên. Chế độ sản xuất: **built-in imagegen**, không dùng CLI/API fallback.
