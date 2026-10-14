from pathlib import Path
from PIL import Image
import json,hashlib,shutil,argparse
SUPPORT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ap=argparse.ArgumentParser();ap.add_argument('job');args=ap.parse_args()
recordPath=SUPPORT/'records'/f'{args.job}.json'
record=json.loads(recordPath.read_text(encoding='utf-8'))
assert record['original'] is None,'Source already preserved'
metaPath=SUPPORT/'tool'/f'{args.job}.json';meta=json.loads(metaPath.read_text(encoding='utf-8'))
original=Path(meta['returnedOriginalPath']).resolve()
assert original.is_file() and 'generated_images' in original.parts
target=Path(record['raw']);assert target.is_relative_to(SUPPORT) and not target.exists()
target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,target);assert sha(original)==sha(target)
im=Image.open(target);a=im.convert('RGBA').getchannel('A');w,h=im.size
edge128=sum(a.getpixel((x,y))>=128 for x,y in [(x,y) for x in range(w) for y in (0,h-1)]+[(x,y) for y in range(1,h-1) for x in (0,w-1)])
record.update({'original':str(original),'sha256':sha(target),'originalSha256':sha(original),'actualDimensions':list(im.size),
 'actualMode':im.mode,'tool':'built-in-imagegen','transparentRequested':True,'toolMetadata':str(metaPath),'toolMetadataSha256':sha(metaPath),
 'sourceViewed':False,'rawImmutable':True,'outerPhysical128':edge128,'status':'generated-awaiting-actor-manual-review','selected':False})
recordPath.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'id':record['id'],'raw':record['raw'],'sha256':record['sha256'],'size':record['actualDimensions'],'edge128':edge128}))
