# Navigation Hằng Nhạc do chủ dự án chốt

Ngày 08/10/2026 chủ dự án xác nhận hoàn tất và yêu cầu lưu bản mới nhất. [Verification](verification.json) ghi ID dự án/level, hash ảnh, 9 vùng chặn có hiệu lực và Spawn (1616,992), kiểm 0 lỗi/0 lưu ý.

- [Navigation không nhúng ảnh](navigation.json): polygon runtime lấy từ đúng dữ liệu owner, playerRadius 8, frame 64×96/chân (32,88).
- [Runtime project](runtime-project.json): snapshot exporter có nền nhúng; [runtime đã tích hợp](../../../../HANG-NHAC-RUNTIME.md) dùng release nhẹ và ảnh ngoài JSON.
- [Editor project](../editor-project.json): giữ anchors/smoothness và points để tiếp tục sửa, không dùng runtime JSON thay authoring.

Không sinh thêm collider, sửa đường chặn hoặc tự đặt portal. Spawn mặc định (512,448) bị chặn đã chuyển ra sân trung tâm. Mirror level và project tổng được lưu qua API Editor. Runtime hiện có 0 portal; chưa có map farm hoặc phiên khảo nghiệm. Xem [kế hoạch triển khai](../../../../HANG-NHAC-IMPLEMENTATION-PLAN.md).
