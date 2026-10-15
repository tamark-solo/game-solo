# Khí quang nhiệm vụ — bản 01

**10/10/2026.** Sau khi xác nhận animation đã hoạt động, owner muốn thêm hiệu ứng vì phần tu luyện còn nhàm chán và thiếu cảm giác tu tiên. Built-in ImageGen sinh [sheet nguồn](source-v1.png) theo [prompt](source-v1.prompt.txt), tham chiếu palette/khí của `../frame-by-frame-r01/atlases/sword-charge.png`. Nguồn R01 giữ nguyên. ART mới chờ owner xem bản ghép, không suy duyệt từ pixel test.

## Bộ hiệu ứng

| Clip | Vai trò | Nhịp / mốc đặt |
| --- | --- | --- |
| `formation` | Trận pháp ngọc/đồng dưới chân, tâm rỗng | 4 frame loop, neo (64,73), dưới body/props |
| `rising-qi` | Khí jade/gold dẫn từ chân quanh thân, ánh hạt nhỏ | 4 frame loop, neo (64,103), bám cùng depth với body và nằm dưới vật che trước mặt |
| `recovery-bloom` | Khí hồi phục và hoa sen ánh vàng/ngọc | 4 frame, theo cử chỉ hồi phục 800 ms, quanh phần thân thấp |
| `palm-accent` | Vệt chưởng ngắn và điểm lóe, tan ngay sau đánh | 4 frame, 400 ms, quay theo hướng hit đã xác nhận; không projectile/damage mới |

Tổng **4 clip / 16 frame**, canvas **128 × 128** cho FX. Body vẫn 96 × 96, locomotion 64 × 96; camera và kích thước nhân vật không đổi. Hiệu ứng không được coi là tầm đánh/collider, phần thưởng hoặc một công pháp mới.

## Sản xuất / runtime

`node scripts/build-quest-qi-assets.mjs` trích bốn nhóm theo vùng hàng `[0,250,560,800,1024]` của source 1536 × 1024 để không cắt đáy khí ở hàng thứ hai. Các cell dùng scale đồng đều 1/3, giữ tỷ lệ; frame có alpha và padding atlas 2 px, WebP lossless. `clips.json` lưu source/prompt/hash/crop/anchor/rect và đường frame canonical. Build thường chỉ copy qua `scripts/sync-quest-qi.mjs`, không chạy ImageGen/Sharp.

`client/src/quest-qi-presentation.ts` chỉ đọc pose đã xác nhận, dùng cùng index động tác cho nhịp FX. Vận khí/thổ nạp hợp lệ có trận pháp + khí lưu; đi/cast/dừng/gate/offline kết thúc theo pose. Hidden dọn FX; reduced motion giữ trận pháp tĩnh và bỏ khí xoáy, one-shot dùng frame tĩnh. Không có lệnh từ FX tới gameplay hoặc ghi save. Renderer chỉ căn depth attachment theo body, không sửa authored map/layer/camera.

[Bàn giao toàn luồng](../../characters/quest-motion-v1/README.md) · [kiểm chứng](../../../data/hang-nhac-quest-motion-verification.json). Test riêng so đủ 16 frame FX qua GPU với canonical alpha/RGB/pivot, đồng thời kiểm bám nhân vật, tắt khi di chuyển/hidden và reduced motion.
