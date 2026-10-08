# Vương Lâm áo xám chibi — đứng và đi bốn hướng

**Preview:** [trang chính](http://127.0.0.1:5173/) sau `npm.cmd run dev`, chọn **Vương Lâm · chibi bốn hướng**. Đây là bộ mặc định. Chọn **Thử trên map**, bấm vào sân và dùng WASD/phím mũi tên hoặc nút hướng trên điện thoại.

**Trạng thái:** sau khi sửa frame cuối Đông, người phát triển thấy bộ này khá ổn và yêu cầu áp dụng tỷ lệ cho nhân vật tiếp theo. `native-v2` là chuẩn cho [dàn chibi mới](../chibi-roster-v1/README.md), PNG Vương Lâm giữ nguyên. Trong sửa Đông trước đó, chỉ `wanglin_chibi_walk_east_03` thay đổi; 19 frame khác không đổi. Bộ này là hình Vương Lâm; avatar đệ tử dùng bộ riêng.

## Gói hình

| Thành phần | Quy chuẩn |
| --- | --- |
| Frame | 64 × 96 px, điểm chân (32, 88) |
| Atlas | 320 × 384 px; hàng xuống, trái, phải, lên |
| Mỗi hàng | Đứng → tiếp đất A → chân B đi qua → tiếp đất B → chân A đi qua |
| Tổng | 4 đứng + 16 đi = 20 frame; so với v1 chỉ sửa frame cuối Đông |
| Palette | 24 mục gồm trong suốt; alpha 0/255 |
| Nhịp thử | 5 FPS tại chỗ; 24 px mỗi vòng chân và 40 px/s trên sân |

[Atlas PNG đang dùng](native-v2/atlas.png) · [Metadata JSON](native-v2/atlas.json) · [20 frame riêng](native-v2/frames/) · [Kiểm tra nguồn](verification.json) · [Bản v1 để đối chiếu](native-v1/atlas.png).

Trong preview, đi theo quãng đường thực tế; đổi hướng giữ pha bước, thả phím về pose đứng cùng hướng. Bốn pose đi là bốn hình nguồn, không kéo giãn hoặc nội suy giải phẫu. Mọi hướng có cùng điểm chân, hình cao 80–82 px trong frame. Tốc độ và sải bước là thông số duyệt ART, có thể chỉnh trực tiếp trên web.

## Nguồn và prompt

Ba hướng mới được tạo bằng **imagegen tích hợp**, tham chiếu mẫu chibi đã chọn và nhận diện Vương Lâm của game:

- **Trái:** [nguồn v1](west-source-v1.png), [prompt tạo](west-source-v1.prompt.txt); bản dùng là [v2](west-source-v2.png), [prompt chỉnh tay tiếp đất B](west-source-v2.prompt.txt).
- **Xuống:** [nguồn v1](south-source-v1.png), [prompt](south-source-v1.prompt.txt).
- **Lên:** [nguồn v1](north-source-v1.png), [prompt](north-source-v1.prompt.txt); nhìn sau, tóc buộc nửa đầu, không lộ mặt.
- **Phải:** giữ nguyên hình đứng và ba hình đi đầu từ [mẫu ban đầu](../wang-lin-chibi-pilot-v1/native-v1/atlas.json), [ảnh nguồn](../wang-lin-chibi-pilot-v1/wang-lin-chibi-east-source-v2.png), [prompt](../wang-lin-chibi-pilot-v1/wang-lin-chibi-east-source-v2.prompt.txt). Frame cuối lấy từ [nguồn sửa](east-last-source-v1.png), [prompt sửa chân](east-last-source-v1.prompt.txt), ô dưới giữa/index 4; chỉ thay frame này vào atlas.

Layout nguồn mỗi hướng mới: hai hàng × ba ô, ô cuối trống; thứ tự đứng / tiếp đất A / đi qua B / tiếp đất B / đi qua A. [Exporter bộ v1](export-native.ps1) cắt các hình đã vẽ, lấy mẫu nearest, khóa palette và đăng ký điểm chân. [Exporter sửa Đông](export-east-fix.ps1) lấy riêng pose cuối mới, sao chép 19 frame từ v1 và dựng atlas v2. Các helper không vẽ giải phẫu, không lật ảnh để giả hướng mới.

Frame cuối trước đây nhấc lại giày phía sau như pha đi qua B. Pose sửa đặt giày đó xuống làm chân trụ, còn giày phía trước nhấc nhẹ; kiểm tra đoạn nối frame 03 → 00 tại chỗ và trên sân. Palette, điểm chân, kích thước và thứ tự vòng đi giữ nguyên.

## Xuất và kiểm tra

Chạy từ thư mục gốc. Nếu xuất lại, dùng thư mục phiên bản mới để giữ nguồn và atlas hiện tại:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/wang-lin-chibi-walk-v1/export-east-fix.ps1 -OutputDirectory docs/design/characters/wang-lin-chibi-walk-v1/native-v3
python docs/design/characters/wang-lin-chibi-walk-v1/verify-native.py
npm.cmd run assets
npm.cmd test
npm.cmd run test:browser
```

Verifier và catalog hiện trỏ tới `native-v2`; khi chọn bản xuất mới phải cập nhật các đường dẫn này. [Verifier](verify-native.py) kiểm CRC/hash, 20 frame khớp atlas, năm pose khác nhau mỗi hướng, kích thước, palette, alpha, điểm chân, padding, mức dao động chiều cao và 19 frame không đổi. Browser v0.4.0 đã kiểm bốn hướng, đứng–đi bằng WASD, cảm ứng 360 px và online. Kiểm tra bổ sung v0.4.1 xác nhận web nạp đúng PNG/JSON mới, xem đủ bốn pose Đông, nối cuối → đầu và dừng về đứng. Kết quả kỹ thuật không thay việc duyệt hình và nhịp bước.
