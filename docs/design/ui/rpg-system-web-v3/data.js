export const old='../ink-paper-web-v1/';
export const production='../../characters/wang-lin-equipment-production-v1/';
export const itemArt=id=>`../character-van-ngoc-v2/${id}.webp`;
export const mapArt='../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp';
export const names={a:'Huyễn Tâm',b:'Tịch Bạch'};
export const views=[['world','Màn chơi','01'],['character','Nhân vật','02'],['inventory','Hành trang','03'],['skills','Công pháp','04'],['journal','Mệnh Kiếp Chí','05'],['map','Bản đồ','06'],['craft','Đan–Khí','07'],['settings','Thiết lập','08']];
export const families={
 sword:{name:'Kiếm linh',role:'Bùng nổ · Xuyên thấu',st:'Kiếm Ý Nhất Tuyến',aoe:'Kiếm Trận Phá Giới',description:'Kiếm ý hội tụ thành một tuyến, mở đường giữa vòng vây.',tile:0},
 banner:{name:'Hồn phiên',role:'Duy trì · Khống chế',st:'Chủ Hồn Dẫn Lộ',aoe:'Tam Môn Tụ Hồn',description:'Điều khiển chủ hồn và ba cổng hồn để giữ thế trận.',tile:2},
 chariot:{name:'Xạ Thần Xa',role:'Phá giáp · Áp chế',st:'Giải Niêm Dẫn Thú',aoe:'Lôi Thú Liệt Địa',description:'Giải niêm chiến thú, dùng trọng lực cổ bảo công phá thế thủ.',tile:4},
 bead:{name:'Thiên Nghịch Châu',role:'Hộ đạo · Nội giới',st:'Dẫn Giới Hộ Thân',aoe:'Nội Giới Hộ Đạo',description:'Dẫn lực nội giới để hộ thân và bảo toàn sinh cơ.',tile:6}
};
export const items=[
 {id:'wood-sword',name:'Kiếm mộc',type:'equipment',slot:'weapon',rarity:0,count:1,stat:12,price:40,description:'Một thanh kiếm giản dị. Dành cho những ngày đầu luyện kiếm.'},
 {id:'jade-sword',name:'Thanh phong kiếm',type:'equipment',slot:'weapon',rarity:2,count:1,stat:18,price:180,description:'Lưỡi kiếm nhẹ, dẫn linh lực thành một đường sắc gọn.'},
 {id:'ancient-sword',art:'jade-sword',name:'Cổ kiếm phong ấn',type:'equipment',slot:'weapon',rarity:3,count:1,stat:32,locked:true,price:420,description:'Kiếm khí còn bị phong ấn. Cần đạt Trúc Cơ để luyện hóa.'},
 {id:'plain-robe',name:'Áo vải tu sĩ',type:'equipment',slot:'robe',rarity:0,count:1,stat:8,price:35,description:'Áo vải nhẹ, thuận tiện vận khí và di chuyển.'},
 {id:'cloud-robe',name:'Vân văn pháp y',type:'equipment',slot:'robe',rarity:2,count:1,stat:14,price:160,description:'Mây khắc trên gấm, linh khí giữ quanh thân.'},
 {id:'jade-charm',name:'Phù hộ thân',type:'equipment',slot:'charm',rarity:1,count:1,stat:4,price:60,description:'Dấu ấn hộ thân giúp giữ vững tâm thế trước khảo nghiệm.'},
 {id:'spirit-pill',name:'Tụ khí đan',type:'medicine',rarity:1,count:8,price:25,description:'Dược lực ôn hòa giúp người tu hành điều tức.'},
 {id:'lotus-pill',name:'Hộ mạch đan',type:'medicine',rarity:2,count:3,price:50,description:'Đan hương thanh nhẹ, bảo vệ kinh mạch.'},
 {id:'herb',name:'Linh thảo',type:'material',rarity:0,count:12,price:8,description:'Nguyên liệu luyện đan, tìm thấy ở vùng sương tụ.'},
 {id:'ore',name:'Thiết tinh',type:'material',rarity:1,count:6,price:15,description:'Tinh khoáng dùng trong luyện khí.'},
 {id:'manual',name:'Cổ pháp tàn quyển',type:'quest',rarity:2,count:1,price:0,description:'Một trang cũ còn giữ dấu tay của người đi trước.'},
 {id:'sect-seal',name:'Tín vật Hằng Nhạc',type:'quest',rarity:1,count:1,price:0,description:'Chứng tích của một đoạn đường nhập môn.'}
];
export const rarity=['Phàm phẩm','Tinh phẩm','Linh phẩm','Cổ phẩm','Tiên phẩm'];
export const slots={weapon:'Pháp khí',robe:'Pháp y',charm:'Hộ phù'};
export const stances=[
 {id:'sword_kill',name:'Kiếm Sát Quyết',family:'sword',role:'Tập trung kiếm ý',detail:'Thiên về kiếm thức và xuyên phá phòng ngự.'},
 {id:'soul_command',name:'Ngự Hồn Quyết',family:'banner',role:'Dẫn hồn giữ trận',detail:'Thiên về Hồn phiên, duy trì sức ép và sinh lực.'},
 {id:'chariot_bulwark',name:'Trấn Nhạc Quyết',family:'chariot',role:'Vững thân phá ấn',detail:'Thiên về sức bền, hộ thân và phá thế thủ.'}
];
export const chapters=[
 ['Phế sài nhập môn','Cơ duyên Châu Đá','Từ nơi vực sâu, một hạt châu đá đã đổi hướng cuộc đời.','Tìm hiểu cơ duyên đầu tiên.'],
 ['Máu nhuộm ngoại vi','Vân Nha Lang Vương','Dấu chân bên rừng dẫn tới thử thách sinh tử đầu tiên.','Lần theo dấu vết Lang Vương.'],
 ['Bí mật thức hải','Tư Đồ Nam','Trong hạt châu tĩnh lặng, một giọng nói cổ xưa thức tỉnh.','Gặp Tư Đồ Nam trong Nội Giới.'],
 ['Sát cơ khảo nghiệm','Tam Ấn Khôi Lỗi','Mỗi đạo ấn là một câu hỏi về cách ngươi vượt qua hiểm cảnh.','Phá giải Tam Ấn Khôi Lỗi.'],
 ['Rừng Cổ Mộc','Lý Mộ Uyển','Giữa rừng cổ mộc, đan hương dẫn tới một cuộc gặp.','Tìm Lý Mộ Uyển và giữ lại đan phương.'],
 ['Kiếp nạn Hằng Nhạc','Đột phá Trúc Cơ','Mây đen phủ xuống Hằng Nhạc. Trước khi nghịch thiên, hãy giữ vững đạo cơ của chính mình.','Chuẩn bị Trúc Cơ Đan và bù đắp đạo cơ.'],
 ['Phong vân Quyết Minh Cốc','Nội Giới','Một chặng đường mới mở ra, bản sắc pháp bảo dần thành hình.','Khám phá Quyết Minh Cốc.'],
 ['Hung linh nhập kiếm','Hứa Lập Quốc','Thu phục một chấp niệm cũng là đối diện ý chí của chính mình.','Tìm cơ duyên Kiếm linh Mốc II.'],
 ['Hộ đạo đan tâm','Đan thất','Giữa loạn thế, đan thất là nơi giữ lại một tia sinh cơ.','Bảo vệ đan thất Lý Mộ Uyển.'],
 ['Đoạt mệnh chân thân','Hắc Ấn','Những dấu ấn cũ dẫn về một chân thân đang ẩn giấu.','Đối diện chân thân Hắc Ấn.'],
 ['Tiến vào Tu Ma Hải','Kết Đan','Qua biển sương, một thiên địa rộng lớn hiện ra.','Chuẩn bị cho kiếp nạn tiếp theo.']
];
export const locations=[
 {id:'alchemist',x:66,y:61,name:'Bạch Chỉ',kind:'NPC',desc:'Đan dược và nguyên liệu nhập môn.',route:'craft'},
 {id:'forest',x:25,y:38,name:'Tuyến ngoại vi',kind:'Nguyên liệu',desc:'Linh thảo và dấu vết yêu thú.',route:null},
 {id:'trial',x:79,y:25,name:'Sân khảo nghiệm',kind:'Khảo nghiệm',desc:'Nơi kiểm nghiệm cách vận dụng pháp bảo.',route:null},
 {id:'hall',x:49,y:24,name:'Đại điện Hằng Nhạc',kind:'Môn phái',desc:'Điểm định hướng của ngoại môn.',route:'journal'}
];
export const recipes=[
 {id:'qi',name:'Tụ khí đan',art:'spirit-pill',type:'Luyện đan',needs:[['herb',3]],description:'Một mẻ đan dược điều tức, dành cho hành trình ngoài rừng.'},
 {id:'foundation',name:'Trúc Cơ Đan',art:'lotus-pill',type:'Luyện đan',needs:[['herb',16],['ore',8]],description:'Đan dược chuẩn bị cho đại đột phá. Hãy xem rõ phần còn thiếu.'},
 {id:'refine',name:'Tinh luyện pháp khí',art:'jade-sword',type:'Luyện khí',needs:[['ore',3]],description:'Dùng tinh khoáng củng cố pháp khí đang mang.'}
];
