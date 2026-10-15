# Tool tạo nguồn asset game

**Cấu hình15/10/2026:** MCP/CLI dùng endpoint mới owner chọn `https://img.aishenji.top/v1`, model `gpt-image-2`, khóa DPAPI ngoài Git. `generate_game_asset` chỉ nhận text; nguồn cần khóa identity dùng `imagegen-router.mjs edit` multipart với ảnh tham chiếu có hash. Không dùng `edit-responses` cho provider này vì `/responses`404. [Pilot mới](design/characters/gdd-character-animation-v1/enemy-production/router-pilot-v2/connection.json) đã xác nhận generation thực bằng PNG1536×1024, tách khỏi model-list và duyệt ART.


`scripts/game-assetgen.mjs` và MCP cục bộ dùng lại [router hiện hành](IMAGEGEN-ROUTER.md), giữ model **`gpt-image-2`**. Tool biên soạn brief theo loại asset, lưu nguồn và hồ sơ xem thử; không tự đưa ảnh vào game, thư viện Editor hoặc map owner. Không tạo ảnh mới thật trong các kiểm thử của tool này.

## Bảy profile

| `assetType` | Mục đích | Size nguồn mặc định | Bước tiếp theo |
| --- | --- | --- | --- |
| `icon` | Một chủ thể icon dễ đọc ở cỡ nhỏ | `1024x1024` | Tách alpha, chọn native size, duyệt mép |
| `prop` | Đạo cụ riêng, giữ toàn bộ hình và chân đế | `1024x1024` | Tách alpha, đo pivot, so với người native |
| `environment-part` | Vật thể/part môi trường theo brief | `1024x1024` | Tách alpha đúng mép; part cùng canvas/pivot, kiểm ghép |
| `character-concept` | Concept tĩnh nhân vật, áo/khí theo brief | `1024x1536` | Duyệt concept rồi làm body/animation native riêng |
| `vfx-concept` | Concept tĩnh hiệu ứng | `1024x1024` | Duyệt hình rồi làm alpha/timeline/animation riêng |
| `ui-art` | Mỹ thuật UI theo brief | `1536x1024` | Duyệt bố cục, alpha, slicing và native export riêng |
| `map-concept` | Concept map tổng theo GDD/brief | `1536x1024` | Kiểm native rồi theo quy trình sector/map hiện hành |

Prompt gốc được giữ nguyên; profile thêm yêu cầu sản xuất và trạng thái xem thử, không tự đặt nhân vật, bảng màu hoặc vật thể ngoài brief. `icon`, `prop`, `environment-part` yêu cầu nền **magenta phẳng `#FF00FF`**, ghi `needsAlphaExtraction: true`. Đây là nguồn chroma key, chưa phải PNG alpha sản xuất.

Map tiếp tục theo [concept tổng → khu có phần chồng → căn/ghép](MAP-CONCEPT-SECTOR-WORKFLOW.md), rồi nền nhẹ cho Editor, owner navigation và asset cần thiết sau. Một ảnh concept không cung cấp collider, navigation, world size đã chốt hoặc layer môi trường. Multipart phải giữ canvas/pivot chung; không dùng polygon gameplay thay mép ART.

## Input và CLI

Lưu một spec UTF-8, ví dụ `output/imagegen/asset-spec.json`:

```json
{
  "assetType": "prop",
  "name": "chum-gom-preview",
  "prompt": "Một chiếc chum gốm đơn lẻ, góc nhìn ba phần tư từ trên, giữ rõ toàn bộ thân và chân đế, không chữ.",
  "size": "1024x1024",
  "quality": "high",
  "n": 1
}
```

Đây chỉ là ví dụ spec; tài liệu không kèm ảnh được tạo từ ví dụ.

```powershell
npm.cmd run assetgen:profiles
npm.cmd run assetgen:plan -- --spec-file output/imagegen/asset-spec.json
npm.cmd run assetgen -- --spec-file output/imagegen/asset-spec.json
```

Lệnh Node tương đương:

