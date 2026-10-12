# Hằng Nhạc Vân Ngọc — nguồn chuẩn và kế hoạch bổ sung asset

**Ưu tiên mới nhất owner đồng ý 12/10:** map chuẩn đã có các khu/đạo cụ tĩnh; tiếp tục icon, nguyên liệu, vật phẩm và công thức. Ba đạo cụ vừa tạo giữ làm mẫu dự phòng, không đặt trùng để lấp hub. Game đã có bốn NPC; rà phù hợp hình/vị trí với nền Vân Ngọc ở phần NPC tiếp theo. [Bàn thử sáu công thức](http://127.0.0.1:5173/gameplay-assets.html#recipe-workbench) đã thêm túi mẫu, điều kiện, thiếu/tiêu/giữ/kết quả; đây là review không thực thi gameplay. Nhận định ưu tiên đạo cụ trong phần rà soát ban đầu dưới đây đã được thay bằng ưu tiên này.

**Asset gameplay 12/10 đã sản xuất bộ xem đầu:** [11 trạng thái icon / ba đạo cụ / sáu công thức](design/gameplay/van-ngoc-gameplay-assets-v1/README.md) dùng chuẩn V2 và đúng ID/lượng tiêu của GDD. Bàn chuẩn bị, giá mộc kiếm, khóm dược có alpha/native/pivot tham chiếu và thư viện Editor riêng; chưa đặt vào owner map. Owner đang làm lại nhân vật, nên phần tùy biến/trang bị nhân vật chưa sửa trong đợt này. ART mới chờ duyệt riêng.

**Chuẩn đã chốt 12/10/2026:** sau vòng làm nét và xem trong game, owner yêu cầu lưu [V2 20 vùng](design/world/hang-nhac-van-ngoc-detail-v2/README.md) làm chuẩn ART. Asset môi trường tiếp theo dùng nét, màu, vật liệu và tỷ lệ của bản này; concept gốc/UI giữ tham chiếu đồng bộ. [Hồ sơ lưu/dọn](HANG-NHAC-VAN-NGOC-BASELINE.md) ghi duyệt theo hash, nguồn tự chứa và phạm vi còn tiếp tục. Các nhận định “chưa tạo ART” trong phần rà soát dưới đây mô tả thời điểm trước vòng làm nét, không phải trạng thái mới nhất.

**Rà soát 12/10/2026.** Owner xác nhận nguồn mỹ thuật cần tiếp tục là `docs/design/world/hang-nhac-van-ngoc-concept-v1/`, đồng bộ với web đăng nhập server. Phạm vi yêu cầu gồm đạo cụ map và vật phẩm hành trang, ưu tiên đạo cụ để hoàn thiện map ban đầu. Sau rà soát, owner yêu cầu ghép vào game: đã thêm [chế độ xem concept trong màn chơi](HANG-NHAC-VAN-NGOC-IN-GAME-REVIEW.md). Chưa tạo ART mới hoặc thay release/navigation production.

## 1. Nguồn đúng cho phong cách

- [Concept mới](design/world/hang-nhac-van-ngoc-concept-v1/concept.webp), [ảnh nguồn](design/world/hang-nhac-van-ngoc-concept-v1/concept-source.png), [hồ sơ](design/world/hang-nhac-van-ngoc-concept-v1/README.md) và [metadata](design/world/hang-nhac-van-ngoc-concept-v1/concept.json).
- Hướng đã được owner chấp nhận ngày 11/10: **Ngoại viện trên biển mây**, đá ngọc xám/celadon, bóng petrol-teal, mái xanh trầm, đồng cổ tiết chế, tùng, mây ngà và bình minh ấm.
- [Tiên môn/entry](design/ui/title-tien-mon-v1/README.md) tham chiếu vật liệu, ánh sáng và không khí. Camera gameplay vẫn là góc nhìn cao; không lấy góc máy của nền đăng nhập làm góc vẽ đạo cụ.
- [Thanh Ngọc/Tu Đạo](design/ui/dao-dual-theme-v1/README.md) dùng cùng concept làm tham chiếu. Icon hành trang phải kiểm trong bộ UI đang chạy theo [bàn giao runtime](HANG-NHAC-DAO-UI-RUNTIME.md).
- `hang-nhac-layered-v1/overview.webp` là tổng quan ART runtime trước đó. Nó không còn là chuẩn phong cách để sản xuất ART mới theo yêu cầu này.

Ngày rà soát, hash thực của hai ảnh mới khớp `concept.json`:

| Ảnh | Kích thước nguồn | SHA-256 |
| --- | --- | --- |
| `concept-source.png` | 1536 × 1024 | `7367c629119a4c2b35d4033a078f0b264fd957cb2810cdc9b696932d8ecb7fd8` |
| `concept.webp` | 1536 × 1024 | `f5bd95bc1cbe5e67b5ed064b6238c94eaa21ca3bca9a9d00ad2ffbff5e0bad22` |

Phạm vi duyệt là hướng concept tổng: bảng màu, vật liệu và không khí. Metadata ghi `runtimeConsumable: false`, footprint/native detail/runtime integration chưa được xác nhận. World đích 3072 × 2048 không làm ảnh concept 1536 × 1024 thành nguồn ART native.

## 2. Game hiện đang dùng gì

Đường mặc định trong `client/src/hang-nhac.ts` vẫn gọi `renderer.loadAuthoredMap(HANG_NHAC.scene)` qua adapter ART. Release trong `shared/data/hang-nhac.json` và manifest public có cùng version tại lúc rà soát. Scene vẫn đến từ package `hang-nhac-layered-v1`, revision **main-route-v6 / posts v7 / trees v9**, gồm **22 object / 32 part / 10 cover**. Có 9 blocker và Spawn (1616,992), world 3072 × 2048. Link `?mapArt=van-ngoc` chọn concept phẳng để xem trong cùng màn chơi; Thiết lập cho chuyển giữa hai ART, không đổi release hoặc room.

`scripts/build-hang-nhac-runtime.ts` đóng gói nguồn layered hiện hành; không đọc folder concept Vân Ngọc để thay scene. `scripts/sync-dao-dual-ui.mjs` chép concept đã kiểm hash vào asset dùng chung cho review UI và lựa chọn ART trong game. Chế độ xem mới nạp bitmap nguồn 1536 × 1024 lên mặt phẳng world 3072 × 2048; không tự tạo ART native hoặc alpha mái/tán.

Không chạy builder để thử thay nền lúc rà soát. Giữ owner-authored map, navigation, bậc thang, browser draft, saves và các nguồn đã giữ nguyên.

## 3. Đề xuất có khớp kế hoạch không

**Có.** Luồng tìm reference → thiết kế asset theo GDD → xem cạnh nhân vật → ghép kiểm trong game khớp [quy tắc map](MAP-BUILDING-GUIDE.md), [quy trình sector](MAP-CONCEPT-SECTOR-WORKFLOW.md) và [kế hoạch Hằng Nhạc](HANG-NHAC-IMPLEMENTATION-PLAN.md).

Điểm cần bổ sung là hoàn thiện nguồn map Vân Ngọc ở cỡ chơi trước khi chốt tích hợp đạo cụ vào scene production. Có thể làm một nhóm đạo cụ mẫu song song để kiểm cùng phong cách; vị trí trên ảnh concept chỉ là vị trí thử. Không scale cả concept 2× rồi coi là đã xong ART chi tiết, footprint, alpha và layer.

## 4. Thứ tự gần nhất

1. Chuẩn nét/màu/native đã chốt là V2 20 vùng, giữ camera 1× và người 64 × 96. Dùng các vùng được chọn và master/WebP theo hash làm tham chiếu cho asset mới; map owner vẫn là căn cứ navigation hiện hành.
2. Vòng nền chi tiết/căn/ghép đã hoàn tất và được chốt làm chuẩn ART. Tiếp tục kiểm footprint theo ART này khi triển khai nền sạch, đạo cụ riêng và mái/tán; không khôi phục V1 để sản xuất.
3. Chọn một nhóm đạo cụ đại diện cho chức năng đang có: luyện thuật, chuẩn bị và thổ nạp. Ghi rõ món đã bake trong concept, món cần source riêng, native size, điểm chân, layer và chỗ đứng tương tác.
4. Tách alpha, đo pivot, giữ canvas chung nếu multipart; ghép vào cảnh review dùng cùng renderer/nhân vật. Kiểm trước/sau/hai cạnh, alpha sáng/tối và độ rõ ở 1×.
5. Sau đánh giá hình, nhập revision scene có nguồn/hash rõ và kiểm client/server cùng release. Nếu số object/part thay đổi, cập nhật hợp đồng package có kiểm chứng; không bỏ assertion chỉ để build qua.
6. Mở rộng icon/vật phẩm theo lát nội dung HN05 rồi HN08. Không biến đạo cụ đặt trên map thành nguồn loot hoặc crafting chỉ từ hình ảnh.

### Đợt đạo cụ đầu — danh sách để chốt brief

| Nhóm | Vai trò cần kiểm | Phạm vi mẫu đề xuất | Điều kiện dùng |
| --- | --- | --- | --- |
| Sân luyện | Nhận diện chỗ luyện, đọc silhouette cạnh người | Giá mộc kiếm hoặc đạo cụ luyện phù hợp; kiểm nguồn mục tiêu đang có trước khi thay | Đạo cụ trang trí và target server là hai trách nhiệm riêng |
| Chuẩn bị | Nhận diện điểm vật tư/chuẩn bị; rõ mặt bàn và chỗ đứng | Một bàn chuẩn bị với dụng cụ cần thiết theo brief | Concept đã có bàn/hũ; cần source riêng nếu tách lớp/thay hình, tránh đặt trùng |
| Thổ nạp | Giữ không gian tĩnh và mặt sân dễ đọc | Bồ đoàn/đế hoặc chi tiết thấp nếu thật sự còn thiếu sau kiểm khu | Ưu tiên dùng hoa văn sân hiện có; không thêm đồ chỉ để lấp khoảng trống |

Đây là ứng viên sản xuất, không phải danh mục vật thể GDD đã duyệt hoặc tọa độ mới. Giữ sân trung tâm thoáng và đường luyện né. Ba nhóm là phạm vi mẫu hữu hạn; không làm lại toàn bộ cây, nhà, cổng hoặc vật phẩm của các cảnh giới.

### Vật phẩm hành trang theo kế hoạch hiện có

Theo [catalog nhập môn](HANG-NHAC-CONTENT-CATALOG.md) và [VP0–VP4](ITEM-PRODUCTION-PLAN.md):

- Giữ mộc kiếm, áo môn phái và vật tư hồi phục đang có; không tái cấp đồ hoặc mở quyền từ ART.
- HN05/VP0: một icon nguyên liệu luyện hóa nhập môn, gắn với nguồn và nơi dùng đã được thiết kế.
- HN08/VP1: hai trạng thái raw/refined của cùng ngọc hộ thân, cùng nhận diện; không hai instance hoặc hai pháp khí mới.
- Các nguyên liệu/mực/hộp/Định Lưu Bàn hậu HN12 để đúng chặng. Chúng không phải điều kiện để hoàn thiện đạo cụ của hub hiện tại.

## 5. Reference và công cụ

Chuẩn phong cách chính là concept mới và các khu chi tiết được chọn sau đó. Reference ngoài chỉ bổ sung cấu tạo/hình dáng/chất liệu; mỗi link cần ghi bộ phận muốn học và điều cần giữ theo map Vân Ngọc. Không để ảnh chụp hoặc asset game khác quyết định toàn bộ nét/camera/bảng màu.

Đã mở được [Chinese furniture](https://en.wikipedia.org/wiki/Chinese_furniture) để nghiên cứu cấu tạo khung/giằng/chân bàn và [Jian](https://en.wikipedia.org/wiki/Jian) cho hình dáng kiếm thẳng/mộc kiếm luyện. Đây là nguồn cấu tạo, chưa là bộ reference hình được chọn cho sản xuất. Một số nguồn bảo tàng chưa truy cập được trong lượt tìm; không ghi chúng là reference đã kiểm.

[Tool game asset](GAME-ASSETGEN.md) giữ model `gpt-image-2`, source/prompt/hash và trạng thái chờ duyệt. Spec hiện nhận brief bằng văn bản, chưa có trường ảnh reference. Nếu muốn gửi concept trực tiếp làm image input qua router thì cần triển khai/kiểm đường API tương ứng trước; việc nhắc tên ảnh hoặc đường dẫn trong prompt không gửi pixel cho model. Có thể lập brief từ ảnh đã xem, nhưng phải ghi đúng loại tham chiếu đã dùng.

## 6. Bằng chứng nghiệm thu

Người frame 64 × 96, chân (32,88), camera 1× giữ nguyên. Mỗi asset có source, prompt/inputs, kích thước thực, hash, bản alpha, native export, điểm chân đo được và trạng thái ART riêng. Screenshot cần có người ở trước/sau vật, cạnh bảng màu/ánh sáng của map mới; đánh giá kích thước bằng native export thực, không chỉ nhìn ảnh source lớn.

Rà soát lần này chỉ đọc nguồn, hash, metadata và đường nạp runtime; chưa tạo ảnh, sửa scene hoặc chạy gameplay tests. Khi thực sự đổi map/layer: kiểm `test:hang-nhac-hud-layers` và hồi quy camera/map/NPC/R01/sect/lessons/reload phù hợp trên fixture, không ghi vào map/DB/draft owner. Test kỹ thuật không nâng trạng thái duyệt hình.
