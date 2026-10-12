# Nhân vật và hành trang — thiết kế UI 02

**Bản tiếp nối hiện hành: [Linh Đài 03](CHARACTER-INVENTORY-UX-V3.md).** Sau HUD 04, owner yêu cầu hoàn thiện Nhân vật–Hành trang–Trang bị; trang review nay có trang bị theo vị trí, nguồn thuộc tính, mang/tháo/dùng/bảo vệ mẫu, pending/từ chối và luồng nguồn HN01 quay về món. Hồ sơ 02 dưới đây giữ reference và các quyết định nền.

**Tiếp nối HUD 03:** trang đối chiếu mặc định mở [HUD tổng thể với 24 icon](FULL-HUD-SYSTEM-DESIGN.md); các màn Linh Đài/Trữ Vật Nang/Diện Mạo dưới đây mở từ icon hoặc dropdown. 60 cấu hình dưới đây giữ hồ sơ UX 02; kiểm tổng thể 03 có bản ghi riêng.

**11/10/2026 · GDD 0.32.** Owner tạm chấp nhận hai bộ Tu Đạo/Đọa Ma và yêu cầu tìm thêm reference, thêm ý tưởng cho hành trang/hệ thống nhân vật. Đây là thiết kế UX có bản tương tác để đánh giá; phản hồi tạm chấp nhận không tự khóa ART, slot, sức chứa túi, balance hoặc hệ thống diện mạo.

