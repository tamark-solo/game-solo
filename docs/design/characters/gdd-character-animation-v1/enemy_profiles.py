"""Art direction for new GDD enemies. Timings are review fixtures, not balance."""
IDS=['sword-servant','yin-corpse-cultivator','blood-talisman-mage','hua-lap-quoc','blood-armor-commander','dark-seal-true-body']
PROFILES={
 'sword-servant':{
  'role':'Khôi lỗi giữ Kiếm Mộ · nặng, thấp, vai và nắm tay đá rõ khối',
  'identity':'OWN approved broad squat cracked-stone construct, jagged stone face, aged bronze bindings and chest tablet. Keep 72px anatomy; no human skull, hair or cloth shoes.',
  'anatomyAuthority':'own-construct','support':'stone-foot','canvas':[128,112],'pivot':[64,104],'deathCanvas':[192,112],'deathPivot':[96,104],
  'equipmentNote':'Kiếm gãy là prop rời; body dùng bàn tay khép quanh vị trí chuôi, không gen thêm kiếm vào thân.',
  'sequences':{
   'idle':['stable heavy neutral','small shoulder compression','chest settles','weight settles through both stone feet','shoulders relax','stable heavy neutral'],
   'move':['left stone foot contacts','weight compresses left foot, right knee passes','right foot swings forward low','right stone foot contacts','weight compresses right foot, left knee passes','left foot swings forward low into next contact'],
   'attack':['ready closed grip hands','two compact gripping hands draw toward near shoulder','torso winds up, weight stays on rear stone foot','both hands cut diagonally downward through empty hilt position','arms decelerate and knees absorb weight','hands return to own neutral guard'],
   'hit':['heavy neutral','chest twists slightly backward','strongest stone torso recoil with feet planted','shoulders rebound forward','stone arms settle','heavy neutral'],
  }},
 'yin-corpse-cultivator':{
  'role':'Tu sĩ Âm Thi · bước rình chậm, vai khép và cử chỉ dẫn thi',
  'identity':'OWN approved short-haired gaunt human corpse cultivator, dead-jade seals on dark robe, physical cloth boots. Keep same dead-jade palette and narrow shoulders. No coffin or summoned body baked into character.',
  'anatomyAuthority':'own-human','support':'boot','canvas':[128,112],'pivot':[64,104],'deathCanvas':[176,112],'deathPivot':[88,104],
  'equipmentNote':'Âm khí và thi triệu hồi có lớp riêng; thân chỉ thể hiện ấn tay và tư thế điều khiển.',
  'sequences':{
   'idle':['closed-shoulder neutral','small chest inhale','subtle head tilt','exhale','chin levels','closed-shoulder neutral'],
   'move':['left boot contact, low guarded shoulders','right knee passes over planted left leg','right boot advances without flight','right boot contact','left knee passes over planted right leg','left boot advances into next contact'],
   'attack':['guarded neutral','near hand draws inward below chest','compact corpse-command seal, opposite palm cups low','near forearm extends a deliberate short curse-palm in facing direction','wrist retracts, elbows remain attached','lower hands into guarded neutral'],
   'hit':['guarded neutral','small chest recoil','strongest torso recoil, bent knees and connected ankles','rebound','straighten cautiously','guarded neutral'],
  }},
 'blood-talisman-mage':{
  'role':'Phù sư tầm xa · động tác cổ tay dứt khoát, vạt đỏ đi sau nhịp tay',
  'identity':'OWN approved stern human blood-talisman mage, high tied dark hair and red seal textiles. Preserve approved hair silhouette and crimson/ivory/dark palette; never switch to Wang clothing.',
  'anatomyAuthority':'own-human','support':'boot','canvas':[144,128],'pivot':[72,120],'deathCanvas':[192,128],'deathPivot':[96,120],
  'equipmentNote':'Phù giấy, quỹ đạo và triện máu là lớp riêng; bàn tay nối cổ tay, không vẽ hiệu ứng che anatomy.',
  'sequences':{
   'idle':['composed neutral','small breath','brief blink','exhale, sleeve settles','chin levels','composed neutral'],
   'move':['left boot contact, short controlled step','right knee passes','right boot advances, scarf and hem lag','right boot contact','left knee passes','left boot advances, hem recovers into next contact'],
   'attack':['composed ready','near forearm draws inward as if drawing a talisman','short two-finger seal held near chest, compact fingers','wrist snaps outward along facing direction, palm release','sleeve follows wrist recoil','hands lower fully to composed ready'],
   'hit':['composed ready','shoulder recoils','strongest torso recoil with hair trailing','torso rebounds','hands settle','composed ready'],
  }},
 'hua-lap-quoc':{
  'role':'Hung linh xảo quyệt · lướt, vặn vai, bị trấn áp để thu phục',
  'identity':'OWN approved spectral villain with long tied dark hair and sly mature smirk, tattered charcoal/ivory spectral cloth, 96px intrinsic silhouette. Preserve soft RGBA hem. No physical boots, borrowed mentor short hair or attached sword.',
  'anatomyAuthority':'own-spirit','support':'spectral-projection','canvas':[192,160],'pivot':[96,144],'deathCanvas':[192,160],'deathPivot':[96,144],
  'equipmentNote':'Kiếm và hồn khí rời thân. Trạng thái cuối là bị trấn áp, không xác chết/loot; thời gian thu phục do gameplay xác nhận.',
  'sequences':{
   'idle':['floating own neutral, sly gaze','subtle shoulder inhale','small intrinsic hem ripple','shoulders exhale','hair settles','floating own neutral'],
   'move':['restrained forward lean in own view','intrinsic hem bends backward','floating torso advances lean slightly','hem ripple crosses beneath torso','shoulders ease back','matching neutral lean for continuous glide; no walking legs'],
   'attack':['floating ready','near shoulder coils backward','compact empty hand hooks inward at chest','short forward raking palm with small grouped fingers','torso and hair recoil','floating ready restored'],
   'hit':['floating ready','small spirit torso recoil','strongest torso recoil, intrinsic hem deforms','torso rebounds','hair and hem settle','floating ready restored'],
   'appear':['complete compact spirit silhouette with lowered head','shoulders unfold','head raises, all own hair visible','both forearms open to guarded width','intrinsic hem settles','floating ready restored'],
   'cast-single-target':['floating ready','near hand draws back, other hand cups low','compact two-finger command seal near chest','near forearm points sharply along facing direction','elbow retracts with hair lag','floating ready restored'],
   'cast-aoe':['floating ready','both forearms draw across chest','shoulders coil, hands stay small at chest','arms sweep outward at two different heights to command a surrounding field','hands retract, torso unwinds','floating ready restored'],
   'subdued':['spirit recoils but remains complete','head lowers and shoulders curl','forearms close toward abdomen','intrinsic hem contracts under body, no physical kneeling legs','tired lowered head and arms tucked close','stable compact subdued spirit hold; no vanish or rise'],
  }},
 'blood-armor-commander':{
  'role':'Khôi lỗi thủ trận · giáp nặng, giẫm chấn và đóng cọc phá tuyến',
  'identity':'OWN approved massive broad 128px blood-red armored stone construct, squared head, bronze seal armor, huge complete stone fists and stone feet. Keep nonhuman anatomy and weight. No human face/hair, cloth shoes, wheels, rails or chariot device.',
  'anatomyAuthority':'own-construct','support':'stone-foot','canvas':[256,208],'pivot':[128,192],'deathCanvas':[288,208],'deathPivot':[144,192],
  'equipmentNote':'Chấn địa, mảnh đá và trận hộ lò là FX rời. Thân giữ đế chân và nhịp truyền lực; không biến thành Xạ Thần Xa.',
  'sequences':{
   'idle':['wide heavy neutral','small chest-armor compression','shoulders settle under weight','chest-armor releases','arms relax heavily','wide heavy neutral'],
   'move':['left stone foot stomps down','left leg compresses, right stone knee passes','right foot swings low with opposite heavy forearm','right stone foot stomps down','right leg compresses, left knee passes','left foot swings low, never airborne'],
   'attack':['wide heavy guard','near fist draws backward','hips and shoulder wind up behind planted feet','near stone fist strikes short and forward','torso absorbs recoil, knees bend','wide heavy guard restored'],
   'hit':['wide heavy guard','chest plate tilts slightly back','strongest shoulder recoil, both stone feet still credible','heavy rebound','arms settle','wide heavy guard restored'],
   'appear':['complete low braced body with both stone feet','arms release from crossed guard','torso rises under heavy armor','shoulders widen, feet remain grounded','forearms lower','wide heavy guard restored'],
   'cast-single-target':['wide heavy guard','one fist draws high by near shoulder','weight compresses rear stone leg','fist drives downward and forward as a focused armor-breaking strike','knees absorb downforce','heavy guard restored'],
   'cast-aoe':['wide heavy guard','both huge fists lift close to torso','both knees compress deeply, fists prepared','both fists drive down in a broad ground slam without detached shockwave','shoulders rebound, knees absorb weight','heavy guard restored'],
  }},
 'dark-seal-true-body':{
  'role':'Chân thân Huyết Ấn · Đạo Ấn, Phân Phù và Ấn Hồi kép có cử chỉ riêng',
  'identity':'OWN approved mature seal officer, gray-templed high tied hair, stern older face, crimson mantle and seal bands, ivory/dark human robe and actual cloth boots. Keep own head/build, not Wang face. No rings, duplicated actors or core aura baked into body.',
  'anatomyAuthority':'own-human','support':'boot','canvas':[192,144],'pivot':[96,128],'deathCanvas':[224,144],'deathPivot':[112,128],
  'equipmentNote':'Phân Phù có body riêng; hai dư ảnh và Ấn Hồi kép tách FX. Khe né 90° là hợp đồng gameplay/FX, không vẽ vòng báo đòn vào thân.',
  'sequences':{
   'idle':['stern closed guard','small inhale','subtle chin dip','exhale, mantle settles','chin levels','stern closed guard'],
   'move':['left boot contacts under mantle','right knee passes, near forearm stays guarded','right boot advances without sprint','right boot contacts','left knee passes','left boot advances, mantle follows into next contact'],
   'attack':['stern guard','near elbow draws in','compact palm poised below chest','short sharp forward palm flick','forearm recoils under sleeve','stern guard restored'],
   'hit':['stern guard','shoulder recoils','strongest torso recoil with bent knees','torso rebounds','mantle and hands settle','stern guard restored'],
   'appear':['complete compact figure, forearms crossed low','chin raises','forearms unfold to reveal stern chest','mantle opens through shoulder movement only','arms lower','stern guard restored'],
   'cast-single-target':['stern ready','near forearm draws toward chest','compact Dao An two-finger seal, opposite palm low','near palm stamps straight forward toward locked facing direction','wrist retracts and mantle follows','stern ready restored'],
   'cast-decoy':['stern ready','both forearms cross at sternum','two compact hands draw apart under crossed sleeves','one palm opens to either side at different heights for Phan Phu command; exactly ONE body','hands sweep inward again','stern ready restored; no duplicate silhouette'],
   'cast-aoe':['stern ready','forearms cross high, knees soften','hands compress into central double seal','near palm presses down while far palm turns outward, commanding double An Hoi','both elbows retract while knees absorb motion','stern ready restored'],
  }},
}

