# Mục lục tài liệu _MMO

**Rà soát:** 08/10/2026. Đọc [trạng thái dự án](PROJECT-STATUS.md) và [GDD 0.28](GDD.md) trước. ART Hằng Nhạc cũ, các walk study và bộ concept/nền/ba asset thử đã xóa. [Map mới](design/world/hang-nhac-map-v1/README.md) đã lưu navigation owner; nền runtime, hồ sơ/R01 và [mở đầu môn phái HN01–HN02](HANG-NHAC-SECT-RUNTIME.md) đã có bản thử. Tiếp nối HN03–HN04, rồi farm/khảo nghiệm riêng theo GDD. Hồ sơ thiết kế không chứng minh tính năng đã triển khai.

Tài liệu runtime ghi code 0.12.0; tài liệu thiết kế tách quyết định đã chốt với đề xuất; lịch sử giữ nguyên số liệu theo thời điểm nguồn. Prompt, source/approval manifest và verification là hồ sơ sản xuất/kiểm tra, không sửa để khớp trạng thái mới. Các gói ZIP VFX được sinh/đóng riêng và bị Git ignore; xem hướng dẫn trong bàn giao khi tải hoặc đóng lại.

[Kế hoạch triển khai Hằng Nhạc sau khi chốt map](HANG-NHAC-IMPLEMENTATION-PLAN.md).

[Runtime Hằng Nhạc — TypeScript, nền/collision client/server](HANG-NHAC-RUNTIME.md).

## Thiết kế, công nghệ và hướng dẫn gốc

