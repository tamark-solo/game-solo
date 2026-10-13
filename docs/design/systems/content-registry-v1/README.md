# Sổ catalog nội dung khởi đầu

**13/10/2026 · bổ sung design NPC/encounter:** sổ hiện có96record/60quan hệ:56 hàng trước +14 NPC +15 đối thủ +8 vật liệu +3 scene/map design từ [hồ sơ thế giới sống](../../../VAN-HAI-LIVING-WORLD-PLAN.md). 40 hàng mới đều unreleased/pending; chỉ số/ART/loot chưa duyệt. Bốn vai NPC runtime được giữ qua existingStationId, danh tính mới là đề xuất. Các số56/45 và trạng thái phạm vi dưới đây ghi mốc kiểm kê trước; runtime HN05–HN12/EX đã có theo hồ sơ chương, index không là gameplay loader. NPC/encounter nay được kiểm kê một phần; loot/unlock/relationship và các domain khác tiếp tục đặc tả.

**11/10/2026 · design index 1 · backend quản trị đọc, không là nguồn luật gameplay.** [Phân loại](../../../GAME-CONTENT-TAXONOMY.md) · [Core/quy trình](../../../GAME-CONTENT-CONTROL-PLAN.md) · [catalog.json](catalog.json).

Sổ kiểm kê một phần nội dung đã biết: **56 record** gồm 13 item, 12 quest, 4 activity, 5 nguồn grant, 6 recipe, 3 skill, 4 mốc, 1 map và 8 diện mạo (năm áo, ba khí tức). Có **45 quan hệ có kiểu** để xem nguồn–nơi dùng/phụ thuộc. 13 item gồm 3 tham chiếu code và 10 đề xuất; 12 quest gồm HN01–HN04 có gameplay và HN05–HN12 chưa triển khai. Có text HN05 trong UI không làm nó thành quest đã chạy.

**Sau xác nhận xây catalog:** [registry quản trị v1](../../../GAME-CONTENT-CATALOG-RUNTIME.md) đã có schema/validator, file reader qua Core port, API role admin và tab Catalog. Kiểm bằng `npm.cmd run check:content-catalog`; role admin mở `/admin.html?view=catalog`. Backend quản trị đọc/kiểm index, gameplay tiếp tục dùng định nghĩa hiện có.

[Thư viện diện mạo giữ cho tùy biến](../../characters/character-customization-library-v1/README.md) là nguồn của 8 record cosmetic; concept khí 04 đã duyệt hình, nhưng cả 8 đều `unreleased`, không tự mở lúc tạo nhân vật. NPC/encounter đã có phần kiểm kê concept01 ngày13/10. Mount/companion/method/loot/unlock/achievement/title/social/currency chưa kiểm kê thành record trong sổ này. Mẫu phân loại của chúng nằm ở taxonomy; không bịa asset, chỉ số hay nguồn nhận để lấp hàng. Đây không phải catalog đầy đủ toàn game.

## Trường của mỗi hàng

| Trường | Ý nghĩa |
| --- | --- |
| `domain`, `id` | Khóa có kiểu; ID code cũ được giữ, không đổi prefix vì đổi tên game |
| `displayName`, `classification` | Nhóm/vai trò để lọc; tag không tự cấp gameplay effect |
| `ownershipScope`, `storage` nếu có | Nguồn sở hữu/lưu theo hồ sơ; định nghĩa không phải owned instance |
| `source.path` | Nguồn chi tiết **tính từ workspace root**, không từ folder JSON |
| `source.symbol/collection/recordId/section` | Cách tìm record/định nghĩa trong code/plan/doc; không phải selector thực thi |
| `relations` | `{domain,id,relation}`; typed target để xem graph, không chạy điều kiện/hiệu lực |
| `status.implementation` | `implemented-local` hoặc `unreleased`; có pilot khác production-ready |
| `status.decision/balance/art` | Trỏ về nguồn hoặc pending; không suy ownerApproved/balanceApproved/artApproved |
| `stage`, `runtimeNotes` | Chặng/gate tham khảo và giới hạn hiện tại; không cam kết phát hành |

`pending` là chưa quyết định, `not_applicable` là không áp dụng; `see-source` yêu cầu đọc nguồn. Thiếu field hoặc pending không là không ràng buộc/miễn phí/vô hạn. Sổ không phải schema runtime tương lai: trước release cần typed domain schema và các trường bắt buộc được kiểm theo slice.

Sổ **không chép số lượng recipe/thưởng, damage, CD, drop rate**. Các giá trị vẫn ở [plan item](../items-v1/plan.json), hồ sơ chuyên ngành hoặc code được trỏ tới. Khi nguồn đổi ID/loại/quan hệ/status, cập nhật index trong cùng đợt; không giữ hai nơi độc lập cùng sửa balance.

## Ví dụ phân loại đồ hiện có và dự kiến

| ID | Nhóm | Lưu/sử dụng | Nguồn chuẩn |
| --- | --- | --- | --- |
| `wood-sword`, `plain-robe` | Equipment | Instance; gear pilot không bonus | `shared/character-inventory.ts` |
| `recovery` | Consumable | View stack duy nhất ở `sect.supplies` | Cùng module + sect server |
| `hn-refining-material` | Material | Nguyên liệu nhiệm vụ, nguồn HN05/HN06 một lần | Plan item/HN catalog, chưa runtime |
| `hn-training-jade` | Artifact | Raw/refined trên cùng instance | Recipe transform dự kiến HN08 |
| Năm `vh-*` nguyên liệu | Material theo họ dược/dung môi/sợi/dẫn khí/giá thể | Input recipe, riêng từng hồ sơ | Plan item, chưa runtime |
| `vh-guiding-ink` | Intermediate | Input niêm cho một chuyến | Plan item, chưa runtime |
| `vh-sealed-case`, `vh-flow-compass` | Tool | Context action, khác hotbar combat/slot ba lô | Plan item, chưa runtime |

Ví dụ graph: `quest:HN05 → source:hn05-first → item:hn-refining-material → recipe:hn-refine-training-jade → item:hn-training-jade`. Các cạnh đầu/cuối khác nghĩa: điều kiện nhận, nguồn grant, input tiêu và transform cùng instance. Số/phase/evaluator ở nguồn chi tiết; graph này không tự xác nhận quest hoặc phát ngọc.

## Kiểm hiện tại và bước tiếp

Đợt này kiểm JSON đọc được, unique typed IDs, đường dẫn/collection record nguồn, các ref không đứt, đối chiếu 3 item/R01/HN view và cờ `runtimeConsumable:false`. Bằng chứng ở [verification](../../../data/game-content-catalog-verification.json). Chưa chạy compiler/loader/evaluator gameplay; chưa validate toàn prerequisite, kinh tế, balance hoặc asset approval.

Sau kiểm kê chọn **HN05 + nguồn material + nơi dùng HN08** để hiện thực definition/validator/migration cần thiết. Admin catalog đầu có thể chỉ đọc/tìm/lọc/inspect nguồn và dependency; editor live và toàn mount/cosmetics là các gói sau khi có contract.
