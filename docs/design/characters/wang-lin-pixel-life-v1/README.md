# Vương Lâm · thổ nạp và thu thập 01

Sản xuất 13/10/2026 từ tám master Pixel02 đã chọn, bằng **built-in ImageGen**. [Ma trận native](native-life-matrix.png) đặt master → neutral nguồn mới → thổ nạp → thu thập cạnh nhau. Mới là ART ứng viên đã được yêu cầu đưa vào chơi thử; không mở rộng approval 40 clip trước đó.

- 16 clip / 96 pose, hai action × tám góc thật; không mirror.
- Canvas 112 × 96, chân (56,88). Canvas rộng chỉ chứa tay/tóc, không tăng người hoặc collider.
- Mỗi nguồn có neutral6 để đo một scale chung, áp cho cả ngồi/cúi; không fit bbox từng pose. Ngồi dùng tiếp xúc xương chậu/chân gập; thu thập giữ đế chân.
- Palette từ Pixel02, nearest, alpha128 cho body; VFX khí tức vẫn là lớp riêng.
- Thổ nạp là loop 2 giây; thu thập là one-shot 1 giây. Các thời lượng chỉ trình bày, không sinh tích lũy, vật phẩm hoặc proof.

[Nguồn/prompt](sources/), [input master](inputs/), [plan](production-plan.json) và [catalog/registration](catalog.json) lưu cùng gói. Tám nguồn kích thước thực khác nhau; trích theo alpha component đã kiểm, không chia đều ảnh theo kích thước yêu cầu. `pixelsResampled:true`; đây không phải API PixelLab hoặc skeleton.

Runtime đọc loop thổ nạp của server và fact thu thập sau commit EX01/EX02. Đi/cast/đòn thường có ưu tiên riêng; đi tiếp thật sự hủy gesture thu thập. Không ghi reward theo callback animation. [Bàn giao runtime](../../../GAME-ACTOR-RUNTIME.md).

Kiểm: `node scripts/verify-game-actor-actions.mjs` và `node tests/smoke/game-actor-actions-gpu.mjs`. Builder chỉ gói này: `node scripts/build-wang-pixel-life.mjs`; chuẩn bị phiên bản mới trước khi tạo source khác. Không ghi owner map hoặc DB để kiểm.
