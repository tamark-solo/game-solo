# Bộ đi sửa tay/chân v1

**Hồ sơ nguồn lịch sử:** Bộ tám pose thuộc giai đoạn trước chibi; yêu cầu chỉnh tiếp sau reference. Main hiện có năm chibi 100 frame và Vương Lâm trước 36 để đối chiếu. Xem [chuẩn chibi hiện hành](../../../CHIBI-ROSTER-SPEC.md).

Ba bộ đi dùng trong preview tại mốc lịch sử: **Vương Lâm áo xám, đệ tử nam và đệ tử nữ**. Mỗi bộ có 4 hình đứng cũ và 32 pose đi mới, bốn hướng × tám pha, tổng 36 frame. Xem [so sánh cũ/mới](index.html), [quy tắc ART](../../../GAIT-CORRECTION.md) và [kết quả kiểm tra](verification.json). Bản sửa đang chờ người phát triển đánh giá chuyển động/nhận diện.

## Nguồn được chọn

Hình được vẽ/sửa bằng **imagegen tích hợp**; không dùng CLI. Tất cả nguồn và prompt chính xác đã được lưu tại thư mục này. Các nguồn v1–v4 tạo thành lịch sử chỉnh sửa; manifest chọn phiên bản cuối cho từng hướng.

| Nhân vật | Manifest | PNG nguồn đang dùng | Prompt cuối mỗi hướng |
| --- | --- | --- | --- |
| Nam | [male-manifest.json](male-manifest.json) | [Phải](male-east-source-v1.png), [trái](male-west-source-v1.png), [xuống](male-south-source-v1.png), [lên](male-north-source-v1.png) | [Phải](male-east-source-v1.prompt.txt), [trái](male-west-source-v1.prompt.txt), [xuống](male-south-source-v1.prompt.txt), [lên](male-north-source-v1.prompt.txt) |
| Nữ | [female-manifest.json](female-manifest.json) | [Phải](female-east-source-v2.png), [trái](female-west-source-v2.png), [xuống](female-south-source-v4.png), [lên](female-north-source-v1.png) | [Phải](female-east-source-v2.prompt.txt), [trái](female-west-source-v2.prompt.txt), [xuống](female-south-source-v4.prompt.txt), [lên](female-north-source-v1.prompt.txt) |
| Vương Lâm | [wang-lin-manifest.json](wang-lin-manifest.json) | [Phải](wang-lin-east-source-v3.png), [trái](wang-lin-west-source-v2.png), [xuống](wang-lin-south-source-v2.png), [lên](wang-lin-north-source-v2.png) | [Phải](wang-lin-east-source-v3.prompt.txt), [trái](wang-lin-west-source-v2.prompt.txt), [xuống](wang-lin-south-source-v2.prompt.txt), [lên](wang-lin-north-source-v2.prompt.txt) |

Nguồn nam 32 pose trên một bảng bị loại vì nửa sau lặp tay/chân. Các bảng tám pose theo từng hướng và sơ đồ `*-pose-guide.svg/png` được dùng thay thế. Bộ nữ hướng xuống sửa tay theo chân thực tế, sau đó làm sạch alpha ở v4; Vương Lâm hướng phải sửa riêng tay pose 5 ở v3.

## Atlas native

| Nhân vật | PNG | Metadata |
| --- | --- | --- |
| Nam | [atlas.png](male/native-v1/atlas.png) | [atlas.json](male/native-v1/atlas.json) |
| Nữ | [atlas.png](female/native-v1/atlas.png) | [atlas.json](female/native-v1/atlas.json) |
| Vương Lâm | [atlas.png](wang-lin/native-v1/atlas.png) | [atlas.json](wang-lin/native-v1/atlas.json) |

Mỗi atlas **576 × 384**, 9 cột × 4 hàng south/west/east/north. Cột 0 đứng; cột 1–8 đi. Frame **64 × 96**, điểm chân **(32,88)**, palette cũ 24 mục và alpha 0/255. PNG đứng sao chép nguyên byte. Bộ đi nguồn được đăng ký theo trục đầu của hình đứng; tỷ lệ chung trong mỗi hướng được tính để tay/gấu áo nằm trong padding. Exporter không tạo pose hoặc vẽ lại giải phẫu.

`identityReferenceApprovedByProjectOwner` ghi trạng thái nhận diện tham chiếu, còn `identityApprovedByProjectOwner: false` và `animationStatus` ghi bộ sửa chưa được duyệt. Bản thử nam chỉ sửa một hướng ở `native-pilot-v1` giữ làm lịch sử, không dùng trong game.

## Xuất và kiểm tra lại

Chạy từ thư mục gốc dự án. Để xuất phiên bản khác, chọn thư mục mới; script từ chối ghi đè atlas đã có.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/gait-correction-v1/export-gait.ps1 -ManifestPath docs/design/characters/gait-correction-v1/male-manifest.json -OutputDirectory docs/design/characters/gait-correction-v1/male/native-v2
python docs/design/characters/gait-correction-v1/verify-gait.py
node docs/design/characters/gait-correction-v1/build-review.mjs
npm.cmd run assets
npm.cmd run test:gait-review
```

Lệnh xuất ví dụ tạo v2; verifier và trang so sánh hiện đọc v1. Khi chọn một atlas mới sau đánh giá, cập nhật đường dẫn trong verifier, builder, manifest preview và roster cùng nhau. `assets` sao chép atlas đang chọn và trang so sánh vào public; không sửa nguồn cũ.

Kiểm tra kỹ thuật xác nhận đủ hình, hash/CRC, frame khớp atlas, alpha/palette, padding và hình đứng không đổi. Việc duyệt nhịp chân, giải phẫu, đầu/thân và độ bám nền cần xem animation thật.
