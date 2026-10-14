from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib,statistics,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parent;V1=V2.parent/'wang-lin-equipment-production-v1'
DIRECTIONS=['south','southwest','west','northwest','north','northeast','east','southeast']
GRIPS={'sword-a-views':[(211,119),(228,121),(202,120),(223,112),(204,116),(188,122),(212,109),(237,116),(244,114)],'sword-b-views':[(204,100),(148,92),(212,90),(154,92),(206,93),(265,103),(210,91),(159,90),(166,90)],
'banner-a-views':[(235,262),(203,263),(191,270),(239,242),(210,246),(187,253),(231,264),(211,267),(192,267)],
'banner-b-views':[(293,251),(244,251),(230,246),(184,244),(205,244),(165,247),(234,249),(153,246),(150,246)],
'chariot-a-views':[(61,122),(70,125),(88,125),(74,91),(100,99),(330,100),(79,74),(75,67),(86,65)],
'chariot-b-views':[(94,111),(96,112),(101,120),(334,104),(117,96),(329,108),(334,86),(335,83),(329,83)]}
GROUNDS={'chariot-a-views':[(263,385),(284,400),(280,395),(218,378),(231,372),(218,376),(220,358),(244,360),(244,360)],'chariot-b-views':[(247,402),(277,404),(278,401),(219,392),(223,393),(233,390),(182,366),(233,368),(233,368)]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf8'))
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def bbox(im,threshold=128):b=im.getchannel('A').point(lambda a:255 if a>=threshold else 0).getbbox();return list(b) if b else None
def edges(im,threshold=128):
 a=im.getchannel('A').point(lambda a:255 if a>=threshold else 0);w,h=im.size
 return [a.crop(r).getbbox() is not None for r in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]]
def vivid(im):
 return sum(1 for r,g,b,a in im.get_flattened_data() if a>=128 and ((r>200 and b>160 and g<110)or(b>200 and r<110 and g<110)))
