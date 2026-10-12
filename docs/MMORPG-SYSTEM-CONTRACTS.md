# Hợp đồng hệ thống MMORPG — sức mạnh, farm, tỷ thí và diện mạo

**Bản thiết kế 0.1 · 11/10/2026 · phục vụ GDD 0.32.** Tài liệu nối yêu cầu sản phẩm với kiến trúc và điều kiện kiểm trước khi triển khai. Đây là **kế hoạch**, không báo loot/PvP/tọa kỵ đã hoạt động, không khóa số liệu cân bằng, chính sách giao dịch hoặc doanh thu.

Đọc cùng [GDD](GDD.md), [hành trình MMORPG](MMORPG-PROGRESSION-PLAN.md), [nhân vật](CHARACTER-SYSTEM.md), [nhiệm vụ](QUEST-SYSTEM.md), [vật phẩm](ITEM-PRODUCTION-PLAN.md), [kiến trúc Core](ARCHITECTURE.md), [entry backend](GAME-ENTRY-BACKEND.md) và [roadmap](DEVELOPMENT-ROADMAP.md). GDD sở hữu mục tiêu sản phẩm; hồ sơ này sở hữu hợp đồng kỹ thuật cần chốt theo lát. Không yêu cầu hoàn tất mọi MMO mới làm HN05.

## 1. Mục tiêu sản phẩm và nguyên tắc kỹ thuật

Tu luyện phải tạo khác biệt sức mạnh có thể cảm nhận khi đánh quái, đấu pháp và chọn nội dung; farm phải tạo vật liệu/đồ có nơi dùng; thành quả nhân vật phải nhìn thấy được bởi chính người chơi và những người gặp họ. Nền lưu bền cần giải thích được một món đồ hoặc một nguồn sức mạnh đến từ đâu.

- Server xác nhận quyền, thời gian, damage, chết/thắng, nguồn thưởng, tiêu tài nguyên, đồ đang dùng và diện mạo hợp lệ. Client gửi ý định và trình bày.
- Sức mạnh thật cần có giá trị. Một chế độ PvP cân bằng nếu được chọn là ruleset riêng; không ngầm triệt tiêu tiến trình ở mọi hoạt động online hoặc PvE.
- Danh tính avatar, sức mạnh và diện mạo là các dữ liệu khác nhau. Khuyến nghị thời trang/skin chỉ đổi hình. Nếu một món hoặc tọa kỵ có hiệu lực gameplay, ghi hiệu lực bằng nguồn riêng, công khai trong UI và kiểm cân bằng; nhận diện mới không tự sinh stat.
- Một domain có một nguồn số lượng và một nơi có quyền ghi. Room chung, phiên cá nhân và chuyển map không được nhân đồ, mốc hoặc thời gian.
- Triển khai bằng modular monolith hiện có và adapter mở rộng. Tách service/framework không là điều kiện của vòng farm hoặc tỷ thí đầu.

## 2. Nền có thật và giới hạn theo checkout

Các nhận định dưới đây là đối chiếu mã/tài liệu ngày 11/10; đợt tài liệu này không chạy lại test runtime.

