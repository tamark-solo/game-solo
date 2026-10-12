# Vân Ngọc · asset gameplay và công thức v1

**12/10/2026:** owner chuyển ưu tiên sang nguyên liệu, đạo cụ, icon và công thức theo GDD trong lúc tự làm lại nhân vật. Đã tạo **14 ảnh nguồn bằng router `gpt-image-2`**, một POST mỗi asset, không retry; tách alpha và xuất **11 trạng thái icon / 3 đạo cụ / 6 thẻ công thức**. Bộ mới **chờ owner duyệt hình**, chưa là nội dung gameplay đã phát hành.

Mở [trang đối chiếu](http://127.0.0.1:5173/gameplay-assets.html). Trang có lọc chặng, nền sáng/tối, icon đúng 32/48/64 px, công thức có lượng tiêu/giữ/kết quả, và người native đi trước/sau/hai cạnh đạo cụ. Không gửi API tài khoản/gameplay hoặc ghi profile/map. Trên mobile, canvas đạo cụ giữ 600 × 240 pixel và cuộn trong khung để giữ tỷ lệ 1×.

## Danh mục hình

**Ưu tiên owner đã đồng ý tiếp tục 12/10:** Hằng Nhạc đã có khu chức năng/đạo cụ tĩnh trên nền chuẩn. Tiếp tục icon, nguyên liệu, vật phẩm và công thức; ba mẫu đạo cụ dưới đây là thư viện dự phòng, không đầu việc lấp map. Chỉ làm/đặt asset rời khi tương tác hoặc phần che/thay thế cần riêng. Bốn NPC đã có runtime; rà vị trí/diện mạo với Vân Ngọc khi đến phần NPC, không thêm trùng. Owner tiếp tục tự làm ART nhân vật.

| Chặng | Hình mới | Nguồn / nơi dùng theo thiết kế |
| --- | --- | --- |
| VP0 / HN05 | Nguyên liệu luyện hóa nhập môn | HN05 +3, HN06 +3; HN08 tiêu 4, còn 2 chưa có recipe tiếp |
| VP1 / HN08 | Phôi ngọc; ngọc hộ thân luyện tập | Hai trạng thái của cùng `hn-training-jade`, giữ instance sau luyện hóa |
| VP2 / sau HN12 | Dược thảo; linh tuyền; sợi vân bố; cát dẫn khí; ngọc thô | Nguồn EX01/EX02; đầu vào công thức chuẩn bị |
| VP2 | Mực dẫn khí; hộp giữ khí | Trung gian niêm chuyến; công cụ dùng lại, không tăng ô túi |
| VP3 | Định Lưu Bàn | Hỗ trợ khảo sát EX04; vẫn có phương án thủ công |
| Hub / chuẩn bị | Bàn chuẩn bị; giá mộc kiếm | Mẫu dự phòng cho tương tác/thay thế riêng; khu tĩnh đã có trên nền chuẩn, chưa đặt vào owner map |
| VP2 / EX01 | Khóm dược thảo | Mẫu đạo cụ cho điểm dược được phép; chưa node thu hoạch hoặc nguồn loot |

Ba icon nhập môn đang dùng được tham chiếu nguyên trạng: mộc kiếm, áo vải, vật tư hồi phục. Không vẽ lại nhân vật, gear cũ, R01 hoặc HUD; không tạo icon riêng cho tri thức/phương pháp/quest fact như món loot.

## Sáu công thức

Dữ liệu chép **nguyên nội dung** từ [plan GDD](../../systems/items-v1/plan.json), pin SHA-256 trong [production](production.json) và [assets](assets.json). Đây là số thiết kế hiện hành, chưa khóa balance hoặc có engine craft mới.

| Công thức | Tiêu | Giữ / kết quả | Điều kiện |
| --- | --- | --- | --- |
| Luyện hóa ngọc hộ thân | 4 nguyên liệu nhập môn | 1 phôi raw → refined, cùng một instance | HN08 đã nhận và hiểu phương pháp |
| Pha mực | 1 cát + 1 linh tuyền | 1 mực | EX01 hoàn tất |
| Chế vật tư | 2 dược thảo + 1 linh tuyền | +1 recovery vào nguồn supplies hiện hành | EX01 hoàn tất |
| Chế hộp | 2 sợi + 1 ngọc thô | 1 instance hộp | EX02 hoàn tất |
| Chế Định Lưu Bàn | 1 sợi + 2 ngọc thô + 1 cát | 1 instance bàn khảo sát | EX03 hoàn tất |
| Niêm hộp | 1 mực | Giữ 1 hộp; thêm seal cho đúng chủ/chuyến, không tạo hộp mới | EX03 đã nhận, chuyến chưa bắt đầu |

Niêm hủy trước chuyến hoàn mực đúng một lần và gỡ hiệu lực; đã khởi hành không hoàn, kết thúc gỡ seal nhưng giữ hộp. Hộp/bàn giới hạn một instance/hồ sơ ở gói thiết kế. Công thức vật tư không đổi +30 HP/cooldown 10 giây hoặc nguồn số lượng. Không mở nguồn farm/giá/drop/stat mới, không thêm sink giả cho hai vật liệu HN dư.

## Bàn thử công thức

[Bàn thử](http://127.0.0.1:5173/gameplay-assets.html#recipe-workbench) nhận số lượng túi mẫu, tiến trình giả định, trạng thái phôi/refined và hộp đã niêm. Mỗi thẻ công thức có nút chọn nhanh. Mẫu đủ điều kiện cho phép đọc bảng Có/Tiêu/Sau; mẫu nguồn HN05–HN08 lấy đúng 3 + 3 nguyên liệu và một phôi từ nguồn GDD, vẫn cần đánh dấu phương pháp hộ thân riêng.

Bàn thử kiểm thiếu nguyên liệu/công cụ giữ lại, điều kiện chưa đạt, ngọc đã luyện hóa, giới hạn một hộp/bàn khảo sát và niêm trùng/chuyến đã bắt đầu. Kết quả là phép tính dự kiến cho **một lần**, không giảm túi mẫu, không thực thi craft, grant, hoàn mực hoặc lưu profile. Số lượng hồi phục chỉ là số mẫu để đọc phép cộng vào nguồn hiện hành; không một nguồn stock gameplay mới. Không lưu local/session storage, không POST hay kết nối room. Ba mẫu đạo cụ vẫn xem được dưới mục “Đạo cụ dự phòng”.

`client/src/gameplay-recipe-preview.ts` chỉ phục vụ trang review, không nhập vào shared/server hoặc UI game. `sync-van-ngoc-gameplay-assets.mjs` bổ sung `itemDefinitions` từ plan đã pin hash vào JSON review để kiểm `maxOwned`, không sửa manifest nguồn/approval. Chi phí, nguồn và điều kiện sáu công thức giữ đúng GDD; phần ART mới vẫn chờ duyệt riêng.

## Kích thước, chân và alpha

Icon có 33 PNG: 11 hình × 32/48/64 px. Đạo cụ có ba PNG alpha:

| Đạo cụ | Canvas | Chân đo trên export | Căn cứ |
| --- | --- | --- | --- |
| Bàn chuẩn bị | 192 × 160 | (85,120) | Trung điểm hai chân trước nhìn thấy |
| Giá mộc kiếm | 160 × 160 | (70,126) | Trung điểm hai chân đỡ trước |
| Khóm dược thảo | 96 × 96 | (47,68) | Cổ rễ nối các thân |

[Phép đo](pivot-measurements.json) pin hash PNG và ảnh lưới native. Đây là điểm chân tham chiếu cho review, chưa duyệt footprint/collision. [Thư viện nhập Editor](editor-library.json) tự chứa ba PNG/pivot, không có placement, prefab hoặc vùng gameplay. Thư viện mặc định và owner-authored map giữ nguyên.

Các nguồn thực là 1254 × 1254 cho icon; bàn 1536 × 1024, giá 1330 × 1182, khóm 1324 × 1188, khác yêu cầu 1024 × 1024. Nguồn không resize/ghi đè. Tách alpha giữ canvas; export dùng bounds alpha ≥64 có 2 px lề nguồn, lấy mẫu Lanczos3 trực tiếp về từng cỡ, kiểm không chạm mép canvas/không pixel key magenta nhìn thấy. Không lấy toàn bộ alpha >0 làm crop vì helper có thể giữ điểm alpha rất thấp ngoài chủ thể.

36 PNG native tổng **178883 byte (~175 KiB)**, chưa tính ảnh nền/nhân vật/thẻ review và JSON. Duyệt kỹ thuật tách khỏi duyệt hình.

## Nguồn và dựng lại

- [Spec/prompt/plan](production.json), [14 kết quả sinh](generation-results.json), [alpha](preparation-results.json), [native/source hashes](assets.json).
- Gói raw/request/prompt/metadata/source-alpha đầy đủ ở `output/imagegen/game-assets/vn-*-v1-*/` theo từng đường dẫn trong manifest. Giữ các gói này; chúng là nguồn hiện hành, không dọn cùng ảnh thử cũ. Không có credential trong spec hoặc metadata.
- [Icon sáng/tối native](review/icons-native-board.png), [alpha sáng/tối](review/alpha-light-dark-board.png), [đạo cụ cạnh người](review/props-native-board.png), ảnh đo chân trong `review/`.
- Chuẩn nét/màu: [map Vân Ngọc V2](../../world/hang-nhac-van-ngoc-detail-v2/README.md); tham chiếu đã xem và diễn tả trong brief bằng văn bản. Tool asset hiện không gửi pixel reference; không ghi nhầm là image-input edit.
- Nhân vật đối chiếu: frame gốc Vương Lâm chibi 64 × 96/(32,88), giữ nguyên pixel. Đây là chuẩn đo hiện có trong lúc owner làm lại nhân vật, không một bộ nhân vật mới.

Lập lại brief bằng `node scripts/prepare-van-ngoc-gameplay-assets.mjs` chỉ ghi spec/plan, không API. Tạo ảnh qua MCP `plan_game_asset` rồi `generate_game_asset`, hoặc CLI `assetgen` cho từng spec; không chạy lại POST chỉ để build. `assetgen:prepare` giữ nguồn/canvas. Dựng lại export từ nguồn đang giữ:

```powershell
node scripts/export-van-ngoc-gameplay-assets.mjs
node scripts/finalize-van-ngoc-gameplay-review.mjs
node scripts/sync-van-ngoc-gameplay-assets.mjs
```

Nếu native PNG đổi, phải đo lại chân theo hash; finalize từ chối phép đo cũ. `npm.cmd run assets/build` chỉ sync PNG/JSON đã pin hash và kiểm recipe/source plan; không generation hoặc import thư viện production.

## Kiểm chứng

Build/TypeScript/boundary đạt. [Smoke fixture](../../../../tests/smoke/van-ngoc-gameplay-assets-smoke.mjs) kiểm 11/3/6, kích thước 33 icon hiển thị, lọc VP, đổi nền, người trước/sau/hai cạnh, mobile không tràn trang, canvas native, recipe parity và nhập library riêng chỉ thêm ba asset/không đặt vật hoặc region. Không backend/DB/API ghi map trong fixture. [Report](../../../../artifacts/van-ngoc-gameplay-assets/verification.json) và screenshot desktop/mobile được lưu; ảnh source/native/alpha đã xem trực tiếp.

Bổ sung [7 kiểm arithmetic](../../../../tests/unit/gameplay-recipe-preview.test.ts) và browser kiểm cả sáu công thức, nguyên liệu HN dư, trạng thái ngọc, giới hạn tool, niêm/chuyến, recovery, số không hợp lệ, không mutate túi/storage/request ghi. [Desktop](../../../../artifacts/van-ngoc-gameplay-assets/desktop-workbench.png) và [mobile](../../../../artifacts/van-ngoc-gameplay-assets/mobile-workbench.png) của bàn thử đã xem trực tiếp; icon/nhãn/cột số giữ đủ trong khung mobile.

```powershell
node --import tsx --test tests/unit/gameplay-recipe-preview.test.ts
node --import tsx tests/smoke/van-ngoc-gameplay-assets-smoke.mjs
npm.cmd run build
```

Tiếp nối gần nhất là owner đánh giá icon/bàn thử, rồi ghép nguồn–vật phẩm VP0/HN05 → VP1/HN08 cùng nền encounter/codec/transaction theo roadmap. Vị trí/footprint chỉ cần chốt khi có đạo cụ tương tác cần đặt riêng. Asset VP2/VP3 được thiết kế sẵn theo GDD nhưng chưa mở hoạt động EX hoặc cấp đồ cho hồ sơ.
