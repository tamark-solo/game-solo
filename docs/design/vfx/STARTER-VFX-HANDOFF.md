# Bàn giao skill/VFX nhập môn và nâng cấp

**Liên hệ GDD 0.28:** ba nhân vật Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển chọn từ đầu, cùng Hằng Nhạc–Ngưng Khí và phân hóa từ Trúc Cơ. Bộ VFX này dùng Vương Lâm hướng Đông làm mẫu thi triển; quyền mở skill, socket/pose từng actor và luật combat cần tích hợp riêng. Thư viện năm cảnh giới đã có ART, gameplay hiện chưa chạy các cảnh giới này.

Đợt ART P1–P5 đã kết thúc ngày **07/10/2026** theo yêu cầu chủ dự án. Chốt ba nhánh Kiếm/Lôi/Phong qua Ngưng Khí, Trúc Cơ, Kết Đan, Nguyên Anh và Hóa Thần: **15 skill, 646 PNG RGBA rời, 76 atlas**, tất cả đã được chấp nhận. Các con số gồm frame dùng lại, không phải số hình độc nhất.

[Tải bộ chung được duyệt 3.0.1](releases/hoa-than-kit-3.0.1.zip) · [Checksum](releases/hoa-than-kit-3.0.1.sha256) · [Thư viện xem và tải](skill-library.html) · [Inventory 15 gói](releases/starter-vfx-inventory-1.0.0.json).

## Bộ skill đã khóa

| Cảnh giới | Skill / gói tải riêng | PNG / atlas | Pack |
| --- | --- | --- | --- |
| Ngưng Khí | [Kiếm Khí](releases/skill-packs/r01-sword-1.0.0.zip) | 36 / 4 | 1.0.0 |
| Ngưng Khí | [Lôi Ấn](releases/skill-packs/r01-thunder-1.0.0.zip) | 42 / 5 | 1.0.0 |
| Ngưng Khí | [Ngự Phong Bộ](releases/skill-packs/r01-wind-1.0.0.zip) | 36 / 4 | 1.0.0 |
| Trúc Cơ | [Ngự Kiếm](releases/skill-packs/r02-sword-1.0.1.zip) | 50 / 6 | 1.0.1 |
| Trúc Cơ | [Liên Lôi Ấn](releases/skill-packs/r02-thunder-1.0.1.zip) | 44 / 5 | 1.0.1 |
| Trúc Cơ | [Hồi Phong Bộ](releases/skill-packs/r02-wind-1.0.1.zip) | 38 / 4 | 1.0.1 |
| Kết Đan | [Kiếm Luân](releases/skill-packs/r03-sword-1.0.1.zip) | 50 / 6 | 1.0.1 |
| Kết Đan | [Lôi Hạch](releases/skill-packs/r03-thunder-1.0.1.zip) | 40 / 5 | 1.0.1 |
| Kết Đan | [Phong Luân](releases/skill-packs/r03-wind-1.0.1.zip) | 40 / 4 | 1.0.1 |
| Nguyên Anh | [Kiếm Linh Ảnh](releases/skill-packs/r04-sword-2.0.1.zip) | 56 / 7 | 2.0.1 |
| Nguyên Anh | [Linh Ảnh Lôi Ấn](releases/skill-packs/r04-thunder-2.0.1.zip) | 54 / 7 | 2.0.1 |
| Nguyên Anh | [Linh Ảnh Phong Bộ](releases/skill-packs/r04-wind-2.0.1.zip) | 46 / 5 | 2.0.1 |
| Hóa Thần | [Ý Cảnh Kiếm](releases/skill-packs/r05-sword-3.0.1.zip) | 38 / 5 | 3.0.1 |
| Hóa Thần | [Ý Cảnh Lôi](releases/skill-packs/r05-thunder-3.0.1.zip) | 40 / 5 | 3.0.1 |
| Hóa Thần | [Ý Cảnh Phong](releases/skill-packs/r05-wind-3.0.1.zip) | 36 / 4 | 3.0.1 |

