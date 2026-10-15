# Mục lục tài liệu Vân Hải Đạo Đồ


**Duyệt tạo hình GDD 0.34 / dọn ART đối thủ cũ ·15/10:** owner chấp nhận 18 neutral main/NPC/truyện/quái/boss trong [gói GDD mới](design/characters/gdd-character-concepts-v1/README.md), pin đúng source/native/lineage tại [approval](design/characters/gdd-character-concepts-v1/approval.json); một hướng Đông Nam, chưa motion/FX/runtime mới. Theo yêu cầu cleanup, 10 gói quái/tinh anh/Boss GDD cũ cùng 67 tool/test đã chuyển vào [ZIP lưu trữ kiểm hash](archive/gdd-legacy-enemies-2026-10-15/README.md); các mốc ART đối thủ ngày13/10 trong tài liệu trước đây là lịch sử trong archive. Không dùng lại hoặc tái sinh bộ cũ ở luồng active. Roster/logic GDD, main V5/V1/V2, NPC, reference và bộ Lang/Khôi Lỗi đang chạy vẫn được giữ. [Biên bản](GDD-LEGACY-ENEMY-ASSET-CLEANUP-2026-10-15.md).

**Chuẩn hóa GDD 0.34, Đồng bộ G0 & Prototype Vòng Lặp G2 · 14/10:** [GDD 0.34](GDD.md) đã chốt 3 định hướng lớn cùng owner (đồng thời dọn bỏ các file GDD phiên bản cũ để tránh nhầm lẫn): **(1) Một tuyến nhân vật chính duy nhất (`Huyễn Tâm a` / `Tịch Bạch b`) + 4 Pháp Bảo biểu tượng** (*Kiếm linh, Hồn phiên, Xạ Thần Xa, Thiên Nghịch Châu*), đưa **Tư Đồ Nam** về vai trò tàn hồn chỉ điểm trong Châu và **Lý Mộ Uyển** về trụ cột Đan–Trận / Nhân Duyên ở Quyết Minh Cốc – Tu Ma Hải; **(2) Vòng lặp 20% Cốt truyện Nghịch thiên (`Mệnh Kiếp Chí`) + 80% Sandbox Tu luyện & Kỳ ngộ mở**; **(3) Khung 5 Đại Cảnh Giới (`Ngưng Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần`) × 3 Mốc Pháp Bảo (`Mốc I → II → III`)**. Xem [Lộ trình Giai đoạn & Nhiệm vụ](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md), [Đặc tả Artwork & Logic Từng Chặng](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md), [Reference Thị trường & Tiên Nghịch 14/10](XIANXIA-MARKET-STORY-REFERENCES-2026-10-14.md) và [Prototype Vòng Lặp Tiến Trình Nhánh G2](design/gameplay/wang-lin-progression-loop-prototype-v1/README.md) ([sân chơi tương tác](design/gameplay/wang-lin-progression-loop-prototype-v1/index.html) · `955 checks / 9 unit tests PASS`).


**Cập nhật 15/10/2026 · GDD 0.35.** Một tuyến nhân vật chính Huyễn Tâm/Tịch Bạch, bốn pháp bảo, năm cảnh giới và Mệnh Kiếp Chí VG01–VG11. Owner đã đồng ý kế hoạch asset toàn game; ưu tiên kiểm kê vật phẩm–nguồn–recipe–đích tiêu, tận dụng nhân vật/quái/boss hiện có và bổ sung phần thiếu.


## Thiết kế áp dụng


| Tài liệu | Vai trò |

