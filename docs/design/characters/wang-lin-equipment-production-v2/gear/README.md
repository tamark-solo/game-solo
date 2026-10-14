# Trang bị vật lý tám hướng · Production V2

Gói này cung cấp 64 binding cho hai identity × bốn họ × tám hướng. Có 42 góc vật lý mới của Kiếm linh/Hồn phiên/Xạ Thần Xa, sáu Đông Nam đọc nguyên byte pilot đã duyệt và 16 binding châu tròn dùng hai raster V1. Tổng cộng 50 file artwork vật lý được chọn, không phải 64 artwork mới.

Mỗi họ có registration.json. Đường dẫn fullFile/source/layers là tương đối với production-v2. Root ghép vào thân và tạo tracks ở ngoài gear; registeredGrip là điểm vật liệu cán/kiếm/xích thật. Giày của actor và registeredGround của xe phải được xét độc lập. Châu dùng sphericalInvariantReuse và giữ glyph hướng camera, không tuyên bố tám góc khắc mới.

Một factor duy nhất cho mỗi raw nguồn, hiệu chuẩn theo extent của cell neutral SE. Tất cả góc dùng cùng factor; canvas192×192/pivot96,160 là padding. Kiếm giữ mốc vật lý A33/B30px của pilot; canvas lớn không phóng kiếm thành cỡ người. Gear vật lý dùng alpha128; raw nguồn giữ nguyên. Các layer chỉ phân chia pixel nguồn, union RGBA nhìn thấy bằng full, không vẽ lại cán/vải.

Built-in ImageGen tạo sáu nguồn chọn. generation.json giữ 12 raw cùng prompt, input thực tế, bản gốc và hash. Hồn phiên r1–r3 A và r1 B giữ lịch sử lỗi grip/gutter; xe B r1 thiếu command-loop N, r2 còn tip vải sát biên, chọn r3. Nguồn Kiếm và các gói V1/V5 giữ nguyên byte.

QA tại review/verification.json kiểm 2.022 điều kiện: raw/prompt/input/original hashes, biên vật lý nguồn, layer union, điểm cầm kim loại, một scale, 831 pin pilot + 86 pin V5 + 11 pin runtime/map. review/art-assessment.json ghi sai khác hình và giới hạn. Preview sáng/tối1×/2× dùng nearest, không fit từng góc.

Chạy lại trong workspace:

    python docs/design/characters/wang-lin-equipment-production-v2/gear/verify.py

Góc mới vẫn candidate ART. Hash/QA không mở duyệt mặc trang bị theo pose, motion mới, balance hoặc runtime. Gói không thay actor live, Core/gameplay, map, navigation, save hay DB.
