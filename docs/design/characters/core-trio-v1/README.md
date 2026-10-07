# Bộ ba trọng tâm — Linh thể đứng Tư Đồ Nam v3

Mở [trang xem](index.html) trực tiếp trong trình duyệt để đối chiếu bốn hướng pixel với Vương Lâm và Lý Mộ Uyển, phóng 1×/2×/4×, đổi nền và hiện điểm đặt.

**Trạng thái:** Vương Lâm v2 và Lý Mộ Uyển v1 đã chấp nhận nhận diện. Người phát triển chọn Tư Đồ Nam **đứng dạng linh thể** cho tương tác MMORPG; bảng đứng v3 giữ mặt/tóc v2 đã được tạm chấp nhận làm chuẩn thiết kế qua phản hồi “tạm chấp nhận được rồi”. Mức duyệt là tạm thời để tiếp tục GDD/ART. [Hồ sơ](../../../CORE-CHARACTER-VISUAL-SPEC.md), [manifest](study.json) và [roster](../../../data/character-roster.json) ghi nguồn/trạng thái riêng từng nhân vật.

## Tạo hình và prompt

Tất cả tranh/sprite được vẽ bằng **imagegen tích hợp**. Tư thế đứng, mắt mở, diện mạo và chi tiết áo là ART chuyển thể. Dạng ngồi/mắt nhắm ở chương 112 được lưu riêng; đứng không được ghi thành mô tả của chương đó.

| Hình | Vai trò | Prompt |
| --- | --- | --- |
| [Tư Đồ Nam đứng v3](situ-nan-spirit-standing-v3.png) | Ba góc đứng lơ lửng và hai đầu biểu cảm, giữ mặt/tóc v2 | [Prompt đứng](situ-nan-spirit-standing-v3.prompt.txt) |
| [Nguồn pixel đứng hiện tại](situ-nan/pixel-source-standing-v4.png) | Tỷ lệ gọn cho map; khoảng rỗng ở ngực trong suốt | [Prompt chỉnh pixel](situ-nan/pixel-source-standing-v4.prompt.txt) |
| [Nguồn pixel đứng đầu](situ-nan/pixel-source-standing-v3.png) | Lưu nghiên cứu: đầu nhỏ, phần khuyết còn bị tô màu giấy | [Prompt nguồn đầu](situ-nan/pixel-source-standing-v3.prompt.txt) |
| [Tư Đồ Nam ngồi v2](situ-nan-spirit-identity-v2.png) | Dáng ngồi xếp bằng/mắt nhắm cho cảnh tu luyện phù hợp | [Prompt ngồi](situ-nan-spirit-identity-v2.prompt.txt) |
| [Tư Đồ Nam v1](situ-nan-spirit-identity-v1.png) | Mặt dài/tóc xám xõa trước yêu cầu đổi nhận diện | [Prompt v1](situ-nan-spirit-identity-v1.prompt.txt) |
| [Tư Đồ Nam mẫu chỉnh mặt đầu](situ-nan-spirit-identity-v2-study.png) | Đã đổi tóc nhưng mặt còn gần v1 | [Prompt mẫu chỉnh](situ-nan-spirit-identity-v2-study.prompt.txt) |
| [Lý Mộ Uyển v1](li-muwan-early-identity-v1.png) | Áo tím, biến thể đỏ và tóc dài buộc đuôi, nhận diện đã chấp nhận | [Prompt chỉnh tóc](li-muwan-early-identity-v1.prompt.txt), [prompt đầu](li-muwan-early-identity-v1-study.prompt.txt) |
| [Lý Mộ Uyển pixel hiện tại](li-muwan/pixel-source-v2.png) | Mẫu đứng áo tím, tỷ lệ gọn cùng lưới Vương Lâm | [Prompt chỉnh tỷ lệ](li-muwan/pixel-source-v2.prompt.txt) |

Nhận diện đứng lấy [Tư Đồ Nam v2](situ-nan-spirit-identity-v2.png) làm đích chỉnh tư thế. Nguồn pixel đầu lấy bảng đứng và [atlas Vương Lâm](../wang-lin-gray-walk-v1/native-v2/atlas.png) làm tham chiếu; nguồn chỉnh tiếp lấy chính mẫu pixel đầu và atlas đó. Vai trò input chính xác được ghi trong manifest.

