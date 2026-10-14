"""Uniform measured extraction; preserve soft RGBA, source history and genuine keys."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib,sys,math
ROOT=Path(__file__).resolve().parent
FAMILY=sys.argv[1];BASE=ROOT/FAMILY
def read(p):return json.loads(p.read_text(encoding='utf8'))
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rh(im):return hashlib.sha256(im.tobytes()).hexdigest()
def bounds(im,t=1):return im.getchannel('A').point(lambda v:255 if v>=t else 0).getbbox()
def edges(im):
 a=im.getchannel('A');w,h=im.size
 return [a.crop(b).getextrema()[1] for b in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]]
# Measured source emitters at actual512px cells, not per-key bounding-box fitting.
EMITTERS={
 'banner':{
  'st-warning':[(269,450),(272,454),(272,468),(270,445),(270,440),(270,436)],
  'st-charge':[(266,302),(253,305),(267,305),(266,253),(253,253),(266,255)],
  'st-release':[(278,280),(262,279),(252,286),(254,253),(251,253),(248,257)],
  'st-resolve':[(268,475),(270,477),(270,485),(267,446),(270,450),(270,446)],
  'st-tail':[(266,284),(268,276),(269,290),(267,250),(267,250),(267,253)],
  'aoe-warning':[(271,456),(271,457),(271,458),(267,436),(265,436),(267,434)],
  'aoe-deploy':[(266,476),(266,476),(269,477),(266,443),(267,444),(268,445)],
  'aoe-active':[(266,458),(270,458),(273,458),(268,431),(269,430),(268,431)],
  'aoe-contact':[(267,484),(267,484),(267,484),(265,449),(267,450),(268,452)],
  'aoe-collapse':[(272,482),(276,482),(272,474),(270,449),(270,449),(268,439)]},
 'chariot':{
  'st-warning':[(265,423),(263,422),(263,421),(269,348),(272,347),(270,347)],
  'st-charge':[(264,295),(250,278),(255,275),(277,253),(256,235),(262,252)],
  'st-release':[(245,311),(150,310),(125,313),(112,280),(98,275),(153,255)],
  'st-resolve':[(273,410),(250,409),(254,411),(268,402),(260,400),(260,400)],
  'st-tail':[(264,294),(268,296),(266,300),(272,273),(267,265),(266,268)],
  'aoe-warning':[(272,360),(271,360),(271,363),(269,365),(267,363),(267,360)],
  'aoe-deploy':[(254,378),(254,380),(251,382),(270,363),(265,366),(261,368)],
  'aoe-active':[(277,423),(268,427),(263,437),(276,365),(268,383),(264,383)],
  'aoe-contact':[(254,433),(254,433),(254,435),(270,416),(269,415),(269,414)],
  'aoe-collapse':[(272,390),(270,394),(270,402),(273,433),(268,433),(270,433)]},
 'bead':{
  'st-warning':[(257,477),(257,477),(255,480),(276,431),(274,433),(273,432)],
  'st-charge':[(258,270),(256,270),(250,269),(268,230),(254,231),(254,246)],
  'st-release':[(250,288),(144,292),(125,295),(144,252),(127,258),(94,257)],
  'st-resolve':[(277,413),(258,422),(254,440),(283,405),(266,399),(262,398)],
  'st-tail':[(268,301),(264,299),(270,307),(266,249),(267,249),(261,249)],
  'aoe-warning':[(258,428),(254,426),(252,434),(263,411),(263,414),(264,414)],
  'aoe-deploy':[(257,417),(255,417),(254,419),(261,387),(258,397),(259,397)],
  'aoe-active':[(260,419),(258,426),(258,429),(267,410),(266,413),(266,413)],
  'aoe-contact':[(256,410),(252,415),(252,418),(261,396),(257,396),(261,396)],
  'aoe-collapse':[(286,448),(271,455),(281,457),(268,419),(270,392),(270,384)]}
}
plan=read(BASE/'plan.json');gen=read(BASE/'generation.json');sequences=[];regs=[];assessments=[];checks=[];previews=[]
for d in ['frames','atlases','review']:(BASE/d).mkdir(exist_ok=True)
for s in plan['sequences']:
 selected=next(r for r in gen['sources'] if r['id']==s['id'] and r['selected']);source=BASE/selected['file'];assert sha(source)==selected['sha256']
 sheet=Image.open(source).convert('RGBA');xs=[round(i*sheet.width/3) for i in range(4)];ys=[round(i*sheet.height/2) for i in range(3)]
 rects=[(xs[i%3],ys[i//3],xs[i%3+1],ys[i//3+1]) for i in range(6)];cells=[sheet.crop(r) for r in rects];physical=[bounds(c,16) for c in cells]
 assert all(physical);extent=max(b[2]-b[0] for b in physical) if s['extentAxis']=='width' else max(b[3]-b[1] for b in physical) if s['extentAxis']=='height' else max(max(b[2]-b[0],b[3]-b[1]) for b in physical)
 factor=s['peakExtent']/extent;em=[(p[0]*cells[i].width/512,p[1]*cells[i].height/512) for i,p in enumerate(EMITTERS[FAMILY][s['id']])]
 left=max(x*factor for x,y in em);top=max(y*factor for x,y in em);right=max((cells[i].width-x)*factor for i,(x,y) in enumerate(em));bottom=max((cells[i].height-y)*factor for i,(x,y) in enumerate(em))
 px=math.ceil(left)+4;py=math.ceil(top)+4;canvas=[px+math.ceil(right)+4,py+math.ceil(bottom)+4];pivot=[px,py]
 native=[];frames=[];outdir=BASE/'frames'/s['id'];outdir.mkdir(exist_ok=True)
 for i,c in enumerate(cells):
  inverse=(1/factor,0,em[i][0]-px/factor,0,1/factor,em[i][1]-py/factor)
  im=c.transform(tuple(canvas),Image.Transform.AFFINE,inverse,Image.Resampling.NEAREST)
  assert max(edges(im))==0;file='frames/'+s['id']+'/'+str(i+1).zfill(3)+'.png';im.save(BASE/file);native.append(im)
  soft=sum(0<v<255 for v in im.getchannel('A').get_flattened_data())
  frames.append({'id':s['id']+'-'+str(i+1),'index':i,'file':file,'canvas':canvas,'pivot':pivot,'durationMs':s['durations'][i],'sourceCell':[rects[i][0],rects[i][1],c.width,c.height],'sourceEmitter':list(em[i]),'sha256':sha(BASE/file),'rgbaSha256':rh(im),'bounds':bounds(im),'softAlphaPixels':soft})
 aw=3*(canvas[0]+4);ah=2*(canvas[1]+4);atlas=Image.new('RGBA',(aw,ah),(0,0,0,0))
 for i,im in enumerate(native):
  x=i%3*(canvas[0]+4)+2;y=i//3*(canvas[1]+4)+2;atlas.paste(im,(x,y));frames[i]['rect']=[x,y,*canvas]
 ap='atlases/'+s['id']+'.png';atlas.save(BASE/ap)
 reg={'id':s['id'],'source':selected['file'],'sourceSha256':selected['sha256'],'sourceSize':list(sheet.size),'cellRects':rects,'physicalBoundsThreshold':16,'sourceBounds':physical,'scale':factor,'actualScale':[factor,factor],'sourceEmitters':em,'emitterMethod':'Manually measured central seed or actual ground/spectral base; single common logical pivot, no per-key bbox fit.','canvas':canvas,'pivot':pivot,'plannedCanvas':s['canvas'],'scalePolicy':'One isotropic affine factor from max six-key physical extent; canvas only adds full-source padding.','alphaPolicy':'Preserve sampled RGBA; no binary-alpha operation; threshold16 measures extent only.'}
 regs.append(reg);edge=[edges(c) for c in cells];flags=[any(v>=16 for v in e) for e in edge]
 ass={'id':s['id'],'source':selected['file'],'sourceSha256':selected['sha256'],'selected':True,'uniqueRawKeys':len(set(rh(c) for c in cells)),'sourceEdgeAlphaMax':edge,'sourcePhysicalEdge16':flags,'sourcePhysicalMargins16':[[b[0],b[1],cells[i].width-b[2],cells[i].height-b[3]] for i,b in enumerate(physical)],'sourceCompletenessPolicy':'Raw cells checked separately; zero native edge is padding proof only. Low alpha halos at raw boundaries remain documented and preserved.','cameraPolicy':s['cameraPolicy'],'aimRotationAllowed':s['aimRotationAllowed'],'notes':[]}
 if any(flags):ass['notes'].append('Physical alpha16 source boundary flag; source correction/review required.')
 if any(max(e)>0 for e in edge):ass['notes'].append('Faint local halo alpha at raw cell edge; full source-cell sampled RGBA preserved, not manually erased.')
 assessments.append(ass)
 sequences.append({'id':s['id'],'familyId':FAMILY,'mode':s['mode'],'phase':s['phase'],'anchor':s['anchor'],'cameraPolicy':s['cameraPolicy'],'aimRotationAllowed':s['aimRotationAllowed'],'source':selected['file'],'sourceSha256':selected['sha256'],'canvas':canvas,'pivot':pivot,'durationMs':sum(s['durations']),'loop':False,'scale':factor,'frames':frames,'atlas':{'file':ap,'sha256':sha(BASE/ap),'size':[aw,ah],'gutter':2},'timingPolicy':'ART playback spans experimental Core fixture phases; gameplay release/pulse/contact/lifetime exclusively Core facts.','factLifetimePolicy':s['factLifetimePolicy'],'artApproved':False,'runtimeIntegrated':False})
 for color,label in [((225,218,198,255),'light'),((24,26,31,255),'dark')]:
  strip=Image.new('RGBA',(6*canvas[0],canvas[1]+24),color);dr=ImageDraw.Draw(strip)
  for i,im in enumerate(native):strip.alpha_composite(im,(i*canvas[0],24));dr.text((i*canvas[0]+4,4),s['id']+' '+str(i+1),fill=(80,75,65,255) if label=='light' else (205,205,195,255))
  file='review/'+s['id']+'-'+label+'-1x.png';strip.save(BASE/file);previews.append({'id':s['id'],'background':label,'file':file})
 parity=all(atlas.crop((f['rect'][0],f['rect'][1],f['rect'][0]+canvas[0],f['rect'][1]+canvas[1])).tobytes()==native[i].tobytes() for i,f in enumerate(frames))
 checks.append({'id':s['id'],'frames':6,'uniqueNativeKeys':len(set(rh(im) for im in native)),'softAlphaEachKey':all(f['softAlphaPixels'] for f in frames),'atlasRgbaParity':parity,'nativeEdgeAlphaMax':[edges(im) for im in native]})
decoded=sum(s['canvas'][0]*s['canvas'][1]*4*6 for s in sequences)
write(BASE/'manifest.json',{'schema':'wang-lin-equipment-family-vfx-manifest-2','familyId':FAMILY,'date':'2026-10-14','status':'candidate-production-art','sharedIdentities':['a','b'],'artApproved':False,'runtimeIntegrated':False,'releaseMs':plan['releaseMs'],'activeEndMs':plan['activeEndMs'],'endMs':plan['endMs'],'coverage':{'sequences':len(sequences),'frames':sum(len(s['frames']) for s in sequences),'decodedCanonicalBytes':decoded,'decodedCanonicalMiB':decoded/1048576,'directionalSpiritViews':0},'sequences':sequences})
write(BASE/'registration.json',{'schema':'wang-lin-equipment-family-vfx-registration-2','familyId':FAMILY,'sequences':regs})
write(BASE/'review/source-assessment.json',{'schema':'wang-lin-equipment-family-vfx-source-assessment-2','familyId':FAMILY,'sources':assessments,'historyCount':len(gen['sources']),'selectedCount':10,'artApproved':False})
write(BASE/'review/pack-verification.json',{'schema':'wang-lin-equipment-family-vfx-pack-verification-2','checks':checks,'previews':previews,'decodedCanonicalBytes':decoded,'sourcePhysicalBoundaryFlags':sum(sum(a['sourcePhysicalEdge16']) for a in assessments),'artApproved':False,'runtimeIntegrated':False})
print(json.dumps({'family':FAMILY,'sequences':len(sequences),'frames':60,'decodedMiB':decoded/1048576,'sourceBoundaryFlags':{a['id']:a['sourcePhysicalEdge16'] for a in assessments if any(a['sourcePhysicalEdge16'])},'canvases':{s['id']:s['canvas'] for s in sequences}}))