```powershell
node scripts/game-assetgen.mjs profiles
node scripts/game-assetgen.mjs plan --spec-file output/imagegen/asset-spec.json
node scripts/game-assetgen.mjs generate --spec-file output/imagegen/asset-spec.json
```

`plan` chỉ kiểm input và biên soạn prompt: không tạo file, đọc cấu hình/khóa hoặc gọi mạng. `generate --dry-run` cũng trả plan. Có thể dùng `--spec '<JSON>'` thay `--spec-file`, nhưng phải chọn đúng một nguồn input. `--help` hiển thị trợ giúp; kết quả lệnh thông thường là JSON.

Input chỉ nhận `assetType`, `name`, `prompt`, tùy chọn `size`, `quality`, `n`; trường lạ bị từ chối. `name` là slug ASCII chữ thường/số/gạch nối đơn, tối đa 64 ký tự. `prompt` không trống, không NUL, tối đa 32.768 byte UTF-8. `quality` nhận `auto|high|medium|low`, mặc định `high`; `n` là số nguyên 1–4, mặc định 1.

`size` nhận `auto` hoặc `WIDTHxHEIGHT`: mỗi cạnh là bội 16 và tối đa 3840, tỷ lệ cạnh dài/ngắn tối đa 3:1, tổng pixel 655.360–8.294.400. Ví dụ hợp lệ: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `3840x2160`. Router có thể trả kích thước khác request: nguồn được giữ nguyên, metadata ghi kích thước thực và manifest giữ cảnh báo. Lần kiểm router trước đây đã trả `1536x1024` khi yêu cầu `1024x1024`; không suy size request đã được áp dụng chỉ từ payload.

## Nguồn, alpha và duyệt

Mỗi lần `generate` dành một thư mục mới dưới `output/imagegen/game-assets/<name>-<phiên-bản-riêng>/`, không nhận đích `out` tùy ý hoặc ghi đè nguồn cũ. Parent/đường dẫn thực được kiểm trước lời gọi API để chặn thư mục chuyển ra ngoài workspace.

Gói có `request.json` lưu input gốc, prompt đã biên soạn và workflow trước lời gọi mạng; ảnh nguồn cùng JSON metadata/hash/kích thước; `manifest.json` ghi file nguồn, cảnh báo và trạng thái. Khi lỗi sau khi dành thư mục, tool cố lưu manifest thất bại với thông báo đã che khóa. Không tự retry hoặc chuyển model khi lỗi.

Tách magenta cho `icon`, `prop`, `environment-part` sau khi đã xem nguồn:

```powershell
npm.cmd run assetgen:prepare -- --manifest "output/imagegen/game-assets/<gói>/manifest.json" --image-index 1
node scripts/game-asset-prepare.mjs --manifest "output/imagegen/game-assets/<gói>/manifest.json" --image-index 1
```

`image-index` tính từ 1, mặc định 1. Helper chỉ xử lý nguồn đúng hash trong gói staging, dùng Python + Pillow và `remove_chroma_key.py` của skill ImageGen cục bộ; `GAME_ASSET_PYTHON` chọn Python khi máy cần đường dẫn riêng. Nó không gọi API, không tạo lại ảnh, không đổi nguồn, crop hoặc resize canvas. PNG và report mới nằm trong `prepared/`, được thêm vào `preparedFiles` của manifest; giữ nguồn và các lần chuẩn bị trước. Alpha soft matte/spill cleanup vẫn cần kiểm mép trên nền sáng/tối, nhất là khi chủ thể có màu gần magenta.

Nguồn có trạng thái `preview-only`; ảnh qua helper là `prepared-preview`. Cả hai giữ `ownerApproved: false`, `artApproved: false`. Pivot chưa đo, native export, alpha edges và tích hợp runtime vẫn chờ kiểm/duyệt; tách nền thành công không tự biến concept thành asset production.

