"""Freeze source/native lineage of complete inspected enemy neutral view sets."""
from pathlib import Path
import hashlib,json,sys
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
master=read(R/'enemy-production/view-masters.json');generation=read(R/'view-masters/generation.json');gpu=read(R/'enemy-production/view-browser-verification.json');cpu=read(R/'enemy-production/view-verification.json')
assert cpu['status']==gpu['status']=='passed' and cpu['neutralViews']==gpu['neutralViews']==len(master['records'])
for actor in sys.argv[1:]:
 records=[v for v in master['records'] if v['actorId']==actor];assert len(records)==8
 folder=R/'checkpoints/enemy-views'/actor;assert not folder.exists();folder.mkdir(parents=True)
 jobs=[j for j in generation['jobs'] if j['actorId']==actor]
 write(folder/'registration.json',{'records':records});write(folder/'source-jobs.json',{'jobs':jobs})
 write(folder/'view-verification.json',cpu);write(folder/'view-browser-verification.json',gpu)
 paths=set()
 def add(p):
  p=Path(p)
  if p.is_file():paths.add(p.relative_to(R).as_posix())
 for p in folder.iterdir():add(p)
 for v in records:add(R/v['file']);add(R/v['proxy']);add(R/v['atlasFile'])
 for j in jobs:
  add(R/j['raw']);add(R/j['prompt'])
  for i in j['inputs']:add(R/i['file'])
  for key in ['apiMetadata','apiRequest']:
   if key in j:
    for p in (R/j[key]).parent.glob('*.json'):add(p)
 add(R/'review'/f'{actor}-eight-view-native2x.png');add(R/'review'/f'{actor}-board-review.json')
 write(folder/'checkpoint.json',{'schema':'new-gdd-enemy-view-technical-checkpoint-1','actorId':actor,'status':'candidate-source-reviewed','realNeutralViews':8,'animationClips':0,'aggregateCpuChecks':cpu['checks'],'gpuReadbacks':16,'ownerArtApproved':False,'motionApproved':False,'runtimeIntegrated':False,'files':[{'file':p,'sha256':sha(R/p)} for p in sorted(paths)]})
 print(json.dumps({'actorId':actor,'realViews':8,'pinnedFiles':len(paths),'ownerApprovalInferred':False}))
