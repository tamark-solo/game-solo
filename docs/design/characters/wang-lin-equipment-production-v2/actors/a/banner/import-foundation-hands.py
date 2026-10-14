from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2];folder=V2/'support/banner-a-foundation-hands-manual';inp=folder/'manual.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'));manual=json.loads((ROOT/'manual.json').read_text(encoding='utf-8'));data=json.loads(inp.read_text(encoding='utf-8'));count=0
for q in data['frames']:
 c=next(c for c in reg['clips'] if c['id']==q['clipId']);f=next(f for f in c['frames'] if f['sourceRect']==q['sourceRect']);assert sha(V2/f['source'])==q['sourceSha256'];assert f['sourceId']==q['sourceId'];assert f['sourceScale']==q['sourceScale'];assert q['manualSourceViewed'] and q['sourcePalmReviewed'];assert q['heldGripClaim']==(c['action']=='hit');key=c['id']+':'+str(f['index']+1)
 manual[key]=q|{'sourceManual':q['sourcePalm'],'palmEstimated':q['sourcePalmEstimated'],'dominantGripClosed':q['heldGripClaim'],'angleDeg':0,'angleMeasurement':'Projected source palm/cuff only; sourceCuff estimate flags and uncertainty preserved, no exact rig angle.','selection':'manually-observed-source-palm-from-immutable-support-delivery','manualEvidence':str((folder/q['evidence']).relative_to(V2)).replace('\\','/'),'supportManualFile':str(inp.relative_to(V2)).replace('\\','/'),'supportManualSha256':sha(inp),'approved':False}
 count+=1
(ROOT/'manual.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Imported96 helper source hands only; native will recompute after semantic roots.')
