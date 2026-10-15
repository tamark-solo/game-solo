"""Verify only actually packed new-GDD clips, preserving the approved basis."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import statistics
from source_tools import components,rows_of,isolated_pose
from reviewed_layout import wide_layout_matches

R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,value):
 assert value,name
 checks.append(name)
manifest=read(R/'manifest.json');ledger=read(R/'generation.json');basis=read(R/'basis.json');plan=read(R/'production-plan.json')
for pin in basis['files']:check('basis '+pin['file'],sha(W/pin['file'])==pin['sha256'])
for job in ledger['jobs']:
 check('prompt hash '+job['id'],sha(R/job['prompt'])==job['promptSha256'])
 for image in job['inputs']:
  check('input snapshot '+job['id']+image['file'],sha(R/image['file'])==image['sha256'])
  check('original identity/reference '+job['id']+image['original'],sha(W/image['original'])==image['originalSha256'])
  for frame in image.get('composedFrom',[]):
   check('composed motion reference '+job['id']+frame['file'],sha(W/frame['file'])==frame['sha256'])
 if job['status']!='planned':check('source hash '+job['id'],sha(R/job['source'])==job['sourceSha256'])
def historical_job(job,label):
 check('history prompt '+label,sha(R/job['prompt'])==job['promptSha256'])
 for i in job['inputs']:
  check('history input '+label+i['file'],sha(R/i['file'])==i['sha256'])
 if job.get('sourceSha256'):check('history raw '+label,sha(R/job['source'])==job['sourceSha256'])
for job in ledger.get('historySources',[]):historical_job(job,job['id'])
for job in ledger['jobs']:
 for n,old in enumerate(job.get('history',[])):historical_job(old,job['id']+str(n))
views=read(R/'view-masters/generation.json');view_registration=read(R/'view-masters/registration.json')
for job in views['jobs']:
 check('view prompt '+job['id'],sha(R/job['prompt'])==job['promptSha256'])
 for i in job.get('inputs',[]):check('view input '+job['id']+i['file'],sha(R/i['file'])==i['sha256'])
 for i in job.get('inputs',[]):
  for frame in i.get('composedFrom',[]):check('view matrix input '+job['id']+frame['file'],sha(W/frame['file'])==frame['sha256'])
 if job['status']!='planned':check('view raw '+job['id'],sha(R/job['raw'])==job['sha256'])
 for n,old in enumerate(job.get('history',[])):
  if old.get('sha256'):check('view history raw '+job['id']+str(n),sha(R/old['raw'])==old['sha256'])
  else:check('unexecuted view history '+job['id']+str(n),old['status']=='planned')
  check('view history prompt '+job['id']+str(n),sha(R/old['prompt'])==old['promptSha256'])
  for i in old.get('inputs',[]):check('view history input '+job['id']+str(n)+i['file'],sha(R/i['file'])==i['sha256'])
for record in view_registration['records']:
 check('view native '+record['id'],sha(R/record['file'])==record['sha256'])
 check('view raw registration '+record['id'],sha(R/record['raw'])==record['rawSha256'])
 check('real view inspected '+record['id'],record['viewReviewedByModel'] and not record['ownerApproved'])
for history in (R/'history').glob('**/manifest.json'):
 archived=read(history)
 for clip in archived.get('clips',[]):
  for f in clip['frames']:check('archived canonical '+history.parent.name+clip['id']+str(f['index']),sha(history.parent/f['file'])==f['sha256'])
  check('archived atlas '+history.parent.name+clip['id'],sha(history.parent/clip['atlas']['file'])==clip['atlas']['sha256'])
layout_regions={}
for source in manifest['sources']:
 check('source pin '+source['id'],sha(R/source['file'])==source['sha256'])
 check('source inspected '+source['id'],source['sourceViewed'])
 check('source one scale '+source['id'],source['oneScale']>0)
 if source.get('sourceLayoutWitness'):
  job=next(j for j in ledger['jobs'] if j['id']==source['id']);raw=Image.open(R/source['file']).convert('RGBA');regions=components(raw);rows=rows_of([r for r in regions if r['large']],4,raw.height)
  check('reviewed layout witness retained '+source['id'],source['sourceLayoutWitness']==job['sourceLayoutWitness'])
  check('reviewed actual rows '+source['id'],wide_layout_matches(job,rows) and source['observedRowCounts']==[len(row) for row in rows])
  check('reviewed neutral-only scale '+source['id'],source['oneScale']==job['bodyNominalPx']/statistics.mean(p['box'][3]-p['box'][1] for row in rows[:2] for p in row))
  layout_regions[source['id']]=(raw,regions,[p for row in rows[2:] for p in row])
 for box in source['calibrationBounds']:
  x0,y0,x1,y1=box;sw,sh=source['size'];check('complete calibration source '+source['id']+str(box),x0>0 and y0>0 and x1<sw and y1<sh)
for clip in manifest['clips']:
 source=next(s for s in manifest['sources'] if s['id']==clip['sourceJob']);check('single scale throughout '+clip['id'],clip['sourceScale']==source['oneScale'])
 job=next(j for j in ledger['jobs'] if j['id']==clip['sourceJob']);check('excluded source action never active '+clip['id'],clip['action'] not in job.get('excludedActions',[]))
 if source['id'] in layout_regions:check('reviewed actual key indexes '+clip['id'],[f['sourcePoseIndex'] for f in clip['frames']]==job['poseSelections'][clip['action']])
 check('source provenance '+clip['id'],clip['sourceSha256']==source['sha256'])
 check('candidate/runtime flags '+clip['id'],not clip['ownerArtApproved'] and not clip['ownerMotionApproved'] and not clip['runtimeReady'])
 atlas=Image.open(R/clip['atlas']['file']).convert('RGBA');check('atlas hash '+clip['id'],sha(R/clip['atlas']['file'])==clip['atlas']['sha256'])
 for f in clip['frames']:
  label=clip['id']+' key'+str(f['index']);p=R/f['file'];im=Image.open(p).convert('RGBA');check('canonical hash '+label,sha(p)==f['sha256']);check('canvas '+label,list(im.size)==clip['canvas'])
  check('pivot '+label,f['pivot']==clip['pivot']);check('bounds '+label,list(im.getchannel('A').getbbox())==f['bounds'])
  check('no per-pose paint '+label,f['pixelsResampled'] and not f['pixelsRepainted']);check('lift baked once '+label,f['liftAlreadyBaked'])
  if source['id'] in layout_regions:
   raw,regions,action_regions=layout_regions[source['id']];cut,box=isolated_pose(raw,action_regions[f['sourcePoseIndex']],regions);scale=source['oneScale'];cut=cut.resize((max(1,round(cut.width*scale)),max(1,round(cut.height*scale))),Image.Resampling.NEAREST)
   root=f['sourceRoot'];offset=(round(clip['pivot'][0]-(root[0]-box[0])*scale),round(clip['pivot'][1]-(root[1]-box[1])*scale));reconstruction=Image.new('RGBA',tuple(clip['canvas']));reconstruction.paste(cut,offset)
   check('reviewed key maps to complete actual region '+label,box==f['sourceRect'] and reconstruction.tobytes()==im.tobytes())
  sx0,sy0,sx1,sy1=f['sourceRect'];sw,sh=source['size']
  check('source rectangle inside raw '+label,0<=sx0<sx1<=sw and 0<=sy0<sy1<=sh)
  if clip.get('alphaPolicy')=='preserved-soft-RGBA' and source.get('softExtentPolicy')=='alpha8-body-plus-native3px-original-rgba':
   support=Image.open(R/source['file']).convert('RGBA').crop(f['sourceRect']).getchannel('A').point(lambda a:255 if a>=8 else 0).getbbox()
   check('spectral source support present '+label,bool(support))
   ax,ay,bx,by=support
   check('spectral alpha8 support complete; alpha1..7 residue retained '+label,sx0+ax>0 and sy0+ay>0 and sx0+bx<sw and sy0+by<sh)
  else:check('no source-edge clipping '+label,sx0>0 and sy0>0 and sx1<sw and sy1<sh)
  x,y,w,h=f['atlasRect'];check('atlas exact RGBA '+label,atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes())
  for yy in [y-2,y-1,y+h,y+h+1]:check('gutter row '+label+str(yy),not atlas.getchannel('A').crop((x-2,yy,x+w+2,yy+1)).getbbox())
  for xx in [x-2,x-1,x+w,x+w+1]:check('gutter col '+label+str(xx),not atlas.getchannel('A').crop((xx,y-2,xx+1,y+h+2)).getbbox())
  if clip.get('alphaPolicy')=='preserved-soft-RGBA':
   check('spectral support has no boot claim '+label,f['supportKind']=='estimated-ground-projection-of-hovering-spirit' and f['supportUncertaintyNativePx']>=3)
   raw=Image.open(R/source['file']).convert('RGBA');cut=raw.crop(f['sourceRect']);scale=source['oneScale'];cut=cut.resize((max(1,round(cut.width*scale)),max(1,round(cut.height*scale))),Image.Resampling.NEAREST)
   root=f['sourceRoot'];offset=(round(clip['pivot'][0]-(root[0]-sx0)*scale),round(clip['pivot'][1]-(root[1]-sy0)*scale));reconstruction=Image.new('RGBA',tuple(clip['canvas']));reconstruction.paste(cut,offset)
   check('spectral retained RGBA is exact nearest source '+label,reconstruction.tobytes()==im.tobytes())
  else:check('body binary alpha '+label,set(im.getchannel('A').get_flattened_data())<={0,255})
 check('terminal hold '+clip['id'],clip['action'] not in ['death','subdued'] or (clip['holdLast'] and not clip['loop']))
check('no synthetic eight-view claim',set(manifest['coverage']['realDirections'])=={c['direction'] for c in manifest['clips']})
check('actual key count',manifest['coverage']['bodyKeys']==sum(len(c['frames']) for c in manifest['clips']))
check('actual clip count',manifest['coverage']['bodyClips']==len(manifest['clips']))
check('planned coverage stays separate',plan['targetBodyClips']>=len(manifest['clips']))
for checkpoint in [R/'checkpoints/main-8dir/checkpoint.json',R/'checkpoints/story-views/checkpoint.json',R/'review/limb-audit-v1/technical-checkpoint.json',*sorted((R/'checkpoints/enemy-views').glob('*/checkpoint.json')),*sorted((R/'checkpoints/enemy-motion').glob('*/checkpoint.json'))]:
 if checkpoint.exists():
  for pin in read(checkpoint)['files']:check('checkpoint '+pin['file'],sha(R/pin['file'])==pin['sha256'])
report={'schema':'gdd-character-animation-verification-1','date':'2026-10-15','status':'passed','checks':len(checks),'actualCoverage':manifest['coverage'],'targetBodyClips':plan['targetBodyClips'],
 'approvedNeutralBasisPins':len(basis['files']),'sourceJobs':len(ledger['jobs']),'realViewMasters':len(view_registration['records']),'ownerMotionApprovalInferred':False,'runtimeIntegrated':False,
 'rootRegistrationStatus':'candidate dark-boot witnesses and explicit low-pose projections; technical hash checks do not approve roots or motion'}
(R/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
