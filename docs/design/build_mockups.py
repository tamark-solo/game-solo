"""Build static SVG design drawings from shared visual tokens and example states."""
import html
import json
from pathlib import Path
from build_ux_screens import build_remaining

ROOT = Path(__file__).resolve().parent
TOKENS = json.loads((ROOT / "ui-tokens.json").read_text(encoding="utf-8"))
FIXTURES = json.loads((ROOT / "mockup-fixtures.json").read_text(encoding="utf-8"))
CATALOG = json.loads((ROOT.parent / "data" / "mvp-content-catalog.json").read_text(encoding="utf-8"))
C = TOKENS["colors"]
F = TOKENS["typography"]
ART = "art-reference-v1.png"
CLIP_COUNT = 0


def esc(value):
    return html.escape(str(value), quote=True)


def text(x, y, value, size=18, tone="ink", bold=False, serif=False, anchor="start"):
    family = F["headingFamily"] if serif else F["bodyFamily"]
    return (f'<text x="{x}" y="{y}" font-family="{esc(family)}" font-size="{size}" '
            f'font-weight="{600 if bold else 400}" fill="{C.get(tone, tone)}" '
            f'text-anchor="{anchor}">{esc(value)}</text>')


def lines(x, y, values, size=18, tone="ink", leading=29):
    return "".join(text(x, y + i * leading, value, size, tone) for i, value in enumerate(values))


def rect(x, y, w, h, tone="surface", radius=10, stroke="border", sw=1):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{C.get(tone, tone)}" stroke="{C.get(stroke, stroke)}" stroke-width="{sw}"/>')


def path(d, tone="jade", sw=2, fill="none", extra=""):
    return (f'<path d="{d}" fill="{C.get(fill, fill)}" stroke="{C.get(tone, tone)}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>')


def button(x, y, w, label, kind="secondary", size=18, height=48):
    fill, stroke, label_color = {
        "primary": ("jade", "jade", "surface"),
        "secondary": ("surface", "controlBorder", "ink"),
        "selected": ("jadeSoft", "jade", "jade"),
        "disabled": ("disabledSurface", "border", "mutedInk"),
    }[kind]
    return rect(x, y, w, height, fill, 6, stroke, 2 if kind == "selected" else 1) + text(
        x + w / 2, y + height / 2 + size * .34, label, size, label_color, True, anchor="middle")


def crop(x, y, w, h, source, radius=10):
    global CLIP_COUNT
    CLIP_COUNT += 1
    clip_id = f"artclip{CLIP_COUNT}"
    return (f'<defs><clipPath id="{clip_id}"><rect x="{x}" y="{y}" width="{w}" '
            f'height="{h}" rx="{radius}"/></clipPath></defs>'
            f'<g clip-path="url(#{clip_id})"><svg x="{x}" y="{y}" width="{w}" height="{h}" '
            f'viewBox="{source}" preserveAspectRatio="xMidYMid slice">'
            f'<image href="{ART}" width="1536" height="1024"/></svg></g>')


def resource_icon(x, y, name):
    if name in ("springWater", "spiritWater"):
        value = path(f"M{x+12} {y} C{x+8} {y+7},{x+2} {y+12},{x+2} {y+18} A10 10 0 0 0 {x+22} {y+18} C{x+22} {y+12},{x+16} {y+6},{x+12} {y} Z", "jade", 2)
        if name == "spiritWater":
            value += path(f"M{x+12} {y+9} V{y+21} M{x+6} {y+15} H{x+18}", "jade", 2)
        return value
    return path(f"M{x+2} {y+22} C{x+1} {y+4},{x+22} {y+1},{x+22} {y+16} C{x+22} {y+27},{x+7} {y+28},{x+8} {y+15} C{x+8} {y+9},{x+15} {y+9},{x+16} {y+15}", "jade", 2)


def desktop_shell(section):
    output = rect(0, 0, 1440, 960, "paper", 0, "paper")
    output += rect(32, 32, 196, 896)
    output += text(56, 87, "TIÊN NGHỊCH", 23, serif=True)
    output += text(56, 117, "Hành trình Vương Lâm", 14, "mutedInk")
    output += path("M56 153 L80 143 L99 153 L120 133 L142 153 L173 146 L203 157", "controlBorder", 1.5)
    for i, label in enumerate(["Tu luyện", "Hạt châu", "Hành trình", "Hành trang", "Cài đặt"]):
        y = 204 + 64 * i
        if label == section:
            output += rect(44, y - 30, 172, 48, "jadeSoft", 6, "jadeSoft")
            output += rect(44, y - 22, 3, 32, "jade", 0, "jade")
        output += text(64, y, label, 18, "jade" if label == section else "ink", label == section)
    output += text(56, 883, "Bản nhập môn", 14, "mutedInk")
    output += text(252, 922, "Bản phác thiết kế · dữ liệu minh họa", 14, "mutedInk")
    return output


