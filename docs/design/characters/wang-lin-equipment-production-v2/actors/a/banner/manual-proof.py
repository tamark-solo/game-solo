from pathlib import Path
from PIL import Image,ImageDraw
import json,math,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('own_banner_candidates',ROOT/'candidate-tools.py');candidate=importlib.util.module_from_spec(spec);spec.loader.exec_module(candidate)
def main():
 reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));manual=json.loads((ROOT/'manual.json').read_text(encoding='utf-8')) if (ROOT/'manual.json').exists() else {};lookup={};proofs=[]
 for c in reg['clips']:
  canvas=Image.new('RGBA',(3*480,math.ceil(len(c['frames'])/3)*370),(29,34,45,255));d=ImageDraw.Draw(canvas)
  for i,f in enumerate(c['frames']):
   key=c['id']+':'+str(i+1);im=Image.open(V2/f['file']).convert('RGBA');cc=candidate.candidates(im);lookup[key]={'frameSha256':f['sha256'],'sourceId':f['sourceId'],'sourceScale':f['sourceScale'],'root':f['root'],'pivot':f['pivot'],'candidates':cc};ox=(i%3)*480;oy=(i//3)*370;canvas.alpha_composite(im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST),(ox,oy+32));d.text((ox+1,oy+1),c['direction']+' '+c['action']+' '+str(i+1),fill='white')
   for index,q in enumerate(cc):
    x=ox+q['native'][0]*2;y=oy+32+q['native'][1]*2;d.ellipse((x-2,y-2,x+2,y+2),outline=(15,230,230));d.text((x+3,y-3),str(index),fill=(15,230,230))
   m=manual.get(key)
   if not m:continue
   p=m['sourceManual'];n=[f['pivot'][k]+(p[k]-f['root'][k])*f['sourceScale'] for k in range(2)];raw=Image.open(V2/f['source']).convert('RGBA');radius=round(14/f['sourceScale']);l,t=round(p[0])-radius,round(p[1])-radius;side=2*radius+1;crop=raw.crop((l,t,l+side,t+side)).resize((192,192),Image.Resampling.NEAREST);canvas.alpha_composite(crop,(ox+280,oy+32));d.ellipse((ox+n[0]*2-3,oy+32+n[1]*2-3,ox+n[0]*2+3,oy+32+n[1]*2+3),outline=(68,255,96),width=2)
   for point,color in [(p,(68,255,96))]+([(m['sourceCuff'],(255,154,58))] if m.get('sourceCuff') else []):
    x=ox+280+(point[0]-l)*192/side;y=oy+32+(point[1]-t)*192/side;d.ellipse((x-3,y-3,x+3,y+3),outline=color,width=2)
   d.text((ox+1,oy+300),m['visibility']+' / '+m['attachmentPolicy'],fill='white');d.text((ox+1,oy+322),'dominant closed? '+str(m.get('dominantGripClosed','unreviewed')),fill='white');proofs.append({'key':key,'sourcePalm':p,'sourceNearestRGBA':list(raw.getpixel(tuple(map(round,p)))),'native':n,'sourcePalmReviewed':m.get('sourcePalmReviewed',False),'proof':'actors/a/banner/contact/'+c['id']+'-manual-source-native.png'})
  file=ROOT/'contact'/(c['id']+'-manual-source-native.png');file.parent.mkdir(parents=True,exist_ok=True);canvas.save(file)
 (ROOT/'candidate-lookup.json').write_text(json.dumps({'role':'Candidate color islands are only location aids; wine-red garment/gold/ivory/face regions are not hand classifications. Dominant closed-grip and free-hand seal are manually distinguished on original raw every pose.','frames':lookup},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(ROOT/'manual-proof.json').write_text(json.dumps({'frames':proofs,'count':len(proofs)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('candidate keys',len(lookup),'actual source proofs',len(proofs))
if __name__=='__main__':main()
