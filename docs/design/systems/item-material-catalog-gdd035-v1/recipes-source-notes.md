# Đợt A · danh mục nguồn và công thức GDD 0.35

Ngày lập: **15/10/2026** · Trạng thái: **kiểm kê thiết kế, chưa phát hành runtime**.

File dữ liệu đi kèm là [`recipes-and-sources.json`](recipes-and-sources.json). Đây là sổ đối chiếu để các lượt sau lập master catalog vật phẩm và brief asset. Nó không phải drop table, không khóa balance, không cấp quyền loot/craft và không thay đổi DB, map, save hoặc asset source đã pin.

## Phạm vi đã kiểm kê

- **25 nguồn**: cơ duyên VG01; hái dược; 8 quái/tinh anh chính; 4 Boss Chặng 1; Tư Đồ Nam/Lục Văn; ủy thác/Vấn Đạo; Lý Mộ Uyển; Nội Giới; Hàn Thiết Kiếm Mộ; Đan Thất; Ngũ Hành; Hắc Ấn VG10; Độ Kiếp VG11; Tứ Nghệ; tiền tệ/quỹ tuần; khung nội dung Kết Đan–Hóa Thần.
- **17 mẫu công thức**: hai công thức Hồn Phiên, ba nâng Mốc II còn lại, tế luyện Mốc I/II, hợp thành 5:1, Đan, Phù, Trận, Tàn Quyển, sáu ô trang bị, Nội Giới, Cổ Ấn/giải niêm và Độ Kiếp.
- **23 dòng source–use**: mỗi dòng nối nguồn với đích tiêu hoặc công thức. Các nguồn story được tách khỏi nguồn farm lặp; fact thắng Boss không tự thành item hoặc tự nhảy cảnh giới.

## Quy ước đọc dữ liệu

`certainty: explicit` chỉ dùng khi GDD/hợp đồng nêu trực tiếp tên, cổng, nguồn hoặc lượng. `structural-only` dùng cho khung hệ thống đã bắt buộc nhưng chưa có lượng, tỷ lệ, alias hoặc recipe đầy đủ. `unknown` giữ lại vùng chưa quyết định để không biến suy đoán thành backlog sản xuất.

`quantity: null` là cố ý. Những nơi chỉ nêu “đủ Ngũ Hành”, “giải khóa 4–6”, “đủ Cổ Ấn” hoặc “luyện theo recipe” chưa được điền số lượng. Hai lượng đã khóa trong hợp đồng là **100 Du Hồn + 5 Yêu Hồn Lang Tuần Sơn cho Phiên I** và **1.000 Tinh Hồn Trúc Cơ + 2 Chủ Hồn cho Phiên II**. Mẫu hợp thành được ghi là **5:1** nhưng vẫn `structural-only` vì whitelist, alias và điều kiện nghề chưa có dữ liệu release.

Binding tuân theo hợp đồng: nhiệm vụ/ngày/tuần/thưởng bảo đảm là `bound`; loot thực địa/gather/dungeon có thể `unbound`; công thức kế thừa khóa nếu có ít nhất một input khóa. Chưa có bảng source cụ thể thì để `unknown` hoặc nêu trong `missing`.

## Nguồn dùng lại và phần cần bổ sung

Có thể dùng lại body/FX/gear hiện hành của quái, tinh anh, Boss, NPC và bốn họ pháp bảo theo các đường `reuseAssetPackage` trong JSON. Việc dùng lại chỉ nói về provenance/candidate; không suy ra ART, motion, VFX, balance hoặc runtime approval mới. Vân Ngọc v1 và `items-v1/plan.json` chỉ là snapshot HN/EX để đối chiếu hình và lineage.

Các phần phải bổ sung trước khi chuyển sang production gồm: alias và item ID; source/activity/receipt; drop quantity/rate/cycle; chi phí tế luyện; công thức và quality roll Đan–Phù–Trận; chín khóa Xa; Ngũ Hành theo từng nguồn; ownership chủ hồn; nguồn Tàn Quyển; sáu món trang bị theo từng bộ; asset icon/prop chưa có provenance; và toàn bộ phân rã Kết Đan–Hóa Thần.

`Mặc Dực`, `Bào Tử Giữ Khí`, `Tĩnh Niệm Tro` được ghi trong `gaps` và source inventory dưới trạng thái pending. GDD 0.35 chưa nêu sink, vì vậy không coi chúng là loot bắt buộc và không tạo asset mới cho chúng trong Đợt A.

## Ranh giới với kế hoạch cũ

`docs/design/systems/items-v1/plan.json` cùng sáu recipe HN/EX vẫn giữ nguyên byte vì các manifest/fixture cũ tham chiếu theo hash. Chúng không được trộn vào `VG01–VG11`. Tên và lượng của chúng chỉ xuất hiện trong `legacyExcluded`; muốn dùng lại hình phải map alias, source–sink, binding và approval vào catalog mới trước.

## Việc cần làm tiếp theo

1. Duyệt alias/item ID và tách record **item**, **state/fact**, **currency**.
2. Tạo bảng source/activity/eligibility/receipt cho VG01–VG06 trước, sau đó kiểm cổng VG07–VG11.
3. Chốt quantity cho Đan, tế luyện, Cổ Ấn/giải niêm, Ngũ Hành và Tàn Quyển bằng fixture riêng.
4. Sau khi có sink thật, đối chiếu asset icon/prop hiện hành rồi chỉ bổ sung hình thiếu.

Không chạy map builder, không ghi runtime/DB và không sản xuất ảnh trong Đợt A.