| Phần | Code hiện có | Giới hạn cần nhận biết |
| --- | --- | --- |
| Identity/entry | Account/session/realm/character, play ticket một lần và lease điều khiển; port trong `server/src/core/ports.ts` | Local/pilot; không phải routing/presence MMO nhiều máy đã đo |
| Lưu registered profile | SQLite WAL, revision CAS, receipt và save cùng transaction ở `persistence/game-profiles.ts` | Blob profile và DB đồng bộ; còn cần budget ghi khi tăng người chơi/quái/loot |
| Hồ sơ | `shared/profiles.ts`: schema 2, identity riêng, HP/MP/deadline, inventory và sect | Mốc chỉ `introduction`/`M01`; không tự có M02, stat tăng hoặc skill mới |
| Codec | `persistence/profile-codec.ts` giữ khách/đăng ký; đọc schema 1/2 và mặc định tương thích | HP/MP bị giới hạn 0–100, bộ R01 đúng ba thuật; dữ liệu hỏng bị từ chối, không reset |
| Hành trang | `shared/character-inventory.ts`: hai gear, mang/tháo/bảo vệ; hồi phục đọc `sect.supplies` | Validator v1 bắt đúng hai gear; chưa inventory/container/loot/currency/cosmetic tổng quát |
| Chiến đấu | `shared/skills/contracts.ts`/engine: cast, MP/CD, projectile và hit server | Hit hiện nhắm `TrainingTarget` của caster; chưa damage peer, mob AI, threat hoặc party loot |
| Room | `HangNhacRoom` ghép gameplay/lifecycle/persistence; courtyard fixed timestep và input có giới hạn | Không có transfer thật; snapshot/FX chủ yếu trong toàn room, chưa AOI theo không gian |
| Tần suất hiện tại | Tick 30 Hz, patch 50 ms; save profile khoảng 1 giây và xét UI snapshot 250 ms | `maxClients=20` là giới hạn phòng thử, không công suất MMO được chứng minh |

Các bonus/đồ/ngoại hình trong preview không phải catalog gameplay. Không nới validator đơn thuần để coi mọi JSON là item thật. Thay đổi các giới hạn trên cần contract, migration và kiểm tương ứng.

## 3. Danh tính, nguồn sự thật và ranh giới module

| Dữ liệu | Khóa/phạm vi đề xuất | Trách nhiệm |
| --- | --- | --- |
| Nhân vật | `accountId`, `realmId`, `characterId` từ phiên/grant | Chủ sở hữu và tiến trình; không dùng tên/avatar/sessionId làm khóa đồ lâu dài |
| Hoạt động | `activityId`, version, room/map, participants | Quyền tham gia và ruleset, không do UI tự khai báo |
| Trận/đời quái | `attemptId` hoặc `spawnLifeId`, phase và server time | Phân biệt event hiện tại với event cũ/lặp; respawn có đời mới |
| Đồ | definition khác stack/instance của owner | Quantity, binding, nơi chứa, equip/protection và nguồn grant |
| Sức mạnh | Stat có bảng nguồn và ruleset version | Baseline, mốc, công pháp, gear/pháp bảo, effect có hạn; UI đọc cùng kết quả |
| Diện mạo | Quyền sở hữu, lựa chọn đang hiển thị, catalog version | Skin/outfit/pháp bảo/tọa kỵ xuất hiện; không thay `avatarId` hoặc tự tăng stat |

Shared chứa contract/validation/evaluator thuần. Application điều phối quyền, activity và plan tiêu/grant; persistence giữ transaction/CAS/business receipt; room/HTTP nối phiên và thời gian vào application; renderer/UI đọc snapshot và gửi ý định. Khi mở rộng, chuyển từng luật khỏi adapter có hồi quy, không tạo hai engine cùng cấp reward. Khai báo module mới trong boundary checker.

Snapshot private cho owner chứa inventory/quest/nguồn sức mạnh và trạng thái ghi. Peer chỉ nhận dữ liệu cần render/giao chiến và các thông tin được phép xem. Không broadcast toàn inventory, receipt hoặc quest bí mật để dựng màn khoe nhân vật; tính năng xem trang bị nếu có cần quyền và projection riêng.

## 4. PvE lặp và nguồn loot

Trước bật một nguồn farm, đặc tả: map/điều kiện vào; loại quái/node; respawn; ai được credit/loot; quota nếu có; bảng nguồn–chi; sức chứa/binding; chết/rời/drop/restart và cách nhận kết quả đã commit. Số lượng/drop rate/thời gian là quyết định cân bằng sau chơi thử.

