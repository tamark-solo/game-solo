# Catalog nội dung thống nhất — registry quản trị v1

**Triển khai 11/10/2026 · GDD 0.32.** Theo yêu cầu owner xây catalog thống nhất. Đã có schema/validator, reader qua port Core, API quản trị chỉ đọc và tab Catalog trong `/admin.html?view=catalog`. Dữ liệu hiện là **authoring index**: 56 record, 45 quan hệ, 12 tham chiếu có code local và 44 nội dung chưa phát hành (bổ sung 8 diện mạo giữ cho tùy biến ngày 12/10). Catalog không phải definition gameplay đã phát hành và không tự cấp đồ/quyền.

[Taxonomy](GAME-CONTENT-TAXONOMY.md) · [quy trình/Core](GAME-CONTENT-CONTROL-PLAN.md) · [nguồn JSON](design/systems/content-registry-v1/catalog.json) · [registry README](design/systems/content-registry-v1/README.md).

## 1. Sử dụng

1. Đăng nhập `/admin.html` bằng tài khoản có role `admin` từ bootstrap backend hiện có. Không có tài khoản/mật khẩu quản trị mặc định; không tự nâng quyền player.
2. Mở **Catalog nội dung**. Tìm tên/ID/chặng, dùng bộ lọc **nhóm → nhóm con → trạng thái triển khai** rồi Lọc nội dung. Tìm tiếng Việt có hoặc không dấu.
3. Chọn record để xem sở hữu/nơi lưu, chặng, nguồn chi tiết và trạng thái cân bằng/ART. Chọn ID liên quan để đi từ nguồn grant tới item/recipe/quest và ngược lại.
4. **Đọc lại** nạp lại nguồn, kiểm schema/reference/source pointer và cập nhật hash. Lỗi được báo, không trả một phần danh sách lỗi hoặc âm thầm dùng bản cũ.

Domain chưa kiểm kê như mount/cosmetic vẫn có trong bộ lọc với số 0; không tạo dòng hoặc asset giả để lấp. Màn Vận hành/tài khoản/server cũ vẫn giữ riêng cùng phiên quản trị.

## 2. Phạm vi kiểm được

- Shape/version và trường được hỗ trợ; `(domain,id)` duy nhất, subtype thuộc đúng domain, metadata/status có giới hạn.
- Typed reference tồn tại và đúng loại: grant/input/output/transform trỏ item; prerequisite trỏ quest/activity; nguồn grant trỏ source. Quan hệ trùng bị từ chối.
- Đường dẫn nguồn là relative workspace, không URI/absolute/`..`; adapter kiểm realpath vẫn ở trong workspace, có file/collection record/export symbol. Không thực thi selector hoặc script.
- `runtimeConsumable:false` bắt buộc; status không tự cấp owner/balance/ART approval. 36 warning hiện tại là nội dung `unreleased`, không lỗi schema.
- Catalog hoặc source lỗi thì snapshot có issues và **không có catalog records**. Sửa nguồn rồi Đọc lại phục hồi; không sửa DB/save để xử lý catalog.

Reader giới hạn catalog và file nguồn 2 MB, tối đa 10.000 record và 200 ref mỗi record; đây là giới hạn kỹ thuật đầu, không công suất MMO. Sources được dedup trong mỗi lần đọc. Chỉ nạp khi quản trị/CLI yêu cầu, không đọc filesystem trong tick gameplay.

Kiểm source pointer chỉ kiểm file/selector, không chứng minh balance/canon/asset approval hoặc mọi giá trị tên/tác dụng vẫn khớp code. Graph hỗ trợ tra cứu; chưa đánh giá prerequisite/cost/effect hay vòng kinh tế.

## 3. Ranh giới Core và API

| Phần | File / trách nhiệm |
| --- | --- |
| Shared | `shared/content/catalog.ts`: contract, domain/subtype labels, validation và lookup/graph thuần |
| Core port | `server/src/core/content-ports.ts`: `ContentCatalogReader.read()` |
| Application | `content-catalog-service.ts`: kiểm role trước đọc nguồn; không framework/filesystem/DB |
| Adapter | `persistence/content-catalog-file.ts`: đọc/parse/hash, kiểm pointer, trả diagnostics; không ghi dữ liệu |
| Composition / HTTP | `game-runtime.ts` ghép reader; routes nối session/account role và requestId/log hiện có |
| Client | Core state/DOM IDs tập trung, GameApi transport; feature admin trình bày/filter/inspect |

**GET `/api/game/admin/catalog`** trả `CatalogSnapshot`: metadata catalog đã validate nếu hợp lệ, issues, SHA-256, thời điểm kiểm và nguồn. Cần cookie session quản trị; anonymous 401/player 403. Không có endpoint create/update/delete/publish/GM grant. Response no-store, role được kiểm trước filesystem access; không có API chọn đường dẫn do browser gửi.

`GAME_CONTENT_CATALOG_PATH` là cấu hình operator cho nguồn JSON khác, dùng cho fixture hoặc triển khai. Mặc định reader lấy `docs/design/systems/content-registry-v1/catalog.json` tương đối repository, source pointers luôn tính từ repository root. Deploy phải đóng gói catalog và các nguồn tham chiếu nó dùng; thiếu nguồn sẽ báo lỗi rõ, không ảnh hưởng đăng nhập/gameplay vốn có.

Không public raw catalog cho player hoặc peer. Không có bảng SQLite mới/migration profile, không đổi IDs/receipt/max HP/MP/gear/supplies/map. Metadata classification được đọc bởi quản trị; gameplay tiếp tục dùng luật hiện có.

## 4. Kiểm và bằng chứng

```powershell
npm.cmd run check:content-catalog
npm.cmd run test:content-catalog
npm.cmd run typecheck
```

`check:content-catalog` dùng cùng filesystem adapter và validator, không mở DB. Trả hash/count/errors/warnings; lỗi có exit code khác 0. `test:content-catalog` có 7 unit case và browser/API fixture: quyền, read-only, search/filter/graph, dữ liệu lỗi/repair, text injection, logout/reload/tab cũ và màn nhỏ. Không seed tài khoản hoặc ghi catalog vào DB/file owner.

Bằng chứng runtime ở [verification](data/game-content-catalog-runtime-verification.json), chi tiết captures/log ở `artifacts/content-catalog/`. Hồi quy entry online/browser đã đạt; typecheck/boundaries, unit suite và Vite build đã qua. Kiểm kỹ thuật không tự duyệt ART.

## 5. Phần tiếp theo

Catalog quản trị đã dùng được để kiểm kê/tra cứu. Để trở thành nguồn gameplay, bước tiếp là **typed definition/evaluator cho subset HN05/material**, release manifest và source/cost/grant transaction/migration theo D01–D06. Chỉ publish subset đủ contract; không import toàn authoring JSON vào engine. CRUD/import/export/publish admin, compiler public/server và asset editor là các phần riêng khi có nhu cầu, không tự mở trong registry v1.
