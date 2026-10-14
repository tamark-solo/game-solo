from pathlib import Path
from PIL import Image
import json,hashlib,math
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
path=ROOT/'roots-own-foundation.json';d=json.loads(path.read_text(encoding='utf-8'))
reg=json.loads((V2/'actors/a/sword/registration.json').read_text(encoding='utf-8'))
fs={c['id']+':'+str(i+1):f for c in reg['clips'] for i,f in enumerate(c['frames'])}
count=0
def check(value,label):
 global count
 assert value,label
 count+=1
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def native(im,f,root):
 x,y,w,h=f['sourceRect'];s=f['sourceScale'];p=f['pivot']
 out=im.crop((x,y,x+w,y+h)).transform(tuple(f['canvas']),Image.Transform.AFFINE,(1/s,0,root[0]-x-p[0]/s,0,1/s,root[1]-y-p[1]/s),Image.Resampling.NEAREST)
 out.putalpha(out.getchannel('A').point(lambda a:255 if a>=128 else 0));return out
check(len(d['frames'])==45,'45 own keys only')
check(sum('-death:' in k for k in d['frames'])==24,'death24')
check(sum('-meditate:' in k for k in d['frames'])==21,'med21')
for key,e in d['frames'].items():
 f=fs[key];check(any('-'+q+'-' in key for q in ['east','south','southeast','southwest']),'allowed direction')
 check(sha(V2/f['file'])==e['frameSha256'],'actor A canonical remains immutable')
 check(sha(V2/f['source'])==e['sourceSha256'],'raw source remains immutable')
 check(f['sourceRect']==e['sourceRect'] and f['sourceScale']==e['sourceScale'],'source geometry/scale unchanged')
 im=Image.open(V2/f['source']).convert('RGBA');old=Image.open(V2/f['file']).convert('RGBA')
 check(native(im,f,f['root']).tobytes()==old.tobytes(),'old canonical source RGBA exact')
 candidate=Image.open(V2/e['supportNativeCandidate']).convert('RGBA')
 check(sha(V2/e['supportNativeCandidate'])==e['supportNativeCandidateSha256'],'candidate hash')
 check(native(im,f,e['sourceRootRecommended']).tobytes()==candidate.tobytes(),'candidate actual raw RGBA exact at one unchanged scale')
 check(candidate.size==tuple(f['canvas']),'canvas retained')
 a=candidate.getchannel('A');w,h=candidate.size
 for name,rect in [('top',(0,0,w,1)),('bottom',(0,h-1,w,h)),('left',(0,0,1,h)),('right',(w-1,0,w,h))]:check(not a.crop(rect).getbbox(),name+' no clipping')
 check(list(im.getpixel(tuple(e['sourceObservedBoundaryPixel'])))==e['sourceObservedBoundaryPixelRGBA'] and e['sourceObservedBoundaryPixelRGBA'][3]>=128,'actual observed boundary opaque pixel')
 check(list(im.getpixel(tuple(e['sourceClothWaistLandmark'])))==e['sourceClothWaistPixelRGBA'] and e['sourceClothWaistPixelRGBA'][3]>=128,'actual material landmark opaque pixel')
 check(abs(e['sourceRootRecommended'][1]-e['sourceSupportPlane']-e['lift']/f['sourceScale'])<1e-9,'native lift already applied once')
 check(e['observedBodyContactY']==e['worldProjectionY']==e['sourceSupportPlane'],'boundary separate from speculative 3D world floor')
 check(not e['boneExact'] and not e['worldFloorMeasured'] and not e['scaleChanged'] and not e['bodyPixelsFitOrMirrored'],'honest semantic limitations')
 check(all(math.isfinite(v) for v in e['sourceRootRecommended']) and all(v>0 for v in e['uncertaintyNativePx']),'finite points and explicit uncertainty')
 proof=V2/e['manualEvidence'];check(proof.exists(),'raw/native proof')
 e.update({'sourceRootReviewed':True,'sourcePointFinal':True,'sourceOpaqueBoundaryReviewed':True,'sourceClothProjectionReviewed':True,'manualReviewPending':False,'manualEvidenceSha256':sha(proof),'technicalReviewScope':'Actual material/root projection and alpha framing reviewed; uncertainty remains. ART/3D floor/bone/runtime approval not implied.'})
d['visualReviewPending']=False;d['manualRootReviewComplete']=True
tmp=path.with_suffix('.json.next');tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(path)
report={'schema':'wang-lin-A-foundation-root-assist-qa-v1','passed':True,'checks':count,'rootKeys':45,'deathKeys':24,'meditateKeys':21,'sourceScaleChanges':0,'actorAWriteCount':0,'canonicalSourceRGBAProofs':45,'candidateSourceRGBAProofs':45,'nativeCandidateEdges':0,'worldFloorMeasured':False,'boneExact':False,'uncertaintyRecorded':True,'recordSha256':sha(path)}
(ROOT/'review/root-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
