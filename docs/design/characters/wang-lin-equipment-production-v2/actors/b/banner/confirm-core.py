from pathlib import Path
from PIL import Image,ImageDraw
import json
R=Path(__file__).resolve().parent;V=R.parents[2]
p=json.loads((R/'manual-registration-proposed.json').read_text(encoding='utf-8'));q=json.loads((R/'review/core-proposals.json').read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'))
overrides={('north',20):(0,[570,845],'open-palm'),('northeast',20):(1,[571,868],'seal'),('east',25):(1,[363,1142],'seal'),('south',20):(1,[550,884],'seal'),('south',21):(0,[796,861],'open-palm'),('south',22):(1,[1005,862],'open-palm'),('south',27):(1,[789,1107],'open-palm'),('west',21):(1,[797,870],'open-palm'),('southeast',21):(1,[806,859],'open-palm'),('southeast',22):(0,[1003,864],'open-palm'),('southeast',27):(1,[798,1102],'open-palm'),('southeast',28):(1,[1004,1105],'open-palm')}
closed_planted={'north':[19,23,25,26,28,29],'northeast':[23,26,29],'east':[23,26,29],'south':[23,29],'west':[23,29],'southeast':[19,23,25,26,29],'southwest':[23,28,29]}
for sid,src in p['sources'].items():
 d=q[sid]['direction'];record=next(r for r in g['records'] if r['id']==sid);im=Image.open(V/record['raw']).convert('RGBA');all_entries=src['calibrations']+[e for items in src['actions'].values() for e in items]
 for e in all_entries:
  index=e['rawIndex'];hand=e['grip'];override=overrides.get((d,index))
  if override:
   n,wrist,vis=override;island=q[sid]['entries'][index]['warmProposals'][n];x,y,w,h=island['rect'];px,py=island['center'];hand.update(source=[round(px),round(py)],sourceWrist=wrist,sourceOcclusionRect=[x-2,y-2,w+4,h+4],visibility=vis,closedGripConfirmed=False,attachmentPolicy='ground-planted-command',correction='Manually selected actual palm from enlarged source crop, replacing face/offhand proposal; source bytes unchanged')
  if index in closed_planted.get(d,[]):hand.update(visibility='closed-grip',closedGripConfirmed=True,attachmentPolicy='ground-planted-command')
  if d=='northwest' and index==3:
   hand.update(source=[690,140],sourceWrist=[697,150],sourceOcclusionRect=[684,132,16,18],visibility='occluded',closedGripConfirmed=False,attachmentPolicy='ground-planted-command',uncertaintyNativePx=3,occludedReason='Near closed palm hidden entirely by ivory sleeve/hair in actual neutral source; estimated socket never claims held agreement')
  if d=='northwest' and index in (23,29):hand.update(visibility='visible-palm',closedGripConfirmed=False,attachmentPolicy='ground-planted-command',selection='actual-visible-relaxed-hand-recovery')
  hand.update(sourcePalmReviewed=True,sourceCuffReviewed=True,manualConfirmed=True,selection=hand.get('selection') if hand.get('visibility')=='occluded' else 'manually-reviewed-own-source-palm-and-cuff',reviewEvidence=f'actors/b/banner/review/{sid}-selected-palms-cuffs-reviewed.png')
  e.update(sourceRootReviewed=True);e['sourceRootMeasurement'].update(manualReviewed=True,reviewEvidence=f'actors/b/banner/review/{sid}-proposals.png')
 src.update(manualConfirmed=True,sourceViewed=True,directionReviewed=True,headTorsoFirstRecoveryReviewed=True,palmCuffReviewScope='Every source hand inset viewed at3x; false face/ear/freehand selections corrected with actual same-source palm and visible cuff, occluded near hand remains estimate without held agreement.')
 chart=Image.new('RGBA',(6*196,5*198),(31,42,52,255));dr=ImageDraw.Draw(chart)
 for e in all_entries:
  index=e['rawIndex'];h=e['grip'];px,py=h['source'];wx,wy=h['sourceWrist'];cx=index%6*196;cy=index//6*198
  crop=im.crop((round(px)-24,round(py)-24,round(px)+24,round(py)+24)).resize((144,144),Image.Resampling.NEAREST);chart.alpha_composite(crop,(cx+18,cy+23));dr.ellipse((cx+87,cy+92,cx+93,cy+98),outline=(70,255,150),width=2);vx=cx+90+(wx-px)*3;vy=cy+95+(wy-py)*3;dr.ellipse((vx-3,vy-3,vx+3,vy+3),outline=(255,215,70),width=2);dr.text((cx+3,cy+3),f'{index} {h["visibility"]}',fill=(230,230,210));dr.text((cx+3,cy+174),f'p{h["source"]} cuff{h["sourceWrist"]}',fill=(190,205,220))
 chart.save(R/'review'/f'{sid}-selected-palms-cuffs-reviewed.png')
existing=json.loads((R/'manual-registration.json').read_text(encoding='utf-8')) if (R/'manual-registration.json').exists() else {'sources':{}}
existing['sources'].update(p['sources']);existing.update(manualReviewPending=True,reviewScope='Core source/manual palms/cuffs/root candidate reviewed; foundation and native contacts pending.')
(R/'manual-registration.json').write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('8 core registrations, candidate only; native contacts pending')
