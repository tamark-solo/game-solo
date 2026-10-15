# Phân loại nội dung — catalog thống nhất cho Vân Hải Đạo Đồ

> **Phân loại tài liệu ·15/10/2026.** Giữ làm tài liệu kỹ thuật về phân lớp/authority và kiểm soát dữ liệu. Các ví dụ GDD 0.32, HN/EX/VP và số 13 item/sáu recipe thuộc snapshot cũ, không là thiết kế nội dung hiện hành. Điều kiện và nguồn–chi áp dụng xem [hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md) và [kế hoạch asset toàn game](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md); việc dọn docs chưa đổi schema/registry/runtime.

**Thiết kế 0.1 · 11/10/2026 · phục vụ GDD 0.32.** Đây là khung biên tập/kiểm soát đề xuất; có [sổ kiểm kê tham chiếu](design/systems/content-registry-v1/README.md), đã có [registry quản trị chỉ đọc](GAME-CONTENT-CATALOG-RUNTIME.md); compiler và definition gameplay mới chưa triển khai. Không tự cấp đồ, mở nhiệm vụ, chốt rarity/stat/giao dịch hoặc duyệt ART.

Đọc cùng [GDD 0.35](GDD.md), [hợp đồng thống nhất](GDD-035-UNIFIED-CONTRACT.md), [catalog Hằng Nhạc](HANG-NHAC-CONTENT-CATALOG.md), [luyện chế](archive/asset-plans-before-gdd-035-2026-10-15/ITEM-CRAFTING-DESIGN.md), [hợp đồng MMORPG](MMORPG-SYSTEM-CONTRACTS.md) và [kế hoạch kiểm soát Core/storage](GAME-CONTENT-CONTROL-PLAN.md). Tài liệu này sở hữu cách phân loại; tài liệu chuyên ngành tiếp tục sở hữu luật và số liệu, tránh có hai bảng điều hành cùng nội dung.

## 1. Ba lớp dữ liệu, ba trách nhiệm

| Lớp | Ví dụ | Nơi quyết định |
| --- | --- | --- |
| **Definition — định nghĩa nội dung** | Mộc kiếm là gì; recipe tiêu gì; quest kiểm kết quả nào; outfit cần asset nào | Catalog có version, biên tập và kiểm trước release |
| **Owned/progression — thành quả riêng** | Instance kiếm của ai; số vật tư; recipe đã học; quest proof; quyền outfit | Server và persistence theo character/realm, transaction/receipt |
| **Active simulation — hoạt động hiện tại** | Đang cast, attempt E01, projectile, mount đang cưỡi | Gameplay server theo room/activity và lifecycle |

Năng lực tính ra đọc nguồn hợp lệ từ ba lớp, không trở thành catalog stat do client tự gửi. HP/MP/deadline và proof đã commit có luật lưu riêng; phân lớp không có nghĩa reset tất cả hoạt động khi reconnect. ID definition khác ID instance, source grant và attempt.

## 2. Registry theo domain, không gom mọi thứ vào ba lô

Mỗi domain có schema riêng và một module nghiệp vụ chịu trách nhiệm. Bảng là phạm vi quản lý dài hạn; chỉ nhập/triển khai những bản ghi cần cho lát đang làm.

