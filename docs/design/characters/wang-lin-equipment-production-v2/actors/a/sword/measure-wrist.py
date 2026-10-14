from pathlib import Path
from PIL import Image,ImageDraw
import json,math,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def inverse(f,n):return [f['root'][k]+(n[k]-f['pivot'][k])/f['sourceScale'] for k in range(2)]
def axis(p,q):return math.degrees(math.atan2(p[1]-q[1],p[0]-q[0]))
def delta(a,b):return (a-b+180)%360-180
def charcoal(im,q,scale):
 # Candidate closest to a manual bracer-side point, subject to raw visual confirmation in orange-dot proof.
 radius=max(2,round(1/scale));x,y=map(round,q);c=[]
 for yy in range(max(0,y-radius),min(im.height,y+radius+1)):
  for xx in range(max(0,x-radius),min(im.width,x+radius+1)):
   r,g,b,a=im.getpixel((xx,yy))
   if a>=128 and max(r,g,b)<85 and max(r,g,b)-min(r,g,b)<32:c.append(((xx-q[0])**2+(yy-q[1])**2,[xx,yy]))
 return min(c)[1] if c else [x,y]
reg=read(ROOT/'registration.json');manual=read(ROOT/'manual.json');lookup=read(ROOT/'wrist-neutral-candidates.json')
baselines={};baselineChoices={'east':(7,[65,74]),'northeast':(8,[69,77]),'south':(11,[42.5,78.3]),'southwest':(15,[42,75])}
proof=Image.new('RGBA',(4*320,310),(29,34,45,255));d=ImageDraw.Draw(proof)
for j,(direction,(index,cn)) in enumerate(baselineChoices.items()):
 f=lookup[direction]['frame'];f=f|{'pivot':[56,104]};p=inverse(f,lookup[direction]['candidates'][index]['native']);s=next(s for s in reg['sources'] if s['id']==f['sourceId']);im=Image.open(V2/s['file']).convert('RGBA');q=charcoal(im,inverse(f,cn),f['sourceScale']);a=axis(p,q);length=math.dist(p,q)*f['sourceScale'];uncertainty=min(180,math.degrees(math.asin(min(1,2/max(length,.001)))))
 b={'sourceId':f['sourceId'],'source':s['file'],'sourceSha256':sha(V2/s['file']),'calibration':f['file'],'calibrationSha256':f['sha256'],'sourcePalm':p,'sourceCuff':q,'sourceCuffRGBA':list(im.getpixel(tuple(q))),'sourceScale':f['sourceScale'],'wristAxisDeg':a,'nativePointUncertaintyPx':1,'angleUncertaintyDeg':uncertainty,'sourceCuffReviewed':False,'proof':'actors/a/sword/contact/wrist-neutral-baseline-source.png'};baselines[direction]=b
 radius=round(16/f['sourceScale']);l,t=round(p[0])-radius,round(p[1])-radius;crop=im.crop((l,t,l+radius*2+1,t+radius*2+1)).resize((256,256),Image.Resampling.NEAREST);proof.alpha_composite(crop,(j*320,32));ratio=256/(radius*2+1)
 for point,color in [(p,(68,255,96)),(q,(255,154,58))]:
  x=j*320+(point[0]-l)*ratio;y=32+(point[1]-t)*ratio;d.ellipse((x-4,y-4,x+4,y+4),outline=color,width=2)
 d.text((j*320+1,2),direction+' neutral actual raw',fill='white')
proof.save(ROOT/'contact/wrist-neutral-baseline-source.png')
count=0
for c in reg['clips']:
 if c.get('reusedFrom') or c['direction'] not in baselines:continue
 for i,f in enumerate(c['frames']):
  key=c['id']+':'+str(i+1);m=manual[key];p=m['sourceManual'];policy=m['attachmentPolicy'];a=c['action'];direction=c['direction']
  if a=='idle' or a.startswith('cast-') and i==len(c['frames'])-1:
   offset={'east':[0,-3],'northeast':[0,-3],'south':[1,-3],'southwest':[1.5,-3]}[direction]
  elif a=='run' and policy=='held-candidate':
   offset={'east':[-4,.5],'northeast':[-2,3],'south':[0,4],'southwest':[4,1]}[direction]
   if direction=='south' and i==3:offset=[3,0]
   if direction=='northeast' and i in (3,4):offset=[0,2.5]
  else:
   if 'angleNeutralBasis' not in m:m['angleMeasurement']='Rotation is not measured for detached/sealed/foundation hand; 0 is a presentation placeholder, not a proven wrist axis.'
   continue
  im=Image.open(V2/f['source']).convert('RGBA');q=charcoal(im,[p[k]+offset[k]/f['sourceScale'] for k in range(2)],f['sourceScale']);angle=axis(p,q);basis=baselines[direction];length=math.dist(p,q)*f['sourceScale'];uncertainty=min(180,math.degrees(math.asin(min(1,2/max(length,.001)))))+basis['angleUncertaintyDeg']
  m.update({'sourceCuff':q,'sourceCuffRGBA':list(im.getpixel(tuple(q))),'measuredWristAxisDeg':round(angle,4),'angleDeg':round(delta(angle,basis['wristAxisDeg']),4),'angleNeutralBasis':basis,'sourceCuffReviewed':False,'cuffSelectionMethod':'Closest charcoal pixel to manually placed bracer-side source point; orange-dot raw proof must be visually confirmed, not color-classified as a hand.','positionUncertaintyNativePx':1,'angleUncertaintyDeg':round(min(180,uncertainty),2),'angleMeasurement':'atan2(actual source palm-source cuff) minus same-direction own neutral calibration wrist axis; projected wrist candidate, not facing rotation. Short vectors/frontward wrists have documented angle uncertainty.','sourceCuffProof':'actors/a/sword/contact/'+c['id']+'-manual-source-native.png'})
  count+=1
(ROOT/'wrist-baselines.json').write_text(json.dumps(baselines,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'manual.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('wrist candidate count',count)
