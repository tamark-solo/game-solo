# Quản lý nội dung game — catalog, Core và dữ liệu người chơi

> **Phân loại tài liệu ·15/10/2026.** Giữ làm tài liệu kỹ thuật về phân lớp/authority và kiểm soát dữ liệu. Các ví dụ GDD 0.32, HN/EX/VP và số 13 item/sáu recipe thuộc snapshot cũ, không là thiết kế nội dung hiện hành. Điều kiện và nguồn–chi áp dụng xem [hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md) và [kế hoạch asset toàn game](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md); việc dọn docs chưa đổi schema/registry/runtime.

**Snapshot bản thiết kế 0.1 · 11/10/2026 · trước GDD 0.35.** Owner hỏi cách phân loại nguyên liệu/pháp bảo/tọa kỵ/nhiệm vụ và các hệ liên quan để dễ kiểm soát backend/gameplay. Đã có taxonomy, sổ catalog tham chiếu và [registry quản trị v1](GAME-CONTENT-CATALOG-RUNTIME.md) với schema/validator/API/tra cứu. Content compiler/editor ghi và definition gameplay mới là phần tiếp theo; danh mục hiện hành xem [item–material catalog GDD 0.35](design/systems/item-material-catalog-gdd035-v1/README.md).

Đọc [phân loại và từ điển](GAME-CONTENT-TAXONOMY.md), [catalog khởi đầu](design/systems/content-registry-v1/catalog.json), [kế hoạch MMORPG](MMORPG-PROGRESSION-PLAN.md), [Core/backend](MMORPG-SYSTEM-CONTRACTS.md) và [kiến trúc](ARCHITECTURE.md). Sổ catalog giúp tìm/kiểm quan hệ nội dung; các hồ sơ/code được nó trỏ tới vẫn sở hữu luật và số liệu.

## 1. Ba lớp dữ liệu cần phân biệt

| Lớp | Ví dụ | Nơi có trách nhiệm |
| --- | --- | --- |
| **Định nghĩa nội dung** | Ngọc hộ thân là gì; recipe dùng gì; nhiệm vụ yêu cầu gì; tọa kỵ dùng ở vùng nào | Authoring catalog → definition/validator theo domain → release đã kiểm |
| **Dữ liệu sở hữu/tiến trình** | Hồ sơ A có ngọc instance X đã refined; có quyền recipe; HN05 đã nhận thưởng | Persistence của nhân vật/account theo policy; transaction/CAS/receipt |
| **Trạng thái hoạt động** | Ngọc đang chặn hit; đang cưỡi; lượt E01 có HP/timer; quái đang trong đời spawn nào | Simulation/room theo authority, kết quả/checkpoint bền theo contract |

Định nghĩa `hn-training-jade` không phải instance của một người. Có quyền mount khác đang cưỡi; hoàn thành quest khác đang có đủ nguyên liệu để craft; proof khác item. Những phân biệt này giữ hệ dễ debug khi một món có nhiều vai trò.

## 2. Sổ danh mục tổng cần quản lý những gì?

Mỗi hàng có **domain + ID ổn định + tên + phân loại/vai trò + ownership/storage + nguồn chi tiết + quan hệ + chặng/gate + trạng thái triển khai**. Thêm các quyết định/balance/ART riêng theo tài liệu nguồn. Không tạo bảng EXP/stat thứ hai hoặc tự gán số để điền kín ô.

| View để owner kiểm | Câu hỏi được trả lời |
| --- | --- |
| Theo domain/nhóm/chặng | Có bao nhiêu nguyên liệu/pháp khí/tool/quest, thứ gì cần cho lát kế tiếp? |
| Theo implementation | Món có code thật, mới có đề xuất hay chưa thiết kế? HN05 có text nhưng gameplay chưa chạy |
| Theo source–use | Đồ kiếm từ đâu, dùng ở recipe/effect nào; có món được phát nhưng chưa có chỗ dùng? |
| Theo prerequisite | Muốn tới HN08/recipe phải có quyền nào; có vòng khóa giữa quest và món chính quest đó cấp? |
| Theo asset/approval | Có brief/asset/animation/icon chưa; technical pass và duyệt hình là hai trạng thái riêng |
| Theo release/diff | Lát này thêm/sửa ID nào, tác dụng/nguồn nào đổi, save cũ cần mapping gì? |

Thứ bậc phẩm, loại vật liệu, chất lượng, trạng thái raw/refined, binding và yêu cầu cảnh giới là **các trục riêng**. Một nguyên liệu ngọc có thể làm pháp khí hoặc công cụ; không suy rarity từ tên và không suy hiệu lực từ màu icon.

## 3. Nền đã có và sổ khởi đầu

