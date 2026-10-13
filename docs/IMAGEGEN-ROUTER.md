# Tạo ảnh qua router gpt-image-2

Tool độc lập `scripts/imagegen-router.mjs` nhận prompt, gọi Image API của router và lưu ảnh cùng metadata. Model mặc định giữ đúng `gpt-image-2`; tool không tự đổi model hoặc tự gửi lại yêu cầu tạo ảnh khi lỗi.

Ngày 12/10/2026 đã kiểm tra thật: `/models` trả HTTP 200 và có `gpt-image-2`; `/images/generations` trả một PNG base64 mở được. Ảnh đối chiếu nằm ở `output/imagegen/router-connectivity-v1.png`, prompt và hash nằm trong JSON cùng tên. Đây là ảnh chén gốm xem thử để kiểm tra kết nối.

Router trả ảnh **1536 × 1024** dù request đặt **1024 × 1024**. Tool ghi kích thước thực của PNG, cảnh báo khi khác yêu cầu và giữ nguyên bitmap. Không suy router đã áp dụng chính xác kích thước hoặc chất lượng chỉ từ payload gửi đi.

## Cấu hình trên máy hiện tại

- Endpoint hiện tại: `https://img.aishenji.top/v1` (owner đổi nhà cung cấp ngày 12/10/2026).
- Model: `gpt-image-2`.
- Cấu hình nằm ngoài Git: `%LOCALAPPDATA%\game-solo\imagegen-router.json`.
- Khóa trong cấu hình được mã hóa bằng Windows DPAPI, chỉ tài khoản Windows hiện tại giải mã được. Không đưa khóa vào mã nguồn, prompt, tham số dòng lệnh hoặc metadata.
- `IMAGEGEN_ROUTER_API_KEY` và `IMAGEGEN_ROUTER_BASE_URL` có thể ghi đè cấu hình; `IMAGEGEN_ROUTER_CONFIG` chọn tệp cấu hình khác. Với máy không chạy Windows, dùng biến môi trường cho khóa.

Khóa mới đã được thay qua stdin và mã hóa DPAPI ngoài Git. CLI và MCP `game_assets` cùng đọc cấu hình này mỗi lần gọi; GET `/v1/models` đã xác nhận `gpt-image-2` ở cả hai đường. URL owner cung cấp là hostname; API nằm dưới `/v1` (`/models` ở root trả 404, `/v1/models` nhận Bearer và trả danh sách model).

Đường Image API mới có `/images/generations` và `/images/edits` (OPTIONS trả 204); `/responses` trả 404. Khi chỉnh ảnh trên nhà cung cấp mới, chọn `edit` multipart với ảnh bố cục đầu tiên, rồi nguồn style. Kiểm ảnh trả về để xác nhận khả năng edit thực tế; không tự đổi transport sau lỗi. Phần Responses bên dưới ghi lịch sử nhà cung cấp trước, không dùng nguyên schema cũ cho endpoint mới.

Đã xác nhận edits bằng POST thực: năm khu được chọn C01/C03/C04/C05/C06 trả PNG 1254 × 1254 mở được, model request giữ `gpt-image-2`. Prompt, thứ tự input, hash, endpoint và kích thước thực nằm trong [gói chi tiết Vân Ngọc](design/world/hang-nhac-van-ngoc-detail-v1/PRODUCTION.md). Request `1232x1232` khác kích thước thực; chuẩn hóa/căn khu là bước riêng, không sửa bitmap gốc hoặc metadata lịch sử.

```powershell
node scripts/imagegen-router.mjs edit --prompt-file <prompt.txt> --image <crop.png> --image <style.png> --quality high --size 1232x1232 --out <new-sector.png>
```

Để cập nhật khóa trên Windows, đọc khóa qua hộp nhập ẩn của PowerShell rồi chuyển thẳng qua stdin; giá trị khóa không xuất hiện trong lịch sử lệnh:

