"""Apply explicit observations; callers serialize all shared-ledger mutations.

Independent `run`-only requests write their own folders and may stay in flight.
Legacy `batch` also records the shared ledger: wait for it before using this tool.
"""
from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=R/'review/enemy-model-assessments.json';review=read(p);ledger=read(R/'generation.json');pending=[r for r in review['records'] if not r.get('applied')]
for row in pending:
 assert not any((R/'enemy-production/api-sources'/row['id']).rglob('*.imagegen.lock')),'A reviewed source itself must have finished generation'
 j=next(j for j in ledger['jobs'] if j['id']==row['id']);assert j['status']!='planned' and row['assessment']
 j.update({k:v for k,v in row.items() if k not in ['id','assessment','applied']})
write(R/'generation.json',ledger)
for row in pending:
 subprocess.run([sys.executable,'-X','utf8',str(R/'review-sources.py'),'--assessment',row['assessment'],row['id']],check=True);row['applied']=True
write(p,review);print(json.dumps({'explicitReviewsApplied':len(pending),'ownerApprovalInferred':False}))
