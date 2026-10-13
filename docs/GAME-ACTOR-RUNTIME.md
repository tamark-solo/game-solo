# Actor, nhập môn và encounter · bản chơi thử 13/10/2026

Đã đọc bản merge `fc8e694` trước triển khai. Bản đó có HN05–HN12/EX01–EX04, crafting/checkpoint và 80 clip Vương Lâm live. Đợt này hoàn thiện presentation, input/đòn thường và quái/boss trên nền đó; không xây lại login, inventory hoặc quest engine.

## Kết quả theo thứ tự đã thống nhất

| Bước | Kết quả |
|---|---|
| 1. Vương Lâm live | 80 clip core + 16 clip sinh hoạt. Normal/Shift cùng run, tốc độ native80/120 do client/server dùng cùng luật. Vector facing riêng giữ tám hướng khi dừng/lưu; direction bốn hướng cũ giữ tương thích. |
| Kiếm/Lôi/Phong | Catalog Core live thay 24 binding Vương Lâm bằng body pixel thật tám hướng, socket/ghost theo cùng catalog. Hai avatar khác giữ native4. FX R01/chi phí/quyền giữ nguyên. |
| Đòn thường | Combo có ba lần nhấn F chủ động, 10 sát thương mỗi đòn, 0 MP, tối thiểu800ms giữa lần bắt đầu. Không tự nối đòn, không buffer follow-up. Sau1600ms không nối hoặc hủy sẽ về đòn1. |
| 2. Thổ nạp/thu thập | Bộ [life01](design/characters/wang-lin-pixel-life-v1/README.md) 16clip/96pose. Thổ nạp theo loop/snapshot server; E EX01/EX02 theo fact sau commit, không thưởng từ frame ART. |
| 3. Quái áp sát | [Lang02](design/characters/sect-encounter-actors-v2/README.md) 40clip/240pose, đủ idle/đi/đánh/hit/chết ×8, nối tiếp cận/báo đòn/hồi thế, leash và life mới khi thử lại. |
| 4. HN05 | Giữ luồng đã merge: nhận → ngoại vi riêng → chiến đấu → proof bền → quay về xác nhận nguyên liệu/vật tư một lần. Toàn tuyến/crafting và đường thủ công đã kiểm lại. |
| 5. Boss/progression nhập môn | Khôi Lỗi64clip/384pose nối E03 HN10, xuất hiện và line/circle/melee, dưới nửa HP line hai xung; checkpoint/M04 và ngọc hộ thân giữ từ merge. |

## Luật đòn thường và lifecycle

Release/end: đòn1 200/400ms; đòn2 333⅓/666⅔ms; đòn3 416⅔/750ms. Recovery khóa di chuyển; input đang giữ lúc chấp nhận không tự hủy. Đổi hướng di chuyển trước release hủy, giữ cooldown; sau release không rút lại damage. Không cho cast chồng basic đang hoạt động. Mỗi release xét tầm/góc một lần, hit và trail là hai facts độc lập.

F kèm `inputSeq` và đợi tick input tương ứng, không gửi thêm bước physics. Queue tối đa8/actor, sequence trong64 input + tick kế, hết hạn3giây; drop/leave/transfer/thu hồi phiên dọn queue. Receipt `chapter-v1` cũ giữ nguyên; retry không phát lại hit. Basic save mở rộng tùy chọn, nâng pending cũ khi đọc; restart/reconnect phục hồi tuổi/released và không đánh lần hai. HN10 giữ cửa sổ30giây hiện hành.

HN03 vẫn giữ luật đòn đơn/credit/receipt cũ. Hai avatar chưa có art combo giữ đòn đơn và gesture native hiện có; FX mới áp Vương Lâm. VFX đòn thường live nhận facts đã commit; impact chỉ có khi hit được xác nhận. Catalog Thanh Ngọc5sequence/30frame tách body, dùng24 điểm tay đo; không giả basic thành Kiếm. Actor gục giữ điểm chân và dừng di chuyển/Shift/dash tới khi chuẩn bị lại; prediction theo cùng HP server.

## Core và debug

`shared/actor-actions.ts` sở hữu contract/timing; `ChapterActivity` mô phỏng và tạo facts; `HangNhacRoom` giữ writer/receipt/transport. `PixelPlayerModel` và `encounter-pose-model` là projection thuần. `pixel-player-runtime.ts` / `encounter-actor-presentation.ts` ghép catalog với Three, không tính damage/đồ.

