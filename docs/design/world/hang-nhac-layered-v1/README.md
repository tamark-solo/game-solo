# Hằng Nhạc — package layer runtime

Nguồn được chủ dự án chỉ định: `game-solo/docs/design/world/hang-nhac-layer-split-v1/multipart-review-v4/review.html`. Trang review hiện dùng **main-route-v6 / cột-đèn v7 / cây v9**. Đợt này chỉ đóng gói và ghép runtime trên `_MMO`, không sửa raster ART, vùng navigation, project nguồn hoặc nháp Editor.

- `project.json`: bản project chuẩn hóa, giữ layer/object/pivot/region; DataURI đổi thành URL `/assets/hang-nhac/layers/…`.
- `images/`: 32 ảnh part, WebP lossless giữ **tất cả pixel RGBA** khi so với dữ liệu ảnh trong project nguồn; nếu encoder không giữ invisible RGB thì giữ PNG nguyên byte.
- `overview.webp`: ảnh tổng quan dẫn xuất cho minimap/demo; **không** dùng thay các part trong game.
- `package.json`: hash project/review/navigation/ảnh, kích thước, provenance và phạm vi yêu cầu tích hợp của owner. Không suy duyệt gameplay/ART từ test.

**22 object / 32 part / 10 cover**: 6 ground tile, 7 công trình multipart, 6 cột/đèn và 3 cây multipart. Lan can và cây trắng đông nam giữ bake theo nguồn; không dựng lại phần chân bị che hoặc tách thêm vật. 9 region, Spawn (1616,992) và walk policy giống project owner đã lưu. Project/level ID clone chỉ thuộc scene; map/level ID gameplay giữ nguyên cho hồ sơ đang có.

Build bình thường chỉ cần Node/npm:

```powershell
npm.cmd run assets
npm.cmd run build
```

Builder kiểm package/project hash, audit, geometry và từng ảnh trước khi sinh `shared/data/hang-nhac.json` cùng manifest public. File runtime không nhúng base64. Build không đọc worktree `_art` hoặc đường dẫn `file:///`.

Khi chủ dự án **chủ ý yêu cầu nhập revision khác**, bước đóng gói một lần cần Python/Pillow:

```powershell
python scripts/package-hang-nhac-layers.py "<project-source.json>" --review "<review.html>"
npm.cmd run assets
```

Script hiện xác nhận shape 22 object/asset và navigation không đổi; revision khác số lượng phải được xem lại hợp đồng, không xóa assertion để tự nhận source mới. Không chạy script này để ghi lại ART đã sửa thủ công. Giữ nguồn/prompt/raw ở bộ ART review để truy vết.

Renderer dùng native canvas/pivot chung, các band nền/trang trí và y-sort cùng nhân vật. Alpha mask thật của mái/tán chỉ mờ khi che người phía sau. [Bàn giao và kiểm chứng](../../../HANG-NHAC-HUD-LAYERS.md).
