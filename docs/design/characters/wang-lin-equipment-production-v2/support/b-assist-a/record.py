import sys,json,hashlib,shutil
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
sid,original=sys.argv[1:3]
path=ROOT/'generation.json'
data=json.loads(path.read_text(encoding='utf-8'))
item=next(x for x in data['items'] if x['id']==sid)
dest=ROOT/'sources'/f'{sid}.png'
if dest.exists(): raise RuntimeError('Raw already recorded; do not overwrite history')
shutil.copy2(original,dest)
im=Image.open(dest).convert('RGBA')
alpha=im.getchannel('A'); solid=alpha.point(lambda a:255 if a>=128 else 0)
bbox=solid.getbbox()
bands=[];start=None
for y in range(im.height):
    row=solid.crop((0,y,im.width,y+1)).getbbox()
    if row and start is None: start=y
    if not row and start is not None: bands.append([start,y]);start=None
if start is not None: bands.append([start,im.height])
item.update({'status':'generated','source':str(dest.relative_to(ROOT)).replace('\\','/'),'originalOutput':original,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'actualSize':list(im.size),'alphaBounds128':list(bbox),'outerTransparentMargins128':[bbox[0],bbox[1],im.width-bbox[2],im.height-bbox[3]],'rowBands128':bands,'alphaExtrema':list(alpha.getextrema()),'selected':True,'sourceViewed':True,'visualReview':'Full source reviewed against same-view own/Wang inputs; actor A owner performs canonical/manual/scale registration.'})
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:item[k] for k in ['id','originalOutput','source','sha256','actualSize','alphaBounds128','outerTransparentMargins128','rowBands128']},ensure_ascii=False))
