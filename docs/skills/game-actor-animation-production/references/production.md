# Recipe pixel đã chốt và nguồn dùng lại

**Chuẩn NPC owner chốt 13/10:** lấy Vương Lâm Pixel02 đang dùng trong game làm chuẩn gốc tỷ lệ, anatomy người, nét pixel và đổ màu. Đọc docs/design/characters/van-hai-npc-visual-standard-v1/basis.json và directions.json (frame thật từ atlas live, pin hash). Khi tạo human NPC neutral, image1 là Vương Lâm cùng hướng; concept NPC chỉ cung cấp nhận diện/phục trang ở input hỗ trợ. Trần Duy v3 là NPC đối chiếu, không thay Vương Lâm làm chuẩn hoặc tạo chuỗi NPC→NPC. Khi làm action, khóa nhận diện riêng của NPC và so trực tiếp với Vương Lâm ở native1×.


## Bàn giao actor live13/10

Sau merge chương, xem `docs/GAME-ACTOR-RUNTIME.md`. Vương Lâm80core đã live và có thêm `wang-lin-pixel-life-v1`16clip/96pose (meditate/gather×8). Life source có neutral6 + ngồi6 + cúi6, một scale/source từ neutral, cùng palette Pixel02 và chân88; ngồi đo pelvis/chân gập, không kéo chiều cao lên80. Prompt/input/raw/hash/registration ở root mới; ART life vẫn candidate.

`sect-encounter-actors-v2` chỉ lấy member quái/boss cần dùng từ archive:104clip/624pose, provenance có member/hash, không khôi phục player/pipeline cũ. PNG giữ nguyên, kiểm atlas/canonical720frame cả life và encounter. Quái50px/112×96/(56,88), boss104px/176×176/(88,160); không ép hợp đồng người. Bắt đầu lại sinh lifeId mới; corpse giữ cuối, hit không xóa báo đòn đã khóa.

Core R01 live dùng `bodyDirectionCountByAvatar` để pixel8 và native4 cùng tồn tại; body/socket/bóng theo cùng binding, không nạp người cũ làm bóng. FX F5sequence riêng được ghép theo server release/hit, không giả F thành Kiếm. Runtime integration và kiểm kỹ thuật không mở rộng approval40.

`npm.cmd run assets:game-actor-actions` / `test:game-actor-actions` là scoped sync/asset/unit/GPU/browser, không owner map builder. Player normal/Shift cùng run80/120, phase theo quãng đường; save2 thêm facing tùy chọn. Renderer budget32MiB cho Wang/16MiB cho encounter là decoded cache, không tổng GPU memory hoặc benchmark thiết bị. Cử chỉ/cưỡi/ngự kiếm/cutscene vẫn chưa làm.

Mọi đường dẫn `docs/`, `scripts/`, `client/` tính từ root game-solo. Bản repo `docs/skills/game-actor-animation-production/` và bản cài Codex cá nhân phải đồng bộ.

## Nguồn hiện hành

| Việc | Nguồn |
| --- | --- |
| Approval/basis40clip | `docs/design/characters/actor-animation-standard-v2/approval.json` |
| Idle/run/Kiếm/Lôi ·192pose | `docs/design/characters/wang-lin-pixel-production-v2/catalog.json`, `masters/`, `sources/`, `production-plan.json` |
| Ngự Phong ·48pose | `docs/design/characters/wang-lin-pixel-wind-v1/catalog.json`, `sources/`, `production-plan.json` |
| Review/Core binding | `wind-v1/current-pack.json`, `presentation.json`, `index.html` trong gói trên |
| Registration helpers | `scripts/actor-sprite-tools.mjs`; builder/verify của pixel và wind (root cố định, đã khóa ghi baseline) |
| Tuổi/hold/hướng | `client/src/core/actor-animation-production.ts`; primitive timeline ở `actor-animation-pilot.ts` là code thuần, không ART cũ |
| VFX/khí | `docs/SKILL-CORE.md`, `docs/CHARACTER-AURA-LAYERS.md` |
| Reference user cung cấp | `docs/art_reference/` · chỉ đọc, không chép làm nhân vật mình |
| Pilot/quái/boss/bộ cũ | `docs/archive/actor-animation-pre-pixel02-2026-10-12/README.md` và manifest/ZIP parts · tham chiếu lịch sử, không runtime hiện hành |

`wind-v1` ở bảng là tên rút gọn của `docs/design/characters/wang-lin-pixel-wind-v1`.

## Chọn identity và prompt

Dùng master **cùng hướng** để khóa skull/face/body/costume; matrix tám hướng hỗ trợ camera. Reference bên ngoài chỉ quyết định pixel treatment/registration/layer, không thay nhận diện riêng. Với actor mới, cần master mới phù hợp trước khi áp recipe.

Prompt hữu ích: identity invariants → hướng/camera → từng pose → chân trụ/lift → diễn biến tóc/vạt áo → khoảng alpha → lớp body-only. Đặc biệt ghi view của cả action: Bắc không có mặt/eyes trong seal hoặc glide; Nam không chuyển profile trái lúc lướt. Đừng yêu cầu gió/ghost/glow trong sheet body.

Phong01 dùng sheet6cột×2hàng: neutral6 để đo; ready/seal/launch/glide/brake/recover. Main02 dùng6cột×4hàng idle/run/forward/point để giữ anatomy cùng source. Source kích thước thực phải đo; không chia đều cell theo kích thước được mong đợi. Actor/action khác chọn recipe đủ kiểm, không ép cùng số frame.

## Registration tránh phình và lệch