## Native và điểm đặt

| Mẫu hiện tại | Khung | Điểm đặt | Native |
| --- | --- | --- | --- |
| Tư Đồ Nam linh thể đứng | 64 × 96 | Điểm chiếu (32, 88); đáy hình y = 84, cao 4 px | [Atlas 256 × 96](situ-nan/native-v4/atlas.png), [JSON](situ-nan/native-v4/atlas.json), [spec/palette](situ-nan/pixel-spec.json) |
| Lý Mộ Uyển áo tím | 64 × 96 | Điểm chân (32, 88) | [Atlas 256 × 96](li-muwan/native-v2/atlas.png), [JSON](li-muwan/native-v2/atlas.json), [spec/palette](li-muwan/pixel-spec.json) |

Mỗi mẫu có **4 frame tĩnh**: xuống/trước, trái, phải, lên/sau; tổng hiện tại tám frame. PNG indexed, alpha 0/255, palette 24 mục gồm trong suốt, PNG rời trong `frames/`. Bộ đứng Tư Đồ Nam là bản tương tác; animation lơ lửng/lướt chưa được sản xuất.

Điểm chiếu của linh thể dùng để đặt và sắp lớp nhân vật. Phần hình nằm cao hơn điểm này, không biến thành chân đang tiếp đất. Kích thước sprite tương tác không quyết định quy mô nguyên anh trong cảnh truyện.

**Các bộ được lưu:**

- [Tư Đồ Nam ngồi native-v2](situ-nan/native-v2/atlas.png), [spec ngồi](situ-nan/pixel-spec-v2-seated.json): 128 × 128, điểm đáy hình ngồi (64, 112), tham chiếu chương 112.
- [Tư Đồ Nam đứng native-v3](situ-nan/native-v3/atlas.png): lần xuất đầu trước chỉnh tỷ lệ và alpha khoảng khuyết; trang hiện tại dùng native-v4.
- Tư Đồ Nam native-v1/[spec v1](situ-nan/pixel-spec-v1.json) và Lý Mộ Uyển native-v1 giữ làm tham chiếu.
- [Manifest v2](study-v2.json) và [kiểm tra v2](verification-v2.json) ghi gói trước khi đổi sang đứng.

Thứ tự source được ghi theo vị trí thực tế trong spec/manifest; exporter sắp atlas native về south/west/east/north. Lý Mộ Uyển có source south/east/west/north. Không lật hoặc vẽ tư thế bằng code.

## Xuất và kiểm tra

[export-static.ps1](export-static.ps1) tìm bốn hình tách biệt bằng alpha, sắp source 2 × 2, gán hướng theo spec, lấy mẫu nearest-neighbor với cùng tỷ lệ cho một bộ, khóa palette và đăng ký điểm đặt. Với linh thể đứng, `hoverHeightPx` để hình cao hơn điểm chiếu. Script chỉ đóng gói ART đã vẽ.

Ví dụ xuất vào phiên bản mới từ root dự án:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/core-trio-v1/export-static.ps1 -SourcePath docs/design/characters/core-trio-v1/situ-nan/pixel-source-standing-v4.png -PixelSpecPath docs/design/characters/core-trio-v1/situ-nan/pixel-spec.json -OutputDirectory docs/design/characters/core-trio-v1/situ-nan/native-v5
```

Script dùng System.Drawing; dừng nếu atlas đã tồn tại, chỉ xuất trong gói ART này. `Bypass` áp dụng cho riêng tiến trình chạy script. Không cần exporter/server để mở trang xem.

[verify_native.py](verify_native.py) chỉ đọc dữ liệu bằng Python standard library:

```powershell
python docs/design/characters/core-trio-v1/verify_native.py
```

[verification.json](verification.json) ghi kiểm tra CRC, palette/alpha, padding, khung/điểm chiếu/độ lơ lửng, SHA256 pixel, PNG rời khớp atlas và JSON/JS tương đương. Kiểm tra kỹ thuật không tự duyệt ART.

Trang được kiểm tra trong Chrome với bốn hướng, phóng nguyên lần, nền tối, alpha, độ lơ lửng và bố cục desktop/360 px. Ảnh chụp hiện tại: [desktop v3](preview-desktop-v3.png), [360 px v3](preview-360-v3.png); các ảnh cũ được giữ.
