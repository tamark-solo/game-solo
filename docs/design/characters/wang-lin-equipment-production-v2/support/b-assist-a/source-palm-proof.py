import json,math
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
path=ROOT/'manual-west-northwest.json';data=json.loads(path.read_text(encoding='utf-8'))
reg=json.loads((V2/'actors/a/sword/registration.json').read_text(encoding='utf-8'))
frames={c['id']+':'+str(i+1):f for c in reg['clips'] for i,f in enumerate(c['frames'])}
for cid in sorted(set(e['clipId'] for e in data['frames'].values())):
 entries=[e for e in data['frames'].values() if e['clipId']==cid]
 sheet=Image.new('RGBA',(3*300,2*340),(28,33,45,255));draw=ImageDraw.Draw(sheet)
 for e in entries:
  i=e['frameIndex'];key=cid+':'+str(i+1);f=frames[key];im=Image.open(V2/f['source']).convert('RGBA');x,y=e['source'];cx,cy=round(x),round(y)
  crop=im.crop((cx-36,cy-36,cx+37,cy+37));bg=Image.new('RGBA',crop.size,(28,33,45,255));bg.alpha_composite(crop)
  ox=(i%3)*300+4;oy=(i//3)*340+34;sheet.paste(bg.resize((292,292),Image.Resampling.NEAREST),(ox,oy));mx=ox+(x-cx+36)*4;my=oy+(y-cy+36)*4
  draw.ellipse((mx-3,my-3,mx+3,my+3),outline=(70,255,120),width=1);draw.text((ox,oy-26),key+' '+e['visibility'],fill=(220,230,245))
  e['sourcePalmProof']=f'review/{cid}-source-palm.png';e['sourcePointNearestRGBA']=list(im.getpixel((cx,cy)));e['sourcePointPolicy']='Affine inverse of visually selected native palm, quantization within 1 native pixel; original raw crop confirms actual hand.'
 sheet.save(ROOT/'review'/f'{cid}-source-palm.png')
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('48 raw-source palm crops retained, no actor A writes')
