"""Record explicit model source review, separate from ART/motion approval."""
from pathlib import Path
import argparse,json,hashlib
from reviewed_layout import wide_layout_matches
R=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--assessment',required=True);p.add_argument('--exclude',action='append',default=[]);p.add_argument('ids',nargs='+');args=p.parse_args()
ledger=json.loads((R/'generation.json').read_text(encoding='utf-8'))
for id in args.ids:
 j=next(j for j in ledger['jobs'] if j['id']==id);report=json.loads((R/'review'/f'{id}-inspection.json').read_text(encoding='utf-8'));assert report['sha256']==j['sourceSha256'];assert not report['sourceEdgeRegions'],'A clipped source needs a scoped correction, not acceptance'
 excluded=[value.split(':',1)[1] for value in args.exclude if value.split(':',1)[0]==id]
 measured_layout=False
 if j.get('sourceLayoutWitness'):
  witness=j['sourceLayoutWitness'];assert witness['sourceSha256']==report['sha256']
  measured_layout=wide_layout_matches(j,[[{'box':b} for b in row] for row in witness['regionBounds']])
  assert report['observedRows']==witness['rowCounts']
 assert len(report['observedRows'])==report['expectedGrid'][1]
 for n,count in enumerate(report['observedRows']):
  cal=2 if j.get('calibrationPoses')==8 else 1
  if n<cal:assert count==report['expectedGrid'][0],'Incomplete calibration'
  elif count!=report['expectedGrid'][0]:assert measured_layout or j['actions'][0 if cal==2 else n-cal] in excluded,'Explicitly exclude incomplete action row'
 j.update(sourceViewed=True,sourcePackingAllowed=True,sourceAssessment=args.assessment)
 for action in excluded:
  j.setdefault('excludedActions',[])
  if action not in j['excludedActions']:j['excludedActions'].append(action)
 report['sourceViewed']=True;report['sourceAssessment']=args.assessment;report['excludedActions']=j.get('excludedActions',[])
 (R/'review'/f'{id}-inspection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'generation.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'reviewed':args.ids,'ownerApprovalInferred':False}))
