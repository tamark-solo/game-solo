from pathlib import Path
from PIL import Image,ImageDraw
import json,math,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
path=ROOT/'manual-west-northwest.json';data=json.loads(path.read_text(encoding='utf-8'))
reg=json.loads((V2/'actors/a/sword/registration.json').read_text(encoding='utf-8'))
frames={c['id']+':'+str(i+1):f for c in reg['clips'] for i,f in enumerate(c['frames'])}
def inverse(native,f):return [f['root'][0]+(native[0]-f['pivot'][0])/f['sourceScale'],f['root'][1]+(native[1]-f['pivot'][1]+f.get('lift',0))/f['sourceScale']]
def measure(im,expected):
 candidates=[]
 for y in range(round(expected[1])-6,round(expected[1])+7):
  for x in range(round(expected[0])-6,round(expected[0])+7):
   if not(0<=x<im.width and 0<=y<im.height):continue
   r,g,b,a=im.getpixel((x,y))
   if a>=128 and r<125 and g<140 and b<150 and r-g<=25 and r-b<=25:
    candidates.append(((x-expected[0])**2+(y-expected[1])**2,x,y,[r,g,b,a]))
 if not candidates:raise RuntimeError('No actual opaque charcoal cuff pixel near manual point')
 _,x,y,rgba=min(candidates);return [x,y],rgba
def angle(p,c):return math.degrees(math.atan2(p[1]-c[1],p[0]-c[0]))
def norm(a):return (a+180)%360-180
def uncertainty(p,c,scale):
 # Both selected palm and cuff have +/-1 native px anatomical/quantization uncertainty.
 vx=(p[0]-c[0])*scale;vy=(p[1]-c[1])*scale;theta=math.degrees(math.atan2(vy,vx))
 vals=[abs(norm(math.degrees(math.atan2(vy+dy,vx+dx))-theta)) for dx in [-2,0,2] for dy in [-2,0,2] if vx+dx or vy+dy]
 return max(vals)
def crop_draw(sheet,draw,im,palm,cuff,ox,oy,label):
 cx,cy=map(round,palm);crop=im.crop((cx-36,cy-36,cx+37,cy+37));bg=Image.new('RGBA',crop.size,(28,33,45,255));bg.alpha_composite(crop);sheet.paste(bg.resize((292,292),Image.Resampling.NEAREST),(ox,oy))
 px=ox+(palm[0]-cx+36)*4;py=oy+(palm[1]-cy+36)*4;wx=ox+(cuff[0]-cx+36)*4;wy=oy+(cuff[1]-cy+36)*4
 draw.line((wx,wy,px,py),fill=(90,215,230),width=1);draw.ellipse((px-3,py-3,px+3,py+3),outline=(70,255,120),width=1);draw.ellipse((wx-3,wy-3,wx+3,wy+3),outline=(255,165,70),width=1);draw.text((ox,oy-25),label,fill=(220,230,245))
baselines={};baseproof=Image.new('RGBA',(600,340),(28,33,45,255));bd=ImageDraw.Draw(baseproof)
for j,direction in enumerate(['west','northwest']):
 sid=f'sword-a-{direction}-core-r1';f=next(c for c in reg['calibrations'] if c['sourceId']==sid)['frames'][0]
 source=next(s for s in reg['sources'] if s['id']==sid);im=Image.open(V2/source['file']).convert('RGBA')
 approximate=[63.4,85] if direction=='west' else [41.5,83];expected=inverse(approximate,f)
 # Only this manually selected local palm ROI; final displayed source dot must be inspected.
 local=[]
 for y in range(round(expected[1])-9,round(expected[1])+10):
  for x in range(round(expected[0])-9,round(expected[0])+10):
   r,g,b,a=im.getpixel((x,y))
   if a>=128 and 25<r-g<100 and r-b>60 and g-b>20:local.append([x,y])
 if not local:raise RuntimeError('Neutral palm source ROI empty')
 palm=[sum(p[0] for p in local)/len(local),sum(p[1] for p in local)/len(local)]
 cuff,rgba=measure(im,inverse([63,81] if direction=='west' else [42,79],f));axis=angle(palm,cuff)
 baselines[direction]={'sourceId':sid,'source':source['file'],'sourceSha256':source['sha256'],'calibration':f['file'],'calibrationSha256':f['sha256'],'sourcePalm':palm,'sourceCuff':cuff,'sourceCuffRGBA':rgba,'sourceScale':f['sourceScale'],'wristAxisDeg':round(axis,4),'nativePointUncertaintyPx':1,'angleUncertaintyDeg':round(uncertainty(palm,cuff,f['sourceScale']),2),'sourceCuffReviewed':False,'proof':'review/wrist-neutral-baseline.png'}
 crop_draw(baseproof,bd,im,palm,cuff,j*300+4,34,direction+' own neutral source')
baseproof.save(ROOT/'review/wrist-neutral-baseline.png')
for cid in sorted(set(e['clipId'] for e in data['frames'].values())):
 entries=[e for e in data['frames'].values() if e['clipId']==cid];sheet=Image.new('RGBA',(900,680),(28,33,45,255));draw=ImageDraw.Draw(sheet)
 direction='northwest' if '-northwest-' in cid else 'west';baseline=baselines[direction]
 for e in entries:
  i=e['frameIndex'];f=frames[cid+':'+str(i+1)];im=Image.open(V2/f['source']).convert('RGBA');palm=e['source'];cuff,rgba=measure(im,inverse(e['manualCuffNative'],f));axis=angle(palm,cuff)
  native=[f['pivot'][0]+(cuff[0]-f['root'][0])*f['sourceScale'],f['pivot'][1]+(cuff[1]-f['root'][1])*f['sourceScale']-f.get('lift',0)]
  error=min(180,uncertainty(palm,cuff,f['sourceScale'])+baseline['angleUncertaintyDeg'])
  e.update({'sourceCuff':cuff,'sourceCuffRGBA':rgba,'measuredCuffNative':native,'measuredWristAxisDeg':round(axis,4),'angleDeg':round(norm(axis-baseline['wristAxisDeg']),4),'angleNeutralBasis':baseline,'sourceCuffReviewed':False,'cuffSelectionMethod':'Actual opaque charcoal source pixel nearest per-pose manually proposed cuff-side point; orange crop dot requires explicit visual confirmation on own raw.','wristDeltaBasis':'atan2(sourcePalm-sourceCuff) minus atan2 of actual same-view own neutral calibration wrist. No facing/camera/N135 angle.','positionUncertaintyNativePx':1,'angleUncertaintyDeg':round(error,2),'uncertaintyPolicy':'Both source palm/cuff choices +/-1 native px; bound from vector perturbation +/-2px and own neutral vector bound. Anatomical selection and quantization, not ART precision promise.','sourceCuffProof':f'review/{cid}-source-wrist.png'})
  crop_draw(sheet,draw,im,palm,cuff,(i%3)*300+4,(i//3)*340+34,cid+':'+str(i+1)+' '+e['visibility'])
 sheet.save(ROOT/'review'/f'{cid}-source-wrist.png')
data['neutralWristBaselines']=baselines
tmp=path.with_suffix('.json.next');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(path)
print('48 actual source cuff pixels +2 own same-view neutral wrist baselines measured; awaiting visual dots review')
