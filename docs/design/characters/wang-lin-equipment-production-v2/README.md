# Huyễn Tâm và Tịch Bạch · Tám hướng / bốn đạo đồ

Owner đã duyệt [pilot P1–P3](../wang-lin-equipment-production-v1/approval.json) và yêu cầu mở đủ tám hướng Kiếm linh cho cả hai nhân vật, rồi Hồn phiên → Xạ Thần Xa → Thiên Nghịch Châu theo [kế hoạch](../../../WANG-LIN-IMPLEMENTATION-PLAN.md).

[Review](index.html) · [Coverage thực](manifest.json) · [Tiến độ](progress.json) · [Basis bất biến](basis.json)

Mốc II đã đóng đủ **512 clip / 3.048 key / 64 view trang bị / 512 gear track / 40 FX sequence / 240 FX key** cho cả hai nhân vật. CPU toàn gói 82.278 checks, lineage 6.895, browser 27.526 và 7.865 lượt render Three GPU đã qua; Core prototype 38/38. [Checkpoint Bead](checkpoints/bead.json) khóa 5.368 file kỹ thuật; isolated export có 512 clip và 5.348 asset file theo SHA. Toàn bộ body/gear/FX mới vẫn là candidate để owner duyệt ART/motion/VFX, chưa mở runtime/balance.

## Phạm vi

Mốc II gồm hai identity × bốn bộ áo/pháp bảo × tám hướng thật × tám action: idle/run/hit/death/meditate/gather/cast đơn/cast AOE. Mục tiêu 512 clip cơ sở; pose/hold mỗi action theo nguồn và nhịp thực, không ép mỗi clip thành sáu ảnh. Combo F, registry/equip/save và runtime là bước riêng.

Thứ tự sản xuất đã hoàn tất là Kiếm linh → Hồn phiên → Xạ Thần Xa → Thiên Nghịch Châu. Manifest ghi đủ binding thực cho hai identity; mọi view/action dùng nguồn own tương ứng và không mirror, không thay bằng Wang hoặc giả motion bằng neutral.

## Nguồn và các lớp

Ảnh mới dùng **ImageGen built-in**, raw RGBA/prompt/input/original hash lưu trong `actors/a/`, `actors/b/`, `gear/` và [gói FX mới](../../vfx/wang-lin-equipment-vfx-v2/). Nguồn sai góc hoặc pose không hợp loop giữ history. Own identity/outfit khóa mặt, tóc và phục trang; Wang cùng hướng chỉ cung cấp căn cứ tỷ lệ người và nét pixel.

Body 80 px đo từ neutral của từng nguồn, một factor/source. Body motion 112×112/(56,104), death có padding rộng nếu cần; canvas không tăng thân. Foot lấy boot hoặc semantic ground cho ngã; socket lấy đúng bàn tay/forearm của mỗi pose. Seal, palm mở hoặc tay che được ghi rõ, không ép thành grip nhìn thấy.

Lift của pose đã nằm trong phép dịch đăng ký nguồn và pixel canonical. Renderer đọc file/pivot, không trừ lift thêm vào body hoặc điểm tay.

Trang bị có nguồn perspective riêng, mỗi view có hilt/base đo và layer trước/sau. Track tại `tracks/` chỉ dịch/xoay trong mặt phẳng quanh anchor đã đăng ký, giữ scale/source và pixel body nguyên byte. Che tay là crop RGBA từ chính pose đang vẽ. Phiên/thiết bị đặt đất, Châu bay trên tay, ngự kiếm tách/thu theo policy; không dùng artwork gear làm hit.

Hồn phiên có nhịp dựng phiên riêng: tư thế sẵn sàng có thể cầm cán, từ key charge tiếp theo chân phiên giữ tại điểm đất đã đo, hai tay kết ấn hoặc mở trận. Nguồn đã chắp tay ngay key đầu dùng phiên đặt sẵn. Điểm chân lấy pixel đầu cán ở 16 view, không lấy đáy vải; movement/source socket vẫn ghi đúng bàn tay mở hoặc che. Xạ Thần Xa giữ thiết bị trên đất và body điều khiển; Châu dùng tâm orb bay trên palm/forearm đã đăng ký, không giả nắm chuôi.

Pilot 831 file giữ nguyên byte. SE đọc nguyên body/gear pilot; N đọc nguyên pixel body cũ và ghép perspective gear mới trong track V2. Holds cast N ở V2 theo fixture release480/800ms, để key phát và điểm kiếm tách khớp Core; timing này vẫn candidate, không sửa clip/source pilot. FX Kiếm linh 10 sequence/60 frame giữ nguồn đã duyệt. FX ba họ mới độc lập warning/charge/release/resolve/tail và warning/deploy/active/contact/collapse; kit có thể dùng chung A/B, body nhận diện riêng.

## Cơ chế và kiểm

[Core prototype](../../gameplay/wang-lin-equipment-prototype-v1/README.md) vẫn cung cấp tám ST/AOE: geometry khóa origin/aim, pulse/cap/LOS/life/cancel/dedup, Châu có support/control riêng. Renderer đọc fact vị trí đã xác nhận; bitmap không gây damage/credit. Sân chỉ dùng fixture, các số timing/range/cap chưa là balance live.

Scoped tooling V2: `build-manifest.mjs`, `pack-tracks.py`, `render-contacts.py`, `verify-production.mjs`, `review/browser-verify.mjs`. Verifier kiểm nguồn/canonical/atlas/layer/socket/coverage và basis bất biến; browser dùng private Chromium/HTTP đọc file, kiểm native 1×/2×/4×, playback/direction/lifecycle/cache và GPU texture/atlas UV thật. Không chạy builder map hoặc assets build tổng.

`verify-lineage.mjs` đối chiếu cả nguồn được chọn và nguồn history với prompt, input snapshot, đường dẫn kết quả ImageGen gốc và SHA. Input sửa bố cục vẫn là nguồn của chính nhân vật; nhận diện riêng giữ vai trò điều khiển. `freeze-family.mjs` chỉ đóng checkpoint kỹ thuật sau khi đủ body/track/view/FX, manual review, CPU, browser và Three GPU; checkpoint này không là owner ART approval. Các họ tiếp theo giữ được nguồn và track của họ đã kiểm.

`sync-review.mjs` xuất dữ liệu presentation và bitmap vào fixture riêng trong `output/review/`, kiểm byte và giữ lineage gốc trong workspace. Sau đủ bốn họ, `finalize-delivery.mjs` / `verify-delivery.mjs` pin gói mới, nguồn FX, fixture xuất và kiểm lại toàn bộ basis. Bỏ `--final` ở `verify-production.mjs`, `verify-lineage.mjs` hoặc `verify-delivery.mjs` để chỉ đọc và đối chiếu dữ liệu.

Sân AOE chọn pose nhân vật độc lập với điểm ngắm. Gear tách khi phát kiếm cần release fact đã nhận; facts trễ giữ tuổi gốc. FX hộ đạo/khống chế cắt và đi hết các key theo duration của từng fact, kể cả khi trường đã bị hủy. Tượng hồn, linh thú và nội giới là artwork cố định theo camera tại anchor của Core, không phải entity hoặc bộ tám view của sinh vật.

**Artwork mở rộng vẫn candidate; chỉ bộ pilot đã có approval.** Coverage và báo cáo chỉ ghi tài sản thực đã đóng gói. Owner map/navigation/DB/draft/receipt/runtime giữ nguyên.
