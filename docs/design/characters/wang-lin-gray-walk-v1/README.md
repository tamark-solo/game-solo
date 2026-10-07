# Vương Lâm áo xám — đứng và đi v1

Nhận diện Vương Lâm v2 đã được người phát triển duyệt. Bộ đầu tiên có **28 frame native 64 × 96**: 4 đứng và 24 đi, theo bốn hướng xuống/trái/phải/lên. Palette có 24 mục tính cả trong suốt; điểm chân `(32, 88)`, nhịp đi mặc định 8 FPS. Chuyển động là bản đầu để xem thử.

Mở [index.html](index.html) trực tiếp trong trình duyệt. Trang có bốn hướng cùng nhịp, xem từng frame/phóng nguyên lần và thử bước trên sân. Metadata nạp bằng script tĩnh nên không cần server để xem bộ hình. Đặc tả: [WANG-LIN-SPRITE-SPEC.md](../../../WANG-LIN-SPRITE-SPEC.md).

## Gói native

| File | Vai trò |
| --- | --- |
| [native-v2/atlas.png](native-v2/atlas.png) | PNG indexed 448 × 384, 7 cột × 4 hàng; phiên bản đang xem |
| [native-v2/atlas.json](native-v2/atlas.json) | Frame rectangle, anchor, animation, palette và thông tin nguồn |
| [native-v2/frames](native-v2/frames) | 28 PNG rời, mỗi file 64 × 96 |
| [native-v2/atlas-data.js](native-v2/atlas-data.js) | Cùng dữ liệu JSON, dùng trong trang xem file local |
| [pixel-spec.json](pixel-spec.json) | Lưới, palette và hướng/nhịp của bộ đầu tiên |
| [animation-manifest.json](animation-manifest.json) | Nguồn/input, trạng thái duyệt và kết quả kiểm tra gói hiện tại |

Hàng 0–3 lần lượt `south/west/east/north`. Cột 0 đứng; cột 1–6 đi 0–5. Khung luôn giữ đủ 64 × 96, không trim; đặt ảnh bằng vị trí chân trừ `(32, 88)`. Không đặt PNG nguồn lớn vào game thay cho atlas native.

## Nguồn và prompt chính xác

| Nguồn | Input | Prompt |
| --- | --- | --- |
| [source-sheet-v1.png](source-sheet-v1.png) | [Pixel áo xám v2](../wang-lin-sprite-study/wang-lin-gray-pixel-v2.png), nguồn nhận diện đã duyệt | [Prompt đầu](source-sheet-v1.prompt.txt) |
| [source-sheet-v2.png](source-sheet-v2.png) | Source v1 làm edit target; chỉnh tư thế đi, giữ bố cục/hướng/nhận diện | [Prompt chỉnh](source-sheet-v2.prompt.txt) |
| [source-sheet-v3.png](source-sheet-v3.png) | Source v2 làm edit target, tiếp tục chỉnh pha chân; nguồn xuất hiện tại | [Prompt tinh chỉnh](source-sheet-v3.prompt.txt) |

Các nguồn được vẽ bằng **imagegen tích hợp**; không dùng CLI/API fallback. Giữ nguyên nguồn/prompt và lần xuất `native-v1/`. [export-native.ps1](export-native.ps1) chỉ tách hình, lấy mẫu nearest-neighbor với một scale chung, khóa palette/alpha, đăng ký điểm chân và đóng gói; không vẽ chuyển động bằng code.

## Xuất lại vào phiên bản mới

Script dùng Windows PowerShell và System.Drawing có sẵn trên máy hiện tại. Tại thư mục này:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./export-native.ps1 -OutputDirectory ./native-v3
```

Thông số ExecutionPolicy trong lệnh chỉ áp dụng cho tiến trình xuất đó. Script dừng nếu atlas đích đã tồn tại. Đổi tên source/đích khi có bản mới, rồi cập nhật đường dẫn metadata của trang xem nếu muốn dùng bản mới. Không cần xuất lại để xem các file đã bàn giao.

## Kiểm tra bộ đầu tiên

Đã tách được đúng 28 hình và xuất frame đúng kích thước; mỗi hướng có 6 frame đi khác nhau. Script kiểm tra padding và đáy sprite ở `y=88` trước khi viết file. Việc kiểm tra vòng lặp/tóc/áo và chuyển động ở cỡ gốc dùng trang xem; trạng thái motion trong JSON là bản đầu chờ đánh giá.

Trang sân chỉ xem ART với nhân vật truyện, chưa là game online. Chuẩn frame này chưa quy định lưới map, va chạm hoặc tốc độ đi của gameplay.