def resource_card(x, y, w, resource, quantity):
    entry = next(item for item in CATALOG["resourceDefinitions"] if item["id"] == resource)
    cap = entry["cap"]
    output = rect(x, y, w, 128)
    output += resource_icon(x + 20, y + 19, resource)
    output += text(x + 60, y + 43, entry["name"], 18, "mutedInk")
    output += text(x + 20, y + 88, f"{quantity} / {cap}", 26, bold=True)
    output += rect(x + 20, y + 105, w - 40, 5, "progressTrack", 2, "progressTrack")
    if quantity:
        output += rect(x + 20, y + 105, (w - 40) * quantity / cap, 5, "jade", 2, "jade")
    return output


def cultivation_desktop():
    state = FIXTURES["cultivation"]
    r = state["resources"]
    output = desktop_shell("Tu luyện")
    output += text(252, 80, "Vương Lâm", 32, serif=True)
    output += text(252, 112, "Phàm nhân · Tu luyện trong mộng cảnh", 18, "mutedInk")
    output += text(1384, 83, "Đã lưu", 14, "jade", anchor="end")
    output += rect(252, 140, 816, 156)
    output += text(276, 176, "MỤC TIÊU HIỆN TẠI", 14, "mutedInk", True)
    output += text(276, 214, "Chuẩn bị đột phá tầng đầu", 26, serif=True)
    output += text(276, 256, f"Tu vi {r['cultivation']}/480 · còn thiếu {480-r['cultivation']}", 18)
    output += button(842, 220, 202, "Đột phá", "disabled")
    for x, resource in zip([252, 530, 808], ["springWater", "spiritWater", "cultivation"]):
        output += resource_card(x, 320, 260, resource, r[resource])
    output += rect(252, 472, 816, 230)
    output += crop(276, 496, 116, 168, "890 515 646 509")
    output += text(416, 517, "Tu luyện trong mộng cảnh", 25, serif=True)
    output += text(416, 552, "Mỗi 10 giây: 1 linh dịch → 10 tu vi", 18)
    output += rect(416, 576, 620, 8, "progressTrack", 4, "progressTrack")
    output += rect(416, 576, 620 * state["cycleProgressSeconds"] / 10, 8, "jade", 4, "jade")
    output += text(416, 612, "6 / 10 giây · Đang thực hiện", 18, "mutedInk")
    output += button(416, 632, 120, "Dừng")
    output += button(552, 632, 258, "Bật chuẩn bị tự động")
    output += text(252, 741, "ĐỔI HOẠT ĐỘNG", 14, "mutedInk", True)
    for x, w, label, kind in [(252,190,"Lấy nước","secondary"),(454,170,"Ủ nước","secondary"),(636,190,"Luyện thường","secondary"),(838,230,"Mộng cảnh","selected")]:
        output += button(x, 760, w, label, kind)
    output += text(252, 846, "Linh dịch hiện có đủ 6 chu kỳ; sau đó cần chuẩn bị thêm.", 18, "mutedInk")
    output += rect(1096, 140, 312, 318)
    output += crop(1096, 140, 312, 206, "890 515 646 509")
    output += text(1120, 386, "Không gian mộng cảnh", 23, serif=True)
    output += text(1120, 422, "Liên kết qua hạt châu", 18, "mutedInk")
    output += rect(1096, 482, 312, 246)
    output += text(1120, 522, "Điều đã biết", 23, serif=True)
    output += lines(1120, 561, ["Thời gian dài gấp mười", "lần bên ngoài.", "", "Dùng linh dịch trước khi", "vào để chuẩn bị tu luyện."])
    return output


