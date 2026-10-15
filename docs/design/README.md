# Thư viện ART — nguồn để tái dùng theo GDD 0.35

**Cập nhật 15/10/2026.** Đọc [GDD](../GDD.md), [hợp đồng thống nhất](../GDD-035-UNIFIED-CONTRACT.md) và [kế hoạch asset toàn game đã đồng ý](../ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md). Mục này dẫn tới nguồn đang giữ; mỗi gói tự ghi phạm vi ART/motion/runtime approval. Số bản xuất, frame, item và artwork gốc không được cộng lẫn.

## Nhân vật và pháp bảo

| Nguồn | Vai trò/trạng thái |
| --- | --- |
| [Concept GDD 14/10](characters/gdd-character-concepts-v1/approval.json) | Neutral main/NPC/truyện/quái/Boss đã ghi lineage theo GDD mới. |
| [Animation GDD 14/10](characters/gdd-character-animation-v1/README.md) | Source animation mới; runtimeReady=false cho tới khi có adapter. |
| [Pixel02/Ngự Phong01](characters/actor-animation-standard-v2/README.md), [approval](characters/actor-animation-standard-v2/approval.json) | Chuẩn nguồn actor Vương Lâm và nét pixel cho người, không thay nhận diện riêng của hai identity. |
| [Thư viện tùy biến giữ nguồn](characters/character-customization-library-v1/README.md) | Áo/khí đã giữ theo yêu cầu owner; không tự phục hồi bộ đã loại. |

Tư Đồ Nam là tàn hồn chỉ điểm trong Thiên Nghịch Châu; Lý Mộ Uyển là trụ cột Đan–Trận/Nhân Duyên. Các bộ chibi/portrait cũ không mở thêm tuyến playable. [Kế hoạch triển khai chuyên ngành](../WANG-LIN-IMPLEMENTATION-PLAN.md) ghi phần đã có và phần còn thiếu.

## Quái, tinh anh, boss và NPC

| Nguồn | Vai trò/trạng thái |
| --- | --- |
| [11 quái/tinh anh Motion01](characters/van-hai-monster-animation-v1/README.md), [VFX02](vfx/van-hai-monster-vfx-v2/README.md) | Nguồn tám hướng hiện có; [checklist cụm](characters/van-hai-monster-animation-v1/CLUSTER-REVIEW.md) giữ yêu cầu spacing, nhịp và FX khi ghép. |
| [Lang Vương và Hắc Ấn — hồ sơ lịch sử](../archive/gdd-legacy-enemies-2026-10-15/README.md) | ART/motion/VFX đã duyệt; gameplay/AI/loot còn hợp đồng riêng. |
| [Hắc Ấn — hồ sơ lịch sử](../archive/gdd-legacy-enemies-2026-10-15/README.md) | Neutral và VFX02 đã duyệt riêng; Motion01 vẫn candidate. |
| [Boss concept02](characters/van-hai-boss-concepts-v2/README.md), [kế hoạch chiêu](../BOSS-SKILL-ANIMATION-PLAN.md) | Tam Ấn/Cổ Mộc theo gate neutral/prototype; không sản xuất lại Lang/Hắc chỉ vì có kế hoạch tổng mới. |
| [NPC/quái/Boss trong gói GDD mới](characters/gdd-character-animation-v1/README.md) | Các source cũ đã retire khỏi test build; đọc coverage và handoff trong gói mới. |
| [Roster thế giới sống](../VAN-HAI-LIVING-WORLD-PLAN.md), [nguồn bố trí](world/van-hai-living-world-v1/README.md) | Dùng NPC/encounter đã thiết kế để nối nguồn vật phẩm; không tự cấp loot từ roster. |

## Vật phẩm, map và UI

| Nguồn | Vai trò/trạng thái |
| --- | --- |
| [Kế hoạch vật phẩm/nguyên liệu toàn game](../ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) | Kế hoạch áp dụng, chưa chốt tổng số icon mới trước kiểm kê. |
| [Danh mục vật phẩm Đợt A](systems/item-material-catalog-gdd035-v1/README.md) | 123 record item/state/currency, asset inventory có hash, nguồn kiếm và recipe theo VG01–VG11. |
| [Gói icon/props Vân Ngọc](gameplay/van-ngoc-gameplay-assets-v1/README.md), [ngữ cảnh items-v1](systems/items-v1/README.md) | 11 trạng thái icon/33 export, ba props và sáu recipe review cũ; ART còn pending, recipe không mặc định chuyển sang VG. |
| [Chuẩn nền Vân Ngọc lịch sử](../archive/gdd-1410-legacy-assets-2026-10-15/README.md) | Map/runtime ART cũ đã retire khỏi test build; map mới sẽ được làm lại. |
| [Đạo Ấn UI/HUD V3](../HANG-NHAC-DAO-AN-V3.md), [định hướng UI](../UI-UX-HUD-REFERENCE-DIRECTION-2026-10-15.md) | UI hiện hành; kiểm item ở kích thước native trong hành trang/tooltip/craft. Hotbar F + 1–7. |

## Tư liệu lịch sử

[Kho kế hoạch asset cũ](../archive/asset-plans-before-gdd-035-2026-10-15/README.md) thay các ngân sách GDD 0.28/HN/VP. [14 bản phác UX idle](index.html), [thư viện VFX cũ](vfx/README.md), [hồ sơ trước Pixel02](../archive/actor-animation-pre-pixel02-2026-10-12/README.md) và [reset map](../MAP-ASSETS-RESET.md) giữ để truy nguồn, không quyết định ưu tiên/roster hiện hành.

Nguồn, prompt, manifest, basis và approval trong các gói production giữ nguyên. Chỉ đổi nhãn/ngõ đọc tài liệu không biến candidate thành approved hoặc thành nội dung runtime. Mục lục toàn dự án ở [docs](../README.md).