R05 source **3.0.0** giữ nguyên hình V3 đã xem; pack **3.0.1** bổ sung ghi nhận duyệt. Payload của cả ba gói mới trùng từng byte với pack 3.0.0. [Hồ sơ duyệt Hóa Thần](releases/hoa-than-approval-3.0.1.json); library và PACK-MANIFEST là trạng thái duyệt hiện tại. Source metadata ghi trạng thái tại lúc sản xuất, được giữ nguyên để truy nguồn.

## Nhận và sử dụng

ZIP riêng chứa một skill, source/prompt, PNG sequence, atlas, JSON và presentation helpers; không chứa web preview. Giữ cấu trúc folder để các import tương đối hoạt động. ZIP chung có source và preview cả năm cảnh giới, các bản ART lịch sử và kiểm tra hồi quy; không lồng ZIP từng skill. Khi tải riêng, dùng bảng trên hoặc thư viện workspace gốc. ZIP chung có 1032 PNG / 123 atlas vì giữ lịch sử; thư viện hiện hành chỉ có 646 / 76.

Giải nén ZIP chung, chạy `python serve-preview.py` trong thư mục giải nén và mở `http://127.0.0.1:4185/skill-library.html`. Nếu cổng 4185 đang phục vụ workspace khác, dừng server đó rồi chạy bản giải nén khi cần xem đúng bản bàn giao. Không tự khởi chạy hoặc dừng server của nhóm phát triển trong bước đóng gói này.

Mỗi skill: `frames/<clip>/001.png` là nguồn chính; `clips.json` chứa FPS, frame holds, anchor và atlas rect; `skill.json` chứa timeline/events/hợp đồng host; `source/`, `prompts/`, `provenance.json` lưu nguồn sinh. Atlas là output build. Artist sửa frame rời rồi chỉ chạy `pack-atlases.mjs`; không chạy lại initial extraction/merge đè frame đã sửa. Repack cần Node và Sharp; xem bộ hồ sơ theo cảnh giới ở README.

## Tiêu chí giữ khi tích hợp

- Frame-by-frame 24 FPS, frame tác giả từ 1; event độc lập với FPS render.
- Vương Lâm chibi hướng đông, body tối đa 80 world px. World 960×640 orthographic; zoom 1×/2×/4×, DPR tối đa 2. Viewport nhỏ cắt vùng nhìn. Character nearest, FX linear, alpha blend thường.
- Impact theo điểm hit host xác nhận, không phụ thuộc bia đá/vật liệu, dùng cho nhân vật, quái, boss và PvP. Boss đổi anchor, không tự phóng artwork.
- Host/server sở hữu damage, hitbox, projectile pose, actor position và movement/arrival. VFX chỉ trình bày, không gây damage, tạo actor/AI hoặc miễn nhiễm. Kiếm phụ, phù và tàn ảnh không tạo hit bổ sung.
- Hóa Thần theo ngọc sáng, khí lụa, sét tím và phù vàng. Camera feedback mặc định tắt; bật tùy chọn không được dừng combat clock. Echo Phong chỉ dùng snapshot host có timestamp, alpha .12/.06, sau thân và tan sau arrival.

## Kiểm chứng và phạm vi kết thúc

**87 kiểm tra tự động đạt** trong workspace bàn giao. Các gói riêng đã kiểm CRC, SHA-256 và toàn bộ payload; gói chung được kiểm sau khi đóng archive. Giữ nguyên các archive lịch sử. Có render atlas cục bộ ở 1×/2×; chủ dự án đã xem và chấp nhận. Tương tác browser chưa xác minh tự động.

Đã kết thúc sản xuất và đóng gói ART của đợt này. Chưa tích hợp client/server, SFX/icon, toàn bộ hướng nhân vật, crowd LOD hoặc benchmark. Các việc này là hạng mục riêng; không tiếp tục sản xuất cảnh giới cao hơn trong đợt đã đóng.
