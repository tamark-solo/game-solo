# Khí tức Hóa Thần · nhịp và tương tác review 03

**12/10/2026 · thử nghiệm, chờ phản hồi trải nghiệm.** Owner thấy ART/motion 02 tạm ổn nhưng trải nghiệm chưa tốt. Khi kiểm, hai đạo dùng cùng chuyển động CSS với chu kỳ khác nhau, rear lớn lặp thường trực và hạt chạy theo các đoạn thẳng của ellipse. Bản 03 thử nhịp có phản hồi thay cho các loop độc lập. Owner tiếp tục làm rõ **vẫn chìm, cần tìm ý tưởng thiết kế**; [nghiên cứu 04](HUA-THAN-AURA-RESEARCH-V4.md) ưu tiên hình/màu/độ nổi, giữ nhịp này làm phương án đối chiếu.

[Thử trên map](http://127.0.0.1:5174/van-hai-character-review.html?view=map), chọn Sinh Tử/Huyền Tử. **Giữ để tụ khí** bằng chuột/cảm ứng hoặc Space/Enter khi focus nút; thả để xem khí lan ra. Tắt Khí tức/Chuyển động để so phần người/lớp ART. Nút chỉ khả dụng khi actor ở vùng nhìn và motion có thể chạy.

| Nhịp | Phản hồi |
| --- | --- |
| Khí lắng | Rear/front nhẹ và thấp hơn, người rõ; vòng chân thở chậm |
| Tụ khí | Hạt co về chân, rear dày/lớn dần, thanh mức tụ tăng |
| Bộc phát | Vòng texture riêng lan trên mặt đất, hạt mở rộng, luồng khí tăng rồi lắng |

Tu Đạo tụ chậm/nhịp đều (1.600 ms, release 1.100 ms); Đọa Ma tụ nhanh/hạt đảo chiều (1.100 ms, release 850 ms). Đây là thời gian presentation review, không timing/balance/cooldown hoặc skill mới. Tap có phản hồi nhỏ, hold lâu đạt mức tối đa, không tích chồng vô hạn.

## Core / ghép

`client/src/core/character-qi-timeline.ts` là mô hình thuần: tuổi hiệu ứng/theme/intent review → descriptor ground/rear/front/burst/motes. `features/character-qi-review.ts` quản lý đồng hồ nhìn được và chuyển descriptor sang DOM. Query ảnh cache lúc mount, không đọc layout mỗi frame; RAF dừng khi không có node active. Hidden/offline/offscreen/pause/reduced motion hủy tụ đang giữ và giữ ART tĩnh, tránh trạng thái mắc sau trở lại.

Hạt dùng sin/cos liên tục trên ellipse, tách lượt vẽ sau/trước thân theo nửa quỹ đạo. Burst dùng lại texture ground thành instance riêng. Không tạo/sửa PNG, không thêm bitmap vào người hoặc đổi canvas/pivot. [ART/source/prompt 02](design/characters/wang-lin-hoa-than-review-v2/README.md) giữ nguyên; mọi phần ngoài mask áo vẫn nguyên. [Contract layer](CHARACTER-AURA-LAYERS.md) tiếp tục áp dụng khi làm pose/hướng sau này.

Feature map chỉ nhận thao tác local trên panel review. Pointer capture kết thúc khi thả ngoài nút; pointer cancel/blur/đổi mẫu/tắt FX hủy tụ. Thao tác panel không đặt lại điểm đối chiếu hoặc pan map. Không có gameplay command/API/save/DB, không sửa cảnh giới, vật phẩm, GDD, map/blocker hay renderer Three. Người vẫn một pose đứng Nam; chưa trải nghiệm đi/cast/bộ tám hướng hoặc âm thanh.

## Kiểm / đánh giá

Ba unit test kiểm lifecycle tụ/phát/lắng, tap/hold giới hạn và liên tục ellipse/front-back. [Browser verification](data/wang-lin-hoa-than-experience-v3-verification.json): sáu viewport, 48 bố cục, 1.470 kiểm gồm chuột/keyboard/capture/blur/mẫu nhập môn và giữ người/point/camera, cùng hồi quy gallery/map/motion/lifecycle. Typecheck/boundary và Vite build qua. Kiểm kỹ thuật không xác nhận trải nghiệm đã tốt; `artApproved/ownerApproved: false`.
