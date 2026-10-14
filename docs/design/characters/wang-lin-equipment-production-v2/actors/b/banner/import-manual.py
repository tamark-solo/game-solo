from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parent;V=R.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=Path(sys.argv[1]);m=json.loads(p.read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'));own=json.loads((R/'manual-registration.json').read_text(encoding='utf-8'))
def rebase(value):
 if isinstance(value,dict):
  for k,v in value.items():
   if k in ('manualEvidence','reviewEvidence','evidence') and isinstance(v,str) and (p.parent/v).exists():value[k]=str((p.parent/v).relative_to(V)).replace('\\','/')
   else:rebase(v)
 elif isinstance(value,list):
  for v in value:rebase(v)
for sid,s in m['sources'].items():
 r=next(z for z in g['records'] if z['id']==sid);assert s['sourceSha256']==r['sha256']==sha(V/r['raw']);assert sid not in own['sources'],'No overwrite existing manual review'
 rebase(s);s.update(importedManualSource=str(p.relative_to(V)).replace('\\','/'),importedManualSourceSha256=sha(p));own['sources'][sid]=s
(R/'manual-registration.json').write_text(json.dumps(own,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'importedSources':list(m['sources']),'helperHash':sha(p)}))
