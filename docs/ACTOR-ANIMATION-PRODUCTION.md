# Chuẩn sản xuất animation nhân vật · Vân Hải02

**Chuẩn NPC owner chốt 13/10:** lấy Vương Lâm Pixel02 đang dùng trong game làm chuẩn gốc tỷ lệ, anatomy người, nét pixel và đổ màu. Đọc docs/design/characters/van-hai-npc-visual-standard-v1/basis.json và directions.json (frame thật từ atlas live, pin hash). Khi tạo human NPC neutral, image1 là Vương Lâm cùng hướng; concept NPC chỉ cung cấp nhận diện/phục trang ở input hỗ trợ. Trần Duy v3 là NPC đối chiếu, không thay Vương Lâm làm chuẩn hoặc tạo chuỗi NPC→NPC. Khi làm action, khóa nhận diện riêng của NPC và so trực tiếp với Vương Lâm ở native1×.

**Hắc Ấn VFX02 duyệt ·13/10:** owner nhận xét “quá ổn rồi đó”; approval riêng pin106target của8sequence/48frame và chuyển động VFX/presentation đang xem, không body Motion01 hoặc timing/balance/âm production/live. [Triện Thuật02](design/vfx/dark-seal-officer-vfx-v2/README.md) có8sequence/48frame mới: ba cặp tụ/phát riêng cho Đạo Ấn–Phân Phù–Ấn Hồi, contact và tan dư ảnh riêng. Lõi ngà/viền mực/triện đỏ, charge sau body, projectile tới điểm khóa, hai cổng phù mờ và tan lệch80ms, vòng ground scale chung radius112/offset origin chung; renderer giữ khe90° hướng khóa. [Body basis](design/vfx/dark-seal-officer-vfx-v2/body-basis.json) pin1482file toàn Motion01/body/source/socket/kit/fixture/VFX01 nguyên byte, Player323/Lang556/map/plan giữhash. Sân A/B cùng tuổi/native1×/2×, beats/loop/âm WebAudio opt-in, seek/paused không âm; cache decoded16MiB. Source built-in ImageGen/raw/prompt/input/registration riêng, một scale/sequence/alpha mềm/gutter2. ART/VFX02 đã duyệt và root khóa ghi; live/AI/server/balance/HP/loot/DB/map/draft/catalogrelease giữ bước riêng. Pack/buildreview/finalize/verify và test:dark-seal-officer-vfx-v2 scoped; không owner mapbuilder. Phản hồi chỉ VFX không suy duyệt body/motion. Mốc VFX01 bên dưới là lịch sử.

**Hắc Ấn Motion01 ·13/10:** [bộ mới72clip/432pose](design/characters/dark-seal-officer-animation-v1/README.md) và6FX/36frame riêng, tám view/chín action. Body80/canvas160×112/chân80,104, một scale theo neutral mỗi nguồn; lower8% boot root, không mirror/fit từng pose.24source/144neutral và lịch sử29gen/5superseded giữ raw/prompt/input/hash; sửa các clip sai scale bằng nguồn mới.192socket skin và ground projection là presentation candidate. Sân Core có Phân Phù hai dư ảnh không quyền gameplay, trúng/hụt/hủy và né normal80; kiểm432pose/96ca browser/16unit. Motion/view/VFX mới chờ owner; chưa live. Các mốc cũ bên dưới không mở rộng phạm vi approval mới.

**Lang Vương Motion01 duyệt ·13/10:** owner nhận xét “nhìn tốt lắm, tiếp tục công việc”. [Approval](design/characters/cloud-wolf-king-animation-v1/approval.json) pin556target của64clip/384pose tám hướng và5FX/30frame đang xem; ART/motion/VFX được duyệt, không timing/balance/AI/HP/loot/adds/runtime hoặc các boss khác. Pack/record/analyze ghi root đã khóa, nguồn generation giữ lịch sử ban đầu. Tiếp tục Hắc03, Lang Khiếu/adds giữ bước sau; không đổi source đã duyệt hoặc owner map/DB.

**Hắc Ấn03 ·13/10:** owner chê02 lệch style người. [Mẫu03](design/characters/van-hai-dark-seal-officer-v3/README.md) dùng masterSE PlayerPixel02 nearest8× làm input chính, giữ compact80/64×96/32,88; đổi tuổi/áo vải/thẻ ấn, không giữ style mịn/vai dựng của02. So người/02/03 ở cùng1×/2×/4×, không coi height là bằng morphology. Một neutral mới pending; người/11fileBoss02/map nguyên byte, chưa motion/FX/live hoặc duyệt cả gói boss.

**Boss02/feedback13/10:** [Lang Vương01 được duyệt riêng](design/characters/van-hai-boss-concepts-v1/approval-wolf.json), giữ nguyên source/native96. [Ba refinement02](design/characters/van-hai-boss-concepts-v2/README.md) tăng khối vai/tay/rễ và trang phục chỉ thân phận; Tam128/Cổ160 là cỡ concept đề xuất, Hắc80. Neutral mới còn pending, chưa motion/VFX/live; giữ15fileART/metadata01 và scoped pack02 bỏ qua wolf. Review01–02 cùng camera để thấy cả thay đổi hình và scale.

**Boss concept13/10:** [bốn identity master](design/characters/van-hai-boss-concepts-v1/README.md) đã có neutral Đông Nam/native đo chân; Lang Vương96/Tam Ấn104/Cổ Mộc140/Hắc Ấn80px, body-only/cues/layers riêng. Review so Khôi Lỗi02 và cùng họ/player/map; không tự dùng lại motion chỉ vì cùng height. Chưa sản xuất full sheets/VFX boss hoặc ghép runtime; neutral chờ duyệt. `test:boss-concepts` là kiểm kỹ thuật, không owner approval.

**Bàn giao nhóm quái13/10:** owner yêu cầu khi ghép gameplay phải phối hợp giãn vị trí theo vai trò, dàn nhịp đòn trên server/Core và giới hạn FX cộng dồn theo mức quan trọng. Giữ rõ body/cảnh báo/hit xác nhận; thông số sân cụm chưa là luật gameplay. [Checklist tích hợp và kết quả cụm](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md), [điểm nối runtime](GAME-ACTOR-RUNTIME.md).

**VFX02 ·13/10:** body quái11mẫu được owner đánh giá tốt, pin3.171file/catalog/native/source trong [basis](design/vfx/van-hai-monster-vfx-v2/body-basis.json). [VFX02](design/vfx/van-hai-monster-vfx-v2/README.md) thay vệt nhỏ/đồng dạng01 bằng33sequence/198frame charge/release/contact, elite artwork riêng và tuổi tàn khí độc lập khỏi body complete. Same-age A/B trong review, nguồn22PNG/prompt/alpha/gutter/registration đầy đủ. Mới ở ART review, socket/gameplay/live vẫn riêng; scoped verify/test02 không owner map builder.

**Quái/tinh anh13/10:** [gói motion Pixel01](design/characters/van-hai-monster-animation-v1/README.md) đã sản xuất11actor,440clip/2640pose (năm action/tám view thật), [9FX/54pose +2prop](design/vfx/van-hai-monster-vfx-v1/README.md). Concept neutral được chọn làm basis; motion/VFX/socket mới vẫn chờ duyệt. Clock Core dùng chung trên review, release/hit/cancel từ fixture riêng; chưa thay actor live hoặc AI/loot. Pack/verify chỉ viết root mới, không gọi owner map builder;323hash Vương Lâm giữ nguyên.

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
