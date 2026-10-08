# game-solo

Dự án game web theo hướng **MMORPG tu luyện có cơ chế idle**, dành cho một người phát triển. Client dùng **TypeScript + Three.js**, backend thử nghiệm dùng **TypeScript + Node.js + Colyseus**. Mỗi người chơi tạo một đệ tử riêng trong thế giới *Tiên Nghịch*; Vương Lâm giữ vai trò trung tâm của chính truyện. Khu môn phái có nhân vật đi lại là vùng khởi đầu đã chọn.

## Chạy bản thử

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173/**. Trang chính mặc định hiển thị **Vương Lâm · chibi bốn hướng**, 4 đứng + 16 pose đi. Chọn **Thử trên map**, bấm vào sân và dùng WASD/phím mũi tên hoặc nút hướng cảm ứng. Danh sách có **năm bộ chibi/100 frame** và bộ Vương Lâm trước 36 frame để đối chiếu. Chế độ sân online dùng hai đệ tử chibi mới; server xử lý vị trí/tốc độ/va chạm và hỗ trợ kết nối lại.

**Map Editor / Level Design 0.12.0:** mở **http://127.0.0.1:5173/map-editor.html**. Asset map cũ đã xóa theo yêu cầu; thư viện mới có **0 asset**, dự án mặc định trống. Giữ kéo thả/nhập PNG, layer, vùng đi/chặn, nhiều level/portal, lưu/xuất/nhập và Test WASD/E. [Hướng dẫn Level Design](docs/MAP-LEVEL-DESIGN.md), [Map Editor](docs/MAP-EDITOR.md), [thư viện mới](docs/design/world/map-asset-library/README.md), [biên bản reset](docs/MAP-ASSETS-RESET.md). Người phát triển tự bố trí map và vùng hoạt động.

**Level Design:** chọn nhiều/khung chọn, nhóm/căn chỉnh, nhập tileset/cọ/tô ô/gôm, prefab gồm hình và vùng hoạt động, quản lý part/pivot/phân loại, nhập/xuất thư viện, minimap, kiểm lỗi và xuất runtime. PNG mới do bạn nhập; bộ ART cũ không được khôi phục.

**Bắt đầu lại map:** đã gỡ bộ ART/native kit/chunk/mask/ZIP trước và các builder phụ thuộc. Giữ asset nhân vật, editor và dữ liệu trong `docs/data/authored-maps/`. Các URL preview map cũ chuyển tới editor; main preview nhân vật dùng nền trung tính.

**Xem cả dàn:** **http://127.0.0.1:5173/assets/chibi-roster/index.html** đặt năm nhân vật cạnh nhau, đổi hướng, xem từng pose và nền sáng/tối. Trang `/chibi-pilot.html` giữ mẫu hướng Đông ban đầu để đối chiếu tỷ lệ.

**Bản thử 0.6.0 — map nhập môn:** **http://127.0.0.1:5173/starter-region.html** đi thử vùng 3840 × 2560 gồm 5 khu nối nhau, cùng hang boss 960 × 640. Sprite/cỡ người giữ như hiện tại; camera cuộn, có sơ đồ, điểm quái/NPC và mục tiêu/kịch bản Q01–Q10. Đây là bản bố trí cục bộ để duyệt map; combat, tiến trình nhiệm vụ và vùng online mới triển khai theo [MVP RPG-A](docs/MVP-RPG-A.md). Đồng bộ portrait được để sau.

**Cập nhật 0.5.1:** làm lại đệ tử nam/nữ, Tư Đồ Nam và Lý Mộ Uyển theo tỷ lệ Vương Lâm; mỗi bộ 20 frame, bốn hướng. Tư Đồ Nam có đứng lơ lửng/lướt. Lý Mộ Uyển native-v5 đã được người phát triển chấp nhận làm chuẩn bản thử: tóc xanh đen rẽ lệch, buộc thấp, áo lavender hai lớp/cổ ngà. Hai đệ tử và Tư Đồ Nam mới còn chờ đánh giá. Web nạp atlas bằng URL theo hash. [Nguồn và prompt imagegen](docs/design/characters/chibi-roster-v1/README.md).

Cần Node.js >= 22.12.0. Backend mặc định ở localhost:2567. Đây là phiên thử trong môi trường phát triển, chưa có tài khoản, lưu tiến trình, tu luyện hoặc chiến đấu. Xem [hướng dẫn chạy và kiểm tra](docs/PREVIEW-RUNBOOK.md), [hợp đồng backend bản thử](docs/BACKEND-PREVIEW.md) và [kết quả kiểm tra](docs/data/preview-verification.json).

## Tài liệu thiết kế

- [Quy tắc xây map](docs/MAP-BUILDING-GUIDE.md): giữ tham chiếu/tỷ lệ, nguồn native, gom cụm, alpha, che khuất và kiểm chất lượng.
- [Kế hoạch đoạn ngoại viện mẫu](docs/MAP-COURTYARD-PILOT-PLAN.md): MP01–MP07, bộ asset, phụ thuộc, kiểm hình ảnh và việc tiếp theo.
- [Ghi chú cho các lượt làm việc](AGENTS.md): cần đọc hai tài liệu map trên trước khi sửa ART/layer/di chuyển.
- [Map Editor](docs/MAP-EDITOR.md): tự kéo thả asset, layer, vùng đi/chặn, portal, lưu và xuất/nhập từng level.
- [Phân công xây map](docs/MAP-ASSET-PRODUCTION-NOTES.md): người phát triển bố trí map; trợ lý cung cấp asset/công cụ.
- [GDD phiên bản 0.33](docs/GDD.md): map do người phát triển biên tập trước nhiệm vụ/đánh/nhận đồ/đột phá.
- [Thiết kế MAP03](docs/MAP-LAYERED-DESIGN.md): bản năm khu đối chiếu tham chiếu, layer/chunk, va chạm và lỗi hình ảnh còn mở.
- [Thiết kế map có ART](docs/MAP-ART-DESIGN.md): tổng quan/cảnh chi tiết, giữ tỷ lệ người, chốt lớp/đường trước gameplay.
- [MVP RPG-A 1.0](docs/MVP-RPG-A.md): 5 khu + hang, 10 nhiệm vụ chính, 4 quái thường/1 tinh anh/1 boss, tầng1–3.
- [Kịch bản nhập môn](docs/STARTER-STORY.md): ba hồi, thoại ngắn và tuyến Q01–Q10 theo bối cảnh Hằng Nhạc.
- [Dữ liệu gameplay MVP](docs/data/mvp-rpg-content.json): map/nhiệm vụ/quái/đồ/skill/recipe/ngưỡng và trạng thái triển khai.
- [Quy chuẩn dàn chibi](docs/CHIBI-ROSTER-SPEC.md): 80 frame mới theo Vương Lâm; nhận diện, lưới, điểm đặt và trạng thái duyệt.
- [Xem năm nhân vật](docs/design/characters/chibi-roster-v1/index.html): gallery cùng hướng/pose, nguồn, prompt và atlas của bốn bộ mới.
- [Đối chiếu reference và hướng sửa](docs/GAIT-REFERENCE-REVIEW.md): tỷ lệ mới, bước nhỏ, tay gần thân và thứ tự kiểm tra một hướng.
- [Nguồn/prompt Vương Lâm chibi](docs/design/characters/wang-lin-chibi-walk-v1/README.md): atlas 20 frame; frame cuối Đông đã sửa, bộ được chọn làm chuẩn tỷ lệ.
- [Mẫu hướng Đông ban đầu](docs/design/characters/wang-lin-chibi-pilot-v1/README.md): nguồn v1/v2 và trang đối chiếu tỷ lệ.
- [Công nghệ client](docs/TECH-STACK.md): vai trò TypeScript, Three.js, UI và thành phần dùng chung với preview.
- [Đặc tả preview v1](docs/ANIMATION-PREVIEW-SPEC.md): ba chế độ, sáu bộ preview/136 frame với chibi mặc định, camera/điểm neo và tiêu chí kiểm tra.
- [Sửa nhịp tay/chân](docs/GAIT-CORRECTION.md): nguồn mới, tám pha/hướng, giữ hình đứng và quy trình xem thử.
- [So sánh bộ đi cũ/mới](docs/design/characters/gait-correction-v1/index.html): ba bộ, từng pose và cùng thời lượng chu kỳ; nguồn/prompt trong cùng thư mục.
- [Dữ liệu công nghệ/preview](docs/data/client-tech-preview-design.json): quyết định đã xác nhận, asset đầu vào và thông số đề xuất.
- [Định hướng MMORPG](docs/MMORPG-DIRECTION.md): trải nghiệm mục tiêu, phạm vi A → B cần xét lại và phần việc sprite/map tăng thêm.
- [Hình ảnh trên map](docs/WORLD-VISUAL-SPEC.md): góc nhìn đã chọn, tỷ lệ/kích thước thử và điều kiện duyệt trước bộ sprite.
- [Định hướng online](docs/ONLINE-DIRECTION.md): thế giới chung, chương cá nhân, lưu máy chủ và tu luyện khi vắng mặt.
- [Dàn nhân vật và brief tạo hình](docs/CHARACTERS.md): trục 3 nhân vật đã chốt; đệ tử riêng và phạm vi NPC A/B đề xuất.
- [Chân dung UI bộ ba](docs/design/characters/core-ui-v1/index.html): một biểu cảm cơ bản mỗi người, bản PNG/WebP 512/160/64 và ví dụ hội thoại; mới chờ đánh giá.
- [Kế hoạch động tác bộ ba](docs/CORE-CHARACTER-MOTION-PLAN.md): 60 frame core chibi hiện có, đề xuất thêm 16 frame lơ lửng/luyện đan theo giai đoạn xuất hiện.
- [Hồ sơ tạo hình bộ ba](docs/CORE-CHARACTER-VISUAL-SPEC.md): Tư Đồ Nam dạng linh hồn, Lý Mộ Uyển áo đỏ/tím; căn cứ truyện tách lựa chọn ART.
- [Xem bộ ba trọng tâm](docs/design/characters/core-trio-v1/index.html): hai bảng nhận diện mới và mẫu pixel cùng Vương Lâm; nguồn/prompt đã lưu.
- [Hồ sơ tạo hình Vương Lâm](docs/WANG-LIN-VISUAL-SPEC.md): chi tiết có nguồn, phần ART đề xuất, bộ nghiên cứu v2, prompt và điểm cần duyệt trước bộ sprite.
- [Đặc tả sprite Vương Lâm](docs/WANG-LIN-SPRITE-SPEC.md): frame 64 × 96, palette 24 mục, điểm chân, 4 đứng và 24 đi; atlas/metadata.
- [Xem animation và thử bước](docs/design/characters/wang-lin-gray-walk-v1/index.html): bốn hướng, bước từng frame/phóng nguyên lần và sân tham chiếu ở cỡ gốc.
- [Hai mẫu đệ tử người chơi](docs/PLAYER-AVATAR-VISUAL-SPEC.md): nhận diện, dấu phân biệt với Vương Lâm và bộ chibi mới 20 frame/mẫu; bản trước giữ tham chiếu.
- [So sánh sprite và thử hai đệ tử trên sân](docs/design/characters/player-avatars-v2/index.html): tạo hình nam/nữ, bốn hướng đứng/đi, xem pixel và thử dịch chuyển; kèm nguồn/prompt/atlas.
- [Thư viện tạo hình nhân vật](docs/design/characters/index.html): Vương Lâm v2 và hai mẫu đệ tử v2; hình trước đó được giữ để so sánh.
- [Thử sprite Vương Lâm](docs/design/characters/wang-lin-sprite-study/index.html): hai mẫu nét mịn/pixel art có nền trong suốt, cùng giai đoạn áo xám và tư thế; dùng so sánh phong cách.
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

Lộ trình đã chốt: **A → B**. A hiện có thiết kế nhiệm vụ/combat/farm/boss và đệ tử tới tầng3; B mở nhóm và arc mới. [Backlog mới](docs/MVP-BACKLOG.md) chia từ map bố trí đến vùng online/lưu, một vòng5–7phút, farm và boss. Số map/node/asset idle cũ giữ tham chiếu chính truyện.

**Ưu tiên hiện tại:** thư viện trống để bắt đầu bộ asset map mới theo [quy tắc](docs/MAP-BUILDING-GUIDE.md). Người phát triển ghép map trong editor; chưa chọn tham chiếu/bố cục mới, gameplay đi sau map.

**Giai đoạn hiện tại: preview chạy được và backend online tối thiểu; gameplay tài nguyên/tu luyện chưa triển khai.** Vương Lâm chibi được chọn làm chuẩn; bốn bộ mới cùng lưới 64 × 96, điểm đặt (32, 88), mỗi hướng một đứng và bốn chuyển động. Bộ trước được lưu tham chiếu. Nhân vật pixel/nền stylized 2D/top-down ba phần tư, portrait/truyện/UI tranh mực/giấy cổ giữ theo định hướng đã chọn.

Sau công việc map, dàn trọng tâm tiếp tục là Vương Lâm, Tư Đồ Nam và Lý Mộ Uyển trước NPC phụ. Tư Đồ Nam giữ đặc điểm linh thể đứng tạm chấp nhận; bộ chibi/lướt mới chờ đánh giá. Lý Mộ Uyển native-v5 được chấp nhận làm chuẩn bản thử; chân dung UI cần đồng bộ với mặt/tóc/trang phục mới. Thời điểm xuất hiện vẫn theo B/arc sau.

Bước triển khai đầu tiên đã có **preview chung TypeScript + Three.js** và **sân chung Node.js + Colyseus**. Ưu tiên hiện tại là **ART map → tỷ lệ/lớp/đường đi → duyệt map → thiết kế nhiệm vụ/đánh/nhận đồ/đột phá theo map**, sau đó triển khai online/gameplay. Loader/animation/movement/renderer hiện có được giữ dùng lại.
