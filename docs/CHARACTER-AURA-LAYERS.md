# Khí tức nhân vật · tách khỏi bộ sprite hướng/động tác

**12/10/2026 · quy ước sản xuất và bản thử presentation.** Owner phản hồi Sinh Tử chìm, khí Hóa Thần chưa sống động; hỏi có nên tách VFX khi làm animation tám hướng. **Có: khí tức là một bộ appearance FX độc lập**, không vẽ vào từng frame đứng/đi/cast. [ART/motion 02](design/characters/wang-lin-hoa-than-review-v2/README.md) đang thử cách ghép này trên đúng Vương Lâm native-v2.

**Nhịp review 03:** [Tụ khí → bộc phát → lắng](CHARACTER-AURA-EXPERIENCE-V3.md) đã thêm tương tác giữ/thả trên map, timeline Core, ellipse trơn và hạt tách front/back. Dùng nguyên texture 02; CSS loop 02 là lịch sử. Chờ đánh giá trải nghiệm, không skill/gameplay mới.

## Ghép theo chân và quan hệ trước/sau

| Thứ tự | Lớp | Canvas/pivot hiện tại | Vai trò |
| --- | --- | --- | --- |
| 0 | Ground | 96 × 32 / (48,16) | Vòng khí dưới chân, không quay méo ellipse theo hướng nhìn nhân vật |
| 1 | Rear qi | 96 × 128 / (48,112) | Luồng khí cuộn phía sau; hai bản texture lệch pha để có dòng lên liên tục |
| 2 | Body/costume | 64 × 96 / (32,88) | Người đứng/đi theo hướng; tuyệt đối không scale người theo canvas FX |
| 3 | Front qi | 96 × 64 / (48,48) | Sương/tàn khí thấp trước chân, không phủ mặt |
| 4 | Motes | Texture 8 × 8 / (4,4), quỹ đạo quanh chân | Ba hạt sáng/huyết sắc trên ellipse; có thể tách front/back quỹ đạo khi vào renderer production |

Tất cả vị trí lấy cùng **world foot**. `topLeftFX = projectedFoot - fxPivot × cameraZoom`; khi ghép trong frame người: `localOffset = bodyPivot - fxPivot`. Với pose đứng hiện tại, ground (-16,72), rear (-16,-24), front (-16,40). Gallery và map đọc cùng contract Core; không crop theo bounds rồi lấy tâm làm chân. Bounds alpha từng layer được đo trong manifest.

Ground ellipse giữ mặt phẳng/góc nhìn của camera. Nhân vật quay mặt không làm vòng chân quay trong mặt phẳng màn hình. Các FX cùng actor cần nằm trong nhóm depth của actor, theo thứ tự cục bộ; không đưa lớp trước lên overlay luôn đè mọi NPC/mái/tán. Khi vào Three runtime phải kiểm occlusion/mái-tán với chính renderer, chưa suy từ DOM review.

## Khi làm tám hướng

Sprite người/costume vẫn cần đủ từng **hướng × hành động**, đúng khung/neo và nhận diện hiện hành. Không lật một pose bất đối xứng để giả đủ tám hướng, không áp mask 471 pixel của pose Nam sang các pose khác.

Khí Hóa Thần quanh thân/chân thuộc loại **camera-facing, omnidirectional**: một bộ dùng cho tám hướng và nhiều áo. Timeline khí chạy độc lập timeline người; đổi hướng/đổi frame đi không reset vòng khí. Chỉ cần skin/theme tương ứng Tu Đạo hoặc Đọa Ma, intensity/quality và phase của effect instance.

Hiệu ứng **có hướng hoặc socket** là loại khác: kiếm khí/chưởng/vệt lướt lấy vector hướng hoặc `direction × pose` socket tay/kiếm. Phải có binding/ART phù hợp; không dùng aura vô hướng để thay hợp đồng skill. Giữ toàn bộ contract R01 hiện hành theo [Skill Core](SKILL-CORE.md).

Metadata production nên có `fxSetId`, layer, texture/clip, canvas/pivot, attachment (`ground`/`body`/socket), hướng (`omnidirectional`/vector/binding), loop/hold, blend/opacity và chính sách stop. `fxSetId` chưa được thêm vào schema gameplay/save ở bản thử này.

## Core và runtime sau này

Backend xác nhận cảnh giới/trạng thái đạo/quyền diện mạo. Presentation đọc facts đã xác nhận để chọn fxSet; không đổi sức mạnh, chuyển đạo hoặc dự đoán đột phá từ một animation. Theo [kiến trúc Core](ARCHITECTURE.md) và Skill Core: gameplay facts → appearance presentation → asset catalog → renderer adapter. Lưu nhân vật không lưu frame CSS, texture hay alpha.

Timeline production dùng tuổi tuyệt đối của effect instance (đồng hồ đã đồng bộ), không cộng frame theo render hoặc reset mỗi lần update snapshot. Theme change/lifecycle actor cần thay instance có kiểm soát. Đường đi nhận từ gameplay; FX chỉ bám vị trí đã hiển thị. Khi cast dùng pivot/socket của pose hiện tại, thay vì giả mọi pose luôn là 64 × 96.

Ở đông người, player/target gần dùng đầy đủ lớp; người xa giảm rear/front/mote hoặc ground-only. Pool/culling/atlas/giới hạn số instance cần đo trong runtime thật. Không tạo một bộ tám hướng FX vô hướng cho mỗi bộ áo hoặc mỗi nhân vật.

## Bản thử đang có / giới hạn

- `core/character-qi-review.ts`: catalog hai theme và hình học layer chung.
- `ui/character-qi-layers.ts/.css`: texture riêng và nhịp pulse/flow/drift/orbit, không vẽ khí bằng placeholder.
- `features/character-qi-review.ts`: bật/tắt, static/reduced motion, pause hidden/offline/offscreen, cleanup; không transport hoặc gameplay.
- Gallery/map cùng điều khiển **Khí tức Hóa Thần** và **Chuyển động khí**; mặc định bật để xem đợt sửa này.

Review dùng **texture ART riêng + chuyển động presentation**, chưa atlas animation vẽ từng frame, chưa tám hướng người, animation áo hoặc tích hợp Three/network. PNG người khóa như cũ; VFX không được bake vào sprite. Bản thử hình/chuyển động chờ owner đánh giá riêng với kiểm kỹ thuật. Sau khi chốt hình mới làm bộ animation người và adapter runtime theo phạm vi được yêu cầu.
