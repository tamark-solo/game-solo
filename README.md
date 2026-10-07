# game-solo

Dự án game web theo hướng **MMORPG tu luyện có cơ chế idle**, dành cho một người phát triển. Client dùng **TypeScript + Three.js**, backend thử nghiệm dùng **TypeScript + Node.js + Colyseus**. Mỗi người chơi tạo một đệ tử riêng trong thế giới *Tiên Nghịch*; Vương Lâm giữ vai trò trung tâm của chính truyện. Khu môn phái có nhân vật đi lại là vùng khởi đầu đã chọn.

## Chạy bản thử

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/**. Có ba chế độ: xem animation, thử trên map và sân chung online. Năm bộ sprite có **116 frame**; Vương Lâm/hai đệ tử dùng bản sửa tám pose đi mỗi hướng, hình đứng giữ nguyên. Hai cửa sổ có thể vào sân bằng hai mẫu đệ tử để thấy nhau di chuyển. Server xử lý vị trí/tốc độ/va chạm và hỗ trợ kết nối lại. Chọn **So sánh tay/chân cũ và mới** để xem từng pha ở cùng thời lượng vòng bước.

**Mẫu mới theo reference:** mở **http://127.0.0.1:5173/chibi-pilot.html** để xem Vương Lâm đầu lớn/thân gọn, một hướng với 1 đứng + 4 pose đi bước nhỏ. Có đối chiếu bộ trước và đi trên sân bằng D/→ hoặc nút giữ. Bộ 116 frame trước được giữ để đối chiếu và cần chỉnh tiếp sau phản hồi; mẫu chibi mới chờ đánh giá.

Cần Node.js >= 22.12.0. Backend mặc định ở localhost:2567. Đây là phiên thử trong môi trường phát triển, chưa có tài khoản, lưu tiến trình, tu luyện hoặc chiến đấu. Xem [hướng dẫn chạy và kiểm tra](docs/PREVIEW-RUNBOOK.md), [hợp đồng backend bản thử](docs/BACKEND-PREVIEW.md) và [kết quả kiểm tra](docs/data/preview-verification.json).

## Tài liệu thiết kế

- [GDD phiên bản 0.24](docs/GDD.md): đã chọn tỷ lệ chibi theo reference; mẫu Vương Lâm một hướng để đánh giá.
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
- [Dàn nhân vật và brief tạo hình](docs/CHARACTERS.md): trục 3 nhân vật đã chốt; đệ tử riêng và phạm vi NPC A/B đề xuất.
- [Chân dung UI bộ ba](docs/design/characters/core-ui-v1/index.html): một biểu cảm cơ bản mỗi người, bản PNG/WebP 512/160/64 và ví dụ hội thoại; mới chờ đánh giá.
- [Kế hoạch động tác bộ ba](docs/CORE-CHARACTER-MOTION-PLAN.md): 44 frame core hiện có, mục tiêu 108; 64 frame Tư Đồ Nam/Lý Mộ Uyển còn ở thiết kế, theo giai đoạn xuất hiện.
- [Hồ sơ tạo hình bộ ba](docs/CORE-CHARACTER-VISUAL-SPEC.md): Tư Đồ Nam dạng linh hồn, Lý Mộ Uyển áo đỏ/tím; căn cứ truyện tách lựa chọn ART.
- [Xem bộ ba trọng tâm](docs/design/characters/core-trio-v1/index.html): hai bảng nhận diện mới và mẫu pixel cùng Vương Lâm; nguồn/prompt đã lưu.
- [Hồ sơ tạo hình Vương Lâm](docs/WANG-LIN-VISUAL-SPEC.md): chi tiết có nguồn, phần ART đề xuất, bộ nghiên cứu v2, prompt và điểm cần duyệt trước bộ sprite.
- [Đặc tả sprite Vương Lâm](docs/WANG-LIN-SPRITE-SPEC.md): frame 64 × 96, palette 24 mục, điểm chân, 4 đứng và 24 đi; atlas/metadata.
- [Xem animation và thử bước](docs/design/characters/wang-lin-gray-walk-v1/index.html): bốn hướng, bước từng frame/phóng nguyên lần và sân tham chiếu ở cỡ gốc.
- [Hai mẫu đệ tử người chơi](docs/PLAYER-AVATAR-VISUAL-SPEC.md): nhận diện v2, dấu phân biệt với Vương Lâm, palette chung và ngân sách 28 frame/mẫu.
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
- [Hệ thống map](docs/WORLD-MAPS.md): 9 địa điểm nhập môn, mở rộng lên 13 địa điểm ở B và kế hoạch các arc sau.
- [Quái, nguy hiểm và chiến đấu](docs/ENCOUNTERS.md): hồ sơ gặp gỡ, luật lặp, combat thử và phần thưởng dài hạn.
- [Roster nhân vật online](docs/data/character-roster.json): ID, vai trò, giai đoạn xuất hiện, nguồn và trạng thái concept.
- [Catalog tham chiếu MVP A](docs/data/mvp-content-catalog.json): 10 cảnh của Vương Lâm và luật cũ; chờ tách tuyến đệ tử/chính truyện trước triển khai online.
- [Save minh họa cũ](docs/data/mvp-save-example.json): snapshot v0.6 sau E07, để tham chiếu bộ mô phỏng; không là hợp đồng lưu máy chủ.

Lộ trình đã chốt: **A → B**. Đề xuất A kiểm chứng nhập môn/tu luyện và một khu môn phái đi lại chung; B kiểm chứng vòng RPG có chiến đấu. Phạm vi nhiệm vụ, map và combat cần xét lại theo mục tiêu MMORPG; xem MMORPG-DIRECTION. Số map/asset cũ giữ làm tham chiếu cho chính truyện.

**Giai đoạn hiện tại: preview chạy được và backend online tối thiểu; gameplay tài nguyên/tu luyện chưa triển khai.** Nhận diện Vương Lâm v2 đã duyệt làm tham chiếu. Bộ đi sửa cho Vương Lâm/hai đệ tử có 36 frame/mẫu, cùng lưới 64 × 96, điểm chân (32, 88); frame mới chờ đánh giá nhận diện/chuyển động. Bộ sáu pose cũ được giữ để so sánh. Nhân vật pixel/nền stylized 2D/top-down ba phần tư, portrait/truyện/UI tranh mực/giấy cổ được giữ theo định hướng đã chọn.

Hiện ưu tiên hoàn thiện nhận diện Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển trước NPC phụ. Lý Mộ Uyển đã chấp nhận nhận diện v1; Tư Đồ Nam đứng v3 giữ mặt/tóc v2 đã được tạm chấp nhận làm chuẩn thiết kế; dáng ngồi được lưu cho cảnh tu luyện. Tạo hình sớm giữ thời điểm xuất hiện theo B/arc sau.

Bước triển khai đầu tiên đã có **preview chung TypeScript + Three.js** bằng asset có sẵn và **sân chung Node.js + Colyseus**. Loader/animation/movement/renderer được dùng chung giữa duyệt ART và thử online. Bước tiếp theo là đánh giá chuyển động, rồi đặc tả tài khoản/lưu tiến trình và tuyến nhiệm vụ đệ tử trước vòng tu luyện.
