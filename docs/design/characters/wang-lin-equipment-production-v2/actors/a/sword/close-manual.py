from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
manual=read(ROOT/'manual.json');reg=read(ROOT/'registration.json');baselines=read(ROOT/'wrist-baselines.json')
for b in baselines.values():b['sourceCuffReviewed']=True;b['sourcePalmReviewed']=True;b['sourceCuffProofReviewed']='Actual original raw bracer/palm pixel observed in four-view neutral crop, green palm/orange charcoal cuff.'
newkeys={c['id']+':'+str(i+1) for c in reg['clips'] if 'reusedFrom' not in c for i,f in enumerate(c['frames'])}
for key in newkeys:
 m=manual[key];m['sourcePalmReviewed']=True;m['manualReviewCompleted']=True
 if m.get('importedFrom','').startswith('support/b-assist-a/'):
  for field in ('proof','sourcePalmProof','sourceCuffProof'):
   if isinstance(m.get(field),str) and m[field].startswith('review/'):m[field]='support/b-assist-a/'+m[field]
  if isinstance(m.get('angleNeutralBasis',{}).get('proof'),str) and m['angleNeutralBasis']['proof'].startswith('review/'):m['angleNeutralBasis']['proof']='support/b-assist-a/'+m['angleNeutralBasis']['proof']
 if key in ['sword-a-southeast-hit:3','sword-a-southeast-hit:4','sword-a-south-hit:3','sword-a-south-hit:4','sword-a-south-hit:5','sword-a-southwest-hit:4']:
  m['handShape']='open-or-ground-support-palm';m['attachmentPolicy']='detach-hover'
 m['manualEvidence']='actors/a/sword/contact/'+key.rsplit(':',1)[0]+'-manual-source-native.png'
 m['manualEvidenceSha256']=sha(V2/m['manualEvidence'])
 m['review']='Original raw palm/hidden endpoint and canonical body reviewed; green point avoids cloth/belt/face; visibility and attachment policy describe actual source, not inferred skin classification.'
 if m.get('sourceCuff'):
  m['sourceCuffReviewed']=True
  if m.get('angleNeutralBasis'):m['angleNeutralBasis']['sourceCuffReviewed']=True
  m['cuffReview']='Orange point reviewed on actual charcoal wrist bracer in original raw. Short/foreshortened vectors have reported angle uncertainty; this remains a presentation candidate.'
roots=read(ROOT/'root-overrides.json')
for key,m in roots.items():
 m['manualReviewPending']=False
 if '-run:' in key:m['semantic']='run-pelvis-ground-with-foot-lift';m['sourceRoot']=m['root'];m['sourcePointFinal']=True
for name,data in [('manual.json',manual),('wrist-baselines.json',baselines),('root-overrides.json',roots)]:
 (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('manual confirmed',len(newkeys),'measured source cuffs',sum(bool(manual[k].get('sourceCuff')) for k in newkeys))
