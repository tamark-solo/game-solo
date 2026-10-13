# HN04 — dấu báo và trạng thái mẫu

13/10/2026 · Nguồn SVG code-native · **Candidate, chờ owner duyệt hình.**

Năm hình dành cho bản thiết kế HN04 mới: vùng nguy hiểm có hatch và viền kép; điểm nghỉ có vòng đứt/dấu chân; badge mẫu nguyên và hao khí khác cả hình lẫn màu. Bảng màu dùng petrol teal, ngà, celadon và amber, viền tối giữ khả năng đọc trên nền sáng. Không sao chép khung HUD hoặc UI đã duyệt.

| File | ViewBox | Cách đọc |
| --- | --- | --- |
| `warning-circle.svg` | 128 × 128 | Vùng tròn, vạch chéo, viền kép, tam giác cảnh báo |
| `warning-lane.svg` | 192 × 64 | Dải chữ nhật, vạch chéo, mũi tên theo +X |
| `safe-waypoint.svg` | 128 × 128 | Vòng đứt, hai dấu chân, chevron hướng lên trên (−Y trong tọa độ màn hình) |
| `sample-status-intact.svg` | 128 × 128 | Huy hiệu tròn, ngọc đầy, dấu kiểm |
| `sample-status-depleted.svg` | 128 × 128 | Huy hiệu tám cạnh, ngọc rỗng nứt, dấu trừ |

Mở `preview.html` trực tiếp; trang không cần server, storage hoặc mạng. Có nền sáng/tối/có họa tiết, công tắc thang xám và canvas, đổi trạng thái mẫu; hàng cuối so hai badge ở 24/32/48/64 px. Nền có họa tiết là nền QA tự vẽ, không phải ART map.

## Hợp đồng hình học

- Canvas trong suốt; không nhúng ảnh, font, script hoặc animation trong SVG. Không có đồng hồ/timing, damage, collision hoặc trigger.
- `manifest.json` ghi kích thước, SHA-256, điểm đăng ký hình và hình học normalized (0–1). Đăng ký tại tâm vì đây là dấu hình học được vẽ từ tọa độ, **không phải suy pivot chân của đạo cụ**.
- Circle: đường tâm viền tại (64,64), bán kính ART 52; phần hatch nằm trong r52. Chi tiết trang trí bốn hướng vươn tới gần biên canvas. Lane: đường tâm viền từ (10,10) tới (182,54), hướng +X. Chúng không phải vùng resolve mặc định.
- Adapter tương lai phải nhận center/radius/length/width/direction và trạng thái từ gameplay/server, rồi ánh xạ phần viền chính tới hình học đã xác nhận; không lấy `width`/`height` SVG làm collider. Nếu vùng nguy hiểm cần cả chân người ra ngoài, phần nới collider do gameplay sở hữu.
- Không ép tròn thành ellipse để giả góc nhìn. Hình đang theo world top-down. Lane có thể quay quanh tâm; đổi tỉ lệ lớn cần tái dựng stroke/hatch theo kích thước hiển thị để giữ nét đọc được.
- Badge mẫu là trạng thái, không item mới, không vật phẩm túi, không nguồn hồi phục. Mẫu “hao khí” chưa tự có nghĩa thất bại; evaluator sở hữu kết quả.
- SVG có `title/desc`; khi nhúng `<img>`, cung cấp `alt` theo trạng thái hiện hành. Hình hướng dẫn trang trí cạnh chữ có thể dùng `alt=""`. Không chỉ dùng màu để truyền nguy hiểm/an toàn.

## Nhúng vào trang review tổng

Từ thư mục cha, dùng đường dẫn tương đối; các SVG là file độc lập, không cần CSS hoặc ID bên ngoài:
```html
<img src="telegraphs/warning-circle.svg" width="128" height="128" alt="Vùng cảnh báo có vạch chéo">
<img src="telegraphs/warning-lane.svg" width="192" height="64" alt="Luồng nguy hiểm hướng sang phải">
<img src="telegraphs/safe-waypoint.svg" width="128" height="128" alt="Điểm nghỉ">
<img src="telegraphs/sample-status-intact.svg" width="48" height="48" alt="Mẫu còn nguyên khí">
<iframe src="telegraphs/preview.html" title="Kiểm dấu báo trên nhiều nền" style="width:100%;height:900px;border:0"></iframe>
```

Không inline nhiều SVG chung DOM mà giữ nguyên ID `title/desc/hatch`; nếu cần inline, prefix ID và tham chiếu từng instance. Dùng `<img>` không gặp trùng ID. Preview hỗ trợ thu nhỏ màn hình; phần iframe tổng có thể cần đổi chiều cao.

## Kiểm và phạm vi

`node docs/design/gameplay/hang-nhac-onboarding-assets-v1/telegraphs/verify-preview.mjs` kiểm SVG bằng DOMParser trong browser fixture riêng, load tất cả nguồn, không overflow ở desktop/mobile, đổi trạng thái/thang xám, tạo ảnh QA và kiểm hash manifest. Không gọi API trả phí hoặc builder map. Kết quả kỹ thuật không duyệt ART.

Gói này chưa import runtime, không sửa scene, map, navigation, DB, reward hoặc server. Bộ ba/nhân vật native không bị thay đổi. Khi ghép HN04 thật cần review dưới chân người ở camera 1×, tình huống dấu chồng nhau và độ rõ tín hiệu theo delay thật; không suy timing từ ảnh xem thử.
