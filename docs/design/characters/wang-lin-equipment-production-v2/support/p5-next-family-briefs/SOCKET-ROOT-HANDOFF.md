# Source socket và root cho A/B

Body/canonical socket lấy từ anatomy nhìn thấy trên chính raw. Skin classifier chỉ tạo candidates. Xem source crop và native 1×/2×/3×, chọn palm hoặc endpoint thật từng pose rồi lưu source coordinate; thay root/padding sau đó chỉ translate coordinate đã đo.

## Dữ liệu đề nghị

Packer hiện dùng grip.native, visibility, attachmentPolicy, sourceManual/sourcePalm, sourceRect, sourceId/sourceSha256, reviewFrameSha256, manualEvidence/hash và sourcePalmReviewed. Chariot/Bead có thể dùng cùng container metadata để tương thích packer, nhưng semantic phải ghi command-palm hoặc hover-palm, emptyHand true và gripHeld false.

- command-palm: open/seal/occluded theo ảnh; emitter theo tay khi thấy, chest/forearm fallback được ghi rõ khi che. Device không attach vào grip.native.
- hover-palm: palm-up/open/seal/fragment/occluded theo ảnh; orb tách trên tay/lap hoặc caster fallback rõ. Không cho prop material overlap với palm rồi gọi là held.
- gather: đo actual reach/inspect palm và alternate nếu thấy; attachmentPolicy stow-hover hoặc ground-device.
- meditate: lap palm/seal/hidden cuff được ghi đúng; không suy khoảng trống giữa hai tay là skin.
- death: rested/relaxed/occluded/drop-ground. Không ghi held dù thuật toán nearest vẫn tìm được một pixel vàng.

Nếu wrist axis không thể đo từ cuff/forearm, angleDeg 0 là placeholder và angleMeasurement ghi chưa chứng minh. Đừng dùng nó để xoay thể cart/bead hay tuyên bố grip agreement. Cho alternatePalm và uncertainty nếu camera che tay chính.

Phép chuyển từ source sang native:

    native = pivot + (sourcePoint - sourceRoot) * sourceScale
    sourcePoint = sourceRoot + (native - pivot) / sourceScale

Đọc pivot từng frame; corpse có canvas rộng, không mặc định (56,104). SourceRect là crop provenance; source coordinate trên full raw, không crop-local trừ khi policy ghi rõ. Chuyển root không đổi sourcePalm.

## Root trên chân/đất

Neutral/idle/cast/hit/recovery: weight-bearing human boots, kiểm cả hai support spans nếu có; không dùng đáy robe, prop, ponytail hoặc chân đang nhấc. Run có lift/root theo waist/upper-leg projection và mặt đỡ thật cùng source; không lấy lowest alpha từng pose rồi san phẳng mọi chân bay.

Meditate: mặt đỡ mông/đùi/xếp chân và contact robe/lap thực, ghi observedBodyContactY/worldProjectionY và uncertainty. Corpse: clothed pelvis/waist-thigh projection và body-ground contact; đây là suy từ áo/thân, không tuyên bố thấy hip bone. Ghi lift của đoạn còn đang rơi riêng, giữ corpse rộng tự nhiên.

Đường chân ground không hiện trong raw transparent; support plane là phép đo hình cơ thể, có uncertainty. Những key chưa rõ giữ manualReviewPending, không tự claim đã chốt để đủ count.

## Kiểm trước bàn giao

Source full-cell edges và gutters phải đọc từ raw trước crop. Native zero edges chỉ chứng minh padding ở canonical. Một sourceScale cho mọi neutral/action của source, không fit pose. Frame/canvas/atlas/hash phải theo actual key count; atlas gutter 2 và sampled RGBA parity.

Các key cast kiểm full upright recovery bằng source head-to-boot/torso so neutral, không dùng chiều cao bbox gồm tay/tóc. Run không chứa key đứng nghỉ để đóng loop; nếu raw có terminal neutral thì giữ history/calibration với reuseReason, không khai đó là running.

Giữ prop/FX layer ngoài body. Root/renderer quyết định held/hover/ground/released theo semantic và Core release facts. Packer không tự tạo hit/support từ pose. ART/motion approval vẫn false tới review riêng.
