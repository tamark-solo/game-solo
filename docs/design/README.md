# Thư viện ART và bản phác UX

**Cập nhật:** 08/10/2026. Xem [trạng thái dự án](../PROJECT-STATUS.md) và [GDD 0.28](../GDD.md) để phân biệt thiết kế hiện hành, ART đã duyệt và prototype đã chạy. Client Three.js/Colyseus và Map Editor 0.12.0 đã triển khai; gameplay MMO chưa triển khai.

## ART đang dùng để duyệt

| Bộ | Phạm vi và trạng thái |
| --- | --- |
| [Năm bộ chibi](characters/chibi-roster-v1/index.html) / [hồ sơ](characters/chibi-roster-v1/README.md) | 100 frame cho Vương Lâm, Tư Đồ Nam, Lý Mộ Uyển và hai avatar đệ tử; thêm Vương Lâm bộ trước 36 frame thành catalog 136 frame |
| [Vương Lâm chibi bốn hướng](characters/wang-lin-chibi-walk-v1/README.md) | Mẫu mặc định preview; nguồn/native bốn hướng đứng/đi |
| [Kế hoạch động tác bộ ba](../CORE-CHARACTER-MOTION-PLAN.md) | Bộ ba đã có 60 frame chibi; động tác riêng và combat còn cần thiết kế/sản xuất |
| [Chân dung UI bộ ba](characters/core-ui-v1/index.html) / [hồ sơ](characters/core-ui-v1/README.md) | Bộ chân dung trước còn chờ đánh giá/đồng bộ với nhận diện chibi mới |
| [Nhận diện tĩnh bộ ba](characters/core-trio-v1/index.html) | Snapshot concept trước chibi; không đại diện đủ motion hiện có |
| Map Hằng Nhạc | ART v1/v2/v3 và hai bản thử vùng đi đã [xóa](../MAP-ASSETS-RESET.md) |
| [Map đầy đủ Hằng Nhạc v1](world/hang-nhac-map-v1/README.md) / [xem cạnh nhân vật](world/hang-nhac-map-v1/index.html) | Map tổng theo GDD, 3072 × 2048/scale 1; WebP 3,01 MB, dự án Editor 4,01 MB. Chủ dự án vẽ navigation trước, asset sau; bộ concept/nền/ba mẫu cũ đã xóa. Chưa là map MMO có va chạm/che người |
| [Bàn giao VFX](vfx/STARTER-VFX-HANDOFF.md) / [library](vfx/skill-library.html) | 15 skill, 646 PNG rời, 76 atlas đã duyệt; chưa tích hợp combat |
| [Thư viện map editor](world/map-asset-library/README.md) | Manifest mặc định trống; gói một nền đầy đủ bàn giao riêng |

[Hướng dẫn chạy](../PREVIEW-RUNBOOK.md) ghi URL preview/editor, [CHIBI-ROSTER-SPEC](../CHIBI-ROSTER-SPEC.md) ghi phiên bản và mức duyệt từng nhân vật. Danh tính playable hiện hành do GDD quyết định; tag `story_npc` trong catalog preview là tag kỹ thuật lịch sử, không khóa bộ ba thành NPC.

## Bản phác UX idle được giữ làm lịch sử

[Thư viện 14 bản phác](index.html) thuộc MVP idle v0.6, trước hướng ba nhân vật playable. Giữ SVG/PNG, token và fixture để truy nguồn bố cục mực/giấy; không dùng mốc kết thúc tầng 1, save cục bộ hoặc giới hạn offline 8 giờ trong hình làm luật hiện hành. UI nhập môn/online mới cần đặc tả theo [GDD](../GDD.md) và [Hằng Nhạc](../HANG-NHAC-NGUNG-KHI-SPEC.md).

| Hình/dữ liệu lịch sử | Nội dung trong snapshot |
| --- | --- |
| [ART reference v1](art-reference-v1.png) / [prompt](art-reference-v1.prompt.txt) | Bảng phong cách UI mực/giấy, giữ nguyên nguồn |
| [Tu luyện desktop](cultivation-desktop.svg) / [mobile](cultivation-mobile.svg) | Bố cục tài nguyên/hoạt động của mô hình idle cũ |
| [Hành trình](journey-desktop.svg) / [truyện](story-desktop.svg) | Node/cảnh E của tuyến Vương Lâm cũ |
| [Hạt châu](bead-desktop.svg) / [hành trang](inventory-desktop.svg) | Cơ duyên và vật phẩm theo snapshot E |
| [Cài đặt](settings-desktop.svg) / [nhập save](save-import-desktop.svg) | Luồng save local cũ, chưa là hợp đồng online |
| [Offline desktop](offline-desktop.svg) / [mobile](offline-mobile.svg) | Minh họa cap 8 giờ của thiết kế cũ |
| [Kết thúc A](end-desktop.svg) | Mốc tầng 1 của phạm vi cũ |
| [Trạng thái hoạt động](activity-states.svg) / [truyện/châu](story-bead-states.svg) / [lưu/offline](system-states.svg) | Ví dụ trạng thái UX cũ |
| [UI tokens](ui-tokens.json) / [fixture](mockup-fixtures.json) | Dữ liệu dựng hình lịch sử, không là balance/runtime game |

Có 11 bản màn hình/lớp và 3 bảng trạng thái. Các ô trạng thái là ví dụ độc lập. Nguồn tài liệu: [UX-MVP-A](../UX-MVP-A.md), [màn hình/trạng thái](../UX-SCREENS-AND-STATES.md), [UI components](../UI-COMPONENTS.md). Các file này ghi rõ phần giữ lịch sử và phần cần thiết kế lại.

Dựng lại chính snapshot cũ, không tạo UI mới:

```powershell
$env:PYTHONDONTWRITEBYTECODE = '1'
python docs/design/build_mockups.py
& docs/design/render_mockups.ps1
```

Script Python dùng thư viện chuẩn; PowerShell render bằng Chrome/Edge đã cài với profile tạm/cửa sổ ẩn. Các script không triển khai luật game. Chỉnh định hướng tài liệu không sửa các ảnh nguồn, prompt, fixture hoặc kết quả kiểm tra đã lưu.

## Nghiên cứu trước và map đã reset

[Bộ Vương Lâm trước](characters/wang-lin-gray-walk-v1/README.md), [hai avatar trước chibi](characters/player-avatars-v2/README.md), [sửa gait](characters/gait-correction-v1/README.md) và [sprite study](characters/wang-lin-sprite-study/README.md) là nguồn so sánh. Đọc nhãn trạng thái từng bộ trước sử dụng.

Các ART map/hybrid/MP01–MP07/MAP03 legacy và ART Hằng Nhạc v1/v2/v3 cùng hai bản thử vùng đi đã xóa. [Hồ sơ reset](../MAP-ASSETS-RESET.md) ghi hai đợt dọn. Chờ kế hoạch map mới; không khôi phục source hoặc dùng lịch sử duyệt bộ đã xóa làm nguồn sản xuất.
