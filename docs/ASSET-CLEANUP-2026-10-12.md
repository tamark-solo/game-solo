# Dọn asset đã thay thế · 12/10/2026

Theo yêu cầu owner sau khi merge, đã dọn **211.156.226 byte, khoảng 201,4 MiB payload cũ**. [Biên bản bền](data/asset-cleanup-2026-10-12.json) giữ đủ 900 đường dẫn gốc, dung lượng, SHA-256 trước khi xóa, lý do và kết quả từng mục; không phụ thuộc các log tạm trong `artifacts/`.

| Nhóm | File gốc | Dung lượng gốc | Phạm vi |
| --- | ---: | ---: | --- |
| Nhân vật | 14 | 28.022.455 byte | 11 PNG gait bị loại/đã có bản thay thế; 3 sheet cast đã được bản v2 thay thế |
| UI | 98 | 17.243.200 byte | HUD 01, ảnh review HUD 02, Vân Ngọc Cô Đọng và Dao System cũ, builder/sync chỉ phục vụ các gói này |
| VFX | 788 | 165.890.571 byte | Payload R04 V1/R05 V1–V2; 8 bitmap animatic/capture Kiếm cũ |

**Cách đếm:** 894 đường dẫn gốc không còn; 6 README R05 đã đổi thành thông báo chuyển phiên bản. Ba thông báo README mới cho R04 được giữ thêm. Số byte trên là payload gốc đã bỏ/thay, chưa trừ tài liệu và thông báo mới; không phải mức giảm chính xác toàn checkout hoặc dung lượng lịch sử Git. Các gói cũ có thể tra lại từ Git, không tạo thêm ZIP raster trùng lặp.

Mỗi đợt đã ghi path/byte/hash trước khi xóa, kiểm đường dẫn tuyệt đối trong workspace và chọn đúng file đã thay thế. Đã kiểm lại 900 đường dẫn là duy nhất và tình trạng vắng mặt/thông báo thay thế khớp biên bản.

## Nguồn được giữ

[Thư viện tùy biến nhân vật](design/characters/character-customization-library-v1/README.md) giữ nguyên bảy gói đã được yêu cầu lưu, năm áo/ba khí, ảnh nhận diện Vương Lâm và ZIP nguồn sáu gói cũ. Hash 27 file được checker xác nhận; ba khí được duyệt concept tĩnh, chưa được suy thành duyệt animation/production.

Nguồn locomotion, 36 binding cast, quest motion, PNG được chọn, prompt, frame/atlas, palette và helper xuất còn đầy đủ. Sau dọn, 11 hash sheet cast được chọn giữ nguyên và 12 nguồn gait đang chọn còn đủ. Những gói lịch sử vẫn làm đầu vào cho exporter, palette, preview hoặc test hiện hành được giữ để không làm gãy việc dựng lại asset.

HUD 03 Vân Ngọc, khí quang 02 và icon atlas HUD 02 mà HUD hiện hành sử dụng được giữ cùng nguồn. UI Vân Ngọc, màn nhân vật, title, hai chủ đề Đạo và 38 glyph SVG hiện hành còn nguyên. Xem [HUD desktop](DESKTOP-SKILL-HUD.md).

VFX giữ đủ **15 gói hiện hành, 646 frame, 76 atlas**: R01, R02/R03 V1, R04 V2, R05 V3. Đã đối chiếu 1.244 file giữ lại. Manifest và hash release lịch sử không đổi; `reusedFrom`/`previousEdition` là provenance, không là yêu cầu tải payload cũ. Xem [quy tắc dựng VFX sau dọn](design/vfx/CLEANUP-2026-10-12.md).

Map owner, 9 blocker, bậc thang, camera và hợp đồng người 64 × 96/neo (32,88) không đổi. Không ghi DB thật hoặc draft trình duyệt. ART đang chờ đánh giá vẫn giữ trạng thái chờ; build/test không cấp quyền duyệt.

## Kiểm chứng và giới hạn

[Kiểm chứng tổng hợp cùng đợt hồi phục](data/recovery-and-cleanup-verification-2026-10-12.json): build/typecheck/boundary và 157 unit test đạt; lessons, sect, character, reload, R01, HUD/layer đều đạt trên fixture. Catalog hợp lệ với 56 mục; 44 cảnh báo nội dung chưa phát hành giữ nguyên. Public và dist không còn bản sao các pack đã xóa. Cache cài đặt và asset sao chép riêng cho test của đợt này cũng đã dọn; giữ DB fixture, báo cáo và ZIP nguồn được bảo lưu.

Reload từng timeout khi SDK bị trễ, sau đó hai lần chạy nguyên bản đều đạt đủ 8 nhóm. Kiểm R01 đã sửa cách đo MP tại transaction cast thay cho giá trị sau screenshot: hồi MP 12/giây sau 2 giây có thể xảy ra giữa các cast. Chi phí 10/25/10 vẫn được kiểm bằng receipt và thời gian server; gameplay không đổi.

Thư viện nhân vật đạt: 7 gói, 8 diện mạo, 3 concept đã chốt và ZIP nguồn khớp hash. UI browser đạt cả sáu cấu hình: desktop 1366 × 900/mobile 390 × 844 × ba theme; 38 thẻ/114 glyph, 15 ảnh tải được, không tràn ngang, không lỗi JS/request. Kiểm này dùng Vite fixture riêng, không backend, plugin Editor hoặc storage thật.

Đã phục hồi byte xuống dòng của **97 file text VFX** về đúng Git HEAD và SHA-256 đã khóa. Log bổ sung R01/R02 kiểm 302 file, phục hồi 57 file; đây là phần nằm trong 97 file, không cộng hai số. Mỗi đường dẫn/hash trước–sau và bằng chứng được giữ trong biên bản; danh sách lệch checkout R03 còn lại là rỗng.

Map checkout cũng được trả về byte LF đúng bản commit: SHA-256 `b8571377613bf0b83997fd7087a4301955300f5ab2f3627ab9837988fb3a8256`. Nội dung không đổi và `git diff -- docs/data/authored-maps` rỗng. Không sửa hash khóa để vượt kiểm tra.

Bộ kiểm VFX hiện hành đạt **53/54**. Một lỗi đã có từ trước nằm ở `frame-by-frame-r01/PIPELINE.md`: release cũ khóa nội dung trước thay đổi tại commit `e481c0975de0379430a93634059fb88eb83abfad`. Chuẩn hóa CRLF không thể sửa khác biệt nội dung này. Giữ nguyên tài liệu hiện hành, manifest release và điều kiện kiểm hash; biên bản ghi hash mong đợi/hash checkout/hash Git để tiếp tục xử lý bằng quyết định release riêng.