| --- | --- |
| [GDD 0.35](GDD.md) | Thiết kế sản phẩm hiện hành. |
| [Hợp đồng thống nhất GDD 0.35](GDD-035-UNIFIED-CONTRACT.md) | Phụ lục quy phạm cho điều kiện tiến trình, pháp bảo, tu luyện và kinh tế. |
| [Kế hoạch tổng thể vật phẩm, nguyên liệu và asset](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) | Phạm vi toàn năm cảnh giới, sáu luồng phát triển; thứ tự A–E đã được owner đồng ý. |
| [Danh mục vật phẩm Đợt A](design/systems/item-material-catalog-gdd035-v1/README.md) | 123 record item/state/currency, 60 asset record, 25 nguồn và 18 recipe/mẫu cấu trúc; kiểm kê chưa phát hành runtime. |
| [Điểm vào asset](ASSET-PLAN.md) | Dẫn tới kế hoạch tổng thể và các hồ sơ chuyên ngành; thay ngân sách cũ. |
| [Tiến trình và nhiệm vụ](STAGE-PROGRESSION-QUEST-REDESIGN-2026-10-14.md) | Các chặng VG và điều kiện nhận tài nguyên. |
| [Artwork–Logic từng chặng](STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md) | Nối yêu cầu gameplay với phần hình đã có/cần thêm. |
| [Nhịp tu luyện và chiều sâu MMO](MMORPG-CULTIVATION-PACING-AND-DEPTH-2026-10-15.md) | Mục tiêu nhịp chơi, nguồn–chi và các hệ phát triển; thời lượng chưa được đo balance. |
| [Review và các điểm đã thống nhất](REVIEW-GDD-0.35-2026-10-15.md) | Theo dõi mâu thuẫn tài liệu và phạm vi đã sửa. |
| [Nghiên cứu thị trường/truyện](XIANXIA-MARKET-STORY-REFERENCES-2026-10-14.md) | Căn cứ tham khảo, không tự mở nội dung. |
| [Huyễn Tâm/Tịch Bạch — triển khai chuyên ngành](WANG-LIN-IMPLEMENTATION-PLAN.md) | Reuse production V2; P0–P8 là hồ sơ gốc, không lệnh sản xuất lại. |
| [UI/UX theo GDD](UI-UX-HUD-REFERENCE-DIRECTION-2026-10-15.md) | Định hướng và khoảng trống UI cần nối vào hệ thống. |

## Thư viện asset và phạm vi duyệt

Xem [thư viện ART hiện có](design/README.md) để tới từng bộ nguồn, review và approval. Trạng thái kỹ thuật, chấp thuận kế hoạch, duyệt hình và ghép runtime được ghi riêng.

| Bộ | Trạng thái cần đọc |
| --- | --- |
| [Gói nhân vật GDD 14/10](design/characters/gdd-character-animation-v1/README.md) | Source animation mới cho main/quái/Boss; runtimeReady=false và adapter sẽ làm ở bước sau. [Gói concept](design/characters/gdd-character-concepts-v1/README.md) giữ neutral/lineage. |
| [Quái/tinh anh Motion01](design/characters/van-hai-monster-animation-v1/README.md), [VFX02](design/vfx/van-hai-monster-vfx-v2/README.md) | Tận dụng nguồn hiện có; xem đúng phạm vi phản hồi/approval, không suy quyền ghép từ QA. |
| [Lang Vương và Hắc Ấn — hồ sơ lịch sử](archive/gdd-legacy-enemies-2026-10-15/README.md) | Các gói cũ đã lưu trữ; không dùng làm backlog production hiện hành. |
| [NPC/thế giới sống](VAN-HAI-LIVING-WORLD-PLAN.md) | Roster và các đợt sản xuất; [bộ chiêu boss](BOSS-SKILL-ANIMATION-PLAN.md) giữ yêu cầu prototype/cửa né. |
| [Nền Vân Ngọc V2](HANG-NHAC-VAN-NGOC-BASELINE.md) | Chuẩn ART nền hiện hành; owner sở hữu map/navigation. |
| [Icon/props Vân Ngọc trước GDD 0.35](design/gameplay/van-ngoc-gameplay-assets-v1/README.md) | Nguồn hình có thể đối chiếu để reuse; recipe HN/EX và approval chưa được chuyển thành luật VG. |

## Runtime, công cụ và kỹ thuật

