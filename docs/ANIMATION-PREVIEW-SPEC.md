# Công cụ preview animation và di chuyển — v1

**Phiên bản:** 0.4, ngày 07/10/2026.  
**Mục đích:** xem animation thật từ atlas và đánh giá cảm giác di chuyển trên map trước khi vẽ thêm bộ động tác.  
**Công nghệ đã chọn:** TypeScript + Three.js; [quyết định client](TECH-STACK.md).  
**Trạng thái:** đã có ứng dụng Three.js chạy được và chế độ sân chung với backend Node.js + Colyseus; [hướng dẫn](PREVIEW-RUNBOOK.md), [hợp đồng backend](BACKEND-PREVIEW.md), [kết quả kiểm tra](data/preview-verification.json).  
**Tham chiếu:** [dữ liệu cấu hình](data/client-tech-preview-design.json), [kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md), [lưới Vương Lâm](WANG-LIN-SPRITE-SPEC.md), [ART/map](WORLD-VISUAL-SPEC.md).

## 1. Các chế độ trong một công cụ

| Chế độ | Việc cần xem | Thao tác |
| --- | --- | --- |
| Animation tại chỗ | Vòng lặp, hai chân/tóc/áo, hướng và cắt frame | Chọn actor/động tác/hướng; FPS; Play/Pause; frame trước/sau; nền sáng/tối; zoom nguyên lần |
| Map di chuyển | Trượt chân, dừng/đổi hướng, tỷ lệ, va chạm và che khuất | WASD/phím mũi tên hoặc nút hướng; tốc độ; camera bám/cố định; reset vị trí; điểm chiếu/collider/lớp |
| Sân chung online | Hai client cùng nhìn thấy avatar đệ tử và vị trí server | Tên/mẫu hình tạm, vào/rời sân, WASD/nút hướng, danh sách người chơi và kết nối lại |

Desktop có vùng xem chính và bảng điều khiển cạnh bên; mobile 360 px đặt bảng điều khiển dưới vùng xem, nút hướng có vùng bấm tối thiểu 44 px. Chuyển chế độ giữ actor/hướng; chuyển actor dừng phiên chạy trước khi nạp bộ mới.

Phân biệt **FPS animation tại chỗ** với nhịp bước trên map và nhịp renderer. Tại chỗ dùng FPS thủ công; trên map/online, pha chân tiến theo quãng đường thực sự đã đi. Pause trong chế độ tại chỗ dừng animation; Pause scene trên map dừng cả di chuyển/animation. Bước frame chỉ dùng khi đang dừng. Không bắt phím di chuyển khi người dùng đang nhập/chọn trong bảng điều khiển.

## 2. Dùng asset đã có trước

| Actor | Bộ nguồn hiện tại | Frame riêng | Có thể xem |
| --- | --- | --- | --- |
| Vương Lâm áo xám | [Bộ sửa tay/chân](design/characters/gait-correction-v1/wang-lin/native-v1/atlas.json) | 36 | 4 đứng giữ nguyên + 32 đi; frame mới chờ đánh giá |
| Đệ tử nam | [Bộ sửa tay/chân](design/characters/gait-correction-v1/male/native-v1/atlas.json) | 36 | 4 đứng giữ nguyên + 32 đi; nhận diện/motion còn đánh giá |
| Đệ tử nữ | [Bộ sửa tay/chân](design/characters/gait-correction-v1/female/native-v1/atlas.json) | 36 | 4 đứng giữ nguyên + 32 đi; nhận diện/motion còn đánh giá |
| Tư Đồ Nam linh thể đứng | [native-v4](design/characters/core-trio-v1/situ-nan/native-v4/atlas.json) | 4 | Đứng tĩnh bốn hướng, tạm chấp nhận làm chuẩn |
| Lý Mộ Uyển áo tím | [native-v2](design/characters/core-trio-v1/li-muwan/native-v2/atlas.json) | 4 | Đứng tĩnh bốn hướng |

Tổng đang dùng cho preview là **5 bộ / 116 frame**. Core hiện có 44; hai bộ đệ tử có 72 frame riêng. Bản preview đầu dùng 92 frame cũ; sau phản hồi tay/chân, [gói sửa](GAIT-CORRECTION.md) vẽ lại 96 frame đi. Không cộng atlas cũ vào tổng đang chạy. [Trang so sánh](design/characters/gait-correction-v1/index.html) giữ hai bản để xem cùng thời lượng vòng bước.

Tư Đồ Nam/Lý Mộ Uyển có thể dịch chuyển hình tĩnh để thử đặt hình/tỷ lệ; UI ghi rõ **“Di chuyển với hình tĩnh”**. Động tác chưa có bị khóa, không đặt tên lướt/đi cho bộ chỉ có một frame. Animation được thêm khi có atlas mới.

