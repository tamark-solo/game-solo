"""Freeze a technical, possibly incomplete actor snapshot; never imply approval."""
from pathlib import Path
import hashlib,json,sys
R=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
actor=sys.argv[1];manifest=read(R/'manifest.json');ledger=read(R/'generation.json')
clips=[c for c in manifest['clips'] if c['actorId']==actor]
assert clips and not (R/'approval.json').exists()
folder=R/'checkpoints/enemy-motion'/f'{actor}-{len(clips)}'
assert not folder.exists(),'Existing technical snapshots are immutable; make a new coverage checkpoint'
folder.mkdir(parents=True)
brief=next(a for a in read(R/'enemy-production/plan.json')['actors'] if a['actorId']==actor)
source_ids={c['sourceJob'] for c in clips};sources=[s for s in manifest['sources'] if s['id'] in source_ids]
jobs=[j for j in ledger['jobs'] if j['actorId']==actor]
write(folder/'manifest.json',{'clips':clips,'sources':sources})
write(folder/'source-jobs.json',{'jobs':jobs})
write(folder/'model-assessments.json',{'records':[r for r in read(R/'review/enemy-model-assessments.json')['records'] if r['id'] in source_ids]})
for name,path in [('lineage-verification.json','review/verification.json'),('motion-browser-verification.json','enemy-production/motion-browser-verification.json'),('plan-verification.json','enemy-production/verification.json')]:
 report=read(R/path);assert report['status']=='passed';write(folder/name,report)
paths=set()
def add(p):
 p=Path(p)
 if p.is_file():paths.add(p.relative_to(R).as_posix())
for p in folder.iterdir():add(p)
for c in clips:
 for frame in c['frames']:add(R/frame['file'])
 add(R/c['atlas']['file'])
 add(R/'review'/f'{c["id"]}-contact.png')
 # Canonical contact/clip metadata is kept alongside the actual frames.
 for p in (R/c['frames'][0]['file']).parent.parent.glob('*'):
  if p.suffix in ['.png','.json']:add(p)
for j in jobs:
 if j['id'] not in source_ids:continue
 add(R/j['source']);add(R/j['prompt'])
 for i in j['inputs']:add(R/i['file'])
 for key in ['apiMetadata','apiRequest']:
  if key in j:
   add(R/j[key])
   for p in (R/j[key]).parent.glob('*.json'):add(p)
 # A successful retry must retain the failed initial request and the exact
 # owner authorization as well as the successful child attempt.
 for p in (R/'enemy-production/api-sources'/j['id']).rglob('*.json'):add(p)
 for suffix in ['-inspection.json','-source-native2x.png']:add(R/'review'/(j['id']+suffix))
failed=R/'enemy-production/api-sources'/f'{actor}-southwest-hit-api4x4-r1-neutral-r2'
if failed.exists():
 for p in failed.rglob('*.json'):add(p)
for j in jobs:
 api=R/'enemy-production/api-sources'/j['id']
 result=api/'generation-result.json'
 if result.exists() and read(result).get('status')=='failed-no-retry':
  add(R/j['prompt'])
  for i in j['inputs']:add(R/i['file'])
  for p in api.rglob('*.json'):add(p)
present={(c['direction'],c['action']) for c in clips}
missing=[{'direction':d,'action':a['id']} for d in read(R/'production-plan.json')['directions'] for a in brief['actions'] if (d,a['id']) not in present]
cpu=read(folder/'lineage-verification.json');gpu=read(folder/'motion-browser-verification.json')
actor_clip_ids={c['id'] for c in clips};actor_gpu=[v for v in gpu['gpuRenders'] if v['clipId'] in actor_clip_ids]
assert len(actor_gpu)==sum(len(c['frames']) for c in clips)*2,'Every actor key needs a native and atlas GPU readback before freezing'
result={'schema':'gdd-enemy-motion-technical-checkpoint-1','actorId':actor,'status':'incomplete-candidate' if missing else 'complete-candidate','bodyClips':len(clips),'bodyKeys':sum(len(c['frames']) for c in clips),'targetBodyClips':brief['targetBodyClips'],'missingClips':missing,'cpuChecks':cpu['checks'],'browserChecks':gpu['checks'],'gpuReadbacks':len(actor_gpu),'aggregateReportGpuReadbacks':len(gpu['gpuRenders']),'aggregateReportEnemyClips':gpu['enemyBodyClips'],'cpuAndBrowserChecksScope':'All actually packed clips in frozen reports; GPU count above is scoped to this actor.','sourceJobs':len(source_ids),'ownerArtApproved':False,'ownerMotionApproved':False,'runtimeIntegrated':False,'files':[{'file':p,'sha256':sha(R/p)} for p in sorted(paths)]}
write(folder/'checkpoint.json',result)
print(json.dumps({k:v for k,v in result.items() if k!='files'}|{'pinnedFiles':len(paths)}))
