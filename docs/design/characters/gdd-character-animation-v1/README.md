# Animation nhân vật GDD mới · 15/10/2026

Bản320 đã qua **CPU91.596 / contract3.470 / browser2.570 / ThreeGPU3.840 / UI178 /23test offline**. Gallery48view/GPU96 và155kiểm trang giữ nguyên vì không đổi view. [Kiếm40/676pin](checkpoints/enemy-motion/sword-servant-40/checkpoint.json) và [Giáp64/1119pin](checkpoints/enemy-motion/blood-armor-commander-64/checkpoint.json) là complete-candidate; [hồ sơ bàn giao320](enemy-production/delivery-320-v1/handoff.json) đóng toàn bộ6actor, không còn clip thiếu. Các mốc318/315 và câu chờ quyền dưới đây là lịch sử.

**Mốc mới nhất · đủ320/320 clip quái/Boss:** owner đã mở thêm đúng1POST cho Kiếm Nô hit/Tây Nam (`retry-2`) và Huyết Giáp move/Tây Bắc (`retry-1`); cả hai trả ảnh thành công và đã xem nguồn. Sáu actor hiện có **320clip/1920key/48neutral**, toàn gói **576clip/3447key**; Main256/1527 giữ nguyên. [Coverage hiện hành](enemy-production/coverage.json) không còn clip quái/Boss thiếu hoặc nguồn bị chặn.

Riêng raw Kiếm Nô có17 hình đầy đủ theo hàng4+4+5+4:8neutral dùng tính một scale,9phản ứng/nghỉ chọn actual0/1/2/3/5/6. Witness pin đúng rawhash và bounds của mọi hình; phép kiểm đối chiếu source→canonical từng pixel của6key, chỉ chấp nhận đúng nguồn/action này. Không nắn bitmap, fit từng pose hoặc nới hợp đồng của source khác. Huyết Giáp chọn actual0/1/2/4/5/6 để giữ hai lượt nhấc chân đá khác nhau. Hồ sơ hai retry mới nối thêm, không ghi lại lịch sử cũ. Các snapshot318/315 và toàn bộ nguồn/checkpoint trước giữ nguyên; asset mới vẫn candidate chờ owner duyệt ART/motion.

Bản318 đã qua CPU**89.539**, contract**3.471**, browser motion**2.554**/ThreeGPU**3.816** và UI178; gallery155/48viewGPU96 cùng11test offline giữ kết quả qua. [Checkpoint Hắc72/1272pin](checkpoints/enemy-motion/dark-seal-true-body-72/checkpoint.json) là complete-candidate; [hồ sơ đóng gói318](enemy-production/delivery-318-v1/handoff.json) giữ nguồn/frame/atlas/evidence và chỉ đúng2clip thiếu. Không suy QA thành ART/motion/runtime approval.

**Mốc nối tiếp mới nhất ·318/320 clip:** ba nguồn Hắc Ấn được owner cho phép gửi lại tối đa1lượt/nguồn đều trả ảnh thành công. Đã xem source và đóng Hắc Ấn đủ72/72clip/432key; AOE Tây/Đông Bắc có hai tay ép xuống/mở ngoài, attack Bắc hướng lên/ra xa đúng camera. Hồ sơ initial invalidJSON, authorization, retry1, prompt/input/raw/hash giữ riêng. Quái/Boss **318clip/1908key**, toàn gói **574clip/3435key**; [coverage](enemy-production/coverage.json) còn đúng2nguồn thiếu: Kiếm hitSW và Giáp moveNW. Hai nguồn này chưa được cấp quyền mới, không tự gửi thêm. [Snapshot ZIP315](enemy-production/delivery-315-v1/archive-verification.json) giữ nguyên lịch sử, đã mở lại kiểm6422member/SHA256.

**Snapshot bàn giao315 trước retry Hắc Ấn:** đã có **1.890 key body và48 hướng đứng** của sáu actor. Kiếm Nô39/40, Âm Thi40/40, Huyết Phù40/40, Hứa Lập Quốc64/64, Huyết Giáp63/64, Hắc Ấn69/72; toàn gói **571clip/3.417key**, Main256/1.527 nguyên trạng. [Coverage và năm nguồn thiếu](enemy-production/coverage.json) là số hiện hành; các snapshot thấp hơn bên dưới giữ lịch sử.

