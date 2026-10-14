from pathlib import Path
from PIL import Image
import json,sys,importlib.util
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2];s=importlib.util.spec_from_file_location('t',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
g=json.loads((R/'generation.json').read_text(encoding='utf-8'))
out=[]
for r in g['records']:
 if r.get('sha256'):
  im=Image.open(V/r['raw']).convert('RGBA');a=im.getchannel('A').point(lambda q:255 if q>=128 else 0);cs=t.components(a.tobytes(),*im.size);big=[c for c in cs if c['area']>=500]
  try:grid=t.cells_for(im,*r['requestedGrid']);geometry='projection-grid-valid'
  except AssertionError as e:geometry=str(e)
  out.append({'id':r['id'],'size':im.size,'edge128':t.edge_count(im),'components500':len(big),'geometry':geometry,'largeBounds':[c['bounds'] for c in sorted(big,key=lambda c:(c['center'][1],c['center'][0]))]})
(R/'review/raw-inspection.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps([{k:v for k,v in r.items() if k!='largeBounds'} for r in out]))
