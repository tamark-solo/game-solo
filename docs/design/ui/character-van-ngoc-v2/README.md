# Vân Ngọc nhân vật 02 — Linh Đài và vật phẩm

**Ngày:** 10/10/2026 · **Tool:** built-in ImageGen, skill `imagegen` · **Trạng thái:** ghép prototype, chờ xem hình; `artApproved=false`, `ownerApproved=false`.

**Phản hồi tiếp nối 10/10:** owner xem bản 02 và xác nhận “nhìn ổn rồi đó”. Phần nhìn prototype được chấp nhận; xem [visual-review.json](visual-review.json). Các cờ manifest/verification phía trên giữ trạng thái lúc sản xuất và kiểm kỹ thuật, không viết ngược lịch sử hoặc suy duyệt luật vật phẩm từ phản hồi hình.

Owner thấy UI 01 dùng được nhưng thiếu cảm giác tu tiên. [Hướng nghiên cứu](../../../CHARACTER-UI-CULTIVATION-DIRECTION.md) bổ sung linh đài, khí vận, đạo lộ và vật phẩm có chất liệu, cùng HUD Vân Ngọc hiện hành.

## Nguồn / prompt cuối đã dùng

| Asset | Source giữ nguyên | Prompt | Vai trò |
| --- | --- | --- | --- |
| Linh đài | [shrine-source-v2.png](shrine-source-v2.png), 1024 × 1536 RGBA | [shrine.prompt.txt](shrine.prompt.txt) | Vignette alpha sen/ngọc/đồng/mây, giữa rỗng cho sprite; không nhân vật/portrait/chữ |
| 12 món đồ | [items-source-v2.png](items-source-v2.png), 1536 × 1024 RGBA | [items.prompt.txt](items.prompt.txt) | Bốn cột × ba hàng, từng món alpha; không chữ/khung UI |

Input chỉ tham khảo style: [khung HUD 03](../desktop-skill-hud-v3/cultivation-frame-v3.webp), [icon skill 02](../desktop-skill-hud-v2/skill-icons-v2.webp). Không sửa hai nguồn. Hash input/output, alpha, crop và mức duyệt ở [assets.json](assets.json).

## Sản phẩm / xuất asset

- `shrine-v2.webp`: 600 × 900, 296244 bytes.
- 12 icon WebP 128 × 128, tổng 96152 bytes. Thứ tự: mộc kiếm / kiếm ngọc / áo vải / pháp y / ngọc bội / đan bình / linh dịch / thảo dược / huyền thiết / cổ thư / tín vật / pháp châu.
- `item-atlas-v2.webp`: 528 × 396, 91040 bytes, padding 2 px; giữ làm sản phẩm atlas. Prototype đọc icon riêng.
- [contact-sheet.png](contact-sheet.png): đối chiếu cả bộ alpha. PNG source giữ nguyên.

`scripts/build-character-ui-art.mjs` chỉ trích/downsample đồng tỷ lệ/đóng gói, giữ alpha ImageGen. Bốn cột bằng nhau; ranh hàng đo 0/365/678/1024 tránh cắt mép áo hoặc đưa mảnh vào hàng dưới. Không mask/repaint/recolor/xóa nền bằng code. Metadata ghi crop từng món.

`scripts/sync-character-ui-art.mjs` kiểm hash sản phẩm workspace rồi copy `/assets/character-ui-v2/` khi assets/build. Build thường không gọi ImageGen, không cần Sharp hoặc source ngoài workspace. Sharp bundled runtime chỉ dùng khi đóng gói lại.

## Dùng và giới hạn

Đã ghép [prototype](http://127.0.0.1:5173/character-ui.html), tiếp nối sang [runtime nhân vật/hành trang](../../../HANG-NHAC-CHARACTER-RUNTIME.md) ngày 10/10 theo yêu cầu owner. Runtime dùng shrine, mộc kiếm, áo vải và bình hồi phục với số liệu server; các icon còn lại vẫn phục vụ thiết kế. Linh đài nằm sau sprite, không thay frame/anchor. Pháp châu là mẫu, không là Thiên Nghịch Châu hoặc quyền sở hữu chung. Bonus/12 món mẫu không áp dụng trong game.

“Xem vận khí” dùng clip riêng từng nhân vật hiện hành; không sinh body từ linh đài. Khí/motion UI tách khỏi gameplay và giữ tĩnh khi reduced motion. Không suy duyệt ART từ test hoặc phản hồi “nhìn ổn” dành cho UI 01.