- Runtime có `wood-sword`, `plain-robe`, `recovery`; inventory v1 bắt đúng hai gear, `recovery` đọc duy nhất `sect.supplies`. ID instance/gear protection/equipment đã lưu phải giữ.
- R01 dùng `sword`, `thunder`, `wind`; HN01–HN04 có luật/credit thật, `sect-quests.ts` chỉ dựng view. HN05 đang `unreleased`.
- [Manifest item hiện có](design/systems/items-v1/plan.json) là **kế hoạch**: 13 item (3 tham chiếu runtime + 10 đề xuất), 5 source, 6 recipe, EX01–EX04. Raw/refined cùng một ngọc; seal là trạng thái chuyến, không một hộp mới.
- Mount/appearance cần contract riêng; chưa có loader hoặc dữ liệu sở hữu. Mẫu taxonomy cho các domain này không tự sinh đồ, quyền hoặc ART.

[Catalog khởi đầu](design/systems/content-registry-v1/catalog.json) là **design index**, ghi nhóm và đường dẫn nguồn; liên kết item/source/recipe/quest/activity để xem phụ thuộc. Reader quản trị đọc sổ qua port và kiểm dữ liệu, nhưng không import vào engine gameplay/build, không thực thi điều kiện, không sao chép quantities/cooldown/drop rate. Tên nhóm và các ID record chưa runtime đều có nhãn proposed. Sổ không cấp duyệt mỹ thuật/cân bằng.

## 4. Từ authoring tới dữ liệu runtime

```text
Owner/content: hàng catalog + hồ sơ luật/nguồn–chi + brief
  → Validator: schema, ID, typed refs, policy và phạm vi release
  → Review nội dung/balance/ART theo phần thực sự dùng
  → Biên dịch definition của lát được chọn
       ├─ server-only: loot/source/eligibility, bí mật và luật thưởng
       └─ client public: mô tả/icon/điều kiện được biết/action đã mở
  → Application/evaluator dùng definition đã phát hành
  → Persistence ghi ownership/progress/receipt theo kết quả server
  → Private owner snapshot / public peer projection
```

Không gửi nguyên catalog server cho client rồi ẩn tab. Một bảng public tương lai dùng whitelist fields; loot weights, dữ kiện truyện chưa biết và policy chống abuse ở server. Snapshot inventory/quest riêng cho owner, peer chỉ nhận diện mạo/combat/profile fields được phép xem. `PublicProfile` hiện bỏ `accountId` không có nghĩa mọi trường còn lại đều an toàn để broadcast cho peer.

Khi triển khai, layout thư mục có thể là `shared/content/` cho contract/validation thuần; definition theo domain; server application gọi action/evaluator có tên; persistence giữ transaction; room/HTTP là adapter. Authoring và loader có module/port riêng theo nhu cầu lát. Đây là đề xuất vị trí, chưa tạo code; bổ sung module vào boundary checker khi thật sự có.

**Không làm một engine vạn năng:** item/recipe/quest/mount có schema riêng và dùng các phần chung nhỏ (ID, reference, provenance, version). Effect/quest behavior nối với handler đã code/kiểm; không `eval` công thức/script từ JSON. Một ID điều kiện chưa có evaluator không được coi là gameplay đã hỗ trợ.

## 5. Hợp đồng backend theo domain

| Domain | Định nghĩa | Dữ liệu bền | Trạng thái hoạt động |
| --- | --- | --- | --- |
| Item/gear/pháp khí | Kind, storage/slot, điều kiện/effect, nguồn hình | Stack hoặc instance, owner, binding/protection/equip, raw/refined | Effect có hạn, CD/activation theo contract |
| Recipe/source | Input/keep/transform/output, service, quyền và cycle | Recipe unlock, source/business receipt, cost/grant provenance | Craft/claim pending; output commit cùng input |
| Quest | Prerequisite/objective/reward/retry và evaluator | Credit/proof/choice/completion/reward receipt | Attempt/target/timer; event đúng owner/attempt |
| Encounter/farm/PvP | Actor/AI/ruleset/eligibility/drop-source refs | Kết quả/checkpoint/match record/loot cần bền | HP/threat/projectile/spawnLife/participants/server clock |
| Mount/appearance | Vai trò/zone/effect/asset; skin khác locomotion | Ownership/unlock và appearance được chọn | Cưỡi/triệu hồi/dismount/interruption |
| Công pháp/thuật/mốc | Quyền tiếp cận, khả năng/nguồn stat | Quyền đã học/mốc xác nhận/loadout | Cast/MP/CD/effect; source stat theo mode |

Bảng SQL cụ thể cần thiết kế theo lát/migration. Có thể dùng bảng stack, instance, entitlement, quest progress và source receipt riêng; không nhét mọi domain vào một bảng inventory/JSON rồi để mỗi UI tự sửa. Lát đầu có thể tiếp tục profile blob + CAS nếu contract bảo đảm; không bắt chuyển DB để có catalog.

