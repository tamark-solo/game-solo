# Boss Vân Hải · concept Pixel01

**Feedback tiếp nối13/10:** owner chấp nhận Lang Vương, yêu cầu tăng uy lực ba boss còn lại. [Approval Lang Vương](approval-wolf.json) pin đúng neutral/source/native96; [bản02](../van-hai-boss-concepts-v2/README.md) có ba refinement và so01–02, giữ toàn bộ ART/metadata01. Cờ candidate trong manifest01 bên dưới giữ bản ghi trước feedback; approval riêng chỉ áp một thân Lang Vương, chưa animation/VFX/live hoặc cả gói.

13/10/2026 · Owner chuyển bước tiếp sang **concept các boss** sau khi xem quái/tinh anh và cụm VFX. [Trang duyệt](index.html), [bảng tỷ lệ nearest2×](review/lineup-2x.png), [brief gốc](../../world/van-hai-living-world-v1/plan.json).

Bốn identity master, mỗi mẫu một **neutral Đông Nam**, thân alpha riêng. Built-in ImageGen tạo nguồn; raw/prompt/input/hash, phép đo điểm chân và native được lưu. Đây là concept để duyệt nhận diện; `artApproved=false`, `ownerApproved=false`, `runtimeConsumable=false`. Chưa có bảy view còn lại, animation hay artwork FX boss. Review không gửi command, ghi storage/draft hoặc thay boss hiện hành.

| Boss / ID | Dấu nhận diện | Thân native | Canvas · chân |
| --- | --- | --- | --- |
| Vân Nha Lang Vương · BOSS-VH-CLOUD-WOLF-KING | Vai/bờm bạc nặng, ba chùm đuôi mây bằng lông, dấu niêm sườn; không vương miện/giáp vàng | 96px | 224×144 · (112,128) |
| Tam Ấn Khôi Lỗi · BOSS-HN-THREE-SEAL-PUPPET | Thân chắc ngọc rạn/đồng già, ba ấn ngực–vai, lõi nhỏ | 104px | 176×176 · (88,160) |
| Cổ Mộc Trấn Khí · BOSS-VH-ANCIENT-ROOT | Thấp rộng, ba rễ trấn, lõi ngọc/đồng gãy; không mặt người | 140px | 400×176 · (200,160) |
| Hắc Ấn Chấp Sự · BOSS-VH-DARK-SEAL-OFFICER | Người Pixel02, tóc/râu ngắn chỉ tuổi, áo than/ngà, lụa lệch vai, thẻ ấn đồng đen | 80px | 112×96 · (56,88) |

Height là chiều cao thân gồm tóc/lông/cành, không phải canvas, HP, collider hoặc tầm chiêu. Cùng camera1× với Vương Lâm80px. Quái/boss dùng morphology riêng; người giữ tỷ lệ compact Pixel02. Tam Ấn dùng Khôi Lỗi02 làm tham chiếu khối thân và scale104, **không đồng nghĩa pose/rig tương thích** hay được tái dùng64clip cũ. Sân so trực tiếp với Khôi Lỗi02 để owner đánh giá khác biệt.

## Nhận diện và nhịp chiêu cho bước tiếp

- **Lang Vương:** hạ vai/ghìm chân → đường chồm khóa; giậm đôi → quét vòng; ngẩng cổ → lang khiếu. Solo baseline trước, gọi đàn thuộc gói mở rộng. Mây/gió/va chạm/bụi tách thân.
- **Tam Ấn:** vai/tay và ba hình ấn giúp đọc cung, vòng, đường thẳng; double line giữ báo trước hiện hành. Lõi/ấn trong thân chỉ là vật liệu trung tính; activation và contact là layer riêng. Giữ HN10 checkpoint/proof/thưởng hữu hạn, không loot từ thử lại.
- **Cổ Mộc:** rễ báo tuần tự, lõi nạp tia hành lang, rễ nghỉ để phản công. Không bít toàn sân; rễ tấn công cần prop/entity/geometry prototype riêng. Một neutral rooted chưa quyết định walk/replant, tám hướng, party hoặc collider map.
- **Hắc Ấn:** giơ tay → đạo ấn; đổi thế bàn tay → dư ảnh; thu tay → vòng hồi có khe. Phân biệt nguồn thật bằng hình/động tác, không chỉ màu. Dư ảnh/khí mực tách thân và chưa là entity gây hit/loot. Không chuyển đạo lộ người chơi trước gate Hóa Thần.

`production.json` ghi `cues` và `layers` của từng boss, cùng nguồn tham chiếu. Chúng là **brief**, chưa có clip/VFX hoặc gameplay đã khóa. HP/damage/timing/range/drop/quota/ownership còn cần prototype và hợp đồng nguồn–chi; không mở lại HN/EX để farm.

## Nguồn và phép đo

`raw/` giữ năm PNG: bốn nguồn đầu và Cổ Mộc chỉnh thấp rộng. `prompts/` giữ bốn prompt gốc và một prompt chỉnh; `generation.json` ghi tool/path nguồn. Bản Cổ Mộc đầu quá cao được giữ làm provenance, không chọn làm native. `registration.json` ghi source size/bounds, sole/root support witness, scale chung từ neutral, translation, native bounds/alpha/hash.

Native được trích tại alpha≥210, nearest một scale cho neutral; **pixelsResampled=true**. Raw RGBA nguyên byte, không paint, xóa component hoặc fit từng pose. Bóng đất do review vẽ riêng; không baked shadow/VFX. Chân lấy support soles/root contact, không lấy tâm bbox. Cổ Mộc có canvas rộng để giữ đủ rễ và padding; pivot này là mốc concept chờ motion review, không collider center.

Sân có camera1×/2×, nền Vân Ngọc/sáng/tối, silhouette, chân và bóng riêng; so Lang50/Tuần65, Khôi Lỗi02 hoặc cùng họ. Gallery2× giữ canvas và cuộn ngang trên màn nhỏ; không giảm body để vừa thẻ. `plan.json` đã pin bởi các gói trước nên giữ nguyên; trang sinh cảnh đọc thêm manifest boss để hiển thị, catalog vẫn unreleased/pending.

## Sản xuất và kiểm tiếp nối

Sau duyệt neutral: pin đúng hash/morphology/palette/scale → bảy view thật → idle/move phù hợp/attack/hit/death + appear/skill riêng → VFX warning/release/contact/aura → Core integration. Đọc [skill sản xuất](../../../skills/game-actor-animation-production/SKILL.md) và [checklist nhóm](../van-hai-monster-animation-v1/CLUSTER-REVIEW.md). Khi có đàn phụ, phối hợp giãn vị trí, nhịp đòn server và FX chồng; ART không tự tạo hit hoặc thưởng.

Scoped pack chỉ viết root boss mới, không chạy owner map builder hoặc sync game. Kiểm kỹ thuật riêng khỏi duyệt hình:

```powershell
# Dùng Python có Pillow trong workspace dependencies.
python scripts/pack-boss-concepts-v1.py
npm.cmd run test:boss-concepts
```

[Biên bản kiểm](../../../data/boss-concepts-2026-10-13.json) ghi phạm vi và kết quả khi hoàn tất. Giữ nguyên Player323hash,11concept/body quái, VFX hiện hành, map9blocker/navigation và DB/draft owner.