def cultivation_mobile():
    state = FIXTURES["cultivation"]
    output = rect(0, 0, 360, 1160, "paper", 0, "paper")
    output += text(16, 34, "TIÊN NGHỊCH", 18, serif=True)
    output += text(344, 34, "Đã lưu", 14, "jade", anchor="end")
    output += text(16, 73, "Vương Lâm · Phàm nhân", 21, serif=True)
    output += rect(16, 96, 328, 136)
    output += text(32, 129, "Chuẩn bị đột phá", 23, serif=True)
    output += text(32, 157, "Tu vi 120/480 · còn thiếu 360", 18, "mutedInk")
    output += button(32, 172, 296, "Đột phá", "disabled")
    output += rect(16, 240, 328, 152)
    for i, resource in enumerate(CATALOG["resourceDefinitions"]):
        y = 274 + 44 * i
        output += text(32, y, resource["name"], 18, "mutedInk")
        output += text(328, y, f"{state['resources'][resource['id']]} / {resource['cap']}", 24, bold=True, anchor="end")
    output += rect(16, 412, 328, 314)
    output += crop(16, 412, 328, 108, "890 515 646 509")
    output += text(32, 554, "Tu luyện trong mộng cảnh", 20, serif=True)
    output += text(32, 585, "1 linh dịch → 10 tu vi / 10 giây", 18)
    output += rect(32, 610, 296, 8, "progressTrack", 4, "progressTrack")
    output += rect(32, 610, 177.6, 8, "jade", 4, "jade")
    output += text(32, 644, "6 / 10 giây · Đang thực hiện", 18, "mutedInk")
    output += button(32, 662, 296, "Dừng")
    output += rect(16, 744, 328, 108)
    output += text(32, 776, "Chuỗi chuẩn bị và tu luyện", 18)
    output += button(32, 792, 296, "Bật chuẩn bị tự động")
    output += text(16, 887, "ĐỔI HOẠT ĐỘNG", 14, "mutedInk", True)
    output += button(16, 904, 156, "Lấy nước", size=17)
    output += button(188, 904, 156, "Ủ nước", size=17)
    output += button(16, 964, 156, "Luyện thường", size=17)
    output += button(188, 964, 156, "Mộng cảnh", "selected", size=17)
    output += lines(16, 1042, ["Linh dịch đủ 6 chu kỳ; sau đó cần", "chuẩn bị thêm."], 14, "mutedInk", 22)
    output += rect(0, 1088, 360, 72, "surface", 0)
    for i, pair in enumerate([("Tu", "luyện"), ("Hạt", "châu"), ("Hành", "trình"), ("Hành", "trang"), ("Cài", "đặt")]):
        x = i * 72
        if i == 0:
            output += rect(x + 6, 1096, 60, 56, "jadeSoft", 6, "jadeSoft")
        output += text(x + 36, 1119, pair[0], 14, "jade" if i == 0 else "ink", i == 0, anchor="middle")
        output += text(x + 36, 1141, pair[1], 14, "jade" if i == 0 else "ink", i == 0, anchor="middle")
    return output


def journey_desktop():
    output = desktop_shell("Hành trình")
    output += text(252, 80, "Hành trình", 32, serif=True)
    output += text(252, 113, "Các địa điểm đã biết và dấu mốc đã đi qua", 18, "mutedInk")
    output += button(252, 140, 190, "Mốc truyện")
    output += button(458, 140, 190, "Địa điểm", "selected")
    output += rect(252, 212, 816, 608)
    output += text(276, 245, "HẰNG NHẠC VÀ HÀNH TRÌNH NHẬP MÔN", 14, "mutedInk", True)
    for d in ["M460 300 H520", "M700 300 H780", "M870 334 V398", "M780 432 H700", "M520 432 H460", "M610 466 V536", "M610 604 V672"]:
        output += path(d, "controlBorder", 2)
    output += path("M610 706 H700 C734 706 740 706 780 706", "jade", 2, extra='stroke-dasharray="6 5"')
    output += path("M610 706 H500 C480 706 468 720 442 720 H370 C346 720 370 566 370 466", "controlBorder", 1.5, extra='stroke-dasharray="4 5"')
    output += path("M610 266 V254 H370 V266", "controlBorder", 1.5, extra='stroke-dasharray="4 5"')
    nodes = [
        (280,266,"Thôn","Đang xem","selected"), (520,266,"Khảo nghiệm","Lịch sử","history"), (780,266,"Đường núi","Lịch sử","history"),
        (280,398,"Suối","Đang lấy nước","running"), (520,398,"Phòng ký danh","Lịch sử","history"), (780,398,"Hang","Lịch sử","history"),
        (520,536,"Dược viên","Lịch sử","history"), (520,672,"Phòng riêng","Có hoạt động","available"), (780,672,"Mộng cảnh","Liên kết đặc biệt","special")
    ]
    for x,y,name,status,kind in nodes:
        fill = "jadeSoft" if kind == "running" else "surface"
        stroke = "jade" if kind in ("running","special") else "robeRed" if kind == "selected" else "controlBorder"
        output += rect(x, y, 180, 68, fill, 8, stroke, 2.5 if kind in ("running","selected") else 1)
        output += text(x + 12, y + 27, name, 18, "jade" if kind == "running" else "ink", True)
        output += text(x + 12, y + 52, status, 14, "mutedInk")
    output += text(276, 788, "Xem một địa điểm giữ nguyên hoạt động đang thực hiện.", 18, "mutedInk")
    output += rect(1096, 212, 312, 330)
    output += crop(1096, 212, 312, 174, "0 0 900 450")
    output += text(1120, 426, "Thôn của Vương Lâm", 23, serif=True)
    output += text(1120, 459, "Đang xem · Nội dung lịch sử", 17, "mutedInk")
    output += button(1120, 478, 264, "Xem lại mở đầu")
    output += rect(1096, 566, 312, 254)
    output += text(1120, 605, "Hoạt động đang chạy", 22, serif=True)
    output += text(1120, 644, "Lấy nước suối · 6/10 giây", 18)
    output += text(1120, 675, "+2 nước mỗi 10 giây", 18, "mutedInk")
    output += lines(1120, 717, ["Nơi thực hiện: Suối.", "Nước hiện có: 12/120.", "Hoạt động vẫn tiếp tục."], 18, "mutedInk")
    return output


