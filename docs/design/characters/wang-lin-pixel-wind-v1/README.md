# Vương Lâm · Ngự Phong Bộ pixel01

**Chốt/cleanup12/10:** owner đã duyệt bộ này làm production basis; [approval theo hash](../actor-animation-standard-v2/approval.json). Review thống nhất40clip/240pose không nạp bộ cũ; source không chọn/pilot/study đã [archive](../../../archive/actor-animation-pre-pixel02-2026-10-12/README.md). Catalog/canonical/source được chọn giữ nguyên; builder/record khóa ghi. Các trạng thái candidate trước đó dưới đây là lịch sử; scope runtime vẫn chưa đầy đủ.

**12/10/2026:** owner nhận xét **“rất tốt rồi”** về [Pixel02 tám hướng](../wang-lin-pixel-production-v2/README.md) và yêu cầu bổ sung Ngự Phong Bộ. [Basis](production-basis.json) pin242file: catalog, masters, sources,32atlas/192canonical. Phản hồi áp cho bộ đã xem;48pose Phong mới là ART review, không suy duyệt từ test.

[Mở review Ngự Phong Bộ](http://127.0.0.1:5174/@fs/C:/Users/Mark-TA/Documents/game-solo/docs/design/characters/wang-lin-pixel-wind-v1/index.html). Trang đọc chung192pose Pixel02, tổng **40clip/240pose** cho idle/run/Kiếm/Lôi/Phong. Chọn8hướng, seek, chồng neutral, đứng→thuật→đứng, bật/tắt FX, lướt hoặc xem tại chỗ trên scene Three32part/camera1×. Bộ sân thử ở cột giữa chỉ để đối chiếu.

## Body và nguồn

| Nội dung | Quy cách |
| --- | --- |
| Ngự Phong | 8clip/48pose; Nam, Tây Nam, Tây, Tây Bắc, Bắc, Đông Bắc, Đông, Đông Nam; hướng thật, không mirror |
| Sáu pose | Ready → kết ấn → bật lướt → lướt → hãm/đáp → hồi thế |
| Canvas / pivot | 112×96 / (56,88); thêm padding tóc/tay, không phóng anatomy/collider |
| Registration | Neutral nominal80px, một scale/nguồn cho cả sáu pose; không fit mỗi bbox |
| Nhịp R01 | 24FPS, hold `[2,2,3,3,2,2]` =14tick /583,333ms; release166,667, recovery416,667 |

Raster tạo bằng **ImageGen built-in**, `pixelsResampled:true`; PixelLab/skeleton chưa tích hợp. Input1 master cùng hướng bắt buộc identity/anatomy; input2 matrix Pixel02 hỗ trợ style/camera. [Plan](production-plan.json), [generation](generation.json), [sources/prompt](sources/), [inputs](inputs/) và [catalog](catalog.json) lưu request/input/hash/source mapping. Raw RGBA được giữ; native nearest/palette người gốc, binary alpha, atlas gutter2px.

Mỗi nguồn có sáu neutral để đo scale80/median height, root từ boots neutral từng cột. Sole sau quantization ởpixel87, ground boundary88. Thân nghiêng không bị fit lại. `bodyLift:[0,0,2,3,1,0]` ghép riêng trong preview bằng anchor; world foot/xếp lớp/shadow giữ điểm đất thật. Tích hợp sau cần adapter lift tương ứng hoặc quyết định giữ thân sát đất; chưa thêm vào Core/save.

Nam/Bắc đã sửa front/back để không quay ngang lúc lướt. Hai nguồn đầu giữ trong `plan.rejected`, không vào atlas. Halo mềm source Nam bị loại theo binary-alpha pixel; raw source không sửa. [Matrix](native-eight-directions-2x.png) gồm master đã chốt, neutral mới và sáu pose để kiểm đầu/thân.

## FX và trình bày

Vòng xuất phát / vệt gió / vòng đáp dùng nguyên sequence R01. Hai bóng lấy từ lịch sử vị trí/pose trễ2/4tick, opacity0,30/0,18; không bake vào thân. Review dùng **SkillTimeline Core** và binding wind8hướng mới, giữ track R01. Facts cast/release/arrival và đường160px là minh họa cục bộ cho ART, không room/server/gameplay thật.

Tuổi tuyệt đối và hold24Hz; lịch sử được lấy mẫu24Hz để seek/render trễ dựng đúng bóng. Arrival dừng trail/phát vòng đáp. Tắt FX giữ nguyên body/phase/vị trí. Không đổi HP/MP/cooldown/va chạm/lưu hồ sơ. Màn hẹp ưu tiên actor mới trên map; canvas4×/map2×/matrix cuộn ngang có chủ ý. Hidden/offline dừng playback, reduced motion tĩnh. Cache canvas8MiB / atlas RGBA16MiB không phải tổng RAM/GPU hoặc nghiệm thu hiệu năng MMO/H5.

## Kiểm và tái xuất

- [Asset](../../../data/wang-pixel-wind-v1-verification.json):48frame,242hash basis,8source chọn/2source loại, source/input/prompt hashes, scale/nguồn, whole-body component, sole/alpha/canvas, atlas/gutter/14hold.
- [Three GPU](../../../data/wang-pixel-wind-v1-gpu-verification.json):48frame1× với bodyLift khớp canonical CPU, không sai UV/RGB/alpha/mảnh lạ. SwiftShader kiểm đúng ảnh, không đo thiết bị thật.
- [Browser](../../../data/wang-pixel-wind-v1-browser-verification.json):48seek/8hướng, release/arrival, ghosts lịch sử, tắt FX không đổi thân, lướt160px, scene32part, viewport1366/844/390/320,4×/2×, cache/auto-turn/offline/reduced motion; không storage/backend.

```powershell
node scripts/build-wang-pixel-wind.mjs
node scripts/verify-wang-pixel-wind.mjs
# Vite5174 chạy; không cần backend
node tests/smoke/wang-pixel-wind-gpu.mjs
node tests/smoke/wang-pixel-wind-browser.mjs
```

Builder chỉ ghi wind01 và kiểm basis trước ghi. Không gọi assets/map builder hoặc replay ImageGen. Nguồn/prompt/hash ở workspace; đường dẫn Codex output chỉ là provenance. ART/motion mới chờ owner xem, chưa thay live game/sân server. **Player bỏ walk/sprint riêng theo quyết định12/10**, dùng run cho normal/Shift. [Combat01](../wang-lin-pixel-combat-v1/README.md) đã thêm40clip/240pose hit/death/combo1/2/3 candidate. Cử chỉ/đả tọa/cưỡi/ngự kiếm/thu thập và adapter server còn cần làm.
