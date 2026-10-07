# Chân dung UI — bộ ba trọng tâm v1

Mở [trang xem](index.html) trực tiếp trong trình duyệt. Trang có bản 512 px để đối chiếu, 160 px cho hội thoại, 64 px cho thumbnail; đổi nền giấy/tối, PNG/WebP và chọn nhân vật trong ví dụ hội thoại.

**Phạm vi:** một biểu cảm cơ bản mỗi nhân vật, tổng ba chân dung. Hình mới **chờ đánh giá**. Nhận diện nguồn Vương Lâm/Lý Mộ Uyển đã chấp nhận; Tư Đồ Nam đứng v3 tạm chấp nhận làm chuẩn thiết kế. Đây là gói ART/GDD, không thay mốc xuất hiện hoặc vai người chơi.

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

- Vương Lâm là NPC truyện, không là avatar người chơi. Áo xám dùng trong cảnh đúng giai đoạn; áo đỏ/đồ thường phải có chân dung riêng.
- Tư Đồ Nam dùng trong tuyến châu/cảnh cá nhân đã tới mốc. Crop đầu/vai không thay bản đứng pixel; dáng ngồi vẫn giữ cho cảnh tu luyện.
- Lý Mộ Uyển áo tím thuộc arc sau; không lấy mẫu này cho lần gặp áo đỏ hoặc gán vai healer.
- Hồ sơ chưa mở dùng thẻ tên/ảnh trống theo luật nội dung; có file ART không tự mở nhân vật.
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

[Kế hoạch động tác](../../../CORE-CHARACTER-MOTION-PLAN.md) và [dữ liệu](../../../data/core-character-motion-plan.json) tách **36 frame đang có** khỏi mục tiêu **100 frame**, cần vẽ thêm **64** khi sản xuất đủ các bộ theo giai đoạn. Gói này chỉ tạo chân dung; các animation mới trong kế hoạch chưa được vẽ.