```powershell
$routerSecureKey = Read-Host 'Khóa API router' -AsSecureString
$routerCredential = [System.Net.NetworkCredential]::new('', $routerSecureKey)
$routerCredential.Password | node scripts/imagegen-router.mjs configure --api-key-stdin
$routerCredential = $null
$routerSecureKey = $null
```

Kiểm tra router và danh sách model, không tạo ảnh:

```powershell
npm.cmd run imagegen:check
```

Model xuất hiện trong `/models` chỉ xác nhận router công bố model. Việc tạo ảnh phải được xác nhận bằng một yêu cầu thật trả về ảnh; tên model trong response không chứng minh model upstream thực tế của nhà cung cấp.

## Tạo ảnh

```powershell
npm.cmd run imagegen -- --prompt "Một chiếc chén gốm xanh trên nền sáng, ánh sáng studio, không chữ" --out output/imagegen/chen-gom.png
```

Để gửi prompt nhiều dòng hoặc tiếng Việt chính xác, lưu văn bản UTF-8 rồi dùng tệp:

```powershell
npm.cmd run imagegen -- --prompt-file output/imagegen/prompt.txt --size 1536x1024 --quality high --out output/imagegen/concept-v1.png
```

Xem payload trước khi gọi, không cần khóa và không tốn lượt tạo ảnh:

```powershell
npm.cmd run imagegen -- --prompt "Một chiếc chén gốm xanh" --dry-run
```

Mặc định tạo một ảnh 1024 × 1024, chất lượng `low`, định dạng PNG. Có thể chọn `--quality low|medium|high|auto`, `--size auto|WIDTHxHEIGHT`, `--n`, `--timeout` (giây). Dùng `--help` để xem toàn bộ tham số. Tệp đích đã có sẽ bị chặn trước khi gọi API; chỉ `--force` mới cho phép ghi đè.

`--background transparent|opaque|auto` là tùy chọn rõ cho `generate`, `edit` và `edit-responses` ở chế độ `full`. Nếu bỏ cờ này, tool không thêm trường `background`, giữ payload mặc định trước đây. Khi có cờ, Image API nhận trường đó trong JSON hoặc multipart; Responses full nhận trong tool ảnh. Metadata `requestParameters` lưu phần đã gửi, và Responses full cũng ghi trong `imageOptions.intended`/`transmitted`. Responses minimal từ chối cờ này trước POST vì hợp đồng minimal chỉ gửi type/model.

