"""Pin only this support package's actual source/provenance files."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
verification=json.loads((ROOT/'verification.json').read_text(encoding='utf8'))
assert verification['passed']
pins=[{'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}
      for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts]
delivery={'schema':'banner-core-assist-delivery-1','actualRawSources':verification['actualRawSources'],
   'verificationChecks':verification['checks'],'pins':pins,'ownerApproved':False,'runtimeIntegrated':False,
   'sourceSelection':'A W/A NW/B NW r1 are wrong-view history; B W and B NW r2 await actor B final source selection.',
   'canonicalCoverageClaimed':0,'notes':['Helper raw metadata checks do not approve motion or gameplay.',
      'Own-source corrective lineage preserved; no sprite mirror or foreign identity repaint.',
      'Nominal equal cell bands require actual actor component/sourceRect review, not clipping concealment.']}
(ROOT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'raws':delivery['actualRawSources'],'checks':delivery['verificationChecks'],'pins':len(pins),'deliverySHA':sha(ROOT/'delivery.json')}))
