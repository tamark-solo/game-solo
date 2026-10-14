from pathlib import Path
from PIL import Image, ImageDraw
import json, hashlib

ROOT = Path(__file__).resolve().parent
V5 = ROOT.parent / 'wang-lin-concept-direction-v5'
MEASUREMENTS = {
    'sword-a': {'crownY':116, 'groundY':1464, 'rootX':570, 'leadBootCenterX':422, 'rearBootCenterX':719, 'leftScreenHand':[340,1034], 'rightScreenHand':[783,1008], 'gripHand':'leftScreenHand', 'handRect':[299,991,76,86]},
    'sword-b': {'crownY':122, 'groundY':1477, 'rootX':495, 'leadBootCenterX':348, 'rearBootCenterX':642, 'leftScreenHand':[369,1030], 'rightScreenHand':[758,1015], 'gripHand':'leftScreenHand', 'handRect':[328,989,82,87]},
    'banner-a': {'crownY':109, 'groundY':1280, 'rootX':620, 'leadBootCenterX':463, 'rearBootCenterX':777, 'leftScreenHand':[435,872], 'rightScreenHand':[858,612], 'gripHand':'rightScreenHand', 'handRect':[826,568,70,85]},
    'banner-b': {'crownY':92, 'groundY':1332, 'rootX':568, 'leadBootCenterX':410, 'rearBootCenterX':725, 'leftScreenHand':[397,897], 'rightScreenHand':[899,675], 'gripHand':'rightScreenHand', 'handRect':[867,632,71,90]},
    'chariot-a': {'crownY':73, 'groundY':1496, 'rootX':516, 'leadBootCenterX':343, 'rearBootCenterX':688, 'leftScreenHand':[348,1028], 'rightScreenHand':[781,995], 'gripHand':'leftScreenHand', 'handRect':[309,985,81,83]},
    'chariot-b': {'crownY':103, 'groundY':1445, 'rootX':531, 'leadBootCenterX':374, 'rearBootCenterX':688, 'leftScreenHand':[345,1000], 'rightScreenHand':[778,1009], 'gripHand':'leftScreenHand', 'handRect':[302,960,82,85]},
    'bead-a': {'crownY':176, 'groundY':1462, 'rootX':544, 'leadBootCenterX':411, 'rearBootCenterX':676, 'leftScreenHand':[390,1100], 'rightScreenHand':[826,833], 'gripHand':'rightScreenHand', 'handRect':[778,798,100,78]},
    'bead-b': {'crownY':142, 'groundY':1454, 'rootX':530, 'leadBootCenterX':401, 'rearBootCenterX':658, 'leftScreenHand':[371,1096], 'rightScreenHand':[865,838], 'gripHand':'rightScreenHand', 'handRect':[808,797,117,81]},
}

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value): p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def bounds(im, threshold=1):
    a = im.getchannel('A')
    return a.point(lambda v:255 if v>=threshold else 0).getbbox()
def native_point(point, m, scale):
    return [round(32+(point[0]-m['rootX'])*scale,3),round(88+(point[1]-m['groundY'])*scale,3)]
def count_edge(im):
    a=im.getchannel('A'); w,h=im.size
    return {name:sum(v>=128 for v in a.crop(rect).get_flattened_data()) for name,rect in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}

