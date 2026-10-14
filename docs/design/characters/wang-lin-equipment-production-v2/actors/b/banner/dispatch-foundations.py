from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parent;V=R.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));jobs=[]
dirs=sys.argv[1].split(',');owner=sys.argv[2];filename=sys.argv[3]
for r in g['records']:
 if r['group']=='core' or r['direction'] not in dirs:continue
 assert not r.get('sha256') and r['inputSnapshotsReady'],'Real same-view inputs required; no generated source may be re-dispatched'
 assert not r.get('reservedBy') or r['reservedBy']==owner,'Do not duplicate another owner call'
 assert sha(V/r['prompt'])==r['promptSha256']
 for p in r['inputs']:assert sha(V/p['file'])==p['sha256']
 evidence='review/neutral-foundation-lineup-8views-2x.png' if (R/'review/neutral-foundation-lineup-8views-2x.png').exists() else 'review/neutral-foundation-lineup-2x.png'
 r.update(neutralReviewed=True,neutralReviewEvidence='actors/b/banner/'+evidence,neutralReviewEvidenceSha256=sha(R/evidence),reservedBy=owner,status='reserved-ready-built-in-call')
 jobs.append({**r,'promptAbsolute':str(V/r['prompt']),'rawAbsolute':str(V/r['raw']),'inputAbsolute':[str(V/p['file']) for p in r['inputs']]})
p=R/filename;assert not p.exists(),'Do not replace immutable dispatch'
p.write_text(json.dumps({'schema':'banner-foundation-dispatch-v1','owner':owner,'root':str(V),'actorRoot':str(R),'jobs':jobs,'onlyRawAndProvenance':True,'ownerApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'generation.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'path':str(p),'sha256':sha(p),'jobs':len(jobs)}))
