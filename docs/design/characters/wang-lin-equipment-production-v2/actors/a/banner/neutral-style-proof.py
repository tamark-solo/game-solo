from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2];reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'))
directions=['north','northeast','east','southeast','south','southwest','west','northwest'];out=Image.new('RGBA',(4*420,2*360),(29,34,43,255));d=ImageDraw.Draw(out)
for i,v in enumerate(directions):
 s=next(s for s in reg['sources'] if s['direction']==v and s['group']=='core');rec=next(r for r in gen['records'] if r['id']==s['id']);ref=next(q for q in rec['inputs'] if 'Wang' in q['role']);w=Image.open(V2/ref['file']).convert('RGBA').resize((64,96),Image.Resampling.NEAREST);wp=Image.new('RGBA',(112,112));wp.paste(w,(24,16));own=Image.open(V2/s['neutralNative']).convert('RGBA');ox=(i%4)*420;oy=(i//4)*360
 d.text((ox+8,oy+3),v+' | Banner A / Wang same-view scale-style only',fill='white')
 for j,im in enumerate([own,wp]):
  out.alpha_composite(im,(ox+8+j*118,oy+24));out.alpha_composite(im.resize((224,224),Image.Resampling.NEAREST),(ox+8+j*198,oy+136))
out.save(ROOT/'contact/neutral-style-eight-views.png');print('8 actual same-view style pairs native1x/2x; pixels only resized/padded for evidence.')
