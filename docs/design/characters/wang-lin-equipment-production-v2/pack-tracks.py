import json, math, hashlib, copy
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
if (ROOT/'approval.json').exists(): raise RuntimeError('Approved V2 is immutable')
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return p.relative_to(ROOT).as_posix()
manifest=read(ROOT/'manifest.json'); props={}; gear_pins={}
frozen_families={}
for family in ['sword','banner','chariot','bead']:
 checkpoint=ROOT/'checkpoints'/f'{family}.json'
 if checkpoint.exists():
  frozen_families[family]=read(checkpoint)
  for pin in frozen_families[family]['files']:
   assert sha(ROOT/pin['file'])==pin['sha256'],'completed family changed '+pin['file']
old_tracks_path=ROOT/'tracks'/'registration.json'
old_tracks={c['id']:c for c in read(old_tracks_path)['clips']} if old_tracks_path.exists() else {}
for family in ['sword','banner','chariot','bead']:
 p=ROOT/'gear'/family/'registration.json'
 if p.exists():
  gear_pins[family]={'file':rel(p),'sha256':sha(p)}
  for item in read(p)['records']: props[(family,item['identityId'],item['direction'])]=item
banner_base_path=ROOT/'support'/'banner-base-measurement'/'measurements.json'
banner_base_pin=None
if banner_base_path.exists():
 banner_base_pin={'file':rel(banner_base_path),'sha256':sha(banner_base_path)}
 for measured in read(banner_base_path)['records']:
  p=props[('banner',measured['identityId'],measured['direction'])]
  assert p['fullFile']==measured['fullFile'] and p['fullSha256']==measured['fullSha256'],'stale pole base measurement'
  front=next(l for l in p['layers'] if l['role']=='front')
  assert front['file']==measured['frontFile'] and sha(ROOT/front['file'])==measured['frontSha256'],'stale shaft material'
  p['registeredGround']=measured['registeredGround'];p['groundMeasurement']=measured
timings={'sword':{'cast-single-target':480,'cast-aoe':800},'banner':{'cast-single-target':600,'cast-aoe':900},'chariot':{'cast-single-target':700,'cast-aoe':850},'bead':{'cast-single-target':600,'cast-aoe':900}}
CANVAS=(224,224);PIVOT=(112,192)
def affine(im,grip,anchor,angle):
 r=math.radians(angle);c=math.cos(r);s=math.sin(r);x,y=anchor[0]+.5,anchor[1]+.5
 return im.transform(CANVAS,Image.Transform.AFFINE,(c,s,grip[0]-c*x-s*y,-s,c,grip[1]+s*x-c*y),Image.Resampling.NEAREST)
def edge(im):
 a=im.getchannel('A');return any(a.getpixel((x,y)) for x,y in [(x,y) for x in range(im.width) for y in (0,im.height-1)]+[(x,y) for y in range(1,im.height-1) for x in (0,im.width-1)])
def visible_same(a,b):
 aa=list(a.getdata());bb=list(b.getdata());return all(x==y if x[3] or y[3] else True for x,y in zip(aa,bb))
def state(clip,f,index,age,release_offset,p,banner_ground_offset):
 family=clip['familyId'];action=clip['action'];visibility=f['grip'].get('visibility','candidate')
 offset=[f['grip']['native'][i]-f['pivot'][i] for i in range(2)]
 angle=f['grip'].get('angleDeg',0)
 if clip.get('reusedFrom') and clip['direction']=='north': angle-=135
 mode='held';depth='rear' if visibility=='occluded' else 'front';claim=visibility not in ('occluded','seal','open-palm','candidate')
 if family=='banner':claim=claim and f['grip'].get('closedGripConfirmed',False)
 if action=='death':
  if index>=2: mode='grounded';offset=[-16,0];angle=75 if family=='sword' else 0;depth='rear';claim=False
 elif action in ('meditate','gather'):
  mode='docked' if family in ('sword','banner') else 'commanded';offset=[-18,-40] if family=='sword' else [-28,0] if family=='banner' else [55,0] if family=='chariot' else [-18,-43];depth='rear';angle=0;claim=False
 elif action.startswith('cast'):
  gate=timings[family][action]
  if family=='banner' and (index>0 or not claim):mode='planted-ritual';offset=banner_ground_offset;angle=0;claim=False
  elif family=='sword' and age>=gate and index<len(clip['frames'])-1: mode='released';offset=release_offset;angle=0;claim=False
  elif visibility in ('seal','open-palm','occluded','candidate'):mode='hover' if family in ('sword','bead') else 'commanded';offset=[offset[0]+(8 if clip['direction'] in ('east','northeast','southeast') else -8),offset[1]-12];claim=False;angle=0
 elif family=='sword' and visibility in ('seal','open-palm'):
  mode='hover';offset=[offset[0]+(8 if clip['direction'] in ('east','northeast','southeast') else -8),offset[1]-12];angle=0;claim=False
 elif family=='banner' and not claim:
  mode='commanded';offset=[-28,0];angle=0;depth='rear'
 if family=='bead':
  mode='levitating';offset=[offset[0],offset[1]-7];angle=0;claim=False
 if family=='chariot':
  mode='deployed' if action.startswith('cast') else 'resting-device';offset=[55,0];angle=0;depth='rear';claim=False
 return offset,angle,depth,mode,claim