Hứa Lập Quốc giữ softRGBA/điểm chiếu linh thể, không giày/chân người; chọn lại key Đông Nam để bỏ mép alpha8 chạm đáy. Crop kỹ thuật giữ RGBA nguồn trong biên alpha8 cộng3px native, chặn thân ngoại lai và kiểm tái dựng từng pixel. Huyết Giáp sửa đòn Bắc, bước Tây và sheet nghỉ Nam. Hắc Ấn có tám Phân Phù riêng; các nguồn Ấn Hồi sửa thể hiện tay gần ép xuống/tay xa mở ra. Nguồn lỗi và bản candidate bị thay giữ raw/history, không vá/mirror/fit từng pose.

[Checkpoint Hứa64](checkpoints/enemy-motion/hua-lap-quoc-64/checkpoint.json), [Huyết Giáp63](checkpoints/enemy-motion/blood-armor-commander-63/checkpoint.json), [Hắc Ấn69](checkpoints/enemy-motion/dark-seal-true-body-69/checkpoint.json) đều là checkpoint kỹ thuật candidate. Lượt kiểm tổng: CPU87.889, contract3.471, browser motion2.530/ThreeGPU3.780, UI178, gallery155 và48view/GPU96; 11 test offline qua. QA không mở ART/motion/runtime approval.

