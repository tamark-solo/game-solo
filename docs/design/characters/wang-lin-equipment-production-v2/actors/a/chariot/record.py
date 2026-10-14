from pathlib import Path
from PIL import Image
import json,hashlib,sys,shutil
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run(sid,original):
 file=ROOT/'generation.json';data=json.loads(file.read_text(encoding='utf-8'))
 gate=V2/'checkpoints/banner.json'
 if data.get('generationAllowed') and (not gate.exists() or sha(gate)!=data.get('releasedGate',{}).get('sha256')):raise RuntimeError('Exact Banner checkpoint must be pinned before Chariot generation')
 if not data['generationAllowed']:raise RuntimeError('Sword128 technical gate has not been explicitly released by root')
 if (ROOT/'approval.json').exists() or (V2/'approval.json').exists():raise RuntimeError('Approved package is write-locked')
 if (V2/'checkpoints/chariot.json').exists():raise RuntimeError('Chariot technical checkpoint locks source/body/metadata; use a new revision package')
 record=next(r for r in data['records'] if r['id']==sid)
 if not record['inputSnapshotsReady']:raise RuntimeError('Own same-view input snapshots are not ready')
 if sha(V2/record['prompt'])!=record['promptSha256']:raise RuntimeError('Immutable prompt hash changed')
 for item in record['inputs']:
  if sha(V2/item['file'])!=item['sha256']:raise RuntimeError('Immutable input hash changed')
 target=V2/record['raw']
 if target.exists():raise RuntimeError('Original raw cannot be replaced; preserve it and add explicit sibling correction source')
 shutil.copy2(original,target);im=Image.open(target)
 record.update({'original':str(Path(original).resolve()),'sha256':sha(target),'size':list(im.size),'mode':im.mode,'status':'generated','selected':True,'sourceViewed':True,'rawImmutable':True})
 data['actualCoverage']['generatedSources']=sum(r['status']=='generated' for r in data['records'])
 tmp=file.with_suffix('.json.next');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(file)
 print(json.dumps({'id':sid,'size':list(im.size),'sha256':record['sha256']}))
if __name__=='__main__':run(sys.argv[1],sys.argv[2])

