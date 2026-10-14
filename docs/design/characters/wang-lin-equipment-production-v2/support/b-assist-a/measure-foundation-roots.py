from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
reg=json.loads((V2/'actors/a/sword/registration.json').read_text(encoding='utf-8'))
# Manual cloth/waist/thigh-lap landmarks chosen after viewing actual source1x/native2x sheets.
# First two death roots retain actual observed support-span midpoint; never infer hidden bone coordinates.
DEATH={
 'east':[(195,1245),(478,1304),(819,1249,801),(147,1464,147),(494,1474,494),(830,1478,830)],
 'south':[(208,1296),(506,1323),(849,1286,865),(215,1450,220),(524,1439,540),(848,1445,861)],
 'southeast':[(213,1194),(480,1258),(826,1204,847),(193,1404,210),(508,1421,536),(833,1426,866)],
 'southwest':[(196,1194),(533,1244),(803,1199,831),(179,1435,222),(512,1418,548),(838,1418,869)]
}
MED={
 'east':[(229,1128,220),(547,1128,539),(870,1128,861),(227,1440,219),(548,1440,539),(872,1440,864)],
 'south':[(245,800,245),(520,800,519),(796,800,795),(245,1048,245),(520,1048,519),(796,1048,795)],
 'southeast':[(246,777,236),(544,777,535),(844,777,834)],
 'southwest':[(189,734,190),(491,734,492),(797,734,798),(189,972,190),(495,972,496),(801,972,802)]
}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def native(im,rect,root,scale,canvas,pivot):
 x,y,w,h=rect
 out=im.crop((x,y,x+w,y+h)).transform(tuple(canvas),Image.Transform.AFFINE,(1/scale,0,root[0]-x-pivot[0]/scale,0,1/scale,root[1]-y-pivot[1]/scale),Image.Resampling.NEAREST)
 out.putalpha(out.getchannel('A').point(lambda a:255 if a>=128 else 0));return out