Mọi mutation lấy owner/realm/character từ phiên, không từ field do client tự khai. Kiểm quyền → lập plan → atomic commit cost/grant/progress/business receipt → trả snapshot. Fingerprint request khác business key: request mới vẫn không nhận lại cùng source. Farm key có đời/cycle; quest reward lần đầu giữ khóa cũ. Mount/skin đổi hình không tự cấp stat hoặc thay hitbox.

## 6. Version và khả năng phục hồi

| Version/khóa | Mục đích |
| --- | --- |
| Document/catalog schema | Định dạng authoring, không là save schema |
| Definition version/content release | Ngữ nghĩa nội dung được phát hành và dependency snapshot |
| Profile schema/inventory version/DB migration | Cách lưu/đọc dữ liệu người chơi, upgrade tương thích |
| Request fingerprint | Từ chối dùng lại request với payload khác |
| Business source key | Một quyền nhận/thưởng theo nguồn/đời/cycle/recipient |
| Map/asset release | Nguồn navigation/render/bitmap riêng; catalog không sửa map |

Giữ ID cũ dù đổi tên game/đồ. ID mới theo convention của domain, nhưng ID hiện có không bị đổi prefix hàng loạt. Đổi text/icon không nhận lại reward. Thay gameplay đã phát hành cần content mapping, migration/rollback và diff ảnh hưởng; không reset save để vừa definition mới. Nếu chuyển `sect.supplies` sang stack, chuyển đúng một lần và chỉ còn một writer.

## 7. Validator và quản trị cần làm theo thứ tự

1. **Sổ authoring:** taxonomy và ID registry trước; bản hiện tại trỏ về nguồn code/docs, không làm loader giả.
2. **Typed definition cho lát HN05:** material/source/quest/recipe phần thực sự cần, validate thuần và mapping giữ legacy. Không đợi có mọi cảnh giới/mount/class.
3. **Cross-reference/release check:** unique `(domain,id)`, đúng loại ref, source/quest/item/recipe/asset/handler tồn tại và được phép trong release; số lượng hợp lệ khi đã có số liệu. Báo unresolved/draft rõ.
4. **Dependency/source–sink report:** đồ mồ côi, nguyên liệu không có chỗ dùng, điều kiện tự khóa, source lặp/recipe cycle có nguy cơ tạo lời vô hạn. Vòng lặp có chủ đích cần review economics, không kết luận mọi cycle đều lỗi hoặc static check đã chứng minh balance.
5. **Registry quản trị chỉ đọc:** tìm/lọc/inspect nơi dùng/diff/version/độ sẵn sàng; tách quyền biên tập khỏi tài khoản player. Chưa cần editor live để HN05 chạy.
6. **Biên tập/release có kiểm:** khi cần mới mở CRUD/import/export, validator preview và phát hành version; edit draft không tự đổi ruleset của room đang chạy. Chọn snapshot/migration policy cho phiên active trước publish.

Mỗi slice có thể nghiệm thu nhỏ: catalog đúng → definition/evaluator đúng → source/cost commit một lần → view cùng hồ sơ → lifecycle đúng. Test catalog/graph không thay test gameplay hoặc duyệt hình.

## 8. Việc gần nhất và trách nhiệm

| Đầu việc | Người/phần sở hữu | Kết quả hữu hạn |
| --- | --- | --- |
| Chốt taxonomy, bảng nguồn–use và ID | Owner/content + kỹ thuật | Sổ các định nghĩa đã biết, không tự thêm hàng trăm đồ |
| Chọn dòng HN05/material và điều kiện M02 | Nội dung/gameplay | Một thẻ nhiệm vụ, source grant, nơi dùng và lifecycle theo D01–D06 |
| Typed contract/validator/migration cần cho dòng đó | Shared/application/persistence | Adapter/save cũ giữ nguyên, không dual stock/dupe grant |
| Nối C/I/J/NPC | UI/transport | Hiển thị qty/proof/state thật, reason/pending/error theo snapshot |
| Mở farm/duel/appearance sau gate | Domain tương ứng trong RM5-A/B/C | Mở catalog từng phần, ownership/credit/ruleset/public projection rõ |

Khi debug phải trả lời được: **định nghĩa/version nào → ai có quyền → hoạt động/nguồn nào → vì sao nhận/tiêu → receipt nào → state sau commit nào**. Mỗi gói lưu link từ record tới hồ sơ luật, code, nguồn asset và bằng chứng kiểm. Log có ID/reason/revision, không credentials hay toàn inventory.

**Đã làm:** sổ tham chiếu, taxonomy/control và registry quản trị v1 (schema/validator/reader/API/filter/inspect). **Chưa làm:** compiler/loader definition gameplay, generic inventory/quest engine, editor ghi/publish hoặc gameplay/ART mới. Đây là nền tổ chức công việc cho các lát GDD 0.32, không thêm một roadmap cạnh tranh.
