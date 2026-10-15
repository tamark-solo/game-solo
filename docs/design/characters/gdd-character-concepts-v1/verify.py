from pathlib import Path
from PIL import Image
import hashlib,json,sys
R=Path(__file__).resolve().parent;W=R.parents[3]
sys.path.insert(0,str(W/'scripts'))
from archived_asset_basis import read_basis_bytes
def read(n):return json.loads((R/n).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(read_basis_bytes(p)).hexdigest()
checks=[]
def check(n,v):assert v,n;checks.append(n)
b=read('basis.json');m=read('manifest.json');g=read('generation.json')
for x in b['files']:check('baseline '+x['file'],sha(W/x['file'])==x['sha256'])
for r in g['records']:
 for rev in [r]+r.get('history',[]):
  check('source hash '+rev['raw'],sha(R/rev['raw'])==rev['sha256'])
  check('original source '+rev['raw'],sha(Path(rev['original']))==rev['originalSha256']==rev['sha256'])
  check('prompt '+rev['prompt'],sha(R/rev['prompt'])==rev['promptSha256'])
  for x in rev['inputs']:
   check('snapshot '+x['file'],sha(R/x['file'])==x['sha256'])
   op=Path(x['original']);op=op if op.is_absolute() else W/op
   check('input lineage '+x['file'],sha(op)==x['originalSha256'])
  check('source RGBA '+rev['raw'],Image.open(R/rev['raw']).mode=='RGBA')
atlas=Image.open(R/m['atlas']['file']).convert('RGBA');check('atlas hash',sha(R/m['atlas']['file'])==m['atlas']['sha256'])
for r in m['records']:
 im=Image.open(R/r['file']);check('native hash '+r['id'],sha(R/r['file'])==r['nativeSha256']);check('native size '+r['id'],list(im.size)==r['canvas'])
 check('source edge '+r['id'],not any(r['sourceEdges'].values()));check('native edge '+r['id'],not any(r['nativeEdges'].values()))
 check('one factor '+r['id'],r['sourceScale']>0 and r['pixelsResampled'] and not r['pixelsRepainted'])
 check('no motion claim '+r['id'],r['animationClipCount']==0 and not r['ownerApproved'] and not r['runtimeReady'])
 q=next(x['rect'] for x in m['atlas']['rects'] if x['id']==r['id']);x,y,w,h=q;check('atlas exact RGBA '+r['id'],atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes())
 for yy in (y-2,y-1,y+h,y+h+1):check('atlas horizontal gutter '+r['id']+str(yy),not atlas.getchannel('A').crop((x-2,yy,x+w+2,yy+1)).getbbox())
 for xx in (x-2,x-1,x+w,x+w+1):check('atlas vertical gutter '+r['id']+str(xx),not atlas.getchannel('A').crop((xx,y,xx+1,y+h)).getbbox())
 check('root type '+r['id'],r['rootKind'] in ['actual-human-boot-soles','actual-stone-foot-soles','estimated-ground-projection-of-hovering-spirit'])
check('18 distinct new artwork',len(m['records'])==18 and len({r['nativeSha256'] for r in m['records']})==18)
check('candidate flags',m['ownerApproved']==False and m['runtimeIntegrated']==False)
approvalPath=R/'approval.json'
if approvalPath.exists():
 approval=read('approval.json')
 check('explicit neutral approval',approval['neutralArtApproved'] and approval['ownerApproved'])
 check('approval exact 18 identities',set(approval['actorIds'])=={r['id'] for r in m['records']})
 check('approval excludes motion and runtime',not approval['motionApproved'] and not approval['runtimeApproved'])
 for p in approval['targets']:check('approval pin '+p['file'],sha(R/p['file'])==p['sha256'])
report={'schema':'gdd-character-concept-verification-1','date':'2026-10-15','status':'passed','checks':len(checks),'coverage':m['coverage'],'basisPins':len(b['files']),'lineageIncludesSuperseded':True,'historicalBasisResolvedFromVerifiedArchive':True,'neutralOwnerApprovalRecorded':approvalPath.exists(),'ownerApprovalInferred':False,'runtimeIntegrated':False}
(R/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