1. Neutral calibration và đối chiếu head/torso với master, không chỉ bounding height. Đo source scale chung qua các action.
2. Cell roots từ planted boots neutral và floor đúng theo động tác. Dùng root đã đăng ký qua pose nghiêng, không recenter bbox.
3. Resize nearest đúng một scale, giữ đủ tóc/tay trong padding. Clip translation cố định có thể sửa source origin nhưng không fit/scale từng pose để chữa anatomy.
4. Với body grounded đã kiểm, soles end87/ground88 sau quantization. Hover là lift riêng so với world foot. Airborne/death cần đăng ký thủ công thích hợp.
5. Đóng atlas có gutter2px. So RGBA canonical/atlas; Three texture clone khi đổi kích thước canvas và geometry riêng.

Thất bại đã quan sát: chia đều sheet lấy mảnh lân cận; idle/cast cùng height80 nhưng khác cỡ đầu; nguồn run sửa gọn riêng đổi gait/anatomy; Nam/Bắc neutral đúng nhưng launch quay ngang; halo alpha mềm source body. Kiểm từng source/pose có ý nghĩa, giữ source bị loại trong archive/provenance thay vì biến thành frame active.

## Timeline và review

Player dùng một bộ `run` tám hướng cho normal/Shift-fast, không walk/sprint atlas riêng. Đọc `docs/design/characters/actor-animation-standard-v2/locomotion-policy.json`; `client/src/core/pixel-locomotion.ts` lấy phase từ actual distance và cùng stride. Shift chỉ đổi tốc độ, không reset phase/phóng thân. Quái/NPC giữ gait cần theo actor. Bộ combat tiếp nối ở `docs/design/characters/wang-lin-pixel-combat-v1/`, 40clip/240pose hit/death/attack1–3 đã trích/pack, review tổng80clip/480pose; ART mới chưa suy duyệt từ baseline40. Kiểm scoped `npm.cmd run test:actor-animation-combat`; death giữ cuối, combo dùng ba clip thật, hit200ms và attack400/666⅔/750ms bám fixture.

Phong holds `[2,2,3,3,2,2]`: release4/24s, recovery10/24s, end14/24s. Kiếm/Lôi giữ nhịp Core16/17tick, không lấy số pose làm luật. Locomotion preview tại chỗ chưa chứng minh footfall theo movement runtime.

Wind review dùng SkillTimeline và facts minh họa cục bộ, không server thật. Lịch sử24Hz dựng đúng pose/vị trí trễ khi seek/render muộn; arrival dừng trail/phát vòng đáp. BodyLift preview chưa là thuộc tính Core/save; adapter runtime phải quyết định rõ.

Kiểm cơ học riêng pack và Three native1×; browser đổi atlas/hướng/action, frame terminal, camera, FX on/off, narrow view, cache và hidden/offline/reduced motion. Không coi cache atlas16MiB là tổng GPU/RAM hoặc hiệu năng MMO.

## VFX đòn thường và ghép layer

`docs/design/vfx/basic-attack-jade-v1/` là candidate5sequence/30frame cho attack1–3, chung tám hướng bằng rotation. ImageGen raw alpha/prompt/hash riêng; trích bằng vùng và luminous emitter thực vì cell không đều, giữ shards/soft alpha, một scale/sequence. Không áp body binary-alpha hoặc largest-component lên FX. Body basis603file/80clip không đổi.

24socket đo trên pose release được lưu riêng; không sửa body để ghép. `shared/animation-arena/basic-presentation.ts` nhận release/hit/cancel + clock tuyệt đối, không tự tạo hit từ release. Contact/depth/aim đến từ facts và target socket đã đo, không từ animation callback. Seen/effect/terminal giới hạn; late event không restart, cancel giữ impact đã commit. Review marker có depth riêng dưới impact để tránh che dấu trúng. Cue âm thanh từ click, dedup, không phát khi seek/paused/hidden/offline.

Kiểm `npm.cmd run test:basic-attack-vfx`:30frame alpha/atlas,240render góc trong Three,24binding hit/hụt/toggle/terminal, native4×/map1×/responsive/audio/lifecycle. Server adapter và ART approval còn riêng; không giả basic là sword R01 để dùng catalog thuật.

## Lệnh dùng kiểm mốc hiện hành

```powershell
npm.cmd run assets:actor-animation-production
npm.cmd run test:actor-animation-production
npm.cmd run typecheck
```

Scoped sync chỉ copy40clip/current metadata, không viết owner map hoặc đổi live avatar. Không gọi full `npm assets`/`npm build` để kiểm sprite vì chứa map builder. Khi cần build client, dùng direct Vite.

New actors phải có pack/root riêng, source mapping và write mode rõ; các scripts baseline có guard và không phải exporter tổng quát. Bản đã chốt được giữ nguyên, không re-generate để test skill.

## Archive và nguồn quái/boss

ZIP cũ giữ cả nguồn/prompt/registration/canonical của Thanh Nham Lang và Trấn Sơn Khôi Lỗi, có thể lấy đúng member làm input cho bộ mới. Các phần ZIP48MiB có hash, ghép bằng `node scripts/verify-retired-actor-archive.mjs --materialize`. Đọc manifest và trích có chọn lọc vào root mới; không khôi phục toàn bộ old asset/UI pipeline vào active.

Giữ nguyên `docs/art_reference`, nguồn locomotion/cast đang phục vụ game và `character-customization-library-v1`. Player không yêu cầu walk riêng theo quyết định12/10; approval40clip không bao gồm combo/hit/death/cử chỉ/cưỡi/ngự kiếm/thu thập hoặc các actor mới.
