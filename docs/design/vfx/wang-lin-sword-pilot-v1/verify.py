"""Independent PNG/hash/source-boundary and atlas verification; writes only this new package."""
from PIL import Image
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent
def read(name): return json.loads((ROOT/name).read_text(encoding='utf8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,condition):
 if not condition: raise AssertionError(name)
 checks.append({'name':name,'pass':True})
manifest=read('manifest.json'); generation=read('generation.json'); reg=read('registration.json'); assessment=read('review/source-assessment.json')
check('Candidate production ART, runtime disabled',manifest['artApproved'] is False and manifest['runtimeIntegrated'] is False)
check('10 sequences and 60 real keys',len(manifest['sequences'])==10 and sum(len(s['frames']) for s in manifest['sequences'])==60)
check('Five ST and five AOE phase sequences',sum(s['mode']=='st' for s in manifest['sequences'])==5 and sum(s['mode']=='aoe' for s in manifest['sequences'])==5)
check('Shared two identity palette kit',manifest['sharedIdentities']==['huyen-tam','tich-bach'])
check('10 selected, two superseded source records',sum(s['selected'] for s in generation['sources'])==10 and sum(not s['selected'] for s in generation['sources'])==2)
for record in generation['sources']:
 check('Raw hash '+record['file'],sha(ROOT/record['file'])==record['sha256'])
 check('Prompt hash '+record['prompt'],sha(ROOT/record['prompt'])==record['promptSha256'])
 for i in record['inputs']: check('Input hash '+i['file']+' for '+record['file'],sha(ROOT/i['file'])==i['sha256'])
atlas_bytes=0;frame_bytes=0;native_hashes=set()
for s in manifest['sequences']:
 id=s['id']; registration=next(r for r in reg['sequences'] if r['id']==id); ass=next(a for a in assessment['sequences'] if a['id']==id)
 check(id+' raw physical margins',not any(ass['sourcePhysicalEdge16']))
 check(id+' true source keys',ass['trueFrameHashes']==6)
 check(id+' uniform scale X/Y',abs(registration['actualScale'][0]-registration['actualScale'][1])<1e-12)
 check(id+' complete sampled soft alpha',registration['alphaPolicy'].startswith('preserve sampled RGBA'))
 check(id+' source selected',next(r['file'] for r in generation['sources'] if r['id']==id and r['selected'])==s['source'])
 source=Image.open(ROOT/s['source']).convert('RGBA'); scw,sch=registration['sourceCellSize']
 native=[Image.open(ROOT/f['file']).convert('RGBA') for f in s['frames']]
 atlas=Image.open(ROOT/s['atlas']['file']).convert('RGBA')
 atlas_bytes+=atlas.width*atlas.height*4
 check(id+' atlas SHA',sha(ROOT/s['atlas']['file'])==s['atlas']['sha256'])
 check(id+' duration is sum of keys',s['durationMs']==sum(f['durationMs'] for f in s['frames']))
 for f,im in zip(s['frames'],native):
  name=f['file']; frame_bytes+=im.width*im.height*4
  check(name+' PNG hash',sha(ROOT/name)==f['sha256'])
  rgba_hash=hashlib.sha256(im.tobytes()).hexdigest(); native_hashes.add(rgba_hash)
  check(name+' decoded RGBA hash',rgba_hash==f['rgbaSha256'])
  check(name+' dimensions/pivot',list(im.size)==s['canvas']==f['canvas'] and f['pivot']==s['pivot'])
  bb=im.getchannel('A').getbbox()
  check(name+' all alpha contained',bb and bb[0]>0 and bb[1]>0 and bb[2]<im.width and bb[3]<im.height)
  extrema=im.getchannel('A').getextrema()
  check(name+' transparency and soft alpha',extrema[0]==0 and f['softAlphaPixels']>0)
  x,y,w,h=f['rect']; extract=atlas.crop((x,y,x+w,y+h))
  check(name+' atlas payload parity',extract.tobytes()==im.tobytes())
  for border in [(x-2,y-2,x+w+2,y),(x-2,y+h,x+w+2,y+h+2),(x-2,y,x,y+h),(x+w,y,x+w+2,y+h)]:
   check(name+' transparent atlas gutter '+str(border),atlas.getchannel('A').crop(border).getextrema()==(0,0))
  sx,sy,sw,sh=f['sourceCell']; cell=source.crop((sx,sy,sx+sw,sy+sh))
  size=(round(scw*registration['actualScale'][0]),round(sch*registration['actualScale'][1]))
  sampled=cell.resize(size,Image.Resampling.NEAREST)
  ox,oy=f['nativeOffset']; check(name+' full RGBA sampled-source parity',im.crop((ox,oy,ox+size[0],oy+size[1])).tobytes()==sampled.tobytes())
 check(id+' six unique native frames',len(set(hashlib.sha256(im.tobytes()).hexdigest() for im in native))==6)
check('60 unique canonical RGBA frames',len(native_hashes)==60)
approval_root=ROOT.parent.parent/'characters/wang-lin-concept-direction-v5'
approval=json.loads((approval_root/'approval.json').read_text(encoding='utf8'))
for f in approval['files']:check('V5 immutable '+f['file'],sha(approval_root/f['file'])==f['sha256'])
files=[]
for p in sorted(ROOT.rglob('*')):
 if p.is_file() and p.name not in ['verification.json','delivery.json']:files.append({'file':str(p.relative_to(ROOT)).replace('\\','/'),'sha256':sha(p)})
report={'schema':'wang-lin-sword-pilot-vfx-verification-1','date':'2026-10-14','status':'passed','checks':checks,'coverage':{'sequences':10,'canonicalFrames':60,'sourceCalls':12,'selectedSources':10,'supersededSources':2,'v5PinsUnchanged':len(approval['files'])},'decodedBytes':{'canonicalFrames':frame_bytes,'atlases':atlas_bytes,'note':'Counts are decoded RGBA payload, not a browser memory benchmark; loading both collections simultaneously adds them.'},'artApproved':False,'runtimeIntegrated':False,'files':files}
(ROOT/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'pass':True,'checks':len(checks),'frames':60,'sources':12,'selected':10,'v5Pins':len(approval['files']),'decodedBytes':report['decodedBytes']}))
