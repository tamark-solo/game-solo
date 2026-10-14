# Input trước mỗi lượt gọi thật

Chỉ dispatch khi root giao sau các họ trước. Template hiện có generationAllowed false và original/raw là null. Không sửa các kế hoạch này để tuyên bố đã gọi tool; worker tạo record lượt thực riêng trong thư mục được giao.

## Core

Image1 là own P1 native nearest 8×: approved identity và outfit đúng họ A/B. Source native và raw P1 đã pin trong basis. Image2 là Wang live nearest 8× cùng hướng, hỗ trợ anatomy/pixel/camera. Image3 là raw P1 own outfit nguyên byte để nhìn chi tiết vải/giáp; view SE của nó không được thay camera đang yêu cầu.

32 triplet trong inputs/core đã copy đúng byte và có hash per job. Trước dispatch, verify hash lại, xem đủ ba ảnh và khóa thứ tự referenced_image_paths. Nếu prompt sửa, ghi prompt thực mới/hash mới; promptSha trong kế hoạch chỉ pin bản chuẩn bị.

## Foundation

Image1 CHƯA CÓ: own Core neutral cùng family/identity/direction đã kiểm source anatomy/camera/costume và đăng ký sourceRect/root/factor. Lấy một calibration được chọn hoặc một upright recovery thật cùng source nếu ghi rõ bằng chứng; tạo native nearest 8×, giữ lineage sourceRect. Không lấy pose cúi thấp làm neutral hay ghép đầu P1 lên thân khác.

Image2 đã biết đúng Wang cùng hướng, nhưng chưa snapshot per call foundation. Copy exact bytes/hash từ basis vào 2.png khi được giao.

Image3 CHƯA CÓ: raw Core cùng family/identity/direction được chọn thực tế, với original local path/raw copy/SHA của lượt gọi thật. Copy nguyên byte vào 3.png. Không thay bằng raw Sword/Banner, raw identity khác, mirrored view hoặc P1 SE raw để giả dependency đã đáp ứng.

64 bộ foundation hiện có Image1/Image3 null, ready false, inputSnapshotsReady false. A/B sẽ chỉ cung cấp exact prompt và exact ba input cho lượt support gen sau khi neutral đủ điều kiện. Agent hỗ trợ không tự chọn raw thay thế.

## Record lượt thực

Mỗi record cần job id, family/identity/direction/group, actual prompt/hash, input 1/2/3 file/hash/role/original/sourceId và sourceRect cho derivative, transparent_background true, builtin ImageGen tool name, returned original path, raw copy path/hash/actual dimensions. Lưu prompt/input trước gọi; xem raw sau gọi. Chỉ ghi tool metadata lấy từ kết quả thực; không tự chế request id hoặc model.

Nguồn sửa giữ cả raw r1, prompt/input r1 và assessment thất bại. Lượt edit r2 phải dùng exact target đã xem và ghi nó ở input thực, không giữ metadata r1 nếu argument thực đổi. Không retry POST router hoặc chuyển tool để bỏ qua thất bại.

## Handoff để gen foundation

Root/A/B gửi nguyên văn prompt file và ba đường dẫn input đã snapshot, kèm SHA; danh sách cell/neutral/source lineage; destination support riêng; hướng/identity/action cụ thể. Agent hỗ trợ đối chiếu hash và xem input trước khi dùng builtin ImageGen. Actor owner giữ quyền chọn nguồn, pack/manual socket/root và art assessment. Không tự ghi actors từ support.
