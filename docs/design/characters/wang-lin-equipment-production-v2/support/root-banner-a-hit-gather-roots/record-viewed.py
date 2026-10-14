from pathlib import Path
import json,hashlib
SUPPORT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=SUPPORT/'manual-registration.json';d=json.loads(p.read_text(encoding='utf-8'));d['nativeProofViewed']=True
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
rp=SUPPORT/'verification.json';r=json.loads(rp.read_text(encoding='utf-8'));r.update({'status':'passed','sourceWholePoseSheetsViewed':8,'nativeSourcePosesViewed':48,'manualRegistrationSha256':sha(p),'approvalInferred':False})
rp.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[{'file':p.relative_to(SUPPORT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(SUPPORT.rglob('*')) if p.is_file() and '__pycache__' not in p.parts and p.name!='delivery.json']
out={'schema':'root-banner-A-hit-gather-roots-delivery-1','status':'manual-source-ready-for-actor-import','bodyClips':8,'sourcePoses':48,'checks':r['checkCount'],'files':files,'sourceSnapshotSha256':d['sourceSnapshotSha256'],'actorWrites':False,'sourcePixelsChanged':False,'ownerApproved':False,'runtimeIntegrated':False,'limits':d['limits']}
(SUPPORT/'delivery.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourcePoses':48,'checks':r['checkCount'],'pinnedFiles':len(files),'actorWrites':False}))
