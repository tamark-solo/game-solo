"""Pack single-view neutral concepts using source-specific support witnesses.

No pixel painting, mirroring, per-pose fitting, source overwrite or motion claim.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
ROOT=Path(__file__).resolve().parent;WORK=ROOT.parents[3]
assert not (ROOT/'approval.json').exists(),'Approved neutral artwork is read-only; use a new version'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,d):p=ROOT/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def edges(im,threshold):
 a=im.getchannel('A');w,h=im.size
 return {k:sum(x>=threshold for x in a.crop(b).get_flattened_data()) for k,b in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
# Screen-left and screen-right boot centers inspected in the complete source.
# Source sole coordinates are one pixel below the actual opaque shoe/stone foot.
FEET={
 'huyen-tam-entry':([400.5,667],1441), 'tich-bach-entry':([400.5,652],1444),
 'li-muwan-alchemist':([484.5,630.5],1473),'luc-van':([427,648.5],1392),
 'a-ly':([415,623.5],1440),'mac-ba':([426,619],1440),'tieu-nghien':([406,626],1438),
 'sword-servant':([481,686],1248),'yin-corpse-cultivator':([405,677.5],1440),
 'blood-talisman-mage':([427,658.5],1472),'blood-armor-commander':([425,800],1311),
 'dark-seal-true-body':([486.5,715],1445),'huyen-tam-domain':([398.5,692],1472),
 'tich-bach-domain':([379.5,650],1453),'situ-nan-restored':([420.5,649],1486),
 'li-muwan-lifespan':([488,641],1469)}
SPIRITS={'situ-nan-spirit':(512,1489),'hua-lap-quoc':(500,1465)}
ASSESSMENTS={
 'huyen-tam-entry':'Own dark-haired A recognition retained; M1 robe is quieter and removes sword trim. Face/anatomy is newly drawn, not byte-equal to master.',
 'tich-bach-entry':'Own silver-haired B recognition retained; modest M1 silhouette. New drawing requires owner identity review.',
 'situ-nan-spirit':'Selected r2 fixes unwanted Wang-like high ponytail; short gray-templed hair and mature face. Intrinsic spectral hem has soft alpha; additional smoke/aura is not produced.',
 'li-muwan-alchemist':'Selected r2 fixes high ponytail; low half-tied hair, ivory/jade GDD clothing and wearable herb pouch. Changes purple old wardrobe intentionally.',
 'luc-van':'Readable white moustache and jade spectacles; bamboo bundle is wearable. Slight stoop is lower anatomy posture, not bbox height fitting.',
 'a-ly':'Braided hair, glove/feed bag/bronze bell separate her from main. No attached animal or mount.',
 'mac-ba':'Low gray bun, earth-red apron and linen; age expression restrained at native resolution.',
 'tieu-nghien':'Messenger bag and earth-red scarf; hair is longer than the initial short-tail brief. This visible silhouette variation remains candidate.',
 'sword-servant':'r1 clipped right fist; selected r2 restores full margin. Body is derived from cracked puppet, weapon/hilt removed. Broken sword prop still to-build.',
 'yin-corpse-cultivator':'Short dark hair and dead-jade seals; body only, no summoned corpse or coffin.',
 'blood-talisman-mage':'Red seal textile and stern face; generated high tied hair differs from proposed angular double-fold bun. Candidate variation recorded, not hidden.',
 'hua-lap-quoc':'Game-adaptation spirit villain; long tied hair and smirk distinguish him from mentor. No canon likeness claim or attached sword. Soul mist remains separate.',
 'blood-armor-commander':'Khôi Lỗi Thống Lĩnh branch chosen from GDD alternative. Character construct distinct from equipment chariot; no wheels or rail FX.',
 'dark-seal-true-body':'Officer03 identity/material reference retained; mature crimson mantle/seal bands; fake-core aura remains separate.',
 'huyen-tam-domain':'Common MIII body exploration only. Gold seams and quiet robe; not four complete family-specific costumes or domain FX.',
 'tich-bach-domain':'Common MIII body exploration only. Ivory remains dominant instead of requested darker mantle; future palette option awaits owner review.',
 'situ-nan-restored':'New spirit-r2 source explicitly supports same short hair/mature face; living form has solid cloth boots and removes chest tear.',
 'li-muwan-lifespan':'New alchemist-r2 supports same identity; restrained silver temple streaks and weary gaze. Future story state, not an unlocked playable form.'}
def main():
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));assert all(r['status']=='generated' for r in gen['records'])
 rows=[];checks=[]
 for r in gen['records']:
  p=ROOT/r['raw'];assert sha(p)==r['sha256'];im=Image.open(p).convert('RGBA');assert not any(edges(im,128).values()),('source clipped',r['id'])
  core=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox();crown=core[1]
  if r['id'] in SPIRITS:
   x,end=SPIRITS[r['id']];scale=r['bodyNominalPx']/(end-crown);root=[x,end+4/scale]
   canvas,pivot=([128,144],[64,132]) if r['id']=='hua-lap-quoc' else ([96,112],[48,104])
   kind='estimated-ground-projection-of-hovering-spirit';witness={'intrinsicExtentEndY':end,'hoverPx':4,'nativeUncertaintyPx':3,'actualBootClaim':False,'reason':'No source floor or boots; measured spectral silhouette extent, estimated projected support explicitly retained.'};policy='preserved-soft-RGBA'
  else:
   centers,end=FEET[r['id']];root=[sum(centers)/2,end];scale=r['bodyNominalPx']/(end-crown);canvas,pivot=[64,96],[32,88]
   if r['id']=='sword-servant':canvas,pivot=[112,112],[56,104]
   if r['id']=='blood-armor-commander':canvas,pivot=[192,176],[96,160]
   kind='actual-human-boot-soles' if r['id']!='sword-servant' and r['id']!='blood-armor-commander' else 'actual-stone-foot-soles'
   witness={'sourceBootCentersX':centers,'sourceSoleY':end,'crownY':crown,'rootXPolicy':'midpoint of two inspected boot/stone-foot centers, not bbox center','nativeUncertaintyPx':1,'sourceViewed':True};policy='body-binary-alpha128-after-nearest'
  out=im.transform(tuple(canvas),Image.Transform.AFFINE,(1/scale,0,root[0]-pivot[0]/scale,0,1/scale,root[1]-pivot[1]/scale),Image.Resampling.NEAREST)
  if r['id'] not in SPIRITS:out.putalpha(out.getchannel('A').point(lambda a:255 if a>=128 else 0))
  assert out.getbbox() and not any(edges(out,1).values()),('native clipping',r['id'],edges(out,1))
  dst=ROOT/f'native/{r["id"]}.png';dst.parent.mkdir(exist_ok=True);out.save(dst)
  r['sourceAssessmentPending']=False
  row={k:r[k] for k in ['id','name','group','act','direction','bodyNominalPx','raw','sha256','revision']}
  row.update(file=dst.relative_to(ROOT).as_posix(),nativeSha256=sha(dst),canvas=canvas,pivot=pivot,sourceSize=list(im.size),sourceCoreBounds=list(core),sourceSoftBounds=list(im.getbbox()),sourceEdges=edges(im,128),sourceScale=scale,sourceCrownY=crown,sourceRoot=root,rootKind=kind,supportWitness=witness,alphaPolicy=policy,pixelsResampled=True,pixelsRepainted=False,rendererSubtractsLift=False,nativeBounds=list(out.getbbox()),nativeEdges=edges(out,1),sourceAssessment=ASSESSMENTS[r['id']],ownerApproved=False,runtimeReady=False,animationClipCount=0)
  rows.append(row);checks.append({'id':r['id'],'sourceHash':True,'opaqueSourceEdgesClear':True,'nativeEdgesClear':True,'fullSourceInspected':True})
 write('generation.json',gen);write('registration.json',{'schema':'gdd-character-neutral-registration-1','productionDate':'2026-10-15','gddDate':'2026-10-14','records':rows,'directionsProduced':['southeast'],'animationClips':0,'ownerApproved':False,'runtimeIntegrated':False})
 # Exact neutral atlas is review-only; it contains one frame per concept.
 cw,ch=196,180;atlas=Image.new('RGBA',(cw*6,ch*3));rects=[]
 for i,r in enumerate(rows):
  x=(i%6)*cw+2;y=(i//6)*ch+2;body=Image.open(ROOT/r['file']);atlas.paste(body,(x,y));rects.append({'id':r['id'],'rect':[x,y,*r['canvas']]})
 ap=ROOT/'native/neutral-review-atlas.png';atlas.save(ap)
 # Ground-aligned contact sheets: same world floor, no CSS bbox normalization.
 try:font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
 except OSError:font=ImageFont.load_default()
 for bg,label in [((25,34,43,255),'dark'),((222,219,207,255),'light')]:
  board=Image.new('RGBA',(6*220,3*212),bg);draw=ImageDraw.Draw(board)
  for i,r in enumerate(rows):
   x=(i%6)*220;y=(i//6)*212;draw.text((x+8,y+8),r['name'],font=font,fill=(142,117,71,255));draw.text((x+8,y+27),r['act'],font=font,fill=(142,117,71,255))
   body=Image.open(ROOT/r['file']);px,py=r['pivot'];board.alpha_composite(body,(x+110-px,y+190-py));draw.line((x+30,y+190,x+195,y+190),fill=(103,113,121,180))
  bp=ROOT/f'review/lineup-{label}-1x.png';bp.parent.mkdir(exist_ok=True);board.save(bp);board.resize((board.width*2,board.height*2),Image.Resampling.NEAREST).save(ROOT/f'review/lineup-{label}-2x.png')
 manifest={'schema':'gdd-character-concept-manifest-1','date':'2026-10-15','gddVersion':'0.34','records':rows,'atlas':{'file':ap.relative_to(ROOT).as_posix(),'sha256':sha(ap),'rects':rects,'gutter':2,'animationClip':False},'coverage':{'newNeutralConcepts':len(rows),'sourceImages':sum(1+len(r.get('history',[])) for r in gen['records']),'directionsPerConcept':1,'motionClips':0,'newExternalFx':0},'ownerApproved':False,'runtimeIntegrated':False}
 write('manifest.json',manifest);write('review/pack-verification.json',{'status':'passed','checks':checks,'ownerApprovalInferred':False});print(json.dumps(manifest['coverage']))
if __name__=='__main__':main()
