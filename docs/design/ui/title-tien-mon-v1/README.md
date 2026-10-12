# Title ART 01 — Tiên môn trên biển mây

Nền độc lập cho màn mở đầu và entry của **Vân Hải Đạo Đồ** (owner đổi tên game ngày 10/10/2026). Không phải map runtime, không thay nguồn Hằng Nhạc/navigation/Editor. Prompt và metadata giữ tên tại thời điểm tạo nguồn để truy vết; logo là HTML, nền không chứa chữ nên dùng tiếp được.

- `source.png`: đầu ra nguyên bản 1672 × 941 của **built-in image_gen**, giữ trong workspace.
- `sect-gate.webp`: sản phẩm runtime, 274.698 byte; chỉ đổi định dạng bằng Pillow, giữ bố cục/kích thước.
- [prompt.txt](prompt.txt): prompt cuối đầy đủ, use case `stylized-concept`, không text/logo/UI/nhân vật.
- [assets.json](assets.json): kích thước/hash/nguồn/công cụ và trạng thái duyệt riêng.
- `scripts/sync-title-art.mjs`: kiểm hash và chép sản phẩm vào public assets trong pipeline build.

Đã xem đầu ra và screenshot; nền có khoảng âm trái cho chữ và cổng tiên môn phải cho điểm nhìn. Chuyển động khí/mây là lớp CSS trình bày tách khỏi bitmap và gameplay. ART mới chưa được owner duyệt; manifest không suy duyệt từ test. Xem [thiết kế, reference và kiểm tra](../../../GAME-TITLE-SCREEN.md).
