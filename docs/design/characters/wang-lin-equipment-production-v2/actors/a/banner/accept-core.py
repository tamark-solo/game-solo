from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8')) if (ROOT/name).exists() else {}
def write(name,d):(ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
gen=read('generation.json');geo=read('source-geometry.json');measure=read('source-measurements.json');review=read('review-state.json')
ids=['banner-a-east-core-r1','banner-a-southeast-core-r1','banner-a-south-core-r1','banner-a-southwest-core-r2','banner-a-west-core-r2','banner-a-northwest-core-r2']
for sid in ids:
 s=next(s for s in geo['sources'] if s['id']==sid);assert not any(s['sourceEdges'].values());assert len(s['calibrations'])==6
 measure[sid]={'calibrations':[{'crownY':p['core'][1],'bootRoot':p['root'],'sourceCrownBootReviewed':True,'method':'Full source and native1x/2x contact visually reviewed; upper crown and six actual dark boot pairs identified. Lower5percent spans cover dark soles only, no robe or prop used. Same one factor/source from median six calibrations.'} for p in s['calibrations']]}
 r=next(r for r in gen['records'] if r['id']==sid);r.update({'selected':True,'selectedActions':r['actions'],'sourceViewed':True,'status':'selected-body-candidate-awaiting-manual-palm-root','sourceCompletenessReviewed':True});review[sid]={'sourceCompletenessReviewed':True,'sourceViewReviewed':True,'headTorsoFirstRecoveryViewed':True,'nativeSourceContactViewed':s['contact'],'cameraAssessment':'True requested source view; own Banner head/outfit retained, Wang supports treatment only. Side-profile torso has mild three-quarter cloth opening. Failed wrong-right sources preserved separately.','sourceOpaqueComponentMaskPolicy':'Whole alpha128 connected body masks only where bounding rectangles overlap; every source opaque pixel assigned exactly once, no pose fit or body repaint.'}
 for action in ['idle','run','cast-single-target','cast-aoe']:
  key='banner-a-'+s['direction']+'-'+action;review.setdefault(key,{})['headTorsoFirstRecoveryViewed']=True
 if s['direction'] in ['southeast','south','northwest']:
  review['banner-a-'+s['direction']+'-run']={'actionIndices':[0,1,2,3,4],'dropReason':'Sixth source figure is standing recovery rather than a full running stride; kept in immutable raw and omitted from active run loop.','headTorsoFirstRecoveryViewed':True}
for sid in ['banner-a-southwest-core-r1','banner-a-west-core-r1','banner-a-northwest-core-r1']:
 r=next(r for r in gen['records'] if r['id']==sid);r.update({'selected':False,'selectedActions':[],'sourceViewed':True,'status':'history-wrong-right-facing-view'});review[sid]={'sourceViewReviewed':True,'sourceCompletenessReviewed':True,'selected':False,'reason':'Wrong camera faces screen right instead of requested left/back-left; superseded by genuine same-own source ImageGen camera edit r2, no mirror.'}
write('generation.json',gen);write('source-measurements.json',measure);write('review-state.json',review);print('Six core sources accepted after actual source/native visual review; three wrong cameras history.')
