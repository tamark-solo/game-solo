# VFX quái và tinh anh · Khí thuật02

**Review cụm13/10:** owner nhận xét02 tốt, yêu cầu nhóm quái để kiểm chồng lấp. [Sân3–18con](../../characters/van-hai-monster-animation-v1/cluster.html#preset=escort&actor=jade-guard&count=6), [kết quả pixel/layer](../../characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) có full/managed, body/VFX không đổi. Positive single-actor feedback không suy duyệt formation/crowd/AI/runtime; managed alpha chỉ là candidate review.

13/10/2026 · Owner đánh giá tốt body animation nhưng VFX01 nhỏ, giống nhau và thiếu cảm giác tu tiên. Bộ02 thay hiệu ứng trong [trang playback hiện tại](../../characters/van-hai-monster-animation-v1/index.html), có chọn **VFX02 / VFX01** để so cùng body và tuổi action. [Catalog33sequence](catalog.json), [registration](registration.json), [body basis pin3.171file](body-basis.json), [prompt set](prompts/).

**11kit / 33sequence / 198frame**: mỗi loài có charge, release và contact riêng. Ba tinh anh không alias vệt của quái thường. Phản hồi owner áp cho body animation làm basis; không suy duyệt VFX02, prop/socket, gameplay hoặc runtime. Catalog body/atlas/canonical/source/registration giữ nguyên byte; bộ mới chỉ thay presentation review.

| Actor | Thuật art | Nhận diện |
| --- | --- | --- |
| Vân Nha Lang | Liệt Nha | Nanh ngọc trong xoáy gió, hai vệt cong |
| Phù Mộc Tinh | Xuyên Diệp | Mộc phù, lá ngọc và tia rễ xoắn |
| Ngọc Giáp Trùng | Song Kiềm | Đôi càng ngọc, vệt giao cắt và mảnh đồng |
| Mặc Dực Bức | Tước Ảnh | Cánh mực tím, viền lưỡi sáng |
| Khôi Lỗi Rạn Ngọc | Chấn Thạch | Ấn vuông, chấn đồng/thạch |
| Thực Linh Khuẩn | Tán Bào | Vòng bào tử ngà/vàng, nổ hạt |
| Tán Tu Hắc Phù | Liệt Ấn | Phù đỏ đơn, dải mực và giấy vỡ |
| U Niệm | Nhiếp Hồn | Tia ngọc lam, viền mực, vòng hồn vỡ |
| Lang Tuần Sơn | Phong Nha Trận | Ba nanh gió và hình trận xoáy |
| Thiết Giáp Linh Trùng | Trấn Ngọc Kiềm | Ngọc giáp/kim cương, kiềm nặng và giáp vỡ |
| Phù Sư Hắc Lụa | Tam Phù Liên Ấn | Ba phù liên tam giác, hắc lụa và ba tia |

Tên thuật là nhãn art mới để phân biệt, chưa là skill definition hoặc cơ chế combat đã mở. Peak core release mục tiêu82–110px với thường/140–150px với tinh anh, contact44–82px; khoảng này là cỡ ART, không phải range/damage. Charge34/50px. Không phóng body để làm đòn mạnh hơn.

## Nguồn và alpha

Mode **built-in ImageGen**. 22 PNG source, prompt/input/tool/output/hash đều lưu tại đây. 11sheet6×3 dùng charge/contact; phần release trong sheet đầu có vệt sát nhau nên giữ nguồn để truy dấu, không chọn row đó làm atlas active. 11sheet release3×2 mới có khoảng alpha rộng. Native được trích theo gutter đã đo, giữ mảnh rời và alpha mềm. Không binary-threshold VFX hoặc tô lại RGB.

Một scale/phase tính từ peak core alpha≥64 của sáu frame; alpha64 chỉ là mốc **đo**, không cắt soft alpha. Canvas mở rộng để giữ toàn bộ halo/shards thay vì co core cho vừa haze. Source origin dùng logical cell center đã yêu cầu, sourceRect đo độc lập; origin/socket vẫn cần duyệt khi bind runtime. Nearest sampling được ghi rõ; tip mảnh có thể mất vài px và biên bản ghi cỡ core thực, không stretch riêng frame. Gutter alpha≥8 phải trống tại cut, whole-alpha được giữ trong cell.

24fps, six poses/sequence, durations/phase ms; release/contact417ms, charge được sample theo span windup của body. Không loop FX. Frame/atlas gutter2px, canonical parity/hash. **Cơ thể3.171file**,323file Vương Lâm đã duyệt và nền map giữ nguyên hash qua verify.

## Nhịp và ghép layer

Tụ lực bắt đầu ở nhịp warning, theo hand/core hoặc ground projection. Heavy/spore đặt charge dưới body với perspective riêng. Release khóa điểm xuất ở pose3; caster đi tới điểm fixture, melee không bị kéo theo bàn tay recovery. Contact chỉ có với fact Trúng; hụt không contact, hủy trước release dừng cả bộ. Body clock và FX lấy tuổi tuyệt đối Core, không thêm timer chạy tự do. Dissipation là opacity theo tuổi, giữ PNG gốc; đuôi FX có tuổi riêng sau body complete để không đứng lại ở frame cuối.

Preview giữ body native và cùng framing khi chuyển VFX01/02, zoom nguyên lần; canvas có thể tăng chiều cao/chiều rộng ở3× để không cắt vệt. Màn nhỏ cuộn trong sân review, không fit/phóng actor. Warning cone/line/radial là fixture geometry để đọc ý đòn, không xuất vùng damage. Không API game/storage/DB/map/draft writes, không mở skill/AI/drop. Cache actor/FX16MiB giữ hữu hạn, map/player cố định ngoài LRU; chưa benchmark GPU/đám đông MMO.

## Đóng gói và kiểm

```powershell
python scripts/pack-monster-vfx-v2.py
python scripts/verify-monster-vfx-v2.py
npm.cmd run test:monster-vfx-v2
npm.cmd run test:monster-animation-review
npm.cmd run typecheck
```

Python cần Pillow/NumPy. Prepare/generation không thuộc đường verify; không re-gen để test. Pack chỉ viết VFX02, không owner map builder. Motion body được giữ làm basis theo feedback; VFX02 `artApproved=false`, `runtimeConsumable=false`. Tiếp theo duyệt hình/nhịp rồi scoped Core integration với server-confirmed hit facts. Không copy fixture vào gameplay.
