"""Pack inspected new-GDD neutral views, separate from all animation counts."""
from pathlib import Path
from PIL import Image
import hashlib,io,json,copy
from source_tools import components,isolated_pose,isolated_soft_pose
from enemy_profiles import IDS
R=Path(__file__).resolve().parent;sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text(encoding='utf-8'))
records=[copy.deepcopy(v) for v in read(R/'view-masters/registration.json')['records'] if v['actorId'] in IDS]
jobs=read(R/'view-masters/generation.json')['jobs'];out=R/'enemy-production/views';out.mkdir(exist_ok=True);checks=0;cached={}
for actor in IDS:
 views=[v for v in records if v['actorId']==actor]
 if not views:continue
 assert len(views)==8 and len({v['direction'] for v in views})==8;checks+=2
 assert len({v['sourceScale'] for v in views})==1;checks+=1
 width=max(v['canvas'][0] for v in views);height=max(v['canvas'][1] for v in views);atlas=Image.new('RGBA',(4*(width+4),2*(height+4)))
 for n,v in enumerate(views):
  assert sha(R/v['file'])==v['sha256'] and sha(R/v['raw'])==v['rawSha256'];checks+=2
  job=next(j for j in jobs if j['id']==v['boardJob']);assert sha(R/job['prompt'])==job['promptSha256'];checks+=1
  for i in job['inputs']:assert sha(R/i['file'])==i['sha256'];checks+=1
  if v['raw'] not in cached:
   raw=Image.open(R/v['raw']).convert('RGBA');cached[v['raw']]=(raw,components(raw))
  raw,regions=cached[v['raw']];isolate=isolated_soft_pose if v.get('alphaPolicy')=='preserved-soft-RGBA' else isolated_pose
  pose,box=next((p,b) for p,b in (isolate(raw,q,regions) for q in regions if q['large']) if b==v['sourceRect'])
  f=v['sourceScale'];root=v['sourceSupportProposal']['root'];size=[round(pose.width*f),round(pose.height*f)];offset=[round(v['pivot'][0]-(root[0]-box[0])*f),round(v['pivot'][1]-(root[1]-box[1])*f)]
  expected=Image.new('RGBA',tuple(v['canvas']));expected.paste(pose.resize(tuple(size),Image.Resampling.NEAREST),tuple(offset));native=Image.open(R/v['file']).convert('RGBA');assert native.tobytes()==expected.tobytes();checks+=1
  w,h=native.size;alpha=native.getchannel('A')
  for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]:assert not alpha.crop(b).getbbox();checks+=1
  x=n%4*(width+4)+2;y=n//4*(height+4)+2;atlas.paste(native,(x,y));v.update(neutralOnly=True,animationClips=0,atlasRect=[x,y,w,h],atlasFile=f'enemy-production/views/{actor}-atlas.png')
 path=out/f'{actor}-atlas.png';buf=io.BytesIO();atlas.save(buf,format='PNG')
 if path.exists():assert path.read_bytes()==buf.getvalue(),'Existing view atlas must stay unchanged'
 else:path.write_bytes(buf.getvalue())
 for v in views:v['atlasSha256']=sha(path)
report={'status':'passed','checks':checks,'neutralViews':len(records),'actors':len({v['actorId'] for v in records}),'animationClips':0,'runtimeIntegrated':False}
(R/'enemy-production/view-masters.json').write_text(json.dumps({'records':records,'coverage':report},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'enemy-production/view-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
