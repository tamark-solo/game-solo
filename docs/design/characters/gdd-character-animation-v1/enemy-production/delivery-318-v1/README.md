# Quái/Boss GDD · candidate 318/320 clip

1908 key body,48 hướng đứng của6 actor. Đây là snapshot ART/motion candidate để owner xem, chưa ghép runtime. 2 nguồn còn thiếu ghi trong manifest/coverage, không có fallback bằng source đã loại.

ZIP dùng đường dẫn tương đối với gói gdd-character-animation-v1. `enemy-production/delivery-318-v1/manifest.json` là manifest chỉ gồm quái/Boss; frame/atlas/source paths tính từ gốc ZIP. Xem playback tại workspace qua `index.html`, gallery qua `enemy-production/views.html`; ZIP là nguồn/bitmap/hồ sơ cho production, không phải bản game hoặc website độc lập.

Mỗi PNG nguồn API có bản byte-identical trong `sources/`; API request/metadata/result giữ hash provider. Không lưu trùng bản PNG dưới api-sources trong ZIP. Các source bị loại, prompt/input, lịch sử sửa và checkpoint giữ để đối chiếu. Main/prior delivery được kiểm bằng pin và không bị xuất thay thế. Không giải nén đè lên gói workspace đã có.

`handoff.json` pin mọi file dữ liệu/evidence trong ZIP trừ chính handoff. `archive-verification.json` bên ngoài ZIP kiểm SHA256 từng member (gồm handoff) sau khi mở lại và hash container; không suy ART approval từ QA.
