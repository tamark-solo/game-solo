# Core cast v1 — bộ ba, ba thuật, bốn hướng

**09/10/2026 · sản xuất theo yêu cầu owner.** Runtime có **36 clip binding / 300 frame thi triển**: 33 clip mới × 8 frame = 264 frame, cộng ba clip Vương Lâm Đông × 12 frame = 36 frame gốc. Bộ đứng/đi/lướt 60 frame core và catalog locomotion 136 frame giữ riêng, không cộng cast vào metadata native.

[Xem pose ở 1×/3×](index.html) · [Chơi trong Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html) · [Kiến trúc skill](../../../SKILL-CORE.md).

## Nguồn và trạng thái

ImageGen tích hợp vẽ từng pose từ reference native đúng nhân vật/hướng. `references/` là crop nguồn native phóng nearest 6× để đưa vào công cụ; không phải ART mới. `source/` giữ ảnh trả về có alpha, `prompts/` giữ prompt chính xác, `sources.json` chọn 11 sheet hiện hành, `provenance.json` ghi hash và nguồn. Ba sheet đầu cho Lý Mộ Uyển Nam/Tư Đồ Nam Nam/Bắc được giữ làm lịch sử; bản v2 sửa hướng pose/lướt.

Không mirror hướng, đổi màu nhân vật hoặc dùng pose của người khác. Ba clip Vương Lâm Đông ưu tiên nguồn `../../vfx/frame-by-frame-r01`, `r01-thunder-v1`, `r01-wind-v1`, giữ hash gốc. 10 FX đã bàn giao cũng giữ nguyên.

**ART mới đang chờ owner đánh giá hình**, không tự đặt artApproved/ownerApproved từ test. Kiểm kỹ thuật xác nhận alpha, canvas/anchor/rect, số clip/frame, tải và timing. Những điểm cần xem bằng mắt: nhận diện qua pose, nhịp tóc/áo, ổn định đầu/thân và socket tay mới. Nguồn mới dùng đầy đủ màu/alpha ImageGen; chưa ép palette 24 màu/alpha nhị phân như atlas locomotion cũ.

## Xuất và đóng gói

`scripts/build-core-cast-assets.mjs --export` trích sheet 8 cột × 3 hàng, mỗi hàng Kiếm/Lôi/Phong. Một scale chung cho cả sheet, body tối đa 80 px; đăng ký theo chân y88 (Tư Đồ Nam y84 với điểm chiếu y88). Canvas rộng theo extent tay/áo, giữ cao 96 px.

PNG canonical ở `frames/<actor>-<skill>-<direction>/001..008.png`. Metadata `clips.json` ghi nguồn, source rect/origin, scale, registered bounds, hold và socket. `--pack` giữ PNG canonical, đóng atlas WebP lossless có padding 2 px. Đây chỉ là crop/resize/register/pack, không vẽ pose bằng code, không sharpening, recolor hoặc tự xóa nền.

**Sửa vùng tách frame 09/10:** grid 8 × 3 chia đều đã chứa mảnh từ pose hàng/cột bên cạnh trong 108 frame mới. `frameCrops` giới hạn vùng vẽ của từng pose, với 1 px mép alpha; `frameCutouts` xử lý riêng mảnh sát mép crop/ngang hàng với tóc ở 11 frame, kiểm không loại pixel body chính. Trang này và runtime dùng cùng crop/cutout. Bitmap/canvas/điểm chân/scale/timing giữ nguyên. `node scripts/build-core-cast-crops.mjs` tạo metadata và [biên bản](frame-crop-verification.json) sau khi thay frame/trích nguồn; không tự chạy lại `--export` để chữa lỗi này. Cần kiểm vùng crop bằng mắt khi thay ART, nhất là tay/áo tách rời. [Kiểm GPU/game](../../../data/hang-nhac-skill-crop-verification.json).

Các hold tại 24 FPS:

| Thuật | Hold 8 frame mới | Tổng |
| --- | --- | --- |
| Kiếm | 1,1,2,2,2,2,3,3 | 16 tick |
| Lôi | 1,2,2,3,2,2,3,2 | 17 tick |
| Phong | 1,1,1,1,3,3,2,2 | 14 tick |

`sync-skill-assets.mjs` copy asset bằng tên kèm hash và sinh catalog runtime v2, giữ ba binding gốc ưu tiên. Chỉ dọn file output cũ có tên hash thuộc clip do script quản lý; không sửa nguồn ART/map/save. Web tải clip theo avatar xuất hiện.
