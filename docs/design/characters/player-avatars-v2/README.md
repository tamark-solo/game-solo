# Đệ tử người chơi v2 — tạo hình và sprite thử

**Hồ sơ nguồn lịch sử:** Bộ 28 frame/mẫu giữ để truy nguồn. Sân online main hiện dùng hai đệ tử chibi 20 frame/mẫu; gameplay chính thiết kế cho chọn bộ ba từ đầu. Xem [chuẩn chibi hiện hành](../../../CHIBI-ROSTER-SPEC.md).

Mở [trang xem](index.html) trực tiếp trong trình duyệt. So sánh nam/nữ với Vương Lâm, đổi bốn hướng, đứng/đi, nhịp 6/8/10 FPS, xem từng frame và phóng nguyên lần. Sân cho chọn nam hoặc nữ để thử dịch chuyển, tắt tên/vòng chọn để xem nhận diện ở 1×.

**Trạng thái:** nhận diện v2 và chuyển động đệ tử là bộ thử, chưa được người phát triển duyệt. Bộ Vương Lâm đã có phản hồi tích cực và được dùng làm chuẩn thử. Đây là công cụ ART; chưa có gameplay online.

## Đầu ra

| Mẫu | Nhận diện | Native hiện tại | Metadata |
| --- | --- | --- | --- |
| Nam | [PNG v2](../player-male-novice-v2.png) | [Atlas](male/native-v2/atlas.png), [28 PNG rời](male/native-v2/frames) | [JSON](male/native-v2/atlas.json), [palette/spec](male/pixel-spec.json) |
| Nữ | [PNG v2](../player-female-novice-v2.png) | [Atlas](female/native-v2/atlas.png), [28 PNG rời](female/native-v2/frames) | [JSON](female/native-v2/atlas.json), [palette/spec](female/pixel-spec.json) |

Mỗi mẫu: frame **64 × 96**, điểm chân **(32, 88)**, 4 đứng + 24 đi, bốn hướng, 8 FPS mặc định; atlas **448 × 384**. Hai mẫu dùng chung palette 24 mục gồm trong suốt. Màu xanh đai/tie được thêm vào tông nhập môn; không đổi màu Vương Lâm.

PNG hiện dùng 21 mục của palette chung trong mỗi bộ; hình nam cao 78–82 px và nữ 77–82 px. Sáu frame khác nhau mỗi hướng là kiểm tra dữ liệu; độ ổn định của thân/đầu và vòng bước cần đánh giá bằng mắt trong trang xem.

[Hồ sơ thiết kế](../../../PLAYER-AVATAR-VISUAL-SPEC.md) ghi nhận diện, vai trò và giới hạn tùy biến. [study.json](study.json) ghi nguồn/input và trạng thái; [verification.json](verification.json) ghi kiểm tra kỹ thuật. PNG nguồn lớn khác PNG native; ảnh chân dung trên giấy chưa là portrait alpha riêng.

Đã kiểm tra 17 thao tác/điều kiện trong Chrome, gồm chạy frame theo thời gian thật, nam/nữ đi-dừng, đổi mẫu, reset và bố cục 360 px. Ảnh chụp trang: [desktop](preview-desktop-v2.png), [sân](preview-courtyard-v2.png), [360 px](preview-360-v2.png).

## Nguồn và prompt chính xác

Tất cả tranh/sprite được vẽ bằng **imagegen tích hợp**. Đóng gói native dùng System.Drawing để lấy mẫu/palette/anchor, không vẽ bổ sung chân/tay hoặc tạo bước đi bằng code.

| Nguồn | Vai trò | Prompt |
| --- | --- | --- |
| [Nam nhận diện v2](../player-male-novice-v2.png) | Phát triển từ nam v1; Vương Lâm v2 chỉ là đối chiếu để giữ khác mặt/tóc | [Prompt](../player-male-novice-v2.prompt.txt) |
| [Nữ nghiên cứu v2](../player-female-novice-v2-study.png) | Phát triển từ nữ v1; phần tóc trước có đỉnh cao chưa đúng dấu nhận diện | [Prompt đầu](../player-female-novice-v2-study.prompt.txt) |
| [Nữ nhận diện v2](../player-female-novice-v2.png) | Chỉnh về một búi thấp sau gáy ở mọi góc | [Prompt chỉnh tóc](../player-female-novice-v2.prompt.txt) |
| [Nam nguồn pixel v1](male/source-sheet-v1.png) | 28 tư thế từ nhận diện nam; atlas Vương Lâm làm tham chiếu camera/cụm pixel/layout | [Prompt](male/source-sheet-v1.prompt.txt) |
| [Nam nguồn pixel v2](male/source-sheet-v2.png) | Chỉnh pha chân hướng trước/sau; nguồn xuất hiện tại | [Prompt](male/source-sheet-v2.prompt.txt) |
| [Nữ nguồn pixel v1](female/source-sheet-v1.png) | 28 tư thế từ nhận diện nữ; atlas Vương Lâm làm tham chiếu camera/cụm pixel/layout | [Prompt](female/source-sheet-v1.prompt.txt) |
| [Nữ nguồn pixel v2](female/source-sheet-v2.png) | Chỉnh nửa sau vòng bước chân trước/sau; nguồn xuất hiện tại | [Prompt](female/source-sheet-v2.prompt.txt) |

Mẫu v1, các PNG nguồn và lần xuất `native-v1/` của hai mẫu giữ để so sánh. Trang xem dùng **native-v2**. Bộ Vương Lâm và các mẫu sân trước được giữ nguyên.

## Xuất lại có kiểm soát

[export-native.ps1](export-native.ps1) dùng Windows PowerShell/System.Drawing. Chọn một thư mục output mới; script dừng nếu atlas đã tồn tại. Ví dụ chạy ở root dự án, sau khi có nguồn chỉnh mới:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs/design/characters/player-avatars-v2/export-native.ps1 -SourcePath docs/design/characters/player-avatars-v2/male/source-sheet-v2.png -PixelSpecPath docs/design/characters/player-avatars-v2/male/pixel-spec.json -OutputDirectory docs/design/characters/player-avatars-v2/male/native-v3
```

`Bypass` ở ví dụ chỉ áp dụng cho tiến trình chạy script của dự án. Trang xem hiện tại không yêu cầu xuất lại hoặc mở server.

Script yêu cầu 28 hình riêng theo alpha, sắp bốn hàng/xuống-trái-phải-lên và bảy cột/đứng+đi. Trong từng bộ dùng một tỷ lệ chung, giữ padding và đăng ký đáy pixel về `y = 88`. Alpha xuất 0/255, PNG indexed với palette đã chọn. ID mẫu/prefix và tên biến JS lấy từ pixel spec; không gán quyền duyệt tự động.

Kiểm tra file native bằng Python standard library, chỉ đọc PNG/metadata:

```powershell
python docs/design/characters/player-avatars-v2/verify_native.py
```

Kiểm tra kích thước, CRC của PNG, palette/alpha, padding/đáy pixel, SHA256 pixel, PNG rời khớp atlas, sáu frame khác nhau mỗi hướng và JSON/JS tương đương. Các kiểm tra file không tự chứng minh chất lượng diễn hoạt; xem vòng bước và tạo hình trong trang ART trước khi chốt.
