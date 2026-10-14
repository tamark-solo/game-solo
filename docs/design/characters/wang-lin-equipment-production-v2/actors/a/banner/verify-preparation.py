import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
d=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'))
checks=0
def check(v,label):
 global checks
 assert v,label
 checks+=1
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
check(d['identityId']=='a','identity A')
check(d['familyId']=='banner','Banner family')
check(not d['generationAllowed'],'Sword gate remains closed')
check(d['actualCoverage']==dict(generatedSources=0,clips=0,motionKeys=0),'actual assets zero')
check(len(d['records'])==24,'24 source prompts')
matrix={(r['direction'],a) for r in d['records'] for a in r['actions']}
check(len(matrix)==64,'8 directions x8 actions')
ready=0
for r in d['records']:
 check(r['identityId']=='a' and r['familyId']=='banner','per job A own Banner')
 p=V2/r['prompt'];check(sha(p)==r['promptSha256'],'prompt hash')
 prompt=p.read_text(encoding='utf-8')
 check('Huyễn Tâm identity A' in prompt and 'RED hair tie' in prompt and 'wine-red' in prompt,'actual A identity/outfit')
 check('Tịch Bạch' not in prompt and 'silver-white high ponytail' not in prompt,'no B identity spec')
 for e in r['inputs']:
  path=V2/e['file'];check(sha(path)==e['sha256'],'input snapshot hash')
  check(path.read_bytes()==Path(e['original']).read_bytes(),'input snapshot original bytes')
  if e['role'].startswith('own-'):
   check('banner-a' in e['original'] or 'huyen-tam-banner' in e['original'],'only own A master/native')
 if r['inputSnapshotsReady']:
  ready+=1;check(len(r['inputs'])==3,'core input triplet')
 else:check(r['dependency'] and not r['inputs'],'same-view Banner own neutral dependency')
check(ready==8,'eight core snapshots ready')
recipe=json.loads((ROOT/'pack-recipe.json').read_text(encoding='utf-8'))
check(sum(recipe['timingMs']['cast-single-target'][:3])==600,'ST release key4')
check(sum(recipe['timingMs']['cast-aoe'][:3])==900,'AOE release key4')
report={'schema':'equipment-A-Banner-preparation-qa-v1','passed':True,'checks':checks,'coreInputTriplets':ready,'plannedPrompts':24,'plannedClips':64,'generatedSources':0,'generationAllowed':False,'actualBodyPixelOrAtlasCopiesFromB':0}
(ROOT/'review/preparation-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
