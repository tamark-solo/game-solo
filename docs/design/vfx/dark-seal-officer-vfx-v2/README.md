# Hắc Ấn · Triện Thuật02

Owner thấy VFX01 thiếu đặc sắc và muốn trải nghiệm rõ hơn. Bộ02 tạo **tám sequence / 48 frame mới**, bằng ImageGen built-in, với prompt/input/raw RGBA/hash trong gói này. Xem [sân A/B cùng body, camera và tuổi chiêu](index.html). Owner đã duyệt bộ VFX02 đang xem ngày13/10/2026: “quá ổn rồi đó”. [Approval theo hash](approval.json) áp cho tám sequence/48frame và chuyển động VFX/presentation đã xem; không duyệt body Motion01, gameplay balance hoặc âm thanh production.

## Ba hình chiêu riêng

| Chiêu | Tụ → phát → kết thúc |
| --- | --- |
| Đạo Ấn · Phán Quyết | Bốn góc triện khóa thành ấn ngà–đồng → mũi triện gồm đầu hình thoi và lớp ô mực → dấu triện vỡ tại contact đã xác nhận |
| Phân Phù · Ly Ảnh | Phù giấy mở thành hình thoi rỗng, hai cổng phù mờ bao dư ảnh lúc khóa → ba lưỡi phù xòe quạt → hai dư ảnh tan thành giấy và chỉ mực lệch80ms |
| Ấn Hồi · Quy Tâm | Các thẻ ấn dưới đất sáng dần → móc khí kéo vào tâm rồi rã → khe90° phía sau hướng khóa luôn rõ |

Lõi ngà sáng, viền mực than và đường triện đỏ tạo tương phản trên đá Vân Ngọc; hình vuông, giấy gấp và vòng trận có silhouette khác nhau. Charge đặt sau body; ground trước body/depth, release và contact ở lớp riêng. Tụ, bộc phát và tàn khí đọc tuổi tuyệt đối của Core, không random spawn mỗi frame.

Chưởng Ấn và xuất hiện vẫn dùng FX01 trong review. Bộ02 tập trung ba chiêu chính; body72clip/432pose, kit, socket và fixture của Motion01 được pin **1.482 file nguyên byte**, kể cả VFX01. Phản hồi VFX không suy duyệt tám view/body/socket/gameplay.

## Nguồn và registration

Tám nguồn thật, mỗi nguồn3×2/sáu frame. Mỗi sequence một scale; canonical nearest giữ soft alpha và mọi mảnh rời, không áp threshold body, không largest-component, không repaint hoặc fit từng pose. Atlas gutter2px; [registration](registration.json) lưu crop, origin, scale, alpha/core bounds và offset. Scale theo peak alpha64 width cho các lớp trên thân.

Hai vòng ground dùng một scale theo **max radius112px** của alpha64 qua sáu frame, theo outerRadius fixture. Origin có một offset chung/sequence từ median residual circle-center của ba source cell đầu; không recenter từng frame. Witness ở registration là candidate để duyệt. Không kéo ellipse khác nhau mỗi frame. Canvas mở rộng đủ haze gốc, không co bitmap để cắt alpha.

Khe90° có presentation clip trong [renderer](renderer.mjs), xoay theo hướng đã khóa. Clip chỉ che khí trang trí lọt khe, không sửa RGBA hoặc collider. Pixelsource còn nguyên; kiểm khe bằng render transparent của chính renderer cả hai vòng×sáu frame×tám hướng. FX source/glow không thay vùng gameplay.

Điểm neo projectile tiến từ release socket đến điểm torso của mục tiêu **lúc khóa**, không bám vị trí tương lai khi player né. Origin bitmap là tâm logic nguồn, chưa socket đầu mũi ấn được duyệt. Contact chỉ từ fact trúng fixture, hụt không impact; hủy trước release không phát FX hoặc dư ảnh. Hai lớp tan dư ảnh có tuổi riêng và không hit/entity/loot.

## Sân xem và trải nghiệm

Chọn Bộ VFX01/02 để A/B tại cùng tuổi, không reset pose hoặc vị trí. Có nút Tụ/Khóa/Phát/Tác động/Tàn, camera1×/nearest2×, map/sáng/tối, eight facing và hit/miss/cancel. Lặp lượt xem có thể tắt; hidden/offline/reduced motion dừng playback phù hợp. Cache decoded actor/FX16MiB loại map/browser/GPU tổng.

Âm thanh thử tổng hợp bằng WebAudio, mặc định tắt, chỉ bật bằng thao tác. Ba chiêu có cao độ khác, cue khóa/phát/contact gắn mốc facts. Contact âm chỉ khi trúng; seek/paused không phát, hidden/offline/tắt âm dừng voices, bounded dedup32/voices8. Đây là audition cue, chưa asset âm thanh production hoặc gameplay integration. Không rung camera hoặc chớp toàn màn hình.

Nguồn và review mới chỉ ghi gói02. Player323, Lang Vương556 và body Motion01/source/VFX01/map/plan được verify hash. Chưa AI/server/HP/sát thương/loot/DB/map/draft/catalog phát hành hoặc chốt balance. Đọc [checklist cụm](../../characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) khi ghép encounter có nhóm; giảm lớp phụ/dư ảnh trước, giữ body/warning/hit.

## Kiểm scoped

```powershell
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-dark-seal-officer-vfx-v2.py
node scripts/build-dark-seal-officer-vfx-v2-review.mjs
node scripts/finalize-dark-seal-officer-vfx-v2.mjs
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/verify-dark-seal-officer-vfx-v2.py
npm.cmd run test:dark-seal-officer-vfx-v2
npm.cmd run typecheck
```

Không full assets/build hoặc owner map builder. [Biên bản13/10](../../../data/dark-seal-officer-vfx-v2-2026-10-13.json) lưu source/pixel/browser/fixture và giới hạn kiểm. Kết quả kỹ thuật và [duyệt ART/VFX](approval.json) được ghi riêng; chưa là benchmark MMO. [Delivery](delivery.json) pin toàn gói; khi owner duyệt, pin đúng bộ02 và khóa root, sửa tiếp qua version mới.