packed=[];checks=[];max_error=0
for clip in manifest['motions']['clips']:
 if clip.get('reusedFrom') and clip['direction']=='southeast': continue
 if clip['familyId'] in frozen_families:
  assert clip['id'] in old_tracks,'frozen family track missing '+clip['id']
  old=copy.deepcopy(old_tracks[clip['id']]);packed.append(old)
  for i,f in enumerate(old['frames']):
   gp=f['gearPresentation'];max_error=max(max_error,gp['quantizationErrorPx'])
   checks.append({'clipId':clip['id'],'index':i,'mode':gp['mode'],'bodySha256':f['sha256'],'quantizationErrorPx':gp['quantizationErrorPx'],'layerUnionMatchesFull':True,'bodyModified':False,'reusedFrozenCheckpoint':True})
  continue
 if any('placeholder' in f.get('grip',{}).get('selection','') for f in clip['frames']): continue
 key=(clip['familyId'],clip['identityId'],clip['direction'])
 if key not in props:continue
 p=props[key];source=Image.open(ROOT/p['fullFile']).convert('RGBA');assert sha(ROOT/p['fullFile'])==p['fullSha256']
 if clip['familyId']=='banner':assert banner_base_pin and p.get('groundMeasurement'),'measured pole endpoint required'
 planes={l['role']:Image.open(ROOT/l['file']).convert('RGBA') for l in p['layers']};pg=p['registeredGrip'];current=copy.deepcopy(clip);current['sourceGearRegistration']=gear_pins[clip['familyId']]
 if clip['familyId']=='banner':current['sourceGearGroundRegistration']=banner_base_pin
 folder=ROOT/'tracks'/'frames'/clip['id'];folder.mkdir(parents=True,exist_ok=True)
 release_at=timings.get(clip['familyId'],{}).get(clip['action']);elapsed=0;release_frame=clip['frames'][min(3,len(clip['frames'])-1)]
 for f in clip['frames']:
  if release_at is not None and elapsed>=release_at:release_frame=f;break
  elapsed+=f['durationMs']
 release_offset=[release_frame['grip']['native'][i]-release_frame['pivot'][i] for i in range(2)];age=0
 first=clip['frames'][0];first_visible=first['grip'].get('visibility','candidate') not in ('occluded','seal','open-palm','candidate')
 banner_ground_offset=[first['grip']['native'][0]-first['pivot'][0] if first_visible else -28,0]
 for index,f in enumerate(current['frames']):
  assert sha(ROOT/f['file'])==f['sha256'],'body changed '+f['file'];body=Image.open(ROOT/f['file']).convert('RGBA')
  offset,angle,depth,mode,claim=state(clip,f,index,age,release_offset,p,banner_ground_offset)
  # Grounded/commanded devices use physical base, not a fictitious hand connection.
  grip=pg
  attachment_method='registered physical hilt'
  if clip['familyId']=='bead':attachment_method='registered sphere center hovering above the recorded palm/forearm anchor; no hand-grip claim'
  if clip['familyId']=='banner' and mode=='held':
   # A pole permits a different material grip along its shaft. Keep the foot of
   # the pole on the supporting plane rather than pushing it into the ground.
   front_source=planes.get('front',source);box=front_source.getbbox();ground=-f.get('lift',0)
   desired_y=p['registeredGround'][1]+offset[1]-ground
   span=p['registeredGround'][1]-pg[1]
   expected_x=p['registeredGround'][0]+(pg[0]-p['registeredGround'][0])*(p['registeredGround'][1]-desired_y)/span if span else pg[0]
   candidates=[]
   for yy in range(max(0,round(desired_y)-3),min(front_source.height,round(desired_y)+4)):
    for xx in range(max(0,round(expected_x)-7),min(front_source.width,round(expected_x)+8)):
     if front_source.getpixel((xx,yy))[3]>=128:candidates.append((xx+.5,yy+.5))
   shaft_layer='front physical shaft'
   if not candidates and p.get('reusedApprovedPilot'):
    # Pilot layers keep the upper metal shaft behind the wearer. Only the
    # actual gold/wood pixels on its measured shaft line may serve as a grip.
    for yy in range(max(0,round(desired_y)-3),min(source.height,round(desired_y)+4)):
     for xx in range(max(0,round(expected_x)-3),min(source.width,round(expected_x)+4)):
      rr,gg,bb,aa=source.getpixel((xx,yy))
      if aa>=128 and rr>=80 and rr>=gg*.85 and gg>=bb*1.05 and rr-bb>=12:candidates.append((xx+.5,yy+.5))
    shaft_layer='original pilot rear-layer metal shaft'
   assert candidates,'pole shaft cannot meet actual hand '+clip['id']+str(index)
   grip=min(candidates,key=lambda q:(q[1]-desired_y)**2+(q[0]-expected_x)**2)
   angle=0;attachment_method='actual occupied '+shaft_layer+' point at hand height; pole base kept on foot support plane'
  if mode in ('grounded','commanded','deployed','resting-device','planted-ritual','docked') and clip['familyId'] in ('banner','chariot'):
   box=source.getbbox();grip=p.get('registeredGround',[(box[0]+box[2])/2,box[3]-.5])
   attachment_method='measured apparatus/pole base, no hand attachment claim'
  anchor=[round(PIVOT[i]+offset[i]) for i in range(2)];error=math.hypot(*(anchor[i]-PIVOT[i]-offset[i] for i in range(2)));max_error=max(max_error,error)
  physical_base_world=None
  if clip['familyId']=='banner':
   assert angle==0,'pole base reconstruction assumes the upright ritual shaft'
   physical_base_world=[anchor[i]-PIVOT[i]+p['registeredGround'][i]-grip[i] for i in range(2)]
   if index==0 and mode=='held':banner_ground_offset=physical_base_world
  whole=affine(source,grip,anchor,angle);assert whole.getbbox(),'empty gear '+clip['id'];assert not edge(whole),'gear clipped '+clip['id']
  if depth=='rear':rear=whole;front=Image.new('RGBA',CANVAS)
  else:
   rear=affine(planes.get('rear',Image.new('RGBA',source.size)),grip,anchor,angle)
   front=affine(planes.get('front',source),grip,anchor,angle)
  assert visible_same(Image.alpha_composite(rear,front),whole),'layer union '+clip['id']
  layers=[];files={}
  for role,im in [('full',whole),('rear',rear),('front',front)]:
   out=folder/f'{index+1:02d}-{role}.png';im.save(out);files[role]=out
   if role!='full':layers.append({'file':rel(out),'sha256':sha(out),'role':role,'canvas':list(CANVAS),'pivot':list(PIVOT),'offset':[0,0]})
  hand_alpha=body.getpixel(tuple(min(body.size[i]-1,max(0,round(f['grip']['native'][i]))) for i in range(2)))[3]
  if claim:
   assert hand_alpha>0,'visible palm empty '+clip['id']+str(index)
   assert whole.getpixel(tuple(anchor))[3]>0,'registered physical hilt empty '+clip['id']+str(index)
   rect=f['grip']['occlusionRect'];x,y,w,h=rect;assert x>=0 and y>=0 and x+w<=body.width and y+h<=body.height,'hand crop outside'
   layers.append({'file':f['file'],'sha256':f['sha256'],'role':'occlusion','cropInBody':True,'rect':rect,'canvas':f['canvas'],'pivot':f['pivot'],'offset':[0,0],'source':'Own exact pose pixels only'})
  f['gearLayers']=layers;f['body']={'file':f['file'],'sha256':f['sha256'],'canvas':f['canvas'],'pivot':f['pivot']};f['gearMode']=mode
  f['gearPresentation']={'mode':mode,'handVisibility':f['grip'].get('visibility'),'file':rel(files['full']),'sha256':sha(files['full']),'canvas':list(CANVAS),'pivot':list(PIVOT),'registeredHilt':anchor,'sourceNativeAttachmentPoint':grip,'attachmentMethod':attachment_method,'desiredWorldOffset':offset,'actualWorldOffset':[anchor[i]-PIVOT[i] for i in range(2)],'rotationDeg':angle,'quantizationErrorPx':error,'sourceScale':p['scale'],'additionalScale':1,'sourcePropNative':p['fullFile'],'sourcePropNativeSha256':p['fullSha256'],'bodyPoseSha256':f['sha256'],'bodySocketAlpha':hand_alpha,'gripAgreementClaimed':claim,'handOcclusionApplied':claim,'releaseRequiresCoreFact':mode=='released','bounds':list(whole.getbbox()),'sourcePixelsRepainted':False,'perspectiveFrom':p['direction'],'bodyModified':False}
  if physical_base_world is not None:f['gearPresentation'].update({'physicalBaseWorldOffset':physical_base_world,'physicalBaseSourceNative':p['registeredGround'],'baseMeasurementFile':banner_base_pin['file'],'baseMeasurementSha256':banner_base_pin['sha256'],'baseUncertaintyPx':p['groundMeasurement']['uncertaintyPx'],'ritualBaseFixedAfterReady':clip['action'].startswith('cast')})
  checks.append({'clipId':clip['id'],'index':index,'mode':mode,'bodySha256':f['sha256'],'quantizationErrorPx':error,'layerUnionMatchesFull':True,'bodyModified':False});age+=f['durationMs']
 current['gearTrackId']=clip['id'];current['gearTrackApproved']=False;packed.append(current)
result={'schema':'wang-lin-equipment-gear-tracks-2','date':'2026-10-14','clips':packed,'coverage':{'clips':len(packed),'keys':len(checks)},'oneSourceScale':True,'additionalScale':1,'bodyModified':False,'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'tracks').mkdir(exist_ok=True)
(ROOT/'tracks'/'registration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'tracks'/'verification.json').write_text(json.dumps({'status':'passed','maxQuantizationErrorPx':max_error,'checks':checks,'bodyModified':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result['coverage']|{'maxQuantizationErrorPx':max_error}))
