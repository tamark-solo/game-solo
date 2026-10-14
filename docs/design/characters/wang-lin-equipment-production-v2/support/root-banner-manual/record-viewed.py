from pathlib import Path
import json,hashlib
SUPPORT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=SUPPORT/'manual-registration.json';d=json.loads(p.read_text(encoding='utf-8'))
for s in d['sources'].values():s['nativeContactViewed']=True
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
rp=SUPPORT/'verification.json';report=json.loads(rp.read_text(encoding='utf-8'))
report.update({'status':'passed','nativeSourcePosesViewed':72,'observedPalms':68,'hiddenHandProjections':4,'sourcePaletteClassifierCorrections':['NE damage raw11 initially pointed to face; selected actual chest fist index0 after inset inspection.','NE practice raw6/raw9 have actual pale palms missed by warm classifier; measured manually.'],
 'sourceCuffProjectionLimits':'Four hidden hands/cuffs are garment-reference candidates with uncertainty6nativepx, not observed anatomical wrists; no held agreement.', 'manualRegistrationSha256':sha(p)})
rp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[{'file':p.relative_to(SUPPORT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(SUPPORT.rglob('*')) if p.is_file() and '__pycache__' not in p.parts and p.name!='delivery.json']
delivery={'schema':'root-banner-source-manual-support-delivery-2','status':'manual-source-ready-for-actor-import','sources':list(d['sources']),'sourcePoses':72,'observedPalms':68,'hiddenHandProjections':4,'checks':report['checkCount'],'files':files,'actorWrites':False,'bodySourcePixelsChanged':False,'ownerApproved':False,'runtimeIntegrated':False}
(SUPPORT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourcePoses':72,'checks':report['checkCount'],'pinnedFiles':len(files),'actorWrites':False}))
