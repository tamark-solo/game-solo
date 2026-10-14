from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent;PACKAGE=ROOT.parents[2];reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'))
directions=['north','northeast','east','southeast','south','southwest','west','northwest'];chart=Image.new('RGBA',(6*200,8*148),(25,34,43,255));draw=ImageDraw.Draw(chart)
for row,d in enumerate(directions):
 clip=next(c for c in reg['clips'] if c['direction']==d and c['action']=='death')
 for col,f in enumerate(clip['frames']):
  x=col*200+2;y=row*148+18;im=Image.open(PACKAGE/f['file']).convert('RGBA');chart.alpha_composite(im,(x,y));draw.text((x,row*148+2),d+str(col+1),fill=(175,189,187,255));px,py=f['pivot'];draw.line((x+px-3,y+py,x+px+3,y+py),fill=(245,223,121,255));draw.line((x+px,y+py-3,x+px,y+py+3),fill=(245,223,121,255))
chart.save(ROOT/'review/death-eight-views-1x.png');chart.resize((chart.width*2,chart.height*2),Image.Resampling.NEAREST).save(ROOT/'review/death-eight-views-2x.png')
