from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,copy,statistics,importlib.util
ROOT=Path(__file__).resolve().parent
V2=ROOT.parents[2]
V1=V2.with_name('wang-lin-equipment-production-v1')
spec=importlib.util.spec_from_file_location('own_geometry',ROOT/'inspect-source.py');geo=importlib.util.module_from_spec(spec);spec.loader.exec_module(geo)
sha=geo.sha
def rel(p):return str(p.relative_to(V2)).replace('\\','/')
def write(p,d):geo.write(p,d)
def prefix_v1(p):return '../wang-lin-equipment-production-v1/'+p
def reuse(c):
 c=copy.deepcopy(c);c['reusedFrom']={'file':'../wang-lin-equipment-production-v1/motion-registration.json','clipId':c['id'],'bodyBytesUnchanged':True}
 for f in c['frames']:
  for key in ('file','source'):
   if key in f:f[key]=prefix_v1(f[key])
  assert sha((V2/f['file']).resolve())==f['sha256']
 for key in ('atlas','contact'):
  if key in c:c[key]=prefix_v1(c[key])
 if 'atlas' in c:assert sha((V2/c['atlas']).resolve())==c['atlasSha256']
 return c
def durations(action,count):
 if action=='cast-single-target':return [160,160,160,160,160,300][:count]
 if action=='cast-aoe':return [260,270,270,320,520,540][:count]
 return [150 if action=='idle' else 90 if action=='run' else 180 if action=='hit' else 240 if action=='death' else 300 if action=='meditate' else 200]*count
