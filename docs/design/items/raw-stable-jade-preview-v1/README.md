# Ngọc thô ổn khí — mẫu hình 01

**10/10/2026 · visual-review draft.** Owner yêu cầu thử một vật liệu bằng ImageGen, sau đó cung cấp endpoint/model bên thứ ba để gọi API. Mẫu được sinh bằng CLI gốc của skill ImageGen, không sửa skill hoặc tạo gameplay item.

## Xem hình

- [Preview 512 px](preview-512.png)
- [Preview 96 px](preview-96.png) · [Preview 64 px](preview-64.png)
- [Nguồn PNG nguyên bản](source-v1.png)
- [Prompt](prompt-v1.txt) · [Metadata/hash](asset.json)

Đối tượng: một mảnh ngọc thô chưa gia công, mặt ngọc celadon, vân xanh ngọc và lớp đá ngoài; không trang sức, pháp bảo hoàn chỉnh hoặc Thiên Nghịch Châu. Hình giữ nền xanh tối để owner xem chất liệu.

## Đường sinh và kết quả

Endpoint `https://api.clituasmail.com/v1`, model được yêu cầu `gpt-image-2`, quality `medium`, một ảnh, size yêu cầu `1024x1024`, nền `opaque`, format PNG. Provider trả **1254 × 1254**; lưu nguyên bitmap và ghi khác biệt, không đổi tên metadata để giả đã đúng kích thước request. Các preview chỉ resize bằng Lanczos.

Kiểm alpha: toàn bộ alpha 255. Đây **không phải icon alpha sẵn ghép game**. Cảm giác hiện nghiêng về quặng thật/realistic hơn nét painterly inventory mong muốn; cần owner đánh giá, chưa tự gọi thêm ảnh hoặc xử lý tách nền.

Preflight `/models` ban đầu bị 403 với client urllib mặc định, sau đó trả 200 với user-agent phù hợp và liệt kê `gpt-image-2`. Lần gọi generation qua SDK/CLI thành công. Điều này xác nhận đường API trong lần thử này, không bảo đảm toàn bộ edits/alpha/batch/model options hoặc các lần sau.

## Giới hạn

Không có credentials trong source/prompt/metadata/log xuất của mẫu. Key chỉ cấp qua môi trường của tiến trình gọi; không cấu hình provider global hoặc đổi backend/client. Vì key đã được chia sẻ trong chat, khuyến nghị owner thu hồi/đổi sau lần thử.

`artApproved=false`, `ownerApproved=false`, `runtimeIntegrated=false`. Không sửa map/save/UI/HUD thật, không sinh bonus/recipe/nguồn item. Một request thành công không chứng minh duyệt hình hoặc sẵn sàng production.
