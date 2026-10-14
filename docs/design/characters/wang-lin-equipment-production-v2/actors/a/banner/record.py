from pathlib import Path
from PIL import Image
import json,hashlib,shutil,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);t=p.with_suffix(p.suffix+'.next');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');t.replace(p)
def run(sid,original,viewed=False):
 data=read(ROOT/'generation.json')
 if not data['generationAllowed']:raise RuntimeError('Root has not released the Sword128 technical gate; no source can be recorded as generated.')
 if (ROOT/'approval.json').exists():raise RuntimeError('This approved body package is locked.')
 r=next(r for r in data['records'] if r['id']==sid)
 assert r['inputSnapshotsReady'] and len(r['inputs'])>=2
 assert sha(V2/r['prompt'])==r['promptSha256'],'Prompt snapshot changed after planning'
 for q in r['inputs']:assert sha(V2/q['file'])==q['sha256'],'Input snapshot changed'
 original=Path(original).resolve();target=V2/r['raw'];target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():
  assert sha(target)==sha(original),'Never replace a raw; register a sibling correction id and preserve history.'
 else:shutil.copy2(original,target)
 im=Image.open(target);receipt=r|{'original':str(original),'originalSha256':sha(original),'sha256':sha(target),'sourceSize':list(im.size),'mode':im.mode,'tool':'built-in-imagegen','transparentRequested':True,'outputProvenance':{'originalToolOutput':str(original),'workspaceRaw':str(target.resolve()),'copiedOriginalUnchanged':True},'status':'generated-awaiting-source-review','selected':False,'sourceViewed':viewed,'rawImmutable':True}
 write(ROOT/'sources'/(sid+'.receipt.json'),receipt)
 # Receipts are independent per call. Merge them only after each record invocation completes.
 records={r['id']:r for r in data['records']}
 for p in sorted((ROOT/'sources').glob('*.receipt.json')):
  item=read(p);previous=records.get(item['id'],{})
  if previous.get('sha256')==item['sha256']:
   for key in ('selected','selectedActions','status','sourceViewed','actualGrid','actionIndices','sourceReview','sourceCompletenessReviewed'):
    if key in previous:item[key]=previous[key]
  records[item['id']]=item
 data['records']=list(records.values());data['actualCoverage']['generatedSources']=sum('sha256' in r for r in data['records']);data['actualCoverage']['selectedSources']=sum(r.get('selected',False) for r in data['records']);write(ROOT/'generation.json',data)
 print(json.dumps({'id':sid,'size':list(im.size),'sha256':receipt['sha256'],'selected':False,'sourceViewed':viewed}))
if __name__=='__main__':run(sys.argv[1],sys.argv[2],'--viewed' in sys.argv)
