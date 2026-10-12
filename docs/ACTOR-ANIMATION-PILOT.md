# Animation pilot 01 · Vương Lâm / quái áp sát / boss

**Retired12/10:** pilot/source/script/UI dưới đây đã chuyển vào [archive có hash](archive/actor-animation-pre-pixel02-2026-10-12/README.md). Nội dung là lịch sử, không lệnh pipeline hiện hành. [Chuẩn pixel02 đã chốt](design/characters/actor-animation-standard-v2/README.md).

**Chốt cơ sở sản xuất 12/10:** owner nhận xét “khá tốt” và yêu cầu lấy pilot làm cơ sở chốt skill cho hệ thống sản xuất. [Quyết định theo hash](design/characters/actor-animation-pilot-v1/production-basis.json) chấp nhận baseline/quy trình; [chuẩn production và skill dùng lại](ACTOR-ANIMATION-PRODUCTION.md) đã lưu. Các ghi chú chờ duyệt bên dưới mô tả trạng thái trước quyết định này; nghiệm thu từng clip, đủ tám hướng và tích hợp runtime vẫn có phạm vi riêng.

Ngày 12/10/2026. Theo yêu cầu owner, triển khai một lát cắt ART + playback để đánh giá khả thi trước khi sản xuất đầy đủ tám hướng. Trang xem: `/actor-animation-pilot.html`, liên kết từ `/van-hai-character-review.html`.

## Kết quả hiện có

| Bộ | Nhóm động tác | Clip Nam/Đông | Tổng frame | Frame mới / tái dùng |
| --- | ---: | ---: | ---: | ---: |
| Vương Lâm hiện hành, áo xám | 12 | 21 | 114 | 24 / 90 |
| Thanh Nham Lang, quái bốn chân áp sát | 5 | 10 | 60 | 60 / 0 |
| Trấn Sơn Khôi Lỗi, boss đá/đồng | 8 | 16 | 96 | 96 / 0 |
| Tổng | 25 nhóm theo actor | 47 | 270 | 180 / 90 |

Tên hai đối thủ là nhãn ART thử, chưa record quái/nhiệm vụ hoặc quyết định lore. Không suy bộ mới đã được owner duyệt từ yêu cầu bắt đầu hoặc từ kiểm kỹ thuật.

Vương Lâm: đứng, đi, chạy, một đòn thường, Kiếm Khí, Lôi Ấn, Ngự Phong, phản ứng trúng, chết; chào/vận khí đứng/dùng vật tư chỉ Nam. Đứng là pose gốc tĩnh, chưa có vòng thở mới. Các pose đang có tái dùng đúng nguồn/crop/cutout; chạy/trúng/chết là ART mới. Chưa có đả tọa ngồi, combo 2–3 đòn, ngự kiếm bay, cưỡi thú hoặc thu thập.

Quái: đứng/thở, di chuyển, cắn, phản ứng trúng, chết. Boss: năm nhóm cơ bản, thức tỉnh/xuất hiện, thi triển đường và thi triển vùng. Các clip thân tách khỏi VFX. Dấu báo đòn trong preview là hình minh họa nhịp, không vùng trúng/gameplay hay ART skill production.

## Quy cách native và điểm chân

| Trường hợp | Canvas | Pivot | Cỡ thân tham chiếu |
| --- | --- | --- | --- |
| Vương Lâm đứng/đi/chạy/trúng | 64 × 96 | (32,88) | 80 px cao theo pose đứng |
| Vương Lâm chết | 112 × 96 | (56,88) | Giữ cỡ thân; thêm khoảng cho ngã/tóc |
| Vương Lâm đòn/cử chỉ/cast tái dùng | 96 × 96 hoặc 112 × 96 | Pivot nguồn (48,88)/(56,88) | Giữ nguồn và metadata cục bộ |
| Thanh Nham Lang | 112 × 96 | (56,88) | Nam 50 px cao; Đông 64 px dài thân/paw profile |
| Trấn Sơn Khôi Lỗi | 176 × 176 | (88,160) | 104 px cao ở pose đứng |

Canvas có padding khác nhau không thay cỡ người, camera, collider hay runtime contract. Mỗi source có một scale chung, column root và row floor đo từ chân; không ép mỗi pose vào một bbox bằng cách phóng/thu riêng. Ngã và giơ tay được thay đổi silhouette tự nhiên. Cần owner đánh giá dáng và độ ổn định khi chuyển động, không chỉ chiều cao một pose.

Atlas có padding 2 px, khoảng cách ô 4 px; PNG alpha, nearest sampling. 180 frame mới dùng mask cơ thể liên thông alpha ≥128 trước resize, binary alpha sau xuất và bảng màu chung theo actor. Vương Lâm mới quy về palette người gốc. Source ImageGen RGBA nguyên vẹn được giữ trong pack. Frame tái dùng giữ RGBA nguồn sau crop/cutout đã authored; không lượng tử lại.