**[Xem trực tiếp](http://127.0.0.1:5174/ui-material-review.html)** — chọn **Linh Đài / Trữ Vật Nang / Diện Mạo**, rồi đổi Tu Đạo/Đọa Ma. Bản mặc định mở Linh Đài. Sổ nhiệm vụ/HUD vẫn có trong dropdown; game hiện hành giữ riêng.

Đọc cùng [nhân vật](CHARACTER-SYSTEM.md), [tiến triển MMORPG](MMORPG-PROGRESSION-PLAN.md), [hai đạo lộ](DAO-UI-SYSTEM.md), [Core](ARCHITECTURE.md), [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) và [runtime hành trang thật](HANG-NHAC-CHARACTER-RUNTIME.md).

## Reference đã đối chiếu

Nguồn chính thức được truy cập ngày 11/10/2026. Trang mô tả tính năng và ảnh hướng dẫn là bằng chứng về thao tác; không coi số ô, phí, tài khoản dùng chung hoặc chỉ số của game tham khảo là luật Vân Hải. Không nhập ảnh/font/icon của các game này vào asset của dự án.

| Nguồn | Quan sát từ nguồn | Áp dụng vào Vân Hải |
| --- | --- | --- |
| [FFXIV — Comparing Gear Side-by-side](https://na.finalfantasyxiv.com/uiguide/equipment/equipment-compare/equipment_compare.html) · [ảnh hướng dẫn](https://lds-img.finalfantasyxiv.com/uiguide/na/7f/7b877337ff56c1ae1c56540d94d367a0e968d5.jpg) | Có lệnh so món được chọn với đồ đang mang, kể cả lúc xem cửa hàng | Hai vế **Đang mang / Đang xem** và vùng công dụng rõ ràng; nút so sánh dùng được bằng click/chạm, không bắt hover hoặc chuột phải |
| [FFXIV — Gear Placed in the Armoury Chest](https://eu.finalfantasyxiv.com/uiguide/equipment/equipment-chest/equipment_where_is.html) | Đồ mặc được tổ chức theo vùng riêng, có quy tắc đưa vào inventory | Tách cách xem trang bị khỏi vật tư/nguyên liệu; hiển thị **Đang mang** ngay trên món. Chưa chọn mô hình hai kho hay sao chép luật sức chứa |
| [Guild Wars 2 — Introducing the Wardrobe System](https://www.guildwars2.com/en-gb/news/introducing-the-wardrobe-system/) | Từ Hero Panel có thể xem trước skin, giữ stat, tìm/lọc bộ sưu tập rồi áp dụng | Linh Đài liên thông Diện Mạo, quyền diện mạo tách power; đặt nguồn nhận/điều kiện cạnh lựa chọn để có mục tiêu sưu tập |
| [Guild Wars 2 — Fashion Templates](https://help.guildwars2.com/hc/en-us/articles/48794217062931-Feature-Explanation-Fashion-Templates) | Tính năng 2026 phân biệt chọn xem trước, lưu, áp dụng và reset; có thể giữ phối diện mạo khi đổi đồ | Luôn phân biệt **Đang thử / Đang sử dụng**; thử không trừ tài nguyên. Có bỏ bản thử; việc lưu/phối bộ chỉ triển khai sau entitlement và policy cụ thể |

**Diễn giải thiết kế của dự án:** reference giúp cấu trúc thông tin và thao tác. Chất tu tiên đến từ linh đài, khí tức, công pháp, trạng thái luyện hóa, bước đi trên đạo lộ và nguồn gốc pháp khí — kết hợp nét đá/ngọc/huyền nham của [concept map đã duyệt](design/world/hang-nhac-van-ngoc-concept-v1/README.md).

## Ba màn liên thông

| Màn | Người chơi cần biết | Bố cục và thao tác |
| --- | --- | --- |
| **Linh Đài** | Tôi là ai, đang vận dụng gì, tiếp theo làm gì? | Khung nhân vật làm điểm nhìn; trang bị ở cạnh; bảng nền/HP/MP/tu vi/thuật và bước tiếp theo ở bên. Tổng quan → Tu luyện → Pháp bảo; nhấn ô đồ mở đúng chi tiết trong hành trang |
| **Trữ Vật Nang** | Món này dùng ở đâu, đang mang chưa, tìm món cần dùng thế nào? | Nhóm → tìm tên → lưới đồ → chi tiết. Tên/công dụng/nguồn và dấu bảo vệ rõ ràng; đồ mang trên người không giả thành bản sao trong túi. Mobile đi theo danh sách → chi tiết → quay lại, giữ lựa chọn và trả focus |
| **Diện Mạo** | Tôi muốn xuất hiện thế nào và kiếm nó ở đâu? | Pháp y / Khí tức / Ngự khí / Tọa kỵ / Danh vị. Vùng xem và vùng sưu tập riêng; chọn xem trước rồi mới áp dụng khi đã có quyền. Mobile có nhóm ở đầu, khung xem gọn và thao tác thử nằm ngoài vùng đọc |

Phím **C** mở nhân vật, **I** mở hành trang; **Esc** quay lại từ chi tiết mobile hoặc đóng. Không chiếm Ctrl/Alt/Meta và không phát phím skill khi đang nhập tìm kiếm. Nút tối thiểu 44 px; mobile HUD giữ ba nút 48 px. Hai theme giữ thứ tự, nhãn, focus, số liệu và state đọc.

## Ý tưởng phát triển theo quá trình tu đạo

- **Nhập môn:** chỉ đưa các nền thực sự dùng được lên trước: trang bị, vật tư, thổ nạp, bài học và bước tiếp. Không làm sáu menu lớn rỗng hoặc số chiến lực giả.
- **Pháp khí đầu tiên:** có hành trình **nhận phôi → nhận biết → luyện hóa → thử vận dụng**. Mỗi bước giải thích điều còn thiếu và nơi làm, thành quả vẫn thuộc cùng món. Bản mẫu dùng ý tưởng `hn-training-jade` từ tài liệu HN08; nút chỉ đối chiếu phôi/sau luyện hóa, chưa cấp món hay mở HN08.
- **Farm và build:** khi có định nghĩa/effect thật, so sánh phải chỉ ra công dụng và đánh đổi với cấu hình đang dùng. Có thể mở bảng nguồn thuộc tính: nền → công pháp → trang bị/pháp bảo → hiệu ứng. Không chỉ tô xanh món có một con số lớn hơn.
- **Luyện chế:** từ chi tiết nguyên liệu đi tới công thức sử dụng và nguồn kiếm. Theo catalog definition/reference; một nguồn–chi và ownership nhất quán. Các nút này chỉ bật sau khi activity/recipe thực sự có.
- **Hiện diện:** pháp y, khí tức, ngự khí và tọa kỵ giúp người khác nhận ra lựa chọn/thành tựu. Ngự khí/tọa kỵ còn cần luật di chuyển và khu vực, không suy là cosmetic thuần hay tự thay collider từ hình xem.
- **Đọa Ma:** đổi cùng bộ vật liệu sau trạng thái được gameplay xác nhận từ mốc Hóa Thần; không đổi power chỉ vì chọn skin. Màu HP/MP, độ hiếm và hoàn thành giữ nghĩa riêng. Không tự cam kết chi phí, vĩnh viễn hay điều kiện chuyển lại.

Tu vi, tầng và M01 là ba dữ kiện riêng. Màn Tu luyện hiện cho thấy chúng cạnh bài học; không vẽ phần trăm tới M02 khi chưa có ngưỡng/cổng được snapshot xác nhận.

## Phạm vi bản tương tác hiện có

**Fixture cách trình bày**, không phải hồ sơ người chơi đang đăng nhập:

- Tên mẫu **Vân Khách**; HN01/HN02 hoàn thành, HN03 chưa xong Lôi; tu vi 180, tầng 1, M01.
- Đọc ba định nghĩa thật từ `shared/character-inventory.ts`: mộc kiếm, áo vải, vật tư hồi 30 HP/10 giây. Hai món nhập môn không bonus; HP/MP tối đa giữ 100. Chọn, tìm không dấu, lọc và bảo vệ mẫu thực hiện trong memory riêng.
- So sánh hiện đọc đúng món đã mang, hiển thị cùng món và 100 → 100. Không bịa gear mạnh hơn/chỉ số xanh để làm đẹp màn.
- Nguyên liệu/vật nhiệm vụ chưa có trong fixture thì có empty state; không thêm đồ vào catalog hoặc giả sức chứa bằng các ô mở khóa.
- Ba bảng màu pháp y và hai bảng màu khí tức là **ý tưởng mỹ thuật**, chưa item ID/entitlement/nguồn nhận. Thử chỉ đổi bảng phối nền trong khung xem; không có hình áo, sprite hoặc tọa kỵ để giả là preview hoàn chỉnh.
- Ngự khí/tọa kỵ/danh vị có phần định hướng và trạng thái chưa có nội dung. Không tự cho quyền sở hữu, điều kiện, tỷ lệ rơi hoặc tiền tệ.
- Nhân vật đang được owner làm lại; chỉ giữ vùng **chờ hình nhân vật mới**. Không sửa portrait/atlas/anchor hoặc phóng sprite trong game để khớp study.

Không API gameplay, WebSocket gameplay, room, SQLite hoặc browser storage; Vite HMR là kết nối công cụ dev. Chưa thay cửa sổ/skin trong `/hang-nhac.html`; không sửa owner map, blocker hoặc bậc thang.

## Core/backend khi tích hợp sau

1. Definition/catalog chỉ nói món là gì; private character snapshot nói ai sở hữu instance/stack nào, đã trang bị/được bảo vệ/đủ điều kiện chưa. Presenter không suy ownership từ icon, vị trí ô hay nhóm thiết kế.
2. Equip/tháo/dùng/bảo vệ dùng command và kết quả server hiện có, giữ receipt/revision/lease. Pending/offline/từ chối/duplicate phải khôi phục từ snapshot, không tính stat hoặc tiêu vật qua animation.
3. Snapshot là nguồn số lượng/binding/condition/capacity nếu có. Không xây thêm kho vật tư cạnh `sect.supplies`; sức chứa, bán/vứt, rarity, luyện chế và cường hóa cần policy riêng trước code.
4. So sánh đọc effect/requirement đã được xác nhận; thiếu effect thì nói rõ dữ liệu chưa có, không tự tạo tổng bonus hoặc tính lại combat trong DOM.
5. Appearance entitlement, cấu hình đang sử dụng và bản đang thử là ba trạng thái khác nhau. Preview ở client; apply có kiểm quyền/điều kiện trên server. Source/cost/unlock version phải truy được khi debug. Không tự dùng quyền chia sẻ toàn account của GW2 cho Vân Hải.
6. Xem đạo hữu khác dùng projection public riêng: chỉ các thuộc tính/diện mạo/danh vị được phép công khai, không phát inventory private. Tọa kỵ/ngự khí cần resolver/renderer và movement contract trước tích hợp.
7. Dao theme qua resolver hữu hạn, giữ state/focus và fallback; UI không tải CSS/URL tùy ý do hồ sơ cung cấp. Theo [DAO-UI-SYSTEM](DAO-UI-SYSTEM.md), chưa field/schema Đọa Ma trong backend.

**Nguồn triển khai preview:** state/ID/ý tưởng ở `client/src/core/ui-material-review-state.ts`; markup presenter ở `client/src/ui/dao-character-review.ts`; CSS scope review cùng thư mục; `client/src/ui-material-review.ts` ghép interaction và `SkillHotbar`. Không feature import qua nhau, không thêm framework/service để có một màn thiết kế.

## Chất liệu và kiểm chứng

Reuse [8 ART Dao 01](design/ui/dao-dual-theme-v1/README.md) và ba icon nhập môn từ [pack vật phẩm 02](design/ui/character-van-ngoc-v2/README.md). Vòng/đường phác thảo là CSS geometry, không ART raster mới. Frame/backing vẫn cùng aperture/slice; HUD geometry và mobile fallback không đổi. Phản hồi tạm chấp nhận ghi riêng khỏi manifest production, không nâng `artApproved` từ test.

**60 cấu hình:** 2 theme × 6 view (Tổng quan/Tu luyện/Pháp bảo/Hành trang/Diện mạo/Nhiệm vụ) × 4 viewport (320×740, 390×844, 844×390, 1366×1000) = 48; thêm 12 kiểm vùng đọc 200% ở ba màn/four viewport. Không tràn ngang hoặc lỗi browser/asset. **55 kiểm tương tác** gồm chọn/quay lại/focus, tìm không dấu/empty state, so sánh/bảo vệ riêng, giữ state qua theme, thử/bỏ chất liệu, trạng thái pháp khí, bảy trạng thái HUD, reduced motion manual/OS và không gọi backend/storage.

[Bản ghi kỹ thuật](data/dao-character-ui-verification.json); screenshot/script kiểm ở `artifacts/dao-character-review/`. Typecheck/boundary và Vite build qua. Đây là kiểm layout/interaction; chưa usability test với người chơi, duyệt ART nhân vật hoặc nghiệm thu inventory tổng quát.

**Bước sản xuất tiếp:** đối chiếu nhân vật mới trong vùng xem → hoàn thiện ART nhân vật/ô trang bị/diện mạo theo brief native → ghép Tổng quan/Hành trang vào private snapshot hiện có → mở từng phần tu luyện/pháp bảo/collection theo gameplay đã có. Không cần hoàn tất toàn bộ MMO hoặc mọi loại tọa kỵ trước khi cải thiện hai màn chính.
