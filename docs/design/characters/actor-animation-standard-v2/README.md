# Chuẩn animation pixel Vân Hải · bản chốt02

**12/10/2026:** owner nhận xét tốt Pixel02 và Ngự Phong01, yêu cầu dọn bộ cũ và lưu skill để làm nhân vật tiếp theo. [Approval theo hash](approval.json) pin323file/40clip/240pose; duyệt ART/motion và production basis, không bao gồm full player/live server hoặc cân bằng/hiệu năng MMO.

- [Nguồn idle/run/Kiếm/Lôi](../wang-lin-pixel-production-v2/README.md):32clip/192pose,8hướng.
- [Nguồn Ngự Phong](../wang-lin-pixel-wind-v1/README.md):8clip/48pose,8hướng; gió/bóng tách riêng.
- [Review thống nhất](http://127.0.0.1:5174/@fs/C:/Users/Mark-TA/Documents/game-solo/docs/design/characters/wang-lin-pixel-wind-v1/index.html):master đã chốt cạnh động tác, cùng pixel/world foot/map1×; không nạp bộ cũ.
- [Skill dùng lại](../../../skills/game-actor-animation-production/SKILL.md), bản cài cá nhân cùng nội dung ở `C:/Users/Mark-TA/.codex/skills/game-actor-animation-production/`.
- [Nguồn lịch sử đã lưu trữ](../../../archive/actor-animation-pre-pixel02-2026-10-12/README.md):pilot, production01, study hai hướng và các source bị loại.

Contract Vương Lâm: idle/run64×96/(32,88), Kiếm/Lôi96×96/(48,88), Phong112×96/(56,88), standing nominal80px/camera1×. Scale chung từneutral mỗi nguồn; không fit từng pose. Body/props/aura/skillFX/ghosts riêng; nhịp Core16/17/14tick. Đây là recipe cho người; quái/boss dùng anatomy/footprint/master riêng.

**Player locomotion chốt12/10:** [Một bộ run cho normal/Shift-fast](locomotion-policy.json), bỏ walk/sprint riêng, tiết kiệm8clip/48pose đi bộ. Phase theo actual travel/stride chung, không reset khi Shift đổi và không advance lúc blocked; không đổi body scale hoặc chốt lại speed balance. Quái/NPC giữ gait riêng. [Combat01](../wang-lin-pixel-combat-v1/README.md) đã thêm hit/death/combo1/2/3:40clip/240pose candidate; [review tổng80clip/480pose](../wang-lin-pixel-combat-v1/index.html). Bộ40 đã duyệt giữ nguyên.

`current-pack.json` và `presentation.json` trong wind01 có40body và24binding thuật8hướng,10FX R01 giữ nguyên. Scoped sync ra `/assets/pixel-actor-production-v2/`; live avatar sources và backend không đổi. Code clock/renderer/Core và fixture combat thuần được giữ để tích hợp đợt sau; UI/asset demo cũ đã rời active pipeline.

```powershell
npm.cmd run assets:actor-animation-production
npm.cmd run test:actor-animation-production
npm.cmd run typecheck
```

Kiểm hiện hành:240frame asset/GPU/native/browser;11unit clock/Core/binding/server fixture;8hướng,4viewport,FX toggle/arrival/ghosts/lifecycle/cache. Direct Vite build riêng không gọi owner map builder. Approval mới nằm riêng ở đây; các catalog nguồn giữ nguyên byte và trường lịch sử `artApproved:false`, không dùng chúng phủ nhận hoặc mở rộng quyết định owner mới.

Các builder/record root đã chốt được khóa ghi; làm pack mới/version mới từmaster được chọn. **Combo1–3/hit/death** đã có candidate combat01; **cử chỉ/đả tọa/cưỡi/ngự kiếm/thu thập** chưa sản xuất. Player không yêu cầu walk riêng. Tích hợp toàn actor và làm nhân vật tiếp theo tiếp tục theo ma trận này.
