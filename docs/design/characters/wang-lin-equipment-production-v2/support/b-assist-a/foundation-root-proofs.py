from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
reg=json.loads((V2/'actors/a/sword/registration.json').read_text(encoding='utf-8'))
cs=[c for c in reg['clips'] if c['direction'] in ['southeast','south','east','southwest'] and c['action'] in ['death','meditate']]
for c in cs:
 count=len(c['frames']);rows=(count+2)//3;sheet=Image.new('RGBA',(3*512,rows*640),(28,33,45,255));draw=ImageDraw.Draw(sheet)
 for i,f in enumerate(c['frames']):
  im=Image.open(V2/f['source']).convert('RGBA');x,y,w,h=f['sourceRect'];crop=im.crop((x,y,x+w,y+h));bg=Image.new('RGBA',crop.size,(28,33,45,255));bg.alpha_composite(crop)
  ox=(i%3)*512+8;oy=(i//3)*640+48;sheet.paste(bg,(ox,oy));draw.text((ox,oy-35),c['id']+':'+str(i+1),fill=(220,230,245));draw.text((ox,oy-20),f'RAW1x {x},{y} {w}x{h} scale={f["sourceScale"]:.5f}',fill=(180,200,220))
  cx=ox+f['root'][0]-x;cy=oy+f['root'][1]-y;draw.line((cx-8,cy,cx+8,cy),fill=(250,185,50),width=1);draw.line((cx,cy-8,cx,cy+8),fill=(250,185,50),width=1)
  for gx in range(((x+49)//50)*50,x+w,50):draw.text((ox+gx-x,oy+h+4),str(gx),fill=(140,170,195))
  for gy in range(((y+49)//50)*50,y+h,50):draw.text((ox+w+2,oy+gy-y),str(gy),fill=(140,170,195))
  native=Image.open(V2/f['file']).convert('RGBA');nb=Image.new('RGBA',native.size,(28,33,45,255));nb.alpha_composite(native);sheet.paste(nb.resize((native.width*2,native.height*2),Image.Resampling.NEAREST),(ox,oy+h+30))
  draw.text((ox+native.width*2+5,oy+h+40),f'lift={f["lift"]}',fill=(180,200,220))
 sheet.save(ROOT/'review'/f'{c["id"]}-roots-before.png')
print('8 actual raw1x / native2x root proof sheets saved')
