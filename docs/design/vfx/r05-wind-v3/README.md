# Ý Cảnh Phong · R05 V3

**Hồ sơ nguồn:** Snapshot nguồn r05-wind-v3 lúc sản xuất, giữ dữ liệu/frame nguyên trạng. R05 hiện dùng V3 đã chấp nhận, pack 3.0.1 ghi duyệt; trạng thái chờ bên dưới là ghi nhận lịch sử nguồn. Xem [trạng thái hiện hành](../HOA-THAN-KIT.md) và [bàn giao](../STARTER-VFX-HANDOFF.md).

Nguồn: imagegen tích hợp, tham chiếu tạo hình chủ dự án gửi. Ngọc sáng, khí lụa, phù vàng; không có bia đá hay mảnh vật liệu trong impact. Xem [hồ sơ bộ](../HOA-THAN-KIT.md).

PNG RGBA trong frames/ là nguồn chính; atlas là build output. 24 FPS, body tối đa 80 world px. skill.json chứa frame events và hợp đồng host, clips.json chứa anchor/rect/holds; provenance.json dẫn đến source và prompt chính xác.

Trạng thái nguồn lúc sản xuất: chờ chủ dự án xem motion. Chưa tích hợp gameplay, SFX, hướng đầy đủ hoặc crowd LOD. Sau khi artist sửa PNG chỉ chạy pack-atlases.mjs; không chạy lại initial extraction/merge trên frame đã sửa.
