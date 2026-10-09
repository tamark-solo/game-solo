# Dàn nhân vật chibi theo chuẩn Vương Lâm

**Xem:** [năm nhân vật cạnh nhau](http://127.0.0.1:5173/assets/chibi-roster/index.html), [gallery trong dự án](index.html) và [preview Three.js](http://127.0.0.1:5173/). Chọn nhân vật để xem pose/đi trên sân; hai đệ tử mới cũng dùng trong sân online.

**Mốc sản xuất bộ chibi:** runtime 0.5.1; công cụ hiện tại 0.12.0. Người phát triển dùng Vương Lâm làm chuẩn. Lý Mộ Uyển native-v5 đã được chấp nhận làm chuẩn bản thử ngày 07/10/2026: “tôi thấy ổn rồi đó.” Hai đệ tử và Tư Đồ Nam chibi mới còn chờ đánh giá. Theo [GDD 0.28](../../../GDD.md), bộ ba chọn được từ đầu, cùng Hằng Nhạc–Ngưng Khí; sân online hiện chỉ hai mẫu đệ tử kỹ thuật.

## Bộ đang dùng

| Nhân vật | Nhận diện | Bộ hình và gói |
| --- | --- | --- |
| Đệ tử nam | Búi cao, gáy gọn, mặt rộng, áo xám/đai xanh | 4 đứng + 16 đi · [PNG](male/native-v2/atlas.png) · [JSON](male/native-v2/atlas.json) |
| Đệ tử nữ | Búi thấp, ngôi giữa, mặt oval, áo xám/đai xanh | 4 đứng + 16 đi · [PNG](female/native-v2/atlas.png) · [JSON](female/native-v2/atlas.json) |
| Lý Mộ Uyển · diện mạo mới | Mặt mềm, tóc xanh đen rẽ lệch/buộc thấp, áo lavender hai lớp/cổ ngà/đai tím | 4 đứng + 16 đi · [PNG](li-muwan/native-v5/atlas.png) · [JSON](li-muwan/native-v5/atlas.json) |
| Tư Đồ Nam | Mặt trung niên, búi thấp/điểm bạc, linh thể đứng khuyết ngực | 4 đứng lơ lửng + 16 lướt · [PNG](situ-nan/native-v2/atlas.png) · [JSON](situ-nan/native-v2/atlas.json) |

**80 frame mới.** Mỗi bộ: frame 64 × 96, atlas 320 × 384, bốn hướng xuống/trái/phải/lên, palette 24 mục gồm trong suốt và điểm đặt (32, 88). Người đi giữ đáy hình y = 88; linh thể có đáy y = 84. Hướng trái/phải có hình riêng. Bốn pha đi bước nhỏ/tay gần hông; lướt giữ chân duỗi và áo gợn nhẹ.

Vương Lâm chibi giữ nguyên PNG và được kiểm SHA-256. Năm bộ chibi có **100 frame**, cộng bộ Vương Lâm trước 36 frame để đối chiếu thành **6 bộ/136 frame** trong catalog. Bộ ba lựa chọn người chơi chiếm 60 frame, hai avatar kỹ thuật chiếm 40. Nhãn role trong nguồn/catalog là tag preview kế thừa, không quyết định quyền chọn gameplay.

Preview mặc định 5 FPS tại chỗ, 24 px/vòng và 40 px/s trên map cục bộ. Online dùng tốc độ server và sải 48 px/vòng đã có. Số này phục vụ duyệt hình, chưa là cân bằng gameplay cuối.

## Nguồn và prompt imagegen

Các hình được tạo/sửa bằng **imagegen tích hợp**. Tỷ lệ/nét pixel tham chiếu Vương Lâm; nhận diện riêng theo hồ sơ nhân vật và yêu cầu người phát triển.

- **Nam:** [nguồn v1](male/source-v1.png)/[prompt](male/source-v1.prompt.txt); bản chọn [v2](male/source-v2.png)/[prompt sửa hai pose đi qua cuối](male/source-v2.prompt.txt).
- **Nữ:** [nguồn v1](female/source-v1.png)/[prompt](female/source-v1.prompt.txt); bản chọn [v2](female/source-v2.png)/[prompt sửa pha chân](female/source-v2.prompt.txt).
- **Lý Mộ Uyển:** [v1](li-muwan/source-v1.png)/[prompt](li-muwan/source-v1.prompt.txt), [v2](li-muwan/source-v2.png)/[prompt](li-muwan/source-v2.prompt.txt), [v3](li-muwan/source-v3.png)/[prompt](li-muwan/source-v3.prompt.txt), [v4](li-muwan/source-v4.png)/[prompt](li-muwan/source-v4.prompt.txt) lưu thử nghiệm trước phản hồi. **Thiết kế lại:** [v5](li-muwan/source-v5.png)/[prompt toàn bộ mặt/tóc/áo](li-muwan/source-v5.prompt.txt); bản chọn [v6](li-muwan/source-v6.png)/[prompt sửa pha chân cuối](li-muwan/source-v6.prompt.txt).
- **Tư Đồ Nam:** [nguồn v1](situ-nan/source-v1.png)/[prompt](situ-nan/source-v1.prompt.txt); bản chọn [v2](situ-nan/source-v2.png)/[prompt thu gọn áo lướt](situ-nan/source-v2.prompt.txt).

Nguồn mỗi người bốn hàng × năm cột: hướng xuống/trái/phải/lên; đứng rồi bốn pha chuyển động. [Exporter](export-roster.ps1) cắt hình đã vẽ, lấy mẫu nearest, khóa palette và đăng ký điểm đặt, không vẽ giải phẫu hay tạo pose bằng nội suy. Tóc/áo được thu gọn để giữ cỡ nhân vật khi vừa frame.

Lý Mộ Uyển dùng palette mới tách dải tóc trung tính khỏi tím áo; native-v5 đã chấp nhận cho bản thử, chân dung UI cần đồng bộ. Bản trước và portrait cũ giữ tham chiếu. Tư Đồ Nam giữ lỗ ngực alpha thật trên cả 20 frame.

## Kiểm tra và xuất lại

[Manifest](models.json) chọn source/native version. [Verifier](verify-roster.py) và [kết quả](verification.json) kiểm 80 frame, CRC/hash, kích thước, palette/alpha, padding, frame khớp atlas, năm pose khác nhau mỗi hướng, màu tóc Lý Mộ Uyển, lỗ ngực và PNG Vương Lâm không đổi. [Kết quả preview](../../../data/preview-verification.json) ghi browser, gallery 360 px và hai avatar online; kỹ thuật không thay việc duyệt hình.

Từ thư mục gốc, chọn phiên bản chưa tồn tại:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/chibi-roster-v1/export-roster.ps1 -OutputVersion native-v6
python docs/design/characters/chibi-roster-v1/verify-roster.py
npm.cmd run assets
npm.cmd test
npm.cmd run test:browser
```

Lệnh xuất tạo v6; manifest/verifier/catalog hiện chọn phiên bản ở bảng trên. Khi chọn bản mới phải cập nhật các đường dẫn và dữ liệu gallery. Bộ tĩnh/hình nguồn trước còn được lưu trong thư mục lịch sử.