generation=json.loads((ROOT/'body-generation.json').read_text(encoding='utf-8'))
records=[]
assessment=[]
order=[f'{family}-{identity}' for family in ('sword','banner','chariot','bead') for identity in ('a','b')]
for id in order:
    row=next(r for r in generation['records'] if r['id']==id)
    source=ROOT/row['raw']; im=Image.open(source).convert('RGBA'); m=MEASUREMENTS[id]
    factor=80/(m['groundY']-m['crownY'])
    # One isotropic source -> native affine. A larger canvas would be padding, never a second fit.
    affine=(1/factor,0,m['rootX']-32/factor,0,1/factor,m['groundY']-88/factor)
    native=im.transform((64,96),Image.Transform.AFFINE,affine,resample=Image.Resampling.NEAREST)
    native.putalpha(native.getchannel('A').point(lambda v:255 if v>=128 else 0))
    target=ROOT/'body'/'native'/f'{id}.png'; native.save(target)
    row['sourceSha256']=sha(source); row['promptSha256']=sha(ROOT/row['prompt']); row['sourceSize']=list(im.size)
    input_paths=[p['file'] if isinstance(p,dict) else p for p in row['inputs']]
    row['inputs']=[{'file':p,'sha256':sha(p),'role':role} for p,role in zip(input_paths,('approved-own-costume-edit-target','own-identity-master','Wang-live-scale-and-pixel-style-only'))]
    row['originalSha256']=sha(row['original']); row['rawCopyVerified']=row['originalSha256']==row['sourceSha256']
    row['nativeFile']=f'body/native/{id}.png'; row['nativeSha256']=sha(target)
    row['direction']='southeast'; row['animationClips']=0; row['pixelsResampled']=True; row['pixelsRepainted']=False
    row['alphaPolicy']='raw RGBA unchanged; nearest sampled body alpha threshold128, no color painting'
    row['identityPatchedFromLive']=False; row['bodyGearSeparated']=True; row['ownerApproved']=False; row['artApproved']=False; row['runtimeReady']=False
    socket={name:{'source':m[name],'native':native_point(m[name],m,factor)} for name in ('leftScreenHand','rightScreenHand')}
    grip=socket[m['gripHand']]
    rect=m['handRect']; rect_native=[round(32+(rect[0]-m['rootX'])*factor),round(88+(rect[1]-m['groundY'])*factor),max(1,round(rect[2]*factor)),max(1,round(rect[3]*factor))]
    notes='Crown measured at dense natural hair edge; ground is one source pixel below the lower human boot sole. Root lies midway between the two boot centers, not hair/robe bbox center. Hand centers and occlusion rect are manually measured presentation candidates; screen names avoid anatomical left/right ambiguity.'
    reg={'id':id,'identityId':row['identityId'],'name':row['name'],'family':row['family'],'direction':'southeast','source':row['raw'],'sourceSha256':row['sourceSha256'],'sourceSize':list(im.size),'nativeFile':row['nativeFile'],'nativeSha256':row['nativeSha256'],'canvas':[64,96],'pivot':[32,88],'bodyHeight':80,'registration':{'crownY':m['crownY'],'groundY':m['groundY'],'rootX':m['rootX'],'leadBootCenterX':m['leadBootCenterX'],'rearBootCenterX':m['rearBootCenterX'],'scale':factor,'nativeCrownY':8,'nativeGroundY':88,'measurementBasis':notes},'sourceBoundsAlpha1':bounds(im,1),'sourceBoundsAlpha128':bounds(im,128),'sourceCoreEdges':count_edge(im),'bounds':bounds(native,1),'nativeEdges':count_edge(native),'sockets':socket,'grip':{'hand':m['gripHand'],'source':grip['source'],'native':grip['native'],'emptyHand':True,'sourceOcclusionRect':rect,'nativeOcclusionRect':rect_native,'precision':'manual candidate; review composite before binding'},'alphaPolicy':row['alphaPolicy'],'uniformScalePerSource':True,'canvasIsPadding':True,'pixelsResampled':True,'pixelsRepainted':False,'identityPatchedFromLive':False,'bodyGearSeparated':True,'ownerApproved':False,'artApproved':False,'runtimeReady':False,'animationClips':0}
    assert row['rawCopyVerified'], f'raw changed {id}'
    assert not any(reg['sourceCoreEdges'].values()), f'source clipped {id}'
    assert not any(reg['nativeEdges'].values()), f'native clipped {id}'
    records.append(reg)
    observations={
      'sword-a':'Giữ tóc đen, mắt/mặt A, áo mực-ngà viền kim, belt và boots; kiếm/bao kiếm đã xóa, hand trái màn hình empty grip. Tóc khá rộng và face vẫn gọn hơn Wang chút, cần xem native trực tiếp; height80 không chứng minh anatomy.',
      'sword-b':'Giữ own tóc bạc buộc cao, mặt/đôi mắt B và áo ngà-ngọc; kiếm/bao đã tách, hand trái màn hình empty grip. Nếp robe không ép ngang, hair/boots đầy đủ. Mặt B còn sắc/chibi hơn Wang, không vá lại skin/head.',
      'banner-a':'Áo nghi lễ đỏ-than, ba mảng triện vải và tóc/mặt A giữ từ approved r2; toàn phiên/cán/finial tách khỏi nguồn. Tay phải màn hình raised closed grip cho pole. R1 sourceconcept vẫn giữ lịch sử ở V5. Nét source này mịn hơn Sword vì approved r2, ghi khác biệt cho review.',
      'banner-b':'Giữ áo ngà-tím, mảng triện, own tóc bạc/mặt B; phiên tách, tay phải màn hình raised closed grip. Có fringe xanh/tím rất nhỏ ở alpha source tóc tại zoom lớn; native128 không paint màu, cần xem cả nền sáng/tối.',
      'chariot-a':'Giữ giáp vai đồng, găng, đai và boots A; không còn housing xe hoặc dây/xích rời. Hai găng empty, slot attachment là candidate; chain socket chưa chứng minh tracking qua action. Body gear metal clothing remains intentionally.',
      'chariot-b':'Giữ armor tay trái màn hình, robe lam-xám và boots bạc từ approved heavy-armor option B; toàn xe/xích rời bỏ khỏi body. Không tự giảm giáp so concept đã duyệt. Hair fringe xanh nhỏ source giữ nguyên, hands armored closed empty.',
      'bead-a':'Giữ áo du hành xám-ngọc, khăn vai, motif cuff, own tóc/mặt A; đá châu tách, tay phải màn hình upturned empty palm. Không tạo cầu sáng, FX hay bóng; điểm đặt châu/socket đo thủ công để composite tiếp.',
      'bead-b':'Giữ own tóc bạc/mặt B, áo ngà và khăn lam-xám; tay phải màn hình empty open palm, châu xóa hoàn toàn. Nguồn không halo FX baked; raw có alpha mềm ở edge, native theo pixel body threshold128.'
    }[id]
    assessment.append({'id':id,'selected':True,'status':'production-neutral-candidate','sourceViewed':True,'nativeViewed':True,'visualEvidence':['body/lineup-native-dark-1x.png','body/lineup-native-dark-2x.png','body/lineup-native-light-1x.png','body/lineup-native-light-2x.png'],'bodyOnly':True,'emptyGrip':True,'noBakedFxOrShadow':True,'completeCrownHairHandsBoots':True,'sourceCoreClipping':False,'nativeCoreClipping':False,'ownIdentityPreservedVisually':True,'anatomyRequiresVisualReview':True,'observation':observations,'sharedAnatomyLimitation':'Native same80px body is slimmer and the head smaller than Wang live; identity/outfit stay close to approved concept. A shorter-torso/larger-head revision would need a new source before final production. No individual-width/pose fitting or oldWang pixel patch was used.','handSocketApproved':False,'ownerApproved':False,'artApproved':False})

