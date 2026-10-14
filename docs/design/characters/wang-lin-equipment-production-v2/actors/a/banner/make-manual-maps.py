from pathlib import Path
from PIL import Image,ImageDraw
import json,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));lookup=json.loads((ROOT/'candidate-lookup.json').read_text(encoding='utf-8'))['frames']
actions=['idle','run','cast-single-target','cast-aoe']
for direction in ['north','northeast','east','southeast','south','southwest','west','northwest']:
 out=Image.new('RGBA',(6*232,4*252),(31,35,45,255));draw=ImageDraw.Draw(out)
 for row,action in enumerate(actions):
  c=next(c for c in reg['clips'] if c['direction']==direction and c['action']==action)
  for i,f in enumerate(c['frames']):
   ox=i*232;oy=row*252;im=Image.open(V2/f['file']);out.alpha_composite(im.resize((224,224),Image.Resampling.NEAREST),(ox+4,oy+24));draw.text((ox+5,oy+4),action+' '+str(i+1),fill='white');key=c['id']+':'+str(i+1)
   for index,q in enumerate(lookup[key]['candidates']):
    if q['native'][1]>=84 or q['rect'][2]>10 or q['rect'][3]>10:continue
    x=ox+4+q['native'][0]*2;y=oy+24+q['native'][1]*2;draw.ellipse((x-2,y-2,x+2,y+2),outline=(20,245,245));draw.text((x+3,y-3),str(index),fill=(20,245,245))
 p=ROOT/'contact'/('manual-map-'+direction+'.png');out.save(p)
print('Eight native2x per-view actual candidate maps; location aids only, not automatic hand classifications.')
