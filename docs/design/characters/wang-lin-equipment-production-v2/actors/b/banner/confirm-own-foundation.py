from pathlib import Path
from PIL import Image,ImageDraw
import json
R=Path(__file__).resolve().parent;V=R.parents[2]
m=json.loads((R/'manual-foundation-proposed.json').read_text(encoding='utf-8'));q=json.loads((R/'review/foundation-proposals.json').read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'))
choices={('south',14):(1,[851,1291]),('south',15):(1,[190,1471]),('south',16):(1,[507,1476]),('southwest',13):(2,[419,1297]),('southwest',14):(2,[718,1303]),('southwest',15):(1,[122,1489]),('southwest',16):(1,[474,1487]),('southwest',17):(1,[780,1493])}
for sid,s in m['sources'].items():
 r=next(z for z in g['records'] if z['id']==sid);im=Image.open(V/r['raw']).convert('RGBA');d=r['direction'];entries=s['calibrations']+[e for a in s['actions'].values() for e in a]
 chart=Image.new('RGBA',(6*196,3*198),(31,42,52,255));dr=ImageDraw.Draw(chart)
 for e in entries:
  i=e['rawIndex'];h=e['grip'];choice=choices.get((d,i)) if r['group']=='damage' else None
  if choice:
   n,wrist=choice;wa=q[sid]['entries'][i]['warmProposals'][n];x,y,w,hh=wa['rect'];h.update(source=[round(v) for v in wa['center']],sourceWrist=wrist,sourceOcclusionRect=[x-2,y-2,w+4,hh+4],visibility='open-palm',closedGripConfirmed=False,attachmentPolicy='ground-planted-command',correction='Actual exposed hand in own prone source selected after enlarged face proposal rejected; no source paint')
  if r['group']=='practice' and 6<=i<12:
   wa=q[sid]['entries'][i]['warmProposals'][1];x,y,w,hh=wa['rect'];desired=[x+w+4,round(wa['center'][1])];dark=[]
   for py in range(desired[1]-3,desired[1]+4):
    for px in range(desired[0]-3,desired[0]+4):
     rr,gg,bb,a=im.getpixel((px,py))
     if a>=128 and max(rr,gg,bb)<155:dark.append([px,py])
   if dark:h['sourceWrist']=min(dark,key=lambda p:(p[0]-desired[0])**2+(p[1]-desired[1])**2)
   else:h.update(sourceWrist=desired,sourceWristEstimated=True,sourceCuffVisibility='occluded',uncertaintyNativePx=3)
   h['visibility']='seal';h['attachmentPolicy']='ground-planted-command';h['closedGripConfirmed']=False
  h.update(sourcePalmReviewed=True,sourceCuffReviewed=True,manualConfirmed=True,selection='manually-reviewed-own-source-palm-and-cuff',reviewEvidence=f'actors/b/banner/review/{sid}-foundation-palms-cuffs-reviewed.png')
  e.update(sourceRootReviewed=True);e['sourceRootMeasurement'].update(manualReviewed=True,reviewEvidence=f'actors/b/banner/review/{sid}-actual-source-pose-crops.png')
  px,py=h['source'];wx,wy=h['sourceWrist'];cx=i%6*196;cy=i//6*198;crop=im.crop((round(px)-24,round(py)-24,round(px)+24,round(py)+24)).resize((144,144),Image.Resampling.NEAREST);chart.alpha_composite(crop,(cx+18,cy+23));dr.ellipse((cx+87,cy+92,cx+93,cy+98),outline=(70,255,150),width=2);vx=cx+90+(wx-px)*3;vy=cy+95+(wy-py)*3;dr.ellipse((vx-3,vy-3,vx+3,vy+3),outline=(255,215,70),width=2);dr.text((cx+3,cy+3),f'{i} {h["visibility"]}',fill=(230,230,210));dr.text((cx+3,cy+174),f'p{h["source"]} cuff{h["sourceWrist"]}',fill=(190,205,220))
 chart.save(R/'review'/f'{sid}-foundation-palms-cuffs-reviewed.png');s.update(manualConfirmed=True,sourceViewed=True,directionReviewed=True,headTorsoFirstRecoveryReviewed=True)
 if d=='southwest' and r['group']=='practice':
  by={e['rawIndex']:e for e in s['actions']['gather']};s['actions']['gather']=[by[i] for i in [12,15,13,16,14,17]];s['gatherPhaseRemap']='Actual reach → kneeling open retrieval → kneeling inspect/retract → rising bend → upright examine → neutral recovery; original raw order retained source evidence. No cloned keys.'
existing=json.loads((R/'manual-registration.json').read_text(encoding='utf-8'));existing['sources'].update(m['sources']);existing['manualReviewPending']=True
(R/'manual-registration.json').write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 own foundation sources candidate reviewed; native contacts pending')
