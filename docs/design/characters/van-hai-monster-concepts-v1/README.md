# Quái và tinh anh · concept Pixel01

**Tiếp nối13/10:** owner chọn các neutral này làm basis sản xuất. [Animation Pixel01](../van-hai-monster-animation-v1/index.html) đã có11actor/440clip/2640pose ở8view/năm action, [VFX riêng](../../vfx/van-hai-monster-vfx-v1/README.md). Nguồn concept/native giữ nguyên byte; metadata bên dưới mô tả gói một pose này. Motion/VFX mới vẫn chờ duyệt hình, chưa vào runtime.

13/10/2026 · Owner yêu cầu sản xuất **quái thường và tinh anh trước**. [Trang duyệt](index.html) / [bảng so 3×](review/lineup-3x.png) / [brief thế giới](../../world/van-hai-living-world-v1/plan.json).

Đã tạo **11 identity master**, mỗi mẫu **một neutral pose hướng Đông Nam**. Đây là art concept để chốt nhận diện, không phải 11 bộ animation hoặc actor mới đã vào gameplay. `artApproved=false`, `ownerApproved=false`, `runtimeConsumable=false`; catalog vẫn `unreleased/pending`. Bảy hướng còn lại và idle/move/attack/hit/death chưa sản xuất trong gói này.

| ID / tạo hình | Rank | Body mục tiêu / đo | Canvas · chân concept | Lift |
| --- | --- | --- | --- | --- |
| MOB-VH-CLOUD-WOLF · Vân Nha Lang | Quái | 50 / 50px | 128×96 · (64,88) | 0 |
| MOB-VH-TALISMAN-SPROUT · Phù Mộc Tinh | Quái | 58 / 58px | 112×96 · (56,88) | 0 |
| MOB-VH-JADE-SCUTE · Ngọc Giáp Trùng | Quái | 46 / 46px | 144×96 · (72,88) | 0 |
| MOB-VH-INK-BAT · Mặc Dực Bức | Quái | 42 / 42px | 160×96 · (80,88) | 16 |
| MOB-VH-CRACKED-PUPPET · Khôi Lỗi Rạn Ngọc | Quái | 72 / 72px | 128×104 · (64,96) | 0 |
| MOB-VH-SPIRIT-FUNGUS · Thực Linh Khuẩn | Quái | 48 / 48px | 128×96 · (64,88) | 0 |
| MOB-VH-DARK-TALISMAN-ROGUE · Tán Tu Hắc Phù | Quái | 80 / 80px | 96×96 · (48,88) | 0 |
| MOB-VH-QUIET-WISP · U Niệm | Quái | 58 / 57px | 128×112 · (64,100) | 8 |
| ELITE-VH-WOLF-CALLER · Lang Tuần Sơn | Tinh anh | 65 / 65px | 160×112 · (80,104) | 0 |
| ELITE-VH-JADE-GUARD · Thiết Giáp Linh Trùng | Tinh anh | 62 / 62px | 176×112 · (88,104) | 0 |
| ELITE-VH-BLACK-SILK-ADEPT · Phù Sư Hắc Lụa | Tinh anh | 80 / 80px | 112×96 · (56,88) | 0 |

## Nguồn và phép xử lý

Mode: **built-in ImageGen**, một call mỗi identity; giáp trùng tinh anh có thêm một lượt edit để tách nhận diện khỏi bản thường. [Prompt set](prompts/) / [input và hash](production.json) / [phép đăng ký](registration.json) / [lịch sử generation](generation.json). `raw/` giữ RGBA gốc; bản elite bị loại giữ `jade-guard-v1-rejected.png` và không đưa vào gallery.

Reference Pixel02 chỉ khóa cách xử lý pixel, camera và tỷ lệ người; creature có morphology riêng. Hai elite sinh vật dùng quái thường mới làm family reference. Khôi lỗi dùng thân mới, không thu nhỏ boss PNG. Dơi/U Niệm có lift và ground projection riêng. Không chép artwork thương mại.

`sprites/` là bản concept native resample nearest từ neutral, `pixelsResampled=true`. Trích một source/actor với một scale chung; alpha body phân loại tại ngưỡng210 rồi đăng ký support sole/root đã đo. Không vẽ thêm RGB, không fit riêng pose, không bỏ component của linh thể. Bản raw không đổi; alpha thấp quanh hình không thành aura runtime. U Niệm mất1px ở extremum sau quantization và ghi chiều cao thực57px, không kéo giãn để che sai số. Các root là mốc concept, cần kiểm thêm qua hướng và motion trước production.

Bóng ellipse ở sân review chỉ là lớp đối chiếu; không nằm trong bitmap. Phù gắn trên áo/cây là costume; đường tia/giấy bay/warning/bụi/impact là VFX sau này. Canvas/pivot trên chưa thay collider, core actor binding hoặc metadata runtime.

## Đối chiếu và tiếp nối

Gallery3×, canvas camera1×/2×, nền map/sáng/tối, silhouette, root và shadow toggle. Elite được đặt cạnh quái thường cùng họ; người chơi dùng master Pixel02 nguyên byte. Màn nhỏ giữ canvas native, cuộn ngang. Không gửi API game, không ghi save/map hoặc draft.

Sau duyệt hình: khóa neutral và palette → bảy view thật còn lại → năm action mỗi loài → separate warning/VFX → scoped runtime integration theo Core. Ưu tiên Vân Nha Lang và Phù Mộc Tinh để kiểm melee/caster trước; AI/timing/drop/respawn mới cần prototype và server authority riêng.

**Kiểm kỹ thuật:** native alpha/canvas/body/support-root/hash qua; gallery không cắt silhouette tại1440/1024/850/768/600/390px, camera1×/2× và các layer toggle qua; 323file basis đã duyệt cùng map background giữ nguyên hash. Review không API/storage write; world review và catalog96/7unit/5nhóm browser/4layout qua,84cảnh báo pending giữ đúng trạng thái. [Biên bản bàn giao](../../../data/monster-concepts-2026-10-13.json). Kết quả này không duyệt tạo hình hoặc chứng minh motion.

Builder chỉ viết root concept mới:

```powershell
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-monster-concepts-v1.py
node tests/smoke/van-hai-monster-concepts-smoke.mjs
```

Không chạy prepare hoặc ImageGen để verify; prepare là bước khởi tạo manifest, không exporter dùng lại cho bộ đã chốt. Kiểm kỹ thuật không suy duyệt hình.
