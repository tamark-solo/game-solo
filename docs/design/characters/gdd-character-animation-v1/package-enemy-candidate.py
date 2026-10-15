"""Package a factual enemy candidate snapshot; verify every archived byte.

No dispatch, runtime publication, approval, or full-project/map build. PNG raw
copies are archived once at their scoped source paths; API metadata preserves
the hashes of identical provider originals. Rejected source/history is retained.
"""
from pathlib import Path
from zipfile import ZipFile,ZIP_STORED,ZIP_DEFLATED
import hashlib,json,sys

R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

revision=int(sys.argv[1]) if len(sys.argv)>1 else 1
assert revision>=1
coverage=read(R/'enemy-production/coverage.json');manifest=read(R/'manifest.json')
plan=read(R/'enemy-production/plan.json');ledger=read(R/'generation.json')
ids={a['actorId'] for a in plan['actors']};clips=[c for c in manifest['clips'] if c['actorId'] in ids]
assert len(clips)==coverage['bodyClips']
reports=['review/verification.json','enemy-production/verification.json','enemy-production/motion-browser-verification.json','enemy-production/browser-verification.json','enemy-production/view-page-verification.json']
for path in reports:assert read(R/path)['status']=='passed',path
gpu=read(R/'enemy-production/motion-browser-verification.json')
assert gpu['enemyBodyClips']==len(clips) and gpu['enemyBodyKeys']==coverage['bodyKeys']
folder=R/'enemy-production'/f'delivery-{len(clips)}-v{revision}';assert not folder.exists(),'Frozen handoff exists; append a new version rather than overwrite'
folder.mkdir()
source_ids={c['sourceJob'] for c in clips}
write(folder/'manifest.json',{'clips':clips,'sources':[s for s in manifest['sources'] if s['id'] in source_ids],'coverage':coverage,'ownerArtApproved':False,'ownerMotionApproved':False,'runtimeIntegrated':False})
write(folder/'source-jobs.json',{'jobs':[j for j in ledger['jobs'] if j['actorId'] in ids]})
write(folder/'views.json',read(R/'enemy-production/view-masters.json'))
offline=read(R/'review/offline-tests.json');assert offline['status']=='passed' and offline['tests']>=23
write(folder/'offline-tests.json',offline)
(folder/'README.md').write_text(f'''# Quái/Boss GDD · candidate {len(clips)}/320 clip

{coverage['bodyKeys']} key body,48 hướng đứng của6 actor. Đây là snapshot ART/motion candidate để owner xem, chưa ghép runtime. {len(coverage['sourceBlockers'])} nguồn còn thiếu ghi trong manifest/coverage, không có fallback bằng source đã loại.

ZIP dùng đường dẫn tương đối với gói gdd-character-animation-v1. `enemy-production/delivery-{len(clips)}-v{revision}/manifest.json` là manifest chỉ gồm quái/Boss; frame/atlas/source paths tính từ gốc ZIP. Xem playback tại workspace qua `index.html`, gallery qua `enemy-production/views.html`; ZIP là nguồn/bitmap/hồ sơ cho production, không phải bản game hoặc website độc lập.

Mỗi PNG nguồn API có bản byte-identical trong `sources/`; API request/metadata/result giữ hash provider. Không lưu trùng bản PNG dưới api-sources trong ZIP. Các source bị loại, prompt/input, lịch sử sửa và checkpoint giữ để đối chiếu. Main/prior delivery được kiểm bằng pin và không bị xuất thay thế. Không giải nén đè lên gói workspace đã có.

`handoff.json` pin mọi file dữ liệu/evidence trong ZIP trừ chính handoff. `archive-verification.json` bên ngoài ZIP kiểm SHA256 từng member (gồm handoff) sau khi mở lại và hash container; không suy ART approval từ QA.
''',encoding='utf-8')
paths=set()
def add(p):
 p=Path(p)
 if p.is_file():
  relative=p.resolve().relative_to(R.resolve()).as_posix();paths.add(relative)

