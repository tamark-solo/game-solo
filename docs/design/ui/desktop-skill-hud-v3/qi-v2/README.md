# Vân Ngọc — Khí quang 02

09/10/2026 · Phát triển từ khung 03 sau phản hồi hiệu ứng đầu tiên chưa tạo khác biệt đủ rõ. Đây là đề xuất hình ảnh desktop, chưa tích hợp game hoặc ghi nhận duyệt hình.

[Mở bản thử](http://127.0.0.1:5173/skill-bar-desktop.html). Bật/tắt **Linh quang** để so trực tiếp với khung 03 không có khí quang. Giữ khung 760 × 140, ô kỹ năng 36 px, cầu 67 px và nhân vật native 1×.

## Mẫu đã xem và cách áp dụng

| Nguồn chính | Quan sát và quyết định thiết kế |
| --- | --- |
| [Dmitriy Shibanov — Diablo-like UI Orb Breakdown](https://allematic.artstation.com/projects/8w5KAQ) | Tác giả tách noise chuyển động, mặt chất lỏng, shading thể tích và lớp kính. Dùng ý tưởng nhiều lớp để tạo chiều sâu và vẫn biểu diễn mức tài nguyên; bản web này dùng texture + clip + kính CSS, không dùng shader UE4 của tác giả. |
| [Moon Tribe Studio — Dark Fantasy UI](https://moontribe.artstation.com/projects/JvRobd) | Quan sát tranh UI trong portfolio: lòng khung tối và mép kim loại bắt sáng làm khung nổi. Áp dụng ánh sáng hắt lên đồng/ngọc đã có; giữ mây/sen tu tiên. |
| [Blizzard — Forgotten Nightmares / Hungering Moon](https://news.blizzard.com/en-us/article/23827589/explore-a-new-piece-of-sanctuary-in-forgotten-nightmares) · [hình Astrolabe chính thức](https://bnetcmsus-a.akamaihd.net/cms/page_media/G180C2YIUMPP1663608178090.png) | Quan sát lõi năng lượng, kính, vàng và cấu trúc vòng trên pháp khí. Áp dụng tương quan sáng/tối của lõi và vòng trận pháp, chuyển màu sang đỏ/ngọc. Đây là tham chiếu vật liệu, không phải mẫu bố cục hotbar. |

Các quyết định trên là diễn giải thiết kế của dự án. Không tải, trích hoặc đưa artwork của các nguồn tham khảo vào asset runtime; texture mới là tác phẩm ImageGen riêng.

## Thay đổi

- Hai cầu có khí xoáy màu đỏ/ngọc với tâm tối đọc số được, kính sáng và rìa tối tạo thể tích. Texture 67 × 67 giữ nguyên kích thước ở mọi mức tài nguyên; hạ HP/MP chỉ cắt phần phía trên.
- Vòng trận pháp quanh cầu xoay chậm 42–48 giây/vòng. Ánh sáng hắt lên khung đồng, ngọc giữa có vòng nhỏ, khí chạy trên hai đường viền và điểm sáng rải có giới hạn.
- Ba icon có ánh viền riêng theo Kiếm/Lôi/Phong. Nhận snapshot đang thi triển mới bật flare linh lực + ánh icon; kết thúc cooldown bật một nhịp sáng. Không dùng hiệu ứng để phát lệnh skill, thay gameplay hoặc animation nhân vật.
- Tắt Linh quang trả về vật liệu cầu/khung nền 03; mất kết nối hoặc tab ẩn dừng chuyển động. Reduced motion giữ vật liệu và ánh tĩnh, bỏ chuyển động và nhịp cast. Nodes tạo một lần, hiệu ứng một lần được hủy khi tắt/ẩn/dispose.

## Artwork và tái xuất

**Built-in ImageGen**, không dùng CLI/API fallback. [PNG nguồn](orb-textures-source.png), [prompt](orb-textures.prompt.txt), [WebP](orb-textures-v2.webp), [metadata/hash](orb-textures.json).

Atlas nguồn **1774 × 887**, hai cell vuông bằng nhau. Xuất đồng đều Lanczos3 sang **512 × 256**, WebP quality 92, **50.372 byte**. Không blur/sharpen hoặc sửa nội dung tranh bằng mã. Tổng artwork HUD runtime (khung + icon + khí): **235.380 byte**; đây là dung lượng asset, chưa phải đo hiệu năng GPU.

Chạy `node scripts/build-skill-hud-qi.mjs`, rồi `node scripts/sync-skill-hud.mjs`. Mã FX nằm riêng trong `client/src/skills/hotbar-effects.ts/.css`; hotbar chỉ nhận snapshot/callback.

## Đối chiếu

- [Trong map, tỷ lệ native](qi-on-native.jpg).
- [Bản có khí quang](qi-on-detail.jpg) và [không khí quang](qi-off-detail.jpg).
- [Sinh lực thấp](qi-health.jpg), [thiếu linh lực](qi-resource.jpg), [mất kết nối](qi-offline.jpg).
- [Kiểm kỹ thuật](../../../../data/desktop-skill-hud-qi-verification.json).

Kiểm kỹ thuật không thay duyệt hình ảnh. Nền, camera, collider, save và runtime game không đổi.
