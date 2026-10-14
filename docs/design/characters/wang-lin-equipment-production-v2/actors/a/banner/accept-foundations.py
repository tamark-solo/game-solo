from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8')) if (ROOT/n).exists() else {}
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
gen=read('generation.json');geo=read('source-geometry.json');measure=read('source-measurements.json');review=read('review-state.json')
for s in geo['sources']:
 if s['group']=='core':continue
 assert not any(s['sourceEdges'].values());assert len(s['calibrations'])==6 and len(s['rows'])==6 and all(len(row)==3 for row in s['rows'])
 measure[s['id']]={'calibrations':[{'crownY':p['core'][1],'bootRoot':p['root'],'sourceCrownBootReviewed':True,'method':'All six upright calibration crowns and dark human boot pairs viewed on original source and native2x contact; no hem/pole/prop floor substitution. One factor/source is their measured median.'} for p in s['calibrations']]}
 r=next(r for r in gen['records'] if r['id']==s['id']);r.update({'selected':True,'selectedActions':r['actions'],'sourceViewed':True,'sourceCompletenessReviewed':True,'status':'selected-body-candidate-awaiting-source-palm-root-manual'});review[s['id']]={'sourceCompletenessReviewed':True,'sourceViewReviewed':True,'headTorsoFirstRecoveryViewed':True,'nativeSourceContactViewed':s['contact'],'actualSourcePoses':18,'cameraAssessment':'Own same-view Banner neutral primary retains head, torso and costume in actual six hit/death or seated/gather figures. Profile directions retain modest three-quarter robe opening; rear hidden palms are recorded as occluded, not true grip.','alphaPolicy':'Raw soft RGBA and nonzero RGB under alpha0 preserved. Canonical body follows existing alpha128 policy only; no background paint/removal or pixel cleanup.'}
 for action in s['actions']:review.setdefault('banner-a-'+s['direction']+'-'+action,{})['headTorsoFirstRecoveryViewed']=True
 if s['group']=='practice' and s['direction'] in ['south','southwest','west']:
  review['banner-a-'+s['direction']+'-gather']={'actionIndices':[3,0,1,2,4,5],'reorderReason':'Actual source key4 is initial bent/rising stance; order it before lower-knee reach/retrieve/inspect and the two distinct upright recoveries. No invented or cloned figures.','headTorsoFirstRecoveryViewed':True}
write('generation.json',gen);write('source-measurements.json',measure);write('review-state.json',review);print('Sixteen actual18-pose foundations accepted; cal source crowns/boots and first/recovery anatomy viewed. Palms/semantic roots still pending.')
