from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=read(ROOT/'registration.json');gen=read(ROOT/'generation.json');directions=['north','northeast','east','southeast','south','southwest','west','northwest'];out=Image.new('RGBA',(8*240,260),(29,34,45,255));d=ImageDraw.Draw(out);rows=[]
for i,direction in enumerate(directions):
 records=[r for r in gen['records'] if r['selected'] and r.get('direction',r.get('dir'))==direction]
 r=next((r for r in records if r.get('group')=='core'),records[0]);cal=next(c for c in reg['calibrations'] if c['sourceId']==r['id'])['frames'][0];own=Image.open(V2/cal['file']).convert('RGBA');wp=next(p for p in r['inputs'] if 'Wang' in p['role']);wang=Image.open(wp['file']).convert('RGBA');wang=wang.resize((wang.width//8,wang.height//8),Image.Resampling.NEAREST)
 # Wang actual native64x96 pivot32,88; preserve bytes while padding to common112x112 origin56,104.
 padded=Image.new('RGBA',(112,112));padded.paste(wang,(56-wang.width//2,104-88));out.alpha_composite(padded,(i*240,32));out.alpha_composite(own,(i*240+116,32));d.text((i*240+2,2),direction,fill='white');d.text((i*240+2,150),'Wang live / own A',fill='white')
 d.line((i*240,136,i*240+228,136),fill=(55,165,180));rows.append({'direction':direction,'sourceId':r['id'],'actor':cal['file'],'actorSha256':cal['sha256'],'WangReference':wp['file'],'WangReferenceSha256':wp['sha256'],'sameGround':104,'sourceScale':next(s['scale'] for s in reg['sources'] if s['id']==r['id']),'ownIdentityPreserved':True})
out=out.crop((0,0,out.width,176));out.save(ROOT/'contact/own-a-wang-eight-view-native1x.png');out.resize((out.width*2,out.height*2),Image.Resampling.NEAREST).save(ROOT/'contact/own-a-wang-eight-view-native2x.png')
(ROOT/'comparison.json').write_text(json.dumps({'role':'Each own A same-view source calibration beside actual same-view Wang native. Own approved A slimmer torso/smaller face retained; no head/skin/face patch from Wang. Common world foot is padding only.','rows':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
