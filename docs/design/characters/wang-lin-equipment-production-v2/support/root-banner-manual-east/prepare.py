from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
data=json.loads((V2/'actors/b/banner/review/root-east-manual-input.json').read_text(encoding='utf-8'))['sources']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
selected={k:v for k,v in data.items() if any(k.startswith('banner-b-'+d+'-') for d in ['east','southeast'])}
assert len(selected)==4
(SUPPORT/'proposals.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',14)
for sid,s in selected.items():
 raw=V2/'actors/b/banner/sources'/f'{sid}.png';assert sha(raw)==s['sourceSha256']
 im=Image.open(raw).convert('RGBA')
 for group in range(3):
  entries=s['entries'][group*6:(group+1)*6];panel=Image.new('RGBA',(1200,820),(27,33,42,255));d=ImageDraw.Draw(panel)
  for n,e in enumerate(entries):
   x=(n%3)*400;y=(n//3)*410+28;bx,by,bw,bh=e['sourceRect']
   crop=im.crop((bx,by,bx+bw,by+bh));panel.alpha_composite(crop,(x+10,y+24))
   d.text((x+10,y-22),str(e['rawIndex'])+' '+sid,fill=(225,225,208),font=font)
   root=e['rootProposal'];rx=x+10+root[0]-bx;ry=y+24+root[1]-by
   d.line((rx-6,ry,rx+6,ry),fill=(255,215,80));d.line((rx,ry-6,rx,ry+6),fill=(255,215,80))
   for i,warm in enumerate(e['warmProposals'][:8]):
    px=x+10+warm['center'][0]-bx;py=y+24+warm['center'][1]-by
    d.ellipse((px-3,py-3,px+3,py+3),outline=(80,250,180),width=1)
    d.text((px+3,py-8),str(i),fill=(80,250,180),font=font)
   d.text((x+10,y+300),'R'+str([round(v,1) for v in root]),fill=(255,215,80),font=font)
  out=SUPPORT/'evidence'/f'{sid}-group{group}.png';out.parent.mkdir(parents=True,exist_ok=True);panel.save(out)
print(json.dumps({'sources':len(selected),'figures':72,'sourcePlots':12,'actorWrites':False}))
