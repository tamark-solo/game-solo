from pathlib import Path
from PIL import Image
import json,hashlib,sys,shutil
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run(id,original):
 file=ROOT/'generation.json';data=json.loads(file.read_text(encoding='utf-8'))
 record=next(r for r in data['records'] if r['id']==id)
 target=ROOT/'sources'/f'{id}.png'
 if target.exists():raise RuntimeError('Source exists; use explicit sibling r2 record, never overwrite raw')
 shutil.copyfile(original,target)
 im=Image.open(target)
 record.update({'original':str(Path(original).resolve()),'sha256':sha(target),'size':list(im.size),'mode':im.mode,'status':'generated','selected':True,'sourceViewed':True,'rawImmutable':True})
 tmp=file.with_suffix('.json.next');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(file)
 print(json.dumps({'id':id,'size':im.size,'sha256':record['sha256']}))
if __name__=='__main__':run(sys.argv[1],sys.argv[2])
