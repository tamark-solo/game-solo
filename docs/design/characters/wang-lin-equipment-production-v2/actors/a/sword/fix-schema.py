from pathlib import Path
import json,hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'))
pngPins={f['file']:sha((V2/f['file']).resolve()) for c in reg['clips'] for f in c['frames']}
pngPins.update({c['atlas']:sha((V2/c['atlas']).resolve()) for c in reg['clips']})
for c in reg['clips']:
 if not c.get('reusedFrom'):c['durationMs']=sum(f['durationMs'] for f in c['frames'])
 assert c['durationMs']==sum(f['durationMs'] for f in c['frames'])
 assert all(k in c for k in ['sourceScale','canvas','pivot','loop','atlasSha256'])
(ROOT/'registration.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
subprocess.run([sys.executable,str(ROOT/'verify.py')],check=True)
for file,h in pngPins.items():assert sha((V2/file).resolve())==h,file+' PNG changed'
handoff=json.loads((ROOT/'handoff.json').read_text(encoding='utf-8'))
handoff['registrationSha256']=sha(ROOT/'registration.json');handoff['verificationSha256']=sha(ROOT/'verification.json')
handoff['metadataCorrection']='Clip durationMs added as exact sum of existing frame holds; no PNG/raw/atlas bytes or timing changed.'
(ROOT/'handoff.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('stable',handoff['registrationSha256'],'all',len(pngPins),'PNG pins unchanged')
