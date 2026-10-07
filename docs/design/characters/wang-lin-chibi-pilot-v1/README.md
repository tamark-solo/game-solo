# Vương Lâm chibi — mẫu một hướng v1

Xem **http://127.0.0.1:5173/chibi-pilot.html** sau `npm.cmd run dev`. Trang dùng chung Three.js renderer với phòng thử chính; có đứng/đi, bước pose, zoom và đi trên sân bằng D/→ hoặc nút giữ trên mobile.

**Trạng thái:** mẫu tỷ lệ mới sau khi người phát triển chọn đầu lớn/thân gọn theo [reference Pinterest](https://www.pinterest.com/pin/480196379041020113/). Các frame mới chờ đánh giá nhận diện/chuyển động. Chỉ có hướng Đông; chưa thay các bộ trong sân online.

## Nguồn và prompt

Tạo và sửa bằng **imagegen tích hợp**, không dùng CLI:

- [Nguồn v1](wang-lin-chibi-east-source-v1.png) theo [prompt tạo](wang-lin-chibi-east-source-v1.prompt.txt): năm hình, hai hàng × ba ô; ô cuối trống.
- **Nguồn được chọn:** [v2](wang-lin-chibi-east-source-v2.png), theo [prompt sửa tay Contact B](wang-lin-chibi-east-source-v2.prompt.txt). Tỷ lệ chibi, tóc đen buộc nửa/dây sáng, áo xám/cổ kem/đai tối.
- [Atlas PNG](native-v1/atlas.png), [metadata](native-v1/atlas.json), [frame riêng](native-v1/frames/), [kết quả kiểm tra nguồn](verification.json).

Atlas **320 × 96** gồm 5 frame 64 × 96, điểm chân (32,88): đứng, tiếp đất A, chân B đi qua, tiếp đất B, chân A đi qua. Bốn hình đi là pose vẽ riêng. Palette 24 mục, alpha 0/255. Exporter chỉ cắt/lấy mẫu/khóa palette/đăng ký điểm neo; không vẽ giải phẫu hoặc tạo pose bằng code.

`characterId` có hậu tố pilot để nạp cạnh bộ trước; `sourceCharacterId` vẫn là `CHR-WANG-LIN`. Đây là một mẫu của cùng nhân vật, không thêm NPC hoặc đổi mốc truyện.

## Xuất và kiểm tra

Chạy từ thư mục gốc, chọn thư mục mới nếu xuất lại:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/wang-lin-chibi-pilot-v1/export-pilot.ps1 -OutputDirectory docs/design/characters/wang-lin-chibi-pilot-v1/native-v2
python docs/design/characters/wang-lin-chibi-pilot-v1/verify-pilot.py
npm.cmd run assets
npm.cmd run test:chibi-pilot
```

Lệnh xuất ví dụ tạo v2; verifier/config hiện chọn v1. Khi chọn bản khác, cập nhật cả hai đường dẫn. [Exporter](export-pilot.ps1) tái dùng helper đóng gói của bộ trước; giữ bản nguồn gốc và prompt.

Verifier kiểm năm pose khác nhau, CRC/hash, frame khớp atlas, kích thước, padding, điểm chân, alpha và palette. Browser kiểm dùng chung renderer, bốn pose/đứng, di chuyển theo quãng đường, dừng về hình đứng mới và mobile 360 px. Việc duyệt chất lượng tạo hình/animation cần xem mẫu thật.
