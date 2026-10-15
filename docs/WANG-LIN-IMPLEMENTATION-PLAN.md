# Kế hoạch triển khai Huyễn Tâm và Tịch Bạch

> **Cập nhật triển khai ·15/10:** Phạm vi và thứ tự toàn game theo [kế hoạch asset đã thống nhất](ITEM-MATERIAL-ASSET-MASTER-PLAN-GDD-035.md); tài liệu này chỉ chi tiết nhánh nhân vật/pháp bảo. Theo [hợp đồng GDD 0.35](GDD-035-UNIFIED-CONTRACT.md), owner cho phép làm lại logic bản chạy chưa đưa vào test. Gói production cũ đã retire cho test build; [GDD character animation pack](design/characters/gdd-character-animation-v1/README.md) là nguồn tiếp nối, còn adapter runtime sẽ làm sau. Bảng P0–P8 dưới đây giữ kế hoạch gốc và không phải backlog đã tích hợp.

Ngày 14/10/2026, owner duyệt **cả Huyễn Tâm và Tịch Bạch**, cùng concept Kiếm linh, Hồn phiên, Xạ Thần Xa và Thiên Nghịch Châu. Cả hai nhân vật được sản xuất riêng về nhận diện, có đủ bốn bộ áo và pháp bảo. Vương Lâm live tiếp tục làm chuẩn tỷ lệ người và nét pixel.

Triển khai theo một lát Kiếm linh cho cả hai nhân vật trước, đồng thời prototype cơ chế ST/AOE của cả bốn họ. Khi lát đầu chứng minh được anatomy, grip, nhiều mục tiêu và cách ghép body–gear–FX, mở đủ tám hướng rồi triển khai Hồn phiên, Xạ Thần Xa và Thiên Nghịch Châu. Mốc luyện hóa được hoàn thiện trước; diện mạo nhập đạo và ý cảnh theo sau cùng luồng nguồn, điều kiện và quyền vận dụng.

[Bảng tiến độ lịch sử](design/characters/gdd-character-concepts-v1/index.html) · [Dữ liệu GDD mới](design/characters/gdd-character-animation-v1/progress.json) · [Duyệt neutral](design/characters/gdd-character-concepts-v1/approval.json)

## Căn cứ đã duyệt

Approval pin **86 file**, gồm 18 nguồn concept được chọn, 10 preview native và hồ sơ nguồn/kiểm. Nhận diện A dùng tên hiển thị **Huyễn Tâm**; tên nguồn cũ **Huyền Tâm** giữ trong provenance. Nhận diện B là **Tịch Bạch**. Các ID nguồn `a/b` giữ nguyên.

Concept đã duyệt gồm hai master, tám bộ áo/pháp bảo, bốn board tiến hóa và bốn board đơn mục tiêu/AOE. Các board diễn họa nhận diện A; Tịch Bạch kế thừa cấu trúc đã duyệt và có nguồn motion/diện mạo tiến hóa riêng khi sản xuất. Preview 80 px là căn cứ concept; neutral sản xuất cần tách body và đạo cụ, rồi kiểm lại anatomy và grip.

Nguồn V5 được khóa ghi. Motion, view, FX production và gameplay tiếp nối nằm trong gói mới với approval theo đúng tài sản đã xem. Nguồn banner A lỗi framing giữ lịch sử; bản chọn là `banner-a-r2`.

## Thứ tự triển khai và bàn giao

