"""Append spacious one-action recipes, retaining every earlier source or plan."""
from pathlib import Path
import copy,hashlib,json,re,sys
from enemy_profiles import sequence
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old_id,assessment=sys.argv[1:3];planned=sys.argv[3:]==['--planned'];assert not sys.argv[3:] or planned
ledger=read(R/'generation.json');old=next(j for j in ledger['jobs'] if j['id']==old_id);assert assessment and not old.get('supersededPlanned')
if planned:
 assert old['status']=='planned' and not (R/'enemy-production/api-sources'/old_id/'dispatch-receipt.json').exists()
else:assert old['status']!='planned' and sha(R/old['source'])==old['sourceSha256']
ids=[]
for action in old['actions']:
 id=old_id+'-'+action+'-wide-r4';assert not any(j['id']==id for j in ledger['jobs']);ids.append(id)
 side='LEFT' if old['direction'] in ['west','northwest','southwest'] else 'RIGHT';steps=sequence(old['actorId'],action,side)
 steps+=['next left contact, continuing gait','next right knee passes, continuing gait'] if action=='move' else ['same final grounded corpse hold','same final grounded corpse hold'] if action=='death' else ['same compact subdued hold, never rise','same subdued hold, never vanish'] if action=='subdued' else ['own ready rest in same view','own ready rest in same view']
 layout='Exactly FOUR COLUMNS x FOUR ROWS, SIXTEEN complete isolated figures on2048x1536. Each has spacious512x384 area;80px truly transparent outer margins and80px clear gutters between ALL hair/hand/robe/body edges. Never expand figures to fill cells. ROWS1+2: eight identical own standing/floating neutral calibration figures. ROWS3+4: eight ordered '+action+' figures: '+' / '.join(steps)+'.'
 prompt=(R/old['prompt']).read_text(encoding='utf-8');prompt,count=re.subn(r'Exactly .*?(?=\nONE scale)',layout,prompt,flags=re.S);assert count==1
 prompt+='\nSPACIOUS SOURCE: every calibration and action body complete and fully inside image; no hand can touch neighboring hair. Same source-wide scale and requested own camera in all16 figures. Rear N/NE/NW hide face/pupils; front-of-sternum command hands are naturally occluded by torso from rear, never clasp behind the back or show skin on the back belt. Release arm may clear shoulder silhouette. Keep attached wrists and grouped fingers. No mirror, fit, pixel painting or external FX.\n'
 if old['actorId']=='hua-lap-quoc':prompt+='Spectral anatomy: absolutely NO shoes/boots/walking legs in ANY calibration or action figure. Preserve own approved intrinsic soft-alpha ragged hem and96px build; move is floating glide and subdued is contracted complete spirit, never physical kneeling or corpse.\n'
 pp=R/'prompts'/f'{id}.txt';assert not pp.exists();pp.write_text(prompt,encoding='utf-8');j=copy.deepcopy(old)
 for k in ['original','originalSha256','sourceSha256','sourceSize','sourceViewed','sourcePackingAllowed','sourceAssessment','excludedActions','apiMetadata','apiRequest','poseSelections','sourceRowFailures','selectionHistory','history']:j.pop(k,None)
 j.update(id=id,actions=[action],grid=[4,4],calibrationPoses=8,activeActionIndexes=list(range(6)),prompt=pp.relative_to(R).as_posix(),promptSha256=sha(pp),source=f'sources/{id}.png',status='planned',requestedSourceSize='2048x1536',splitSourceOf=old_id,corrective=not planned,correctionReason=assessment)
 j['previewDurationMsByAction']={action:old['previewDurationMsByAction'][action]};j['phaseLabels']={action:old['phaseLabels'][action]};ledger['jobs'].append(j)
if planned:old['supersededPlanned']=True
else:old.update(sourceViewed=True,sourcePackingAllowed=False,sourceAssessment=assessment,excludedActions=list(old['actions']))
write(R/'generation.json',ledger);brief=read(R/'enemy-production/plan.json');a=next(a for a in brief['actors'] if a['actorId']==old['actorId']);a['sourceJobs']=[v for id in a['sourceJobs'] for v in (ids if id==old_id else [id])];brief['activeSourceJobs']=sum(len(x['sourceJobs']) for x in brief['actors']);write(R/'enemy-production/plan.json',brief)
print(json.dumps({'newJobs':ids,'paidRequestsSent':0,'oldSourceOrPlanPreserved':True}))
