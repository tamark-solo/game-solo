# Kiếm Khí R01 — Vương Lâm chibi, preview v2

**Hồ sơ lịch sử:** mở [animatic v2](http://127.0.0.1:4185/kiem-khi-preview-v2.html). Bản hiện hành nằm ở [README](README.md) và dùng sprite sequence.

**Trạng thái:** bản thử ART/VFX đúng tỷ lệ renderer, chưa tích hợp combat. V2 thực hiện ba điều chỉnh của người phát triển: dùng Vương Lâm chibi hiện có, thay phản hồi bia đá bằng linh quang/dư khí dùng chung và giữ cỡ skill theo camera game. Bảng concept đã duyệt vẫn là chuẩn nét và palette; nhân vật/bia trong bảng cũ không còn là bố cục sản xuất.

## Mở bản chuyển động

Từ thư mục gốc dự án:

```powershell
python docs/design/vfx/serve-preview.py
```

Mở [preview Vương Lâm](http://127.0.0.1:4185/kiem-khi-preview.html). Máy chủ chỉ phục vụ thư mục này trên localhost. Dừng bằng Ctrl+C trong terminal chạy máy chủ.

- **Thi triển / tạm dừng / bốn nhịp / thanh thời gian:** xem hoặc dừng tại một thời điểm; mặc định tốc độ 0,5×.
- **Zoom 1× / 2× / 4×:** cùng phép đổi tọa độ như camera orthographic của game. 1× là cỡ game; 2×/4× giúp kiểm nét.
- **Khung xem 360 × 400:** thu vùng nhìn để kiểm giữ cỡ, không co toàn bộ scene vào khung.
- **Mục tiêu nhân vật/PvP:** sprite nữ native hiện có làm mẫu nhận hiệu ứng. **Quái/boss:** vùng chạm thử nét đứt, chưa là ART quái/boss.
- **Va chạm:** bật để xem ánh chạm và dư khí tại socket mục tiêu; tắt để xem kiếm khí tan khi hụt.
- **Hiện khung và điểm chạm:** vẽ frame nhân vật và điểm neo hit. Vùng kiểm này không phải hitbox combat đã duyệt.
- **Sân sáng / sân tối / kiểm alpha:** sân sáng là nền game gốc; nét FX có viền ngọc tối mảnh để đọc trên nền sáng. Sân tối là cùng nền giảm sáng. Giảm trang trí bỏ dư ảnh/mảnh phụ.
- **Xuất khung PNG:** xuất canvas hiện tại, không chỉnh bitmap nguồn. Giảm chuyển động hệ điều hành sẽ dừng sẵn ở nhịp xuất kiếm.

## Quy tắc kích thước và điểm neo

Đối chiếu `client/src/renderer.ts`, `shared/world.ts` và sprite được chọn trong `client/src/main.ts`: map tham chiếu **960 × 640**, tâm camera **480,320**, frame **64 × 96**, neo chân **32,88**, zoom **1/2/4**, DPR tối đa **2**. Preview dùng bản sao asset gốc; sprite lấy mẫu nearest, VFX lấy mẫu mịn. Không dùng nhân vật vẽ mịn cao 190 px của bản v1.

| Thành phần | Cỡ ở zoom 1× | Quy tắc |
| --- | --- | --- |
| Vương Lâm | Frame 64 × 96; phần người có alpha khoảng 80–82 px cao | Neo chân 32,88; không scale theo chiều rộng cửa sổ |
| Kiếm chính | 96 px dài | Dư ảnh cùng kiếm; không tăng cỡ theo boss |
| Dải khí | 36 px bề dày | Chiều dài theo đoạn kiếm đã bay |
| Ánh chạm | 52–62 px ngang | Lóe cục bộ tại điểm hit |
| Khí hồi | 72 px ngang ở đầu phần dư khí | Mở nhẹ rồi tắt |
| Mảnh sáng / dư khí | 56 / 46 px ngang cơ sở | Nguồn ma thuật, không có đá/bụi đất |

Các cỡ VFX là lựa chọn ART cho mẫu Ngưng Khí, không phải vùng sát thương. Tại 2× và 4×, camera nhân toàn bộ cỡ world tương ứng; DPR chỉ đổi độ phân giải backing canvas. Khi viewport hẹp, frustum cắt map; frame và skill giữ nguyên cỡ CSS ở cùng zoom.

Bản thử dùng socket tay tương đối `[16,-30]` so với chân Vương Lâm và điểm chạm riêng từng profile mục tiêu. Đây là socket tạm cho frame đứng; khi vẽ pose cast phải đo lại theo từng frame. Khi tích hợp, phần chạm phát bằng sự kiện hit thực; nhịp 0,32 s trong preview chỉ minh họa.

## Nguồn hiện hành

| File | Nội dung | Kích thước |
| --- | --- | --- |
| [Chuẩn ART](ngung-khi-approved-art-v1.png) / [timing board](kiem-khi-r01-timing-v2.png) | Chuẩn màu/nét và nhịp concept | PNG concept |
| [FX kiếm v2](kiem-khi-r01-fx-v2.png) | Kiếm, trail, tụ, nét tan | 1536 × 1024 RGBA |
| [Hit dùng chung v1](kiem-khi-r01-universal-hit-v1.png) | Lõi chạm, khí hồi, mảnh linh quang, dư khí | 1254 × 1254 RGBA |
| [Vương Lâm native](wanglin-chibi-stand-east-native-v1.png) | Bản sao frame main game | 64 × 96 RGBA |
| [Mẫu PvP](pvp-target-stand-west-native-v1.png) | Bản sao frame nữ đứng hướng tây | 64 × 96 RGBA |
| [Sân game](sect-courtyard-game-reference-v1.png) | Bản sao sân trống, render world 960 × 640 | 1536 × 1024 PNG |
| [Metadata](kiem-khi-r01-source-manifest.json) | Source rect, cỡ world, anchor, camera, prompt | JSON v0.2 |
| [Xuất kiếm](kiem-khi-r01-wanglin-pvp-release-v2.png), [chạm](kiem-khi-r01-wanglin-pvp-impact-v2.png), [dư khí](kiem-khi-r01-wanglin-pvp-residue-v2.png) | Xuất trực tiếp từ canvas ở zoom 1× | 946 × 640 PNG |

Atlas hit mới được tạo bằng **imagegen tích hợp**, tham chiếu FX kiếm đã có. [Prompt chính xác](kiem-khi-r01-universal-hit-v1.prompt.txt) được lưu cạnh nguồn. Atlas trong generated_images được giữ; sprite và map là bản sao nguyên vẹn của asset dự án. Renderer đọc source rect trực tiếp, không chỉnh bitmap bằng mã.

## Kết quả kiểm v2

- Trình duyệt: bốn nhịp; ánh chạm/dư khí trên nhân vật/PvP; đổi điểm neo ở profile quái/boss; đánh hụt không phát hit/residue. Không có lỗi/warning trong lượt kiểm cuối.
- 1×: frame 64 × 96, kiếm 96. 2×: frame 128 × 192, kiếm 192. 4×: frame 256 × 384, kiếm 384 CSS px.
- Khung hẹp thực tế 360 × 400: vẫn frame 64 × 96, kiếm 96 ở 1×; sân bị cắt theo frustum.
- Atlas hit có alpha 0–253, khoảng 60,2% pixel trong suốt hoàn toàn. Source rect nằm trong atlas; sprite main/target đúng 64 × 96.

## Giới hạn và lịch sử

Vương Lâm hiện dùng **frame đứng** của game; pose kiếm chỉ và chuyển động tay áo chưa được sản xuất native. Quái/boss chỉ kiểm vùng chạm, chưa có sprite hoặc phản ứng trúng đòn. Đây là animatic tách lớp, chưa là flipbook nhiều frame, đủ hướng, combat hoặc benchmark đám đông.

[Bản v1](kiem-khi-preview-v1.html), [metadata v1](kiem-khi-r01-source-manifest-v1.json), atlas pose và scene có bia được giữ để truy nguyên; không còn là bản hiện hành. Không thay client/server hoặc manifest runtime. Tiếp theo của P1 là pose cast native cho Vương Lâm, chuẩn hướng/socket và tích hợp theo sự kiện combat, rồi mới mở Lôi Ấn và Ngự Phong Bộ.