| Đợt | Công việc | Bàn giao | Điều kiện đi tiếp |
| --- | --- | --- | --- |
| P0 | Ghi duyệt concept | Approval theo hash, nguồn khóa | Đã hoàn tất |
| P1 | Neutral sản xuất và trang bị Đông Nam | 8 body-only, 8 gear, pivot/socket và review 1× | Hai identity đúng; body 80 px, tay và giày đọc rõ |
| P2 | Đặc tả và prototype cả bốn ST/AOE | 8 hợp đồng chiêu, fixture nhiều mục tiêu và bốn nhịp | Geometry, pulse/cap, cancel, resolve/credit qua |
| P3 | Pilot Kiếm linh cho cả hai nhân vật | Đông Nam/Bắc, 16 body clip, 8 gear track và 10 sequence FX | Body/gear/FX riêng; góc sau, grip, nhiều contact và lifecycle qua |
| P4 | Kiếm linh đủ tám hướng và action | Hai bộ Kiếm, bindings và scoped sync | Đủ hành vi cho lát playable, gồm đòn thường phù hợp |
| P5 | Hồn phiên → Xạ Thần Xa → Thiên Nghịch Châu | Mỗi họ có pilot rồi tám hướng, kit FX và test riêng | Motion và FX khớp cơ chế P2, kiểm cả hai identity |
| P6 | Registry, trang bị, save và peer render | Identity/appearance server, migration và đổi đồ có luật | Save cũ giữ đúng; đủ binding, không replay lệnh sau reconnect |
| P7 | Nhập đạo, luyện hóa và ý cảnh | Mốc I/III và nguồn–điều kiện–quyền sử dụng | Tiến triển có thành quả thực, không cấp trọng bảo từ nhập môn |
| P8 | Encounter chơi thử và release theo phạm vi | Solo/peer/crowd, QA và delivery | Art, Core, save và credit đều đủ trên fixture |

P1 và P2 chạy song song. P6 có thể bám lát Kiếm đã hoàn chỉnh trong khi P5 sản xuất các họ còn lại. Việc tích hợp từng họ chỉ bật khi registry, cơ chế và toàn bộ binding tương ứng đã đủ.

## Bàn giao đầu tiên

Đợt đầu tạo tám neutral Đông Nam cho hai nhân vật × bốn họ, với body và gear tách riêng. Nguồn production lấy master mới của đúng nhân vật làm căn cứ nhận diện; không vá lại mặt, tóc hoặc da từ Wang live. Neutral và pose phải giữ morphology qua thay áo, không chỉ đạt height 80.

Prototype đồng thời tám cách vận dụng trên sân riêng: đòn đơn và AOE của Kiếm, Phiên, Xa và Châu. Dùng hình vùng đơn giản để kiểm cơ chế trước khi phụ thuộc artwork. Sân có nhiều target, target rời/chết/đổi life, hụt, hủy trước/sau release, facts trễ và reconnect.

Pilot motion dùng **cả hai nhân vật**, hai hướng **Đông Nam và Bắc**, bốn action **idle, run, cast ST, cast AOE**: **2 × 2 × 4 = 16 clip**. Dự toán ban đầu sáu key/clip là 96 pose; action được tăng/giảm key và holds theo nhịp thực. Kiếm linh có 10 sequence FX, dự toán 60 key, và tám gear track cho hai cast. Pilot là sân kiểm presentation; hit/death, đòn thường và các hành vi còn lại được hoàn thiện trước khi bật nhân vật chơi đủ trong game.

Review cần cho thấy idle → cast → run không đổi cỡ đầu/thân, hướng Bắc đúng lưng, cổ tay giữ gear, FX không che mặt hoặc tín hiệu vùng. Khi pilot đã qua, mở tám view thật và action nền. Không dùng mirror để đủ hướng, không dùng hình Wang làm fallback cho binding thiếu.

## Cơ chế và chữ ký của bốn pháp bảo

| Họ | Đơn mục tiêu | AOE | Phần Core cần chốt |
| --- | --- | --- | --- |
| Kiếm linh | Một trục cắt và linh kiếm | Ba hành lang kiếm giữa hai dãy cọc | Origin/aim khóa, target giao nhiều tuyến, cap theo cast/pulse và contact riêng |
| Hồn phiên | Một chủ hồn theo dải khí | Ba cổng, dòng hội tụ và khoảng tâm | Anchor/vùng hiệu lực, pulse/stack, luật khống chế nếu chọn, thu/hủy field |
| Xạ Thần Xa | Giải một mắt niêm và giằng một target | Hai rail xích, ba điểm dậm nối tiếp | Thiết bị triển/thu, pulse theo node, cap, contact tại chân và đường né hai bên |
| Thiên Nghịch Châu | Hộ đạo tại một người hoặc điểm | Nếp nội giới và ba điểm trú | Ally/enemy/point policy, duration/expiry, facts hỗ trợ/control và credit riêng |

