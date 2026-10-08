# game-solo

Dự án game web theo hướng **MMORPG tu luyện có cơ chế idle**, dành cho một người phát triển. Client dùng **TypeScript + Three.js**, backend thử nghiệm dùng **TypeScript + Node.js + Colyseus**. Người chơi chọn **Vương Lâm, Tư Đồ Nam hoặc Lý Mộ Uyển từ đầu**, nhập môn tại **Hằng Nhạc qua Ngưng Khí**, rồi phân hóa lối chơi và tuyến tu luyện từ hành trình Trúc Cơ. Mở đầu chung là chuyển thể của game, không phải sự kiện ba người cùng nhập môn trong nguyên tác.

## Chạy bản thử

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/**. Có ba chế độ: xem animation, thử trên map và sân chung online. Năm bộ sprite có **116 frame**; Vương Lâm/hai đệ tử dùng bản sửa tám pose đi mỗi hướng, hình đứng giữ nguyên. Hai cửa sổ có thể vào sân bằng hai mẫu đệ tử để thấy nhau di chuyển. Server xử lý vị trí/tốc độ/va chạm và hỗ trợ kết nối lại. Chọn **So sánh tay/chân cũ và mới** để xem từng pha ở cùng thời lượng vòng bước.

**Mẫu mới theo reference:** mở **http://127.0.0.1:5173/chibi-pilot.html** để xem Vương Lâm đầu lớn/thân gọn, một hướng với 1 đứng + 4 pose đi bước nhỏ. Có đối chiếu bộ trước và đi trên sân bằng D/→ hoặc nút giữ. Bộ 116 frame trước được giữ để đối chiếu và cần chỉnh tiếp sau phản hồi; mẫu chibi mới chờ đánh giá.

Cần Node.js >= 22.12.0. Backend mặc định ở localhost:2567. Đây là phiên thử trong môi trường phát triển, chưa có tài khoản, lưu tiến trình, tu luyện hoặc chiến đấu. Xem [hướng dẫn chạy và kiểm tra](docs/PREVIEW-RUNBOOK.md), [hợp đồng backend bản thử](docs/BACKEND-PREVIEW.md) và [kết quả kiểm tra](docs/data/preview-verification.json).

## Tài liệu thiết kế

- [GDD phiên bản 0.28](docs/GDD.md): ba nhân vật từ đầu, bộ R01 chung có sẵn, Hằng Nhạc qua Ngưng Khí, sáu phần phát triển và phân hóa sau nhập môn.
- [Đặc tả trải nghiệm Hằng Nhạc — Ngưng Khí](docs/HANG-NHAC-NGUNG-KHI-SPEC.md): hành trình HN01–HN12, bốn mốc trải nghiệm, ba đoạn cá nhân, bình cảnh, khảo nghiệm và xuất hành; bản đề xuất chưa triển khai.
- [Hồ sơ gameplay Ngưng Khí](docs/NGUNG-KHI-GAMEPLAY-SPEC.md): Kiếm Khí/Lôi Ấn/Ngự Phong Bộ cho cả ba từ đầu; cơ chế, frame event và số liệu thử nghiệm chưa khóa.
- [Tiến trình tu luyện và phần thưởng Hằng Nhạc](docs/HANG-NHAC-PROGRESSION-REWARDS.md): nguồn 15 tầng, phân bổ mốc, tu vi/thưởng HN01–HN12, pháp khí/vật tư và idle; phạm vi/số liệu mới là đề xuất.
- [Đối thủ và khảo nghiệm nhập môn Hằng Nhạc](docs/HANG-NHAC-ENCOUNTERS-TRIAL.md): ba mẫu AI/vùng/timing đòn, ba pha HN10, chủ khảo hai nhịp, checkpoint/thử lại và kết nối lại; bản thiết kế chưa triển khai.
- [Map và bố cục Hằng Nhạc](docs/HANG-NHAC-MAP-LAYOUT.md): bảy địa điểm/tám chức năng, sân trung tâm, hai vòng đi lại và arena riêng; phương án đầu để duyệt trước đặc tả vận hành.
- [Toàn nền Hằng Nhạc v3](docs/design/world/hang-nhac-art-v3/index.html): bảy địa điểm liền mạch, nguồn vùng đủ pixel cho camera 1×, phần vẽ sửa mép, Vương Lâm body 80 và khung hẹp; bản duyệt ART, chưa tích hợp game.
- [Nền mỹ thuật Hằng Nhạc v1](docs/design/world/hang-nhac-art-v1/index.html): xem nền môn phái mới, chọn địa điểm theo khung game và ghép Vương Lâm R01 để xem tỷ lệ; chưa tích hợp runtime/va chạm.
- [Thử tỷ lệ/camera Hằng Nhạc](docs/design/world/hang-nhac-art-v1/camera-study.html): Vương Lâm R01 body 80 ở 1×, camera bám/cố định, khung desktop và khung hẹp giữ cỡ nhân vật; chỉ là bản duyệt camera.
- [Hệ thống tu tiên](docs/CULTIVATION-SYSTEM.md): cảnh giới, công pháp, thuật pháp, pháp bảo, lĩnh ngộ, hành trình cá nhân; bình cảnh/đột phá và hồi phục Tư Đồ Nam.
- [Đối chiếu reference và hướng sửa](docs/GAIT-REFERENCE-REVIEW.md): tỷ lệ mới, bước nhỏ, tay gần thân và thứ tự kiểm tra một hướng.
- [Nguồn/prompt mẫu chibi](docs/design/characters/wang-lin-chibi-pilot-v1/README.md): PNG v1/v2, atlas native và kết quả kiểm tra; tạo bằng imagegen tích hợp.
- [Công nghệ client](docs/TECH-STACK.md): vai trò TypeScript, Three.js, UI và thành phần dùng chung với preview.
- [Đặc tả preview v1](docs/ANIMATION-PREVIEW-SPEC.md): ba chế độ, năm bộ sprite/116 frame, camera/điểm neo và tiêu chí kiểm tra.
- [Sửa nhịp tay/chân](docs/GAIT-CORRECTION.md): nguồn mới, tám pha/hướng, giữ hình đứng và quy trình xem thử.
- [So sánh bộ đi cũ/mới](docs/design/characters/gait-correction-v1/index.html): ba bộ, từng pose và cùng thời lượng chu kỳ; nguồn/prompt trong cùng thư mục.
- [Dữ liệu công nghệ/preview](docs/data/client-tech-preview-design.json): quyết định đã xác nhận, asset đầu vào và thông số đề xuất.
- [Định hướng MMORPG](docs/MMORPG-DIRECTION.md): trải nghiệm mục tiêu, phạm vi A → B cần xét lại và phần việc sprite/map tăng thêm.
- [Hình ảnh trên map](docs/WORLD-VISUAL-SPEC.md): góc nhìn đã chọn, tỷ lệ/kích thước thử và điều kiện duyệt trước bộ sprite.
- [Mẫu màn thế giới v1](docs/design/world/index.html): sân môn phái và thẻ UI, có khung 960 × 640/360 px để xem tỷ lệ; kèm ảnh ART và prompt đã dùng.
- [Định hướng online](docs/ONLINE-DIRECTION.md): thế giới chung, chương cá nhân, lưu máy chủ và tu luyện khi vắng mặt.
- [Dàn nhân vật và brief tạo hình](docs/CHARACTERS.md): ba lựa chọn chơi được từ đầu, trạng thái riêng và nguồn nhận diện; roster NPC cần biên tập lại.
- [Chân dung UI bộ ba](docs/design/characters/core-ui-v1/index.html): một biểu cảm cơ bản mỗi người, bản PNG/WebP 512/160/64 và ví dụ hội thoại; mới chờ đánh giá.
- [Kế hoạch động tác bộ ba](docs/CORE-CHARACTER-MOTION-PLAN.md): 44 frame core hiện có, mục tiêu 108; 64 frame Tư Đồ Nam/Lý Mộ Uyển còn ở thiết kế, theo giai đoạn xuất hiện.
- [Hồ sơ tạo hình bộ ba](docs/CORE-CHARACTER-VISUAL-SPEC.md): Tư Đồ Nam dạng linh hồn, Lý Mộ Uyển áo đỏ/tím; căn cứ truyện tách lựa chọn ART.
- [Xem bộ ba trọng tâm](docs/design/characters/core-trio-v1/index.html): hai bảng nhận diện mới và mẫu pixel cùng Vương Lâm; nguồn/prompt đã lưu.
- [Hồ sơ tạo hình Vương Lâm](docs/WANG-LIN-VISUAL-SPEC.md): chi tiết có nguồn, phần ART đề xuất, bộ nghiên cứu v2, prompt và điểm cần duyệt trước bộ sprite.
- [Đặc tả sprite Vương Lâm](docs/WANG-LIN-SPRITE-SPEC.md): frame 64 × 96, palette 24 mục, điểm chân, 4 đứng và 24 đi; atlas/metadata.
- [Xem animation và thử bước](docs/design/characters/wang-lin-gray-walk-v1/index.html): bốn hướng, bước từng frame/phóng nguyên lần và sân tham chiếu ở cỡ gốc.
- [Hai mẫu đệ tử — lịch sử preview](docs/PLAYER-AVATAR-VISUAL-SPEC.md): nhận diện v2, dấu phân biệt với Vương Lâm, palette chung và ngân sách 28 frame/mẫu.
- [So sánh sprite và thử hai đệ tử trên sân](docs/design/characters/player-avatars-v2/index.html): tạo hình nam/nữ, bốn hướng đứng/đi, xem pixel và thử dịch chuyển; kèm nguồn/prompt/atlas.
- [Thư viện tạo hình nhân vật](docs/design/characters/index.html): Vương Lâm v2 và hai mẫu đệ tử v2; hình trước đó được giữ để so sánh.
- [Thử sprite Vương Lâm](docs/design/characters/wang-lin-sprite-study/index.html): hai mẫu nét mịn/pixel art có nền trong suốt, cùng giai đoạn áo xám và tư thế; dùng so sánh phong cách.
- [Thử ghép pixel trên nền stylized](docs/design/world/hybrid-study/index.html): Vương Lâm trên nền sân riêng, cỡ 80/96/112 px, cảnh 1×/2× và khung 360 px; kèm ảnh ghép/prompt.
- [Đặc tả hệ thống MVP A](docs/MVP-A-SPEC.md): trạng thái hoạt động, xử lý mốc/cảnh, chi phí, nhịp chơi và hợp đồng save.
- [Luồng màn hình MVP A](docs/UX-MVP-A.md): 5 khu vực chính, wireframe, hướng dẫn theo mốc và nội dung phản hồi.
- [Định hướng ART](docs/ART-DIRECTION.md): tranh mực/giấy cổ đã chọn, bảng màu, chữ, nét vẽ và yêu cầu theo nguồn asset.
- [Chi tiết màn hình và trạng thái](docs/UX-SCREENS-AND-STATES.md): Hạt châu, Hành trang, Cài đặt, nhập save, offline, kết thúc A và phản hồi khi chờ/lỗi.
- [Bộ thành phần UI](docs/UI-COMPONENTS.md): trạng thái thẻ/nút, bố cục và bộ 14 bản vẽ UX.
- [Thư viện bản phác UX/ART](docs/design/index.html): bảng ART, năm khu vực chính, đọc truyện, offline/kết thúc và ba bảng trạng thái; mở trong trình duyệt.
- [Backlog MVP](docs/MVP-BACKLOG.md): thứ tự triển khai và điều kiện nghiệm thu.
- [Kế hoạch asset](docs/ASSET-PLAN.md): danh mục, brief, biến thể theo truyện và thứ tự sản xuất.
- [Hệ thống map — tham chiếu trước](docs/WORLD-MAPS.md): các node truyện và kế hoạch cũ; bố trí chức năng Hằng Nhạc hiện hành được đề xuất trong đặc tả trải nghiệm mới.
- [Quái, nguy hiểm và chiến đấu](docs/ENCOUNTERS.md): hồ sơ gặp gỡ, luật lặp, combat thử và phần thưởng dài hạn.
- [Roster nhân vật online](docs/data/character-roster.json): ID, vai trò, giai đoạn xuất hiện, nguồn và trạng thái concept.
- [Catalog tham chiếu MVP A](docs/data/mvp-content-catalog.json): 10 cảnh của Vương Lâm và luật cũ; cần biên tập cho ba nhân vật và map nhập môn mới; không phải luật runtime hiện hành.
- [Save minh họa cũ](docs/data/mvp-save-example.json): snapshot v0.6 sau E07, để tham chiếu bộ mô phỏng; không là hợp đồng lưu máy chủ.

Phạm vi đã chốt: **Hằng Nhạc qua Ngưng Khí, phân hóa sau nhập môn từ Trúc Cơ**. Đề xuất các lát A nhập môn online hẹp có combat đơn giản, B hoàn thiện Hằng Nhạc, C phân hóa; phạm vi chi tiết còn cần đặc tả. Số map/asset cũ giữ làm tham chiếu.

**Giai đoạn hiện tại: preview chạy được và backend online tối thiểu; gameplay tài nguyên/tu luyện chưa triển khai.** Nhận diện Vương Lâm v2 đã duyệt làm tham chiếu. Bộ đi sửa cho Vương Lâm/hai đệ tử có 36 frame/mẫu, cùng lưới 64 × 96, điểm chân (32, 88); frame mới chờ đánh giá nhận diện/chuyển động. Bộ sáu pose cũ được giữ để so sánh. Nhân vật pixel/nền stylized 2D/top-down ba phần tư, portrait/truyện/UI tranh mực/giấy cổ được giữ theo định hướng đã chọn.

Hiện ưu tiên hoàn thiện nhận diện Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển trước NPC phụ. Lý Mộ Uyển đã chấp nhận nhận diện v1; Tư Đồ Nam đứng v3 giữ mặt/tóc v2 đã được tạm chấp nhận làm chuẩn thiết kế; dáng ngồi được lưu cho cảnh tu luyện. Cả ba nhân vật được chọn từ đầu theo GDD mới; thời điểm xuất hiện nguyên tác được giữ trong nguồn và phiên truyện, tách với mở đầu gameplay chuyển thể.

Bước triển khai đầu tiên đã có **preview chung TypeScript + Three.js** bằng asset có sẵn và **sân chung Node.js + Colyseus**. Loader/animation/movement/renderer được dùng chung giữa duyệt ART và thử online. Bước tiếp theo về thiết kế là biên tập mở đầu ba người, Hằng Nhạc, trạng thái tu tiên và tài khoản/lưu theo GDD mới. Preview hiện vẫn dùng các mẫu thử cũ; chưa triển khai mô hình gameplay mới.
