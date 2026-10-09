# Bộ kỹ năng Ngưng Khí · nguồn 1.1.0 / duyệt 07-10-2026

Kiếm Khí 1.0.0 đã được chủ dự án duyệt mỹ thuật/preview và đóng release ngày 07/10/2026. Lôi Ấn và Ngự Phong Bộ dùng cùng pipeline PNG sequence → atlas → timeline → preview. Chủ dự án đã xem bộ P2, nhận xét khá tốt và yêu cầu đóng gói/nâng cấp. Cả ba R01 được ghi duyệt trong library và manifest ZIP từng skill; ZIP chung 1.1.0 là snapshot lịch sử và giữ nguyên metadata lúc xuất. [Thư viện hiện hành 15 skill](skill-library.html) có các ZIP mới và nâng cấp Trúc Cơ.

## Nguồn và cách dùng

| Chiêu | Nguồn chính | PNG / atlas | Neo nhân vật |
| --- | --- | --- | --- |
| Kiếm Khí | `frame-by-frame-r01/` | 36 / 4 | canvas 96×96, chân 48,88 |
| Lôi Ấn | `r01-thunder-v1/` | 42 / 5 | canvas 96×96, chân 48,88 |
| Ngự Phong Bộ | `r01-wind-v1/` | 36 / 4 | canvas 112×96, chân 56,88 |

Tổng bộ R01 là 114 PNG, 13 atlas; từng frame trong mỗi clip có nội dung khác nhau. Mỗi chiêu có 12 pose Vương Lâm hướng đông; 24 FPS, có hold theo pose. Thân đứng cao tối đa khoảng 80 world px; crouch/stride thấp theo tư thế. Canvas rộng bổ sung khoảng trống cho tay/tóc, không tăng thân hoặc hitbox. Skill dùng cỡ world cố định; tại zoom 1× một world unit bằng một CSS px. Viewport nhỏ cắt frustum theo camera game 960×640, không co toàn bộ cảnh vào màn hình.

`frames/<clip>/001.png` là nguồn chỉnh sửa chính sau extraction. `source/` giữ sheet nguyên gốc, kể cả bản thử; `prompts/` giữ câu lệnh tạo và chỉnh ART. `clips.json` ghi frame, hold, anchor, source rect, commonScale và atlas rect. `skill.json` ghi timeline, lớp, socket, sự kiện và hợp đồng với combat/movement.

Tạo/chỉnh raster bằng **imagegen tích hợp**. Node + Sharp chỉ cắt ô, đăng ký neo, resize đồng nhất từng clip, xuất PNG và pack; không vẽ lại VFX. Mỗi clip dùng một scale chung để frame đầu/cuối giữ nhỏ theo hình đã vẽ, không phóng lớn tàn dư cho đầy ô.

```powershell
# Chỉ dùng khi xuất lần đầu vào phiên bản mới: sẽ thay PNG trong thư mục đích.
node docs/design/vfx/production/export-sequences.mjs docs/design/vfx/r01-thunder-v1

# Build thường xuyên từ các PNG đã chỉnh; không thay PNG nguồn.
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r01-thunder-v1
node docs/design/vfx/production/pack-atlases.mjs docs/design/vfx/r01-wind-v1

node --test docs/design/vfx/production/p2.test.mjs
python docs/design/vfx/serve-preview.py
```