Mỗi hợp đồng skill ghi intent, target policy, cách báo vùng, mốc khóa, release/resolve, recovery, pulse/cap, cost/cooldown, luật hủy và điều kiện trang bị. Các số đầu là baseline thử nghiệm; không lấy thời lượng storyboard hoặc cỡ hình làm balance.

Hình linh thể và dải khí thể hiện facts do server xác nhận. Renderer không tạo damage, ép vị trí enemy hoặc cấp credit. Châu cần facts hộ đạo/control thay vì `hit` giả hoặc cộng `practiceHits`; AOE ngoài thực tại là cơ chế game chuyển thể, không suy thành năng lực sát thương canon hoặc nguồn offline tu vi.

## Khối lượng ART và cách mở rộng

Phạm vi cơ sở ở mốc II là **8 tạo hình = 2 nhân vật × 4 họ**. Mỗi tạo hình cần tám hướng thật. Run phục vụ cả đi thường và Shift; giữ policy locomotion hiện hành.

| Hạng mục mốc II | Công thức | Dự toán |
| --- | --- | ---: |
| Neutral body | 8 tạo hình × 8 hướng | 64 pose |
| Action nền | idle/run/hit/death/meditate/gather × 8 × 8 | 384 clip |
| Cast riêng | ST/AOE × 8 × 8 | 128 clip |
| Body cơ sở | 8 action × 8 × 8 | **512 clip** |
| Combo ba bước nếu duy trì F cho cả tám bộ | 3 action × 8 × 8 | thêm 192 clip |
| Body gồm combo dự phòng | 512 + 192 | **704 clip** |
| FX | 4 họ × 2 cách vận dụng × 5 phase | **40 sequence** |
| Gear resting | 8 appearance × 8 hướng | 64 view |
| Gear cho ST/AOE | 8 appearance × 8 hướng × 2 action | 128 track |

Sáu key/clip chỉ là định mức dự toán: 512 clip khoảng 3.072 pose; có combo là 4.224 pose. Basic presentation của từng họ được thiết kế theo luật F được chọn; đủ đòn thường là điều kiện tích hợp, không tự coi mọi món là kiếm cận chiến. Tổng gear frame còn phụ thuộc socket tĩnh, vải phiên, xích, chuyển động áo và death qua pilot.

FX gồm ST warning/charge/release/resolve/tail và AOE warning/deploy/active/contact/collapse. Hai nhân vật có thể dùng chung kit khi mechanic và palette trùng; biến thể FX riêng làm tăng số nguồn. Topology AOE được dựng từ instance cọc kiếm, cổng, rail và contact theo facts; số lượng địch không nhân số sprite. Dị thú có phối cảnh cần view phù hợp, không xoay bitmap để giả tám hướng.

Có thể tái sử dụng choreography, timeline, tooling và phương pháp registration. Mỗi bộ áo/identity vẫn cần artwork và QA riêng, đặc biệt tóc, vạt áo, bàn tay và quan hệ che khuất. Body, gear, warning, rear/front FX và contact giữ layer riêng; canvas rộng chỉ là padding, không tăng body/collider.

Nếu ba chặng đều đổi toàn bộ áo và làm đủ motion thì **24 appearance × 8 hướng × 8 action = 1.536 clip**, hoặc 2.112 clip khi thêm combo ba bước. Sau pilot sẽ đo chi phí nguồn sửa, gen, registration và QA để quyết định mức khác biệt cần sản xuất ở mốc I/III. Chưa đặt lịch ngày hoàn thành hoặc chi phí cố định khi chưa có dữ liệu pilot.

## Luồng tiến hóa và sở hữu

| Mốc | Chặng | Trải nghiệm cần có |
| --- | --- | --- |
| I Tự mở đường | Ngưng Khí → Trúc Cơ | Nhận biết vật/phương pháp, áo và công cụ tiền thân; một cách vận dụng dễ đọc |
| II Luyện hóa thành bản sắc | Kết Đan → Nguyên Anh | Đủ điều kiện luyện hóa, trang bị có vai trò, linh ảnh và ST/AOE riêng |
| III Đạo của chính mình | Hóa Thần | Ý cảnh đổi cách tổ chức chiến trường; thân vẫn compact, sức mạnh có nhịp tĩnh và hồi thế |

