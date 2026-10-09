# Hóa Thần V2 · Áp lực và nhịp bật · 2.0.0

**Snapshot lịch sử tại mốc xuất nguồn:** số file, trạng thái chờ duyệt và thông số dưới đây được giữ để truy phiên bản. Bản hiện hành là [Hóa Thần V3/pack 3.0.1](HOA-THAN-KIT.md), đã chấp nhận và [đóng đợt ART 15 skill](STARTER-VFX-HANDOFF.md); không là backlog đang chờ motion. Preview chung hiện trỏ bản mới nhất.

V2 xử lý phản hồi **bản trước chỉ khác màu/chất liệu và thiếu lực**. V1 dùng toàn bộ pose/impact cũ, kiếm/phong có nhiều đường cong mềm, chuyển động đều và preview mặc định 0,5×. V2 giữ nhận diện ngọc/ngà/vàng, đổi silhouette attack, vẽ impact riêng, rút ngắn nhịp xuất và dùng tốc độ thật 1×. Cảm giác lực không dựa riêng vào glow hoặc phóng cỡ người.

[Kiếm](hoa-than-kit.html?family=sword) · [Lôi](hoa-than-kit.html?family=thunder) · [Phong](hoa-than-kit.html?family=wind) · [Thư viện 15 skill](skill-library.html) · [ZIP V2](releases/hoa-than-kit-2.0.0.zip) · [Hồ sơ V1 lịch sử](HOA-THAN-KIT-V1.md).

## Thay đổi nhìn thấy được

| Nhánh | V1 | V2 |
| --- | --- | --- |
| Kiếm | Một kiếm nổi trong vòng khí/sương cuộn | Một đường xuyên thẳng, cạnh khí vuốt sau; impact chém bật và mảnh khí cùng hướng đánh |
| Lôi | Tia mảnh với dải mực cong | Lõi trắng giáng xuống, nhánh sét góc cạnh; sao chạm và mảnh phù bật ra |
| Phong | Dải khí/lá cuộn, lướt đều | Ba cạnh áp lực nén hướng sau, bật nhanh rồi giảm tốc khi đáp; burst gọn ở chân |

Bản V2 vẫn dùng pose Vương Lâm hiện có: cải thiện nhịp hold và luồng lực, **chưa vẽ mới động tác toàn thân**. SFX chưa sản xuất. Không khẳng định gói ART thay thế đầy đủ animation chiến đấu và âm thanh khi tích hợp.

## Gói nguồn

| Skill | Folder | PNG / atlas | Attack/impact mới | PNG giữ nguyên từ V1 |
| --- | --- | --- | --- | --- |
| Ý Cảnh Kiếm | r05-sword-v2 | 38 / 5 | 6 flight + 8 impact | 24 pose/tụ tay/tụ ý |
| Ý Cảnh Lôi | r05-thunder-v2 | 40 / 5 | 6 bolt + 8 impact | 26 pose/phù tay/ấn nền |
| Ý Cảnh Phong | r05-wind-v2 | 34 / 4 | 6 trail + 8 arrival | 20 pose/vòng khởi phong |
| Tổng | | **112 / 14** | **42** | **70 nguyên byte** |

Mỗi folder có source/prompt/provenance, PNG RGBA rời, atlas, export-spec, clips.json, skill.json và review. PNG rời là nguồn chính; atlas là output. Khóa archive V2 bằng manifest/SHA-256; bản V1 và các realm cũ giữ nguyên. Nguyên Anh được chấp nhận, R05 V2 chờ xem motion.

Thư viện tại mốc snapshot 15 skill: **644 PNG / 76 atlas**. ZIP chung giữ thêm R04 V1 và R05 V1 để kiểm hồi quy/so sánh: **918 PNG / 109 atlas**. Các con số có frame dùng lại giữa phiên bản/cảnh giới, không phải số hình độc nhất. ZIP chung không lồng các ZIP skill; tải riêng qua thư viện workspace gốc.

Giải nén, chạy `python serve-preview.py`, mở `http://127.0.0.1:4185/skill-library.html`. Server dùng cổng 4185. ZIP riêng chứa một skill/helper, không có web preview.

## Frame, tỷ lệ và cảm giác lực

24 FPS, event tác giả từ frame 1. World 960×640 orthographic, 1× = world px / CSS px, DPR tối đa 2; khung nhỏ cắt vùng nhìn. Body tối đa 80 world px, idle 64×96, cast Kiếm/Lôi 96×96, Phong 112×96. Character nearest, FX linear, alpha blend thường.

| Clip mới | Số frame | Canvas / anchor | Visible size tối đa |
| --- | --- | --- | --- |
| sword-flight | 6 loop | 224×128 / 196,72 mũi kiếm | 176×101 |
| qi-impact | 8 không loop | 176×160 / 88,80 điểm chạm | 103×112 |
| thunder-bolt | 6 không loop | 176×256 / 88,208 điểm chạm | 150×192 |
| thunder-impact | 8 không loop | 176×160 / 88,80 điểm chạm | 128×113 |
| wind-trail | 6 loop | 240×128 / 200,72 đầu phong | 176×87 |
| wind-return-curl | 8 không loop | 208×144 / 104,88 điểm đáp | 110×84 |

Scale chung trong từng chuỗi; các frame tan giữ đúng pivot, không tự phóng đầy canvas. Tên kỹ thuật wind-return-curl dùng chung adapter; ART V2 là áp lực theo hướng tới trước, không kéo người trở lại.

