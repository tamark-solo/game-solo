from pathlib import Path
from PIL import Image,ImageDraw
import json,math,hashlib,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('candidate_tool',ROOT/'candidate-proof.py');candidate=importlib.util.module_from_spec(spec);spec.loader.exec_module(candidate)
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'))
chosen={'east':'sword-a-east-core-r1','northeast':'sword-a-northeast-core-r1','south':'sword-a-south-locomotion-r3','southwest':'sword-a-southwest-locomotion-r5'}
proof=Image.new('RGBA',(4*336,390),(29,34,45,255));d=ImageDraw.Draw(proof);lookup={}
for j,(direction,id) in enumerate(chosen.items()):
 cal=next(c for c in reg['calibrations'] if c['sourceId']==id)['frames'][0]
 im=Image.open(V2/cal['file']).convert('RGBA');proof.alpha_composite(im.resize((336,336),Image.Resampling.NEAREST),(j*336,32));cs=candidate.candidates(im);lookup[direction]={'frame':cal,'candidates':cs}
 d.text((j*336+2,2),direction+' own neutral calibration1',fill='white')
 for k,c in enumerate(cs):
  x=j*336+c['native'][0]*3;y=32+c['native'][1]*3;d.ellipse((x-2,y-2,x+2,y+2),outline=(0,255,255));d.text((x+3,y-4),str(k),fill=(0,255,255))
proof.save(ROOT/'contact/wrist-neutral-calibration-candidates.png')
(ROOT/'wrist-neutral-candidates.json').write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
