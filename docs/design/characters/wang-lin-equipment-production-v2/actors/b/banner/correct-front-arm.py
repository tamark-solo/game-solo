from pathlib import Path
from PIL import Image,ImageDraw
import json
R=Path(__file__).resolve().parent;V=R.parents[2]
m=json.loads((R/'manual-registration.json').read_text(encoding='utf-8'));q=json.loads((R/'review/foundation-proposals.json').read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'));changes=[]
for sid,s in m['sources'].items():
 if sid not in q or q[sid]['direction'] not in ('east','southeast'):continue
 record=next(z for z in g['records'] if z['id']==sid);im=Image.open(V/record['raw']).convert('RGBA');entries=s['calibrations']+s['actions'].get('hit',[]);chart=Image.new('RGBA',(6*196,2*198),(31,42,52,255));dr=ImageDraw.Draw(chart)
 for e in entries:
  i=e['rawIndex'];p=q[sid]['entries'][i];l,top,right,bottom=p['bounds'];height=bottom-top;warm=p['warmProposals']
  candidates=[(n,a) for n,a in enumerate(warm) if a['area']<430 and a['area']>=60 and top+height*.30<a['center'][1]<top+height*.63]
  assert candidates,(sid,i,'Raised front empty fist needs explicit source selection')
  n,island=max(candidates,key=lambda pair:pair[1]['center'][0]);x,y,w,h=island['rect'];px,py=[round(a) for a in island['center']];desired=[px,py+10];cuff=[]
  for yy in range(desired[1]-4,desired[1]+5):
   for xx in range(desired[0]-4,desired[0]+5):
    rr,gg,bb,aa=im.getpixel((xx,yy))
    if aa>=128 and max(rr,gg,bb)<155:cuff.append([xx,yy])
  assert cuff,(sid,i,'Actual charcoal forearm cuff unavailable')
  wrist=min(cuff,key=lambda c:(c[0]-desired[0])**2+(c[1]-desired[1])**2);old=e['grip'];new={**old,'source':[px,py],'sourceWrist':wrist,'sourceOcclusionRect':[x-2,y-2,w+4,h+4],'visibility':'closed-grip','closedGripConfirmed':True,'attachmentPolicy':'held-candidate','sourcePalmReviewed':True,'sourceCuffReviewed':True,'sourceWristEstimated':False,'sourceCuffVisibility':'visible','sourceRoleOriginal':{k:old.get(k) for k in ['source','sourceWrist','visibility','attachmentPolicy']},'roleCorrection':'Own same-view core holds front raised fist; helper lower hand was physical but free-arm role. Actual same-source front raised fist/cuff selected, no body/root/scale/source change.','sourceSkinIslandProposalIndex':n,'manualEvidence':f'actors/b/banner/review/{sid}-front-arm-role-correction-3x.png','uncertaintyNativePx':1.5};e['grip']=new;changes.append({'sourceId':sid,'rawIndex':i,'previous':old['source'],'frontPalm':[px,py],'cuff':wrist,'sourceSkinIslandProposalIndex':n})
  cx=i%6*196;cy=(0 if i<6 else 1)*198;crop=im.crop((px-24,py-24,px+24,py+24)).resize((144,144),Image.Resampling.NEAREST);chart.alpha_composite(crop,(cx+18,cy+23));dr.ellipse((cx+87,cy+92,cx+93,cy+98),outline=(70,255,150),width=2);vx=cx+90+(wrist[0]-px)*3;vy=cy+95+(wrist[1]-py)*3;dr.ellipse((vx-3,vy-3,vx+3,vy+3),outline=(255,215,70),width=2);dr.text((cx+3,cy+3),f'{i} raised front fist',fill=(230,230,210));dr.text((cx+3,cy+174),f'p{[px,py]} cuff{wrist}',fill=(190,205,220))
 chart.save(R/'review'/f'{sid}-front-arm-role-correction-3x.png');s['frontArmRoleCorrectionReviewed']=True
(R/'manual-registration.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(R/'review/front-arm-role-corrections.json').write_text(json.dumps({'changes':changes,'ownerApproved':False,'runtimeIntegrated':False},indent=2)+'\n',encoding='utf-8');print(json.dumps({'correctedHands':len(changes)}))
