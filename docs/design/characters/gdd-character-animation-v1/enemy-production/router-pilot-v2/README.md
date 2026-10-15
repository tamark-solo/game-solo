# Pilot API Kiếm Nô ·15/10/2026

Endpoint hiện hành `https://img.aishenji.top/v1`, model `gpt-image-2`. Dùng router/MCP sẵn có; khóa mã hóa Windows DPAPI tại cấu hình ngoài Git, không có khóa trong gói này. Không cần khởi động lại MCP vì mỗi lượt đọc lại cấu hình.

GET model thành công. Hai POST `edit` multipart `/v1/images/edits` đã trả hai PNG1536×1024 có alpha thật: [bản đầu](source.png) và [sửa góc sau](rear-correction/source.png). Mỗi lượt có MCP plan trước, không automatic retry hoặc đổi model. `/responses` ở provider này404.

[Báo cáo kết nối](connection.json), [assessment bản đầu](generation-result.json), [assessment sửa góc](rear-correction/generation-result.json). Bản sửa bỏ mắt Đông Bắc; Tây Bắc vẫn còn mắt, sáu view ngoài vùng yêu cầu cũng bị provider vẽ lại. Giữ cả hai raw và provenance nguyên byte, chưa đăng ký/bind. Một nguồn chứa tám hình không chứng minh đã có tám master đạt yêu cầu; actual enemy animation vẫn0clip.

Source là RGBA có alpha0 ở nền. RGB của pixel alpha0 có thể mang màu nền cũ, nhưng không hiển thị khi composite đúng. `alpha-review-on-blue.png` là ảnh QA composite từ bản đầu, không dùng làm source sản xuất.

Lệnh tiếp nối dùng cùng CLI `node scripts/imagegen-router.mjs edit --prompt-file <prompt.txt> --image <source.png> --image <own-approved-reference.png> --quality high --size 1536x1024 --background transparent --timeout 300 --out <new-sibling.png>`. Giữ prompt/input/hash; source mới luôn sibling. Render thành công không tự duyệt ART, motion hoặc runtime.
