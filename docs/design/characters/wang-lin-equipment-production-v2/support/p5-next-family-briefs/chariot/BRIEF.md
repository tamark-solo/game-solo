# Xạ Thần Xa · body điều khiển thiết bị đặt đất

Hai nhân vật ra lệnh bằng seal và lòng bàn tay mở. Xạ Thần Xa là prop có root ở đất, đặt cách caster 55 review px trong fixture; body không nắm command loop của thiết bị ở xa. Huyễn Tâm giữ giáp/cuff đồng cổ và áo than-ngà P1; Tịch Bạch giữ giáp thép lạnh/áo lam-than-ngà và tóc trắng P1. Mỗi hướng phải được vẽ thật, gồm N nhìn sau và E/W profile.

## Tám action

| Action | Chuyển động cần đọc được |
|---|---|
| idle | Thở và chuyển trọng lượng nhẹ; tay trống nghỉ ở ngực/thắt lưng, không căng như kéo xích. |
| run | Chân contact/passing luân phiên, hai tay trống cân bằng; key cuối vẫn trong run cycle. |
| ST | Chuẩn bị đứng → tay phụ seal → lòng bàn tay lệnh khóa → mở bàn tay đẩy lệnh → follow-through ngắn → trở về đứng đủ chiều cao neutral. |
| AOE | Trụ chân → seal hai tay → tách tay khóa → mở hai tay ra ngoài/xuống → giữ lệnh → đứng neutral. Hai rail và ba node xuất hiện từ Core/FX ngoài body. |
| hit | Flinch/recoil, mềm gối, bàn tay trống đỡ thế, đứng lại đủ neutral; không bị thiết bị kéo vào người. |
| death | Loạng choạng → gối khuỵu → ngã ngang → chạm đất → lắng → corpse nằm. Thiết bị vẫn giữ root riêng ngoài cơ thể. |
| meditate | Sáu key đã ngồi xếp bằng từ đầu; seal/lòng tay trên đùi, thở nhỏ. Không dùng quá trình đứng-ngồi làm loop. |
| gather | Cúi, hạ một gối, vươn tay trống tới đất, nâng, xem lòng tay, đứng lại neutral; không vẽ vật thu thập. |

ST/AOE key 4 bắt đầu đúng release fixture. Các duration trong choreography là phương án sáu key, không phải lời yêu cầu ImageGen diễn chính xác millisecond.

| Clock fixture | Warning | Release | Active end | Body end |
|---|---:|---:|---:|---:|
| ST | 220 | 700 | 960 | 1480 |
| AOE | 300 | 850 | 1710 | 2260 |

AOE có ba stomp tại 850/1150/1450 ms ở node 0/1/2. Đây là facts độc lập; pose giữ lệnh không tự phát thêm hit. FX contact chỉ phát tại target đã được xác nhận, đúng lifeId/pulse/node. Đừng vẽ toàn bộ cart, chain, beast hoặc rail/node vào atlas body.

## Socket và root

Đo palm/wrist thực từng key trên source và native. Bàn tay seal ghi seal; tay sau cuff ghi occluded, không ép điểm cloth thành skin. Một commandPalm có thể điều khiển emitter tay; prop đặt đất dùng registeredGround riêng. Không gọi một command palm là grip nắm command loop.

Offset 55 px thuộc presentation review, không phải range/collision của gameplay. Mẫu chuẩn bị dùng caster + [55,0] theo world axes để giữ origin dễ rà soát. Root được quyền chọn offset theo facing ở renderer nếu ghi rõ policy; body nguồn không phụ thuộc lựa chọn này. Sau deploy, root/life/action facts quyết định tồn tại prop; body run/hit/death không kéo prop theo socket.

Khi tay nắm seal hoặc sau cuff, dùng command cue ở ngực/forearm với policy rõ, không vẽ tay mới hoặc nắm vòng giả. Meditate/gather đặt prop bên cạnh trên đất, đủ khoảng hở khỏi chân và tay. Corpse dùng drop/ground-root presentation; không ép device vào người.

## Gate đọc hình

So P1 own outfit và Wang cùng hướng ở native 1×/2×: head-to-torso, boot size, ponytail silhouette, armor/cuff shape. Thấy được tay lệnh ở SE/S/SW; N/NE/NW không cần lộ lòng tay nếu camera thực che khuất. Hình ngã phải đủ tóc, giày và tay trong source cell, không suy source completeness từ zero clipping ở native.

Cart và sinh vật FX có camera policy riêng. Không dùng rotation/mirror của cart/beast để tuyên bố tám view mới. Chỉ body đang lên kế hoạch ở đây; gear/FX đã có registration độc lập.
