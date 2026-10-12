# Vương Lâm · Combat pixel01 · 12/10/2026

[Mở review](index.html): master đã chốt cạnh body mới, native1×/2×/4× và map Hằng Nhạc camera1×. Chọn **Chạy** rồi giữ **Shift**; chọn **Combo ba đòn nối** để xem nhịp liên tiếp. Gục giữ pose cuối, dùng **Phát lại** để bắt đầu lại.

Owner đã chọn bỏ animation đi bộ riêng: normal và Shift-fast cùng tám clip run hiện hành, phase theo quãng đường/stride chung. Không tạo sprint riêng hoặc đổi tỷ lệ cơ thể; giữ phase khi Shift đổi và dừng phase khi không có quãng đường. [Quyết định locomotion](../actor-animation-standard-v2/locomotion-policy.json) áp cho player, quái/NPC vẫn có gait riêng khi cần. Tốc độ80/120px/s trong review lấy baseline sân fixture để so sánh, chưa là cân bằng MMO.

## Ma trận ART

| Nhóm | Clip / pose | Trạng thái |
|---|---:|---|
| Idle, run, Kiếm, Lôi, Phong ×8 hướng | 40 / 240 | Đã duyệt; [323 hash nguồn/canonical](../actor-animation-standard-v2/approval.json) giữ nguyên |
| Hit, death, attack1/2/3 ×8 hướng | 40 / 240 | Mới sản xuất, chờ đánh giá ART/motion |
| Tổng core body trong review | **80 / 480** | Đủ hướng và action trong ma trận core này |
| Đả tọa, thu thập, cưỡi thú/ngự kiếm, emote/cutscene | Chưa sản xuất | Tiếp nối; chưa full mọi action player |

[Catalog gộp](current-pack.json) có80clip với đường dẫn nguồn, hash ba catalog, phạm vi40approved/40candidate và action còn thiếu. Dùng để review, chưa đưa vào scoped public sync của bộ40 đã duyệt.

Body combo có thế chưởng/chỉ ấn để tách vũ khí/đạo cụ/FX. Đây là motion body, chưa thay luật đòn thường hay quyết định damage, tầm đánh hoặc hitbox. Chưa thay actor live hoặc dựng quái/boss mới từ bộ này.

**VFX bổ sung:** [Thanh Ngọc01](../../vfx/basic-attack-jade-v1/README.md) có ba vệt khí và hai impact/30frame riêng;24 điểm tay đo trên body hiện tại. Review thêm hit/hụt, FX toggle, seekms và âm thanh ngắn tự tổng hợp. Body80clip giữ nguyên; nguồn/prompt/hash VFX ở gói riêng, chưa nối server/live.

## Nguồn và registration

Raster tạo bằng **ImageGen built-in**, không phải API PixelLab hay skeleton rig. [Production plan](production-plan.json), 16sheet nguồn RGBA và prompt trong [sources](sources/), master8 hướng upscale nearest trong [inputs](inputs/) đều lưu tại workspace. Mỗi hướng có neutral6 + hit6/attack6/attack2 six; sheet thứ hai neutral6 + attack3 six/death6. Không mirror để giả tám hướng.

Scale80px được đo từ median neutral của mỗi sheet, dùng chung cho toàn sheet, nearest + palette bộ đã chốt + binary alpha128. Không fit bbox từng pose; cúi/ngã thấp tự nhiên. RootX lấy cột neutral, contact theo boot/contour chạm đất ở source, ground88 sau quantization. Death giữ root của cột, không lấy tâm bbox người nằm. [Catalog](catalog.json) ghi nguồn/hash/scale/rect/root/offset, FPS/holds/loop/holdLast và atlas gutter2px.

| Action | Canvas / pivot | Duration / release |
|---|---|---|
| Hit | 96×96 / (48,88) | 200ms, lấy lại thế |
| Death | 160×96 / (80,88) | 1000ms, giữ pose6 |
| Attack1 | 112×96 / (56,88) | 400ms / 200ms |
| Attack2 | 112×96 / (56,88) | 666⅔ms / 333⅓ms |
| Attack3 | 112×96 / (56,88) | 750ms / 416⅔ms |

Death160×96 chỉ tăng khoảng trống chứa tóc/thân khi ngã, không tăng body/collider. Hit dùng30FPS để bám200ms của fixture; hai đòn sau24FPS, timing lấy nhịp Core fixture hiện có. Combo review nối ba clip thật, không thêm atlas thứ tư. FX Phong và bóng lịch sử vẫn dùng Core/R01 riêng.

[Matrix native](native-combat-directions.png) đặt master, neutral hai nguồn, hit và release/corpse của tám hướng cạnh nhau. Các strip chứa toàn sáu pose mỗi action. Việc đủ80px và test pixel không chứng minh anatomy hoặc motion đã được owner duyệt; cần xem đầu/mặt/tóc/thân, chuyển về idle và root ngã ở cỡ chơi.

## Kiểm và phạm vi

- [Asset verification](../../../data/wang-pixel-combat-v1-verification.json): 16source, 40clip/240pose, hash323file đã chốt giữ nguyên, một scale/source, alpha/padding/atlas/pivot và timing đúng.
- [GPU verification](../../../data/wang-pixel-combat-v1-gpu-verification.json): 240frame khớp pixel CPU trong Three native1×, không pixel thừa. SwiftShader chỉ kiểm correctness, chưa benchmark thiết bị.
- [Browser verification](../../../data/wang-pixel-combat-v1-browser-verification.json): 480frame của80clip, combo18pose/ba segment, death giữ cuối, run/Shift cùng clip, phase/distance dừng khi pause; map32part; responsive320–1366, budget/lifecycle/offline/reduced-motion.
- Unit fixture kiểm normal/Shift đều chọn run, không reset actionAt, speed cũ giữ nguyên. Client helper chỉ lấy phase trình bày từ distance, không sở hữu movement/gameplay.

Chạy scoped: `npm.cmd run test:actor-animation-combat`. Build ART chỉ root này: `node scripts/build-wang-pixel-combat.mjs`; record kiểm source đã lưu, không ghi lại baseline. Không chạy owner map builder, ghi DB thật hoặc replay ImageGen để kiểm.

Bước kế tiếp: review hình/motion mới → pin file được duyệt → adapter cả actor vào sân server → bổ sung action sinh hoạt, rồi sản xuất quái áp sát/boss theo neutral riêng.