Map thử là fixture ART; chọn nhân vật ở đây không mở NPC trong game hoặc đổi mốc B/arc sau.

## 3. Adapter dữ liệu atlas

Hai schema đang có được chuẩn hóa thành dữ liệu nội bộ dùng chung:

| Trường nội bộ | Nguồn và quy tắc |
| --- | --- |
| actorId | characterId của nguồn; đối chiếu catalog |
| frameSize | frameSizePx, hiện tại 64 × 96 |
| anchor | anchorPx nếu có; nếu không dùng footAnchorPx |
| anchorKind | Dùng nguồn; schema đứng/đi cũ mặc định feet |
| frames | Frame ID → rectangle x/y/w/h trong atlas |
| animations | stand_* và walk_* giữ tên; static_* chỉ ánh xạ thành stand_* |
| supportedStates | Chỉ lấy trạng thái có dữ liệu; không tạo animation dựa vào tên nhân vật |
| hoverHeight | Giá trị nguồn, Tư Đồ Nam hiện 4 px; đây là khoảng đặt hình tĩnh |
| provenance/review | Giữ trạng thái duyệt và hình thái/trang phục của nguồn |

Kiểm tra khi nạp: PNG/JSON tồn tại, kích thước atlas/rectangle hợp lệ, điểm neo trong frame, frame ID tham chiếu đủ, bốn hướng đúng tên, số frame đọc từ dữ liệu. Khi lỗi, hiển thị tên bộ/file và lý do; giữ UI dùng được để chọn bộ khác.

## 4. Camera, điểm neo và pixel

Camera orthographic giữ hướng cố định. Nền là ảnh đã vẽ top-down ba phần tư; renderer đặt các lớp trong mặt phẳng màn hình, không nghiêng nền lần nữa.

Điểm (x,y) của actor là điểm chân hoặc điểm chiếu. Hình native được đặt theo phép tính:

- Góc trên trái ở (x - anchorX, y - anchorY).
- Với Three.Sprite, center = (anchorX/frameWidth, 1 - anchorY/frameHeight).
- Frame 64 × 96 và điểm (32,88) cho center = (0,5; 1/12).
- Tư Đồ Nam có đáy hình y = 84, nhưng điểm chiếu vẫn y = 88; cùng center với người đi, hình cách đất 4 px.

