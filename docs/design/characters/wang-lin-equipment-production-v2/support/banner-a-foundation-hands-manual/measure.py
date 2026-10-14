"""Manual original-source palms/cuffs only. Roots belong to other workers."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
snapshot=json.loads((ROOT/'snapshot.json').read_text(encoding='utf8'))
# All indices below were selected visually on the corresponding original pose.
# A missing index means the actual palm is occluded, not a classifier failure to fill.
chosen={
 'north-hit':[0,0,2,1,1,1],
 'north-death':[0,None,4,6,7,None],
 'north-meditate':[None]*6,
 'north-gather':[4,0,0,1,1,1],
 'northeast-hit':[2,4,7,7,3,3],
 'northeast-death':[15,11,6,4,1,None],
 'northeast-meditate':[5,3,3,2,4,5],
 'northeast-gather':[7,8,1,1,1,2],
 'east-hit':[5,4,6,6,5,5],
 'east-death':[5,8,7,8,11,6],
 'east-meditate':[6,9,6,5,5,7],
 'east-gather':[11,8,3,5,3,4],
 'southeast-hit':[5,6,7,6,5,6],
 'southeast-death':[3,6,8,15,10,6],
 'southeast-meditate':[9,8,8,10,5,10],
 'southeast-gather':[11,12,7,6,9,3]}
explicitHidden={
 ('north-death',2):([583,1245],[570,1252]),
 ('north-death',6):([852,1490],[862,1482]),
 ('northeast-death',6):([969,1490],[954,1482])}
# Enlarged marked crops exposed two ivory-cuff centroids and three merged
# palm/hem islands. These explicit observations use the actual fingers instead.
explicitObservedPalms={
 ('southeast-meditate',1):[278,751],
 ('southeast-meditate',2):[542,752],
 ('southeast-meditate',6):[803,985]}
explicitCuffs={
 ('north-death',3):[785,1293],
 ('north-death',4):[126,1478],
 ('north-death',5):[491,1487],
 ('southeast-meditate',1):[258,745],
 ('southeast-meditate',2):[522,746],
 ('southeast-meditate',6):[783,979]}
frames=[];checks=[]
def check(name,v):checks.append({'id':name,'passed':bool(v)});assert v,name
for f in snapshot['frames']:
 short=f['clipId'].replace('banner-a-','');key=f['key'];ci=chosen[short][key-1]
 source=PACK/f['source'];check(short+str(key)+' raw hash',sha(source)==f['sourceSha256'])
 im=Image.open(source).convert('RGBA');root=f['proposedRoot'];pivot=f['pivot'];factor=f['sourceScale'];hidden=ci is None
 partial=f['direction']=='northeast' and f['action']=='meditate'
 if hidden:
  if (short,key) in explicitHidden:palm,cuff=explicitHidden[(short,key)]
  else:
   # Front lap is concealed by the back hair/body; this is a projected estimate.
   palm=[round(root[0]+12/factor),round(root[1]-20/factor)]
   cuff=[round(palm[0]-6/factor),round(palm[1]-3/factor)]
  palmRGBA=list(im.getpixel(tuple(palm)));cuffRGBA=list(im.getpixel(tuple(cuff)));occlusion=[]
  physical=False;cuffEstimate=True;palmUncertainty=6;cuffUncertainty=6
 else:
  c=f['candidates'][ci];n=c['native'];guess=explicitObservedPalms.get((short,key),[root[j]+(n[j]-pivot[j])/factor for j in range(2)])
  local=[]
  for y in range(round(guess[1])-3,round(guess[1])+4):
   for x in range(round(guess[0])-3,round(guess[0])+4):
    rgba=im.getpixel((x,y))
    if rgba[3]>=128:local.append(((x-guess[0])**2+(y-guess[1])**2,[x,y],list(rgba)))
  check(short+str(key)+' physical selected palm',bool(local));_,palm,palmRGBA=min(local);physical=True
  if f['action']=='hit':delta=[-2,5]
  elif f['action']=='meditate':delta=[-4,-1] if partial else [-6,0]
  elif f['action']=='death':
   if f['direction']=='north':delta=[-1,5] if key==1 else [4,-4]
   elif f['direction']=='northeast':delta=[-2,-5] if key==1 else [-5,-1]
   else:delta=[-2,5] if key==1 else [-6,-1]
  else:
   delta=[-2,5]
   if key==1:delta=[-2,-5]
   if key==2:delta=[4,-4] if f['direction']=='southeast' else [-3,-5]
  cuff=[round(root[j]+(n[j]+delta[j]-pivot[j])/factor) for j in range(2)]
  cuff=explicitCuffs.get((short,key),cuff)
  cuffRGBA=list(im.getpixel(tuple(cuff)));cuffEstimate=cuffRGBA[3]<128 or partial or (short=='north-death' and key in (3,4,5))
  palmUncertainty=3 if partial else 1.5;cuffUncertainty=3 if partial or (short=='north-death' and key in (3,4,5)) else 2
  r=c['rect'];occlusion=[root[0]+(r[0]-pivot[0])/factor,root[1]+(r[1]-pivot[1])/factor,r[2]/factor,r[3]/factor] if f['action']=='hit' else []
 physicalClosed=(not hidden and (f['action']=='hit' or (f['action']=='death' and key==1 and f['direction'] in ('north','east')) or (f['action']=='gather' and key>=3 and f['direction'] in ('east','southeast')) or (f['action']=='gather' and key==6)))
 held=f['action']=='hit' and physicalClosed
 visibility='occluded' if hidden else ('partially-occluded-palm' if partial else ('visible-closed-fist' if physicalClosed else ('ground-contact' if f['action']=='death' or f['action']=='gather' and key<=2 else 'free-cupped-or-joined-palm')))
 policy='held-empty-pole-grip' if held else 'planted-pole-rest-or-free-gesture-no-held-claim'
 notes='Original same-pose palm and nearby wrist/cuff selected by visual observation. Physical closed-fist fact is distinct from held equipment.'
 if hidden:notes='Actual hand is concealed by hair/body/sleeve. Coordinates are a disclosed projected estimate for presentation only; visible ear, belt and ivory hem are excluded as palm evidence. No pole occlusion or held claim.'
 elif partial:notes+=' Only a small front lap skin sliver is visible beyond the sleeve; the cuff is estimated and exact fingers/bone cannot be resolved.'
 if f['action'] in ('death','meditate','gather'):notes+=' Separate pole remains planted; neither a curled hand nor a recovery fist claims a held shaft.'
 if short=='east-death' and key==5:notes+=' Visible opposite ground hand selected; leading hand is covered by head/hair.'
 check(short+str(key)+' no held hidden/rest',not held if hidden or f['action'] in ('death','meditate','gather') else True)
 l,t,w,h=f['sourceRect'];crop=im.crop((l,t,l+w,t+h));bg=Image.new('RGBA',crop.size,(235,237,230,255));bg.alpha_composite(crop)
 page=bg.convert('RGB').resize((w*3,h*3),Image.Resampling.NEAREST);draw=ImageDraw.Draw(page)
 for point,color,label in [(palm,(0,130,180),'estimated hidden palm' if hidden else 'observed palm'),(cuff,(180,70,0),'estimated cuff' if cuffEstimate else 'cuff')]:
  x=(point[0]-l)*3;y=(point[1]-t)*3;draw.line((x-8,y,x+8,y),fill=color,width=2);draw.line((x,y-8,x,y+8),fill=color,width=2);draw.text((x+9,y-10),label,fill=color)
 path=ROOT/'review/poses'/(f['clipId']+'-'+str(key).zfill(2)+'.png');path.parent.mkdir(parents=True,exist_ok=True);page.save(path)
 frame={k:f[k] for k in ('clipId','key','action','direction','sourceId','source','sourceSha256','sourceRect','sourceScale')}
 frame.update({'sourcePalm':palm,'sourcePalmRGBA':palmRGBA,'sourceCuff':cuff,'sourceCuffRGBA':cuffRGBA,
  'sourcePalmEstimated':hidden,'sourcePalmMeasured':not hidden,'sourcePalmPhysicalObserved':physical,
  'sourcePalmReviewed':True,'sourceCuffReviewed':not cuffEstimate,'cuffEstimate':cuffEstimate,
  'palmUncertaintyNativePx':palmUncertainty,'cuffUncertaintyNativePx':cuffUncertainty,
  'visibility':visibility,'attachmentPolicy':policy,'physicalClosedFist':physicalClosed,'closedGripConfirmed':physicalClosed,
  'heldGripClaim':held,'sourceOcclusionRect':occlusion,'occlusionAppliesToHeldPole':held,
  'semanticNotes':notes,'manualSourceViewed':True,'exactBoneClaim':False,
  'frameFileAtObservation':f['file'],'frameSha256AtObservation':f['frameSha256'],
  'observationRootReference':root,'observationPivot':pivot,'rootChangeAuthorized':False,
  'evidence':path.relative_to(ROOT).as_posix(),'evidenceSha256':sha(path),'ownerApproved':False,'runtimeIntegrated':False})
 frames.append(frame)
report={'schema':'banner-a-foundation-hands-manual-support-1','frames':frames,
 'coverage':{'frames':96,'directions':['north','northeast','east','southeast'],'actions':['hit','death','meditate','gather']},
 'rootsEdited':False,'checks':len(checks),'passed':True,
 'limits':['Hands only. Do not import observationRootReference as a new root; source coordinates must be recomputed against actor final semantic roots.',
 'Actual physical closed fist does not imply held equipment. Death/meditate/gather are planted with no held claim.',
 'Hidden coordinates are projected estimates, not observed skin or exact rig bones; no source/canonical art was repainted.'],
 'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'manual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'frames':len(frames),'physicalPalms':sum(f['sourcePalmPhysicalObserved'] for f in frames),'hiddenEstimates':sum(f['sourcePalmEstimated'] for f in frames),'cuffEstimates':sum(f['cuffEstimate'] for f in frames),'rootsEdited':False,'checks':len(checks)}))
