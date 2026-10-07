# Thư viện UX và ART — MVP A

**Trạng thái:** bản phác và tham chiếu trong giai đoạn GDD. Hướng tranh mực/giấy cổ đã được người phát triển chọn; chi tiết UI là đề xuất để kiểm tra bằng prototype.

**Hướng hiện tại v0.20:** nhân vật pixel trên nền stylized 2D/top-down, diện mạo theo tiểu thuyết và thiết kế riêng của game. [Bộ ba trọng tâm](characters/core-trio-v1/index.html) là ưu tiên: Vương Lâm và Lý Mộ Uyển đã duyệt; Tư Đồ Nam đứng v3 tạm chấp nhận làm chuẩn thiết kế. [Hai đệ tử v2](characters/player-avatars-v2/index.html) giữ bộ 56 frame thử. Các thử ghép/source trước đó và bộ 14 hình UX v0.6 giữ làm tham chiếu.

Client đã chốt TypeScript + Three.js. [Đặc tả preview chung](../ANIMATION-PREVIEW-SPEC.md) là bước trước animation mới; dùng 5 bộ/92 frame đang có, chưa khởi tạo ứng dụng Three.js. [Công nghệ](../TECH-STACK.md) ghi phần dùng chung với client sau này.

Mở [thư viện bản phác](index.html) trong trình duyệt, hoặc mở từng SVG bên dưới. Tranh trong bản phác được cắt khung từ cùng bảng ART để xem phối hợp hình/UI; các nút thuộc bản vẽ thiết kế.

| Tài liệu/hình | Vai trò |
| --- | --- |
| [ART reference v1](art-reference-v1.png) | Bảng phong cách mực/giấy, môi trường và trang phục |
| [Prompt ART](art-reference-v1.prompt.txt) | Prompt chính xác đã dùng với imagegen tích hợp |
| [Chân dung UI bộ ba](characters/core-ui-v1/index.html) | Một biểu cảm/người, PNG/WebP 512/160/64 trên nền giấy/tối; [nguồn/prompt](characters/core-ui-v1/README.md), hình mới chờ đánh giá |
| [Kế hoạch động tác](../CORE-CHARACTER-MOTION-PLAN.md) | 36 frame hiện có, mục tiêu 100; 64 frame mới còn thiết kế |
| [Bộ ba trọng tâm](characters/core-trio-v1/index.html) | Hai bảng nhận diện mới, tám mẫu tĩnh và đối chiếu cùng Vương Lâm; [hồ sơ](../CORE-CHARACTER-VISUAL-SPEC.md), [nguồn/prompt](characters/core-trio-v1/README.md) |
| [Vương Lâm tạo hình v2](characters/wang-lin-initiation-v2.png) | Ba bộ đồ, góc mặt/tóc và một biến thể cảnh; [prompt](characters/wang-lin-initiation-v2.prompt.txt) |
| [Vương Lâm biểu cảm v2](characters/wang-lin-expressions-v2.png) | Bốn sắc thái nghiên cứu; [prompt](characters/wang-lin-expressions-v2.prompt.txt) |
| [Vương Lâm pixel đứng v2](characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.png) | Nguồn nhận diện lớn được giữ; native xuất riêng; [prompt](characters/wang-lin-sprite-study/wang-lin-gray-pixel-v2.prompt.txt) |
| [Vương Lâm đứng/đi native](characters/wang-lin-gray-walk-v1/index.html) | 4 hướng, 28 frame, xem từng frame/nhịp và thử bước trên sân; [nguồn/prompt](characters/wang-lin-gray-walk-v1/README.md) |
| [Đệ tử nam/nữ v2 và sprite thử](characters/player-avatars-v2/index.html) | 28 frame/mẫu, chung palette và lưới 64 × 96; so sánh cùng Vương Lâm và thử trên sân; [nguồn/prompt](characters/player-avatars-v2/README.md) |
| [Màn thế giới v1](world/index.html) | Mẫu sân môn phái và UI; hai chế độ khung xem |
| [Thử ghép pixel/nền stylized](world/hybrid-study/index.html) | Giữ PNG Vương Lâm gốc trên nền riêng, có các cỡ và mức phóng |
| [Ảnh ghép v1](world/hybrid-study/wang-lin-courtyard-composite-v1.png) | Tham chiếu tổng thể bằng imagegen, kèm [prompt](world/hybrid-study/wang-lin-courtyard-composite-v1.prompt.txt) |
| [ART sân môn phái v2](world/sect-courtyard-topdown-v2.png) | Khối màu giản lược, giữ bố cục top-down của [v1](world/sect-courtyard-topdown-v1.png) |
| [Prompt sân môn phái v2](world/sect-courtyard-topdown-v2.prompt.txt) | Prompt chỉnh hình bằng imagegen tích hợp; [prompt đầu](world/sect-courtyard-topdown-v1.prompt.txt) lưu riêng |
| [Tu luyện desktop](cultivation-desktop.svg) | Phân cấp mục tiêu, tài nguyên, hoạt động và tranh |
| [Tu luyện mobile](cultivation-mobile.svg) | Bố cục một cột ở chiều rộng 360 px |
| [Hành trình desktop](journey-desktop.svg) | Đang xem thôn; hoạt động vẫn ở suối |
| [Cảnh truyện desktop](story-desktop.svg) | Nút cuối E05 và xem trước chi phí/tác dụng |
| [Hạt châu desktop](bead-desktop.svg) | Hình sau E07 và cách dùng đã khám phá |
| [Hành trang desktop](inventory-desktop.svg) | Bốn vật phẩm sau E05 và chi tiết công pháp |
| [Cài đặt desktop](settings-desktop.svg) | Cỡ chữ, giảm chuyển động, trạng thái bản lưu |
| [Xem trước bản nhập](save-import-desktop.svg) | So sánh tiến trình trước khi thay save |
| [Offline desktop](offline-desktop.svg) | 10 giờ vắng mặt, 8 giờ trong giới hạn, 24 phút hoạt động |
| [Offline mobile](offline-mobile.svg) | Cùng tổng kết tự động ở 360 px |
| [Kết thúc A](end-desktop.svg) | Ngưng Khí tầng 1, giữ tài nguyên, xem hành trình/xuất |
| [Trạng thái hoạt động](activity-states.svg) | Tám tình huống thiếu/chờ/dừng/sẵn sàng |
| [Trạng thái truyện/vật phẩm](story-bead-states.svg) | Đọc sau, lịch sử, E08 trước nút cuối, trạng thái trống và hình châu |
| [Trạng thái lưu/offline](system-states.svg) | Offline không hoạt động, lỗi và quyền chơi |
| [UI tokens](ui-tokens.json) | Màu, chữ, khoảng cách và kích thước |
| [Fixture](mockup-fixtures.json) | Snapshot thiết kế dùng vẽ bản phác |

