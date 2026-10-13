"""Candidate skin-projection sockets, measured from own registered frames."""
from pathlib import Path
import json,hashlib,math
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1]/'docs/design/characters/dark-seal-officer-animation-v1'
if (R/'approval.json').exists():raise RuntimeError('Approved pack is frozen. Produce a new version.')
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
C=read(R/'catalog.json');K=read(R/'kit.json');records=[]
vectors={'south':(0,1),'southwest':(-2**-.5,2**-.5),'west':(-1,0),'northwest':(-2**-.5,-2**-.5),'north':(0,-1),'northeast':(2**-.5,-2**-.5),'east':(1,0),'southeast':(2**-.5,2**-.5)}
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',15)
board=Image.new('RGB',(8*230,4*260),'#26392f');draw=ImageDraw.Draw(board)
for row,action in enumerate(K['skills']):
 for col,d in enumerate(C['directions']):
  c=C['clips'][action+'-'+d];sockets=[]
  for i,f in enumerate(c['frames']):
   im=Image.open(R/f['file']).convert('RGBA');v=vectors[d];p=c['pivot'];b=f['bounds'];points=[]
   neutral=Image.open(R/('calibration/'+c['registrationSource']+'/'+str(i+1).zfill(2)+'.png')).convert('RGBA')
   def skin(pixel):r,g,b,a=pixel;return a>0 and r>150 and g>120 and b>90 and r>g+26 and g>b+18
   for y in range(max(b[1],p[1]-57),min(b[3],p[1]-8)):
    for x in range(b[0],b[2]):
     if skin(im.getpixel((x,y))):
      forward=(x-p[0])*v[0]+(y-(p[1]-34))*v[1];side=(x-p[0])*-v[1]+(y-(p[1]-34))*v[0]
      changed=not skin(neutral.getpixel((x,y)))
      points.append((forward-.12*abs(side)+(26 if changed else 0),x,y,changed))
   if not points:raise ValueError(c['id']+' no measured skin candidate')
   best=sorted(points,reverse=True)[:max(1,min(5,len(points)))];chosen=best[len(best)//2];socket=[chosen[1],chosen[2]];sockets.append(socket)
   records.append({'clip':c['id'],'frame':i,'file':f['file'],'sha256':f['sha256'],'socket':socket,'skinCandidates':len(points),'method':'Forward skin projection, changed skin vs same-column neutral preferred; all socket candidates require visual review before live hand binding.','status':'presentation-candidate'})
  c['sockets']=sockets
  im=Image.open(R/c['frames'][3]['file']).convert('RGBA');im=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);x=col*230+115-c['pivot'][0]*2;y=row*260+235-c['pivot'][1]*2;board.paste(im,(x,y),im);sx=x+sockets[3][0]*2;sy=y+sockets[3][1]*2;draw.ellipse((sx-3,sy-3,sx+3,sy+3),outline='#f5ac7b',width=2);draw.text((col*230+10,row*260+5),action+' / '+d,font=font,fill='#ecd9b4')
(R/'socket-registration.json').write_text(json.dumps({'status':'presentation-candidate','artApproved':False,'gameplayBound':False,'records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'catalog.json').write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');board.save(R/'review/socket-matrix-2x.png')
F=read(R/'vfx/catalog.json')
for c in F['clips'].values():
 if c['phase']=='return':
  widths=[f['coreBounds'][2]-f['coreBounds'][0] for f in c['frames']];peak=widths.index(max(widths));b=c['frames'][peak]['coreBounds'];c['projectionY']=(b[2]-b[0])/(b[3]-b[1]);c['projectionBasis']='One fixed ground-plane correction from peak source core aspect; same projection across sequence, not pose fit or image rewrite.'
(R/'vfx/catalog.json').write_text(json.dumps(F,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Compact anatomy comparison at one common foot plane; sources unchanged.
items=[('Approved03',R.parent/'van-hai-dark-seal-officer-v3/sprites/officer.png',[32,88]),('Player02',R.parent/'wang-lin-pixel-production-v2/masters/southeast.png',[32,88])]
for action in ['idle','dao_an','phan_phu','an_hoi']:
 c=C['clips'][action+'-southeast']
 for i in ([0] if action=='idle' else [0,3,5]):items.append((action+' '+str(i+1),R/c['frames'][i]['file'],c['pivot']))
board=Image.new('RGB',(len(items)*150,290),'#e3dfc9');draw=ImageDraw.Draw(board)
for i,(label,file,pivot) in enumerate(items):
 im=Image.open(file).convert('RGBA').resize((Image.open(file).width*2,Image.open(file).height*2),Image.Resampling.NEAREST);x=i*150+75-pivot[0]*2;y=245-pivot[1]*2;board.paste(im,(x,y),im);draw.text((i*150+5,12),label,font=font,fill='#273b30');draw.line((i*150,245,(i+1)*150,245),fill='#a29370')
board.save(R/'review/anatomy-comparison-2x.png');print('192skin socket candidates + one fixed ground projection; body pixels untouched.')
