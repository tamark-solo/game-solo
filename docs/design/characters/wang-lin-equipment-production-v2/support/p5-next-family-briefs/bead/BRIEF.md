# Thiên Nghịch Châu · hộ đạo và mở Nội Giới

Châu bay tách khỏi body, phía trên lòng bàn tay mở. Pose diễn support/control: dâng, giữ, mở veil; không phóng orb như viên đạn hoặc nắm như chuôi kiếm. Huyễn Tâm giữ áo than-ngà, cuff ngà và vải celadon P1. Tịch Bạch giữ áo lam-than-ngà/tóc trắng P1. Cả hai có choreography chung nhưng giữ nhận diện và phục trang riêng.

## Tám action

| Action | Chuyển động cần đọc được |
|---|---|
| idle | Lòng bàn tay chính mở hướng lên gần ngực, tay phụ ở eo; thở nhẹ, giữ khoảng hở phía trên cho orb riêng. |
| run | Chân luân phiên thật; tay chính mở dao động vừa đủ, tay phụ cân bằng. Không biến run thành lướt đứng yên. |
| ST | Chuẩn bị palm-up → tay phụ seal → khóa hướng đồng minh → dâng tay ra trước/lên → giữ hộ đạo → về palm-up neutral đủ chiều cao. |
| AOE | Palm-up → inner seal tay phụ → trụ khóa → tay phụ mở veil ra ngoài → giữ thế trình bày → trở về neutral. Không kết thúc bằng kneel thấp hơn neutral. |
| hit | Flinch/mềm gối, tay mở đỡ thế, đứng lại; orb riêng có thể giữ/suspend theo presentation facts. |
| death | Khuỵu, ngã, chạm đất, lắng, corpse nằm; bàn tay thả tự nhiên, orb không nằm trong pixels corpse. |
| meditate | Mọi key đã ngồi lotus; lòng tay trên đùi hoặc seal nhẹ. Orb riêng có thể ở trên lap/hand socket thật. |
| gather | Tay thao tác vươn xuống/lên/xem lòng tay rồi đứng; orb stow/hover riêng để tay nhặt không giả giữ orb. |

Không vẽ Châu, temple/mountain, sanctuary, veil, qi, target hoặc glow vào body. Núi/đền trong FX Nội Giới là apparition riêng camera-facing; không biến chúng thành môi trường thật hoặc fake tám view body.

| Clock fixture | Warning | Release | Active end | Body end |
|---|---:|---:|---:|---:|
| ST | 180 | 600 | 820 | 1380 |
| AOE | 280 | 900 | 2050 | 2640 |

ST support tại 600 ms, duration 900 ms: fact còn hiệu lực tới 1500 ms dù body kết thúc ở 1380 ms. Không reset support khi body xong. AOE có ba pulse tại 900/1350/1800 ms; mỗi sanctuary support duration 700 ms và border control duration 450 ms theo hợp đồng P2. Pulse cuối có support tới 2500 ms và control tới 2250 ms, độc lập tuổi body/active art.

Các duration sáu key giữ key 4 đúng release và key 6 đúng active end. Nếu số key nguồn thực đổi, packer phân thời gian lại theo phase anchor có bằng chứng; không clone frame để giữ số sáu.

## Socket và prop

Đo palmCenter và sourcePalm thật, ghi palm-up/open/seal/occluded/fragment đúng anatomy. Hover offset được renderer chọn phía trên palm, không diễn giải là grip. Chỉ đo khoảng hở/cuff/occlusion thực; không tự thêm khoảng cách mặc định từ prompt thành phép đo.

N/NE/NW có thể che palm-up bởi cổ tay hoặc cuff; ghi vị trí forearm endpoint/candidate và uncertainty. Khi mất bằng chứng palm, hover dùng anchor ngực/caster với policy rõ; không dùng mảng áo/face làm hand skin. Nếu hai tay đều thấy được, ghi alternate palm theo cùng source.

Prop tròn được phép reuse orientation khi registration khai spherical invariant và fixed engraving camera. Điều này không chứng minh body tám hướng hoặc tám bản khắc. Body từng view vẫn được vẽ riêng.

## Fact và gate đọc hình

ST khóa đồng minh. AOE dùng ba sanctuary và border từ Core. Support/control facts riêng theo cast/pulse/target/spawnLife/effectId; không giả hit/damage/practice credit. ART palm extension không tự tạo contact; cancel trước release không có support, late fact vẫn xử lý theo tuổi/life/dedup Core.

So own P1/Wang cùng hướng ở native 1×/2×, kiểm khoảng hở ở palm và silhouette sleeve rộng. Động tác mở veil đọc bằng tay phụ và thân trụ, không làm head/torso to hơn neutral. Meditation/corpse cần root mặt đỡ đất/hip với uncertainty thật; không fit ngồi/ngã bằng chiều cao đứng.