ACTION_NAMES={'idle':'Đứng nghỉ','move':'Di chuyển','attack':'Đòn thường','hit':'Trúng đòn','death':'Ngã / tử vong','appear':'Xuất hiện','cast-single-target':'Thi triển đơn mục tiêu','cast-aoe':'Thi triển diện rộng','cast-decoy':'Phân Phù · tách ấn','subdued':'Bị trấn áp · giữ thế'}
ROLE_ACTION_NAMES={'dark-seal-true-body':{'cast-single-target':'Đạo Ấn','cast-decoy':'Phân Phù · tách ấn','cast-aoe':'Ấn Hồi kép'},'blood-armor-commander':{'cast-single-target':'Đóng trụ phá tuyến','cast-aoe':'Giẫm chấn thủ trận'},'hua-lap-quoc':{'cast-single-target':'Lệnh kiếm đơn mục tiêu','cast-aoe':'Lệnh kiếm diện rộng','subdued':'Bị trấn áp · chờ thu phục'}}
PHASE_NAMES={'idle':['Nghỉ','Hít','Chuyển nhẹ','Thở','Lắng','Nghỉ'],'move':['Chạm trái','Trụ trái','Chuyển chân','Chạm phải','Trụ phải','Chuyển chân'],'hit':['Sẵn sàng','Giật nhẹ','Giật mạnh','Bật lại','Hồi thế','Sẵn sàng'],'death':['Trúng nặng','Khuỵu gối','Chống đỡ','Ngã cùng bên','Nằm hẳn','Giữ cuối'],'subdued':['Bị ép lùi','Hạ đầu','Thu tay','Co linh thể','Kiệt sức','Giữ trấn áp'],'appear':['Thu thế','Mở vai','Nâng thân','Dựng thế','Lắng áo/giáp','Sẵn sàng']}
for action in ['attack','cast-single-target','cast-aoe','cast-decoy']:PHASE_NAMES[action]=['Sẵn sàng','Dẫn lực','Khóa thế','Phát lực','Dư thế','Hồi thế']
def sequence(actor,action,side='RIGHT'):
 if action=='death':return ['struck standing','knees buckle toward screen '+side,'brace hand and torso lower toward screen '+side,'near-side fall, head remains screen '+side,'completely grounded corpse, head still '+side,'settled corpse hold; never rise or exchange head and feet']
 return PROFILES[actor]['sequences'][action]
def durations(action):
 return [180]*6 if action=='idle' else [140]*6 if action=='move' else [100,100,160,100,120,160] if action=='hit' else [120,160,220,100,180,220] if action in ['attack','cast-single-target','cast-aoe','cast-decoy'] else [160,160,200,180,240,320]
