from PIL import Image
from pathlib import Path
for p in Path("docs/design/characters/wang-lin-equipment-production-v1/sources/body").glob("*.png"):
 im=Image.open(p).convert("RGBA"); a=im.getchannel("A"); box=a.point(lambda v:255 if v>=128 else 0).getbbox()
 print(p.stem,"box",box)
 for y in [box[3]-45,box[3]-25,box[3]-5]:
  row=list(a.crop((0,y,im.width,y+1)).getdata()); seg=[]; start=None
  for x,v in enumerate(row+[0]):
   if v>=128 and start is None:start=x
   if v<128 and start is not None:seg.append((start,x-1));start=None
  print(y, [s for s in seg if s[1]-s[0]>10])