Kiếm release **F11** thay F17; Lôi release **F12** thay F16; Phong yêu cầu movement **F10**, preview đáp **F13** thay F13→F19. Kiếm/Lôi kết thúc pose F20, Phong F21. Preview Kiếm dùng 1056 world px/s thay 480, tipAhead 48; Phong minh họa 160 px trong ba tick với ease-out để bật đầu nhịp. Đây là đường mô phỏng ART; tốc độ/phạm vi thật do combat/movement quyết định.

Impact mới có tám frame với hold [1,1,1,1,2,2,2,2]: nhịp chạm–bật sớm, dư âm tan gọn. Lôi bolt [1,1,1,1,1,2], impact sau một tick hình. Thời điểm damage không đợi hình.

Tùy chọn **Cảm giác lực** bật mặc định: rung camera tối đa 2 world px trong vài tick; hit-stop hình ảnh Kiếm 60 ms / Lôi 50 ms / Phong 35 ms tại nhịp chạm/đáp của preview. Tắt được; reduced-motion tắt feedback. Không flash toàn màn hình. Lôi còn lớp tương phản nền 72×48 px, alpha tối tối đa 0.12 và lóe cục bộ ba tick.

Hit-stop trong preview dừng đồng hồ mô phỏng riêng để xem ART. Khi tích hợp, chỉ giữ pose/compositor hoặc camera presentation; **không dừng server/combat clock, không trì hoãn damage**. Không dùng camera để che ART thiếu lực. Ảnh so sánh cục bộ tắt rung để đánh giá hình ở cùng camera/cỡ người.

## Nguồn và prompt

Dùng **imagegen tích hợp**, prompt stylized-concept, tham chiếu source V1/R04 chỉ để khớp vật liệu. Vẽ sheet RGBA có các pha pressure / contact / peak / overshoot / decay. [r05-force-art-selection.json](production/r05-force-art-selection.json) lưu đường dẫn ảnh sinh gốc, prompt, source chọn và SHA-256.

- Kiếm: [flight prompt](r05-sword-v2/prompts/sword-piercing-flight.txt), [source](r05-sword-v2/source/sword-piercing-flight.png); [impact prompt](r05-sword-v2/prompts/sword-cleave-impact.txt), [source](r05-sword-v2/source/sword-cleave-impact.png).
- Lôi: [bolt prompt](r05-thunder-v2/prompts/thunder-verdict-bolt.txt), [source](r05-thunder-v2/source/thunder-verdict-bolt.png); [impact prompt](r05-thunder-v2/prompts/thunder-verdict-impact.txt), [source](r05-thunder-v2/source/thunder-verdict-impact.png).
- Phong: [trail prompt](r05-wind-v2/prompts/wind-pressure-trail.txt), [source](r05-wind-v2/source/wind-pressure-trail.png); [arrival prompt](r05-wind-v2/prompts/wind-pressure-arrival.txt), [source](r05-wind-v2/source/wind-pressure-arrival.png).

Node/Sharp chỉ crop, đăng ký tip/contact/foot, resize đồng nhất cả chuỗi và pack. CellRects lấy khoảng trống giữa hình để giữ đầy đủ nét; không vẽ/sửa ART bằng script. Prompt là ý đồ, nguồn được chọn và ảnh review thể hiện kết quả thực tế.

Initial extraction: export-r04-sequences.mjs → build-r05-force.mjs ghép 70 PNG giữ nguyên → pack-atlases.mjs. Chỉ chạy initial extraction/merge khi tạo bộ; sau khi artist sửa PNG chỉ pack. Không ghi đè folder V1.

## Handoff

R05ForceVfxController trong production/r05-force-controller.mjs mở rộng adapter V1 đã khóa. API beginCast, setActorFoot, setTargetFoot, setProjectilePose, confirmHit, expireProjectile, confirmArrival, update, endCast, dispose như hồ sơ V1. update trả sprite records; feedback(now) trả camera impulse tùy chọn, tắt sau vài tick. onFeedback({type,castId,at,hitStopMs,visualOnly}) gửi một lần khi host hit/arrival được nhận; renderer quản lý presentation riêng. Hit trùng không phát feedback lần hai.

Lớp nền 0, body 1, attack 2, impact 3. localContrast layer 0.25 không có sample, cần nhánh render riêng. Opacity từ sample.clip.opacities. Host sở hữu damage/hitbox/projectile pose/movement/arrival. VFX không tạo AI, collider, damage, di chuyển hoặc miễn nhiễm. Boss chỉ đổi điểm neo, không phóng effect. Impact không chứa bia đá/vật liệu; preview quái/boss là vùng chạm thử.

## Kiểm và trạng thái

**72 kiểm tra đạt**: 60 giữ nguyên cho R01–R05 V1, 12 mới cho V2. Kiểm PNG/atlas/hold/opacity, 42 frame mới và 70 dùng lại, nguồn/gói V1 nguyên byte, hit/miss/trễ, arrival thật, camera impulse finite và dedupe, không sửa điểm chân host. Có 30 capture V2 ở 1×/2× và ba bảng V1/V2, đã xem flight, impact và điểm đáp ở tỷ lệ game. Browser interaction chưa xác minh.

[So Kiếm V1/V2](review-r05-force-sword.png) · [Lôi](review-r05-force-thunder.png) · [Phong](review-r05-force-wind.png).

R05 V2 chờ chủ dự án xem motion. Chưa tích hợp runtime, vẽ pose mới/toàn bộ hướng, SFX/icon, crowd LOD hoặc benchmark. Các chủ đề Tĩnh Kiếm / Định Lôi / Phong Du là ART cho game, không khẳng định thuật pháp canon hoặc công pháp gameplay.
