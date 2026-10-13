from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
from monster_sheet_tools import separators
W=Path(__file__).resolve().parents[1]
R=W/'docs/design/vfx/van-hai-monster-vfx-v1'
p=json.loads((R/'production-plan.json').read_text(encoding='utf-8'))
def sha(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()
def emitter(im,b):
 q=im.load();l,t,r,bt=b
 peak=max(min(q[x,y][:3])*q[x,y][3]/255 for y in range(t,bt) for x in range(l,r))
 pts=[(x,y,min(q[x,y][:3])*q[x,y][3]/255) for y in range(t,bt) for x in range(l,r) if min(q[x,y][:3])*q[x,y][3]/255>=peak*.98 and q[x,y][3]>=64]
 weight=sum(v[2] for v in pts)
 if not weight:raise ValueError('No measurable emitter')
 return [sum(v[0]*v[2] for v in pts)/weight,sum(v[1]*v[2] for v in pts)/weight]
clips={};props={};sources=[];regs=[]
for j in p['jobs']:
 f=R/j['source']
 if not f.exists() or not (R/'generation'/f"{j['id']}.json").exists():continue
 im=Image.open(f).convert('RGBA');alpha=im.getchannel('A');w,h=im.size;canvas=j['canvas'];anchor=j['anchor']
 if alpha.getextrema()[0]>0:raise ValueError(j['id']+': opaque background')
 if j['type']=='held-prop':
  b=alpha.point(lambda v:255 if v>=64 else 0).getbbox();crop=im.crop(b);scale=j['bodyHeightPx']/max(crop.size)
  size=[max(1,round(v*scale)) for v in crop.size];native=crop.resize(tuple(size),Image.Resampling.NEAREST)
  grip=[b[0]+crop.width*.10,b[1]+crop.height*(.52 if j['id']=='rogue-dagger' else .86)]
  offset=[round(anchor[0]-(grip[0]-b[0])*scale),round(anchor[1]-(grip[1]-b[1])*scale)]
  out=Image.new('RGBA',tuple(canvas));out.alpha_composite(native,tuple(offset));file='props/'+j['id']+'.png';out.save(R/file)
  props[j['id']]={'id':j['id'],'file':file,'sha256':sha(R/file),'frameSize':canvas,'anchor':anchor,'sourceGrip':grip,'sourceBounds':list(b),'scale':scale,'pixelsResampled':True,'artApproved':False,'gripStatus':'source-relative candidate; hand socket review required'}
 else:
  mask=alpha.point(lambda v:255 if v>=4 else 0);data=mask.tobytes();px=[sum(data[y*w+x]!=0 for y in range(h)) for x in range(w)]
  xs,gutters=separators(px,6);regions=[];cuts=[]
  for i in range(6):
   rect=[xs[i],0,xs[i+1],h];cut=im.crop(tuple(rect));visible=cut.getchannel('A').point(lambda v:255 if v>=4 else 0).getbbox()
   if not visible:raise ValueError(j['id']+': empty FX frame')
   b=cut.getchannel('A').getbbox();origin=emitter(cut,visible) if j['kind']=='directional' else [cut.width/2,h/2]
   cuts.append(cut);regions.append({'sourceRect':rect,'alphaBounds':list(b),'emitter':origin})
  factors=[]
  for g in regions:
   l,t,right,b=g['alphaBounds'];ox,oy=g['emitter']
   for room,extent in [(anchor[0]-2,ox-l),(canvas[0]-anchor[0]-2,right-ox),(anchor[1]-2,oy-t),(canvas[1]-anchor[1]-2,b-oy)]:
    if extent>0:factors.append(room/extent)
  scale=min(factors)*.98;frames=[];atlas=Image.new('RGBA',((canvas[0]+4)*6,canvas[1]+4));(R/'frames'/j['id']).mkdir(parents=True,exist_ok=True)
  for i,cut in enumerate(cuts):
   b=regions[i]['alphaBounds'];origin=regions[i]['emitter'];crop=cut.crop(tuple(b));size=[max(1,round(v*scale)) for v in crop.size]
   native=crop.resize(tuple(size),Image.Resampling.NEAREST);offset=[round(anchor[0]+(b[0]-origin[0])*scale),round(anchor[1]+(b[1]-origin[1])*scale)]
   if min(offset)<0 or offset[0]+size[0]>canvas[0] or offset[1]+size[1]>canvas[1]:raise ValueError(j['id']+': FX canvas overflow')
   out=Image.new('RGBA',tuple(canvas));out.alpha_composite(native,tuple(offset));file=f"frames/{j['id']}/{i+1:03}.png";out.save(R/file)
   rect={'x':2+i*(canvas[0]+4),'y':2,'w':canvas[0],'h':canvas[1]};atlas.alpha_composite(out,(rect['x'],rect['y']))
   frames.append({'file':file,'sha256':sha(R/file),'rect':rect,'sourceMapping':i,'bounds':list(out.getchannel('A').getbbox())})
   regions[i].update(scale=scale,nativeOffset=offset,softAlphaPreserved=True,shardsRemoved=0)
  file='atlases/'+j['id']+'.png';atlas.save(R/file)
  clips[j['id']]={'id':j['id'],'kind':j['kind'],'frameSize':canvas,'anchor':anchor,'frames':frames,'atlas':file,'atlasSize':list(atlas.size),'atlasSha256':sha(R/file),'fps':30,'durations':[1]*6,'loop':False,'artApproved':False,'sampling':'nearest core / original soft alpha','rotationReuse':j['kind']=='directional'}
  regs.append({'id':j['id'],'source':j['source'],'sourceSize':[w,h],'xCuts':xs,'gutters':gutters,'sharedSequenceScale':scale,'frames':regions,'bodyAlphaThresholdApplied':False,'shardsRemoved':0})
 sources.append({'id':j['id'],'source':j['source'],'sourceSha256':sha(f),'prompt':j['prompt'],'promptSha256':sha(R/j['prompt']),'inputFiles':[{'file':x,'sha256':sha(W/x)} for x in j['references']],'pixelsResampled':True,'type':j['type']})
c={'version':1,'id':'van-hai-monster-vfx-v1','date':'2026-10-13','status':'candidate-art-review','artApproved':False,'ownerApproved':False,'runtimeConsumable':False,'tool':'built-in ImageGen','clips':clips,'props':props,'sources':sources,'coverage':{'required':[j['id'] for j in p['jobs']],'missing':[j['id'] for j in p['jobs'] if j['id'] not in clips and j['id'] not in props],'sequenceCount':len(clips),'poses':len(clips)*6,'heldProps':len(props)},'alpha':'Soft original RGBA / all shards, no binary body threshold','registration':'registration.json'}
for name,obj in [('catalog.json',c),('registration.json',{'version':1,'artApproved':False,'registration':regs})]:(R/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
board=Image.new('RGB',(1000,max(200,len(clips)*146+46)),'#142a25');draw=ImageDraw.Draw(board);font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)
for row,(id,clip) in enumerate(clips.items()):
 draw.text((8,row*146+42),id,font=font,fill='#ddc89b')
 for i,f in enumerate(clip['frames']):
  image=Image.open(R/f['file']).convert('RGBA');board.paste(image,(150+i*140-clip['anchor'][0],row*146+96-clip['anchor'][1]),image)
board.save(R/'review/native-sequences.png')
print(json.dumps({'vfxSequences':len(clips),'poses':len(clips)*6,'heldProps':len(props),'missing':len(c['coverage']['missing']),'softAlpha':True}))
