from pathlib import Path
import json,hashlib,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));roots=json.loads((ROOT/'root-overrides.json').read_text(encoding='utf-8'));folder=V2/sys.argv[1];inp=folder/'manual-registration.json';data=json.loads(inp.read_text(encoding='utf-8'));count=0
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for c in data['clips']:
 current=next(q for q in reg['clips'] if q['id']==c['id'])
 for f in c['frames']:
  own=next(q for q in current['frames'] if q['sourceBodyCell']==f['sourceBodyCell']);assert sha(V2/own['source'])==f['sourceSha256'];assert own['sourceScale']==f['sourceScale'];assert own['sourceId']==c['sourceId'];assert f['sourceRootReviewed'] and f['rootMeasurement']['manualReviewed'];key=c['id']+':'+str(own['index']+1)
  rm=f['rootMeasurement'];r=rm|{'root':f['root'],'sourceRoot':f['root'],'sourceRootReviewed':True,'manualReviewed':True,'lift':0,'liftBakedOnce':True,'supportManualFile':str(inp.relative_to(V2)).replace('\\','/'),'supportManualSha256':sha(inp)}
  for label in ['sourceEvidence','nativeEvidence']:
   if r.get(label):r[label]=str((folder/r[label]).relative_to(V2)).replace('\\','/')
  roots[key]=r;count+=1
(ROOT/'root-overrides.json').write_text(json.dumps(roots,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Imported actual semantic source roots',count)
