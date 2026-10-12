# Hằng Nhạc Vân Ngọc · chuẩn ART đã lưu

**Owner chốt ngày 12/10/2026:** “được rồi lưu lại map này làm chuẩn và dọn những map cũ đi giúp tôi.” Chuẩn mới là [V2 20 vùng](design/world/hang-nhac-van-ngoc-detail-v2/README.md), đúng ảnh đã hiển thị trong game. [Duyệt theo hash](design/world/hang-nhac-van-ngoc-detail-v2/approval.json) ghi riêng phạm vi **nền bake làm chuẩn ART**.

| Mục | Giá trị |
| --- | --- |
| Master | `design/world/hang-nhac-van-ngoc-detail-v2/regions/map-master.png` |
| SHA-256 master | `79b1935aeea27344967d573f52f13935ff832d08342b675e22493f6f1ad6d793` |
| WebP lossless | `design/world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp` |
| SHA-256 web | `4388a703f7ee0d09db435864400b4ba69d06feb2ac31bde685efb174ddfd2dd8` |
| Kích thước / camera | 3072 × 2048 / 1× |
| Người / chân | 64 × 96 / (32,88), pixel giữ nguyên |
| Nguồn chọn | 20 vùng native 704 × 704, cùng mẫu nét R01 |

Mở [map chuẩn trong game](http://127.0.0.1:5173/hang-nhac.html?mapArt=van-ngoc-detail); menu hiển thị **Vân Ngọc · chuẩn ART**. Lấy bản này làm mẫu nét, vật liệu, màu, tỷ lệ và bố cục thị giác cho các asset tiếp theo. Concept gốc vẫn được giữ vì dùng chung với web/UI. Scene layered hiện hành và dữ liệu Editor/navigation tiếp tục phục vụ release; không thay bản owner đã lưu hoặc chuyển quyền duyệt này sang alpha mái/tán, collider hay asset rời.

## Nguồn đầy đủ và cách dựng lại

Gói V2 giữ master/WebP, 20 raw được chọn, guide/layout/prompt/metadata, registered images, R01, phép đo và hồ sơ kiểm hình. Đầu vào bố cục từ V1 được chuyển **nguyên byte** vào `regions/inputs/layout-master.png`; các manifest hiện dùng đường dẫn cục bộ. Bản manifest trước chuyển nguồn nằm trong `regions/provenance/` để tra lịch sử.

Helper đo chung là `scripts/map-sector-registration.py`; wrapper 20 vùng giữ nguyên gate và phép lấy mẫu một lượt. Đã căn/ghép lại từ gói tự chứa, hash master/WebP không đổi. Sync kiểm hash nguồn và duyệt owner trước khi sao chép; một ảnh mới hoặc một phạm vi rộng hơn không thể kế thừa duyệt của bản này. Metadata raw/registration/composition giữ trạng thái tạo/kiểm ban đầu; duyệt owner nằm ở `approval.json` và được áp dụng theo hash ảnh.

## Đợt dọn bản cũ

[Biên bản bền](data/hang-nhac-van-ngoc-baseline-cleanup-2026-10-12.json) ghi **119 file, 178952155 byte (khoảng 170,7 MiB)** đã rời workspace:

- Bản Vân Ngọc sáu khu V1 và các bản sửa/ảnh đối chiếu của nó.
- Bản public/build V1 và nghiên cứu sampling cũ.
- Sáu tool riêng của V1; phần đo còn dùng đã tách sang helper chung.
- Ba raw D13/D13-v2/D16 bị loại, giữ D13-v3 và D16-v2 trong nguồn chuẩn.

Kho phục hồi: `C:\Users\AnhLT\Documents\GM\game-solo-map-archive\2026-10-12-van-ngoc-baseline`. Các file được **chuyển ra ngoài dự án, chưa xóa vĩnh viễn**. Hash/bytes của từng file trong kho khớp inventory. Sau phần đầu vào bố cục được chuyển vào V2, payload workspace giảm khoảng **158,9 MiB**, chưa tính vài tài liệu/metadata mới. Build không đọc kho này và không phục hồi tool/map cũ.

Giữ nguyên 200 file được đối chiếu hash, gồm nguồn ảnh chuẩn, dữ liệu authored-map, navigation, release, nguồn layered/Editor và concept dùng chung. Không dùng DB thật hoặc sửa draft trình duyệt. Lệnh xóa hàng loạt ban đầu bị kiểm duyệt tự động từ chối với “blocked by policy”; đợt dọn hoàn tất bằng chuyển vào kho phục hồi ngoài workspace.

## Kiểm sau lưu/dọn

Đã qua build, TypeScript/boundary, self-test đăng ký/ghép, 5 unit test duyệt theo hash/phạm vi và 11 nhóm browser map-art trên fixture/GPU của máy. Browser kiểm cả ba ART, chuyển nền giữ room/profile, minimap/nhật ký, reload, mobile và nhân vật native. Nguồn runtime/owner map giữ nguyên hash. HUD/layer 14 nhóm đã đạt ở lượt tích hợp cùng renderer trước đó.

Mái/tán alpha, nền sạch và footprint theo ART mới vẫn cần công việc riêng theo [kế hoạch asset](HANG-NHAC-VAN-NGOC-ASSET-PLAN.md). Không tạo thêm ART hoặc mở gameplay trong đợt lưu/dọn này.