Hợp đồng để đối chiếu ở 1×: người frame **64 × 96**, chân **(32,88)**; VFX R01 canvas **96 × 96**, body **80**, pivot **(48,88)**. HUD desktop hiện hành **760 × 140** chỉ là nguồn tham chiếu giữ nguyên. Tool không scale ảnh nguồn về các cỡ này, không suy pivot từ tâm ảnh và không sửa frame, camera, blocker, bậc thang, authored map, save hoặc draft owner.

## MCP trong Codex

Máy hiện tại đăng ký server stdio bằng `.codex/config.toml`; tệp đăng ký chứa đường dẫn máy nên giữ cục bộ ngoài Git. Server `scripts/game-assetgen-mcp.mjs` và CLI được commit, có thể khởi động bằng `npm.cmd run assetgen:mcp`. Cấu hình không chứa khóa. Codex áp dụng cấu hình MCP cấp project theo cơ chế tin cậy project; xem [tài liệu MCP chính thức](https://developers.openai.com/codex/mcp/).

Trên máy hiện tại, `codex mcp get game_assets` đã đọc đúng đăng ký server. Nếu danh sách tool của chat đang mở chưa cập nhật, tải lại Codex hoặc mở chat mới trong project để nạp cấu hình. CLI dùng được ngay. Cấu hình sử dụng đường dẫn tuyệt đối trên máy hiện tại; khi chuyển checkout hoặc máy, cập nhật command/args/cwd tương ứng, không sao chép khóa DPAPI sang tài khoản Windows khác.

| Tool | Input | Hành động |
| --- | --- | --- |
| `list_game_asset_profiles` | `{}` | Đọc bảy profile, không khóa/file/mạng |
| `plan_game_asset` | Spec như CLI | Trả prompt, tham số, workflow và đường dẫn dự kiến; không khóa/file/mạng |
| `generate_game_asset` | Spec như CLI | Một request tạo ảnh; lưu gói nguồn và manifest, trả đường dẫn/cảnh báo |
| `prepare_game_asset` | `{"manifestPath":".../manifest.json","imageIndex":1}` | Tách chroma alpha cục bộ cho nguồn đã lưu, giữ canvas |
| `check_game_image_router` | `{}` | Gọi GET `/models`, kiểm tên `gpt-image-2`; không tạo ảnh |

MCP trả JSON và đường dẫn file cục bộ, không gửi bitmap base64 qua nội dung tool. Server chỉ cho một generation chạy tại một thời điểm. Model-list check không chứng minh generation thành công hoặc xác thực backend upstream của router.

## Cấu hình và kiểm thử

Dùng lại `%LOCALAPPDATA%\game-solo\imagegen-router.json`; khóa được Windows DPAPI mã hóa ngoài Git. Biến môi trường router và cách cập nhật khóa đã có trong [IMAGEGEN-ROUTER.md](IMAGEGEN-ROUTER.md); không đặt khóa vào spec, prompt, repo, tham số CLI hoặc metadata. Tool giữ tên `gpt-image-2`; cấu hình model khác bị từ chối thay vì tự đổi model.

Generation gửi **một POST có thể tính phí**, deadline 300 giây, không retry/fallback tự động. Timeout không chứng minh request chưa bị tính phí; đọc manifest và lỗi đã che khóa trước khi chủ động gửi lại. `check_game_image_router` chỉ đọc model-list; helper prepare hoàn toàn cục bộ.

```powershell
npm.cmd run test:assetgen
npm.cmd run test:imagegen
```

Kiểm thử dùng response giả, PNG fixture và workspace tạm; không gọi generation thật hoặc ghi map/DB/draft của owner. Kết quả kỹ thuật không thay việc duyệt ART.

Ngày 12/10/2026: `test:assetgen` qua 69/69 test, gồm process MCP stdio thật và helper alpha thật trên PNG tổng hợp; không có test bỏ qua trên máy hiện tại. Các kiểm tra mới xác nhận tooling, còn lần tạo PNG qua router thật đã được ghi trong tài liệu router.

Kiểm lại trước bàn giao Git ngày 12/10: 91/91 test đạt sau các bổ sung multipart/Responses; `npm.cmd run build` dựng đủ asset và client thành công. Không gọi API tạo ảnh thật trong kiểm thử này.
