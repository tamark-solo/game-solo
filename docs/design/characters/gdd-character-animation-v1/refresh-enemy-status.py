"""Refresh factual coverage and failed-request evidence without dispatching work."""
from pathlib import Path
import json

R=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
def write(p,d):
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

manifest=read(R/'manifest.json');ledger=read(R/'generation.json')
plan=read(R/'enemy-production/plan.json');progress=read(R/'progress.json')
jobs={j['id']:j for j in ledger['jobs']};present={(c['actorId'],c['direction'],c['action']) for c in manifest['clips']}
directions=read(R/'production-plan.json')['directions'];blockers=[];roster=[]
for actor in plan['actors']:
 clips=[c for c in manifest['clips'] if c['actorId']==actor['actorId']]
 missing=[{'direction':d,'action':a['id']} for d in directions for a in actor['actions'] if (actor['actorId'],d,a['id']) not in present]
 roster.append({'actorId':actor['actorId'],'name':actor['name'],'bodyClips':len(clips),'bodyKeys':sum(len(c['frames']) for c in clips),'targetBodyClips':actor['targetBodyClips'],'missingClips':missing})
 for id in actor['sourceJobs']:
  j=jobs[id];folder=R/'enemy-production/api-sources'/id;result=folder/'generation-result.json'
  if not result.exists() or read(result).get('status')!='failed-no-retry':continue
  if all((j['actorId'],j['direction'],a) in present for a in j['actions']):continue
  attempts=[{'attempt':'initial','result':result.relative_to(R).as_posix()}]
  for retry in sorted(folder.glob('retry-*/generation-result.json')):
   attempts.append({'attempt':retry.parent.name,'result':retry.relative_to(R).as_posix()})
  blockers.append({'jobId':id,'actorId':j['actorId'],'direction':j['direction'],'actions':j['actions'],'reason':'HTTP200 invalid JSON; no image returned','attempts':attempts,'additionalPostsUsed':len(attempts)-1,'imageSaved':False,'feeKnown':False,'noFurtherPostAuthorized':True,'ownerRetryApprovalPending':True,'prompt':j['prompt'],'request':(folder/'request.json').relative_to(R).as_posix()})

enemy_count=sum(a['bodyClips'] for a in roster);enemy_keys=sum(a['bodyKeys'] for a in roster)
view_count=len(read(R/'view-masters/registration.json')['records'])
progress.update(status='enemy-motion-awaiting-explicit-retry' if blockers else 'enemy-motion-technical-candidate',activeWave='boss-stage2',enemyBodyClips=enemy_count,enemyBodyKeys=enemy_keys,enemyCoverage=roster,realViewMasters=view_count,enemyViewMasters=48,sourceBlockers=blockers,productionBlocker={'reason':'explicit-owner-retry-required','failedSources':len(blockers),'automaticRetry':False} if blockers else None,progressStatusText=f'Quái/Boss {enemy_count}/320 clip · {enemy_keys} key · {len(blockers)} nguồn API thiếu',latestTechnicalStatus=f'{len(manifest["clips"])} clips/{manifest["coverage"]["bodyKeys"]} keys; coverage factual, see current CPU/browser reports and per-actor checkpoints. No ART/motion/runtime approval.',correctiveSourceJobs=sum(bool(j.get('corrective')) for j in ledger['jobs']),targetSourcesIsHistorical=True,sourcePolicy='Real own views; one scale/source. Spacious 4x4 sheets for single actions plus role-specific grouped sources; rejected raw retained. No automatic POST retry.')
plan.update(actualEnemyBodyClips=enemy_count,actualEnemyBodyKeys=enemy_keys,targetSourceJobs=sum(len(a['sourceJobs']) for a in plan['actors']),activeSourceJobs=sum(len(a['sourceJobs']) for a in plan['actors']),generationBlockedBy={'reason':'explicit-owner-retry-required','jobIds':[b['jobId'] for b in blockers]} if blockers else None,currentNextJobs=[b['jobId'] for b in blockers])
write(R/'progress.json',progress);write(R/'enemy-production/plan.json',plan)
write(R/'enemy-production/coverage.json',{'status':'incomplete-candidate' if enemy_count<320 else 'complete-candidate','bodyClips':enemy_count,'bodyKeys':enemy_keys,'targetBodyClips':320,'actors':roster,'sourceBlockers':blockers,'artApproved':False,'motionApproved':False,'runtimeIntegrated':False})
print(json.dumps({'enemyClips':enemy_count,'enemyKeys':enemy_keys,'blockedSources':len(blockers),'actualViews':48,'postsSent':0}))
