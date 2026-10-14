# Manual nguồn Hồn phiên — Tịch Bạch Tây/Tây Bắc

Đo76 figure thật từ bốn nguồn damage/practice. B Tây Bắc damage có22 figure và mapping riêng: calibration0–5, hit8/9/10/11/14/15, death16–21; neutral6/7 và standing hit12/13 giữ unused history. Ba nguồn còn lại có18 figure. Tổng72 selected entries gồm24 calibration và48 action pose; gói này không xuất canonical.

Nguồn/input/provenance do actor B đã nhận; `snapshot.json` giữ geometry proposals, `manual-sources.json` giữ điểm source để actor nhập. Tôi xem từng figure qua9 bảng true-alpha2× và giữ76 crop3× có palm/cuff/support markers làm evidence, không thay raw.

Hands được chọn bằng quan sát từng pose, warm islands chỉ là aid. Không lấy face/ear/gold/ivory làm hand. Cuff điểm có uncertainty2 native px; palm1.5–3. Meditate/gather giữ pole planted dù một gesture dùng ngón cuộn lại. B Tây med cuối nâng tay nhưng vẫn ngồi; Tây Bắc med đầu chỉ thấy mảnh palm ở wrist, uncertainty3px. Những delta này không là approval mới.

Standing boots, folded-leg/cloth seated support và các kneeling footprint được xem riêng; sourceRoot là support-plane projection với uncertainty, không exact bone. Chín prone pose chọn điểm actual lower dark boot trong ROI đã xem, chiếu X xuống floor/body support plane; không lấy đầu vạt ngà hoặc boot cao làm mặt đất. `sourceBootEndpoint` giữ pixel/RGBA và ROI. Lift0 cho nguồn này, renderer không trừ lift lần hai. Body scale lấy nguyên source neutral factor.

Actor B sở hữu import, refine uncertainty, chọn actual key flow, pack/canonical và native review. Helper không sửa actors, gear, Sword đã khóa, runtime hoặc map/DB. Pin/check kỹ thuật hồ sơ không mở ART/motion/runtime approval.
