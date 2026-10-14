from pathlib import Path
import json,hashlib,shutil,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main(direction):
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));geo=json.loads((ROOT/'source-geometry.json').read_text(encoding='utf-8'));review=json.loads((ROOT/'review-state.json').read_text(encoding='utf-8'))
 assert gen['generationAllowed'],'Root generation gate remains closed'
 s=next(s for s in geo['sources'] if s['direction']==direction and s['group']=='core' and s['selected']);assert s['sourceViewed'] and s['calibrationRootsReviewed'] and review[s['id']]['sourceCompletenessReviewed'],'Review true view/head/boots and six-neutral scale before using a neutral PRIMARY'
 primary=V2/s['neutralNearest8x'];assert sha(primary)==s['neutralNearest8xSha256'];core=next(r for r in gen['records'] if r['id']==s['id']);wang=next(q for q in core['inputs'] if 'Wang' in q['role']);outfit=next(q for q in core['inputs'] if 'P1-full-source' in q['role'])
 for r in gen['records']:
  if r['direction']!=direction or r['group']=='core' or r.get('sha256'):continue
  inputs=[]
  for i,(p,role) in enumerate([(primary,'own-A-banner-same-view-neutral-primary'),(V2/wang['file'],'Wang-same-view-style-anatomy-only'),(V2/outfit['file'],'own-A-banner-P1-full-source-outfit-support')]):
   q=ROOT/'inputs'/'foundation'/r['id']/(str(i+1)+'.png');q.parent.mkdir(parents=True,exist_ok=True)
   if q.exists():assert sha(q)==sha(p),'Never replace an input snapshot'
   else:shutil.copy2(p,q)
   inputs.append({'file':str(q.relative_to(V2)).replace('\\','/'),'sha256':sha(q),'original':str(p.resolve()),'role':role,'basisSourceId':s['id'],'basisSourceSha256':s['sha256']})
  r['inputs']=inputs;r['inputSnapshotsReady']=True;r['dependency']=None;r['status']='prepared-inputs-awaiting-call';r['neutralBasisReviewed']=True
 (ROOT/'generation.json').write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(direction,'damage/practice snapshots ready; view all three inputs before calls')
if __name__=='__main__':main(sys.argv[1])