| Tài liệu | Vai trò/trạng thái |
| --- | --- |
| [Công cụ preview animation và di chuyển — v1](ANIMATION-PREVIEW-SPEC.md) | Catalog 6 bộ/136 frame và chức năng preview |
| [Định hướng ART — TuTiên](ART-DIRECTION.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Kế hoạch asset — TuTiên](ASSET-PLAN.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Backend tối thiểu — sân môn phái online](BACKEND-PREVIEW.md) | Hằng Nhạc lưu SQLite và R01; fixture cũ RAM |
| [Hằng Nhạc — hồ sơ riêng và ba thuật R01](HANG-NHAC-R01-RUNTIME.md) | Hồ sơ khách, lưu/khôi phục, luật thử và adapter VFX đã chạy |
| [Skill core — gameplay, animation và VFX](SKILL-CORE.md) | Kiến trúc, cách thêm/debug skill; R01 có đủ 36 binding bộ ba/bốn hướng |
| [Nhân vật — ba lựa chọn chơi được từ đầu](CHARACTERS.md) | Bộ ba playable từ đầu và roster/canon tham chiếu |
| [Chuẩn chibi trên map — năm nhân vật](CHIBI-ROSTER-SPEC.md) | 5 bộ chibi/100 frame và mức duyệt từng bộ |
| [Bộ ba người chơi — kế hoạch động tác](CORE-CHARACTER-MOTION-PLAN.md) | 60 frame chibi bộ ba; động tác thêm chưa hoàn tất |
| [Ba nhân vật trọng tâm — nhận diện và gói tạo hình đầu tiên](CORE-CHARACTER-VISUAL-SPEC.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Hệ thống tu tiên — ba nhân vật chơi được](CULTIVATION-SYSTEM.md) | Khung tu tiên; luật chi tiết còn thiết kế |
| [Quái, nguy hiểm và chiến đấu — MVP và dài hạn](ENCOUNTERS-STORY-REFERENCE.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Quái, nguy hiểm và chiến đấu — hồ sơ lịch sử](ENCOUNTERS.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Sửa bộ đi bộ — tay và chân (hồ sơ trước chibi)](GAIT-CORRECTION.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Tham chiếu mới — tỷ lệ chibi và bước đi nhỏ](GAIT-REFERENCE-REVIEW.md) | Nguồn phản hồi/tỷ lệ chibi; xem bộ bốn hướng đã sản xuất |
| [GDD — Tiên Nghịch: Hành Trình Vương Lâm](GDD-IDLE-REFERENCE-v0.26.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [GDD — Tiên Nghịch: MMORPG Tu Tiên](GDD.md) | Nguồn hướng sản phẩm 0.28; tách đã chốt và đề xuất |
| [Đối thủ và khảo nghiệm nhập môn Hằng Nhạc](HANG-NHAC-ENCOUNTERS-TRIAL.md) | Đặc tả đề xuất; số liệu/vận hành chưa khóa |
| [Hằng Nhạc — map và bố cục v0.1](HANG-NHAC-MAP-LAYOUT.md) | Đặc tả đề xuất; số liệu/vận hành chưa khóa |
| [Đặc tả trải nghiệm Hằng Nhạc — Ngưng Khí](HANG-NHAC-NGUNG-KHI-SPEC.md) | Đặc tả đề xuất; số liệu/vận hành chưa khóa |
| [Tiến trình tu luyện và phần thưởng Hằng Nhạc](HANG-NHAC-PROGRESSION-REWARDS.md) | Đặc tả đề xuất; số liệu/vận hành chưa khóa |
| [ART map legacy — ghi chú lịch sử](MAP-ART-DESIGN.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Phân công xây map — 08/10/2026](MAP-ASSET-PRODUCTION-NOTES.md) | Phân công hiện hành: chủ dự án bố trí level/navigation |
| [Bắt đầu lại thư viện map](MAP-ASSETS-RESET.md) | Các đợt xóa ART; quy trình map tổng trước, navigation rồi asset |
| [Quy tắc xây map cho game-solo](MAP-BUILDING-GUIDE.md) | Quy tắc sản xuất/biên tập map hiện hành |
| [Quy trình map: concept tổng → vẽ từng khu → ghép](MAP-CONCEPT-SECTOR-WORKFLOW.md) | Quy trình đã chọn: concept, khu chi tiết, căn/ghép, nền web, navigation rồi asset |
| [Kế hoạch đoạn ngoại viện legacy — ghi chú lịch sử, đã dừng](MAP-COURTYARD-PILOT-PLAN.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Nghiên cứu workflow Level Design — 08/10/2026](MAP-EDITOR-ENGINE-RESEARCH.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Map Editor — thiết kế level trong dự án](MAP-EDITOR.md) | Công cụ đã có 0.12.0; giới hạn tích hợp |
| [MAP03 phân lớp — ghi chú lịch sử, đã dừng](MAP-LAYERED-DESIGN.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Level Design trong Map Editor](MAP-LEVEL-DESIGN.md) | Level Design 0.12.0; release Hằng Nhạc đã nối client/server |
| [Định hướng MMORPG tu luyện có cơ chế idle](MMORPG-DIRECTION-REFERENCE.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Định hướng MMORPG — Hằng Nhạc và hành trình nhân vật](MMORPG-DIRECTION.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Đặc tả hệ thống MVP A — lịch sử idle](MVP-A-SPEC.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Backlog MVP — Tiên Nghịch: Hành Trình Vương Lâm](MVP-BACKLOG-IDLE-REFERENCE.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Backlog thiết kế — Hằng Nhạc và hệ thống tu tiên](MVP-BACKLOG.md) | Backlog hiện hành; chưa là tính năng hoàn thành |
| [MVP RPG — nhập môn Hằng Nhạc theo GDD 0.28](MVP-RPG-A.md) | Phạm vi nhập môn theo GDD mới; chưa triển khai |
| [Hồ sơ gameplay Ngưng Khí — bộ kỹ năng khởi đầu](NGUNG-KHI-GAMEPLAY-SPEC.md) | Đặc tả đề xuất; số liệu/vận hành chưa khóa |
| [Định hướng online nhiều người — điều chỉnh GDD](ONLINE-DIRECTION-REFERENCE.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Định hướng online — ba nhân vật chơi được](ONLINE-DIRECTION.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Avatar đệ tử thử nghiệm — tạo hình và bộ pixel đầu tiên](PLAYER-AVATAR-VISUAL-SPEC.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Chạy preview, backend thử và Map Editor](PREVIEW-RUNBOOK.md) | Lệnh/URL hiện có; prototype và giới hạn vận hành |
| [NPC, HN01–HN02 và thổ nạp Hằng Nhạc](HANG-NHAC-SECT-RUNTIME.md) | Bản mở đầu bước 3: nhật ký/chỉ đường, M01, tích lũy online, vật tư và ledger riêng |
| [Trạng thái hiện hành của _MMO](PROJECT-STATUS.md) | Hiện trạng code, ART, thiết kế và ưu tiên map |
| [Map nhập môn 3840 × 2560 — tham chiếu prototype trước](STARTER-REGION-MAP.md) | Prototype di chuyển cũ; không là Hằng Nhạc mới |
| [Kịch bản nhập môn — ba nhân vật tại Hằng Nhạc](STARTER-STORY.md) | Mở đầu bộ ba; tách chuyển thể và canon |
| [Công nghệ client — TypeScript + Three.js](TECH-STACK.md) | Công nghệ và thành phần đã có; tích hợp còn thiếu |
| [Bộ thành phần UI — tham chiếu và yêu cầu biên tập](UI-COMPONENTS.md) | Mapping UI hiện hành và component snapshot idle |
| [Luồng màn hình MVP A — tham chiếu UX idle](UX-MVP-A.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Chi tiết màn hình và trạng thái — lịch sử UX idle](UX-SCREENS-AND-STATES.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Phân bổ ART/VFX kỹ năng theo cảnh giới](VFX-ART-PROGRESSION.md) | 15 skill đã duyệt/đóng ART; chưa tích hợp combat |
| [Vương Lâm — lưới pixel và bộ đứng/đi đầu tiên](WANG-LIN-SPRITE-SPEC.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Hồ sơ tạo hình Vương Lâm — giai đoạn nhập môn](WANG-LIN-VISUAL-SPEC.md) | Tài liệu hiện hành; đọc trạng thái đã chốt/đề xuất trong file |
| [Hệ thống map — MVP và dài hạn](WORLD-MAPS-IDLE-REFERENCE.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Hệ thống map — node truyện và kế hoạch lịch sử](WORLD-MAPS.md) | Hồ sơ lịch sử; xem nhãn và liên kết bản hiện hành |
| [Hình ảnh trên map — nhân vật pixel art, nền stylized 2D](WORLD-VISUAL-SPEC.md) | Hợp đồng hình ảnh/tỷ lệ; tách runtime và review R01 |

## Thư viện ART, nghiên cứu và pipeline

| Tài liệu | Vai trò/trạng thái |
| --- | --- |
| [Thư viện ART và bản phác UX](design/README.md) | Chỉ mục ART hiện có và 14 hình UX lịch sử |
| [Dàn nhân vật chibi theo chuẩn Vương Lâm](design/characters/chibi-roster-v1/README.md) | Bộ chibi hiện có; xem phiên bản/mức duyệt trong hồ sơ |
| [Bộ ba trọng tâm — nguồn nhận diện và mẫu tĩnh trước chibi](design/characters/core-trio-v1/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Chân dung UI — bộ ba trọng tâm v1](design/characters/core-ui-v1/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Bộ đi sửa tay/chân v1](design/characters/gait-correction-v1/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Đệ tử người chơi v2 — tạo hình và sprite thử](design/characters/player-avatars-v2/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Vương Lâm chibi — mẫu một hướng v1](design/characters/wang-lin-chibi-pilot-v1/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Vương Lâm áo xám chibi — đứng và đi bốn hướng](design/characters/wang-lin-chibi-walk-v1/README.md) | Bộ chibi hiện có; xem phiên bản/mức duyệt trong hồ sơ |
| [Vương Lâm áo xám — đứng và đi v1](design/characters/wang-lin-gray-walk-v1/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Vương Lâm — thử sprite nét mịn và pixel art](design/characters/wang-lin-sprite-study/README.md) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [Bộ Hóa Thần · Ý cảnh theo công pháp · 1.0.0](design/vfx/HOA-THAN-KIT-V1.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần V2 · Áp lực và nhịp bật · 2.0.0](design/vfx/HOA-THAN-KIT-V2.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần V3 · Ngọc sáng, lụa khí và phù vàng · 3.0.0](design/vfx/HOA-THAN-KIT-V3.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần V3 · Ngọc sáng, lụa khí và phù vàng · pack 3.0.1 / source 3.0.0](design/vfx/HOA-THAN-KIT.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Bộ Kết Đan · 1.0.0](design/vfx/KET-DAN-KIT.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Kiếm Khí Ngưng Khí — Vương Lâm chibi, preview v2](design/vfx/KIEM-KHI-R01.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Bộ kỹ năng Ngưng Khí · nguồn 1.1.0 / duyệt 07-10-2026](design/vfx/NGUNG-KHI-KIT.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Bộ Nguyên Anh · Linh ảnh khí ấn · source 2.0.0 / pack 2.0.1](design/vfx/NGUYEN-ANH-KIT.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Kiếm Khí R01 — Vương Lâm chibi, preview v2](design/vfx/README-v2.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Thư viện skill / VFX tu tiên](design/vfx/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Bàn giao skill/VFX nhập môn và nâng cấp](design/vfx/STARTER-VFX-HANDOFF.md) | Nguồn trạng thái duyệt/pack hiện hành của 15 skill |
| [Bộ Trúc Cơ · 1.0.0](design/vfx/TRUC-CO-KIT.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Pipeline Frame-by-Frame — Kiếm Khí R01](design/vfx/frame-by-frame-r01/PIPELINE.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [P3 · Trúc Cơ · hồ sơ sản xuất 1.0.0](design/vfx/milestones/P3-TRUC-CO.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [P4 · Kết Đan](design/vfx/milestones/P4-KET-DAN.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [P5 · Nguyên Anh rồi Hóa Thần](design/vfx/milestones/P5-NGUYEN-ANH.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R04 sword · Linh ảnh khí ấn · 2.0.0](design/vfx/r04-sword-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R04 thunder · Linh ảnh khí ấn · 2.0.0](design/vfx/r04-thunder-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R04 wind · Linh ảnh khí ấn · 2.0.0](design/vfx/r04-wind-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R05 sword · 1.0.0](design/vfx/r05-sword-v1/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần sword · 2.0.0](design/vfx/r05-sword-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Ý Cảnh Kiếm · R05 V3](design/vfx/r05-sword-v3/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R05 thunder · 1.0.0](design/vfx/r05-thunder-v1/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần thunder · 2.0.0](design/vfx/r05-thunder-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Ý Cảnh Lôi · R05 V3](design/vfx/r05-thunder-v3/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [R05 wind · 1.0.0](design/vfx/r05-wind-v1/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Hóa Thần wind · 2.0.0](design/vfx/r05-wind-v2/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Ý Cảnh Phong · R05 V3](design/vfx/r05-wind-v3/README.md) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [Bộ thử Hằng Nhạc đã xóa](design/world/hang-nhac-asset-pilot-v1/README.md) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [Bộ thử Hằng Nhạc đã xóa](design/world/hang-nhac-concept-v1/README.md) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [Bộ thử Hằng Nhạc đã xóa](design/world/hang-nhac-ground-v1/README.md) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [Hằng Nhạc — map đầy đủ để thiết kế level v1](design/world/hang-nhac-map-v1/README.md) | Map đầy đủ để thiết kế level; navigation owner đã lưu; asset rời/tích hợp còn làm |
| [Hằng Nhạc — chi tiết C theo từng khu](design/world/hang-nhac-map-v1/detail-c-v4/README.md) | Map đầy đủ để thiết kế level; navigation owner đã lưu; asset rời/tích hợp còn làm |
| [Thư viện asset map mới](design/world/map-asset-library/README.md) | Thư viện editor mới trống sau reset |

## Snapshot trước hướng bộ ba playable

| Tài liệu | Vai trò/trạng thái |
| --- | --- |
| [Dàn nhân vật và tạo hình — bản online](archive/design-before-three-playable-characters/CHARACTERS.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [GDD — Tiên Nghịch: Hành Trình Vương Lâm](archive/design-before-three-playable-characters/GDD.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [Định hướng MMORPG tu luyện có cơ chế idle](archive/design-before-three-playable-characters/MMORPG-DIRECTION.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [Backlog MVP — Tiên Nghịch: Hành Trình Vương Lâm](archive/design-before-three-playable-characters/MVP-BACKLOG.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [MVP A mới — nhập môn Hằng Nhạc, nhiệm vụ và chiến đấu](archive/design-before-three-playable-characters/MVP-RPG-A.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [Định hướng online nhiều người — điều chỉnh GDD](archive/design-before-three-playable-characters/ONLINE-DIRECTION.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [Lịch sử trước hướng ba nhân vật playable](archive/design-before-three-playable-characters/README.md) | Snapshot lịch sử; không dùng làm luật hiện hành |
| [Kịch bản nhập môn — đệ tử mới ở Hằng Nhạc](archive/design-before-three-playable-characters/STARTER-STORY.md) | Snapshot lịch sử; không dùng làm luật hiện hành |

## Các trang duyệt HTML

Trang duyệt không tự cấp trạng thái vận hành. Mở trực tiếp từ docs khi trang dùng source tại chỗ; URL localhost trong runbook cần dev server. Những route client cũ đã chuyển sang Map Editor.

| Trang | Vai trò/trạng thái |
| --- | --- |
| [design/characters/chibi-roster-v1/index.html](design/characters/chibi-roster-v1/index.html) | Bộ chibi hiện có; xem phiên bản/mức duyệt trong hồ sơ |
| [design/characters/core-trio-v1/index.html](design/characters/core-trio-v1/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/core-ui-v1/index.html](design/characters/core-ui-v1/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/gait-correction-v1/index.html](design/characters/gait-correction-v1/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/index.html](design/characters/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/player-avatars-v2/index.html](design/characters/player-avatars-v2/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/wang-lin-gray-walk-v1/index.html](design/characters/wang-lin-gray-walk-v1/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/characters/wang-lin-sprite-study/index.html](design/characters/wang-lin-sprite-study/index.html) | Nghiên cứu/nguồn ART theo phiên bản; không tự suy duyệt mới |
| [design/index.html](design/index.html) | 14 bản phác UX idle lịch sử |
| [design/vfx/hoa-than-jade-kit.html](design/vfx/hoa-than-jade-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/hoa-than-kit.html](design/vfx/hoa-than-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/ket-dan-kit.html](design/vfx/ket-dan-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/kiem-khi-preview-v1.html](design/vfx/kiem-khi-preview-v1.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/kiem-khi-preview-v2.html](design/vfx/kiem-khi-preview-v2.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/kiem-khi-preview.html](design/vfx/kiem-khi-preview.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/ngung-khi-kit.html](design/vfx/ngung-khi-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/nguyen-anh-kit.html](design/vfx/nguyen-anh-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/skill-library.html](design/vfx/skill-library.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/vfx/truc-co-kit.html](design/vfx/truc-co-kit.html) | Hồ sơ ART/pipeline theo phiên bản; trạng thái hiện hành ở handoff |
| [design/world/hang-nhac-asset-pilot-v1/index.html](design/world/hang-nhac-asset-pilot-v1/index.html) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [design/world/hang-nhac-concept-v1/camera-study.html](design/world/hang-nhac-concept-v1/camera-study.html) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [design/world/hang-nhac-concept-v1/index.html](design/world/hang-nhac-concept-v1/index.html) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [design/world/hang-nhac-ground-v1/index.html](design/world/hang-nhac-ground-v1/index.html) | Bộ thử đã xóa; chỉ còn thông báo chuyển sang map đầy đủ mới |
| [design/world/hang-nhac-map-v1/index.html](design/world/hang-nhac-map-v1/index.html) | Map đầy đủ để thiết kế level; navigation owner đã lưu; asset rời/tích hợp còn làm |
| [design/world/map-asset-library/index.html](design/world/map-asset-library/index.html) | Thư viện editor mới trống sau reset |

## Dữ liệu và chứng cứ

- [client-tech-preview-design.json](data/client-tech-preview-design.json) là cấu hình nguồn catalog mà script sync asset đọc; không đổi enum kỹ thuật để suy ra quyền chọn playable.
- [character-roster.json](data/character-roster.json) và [motion plan](data/core-character-motion-plan.json) phân biệt nguồn nhân vật, ART đã có và phần dự kiến.
- [mvp-rpg-content.json](data/mvp-rpg-content.json), [catalog idle](data/mvp-content-catalog.json), [save mẫu](data/mvp-save-example.json) và [fixture UX](design/mockup-fixtures.json) giữ dữ liệu prototype/snapshot cũ; không là luật game mới hoặc save online.
- [preview](data/preview-verification.json), [editor](data/map-editor-verification.json), [level design](data/level-design-verification.json) và [starter region](data/starter-region-verification.json) là hồ sơ kiểm tra đã lưu; đối chiếu ngày/phạm vi khi đọc.
- [Reset legacy](data/map-assets-reset.json) và [biên bản xóa Hằng Nhạc](data/hang-nhac-art-removal-2026-10-08.json) lưu danh sách file đã dọn; bộ ART và hai bản thử vùng đi đã xóa. Source/prompt, hash, approval và verification của nhân vật/VFX còn lại giữ bằng chứng sản xuất. Lịch sử duyệt một bản không tự áp cho bản sửa mới.
