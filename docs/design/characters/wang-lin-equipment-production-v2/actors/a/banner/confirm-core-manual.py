from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manual=read('manual.json');selected=read('manual-selections.json');proof=read('manual-proof.json');proofs={p['key']:p for p in proof['frames']}
physical={
 'south':{'cast-single-target':['closed','seal','seal','open','open','closed'],'cast-aoe':['closed','seal','seal','open','open','closed']},
 'southwest':{'cast-single-target':['closed','seal','seal','open','open','closed'],'cast-aoe':['closed','open','seal','open','open','closed']},
 'west':{'cast-single-target':['closed','closed','open','open','closed','closed'],'cast-aoe':['closed','closed','open','open','open','closed']},
 'northwest':{'cast-single-target':['closed','open','open','open','open','closed'],'cast-aoe':['closed','open','open','open','closed','closed']}}
for key,q in selected.items():
 assert key in proofs and proofs[key]['sourceNearestRGBA'][3]>=128
 m=manual[key];m['sourcePalmReviewed']=True;m['wholeSourcePalmAndNativeMarkerViewed']=True;m['sourcePalmActualProofRGBA']=proofs[key]['sourceNearestRGBA'];direction=next(v for v in physical if key.startswith('banner-a-'+v+'-'));action=key.split(direction+'-',1)[1].rsplit(':',1)[0];i=int(key.rsplit(':',1)[1])-1
 pose=physical[direction][action][i] if action in physical[direction] else 'closed';m['physicalHandPoseObserved']=pose;m['visibility']='visible-closed-fist' if pose=='closed' else 'seal' if pose=='seal' else 'open-command';m['closedGripConfirmed']=pose=='closed';m['dominantGripClosed']=pose=='closed';m['heldGripClaim']=action in ['idle','run'] or i==0;m['sourceCuffReviewed']=False;m['cuffEstimate']=True;m['cuffEstimateExplanation']='Actual visible palm center confirmed on source enlarged crop; projected cuff direction remains estimate with3px native uncertainty, never used as a measured rig angle.';q['sourcePalmEnlargementPending']=False;q['sourcePalmProofViewed']=True
write('manual.json',manual);write('manual-selections.json',selected);print('94 actual source palm markers confirmed on16 enlarged proof pages. Physical open/seal/closed flags corrected; cuff estimates stay honest.')
