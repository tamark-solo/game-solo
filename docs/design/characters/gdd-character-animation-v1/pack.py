"""Append source-reviewed body clips with one scale per source and explicit roots."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib
import json
import statistics,io
from source_tools import components,rows_of,isolated_pose,boot_proposal,isolated_soft_pose
from soft_extent import bounded_soft_pose
from reviewed_layout import wide_layout_matches

R=Path(__file__).resolve().parent;W=R.parents[3]
assert not (R/'approval.json').exists(),'Approved motion package is read-only'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ledger=read(R/'generation.json');basis=read(R/'basis.json')
for pin in basis['files']:assert sha(W/pin['file'])==pin['sha256'],'approved neutral changed '+pin['file']
old=read(R/'manifest.json') if (R/'manifest.json').exists() else {'clips':[],'sources':[]}
for checkpoint in [R/'checkpoints/main-8dir/checkpoint.json',R/'checkpoints/story-views/checkpoint.json',R/'review/limb-audit-v1/technical-checkpoint.json',*sorted((R/'checkpoints/enemy-views').glob('*/checkpoint.json')),*sorted((R/'checkpoints/enemy-motion').glob('*/checkpoint.json'))]:
 if checkpoint.exists():
  for pin in read(checkpoint)['files']:assert sha(R/pin['file'])==pin['sha256'],'Technical checkpoint changed '+pin['file']
clip_map={c['id']:c for c in old['clips']};source_map={s['id']:s for s in old['sources']}
for job in ledger['jobs']:
 if job['status']=='planned' or not job.get('sourceViewed') or not job.get('sourcePackingAllowed'):continue
 if job['id'] in source_map:
  assert sha(R/job['source'])==source_map[job['id']]['sha256'],'Recorded source changed'
  expected=[job['actorId']+'-'+a+'-'+job['direction'] for a in job['actions'] if a not in job.get('excludedActions',[])]
  if all(c in clip_map for c in expected):continue
 source=Image.open(R/job['source']).convert('RGBA');assert sha(R/job['source'])==job['sourceSha256']
 region_set=components(source);large=[r for r in region_set if r['large']];cols,nrows=job.get('observedGrid',job['grid']);rows=rows_of(large,nrows,source.height)
 assert len(rows)==nrows,'Unexpected source row count '+job['id']
 if job.get('layoutType')=='paired-run-3x3':
  if not all(len(row)==3 for row in rows):
   job.setdefault('sourceRowFailures',{})['run']={'reason':'paired gait requires three complete figures per row','observedRows':[len(r) for r in rows]}
   continue
  calibration=rows[0];action_groups=[('run',[p for row in rows[1:] for p in row])]
 elif job.get('calibrationPoses')==8:
  if not wide_layout_matches(job,rows):
   job.setdefault('sourceRowFailures',{})[job['actions'][0]]={'reason':'wide-source touching or incomplete regions','observedRows':[len(r) for r in rows],'expectedColumns':cols}
   continue
  calibration=[p for row in rows[:2] for p in row];action_groups=[(job['actions'][0],[p for row in rows[2:] for p in row])]
 else:
  assert len(rows[0])==cols,'Neutral row incomplete';calibration=rows[0];action_groups=[]
  for i,action in enumerate(job['actions'],1):
   if action in job.get('excludedActions',[]):continue
   if len(rows[i])!=cols:
    job.setdefault('sourceRowFailures',{})[action]={'reason':'touching or incomplete alpha regions','observedRegions':len(rows[i]),'expected':cols}
    continue
   action_groups.append((action,rows[i]))
 def at_source_edge(region):
  x0,y0,x1,y1=region['box'];return x0<=0 or y0<=0 or x1>=source.width or y1>=source.height
 if any(at_source_edge(p) for p in calibration):
  job['sourceCalibrationFailure']='Physical neutral core reaches raw edge; do not derive scale from an incomplete calibration.'
  continue
 valid_groups=[]
 for action,regions in action_groups:
  if action in job.get('excludedActions',[]):continue
  indexes=job.get('activeActionIndexes',list(range(len(regions))))
  indexes=job.get('poseSelections',{}).get(action,indexes)
  bad=[i for i in indexes if at_source_edge(regions[i])]
  if bad:job.setdefault('sourceRowFailures',{})[action]={'reason':'source-edge clipping','sourcePoseIndexes':bad}
  else:valid_groups.append((action,regions))
 action_groups=valid_groups
 factor=job['bodyNominalPx']/statistics.mean(p['box'][3]-p['box'][1] for p in calibration)
 soft=job.get('alphaPolicy')=='preserved-soft-RGBA'
 neutral_roots=[({'root':[(p['box'][0]+p['box'][2])/2,p['box'][3]+4/factor],'confidence':'estimated spectral extent projection, no boot claim'} if soft else boot_proposal(source,p['box'])) for p in calibration]
 assert all(p['root'][0] is not None for p in neutral_roots),'Neutral boot witness absent'
 source_record={'id':job['id'],'file':job['source'],'sha256':job['sourceSha256'],'size':list(source.size),'observedGrid':[cols,nrows],
  'observedRowCounts':[len(row) for row in rows],'sourceLayoutWitness':job.get('sourceLayoutWitness'),
  'oneScale':factor,'nominalBodyPx':job['bodyNominalPx'],'calibrationBounds':[p['box'] for p in calibration],'calibrationSupportProposals':neutral_roots,
  'rootReview':'candidate-witnesses-await-native-review','alphaPolicy':job.get('alphaPolicy','body-binary-alpha128-after-nearest'),'softExtentPolicy':job.get('softExtentPolicy'),'sourceViewed':True,'excludedActions':job.get('excludedActions',[]),'rejectedRows':job.get('sourceRowFailures',{}),'acceptedActions':[a for a,_ in action_groups]}
 source_map[job['id']]=source_record
 for action,regions in action_groups:
  selected=job.get('activeActionIndexes',list(range(len(regions))))
  selected=job.get('poseSelections',{}).get(action,selected)
  clip_id=job['actorId']+'-'+action+'-'+job['direction']
  if clip_id in clip_map:
   assert clip_map[clip_id]['sourceSha256']==job['sourceSha256'],'Active clip source changed'
   for f in clip_map[clip_id]['frames']:assert sha(R/f['file'])==f['sha256'],'Existing canonical changed'
   continue
  if action=='death':canvas=(160,112);pivot=(80,104)
  else:canvas=(112,112);pivot=(56,104)
  if soft:canvas=(144,144) if job['bodyNominalPx']>80 else (128,128);pivot=(canvas[0]//2,canvas[1]-8)
  elif job['bodyNominalPx']>100:canvas=(256,208);pivot=(128,192)
  if job.get('bodyCanvas'):canvas=tuple(job['bodyCanvas']);pivot=tuple(job['bodyPivot'])
  proposals=[({'root':[neutral_roots[i%len(neutral_roots)]['root'][0],p['box'][3]+4/factor],'confidence':'estimated spectral extent projection, no boot claim'} if soft else boot_proposal(source,p['box'])) for i,p in enumerate(regions)]
  # Wide action sheets span two physical rows. A common source-space Y across
  # those rows would turn the row gap into a false flight lift.
  physical_row_size=cols if job.get('calibrationPoses')==8 or job.get('layoutType')=='paired-run-3x3' else len(regions)
  run_grounds={i:max(proposals[k]['root'][1] or regions[k]['box'][3] for k in range(i//physical_row_size*physical_row_size,min(len(regions),(i//physical_row_size+1)*physical_row_size))) for i in range(len(regions))}
  frames=[];atlas=Image.new('RGBA',(len(selected)*(canvas[0]+4),canvas[1]+4))
  folder=R/'frames'/clip_id;folder.mkdir(parents=True,exist_ok=True)
  for out_index,index in enumerate(selected):
   region=regions[index];pose,box=(bounded_soft_pose(source,region,region_set,factor) if job.get('softExtentPolicy')=='alpha8-body-plus-native3px-original-rgba' else isolated_soft_pose(source,region,region_set)) if soft else isolated_pose(source,region,region_set);proposal=proposals[index]
   low=(action=='death' and index>=1) or (action=='meditate' and index>=2)
   if soft:
    root=[neutral_roots[index%len(neutral_roots)]['root'][0],run_grounds[index]];kind='estimated-ground-projection-of-hovering-spirit';uncertainty=3
   elif low:
    root=[neutral_roots[index%len(neutral_roots)]['root'][0],box[3]];kind='estimated-support-projection-reviewed-pose';uncertainty=3
   else:
    assert proposal['root'][0] is not None,'Boot proposal missing '+clip_id
    root=list(proposal['root']);kind='lower-dark-stone-foot-witness-candidate' if job.get('supportMode')=='stone-foot' else 'lower-dark-boot-witness-candidate';uncertainty=1
   lift=0
   if action=='run':lift=max(0,(run_grounds[index]-root[1])*factor);root[1]=run_grounds[index]
   resized=pose.resize((max(1,round(pose.width*factor)),max(1,round(pose.height*factor))),Image.Resampling.NEAREST)
   offset=[round(pivot[0]-(root[0]-box[0])*factor),round(pivot[1]-(root[1]-box[1])*factor)]
   native=Image.new('RGBA',canvas);native.paste(resized,tuple(offset));assert offset[0]>=0 and offset[1]>=0 and offset[0]+resized.width<=canvas[0] and offset[1]+resized.height<=canvas[1],'Canonical clipping '+clip_id
   path=folder/f'{out_index:02d}.png';buffer=io.BytesIO();native.save(buffer,format='PNG');payload=buffer.getvalue()
   if path.exists():assert path.read_bytes()==payload,'Unregistered existing frame differs; keep history before a correction'
   else:path.write_bytes(payload)
   rect=[out_index*(canvas[0]+4)+2,2,*canvas];atlas.paste(native,tuple(rect[:2]))
   duration=job.get('previewDurationMsByAction',{}).get(action,[])
   duration=duration[out_index] if duration else 100 if action=='run' else 140 if action=='hit' else 180 if action in ['idle','talk','move'] else 160
   frames.append({'file':path.relative_to(R).as_posix(),'sha256':sha(path),'index':out_index,'sourcePoseIndex':index,'sourceRect':box,'sourceRoot':root,'bootWitnessProposal':proposal,
    'pivot':list(pivot),'durationMs':duration,'atlasRect':rect,'supportKind':kind,'supportUncertaintyNativePx':uncertainty,'bodyLiftNativePx':lift,'liftAlreadyBaked':True,
    'pixelsResampled':True,'pixelsRepainted':False,'bounds':list(native.getchannel('A').getbbox())})
  atlas_path=R/'atlases'/f'{clip_id}.png';atlas_path.parent.mkdir(exist_ok=True);atlas.save(atlas_path)
  clip={'id':clip_id,'actorId':job['actorId'],'name':job['name'],'group':job['group'],'direction':job['direction'],'action':action,'sourceJob':job['id'],'sourceSha256':job['sourceSha256'],
   'sourceScale':factor,'canvas':list(canvas),'pivot':list(pivot),'frames':frames,'atlas':{'file':atlas_path.relative_to(R).as_posix(),'sha256':sha(atlas_path),'size':list(atlas.size),'gutterPx':2},
   'loop':action in ['idle','run','move','talk'],'holdLast':action in ['death','subdued'],'sustainFrames':list(range(max(0,len(frames)-3),len(frames))) if action=='meditate' else [],'rootReviewCompleted':False,'ownerArtApproved':False,'ownerMotionApproved':False,'runtimeReady':False,
   'alphaPolicy':source_record['alphaPolicy'],'phaseLabels':job.get('phaseLabels',{}).get(action,[]),'timingIsGameplayBalance':False,'excludedSourcePoseIndexes':[i for i in range(len(regions)) if i not in selected]}
  clip_map[clip_id]=clip
  cell_width=max(128,canvas[0]+16);contact_height=max(144,canvas[1]+32);contact_floor=contact_height-20
  sheet=Image.new('RGBA',(max(6,len(frames))*cell_width,contact_height),(26,36,43,255));draw=ImageDraw.Draw(sheet)
  for i,frame in enumerate(frames):
   image=Image.open(R/frame['file']);x=i*cell_width+cell_width//2-frame['pivot'][0];y=contact_floor-frame['pivot'][1];sheet.alpha_composite(image,(x,y));draw.line((i*cell_width+4,contact_floor,(i+1)*cell_width-4,contact_floor),fill=(80,100,110));draw.text((i*cell_width+6,contact_floor+6),str(frame['sourcePoseIndex']+1),fill=(230,220,200))
  sheet.save(R/'review'/f'{clip_id}-contact.png')
manifest={'schema':'gdd-character-animation-manifest-1','date':'2026-10-15','status':'in-production-new-motion-candidate','sources':list(source_map.values()),'clips':list(clip_map.values()),
 'coverage':{'sourceSheetsPacked':len(source_map),'bodyClips':len(clip_map),'bodyKeys':sum(len(c['frames']) for c in clip_map.values()),'actorForms':len({c['actorId'] for c in clip_map.values()}),'realDirections':sorted({c['direction'] for c in clip_map.values()})},
 'runtimeIntegrated':False,'ownerMotionApprovalInferred':False}
write(R/'generation.json',ledger);write(R/'manifest.json',manifest);progress=read(R/'progress.json');progress.update(packedBodyClips=len(clip_map),packedBodyKeys=manifest['coverage']['bodyKeys'],generatedSources=sum(j['status']!='planned' for j in ledger['jobs']),sourceSheetsPacked=len(source_map),totalSourceJobs=len(ledger['jobs']),remainingBodyClips=read(R/'production-plan.json')['targetBodyClips']-len(clip_map));write(R/'progress.json',progress)
print(json.dumps(manifest['coverage']))
