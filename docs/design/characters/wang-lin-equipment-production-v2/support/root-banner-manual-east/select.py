from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
SUPPORT=Path(__file__).resolve().parent;V2=SUPPORT.parents[1]
data=json.loads((SUPPORT/'proposals.json').read_text(encoding='utf-8'))
choices={
 'banner-b-east-damage-r1':[2,1,2,2,1,2,2,2,2,2,2,2,2,1,2,1,1,2],
 'banner-b-east-practice-r1':[2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,2,2],
 'banner-b-southeast-damage-r1':[2,2,2,1,1,1,1,1,2,2,1,1,2,1,1,1,1,None],
 'banner-b-southeast-practice-r1':[2,2,2,2,2,2,1,1,1,1,1,1,2,1,1,1,1,2]
}
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12);sources={}
for sid,s in data.items():
 im=Image.open(V2/'actors/b/banner/sources'/f'{sid}.png').convert('RGBA');entries=[]
 panel=Image.new('RGBA',(1200,900),(28,34,43,255));d=ImageDraw.Draw(panel)
 for e,selected in zip(s['entries'],choices[sid]):
  i=e['rawIndex'];l,t,r,b=e['bounds'];root=list(e['rootProposal']);kind='Standing dark-boot sole/support projection';uncertainty=1
  if i>=6 and s['group']=='practice':kind='Seated, kneeling or rising support envelope; folded legs and cloth hide the anatomical center';uncertainty=3
  if s['group']=='damage' and i>=13:
   root[0]=round(l+(r-l)*(.28 if s['direction']=='east' else .75),3)
   kind='Clothed lower limb/support projection in kneeling fall or prone pose; observed silhouette contact Y, no exact pelvis or world-floor claim';uncertainty=5
  if selected is None:
   p=[round(l+(r-l)*.29,3),round(t+(b-t)*.87,3)];rect=[round(p[0])-4,round(p[1])-4,8,8];visibility='occluded'
   palm_method='Hidden palm projection at garment reference; no actual skin, cuff, anatomical wrist or holding claim'
  else:
   warm=e['warmProposals'][selected];p=list(warm['center']);rect=warm['rect'];visibility='closed-grip' if i<6 or s['group']=='damage' and i<13 else 'open-palm'
   palm_method='Manual source whole-pose review selected visible near hand, excluding face, ear and alternate hand candidates'
   if s['group']=='damage' and i>=13:visibility='open-palm'
   if s['group']=='practice' and (i>=15 if s['direction']=='east' else i>=16):visibility='closed-grip'
  delta=[3,-11] if i<6 or s['group']=='damage' and i<13 or s['group']=='practice' and i>=15 and selected in (1,2) else [-12,-3] if s['group']=='practice' and i<12 else [-12,-4] if s['direction']=='east' else [12,-4]
  if s['group']=='practice' and i in (12,13,14):
   delta=([-13,-9] if i==12 else [-12,7] if i==13 else [-10,12]) if s['direction']=='east' else ([-8,-14] if i==12 else [10,-9] if i==13 else [-10,12])
  if s['group']=='practice' and i==15 and s['direction']=='southeast':delta=[-9,11]
  if s['group']=='damage' and i==13 and s['direction']=='southeast':delta=[-10,-13]
  if s['group']=='practice' and i==13 and s['direction']=='southeast':delta=[2,-10]
  if s['group']=='damage' and i==17 and s['direction']=='east':delta=[-10,-2];visibility='visible-fragment'
  wrist=[round(p[k]+delta[k],3) for k in range(2)]
  grip={'source':p,'sourceWrist':wrist,'sourceOcclusionRect':rect,'visibility':visibility,'closedGripConfirmed':visibility=='closed-grip',
   'sourcePalmReviewed':False,'sourceCuffReviewed':False,'uncertaintyNativePx':6 if selected is None else 1.5,
   'selection':'Manual actual source hand and cuff candidate pending inset confirmation','palmMeasurementMethod':palm_method,
   'attachmentPolicy':'held-candidate' if visibility=='closed-grip' else 'detach-hover','sourceSkinIslandProposalIndex':selected,
   'cuffMeasurementMethod':'Visible source cuff/forearm region adjacent to selected palm; point uncertainty retained'}
  if visibility=='occluded':grip.update({'sourceWristEstimated':True,'sourceCuffVisibility':'occluded','cuffMeasurementMethod':'Hidden cuff; wrist is only a garment-reference candidate projection','closedGripConfirmed':False})
  if s['direction']=='east' and s['group']=='damage' and i==17:
   grip.update({'sourceWristEstimated':True,'sourceCuffVisibility':'occluded','uncertaintyNativePx':4,'cuffMeasurementMethod':'Actual hand fragment lies under the chin; cuff hidden behind face/hair. Wrist is a garment-reference projection, not an observed anatomical wrist.','closedGripConfirmed':False})
  entry={'rawIndex':i,'sourceRoot':root,'sourceRootReviewed':False,'sourceRootMeasurement':{'semantic':True,'method':kind,'observedBodyContactY':b,'uncertaintyNativePx':uncertainty,'worldFloorClaimed':False,'bonePelvisClaimed':False},'lift':0,'rendererAppliesLift':False,'grip':grip}
  if i<6:entry.update({'sourceCrownY':e['sourceCrownY'],'sourceBootSoleY':e['sourceBootSoleY']})
  entries.append(entry)
  x=(i%6)*200;y=(i//6)*300;cx,cy=round(p[0]),round(p[1]);box=[cx-22,cy-22,cx+23,cy+23]
  crop=im.crop(box).resize((180,180),Image.Resampling.NEAREST);panel.alpha_composite(crop,(x+5,y+27))
  d.text((x+5,y+2),str(i)+' '+visibility,fill=(225,225,205),font=font)
  for point,color in [(p,(80,245,155)),(wrist,(245,205,80))]:
   px=x+5+(point[0]-box[0])*4;py=y+27+(point[1]-box[1])*4;d.ellipse((px-3,py-3,px+3,py+3),outline=color,width=2)
  d.text((x+5,y+213),'P'+str([round(v,1) for v in p]),fill=(80,245,155),font=font)
  d.text((x+5,y+235),'W'+str([round(v,1) for v in wrist]),fill=(245,205,80),font=font)
  d.text((x+5,y+258),'R'+str([round(v,1) for v in root]),fill=(190,190,170),font=font)
 action1,action2=('hit','death') if s['group']=='damage' else ('meditate','gather')
 sources[sid]={'sourceSha256':s['sourceSha256'],'actualGrid':s['actualGrid'],'sourceViewed':True,'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,'calibrations':entries[:6],'actions':{action1:entries[6:12],action2:entries[12:]},'manualReviewPending':True}
 panel.save(SUPPORT/'evidence'/f'{sid}-hand-cuff-insets-4x.png')
(SUPPORT/'manual-candidates.json').write_text(json.dumps({'sources':sources},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'sourceHandCandidates':72,'manualReviewPending':True,'actorWrites':False}))
