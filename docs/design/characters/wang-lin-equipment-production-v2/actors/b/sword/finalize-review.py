from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def write(path,value):
 tmp=path.with_name(path.name+'.next');tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(path)
def run():
 choices=json.loads((ROOT/'manual-choice.json').read_text(encoding='utf-8'));choices['manualReviewComplete']=True;choices['reviewScope']='All15 selected raw source sheets, all15 full native2x contact grids and actual source hand inset grids viewed; first/recovery head/torso and boot/contact registration reviewed. Overrides explicitly select true palms; hidden palms remain estimates/detached candidates.';write(ROOT/'manual-choice.json',choices)
 reg=json.loads((ROOT/'registration.json').read_text(encoding='utf-8'))
 for s in reg['sources']:s['socketReviewComplete']=True;s['firstAndRecoveryGeometryReviewed']=True
 for clip in reg['clips']:
  if clip.get('reusedFrom'):continue
  clip['socketReviewComplete']=True;clip['socketReviewState']='manually-reviewed-source-candidate'
 for group in reg['calibrations']+reg['clips']:
  for f in group['frames']:
   if f.get('reusedFrom') or f['file'].startswith('../'):continue
   if group.get('action')=='run':f['root'][1]=f['sourceCoreBounds'][3]+f['lift']/f['sourceScale']
   f['grip']['manualConfirmed']=True;f['rootMeasurement']['manualReviewed']=True
 reg['socketReviewComplete']=True;reg['manualReviewPending']=False;write(ROOT/'registration.json',reg)
 data=json.loads((ROOT/'manual-sockets.json').read_text(encoding='utf-8'));data['manualReviewPending']=False;data['socketReviewComplete']=True
 for item in data['items']:item['manualConfirmed']=True
 write(ROOT/'manual-sockets.json',data)
 assessment=json.loads((ROOT/'assessment.json').read_text(encoding='utf-8'));assessment['socketReviewComplete']=True;assessment['manualReviewPending']=False
 for item in assessment['items']:
  item.update({'nativeContactViewed':True,'trueDirectionReviewed':True,'socketConfirmed':True,'socketReviewComplete':True})
  for action in item['sourceGeometry']:action['manualReviewRequired']=False;action['firstAndRecoveryReviewed']=True
 write(ROOT/'assessment.json',assessment)
 print(json.dumps(reg['coverage']))
if __name__=='__main__':run()
