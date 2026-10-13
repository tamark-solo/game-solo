---
name: game-actor-animation-production
description: Produce and review player, monster and boss sprite animation packs for Van Hai Dao Do in game-solo using the accepted pixel-chibi style, neutral calibration, measured world-foot pivots, eight real directional views and separate VFX. Use for actor ART production and extraction/packing fixes, not gameplay mechanics, HUD or map artwork.
---

# Sản xuất animation nhân vật Vân Hải

**Chuẩn NPC owner chốt 13/10:** lấy Vương Lâm Pixel02 đang dùng trong game làm chuẩn gốc tỷ lệ, anatomy người, nét pixel và đổ màu. Đọc docs/design/characters/van-hai-npc-visual-standard-v1/basis.json và directions.json (frame thật từ atlas live, pin hash). Khi tạo human NPC neutral, image1 là Vương Lâm cùng hướng; concept NPC chỉ cung cấp nhận diện/phục trang ở input hỗ trợ. Trần Duy v3 là NPC đối chiếu, không thay Vương Lâm làm chuẩn hoặc tạo chuỗi NPC→NPC. Khi làm action, khóa nhận diện riêng của NPC và so trực tiếp với Vương Lâm ở native1×.



Owner đã chốt Vương Lâm Pixel02 + Ngự Phong01 ngày12/10/2026 và yêu cầu lưu quy trình để làm các nhân vật tiếp theo. Đọc `AGENTS.md` và `docs/ACTOR-ANIMATION-PRODUCTION.md` trong workspace để lấy trạng thái mới nhất. [Quy trình sản xuất và QA](references/production.md) có nguồn, cách chuẩn bị sheet, registration và các lỗi đã gặp.

## Chọn đúng mốc và phạm vi

- Nền hiện hành: `docs/design/characters/actor-animation-standard-v2/approval.json`; 40clip/240pose, idle/run/Kiếm/Lôi/Phong đủ tám hướng. Approval pin source/canonical theo hash, áp cho ART/motion đã xem; chưa là full player, live/server hoặc cân bằng.
- Tiếp nối combat01: `docs/design/characters/wang-lin-pixel-combat-v1/`,40clip/240pose hit/death/attack1–3 candidate; review tổng80clip/480pose. Mới qua kiểm kỹ thuật, không mở rộng approval40. Không walk/sprint player riêng.
- Hai gói nguồn đã duyệt: `wang-lin-pixel-production-v2` và `wang-lin-pixel-wind-v1` dưới `docs/design/characters/`. Review gộp nằm ở wind01. Không khôi phục body cũ làm fallback để tuyên bố đủ bộ.
- Làm actor/appearance mới theo neutral master của actor đó; kế thừa pixel treatment và quy trình, không ép anatomy Vương Lâm lên quái/boss. Không đổi mặt/tóc/cỡ đầu khi chỉ thêm action hoặc áo.
- Xác định actor, master, action × hướng và ART review hay runtime integration từ yêu cầu. Tiến hành với thông tin đã có; chỉ hỏi khi thiếu quyết định nhận diện/phạm vi. Hướng thiếu được ghi rõ, không mirror để giả đủ tám.

## Giữ anatomy và world foot

**Player locomotion chốt12/10:** bỏ clip đi bộ riêng. Di chuyển thường và giữ Shift tăng tốc đều dùng cùng tám clip `run`; không cần bộ sprint riêng. Phase chân theo quãng đường thực/stride chung, giữ phase khi đổi Shift và dừng phase nếu blocked. Tốc độ/chi phí do gameplay xác nhận, không chốt cân bằng bằng FPS ART. Quyết định này áp cho player, không tự bỏ walk/gait riêng của quái/NPC. Sau bộ40clip, hit → death → attack1/2/3 đã có candidate combat01; kiểm hình/motion trước pin. Không đặt walk vào ma trận thiếu của player.

Vương Lâm: locomotion64×96/pivot(32,88), nominal standing80px, camera1×; Kiếm/Lôi96×96/(48,88), Phong112×96/(56,88). Canvas lớn chỉ là padding, không phóng cơ thể/collider. Hit96×96/(48,88), attack112×96/(56,88), death160×96/(80,88) của combat01 đang review, không thay scale người. Actor khác dùng contract riêng đã đo.

