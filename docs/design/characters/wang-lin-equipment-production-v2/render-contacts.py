import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent
if (ROOT/'approval.json').exists(): raise RuntimeError('Approved V2 is immutable')
manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8-sig'))
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',12)
def render(frame):
 canvas=Image.new('RGBA',(224,224),(28,48,36,255));origin=[112,192]
 layers=frame.get('gearLayers',[]);body=frame.get('body',{'file':frame['file'],'pivot':frame['pivot']})
 ordered=[l for l in layers if l['role']=='rear']+[body]+[l for l in layers if l['role']!='rear']
 for l in ordered:
  im=Image.open(ROOT/l['file']).convert('RGBA');xy=[round(origin[i]-l['pivot'][i]) for i in range(2)]
  if l.get('cropInBody'):
   x,y,w,h=l['rect'];im=im.crop((x,y,x+w,y+h));xy=[xy[0]+x,xy[1]+y]
  canvas.alpha_composite(im,tuple(xy))
 draw=ImageDraw.Draw(canvas);draw.line((107,192,117,192),fill='#bda26c');draw.line((112,187,112,197),fill='#bda26c')
 draw.text((8,204),frame.get('gearMode','body only / waiting track'),font=font,fill='#b4c8a9');return canvas
out=ROOT/'review'/'contact';out.mkdir(parents=True,exist_ok=True)
for family in ['sword','banner','chariot','bead']:
 for identity in ['a','b']:
  for action in manifest['actions']:
   clips=[c for c in manifest['motions']['clips'] if c['familyId']==family and c['identityId']==identity and c['action']==action]
   if not clips:continue
   cols=max(len(c['frames']) for c in clips);sheet=Image.new('RGBA',(cols*224,len(clips)*248),(19,36,27,255));draw=ImageDraw.Draw(sheet)
   for row,c in enumerate(clips):
    draw.text((8,row*248+4),c['id'],font=font,fill='#e4d4a5')
    for col,f in enumerate(c['frames']):sheet.alpha_composite(render(f),(col*224,row*248+24))
   name=f'{family}-{identity}-{action}-1x.png';sheet.save(out/name)
   sheet.resize((sheet.width*2,sheet.height*2),Image.Resampling.NEAREST).save(out/name.replace('1x','2x'))
print('Contact rendering complete from exact body/gear layers')