Core R01 thêm `bodyDirectionCountByAvatar`, kiểm đầy đủ hướng riêng từng avatar; cấu hình cũ vẫn hợp lệ. Catalog live ở `/assets/hang-nhac-pixel-player/skill-presentation.json`, tách catalog regression R01 gốc. Bóng Phong dùng history/clip pixel tương ứng, không lấy hình người cũ.

Hook: `__hangNhacPixelPlayer()` đọc pose/facts/FX/cache; `__hangNhacEncounterActor()` đọc clip/pose/cache; `__hangNhacDiagnostics().input` đọc ý định/fast/sequence; `__hangNhacChapter()` đọc scene/phase/checkpoint/proof. Nhịp snapshot chapter khi running là100ms để timer/báo đòn không đứng do dedup bỏ `now`. Chưa là kết quả benchmark room MMO.

Decoded atlas budget: Vương Lâm32MiB, encounter16MiB; cache hữu hạn, source mới theo demand cho quái. Đây không phải tổng GPU/browser RAM. Test GPU bằng SwiftShader chỉ xác nhận correctness.

## Lưu ý cho bước ghép nhóm quái · 13/10/2026

Theo yêu cầu owner sau [review cụm body/VFX02](design/characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md), khi tích hợp cần phối hợp ba phần: **AI giãn điểm đứng/tiếp cận theo vai trò và giữ đường né; server dàn nhịp báo đòn/phát đòn theo Core; presentation giới hạn FX cộng dồn, ưu tiên nguy hiểm và phản hồi trúng**. Giảm hiệu ứng phụ trước, giữ rõ người và cảnh báo. Không dùng opacity để thay giải pháp thân quái dồn cụm hoặc để thay kết quả hit server.

Đây là yêu cầu cho integration tiếp theo, chưa là luật đang chạy của Lang02/Khôi Lỗi02. Thông số số lượng/khoảng đứng/lệch nhịp/opacity trong sân review chỉ là fixture. Chốt chúng bằng encounter thực ở camera1×, kiểm đường né, lifecycle/facts và tải runtime; giữ navigation/map/DB owner. Checklist và căn cứ đo nằm trong tài liệu review liên kết trên.

## Nguồn, kiểm và phạm vi

323 hash basis40 giữ nguyên. Life mới tạo bằng built-in ImageGen, source/prompt/input/registration ở gói riêng; quái/boss lấy có chọn lọc từ archive có hash, không khôi phục player/pipeline cũ. Combat40/life16/quái/boss là ART ứng viên trong bản chơi thử; test không thay duyệt hình.

`npm.cmd run assets:game-actor-actions` đồng bộ R01, player80 và gói mới; không gọi owner map builder. `npm.cmd run test:game-actor-actions` kiểm hash/720frame, unit, GPU và browser thật. Hồi quy chapter, lessons, R01/aim, sect, character, reload, HUD/layer/Dao UI trên DB riêng. Xem [asset](data/game-actor-actions-verification.json), [GPU](data/game-actor-actions-gpu-verification.json) và `artifacts/game-actor-runtime/verification.json` cùng log hồi quy.

Nền Hằng Nhạc/Vân Ngọc,9 blocker/Spawn/camera1× và DB/draft owner không sửa. Nền ngoại vi vẫn là code thử1280×896, chưa ART/layer sản xuất. Nguồn HN/EX hữu hạn giữ nguyên, chưa mở farm vô hạn/kill reward, tăng HP/MP theo cảnh giới, PvP, chợ hoặc mount.

Tiếp nối progression: hoàn thiện ART ngoại vi sau navigation; sau vòng nhập môn ổn, RM5-A dùng một nguồn farm riêng + một nơi tiêu nguyên liệu tạo nâng cấp thật; RM5-B tỷ thí có consent/lifecycle server; RM5-C ngoại hình/inspect theo ownership. Không tái mở receipt nhiệm vụ hữu hạn để farm. [Hợp đồng](MMORPG-SYSTEM-CONTRACTS.md) và [lộ trình](DEVELOPMENT-ROADMAP.md) tiếp tục là cơ sở các gói này.
