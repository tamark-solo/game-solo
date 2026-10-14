from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,statistics,importlib.util
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2]
s=importlib.util.spec_from_file_location('bt',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));out={}
for r in g['records']:
 if r['group']=='core' or not r.get('selected') or not r.get('sha256'):continue
 im=Image.open(V/r['raw']).convert('RGBA')
 rowcols=[4,4,4,4,3,3] if r['id']=='banner-b-northwest-damage-r1' else [3]*6
 try:cells=[c for row in t.cells_for(im,rowcols,6) for c in row]
 except AssertionError as er:out[r['id']]={'geometryError':str(er),'sourceSha256':r['sha256']};continue
 entries=[];chart=Image.new('RGBA',(max(rowcols)*340,6*340),(28,39,49,255));dr=ImageDraw.Draw(chart)
 for i,c in enumerate(cells):
  root,basis=t.sole_anchor(im,c);x,y,w,h=c['rect'];main=max(t.components(c['part'].tobytes(),w,h),key=lambda q:q['area']);crown=y+main['bounds'][1]
  entries.append({'rawIndex':i,'row':c['row'],'col':c['col'],'sourceRect':c['rect'],'bounds':c['coreBounds'],'rootProposal':root,'rootBasisProposal':basis,'sourceCrownY':crown,'sourceBootSoleY':root[1],'warmProposals':t.warm_components(im,c)})
  f=R/'review/foundation-crops'/r['id']/f'{i:02}.png';f.parent.mkdir(parents=True,exist_ok=True);crop=im.crop((x,y,x+w,y+h));crop.putalpha(c['part']);crop.save(f)
  native=t.native(im,c,root,1,(340,340),(170,322));chart.alpha_composite(native,(c['col']*340,c['row']*340));dr.text((c['col']*340+4,c['row']*340+3),str(i),fill=(245,225,140))
 scale=80/statistics.median(e['sourceBootSoleY']-e['sourceCrownY'] for e in entries[:6])
 chart.save(R/'review'/f'{r["id"]}-actual-source-pose-crops.png')
 out[r['id']]={'sourceSha256':r['sha256'],'direction':r['direction'],'group':r['group'],'actualGrid':[max(rowcols),6],'rowColumns':rowcols,'edge128':t.edge_count(im),'sourceScaleProposal':scale,'entries':entries,'rawAbsolute':str(V/r['raw']),'sourcePoseCropsAbsolute':str(R/'review'/f'{r["id"]}-actual-source-pose-crops.png'),'promptAbsolute':str(V/r['prompt']),'inputs':r['inputs'],'manualConfirmed':False}
(R/'review/foundation-proposals.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:({'error':p['geometryError']} if 'geometryError' in p else {'factor':p['sourceScaleProposal'],'edge':p['edge128'],'poses':len(p['entries'])}) for k,p in out.items()}))
