from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,math,statistics
ROOT=Path(__file__).resolve().parent
CANVAS=(112,112);PIVOT=(56,104)
ACTIONS=['neutral','idle','run','cast-single-target','cast-aoe']
DURATIONS={'idle':[150]*6,'run':[100]*6,'cast-single-target':[160,160,120,100,160,200],'cast-aoe':[200,200,200,100,200,300]}
RUN_LIFTS=[0,2,0,2,0,0]

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,value):
 p.parent.mkdir(parents=True,exist_ok=True)
 temp=p.with_name(p.name+'.next');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(p)
def mask128(im):return im.getchannel('A').point(lambda x:255 if x>=128 else 0)
def runs(values,zero=False):
 out=[];start=None
 for i,v in enumerate(values+[0 if not zero else 1]):
  active=(v==0) if zero else (v>0)
  if active and start is None:start=i
  if not active and start is not None:out.append((start,i));start=None
 return out
def projections(a,axis):
 w,h=a.size
 return [sum(v>0 for v in a.crop((0,y,w,y+1)).get_flattened_data()) for y in range(h)] if axis=='y' else [sum(v>0 for v in a.crop((x,0,x+1,h)).get_flattened_data()) for x in range(w)]
def cells_for(im):
 a=mask128(im);ybands=runs(projections(a,'y'));assert len(ybands) in (4,5),('rows',ybands)
 output=[]
 for row,(top,bottom) in enumerate(ybands):
  xbands=runs(projections(a.crop((0,top,im.width,bottom)),'x'));assert len(xbands) in (3,6),('cols',row,xbands)
  y0=0 if row==0 else (ybands[row-1][1]+top)//2
  y1=im.height if row==len(ybands)-1 else (bottom+ybands[row+1][0])//2
  items=[]
  for col,(left,right) in enumerate(xbands):
   x0=0 if col==0 else (xbands[col-1][1]+left)//2
   x1=im.width if col==len(xbands)-1 else (right+xbands[col+1][0])//2
   cell_box=a.crop((x0,y0,x1,y1)).getbbox()
   actual=[x0+cell_box[0],y0+cell_box[1],x0+cell_box[2],y0+cell_box[3]]
   items.append({'row':row,'col':col,'rect':[x0,y0,x1-x0,y1-y0],'coreBounds':actual})
  output.append(items)
 return output
def components_skin(im,rect):
 x0,y0,w,h=rect;crop=im.crop((x0,y0,x0+w,y0+h)).convert('RGBA')
 candidates=set()
 for y in range(h):
  for x in range(w):
   r,g,b,a=crop.getpixel((x,y))
   if a>=128 and r>175 and g>100 and b>65 and 15<r-g<95 and r-b>30 and g-b>9:candidates.add((x,y))
 comps=[]
 while candidates:
  start=candidates.pop();todo=[start];points=[]
  while todo:
   x,y=todo.pop();points.append((x,y))
   for px,py in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
    if (px,py) in candidates:candidates.remove((px,py));todo.append((px,py))
  if len(points)>=9:
   xs=[p[0] for p in points];ys=[p[1] for p in points]
   comps.append({'area':len(points),'center':[round(x0+sum(xs)/len(xs),2),round(y0+sum(ys)/len(ys),2)],'rect':[x0+min(xs),y0+min(ys),max(xs)-min(xs)+1,max(ys)-min(ys)+1]})
 return sorted(comps,key=lambda c:-c['area'])
def foot_anchor(im,core):
 left,top,right,bottom=core;height=bottom-top
 bandtop=bottom-max(7,round(height*.04))
 a=mask128(im).crop((left,bandtop,right,bottom));bands=runs(projections(a,'x'))
 bands=[(l,r) for l,r in bands if r-l>=4]
 if len(bands)>=2:
  centers=[(left+l+left+r-1)/2 for l,r in bands]
  x=(centers[0]+centers[-1])/2
 elif bands:
  x=left+(bands[0][0]+bands[0][1]-1)/2
 else:raise AssertionError('No measurable human boot sole in source cell')
 return [x,bottom],{'bandRect':[left,bandtop,right-left,bottom-bandtop],'footProjectionRuns':[[left+l,left+r] for l,r in bands],'method':'lower4percent human boot-sole projection, visual inspection excludes robe tails; both feet midpoint when planted, support foot for run; not hair/robe bbox'}
