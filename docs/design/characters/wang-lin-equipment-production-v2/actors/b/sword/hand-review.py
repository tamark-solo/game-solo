from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent;PACKAGE=ROOT.parents[2]
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));data=json.loads((ROOT/'manual-sockets.json').read_text(encoding='utf-8'));bykey={(m['sourceId'],m['action'],m['index']):m for m in data['items']}
for s in reg['sources']:
 if s.get('reusedFrom'):continue
 sid=s['id'];rows=[k for k in reg['calibrations']+reg['clips'] if k.get('sourceId')==sid];count=sum(len(k['frames']) for k in rows);chart=Image.new('RGBA',(6*260,len(rows)*230+10),(32,40,49,255));draw=ImageDraw.Draw(chart)
 for row,clip in enumerate(rows):
  action=clip.get('action','neutral')
  for col,f in enumerate(clip['frames']):
   x=col*260;y=row*230;im=Image.open(PACKAGE/f['file']).convert('RGBA');small=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);chart.alpha_composite(small,(x+2,y+4));m=bykey[(sid,action,f['sourceIndex'])];raw=Image.open(PACKAGE/f['source']).convert('RGBA');sx,sy=m['source'];crop=raw.crop((round(sx)-16,round(sy)-16,round(sx)+16,round(sy)+16)).resize((128,128),Image.Resampling.NEAREST);bg=Image.new('RGBA',(128,128),(46,57,65,255));bg.alpha_composite(crop);chart.alpha_composite(bg,(x+130,y+78));draw.ellipse((x+190,y+138,x+198,y+146),outline=(110,246,167,255));draw.text((x+4,y+212),f"{action[:7]}{f['sourceIndex']+1} {m['visibility'][:8]} {sx:.0f},{sy:.0f}",fill=(211,216,208,255))
   gx,gy=f['grip']['native'];draw.ellipse((x+2+gx*2-3,y+4+gy*2-3,x+2+gx*2+3,y+4+gy*2+3),outline=(110,246,167,255))
 chart.save(ROOT/f'review/{sid}-hands-actual.png')
print('actual source hand insets saved')
