from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,math,statistics,importlib.util
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2]
s=importlib.util.spec_from_file_location('bt',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
prop=json.loads((R/'review/core-proposals.json').read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'));out={}
target={'north':(.95,.28),'northeast':(.91,.5),'east':(.85,.5),'southeast':(.95,.42),'south':(.88,.53),'west':(.1,.5),'southwest':(.04,.55),'northwest':(.05,.5)}
for sid,q in prop.items():
 r=next(z for z in g['records'] if z['id']==sid);im=Image.open(V/r['raw']).convert('RGBA');cells=[c for row in t.cells_for(im,6,5) for c in row];scale=80/statistics.median(e['soleProposal']-e['crownProposal'] for e in q['entries'][:6]);entries=[]
 chart=Image.new('RGBA',(6*196,5*198),(31,42,52,255));dr=ImageDraw.Draw(chart)
 for e,c in zip(q['entries'],cells):
  index=e['rawIndex'];row=index//6;col=index%6;stage=index%6;d=r['direction'];l,top,ri,bo=e['bounds'];w=ri-l;h=bo-top;warm=e['warmProposals'];fx,fy=target[d];expected=[l+w*fx,top+h*fy]
  assert warm,(sid,index,'No skin candidate; explicit hidden point required')
  if row>=3 and stage in (1,2) and not (row==4 and stage==2):
   eligible=[p for p in warm if p['area']<320 and (d=='north' or p['center'][1]>top+h*.32)] or warm
   chosen=max(eligible,key=lambda p:p['area'])
  elif row>=3 and stage in (3,4):
   eligible=[p for p in warm if p['area']<320 and p['area']>=70] or warm
   chosen=min(eligible,key=lambda p:p['center'][0]) if d in ('west','southwest','northwest') else max(eligible,key=lambda p:p['center'][0])
  elif row==4 and stage==2:
   eligible=[p for p in warm if p['area']<320 and p['area']>=70] or warm
   chosen=min(eligible,key=lambda p:p['center'][1])
  else:chosen=min(warm,key=lambda p:(p['center'][0]-expected[0])**2+(p['center'][1]-expected[1])**2)
  # Select actual opaque skin pixel nearest center, never an empty hole in concave palm.
  x,y,ww,hh=chosen['rect'];skin=[]
  for py in range(y,y+hh):
   for px in range(x,x+ww):
    rr,gg,bb,a=im.getpixel((px,py))
    if a>=128 and rr>175 and gg>100 and bb>65 and 25<rr-gg<100 and rr-bb>60 and gg-bb>20:skin.append((px,py))
  assert skin;p=min(skin,key=lambda p:(p[0]-chosen['center'][0])**2+(p[1]-chosen['center'][1])**2)
  # Reviewed cuff search in the actual connected body, on forearm side of skin island.
  command=row>=3 and stage in (3,4);left=d in ('west','southwest','northwest');desired=[p[0]+(10 if left else -10),p[1]] if command else [p[0],p[1]+10]
  candidates=[]
  for py in range(max(0,round(desired[1])-5),min(im.height,round(desired[1])+6)):
   for px in range(max(0,round(desired[0])-5),min(im.width,round(desired[0])+6)):
    rr,gg,bb,a=im.getpixel((px,py))
    if a>=128 and max(rr,gg,bb)<155:candidates.append((px,py))
  wrist=min(candidates,key=lambda z:(z[0]-desired[0])**2+(z[1]-desired[1])**2) if candidates else tuple(desired)
  root=list(e['rootProposal']);basis={**e['rootBasisProposal'],'semantic':'actual human dark boot sole/support plane','observedBodyContactY':root[1],'uncertaintyNativePx':2 if row==2 else 1,'manualReviewed':False}
  if row==2:
   # Boot/trouser support projection in actual lower22% ROI includes both visible raised and contact feet.
   miny=bo-round(h*.22);dark=[]
   for py in range(miny,bo):
    for px in range(l,ri):
     rr,gg,bb,a=im.getpixel((px,py))
     if a>=128 and max(rr,gg,bb)<120:dark.append(px)
   assert dark;root[0]=(min(dark)+max(dark))/2;basis.update(method='Actual opaque dark boot/trouser lower22% support envelope projected to visible sole plane; both raised/contact feet reviewed, no single-foot horizontal anchor or bbox fit',sourceRoi=[l,miny,w,bo-miny],uncertaintyNativePx=3,semantic='running paired-boot support projection; not exact pelvis bone')
  visibility='closed-grip';closed=True;policy='held-candidate'
  if row>=3 and (stage>0 or d=='southwest'):
   visibility='open-palm' if stage in (3,4) or (row==4 and stage==2) else 'seal';closed=False;policy='ground-planted-command'
  if d=='southwest' and row==2 and stage==3:visibility='open-palm';closed=False;policy='ground-planted-command'
  grip={'source':list(p),'sourceWrist':list(wrist),'sourceOcclusionRect':[x-2,y-2,ww+4,hh+4],'visibility':visibility,'closedGripConfirmed':closed,'attachmentPolicy':policy,'sourcePalmReviewed':False,'sourceCuffReviewed':False,'selection':'manual-source-candidate-pending-crop-review','uncertaintyNativePx':1.5,'occlusionApproved':False}
  ent={'rawIndex':index,'sourceRoot':root,'sourceRootReviewed':False,'sourceRootMeasurement':basis,'lift':0,'rendererAppliesLift':False,'grip':grip}
  if row==0:ent.update(sourceCrownY=e['crownProposal'],sourceBootSoleY=e['soleProposal'])
  entries.append(ent)
  cx=col*196;cy=row*198;crop=im.crop((p[0]-24,p[1]-24,p[0]+24,p[1]+24)).resize((144,144),Image.Resampling.NEAREST);chart.alpha_composite(crop,(cx+18,cy+23));dr.ellipse((cx+87,cy+92,cx+93,cy+98),outline=(70,255,150),width=2);wx=cx+90+(wrist[0]-p[0])*3;wy=cy+95+(wrist[1]-p[1])*3;dr.ellipse((wx-3,wy-3,wx+3,wy+3),outline=(255,215,70),width=2);dr.text((cx+5,cy+3),f'{index} {visibility}',fill=(230,230,210));dr.text((cx+5,cy+174),f'p{p} cuff{wrist}',fill=(190,205,220))
 chart.save(R/'review'/f'{sid}-selected-palms-cuffs-proposed.png')
 actions={a:entries[(i+1)*6:(i+2)*6] for i,a in enumerate(r['actions'])}
 if d in ('east','southwest'):actions['run']=actions['run'][:5]
 out[sid]={'sourceSha256':r['sha256'],'actualGrid':[6,5],'sourceViewed':True,'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,'calibrations':entries[:6],'actions':actions,'manualConfirmed':False,'droppedRawIndices':([17] if d in ('east','southwest') else []),'droppedReason':'Terminal run key is upright with both boots stationary; preserved raw but excluded active running loop.' if d in ('east','southwest') else None}
(R/'manual-registration-proposed.json').write_text(json.dumps({'sources':out,'manualReviewPending':True},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sources':len(out),'sourceHandsProposed':sum(6+sum(len(v) for v in p['actions'].values()) for p in out.values())}))
