# Hằng Nhạc — hồ sơ riêng và ba thuật R01

**08/10/2026 · _MMO · GDD 0.28.** Hoàn tất mốc hồ sơ/lưu và luyện thử R01 của bước 2 trong [kế hoạch triển khai](HANG-NHAC-IMPLEMENTATION-PLAN.md). Ngôn ngữ vẫn là TypeScript; Three.js dựng hình, Node.js + Colyseus xử lý phiên và gameplay. Đây là bản thử local, chưa hoàn tất nhập môn HN01–HN12 hoặc combat trên map farm.

**Tiếp nối hiện hành:** [NPC/HN01–HN02/thổ nạp](HANG-NHAC-SECT-RUNTIME.md) đã có bản đầu bước 3. Hồ sơ JSON và DB nâng schema 2, giữ nguyên dữ liệu R01 và receipts bước 2; chưa có đòn đánh cơ bản/bài HN03–HN04. Phần dưới và biên bản bước 2 ghi baseline đã bàn giao theo thời điểm.

## Chơi thử

Chạy `npm.cmd run dev`, mở [Hằng Nhạc](http://127.0.0.1:5173/hang-nhac.html). Chọn một trong ba nhân vật và bấm **Vào sân chung**. Mỗi trình duyệt nhận một tài khoản khách với ba hồ sơ riêng; cùng tài khoản chỉ điều khiển một nhân vật tại một thời điểm. Bấm **Rời sân** rồi chọn người khác để đổi. Hai người thử online cần hai browser profile/context riêng.

WASD/phím mũi tên/nút di chuyển mobile đổi hướng Kiếm Khí và Ngự Phong Bộ; dừng lại giữ hướng. Chạm vùng map để ngắm riêng; hướng ngắm giữ cho tới khi đổi input di chuyển. Khi vừa nạp hồ sơ, dùng hướng đang đứng của nhân vật. Lôi Ấn quay về mục tiêu đã chọn theo vị trí server lúc nhận cast. HUD hiển thị mũi tên hướng Kiếm/Phong. Bấm **Mục tiêu luyện** để tạo/chọn mục tiêu cá nhân trong vùng đi hợp lệ. Dùng **1 Kiếm Khí**, **2 Lôi Ấn**, **3 Ngự Phong Bộ**, hoặc nút trên màn hình. Mục tiêu chỉ kiểm skill; không phải quái farm, không cho EXP/vật phẩm, không thêm collider hoặc ART vào dữ liệu owner. Bấm lại mục tiêu luyện khi cần đặt lại sức bền. Người chơi và NPC không nhận damage ở sân an toàn này.

09/10 đã sửa mảnh đầu/tay/chân lọt vào frame thi triển từ sheet kế bên, gồm cả bóng Phong. Vùng vẽ theo frame giữ nguyên tỷ lệ/điểm chân/hold và bitmap nguồn; kiểm GPU 300 frame và 36 tổ hợp trong game theo [biên bản](data/hang-nhac-skill-crop-verification.json). Tài liệu [skill core](SKILL-CORE.md) hướng dẫn debug crop/cutout khi thêm animation.

## Hồ sơ và lưu

[ProfileStore](../server/src/profile-store.ts) dùng SQLite tích hợp trong Node, mặc định `server/data/profiles.sqlite`; thư mục này bị loại khỏi Git. `GAME_DB_PATH` cho phép chọn file khác. Yêu cầu Node >=22.13.0; đã kiểm trên 24.18.0. Tham khảo [API SQLite của Node](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html).

- Tài khoản khách có token ngẫu nhiên; DB chỉ lưu hash. Trình duyệt giữ token, không sở hữu vị trí, linh lực hoặc quyền skill. Không tự tạo save mới khi token đã có nhưng server không đọc được.
- Ba hồ sơ được tạo một lần: ID, nhân vật, vị trí/hướng/map, loại tiến trình, mốc nhập môn, ba quyền R01, HP/MP, số lần dùng/trúng, cooldown, revision và thời điểm lưu.
- Vương Lâm/Lý Mộ Uyển có loại tiến trình `cultivation`; Tư Đồ Nam là `recovery`. Chưa áp một cảnh giới canon chung, chưa triển khai tăng tu vi hoặc hồi phục năng lực.
- Lưu tự động mỗi giây và khi vào/rời/drop/yêu cầu lưu. Revision so sánh trước ghi để từ chối đè bản mới. Hồ sơ chưa vào lần nào rải quanh Spawn trên đất hợp lệ để tránh chồng hình; hồ sơ đã lưu giữ vị trí cũ nếu hợp lệ trên release hiện hành, nếu không về Spawn an toàn.
- Chi phí/cooldown/lần dùng và biên nhận lệnh được commit trong cùng transaction trước khi thuật được phát. Lặp cùng request ID không trừ thêm hoặc tạo hit; dùng ID đó với nội dung khác bị từ chối. Biên nhận tồn tại qua restart.
- Lease một phiên điều khiển cho tài khoản khách, dùng chung giữa các room trong một tiến trình server. Tab khác không được nhân regen hoặc điều khiển nhân vật khác đồng thời. Đây chưa phải khóa phân tán cho nhiều server.
- Reload giữ reconnection token trong sessionStorage, thử nối về cùng phiên trong 15 giây; khi phiên không còn thì vào lại từ bản lưu SQLite. Restart giữ dữ liệu hồ sơ, không khôi phục projectile/target/cast đang chạy. Chi phí đã xác nhận được giữ.

Đây chưa phải đăng nhập sản xuất, đồng bộ thiết bị hay quyết định DB MMO cuối cùng. Tài khoản khách phụ thuộc token cùng trình duyệt và file DB server. Chưa có kho chung, slot mua thêm, offline tu luyện hoặc phần thưởng. Vị trí/counter thông thường có cửa sổ lưu tối đa khoảng một giây nếu tiến trình bị kết thúc đột ngột; chi phí thuật đã nhận được lưu ngay.

## Luật thử R01

Số liệu dưới đây lấy baseline trong [gameplay Ngưng Khí](NGUNG-KHI-GAMEPLAY-SPEC.md), **chưa phải cân bằng đã duyệt**. HP/MP khởi đầu 100; tốc độ đi giữ 80 px/s của map hiện hành. Regen online trong sân: 12 MP/s sau hai giây kể từ lần tiêu linh lực cuối; không cộng bù thời gian offline.

| Thuật | Chi phí / hồi | Xử lý đã có |
| --- | --- | --- |
| Kiếm Khí | 10 MP / 1,5 s | Release 250 ms; projectile 480 px/s, tầm 360, radius 12; damage 30 lên một mục tiêu luyện của người dùng. Bắt đầu tại gốc chân, không dùng offset đầu 100 px của preview |
| Lôi Ấn | 25 MP / 5 s | Chỉ mục tiêu luyện đã chọn, còn sống và trong 280 px; khóa điểm ở release 333 ms, resolve 500 ms; damage 45 nếu mục tiêu còn cách snapshot <=24 px và đường không bị chặn. Không AoE/retarget |
| Ngự Phong Bộ | 10 MP / 3 s | Sau 167 ms, lướt tối đa 160 px trong 250 ms theo hướng ngắm; dùng cùng collider chân/vùng owner. Báo điểm đến thật, không xuyên tường, không damage/vô địch |

[R01Engine](../shared/r01.ts) xử lý thời gian, một cast đang chạy, tài nguyên, cooldown, đường đi và hit. Server không nhận damage/vị trí/MP do client viết. Đổi input di chuyển trước release hủy Kiếm/Lôi, giữ chi phí/cooldown; input đã giữ lúc bắt đầu không tự hủy. Walking mở lại ở recovery; cast mới chờ kết thúc. Phong bị chặn hoàn toàn thì từ chối trước chi phí; nếu đi được đoạn ngắn thì giữ chi phí và dừng đúng blocker. Projectile đã release có thể hoàn tất trong room khi mất mạng; leave xóa phần còn lại, không phát lại khi resume.

## Animation và adapter VFX

[Skill core ngày 09/10](SKILL-CORE.md) tách gameplay, behavior, timeline animation/VFX, asset loader và UI. `shared/r01.ts` giữ facade tương thích; luật, save và chi phí bước 2 giữ nguyên. [sync-skill-assets.mjs](../scripts/sync-skill-assets.mjs), qua facade sync-r01-vfx, chạy trong `npm run assets`: giữ **10 atlas FX / 539.528 byte** và ba chuỗi Vương Lâm Đông gốc, thêm [33 clip mới](design/characters/core-cast-v1/README.md). Catalog v2 có **36 clip cast / 300 frame**, binding đủ ba nhân vật/bốn hướng, track và socket. Tải 12 pose clip theo avatar được chọn/xuất hiện; không preload cả bộ.

[SkillTimeline](../shared/skills/presentation.ts) đọc server event/state, lấy pose/FX bằng tuổi cast tuyệt đối và hold nguồn. [Three adapter](../client/src/skills/three-presentation.ts) hiển thị theo descriptor; nhân vật nearest, FX theo sampling nguồn. Locomotion vẫn 64 × 96/chân (32,88); cast canvas cao 96 px, rộng đủ tay/áo, cùng điểm chân y88 và body tối đa 80, Tư Đồ Nam cao hơn đất 4 px. Camera 1× và radius 8 giữ nguyên. Kiếm charge/projectile/impact; Lôi seal/telegraph/bolt/impact; Phong depart/trail/arrival và bóng lịch sử bám vị trí thực. Damage xử lý một lần trước hiệu ứng; bolt/impact chỉ phát khi server xác nhận hit, Lôi impact chờ 83 ms để khớp contact trình bày. Frame VFX không quyết định damage.

Pose thi triển ưu tiên hơn đứng/đi trong thời gian cast rồi trả native; cancel/late join/reconnect lấy đúng castId/tuổi, không phát lại hit cũ. Ba clip Vương Lâm Đông giữ chuỗi đã bàn giao; ART/socket mới của bộ ba còn chờ owner đánh giá hình. Chưa có SFX/icon sản xuất, R02–R05, tối ưu crowd hoặc part che theo mái/tán. Mục tiêu luyện là marker giao diện tạm. `window.__hangNhacSkills()` cung cấp clip/frame, trace và lỗi binding/asset.

## Kiểm chứng

`npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:hang-nhac-r01` kiểm store/CAS/transaction, sanitizer, chi phí/hit một lần, cancellation, projectile sát người/tường, snapshot Lôi, Phong/vùng owner, reconnect/restart và browser desktop/mobile. `test:skill-animation` kiểm 36 tổ hợp thi triển/frame tiến/trả native và hình GPU bằng fixture riêng. `test:hang-nhac`, `test:online`, `test:browser` kiểm hồi quy di chuyển/renderer/room cũ. [Biên bản skill core](data/hang-nhac-skill-core-verification.json) ghi đợt 09/10; [biên bản bước 2](data/hang-nhac-r01-verification.json) giữ lịch sử.

Map release, 9 blocker, Spawn, native actor và bytes nền owner giữ nguyên. Bước tiếp theo là tương tác môn phái/NPC/hướng dẫn/thổ nạp và mốc nhập môn; map farm và khảo nghiệm tách riêng theo GDD. Kết quả kỹ thuật không tự xác nhận ART mới hoặc hoàn thành toàn bộ gameplay.