Atlas có 4 cột, padding trong 2 px, chưa extrude mép. Render atlas bằng đúng rect; nhân vật nearest, VFX linear, tránh tạo mipmap tràn sang ô cạnh. [Preview Lôi](http://127.0.0.1:4185/ngung-khi-kit.html?family=thunder) và [preview Phong](http://127.0.0.1:4185/ngung-khi-kit.html?family=wind) có bước từng frame, kiểm alpha/zoom/khung nhỏ, inspector PNG, xuất khung. [Kiếm Khí](http://127.0.0.1:4185/kiem-khi-preview.html) giữ nguyên chuỗi đã duyệt.

## Timeline / gameplay

**Kiếm:** F07 xuất projectile, hit nhận từ host; không chốt damage vào một frame cố định bất kể khoảng cách. Hướng bay và điểm chạm do host cung cấp.

**Lôi:** F01 kết ấn, F07 đặt dấu trận, F09 mở chưởng/release, F15 hồi động tác, F18 kết thúc pose. Trong preview, xác nhận hit mặc định F13: bolt 01–02 dẫn xuống, lóe chạm ở F15; đổi delay để kiểm. Khi tích hợp, damage xảy ra theo combat/server tại thời điểm xác nhận, phần dẫn sét 2 tick chỉ là trễ trình bày 83 ms. Phải đánh giá độ trễ này khi playtest PvP; có thể đưa bolt tới frame chạm ngay khi nhận hit ở phiên bản sau. Không có hit thì không phát bolt/impact. Trận là lớp báo vùng mang tính minh họa, không phải hurtbox AoE đã được duyệt.

**Phong:** F01 lấy đà, F05 yêu cầu movement, preview lướt 160 world px đến F11, F11 thu động tác, F15 kết thúc pose. Thực tế dùng snapshot movement; adapter `setActorFoot()` chỉ ghi vị trí để vẽ. `confirmArrival()` tạo vòng gió tại điểm đáp thật. Hai tàn ảnh lấy các pose đã vẽ cách 2/4 tick, là lớp trang trí; không nhân hit và không cấp quyền né/miễn nhiễm. Độ dài lướt/tốc độ/đường đi ở preview chưa là thông số chiến đấu.

`production/p2-controller.mjs` là adapter trình bày tham khảo, mỗi actor một controller; giữ pool có giới hạn, dedupe resolve/arrival, không có hàm damage hoặc tự di chuyển actor. `beginCast`, `setActorFoot`, `confirmHit`, `confirmArrival`, `update`, `endCast`, `dispose` là các điểm kết nối. Pool full bỏ effect mới; host cần theo dõi trường hợp này khi benchmark. Cast hướng đông; xoay nguyên sprite nhân vật sang hướng khác không phải bộ pose đã duyệt.

VFX hit dùng linh quang, điện hoặc khí thuần; không chứa bụi đá/mảnh bia. Preview PvP dùng sprite thử; quái/boss dùng vùng chạm để kiểm anchor. Ground FX riêng của Lôi/Phong chỉ phủ trên nền, không mặc định phá vật liệu.

## Release và các mốc đã hoàn thành

- **P1:** Kiếm Khí art đã duyệt; release `releases/kiem-khi-r01-1.0.0/` có ZIP và SHA-256 từng file. Chỉnh tiếp vào version mới, không tái xuất đè nguồn đã duyệt.
- **P2:** Lôi Ấn + Ngự Phong Bộ đã sản xuất/chấp nhận. Bộ ba R01 xuất chung ở `releases/ngung-khi-kit-1.1.0.zip`, giữ snapshot nguồn tại mốc P2.
- **P3 · Trúc Cơ:** Ngự Kiếm / Liên Lôi Ấn / Hồi Phong Bộ đã chấp nhận, 132 PNG / 15 atlas; xem [hồ sơ](TRUC-CO-KIT.md).
- **P4 · Kết Đan:** Kiếm Luân / Lôi Hạch / Phong Luân đã chấp nhận, 130 PNG / 15 atlas; xem [hồ sơ](KET-DAN-KIT.md).
- **P5 · Nguyên Anh → Hóa Thần:** cả R04/R05 đã chấp nhận và đóng; thư viện hiện hành 15 skill/646 PNG / 76 atlas. Xem [bàn giao](STARTER-VFX-HANDOFF.md).

`library.json` là mục lục và trạng thái; `releases/ngung-khi-kit-1.1.0.manifest.json` kiểm SHA-256 của bộ giao. Tên tiến hóa là thiết kế game, không khẳng định thuật pháp nguyên tác. Chưa tích hợp client/server, chưa đủ các hướng, chưa có file SFX hoặc benchmark MMO nhiều người. Chỉ asset có đánh giá thực tế mới chuyển sang runtime-ready.


## Kết quả kiểm bản giao tại mốc P2

20 kiểm tra tự động đã qua. 16 ảnh kiểm được render từ atlas cục bộ theo timeline/anchor, có nhãn phương pháp trên ảnh. Kiếm Khí được đối chiếu SHA-256 với bản đóng release; PNG nguồn không thay sau khi pack. Quyền mở localhost bằng trình duyệt bị từ chối nên chưa kiểm tương tác preview P2; không coi ảnh kiểm cục bộ là screenshot hoặc xác nhận trình duyệt.
