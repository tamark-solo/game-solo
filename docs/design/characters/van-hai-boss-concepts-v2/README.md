# Boss Pixel02 · ba bản tăng uy lực

**Feedback tiếp nối Hắc Ấn13/10:** owner báo02 lệch style và tạo hình khi so người. [Hắc03](../van-hai-dark-seal-officer-v3/README.md) dựng mới từ master người Pixel02, một neutral80/64×96, tóc/áo vải/nhận diện riêng; nguồn02 giữ nguyên để so. World review chuyển đúng Hắc sang03, các boss khác nguyên. Trạng thái candidate/biên bản02 dưới đây là mốc trước phản hồi này, không suy owner chốt Tam/Cổ hoặc duyệt motion.

13/10/2026 · Owner nhận xét: “Boss Vân nha lang vương thì oke rồi còn 3 boss kia nhìn thiếu lực quá không giống boss lắm”. [Trang so01–02](index.html), [bảng native nearest2×](review/lineup-2x.png), [bản01 giữ nguyên](../van-hai-boss-concepts-v1/README.md).

**Lang Vương giữ nguyên source/native/prompt01**, ghi duyệt riêng theo [approval hash](../van-hai-boss-concepts-v1/approval-wolf.json). Phạm vi chỉ một neutral Đông Nam/thân/cỡ96; chưa là duyệt animation/VFX/gameplay. Ba boss còn lại là concept mới chờ owner đánh giá, không mở rộng approval Lang Vương sang cả gói.

| Actor | Bản01 → bản02 | Hướng sửa | Canvas02 · chân |
| --- | --- | --- | --- |
| Lang Vương | 96 → 96px | Dùng nguyên bản đã duyệt | 224×144 · (112,128) |
| Tam Ấn | 104 → 128px | Vai bậc rộng, đầu nhỏ lùi trong thân, tay trấn nặng, ba mảng ấn rõ | 256×192 · (128,176) |
| Cổ Mộc | 140 → 160px | Thân/rễ cổ thụ dày, gỗ hóa ngọc, rễ lớn có khe và ngọc ấn gắn sâu | 480×208 · (240,192) |
| Hắc Ấn | 80 → 80px | Cổ áo dựng, vai áo vuông, mảng ngà/than lớn, thế tay và thẻ ấn chỉ thân phận | 160×96 · (80,88) |

128/160 là **cỡ ART concept đề xuất**, chưa thay scale/collider/HP/damage/timing trong game. Review01–02 hiển thị đúng cỡ mỗi bản ở cùng camera; không fit hai thân về cùng chiều cao để che khác biệt. Hắc Ấn vẫn người compact80; costume/pose mới cần owner kiểm nhận diện và tỷ lệ đầu/thân, không suy đúng anatomy chỉ từ height.

`raw/` giữ ba nguồn refinement và một chỉnh vai áo Hắc Ấn; `prompts/` giữ đúng bốn prompt; `generation.json` ghi built-in ImageGen/path. Hắc nguồn đầu được giữ làm provenance. `production.json` nối input/hash, nguyên15file ART/metadata01 và approval Lang Vương; `registration.json` có source support witness, scale từ neutral, native bounds/foot/alpha. Native resample nearest, alpha body≥210; không paint, xóa component hoặc fit từng pose. Raw giữ RGBA gốc. Script pack bỏ qua wolf, không ghi ngược root01.

Sân so Vương Lâm +01+02 hoặc cùng họ, map/sáng/tối, silhouette/chân/bóng riêng, native1×/2×. Gallery nearest2×, canvas600×400; màn nhỏ cuộn để giữ nguyên cỡ. Nền/chân đất chỉ là fixture đối chiếu, không spawn/navigation mới. Không API hoặc storage writes. Thân01 và Pixel02 người giữ nguyên byte.

Body chưa bake khí tức/skill FX. Cues/layers/kịch bản kế thừa brief; riêng silhouette/costume mới chưa chứng minh animation chín nhóm/tám view. Sau duyệt neutral mới pin morphology/scale, làm view/actions, FX riêng và scoped Core integration. Tam Ấn mới không tự dùng64clip Khôi Lỗi02. Cổ Mộc rooted chưa là locomotion/party/spawn collider. Hắc Ấn/dư ảnh không tự cấp Đọa Ma. Giữ receipt HN/EX, farm source–sink và [checklist phối hợp nhóm](../van-hai-monster-animation-v1/CLUSTER-REVIEW.md).

Kiểm bằng `npm.cmd run test:boss-concepts-v2`; [biên bản](../../../data/boss-concepts-v2-2026-10-13.json). Pack `scripts/pack-boss-concepts-v2.py` dùng Python có Pillow, chỉ ghi root02; không owner map builder, AI/drop/runtime hoặc DB/draft. Kết quả kỹ thuật tách khỏi duyệt hình.
