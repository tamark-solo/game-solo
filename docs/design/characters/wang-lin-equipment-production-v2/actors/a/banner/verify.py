from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
import json,hashlib,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('own_banner_geometry',ROOT/'body-tools.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
checks=0;fail=[]
def ck(ok,label):
 global checks
 checks+=1
 if not ok:fail.append(label)
reg=read('registration.json');gen=read('generation.json');geo=read('source-geometry.json');proof=read('manual-proof.json');proofs={p['key']:p for p in proof['frames']};actual=[r for r in gen['records'] if r.get('original')]
ck(len(reg['clips'])==64,'64 clips');ck(reg['coverage']['bodyPoses']==381,'381 actual body keys');ck(reg['coverage']['neutralCalibrationPoses']==144,'144 actual neutral calibrations');ck(len(actual)==27,'27 actual tool outputs including3 rejected cameras');ck(sum(r.get('selected',False) for r in actual)==24,'24 selected outputs')
for r in actual:
 ck(g.sha(V2/r['raw'])==r['sha256'],r['id']+' raw');ck(g.sha(Path(r['original']))==r['sha256'],r['id']+' original');ck(g.sha(V2/r['prompt'])==r['promptSha256'],r['id']+' exact actual prompt');ck(r.get('transparentRequested') is True,r['id']+' transparent request');ck(r['inputs'][0]['role'].startswith(('own','same-own')),r['id']+' own-primary')
 for inp in r['inputs']:ck(g.sha(V2/inp['file'])==inp['sha256'],r['id']+' immutable input '+inp['file'])
for s in geo['sources']:
 im=Image.open(V2/s['file']).convert('RGBA');target=g.mask(im);union=Image.new('L',im.size);duplicate=0;assigned=0
 for row in s['rows']:
  for cell in row:
   cm=Image.new('L',im.size);d=ImageDraw.Draw(cm)
   if cell.get('componentRuns'):
    for y,l,r in cell['componentRuns']:d.line((l,y,r-1,y),fill=255)
   else:
    x,y,w,h=cell['rect'];cm.paste(target.crop((x,y,x+w,y+h)),(x,y))
   duplicate+=sum(ImageChops.multiply(union,cm).histogram()[1:]);union=ImageChops.lighter(union,cm);assigned+=sum(cm.histogram()[1:])
 ck(duplicate==0,s['id']+' cells have no duplicate opaque source pixels');ck(ImageChops.difference(union,target).getbbox() is None,s['id']+' whole alpha128 source union exact');ck(assigned==sum(target.histogram()[1:]),s['id']+' assigned opaque count');ck(not any(g.edges(im).values()),s['id']+' original physical outer edges')
sources={s['id']:s for s in reg['sources']};raws={sid:Image.open(V2/s['file']).convert('RGBA') for sid,s in sources.items()}
for cal in reg['calibrations']:
 s=sources[cal['sourceId']]
 for f in cal['frames']:
  cell=s['rows'][f['sourceBodyCell'][0]][f['sourceBodyCell'][1]];expected=g.native(raws[s['id']],cell,f['root'],s['scale']);im=Image.open(V2/f['file']).convert('RGBA')
  ck(im.tobytes()==expected.tobytes(),f['file']+' exact source RGBA');ck(g.sha(V2/f['file'])==f['sha256'],f['file']+' hash');ck(not any(g.edges(im).values()),f['file']+' native edges')
for c in reg['clips']:
 s=sources[c['sourceId']];atlas=Image.open(V2/c['atlas']).convert('RGBA');ck(c['sourceScale']==s['scale'],c['id']+' one source scale');ck(c['durationMs']==sum(f['durationMs'] for f in c['frames']),c['id']+' total duration');ck(c['gutter']==2,c['id']+' gutter2');ck(g.sha(V2/c['atlas'])==c['atlasSha256'],c['id']+' atlas hash')
 blank=atlas.copy()
 for i,f in enumerate(c['frames']):
  key=c['id']+':'+str(i+1);cell=s['rows'][f['sourceBodyCell'][0]][f['sourceBodyCell'][1]];expected=g.native(raws[s['id']],cell,f['root'],s['scale'],f['canvas'],f['pivot']);im=Image.open(V2/f['file']).convert('RGBA')
  ck(im.tobytes()==expected.tobytes(),key+' exact source RGBA');ck(g.sha(V2/f['file'])==f['sha256'],key+' hash');ck(not any(g.edges(im).values()),key+' no edge concealment');ck(f['sourceScale']==s['scale'],key+' same source scale');ck(f['sourceRootReviewed'],key+' actual root reviewed');ck(f['rootMeasurement'].get('exactBoneClaim') is not True,key+' no exact pelvis bone claim');ck(f['lift']==0,key+' no duplicate lift')
  m=f['grip'];ck(m.get('sourcePalmReviewed'),key+' actual source palm reviewed');ck('placeholder' not in m.get('selection',''),key+' no placeholder');ck(bool(m.get('palmEstimated',m.get('sourcePalmEstimated',False))) or proofs[key]['sourceNearestRGBA'][3]>=128,key+' observed hand opaque or honest occluded estimate');ck(all(abs(m['native'][k]-(f['pivot'][k]+(m['source'][k]-f['root'][k])*s['scale']))<.0001 for k in range(2)),key+' native socket recomputed from raw coords')
  held=c['action'] in ['idle','run','hit'] or c['action'] in ['cast-single-target','cast-aoe'] and i==0
  ck(not m.get('heldGripClaim',False) or held,key+' held only during supported choreography');ck(not m.get('heldGripClaim',False) or m.get('closedGripConfirmed') is True,key+' held only actual closed fist')
  x,y,w,h=f['atlasRect'];ck(atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes(),key+' atlas exact RGBA');blank.paste((0,0,0,0),(x,y,x+w,y+h))
 ck(blank.getchannel('A').getbbox() is None,c['id']+' alpha gutters empty')
checkpoint=json.loads((V2/'checkpoints/sword.json').read_text(encoding='utf-8'))
for p in checkpoint['files']:ck(g.sha(V2/p['file'])==p['sha256'],'Sword frozen '+p['file'])
result={'schema':'A-banner-body-scoped-verification-2','clips':len(reg['clips']),'keys':reg['coverage']['bodyPoses'],'calibrations':reg['coverage']['neutralCalibrationPoses'],'actualOutputs':len(actual),'selectedSources':len(sources),'manualReviewPending':reg['manualReviewPending'],'checks':checks,'failures':fail,'passed':not fail,'scope':'Technical source/lineage/whole alpha128 component partition/exact source transforms/atlas/root/socket checks only. Does not approve new ART, motion, gameplay or runtime.','ownerApproved':False,'runtimeIntegrated':False}
g.write(ROOT/'review/verification.json',result);print(json.dumps({k:v for k,v in result.items() if k not in ['scope','schema']}));raise SystemExit(bool(fail))
