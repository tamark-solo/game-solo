# Danh mục vật phẩm và nguyên liệu GDD 0.35

**Đợt A · kiểm kê toàn game · 15/10/2026**

Đây là bộ danh mục làm việc cho toàn bộ GDD 0.35: năm cảnh giới, sáu luồng phát triển, bốn pháp bảo qua ba mốc, sáu ô trang bị, Tứ Nghệ, Nội Giới, nhân duyên và các loại tiền tệ. Danh mục dùng để quyết định nguồn kiếm, nơi tiêu, recipe cần đặc tả và asset có thể tái dùng trước khi mở production.

## Phạm vi và quyền quyết định

GDD 0.35 và [hợp đồng thống nhất](../../../GDD-035-UNIFIED-CONTRACT.md) sở hữu điều kiện tiến trình, kế thừa và binding. [Kế hoạch asset tổng thể](../../../ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md) sở hữu thứ tự kiểm kê A–E. Bộ tài liệu này chỉ lập catalog và đối chiếu; nó không phát hành item ID runtime, không mở loot, không đổi DB/save/map owner và không tự duyệt ART, balance hoặc runtime.

Tên có trong GDD được tách thành bốn trạng thái: item đã mô tả đủ để lập record, họ item còn cần phân rã, state/fact không phải vật phẩm trong túi, và ứng viên từ kế hoạch lịch sử chưa có đích tiêu. Số lượng, drop rate, giá, tỷ lệ phẩm chất và công thức chưa được GDD quy định giữ `null` hoặc `unresolved`; không điền số để làm đẹp catalog.

## Bàn giao đợt A

| Tệp | Nội dung | Trạng thái |
| --- | --- | --- |
| [items.json](items.json) | Record chuẩn của item, họ item, artifact family, currency, state và fact; mốc kiếm đầu tiên, realm phục vụ, nguồn, nơi tiêu, binding và khoảng trống. | Đầu ra kiểm kê chính. |
| [asset-inventory.json](asset-inventory.json) | Package/asset đã có trong repo, hash/path, provenance, trạng thái reuse và phần cần bổ sung. | Đầu ra kiểm kê ART/kỹ thuật. |
| [recipes-and-sources.json](recipes-and-sources.json) | Nguồn kiếm và recipe explicit/structural-only, khóa nguồn, thời điểm mở và mối quan hệ source → use. | Đầu ra nguồn/công thức chính. |
| [item-coverage-notes.md](item-coverage-notes.md) | Đọc tổng hợp theo cảnh giới và nhóm, alias, khoảng trống nội dung. | Ghi chú biên tập. |
| [asset-audit-notes.md](asset-audit-notes.md) | Phạm vi kiểm metadata/hash, reuse và missing asset. | Ghi chú audit. |
| [recipes-source-notes.md](recipes-source-notes.md) | Các quan hệ nguồn–chi, công thức và điều kiện chưa đủ dữ kiện. | Ghi chú biên tập. |

## Quy ước

- `explicit`: GDD hoặc hợp đồng ghi trực tiếp tên, điều kiện hoặc quan hệ.
- `inferred`: có thể nối từ bảng GDD nhưng cần xác nhận khi làm recipe/catalog release.
- `structural-only`: biết hình dạng hệ thống (ví dụ bốn nghề, sáu ô, tổng bậc 0–30) nhưng chưa có công thức số.
- `unresolved`: chưa đủ bằng chứng để tạo item/recipe hoặc chưa có đích tiêu.
- `reuse`: asset hiện có được dùng lại trong đúng phạm vi provenance và approval của nó.
- `missing`: cần thêm source/pose/FX/icon/prop/metadata hoặc cần review; không đồng nghĩa được phép sản xuất ngay.

Các record kế thừa từ `items-v1` và gói Vân Ngọc giữ liên kết nguồn cũ để test/registry đọc được. Snapshot HN/EX/VP không được nâng thành recipe VG hoặc danh mục release chỉ bằng việc xuất hiện trong catalog này.

## Kiểm tra

Sau khi các tệp JSON được tạo hoặc chỉnh, chạy:

```powershell
node scripts/verify-item-material-catalog-gdd035.mjs
node scripts/verify-gdd-035-docs.mjs
```

Hai lệnh chỉ kiểm tính nhất quán tài liệu, schema, ID, đường dẫn và liên kết. Chúng không xác nhận balance, chất lượng ART hay runtime integration.
