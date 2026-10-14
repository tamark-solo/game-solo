from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,importlib.util,sys,math
sys.dont_write_bytecode=True
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
snapshot=SUPPORT/'snapshot.json';assert sha(snapshot)=='5d8136de47ac1482aabd56b56479620f2194b49e88050ef72b79a223bb050470'
d=json.loads(snapshot.read_text(encoding='utf-8'));sources={s['id']:s for s in d['sources']}
spec=importlib.util.spec_from_file_location('root_a_banner_readonly_tools',V2/'actors/a/banner/body-tools.py');tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
selectedX={
 'east-death':[198.75,490.5,722,66,398,727],
 'north-death':[260,510,897,242,591,944],
 'northeast-death':[265,494.5,781,119,431,760],
 'northwest-death':[269,625,943,295,610,938],
 'south-death':[224.5,590.5,957,304,640,965],
 'southeast-death':[219.5,420,728,90,417,737],
 'southwest-death':[218,564,957,313,634,960],
 'west-death':[224.5,529.5,969,303,642,976],
 'east-meditate':[252,541,832,253,542,833],
 'north-meditate':[273,519.5,765.5,272.5,520,765.5],
 'northeast-meditate':[226,520,821,226,520,821],
 'northwest-meditate':[274,549,847.5,272.5,551.5,846.5],
 'south-meditate':[256.5,516.5,778,265,519.5,777.5],
 'southeast-meditate':[286,552,815,286,551,815],
 'southwest-meditate':[257,522,797.5,253,523.5,801],
 'west-meditate':[225,511.5,796.5,223,511,796]
}
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',13);checks=[];result=[]
def check(name,ok):assert ok,name;checks.append({'name':name,'passed':True})
for c in d['clips']:
 s=sources[c['sourceId']];raw=V2/s['file'];check(c['id']+' raw pin',sha(raw)==s['sha256']);im=Image.open(raw).convert('RGBA')
 panel=Image.new('RGBA',(1200,380),(25,31,42,255));dr=ImageDraw.Draw(panel);frames=[]
 for f,x in zip(c['frames'],selectedX[c['direction']+'-'+c['action']]):
  i=f['index'];row,col=f['sourceBodyCell'];cell=s['rows'][row][col];root=[x,f['sourceCoreBounds'][3]]
  seated=c['action']=='meditate';standing=not seated and i==0
  method=('Actual standing boot support viewed; sole projection keeps the observed lowest contact plane, with source footprint X manually reviewed.' if standing else 'Manual own clothed folded-leg/thigh support projection in seated pose; folds hide pelvis and soles, no exact bone or world-floor claim.' if seated else 'Manual own lower-limb/boot-region support projection during kneeling or prone fall, anchored to the observed body-contact Y. Pose-specific cloth/hair can occlude exact sole contact; no exact bone or world-floor claim.')
  uncertainty=2 if standing else 4 if seated else 5
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
out={'schema':'A-banner-semantic-root-support-1','clips':result,'sourcePoses':96,'sourceSnapshotSha256':sha(snapshot),'sourceRootReviewComplete':True,'nativeProofViewed':False,'actorWrites':False,'sourcePixelsChanged':False,'ownerApproved':False,'runtimeIntegrated':False,'limits':['Coordinates are reviewed support projections with uncertainty2–5nativepx, not exact skeletal landmarks or gameplay floor measurements.','Lift is zero here; a later packer must not subtract a baked lift twice.','One factor/source retained; actor owns final canonical/socket/atlas recomputation.']}
(SUPPORT/'manual-registration.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(SUPPORT/'verification.json').write_text(json.dumps({'status':'source-complete-native-awaiting-view','checkCount':len(checks),'checks':checks,'sourcePoses':96,'actorWrites':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourcePoses':96,'checks':len(checks),'actorWrites':False}))
