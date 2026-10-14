from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,importlib.util,math
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2]
s=importlib.util.spec_from_file_location('bt',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));out={}
for r in g['records']:
 if not r.get('selected') or not r.get('sha256') or r['group']!='core':continue
 im=Image.open(V/r['raw']).convert('RGBA');cells=[c for row in t.cells_for(im,6,5) for c in row];items=[]
 marked=im.copy();dr=ImageDraw.Draw(marked)
 for index,c in enumerate(cells):
  root,basis=t.sole_anchor(im,c);warms=t.warm_components(im,c)
  x,y,w,h=c['rect'];own=c['part'];comp=t.components(own.tobytes(),w,h);main=max(comp,key=lambda q:q['area']);lb=main['bounds'];crown=y+lb[1]
  # Warm islands are proposals only. Human confirms face vs closed hand and cuff.
  items.append({'rawIndex':index,'bounds':c['coreBounds'],'crownProposal':crown,'soleProposal':root[1],'rootProposal':root,'rootBasisProposal':basis,'warmProposals':warms})
  dr.rectangle((c['coreBounds'][0],c['coreBounds'][1],c['coreBounds'][2]-1,c['coreBounds'][3]-1),outline=(0,180,240),width=1)
  dr.text((c['coreBounds'][0],c['coreBounds'][1]+3),str(index),fill=(255,255,0))
  dr.ellipse((root[0]-3,root[1]-3,root[0]+3,root[1]+3),outline=(255,220,0),width=2)
  for n,wa in enumerate(warms):
   px,py=wa['center'];dr.ellipse((px-4,py-4,px+4,py+4),outline=(0,255,130),width=2);dr.text((px+4,py),str(n),fill=(0,255,130))
 path=R/'review'/f'{r["id"]}-proposals.png';marked.save(path)
 out[r['id']]={'direction':r['direction'],'sourceSha256':r['sha256'],'edge128':t.edge_count(im),'entries':items,'markedSource':str(path.relative_to(V)).replace('\\','/'),'manualConfirmed':False}
(R/'review/core-proposals.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sources':len(out),'proposedPoses':sum(len(p['entries']) for p in out.values()),'edges':{k:v['edge128'] for k,v in out.items()}}))
