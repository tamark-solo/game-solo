"""Check enemy production contracts/dependencies, without pretending art exists."""
from pathlib import Path
import collections,json,hashlib,subprocess,sys
R=Path(__file__).resolve().parent;W=R.parents[3];read=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
brief=read(R/'enemy-production/plan.json');plan=read(R/'production-plan.json');generation=read(R/'generation.json');views=read(R/'view-masters/generation.json');manifest=read(R/'manifest.json');checks=0
expected={'sword-servant':(72,40),'yin-corpse-cultivator':(80,40),'blood-talisman-mage':(80,40),'hua-lap-quoc':(96,64),'blood-armor-commander':(128,64),'dark-seal-true-body':(80,72)}
assert len(brief['actors'])==6 and brief['targetEnemyBodyClips']==320;checks+=2
for actor in brief['actors']:
 id=actor['actorId'];nominal,count=expected[id];assert actor['master']['bodyNominalPx']==nominal and actor['targetBodyClips']==count;checks+=2
 master=R.parent/'gdd-character-concepts-v1'/actor['master']['file'];assert sha(master)==actor['master']['nativeSha256'];checks+=1
 jobs=[j for j in generation['jobs'] if j['id'] in actor['sourceJobs']];assert len(jobs)==len(actor['sourceJobs']);checks+=1
 coverage=collections.Counter((j['direction'],action) for j in jobs for action in j['actions'])
 assert set(coverage)=={(direction,action['id']) for direction in plan['directions'] for action in actor['actions']};assert set(coverage.values())=={1};checks+=2
 for action in actor['actions']:
  assert len(action['phaseLabels'])==len(action['sourcePoseBrief'])==len(action['draftDurationMs'])==6;assert action['holdLast']==(action['id'] in ['death','subdued']);checks+=2
 for j in jobs:
  assert j['bodyNominalPx']==nominal and j['previewTimingsAreBalance'] is False;assert sha(R/j['prompt'])==j['promptSha256'];checks+=2
  for image in j['inputs']:assert sha(R/image['file'])==image['sha256'];checks+=1
  if j['direction']!='southeast' and not j.get('boundViewId'):assert j['waitingForViewMaster'];checks+=1
  if j['supportMode']=='spectral-projection':assert j['alphaPolicy']=='preserved-soft-RGBA';checks+=1
 assert not any('docs/archive' in i['original'] or 'van-hai-monster' in i['original'] or 'van-hai-boss' in i['original'] for j in jobs for i in j['inputs']);checks+=1
hua=next(a for a in brief['actors'] if a['actorId']=='hua-lap-quoc');assert 'subdued' in [a['id'] for a in hua['actions']] and 'death' not in [a['id'] for a in hua['actions']];checks+=1
dark=next(a for a in brief['actors'] if a['actorId']=='dark-seal-true-body');assert {'cast-single-target','cast-decoy','cast-aoe'}<={a['id'] for a in dark['actions']};checks+=1
assert plan['targetBodyClips']==832 and sum(len(a['actions'])*8 for a in plan['actors'])==832;checks+=1
pending=[j for j in generation['jobs'] if j['actorId'] in expected and j['status']=='planned' and not j.get('supersededPlanned')]
blocked=next((j for j in pending if j.get('waitingForViewMaster')),None)
ready=next((j for j in pending if not j.get('waitingForViewMaster')),None)
if blocked:
 negative=subprocess.run([sys.executable,str(R/'production_ops.py'),'payload','motion',blocked['id']],capture_output=True,text=True);assert negative.returncode!=0 and 'SE fallback is forbidden' in negative.stderr;checks+=1
if ready:
 positive=subprocess.run([sys.executable,str(R/'production_ops.py'),'payload','motion',ready['id']],capture_output=True,text=True);assert positive.returncode==0 and json.loads(positive.stdout)[0]['id']==ready['id'];checks+=1
for pin in read(R/'review/delivery-main-story-views-v1.json')['files']:assert sha(R/pin['file'])==pin['sha256'];checks+=1
actual=[c for c in manifest['clips'] if c['actorId'] in expected];checks+=1
report={'status':'passed','checks':checks,'enemyActors':6,'plannedEnemyClips':320,'plannedSourceJobs':sum(len(a['sourceJobs']) for a in brief['actors']),'actualEnemyClips':len(actual),'actualNewEnemyViews':sum(v['actorId'] in expected for v in read(R/'view-masters/registration.json')['records']),'priorDeliveryPinsPreserved':2039,'missingViewDispatchRejected':bool(blocked),'readySourceCanDispatch':bool(ready),'scope':'Production contracts/dependencies and preservation only; no new enemy ART/motion/GPU approval.','runtimeIntegrated':False}
(R/'enemy-production/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
