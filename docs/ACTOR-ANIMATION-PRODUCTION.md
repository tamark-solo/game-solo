# Chuẩn sản xuất animation nhân vật · Vân Hải02

**Duyệt tạo hình GDD 0.34 / dọn ART đối thủ cũ ·15/10:** owner chấp nhận 18 neutral main/NPC/truyện/quái/boss trong [gói GDD mới](design/characters/gdd-character-concepts-v1/README.md), pin đúng source/native/lineage tại [approval](design/characters/gdd-character-concepts-v1/approval.json); một hướng Đông Nam, chưa motion/FX/runtime mới. Theo yêu cầu cleanup, 10 gói quái/tinh anh/Boss GDD cũ cùng 67 tool/test đã chuyển vào [ZIP lưu trữ kiểm hash](archive/gdd-legacy-enemies-2026-10-15/README.md); các mốc ART đối thủ ngày13/10 trong tài liệu trước đây là lịch sử trong archive. Không dùng lại hoặc tái sinh bộ cũ ở luồng active. Roster/logic GDD, main V5/V1/V2, NPC, reference và bộ Lang/Khôi Lỗi đang chạy vẫn được giữ. [Biên bản](GDD-LEGACY-ENEMY-ASSET-CLEANUP-2026-10-15.md).

**Chuẩn NPC owner chốt 13/10:** lấy Vương Lâm Pixel02 đang dùng trong game làm chuẩn gốc tỷ lệ, anatomy người, nét pixel và đổ màu. Đọc docs/design/characters/van-hai-npc-visual-standard-v1/basis.json và directions.json (frame thật từ atlas live, pin hash). Khi tạo human NPC neutral, image1 là Vương Lâm cùng hướng; concept NPC chỉ cung cấp nhận diện/phục trang ở input hỗ trợ. Trần Duy v3 là NPC đối chiếu, không thay Vương Lâm làm chuẩn hoặc tạo chuỗi NPC→NPC. Khi làm action, khóa nhận diện riêng của NPC và so trực tiếp với Vương Lâm ở native1×.

**Bàn giao runtime13/10:** [trạng thái mới](GAME-ACTOR-RUNTIME.md) đã ghép Vương Lâm96clip, thổ nạp/thu thập16clip, VFX F theo server và R01 body/ghost pixel8. Lang40clip/Khôi Lỗi64clip được lấy có chọn lọc từ nguồn archive sang gói02, đã nối encounter. Basis40/323hash nguyên; ART bổ sung vẫn candidate. Các đoạn “chưa live/chưa sinh hoạt” dưới đây giữ mốc trước merge/triển khai; cử chỉ/mount/ngự kiếm/cutscene vẫn tiếp nối. Scoped `assets:game-actor-actions` / `test:game-actor-actions` không gọi owner map builder.

**Chốt12/10/2026:** owner chấp nhận bộ pixel mới và Ngự Phong, yêu cầu dọn bộ cũ và lưu skill cho nhân vật tiếp theo. [Approval pin323file](design/characters/actor-animation-standard-v2/approval.json), [chuẩn hiện hành](design/characters/actor-animation-standard-v2/README.md), [skill và recipe](skills/game-actor-animation-production/SKILL.md).

**Đợt combat12/10:** [Hit/death/combo mới](design/characters/wang-lin-pixel-combat-v1/README.md) thêm40clip/240pose tám hướng, tổng80clip/480pose trong [review](design/characters/wang-lin-pixel-combat-v1/index.html). Bộ mới là ART candidate; bộ40clip đã chốt giữ nguyên. Core body đủ action/hướng của ma trận này, còn action sinh hoạt và adapter server.