Có neutral calibration trong mỗi nguồn mới; đo một scale chung/nguồn, đối chiếu đầu, mặt, vai và thân với master cả đầu/hồi action. **Đủ height80 không chứng minh anatomy đúng. Không fit bbox từng pose.** Lunge/crouch/death được thấp tự nhiên.

Đo root/floor có căn cứ, không lấy tâm bbox làm chân hoặc tự kéo root theo vạt áo/đầu nghiêng. Với Phong hiện hành, soles end87/ground88; lift0–3px là presentation riêng, world foot/shadow/depth giữ đất. Bay/ngã phải đăng ký root và lift theo động tác, không áp lowest-boot rule máy móc.

Body, vũ khí/đạo cụ, aura, skill FX và bóng lịch sử là các lớp riêng. VFX vô hướng dùng chung tám hướng; hiệu ứng có hướng dùng vector/socket đã đo. Không bake trail/glow/ghost vào thân.

## Tạo, trích và kiểm

Tạo/chỉnh raster bằng skill `imagegen`, built-in mặc định. Xem input local trước; chỉ rõ identity master và style reference, phần đổi và phần giữ. Lưu raw RGBA, prompt/input/hash/provenance vào **gói mới có version trong workspace**. PixelLab tham chiếu chưa được tích hợp; nếu resample thì ghi đúng `pixelsResampled`.

Một sheet/một hướng/nhóm action vừa kiểm được. Neutral6 + action6 là recipe Phong đã dùng, không định mức cho mọi action. Nam phải front, Bắc phải back trong cả seal/launch/glide; không chỉ kiểm neutral. Xem source trước extraction.

Trích theo mask/part đã đo; kiểm mảnh hàng/cột bên cạnh, chi tiết rời, alpha/clipping. Largest-component chỉ hợp body liên thông, không dùng cho VFX. Giữ palette/sampling và alpha theo bộ; binary-alpha128 chỉ là lựa chọn pixel body này, không áp cho soft FX.

Đóng canonical PNG, atlas rect/gutter2px, scale/root/offset/source mapping, FPS/holds/loop/holdLast, pivot/socket/lift/bounds/hash và coverage. Scripts hiện hành khóa gói đã chốt; parameterize/tạo tooling cho root mới, đọc chế độ ghi trước khi chạy. Không replay ImageGen để validate skill hoặc tái dựng baseline.

## Clock, Core và bàn giao

Nhịp thuật R01 thuộc `docs/SKILL-CORE.md`: Kiếm16tick, Lôi17tick, Phong14tick tại24FPS. ART label không gây damage, movement, stun hoặc invulnerability. Animation lấy tuổi tuyệt đối; locomotion runtime theo quãng đường thực, không số render.

Bóng Phong lấy **lịch sử pose/vị trí** trễ2/4tick, opacity0,30/0,18; không trừ vector cố định từ vị trí hiện tại. Ghép FX theo cast/release/arrival đã xác nhận, depth theo world foot; snapshot trễ tiếp tục đúng tuổi.

Xem native1×, zoom nguyên lần, nền sáng/tối, strip/matrix, loop cuối→đầu, đổi action/hướng và map1×. Kiểm canonical/atlas/source/basis hash và Three UV/pivot/alpha/texture swap thực; lifecycle hidden/offline/reduced motion, cache hữu hạn và responsive khi có review. Test kỹ thuật tách khỏi duyệt hình.

Chỉ tích hợp game khi được yêu cầu, theo facts → timeline/presentation → catalog → renderer; chạy hồi quy phù hợp trong fixture. Không thay gameplay để che ART hoặc chạy owner map builder vì sửa sprite. Giữ map/navigation/blockers/DB/draft và thư viện tùy biến owner yêu cầu lưu.

Bàn giao playback/map, nguồn/prompt/metadata, kết quả kiểm và phạm vi approval/readiness. Khi owner duyệt, pin đúng file/hash/phạm vi làm basis. Dọn bộ superseded khỏi luồng active sau khi tách caller; ZIP lưu trữ kiểm hash/khôi phục được. Không tự dọn live dependency, reference hoặc concept tùy biến đã yêu cầu giữ.