def main():
 g=json.loads((ROOT/'source-geometry.json').read_text(encoding='utf-8'))
 manual=json.loads((ROOT/'manual.json').read_text(encoding='utf-8')) if (ROOT/'manual.json').exists() else {}
 root_overrides=json.loads((ROOT/'root-overrides.json').read_text(encoding='utf-8')) if (ROOT/'root-overrides.json').exists() else {}
 review_state=json.loads((ROOT/'review-state.json').read_text(encoding='utf-8')) if (ROOT/'review-state.json').exists() else {}
 old=json.loads((V1/'motion-registration.json').read_text(encoding='utf-8'))
 clips=[reuse(c) for c in old['clips'] if c['identityId']=='a'];sources=[];cals=[]
 for s in g['sources']:
  if any(s['sourceEdges'].values()):continue
  im=Image.open(ROOT/s['file']).convert('RGBA');scale=s['scale'];source=copy.deepcopy(s);source['file']=rel(ROOT/s['file']);source['manualReviewPending']=not review_state.get('selectedSourcesReviewed',False);source['trueViewReviewed']=review_state.get('selectedSourcesReviewed',False);sources.append(source);calframes=[]
  for field in ('contact','masterNative'):
   if field in source:source[field]=rel(ROOT/s[field])
  if 'masterNative' in source:source['masterNativeSha256']=sha(V2/source['masterNative'])
  for i,p in enumerate(s['calibrations']):
   n=geo.native(im,p,p['root'],scale);file=ROOT/'calibration'/s['id']/(str(i+1).zfill(2)+'.png');file.parent.mkdir(parents=True,exist_ok=True);n.save(file);calframes.append({'file':rel(file),'sha256':sha(file),'sourceId':s['id'],'sourceRect':p['rect'],'sourceScale':scale,'root':p['root'],'canvas':[112,112],'pivot':[56,104]})
  cals.append({'sourceId':s['id'],'frames':calframes})
  for action,poses in s['actionCells'].items():
   id='sword-a-'+s['direction']+'-'+action;poses=copy.deepcopy(poses)
   if action=='run' and s['direction'] in ('south','east'):poses=poses[:5]
   if action=='gather' and s['recoverySilhouetteDeltaPct'][action]<-5:poses.append(copy.deepcopy(s['calibrations'][0])|{'reuseReason':'standing recovery from same-source neutral; preserve six real action keys with low-knee final stance'})
   frames=[];holds=durations(action,len(poses));canvas=[160,112] if action=='death' else [112,112];pivot=[80,104] if action=='death' else [56,104];ground=max(p['root'][1]-(p['rect'][1]) for p in poses) if action=='run' else None;stride=canvas[0]+4
   if action=='gather' and 'reuseReason' in poses[-1]:holds[-1]=160
   proof=Image.new('RGBA',(len(poses)*stride,128),(31,36,49,255));draw=ImageDraw.Draw(proof)
   for i,p in enumerate(poses):
    root=p['root'];lift=0
    if action=='run':root=[root[0],p['rect'][1]+ground];lift=round((root[1]-p['root'][1])*scale,3)
    if action=='death' and i>=2:
     l,t,r,b=p['core'];fraction=.45 if s['direction'] in ('east','northeast') else .55;lift=3 if i==2 else 0;root=[l+(r-l)*fraction,b+lift/scale]
    key=id+':'+str(i+1)
    override=root_overrides.get(key)
    if override:root=override['root']
    n=geo.native(im,p,root,scale,canvas,pivot);file=ROOT/'frames'/id/(str(i+1).zfill(2)+'.png');file.parent.mkdir(parents=True,exist_ok=True);n.save(file);f={'index':i,'file':rel(file),'sha256':sha(file),'canvas':canvas,'pivot':pivot,'durationMs':holds[i],'source':rel(ROOT/s['file']),'sourceId':s['id'],'sourceRect':p['rect'],'sourceCoreBounds':p['core'],'sourceScale':scale,'root':root,'rootMeasurement':p['rootBasis']|{'method':'measured lower5% human boot-sole projection; run row ground retains measured foot lift; final visual root review pending'},'lift':lift,'bounds':list(n.getbbox()),'coreEdges':geo.edges(n),'active':True,'manualReviewPending':True}
    if action=='death':f['rootMeasurement']={'method':'standing/knee boot support for first2keys; falling/corpse pelvis projection to observed body-ground contact plane thereafter. x pelvis candidates from wholebody bounds require manual source confirmation; no sole-only root for prone body.','semantic':'corpse-ground-contact' if i>=3 else 'falling-contact-candidate','sourceRoot':root,'flightLiftCandidatePx':lift,'manualReviewPending':True}
    if action=='meditate':f['rootMeasurement']={'method':'seated support plane beneath folded legs/robe, midpoint of support spans; not standing boot height or fitted silhouette. Manual pelvis/support source review pending.','semantic':'seated-pelvis-ground','sourceRoot':root,'supportProjection':p['rootBasis'],'manualReviewPending':True}
    if 'reuseReason' in p:f['reuseReason']=p['reuseReason'];f['phase']='standing-recovery'
    if override:f['rootMeasurement']=override
    if action not in ('death','meditate'):
     f['rootMeasurement']['sourceRoot']=root
     f['rootMeasurement']['sourceSupportPlane']={'observedBodyContactY':p['root'][1],'worldProjectionY':root[1],'material':'actual lower human boot/contact support; natural hand/knee/robe contact in crouched gather is support, never a prop bottom','method':'Measured source lower support spans, checked against complete native/source body; run separately uses per-key waist/upper-leg projection and row ground.'}
     f['rootMeasurement']['manualReviewPending']=not review_state.get('selectedSourcesReviewed',False)
     f['rootMeasurement']['sourceSupportViewed']=review_state.get('selectedSourcesReviewed',False)
     if not override:f['rootMeasurement']['method']='measured lower5% human boot/contact support spans, visually confirmed on complete source/native body; no pose fitting'
    m=manual.get(key)
    if m:
     if 'sourceManual' in m:x,y=[round(pivot[k]+(m['sourceManual'][k]-root[k])*scale,3) for k in range(2)]
     else:x,y=m['native']
     grip=m|{'native':[x,y],'source':m.get('sourceManual',[round(root[0]+(x-pivot[0])/scale,3),round(root[1]+(y-pivot[1])/scale,3)]),'occlusionRect':[max(0,int(x)-2),max(0,int(y)-2),5,5],'emptyHand':True,'selection':'manual-per-pose-palm-or-honest-hidden-endpoint','approved':False}
     for original,historical in [('frameSha256','canonicalSha256AtObservation'),('frameFile','canonicalFileAtObservation'),('sourceRoot','sourceRootAtObservation'),('framePivot','pivotAtObservation')]:
      if original in grip:grip[historical]=grip.pop(original)
     f['grip']=grip;f['manualReviewPending']=bool(f['rootMeasurement'].get('manualReviewPending',False))
    else:f['grip']={'native':[pivot[0],80],'source':[root[0],root[1]-24/scale],'angleDeg':0,'visibility':'manual-review-pending','attachmentPolicy':'hidden-manual-review-pending','occlusionRect':[pivot[0]-2,78,5,5],'selection':'explicit-placeholder-not-actual-palm','approved':False}
    frames.append(f);proof.alpha_composite(n,(i*stride+2,16));draw.text((i*stride+2,1),action+' '+str(i+1),fill=(230,230,240))
    for q in range(0,canvas[0],10):
     draw.line((i*stride+2+q,16,i*stride+2+q,128),fill=(120,130,160,55))
     if q%20==0:draw.text((i*stride+3+q,17),str(q),fill=(120,150,180))
    for q in range(0,112,10):
     draw.line((i*stride+2,16+q,i*stride+2+canvas[0],16+q),fill=(120,130,160,55))
     if q%20==0:draw.text((i*stride+3,17+q),str(q),fill=(120,150,180))
   atlas=Image.new('RGBA',(len(frames)*stride,116));rects=[]
   for i,f in enumerate(frames):
    rect=[2+i*stride,2,canvas[0],canvas[1]];f['atlasRect']=rect;rects.append(rect);atlas.paste(Image.open(V2/f['file']).convert('RGBA'),(rect[0],rect[1]))
   af=ROOT/'atlases'/(id+'.png');af.parent.mkdir(parents=True,exist_ok=True);atlas.save(af);cf=ROOT/'contact'/(id+'-body-grid-3x.png');proof.resize((proof.width*3,proof.height*3),Image.Resampling.NEAREST).save(cf)
   clips.append({'id':id,'identityId':'a','familyId':'sword','direction':s['direction'],'action':action,'sourceId':s['id'],'sourceScale':scale,'frames':frames,'durationMs':sum(f['durationMs'] for f in frames),'canvas':canvas,'pivot':pivot,'atlas':rel(af),'atlasSha256':sha(af),'atlasSize':list(atlas.size),'rects':rects,'gutter':2,'contact':rel(cf),'loop':action in ('idle','run','meditate'),'holdLast':action not in ('idle','run','meditate'),'manualReviewPending':any(f['manualReviewPending'] for f in frames),'ownerApproved':False,'motionApproved':False,'runtimeReady':False,'releaseTimeMs':480 if action=='cast-single-target' else 800 if action=='cast-aoe' else None})
 clips.sort(key=lambda c:c['id']);new=[c for c in clips if 'reusedFrom' not in c]
 pending=any(c.get('manualReviewPending',False) for c in clips) or any(s['manualReviewPending'] for s in sources)
 write(ROOT/'registration.json',{'schema':'huyen-tam-sword-body-registration-v2','identityId':'a','identityName':'Huyễn Tâm','familyId':'sword','date':'2026-10-14','sources':sources,'calibrations':cals,'clips':clips,'coverage':{'requiredClips':64,'registeredClips':len(clips),'newClips':len(new),'reusedV1Clips':8,'bodyPoses':sum(len(c['frames']) for c in clips),'neutralCalibrationPoses':sum(len(c['frames']) for c in cals),'status':'manual-review-pending' if pending else 'technical-production-candidate-complete'},'manualReviewPending':pending,'ownerApproved':False,'motionApproved':False,'runtimeReady':False})
 print(json.dumps({'clips':len(clips),'newClips':len(new),'poses':sum(len(c['frames']) for c in clips),'manualPending':sum(f.get('manualReviewPending',False) for c in new for f in c['frames'])}))
if __name__=='__main__':main()
