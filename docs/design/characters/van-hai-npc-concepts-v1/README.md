# Vân Hải · NPC concept 01

13/10/2026 · Đợt A · **Ứng viên tạo hình, chờ owner duyệt ART.**

Bốn NPC trục chương theo `docs/design/world/van-hai-living-world-v1/plan.json`: Trần Duy — tiếp dẫn; Diệp Tĩnh — vận khí; Tạ Kiếm Sơn — luyện thuật; Tô Nhược — Tư Vật Các. Mỗi người hiện được sản xuất một neutral hướng Đông Nam. Đây là identity master tĩnh, không phải clip idle hoặc bộ animation tám hướng.

**Cần chỉnh tỷ lệ trước sản xuất tiếp:** native hiện cùng chiều cao 80px nhưng NPC mảnh hơn Pixel02 và đầu/tóc nhỏ hơn rõ. Box đầu/tóc → cằm chiếm khoảng 33,6% (Trần), 34,6% (Diệp), 27,6% (Tạ), 32,2% (Tô), so box tham chiếu Pixel02 khoảng 51,3%. Đây là phép đo hỗ trợ review, không chuẩn giải phẫu chính xác. Tạ lệch rõ nhất; Diệp có tóc bạc nhưng mặt còn trẻ so brief nữ lớn tuổi. Gói này phù hợp xem nhận diện/áo/đạo cụ, chưa đạt đồng bộ anatomy để sản xuất bảy hướng và action.

| NPC | Nguồn thực | Chân nguồn đo từ giày trụ |
| --- | --- | --- |
| Trần Duy | 1024 × 1536 | (421, 1411) |
| Diệp Tĩnh | 1024 × 1536 | (438, 1421) |
| Tạ Kiếm Sơn | 1024 × 1536 | (372, 1412) |
| Tô Nhược | 1143 × 1376 | (458, 1294) |

Nguồn Tô Nhược khác kích thước request. Cả bốn có alpha thật; magenta key được tắt, chỉ phân loại alpha body tại 210. Không chỉnh rộng thân/phóng đầu riêng để che sai khác.

## Xem hình

Mở `index.html` qua HTTP server của workspace. Trang có bốn thẻ 2×, so Vương Lâm Pixel02 nguyên byte với từng NPC ở 1×/2× trên map Vân Ngọc V2 và nền sáng/tối, công tắc điểm chân, silhouette, bóng xem thử riêng. Màn hẹp cuộn ngang sân để giữ native scale. Bóng này không xuất vào sprite; vị trí xem hình không ghi vào owner map hoặc station runtime.

`review/lineup-2x.png` đối chiếu cùng mặt đất. `review/<slug>-source-guide.png` giữ lưới tọa độ nguồn cùng mốc thủ công: bounds cam, vùng chân đỏ, đầu/tóc tím, đỉnh body xanh. `registration.json` pin hash nguồn/frame/prompt và mốc đo. Hình native cần được owner xem cùng ảnh nguồn; kỹ thuật qua không suy duyệt anatomy.

## Contract và giới hạn

- Người 80px, native canvas 64 × 96 / chân (32,88). Tạ Kiếm Sơn dùng padding 112 × 96 / chân (56,88) để giữ mộc kiếm; body scale không đổi.
- Nguồn có alpha thật. Tool chỉ bật magenta key nếu nguồn hoàn toàn opaque; bốn nguồn hiện hành đều dùng alpha tại ngưỡng 210, giữ RGB/source nguyên; không paint pixel, không dùng largest-component để bỏ chi tiết đạo cụ rời.
- Đo source foot từ chân trụ/đế giày thấy được, có support witness. Scale một lần bằng nearest từ khoảng đỉnh tóc → ground của neutral; không lấy tâm bbox toàn người/đạo cụ làm chân. Pixel đầu/tóc cũng có box đo để xem tỷ lệ với basis, không chỉ dựa chiều cao 80.
- Body và đạo cụ cầm là concept chung; chưa có prop rời hoặc socket được sản xuất. Chưa có shadow/FX trong frame xuất. Chưa có bảy hướng còn lại, idle/talk/gesture, walk/gait, portrait, atlas hay binding Core.
- Chưa thay bốn NPC runtime hoặc mở quest/receipt/reward; map, navigation, chín blocker, DB, draft và nguồn player chuẩn giữ nguyên.

## Đóng gói có mốc đo

```powershell
python docs/design/characters/van-hai-npc-concepts-v1/pack.py --inspect
python docs/design/characters/van-hai-npc-concepts-v1/pack.py
node docs/design/characters/van-hai-npc-concepts-v1/review/verify.mjs
```

`--inspect` tạo guide và thống kê trong `review/` từ raw hiện có. Trước pack phải xem raw, ghi `review/source-measurements.json` gồm mỗi actor: `id`, `sourceSha256`, `visuallyReviewed: true`, `sourcePivot: [x,y]`, `sourceSupportWitness: [x0,y0,x1,y1]`, `bodyTopY`, `headBounds: [x0,y0,x1,y1]`, `rootBasis`, `notes`. Tọa độ dùng pixel nguồn; ground là biên ngay sau pixel sole cuối. Bbox và head box dùng biên exclusive.

Pack chỉ ghi `sprites/`, `review/`, `registration.json` và metadata native/hash trong `production.json` của root mới; raw, prompt và source tham chiếu chỉ đọc. Thiếu hoặc đổi hash nguồn thì pack dừng, không suy mốc chân thay thế. Canvas không đủ chỗ thì báo để điều chỉnh padding đã chọn, không thu nhỏ riêng anatomy.

## Tiếp nối sau xem hình

Chốt palette, tuổi, tóc, phục trang, đạo cụ và tỷ lệ đầu/thân. Sau đó sản xuất bảy view thật, rồi idle/talk/cử chỉ theo nghề trên cùng neutral scale. Đo chân lại theo chuyển động; tách prop/socket/FX khi sản xuất. Tích hợp runtime và duyệt ART là các bước riêng.
