# Manual source registration trước pack

`pack.py` chưa chạy và chưa có asset Banner. Sau gate Kiếm linh128, sinh bằng built-in ImageGen, giữ raw/prompt/input/hash và xem toàn nguồn. Từng selectedsource phải có entry dưới `manual-registration.json.sources[sourceId]`:

```json
{
  "sourceSha256": "raw-sha256",
  "actualGrid": [6, 5],
  "sourceViewed": true,
  "directionReviewed": true,
  "headTorsoFirstRecoveryReviewed": true,
  "calibrations": ["six actual neutral entries"],
  "actions": {"idle": ["actual ordered entries"], "run": ["actual ordered entries"]}
}
```

Mỗi entry chứa `rawIndex` (đọc trái→phải rồi hàng tiếp), `sourceRoot:[x,y]`, `sourceRootReviewed:true`, `sourceRootMeasurement:{semantic,method,observedBodyContactY,uncertaintyNativePx}`, `lift`, `rendererAppliesLift:false`, và `grip` nguồn. Neutral thêm `sourceCrownY` / `sourceBootSoleY` đo tóc→giày thật để lấy median factor80 của sáu neutral. Không dùng hem trắng hoặc tâm bbox làm phép đo giày.

`grip` cần `source:[palmX,palmY]`, `sourceWrist:[cuffX,cuffY]`, `sourceOcclusionRect:[x,y,w,h]`, `visibility`, `sourcePalmReviewed:true`, `sourceCuffReviewed:true` và uncertainty. Chỉ palm/fingers closed thật đặt `closedGripConfirmed:true`; tay rảnh kết ấn/mở hoặc tay bị che phải có policy phù hợp. Skin islands là proposal, không phải phân loại tự động. Góc đo wrist vector rồi trừ own neutral cùng source/view; không lấy camera hoặc N135.

Run dùng actual boot ROI/support projection và lift được giải thích; không neo một chân khiến thân nhảy. Prone chọn actual boot ROI hoặc source support envelope phù hợp pose, có uncertainty và không ép x vào pelvis bị áo che. Seated dùng support dưới chân/nếp áo và x projection có căn cứ. Rawtransparent không chứng minh world floor hoặc bone exact. Nếu lift đã xuất qua `rootY=boundary+lift/sourceScale`, renderer không trừ thêm.

Normal canvas112×112/pivot56,104; death192×128/pivot96,112 chỉ padding. Có thể mở padding khi source cần, giữ scale/root/world origin. Packer giữ toàn connectedbody cùng mảnh tay/tóc opaque rời thuộc pose; clip ở source phải sửa raw, không che bằng canvas native lớn.

Counts/mapping phải phản ánh source thật: med3 được nếu ba pose ngồi thật; run standing terminal để history, không đưa vào loop. Recovery dùng neutral cùng source chỉ khi có `reuseReason` rõ. Không copy cal thành action để đầy bảng. ST duration trước key4=600, tổng1560; AOE trước key4=900, tổng2500. Nếu có recovery7 thì holds thật phải vẫn khớp phase mapping đã ghi.

Sau pack xem native1×/2× và source dots; mới ghi `nativeContactViewed`. Body/hand/math checks không duyệt ART/motion/runtime. Root aggregate kiểm canonical/atlas UV/gutter/geometry và playback fact riêng. Không ghi Sword/V1/A/runtime/map/DB.
