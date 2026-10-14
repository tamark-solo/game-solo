# Hướng FX cho bảy phối trang bị đã ghim

Mục tiêu là pháp bảo có hình tượng và biến đổi hình qua tụ → phát → tan. Kiếm linh, dòng hồn và dị thú có silhouette riêng, đặt cạnh/sau trang bị; mặt và thân Vương Lâm giữ nguyên từ bộ v3.

| Bộ | Hướng mới | Căn cứ và phần chuyển thể |
|---|---|---|
| Tiên kiếm | Linh thể trong hắc khí, lưỡi kiếm khí ngà, vệt chém tách thành mảnh | Hắc khí và kiếm linh Hứa Lập Quốc từ [chương365](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-365), [chương399](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-399). Cỡ hình, màu lõi và nhịp preview là chuyển thể cho camera game. |
| Tôn Hồn Phiên | Đầu hồn đọc rõ trong dải mực; tụ hẹp rồi phóng thành dòng; tàn hồn mỏng dần | Khí đen, hồn và sức biểu hiện lớn tham khảo [chương397](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-397), [chương538](https://lite.wuxiaworld.com/novel/renegade-immortal/rge-chapter-538). Không diễn giải số hồn vẽ trong sprite thành số hồn thật của pháp bảo. |
| Xạ Thần Xa | Dị thú giằng xích, lôi quang tại điểm căng, lao ra và vỡ thành khí | Xích/thú và lôi thú thuộc các dạng khác nhau; đây là thiết kế phối hợp cảm hứng, không khẳng định một dạng nguyên tác chứa mọi chi tiết. Xem [hồ sơ canon đã lưu](../../characters/wang-lin-equipment-story-v2/canon-study.md). |

Đã đối chiếu nguồn chính thức: [Tale of Immortal](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) về linh thể pháp bảo; [Nhất Niệm Tiêu Dao](https://www.taptap.cn/moment/531819768764695021) về bộ áo–vũ khí–chuyển động; [Phàm Nhân](https://www.taptap.cn/moment/400732370212225287?group_id=499919) về hình biểu hiện khác nhau của pháp bảo. Bài học áp dụng là hình tượng có nhận diện và nhịp riêng; không lấy pixel hay cơ chế từ các game đó.

Reference local thực sự đã xem: `docs/art_reference/character-runtime-kiem-tu-pixellab-luyen-khi/skill_ranged-weapon@cuu-tieu-long-ngam.pk.png` (hình rồng quấn lưỡi thay đổi theo pose; lớp FX bám nét ngoài). Các lớp FX `thien-phat` và `u-minh-hon` hỗ trợ cách dùng viền màu chọn lọc. Chỉ tham khảo cấu trúc, không copy artwork.

Đã xem native/map của Hắc Ấn VFX02, các pha FX Lang Vương và U Niệm/Liệt Ấn VFX02 trong repository: mảng mực, lõi ngà, silhouette thay đổi và dư khí tiếp tục sau peak đọc rõ hơn halo đều. Các gói đã duyệt được giữ nguyên.

V4 có12nguồn ImageGen built-in, mỗi nguồn sáu frame thật. Một palette FX riêng mỗi họ pháp bảo phối với các màu trang bị đã ghim; chưa tạo một bộ FX màu mới cho mỗi tổ hợp. Không hue-filter áo, người hoặc trang bị. Body/gear vẫn là neutral, nhịp3600ms là fixture review; chưa sản xuất animation cầm/phất/điều khiển của nhân vật hoặc tích hợp game.
