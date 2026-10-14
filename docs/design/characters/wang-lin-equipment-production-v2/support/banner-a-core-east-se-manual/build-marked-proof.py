from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'manual.json').read_text(encoding='utf8'))
for direction in ('east','southeast'):
    frames=[f for f in data['frames'] if f['clipId'].startswith('banner-a-'+direction+'-')]
    page=Image.new('RGB',(1200,2440),(238,240,235));draw=ImageDraw.Draw(page)
    for i,f in enumerate(frames):
        x=(i%4)*300;y=(i//4)*400
        im=Image.open(ROOT/f['evidence']);im.thumbnail((290,370),Image.Resampling.NEAREST)
        page.paste(im,(x+(300-im.width)//2,y+25))
        draw.text((x+4,y+4),f['clipId'].replace('banner-a-'+direction+'-','')+' '+str(f['key']),fill=(20,20,20))
    page.save(ROOT/'review'/('marked-'+direction+'.png'))
