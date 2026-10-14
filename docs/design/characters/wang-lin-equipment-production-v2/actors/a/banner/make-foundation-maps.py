from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));lookup=json.loads((ROOT/'candidate-lookup.json').read_text(encoding='utf-8'))['frames']
for direction in ['north','northeast','east','southeast','south','southwest','west','northwest']:
 out=Image.new('RGBA',(6*320,4*294),(31,35,45,255));draw=ImageDraw.Draw(out)
 for row,action in enumerate(['hit','death','meditate','gather']):
  c=next(c for c in reg['clips'] if c['direction']==direction and c['action']==action)
  for i,f in enumerate(c['frames']):
   im=Image.open(V2/f['file']);ox=i*320;oy=row*294;scale=1.5 if action=='death' else 2;size=(int(im.width*scale),int(im.height*scale));out.alpha_composite(im.resize(size,Image.Resampling.NEAREST),(ox+4,oy+24));draw.text((ox+5,oy+4),action+' '+str(i+1),fill='white');key=c['id']+':'+str(i+1)
   for j,q in enumerate(lookup[key]['candidates']):
    if q['rect'][2]>14 or q['rect'][3]>14:continue
    x=ox+4+q['native'][0]*scale;y=oy+24+q['native'][1]*scale;draw.ellipse((x-2,y-2,x+2,y+2),outline=(25,240,240));draw.text((x+3,y-3),str(j),fill=(25,240,240))
 p=ROOT/'contact'/('foundation-map-'+direction+'.png');out.save(p)
print('Eight foundation candidate maps; actual source palm review still required.')