def edge(im):
 a=im.getchannel('A');w,h=im.size
 return {name:bool(a.crop(rect).getbbox()) for name,rect in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
frames={};sourcehashes={};oldhashes={};nativefilecount=0
cs=[c for c in reg['clips'] if c['direction'] in MED and c['action'] in ['death','meditate']]
for c in cs:
 sheet=Image.new('RGBA',(1536,((len(c['frames'])+2)//3)*640),(28,33,45,255));draw=ImageDraw.Draw(sheet)
 for i,f in enumerate(c['frames']):
  key=c['id']+':'+str(i+1);im=Image.open(V2/f['source']).convert('RGBA');l,t,r,b=f['sourceCoreBounds'];scale=f['sourceScale'];rect=f['sourceRect'];x,y,w,h=rect
  originalhash=sha(V2/f['file']);assert originalhash==f['sha256'];sourcehash=sha(V2/f['source']);sourcehashes[f['source']]=sourcehash;oldhashes[f['file']]=originalhash
  alpha=im.getchannel('A').point(lambda a:255 if a>=128 else 0);bb=alpha.crop((l,t,r,b)).getbbox();assert bb and t+bb[3]==b
  boundary=b;lift=3 if c['action']=='death' and i==2 else 0
  landmark=DEATH[c['direction']][i][:2] if c['action']=='death' else MED[c['direction']][i][:2]
  rx=f['root'][0] if c['action']=='death' and i<2 else DEATH[c['direction']][i][2] if c['action']=='death' else MED[c['direction']][i][2]
  root=[rx,boundary+lift/scale]
  supportxs=[px for px in range(l,r) if alpha.getpixel((px,b-1))]
  assert supportxs;supportpixel=[min(supportxs,key=lambda sx:abs(sx-rx)),b-1]
  if c['action']=='meditate':semantic='seated-cloth-waist/thigh-lap-ground-projection';uncertainty=[3,1];explanation='Visible waist/lap seam and folded-leg mass locate an approximate pelvis projection. Opaque folded-leg/robe envelope marks observed support boundary; covered hip bones and world floor cannot be recovered from transparent raw.'
  elif i==0:semantic='standing-observed-boot-support';uncertainty=[1,1];explanation='Both visible dark boot support spans anchor first stagger; x remains their measured support midpoint and y their observed opaque sole boundary, not hair/hem.'
  elif i==1:semantic='kneeling-observed-boot/knee/hand-support';uncertainty=[3,1];explanation='Boot/knee and planted hand/robe support spans define observed grounded crouch envelope. Retain actual measured support midpoint; cloth landmark confirms supported body, no exact pelvis/bone claim.'
  elif i==2:semantic='falling-cloth-waist-projection-candidate-lift3';uncertainty=[5,2];explanation='Waist/robe attachment projects body origin independently of long hair/whole bbox. Lowest opaque body contour is an observed reference boundary, not a measured floor. Lift3 is retained presentation candidate, not measured airborne height.'
  else:semantic='prone-cloth-waist/thigh-ground-projection';uncertainty=[6,2];explanation='Visible waist/belt and adjacent covered upper-thigh mass locate a manually inferred body-origin projection separately from the visible waist landmark. Opaque hand/robe/leg envelope supplies observed boundary. Garments obscure pelvis, so x has +/-6 native px uncertainty. This is cloth-based presentation root, not hidden pelvis bone or proven 3D floor.'
  out=native(im,rect,root,scale,f['canvas'],f['pivot']);edges=edge(out);assert not any(edges.values()),(key,edges)
  candidate=ROOT/'review/root-candidates'/c['id']/(str(i+1).zfill(2)+'.png');candidate.parent.mkdir(parents=True,exist_ok=True);out.save(candidate);nativefilecount+=1
  entry={'frameSha256':originalhash,'sourceSha256':sourcehash,'source':f['source'],'sourceRect':rect,'sourceScale':scale,'canvas':f['canvas'],'pivot':f['pivot'],'sourceRootBefore':f['root'],'sourceRootRecommended':root,'sourceSupportPlane':boundary,'observedBodyContactY':boundary,'worldProjectionY':boundary,'sourceProjectionX':rx,'sourceClothWaistLandmark':list(landmark),'sourceClothWaistPixelRGBA':list(im.getpixel(landmark)),'sourceObservedBoundaryPixel':supportpixel,'sourceObservedBoundaryPixelRGBA':list(im.getpixel(supportpixel)),'lift':lift,'liftCandidatePx':lift,'liftConvention':'Native already includes lift: rootY=observedBoundaryY+lift/sourceScale. Lift metadata only; renderer must not subtract it again.','uncertaintyNativePx':uncertainty,'uncertaintySourcePx':[round(u/scale,3) for u in uncertainty],'semantic':semantic,'manualEvidence':f'support/b-assist-a/review/{c["id"]}-roots-recommended.png','manualEvidenceExplanation':explanation,'sourceRootReviewed':False,'sourcePointFinal':False,'boneExact':False,'worldFloorMeasured':False,'scaleChanged':False,'bodyPixelsFitOrMirrored':False,'supportNativeCandidate':str(candidate.relative_to(V2)).replace('\\','/'),'supportNativeCandidateSha256':sha(candidate),'supportNativeEdges':edges,'actorAWriteCount':0}
  frames[key]=entry
  ox=(i%3)*512+8;oy=(i//3)*640+48;crop=im.crop((x,y,x+w,y+h));bg=Image.new('RGBA',crop.size,(28,33,45,255));bg.alpha_composite(crop);sheet.paste(bg,(ox,oy))
  draw.text((ox,oy-35),key,fill=(220,230,245));draw.text((ox,oy-20),f'RAW1x {x},{y} source root {rx:.1f},{root[1]:.2f}',fill=(180,200,220))
  by=oy+boundary-y;draw.line((ox+l-x,by,ox+r-x,by),fill=(100,180,250),width=1)
  lx=ox+landmark[0]-x;ly=oy+landmark[1]-y;draw.ellipse((lx-3,ly-3,lx+3,ly+3),outline=(250,110,205),width=1)
  cx=ox+root[0]-x;cy=oy+root[1]-y;draw.line((cx-6,cy,cx+6,cy),fill=(70,250,130),width=1);draw.line((cx,cy-6,cx,cy+6),fill=(70,250,130),width=1);draw.line((lx,ly,cx,by),fill=(120,130,170),width=1)
  nb=Image.new('RGBA',out.size,(28,33,45,255));nb.alpha_composite(out);sheet.paste(nb.resize((out.width*2,out.height*2),Image.Resampling.NEAREST),(ox,oy+h+30));draw.text((ox+out.width*2+4,oy+h+40),f'lift{lift}; err{uncertainty}',fill=(180,200,220))
  for gx in range(((x+49)//50)*50,x+w,50):draw.text((ox+gx-x,oy+h+4),str(gx),fill=(140,170,195))
  for gy in range(((y+49)//50)*50,y+h,50):draw.text((ox+w+2,oy+gy-y),str(gy),fill=(140,170,195))
 sheet.save(ROOT/'review'/f'{c["id"]}-roots-recommended.png')
data={'schema':'wang-lin-A-foundation-semantic-root-assist-v1','scope':'45 only: SE/S/E/SW death24+meditate21; other worker48 and actors/a are read-only','frameCount':len(frames),'bodyScaleChanged':False,'actorAWriteCount':0,'ownerApproved':False,'runtimeIntegrated':False,'sourceHashes':sourcehashes,'currentNativeHashes':oldhashes,'frames':frames,'visualReviewPending':True,'proofLegend':'Pink = visible cloth/waist/lap landmark; blue = observed opaque body boundary, not 3D world floor; green = proposed world projection/native root.'}
(ROOT/'roots-own-foundation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'45 source root candidates measured; {nativefilecount} own support-native PNGs /8 proof sheets; actor A unchanged')
