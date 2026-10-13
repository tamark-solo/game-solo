# Hắc Ấn Chấp Sự · Solo Motion01

Bộ tiếp theo sau Lang Vương, dùng [neutral03 đã duyệt](../van-hai-dark-seal-officer-v3/approval.json) làm basis. Đã sản xuất **72 clip / 432 pose action / tám hướng**, **sáu sequence VFX / 36 frame** riêng. Xem [sân solo cạnh Vương Lâm](index.html), [kit fixture](kit.json), [registration](source-registration.json) và [lưu ý ghép gameplay](INTEGRATION-NOTES.md).

Neutral03 được duyệt một hướng Đông Nam. Các view, action, socket và VFX mới trong gói này **chờ owner duyệt hình**; kiểm kỹ thuật không mở rộng approval. Chưa nối AI/server, HP, sát thương, loot, map hoặc catalog phát hành.

| Nhóm | Nội dung |
| --- | --- |
| Body · mỗi action tám hướng, sáu pose | idle, move, attack, hit, death, appear, dao_an, phan_phu, an_hoi |
| VFX · mỗi sequence sáu frame | tụ ấn, Đạo Ấn, contact, tan dư ảnh, Ấn Hồi, xuất hiện |
| Dư ảnh Phân Phù | Hai bản trình bày mờ, đọc pose ở tuổi trễ; không entity, hit, loot hoặc cảnh báo riêng |

## Giữ tỷ lệ và điểm chân

Body đứng danh nghĩa80px, cùng họ pixel-chibi với Vương Lâm. Canvas chung160×112, chân(80,104) chỉ thêm padding quanh hợp đồng người64×96/(32,88). Không tăng collider, scale camera hoặc normalize thân ngã về chiều cao đứng.

Mỗi nguồn có sáu neutral calibration. Scale chung lấy từ median chiều cao neutral, dùng cho mọi pose trong nguồn; không mirror, vẽ lại RGB hoặc fit từng pose. Root ngang đo theo dải8% boot phía dưới neutral, action dùng root cột đã đo. Support plane và contact thân nằm đăng ký riêng; bóng/depth dùng world foot. Ma trận anatomy cạnh neutral03 và Player02 kiểm mở đầu–phát–hồi, tránh chỉ kiểm bbox80px mà bỏ qua đầu/thân.

24 nguồn body đang chọn, 144 neutral calibration không tính vào432 pose. Lịch sử có29 lần tạo body, gồm5 nguồn superseded giữ riêng; sáu nguồn FX riêng. Các lần sửa gồm hướng Tây Nam, run Nam/Đông Nam bị thiếu trong sheet, death Bắc, scale Ấn Hồi/Chưởng Ấn và gutter bàn tay chạm pose kế bên. [History](generation/history.json) pin raw/prompt/input/hash, không dùng nguồn lỗi làm fallback. PNG nguồn gốc và prompt giữ nguyên.

[Catalog](catalog.json) trỏ clip/canonical/atlas và nguồn thực sự đang dùng; nguồn cũ trong cùng sheet vẫn được giữ cho provenance. Atlas có gutter2px. 192 socket skin đo từ PNG đã đăng ký là **presentation candidate**, chưa chứng minh đúng grip/hand ở mọi pose hoặc bind live.

## Bộ chiêu xem thử

| Chiêu | Dấu hiệu và đường né |
| --- | --- |
| Chưởng Ấn | Rút tay → chưởng ngắn theo cung trước → hồi tay; né ngang khỏi cung |
| Đạo Ấn | Kết ấn → khóa trục → phát mũi ấn và hồi thế; né ngang khỏi hành lang |
| Phân Phù | Hai dư ảnh mờ tách hai bên, thân thật giữ màu đầy đủ và nhãn; chỉ thân thật có cảnh báo và contact |
| Ấn Hồi | Vòng thu dưới chân, tâm rỗng; fixture có khe90° phía sau hướng đã khóa, hoặc chạy ra ngoài vòng |

Nhịp hiện tại dùng để xem hình, chưa là cân bằng gameplay. Mỗi đòn tách warning/lock/release/resolve/recovery; đường né fixture xét normal80px/s, footprint8px, phản ứng250ms và trễ120ms. Không yêu cầu Shift/Phong để né.

Core đọc tuổi tuyệt đối24FPS. Charge theo socket pose hiện tại; origin release giữ socket lúc phát, hướng đã khóa không bám vị trí né tương lai. Contact chỉ theo fact trúng của fixture, hụt không có impact; hủy trước phát không có release/contact/dư ảnh. VFX có tuổi và tail riêng, không khởi động lại khi body giữ frame cuối. Receipt mẫu chống lặp tách khỏi callback frame.

VFX giữ RGBA mềm và chi tiết rời, một scale theo peak core/sequence; không threshold body lên FX. Ấn Hồi dùng một phép chiếu ground cố định từ tỷ lệ core nguồn cho cả sequence, không fit từng frame. Hình vòng/khe vẫn cần duyệt cùng đường báo, không lấy pixel glow làm collider.

## Xem và kiểm scoped

Sân có tám hướng, Trúng/Hụt/Hủy, seek ms, native1×/nearest2×, map/sáng/tối và bật/tắt FX/dư ảnh/bóng/neo/socket/neutral. Bộ quái, Player323 file, Lang Vương đã duyệt và map Vân Ngọc giữ hash. Chỉ review đọc, không backend/DB/storage write hoặc owner map builder.

```powershell
node scripts/analyze-dark-seal-officer-animation-v1.mjs
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-dark-seal-officer-animation-v1.py
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/pack-dark-seal-officer-fx-v1.py
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/measure-dark-seal-officer-sockets-v1.py
node scripts/finalize-dark-seal-officer-delivery-v1.mjs
& 'C:/Users/Mark-TA/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/verify-dark-seal-officer-animation-v1.py
npm.cmd run test:dark-seal-officer-animation
npm.cmd run typecheck
```

Pack lại body/FX phải đo socket/projection sau cùng rồi verify; không gọi scripts production lịch sử của Player/map. [Biên bản13/10](../../../data/dark-seal-officer-animation-2026-10-13.json) lưu phạm vi kiểm. Cache16MiB chỉ là decoded actor/FX của review, loại map/browser/GPU tổng; không phải benchmark MMO. Các script ghi root sẽ khóa khi có approval; sửa ART đã duyệt phải làm version mới.