Năm nguồn thiếu trả HTTP200 invalid JSON, không có ảnh và chưa rõ phí: Kiếm Nô hit/Tây Nam (initial+1retry đã hết quyền); Huyết Giáp move/Tây Bắc; Hắc Ấn attack/Bắc, AOE/Tây và AOE/Đông Bắc. Đã hỏi quyền gửi lại có giới hạn, chưa có câu trả lời ở mốc này; **không tự POST thêm hoặc lấy nguồn sai đã loại làm fallback**. Gear/FX/gameplay vẫn có bước riêng; không thay live/map/DB/draft/receipt. [Sân animation](index.html#actor=dark-seal-true-body&action=cast-decoy&direction=southeast) dùng các clip thật; bảng production liên kết từng ô có clip.

Owner yêu cầu đủ tám hướng và animation cho toàn dàn. Sau khi Main hoàn tất, owner đổi ưu tiên thành **quái → Boss**, rồi tiếp nối tuyến truyện/NPC đang chờ. Dùng 18 neutral đã duyệt của GDD0.34, giữ riêng các gói MốcII và NPC WaveA đang có. Không lấy lại artwork đối thủ GDD cũ.

**API hiện hành15/10:** owner chỉ định `https://img.aishenji.top/v1`, `gpt-image-2`. Dùng lại MCP/router hiện có, khóa DPAPI ngoài Git; ảnh có reference qua `imagegen-router.mjs edit` multipart. [Kiểm kết nối và render thật](enemy-production/router-pilot-v2/connection.json) đã trả nguồn Kiếm Nô1536×1024 có alpha thật. [Nguồn thử](enemy-production/router-pilot-v2/source.png) và [assessment](enemy-production/router-pilot-v2/generation-result.json) giữ riêng; bản r3 đã sửa đúng Tây Bắc và đăng ký8view, motion đang sản xuất theo số thực trong manifest; các báo cáo hai lượt đầu là lịch sử. Provider trước502/built-in429 là lịch sử, không còn là blocker kết nối.

[Playback và bảng tiến độ](index.html) · [Số thực đã đóng](progress.json) · [Clip/source registration](manifest.json) · [Danh mục sản xuất](production-plan.json) · [Kiểm source/atlas/basis](review/verification.json).

[So 48 hướng đứng mới của sáu quái/Boss](enemy-production/views.html): master đã duyệt / Wang cùng hướng / góc mới ở1×,2×,4× và nền sáng/tối. Các board Âm Thi/Huyết Phù sửa riêng rear-camera; Hứa Lập Quốc r1 sinh giày sai đã loại, r2 phục hồi vạt linh thể không giày và giữ softRGBA. Source/native530check và ThreeGPU96readback qua. Đây vẫn là candidate view, không đếm thành animation.

Kế hoạch ban đầu824 body clip, 18 tạo hình ×8 view; chỉ là dự toán cho các action theo vai. Các con số thực nằm trong manifest/progress, không tuyên bố đủ bộ từ queue. Main đợt mới gồm áo Ngoại Môn và áo Ý cảnh chung; MốcII V2 đã có512clip giữ read-only. Bộ áo Ý cảnh chưa thay thế tám variant trang bị MốcIII. Gear/FX và integration có bước riêng.

## Kiếm Nô đang sản xuất qua API

**Snapshot Kiếm Nô trước khi mở các actor còn lại:** Kiếm Nô có **39/40clip, 234key**; tám view thật đã đăng ký. Chỉ thiếu `hit/southwest`. Lượt đầu nguồn này và đúng **một lượt gửi lại do owner cho phép** đều trả HTTP200 invalid JSON, không có ảnh, chưa xác định phí. Hồ sơ hai lượt giữ riêng tại [retry-summary](enemy-production/api-sources/sword-servant-southwest-hit-api4x4-r1-neutral-r2/retry-summary.json); không được tự gửi thêm. [Checkpoint kỹ thuật 39clip](checkpoints/enemy-motion/sword-servant-39/checkpoint.json) pin618file: CPU40.903, browser322, GPU468; trạng thái **incomplete-candidate**, không suy ART/motion/runtime approval. Toàn gói295clip/1761key; Main256/1527 giữ nguyên. Các số10clip/0clip ở các mốc phía dưới là lịch sử. Nguồn tám hướng Âm Thi và Huyết Phù đang tiếp nối độc lập.

Góc Tây Bắc r3 đã che đúng mặt; đủ8neutral mới và [checkpoint33pin](checkpoints/enemy-views/sword-servant/checkpoint.json), CPU91/GPU16 qua. [Tám hướng native2×](enemy-production/sword-servant-eight-view-native2x.png). Đã có10clip/60key Đông Nam–Bắc; số mới nhất luôn đọc từ manifest/progress, không từ snapshot này. [Mở Kiếm Nô trong sân animation](index.html#actor=sword-servant&action=idle&direction=southeast).

Sheet6cột của khôi lỗi chạm nắm tay nên giữ source lỗi và đổi sang4×4,8calibration+8action chọn6key. Kiếm Nô40job mới thay32recipe cũ, không tăng40clip mục tiêu; tổng active source job quái/Boss256, tổng clip vẫn320. Source API thật trả1448×1086 khi xin2048×1536; một scale từ calibration của nguồn thật, không fit từng pose. Key idle giơ tay/khuỵu quá sâu và key đánh quay lưng sai view được loại khỏi vòng/clip. Ngã giữ head/feet side và corpse hold. Body-only, gear/FX/runtime vẫn có bước riêng.

`api_source_ops.py prepare` chỉ biên soạn request; MCP plan trước mỗi lượt trả phí. `run` gọi đúng router có sẵn một POST, không retry/model fallback; `record` kiểm prompt/input/hash/endpoint rồi dùng record scoped cũ. `batch` tuần tự các request đã plan, dừng nếu lỗi, giữ source chờ model review; không tự duyệt hình hoặc pack. Không ghi generation ledger từ tác vụ khác trong lúc batch đang record. `enemy_wide_sources.py` chỉ dùng cho construct đã có đủ ownview; không dùng cho người/linh thể.

## Sản xuất và source

Nguồn trước dùng ImageGen built-in; từ lượt owner mở API, dùng router hiện hành với cùng hợp đồng mỗi source một actor/view/nhóm action. Các layout dài/giáp nhau được giữ history và loại phần lỗi khỏi active. Nhóm thường tối đa4action; động tác rộng dùng sheet4×4 có8calibration và8action, chọn những key có nghĩa theo actual source. Nguồn run SE bỏ các key giống đứng, Bắc giữ các footfall thực. Nguồn thổ nạp có key đứng dậy cuối được loại; entry ngồi rồi sustain các key ngồi, không loop qua tư thế đứng.

Prompt/input snapshot/hash/raw/original saved path ghi trong generation.json. Same-view correction dùng own motion-neutral làm target cùng hướng, own approved neutral làm identity authority, Wang chỉ hỗ trợ pixel/camera với main; không NPC→NPC hoặc ghép lại đầu Wang. Snapshot tham chiếu sửa chỉ RGB tại alpha0 khi cần để tránh màu vô hình ảnh hưởng model; visible pixels giữ nguyên.

Một scale/source từ neutral calibration. Source regions theo alpha thực, không cắt bằng kích thước cell giả định; body fragments thuộc pose được giữ, hàng chạm nhau cần nguồn sửa riêng. Canonical human112×112/(56,104), death160×112/(80,104) là **padding** cho body80; không tăng cơ thể khi canvas rộng. Bounds/rect/raw/source mapping/scale/root/lift đều ghi cho từng key. Roots hiện là dark-boot witness proposals hoặc low-pose ground projection có uncertainty1–3nativepx, chưa suy thành root/motion approval. Low pose không bị kéo lên80px. Lift đã bake một lần; review không trừ lại.

Bộ mới vẫn candidate. Duyệt neutral không tự duyệt motion/view/FX production/runtime, và QA không thay owner review. Không ghi public assets, map/navigation/blocker, DB, draft, receipt, save, gameplay balance hoặc runtime.

## Công cụ scoped

- prepare.py: chỉ khởi tạo phiên bản trống; queue hiện hành có layout corrections/historical records, không chạy lại để reset.
- record.py: append source mới, kiểm prompt/input và cấm overwrite source.
- inspect-source.py/inspect-batch.py/source_tools.py: vùng alpha/support candidates và contact native, không sửa artwork.
- roster_ops.py: neutral board theo vai và recipe truyện; chỉ chuẩn bị queue, không tự gọi generation.
- review-sources.py: ghi nhận model đã xem nguồn và loại action lỗi; không ART approval.
- pack-story-views.py: tái dựng RGBA từ nguồn, atlas và hồ sơ32neutral truyện.
- pack.py: append clip và giữ nguồn lỗi/history; không gọi map builder.
- verify.py: source/input/basis/hash/atlas/gutter/pivot/bounds; readiness theo coverage thực.
- review.mjs: clock tuyệt đối, seek/terminal/sustain, cache decoded16MiB, hướng thiếu để trống, lifecycle pause; không game command/storage.

Các bước mở rộng tiếp tục trong cùng queue theo thứ tự owner chốt. Motion NPC/story/monster/boss cần action và support đúng vai, không lấy gestures main để giả bộ nghề hoặc chiêu boss.

## Tiến độ trong đợt đang chạy

Huyễn Tâm và Tịch Bạch đã đủ tám hướng × tám action cho cả Ngoại Môn và áo Ý cảnh chung: **256clip/1.527key** (Ngoại Môn128/759; Ý cảnh128/768). Main dùng135 source đã đóng, các source lỗi/touching/đảo bên giữ trong lịch sử. Bản ngã Đông Tịch Bạch đã sửa để đầu luôn bên phải, chân bên trái trong toàn đoạn hạ người–nằm.

[Mốc kỹ thuật Main](checkpoints/main-8dir/checkpoint.json) pin1.921file, kèm manifest và báo cáo đóng băng: CPU31.118, browser1.807, ThreeGPU3.054 readback trên toàn bộ1.527key native/atlas. Kiểm lineage sau khi nối queue tuyến truyện có34.089check; QA không thay duyệt anatomy/ART/motion. Snapshot tay/chân208clip trước đây giữ nguyên số và báo cáo tại `review/limb-audit-v1/snapshot/`.

[Tuyến truyện tám hướng đứng](view-masters/index.html) đã có **32 neutral mới**: Tư Đồ Nam tàn hồn/nhục thân và Lý Mộ Uyển Đan sư/kiếp thọ nguyên, mỗi tạo hình8view thật từ source riêng cùng actor. Wang8view là chuẩn camera/pixel/anatomy cho người; own identity/clothing giữ nguyên, không NPC→NPC. Mỗi board dùng một scale chung. Tàn hồn giữ nguyên alpha mềm nguồn và ground projection ước lượng3px; không áp dark-boot rule. [Kiểm source/atlas](review/story-view-verification.json):752check; [browser/GPU](review/story-view-browser-verification.json):264check/64readback thật. Góc Đông hơi thiên chính diện theo Wang tham chiếu; tóc bạc bản thọ nguyên nhẹ ở1×. Những view này vẫn candidate, **không được đếm thành clip animation**.

ImageGen built-in báo `429 usage_limit_reached` ở bốn source motion tuyến truyện đầu tiên, thời gian đợi công cụ báo khoảng9.281giây lúc thất bại. Không có source motion mới được sinh cho nhóm này. Lưu nguyên lỗi/attempt và bốn job planned trong generation.json;64job body tuyến truyện đã có prompt theo vai/cùng view, Tại snapshot đó còn568clip của tuyến truyện→NPC→quái→Boss. Đổi ưu tiên mới bên dưới bổ sung8clip Phân Phù, nên hiện còn576clip toàn dàn. Tại snapshot lỗi đó chưa có quyền chuyển API; owner đã mở API ở mốc hiện hành phía trên.

### Ưu tiên quái và Boss theo yêu cầu mới

[Trang sản xuất quái/Boss](enemy-production/index.html) · [Brief và kế hoạch nguồn](enemy-production/plan.json) · [Kiểm hợp đồng/phụ thuộc](enemy-production/verification.json) · [Kiểm browser/native](enemy-production/browser-verification.json).

| Actor | Cách chuyển động | Dự kiến body8hướng |
| --- | --- | --- |
| Kiếm Nô Khôi Lỗi72px | Bước đá nặng, nạp vai và chém chuôi kiếm rỗng; kiếm gãy là prop rời |40clip |
| Âm Thi Tu Sĩ80px | Bước rình, vai khép, kết ấn dẫn thi |40clip |
| Huyết Phù Sư80px | Bước ngắn, cổ tay phát phù, vạt đỏ đi sau nhịp |40clip |
| Hứa Lập Quốc96px | Lướt linh thể, lệnh kiếm ST/AOE, thế cuối bị trấn áp chờ thu phục |64clip |
| Huyết Giáp Thống Lĩnh128px | Truyền lực qua chân đá, đóng trụ và giẫm chấn thủ trận |64clip |
| Hắc Ấn chân thân80px | Đạo Ấn, Phân Phù riêng, Ấn Hồi kép |72clip |

Dự toán khởi tạo nhóm này **320clip /248job source**; sau tách nguồn rộng hiện có306 job active. Phần dưới là snapshot chuẩn bị ban đầu, không thay coverage hiện hành ở đầu tài liệu. Hắc Ấn thêm8clip Phân Phù riêng thay vì dùng lại cử chỉ Đạo Ấn/AOE, nên tổng dự kiến toàn dàn **824→832clip**. Slot defeat của Hứa chuyển từ `death` sang `subdued` giữ thế; không có xác chết/loot hoặc thời gian thu phục tự suy từ ART. Actual toàn gói vẫn256clip/1527key, actual quái/Boss mới **0clip,0view mới**. Các master Đông Nam hiển thị là concept đã duyệt trước đó.

ImageGen built-in đã thử đúng một lượt Kiếm Nô viewboard và tiếp tục trả429usage_limit_reached; công cụ báo đợi7444giây tại thời điểm thất bại. Lượt built-in đó không có raw; pilot API mới được ghi riêng theo yêu cầu tiếp theo của owner. Đã lưu attempt thật trong view-masters/generation.json. Bốn job truyện bị lỗi trước giữ trong blockerHistory, không bị xóa hoặc tự chuyển thành thành công.

`enemy_ops.py prepare` đã ghi recipe theo vai, không gọi generation; chạy lại không reset nguồn. `enemy_profiles.py` khóa cỡ thân/material/cử chỉ, thông số ms chỉ là fixture duyệt chuyển động. Giữ toàn bộ2.039pin bàn giao Main/truyện trước; verify-enemy-plan3.674check và browser178check/12cặp pixel native của master đã duyệt qua. Kiểm này không chứng minh đã sản xuất ART/motion hoặc GPU mới cho quái/Boss.

### Tiếp tục với router đã được owner chỉ định

1. Đọc queue/progress hiện hành, không chạy prepare.py reset. Ưu tiên viewboard Kiếm Nô→Âm Thi→Huyết Phù, rồi ba Boss; payload qua production_ops.py `payload view`; MCP plan trước lượt trả phí, router `edit` với reference có hash. Không dùng text-only MCP generation thay identity.
2. Record-view → xem cả source → roster_ops.py register-board với assessment rõ anatomy/view/source edges. Một scale/board; giữ cỡ72/80/96/128 và alpha của từng vai.
3. `enemy_ops.py bind ACTOR DIRECTION` chỉ bind khi own same-view đã được đăng ký/kiểm.217job ở bảy hướng còn thiếu hiện bị chặn dispatch; không dùng fallback SE.31job SE có thể dùng own approved SE đúng hướng; chưa có source nào được tạo.
4. Dispatch nhóm nguồn vừa kiểm được; record.py → inspect-batch.py → xem raw/native → review-sources.py → pack.py. Death/AOE dùng4×4 riêng; giữ source lỗi và tạo sibling correction, không dùng helper main80px để ép khôi lỗi/linh thể.
5. Pack đọc bodyCanvas/bodyPivot theo vai, stone-foot/boot/spectral support tách nhau. Preview holds và terminal hold là dữ liệu ART, không gây hit hoặc đổi gameplay.
6. verify.py, verify-enemy-plan.py, browser/Three theo coverage **thực sau khi có ảnh**; chưa mở ART/motion/runtime approval. Main/limb/story checkpoints giữ nguyên hash. Story/NPC tiếp tục sau nhóm owner ưu tiên.

### Handoff Main theo kế hoạch 16/10

Main 256 clip hiện là checkpoint kỹ thuật candidate. Việc dùng concept 15/10 làm identity canonical, cập nhật runtime registry và đổi `runtimeIntegrated` phải thực hiện theo [kế hoạch tích hợp riêng](../../../CHARACTER-ASSET-INTEGRATION-PLAN-2026-10-16.md); không suy ra từ basis/QA. File cũ và generated cache được quản lý trong [cleanup manifest](../../../archive/character-asset-cleanup-2026-10-16/manifest.json), chưa xóa trước khi smoke test chuyển registry pass.

## Rà tay và chân theo yêu cầu owner

[Trang so trước–sau 1×–4×](review/limb-audit-v1/index.html) · [Biên bản](review/limb-audit-v1/findings.json) · [26 board thực](review/limb-audit-v1/audit.json) · [Browser riêng70check](review/limb-audit-v1/browser-verification.json).

Ba run Bắc/Tây Bắc thay nguồn để rõ chân đổi trụ và tay thay lớp che; run Tây Huyễn Tâm Ý cảnh bổ sung từ source riêng. Hai AOE Nam Ngoại Môn thu gọn bàn tay quá lớn/ngón tỏa nhọn, giữ nối wrist/cuff và chân trụ. Năm clip cũ/30key/atlas giữ nguyên trong `history/limb-audit-r1`;13 nguồn sửa gồm6nguồn đang dùng/7nguồn thử bị loại vẫn giữ đầy đủ prompt/input/hash. Các nguồn thử đảo chi tiết áo hoặc alpha phủ nền không được dùng. Nguồn sửa raster đều qua built-in ImageGen; không vẽ vá tay/chân bằng code.

Rà model không phải owner motion approval. Bàn tay pixel nhỏ có occlusion, không chứng nhận đủ năm ngón tách biệt ở mọi key. Root vẫn là witness/projection candidate; ngồi/ngã cần giữ sai số đúng hồ sơ. `finalize-limb-audit.py` chỉ ghi snapshot208clip/1239key đã xem, không được dùng để suy duyệt các batch tiếp theo. Clip future/source planned bị thay thế có `supersededPlanned` và không được dispatch lại.
