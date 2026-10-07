"""Additional static UX drawings. No gameplay, persistence, or offline simulation."""
import math


def build_remaining(ui, fixtures, catalog):
    text, lines, rect, path, button, crop, shell, resource_card = (
        ui[name] for name in ("text", "lines", "rect", "path", "button", "crop", "desktop_shell", "resource_card")
    )
    colors = ui["colors"]

    def circle(x, y, radius, fill="surface", stroke="controlBorder", sw=2):
        return (f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{colors[fill]}" '
                f'stroke="{colors[stroke]}" stroke-width="{sw}"/>')

    def bead(x, y, radius=44, clouds=0):
        output = circle(x, y, radius, "disabledSurface")
        if clouds:
            for i in range(clouds):
                angle = 2 * math.pi * i / clouds - math.pi / 2
                cx = x + radius * .65 * math.cos(angle)
                cy = y + radius * .65 * math.sin(angle)
                scale = radius / 44
                output += (f'<g transform="translate({cx:.2f} {cy:.2f}) scale({scale:.2f})">'
                           + path("M-8 3 C-11 -2,-6 -6,-2 -3 C1 -9,9 -5,8 0 C14 0,12 6,7 6 H-6 C-11 6,-12 3,-8 3", "mutedInk", 1.3)
                           + '</g>')
        else:
            scale = radius / 44
            output += (f'<g transform="translate({x} {y}) scale({scale:.2f})">'
                       + path("M-13 -18 L-4 -6 L-12 11 M4 -21 V-2 L17 4 L7 17 M-13 23 L2 16 L17 25", "jade", 2)
                       + '</g>')
        return output

    def item_icon(x, y, item_id):
        if item_id == "ITEM-BEAD":
            return bead(x + 30, y + 30, 26, 7)
        if item_id == "ITEM-GOURD":
            return path(f"M{x+22} {y+7} H{x+38} V{y+15} C{x+51} {y+25},{x+43} {y+31},{x+40} {y+33} C{x+61} {y+60},{x+1} {y+60},{x+20} {y+33} C{x+12} {y+27},{x+13} {y+20},{x+22} {y+15} Z M{x+20} {y+32} H{x+40}", "jade", 2)
        if item_id == "ITEM-MANUAL":
            return (rect(x + 7, y + 8, 44, 44, "paper", 3, "jade", 2)
                    + path(f"M{x+16} {y+8} V{y+52} M{x+25} {y+20} H{x+43} M{x+25} {y+30} H{x+43} M{x+25} {y+40} H{x+37}", "jade", 2))
        return path(f"M{x+16} {y+10} H{x+44} L{x+38} {y+23} C{x+58} {y+44},{x+49} {y+53},{x+30} {y+53} C{x+10} {y+53},{x+2} {y+44},{x+22} {y+23} Z M{x+19} {y+23} H{x+41}", "jade", 2)

    def heading(section, title, subtitle):
        return shell(section) + text(252, 80, title, 32, serif=True) + text(252, 113, subtitle, 18, "mutedInk")

    def resource_summary(state):
        r = state["resources"]
        return f"Nước {r['springWater']}/120 · Linh dịch {r['spiritWater']}/30 · Tu vi {r['cultivation']}/480"

    def board(title, subtitle, height):
        return (rect(0, 0, 1440, height, "paper", 0, "paper") + text(32, 66, title, 32, serif=True)
                + text(32, 105, subtitle, 18, "mutedInk"))

    def state_card(x, y, title, context, body, action, second=None, height=242):
        output = rect(x, y, 676, height)
        output += text(x + 24, y + 40, title, 25, serif=True)
        output += text(x + 24, y + 73, context, 16, "mutedInk")
        output += lines(x + 24, y + 110, body, 18, leading=29)
        if second:
            output += button(x + 24, y + height - 68, 302, action, "primary", size=17)
            output += button(x + 342, y + height - 68, 310, second, size=17)
        else:
            output += button(x + 24, y + height - 68, 628, action, "primary", size=17)
        return output

    def bead_desktop():
        state = fixtures["bead"]
        output = heading("Hạt châu", "Hạt châu bí ẩn", "Khám phá được ghi lại theo hành trình của Vương Lâm")
        output += rect(252, 160, 500, 658)
        output += text(276, 203, "HÌNH DẠNG HIỆN TẠI", 14, "mutedInk", True)
        output += circle(502, 363, 137, "paper", "border", 1)
        output += circle(502, 363, 120, "paper", "spiritLight", 2)
        output += bead(502, 363, 104)
        output += text(502, 538, "Các dấu đã hiện ra", 28, serif=True, anchor="middle")
        output += text(502, 578, "Hoa văn đám mây đã biến mất.", 18, "mutedInk", anchor="middle")
        output += lines(276, 645, ["Điều đã biết được giữ trong hành trình.", "Hình dạng vật phẩm theo khám phá hiện tại.", "Có thể đọc lại những lần biến đổi."], 18, leading=31)
        output += button(276, 746, 452, "Xem lại lần khám phá mộng cảnh")
        output += rect(776, 160, 632, 214)
        output += text(800, 200, "Ủ nước với hạt châu", 26, serif=True)
        output += text(800, 238, "2 nước → 1 linh dịch mỗi 10 giây", 20, bold=True)
        output += text(800, 274, f"Hiện có {state['resources']['springWater']} nước · {state['resources']['spiritWater']} linh dịch", 18, "mutedInk")
        output += button(800, 302, 584, "Xem cách ủ nước")
        output += rect(776, 398, 632, 266)
        output += text(800, 440, "Tu luyện trong mộng cảnh", 26, serif=True)
        output += lines(800, 479, ["Thời gian dài gấp mười lần bên ngoài.", "Chuẩn bị linh dịch trước khi vào tu luyện.", "Mỗi 10 giây: 1 linh dịch → 10 tu vi."], 18, leading=32)
        output += button(800, 592, 584, "Xem mộng cảnh", "primary")
        output += rect(776, 688, 632, 130)
        output += text(800, 728, "Đi tới hoạt động để chọn cách tu luyện", 22, serif=True)
        output += lines(800, 763, ["Xem một mục giữ hoạt động đang thực hiện.", "Chọn bắt đầu tại Tu luyện khi bạn sẵn sàng."], 18, "mutedInk")
        return output

    def inventory_desktop():
        state = fixtures["inventory"]
        owned = [item for item in catalog["itemDefinitions"] if item["grantEventId"] in state["completedEventIds"]]
        output = heading("Hành trang", "Hành trang", f"{len(owned)} vật phẩm đã nhận · Mỗi vật phẩm giữ một bản")
        descriptions = {
            "ITEM-BEAD": "Công dụng được khám phá qua hành trình.",
            "ITEM-GOURD": "Dùng chuẩn bị nước cho sinh hoạt và tu luyện.",
            "ITEM-MANUAL": "Chỉ dẫn luyện thổ nạp khi nhập môn.",
            "ITEM-STORAGE-BAG": "Vật phẩm nhận trong giai đoạn nhập môn."
        }
        for i, item in enumerate(owned):
            y = 160 + i * 156
            selected = item["id"] == state["selectedItemId"]
            output += rect(252, y, 700, 132, "jadeSoft" if selected else "surface", 10, "jade" if selected else "border", 2 if selected else 1)
            output += item_icon(276, y + 30, item["id"])
            output += text(356, y + 44, item["name"], 24, serif=True)
            output += text(356, y + 81, descriptions[item["id"]], 18, "mutedInk")
            output += text(928, y + 114, "Đang xem" if selected else "Xem chi tiết", 14, "jade", anchor="end")
        output += rect(976, 160, 432, 464)
        output += item_icon(1000, 192, state["selectedItemId"])
        output += text(1000, 300, "Công pháp nhập môn", 27, serif=True)
        output += text(1000, 337, "Đã nhận khi nhập môn", 18, "mutedInk")
        output += lines(1000, 389, ["Thử luyện thổ nạp ba lần để", "quan sát tiến triển.", "", "Tu vi chưa giữ được ở bước này.", "Theo mục tiêu hiện tại để tiếp tục."], 18, leading=31)
        output += button(1000, 552, 384, "Xem luyện thổ nạp", "primary")
        output += rect(976, 648, 432, 240)
        output += text(1000, 691, "Tài nguyên đang có", 24, serif=True)
        for i, resource in enumerate(catalog["resourceDefinitions"]):
            y = 737 + 43 * i
            output += text(1000, y, resource["name"], 18, "mutedInk")
            output += text(1384, y, f"{state['resources'][resource['id']]} / {resource['cap']}", 20, bold=True, anchor="end")
        output += text(252, 839, "Chọn vật phẩm để xem vai trò và hoạt động liên quan.", 18, "mutedInk")
        return output

    def settings_desktop():
        state = fixtures["settings"]
        output = heading("Cài đặt", "Cài đặt", "Điều chỉnh cách đọc và quản lý bản lưu của hành trình")
        output += rect(252, 160, 624, 288)
        output += text(276, 204, "Cỡ chữ nội dung", 26, serif=True)
        for i, size in enumerate((18, 20, 22)):
            output += button(276 + i * 194, 232, 178, f"{size} px", "selected" if size == state["fontSizePx"] else "secondary", size=size)
        output += lines(276, 325, ["Linh dịch được dùng để chuẩn bị tu luyện.", "Chọn cỡ chữ phù hợp để đọc hành trình."], state["fontSizePx"], leading=31)
        output += text(276, 418, "Nội dung sẽ xuống dòng theo cỡ chữ đã chọn.", 16, "mutedInk")
        output += rect(252, 472, 624, 184)
        output += text(276, 516, "Giảm chuyển động", 26, serif=True)
        output += button(276, 540, 178, "Tắt", "selected")
        output += button(470, 540, 178, "Bật")
        output += text(276, 628, "Giữ thông báo bằng chữ khi giảm hiệu ứng.", 18, "mutedInk")
        output += rect(900, 160, 508, 496)
        output += text(924, 204, "Bản lưu của bạn", 26, serif=True)
        output += text(924, 247, "Đã lưu trên trình duyệt này", 20, "jade", True)
        output += text(924, 279, state["savedAtLabel"], 18, "mutedInk")
        output += text(924, 330, "Vương Lâm · Phàm nhân", 23, serif=True)
        output += text(924, 365, "Mộng cảnh đã mở · Tu vi 120/480", 18)
        output += lines(924, 422, ["Xuất bản lưu để giữ một bản cho mình.", "Nhập file sẽ mở phần xem trước", "để bạn chọn tiến trình muốn dùng."], 18, "mutedInk", 31)
        output += button(924, 552, 220, "Xuất bản lưu")
        output += button(1160, 552, 224, "Nhập bản lưu", "primary")
        output += rect(252, 680, 1156, 138)
        output += text(276, 724, "Cách đọc do bạn chọn", 24, serif=True)
        output += lines(276, 760, ["Các thiết lập đọc được giữ khi trở lại hành trình.", "Đổi cỡ chữ hoặc giảm chuyển động giữ nguyên tiến trình tu luyện."], 18, "mutedInk")
        return output

    def import_desktop():
        preview = fixtures["importPreview"]
        output = heading("Cài đặt", "Xem trước bản lưu", "Chọn tiến trình muốn tiếp tục trước khi thay bản đang chơi")
        for x, label, key in ((252, "ĐANG CHƠI", "current"), (844, "FILE ĐƯỢC CHỌN", "incoming")):
            state = preview[key]
            output += rect(x, 160, 564, 436, "surface", 10, "jade" if key == "incoming" else "border", 2 if key == "incoming" else 1)
            output += text(x + 24, 203, label, 14, "mutedInk", True)
            output += text(x + 24, 254, "Vương Lâm · Phàm nhân", 28, serif=True)
            output += text(x + 24, 295, state["stageLabel"], 20, "jade", True)
            output += text(x + 24, 337, f"{len(state['completedEventIds'])}/8 mốc đã hoàn thành", 18, "mutedInk")
            for i, resource in enumerate(catalog["resourceDefinitions"]):
                y = 405 + i * 52
                output += text(x + 24, y, resource["name"], 18, "mutedInk")
                output += text(x + 540, y, f"{state['resources'][resource['id']]} / {resource['cap']}", 24, bold=True, anchor="end")
            output += text(x + 24, 568, state.get("fileName", "Bản hiện tại trên trình duyệt này"), 16, "mutedInk")
        output += rect(252, 620, 1156, 236)
        output += text(276, 664, "Bản lưu hợp lệ", 25, "jade", serif=True)
        output += lines(276, 704, ["Bản được chọn sẽ thay thế toàn bộ tiến trình đang chơi.", "Bạn sẽ tiếp tục từ mốc nhận công pháp; mộng cảnh chưa được mở trong bản này."], 18, leading=31)
        output += button(276, 784, 340, "Giữ tiến trình đang chơi")
        output += button(632, 784, 752, "Thay bằng bản lưu được chọn", "primary")
        return output

    def offline_desktop():
        state = fixtures["offline"]
        output = heading("Tu luyện", "Chào mừng trở lại", "Chuỗi chuẩn bị tự động đã xử lý thời gian và lưu tiến trình")
        for x, label, value in ((252, "VẮNG MẶT", "10 giờ"), (644, "THỜI GIAN TRONG GIỚI HẠN", "8 giờ"), (1036, "CÓ HOẠT ĐỘNG", "24 phút")):
            output += rect(x, 160, 372, 146)
            output += text(x + 24, 202, label, 14, "mutedInk", True)
            output += text(x + 24, 263, value, 38, serif=True)
        output += text(252, 350, "THAY ĐỔI RÒNG CỦA TÀI NGUYÊN", 14, "mutedInk", True)
        for i, resource in enumerate(catalog["resourceDefinitions"]):
            x = 252 + i * 392
            delta = state["afterResources"][resource["id"]] - state["beforeResources"][resource["id"]]
            output += rect(x, 374, 372, 130)
            output += text(x + 24, 414, resource["name"], 18, "mutedInk")
            output += text(x + 24, 460, f"+{delta}" if delta else "0", 30, "jade" if delta else "ink", True)
            output += text(x + 348, 478, f"Hiện có {state['afterResources'][resource['id']]}", 16, "mutedInk", anchor="end")
        output += rect(252, 528, 1156, 322)
        output += text(276, 573, "Tu vi đã đủ cho tầng đầu", 29, serif=True)
        output += lines(276, 616, ["Chuỗi đã chạy: Suối → Phòng riêng → Mộng cảnh.", "Nước và linh dịch tạo ra đã dùng trong chuỗi; số trên là thay đổi ròng.", "Hoạt động dừng ở 480 tu vi. Vương Lâm vẫn là phàm nhân.", "Đột phá khi bạn sẵn sàng; thời gian còn lại không tạo thêm tu vi."], 18, leading=33)
        output += button(276, 778, 240, "Đóng tổng kết")
        output += button(532, 778, 852, "Xem mục tiêu đột phá", "primary")
        return output

    def offline_mobile():
        state = fixtures["offline"]
        output = rect(0, 0, 360, 1160, "paper", 0, "paper")
        output += text(16, 34, "TIÊN NGHỊCH", 18, serif=True)
        output += text(344, 34, "Đã lưu", 14, "jade", anchor="end")
        output += text(16, 80, "Chào mừng trở lại", 28, serif=True)
        output += text(16, 112, "Chuẩn bị tự động đã xử lý thời gian", 16, "mutedInk")
        output += rect(16, 140, 328, 192)
        for i, (label, value) in enumerate((("Vắng mặt", "10 giờ"), ("Trong giới hạn", "8 giờ"), ("Có hoạt động", "24 phút"))):
            y = 186 + i * 59
            output += text(32, y, label, 18, "mutedInk")
            output += text(328, y, value, 24, bold=True, anchor="end")
        output += text(16, 371, "THAY ĐỔI RÒNG", 14, "mutedInk", True)
        output += rect(16, 390, 328, 206)
        for i, resource in enumerate(catalog["resourceDefinitions"]):
            y = 432 + i * 62
            delta = state["afterResources"][resource["id"]] - state["beforeResources"][resource["id"]]
            output += text(32, y, resource["name"], 18, "mutedInk")
            output += text(328, y, f"+{delta}" if delta else "0", 24, bold=True, anchor="end")
            output += text(32, y + 24, f"Hiện có {state['afterResources'][resource['id']]} / {resource['cap']}", 14, "mutedInk")
        output += rect(16, 620, 328, 262)
        output += text(32, 663, "Đã đủ tu vi tầng đầu", 24, serif=True)
        output += lines(32, 703, ["Suối → Phòng riêng → Mộng cảnh.", "Nước và linh dịch đã dùng trong", "chuỗi; số trên là thay đổi ròng.", "", "Hoạt động dừng ở 480 tu vi.", "Vương Lâm vẫn là phàm nhân."], 16, leading=27)
        output += button(16, 906, 328, "Xem mục tiêu đột phá", "primary")
        output += button(16, 970, 328, "Đóng tổng kết")
        output += lines(16, 1064, ["Tiến trình đã được xử lý và lưu.", "Đóng bảng để tiếp tục xem hành trình."], 14, "mutedInk", 24)
        return output

    def end_desktop():
        state = fixtures["end"]
        output = heading("Tu luyện", "Đột phá hoàn thành", "Hành trình nhập môn đã được lưu")
        output += rect(252, 160, 1156, 308)
        output += text(284, 215, "VƯƠNG LÂM", 16, "mutedInk", True)
        output += text(284, 293, "Ngưng Khí tầng 1", 52, serif=True)
        output += text(284, 341, "Từ phàm nhân đến bước đầu trên đường tu luyện.", 20)
        output += text(284, 407, "Đã hoàn thành bản nhập môn", 22, "jade", True)
        output += crop(1032, 184, 344, 256, "890 515 646 509")
        for i, resource in enumerate(catalog["resourceDefinitions"]):
            output += resource_card(252 + i * 392, 492, 372, resource["id"], state["resources"][resource["id"]])
        output += rect(252, 644, 1156, 224)
        output += text(276, 685, "Xem lại hành trình của bạn", 27, serif=True)
        output += lines(276, 724, ["Các địa điểm, mốc truyện và vật phẩm đã khám phá được giữ lại.", "Bạn có thể xem lại hành trình hoặc xuất bản lưu để giữ tiến trình."], 18, leading=31)
        output += button(276, 796, 548, "Xem hành trình", "primary")
        output += button(840, 796, 544, "Xuất bản lưu")
        return output

    def activity_states():
        copy = {
            "NEED_WATER": ("Ủ nước: thiếu nước", ["Cần 2 nước cho chu kỳ; hiện còn thiếu 2.", "Hoạt động đang chờ. Lấy nước để chuẩn bị."], "Chọn lấy nước"),
            "NEED_SPIRIT_WATER": ("Mộng cảnh: thiếu linh dịch", ["Cần 1 linh dịch cho chu kỳ tiếp theo.", "Có thể bật chuỗi lấy nước → ủ nước → mộng cảnh."], "Bật chuẩn bị tự động"),
            "WATER_CAPACITY": ("Kho nước đầy", ["Kho đạt 120 nước; lấy nước đang chờ.", "Ủ nước để tạo linh dịch và dành chỗ trong kho."], "Chọn ủ nước"),
            "SPIRIT_CAPACITY": ("Kho linh dịch đầy", ["Kho đạt 30 linh dịch; ủ nước đang chờ.", "Mộng cảnh đã mở và cần 1 linh dịch mỗi chu kỳ."], "Chọn mộng cảnh"),
            "PRACTICE_GATE": ("Đã luyện thử đủ ba lần", ["Tu vi chưa giữ được ở giai đoạn này.", "Chuẩn bị 6 linh dịch cho mốc kế tiếp; còn thiếu 2."], "Chọn lấy nước"),
            "EVENT_READY": ("Mốc nhận công pháp sẵn sàng", ["Đã lấy nước 6/6 lần và ủ nước 3/3 lần.", "Dùng 1 linh dịch khi hoàn thành mốc truyện."], "Đọc mốc nhận công pháp"),
            "USER_STOPPED": ("Mộng cảnh đã dừng", ["Bạn đã dừng hoạt động; linh dịch hiện còn 2.", "Tiếp tục sẽ bắt đầu một chu kỳ mới từ 0 giây."], "Tiếp tục mộng cảnh"),
            "BREAKTHROUGH_READY": ("Đủ tu vi để đột phá", ["Vương Lâm vẫn là phàm nhân; hoạt động đang chờ.", "Đọc cảnh và hoàn tất đột phá để đạt Ngưng Khí tầng 1."], "Đột phá")
        }
        output = board("Trạng thái hoạt động và mục tiêu", "Các ví dụ độc lập · Lý do chờ luôn đi cùng hướng xử lý", 1240)
        for i, state in enumerate(fixtures["activityStates"]):
            x, y = 32 + (i % 2) * 700, 144 + (i // 2) * 264
            title, body, action = copy[state["id"]]
            output += state_card(x, y, title, resource_summary(state), body, action)
        output += text(32, 1220, "Bản phác thiết kế · Chọn hoạt động mới xử lý thời gian rồi hủy phần chu kỳ dở.", 14, "mutedInk")
        return output

    def story_states():
        output = board("Đọc truyện, vật phẩm và hình dạng hạt châu", "Các ví dụ độc lập · Màn mới chỉ hiển thị những điều đã biết", 1160)
        cases = [
            ("Để đọc sau: giữ vị trí", "Nhận công pháp · Đoạn 2/2", ["Hoạt động đã dừng trong lúc đọc mốc mới.", "Linh dịch còn 2; chi phí 1 chưa được trừ.", "Đọc tiếp để trở lại đúng đoạn đã lưu."], "Đọc tiếp"),
            ("Lịch sử: xem lại cảnh", "Nhận công pháp · Cảnh đã hoàn thành", ["Đang lấy nước tại suối · 6/10 giây.", "Hoạt động tiếp tục trong khi xem lịch sử.", "Vật phẩm và tài nguyên giữ theo tiến trình hiện tại."], "Đóng lịch sử"),
            ("Chuẩn bị đột phá", "Vương Lâm · Phàm nhân · Tu vi 480/480", ["Đây là đoạn cuối của cảnh đột phá.", "Hoàn tất để đạt Ngưng Khí tầng 1 và lưu kết quả.", "Nếu trở lại trước khi hoàn tất, đọc tiếp cảnh này."], "Hoàn tất đột phá"),
            ("Hạt châu: chưa có vật phẩm", "Vật phẩm chưa được nhận", ["Bạn chưa nhận được vật phẩm ở khu vực này.", "Theo mục tiêu hiện tại để tiếp tục hành trình.", "Thông tin khám phá sẽ xuất hiện khi bạn nhận được."], "Xem mục tiêu"),
            ("Hành trang đang trống", "Đầu hành trình nhập môn", ["Vật phẩm nhận được sẽ xuất hiện tại đây.", "Mỗi vật phẩm có mô tả và cách dùng đã biết.", "Tiếp tục hành trình theo mục tiêu hiện tại."], "Tiếp tục hành trình")
        ]
        for i, case in enumerate(cases):
            x, y = 32 + (i % 2) * 700, 144 + (i // 2) * 330
            output += state_card(x, y, *case, height=306)
        x, y = 732, 804
        output += rect(x, y, 676, 306)
        output += text(x + 24, y + 40, "Biến thể theo mốc đã hoàn thành", 25, serif=True)
        for i, variant in enumerate(fixtures["storyStates"]["beadVariants"]):
            cx = x + 90 + i * 160
            output += bead(cx, y + 120, 39, variant["cloudCount"])
            label = f"{variant['cloudCount']} đám mây" if variant["cloudCount"] else "Có dấu"
            output += text(cx, y + 183, label, 16, anchor="middle")
        output += lines(x + 24, y + 237, ["Mười đám mây là chuyển tiếp trong cảnh khám phá.", "Xem lịch sử dùng hình của cảnh; vật phẩm giữ hình hiện tại."], 16, "mutedInk", 29)
        output += text(32, 1142, "Hình châu và icon là nét phác SVG để duyệt bố cục; nguồn game tiếp tục theo kế hoạch asset.", 14, "mutedInk")
        return output

    def system_states():
        output = board("Tổng kết, bản lưu và quyền chơi", "Các ví dụ độc lập · Phản hồi bằng chữ, giữ rõ tiến trình nào đang được dùng", 1120)
        cases = [
            ("Trở lại khi đã dừng hoạt động", "Vắng mặt 3 giờ 30 phút · Có hoạt động 0 phút", ["Nước 0 · Linh dịch 0 · Tu vi 0 thay đổi.", "Bạn đã dừng hoạt động trước khi rời game.", "Đóng tổng kết rồi chọn hoạt động để tiếp tục."], "Đóng tổng kết", None),
            ("Trở lại khi đang đọc truyện", "Nhận công pháp · Đoạn 2/2 · Có hoạt động 0 phút", ["Hoạt động giữ dừng trong quãng vắng mặt.", "Linh dịch vẫn còn 2; chi phí 1 chưa được trừ.", "Đọc tiếp để trở lại đúng đoạn."], "Đọc tiếp", None),
            ("Chưa lưu được thay đổi mới", "Tiến trình hiện tại vẫn được giữ trên trang", ["Thử lưu lại hoặc xuất tiến trình đang xem.", "Thông báo cập nhật khi việc lưu hoàn thành.", "Bạn có thể tiếp tục từ trạng thái hiện tại trên trang."], "Thử lưu lại", "Xuất tiến trình hiện tại"),
            ("Bản lưu không hợp lệ", "Tiến trình đang chơi được giữ nguyên", ["Thứ tự hành trình trong bản lưu không hợp lệ.", "Chọn file khác để xem trước và kiểm tra lại.", "Bạn vẫn có thể tiếp tục tiến trình hiện tại."], "Chọn file khác", "Giữ tiến trình hiện tại"),
            ("Bản lưu chưa được hỗ trợ", "Tiến trình đang chơi được giữ nguyên", ["Phiên bản của bản lưu này chưa được hỗ trợ.", "Chọn bản lưu phù hợp để tiếp tục nhập.", "File hiện tại chưa thay thế tiến trình đang chơi."], "Chọn file khác", "Giữ tiến trình hiện tại"),
            ("Tab này chỉ xem tiến trình", "Game đang chạy ở một tab khác", ["Bạn có thể xem hành trình và xuất bản đã lưu.", "Để điều khiển hoạt động tại đây, chuyển quyền chơi.", "Tiến trình mới nhất được mở sau khi chuyển quyền."], "Chuyển quyền chơi", "Xem hành trình")
        ]
        for i, case in enumerate(cases):
            x, y = 32 + (i % 2) * 700, 144 + (i // 2) * 312
            output += state_card(x, y, *case, height=288)
        output += text(32, 1102, "Bản phác thiết kế · Tổng kết hiển thị kết quả đã lưu; tab chỉ xem không xử lý hoạt động hoặc nhận lại offline.", 14, "mutedInk")
        return output

    return [
        ("bead-desktop.svg", 1440, 960, "Hạt châu sau khi hoàn thành E07", bead_desktop()),
        ("inventory-desktop.svg", 1440, 960, "Bốn vật phẩm sau E05 và chi tiết công pháp", inventory_desktop()),
        ("settings-desktop.svg", 1440, 960, "Cài đặt chữ, chuyển động và bản lưu", settings_desktop()),
        ("save-import-desktop.svg", 1440, 960, "So sánh tiến trình trước khi thay bản lưu", import_desktop()),
        ("offline-desktop.svg", 1440, 960, "Tổng kết tự động từ kho trống đến đủ đột phá", offline_desktop()),
        ("offline-mobile.svg", 360, 1160, "Tổng kết tự động trên màn hình rộng 360 px", offline_mobile()),
        ("end-desktop.svg", 1440, 960, "Ngưng Khí tầng 1 sau nút hoàn tất đột phá", end_desktop()),
        ("activity-states.svg", 1440, 1240, "Tám trạng thái hoạt động và mục tiêu", activity_states()),
        ("story-bead-states.svg", 1440, 1160, "Trạng thái truyện, hành trang và hình hạt châu", story_states()),
        ("system-states.svg", 1440, 1120, "Offline không hoạt động, lỗi lưu và tab chỉ xem", system_states())
    ]
