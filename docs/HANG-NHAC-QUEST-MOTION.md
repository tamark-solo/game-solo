# Hằng Nhạc — animation cho luồng nhiệm vụ

**10/10/2026 · runtime 0.12.0.** Sau khi chốt sửa UI, owner yêu cầu kiểm nhiệm vụ và thêm sprite animation còn thiếu. [Gói ART](design/characters/quest-motion-v1/README.md) bổ sung 21 clip / 84 frame cho bộ ba đang chơi; đây là ART mới chờ owner đánh giá chuyển động, tách khỏi kết quả kỹ thuật.

**Tiếp nối hiệu ứng:** owner xác nhận animation đã hoạt động và yêu cầu tăng cảm giác tu tiên. [Khí quang nhiệm vụ](design/vfx/quest-qi-v1/README.md) bổ sung 4 clip / 16 frame: trận pháp dưới chân, khí lưu quanh thân, hồi phục ánh sen và vệt chưởng ngắn. FX đọc pose/sự kiện server hiện hành; không thêm damage, range, tài nguyên hoặc quyền thuật. Đây là lớp ART mới để xem trong game, không tự nâng approval từ test.

Xem trong game `/hang-nhac.html` hoặc [trang animation riêng](http://127.0.0.1:5173/assets/quest-motion/index.html) để dừng/từng frame, đổi nền sáng/tối và xem 1×/2×. Trang riêng chỉ đọc ART, không kết nối backend hoặc ghi hồ sơ.

## Đã rà soát và ghép

| Bước | Trước | Sau |
| --- | --- | --- |
| HN01 / NPC | Đứng mặc định khi chào/nhận hướng dẫn | Cử chỉ chắp tay sau `talk`/`accept_intro` được chấp nhận |
| HN02, ba nhịp Hít/Dẫn/Thu | Chỉ timer/checklist | Loop vận khí đứng trong nhịp hợp lệ; Tư Đồ Nam ổn định linh thể |
| Thổ nạp / hồi phục nền | Chỉ trạng thái và tích lũy | Loop khi đứng yên và server cho tích lũy; đi/cast/dừng/gate/mất kết nối trả về trạng thái phù hợp |
| HN03, F/0 MP | Trừ HP target và ghi credit, không pose | Chưởng thường đủ Nam/Tây/Đông/Bắc từ vị trí target server, 400 ms; không đổi timing damage hoặc khóa di chuyển |
| Vật tư hồi phục | HP/cooldown đổi | Cử chỉ dùng vật tư sau transaction thành công, 800 ms; Tư Đồ Nam có động tác hồi phục linh thể riêng |
| Kiếm/Lôi và Phong/né đi bộ | Đã có cast/FX hoặc locomotion | Giữ bộ hiện hành; quest pose không đè lên R01 |

Các cử chỉ chào/hồi phục phát ở nhân vật trên map, có thể diễn ra phía sau dialog đang mở; không thêm portrait động hoặc thay thao tác đóng dialog. Không tạo pose bị đánh cho bài né an toàn vì bài này không gây damage/HP loss. HN05/ngoại vi chưa triển khai, không thêm animation giả để báo đã có combat farm.

## Phân lớp và lifecycle

- `shared/quest-motion.ts`: hợp đồng cosmetic event, điều kiện loop và timeline thuần theo tuổi tuyệt đối; không command/damage/credit/save.
- `server/src/HangNhacRoom.ts`: phát `sect:animation` sau lệnh thành công; đòn thường và hồi phục chỉ sau commit. Đường duplicate receipt quay về trước đoạn phát event; save thất bại/lệnh bị từ chối không phát pose. Không đổi receipt key, schema, thưởng hoặc timing đòn đánh.
- Loop server chỉ phát khi thay trạng thái. Người vào/reconnect nhận loop còn hoạt động qua `sect:sync`; không phát lại one-shot cũ. Drop/leave xóa loop, server restart không khôi phục cử chỉ đã hết.
- Event broadcast chỉ có actor, loại động tác, hướng và thời điểm; tiến độ nhiệm vụ/private `SectView` vẫn riêng cho hồ sơ.
- `client/src/quest-motion-presentation.ts`: atlas → `ActorSpriteFrame`, mask alpha riêng từng frame, diagnostics `window.__hangNhacQuestMotion()`. Body R01 được ưu tiên, sau đó quest pose, rồi locomotion. Di chuyển hủy chào/hồi phục và không hiện loop vận khí; hoạt động tích lũy khi đi vẫn theo luật server cũ.
- `client/src/quest-qi-presentation.ts`: sprite FX theo pose/frame/hướng đã được xác nhận; trận pháp dưới chân, khí lưu gần body, recovery/palm bám depth của nhân vật. Vật che phía trước tiếp tục che FX. Hidden/offline dọn hiệu ứng; reduced motion giữ vòng tĩnh, không khí xoáy. Diagnostics có `qi` để xem clip/frame/position/opacity/order.
- Renderer dùng cùng pipeline geometry/UV/occlusion/điểm chân, chỉ thêm nguồn pose `quest` cho debug. Không đổi camera, blocker/layer map, collision hoặc atlas đứng/đi native.

Động tác riêng là canvas 96 × 96/neo (48,88), không phóng canvas thành cỡ người. Locomotion giữ 64 × 96/neo (32,88); kỹ năng vẫn dùng binding/crop đã bàn giao. Mất kết nối/đổi hồ sơ/room và pagehide dọn timeline; không replay lệnh để tạo animation.

## Kiểm chứng

`test:hang-nhac-quest-motion` dùng backend online 2625 và browser 2624/Vite 5224, cache và SQLite fixture riêng. Kiểm event với peer, lệnh từ chối/duplicate không phát animation, loop join/move/leave; kiểm ba nhân vật qua HN01, nhịp HN02, F/0 MP, hồi phục và reload. Render đủ 84 frame body + 16 frame FX qua Three adapter để so alpha/RGB/pivot với canonical PNG; kiểm depth, hidden và reduced motion. [Bản ghi tổng hợp](data/hang-nhac-quest-motion-verification.json) ghi kết quả thực tế và các hồi quy đã chạy.

Hồi quy 36 cast dùng `SKILL_GPU_NATIVE=1` trên máy này: SwiftShader ở scene đầy đủ chỉ cho vài frame/giây, không đủ cửa sổ lấy ảnh sau release của cast <710 ms. Không thay gameplay, thời lượng, native/camera hoặc điều kiện đối chiếu pixel để làm test qua. GPU parity body/FX riêng vẫn chạy với SwiftShader ở fixture nhỏ.

Khi sửa presentation chạy unit/typecheck/build, `test:hang-nhac-quest-motion`, `test:skill-body`, `test:skill-vfx` và hồi quy 36 cast. Khi sửa phát sự kiện/lifecycle chạy lessons/R01/sect/reload và HUD/layer bằng fixture. Không seed/reset SQLite thật, không ghi authored map/draft owner.