gen=read(ROOT/'generation.json');pilot=read(V1/'gear-registration.json');plan=read(ROOT/'plan.json');by_family={}
for record in [r for r in gen['records'] if r.get('selected',True)]:
 if len(sys.argv)>1 and record['familyId']!=sys.argv[1]:continue
 if record['id'] not in GRIPS:continue
 spec=next(s for s in plan['records'] if s['id']==record['id']);ref=spec['registeredGrip']
 family=record['familyId'];raw=V2/record['file'];im=Image.open(raw).convert('RGBA')
 assert sha(raw)==record['sourceSha256']
 xs=[round(i*im.width/3) for i in range(4)];ys=[round(i*im.height/3) for i in range(4)]
 rects=[(xs[i%3],ys[i//3],xs[i%3+1],ys[i//3+1]) for i in range(9)]
 cells=[im.crop(rect) for rect in rects]
 bbs=[bbox(c) for c in cells];assert all(bbs)
 calibration_height=bbs[8][3]-bbs[8][1];factor=record['nativePhysicalHeight']/calibration_height
 views=[];source_assessment={'id':record['id'],'source':record['file'],'sourceSha256':record['sourceSha256'],'sourceSize':list(im.size),'grid':[3,3],'cellRects':rects,'calibrationCell':8,'calibrationHeightSource':calibration_height,'scale':factor,'scaleBasis':'Approved pilot physical extent divided by full neutral-calibration blade extent; one isotropic factor for all genuine source views.','physicalEdges':[edges(c) for c in cells],'opaqueVividFringe':vivid(im),'sourceViewed':True,'directionPolicy':'Actual newly drawn facets/back/side views; no mirrors or rotations applied in extraction.'}
 for i,direction in enumerate(DIRECTIONS):
  id=family+'-'+record['identityId']+'-'+direction
  # Source generated at1254x1254, grips are actual418px-cell measurements, not the requested size.
  cw,ch=cells[i].size;gx,gy=GRIPS[record['id']][i];grip=[gx*cw/418,gy*ch/418]
  inverse=(1/factor,0,grip[0]-ref[0]/factor,0,1/factor,grip[1]-ref[1]/factor)
  native=cells[i].transform((192,192),Image.Transform.AFFINE,inverse,Image.Resampling.NEAREST)
  native.putalpha(native.getchannel('A').point(lambda a:255 if a>=128 else 0))
  assert not any(edges(native));assert vivid(native)==0
  def grip_material(x,y):
   r,g,b,a=native.getpixel((x,y))
   return a>=128 and (family!='banner' or g>22 and g/max(1,r)>.34 and b/max(1,g)<.96)
  candidates=[(x,y) for y in range(ref[1]-3,ref[1]+4) for x in range(ref[0]-3,ref[0]+4) if grip_material(x,y)]
  assert candidates,('hilt not represented',id)
  hx,hy=min(candidates,key=lambda p:(p[0]+0.5-ref[0])**2+(p[1]+0.5-ref[1])**2)
  registered=[hx+0.5,hy+0.5]
  full='gear/'+family+'/native/'+id+'.png';front='gear/'+family+'/native/'+id+'-front.png';rear='gear/'+family+'/native/'+id+'-rear.png'
  (V2/full).parent.mkdir(parents=True,exist_ok=True);native.save(V2/full)
  front_image=Image.new('RGBA',(192,192),(0,0,0,0));rear_image=Image.new('RGBA',(192,192),(0,0,0,0))
  for y in range(192):
   for x in range(192):
    pixel=native.getpixel((x,y));r,g,b,a=pixel
    if not a:continue
    # Source material partition only: actual metal/shaft front, actual fabric rear.
    metal=family!='banner' or (g>22 and g/max(1,r)>.34 and b/max(1,g)<.96)
    if family=='chariot':
     # Command chain/loop around actual measured attachment material is front;
     # complete apparatus is rear. Pixel-only partition, no independent scale.
     sx=grip[0]+(x-ref[0])/factor;sy=grip[1]+(y-ref[1])/factor
     metal=sy<grip[1]+90 and abs(sx-grip[0])<95
    (front_image if metal else rear_image).putpixel((x,y),pixel)
  front_image.save(V2/front);rear_image.save(V2/rear)
  union=Image.alpha_composite(rear_image,front_image)
  assert all(union.getpixel((x,y))==native.getpixel((x,y)) for y in range(192) for x in range(192) if native.getpixel((x,y))[3])
  row={'id':id,'familyId':family,'identityId':record['identityId'],'direction':direction,'fullFile':full,'fullSha256':sha(V2/full),'canvas':[192,192],'pivot':[96,160],'registeredGrip':[96,128],'source':record['file'],'sourceSha256':sha(raw),'sourceCell':[rects[i][0],rects[i][1],cw,ch],'sourceGrip':grip,'scale':factor,'layers':[{'file':rear,'sha256':sha(V2/rear),'role':'rear','canvas':[192,192],'pivot':[96,160]},{'file':front,'sha256':sha(V2/front),'role':'front','canvas':[192,192],'pivot':[96,160]}],'bounds':bbox(native,1),'nativeEdges':edges(native,1),'pixelsResampled':True,'pixelsRepainted':False,'uniformScalePerSource':True,'viewPolicy':'Genuine isolated '+direction+' physical view; hilt reference at(96,128). Root must align this to own actual body socket per pose and choose body-relative depth. Not an approved wearing/hand attachment.','attachmentPolicy':'per-pose actual hand alignment by root','wearerHandAnchor':None,'ownerApproved':False,'runtimeIntegrated':False,'calibrationOnly':direction=='southeast'}
  row['registeredGrip']=registered;row['nominalGripReference']=ref;row['gripQuantizationErrorPx']=((registered[0]-ref[0])**2+(registered[1]-ref[1])**2)**0.5;row['registeredGripMethod']='Closest occupied native actual grip material pixel center to the transformed manually measured source grip; raw source grip retained; subpixel quantization is explicit.'
  row['layerPartitionPolicy']='Original metal and shaft material front, original cloth rear; no repaint. Full RGBA equals rear/front union.' if family=='banner' else 'Entire physical blade front; body-relative depth chosen by root per actual pose.'
  row['viewPolicy']='Genuine isolated '+direction+' physical view. Root aligns registered grip to its own actual hand socket per pose; no wearing/hand attachment approval.'
  if family=='chariot':
   ground=GROUNDS[record['id']][i];row['sourceGround']=list(ground);row['registeredGround']=[ref[0]+(ground[0]-grip[0])*factor,ref[1]+(ground[1]-grip[1])*factor]
   row['gripMeaning']='Actual command-loop material, physically connected by source chain to apparatus; not a blade handle.'
   row['deviceAnchorPolicy']='Ground-rooted apparatus after deployment; root must use world origin and wheel-ground registration, not drag the whole device with an animated hand.'
   row['layerPartitionPolicy']='Original command-loop/upper-chain pixels front, complete apparatus and remaining chain rear; no repaint; visible union equals full.'
  if direction=='southeast':
   old=next(r for r in pilot['records'] if r['id']==family+'-'+record['identityId'])
   row['newSourceComparisonFullFile']=full;row['newSourceComparisonFullSha256']=row['fullSha256'];row['fullFile']='../wang-lin-equipment-production-v1/'+old['fullFile'];row['fullSha256']=old['fullSha256'];row['canvas']=old['canvas'];row['pivot']=old['pivot'];row['registeredGrip']=old['registeredGrip'];row['scale']=old['scale']
   row['newSourceComparisonSource']=row['source'];row['newSourceComparisonScale']=factor;row['newSourceComparisonGrip']=row['sourceGrip']
   row['source']='../wang-lin-equipment-production-v1/'+old['source'];row['sourceSha256']=old['sourceSha256'];row['sourceGrip']=old['sourceGrip'];row['sourceCell']=[0,0,*old['sourceSize']];row['registeredGripMethod']='Owner-approved pilot registration reused exactly.';row['gripQuantizationErrorPx']=None
   row['layers']=[{**l,'file':'../wang-lin-equipment-production-v1/'+l['file']} for l in old['layers']]
   row['viewPolicy']='Approved pilot Southeast physical gear reused byte-for-byte. New-sheet SE/calibration is comparison only.'
   row['calibrationOnly']=False;row['reusedApprovedPilot']=True;row['bounds']=old['bounds']
  views.append(row)
 by_family.setdefault(family,{'schema':'wang-lin-equipment-directional-gear-2','date':'2026-10-14','records':[],'sources':[],'ownerApproved':False,'runtimeIntegrated':False})
 by_family[family]['records']+=views;by_family[family]['sources'].append(source_assessment)
for family,data in by_family.items():
 data['coverage']={'identities':len(set(r['identityId'] for r in data['records'])),'directions':DIRECTIONS,'views':len(data['records']),'newSourceViews':sum(not r.get('reusedApprovedPilot',False) for r in data['records']),'approvedPilotReused':sum(r.get('reusedApprovedPilot',False) for r in data['records'])}
 write(ROOT/family/'registration.json',data)
 for color,label in [((225,218,198,255),'light'),((24,26,31,255),'dark')]:
  sheet=Image.new('RGBA',(8*192,2*216),color);draw=ImageDraw.Draw(sheet)
  for j,r in enumerate(data['records']):
   image=Image.open(V2/r['fullFile']).convert('RGBA');x=j%8*192;y=j//8*216
   # Neutral hand-reference crop, no scale, actual native pixel.
   sheet.alpha_composite(image,(x,y+24));draw.text((x+2,y+2),r['identityId']+' '+r['direction'],fill=(80,75,68,255) if label=='light' else (210,205,194,255))
  out=ROOT/family/'review'/('directions-'+label+'-1x.png');out.parent.mkdir(parents=True,exist_ok=True);sheet.save(out)
 print(json.dumps({'family':family,'views':data['coverage']['views'],'new':data['coverage']['newSourceViews'],'scales':[(s['id'],s['scale']) for s in data['sources']],'sourceOpaqueVividFringe':[s['opaqueVividFringe'] for s in data['sources']]}))