Sprite.center dùng gốc chuẩn hóa từ phía dưới; công thức trên chuyển từ tọa độ ảnh gốc trên trái. [Tài liệu Sprite](https://threejs.org/docs/pages/Sprite.html).

Với atlas và texture flipY thông thường, UV repeat = (frameWidth/atlasWidth, frameHeight/atlasHeight), offset = (frameX/atlasWidth, 1 - (frameY + frameHeight)/atlasHeight). Kiểm tra bằng hướng trước/sau và frame đầu/cuối để tránh đảo hàng. Nếu cách nạp ảnh thay đổi flipY, adapter phải đổi quy tắc tương ứng.

Mỗi actor giữ trạng thái UV/frame riêng; không sửa offset của một texture dùng chung rồi làm tất cả actor đổi frame cùng lúc. Ảnh nguồn có thể cache chung. Texture nhân vật dùng nearest sampling, cấu hình atlas tránh bleed; nền/portrait dùng sampling mượt. [Texture](https://threejs.org/docs/pages/Texture.html).

Vị trí logic và camera giữ số thực để nền tranh cuộn liên tục. Sprite được căn theo pixel trong tọa độ màn hình sau khi trừ camera và áp dụng zoom; không làm tròn camera lẫn vị trí thế giới độc lập. Giữ nearest sampling và zoom 1×/2×/4×; đã kiểm tra mật độ điểm ảnh thiết bị 1 và 2.

## 5. Map thử và di chuyển

Dùng [sân trống tham chiếu](design/world/hybrid-study/sect-courtyard-empty-v1.png) hoặc nền lưới để xem tỷ lệ. Không dùng ảnh đã vẽ sẵn nhân vật làm nền động. Trên map thử đặt thêm fixture tường, lối hẹp và vật cao để xét va chạm/lớp; các collider này không suy tự động từ màu ảnh.

Giá trị mặc định đề xuất để thử:

| Thông số | Giá trị |
| --- | --- |
| Khung desktop tham chiếu | 960 × 640 |
| Zoom pixel | 1×/2×/4× |
| FPS xem tại chỗ | 8; có thể thử 1–12 |
| Sải bước trên map | 48 px/vòng; có thể thử 24–72, chưa là số đo giải phẫu của ART |
| Tốc độ di chuyển | 80 px/giây; thanh chỉnh 40–160 |
| Collider điểm đất thử | Bán kính 8 px, chỉ phục vụ fixture |
| Số hình mô phỏng | 1/5/20, không là số tài khoản online |

Di chuyển tính theo thời gian. Nhịp chân trên map tiến theo distance / sải bước, đổi hướng giữ pha bước và va chạm không tiến pha. Với 8 frame, tốc độ 80 px/s và sải 48 px/vòng tương đương khoảng 13,33 frame/giây; đây là tám pose vẽ riêng mỗi hướng. Sải bước là giá trị hiệu chỉnh thử, chất lượng tiếp đất phải được đánh giá qua ART. Hai trục cùng giữ chuẩn tốc độ; hướng hiển thị chọn theo trục lớn hơn, khi bằng nhau giữ hướng trước để tránh nhấp nháy. Khi dừng, giữ hướng vừa di chuyển và dùng trạng thái nghỉ có dữ liệu.

Online dùng Colyseus input/prediction: người đang điều khiển dự đoán và replay cùng luật di chuyển/va chạm với server; người khác nội suy snapshot trễ 100 ms. Server xử lý một input cho mỗi tick 30 Hz, patch 50 ms. Animation dùng quãng đường hình thực sự hiển thị để tránh chuyển sang tư thế đứng trong khi hình còn dịch chuyển.

Collider gắn với điểm đất, không lấy toàn frame 64 × 96 làm vật cản. Khi va chạm không xuyên fixture hoặc đổi tỷ lệ hình. Vật cao có điểm gốc/lớp dưới–trên được cấu hình để actor đi sau bị che, đi trước được vẽ phía trước; xét thứ tự theo điểm chiếu và ID ổn định khi trùng y.

Render thử ban đầu dùng lớp phẳng và thứ tự vẽ tường minh. Scene 3D có chiều cao/độ sâu thật cần đặc tả riêng. Sprite chuẩn của Three.js không tự đổ bóng; bóng chân nếu cần là lớp ART/fixture riêng. [Sprite](https://threejs.org/docs/pages/Sprite.html).

## 6. Trạng thái cần có trong UI

| Trạng thái | Phản hồi |
| --- | --- |
| Đang nạp | Actor/tên bộ và tiến trình nạp |
| Sẵn sàng | Hướng, tên động tác, frame hiện tại/tổng, FPS và tốc độ |
| Bộ tĩnh | Đứng một frame/hướng; khóa bước frame không có và động tác chưa sản xuất |
| Animation dừng | Play và bước frame hoạt động; tư thế giữ nguyên |
| Scene dừng | Không nhận lệnh di chuyển cho map; Reset/chọn actor vẫn dùng được |
| Va chạm | Tùy chọn hiện collider/điểm chiếu; ảnh giữ đúng vị trí |
| Lỗi asset | Đường dẫn/tên bộ và lý do bằng chữ |
| Mobile | Nút hướng, chọn actor và điều khiển không tràn ngang |

Không đưa luật tu luyện, đăng nhập hoặc lưu tiến trình vào công cụ này. Cấu hình phiên xem có thể lưu như preset ART khi triển khai; không dùng nó làm save game.

## 7. Điều kiện nghiệm thu khi có ứng dụng

1. Nạp đủ năm bộ; số frame là 36/36/36/4/4, không lấy ảnh nguồn lớn làm sprite native.
2. Vương Lâm/đệ tử xem đúng bốn hướng và tám frame đi; Play/Pause/bước frame hoạt động độc lập. Xem hai tiếp đất 0/4 và tay đối nhịp trong trang so sánh.
3. Điểm (32,88) đứng yên khi đổi frame; linh thể giữ khoảng đặt hình 4 px trong bộ tĩnh.
4. FPS tại chỗ và tốc độ chỉnh độc lập; trên map nhịp chân tự khớp quãng đường/sải bước; đi/chuyển hướng/dừng/va chạm không làm hình đổi kích thước.
5. Hai hình cùng atlas có thể ở hai frame khác nhau; reset/chuyển actor giải phóng input/phiên cũ.
6. Nền không có nhân vật vẽ sẵn; fixture che khuất đúng phía trước/sau theo điểm chiếu.
7. Nền sáng/tối, zoom nguyên lần, desktop và mobile 360 px dùng được; phím điều khiển không tác động khi nhập trường.
8. Ghi số frame, nhịp renderer và chi phí khi thử 1/5/20 hình; số liệu là đo preview trên thiết bị, không suy thành năng lực MMORPG.
9. Lỗi nạp/chưa có động tác hiển thị rõ; UI không mô tả hình tĩnh như animation đã hoàn thành.

Các tiêu chí đã được kiểm tra bằng source atlas, luật di chuyển và Chrome headless desktop/mobile; [kết quả bàn giao](data/preview-verification.json) ghi phạm vi cụ thể. Kết quả kỹ thuật không thay việc người phát triển duyệt chất lượng chuyển động. Sau đánh giá preview mới sản xuất bản thử lơ lửng/lướt Tư Đồ Nam một hướng, rồi mở bốn hướng và bộ đi Lý Mộ Uyển.