| Tài liệu | Phạm vi |
| --- | --- |
| [Đạo Ấn UI/HUD V3](HANG-NHAC-DAO-AN-V3.md) | UI mặc định hiện tại, hotbar F + 1–7. Các review V2/V3 giữ riêng. |
| [Actor runtime](GAME-ACTOR-RUNTIME.md), [Skill Core](SKILL-CORE.md) | Bản chạy và hợp đồng presentation/simulation; không suy cơ chế mới từ gói ART. |
| [Nhiệm vụ/tìm đường](HANG-NHAC-QUEST-NAVIGATION.md) | Tương tác tracker, lựa chọn và lifecycle. |
| [Registry nội dung](GAME-CONTENT-CATALOG-RUNTIME.md), [taxonomy](GAME-CONTENT-TAXONOMY.md), [kiểm soát Core/storage](GAME-CONTENT-CONTROL-PLAN.md) | Phân lớp dữ liệu và công cụ quản trị; số item/recipe HN/VP trong ví dụ là snapshot. |
| [Kiến trúc](ARCHITECTURE.md), [công nghệ](TECH-STACK.md), [runbook](PREVIEW-RUNBOOK.md) | Cách chạy/kiểm theo phạm vi từng thay đổi. |
| [Map Editor](MAP-EDITOR.md), [Level Design](MAP-LEVEL-DESIGN.md), [quy tắc map](MAP-BUILDING-GUIDE.md) | Công cụ và quyền sở hữu dữ liệu owner. |
| [Skill sản xuất actor](skills/game-actor-animation-production/SKILL.md) | Quy trình ART nhân vật/quái/boss; dùng đúng source, pivot và view. |

G2 v1 là [prototype theo GDD 0.34](design/gameplay/wang-lin-progression-loop-prototype-v1/README.md); các kết quả kiểm đã lưu không xác nhận nó đã thực thi đầy đủ hợp đồng 0.35. Owner cho phép làm lại logic bản chạy chưa đưa vào test, đồng thời giữ lineage/approval ART và dữ liệu map/save owner.

## Lịch sử và hồ sơ truy nguồn

- [Kho bốn kế hoạch asset đã thay](archive/asset-plans-before-gdd-035-2026-10-15/README.md) ghi bản cũ và hash trước/sau dọn. Các trang ITEM-PRODUCTION-PLAN/ITEM-CRAFTING-DESIGN/HANG-NHAC-VAN-NGOC-ASSET-PLAN chỉ chuyển hướng.
- [items-v1](design/systems/items-v1/README.md) giải thích manifest 13 định nghĩa/sáu recipe và liên hệ với gói artwork cũ; chưa là master catalog GDD 0.35.
- [Trạng thái dự án theo mốc](PROJECT-STATUS.md), [roadmap RM](DEVELOPMENT-ROADMAP.md), [backlog GD](MVP-BACKLOG.md), [kế hoạch RPG trước](RPG-CONTENT-PLAN.md) giữ diễn biến kỹ thuật/thiết kế. HN/EX/VP và ba tuyến playable trong các mốc cũ đã được thiết kế hiện tại thay thế.
- [Thư viện tùy biến giữ nguồn](design/characters/character-customization-library-v1/README.md), [archive trước Pixel02](archive/actor-animation-pre-pixel02-2026-10-12/README.md), [biên bản dọn asset 12/10](ASSET-CLEANUP-2026-10-12.md) giữ provenance; không phục hồi bộ bị loại làm fallback.
- [Bản phác UX idle](design/index.html), [thư viện VFX theo phiên bản](design/vfx/README.md) và [hồ sơ reset map](MAP-ASSETS-RESET.md) là tư liệu có ngày/phạm vi riêng.

Kiểm liên kết và tính nhất quán tài liệu hiện hành bằng: node scripts/verify-gdd-035-docs.mjs. Đây là kiểm tài liệu, chưa là xác nhận cân bằng hoặc tích hợp game.