def story_desktop():
    state = FIXTURES["story"]
    scene = next(value for value in CATALOG["storyScenes"] if value["id"] == state["currentStorySceneId"])
    event = next(value for value in CATALOG["events"] if value["id"] == state["activeEventId"])
    output = desktop_shell("Tu luyện")
    output += text(252, 80, "Vương Lâm · Phàm nhân", 32, serif=True)
    output += text(252, 112, "Đang đọc truyện · Hoạt động đã dừng", 18, "mutedInk")
    output += rect(284, 144, 1108, 690)
    output += crop(284, 144, 424, 690, "920 0 616 470")
    output += rect(308, 730, 376, 76, "surface", 8)
    output += text(328, 760, "Phòng đệ tử", 22, serif=True)
    output += text(328, 789, "Thử luyện thổ nạp", 18, "mutedInk")
    output += text(744, 204, scene["title"], 34, serif=True)
    output += text(1356, 242, f"Đoạn {state['segmentIndex']+1}/{len(scene['segments'])}", 16, "mutedInk", anchor="end")
    output += lines(744, 291, ["Phòng ở của đệ tử là nơi thử luyện thổ nạp.", "Việc tu luyện được tách khỏi luống dược thảo;", "hãy luyện ba lần để quan sát tiến triển."], 20, "ink", 34)
    output += rect(744, 420, 612, 220, "paper", 8, "border")
    output += text(766, 455, "KHI HOÀN THÀNH", 14, "mutedInk", True)
    output += text(766, 495, f"Dùng {event['cost']['spiritWater']} linh dịch · hiện có {state['resources']['spiritWater']}", 20, bold=True)
    output += lines(766, 540, ["Mở luyện thổ nạp", "Nhận công pháp nhập môn", "Nhận túi trữ vật"], 18, "jade", 30)
    output += text(744, 680, "Hoạt động giữ dừng trong lúc đọc mốc mới.", 18, "mutedInk")
    output += button(744, 732, 196, "Để đọc sau")
    output += button(956, 732, 400, event["finalActionLabel"], "primary")
    return output


def save_svg(name, width, height, title, content):
    document = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
                f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">\n'
                f'<title id="title">{esc(title)}</title>\n'
                '<desc id="desc">Bản phác UX và ART của MVP A; ảnh minh họa dùng bảng tham chiếu mỹ thuật. Các nút là phần của bản vẽ thiết kế.</desc>\n'
                f'{content}\n</svg>\n')
    (ROOT / name).write_text(document, encoding="utf-8")


mockups = [
    ("cultivation-desktop.svg", 1440, 960, "Tu luyện sau khi mở mộng cảnh — desktop", cultivation_desktop()),
    ("cultivation-mobile.svg", 360, 1160, "Tu luyện sau khi mở mộng cảnh — mobile 360 px", cultivation_mobile()),
    ("journey-desktop.svg", 1440, 960, "Xem thôn trong khi lấy nước ở suối — desktop", journey_desktop()),
    ("story-desktop.svg", 1440, 960, "Đọc mốc nhận công pháp trước khi áp dụng chi phí — desktop", story_desktop())
]
mockups += build_remaining({
    "text": text, "lines": lines, "rect": rect, "path": path, "button": button, "crop": crop,
    "desktop_shell": desktop_shell, "resource_card": resource_card, "colors": C
}, FIXTURES, CATALOG)
for mockup in mockups:
    save_svg(*mockup)
print(f"Created {len(mockups)} static SVG design mockups from shared tokens and fixtures.")