Luồng mỗi món là **nguồn/cơ duyên → nhận biết → hiểu giới hạn và điều kiện → luyện hóa → trang bị → vận dụng → nâng cách triển khai**. Quyền sở hữu, quyền thi triển, diện mạo và cảnh giới là các dữ liệu khác nhau. Nhận được món chưa đồng nghĩa dùng toàn lực; server chỉ mở trạng thái đã đủ proof. Mốc I/III của Tịch Bạch có nguồn riêng, giữ nhận diện bạc đã duyệt.

Các nhiệm vụ/recipe/grant phục vụ pháp bảo được đặc tả thành nội dung mới theo [thiết kế hành trình](CULTIVATION-REDESIGN-2026-10-13.md). Không biến HN05 hữu hạn thành farm hoặc cấp bốn trọng bảo cho hồ sơ cũ. Các library R01–R05, actor và map đã duyệt giữ làm basis; gói mới không ghi đè chúng.

## Công việc engine và lưu dữ liệu

Nền hiện hành tái dùng được command/receipt, server clock, release/recovery/cancel, animation bindings, Three và scoped sync. AOE cần mở hợp đồng trước khi nối hình: skills hiện chỉ ba R01, target luyện thuộc caster và cooldown có trường cố định; `ChapterActivity` lưu một enemy. Prototype đa mục tiêu dùng activity/attempt fixture riêng.

`SkillTimeline` đang dedup bằng cast + event type. Đa-hit cần thêm pulse, target và spawnLife trong khóa, cùng effect ID độc lập để các contact không bị bỏ sau hit đầu. Origin, aim và shape khóa ở server; target rời/chết/đổi life phải được giải quyết theo luật rõ.

Hai identity và appearance được đăng ký riêng. Đổi áo/pháp bảo không thay `avatarId`, tên hồ sơ hoặc progressionKind. Loader đang kiểm năm actor và presentation hardcode Wang cần chuyển sang registry kiểm completeness, demand load và báo binding thiếu. Inventory v1/codec chỉ nhận cấu trúc hiện hành cần version và migration có test; không nới validator để nhận tùy ý JSON review.

Entry, tạo hồ sơ và peer render cần chính sách cho tài khoản cũ, giữ ba hồ sơ hiện có và receipt/namespace cũ. Equip là giao dịch server-authoritative; policy đầu chặn đổi giữa cast để giữ appearance/cost/cooldown nhất quán. Reconnect không tự queue lại equip/cast hay damage. Thử toàn bộ bằng DB, publicDir và context browser fixture trước ghép vào release.

## Kiểm và điều kiện release

Gameplay kiểm biên shape, góc/tầm/LOS, target giao nhiều vùng, cap/pulse đúng một lần, hủy, target life và duplicate/late facts. Châu kiểm quyền ally/point, support expiry và credit. Save kiểm old profile, new identity, ownership, atomic equip/save, reload/restart và peer projection.

ART kiểm source/native/atlas hash, alpha/gutter, world foot, grip/occlusion và chuyển action. Review 1× trên nền sáng/tối/map, Three UV/pivot/texture swap, hidden/offline/reduced motion và cache hữu hạn. Encounter 3/6/12/18 target kiểm spacing, nhịp và FX budget; giữ body và warning đọc rõ.

Khi chạm các module liên quan, chạy `test:game-entry`, `test:hang-nhac-character`, `test:hang-nhac-r01`, `test:skill-aim`, `test:game-actor-actions`, `test:wind-motion` khi sửa movement, cùng chapter/lessons/sect/reload/HUD phù hợp. Sửa catalog chạy check/test content-catalog; kiểm typecheck và module boundary. Builder/sync chỉ ghi gói mới và fixture; `npm assets/build` tổng hiện có map builder nên không dùng làm kiểm gói này.

Trong yêu cầu này đã hoàn tất mốc duyệt và kế hoạch. Công việc bắt đầu tiếp theo là **P1 + P2**, rồi bàn giao pilot **P3 cho cả hai nhân vật**. Chưa phát sinh lượt gen production hoặc thay luật game từ việc ghi kế hoạch.