Tool vẫn gửi `output_format: "png"`, phù hợp yêu cầu nền trong suốt của [Image API](https://developers.openai.com/api/reference/resources/images/methods/edit). Router thực tế có thể không áp dụng tùy chọn; phải kiểm alpha của ảnh trả về, không coi ô caro được vẽ trong bitmap là nền trong suốt. Cờ này không đổi model/endpoint/transport hoặc tạo retry/fallback.

## Lịch sử nhà cung cấp trước: chỉnh ảnh qua Responses

Rà trang công khai [dashboard router](https://api.clituasmail.com/) ngày 12/10/2026: nhà cung cấp nói **chưa có multipart edits**, nhưng ImageGen trong Codex dùng `/v1/responses` với tool `image_generation`, model trong tool `gpt-image-2` và model chính là model văn bản. Mẫu kết nối của họ dùng `gpt-6-astra` với `wire_api = "responses"`. Router không công bố OpenAPI tại `/openapi.json` hoặc trang `/docs` (cả hai trả 404); trang dashboard chỉ mô tả giao thức, chưa cung cấp toàn bộ schema.

Lệnh `edit-responses` là đường được chọn rõ ràng cho crop map + ảnh style trên router này. Dùng crop gốc làm ảnh đầu, rồi thêm nguồn style hoặc ảnh hỗ trợ theo thứ tự. Trong prompt, nêu rõ vai trò `Image 1`, `Image 2` và các phần phải giữ nguyên.

```powershell
node scripts/imagegen-router.mjs edit-responses --response-model gpt-6-astra --responses-tool-mode minimal --prompt-file output/imagegen/sector-prompt.txt --image output/imagegen/sector-crop.png --image docs/design/world/hang-nhac-van-ngoc-concept-v1/concept-source.png --quality high --size 1232x1232 --out output/imagegen/sector-detail-v1.png --dry-run
```

Bỏ `--dry-run` để gửi yêu cầu thật. Lệnh `npm.cmd run imagegen` đã chọn `generate` trong package script; với `edit-responses`, dùng lệnh `node` ở trên. API JavaScript xuất `runEditResponses({ config, responseModel: 'gpt-6-astra', responsesToolMode: 'minimal', prompt, images: [targetPath, stylePath], out, size, quality, ... })`; cùng các lựa chọn timeout/force/dryRun như `runGenerate`.

`--response-model` bắt buộc, không có lựa chọn ngầm hoặc fallback. Nó là model văn bản điều phối ở `request.model`, tách với `tools[0].model` giữ `gpt-image-2`. Tool không nhận model ảnh thay thế ở đường này. Mỗi request chỉ xin một ảnh (`--n 1` hoặc bỏ `--n`), đúng giới hạn mà router công bố.

Payload JSON gửi một user input với prompt `input_text` và các `input_image.image_url` dạng data URL theo thứ tự. `tool_choice: { "type": "image_generation" }` yêu cầu dùng tool ảnh và `stream: false` chọn response JSON hoàn tất. Schema input/data URL, action và output dựa theo [Image Generation của OpenAI](https://developers.openai.com/api/docs/guides/image-generation), còn hỗ trợ model `gpt-image-2`/`gpt-6-astra` ở nhà cung cấp dựa trên trang router. Không đổi model theo ví dụ mặc định mới hơn trên trang OpenAI.

`--responses-tool-mode full` là mặc định chung, gửi tool gồm `type`, `model`, `action: "edit"`, `size`, `quality`, `output_format: "png"`. Trong lần POST C02 ngày 12/10, router từ chối HTTP 400 `Unsupported image parameter: size`, request `cmq_beca589da92a8093fe03436e`; chưa trả hoặc lưu ảnh. Không có lần POST retry tự động.

`--responses-tool-mode minimal` được chọn rõ để dùng phần schema router đã công bố: tool chỉ có `type: "image_generation"` và `model: "gpt-image-2"`. Nó **bỏ `size`, `quality`, `output_format` và `action` khỏi tool request**; model vẫn được yêu cầu qua prompt chỉnh crop và ảnh tham chiếu. Giá trị `--size`/`--quality` chỉ là ý định lưu trong metadata, không chứng minh router nhận các tùy chọn này. Định dạng/kích thước/chất lượng thực do router quyết định. Tool vẫn phát đúng một POST, không tự đổi full sang minimal sau lỗi.

Chỉ `output[]` có `type: "image_generation_call"` và `result` base64 hợp lệ mới được lưu. Response chính phải `status: "completed"`; nếu image call có `status`, nó cũng phải là `completed`. Call thiếu `status` có thể được nhận khi response chính hoàn tất và result kiểm được chữ ký ảnh; `image.callCompletion` ghi rõ cách xác minh này. Không coi lời văn của model là ảnh, không poll response chưa xong và không tự retry/fallback. Request nhiều hơn một image call bị chặn, không lưu thêm ảnh ngoài số đã xin.

- Có từ 1 đến 16 input PNG/JPEG/WebP; tool kiểm file thật, chữ ký và kích thước đọc được. Giới hạn cục bộ là 32 MiB mỗi ảnh và 64 MiB tổng, thấp hơn trần API để giữ bộ nhớ có giới hạn.
- Các input phải khác đường dẫn thực và khác hash nội dung. Tên đuôi tệp không quyết định MIME; bytes thực quyết định loại ảnh gửi đi.
- `--dry-run` đọc nguồn và hiển thị thứ tự, đường dẫn, MIME, bytes, SHA256 và kích thước, không in pixel/base64, không giải mã khóa, không POST và không ghi output.
- Không gửi `input_fidelity`: `gpt-image-2` luôn dùng độ trung thực cao cho input theo giao thức model. Transport Responses dùng JSON data URL, không gửi multipart hoặc upload tệp qua endpoint khác.
- Metadata và dry-run thay pixel trong request bằng `[IMAGE DATA OMITTED]`; nguồn vẫn được ghi đường dẫn/hash/bytes/kích thước. Model văn bản và model ảnh được ghi riêng. Lỗi chứa data URL ảnh được che trước khi đưa ra terminal.
- `imageOptions.intended`, `transmitted` và `omitted` phân biệt tùy chọn mong muốn với phần thực gửi đi. Với minimal, `sizeMatchesRequest: null`; `sizeMatchesIntent` chỉ đối chiếu ảnh thực với kích thước mong muốn, không xác nhận kích thước đã được router nhận.
- Metadata lưu nguồn input bên cạnh prompt/tham số request và hash ảnh kết quả. `registrationVerified: false` giữ riêng kiểm đăng ký vị trí/ghép khu; edit không đảm bảo AI giữ chính xác đường đi, footprint hoặc biên nối.
- Đích output không được trùng input, kể cả khi dùng `--force`. Nguồn gốc được giữ nguyên; không có retry, fallback endpoint hoặc đổi model tự động.
- POST `/responses` ở full đã bị từ chối `size` như ghi trên. Minimal sau đó đã tạo C01–C04, nguồn 1254 × 1254 nằm trong gói chi tiết Vân Ngọc; provenance từng file giữ endpoint cũ. Endpoint mới là cấu hình hiện tại ở trên, không sửa lại metadata lịch sử.

Lệnh cũ `edit` và API `runEdit` vẫn giữ cho router tương thích Image API khác: chúng gửi một POST multipart `/images/edits` dùng `image[]`. **Không dùng đường multipart này với `api.clituasmail.com` khi nhà cung cấp vẫn công bố chưa hỗ trợ.** Tool không tự chuyển giữa `edit` và `edit-responses`; người chạy chọn transport cụ thể.

## Kết quả và phạm vi

- Ảnh được lưu trong workspace, mặc định ở `output/imagegen/` với tên riêng cho mỗi lần gọi.
- Metadata JSON đi cùng ảnh lưu prompt nguyên văn, endpoint, tham số, thời điểm và hash. Ảnh mới mang trạng thái xem thử và `ownerApproved: false`.
- PNG/JPEG/WebP được đọc kích thước từ header khi hợp lệ; `sizeMatchesRequest` ghi sự khớp với request. Đây là kiểm kỹ thuật chữ ký/header, không thay việc mở ảnh và duyệt hình.
- Tool nhận ảnh base64 hoặc URL do router trả về. Khi tải URL ảnh, tool không gửi khóa router tới máy chủ ảnh.
- Lệnh POST không tự retry vì lần đầu có thể đã tạo ảnh và bị tính phí dù kết nối timeout. Khi lỗi, đọc thông báo trước khi chủ động chạy lại.
- CLI này có thể gọi qua terminal. Để làm asset game theo profile hoặc dùng MCP trong Codex, xem [GAME-ASSETGEN.md](GAME-ASSETGEN.md); server `game_assets` dùng lại router này.
- Không tự đưa ảnh vào game, sửa map, navigation, blocker, save hoặc đổi trạng thái duyệt ART. Khi ảnh được chọn làm asset dự án, chuyển vào thư mục nguồn thích hợp theo quy trình ART hiện hành.
- API phía router và chất lượng, thời gian, phí thực tế phụ thuộc nhà cung cấp. Tool giữ đúng tên model được yêu cầu, không xác thực được cách router chọn backend.

## Kiểm thử

```powershell
npm.cmd run test:imagegen
```

Các kiểm thử dùng response giả và thư mục tạm, không gọi API thật hoặc chạm vào dữ liệu owner. Giao thức tham khảo: [Image API](https://developers.openai.com/api/docs/guides/image-generation) và [gpt-image-2](https://developers.openai.com/api/docs/models/gpt-image-2).