Hiện có **40clip/240pose/tám hướng đã duyệt**: idle/run/Kiếm/Lôi/Phong. [Review gộp](http://127.0.0.1:5174/@fs/C:/Users/Mark-TA/Documents/game-solo/docs/design/characters/wang-lin-pixel-wind-v1/index.html) chỉ dùng master/canonical đã chốt;32clip192pose [Pixel02](design/characters/wang-lin-pixel-production-v2/README.md) và8clip48pose [Wind01](design/characters/wang-lin-pixel-wind-v1/README.md) giữ nguyên byte.

**VFX đòn thường12/10:** [Thanh Ngọc01](design/vfx/basic-attack-jade-v1/README.md) có5sequence/30frame, ba vệt và hai impact,24socket trên thân hiện hành. Core presentation riêng nhận release/hit/cancel, clock tuyệt đối/dedup/giới hạn; review có hit/hụt, FX toggle, seekms và WebAudio từ click.603file body giữ nguyên; chưa nối room/live và chưa suy duyệt VFX.

## Contract và quy trình dùng lại

**Locomotion player chốt12/10:** chỉ sản xuất `run` tám hướng. Di chuyển thường và giữ Shift nhanh hơn dùng cùng clip, phase theo quãng đường thực/stride chung, không reset khi đổi Shift hoặc tiến phase lúc blocked. Không vẽ walk/sprint riêng; tốc độ/chi phí không đổi ở đợt ART. [Quyết định](design/characters/actor-animation-standard-v2/locomotion-policy.json). Quái/NPC giữ gait riêng theo actor. Hit → death → combo1/2/3 đã sản xuất ở combat01, đang review.

Người: locomotion64×96/foot(32,88), neutral80px/camera1×; Kiếm/Lôi96×96/(48,88), Phong112×96/(56,88). Padding không đổi anatomy/collider. Quái/boss dùng master, morphology và footprint riêng. Nguồn Thanh Nham Lang/Trấn Sơn Khôi Lỗi lịch sử giữ trong [archive](archive/actor-animation-pre-pixel02-2026-10-12/README.md).

Mỗi nguồn có neutral để đo scale chung và đối chiếu head/torso với master. Không fit bbox mỗi pose, không thay cỡ đầu khi thêm áo/action. Body/props/aura/skillFX/ghosts riêng. Tám view thật, kiểm Nam front/Bắc back cả lúc seal/glide. Raw source/input/prompt/hash/registration/canonical/atlas2px và scope approval được lưu trong pack version mới.

Cast giữ nhịp Core16/17/14tick24FPS theo [Skill Core](SKILL-CORE.md). Pose lấy tuổi tuyệt đối; locomotion runtime theo quãng đường. Phong ghosts lấy lịch sử2/4tick, không vector lùi giả. BodyLift preview giữ world foot/depth; chưa thêm vào schema/Core/save.

Kiểm ART native1×/loop/transition/map riêng với kiểm pixel/hash/Three/browser. Bộ hiện hành qua240frame native/GPU/browser,11unit clock/Core/binding/fixture,4viewport/lifecycle/cache và typecheck/direct Vite build. Không suy test là owner approval hoặc đo hiệu năng MMO/H5 thật.

## Sau cleanup

Pilot01/production01/study hai hướng, source bị loại và demo/UI/scripts cũ đã dọn khỏi active; ZIP2405file được kiểm hash và version ba phần dưới50MiB. Link lịch sử chỉ dẫn về archive hoặc review mới. Scoped sync40clip/public metadata ở /assets/pixel-actor-production-v2/; live player nguồn hiện hành, map/navigation/DB/draft/reference và thư viện tùy biến giữ nguyên.

~~~powershell
npm.cmd run assets:actor-animation-production
npm.cmd run test:actor-animation-production
npm.cmd run typecheck
~~~

Builder/record của pack đã chốt khóa ghi; tạo pack/version mới theo actor được chọn. Không replay ImageGen hoặc owner map builder khi kiểm skill/ART. Bản skill trong repo và bản Codex cá nhân đồng bộ.

**Hit/death/combo1–3 đã sản xuất ở combat01, chờ duyệt hình/motion. Cử chỉ/đả tọa/cưỡi/ngự kiếm/thu thập** còn cần làm trước khi gọi full player; player đã bỏ walk riêng. Approval40clip là ART/motion basis, chưa chốt full player/runtime integration hoặc gameplay balance.


## Nguyên tắc ghép cụm đối thủ

Giữ điểm đứng/tiếp cận theo vai trò và đường né; server/Core dàn nhịp báo đòn, phát đòn và hit đã xác nhận. Presentation ưu tiên body, cảnh báo nguy hiểm và phản hồi trúng; giảm FX phụ ở vùng chồng trước. Không dùng opacity để che quái dồn cụm hoặc thay kết quả hit. Các số spacing/timing/budget trong sân GDD cũ là fixture lịch sử, không tự trở thành balance của GDD mới.