| Domain | Nhóm nội dung | Dữ liệu người chơi tương ứng / ranh giới |
| --- | --- | --- |
| `item` | Material, equipment, consumable, artifact, tool, intermediate | Stack/instance, owner/binding/place/protection; artifact có nhận biết/luyện hóa theo luật riêng |
| `mount` | Mẫu tọa kỵ, capability cưỡi, presentation binding | Quyền sở hữu khác đang cưỡi; capability gameplay khác mount skin |
| `cosmetic` | Outfit, weapon/artifact/mount skin, hiệu ứng diện mạo | Entitlement và lựa chọn hiển thị; không mặc định là đồ có số lượng trong túi |
| `companion` | Mẫu đồng hành, nếu gói nội dung mở | Ownership và active actor riêng; không mặc định pet combat từ một asset đẹp |
| `skill` | Thuật chủ động/bị động, tier và behavior đã có | Quyền dùng/loadout; animation clip hoặc icon không tự cấp skill |
| `method` | Công pháp, phương pháp vận hành, truyền thừa | Learned/active method riêng; vật chứa sách nếu cần là item liên kết |
| `cultivation` | Cảnh giới/ngưỡng/mốc, điều kiện đột phá | Tích lũy, xác nhận mốc và nguồn power; không lấy tên canon làm stat |
| `quest` | Chính tuyến, nhánh nhân vật, phụ một lần, bài luyện | Progress/proof/branch/reward claim; proof và journal không phải item |
| `activity` / `encounter` | Farm, tỷ thí, bí cảnh / mẫu trận, quái, node | Attempt/cycle/spawnLife, participants/ruleset/credit; repeat khác reward quest lần đầu |
| `npc` / `map` | Nhân vật thế giới, dịch vụ / vùng, điểm và release map | Tham chiếu nội dung/route; không thay authored map/collider từ catalog |
| `loot` / `recipe` | Gói grant/drop / công thức, dịch vụ và biến đổi | Ledger nhận/chi và unlock; bảng số là nguồn thiết kế được chỉ định |
| `source` | Nguồn grant/chu kỳ nhận, nối quest/activity/loot với tài sản | Business receipt theo nguồn/lần đầu hoặc đời/cycle; khác bảng drop và request ID |
| `unlock` / `achievement` / `title` | Quyền nội dung, thành tựu, danh hiệu | Quyền/record/chọn danh hiệu; không biến mọi unlock thành sách hoặc token |
| `social` | Định nghĩa tông môn/faction, vai trò và luật hoạt động | Membership/quan hệ/guild do hệ riêng giữ; party/guild runtime không phải static definition |
| `currency` | Loại tiền/tài nguyên trao đổi, khi thật sự mở | Số dư và ledger theo scope đã chốt; không coi mọi material hoặc tu vi là tiền |

`artifact` là subtype item khi có instance gameplay; hình pháp bảo là cosmetic/presentation liên kết. Cùng một món có nhiều công dụng không cần nhiều bản sao definition. Hộp giữ khí và Định Lưu Bàn là tool instance; seal/cargo của chuyến là state/fact đúng activity, không thêm container lồng hoặc túi mẫu bán được.

## 3. Phân loại nhiều trục, không dùng màu để điều khiển mọi luật

| Trục | Trường thiết kế / câu hỏi |
| --- | --- |
| Loại và chức năng | `domain`, `subtype`, `functionTags`: material để chế, recovery để hồi, tool để khảo sát; tag có danh mục kiểm soát |
| Họ vật liệu | `materialFamily`: dược liệu, dung môi, dẫn khí, sợi/bao bọc, giá thể; chỉ áp dụng món phù hợp |
| Phẩm cấp | `gradeRef` nếu hệ đã chốt; khác trạng thái raw/refined, level nâng cấp và màu UI; chưa chốt thì `pending`, không mặc định màu tím |
| Điều kiện | `requirements`: mốc/cảnh giới, method, quest, zone/activity, trạng thái; avatar restriction chỉ khi có lý do và luật |
| Nguồn | `sourceRefs`: quest/recipe/activity/grant hợp lệ, lần đầu hay cycle; dữ liệu thử có nhãn |
| Nơi dùng | `useRefs`/`sinkRefs`: recipe/action/slot/hoạt động tiêu hoặc dùng lại; biết món dư dùng vào đâu |
| Sở hữu | `ownershipScope`, `bindingPolicyRef`: character/account/realm theo gói, điều kiện chuyển/bán; protection là cờ khác binding |
| Số lượng | `storageKind`: stack/instance/entitlement/fact; `stackPolicyRef`, capacity và đường nhận bắt buộc nếu áp dụng |
| Khả dụng | `availability`: planned/unreleased/released/retired và release/điều kiện mở; chưa có code khác bị khóa tiến trình |
| Nguồn sáng tác | `provenance`: nguồn truyện/reference hoặc sáng tạo game, người biên tập và tài liệu; đổi brand không tự đổi canon |

Các trường không áp dụng ghi `not_applicable`; chưa quyết định ghi `pending` kèm decision reference. Null/ô trống không được ngầm hiểu là không ràng buộc hoặc cấp vô hạn. `functionTags` phục vụ tra cứu; luật chỉ đọc trường/schema được quy định, không tự suy bonus/ngũ hành từ tên/tag.