generation['records']=sorted(generation['records'],key=lambda r:order.index(r['id']))
generation['coverage']={'identities':2,'families':4,'neutralViews':8,'directions':['southeast'],'animationClips':0}
write(ROOT/'body-generation.json',generation)
write(ROOT/'body-registration.json',{'schema':'wang-lin-equipment-body-registration-1','date':'2026-10-14','scope':'P1 body-only neutral southeast','records':records,'coverage':generation['coverage'],'ownerApproved':False,'artApproved':False,'runtimeReady':False})
approval=json.loads((V5/'approval.json').read_text(encoding='utf-8'))
pins=approval['files']
if isinstance(pins,dict):
    pin_results=[sha(V5/p)==expected for p,expected in pins.items()]
else:
    pin_results=[sha(V5/p['file'])==p['sha256'] for p in pins]
assert all(pin_results),'V5 approval basis changed'
write(ROOT/'body'/'assessment.json',{'schema':'wang-lin-equipment-body-assessment-1','date':'2026-10-14','items':assessment,'limitations':['One southeast neutral per own identity and costume, not motion or eight views.','Same80px silhouettes have smaller heads and thinner torsos than Wang live; preserve the approved own concepts, but anatomy needs owner comparison before final production.','Height80 is an anatomical scale target, not proof of identity/anatomy approval.','Native binary alpha128 is a pixel body production policy; raw soft RGBA retained.','Sockets are presentation candidates and require gear composite review.'],'technicalVerification':{'rawCopiesVerified':8,'inputHashRecords':24,'v5ApprovalPinsVerified':len(pin_results),'sourceCoreEdges':0,'nativeCoreEdges':0,'registeredNeutralBodies':8,'noMirroredDirections':True,'onlySoutheast':True,'noRuntimeWrites':True,'sourcePixelsNotRepainted':True},'ownerApproved':False,'artApproved':False,'runtimeReady':False})

# Registered A/B concept and identity previews are comparison evidence only, never pixel donors.
for background,color in [('dark',(31,36,49,255)),('light',(232,228,213,255))]:
    sheet=Image.new('RGBA',(7*72+8,4*116+10),color); draw=ImageDraw.Draw(sheet)
    for rowidx,family in enumerate(('sword','banner','chariot','bead')):
        items=[]
        for identity in ('a','b'):
            body=Image.open(ROOT/'body'/'native'/f'{family}-{identity}.png').convert('RGBA')
            concept=Image.open(V5/'concepts'/'native'/f'{family}-{identity}.png').convert('RGBA').crop((32,40,96,136))
            master=Image.open(V5/'concepts'/'native'/f'identity-{identity}.png').convert('RGBA').crop((32,40,96,136))
            items.extend([(f'{identity} body',body),(f'{identity} concept',concept),(f'{identity} master',master)])
        wang=Image.open(V5/'inputs'/'wang-lin-live-southeast-native.png').convert('RGBA')
        items.insert(3,('Wang style',wang))
        for col,(label,img) in enumerate(items):
            x=8+col*72; y=8+rowidx*116
            draw.text((x,y),family if col==0 else label,fill=(150,152,155,255))
            sheet.alpha_composite(img,(x,y+16))
    sheet.save(ROOT/'body'/f'lineup-native-{background}-1x.png')
    sheet.resize((sheet.width*2,sheet.height*2),Image.Resampling.NEAREST).save(ROOT/'body'/f'lineup-native-{background}-2x.png')
print(json.dumps({'neutralBodies':len(records),'nativeSize':[64,96],'bodyHeight':80,'sourceEdges':sum(sum(r['sourceCoreEdges'].values()) for r in records),'nativeEdges':sum(sum(r['nativeEdges'].values()) for r in records),'rawCopyVerified':all(r['rawCopyVerified'] for r in generation['records']),'animationClips':0,'artApproved':False}))