for actor in coverage['actors']:
 checkpoint=R/'checkpoints/enemy-motion'/f'{actor["actorId"]}-{actor["bodyClips"]}'/'checkpoint.json'
 data=read(checkpoint);assert data['bodyClips']==actor['bodyClips']
 add(checkpoint)
 for pin in data['files']:
  assert sha(R/pin['file'])==pin['sha256'],pin['file'];add(R/pin['file'])
 checkpoint=R/'checkpoints/enemy-views'/actor['actorId']/'checkpoint.json';data=read(checkpoint);add(checkpoint)
 for pin in data['files']:
  assert sha(R/pin['file'])==pin['sha256'],pin['file'];add(R/pin['file'])
for j in ledger['jobs']:
 if j['actorId'] not in ids:continue
 add(R/j['source']);add(R/j['prompt'])
 for i in j['inputs']:add(R/i['file'])
 api=R/'enemy-production/api-sources'/j['id']
 for p in api.rglob('*.json'):add(p)
 for suffix in ['-inspection.json','-source-native2x.png']:add(R/'review'/f'{j["id"]}{suffix}')
for p in (R/'history').glob('*'):
 if p.is_dir() and p.name.startswith(('hua-','dark-','blood-','yin-','sword-')):
  for f in p.rglob('*'):add(f)
for f in [*reports,'review/final-source-safety.json','enemy-production/coverage.json','enemy-production/plan.json','enemy-production/view-masters.json','enemy-production/view-browser-verification.json','README.md','soft_extent.py','test_soft_extent.py','api_source_ops.py','test_api_source_ops.py','reviewed_layout.py','test_reviewed_layout.py','pack.py','inspect-batch.py','review-sources.py','verify.py','source_tools.py']:
 add(R/f)
for p in folder.iterdir():add(p)
pins=[{'file':p,'sha256':sha(R/p),'bytes':(R/p).stat().st_size} for p in sorted(paths)]
write(folder/'handoff.json',{'schema':'gdd-enemy-body-candidate-handoff-1','status':coverage['status'],'bodyClips':len(clips),'bodyKeys':coverage['bodyKeys'],'targetBodyClips':320,'views':48,'actors':coverage['actors'],'sourceBlockers':coverage['sourceBlockers'],'files':pins,'ownerArtApproved':False,'ownerMotionApproved':False,'runtimeIntegrated':False})
add(folder/'handoff.json')
out=W/'output/art'/f'gdd-enemy-body-candidate-{len(clips)}-v{revision}.zip';out.parent.mkdir(parents=True,exist_ok=True);assert not out.exists()
members=[]
with ZipFile(out,'w') as z:
 for i,p in enumerate(sorted(paths)):
  payload=(R/p).read_bytes();z.writestr(p,payload,compress_type=ZIP_STORED if p.endswith('.png') else ZIP_DEFLATED)
  members.append({'file':p,'sha256':hashlib.sha256(payload).hexdigest(),'bytes':len(payload)})
  if i%500==0:print(json.dumps({'archived':i,'total':len(paths)}),flush=True)
with ZipFile(out) as z:
 assert len(z.namelist())==len(members)==len(set(z.namelist()))
 for row in members:
  assert hashlib.sha256(z.read(row['file'])).hexdigest()==row['sha256'],row['file']
  assert sha(R/row['file'])==row['sha256'],'Workspace changed during handoff: '+row['file']
 write(folder/'archive-verification.json',{'status':'passed','archive':str(out.resolve()),'sha256':sha(out),'bytes':out.stat().st_size,'members':len(members),'verifiedEveryMemberAfterReopen':True,'files':members,'artApprovalInferred':False,'runtimeIntegrated':False})
print(json.dumps({'status':'passed','archive':str(out.resolve()),'bytes':out.stat().st_size,'members':len(members),'bodyClips':len(clips),'bodyKeys':coverage['bodyKeys'],'delivery':str(folder.resolve())}),flush=True)
