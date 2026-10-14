from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'))
manual=json.loads((ROOT/'manual.json').read_text(encoding='utf-8'))
report=[]
for c in reg['clips']:
 if 'reusedFrom' in c:continue
 count=len(c['frames']);out=Image.new('RGBA',(3*440,math.ceil(count/3)*330),(29,34,45,255));d=ImageDraw.Draw(out)
 for i,f in enumerate(c['frames']):
  key=c['id']+':'+str(i+1);m=manual[key];p=m['sourceManual'];im=Image.open(V2/f['source']).convert('RGBA');n=Image.open(V2/f['file']).convert('RGBA');nx,ny=[f['pivot'][k]+(p[k]-f['root'][k])*f['sourceScale'] for k in range(2)]
  sx,sy=round(p[0]),round(p[1]);rgba=im.getpixel((sx,sy));radius=round(14/f['sourceScale']);cropRect=[sx-radius,sy-radius,sx+radius+1,sy+radius+1];raw=im.crop(cropRect);raw=raw.resize((196,196),Image.Resampling.NEAREST)
  ox=(i%3)*440;oy=(i//3)*330;out.alpha_composite(n.resize((n.width*2,n.height*2),Image.Resampling.NEAREST),(ox,oy+32));out.alpha_composite(raw,(ox+242,oy+32));d.ellipse((ox+nx*2-3,oy+32+ny*2-3,ox+nx*2+3,oy+32+ny*2+3),outline=(68,255,96),width=2)
  rx=242+(p[0]-cropRect[0])*196/(cropRect[2]-cropRect[0]);ry=32+(p[1]-cropRect[1])*196/(cropRect[3]-cropRect[1]);d.ellipse((ox+rx-4,oy+ry-4,ox+rx+4,oy+ry+4),outline=(68,255,96),width=2)
  if m.get('sourceCuff'):
   q=m['sourceCuff'];qx=242+(q[0]-cropRect[0])*196/(cropRect[2]-cropRect[0]);qy=32+(q[1]-cropRect[1])*196/(cropRect[3]-cropRect[1]);d.ellipse((ox+qx-3,oy+qy-3,ox+qx+3,oy+qy+3),outline=(255,154,58),width=2)
  d.text((ox+2,oy+1),c['direction']+' '+c['action']+' '+str(i+1),fill='white');d.text((ox+2,oy+260),str(m.get('visibility'))+' / '+str(m.get('attachmentPolicy')),fill='white');d.text((ox+2,oy+282),'source '+str([sx,sy])+' RGBA '+str(rgba),fill='white')
  report.append({'key':key,'sourcePoint':p,'nearestRGBA':list(rgba),'native':[nx,ny],'proof':'actors/a/sword/contact/'+c['id']+'-manual-source-native.png','sourcePalmReviewed':m.get('sourcePalmReviewed',False)})
 out.save(ROOT/'contact'/(c['id']+'-manual-source-native.png'))
(ROOT/'manual-proof.json').write_text(json.dumps({'frames':report,'count':len(report),'sourcePointAlpha0':sum(r['nearestRGBA'][3]==0 for r in report)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('proofs',len(report),'alpha0',sum(r['nearestRGBA'][3]==0 for r in report))
