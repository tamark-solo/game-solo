from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manual=read('manual.json');obs=read('manual-selections.json')
for key,m in manual.items():
 parts=key.split(':');cid=parts[0]
 if not any(cid=='banner-a-'+v+'-'+a for v in ['south','southwest','west','northwest'] for a in ['hit','death','meditate','gather']):continue
 action=cid.split('-')[-1];i=int(parts[1]);direction=cid[len('banner-a-'):-len(action)-1]
 m['sourcePalmReviewed']=True;m['manualSourceViewed']=True;m['sourceBodyFirstRecoveryViewed']=True
 m['physicalHandPoseObserved']='occluded-under-hair-support-projection' if m['palmEstimated'] else 'closed-front-fist' if action=='hit' else 'visible-lap-hand-fragment' if direction=='northwest' and action=='meditate' else 'resting-lap-seal' if action=='meditate' else 'falling-or-ground-resting-hand' if action=='death' else 'reaching-or-inspecting-free-hand'
 if direction=='northwest' and action=='meditate' or direction=='northwest' and action=='gather' and i==1:m['visibility']='visible-fragment';m['palmUncertaintyNativePx']=3
 if action=='gather' and i>=4:m['physicalHandPoseObserved']='closed-free-inspection-or-recovery-fist';m['closedGripConfirmed']=True
 m['heldGripClaim']=action=='hit';m['dominantGripClosed']=action=='hit';m['cuffEstimate']=True
 m['manualReviewMethod']='All24 source/native poses for this direction viewed in four full-body/contact pages; green source-palm marks rechecked at enlargement. NW lap/ready-gather ivory cuff islands corrected to actual small exposed hand fragments. Cuff remains3px projected estimate; hidden NW death6 is5px lap/ground hand projection and never held.'
 obs[key]['sourcePalmEnlargementPending']=False;obs[key]['sourcePalmProofViewed']=True
write('manual.json',manual);write('manual-selections.json',obs);print('96 own foundation source hands reviewed; no source artwork edits.')
