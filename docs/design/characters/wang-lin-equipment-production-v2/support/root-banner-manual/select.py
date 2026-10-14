from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,math,hashlib
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
data=json.loads((SUPPORT/'proposals.json').read_text(encoding='utf-8'))
choices={
 'banner-b-north-damage-r1':[0,0,0,0,0,0,0,0,0,1,0,0,0,0,None,0,None,None],
 'banner-b-north-practice-r1':[0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,0],
 'banner-b-northeast-damage-r1':[1,1,1,2,1,1,1,1,1,0,1,0,1,0,0,0,0,0],
 'banner-b-northeast-practice-r1':[2,2,2,2,2,1,None,1,1,None,1,1,2,0,0,None,1,2]
}
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12);sources={}
for sid,s in data.items():
 im=Image.open(V2/'actors/b/banner/sources'/f'{sid}.png').convert('RGBA');entries=[]
 panel=Image.new('RGBA',(1200,900),(28,34,43,255));d=ImageDraw.Draw(panel)
 for e,selected in zip(s['entries'],choices[sid]):
  i=e['rawIndex'];l,t,r,b=e['bounds'];root=list(e['rootProposal']);kind='standing dark-boot sole/support projection';uncertainty=1
  if i>=6 and s['group']=='practice':kind='seated or kneeling support envelope; folded legs and cloth hide the anatomical center';uncertainty=3
  if s['group']=='damage' and i>=13:
   root[0]=round(l+(r-l)*(.64 if s['direction']=='north' else .38),3)
   kind='clothed torso/thigh support projection in side fall or prone pose; no exact pelvis or world-floor claim';uncertainty=5
  if selected is None:
   p=[round(l+(r-l)*(.69 if s['direction']=='north' else .87),3),round(t+(b-t)*(.27 if s['group']=='damage' else .69),3)]
   rect=[round(p[0])-4,round(p[1])-4,8,8];visibility='occluded';palm_method='Own wrist/forearm endpoint projection; actual palm is hidden by hair/cuff/body, no skin or closed-grip claim'
  else:
   warm=e['warmProposals'][selected];p=list(warm['center']);rect=warm['rect'];visibility='closed-grip' if i<6 or s['group']=='damage' and i<13 else 'open-palm'
   palm_method='Manual whole-pose review chose the actual hand skin island, excluding face/ear and alternate hand candidates'
   if s['group']=='damage' and i>=13:visibility='visible-fragment' if s['direction']=='north' and i==15 else 'open-palm'
   if s['direction']=='northeast' and s['group']=='practice' and i==7:visibility='visible-fragment'
  if s['direction']=='north':
   delta=[1,12] if i<6 or s['group']=='damage' and i<13 or s['group']=='practice' and i>=12 and i!=13 else [-11,-4] if s['group']=='practice' and i<12 else [-12,-8] if s['group']=='practice' and i==13 else [11,-5]
  else:delta=[-9,7] if i<6 or s['group']=='damage' and i<13 else [-12,-5] if s['group']=='damage' or i<12 else [-13,-6] if i==12 else [-13,6] if i==13 else [-8,13] if i==14 else [-9,7]
  if sid=='banner-b-north-damage-r1' and i==15:delta=[8,8]
  if sid=='banner-b-northeast-practice-r1' and i in (6,9):
   p=[335,733] if i==6 else [340,967];delta=[-11,-8];rect=[p[0]-5,p[1]-5,10,10];visibility='open-palm'
   palm_method='Actual pale visible hand resting on lap, manually inspected in source inset; warm-color classifier missed this hand'
  wrist=[round(p[k]+delta[k],3) for k in range(2)]
  grip={'source':p,'sourceWrist':wrist,'sourceOcclusionRect':rect,'visibility':visibility,'closedGripConfirmed':visibility=='closed-grip',
   'sourcePalmReviewed':False,'sourceCuffReviewed':False,'uncertaintyNativePx':2 if selected is None else 1.5,
   'selection':'manual actual source hand and cuff candidate pending inset confirmation','palmMeasurementMethod':palm_method,
   'attachmentPolicy':'held-candidate' if visibility=='closed-grip' else 'detach-hover','sourceSkinIslandProposalIndex':selected,
   'cuffMeasurementMethod':'Visible source cuff/forearm region adjacent to selected palm; point uncertainty retained'}
  if visibility=='occluded':
   grip.update({'uncertaintyNativePx':6,'sourceWristEstimated':True,'sourceCuffVisibility':'occluded','palmMeasurementMethod':'Hidden hand projection at a garment reference; no actual skin, cuff, anatomical wrist or holding claim','cuffMeasurementMethod':'Hidden cuff; wrist coordinate is only a candidate projection, not an observed cuff measurement','closedGripConfirmed':False})
  entry={'rawIndex':i,'sourceRoot':root,'sourceRootReviewed':False,'sourceRootMeasurement':{'semantic':True,'method':kind,'observedBodyContactY':b,'uncertaintyNativePx':uncertainty,'worldFloorClaimed':False,'bonePelvisClaimed':False},'lift':0,'rendererAppliesLift':False,'grip':grip}
  if i<6:entry.update({'sourceCrownY':e['sourceCrownY'],'sourceBootSoleY':e['sourceBootSoleY']})
  entries.append(entry)
  x=(i%6)*200;y=(i//6)*300
  cx,cy=round(p[0]),round(p[1]);box=[cx-22,cy-22,cx+23,cy+23]
  crop=im.crop(box).resize((180,180),Image.Resampling.NEAREST);panel.alpha_composite(crop,(x+5,y+27))
  d.text((x+5,y+2),str(i)+' '+visibility,fill=(225,225,205),font=font)
  for point,color in [(p,(80,245,155)),(wrist,(245,205,80))]:
   px=x+5+(point[0]-box[0])*4;py=y+27+(point[1]-box[1])*4
   d.ellipse((px-3,py-3,px+3,py+3),outline=color,width=2)
  d.text((x+5,y+213),'P'+str([round(v,1) for v in p]),fill=(80,245,155),font=font)
  d.text((x+5,y+235),'W'+str([round(v,1) for v in wrist]),fill=(245,205,80),font=font)
  d.text((x+5,y+258),'R'+str([round(v,1) for v in root]),fill=(190,190,170),font=font)
 action1,action2=('hit','death') if s['group']=='damage' else ('meditate','gather')
 sources[sid]={'sourceSha256':s['sourceSha256'],'actualGrid':s['actualGrid'],'sourceViewed':True,'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,'calibrations':entries[:6],'actions':{action1:entries[6:12],action2:entries[12:]},'manualReviewPending':True}
 panel.save(SUPPORT/'evidence'/f'{sid}-hand-cuff-insets-4x.png')
(SUPPORT/'manual-candidates.json').write_text(json.dumps({'sources':sources},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourceHandCandidates':72,'cuffCandidates':72,'manualReviewPending':True,'actorWrites':False}))
