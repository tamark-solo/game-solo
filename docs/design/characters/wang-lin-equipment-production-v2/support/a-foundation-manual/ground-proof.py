"""Source-ground observations and clothed hip estimates; recommendations are explicit."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1];ACTOR=V2/'actors/a/sword'
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
reg=read(ACTOR/'registration.json');rows={}
# Manual anatomical axis from robe/waist transition, not wholebody box midpoint.
# Hip bones themselves are concealed; x is an inferred band, honestly quantified.
HIPS={'north-death':[[80,80],[80,84],[84.5,86],[84.5,88],[84.5,88],[84.5,88]],
 'northeast-death':[[80,86],[80,88],[76,87],[76,89],[76,90],[76,90]],
 'west-death':[[80,85],[80,89],[84,82],[86,89],[87,91],[87,91]],
 'northwest-death':[[67.5,81],[80,87],[86,82],[86,87],[86,88],[86,88]],
 'north-meditate':[[56,91]]*6,'northeast-meditate':[[56,91]]*6,
 'west-meditate':[[56,93]]*6,'northwest-meditate':[[56,93]]*6}
for clip in reg['clips']:
 short=clip['direction']+'-'+clip['action']
 if short not in HIPS:continue
 sheet=Image.new('RGBA',(1680,720),(29,31,36,255));dr=ImageDraw.Draw(sheet)
 for i,f in enumerate(clip['frames']):
  key=clip['id']+':'+str(i+1);s=f['sourceScale'];px,py=f['pivot'];rx,ry=f['root'];hip=HIPS[short][i];sourceHip=[rx+(hip[0]-px)/s,ry+(hip[1]-py)/s]
  prone=clip['action']=='death' and i>=2;seated=clip['action']=='meditate';boot=not prone and not seated
  # Seated axis and observed low support plane were visually checked and retained.
  # A prone body uses pelvis projection; toe/wholebody midpoint cannot become root.
  recx=rx+(hip[0]-px)/s if prone or short=='northwest-death' and i==0 else rx;recommended=[round(recx,3),ry]
  observedY=f['sourceCoreBounds'][3];lift=f.get('lift',0)
  uncertaintyNative=4 if prone else 2 if seated else 3
  uncertaintySource=round(uncertaintyNative/s,3)
  obs={'clipId':clip['id'],'index':i,'frameFile':f['file'],'frameSha256':f['sha256'],'source':f['source'],'sourceSha256':sha(V2/f['source']),'sourceRect':f['sourceRect'],'sourceScale':s,'framePivot':f['pivot'],'sourceRoot':f['root'],'sourceRootRecommended':recommended,'nativeRootDeltaRecommended':[round((recommended[0]-rx)*s,3),0],'sourceHipEstimate':[round(v,3) for v in sourceHip],'nativeHipEstimate':hip,'sourcePelvisProjectionBand':[round(recx-uncertaintySource,3),round(recx+uncertaintySource,3)],'uncertaintyNativePx':uncertaintyNative,'uncertaintySourcePx':uncertaintySource,'sourceSupportPlane':{'observedBodyContactY':observedY,'worldProjectionY':ry,'worldYPolicy':'Retain prior experimental3px fall lift; raw transparent source does not show an actual world floor.' if lift else 'Observed lower body/robe or boot contact boundary; no map floor baked in source.','material':'corpse lower robe/forearm body contact' if prone else 'folded legs/seated robe contact' if seated else 'lowest supporting boot/knee; raised foot does not set ground','method':'Visually inspected source crop/material anatomy at support band. Extent boundary agrees with contact silhouette; not a standing-sole rule for prone/seated.'},'semantic':'prone-clothed-pelvis-projection' if prone else 'seated-clothed-pelvis-support' if seated else 'standing-or-kneeling-boot-support','recommendation':'manual-hip-projection-candidate' if prone else 'manual-lowest-boot-projection-candidate' if short=='northwest-death' and i==0 else 'keep-current-source-root','bodyPixelsFitted':False,'sourceHipBonesVisible':False,'hipProof':'Waist/upper-thigh robe transition supports the inferred x band. Hair/coat hide bone anatomy; sourceRootRecommended remains candidate within stated uncertainty.' if prone else 'Seated lower torso axis/folded leg contact agrees with existing registration.' if seated else 'Observed supporting boot/knee plane, no new stance scale.','manualEvidence':'support/a-foundation-manual/'+clip['id']+'-ground-proof.png','sourceViewed':True,'requiresActorOwnerImport':True,'artApproved':False,'runtimeIntegrated':False}
  rows[key]=obs
  image=Image.open(V2/f['source']).convert('RGBA');left,top,right,bottom=f['sourceCoreBounds'];roi=image.crop((left-12,top-12,right+12,bottom+12));x=i%3*560;y=i//3*360;ox=x+(560-roi.width)//2;oy=y+32;sheet.alpha_composite(roi,(ox,oy))
  def pos(p):return (ox+p[0]-(left-12),oy+p[1]-(top-12))
  old=pos(f['root']);new=pos(recommended);hp=pos(sourceHip);ground=oy+observedY-(top-12)
  dr.line((old[0],oy,old[0],oy+roi.height),fill=(140,115,45),width=1);dr.line((ox,ground,ox+roi.width,ground),fill=(85,110,160),width=1);dr.line((new[0],hp[1],new[0],ground),fill=(70,180,125),width=1)
  dr.ellipse((hp[0]-3,hp[1]-3,hp[0]+3,hp[1]+3),outline=(90,230,135),width=1);dr.line((new[0]-5,new[1],new[0]+5,new[1]),fill=(90,230,135),width=2)
  dr.text((x+4,y+4),clip['id']+' key'+str(i+1),fill=(220,220,210));dr.text((x+4,y+18),'yellow old / green hip projection / blue contact',fill=(170,170,160))
 sheet.save(ROOT/(clip['id']+'-ground-proof.png'))
(ROOT/'ground-proof.json').write_text(json.dumps({'schema':'huyen-tam-foundation-source-ground-support-2','date':'2026-10-14','coverage':{'clips':8,'keys':len(rows),'deathKeys':24,'meditateKeys':24},'actorRegistrationSha256AtObservation':sha(ACTOR/'registration.json'),'frames':rows,'sourceSupportPlaneReviewed':True,'candidateHipProjectionNotBoneAnatomyProof':True,'scope':'Support measurements only; actor worker decides import and repacks using sourceManual palm to retain exact source attachment.','artApproved':False,'runtimeIntegrated':False},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'keys':len(rows),'recommendationChanges':sum(r['recommendation']!='keep-current-source-root' for r in rows.values()),'keepCurrent':sum(r['recommendation']=='keep-current-source-root' for r in rows.values())}))