Theo dõi riêng **design status** (candidate/specified/reviewed), **code status** (not_implemented/pilot/verified), **ART status** (not_needed/not_started/draft/owner_approved), **balance status** (not_applicable/trial/validated) và **release status**. Từng trạng thái có người/xác nhận/bằng chứng; test kỹ thuật không chuyển ART thành đã duyệt, owner chốt hướng không biến số thử thành balance đã khóa.

## 4. ID và tham chiếu có kiểu

- Giữ nguyên `wood-sword`, `plain-robe`, `recovery`, HN/R01/M01 và ID instance/receipt cũ. Namespace biên tập `legacy` có thể giúp kiểm kê, không tự đổi protocol/save thành `legacy:*` hoặc đổi hàng loạt theo tên game.
- ID mới ổn định và không chứa tên hiển thị, rarity, level hoặc version có thể đổi. Các `hn-*`, `vh-*` hiện là ID thiết kế; phải đăng ký/kiểm trước đưa vào runtime. Nhãn CT01, VP0, RM1 là nhãn tài liệu, không ID giao thức mới.
- Reference có cả kiểu và ID: `{ domain: 'item', id: 'recovery' }` khác `{ domain: 'quest', id: 'HN05' }`. Compiler kiểm tồn tại, đúng subtype/action và availability; không chỉ tìm chuỗi trùng.
- Version của definition/release/ruleset/schema khác khóa thưởng nghiệp vụ. Đổi tên/lời thoại không tạo grant mới; thay gameplay có impact/migration riêng. ID ngừng dùng có tombstone/mapping đọc save cũ, không tái dùng cho món khác.
- Effect/condition khai báo nối tới evaluator có tên, schema tham số và allowlist trong code. Không `eval`, JavaScript nhập từ sheet, hoặc chuỗi effect tùy ý được backend thi hành.

## 5. Ví dụ nhỏ đối chiếu nội dung hiện hành

| ID / trạng thái | Phân loại | Nguồn → nơi dùng / lưu riêng |
| --- | --- | --- |
| `wood-sword` — có pilot | item/equipment, slot weapon, instance | Khởi tạo/migration hiện có → mang/tháo; chưa bonus, không khóa R01 nếu tháo |
| `plain-robe` — có pilot | item/equipment, slot robe, instance | Cùng nguồn pilot → mang/tháo; chưa đổi sprite hoặc stat |
| `recovery` — có pilot | item/consumable, recovery, stack view | Nguồn HN01 hiện có → dùng hồi HP; số lượng duy nhất ở `sect.supplies`, không tạo stack thứ hai |
| `hn-refining-material` — thiết kế | item/material, luyện hóa nhiệm vụ | Xác nhận HN05/HN06 theo bảng thử → recipe HN08; binding character, chưa nguồn farm runtime |
| `hn-training-jade` — thiết kế | item/artifact, instance raw/refined | Phôi HN08 một lần → biến đổi cùng instance, charm khi refined; chưa code/ART duyệt |

Catalog HN có **5 định nghĩa: 3 hiện có, 2 dự kiến**. Catalog tới VP3 có 13 theo [luyện chế](archive/asset-plans-before-gdd-035-2026-10-15/ITEM-CRAFTING-DESIGN.md); số thử ở nguồn đó, không tạo thêm bảng balance trong tài liệu này. Validator pilot hiện chỉ nhận hai gear, không hỗ trợ đồ mới bằng việc thêm icon/constants.

**HN05:** quest chính tuyến một lần, hiện `unreleased`. Tham chiếu encounter E01 đề xuất và ngoại vi chưa triển khai; thắng tạo `hn05-encounter-proof` của đúng owner/attempt, rồi xác nhận NPC mới cấp gói nguồn HN05 atomic. Proof không là loot/item; kill E01 không tự cấp thêm hoặc mở farm lặp. Source key theo character + reward grant lần đầu giữ qua đổi text/version; retry attempt khác không nhận lại. Số thử và luật thua/transfer cần chốt trong đặc tả HN05 trước release.

**Ví dụ diện mạo sơ đồ, chưa đăng ký runtime:** `vh-mount-cloud-crane` (mount candidate) có quyền sở hữu và capability cưỡi cần đặc tả; `vh-outfit-cloud-disciple` (cosmetic candidate) có entitlement + selected appearance. Không có asset/frame/stat/source grant thực, không hiện nút nhận/mặc trong game. Skin tọa kỵ khác tốc độ/footprint: đổi hình không tự bay qua blocker, đổi collider hoặc sửa locomotion 64 × 96/camera 1×. Peer chỉ nhận projection cần render, không toàn inventory/quest.