1. Server tạo activity và đời quái/node; nhận input/cast hợp lệ, xét damage/hit/death và người có quyền nhận kết quả.
2. Death hoặc thu hoạch tạo server fact; từ fact lập reward plan. Client không gửi `killed=true`, damage hoặc số lượng muốn nhận.
3. Business key nhận diện **nguồn + đời/cycle/attempt + recipient + loại grant**. Request receipt nhận diện lần gọi; đổi request ID không được nhận lại cùng grant.
4. Grant, thay đổi stock, quest credit và source receipt liên quan commit atomic với revision. Thất bại ghi không cập nhật actor/UI thành công hoặc cấp nửa phần thưởng.
5. Mất phản hồi sau commit đọc lại receipt/snapshot. Event chết lặp, đòn của đời trước, request ngoài realm/activity/owner bị loại.

**HN05 lần đầu khác farm lặp.** Giữ receipt nhiệm vụ hiện hành; gói xác nhận HN05 không tự có thêm kill/random drop và không được biến thành vòng cấp lại. Nguồn lặp phải có nội dung và khóa riêng. Thưởng bắt buộc cần đường nhận không thất lạc khi đầy hành trang; chưa khóa mailbox/kho chung làm giải pháp mặc định.

Pilot khuyến nghị loot cá nhân, chưa giao dịch. Farm chung sau đó cần credit theo participation/party, ownership lúc chết và loot phân phối được chỉ rõ; không suy luật từ last-hit hoặc số damage đơn thuần. Mở RNG phải có ý nghĩa, cách kiểm và đường đạt mục tiêu; không áp may rủi để khóa nhiệm vụ nhập môn.

## 5. Damage peer và tỷ thí

R01 hiện chỉ biết bia luyện có `ownerId`. Mở PvP cần **target policy** mới theo activity/ruleset: ai có thể gây damage cho ai, tầm/đường nhìn, vị trí, trạng thái sống/kết nối và quyền trận. Không bỏ kiểm owner của bia để vô tình cho đánh mọi người trong Hằng Nhạc.

Hồ sơ một trận tỷ thí tối thiểu: mời/chấp thuận, participants/realm, điều kiện mốc, arena, countdown, stat/loadout tại thời điểm nào, HP/MP/CD lúc vào/ra, thời hạn, thắng/thua/hòa/forfeit, mất mạng, reconnect/restart, hủy và trả về an toàn. Đổi gear/công pháp giữa trận phải có policy; client không tự gửi winner hoặc yêu cầu hồi đầy ngoài luật.

Khuyến nghị pilot có consent và kết quả server, **chưa reward vật chất hoặc xếp hạng** để kiểm chiến đấu trước thêm win trading/boosting. Sức mạnh thực hoặc ruleset cân bằng đều phải hiển thị trước khi đồng ý; quyết định mode/public policy chưa khóa. Không mở PK tutorial, cướp đồ khi chết hay săn thưởng chỉ vì đã có tỷ thí.

## 6. Diện mạo, pháp bảo và tọa kỵ

- Appearance có quyền sở hữu và lựa chọn riêng, ví dụ outfit/weapon skin/artifact appearance/mount appearance. Các tên trường là đề xuất, chưa schema runtime.
- Một món pháp bảo có thể vừa có công dụng vừa có hình. Gameplay đọc instance/effect đã hợp lệ; hình đọc binding presentation. Skin thay hình không thay effect; món có effect phải cho biết nguồn/tác dụng/điều kiện.
- Chọn ngoại hình không đổi avatar identity, tên hồ sơ, progressionKind hoặc quyền công pháp. Không coi preview/ID asset gửi từ client là quyền sở hữu.
- Màn thử/mặc/tháo và peer render đọc cùng lựa chọn server; có feedback pending/save failure, fallback asset và cleanup khi thay nhân vật.
- Mount cần summon/dismount, zone restriction, speed/collision/đánh nhau, interruption và lifecycle. Sở hữu mount khác đang cưỡi; ART lớn hơn không tự làm hitbox lớn hơn hoặc cho bay qua blocker.
- Brief ART xác định silhouette, render layer, canvas/pivot/chân, frame/direction và ngân sách texture. Giữ hợp đồng body/cast/native locomotion hiện có, camera 1× và map owner; không sửa 9 blocker/bậc thang để vừa mẫu mount.
- Nếu mount đổi vận tốc hoặc footprint gameplay, server movement và prediction phải có cùng contract; kiểm lối hẹp, occlusion, chuyển cảnh và dismount an toàn trên release đã duyệt. Không dùng kích thước bitmap làm collider.

