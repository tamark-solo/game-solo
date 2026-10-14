from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
snapshot=V2/'actors/a/banner/support-inputs/semantic-roots-registration.json'
assert hashlib.sha256(snapshot.read_bytes()).hexdigest()=='5d8136de47ac1482aabd56b56479620f2194b49e88050ef72b79a223bb050470'
d=json.loads(snapshot.read_text(encoding='utf-8'));sources={s['id']:s for s in d['sources']}
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',13)
for c in d['clips']:
 raw=V2/sources[c['sourceId']]['file'];assert hashlib.sha256(raw.read_bytes()).hexdigest()==sources[c['sourceId']]['sha256']
 im=Image.open(raw).convert('RGBA');panel=Image.new('RGBA',(1200,760),(25,31,42,255));dr=ImageDraw.Draw(panel)
 for f in c['frames']:
  i=f['index'];bx,by,bw,bh=f['sourceRect'];x=(i%3)*400+12;y=(i//3)*380+35
  crop=im.crop((bx,by,bx+bw,by+bh));panel.alpha_composite(crop,(x,y))
  rx=x+f['root'][0]-bx;ry=y+f['root'][1]-by
  dr.line((rx-8,ry,rx+8,ry),fill=(240,205,80));dr.line((rx,ry-6,rx,ry+6),fill=(240,205,80))
  dr.text((x,y-24),str(i)+' '+c['id'],fill=(220,220,205),font=font)
  dr.text((x,y+320),'Crop '+str([bx,by,bw,bh]),fill=(160,180,205),font=font)
  dr.text((x,y+342),'R '+str(f['root'])+' pending',fill=(240,205,80),font=font)
 out=SUPPORT/'evidence'/f"{c['id']}-source-root-review.png";out.parent.mkdir(parents=True,exist_ok=True);panel.save(out)
(SUPPORT/'snapshot.json').write_bytes(snapshot.read_bytes())
print(json.dumps({'sourcePoses':96,'sourceSheets':16,'actorWrites':False}))
