from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,math,importlib.util
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parent;V=R.parents[2]
s=importlib.util.spec_from_file_location('bt',R/'body-tools.py');t=importlib.util.module_from_spec(s);s.loader.exec_module(t)
q=json.loads((R/'review/foundation-proposals.json').read_text(encoding='utf-8'));g=json.loads((R/'generation.json').read_text(encoding='utf-8'));out={}
for sid,src in q.items():
 if src.get('direction') not in ('south','southwest'):continue
 r=next(z for z in g['records'] if z['id']==sid);im=Image.open(V/r['raw']).convert('RGBA');cells=[c for row in t.cells_for(im,3,6) for c in row];entries=[];d=r['direction'];chart=Image.new('RGBA',(6*196,3*198),(31,42,52,255));dr=ImageDraw.Draw(chart)
 for e,c in zip(src['entries'],cells):
  i=e['rawIndex'];stage=i%6;group='neutral' if i<6 else r['actions'][0] if i<12 else r['actions'][1];l,top,ri,bo=e['bounds'];w=ri-l;h=bo-top;warm=e['warmProposals'];root=list(e['rootProposal']);basis={**e['rootBasisProposal'],'semantic':'actual paired human dark-boot soles support projection','observedBodyContactY':root[1],'uncertaintyNativePx':1,'manualReviewed':False}
  if group=='death' and stage>=2:
   root,b=t.prone_boot_anchor(im,c,'left' if d=='south' else 'right');basis={**b,'semantic':'actual prone dark boot endpoint/sole projection; body rotates naturally to ground','observedBodyContactY':root[1],'uncertaintyNativePx':2,'manualReviewed':False}
  elif group in ('death','meditate','gather') or (group=='hit' and stage in (2,3,4)):
   basis.update(semantic='source seated/kneeling or staggered support envelope projection; clothed body is not exact pelvis bone',uncertaintyNativePx=3)
  assert warm
  if group in ('neutral','hit'):
   fx=.9 if d=='south' else .05;expected=[l+w*fx,top+h*.54];chosen=min(warm,key=lambda p:(p['center'][0]-expected[0])**2+(p['center'][1]-expected[1])**2)
  elif group=='meditate':
   eligible=[p for p in warm if p['center'][1]>top+h*.55] or warm;chosen=max(eligible,key=lambda p:p['area'])
  elif group=='gather':
   if stage in (0,1):chosen=max(warm,key=lambda p:p['center'][1])
   elif stage in (2,3):chosen=max(warm,key=lambda p:p['center'][0]) if d=='south' else min(warm,key=lambda p:p['center'][0])
   else:
    fx=.9 if d=='south' else .05;expected=[l+w*fx,top+h*.54];chosen=min(warm,key=lambda p:(p['center'][0]-expected[0])**2+(p['center'][1]-expected[1])**2)
  else:
   eligible=[p for p in warm if p['center'][1]>top+h*.48] or warm;chosen=max(eligible,key=lambda p:p['area'])
  x,y,ww,hh=chosen['rect'];px,py=chosen['center'];px,py=round(px),round(py);point=[px,py]
  if group=='meditate':desired=[px+10,py]
  elif group=='death' and stage>=2:desired=[px+(10 if d=='southwest' else -10),py]
  elif group=='gather' and stage<2:desired=[px,py-10]
  elif group=='gather' and stage in (2,3):desired=[px+(10 if d=='southwest' else -10),py]
  else:desired=[px,py+10]
  dark=[]
  for yy in range(max(0,desired[1]-5),min(im.height,desired[1]+6)):
   for xx in range(max(0,desired[0]-5),min(im.width,desired[0]+6)):
    rr,gg,bb,a=im.getpixel((xx,yy))
    if a>=128 and max(rr,gg,bb)<155:dark.append((xx,yy))
  wrist=list(min(dark,key=lambda p:(p[0]-desired[0])**2+(p[1]-desired[1])**2)) if dark else desired
  closed=group in ('neutral','hit')
  hand={'source':point,'sourceWrist':wrist,'sourceOcclusionRect':[x-2,y-2,ww+4,hh+4],'visibility':'closed-grip' if closed else 'open-palm','closedGripConfirmed':closed,'attachmentPolicy':'held-candidate' if closed else 'ground-planted-command','sourcePalmReviewed':False,'sourceCuffReviewed':False,'selection':'proposal-pending-manual-own-crop-review','uncertaintyNativePx':1.5,'occlusionApproved':False}
  ent={'rawIndex':i,'sourceRoot':root,'sourceRootReviewed':False,'sourceRootMeasurement':basis,'lift':0,'rendererAppliesLift':False,'grip':hand}
  if group=='neutral':ent.update(sourceCrownY=e['sourceCrownY'],sourceBootSoleY=e['sourceBootSoleY'])
  entries.append(ent);cx=i%6*196;cy=i//6*198;crop=im.crop((px-24,py-24,px+24,py+24)).resize((144,144),Image.Resampling.NEAREST);chart.alpha_composite(crop,(cx+18,cy+23));dr.ellipse((cx+87,cy+92,cx+93,cy+98),outline=(70,255,150),width=2);vx=cx+90+(wrist[0]-px)*3;vy=cy+95+(wrist[1]-py)*3;dr.ellipse((vx-3,vy-3,vx+3,vy+3),outline=(255,215,70),width=2);dr.text((cx+3,cy+3),f'{i} {group}',fill=(230,230,210));dr.text((cx+3,cy+174),f'p{point} cuff{wrist}',fill=(190,205,220))
 chart.save(R/'review'/f'{sid}-foundation-palms-cuffs-proposed.png')
 out[sid]={'sourceSha256':r['sha256'],'actualGrid':[3,6],'sourceViewed':True,'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,'calibrations':entries[:6],'actions':{r['actions'][0]:entries[6:12],r['actions'][1]:entries[12:18]},'manualConfirmed':False}
(R/'manual-foundation-proposed.json').write_text(json.dumps({'sources':out,'manualReviewPending':True},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sources':len(out),'handsProposed':sum(6+sum(len(v) for v in s['actions'].values()) for s in out.values())}))
