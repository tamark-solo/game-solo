from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,importlib.util,sys,math
sys.dont_write_bytecode=True
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
snapshot=SUPPORT/'snapshot.json';assert sha(snapshot)=='c82f3b21917ffa9f649431c8fba59eb17bba7fe205723c6c5b8125a498499a4b'
d=json.loads(snapshot.read_text(encoding='utf-8'));sources={s['id']:s for s in d['sources']}
spec=importlib.util.spec_from_file_location('root_a_banner_readonly_tools',V2/'actors/a/banner/body-tools.py');tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
selectedX={
 'east-hit':[210.5,519,848.25,202.5,525.25,836.25],
 'north-hit':[230.75,503,793.75,239.5,523.75,793],
 'northeast-hit':[237.5,520.75,816,237.5,527,827.25],
 'southeast-hit':[246.75,516.25,789.5,239.75,519.75,794.25],
 'east-gather':[219.5,512,817,212.75,524.5,814.75],
 'north-gather':[236.5,523,769,272,527.5,768.5],
 'northeast-gather':[196,526.75,820,245.25,521,818.75],
 'southeast-gather':[275.25,514.5,774.5,267.5,517.75,786]
}
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',13);checks=[];result=[]
def check(name,ok):assert ok,name;checks.append({'name':name,'passed':True})
for c in d['clips']:
 s=sources[c['sourceId']];raw=V2/s['file'];check(c['id']+' raw pin',sha(raw)==s['sha256']);im=Image.open(raw).convert('RGBA')
 panel=Image.new('RGBA',(1200,380),(25,31,42,255));dr=ImageDraw.Draw(panel);frames=[]
 for f,x in zip(c['frames'],selectedX[c['direction']+'-'+c['action']]):
  i=f['index'];row,col=f['sourceBodyCell'];cell=s['rows'][row][col];root=[x,f['sourceCoreBounds'][3]]
  seated=c['action']=='gather' and i<4;standing=not seated
  method=('Actual standing boot support viewed; sole projection keeps the observed lowest contact plane, with source footprint X manually reviewed.' if standing else 'Manual own boot/knee/folded-leg support projection in squat, kneeling or rising pose. Actual contact plane viewed; folds may hide one heel and pelvis. No exact skeletal or world-floor claim.' if seated else 'Manual own lower-limb/boot-region support projection during kneeling or prone fall, anchored to the observed body-contact Y. Pose-specific cloth/hair can occlude exact sole contact; no exact bone or world-floor claim.')
  uncertainty=1.5 if standing else 3
  measure={'sourceRoot':root,'semantic':True,'manualReviewed':True,'sourceRootReviewed':True,'manualReviewPending':False,'method':method,'observedBodyContactY':root[1],'uncertaintyNativePx':uncertainty,'worldFloorClaimed':False,'bonePelvisClaimed':False,'exactAnatomicalSoleClaimed':False,'sourceEvidence':f'evidence/{c["id"]}-source-root-review.png','nativeEvidence':f'evidence/{c["id"]}-native-root-review-1x.png','rootProposalAtObservation':f['root'],'sourceBodyCell':f['sourceBodyCell']}
  native=tool.native(im,cell,root,f['sourceScale'],tuple(f['canvas']),tuple(f['pivot']))
  check(c['id']+' factor '+str(i),f['sourceScale']==c['sourceScale'] and f['sourceScale']>0)
  check(c['id']+' finite '+str(i),all(math.isfinite(v) for v in root))
  check(c['id']+' full native '+str(i),not any(tool.edges(native).values()))
  out=SUPPORT/'native'/c['id']/f'{i:02}.png';out.parent.mkdir(parents=True,exist_ok=True);native.save(out)
  xx=(i%6)*200+4;yy=32;panel.alpha_composite(native,(xx,yy));px,py=f['pivot'];dr.line((xx+px-4,yy+py,xx+px+4,yy+py),fill=(240,210,70))
  dr.text((xx,8),str(i)+' '+c['direction'],fill=(220,220,205),font=font);dr.text((xx,180),'R '+str(root),fill=(240,210,70),font=font);dr.text((xx,202),'uncertainty '+str(uncertainty)+'px',fill=(185,190,205),font=font)
  frames.append({'index':i,'source':f['source'],'sourceSha256':s['sha256'],'sourceBodyCell':f['sourceBodyCell'],'root':root,'sourceRoot':root,'sourceRootReviewed':True,'manualReviewPending':False,'rootMeasurement':measure,'lift':0,'rendererAppliesLift':False,'nativeProof':out.relative_to(SUPPORT).as_posix(),'nativeProofSha256':sha(out),'sourceScale':f['sourceScale'],'canvas':f['canvas'],'pivot':f['pivot']})
 panel.save(SUPPORT/'evidence'/f'{c["id"]}-native-root-review-1x.png');panel.resize((2400,760),Image.Resampling.NEAREST).save(SUPPORT/'evidence'/f'{c["id"]}-native-root-review-2x.png')
 result.append({'id':c['id'],'sourceId':c['sourceId'],'direction':c['direction'],'action':c['action'],'frames':frames})
out={'schema':'A-banner-hit-gather-root-support-1','clips':result,'sourcePoses':48,'sourceSnapshotSha256':sha(snapshot),'sourceRootReviewComplete':True,'nativeProofViewed':False,'actorWrites':False,'sourcePixelsChanged':False,'ownerApproved':False,'runtimeIntegrated':False,'limits':['Coordinates are reviewed support projections with uncertainty1.5–3nativepx, not exact skeletal landmarks or gameplay floor measurements.','Lift is zero here; a later packer must not subtract a baked lift twice.','One factor/source retained; actor owns final canonical/socket/atlas recomputation.']}
(SUPPORT/'manual-registration.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(SUPPORT/'verification.json').write_text(json.dumps({'status':'source-complete-native-awaiting-view','checkCount':len(checks),'checks':checks,'sourcePoses':48,'actorWrites':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourcePoses':48,'checks':len(checks),'actorWrites':False}))