## 6. Kiểm soát theo lát sản xuất, có người chịu trách nhiệm

| Lát hiện hành | Catalog phải có | Chưa kéo vào lát |
| --- | --- | --- |
| Nền HN05 / VP0 | 3 món pilot, material tối thiểu nếu đặc tả dùng; quest/proof/grant, E01/ngoại vi theo gate RM | Crafting đầy đủ, currency/trade/mount |
| HN08 / VP1 | Jade/state/recipe/method/effect và bài dùng thật | Bản mệnh/khí linh/cây nâng vô hạn |
| Farm pilot / VP4-A | Một source lặp, nơi tiêu, power effect và loot/receipt rõ | Daily hoặc reset thưởng HN/EX để giả làm farm |
| Tỷ thí / diện mạo | Ruleset/consent; một entitlement và peer presentation có nguồn kiếm | Rank/economy hoặc ART mount đầy đủ trước kiểm gói nhỏ |
| VP2/3 và các gói sau | Chỉ definitions/recipes/activities được chọn cho gói | Không bật cả catalog dự kiến cùng một release |

Owner giữ mục tiêu/chọn phạm vi; content designer giữ ID, câu chuyện, source–use và dependency; gameplay/backend giữ evaluator/ownership/grant/lifecycle; ART/UI giữ manifest, native contract và trải nghiệm đọc; QA giữ bằng chứng kiểm. Một người có thể kiêm nhiều vai, mỗi record vẫn có `responsibleRole`, assignee và reviewer để biết cần hỏi ai.

## 7. Từ biên tập tới release

1. **Kiểm kê/nhập:** nhập code thật và tài liệu thiết kế vào catalog có trạng thái; sheet là bề mặt biên tập, JSON là nguồn có schema/version khi gói cần. Chỉ định một nguồn chuẩn, không cho sheet/JSON/code cùng sửa độc lập.
2. **Validate:** ID/reference đúng; required/pending rõ; quantity hợp lệ; source–use không vòng khóa; reward lần đầu/lặp riêng; recipe không tự đòi output của nó; trạng thái/asset/release và yêu cầu codec tương thích. Luật phức tạp vẫn cần test evaluator và chơi thử.
3. **Review:** duyệt nội dung/luật, ART và balance theo bằng chứng riêng; record chưa đạt giữ planned/unreleased. Báo diff chỉ rõ thêm/sửa/ngừng dùng, nguồn thưởng, sink, asset và save bị ảnh hưởng.
4. **Compile:** xuất public catalog chỉ có text/icon/action/projection được phép; server catalog có grant/evaluator/điều kiện và dữ liệu riêng. Cả hai có release ID/hash, giữ schema typed; client gửi ID không có quyền cấp đồ. Chưa có compiler thì tiếp tục adapter hiện hành có kiểm, không giả báo compiler đã chạy.
5. **Release:** manifest khóa danh sách hữu hạn, dependency và phiên bản code/schema/ruleset phù hợp; kiểm fixture save cũ, restart/receipt, rồi smoke/playtest/ART riêng theo phần đã đổi. Không hot reload live số thưởng từ bảng chưa duyệt.
6. **Migration/retire:** có mapping/default bảo toàn đồ/quyền/receipt cũ và kế hoạch rollback tương thích; không auto-grant theo trường thiếu, không xóa đồ đã nhận khi sửa ngân sách chưa phát hành. Definition đã retire vẫn đọc được lịch sử/sở hữu theo policy.

Sau kiểm kê, công cụ quản trị catalog nên bắt đầu **read-only**: tìm/lọc theo domain/lát/status, xem reference/dependency/source–sink/diff và lý do chưa release. Mutation live, grant GM, sửa cân bằng hoặc upload effects là phạm vi riêng cần authorization/audit/transaction; catalog editor không là đường bỏ qua gameplay.

Hoàn tất bước thiết kế khi mỗi nội dung trong lát đầu trả lời được **nó là gì, thuộc ai, đến từ đâu, dùng ở đâu, cần gì, đã làm tới đâu và release nào chứa nó**. Không cần tạo hàng trăm món hoặc xây mọi domain trước HN05.
