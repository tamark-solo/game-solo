"""Append an explicit visual action correction, never retry a failed POST."""
from pathlib import Path
import copy,hashlib,json,sys,re
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old_id,assessment,instruction=sys.argv[1:4];ledger=read(R/'generation.json');old=next(j for j in ledger['jobs'] if j['id']==old_id)
seed=sys.argv[4:]==['--wide-planned'];wide=sys.argv[4:] in [['--wide'],['--wide-planned']];assert not sys.argv[4:] or wide
if seed:
 assert old['status']=='planned' and not old.get('supersededPlanned')
 assert not (R/'enemy-production/api-sources'/old_id/'dispatch-receipt.json').exists(),'Never supersede an in-flight or failed POST as an unexecuted recipe'
else:assert old['status']!='planned' and sha(R/old['source'])==old['sourceSha256'],'A visual correction requires an actual inspected source, not a failed request'
id=old_id+('-framing-r3' if wide else '-gesture-r3');assert not any(j['id']==id for j in ledger['jobs'])
prompt=(R/old['prompt']).read_text(encoding='utf-8')
if wide:
 from enemy_profiles import sequence
 assert len(old['actions'])==1
 action=old['actions'][0];steps=sequence(old['actorId'],action,'LEFT' if old['direction'] in ['west','northwest','southwest'] else 'RIGHT')
 steps+=['next left boot contact into the same gait cycle','next right knee passing, same camera'] if action=='move' else ['same settled final posture','same settled final posture']
 layout='Exactly FOUR COLUMNS x FOUR ROWS, SIXTEEN complete isolated figures on2048x1536. Each has spacious512x384 area; generous80px outer margins and80px clear gutters on ALL edges. Never enlarge a figure to fill a cell. ROWS1+2: eight identical own standing neutral calibration figures. ROWS3+4: eight ordered '+action+' figures: '+' / '.join(steps)+'.'
 prompt,count=re.subn(r'Exactly .*?(?=\nONE scale)',layout,prompt,flags=re.S);assert count==1
prompt+='\nEXPLICIT ACTION CORRECTION AFTER SOURCE REVIEW: '+instruction+'\n'
pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8');new=copy.deepcopy(old)
for k in ['original','originalSha256','sourceSha256','sourceSize','sourceViewed','sourcePackingAllowed','sourceAssessment','excludedActions','apiMetadata','apiRequest','poseSelections','sourceRowFailures','selectionHistory','history']:new.pop(k,None)
new.update(id=id,prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),source=f'sources/{id}.png',status='planned',corrective=not seed,correctionReason=assessment)
new['unexecutedFramingPreparationOf' if seed else 'visualCorrectionOf']=old_id
if wide:new.update(grid=[4,4],calibrationPoses=8,activeActionIndexes=list(range(6)),requestedSourceSize='2048x1536')
if seed:old['supersededPlanned']=True
else:old.update(sourceViewed=True,sourcePackingAllowed=False,sourceAssessment=assessment,excludedActions=list(old['actions']))
ledger['jobs'].append(new);write(R/'generation.json',ledger);brief=read(R/'enemy-production/plan.json');a=next(a for a in brief['actors'] if a['actorId']==old['actorId']);a['sourceJobs']=[id if v==old_id else v for v in a['sourceJobs']];write(R/'enemy-production/plan.json',brief)
print(json.dumps({'newJob':id,'priorRawPreserved':True,'paidRequestSent':False}))