Cosmetic-only là khuyến nghị thiết kế, không chính sách kinh doanh đã duyệt. Tài liệu này không chốt cash shop/gacha, giá, rarity hoặc hiệu lực từ đồ trả tiền.

## 7. Lưu, migration và chuyển quyền ghi

Nâng schema/codec theo gói đang dùng. Giữ ID, receipt cast/sect/inventory, gear protection/equipment, mốc/credit, HP/MP/deadline và revision cũ. Thêm trường thiếu nhận mặc định có nghĩa; không cấp thưởng/đồ mới chỉ vì thiếu trường. Đổi text không phát lại reward; đổi nội dung thật cần version/mapping.

`sect.supplies` tiếp tục là nguồn recovery tới khi adapter/migration được kiểm. Nếu chuyển thành stack, chuyển số lượng đúng một lần và ngừng nguồn ghi cũ; không cộng cả hai. Definition/instance/container mở rộng cần invariant một món không đồng thời nằm ở hai nơi sử dụng. Gear bonus/max HP/MP cần codec và quy tắc khi max thay đổi; migration không ngầm hồi đầy.

Registered receipt table hiện CHECK chỉ nhận `cast`, `sect`, `inventory`. Nếu bổ sung receipt domain phải có migration SQL/port/validator giữ các khóa cũ, hoặc bảng nguồn riêng có unique business key; không giả định kind mới đã được DB nhận. Transaction plan và business receipt cần fingerprint để từ chối dùng lại khóa với payload khác.

Room transfer cần bàn giao có phase/nonce/expiry và quyền ghi được phân biệt theo generation/fencing: chốt source → destination claim → actor destination được xác nhận → source dọn. Nếu source vẫn có actor để xử lý rollback, actor đó không còn quyền gameplay/ghi khi destination đã claim. Timeout/restart có một đường recover được xác định; cùng lúc không có hai actor điều khiển hoặc hai writer. Lease hiện có là nền bảo vệ entry, chưa tự là contract transfer/multi-host đã hoàn chỉnh.

## 8. Debug, hiệu năng và mở rộng

Giữ requestId/accountId/realmId/characterId; thêm activity/attempt/spawnLife/source/grant/ruleset/content version và profile revision khi cần. Debug phải nối được **ý định → quyết định quyền/luật → fact → commit/receipt → snapshot**, có reason từ chối rõ. Không log credentials, session secret hoặc toàn inventory.

Đo trước mở tải: tick p95/p99, backlog/drop input, actor/quái/projectile count, patch bytes/client, CPU/memory, commit latency/failure/revision conflict, reconnect/transfer failure, reward rate và lượng tài nguyên nguồn–chi. Đặt room/spawn/FX limits theo số đo, không gọi cấu hình phòng thử là công suất MMO.

AOI/spatial index là gói mở rộng khi tải cần: chỉ gửi actor/FX phù hợp khoảng quan sát, nhưng server vẫn mô phỏng luật combat và quyền target. Vào/ra vùng quan sát cần snapshot đầy đủ và cleanup; ẩn render không xóa actor gameplay, không cho ngắm mục tiêu private ngoài quyền.

DB đồng bộ và save blob khoảng mỗi giây là điểm cần đo. Tối ưu checkpoint vị trí/dirty state có thể làm sau khi chọn durability; reward/chi phí/mốc cần durable boundary độc lập, không gom trễ để dễ mất hoặc nhân đồ. Đổi PostgreSQL/Redis hoặc presence/driver nhiều máy phải giữ transaction/CAS/business receipt/fencing/routing và có kiểm multi-host; chưa chọn framework hay cam kết production-ready.

## 9. Gate hữu hạn và thứ tự ghép

