# Chuẩn chibi trên map — năm nhân vật

**Phiên bản:** 0.2, ngày 07/10/2026. **Runtime:** 0.5.1. Vương Lâm chibi làm chuẩn theo phản hồi tích cực. Lý Mộ Uyển native-v5 đã được người phát triển chấp nhận làm chuẩn bản thử: “tôi thấy ổn rồi đó.” Hai đệ tử và Tư Đồ Nam chibi mới còn chờ đánh giá.

## Chuẩn dùng chung

- Đầu lớn/thân gọn khoảng 2,5–3 đầu, pixel clusters cùng Vương Lâm; camera top-down ba phần tư.
- Frame 64 × 96, điểm đặt (32, 88), atlas 320 × 384. Bốn hướng × một đứng và bốn chuyển động = 20 frame/người.
- Palette riêng 24 mục gồm trong suốt: đệ tử đai xanh, Lý Mộ Uyển áo lavender và tóc trung tính, linh thể xanh mực.
- Đi: tiếp đất A → đi qua B → tiếp đất B → đi qua A; tay gần hông/ngược chân, hai pha đi qua đổi chân trụ.
- Lướt: chân Tư Đồ Nam giữ duỗi, áo gợn nhẹ, đáy cách điểm chiếu 4 px và ngực có lỗ trong suốt.

Vương Lâm là NPC trọng tâm; hai đệ tử là avatar. Chuyển tỷ lệ sprite không đổi số nhân vật hoặc mốc truyện. Tư Đồ Nam đứng/lướt là chuyển thể cho game, dạng ngồi giữ riêng. Lý Mộ Uyển native-v5 được chấp nhận làm chuẩn bản thử; chân dung UI cần đồng bộ với mặt, tóc và trang phục mới.

## Dữ liệu và preview

[Manifest](design/characters/chibi-roster-v1/models.json) và [config client](data/client-tech-preview-design.json) chọn nguồn/atlas. Năm bộ chibi có 100 frame: bộ ba 60, avatar 40. Catalog thêm 36 frame Vương Lâm trước để đối chiếu, thành 136; không cộng bản lịch sử lần nữa.

Engine dùng trạng thái chuyển động chung `walk_*`; `movementKind: glide` chỉ rõ clip linh thể và UI ghi **Lướt**. Đứng là một hình mỗi hướng, chưa phải vòng thở/lơ lửng tại chỗ. [Kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) ghi phần cần vẽ tiếp.

[Preview](http://127.0.0.1:5173/) xem animation/di chuyển; [gallery](http://127.0.0.1:5173/assets/chibi-roster/index.html) đặt năm người cạnh nhau trên nền sáng/tối. Sân online dùng hai avatar mới, giữ cùng ID và luật server. Tư Đồ Nam/Lý Mộ Uyển xuất hiện trong map thử để duyệt ART, không mở NPC trong nội dung A.

## Duyệt hình

Xem ở 1× và khi đi: tỷ lệ cạnh Vương Lâm; tóc/mặt/trang phục phân biệt; chân trụ, tay đối nhịp, nối cuối → đầu; dừng đúng hướng. Linh thể giữ mặt rõ, khoảng khuyết và chân duỗi ở bốn góc. Kiểm tra hash/atlas/frame khác nhau chỉ xác nhận kỹ thuật.

Hình tạo bằng **imagegen tích hợp**; [nguồn và prompt](design/characters/chibi-roster-v1/README.md), [kết quả PNG](design/characters/chibi-roster-v1/verification.json) và [browser](data/preview-verification.json) được lưu riêng với trạng thái duyệt.
