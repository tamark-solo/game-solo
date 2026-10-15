from pathlib import Path
from PIL import Image
import json,hashlib,sys,shutil
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(actor,original,revision='r1'):
 assert not (ROOT/'approval.json').exists(),'Approved neutral sources are read-only; use a new version'
 p=ROOT/'generation.json';d=json.loads(p.read_text(encoding='utf-8'));r=next(r for r in d['records'] if r['id']==actor)
 assert r['status'] in ('planned','corrective-planned'),'record already generated'
 assert sha(ROOT/r['prompt'])==r['promptSha256'],'prompt changed'
 for x in r['inputs']:assert sha(ROOT/x['file'])==x['sha256'],'input changed'
 src=Path(original).resolve();dst=ROOT/r['raw'];assert not dst.exists(),'no raw overwrite'
 with Image.open(src) as im:assert im.mode=='RGBA';size=list(im.size)
 dst.parent.mkdir(exist_ok=True);shutil.copyfile(src,dst)
 r.update(status='generated',original=str(src),originalSha256=sha(src),sha256=sha(dst),size=size,revision=revision,sourceViewed=True,sourceAssessmentPending=True)
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'id':actor,'revision':revision,'size':size,'sha256':r['sha256']}))
if __name__=='__main__':run(*sys.argv[1:])
