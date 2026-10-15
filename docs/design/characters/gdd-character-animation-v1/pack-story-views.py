"""Register actual story neutral views for review; never count them as motion."""
from pathlib import Path
from PIL import Image
import hashlib,json,statistics
from source_tools import components,isolated_pose,isolated_soft_pose
R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
actors={'li-muwan-alchemist','situ-nan-spirit','li-muwan-lifespan','situ-nan-restored'}
reg=read(R/'view-masters/registration.json');records=[v for v in reg['records'] if v['actorId'] in actors];assert len(records)==32
generation=read(R/'view-masters/generation.json');checks=0
atlas=Image.new('RGBA',(8*100,4*116));rects=[]
for actor in actors:
 rows=[r for r in records if r['actorId']==actor];assert len(rows)==8 and len({r['direction'] for r in rows})==8
 assert len({r['sourceScale'] for r in rows})==1
checks+=8
for n,v in enumerate(records):
 assert sha(R/v['file'])==v['sha256'] and sha(R/v['raw'])==v['rawSha256'];checks+=2
 job=next(j for j in generation['jobs'] if j['id']==v['boardJob']);assert sha(R/job['prompt'])==job['promptSha256'];checks+=1
 for i in job['inputs']:
  assert sha(R/i['file'])==i['sha256'];checks+=1
  for item in i.get('composedFrom',[]):assert sha(W/item['file'])==item['sha256'];checks+=1
 source=Image.open(R/v['raw']).convert('RGBA');regions=components(source)
 if v.get('alphaPolicy')=='preserved-soft-RGBA':
  candidates=[isolated_soft_pose(source,p,regions) for p in regions if p['large']]
 else:candidates=[isolated_pose(source,p,regions) for p in regions if p['large']]
 pose,box=next((p,b) for p,b in candidates if b==v['sourceRect']);factor=v['sourceScale'];root=v['sourceSupportProposal']['root'];px,py=v['pivot'];size=[max(1,round(pose.width*factor)),max(1,round(pose.height*factor))]
 expected=Image.new('RGBA',tuple(v['canvas']));offset=[round(px-(root[0]-box[0])*factor),round(py-(root[1]-box[1])*factor)];expected.paste(pose.resize(tuple(size),Image.Resampling.NEAREST),tuple(offset));native=Image.open(R/v['file']).convert('RGBA')
 assert expected.tobytes()==native.tobytes(),'Source RGBA reconstruction differs '+v['id'];checks+=1
 alpha=native.getchannel('A');w,h=native.size
 for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]:assert not alpha.crop(b).getbbox();checks+=1
 x=(n%8)*100+2;y=(n//8)*116+2;atlas.paste(native,(x,y));rects.append({'id':v['id'],'rect':[x,y,w,h]})
 v['neutralOnly']=True;v['animationClips']=0
dst=R/'view-masters/story-atlas.png';atlas.save(dst)
reference=read(R.parent/'van-hai-npc-visual-standard-v1/directions.json')
for ref in reference['directions']:assert sha(R.parent/'van-hai-npc-visual-standard-v1'/ref['native'])==ref['nativeSha256'];checks+=1
manifest={'schema':'gdd-story-neutral-views-1','date':'2026-10-15','records':records,'atlas':{'file':dst.relative_to(R).as_posix(),'sha256':sha(dst),'size':list(atlas.size),'gutterPx':2,'rects':rects},'wangReferences':reference['directions'],'coverage':{'actorForms':4,'realNeutralViews':32,'animationClips':0},'ownerArtApprovalInferred':False,'runtimeIntegrated':False,'notes':['Every view drawn in ImageGen; no bitmap mirroring.','East cameras retain slight front bias of live Wang reference.','Future Li temple silver is restrained at native size.','Spirit intrinsic alpha preserved; projected ground is estimated, not boot support.']}
(R/'view-masters/story-views.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for v,rect in zip(records,rects):
 x,y,w,h=rect['rect'];native=Image.open(R/v['file']).convert('RGBA');assert atlas.crop((x,y,x+w,y+h)).tobytes()==native.tobytes();checks+=1
 for edge in [(x-2,y-2,x+w+2,y),(x-2,y+h,x+w+2,y+h+2),(x-2,y-2,x,y+h+2),(x+w,y-2,x+w+2,y+h+2)]:assert not atlas.getchannel('A').crop(edge).getbbox();checks+=1
report={'status':'passed','checks':checks,'coverage':manifest['coverage'],'sourceRgbaReconstruction':True,'oneScalePerEightViewSource':True,'ownerApprovalInferred':False,'runtimeIntegrated':False}
(R/'review/story-view-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
