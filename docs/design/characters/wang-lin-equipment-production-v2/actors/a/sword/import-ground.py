from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=read(ROOT/'registration.json');roots=read(ROOT/'root-overrides.json')
frames={c['id']+':'+str(i+1):f for c in reg['clips'] if 'reusedFrom' not in c for i,f in enumerate(c['frames'])}
files=[V2/'support/a-foundation-manual/ground-proof.json',V2/'support/b-assist-a/roots-own-foundation.json']
imports=[]
for file in files:
 if not file.exists():continue
 data=read(file);entries=data.get('frames',data)
 for key,m in entries.items():
  if not key.startswith('sword-a-'):continue
  if roots.get(key,{}).get('importedFromSha256')==sha(file):continue
  f=frames[key]
  assert sha(V2/f['file'])==m['frameSha256'],key+' oldframe hash mismatch'
  assert sha(V2/f['source'])==m['sourceSha256'],key+' source mismatch'
  assert f['sourceRect']==m['sourceRect']
  root=m.get('sourceRootRecommended',m.get('sourceRoot',m.get('root')))
  assert len(root)==2,key
  roots[key]=m|{'root':root,'sourceRoot':root,'manualReviewPending':False,'sourcePointFinal':True,'sourceRootSelection':'visually confirmed supporting material/waist-thigh projection with explicit uncertainty; no pose fitting','importedFrom':str(file.relative_to(V2)).replace('\\','/'),'importedFromSha256':sha(file)}
 imports.append({'file':str(file.relative_to(V2)).replace('\\','/'),'sha256':sha(file),'frames':len(entries)})
(ROOT/'root-overrides.json').write_text(json.dumps(roots,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'ground-imports.json').write_text(json.dumps({'imports':imports},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(imports)