def edge_count(im):
 a=mask128(im);w,h=im.size
 return {name:sum(v>0 for v in a.crop(rect).get_flattened_data()) for name,rect in {'top':(0,0,w,1),'bottom':(0,h-1,w,h),'left':(0,0,1,h),'right':(w-1,0,w,h)}.items()}
def vivid_count(im):
 return sum(1 for r,g,b,a in im.get_flattened_data() if a>=128 and ((r>200 and b>160 and g<110) or (b>200 and r<110 and g<110) or (r>230 and g<80 and b<80)))
def nativepoint(p,root,scale):return [round(56+(p[0]-root[0])*scale,3),round(104+(p[1]-root[1])*scale,3)]
def pack(im,rect,root,scale):
 x,y,w,h=rect;crop=im.crop((x,y,x+w,y+h))
 inverse=(1/scale,0,root[0]-x-56/scale,0,1/scale,root[1]-y-104/scale)
 native=crop.transform(CANVAS,Image.Transform.AFFINE,inverse,Image.Resampling.NEAREST)
 native.putalpha(native.getchannel('A').point(lambda a:255 if a>=128 else 0))
 return native
# Production entry below replaces the provisional legacy socket classifier.
def production_main():
 gen=json.loads((ROOT/'motion-generation.json').read_text(encoding='utf-8'))
 manual=json.loads((ROOT/'motion'/'manual-socket-data.json').read_text(encoding='utf-8'))
 sources=[];clips_by_id={};calibrations=[];assessment=[];source_cells=[];replacements={(r['identityId'],r['direction'],r['actionReplacement']) for r in gen['records'] if r.get('actionReplacement')}
 for record in gen['records']:
  path=ROOT/record['raw'];assert sha(path)==record['sha256'],'source hash changed '+record['id']
  assert sha(ROOT/record['prompt'])==record['promptSha256'],'prompt hash changed'
  for p in record['inputs']:assert sha(ROOT/p['file'])==p['sha256'],'input hash changed'
  im=Image.open(path).convert('RGBA');source_grid=cells_for(im);replacement=record.get('actionReplacement')
  if replacement:
   assert len(source_grid)==4 and all(len(r)==3 for r in source_grid),'replacement layout'
   grid=[source_grid[0]+source_grid[1],source_grid[2]+source_grid[3]];labels=['neutral',replacement]
  else:
   assert len(source_grid)==5 and all(len(r)==6 for r in source_grid),'full source layout'
   grid=source_grid;labels=ACTIONS
  heights=[c['coreBounds'][3]-c['coreBounds'][1] for c in grid[0]];median_height=statistics.median(heights);scale=80/median_height
  source={'id':record['id'],'file':record['raw'],'sha256':record['sha256'],'sourceSize':list(im.size),'neutralHeights':heights,'scale':scale,'scaleBasis':'80/median of six individual dense-hair-crown to human-boot-ground neutrals; one isotropic factor for this entire source','sourceEdges':edge_count(im),'opaqueVividFringePixels':vivid_count(im),'rawGrid':source_grid,'calibrationCount':6,'sourcePoseCount':sum(len(r) for r in source_grid),'actionReplacement':replacement,'selectedActions':[a for a in labels[1:] if replacement or (record['identityId'],record['direction'],a) not in replacements]}
  assert not any(source['sourceEdges'].values()),'source edge clipping'
  sources.append(source);allframes=[];source_cal=None;metrics=[]
  for row,(action,cellrow) in enumerate(zip(labels,grid)):
   clip_id=f"sword-{record['identityId']}-{record['direction']}-{action}"
   manual_key=record['id']+'::'+action
   if manual_key not in manual:manual_key=clip_id
   assert manual_key in manual and len(manual[manual_key])==6,'missing manual source sockets '+manual_key
   active=action=='neutral' or replacement or (record['identityId'],record['direction'],action) not in replacements
   frames=[]
   for col,cell in enumerate(cellrow):
    root,foot=foot_anchor(im,cell['coreBounds']);lift=RUN_LIFTS[col] if action=='run' else 0;root[1]+=lift/scale
    measured=manual[manual_key][col];point_source=measured['source'];source_rect=measured['sourceRect'];visibility=measured.get('visibility','visible-palm')
    if not replacement and action!='neutral':
     seals={('sword-a-southeast-cast-single-target',2),('sword-b-southeast-cast-single-target',0),('sword-b-southeast-cast-single-target',5),('sword-a-southeast-cast-aoe',1),('sword-b-southeast-cast-aoe',1)}
     occluded={('sword-a-north-cast-aoe',0),('sword-a-north-cast-aoe',1),('sword-b-north-run',1),('sword-b-north-run',5),('sword-b-north-cast-single-target',2),('sword-b-north-cast-single-target',4),('sword-b-north-cast-aoe',0),('sword-b-north-cast-aoe',1)}
     if (clip_id,col) in seals:visibility='seal'
     if (clip_id,col) in occluded:
      visibility='occluded';point_source=measured['sourceTarget'];source_rect=[round(point_source[0]-6),round(point_source[1]-6),12,12]
     if action.startswith('cast-') and visibility=='visible-palm' and col in (3,4):visibility='open-palm'
    native=pack(im,cell['rect'],root,scale)
    assert not any(edge_count(native).values()),'native clipping '+clip_id
    kind='calibration' if action=='neutral' else 'frames' if active else 'history'
    folder=record['id'] if action=='neutral' else clip_id if active else record['id']+'-'+action
    rel=f'motion/{kind}/{folder}/{col+1:02}.png';output=ROOT/rel;output.parent.mkdir(parents=True,exist_ok=True);native.save(output)
    point=nativepoint(point_source,root,scale);rx,ry,rw,rh=source_rect
    occlusion=[round(56+(rx-root[0])*scale)-1,round(104+(ry-root[1])*scale)-1,max(3,round(rw*scale)+2),max(3,round(rh*scale)+2)]
    angle=(0 if record['direction']=='southeast' else 135)
    if action=='run':angle+=[15,-25,15,-25,-20,15][col]
    body_top=cell['coreBounds'][1];body_height=cell['coreBounds'][3]-body_top
    head_roi=[cell['rect'][0],cell['rect'][1],cell['rect'][2],max(1,round(body_top+body_height*.48)-cell['rect'][1])]
    head_skin=components_skin(im,head_roi);face=max(head_skin,key=lambda z:z['area']) if head_skin else None
    face_proxy={'widthSource':face['rect'][2],'heightSource':face['rect'][3],'nativeWidth':round(face['rect'][2]*scale,3),'method':'warm-skin connected island restricted to upper48% of each body silhouette; face-width proxy only, not proof of full skull anatomy'} if face else None
    frame={'index':col,'file':rel,'sha256':sha(output),'canvas':list(CANVAS),'pivot':list(PIVOT),'durationMs':DURATIONS.get(action,[150]*6)[col],'source':record['raw'],'sourceId':record['id'],'sourceRect':cell['rect'],'sourceCoreBounds':cell['coreBounds'],'sourceScale':scale,'root':[round(v,3) for v in root],'rootMeasurement':foot,'lift':lift,'bounds':native.getbbox(),'coreEdges':edge_count(native),'opaqueVividFringePixels':vivid_count(native),'headFaceProxy':face_proxy,'grip':{'source':point_source,'native':point,'angleDeg':angle,'occlusionRect':occlusion,'sourceOcclusionRect':source_rect,'emptyHand':True,'selection':'manual-source-palm' if visibility!='occluded' else 'manual-forearm-endpoint-estimate','measuredFrom':'individually selected actual source palm; hidden/seal candidates explicitly identified; no neutral socket transformed onto another action','visibility':visibility,'attachmentPolicy':'detach-hover' if visibility in ('seal','occluded','open-palm') else 'held-candidate','approved':False},'active':active}
    assert all(0<=p<=112 for p in point),'socket outside canvas'
    frames.append(frame);allframes.append((row,action,col,native,frame))
   recovery_height=frames[-1]['sourceCoreBounds'][3]-frames[-1]['sourceCoreBounds'][1]
   metrics.append({'action':action,'bodySilhouetteHeightsSource':[f['sourceCoreBounds'][3]-f['sourceCoreBounds'][1] for f in frames],'recoverySilhouetteHeightSource':recovery_height,'recoveryDeltaPct':round((recovery_height/median_height-1)*100,3),'faceSkinWidthsSource':[f['headFaceProxy']['widthSource'] if f['headFaceProxy'] else None for f in frames],'active':active,'measurementLimit':'Active raised hands can exceed natural crown; recovery silhouette uses actual hair/boots where hands are lowered. Face-width proxy is not a full skull measurement.'})
   if action=='neutral':
    source_cal={'id':record['id']+'-neutral','identityId':record['identityId'],'direction':record['direction'],'source':record['raw'],'sourceId':record['id'],'scale':scale,'frames':frames,'animationClip':False};calibrations.append(source_cal)
   elif active:
    if record['id']=='sword-a-southeast-aoe-r2':
     # Root-authorized seventh key is a real neutral from this same source and same scale.
     cal=source_cal['frames'][0];frame=json.loads(json.dumps(cal));frame.update({'index':6,'durationMs':160,'reuseReason':'standing recovery from same-source neutral','sourcePoseRole':'neutral-calibration-reused-as-standing-recovery','active':True})
     rel=f'motion/frames/{clip_id}/07.png';Image.open(ROOT/cal['file']).save(ROOT/rel);frame['file']=rel;frame['sha256']=sha(ROOT/rel);frames.append(frame);allframes.append((row,action,6,Image.open(ROOT/rel).convert('RGBA'),frame))
    count=len(frames);atlas_rel=f'motion/atlases/{clip_id}.png';atlas=Image.new('RGBA',(count*116,116),(0,0,0,0));rects=[]
    for idx,frame in enumerate(frames):
     atlas.paste(Image.open(ROOT/frame['file']).convert('RGBA'),(idx*116+2,2));rects.append([idx*116+2,2,112,112]);frame['atlasRect']=rects[-1]
    atlas_path=ROOT/atlas_rel;atlas_path.parent.mkdir(parents=True,exist_ok=True);atlas.save(atlas_path)
    # Meaningful extraction proof: every atlas rectangle is the exact canonical RGBA.
    for f,rect in zip(frames,rects):assert atlas.crop((rect[0],rect[1],rect[0]+rect[2],rect[1]+rect[3])).tobytes()==Image.open(ROOT/f['file']).convert('RGBA').tobytes(),'atlas RGBA mismatch'
    clips_by_id[clip_id]={'id':clip_id,'identityId':record['identityId'],'familyId':'sword','direction':record['direction'],'action':action,'canvas':list(CANVAS),'pivot':list(PIVOT),'frames':frames,'frameCount':count,'loop':action in ('idle','run'),'holdLast':action not in ('idle','run'),'durationMs':sum(f['durationMs'] for f in frames),'timingScope':'preview fixture only, not server timing or balance','atlas':atlas_rel,'atlasSha256':sha(atlas_path),'atlasSize':[count*116,116],'gutter':2,'rects':rects,'source':record['raw'],'sourceId':record['id'],'sourceScale':scale,'ownerApproved':False,'motionApproved':False,'runtimeReady':False}
  columns=7 if record['id']=='sword-a-southeast-aoe-r2' else 6
  contact=Image.new('RGBA',(columns*116,len(labels)*130+18),(31,36,49,255));draw=ImageDraw.Draw(contact)
  for row,action,col,native,frame in allframes:
   x=col*116+2;y=row*130+16;contact.alpha_composite(native,(x,y));draw.text((x,row*130+2),action[:11]+str(col+1)+(' H' if not frame['active'] else ''),fill=(160,162,170,255))
   gx,gy=frame['grip']['native'];color=(255,169,87,255) if frame['grip']['visibility'] in ('seal','occluded') else (102,196,255,255) if frame['grip']['visibility']=='open-palm' else (98,234,151,255)
   draw.ellipse((x+gx-2,y+gy-2,x+gx+2,y+gy+2),outline=color)
  draw.text((2,len(labels)*130+2),'green palm / blue open palm / orange seal-hidden candidate / H history',fill=(150,153,162,255))
  cp=ROOT/'motion'/'contact'/f"{record['id']}-marked-1x.png";cp.parent.mkdir(parents=True,exist_ok=True);contact.save(cp)
  for zoom in (2,3):contact.resize((contact.width*zoom,contact.height*zoom),Image.Resampling.NEAREST).save(cp.with_name(cp.name.replace('1x',f'{zoom}x')))
  source_cells.append({'id':record['id'],'sourceSha256':record['sha256'],'cells':[{'row':row,'action':action,'col':col,'grip':frame['grip'],'root':frame['root'],'core':frame['sourceCoreBounds'],'active':frame['active']} for row,action,col,native,frame in allframes]})
  assessment.append({'sourceId':record['id'],'sourceViewed':True,'nativeContactViewed':True,'trueDirection':True,'northShowsNoEyesOrChest':True if record['direction']=='north' else None,'bodyOnly':True,'rawRowCount':len(source_grid),'rawColumns':len(source_grid[0]),'sourcePoses':source['sourcePoseCount'],'selectedActions':source['selectedActions'],'neutralCalibrations':6,'singleSourceScale':scale,'anatomyMeasurements':metrics,'opaqueVividFringePixelsSource':source['opaqueVividFringePixels'],'notes':'Original southeast cast rows superseded by their own r2 sources and kept as source history. North run twists slightly while remaining back, no eyes/chest. AOE r2 starts with a seal instead of settle-low; A-SE adds a seventh same-source standing recovery after six lower-stance action keys. Hands are manually picked; orange hidden/seal candidates require detached or hovering gear. Raw low-alpha colored fringe retained, native binary128 has no vivid opaque fringes.','ownerApproved':False,'motionApproved':False})
 clips=list(clips_by_id.values());clips.sort(key=lambda c:(c['identityId'],c['direction'],ACTIONS.index(c['action'])))
 assert len(clips)==16 and sum(len(c['frames']) for c in clips)==97,'pilot coverage'
 result={'schema':'wang-lin-equipment-pilot-motion-registration-1','date':'2026-10-14','canvas':list(CANVAS),'pivot':list(PIVOT),'bodyHeight':80,'sources':sources,'calibrations':calibrations,'clips':clips,'coverage':{'identities':2,'families':1,'directions':['southeast','north'],'actions':ACTIONS[1:],'clips':16,'motionPoses':97,'neutralCalibrations':48,'sourcePoses':168,'sourceCount':8},'exceptions':[{'clipId':'sword-a-southeast-cast-aoe','frameCount':7,'reason':'six true r2 action keys plus a same-source neutral standing recovery; root authorized, not an image fit or identity patch'}],'ownerApproved':False,'motionApproved':False,'runtimeReady':False}
 write(ROOT/'motion-registration.json',result)
 write(ROOT/'motion'/'assessment.json',{'schema':'wang-lin-equipment-pilot-motion-assessment-1','items':assessment,'technicalVerification':{'activeClips':16,'canonicalMotionPoses':97,'calibrations':48,'sourcePoseCaps':168,'atlasRgbaRectsVerified':97,'opaqueVividFringePixelsNative':sum(f['opaqueVividFringePixels'] for c in clips for f in c['frames']),'sourceCoreEdgePixels':sum(sum(s['sourceEdges'].values()) for s in sources),'nativeCoreEdgePixels':sum(sum(f['coreEdges'].values()) for c in clips for f in c['frames']),'manuallySelectedMotionSockets':97},'limitations':['Only two real directions, not eight.','16 clips97poses exclude48neutral calibration source poses.','A-SE AOE uses a seventh same-source standing key to finish at80 rather than fit the lower-stance pose.','Body silhouettes remain slimmer and head smaller than Wang as approved ownidentity concept. No per-pose fit, oldWang patch, color painting or mirror.','Root/hand candidates need final per-pose gear review; seal/hidden/open palms explicitly detach-hover.','Run lift0/2px and preview durations are fixtures, not server balance.'],'ownerApproved':False,'motionApproved':False,'runtimeReady':False})
 write(ROOT/'motion'/'socket-measurements.json',{'sourceCells':source_cells,'method':'Manual actual source palm selection for each pose; explicit forearm endpoint estimates for hidden hands. Skin classification is debugging data only, never final selection. No neutral transformed onto other actions.','approved':False})
 print(json.dumps(result['coverage']|{'opaqueVividNative':sum(f['opaqueVividFringePixels'] for c in clips for f in c['frames']),'nativeEdges':sum(sum(f['coreEdges'].values()) for c in clips for f in c['frames'])}))

if __name__=='__main__':production_main()