Có **14 bản vẽ UI tham chiếu v0.6**: 11 bản màn hình/lớp, bao gồm 2 bản mobile, và 3 bảng trạng thái. Mẫu màn thế giới v1 được theo dõi riêng. Các ô trong bảng trạng thái là ví dụ độc lập, không phải một màn chơi xuất hiện đồng thời.

Chi tiết yêu cầu ở [ART-DIRECTION](../ART-DIRECTION.md), [UI-COMPONENTS](../UI-COMPONENTS.md), [UX-MVP-A](../UX-MVP-A.md) và [UX-SCREENS-AND-STATES](../UX-SCREENS-AND-STATES.md).

Nguồn SVG có thể dựng lại từ thư mục dự án:

```powershell
$env:PYTHONDONTWRITEBYTECODE = '1'
python docs/design/build_mockups.py
& docs/design/render_mockups.ps1
```

Script Python dùng thư viện chuẩn, dựng bản vẽ từ token/fixture và [module màn hình bổ sung](build_ux_screens.py). Script PowerShell dùng Chrome đã cài để render PNG, với profile tạm riêng và cửa sổ ẩn. Có thể truyền Edge/Chrome khác qua `-BrowserPath` hoặc chỉ dựng một số PNG bằng `-MockupNames @('offline-desktop','offline-mobile')`.

Các script chỉ phục vụ tài liệu thiết kế. Luật gameplay, lưu và offline chưa được triển khai trong dự án. Nét icon/châu trong SVG là hình phác; catalog asset game vẫn giữ trạng thái cần sản xuất.