| Gate đề xuất | Bàn giao nhỏ nhất | Bằng chứng cần có |
| --- | --- | --- |
| **K0 — nền HN05** | Quest/item tối thiểu, transfer, E01 cá nhân, thua/thử lại và quyền M02 theo đặc tả | Save/receipt cũ giữ; một writer; cả ba avatar đi–thắng/thua–về; không đòi farm/PvP/mount trước |
| **K1 — farm tạo sức mạnh** | Một tuyến/nguồn lặp, một loại quái, một material có nơi tiêu, một đồ/nâng cấp có tác dụng thật | Người chơi thấy trước/sau và lý do mạnh hơn; mỗi đời/cycle có một source grant cho đúng người nhận; nhịp/chi và lifecycle được chơi thử |
| **K2 — tỷ thí** | Hai nhân vật thật, consent, target policy R01 mới, kết quả server và đường trở lại | Kết quả/damage/forfeit đúng; mode/loadout rõ; không đụng tutorial/receipt bia, chưa cần rank/economy |
| **K3 — khoe thành quả** | Một diện mạo kiếm được, xem trước/mặc/tháo và peer thấy | Ownership/save đúng; appearance riêng khỏi power; native sprite/pivot/layer và UI được kiểm |
| **K4 — mở tải/nhiều người** | Chọn một nhánh: farm chung/party loot, thêm appearance/mount, hoặc AOI/capacity cần thiết | Contract riêng, dữ liệu đo, source–sink/abuse; không mở tất cả MMO chỉ vì K1–K3 có code |

K1–K3 là ba vòng chứng minh lời hứa sản phẩm, không là ba cảnh giới hoặc yêu cầu làm đồng thời. Thời điểm trong hành trình dựa [kế hoạch MMORPG](MMORPG-PROGRESSION-PLAN.md), phụ thuộc nội dung/ART/ngoại vi đã duyệt và roadmap; chưa cam kết ngày phát hành. Nhánh PvE lặp và tỷ thí có thể dùng chung nền combat nhưng dùng quyền, kết quả và reward policy riêng.

## 10. Ma trận lỗi và kiểm trước nhận bàn giao

| Case | Kết quả cần kiểm |
| --- | --- |
| Request lặp/ID mới cho cùng source | Một grant; fingerprint khác bị từ chối; đọc được kết quả đã commit |
| Death/hit lặp hoặc đời quái cũ | Không credit/loot thêm, không damage actor của attempt khác |
| Full bag hoặc output không ghi được | Không mất input/đồ hoặc khóa phần thưởng bắt buộc |
| Hai lệnh tiêu cùng stock | Một commit hợp lệ, bên còn lại nhận lý do; không lost update |
| Drop/reconnect/restart/transfer ở ranh giới commit | Đúng một writer, không hồi đầy/reset deadline/phát lại reward ngoài policy |
| Người ngoài gửi source/target/item/appearance ID | Từ chối đúng quyền, không lộ state private |
| Tỷ thí thiếu consent/đổi gear/disconnect | Kết quả theo ruleset, không damage vùng nhập môn hoặc tự suy thắng client |
| Cùng avatar, khác character | Đồ, source, quest, appearance và record riêng |
| Mount/skin thay khi cast hoặc chuyển map | Không đổi hitbox/stat ngầm, không mất pivot/layer/asset cleanup |
| Flood input/cast/source và bot tốc độ | Giới hạn ở server, không nhân thời gian/thu hoạch hoặc làm tick quá budget |

Sau triển khai chạy test bằng DB/publicDir/browser fixture riêng, hồi quy entry/character/R01/sect/lessons/reload thích hợp. Chạm input/hit cần aim/gameplay, chạm body/render cần native sprite/36 cast/HUD/layer thích hợp. Chơi thử cân bằng, kỹ thuật và duyệt ART là ba bằng chứng riêng. Không ghi fixture vào DB, map owner hoặc draft trình duyệt thật; bản tài liệu này chưa chạy các kiểm đó.
