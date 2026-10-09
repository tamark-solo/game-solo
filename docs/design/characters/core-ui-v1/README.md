# Chân dung UI — bộ ba trọng tâm v1

Mở [trang xem](index.html) trực tiếp trong trình duyệt. Trang có bản 512 px để đối chiếu, 160 px cho hội thoại, 64 px cho thumbnail; đổi nền giấy/tối, PNG/WebP và chọn nhân vật trong ví dụ hội thoại.

**Phạm vi:** một biểu cảm cơ bản mỗi nhân vật, tổng ba chân dung. Hình mới **chờ đánh giá**. Nhận diện nguồn Vương Lâm/Lý Mộ Uyển đã chấp nhận; Tư Đồ Nam đứng v3 tạm chấp nhận làm chuẩn thiết kế. Đây là gói portrait trước chibi, chưa tích hợp UI gameplay. [GDD 0.28](../../../GDD.md) cho chọn bộ ba từ đầu; Lý Mộ Uyển native-v5 đã chọn và cần đồng bộ portrait.

## Hình, nguồn và prompt

Ba chân dung vẽ bằng **imagegen tích hợp**, dùng đúng bảng nhận diện riêng của mỗi người làm tham chiếu. Prompt chính xác được lưu cạnh ảnh nguồn.

| Chân dung | Nhận diện nguồn | Hình mới | Prompt |
| --- | --- | --- | --- |
| Vương Lâm áo xám, nét chú ý | [V2](../wang-lin-initiation-v2.png) | [PNG nguồn](portraits/wang-lin/source-v1.png) | [Prompt](portraits/wang-lin/source-v1.prompt.txt) |
| Tư Đồ Nam linh thể, cười tự tin | [Đứng v3](../core-trio-v1/situ-nan-spirit-standing-v3.png) | [PNG nguồn](portraits/situ-nan/source-v1.png) | [Prompt](portraits/situ-nan/source-v1.prompt.txt) |
| Lý Mộ Uyển áo tím, tập trung | [V1](../core-trio-v1/li-muwan-early-identity-v1.png) | [PNG nguồn](portraits/li-muwan/source-v1.png) | [Prompt](portraits/li-muwan/source-v1.prompt.txt) |

Nguồn sinh ra thực tế **1.254 × 1.254 px**, giữ nguyên để truy ART. Bản 512/160/64 lấy mẫu toàn bộ khung vuông với cùng bố cục; không vẽ lại mặt/tóc bằng code.

Tư Đồ Nam được cắt ở vai/ngực trên, phía trên vùng ngực khuyết. Chân dung này dùng nhận diện linh thể đứng; không thể hiện một thân thể đã phục hồi.

## Native và dung lượng

Mỗi người có ba cỡ PNG và ba cỡ WebP trong thư mục `portraits/<nhân vật>/native-v1/`: **9 PNG + 9 WebP** tổng. PNG giữ làm bản ART trung gian; WebP là bản xem/tải mặc định.

| Nhân vật | WebP 512 | WebP 160 | WebP 64 |
| --- | --- | --- | --- |
| Vương Lâm | 93.8 KB | 13.7 KB | 3.5 KB |
| Tư Đồ Nam | 94.3 KB | 13.8 KB | 3.5 KB |
| Lý Mộ Uyển | 98.4 KB | 13.5 KB | 3.4 KB |

Mục tiêu giao web: 512 ≤120 KB, 160 ≤24 KB, 64 ≤8 KB; KB ở bảng tính theo 1.024 byte. Chất lượng tham số WebP 0,92. Alpha của chín WebP khớp PNG trong lần kiểm tra; thay đổi màu do nén nhỏ và được xem trên nền sáng/tối. PNG 512 lớn hơn ngân sách tải, được giữ làm master, không là file mặc định của trang xem.

[Manifest](manifest.json) ghi ID, mốc, trang phục, input, đường dẫn, kích thước/dung lượng và trạng thái. [Báo cáo](verification.json) ghi alpha/cạnh trong suốt, đối chiếu nén, hashes và kiểm tra trình duyệt.

## Quy tắc dùng trong UI

- Vương Lâm là lựa chọn người chơi từ đầu theo GDD hiện hành. Áo xám dùng đúng trang phục/cảnh; áo đỏ/đồ thường cần chân dung riêng.
- Tư Đồ Nam chọn được từ đầu; truyện châu/cảnh cá nhân vẫn theo mốc tiết lộ. Crop đầu/vai không thay bộ chibi đứng/lướt; dáng ngồi giữ riêng cho cảnh tu luyện.
- Lý Mộ Uyển chọn được từ đầu; portrait áo tím v1 thuộc nhận diện trước chibi. Cần đồng bộ mặt/tóc/lavender của native-v5; cảnh gặp áo đỏ dùng biến thể riêng, năng lực gameplay theo thiết kế hệ thống.
- Cả ba lựa chọn chính đều có thể chọn từ đầu trong thiết kế; NPC/hồ sơ truyện và năng lực mở theo luật nội dung. Có file ART không đồng nghĩa gameplay đã tích hợp.
- Dùng khung vuông toàn ảnh; tránh mask tròn cắt tóc/búi/đuôi. Giữ tên và trang phục cạnh chân dung. 64 px dùng nhận diện, 160 px dùng đọc biểu cảm.

## Xuất và xem lại

[export-portraits.ps1](export-portraits.ps1) chỉ resample ảnh source có alpha bằng System.Drawing. Ví dụ xuất một phiên bản mới:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/core-ui-v1/export-portraits.ps1 -ManifestPath docs/design/characters/core-ui-v1/manifest.json -OutputVersion native-v2
```

Script dừng nếu output version đã có. Khi đổi version, cập nhật manifest/trang xem trước khi dùng. Không cần chạy script/server để mở trang xem.

[review-portraits.py](review-portraits.py) dùng Chrome headless cục bộ để encode WebP và kiểm tra; chỉ mở một browser/profile riêng. Lệnh xem lại các file đã có:

```powershell
python docs/design/characters/core-ui-v1/review-portraits.py --snapshot-version v2
```

Lần sản xuất đầu dùng `--encode-webp`; dừng nếu WebP đã có. Python chỉ chuyển dữ liệu ảnh do trình duyệt encode sang file, không sửa/vẽ hình. Đường native-v1 của công cụ xem là cấu hình gói hiện tại, cần đổi khi sản xuất version mới.

Đã kiểm tra ba bộ 512/160/64, chọn định dạng/nhân vật/nền, desktop và mobile 360 px; không có lỗi JS ghi nhận. Ảnh xem: [desktop](preview-desktop-v1.png), [nền tối](preview-desktop-dark-v1.png), [360 px](preview-360-v1.png). Kiểm tra kỹ thuật không tự duyệt nhận diện ART.

## Động tác tiếp theo

[Kế hoạch động tác](../../../CORE-CHARACTER-MOTION-PLAN.md) và [dữ liệu](../../../data/core-character-motion-plan.json) ghi **60 frame chibi đang có**, đủ đứng/đi hoặc lướt bốn hướng; dự toán thêm **16** thành **76** cho lơ lửng tại chỗ/luyện đan, phần thêm chưa vẽ. Gói này chỉ tạo portrait; ngân sách 36/100/64 trước là lịch sử, không là hiện trạng motion. Ưu tiên vẫn là map.
