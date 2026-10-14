"""Diagnostic only: immutable gear pixels shown at fixed native1x/nearest2x."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
measurement=json.loads((ROOT/'measurement.json').read_text(encoding='utf8'))
sheet=Image.new('RGB',(1600,1200),(228,230,233));draw=ImageDraw.Draw(sheet)
for index,item in enumerate(measurement['records']):
    full=Image.open(V2/item['fullFile']).convert('RGBA')
    front=Image.open(V2/item['frontFile']).convert('RGBA')
    bbox=full.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
    crop=(max(0,bbox[0]-3),max(0,bbox[1]-3),min(full.width,bbox[2]+3),min(full.height,bbox[3]+3))
    left=index%4*400;top=index//4*300
    draw.text((left+5,top+4),item['id'],fill=(10,14,20))
    x=left+5
    for scale in (1,2):
        for name,im in (('full',full),('front',front)):
            piece=im.crop(crop).resize(((crop[2]-crop[0])*scale,(crop[3]-crop[1])*scale),Image.Resampling.NEAREST)
            sheet.paste(piece,(x,top+31),piece)
            px=x+(item['registeredGroundCandidate'][0]-crop[0])*scale
            py=top+31+(item['registeredGroundCandidate'][1]-crop[1])*scale
            draw.line((px-3,py,px+3,py),fill=(0,140,125));draw.line((px,py-3,px,py+3),fill=(0,140,125))
            draw.text((x,top+18),name+' '+str(scale)+'x',fill=(32,40,48))
            x+=piece.width+9
    draw.text((left+5,top+282),'native endpoint '+str(item['registeredGroundCandidate']),fill=(0,92,76))
sheet.save(ROOT/'native-1x-2x.png')
print('16 immutable gear views at fixed native1x/nearest2x; no gear writes.')
