from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,math,statistics,sys
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2];V1=V2.with_name('wang-lin-equipment-production-v1')
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[];failures=[]
def check(ok,label):
 if not ok:failures.append(label)
 checks.append(label)
reg=read(ROOT/'registration.json');gen=read(ROOT/'generation.json');old=read(V1/'motion-registration.json')
check(len(reg['clips'])==64,'64 required A Sword clips')
expected={(d,a) for d in ['north','northeast','east','southeast','south','southwest','west','northwest'] for a in ['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe']}
check({(c['direction'],c['action']) for c in reg['clips']}==expected,'64 unique action direction coverage')
for r in gen['records']:
 check(sha(ROOT/r['raw'])==r['sha256'],r['id']+' raw hash')
 check(r['tool']=='built-in-imagegen' and r['transparentRequested'] is True,r['id']+' actual builtin transparent provenance')
 check(sha(Path(r['original']))==r['sha256'],r['id']+' original exact workspace raw')
 check(sha(ROOT/r['prompt'])==r['promptSha256'],r['id']+' prompt hash')
 for q in r['inputs']:check(sha(Path(q['file']))==q['sha256'],r['id']+' input hash '+q['role'])
sources={s['id']:s for s in reg['sources']};edgefail=[];framecount=0;reused=0;manual=read(ROOT/'manual.json')
for c in reg['clips']:
 check(c.get('durationMs')==sum(f['durationMs'] for f in c['frames']),c['id']+' clip duration equals actual holds')
 check(all(k in c for k in ['sourceScale','canvas','pivot','loop','atlasSha256']),c['id']+' complete Core descriptor schema')
 check(sha((V2/c['atlas']).resolve())==c['atlasSha256'],c['id']+' atlas hash')
 atlas=Image.open((V2/c['atlas']).resolve()).convert('RGBA')
 for i,f in enumerate(c['frames']):
  framecount+=1;key=c['id']+':'+str(i+1);file=(V2/f['file']).resolve();check(sha(file)==f['sha256'],key+' canonical hash');im=Image.open(file).convert('RGBA');check(list(im.size)==f['canvas'],key+' canvas')
  x,y,w,h=f['atlasRect'];check(atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes(),key+' atlas exact RGBA')
  if c.get('reusedFrom'):
   reused+=1;oc=next(v for v in old['clips'] if v['id']==c['id']);check(f['sha256']==oc['frames'][i]['sha256'],key+' approved V1 exact body');continue
  check(f['pivot']==([80,104] if c['action']=='death' else [56,104]),key+' padding-only world pivot')
  check(f['sourceScale']==sources[f['sourceId']]['scale'],key+' one source scale')
  check(not any(f['coreEdges'].values()),key+' canonical zero clipped alpha128 edges')
  m=manual[key];check(m['sourcePalmReviewed'] and m['manualReviewCompleted'],key+' actual raw palm review')
  grip=f['grip'];check(grip['source']==m['sourceManual'],key+' exact source palm or hidden endpoint')
  for k in range(2):check(abs(grip['native'][k]-(f['pivot'][k]+(grip['source'][k]-f['root'][k])*f['sourceScale']))<.0011,key+' actual socket inverse '+str(k))
  check(all(math.isfinite(float(v)) for v in [*grip['native'],grip['angleDeg'],*f['root'],f['lift']]),key+' finite measured metadata')
  check(grip['visibility']!='manual-review-pending',key+' explicit visibility')
  check(not f.get('manualReviewPending'),key+' manual completed')
  if c['action'] in ['death','meditate']:check(not f['rootMeasurement'].get('manualReviewPending',False),key+' semantic root reviewed')
  check(atlas.getchannel('A').crop((x-2,y-2,x,y+h+2)).getbbox() is None,key+' atlas left gutter2')
  check(atlas.getchannel('A').crop((x+w,y-2,x+w+2,y+h+2)).getbbox() is None,key+' atlas right gutter2')
  check(atlas.getchannel('A').crop((x,y-2,x+w,y)).getbbox() is None,key+' atlas top gutter2')
  check(atlas.getchannel('A').crop((x,y+h,x+w,y+h+2)).getbbox() is None,key+' atlas bottom gutter2')
for s in reg['sources']:
 check(sha(V2/s['file'])==s['sha256'],s['id']+' selected source hash')
 check(not any(s['sourceEdges'].values()),s['id']+' selected raw alpha128 zero edge clipping')
 check(abs(s['scale']*statistics.median(s['neutralHeights'])-80)<1e-8,s['id']+' actual six-neutral 80 scale')
 check(len(s['calibrations'])==6,s['id']+' six real neutral calibration bodies')
for cal in reg['calibrations']:
 for i,f in enumerate(cal['frames']):check(sha(V2/f['file'])==f['sha256'],cal['sourceId']+' actual calibration hash '+str(i+1))
check(framecount==385 and reused==49,'385 actual motion poses including49 immutable pilot poses')
check(sum(len(c['frames']) for c in reg['calibrations'])==150,'150 actual neutral calibrations separate from motion')
(ROOT/'verification.json').write_text(json.dumps({'schema':'huyen-tam-sword-body-verification-v2','status':'passed' if not failures else 'pending','checks':len(checks),'failures':failures,'clips':64,'bodyPoses':framecount,'newBodyPoses':framecount-reused,'reusedV1BodyPoses':reused,'neutralCalibrationPoses':150,'sources':len(sources),'rawHistorySources':len(gen['records']),'failedHistoricalSources':sum(not s['selected'] for s in gen['records']),'scope':'Body bytes, source lineage, atlas/material, scalar registration and honest sockets. Technical validation does not approve ART/motion/runtime.','registrationSha256':sha(ROOT/'registration.json'),'newArtApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS' if not failures else 'PENDING',len(checks),'checks',64,'clips',framecount,'poses',len(failures),'failures')
if failures:print(json.dumps(failures));sys.exit(1)
