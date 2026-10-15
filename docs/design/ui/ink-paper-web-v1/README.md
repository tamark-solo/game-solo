# Mực & Chu Sa — Bộ review web 01

Ngày 15/10/2026. Theo yêu cầu owner, chuyển từ Figma sang trang web cục bộ để duyệt mỹ thuật và tương tác trước khi tích hợp game.

**[Mở bộ review](http://127.0.0.1:5188/ui/ink-paper-web-v1/)**

## Cách mở lại

Từ root `game-solo`:

```powershell
python -m http.server 5188 --bind 127.0.0.1 --directory docs/design
```

Trang tĩnh, không cần game server hoặc database. Font được lưu cục bộ, kèm giấy phép OFL. Không chạy `npm run assets` hoặc builder map.

## Nội dung

- HUD khám phá Hằng Nhạc, NPC Bạch Chỉ, HP/MP, hotbar và tracker.
- HUD boss Hắc Ấn với cảnh báo/khe né minh họa, thu gọn nhiệm vụ.
- Linh Đài: chọn bốn pháp bảo, đổi artwork, body tương ứng và ST/AOE; thử trên HUD.
- Hành trang: lọc/tìm, trạng thái rỗng, chọn vật phẩm, so sánh, trang bị và sử dụng mẫu.
- Chuẩn bị Trúc Cơ: điều kiện thiếu/đủ, ghim nguồn và phản hồi kết quả.
- Mệnh Kiếp Chí VG01–VG11: đọc hồi, chọn và theo dõi trên tracker.
- Đổi Huyễn Tâm/Tịch Bạch, ánh sáng ngày/đêm, ẩn HUD, phím C/I/J/E/Esc và focus vòng trong menu.
- Bố cục desktop và màn hẹp. Đây không phải cam kết controller/mobile gameplay.

## Mỹ thuật và nguồn

Hai bitmap mới được tạo bằng **ImageGen built-in**: `assets/dao-paper.png` và `assets/skill-atlas.png` (8 bố cục ST/AOE × 4 họ). Prompt cuối lưu tại [assets/prompts.json](assets/prompts.json). Atlas hiển thị bằng CSS; không chỉnh raster hoặc ghi lên gói ART cũ.

Nền sân đọc nguyên từ `world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp`. Huyễn Tâm/Tịch Bạch và pháp bảo đọc production V1; UI chi tiết dùng viewport SVG theo `sourceCoreBounds`, sân dùng native/body/gear rear/front và skin projection theo registration. Native root gear (80,160) so body (32,88) tạo offset (-48,-72); vùng tay dùng `handOcclusion.rect`. Đây là pose neutral tĩnh, không motion/runtime integration. Nguồn actor/pháp bảo giữ nguyên byte.

NPC Bạch Chỉ đọc neutral Wave A, boss đọc Hắc Ấn03. Các icon vật phẩm nội dung đọc từ `character-van-ngoc-v2`, không tái dùng skin Thanh Ngọc. Navigation glyph đọc từ SVG code-native hiện có. Nguồn và hash tại `sources.json`. File prepare chỉ cập nhật metadata/glyph trong root review mới.

Nền UI mới là mực than, giấy dó và chu sa; Be Vietnam Pro cho nội dung, Noto Serif cho tiêu đề. Bản này là candidate để owner duyệt, chưa mở ART approval hoặc gameplay.

## Xác minh

**Chỉnh icon pháp bảo 15/10:** icon Thiên Nghịch Châu riêng cho menu tại `assets/thien-nghich-chau-ui-v2.png`, ImageGen built-in refine từ nguồn Châu A; [prompt](assets/thien-nghich-chau-ui-v2.prompt.txt). Icon này dùng chung giữa hai nhân vật trên menu, không thay nguồn gear/pose ở sân. Bốn icon được căn tâm theo bounds thực vào viewport vuông, cạnh dài nhất chiếm 80%; không kéo méo hình. Khung danh sách 56×56 desktop/48×48 màn hẹp; khung chi tiết 96×96/80×80. `assets/artifact-ui-overrides.json` giữ canvas/bounds alpha của icon mới; `artifact-ui-icons.js` do prepare sinh. 16 tổ hợp bốn pháp bảo × hai avatar × desktop/mobile đã kiểm, không lỗi tải hay lỗi JS; evidence riêng ở `review/artifact-icons-v2-verification.json` và ảnh cùng tên.

Chạy khi preview đang mở:

```powershell
node docs/design/ui/ink-paper-web-v1/verify.mjs
```

Đã qua 80 kiểm browser, 15 ảnh evidence, không lỗi JS/HTTP; kiểm 1440×960, 1366×768, 1920×1080 và 390×844, cùng các luồng chọn pháp bảo/trang bị/lọc rỗng/cooldown/đột phá/theo dõi hồi/đổi identity/focus. Kết quả ở `review/verification.json`. Đã xem ảnh và chỉnh tương phản, chữ, vùng đọc trên texture và cách đặt ảnh pháp bảo.

Số liệu, phím mẫu, điều kiện đột phá, minimap và telegraph đều là fixture review. Không gửi command, reward hoặc save. Kết quả kỹ thuật không thay việc owner đánh giá hình. Chưa tích hợp runtime/client game, map/navigation/DB giữ phạm vi riêng.
