# Thanh Nham Lang và Trấn Sơn Khôi Lỗi · runtime 02

13/10/2026: gói runtime mới **đóng lại nguồn đã sản xuất của dự án** trong archive, không tái vẽ hoặc khôi phục pipeline/player cũ. [Provenance](archive-provenance.json) ghi member/hash; `reference-subset/` giữ raw, prompt, canonical, registration và snapshot nguồn được chọn. [Ma trận nhận diện](native-identity-matrix.png).

| Actor | Action | Clip / pose | Canvas / chân |
|---|---|---:|---|
| Thanh Nham Lang | idle, walk, attack, hit, death ×8 | 40 / 240 | 112×96 / (56,88) |
| Trấn Sơn Khôi Lỗi | Như trên + appear, cast_line, cast_field ×8 | 64 / 384 | 176×176 / (88,160) |

Catalog active chỉ có quái/boss, URL mới riêng. PNG canonical giữ nguyên; một scale/source và root đăng ký được giữ trong metadata. Hình không tự tăng hitbox. ART vẫn là ứng viên để đánh giá trong game, chưa pin duyệt mỹ thuật mới.

E01 áp sát dùng Lang; E02 dùng lại bộ Lang cho bài tích hợp; E03 dùng Khôi Lỗi trong HN10. Body chỉ đọc snapshot action/clock/vector/lifeId. Hit không ngắt báo đòn đang khóa; chết giữ cuối. Boss có xuất hiện trước đánh, line/circle/melee và hai xung line dưới nửa HP. Ngưỡng, sát thương và vùng né do server sở hữu. Khi thời điểm phát lực nguồn khác gameplay, adapter đổi tuổi presentation theo phase, không đổi damage deadline.

Đối thủ thuộc hoạt động cá nhân; không đặt vào sân chung. Chuẩn bị/bắt đầu tạo life ID mới, hồi đầy theo dịch vụ thử hiện có; không mở kill reward lặp. Không dùng người đối luyện làm fallback khi atlas chờ tải.

`node scripts/build-encounter-actors.mjs` kiểm hash và RGBA atlas/canonical; `assets:game-actor-actions` chỉ đồng bộ public. Kiểm [bàn giao](../../../GAME-ACTOR-RUNTIME.md), native720/GPU và vòng HN05–HN12 trên fixture. Nền ngoại vi vẫn là bản code thử; ART map ngoại vi theo quy trình map riêng.
