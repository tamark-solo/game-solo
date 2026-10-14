"""Support-only per-pose palm/source inverse measurements; actor worker imports separately."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1];ACTOR=V2/'actors/a/sword'
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=read(ACTOR/'registration.json');lookup=read(ACTOR/'candidate-lookup.json')['frames']
# Indices chosen by visual per-pose anatomy on3x contacts; classifier is only location aid.
CHOICES={
 'north-hit':[1,0,5,1,0,3],'north-death':[1,2,3,4,2,2],
 'north-gather':[4,5,1,1,5,4],'north-meditate':[0,2,[72,88],2,1,1],
 'northeast-hit':[9,11,10,10,5,7],'northeast-death':[5,17,7,11,13,10],
 'northeast-gather':[5,17,4,2,7,8,9],'northeast-meditate':[7,5,7,7,5,7],
 'west-hit':[10,10,13,12,12,10],'west-death':[14,14,16,14,16,16],
 'west-gather':[5,10,7,3,2,6,9],'west-meditate':[7,6,6,6,5,6],
 'northwest-hit':[7,4,7,7,10,12],'northwest-death':[5,11,10,10,13,14],
 'northwest-gather':[10,9,3,3,8,5,6],'northwest-meditate':[3,4,3,4,5,5]
}
ALTERNATES={
 'north-hit':[3,4,6,2,2,1],'north-death':[6,6,None,None,None,None],
 'north-gather':[1,0,4,5,3,3],'north-meditate':[2,1,0,1,0,0],
 'west-hit':[8,3,10,11,13,9],'west-death':[15,15,15,13,None,None],
 'west-gather':[6,9,8,9,6,7,10]
}
out={};records=[];clips=[]
for clip in reg['clips']:
 short=clip['direction']+'-'+clip['action']
 if short not in CHOICES:continue
 clips.append(clip['id']);assert len(CHOICES[short])==len(clip['frames']),short
 for i,f in enumerate(clip['frames']):
  key=clip['id']+':'+str(i+1);chosen=CHOICES[short][i];candidate=lookup[key][chosen] if isinstance(chosen,int) else None
  native=candidate['native'] if candidate else chosen;scale=f['sourceScale'];px,py=f['pivot'];rx,ry=f['root'];source=[round(rx+(native[0]-px)/scale,3),round(ry+(native[1]-py)/scale,3)]
  visible='visible-palm';shape='closed-fist' if clip['action']=='hit' else 'open-action-hand' if clip['action']=='gather' else 'resting-hand' if clip['action']=='death' else 'lap-seal-or-open'
  policy='held-candidate' if clip['action']=='hit' else 'drop-ground' if clip['action']=='death' else 'stow-hover'
  reason='Actual source hand at forearm end, visually distinguished from face/cloth/gold islands.'
  if short=='north-meditate':visible='occluded-cuff-endpoint';shape='hidden-palm';reason='Rear-view lap palms are covered by light sleeve/robe cuffs. Selected point is actual cuff endpoint, not skin/gold island; no held grip claim.'
  if short=='northeast-meditate':visible='visible-fragment';shape='lap-hand-fragment';reason='Only tiny actual fingers/skin fragment beyond cuff on lap; no full open/closed palm or held sword attachment claimed.'
  if short=='northwest-hit' and i in [0,1,3]:visible='visible-fragment';shape='closed-hand-fragment';reason='Small actual finger/hand fragment extends from foreground cuff; full palm shape is not proved.'
  if short=='west-gather' and i==0:visible='visible-fragment';shape='pickup-finger-fragment';reason='Pickup hand/fingers partially hidden by cuff; no held blade attachment claimed.'
  if short=='west-gather' and i==5:visible='occluded-cuff-endpoint';shape='hidden-return-hand';reason='Returning front arm has cuff/endpoint but closed palm not separately readable; alternate far hand is recorded separately.'
  if clip['action']=='meditate' and clip['direction'] in ['west','northwest']:shape='visible-seal-hand';reason='Actual hands overlap/clasp on lap; no individually held sword attachment inferred.'
  gx,gy=native;rect=[round(gx)-2,round(gy)-2,5,5]
  row={'clipId':clip['id'],'index':i,'frameFile':f['file'],'frameSha256':f['sha256'],'source':f['source'],'sourceSha256':sha(V2/f['source']),'sourceRect':f['sourceRect'],'sourceScale':scale,'sourceRoot':f['root'],'framePivot':f['pivot'],'native':native,'sourceManual':source,'sourcePalm':source,'visibility':visible,'handShape':shape,'attachmentPolicy':policy,'angleDeg':0,'angleMeasurement':'No reliable per-pose wrist axis proven by these foundation keys; do not use0 as an ART-approved rotation.','occlusionRect':rect,'selection':'manual-source-anatomy-inspection','selectionProof':{'candidateIndex':chosen if isinstance(chosen,int) else None,'candidateNative':candidate['native'] if candidate else None,'candidateIsOnlyLocationAid':True},'manualEvidence':'support/a-foundation-manual/hand-source-native.png','reason':reason,'anatomicalSidePolicy':'North viewer-right matches approved pilot main hand; profiles use visible foreground/action hand, alternate provided when distinct. Anatomy outside source visibility is not inferred.','sourceViewed':False,'newArtApproved':False,'runtimeIntegrated':False}
  if short in ALTERNATES:
   j=ALTERNATES[short][i]
   if j is not None:
    a=lookup[key][j];n=a['native'];row['alternatePalm']={'native':n,'source':[round(rx+(n[0]-px)/scale,3),round(ry+(n[1]-py)/scale,3)],'candidateIndex':j,'note':'Separately visible other hand/action endpoint; root decides main wearer socket, no alternate gripping claim.'}
  out[key]=row;records.append((key,row))
# Native hand6x beside source crop2x; every pose can be inspected without contact scaling.
tile=(168,112);cols=6;sheet=Image.new('RGBA',(cols*tile[0],math.ceil(len(records)/cols)*tile[1]),(29,31,36,255));draw=ImageDraw.Draw(sheet)
for j,(key,r) in enumerate(records):
 x=j%cols*tile[0];y=j//cols*tile[1];im=Image.open(V2/r['frameFile']).convert('RGBA');gx,gy=r['native'];n=im.crop((round(gx)-6,round(gy)-6,round(gx)+6,round(gy)+6)).resize((72,72),Image.Resampling.NEAREST);sheet.alpha_composite(n,(x,y+32))
 raw=Image.open(V2/r['source']).convert('RGBA');sx,sy=r['sourcePalm'];c=raw.crop((round(sx)-18,round(sy)-18,round(sx)+18,round(sy)+18)).resize((72,72),Image.Resampling.NEAREST);sheet.alpha_composite(c,(x+80,y+32));draw.text((x+2,y+2),key.replace('sword-a-',''),fill=(220,217,209));draw.text((x+2,y+16),'native6x/source2x',fill=(170,170,165))
sheet.save(ROOT/'hand-source-native.png')
(ROOT/'manual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(ROOT/'report.json').write_text(json.dumps({'schema':'huyen-tam-foundation-manual-support-2','clips':clips,'coverage':{'clips':len(clips),'keys':len(records)},'sourceActorRegistrationSha256':sha(ACTOR/'registration.json'),'candidateLookupSha256':sha(ACTOR/'candidate-lookup.json'),'supportWritesActorFiles':False,'allSourceCropsViewed':False,'reviewPending':True,'artApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'clips':len(clips),'keys':len(records),'reviewPending':True}))
