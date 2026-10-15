# Sprite animation nhiệm vụ Hằng Nhạc — bản 01

**10/10/2026.** Chủ dự án yêu cầu kiểm luồng nhiệm vụ và bổ sung sprite animation còn thiếu. Dùng built-in ImageGen theo skill `imagegen`; các nguồn/câu lệnh, frame canonical, atlas, hash và metadata giữ tại thư mục này. ART mới là bản ghép để xem chuyển động; `ownerApproved`/`artApproved` giữ false cho đến phản hồi hình của owner.

[Xem animation](index.html) · [contact sheet native 2×](native-contact-sheet.png) · [catalog/source/QA](clips.json) · [hồ sơ UI hiện hành](../../../HANG-NHAC-DAO-AN-V3.md). Gói sprite này là hồ sơ ART/presentation lịch sử; không mở quyền runtime VG.

## Kiểm luồng và đầu ra

| Luồng hiện hành | Thiếu trước sửa | Bổ sung cho mỗi nhân vật |
| --- | --- | --- |
| HN01 / nói chuyện NPC | Chỉ đứng và mở dialog | Chắp tay/chào, 4 frame hướng trước |
| HN02 / hoạt động tích lũy | Chỉ bộ đứng/đi dù đang vận khí | Vận khí đứng, 4 frame loop; Tư Đồ Nam ổn định linh thể |
| HN03 / F | Hit và credit có thật, không có pose đánh | Đòn chưởng thường, 4 hướng × 4 frame |
| Dùng vật tư | HP đổi nhưng không có cử chỉ | Hồi phục, 4 frame; linh thể dùng cử chỉ ổn định sự hiện diện |
| HN03 Kiếm/Lôi, HN04 Phong/đi bộ | Đã có core cast / locomotion | Giữ nguyên các chuỗi hiện hành |

Tổng ba nhân vật: **21 clip / 84 frame**. Không thêm công pháp, luyện đan, chân dung NPC, quái/loot hoặc nội dung HN05.

## Nguồn được chọn

- `wang-source-v1.png` + `wang.prompt.txt`: đủ bảy nhóm động tác Vương Lâm.
- `li-source-v1.png` + `li.prompt.txt`: đủ bảy nhóm Lý Mộ Uyển, lavender native-v5.
- `situ-source-v2.png` + `situ-correction.prompt.txt`: chọn Nam/Đông/Bắc và chào. Bản `situ-source-v1.png`/`situ.prompt.txt` giữ lịch sử; bản đầu có hướng Tây sai.
- `situ-west-source-v3.png` + `situ-west.prompt.txt`: vẽ riêng bốn frame Tây để sửa hướng chưởng, không mirror bitmap.
- `situ-loops-source-v3.png` + `situ-loops.prompt.txt`: vẽ lại vận khí/hồi phục để có khoảng alpha giữa hàng. Hai hàng cuối của v2 dính mép silhouette, không dùng trong runtime.

Tham chiếu đầu vào là bốn hướng native đã trích ở `../core-cast-v1/references/` cho từng người. Tỷ lệ đối chiếu: locomotion **64 × 96**, chân **(32,88)**, camera **1×**. Sprite động tác dùng canvas **96 × 96**, neo **(48,88)**, thân tối đa khoảng 80 px; Tư Đồ Nam giữ điểm chiếu cách đáy hình 4 px. Không thay atlas locomotion hoặc core cast gốc.

## Xuất và kiểm hình

`node scripts/build-quest-motion-assets.mjs` tìm silhouette alpha theo connected component, không chia đều sheet rồi lấy lẫn mảnh hàng bên cạnh. Đo điểm chân từ phần đáy silhouette, dùng một scale đồng đều cho cả bốn frame của từng clip, có padding và kiểm bounds trước đóng atlas. Không kéo giãn từng pose, tô/warp/đảo hướng bằng code. Alpha nguồn giữ nguyên, nearest resize, WebP lossless và padding atlas 2 px. Ảnh native cần tiếp tục xem nối đầu/cuối, nhận diện và hướng ở 1×.

Builder là bước xuất lại có chủ ý; build/dev thường chỉ chạy `scripts/sync-quest-motion.mjs` để copy sản phẩm đã lưu. Không cần ImageGen/Sharp trong build thông thường. `clips.json` ghi source/hash/rect/scale/điểm chân, atlas và SHA từng canonical frame. Source thử không bị ghi đè hoặc xóa.
