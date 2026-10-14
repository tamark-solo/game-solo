from pathlib import Path
from PIL import Image
import json,hashlib,shutil
root=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
records=[]
for request in sorted((root/'sources').glob('*.request.json')):
 r=json.loads(request.read_text(encoding='utf-8'));out=root/r['raw']
 if not out.exists():shutil.copyfile(r['original'],out)
 r['sha256']=sha(out);r['originalSha256']=sha(r['original']);assert r['sha256']==r['originalSha256']
 r['promptSha256']=sha(root/r['prompt']);r['sourceSize']=list(Image.open(out).size)
 r['tool']='built-in-imagegen';r['transparentRequested']=True;r['outputProvenance']={'originalToolOutput':r['original'],'workspaceRaw':str(out.resolve()),'copiedOriginalUnchanged':True}
 r['inputs']=[{'file':p,'sha256':sha(p),'role':role} for p,role in zip(r['inputs'],r.get('inputRoles',('own-approved-identity-outfit-primary','own-approved-back-reference','Wang-same-view-style-anatomy-only')))]
 records.append(r)
p=root/'generation.json';temp=p.with_name(p.name+'.next');temp.write_text(json.dumps({'schema':'huyen-tam-sword-generation-v2','tool':'built-in-imagegen','transparentRequested':True,'identityId':'a','familyId':'sword','date':'2026-10-14','records':records,'plannedSources':14,'actualGeneratedSources':len(records),'plannedNewClips':56,'reuseV1Clips':8,'ownerApproved':False,'motionApproved':False,'runtimeReady':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(p)
print(json.dumps({'savedSources':len(records),'sourceSizes':[r['sourceSize'] for r in records]}))

