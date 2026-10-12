# Companion UI Vân Ngọc 01

**Lịch sử:** owner phản hồi tổng thể UI 01 thô sơ/chưa đúng chất tu tiên. Bộ cửa sổ hiện hành dùng [artwork 02](../van-ngoc-kit-v2/README.md). Nguồn crest này được giữ nguyên để đối chiếu; không coi phản hồi tổng thể là quyết định duyệt riêng crest.

Gói mỹ thuật mới cho view H5 theo yêu cầu 09/10/2026. Tham chiếu chất liệu: HUD Vân Ngọc 03 / Khí quang 02 đã duyệt. Crest này là nguồn mới, **chờ owner đánh giá hình**; việc ghép game theo yêu cầu không suy thành duyệt artwork mới.

- [PNG nguồn](lotus-crest-source-v1.png): 2172 × 724, true alpha, kết quả built-in ImageGen giữ nguyên.
- [WebP](lotus-crest-v1.webp): 1086 × 362, 74.836 byte, alpha.
- [Prompt](lotus-crest.prompt.txt), [metadata/hash](asset.json).
- [Ảnh HUD tham chiếu](../desktop-skill-hud-v3/qi-v2/qi-on-detail.jpg): chỉ là style reference; không phải ảnh sửa đích.
- [Bàn giao UI/UX runtime](../../../HANG-NHAC-VAN-NGOC-UI.md).

Hình là sen ngọc, đồng cổ và mây cuộn đối xứng. Không có chữ, số, nội dung game hoặc vùng bấm bake vào ảnh. Runtime dùng crest ở đầu màn chọn và dialog, giữ tỷ lệ; bảng/nút/nội dung do HTML/CSS trình bày. Khung HUD và icon hiện có giữ nguyên.

Xuất: `node scripts/build-van-ngoc-ui.mjs`. Chỉ downsample Lanczos3 đồng đều và WebP conversion; không vẽ lại, mask, blur hoặc scale từng phần. Nguồn và sản phẩm sống trong workspace; `sync-skill-hud.mjs` copy sản phẩm vào public khi assets/build.
