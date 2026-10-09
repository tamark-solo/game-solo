# Hằng Nhạc — bản đã lưu để triển khai GDD

**Chốt bản ngày 08/10/2026:** chủ dự án hoàn tất vùng chặn, xác nhận “Đã xong, lưu bản mới nhất”. Nguồn chính là [dự án owner đã lưu](../../../data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.json), project `294813fd-a175-49ae-ba45-849d726c4984`, level `40db90c5-86f2-4767-a13f-ccb8fdfefe03`.

[Mở Editor](http://127.0.0.1:5173/map-editor.html) · [Dự án có vùng chặn](editor-project.json) · [Ảnh web](map-web-access-v5-clean-v1.webp) · [PNG master](map-master-access-v5-clean-v1.png) · [Navigation](owner-navigation/navigation.json) · [Runtime export](owner-navigation/runtime-project.json) · [Kế hoạch GDD](../../../HANG-NHAC-IMPLEMENTATION-PLAN.md).

Ảnh được chọn là **access-v5-clean-v1**, lấy theo hash ảnh thật trong dự án của chủ dự án, dù tên asset trong Editor vẫn là `map-web-detail-c-v4.webp`. Bản này đã xóa cụm cây/bồn thừa khoanh đỏ bằng ImageGen và nối lại nền đá. Không sửa bậc thang trong đợt lưu/dọn này. Chỉ dẫn giữ planter-v6 trước đó là lịch sử, đã được thay bằng bản chủ dự án thực sự dùng và xác nhận lưu.

## Dữ liệu đã chốt

| Mục | Giá trị |
| --- | --- |
| World / nền | 3072 × 2048, góc trái (0,0), scale 1 |
| Nhân vật | Frame 64 × 96, chân (32,88), camera chơi 1× |
| Va chạm chân | Bán kính 8 px |
| Vùng chặn | 9 vùng của chủ dự án, tất cả có hiệu lực |
| Luật đi | Toàn level trừ vùng chặn |
| Spawn | (1616,992), sân trung tâm, đã kiểm đi được |
| Cửa nối level | 0; chưa đặt portal gameplay |
| Ảnh web | WebP quality 94, 2.939.564 byte, giải mã RGBA 24 MiB |
| Kiểm dữ liệu | 0 lỗi, 0 lưu ý; [biên bản](owner-navigation/verification.json) |

Lưu qua Editor đã ghi dự án tổng và mirror level trong `docs/data/authored-maps/294813fd-a175-49ae-ba45-849d726c4984.levels/`. `editor-project.json` là bản sao của đúng file đã lưu, có 9 vùng, dùng để phục hồi/chuyển máy. Thư viện nền riêng không chứa navigation; dùng dự án đầy đủ để tiếp tục map hiện tại.

## Nguồn sản xuất và dọn bản lỗi

Giữ [sáu khu chi tiết C](detail-c-v4/README.md), input/prompt/output, phép căn/ghép và [hồ sơ sửa cục bộ](access-v5-clean-v1/README.md). Phương pháp được lưu tại [quy trình concept → khu → ghép](../../../MAP-CONCEPT-SECTOR-WORKFLOW.md). Không sharpen hoặc blur toàn ảnh, không thay tỷ lệ người.

Các bản thử nét/màu v1/v2/v3, access-v5 chưa sửa, planter-v6, steps-v7 và ảnh/trang so sánh đã được dọn khỏi thư mục làm việc. [Danh sách/hash và vị trí bản sao phục hồi](../../../data/hang-nhac-map-cleanup-2026-10-08.json) giữ để tra cứu; bản sao nằm ngoài workspace. Không xóa vùng chặn hoặc bản nháp của chủ dự án.

## Triển khai theo GDD

Đây là **khu môn phái sinh hoạt/chuẩn bị**, theo [GDD 0.28](../../../GDD.md). Ngoại vi farm là map riêng có đường quay lại, khảo nghiệm là phiên riêng; xuất hành HN12 khác lối farm. Mốc khu trên trang xem chỉ là tham chiếu hình ảnh, chưa phải NPC hay tọa độ portal đã duyệt.

Bước đầu đã được [tích hợp vào runtime](../../../HANG-NHAC-RUNTIME.md): nền/navigation owner, camera 1×, cùng luật va chạm Editor/client/server, lựa chọn mẫu bộ ba và room online. [Mở Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html). Tiếp theo nối hồ sơ nhân vật, skill và tương tác môn phái, map farm/phiên khảo nghiệm rồi asset che cần thiết theo [kế hoạch](../../../HANG-NHAC-IMPLEMENTATION-PLAN.md). Nhiệm vụ, combat, loot và lưu tiến trình GDD chưa triển khai.

Trang [xem art/camera](index.html) vẫn cho đi tự do để đối chiếu hình ảnh. Dùng **Test map trong Editor** để kiểm 9 vùng chặn đã lưu. Nhà/cây/mái hiện bake vào một nền, chưa có y-sort hoặc alpha che người.