## Kết luận khả thi của đợt thử

- Đã phát và seek đủ 270 frame / 47 binding ở hai hướng, không dùng mirror thay góc còn thiếu. Trang có nhịp chậm, xem pixel, dải pose, kiểm khung/neo và đối chiếu map 1× độc lập zoom card. Có điều khiển tại map để phát lại đòn ngắn.
- Sheet boss 6 × 8 ban đầu có hai cặp pose chạm nhau, chỉ 46 cơ thể thay vì 48; bỏ khỏi export. Tách basic 6 × 5 và special 6 × 3 cho từng hướng cho đủ số body. Giữ hai source bị loại để xem nguyên nhân.
- Chạy/trúng Đông của Vương Lâm ở sheet đầu vượt canvas 64 × 96. Tạo lại tám pose Đông với tóc/stride gọn; không đổi frame người hay cắt cụt cơ thể để làm build qua. Hai hàng cũ không dùng.
- Hình chữ nhật crop còn chứa mảnh body kế bên ở bảy frame, tổng 1.258 pixel source. Đã trích đúng component trước resize; xem lại dải pose boss sau sửa. Sản xuất phải kiểm body thật, không chỉ số ô hoặc bbox.
- 47 atlas PNG khoảng 1,65 MiB truyền tải, nhưng RGBA giải mã là 20.137.600 byte (~19,2 MiB), chưa tính map và bộ nhớ GPU/browser. Preview chủ động nạp tất cả để so sánh; game H5 production cần nạp theo actor/state và cache có giới hạn. Chưa đo FPS/bộ nhớ trên điện thoại thật hay multiplayer.
- Với 25 nhóm hiện tại, đủ tám hướng là tối đa 200 clip, chưa các bộ áo/vũ khí/tọa kỵ. Không nhân công cơ học từ hai hướng để suy lịch sản xuất: clip cử chỉ còn thiếu góc, South cast 8 pose và East legacy 12 pose còn phải chuẩn hóa cho production.

## Ranh giới Core và tích hợp

`client/src/core/actor-animation-pilot.ts` lấy mẫu clip theo tuổi tuyệt đối, fps + hold ticks, loop/one-shot và binding rõ ràng. Core không DOM, texture loader hoặc lệnh combat. `features/actor-animation-pilot.ts` điều phối catalog/clock/input/lifecycle. UI view/canvas xử lý bố cục/draw; không sở hữu gameplay hoặc transport.

Thời gian presentation và nhãn phase là đề xuất review. Hit là phản ứng hình; không cho phép tự hủy attack/cast, stun hoặc thay luật priority. Khi tích hợp runtime, server vẫn sở hữu attack/cast/resolve/death; client đọc snapshot/event có timestamp, không replay lệnh để tạo animation. Hợp đồng skill giữ theo [SKILL-CORE](SKILL-CORE.md); aura/skill FX tách ground/rear/body/front theo [CHARACTER-AURA-LAYERS](CHARACTER-AURA-LAYERS.md).

Map xem là bản concept Vân Ngọc, scale source 2× ra world với camera 1×. Đây không phải scene Three.js có navigation/mái/tán runtime, không kiểm AI/hitbox/path hoặc mật độ trận chiến. Không sửa owner map, blocker, DB, hồ sơ, GDD hay catalog quản trị.

## Kiểm và bước tiếp

`npm.cmd run test:actor-animation-pilot`: ba unit test timeline/binding; kiểm hash/bounds/alpha/source/public; browser đủ 47 clip/270 seek, pause/replay/death, speed, offline/resume, visibility event fixture, offscreen và reduced motion; bốn viewport 1366/844/390/320 không tràn trang, mục tiêu nút/select ≥44 px. [Biên bản](data/actor-animation-pilot-v1-verification.json). `npm.cmd run typecheck` và Vite build trực tiếp qua; không chạy builder owner map để phục vụ preview.

Đánh giá hình trước: nhận diện Vương Lâm khi chuyển pose; run khác walk thế nào; chân/tóc/áo có giật; cú cắn/lấy thế/phát lực boss có dễ đọc; Nam/Đông có cùng cỡ thân. Sau phản hồi, sửa pose cần thiết, rồi làm Bắc/Tây + chéo, chuẩn hóa timeline/sockets từng hướng, kiểm với renderer Three.js/layer và một encounter fixture. Chỉ chốt artApproved/ownerApproved bằng quyết định xem hình riêng.

[Source, prompt và cách tái xuất](design/characters/actor-animation-pilot-v1/README.md).
