# Thư viện skill / VFX tu tiên

**Liên hệ GDD 0.28:** ba nhân vật Vương Lâm/Tư Đồ Nam/Lý Mộ Uyển chọn từ đầu, cùng Hằng Nhạc–Ngưng Khí và phân hóa từ Trúc Cơ. Bộ VFX này dùng Vương Lâm hướng Đông làm mẫu thi triển; quyền mở skill, socket/pose từng actor và luật combat cần tích hợp riêng. Thư viện năm cảnh giới đã có ART, gameplay hiện chưa chạy các cảnh giới này.

[Thư viện xem và tải](skill-library.html) · [Ngưng Khí](ngung-khi-kit.html?family=wind) · [Trúc Cơ](truc-co-kit.html?family=sword) · [Kết Đan](ket-dan-kit.html?family=sword) · [Nguyên Anh](nguyen-anh-kit.html?family=sword) · [Hóa Thần](hoa-than-kit.html?family=sword)

**Lưu trong Git:** PNG nguồn, atlas, preview, prompt, manifest và script trong `production/` được commit. Các ZIP bàn giao là bản xuất, được giữ cục bộ và bỏ qua trong `.gitignore`; clone mới xem được preview nhưng cần chạy script đóng gói tương ứng hoặc nhận ZIP bàn giao để dùng liên kết tải. Các ZIP hiện có trên máy vẫn giữ nguyên.

| Bộ | Skill | PNG / atlas | Trạng thái |
| --- | --- | --- | --- |
| Ngưng Khí R01 | Kiếm Khí / Lôi Ấn / Ngự Phong Bộ | 114 / 13 | Đã chấp nhận |
| Trúc Cơ R02 | Ngự Kiếm / Liên Lôi Ấn / Hồi Phong Bộ | 132 / 15 | Đã chấp nhận; pack 1.0.1 |
| Kết Đan R03 | Kiếm Luân / Lôi Hạch / Phong Luân | 130 / 15 | Đã chấp nhận; pack 1.0.1 |
| Nguyên Anh R04 | Kiếm Linh Ảnh / Linh Ảnh Lôi Ấn / Linh Ảnh Phong Bộ | 156 / 19 | Đã chấp nhận; source 2.0.0 / pack 2.0.1 |
| Hóa Thần R05 | Ý Cảnh Kiếm / Ý Cảnh Lôi / Ý Cảnh Phong | 114 / 14 | Đã chấp nhận; source 3.0.0 / pack 3.0.1 |

[ZIP chung R01 → R05](releases/hoa-than-kit-3.0.1.zip) · [ZIP từng skill](releases/skill-packs/index.json) · [Hồ sơ Hóa Thần](HOA-THAN-KIT.md) · [Hồ sơ Nguyên Anh](NGUYEN-ANH-KIT.md) · [Library và mốc](library.json).

15 skill tổng **646 PNG / 76 atlas**, gồm các frame dùng lại giữa cảnh giới. PNG RGBA rời là nguồn chính; atlas là build output; 24 FPS, thân Vương Lâm tối đa 80 world px. Nguồn/prompt sinh bằng imagegen tích hợp được lưu cùng asset. Mỗi ZIP có manifest và SHA-256. Các gói lịch sử giữ nguyên; trạng thái duyệt mới ghi vào phiên bản pack mới.

Bản chung có nguồn/preview năm cảnh giới; ZIP riêng có một skill và helper, không có preview. ZIP chung không lồng các ZIP release; dùng thư viện workspace gốc để tải gói riêng. Chạy python serve-preview.py, mở http://127.0.0.1:4185/skill-library.html; nếu cổng đã được dùng, chạy server hiện có hoặc đổi cổng trong bản giải nén.

**87 kiểm tra tự động đạt**. Có 30 capture Hóa Thần cục bộ từ atlas và ba bảng R04/R05; tương tác browser chưa xác minh. Chưa tích hợp runtime, hướng đầy đủ, SFX/icon, LOD đông người hoặc benchmark. P5 đã chốt ART cả R04/R05; Hóa Thần đã được chủ dự án chấp nhận.

Nguyên Anh dùng linh ảnh khí ấn nửa thân và bỏ body echo Phong. Hóa Thần dùng nhịp tĩnh/khí ngọc, một kiếm chủ đạo, ấn Lôi cục bộ, dư âm Phong theo đường đã đi; **58 frame mới / 56 PNG giữ nguyên từ R05 V2**. ZIP chung giữ thêm R04 V1 và R05 V1/V2 để kiểm: **archive 1032 PNG/123 atlas**; thư viện hiện tại 646/76. Các con số không phải số hình độc nhất.

Bản V2 lịch sử xử lý phản hồi thiếu lực bằng hình áp lực có hướng, impact riêng, nhịp xuất ngắn, tốc độ preview mặc định 1× và feedback camera/hit-stop hình ảnh tùy chọn. Bản 1.0.0 lưu lịch sử.

R05 V3 quay về ngọc sáng, khí lụa, sét tím và phù vàng theo ảnh chủ dự án gửi. 58 frame mới / 56 frame giữ nguyên; Phong có tối đa hai tàn ảnh từ vị trí host có timestamp, không tạo actor. Camera feedback mặc định tắt. [Hồ sơ V3](HOA-THAN-KIT.md).

**Đợt ART đã kết thúc ngày 07/10/2026:** cả 15 skill được chấp nhận. [Hồ sơ bàn giao](STARTER-VFX-HANDOFF.md).
