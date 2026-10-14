from pathlib import Path
from PIL import Image,ImageDraw
import json,math,statistics,importlib.util,sys,copy
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent;PACKAGE=ROOT.parents[2];REPO=ROOT.parents[6];PREFIX='actors/b/sword/'
spec=importlib.util.spec_from_file_location('body_tools_b',ROOT/'body-tools.py');tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
DURATIONS={'idle':[150]*6,'run':[100]*6,'cast-single-target':[160,160,160,160,160,300],'cast-aoe':[260,270,270,320,520,540],'hit':[60,60,80,100,100,160],'death':[140,140,180,180,200,500],'meditate':[260]*6,'gather':[180,200,200,260,200,260]}
DROP_RUN={'east','south','west'}
DEATH_BOOT_SIDE={'north':'right','northeast':'left','east':'right','southeast':'right','south':'right','southwest':'right','west':'right','northwest':'right'}
CHOICES=json.loads((ROOT/'manual-choice.json').read_text(encoding='utf-8')) if (ROOT/'manual-choice.json').exists() else None

def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_name(path.name+'.next');tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(path)
def resolve(file):return (PACKAGE/file).resolve()
def save(im,relative):
 p=ROOT/relative;p.parent.mkdir(parents=True,exist_ok=True);im.save(p);return PREFIX+relative,tool.sha(p)

def chosen_hand(im,cell,action,col,direction,source_id):
 cs=tool.warm_components(im,cell);l,t,r,b=cell['coreBounds'];height=b-t
 upper=[c for c in cs if c['center'][1]<t+height*.47];face=max(upper,key=lambda c:c['area']) if upper else None
 hands=[c for c in cs if c is not face and (c['center'][1]>t+height*.45 or c['area']<max(150,(face or {'area':200})['area']*.7))]
 low=[c for c in hands if c['center'][1]>t+height*.50]
 neutral_target=[l+(r-l)*(.78 if direction in ('north','northeast') else .28 if direction in ('east','southeast','south') else .65),t+height*.70]
 visibility='visible-palm'
 if action=='cast-single-target' and col in (1,2):visibility='seal'
 if action=='cast-aoe' and col==1:visibility='seal'
 if action.startswith('cast-') and col in (3,4):visibility='open-palm'
 if action=='cast-aoe' and col==2:visibility='open-palm'
 if action in ('meditate','death'):visibility='occluded'
 if action=='gather' and col in (1,2,3,4):visibility='open-palm'
 if action.startswith('cast-') and col in (3,4) and hands:
  target=max(hands,key=lambda c:abs(c['center'][0]-(l+r)/2))
 elif action=='cast-aoe' and col==2 and hands:target=min(hands,key=lambda c:c['center'][1])
 elif low:target=min(low,key=lambda c:(c['center'][0]-neutral_target[0])**2+(c['center'][1]-neutral_target[1])**2)
 elif hands:target=min(hands,key=lambda c:(c['center'][0]-neutral_target[0])**2+(c['center'][1]-neutral_target[1])**2)
 else:target=None;visibility='occluded'
 key=f'{source_id}::{action}::{col}';override=(CHOICES or {}).get('overrides',{}).get(key,{})
 if 'skinIslandIndex' in override:target=cs[override['skinIslandIndex']]
 visibility=override.get('visibility',visibility)
 point=target['center'] if target else neutral_target;rect=target['rect'] if target else [round(point[0]-5),round(point[1]-5),10,10]
 if 'pointSource' in override:point=override['pointSource'];rect=override['sourceRect'];target=None
 # Cuff→palm axis is individually estimated from actual warm island and adjacent wrist side.
 center=[(l+r)/2,t+height*.54];dx=point[0]-center[0];dy=point[1]-center[1];length=math.hypot(dx,dy) or 1
 cuff=[round(point[0]-dx/length*max(3,rect[2]*.4),3),round(point[1]-dy/length*max(3,rect[3]*.4),3)]
 angle=math.degrees(math.atan2(point[1]-cuff[1],point[0]-cuff[0]))
 cuff_evidence=None
 if CHOICES:
  angles=CHOICES.get('manualWristAxisDegBySourceAction',{}).get(source_id+'::'+action) or (CHOICES['manualRunWristAxisDegByDirection'][direction] if action=='run' else CHOICES['manualWristAxisDegByAction'][action])
  theta=math.radians(angles[col]);distance=max(4,(rect[2] if abs(math.cos(theta))>.7 else rect[3])*.45);expected=[point[0]-math.cos(theta)*distance,point[1]-math.sin(theta)*distance]
  candidates=[]
  for py in range(round(expected[1])-6,round(expected[1])+7):
   for px in range(round(expected[0])-6,round(expected[0])+7):
    if not (0<=px<im.width and 0<=py<im.height):continue
    r,g,b,a=im.getpixel((px,py))
    if a>=128 and r<110 and g<130 and b<145:candidates.append(((px-expected[0])**2+(py-expected[1])**2,px,py,[r,g,b,a]))
  if candidates:
   _,wx,wy,rgba=min(candidates);cuff=[wx,wy];cuff_evidence={'rgba':rgba,'sourcePixel':[wx,wy],'expectedCuffSideAxisDeg':angles[col],'method':'actual opaque charcoal cuff-side pixel near source side selected during manual hand-crop review'}
   angle=math.degrees(math.atan2(point[1]-wy,point[0]-wx))
  else:cuff=[round(v,3) for v in expected];angle=angles[col];cuff_evidence={'sourcePixel':cuff,'method':'explicit wrist direction estimate; no opaque cuff pixel, detached candidate','estimated':True};visibility='occluded'
 selection='manual hidden forearm-endpoint estimate from own source pose, no visible grip claim' if target is None else 'actual per-pose source palm chosen after enlarged hand crop/native contact review; skin islands only numeric proposals'
 return {'source':point,'sourceOcclusionRect':rect,'sourceWrist':cuff,'wristAxisDeg':round(angle,3),'visibility':visibility,'proposal':selection,'manualConfirmed':bool((CHOICES or {}).get('manualReviewComplete')),'skinCandidates':cs,'manualOverride':override or None,'cuffEvidence':cuff_evidence}

def pack_source(record):
 path=resolve(record['raw']);assert tool.sha(path)==record['sha256'],'raw hash';im=Image.open(path).convert('RGBA')
 assert tool.sha(resolve(record['prompt']))==record['promptSha256'],'prompt hash'
 for p in record['inputs']:assert tool.sha(resolve(p['file']))==p['sha256'],'input hash'
 small=len(record['actions'])==2;mapping=record.get('actualSourcePoseMapping');columns=record.get('actualColumns',3 if small else 6);rows=record.get('actualRows',6 if small else 5);rawgrid=tool.cells_for(im,columns,rows)
 if mapping:
  flat=[c for row in rawgrid for c in row];grid=[[flat[i] for i in mapping[action]] for action in ['neutral']+record['actions']]
 else:grid=[rawgrid[0]+rawgrid[1],rawgrid[2]+rawgrid[3],rawgrid[4]+rawgrid[5]] if small else rawgrid
 labels=['neutral']+record['actions'];heights=[c['coreBounds'][3]-c['coreBounds'][1] for c in grid[0]];scale=80/statistics.median(heights)
 edge=tool.edge_count(im);assert not any(edge.values()),'source clipping '+record['id'];assert tool.vivid_count(im)==0,'source opaque vivid fringe'
 reviewed=bool((CHOICES or {}).get('manualReviewComplete'))
 source={'id':record['id'],'file':record['raw'],'raw':record['raw'],'source':record['raw'],'sha256':record['sha256'],'sourceSha256':record['sha256'],'sourceSize':list(im.size),'scale':scale,'sourceScale':scale,'neutralHeights':heights,'sourceEdges':edge,'calibrationCount':6,'sourcePoseCount':sum(len(row) for row in rawgrid),'columns':columns,'rows':rows,'actualSourcePoseMapping':mapping,'scaleBasis':'80/median crown to actual dark human boot soles of six standing neutral calibrations, single isotropic factor for source','pixelsResampled':True,'ownershipMask':True,'selectedActions':record['actions'],'sourceViewed':True,'nativeContactViewed':reviewed,'socketReviewComplete':reviewed,'firstAndRecoveryGeometryReviewed':reviewed,'rawGrid':[[{k:v for k,v in c.items() if k!='part'} for c in row] for row in rawgrid]}
 clips=[];cal=[];manual=[];rendered=[];anatomy=[];neutral_axis=None
 for row,(action,cells) in enumerate(zip(labels,grid)):
  frames=[];active=[0,1,2,3,4] if action=='run' and record['direction'] in DROP_RUN else [2,3,4,5] if action=='meditate' and not small else list(range(len(cells)))
  for col,cell in enumerate(cells):
   root,measurement=tool.sole_anchor(im,cell);lift=0;canvas=(192,128) if action=='death' else (112,112);pivot=(96,112) if action=='death' else (56,104)
   if action=='run':lift=[0,2,0,2,0,0][col];root[1]+=lift/scale
   if action=='death' and col>=3:
    # Boot side is manually selected from each own source; contact measured on actual dark soles.
    root,measurement=tool.prone_boot_anchor(im,cell,DEATH_BOOT_SIDE[record['direction']])
   hand=chosen_hand(im,cell,action,col,record['direction'],record['id']);point=tool.point_native(hand['source'],root,scale,pivot)
   if neutral_axis is None:neutral_axis=hand['wristAxisDeg']
   delta=(hand['wristAxisDeg']-neutral_axis+180)%360-180
   rx,ry,rw,rh=hand['sourceOcclusionRect'];occpoint=tool.point_native([rx,ry],root,scale,pivot);occlusion=[round(occpoint[0])-1,round(occpoint[1])-1,max(3,round(rw*scale)+2),max(3,round(rh*scale)+2)]
   native=tool.native(im,cell,root,scale,canvas,pivot);assert not any(tool.edge_count(native).values()),('native clipping',record['id'],action,col,native.getbbox())
   kind='calibration' if action=='neutral' else 'frames' if col in active else 'history';folder=record['id'] if action=='neutral' else f"sword-b-{record['direction']}-{action}" if col in active else record['id']+'-'+action
   rel=f'{kind}/{folder}/{col+1:02}.png';file,hash=save(native,rel)
   maskfile,maskhash=save(cell['part'],f"masks/{record['id']}/{action}-{col+1:02}.png")
   grip={'source':hand['source'],'native':point,'angleDeg':round(delta,3),'sourceWrist':hand['sourceWrist'],'wristAxisSourceDeg':hand['wristAxisDeg'],'neutralWristAxisSourceDeg':neutral_axis,'angleBasis':'in-plane actual cuff-side to palm delta relative to same-source same-direction first neutral only; not facing angle or old North135','occlusionRect':occlusion,'sourceOcclusionRect':hand['sourceOcclusionRect'],'visibility':hand['visibility'],'attachmentPolicy':'detach-hover' if hand['visibility'] in ('seal','occluded','open-palm') else 'held-candidate','emptyHand':True,'selection':hand['proposal'],'manualConfirmed':hand['manualConfirmed'],'manualOverride':hand['manualOverride'],'cuffEvidence':hand['cuffEvidence'],'approved':False}
   frame={'index':len(frames) if col in active else col,'sourceIndex':col,'sourceRow':cell['row'],'sourceCol':cell['col'],'file':file,'sha256':hash,'canvas':list(canvas),'pivot':list(pivot),'durationMs':DURATIONS.get(action,[150]*6)[col],'source':record['raw'],'sourceId':record['id'],'sourceRect':cell['rect'],'sourceCoreBounds':cell['coreBounds'],'sourceScale':scale,'sourcePartMask':maskfile,'sourcePartMaskSha256':maskhash,'root':[float(v) for v in root],'rootMeasurement':measurement,'lift':lift,'bounds':list(native.getbbox()),'coreEdges':tool.edge_count(native),'opaqueVividFringePixels':tool.vivid_count(native),'grip':grip,'active':action=='neutral' or col in active,'headTorsoGeometry':{'silhouetteHeightSource':cell['coreBounds'][3]-cell['coreBounds'][1],'faceSkinIslandsSource':hand['skinCandidates'],'limit':'warm face/hand islands are numeric support only, marked source/native first and recovery review remains required'}}
   rendered.append((row,action,col,native,frame));manual.append({'sourceId':record['id'],'action':action,'index':col,**hand,'root':frame['root'],'rootMeasurement':measurement,'sourceRect':cell['rect']})
   if col in active:frames.append(frame)
   elif action!='neutral':frame['droppedSourcePoseReason']='Standing end pose is not a running key' if action=='run' else 'Standing/kneeling entry excluded from seated breathing loop'
  if action=='neutral':cal.append({'id':record['id']+'-neutral','identityId':'b','familyId':'sword','direction':record['direction'],'sourceId':record['id'],'source':record['raw'],'scale':scale,'frames':frames,'animationClip':False})
  else:
   id=f"sword-b-{record['direction']}-{action}";cw,ch=frames[0]['canvas'];atlas=Image.new('RGBA',(len(frames)*(cw+4),ch+4),(0,0,0,0));rects=[]
   for index,f in enumerate(frames):
    f['index']=index;rect=[index*(cw+4)+2,2,cw,ch];f['atlasRect']=rect;rects.append(rect);atlas.paste(Image.open(resolve(f['file'])).convert('RGBA'),(rect[0],rect[1]))
   atlasfile,atlasha=save(atlas,f'atlases/{id}.png')
   for f,rect in zip(frames,rects):assert atlas.crop((rect[0],rect[1],rect[0]+cw,rect[1]+ch)).tobytes()==Image.open(resolve(f['file'])).convert('RGBA').tobytes(),'atlas RGBA'
   clips.append({'id':id,'identityId':'b','familyId':'sword','direction':record['direction'],'action':action,'frames':frames,'canvas':frames[0]['canvas'],'pivot':frames[0]['pivot'],'frameCount':len(frames),'loop':action in ('idle','run','meditate'),'holdLast':action not in ('idle','run','meditate'),'durationMs':sum(f['durationMs'] for f in frames),'sourceId':record['id'],'source':record['raw'],'sourceScale':scale,'atlas':atlasfile,'atlasSha256':atlasha,'atlasSize':list(atlas.size),'gutter':2,'rects':rects,'timingScope':'ART preview only; new ST480/AOE800 release ages mapped to fourth key, V1 timings preserved','ownerApproved':False,'motionApproved':False,'runtimeReady':False,'socketReviewComplete':reviewed,'socketReviewState':'manually-reviewed-source-candidate' if reviewed else 'candidate-pending-marked-manual-review','droppedSourcePoseIndices':[i for i in range(len(cells)) if i not in active]})
  first=cells[0]['coreBounds'];last=cells[-1]['coreBounds'];anatomy.append({'action':action,'firstHeight':first[3]-first[1],'lastHeight':last[3]-last[1],'standingNeutralHeightMedian':statistics.median(heights),'lastHeightDeltaPct':round(((last[3]-last[1])/statistics.median(heights)-1)*100,2),'selectedSourceIndices':active,'standingRecoveryExpected':action in ('hit','gather','cast-single-target','cast-aoe'),'manualReviewRequired':True})
 contact=Image.new('RGBA',(6*200,len(labels)*156+24),(28,38,48,255));draw=ImageDraw.Draw(contact)
 for row,action,col,im,frame in rendered:
  x=col*200+4;y=row*156+20;contact.alpha_composite(im,(x,y));draw.text((x,row*156+3),action[:11]+f' {col+1}'+(' hist' if not frame['active'] else ''),fill=(190,190,178,255))
  gx,gy=frame['grip']['native'];color=(248,160,88,255) if frame['grip']['visibility'] in ('occluded','seal') else (96,198,238,255) if frame['grip']['visibility']=='open-palm' else (98,236,157,255);draw.ellipse((x+gx-2,y+gy-2,x+gx+2,y+gy+2),outline=color)
  px,py=frame['pivot'];draw.line((x+px-3,y+py,x+px+3,y+py),fill=(245,222,138,255));draw.line((x+px,y+py-3,x+px,y+py+3),fill=(245,222,138,255))
 contactfile,_=save(contact,f'review/{record["id"]}-marked-1x.png');save(contact.resize((contact.width*2,contact.height*2),Image.Resampling.NEAREST),f'review/{record["id"]}-marked-2x.png')
 notes=['Own silver identity, ivory/jade costume and fixed camera inspected in all raw/native rows; head/torso first and recovery compared with same-source calibrations.','All hand insets viewed. Explicit manual island overrides remove face/ear picks; hidden endpoints are estimates with detached policy, never visible grip approval.','Seated meditation keeps only seated keys; run terminal standing keys stay in history where present.']
 if mapping:notes.append(record['sourceLayoutDelta'])
 return source,clips,cal,manual,{'sourceId':record['id'],'sourceViewed':True,'sourceGeometry':anatomy,'nativeMarkedContact':contactfile,'nativeContactViewed':reviewed,'trueDirectionReviewed':reviewed,'socketConfirmed':reviewed,'socketReviewComplete':reviewed,'bodyOnly':True,'notes':notes,'ownerApproved':False}

def reuse_v1():
 v1base=REPO/'docs/design/characters/wang-lin-equipment-production-v1';reg=json.loads((v1base/'motion-registration.json').read_text(encoding='utf-8'));base='../wang-lin-equipment-production-v1/'
 def paths(value,key=''):
  if isinstance(value,list):return [paths(v) for v in value]
  if isinstance(value,dict):return {k:paths(v,k) for k,v in value.items()}
  if isinstance(value,str) and key in ('file','source','atlas','raw') and value.endswith('.png'):return base+value
  return value
 clips=[]
 for old in reg['clips']:
  if old['identityId']!='b':continue
  c=paths(copy.deepcopy(old));c.update({'reusedFrom':base+'motion-registration.json#'+c['id'],'preservedV1Bytes':True,'ownerApproved':True,'motionApproved':True,'runtimeReady':False})
  for f in c['frames']:assert tool.sha(resolve(f['file']))==f['sha256'],'approved V1 body changed';f['reusedFrom']=f['file']
  assert tool.sha(resolve(c['atlas']))==c['atlasSha256'],'approved V1 atlas changed';clips.append(c)
 sources=[paths(s) for s in reg['sources'] if s['id'].startswith('sword-b-')];cal=[paths(c) for c in reg['calibrations'] if c['identityId']=='b']
 for s in sources:s.update({'reusedFrom':s['file'],'sourceSha256':s['sha256'],'socketReviewComplete':True,'reviewInheritedFrom':base+'motion/assessment.json'})
 return sources,clips,cal

def main():
 assert not (ROOT/'approval.json').exists() and not (PACKAGE/'approval.json').exists(),'approved package locked'
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));sources,clips,cal=reuse_v1();manual=[];assessment=[]
 for record in gen['records']:
  if not record.get('selected') or record['status']!='generated':continue
  s,c,k,m,a=pack_source(record);sources.append(s);clips.extend(c);cal.extend(k);manual.extend(m);assessment.append(a);print(json.dumps({'packed':s['id'],'clips':len(c),'poses':sum(len(v['frames']) for v in c),'neutral':6}))
 ids=[c['id'] for c in clips];assert len(ids)==len(set(ids)),'duplicate clip IDs'
 reviewed=bool((CHOICES or {}).get('manualReviewComplete'))
 result={'schema':'equipment-body-motion-registration-v2','identityId':'b','familyId':'sword','canvas':[112,112],'pivot':[56,104],'bodyHeight':80,'sources':sources,'calibrations':cal,'clips':clips,'coverage':{'clips':len(clips),'newClips':len(clips)-8,'reusedClips':8,'motionPoses':sum(len(c['frames']) for c in clips),'newMotionPoses':sum(len(c['frames']) for c in clips if not c.get('reusedFrom')),'neutralCalibrations':sum(len(c['frames']) for c in cal),'newSources':len(sources)-4,'selectedNewSources':sum(r.get('selected',False) for r in gen['records']),'directionCount':len(set(c['direction'] for c in clips)),'actions':sorted(set(c['action'] for c in clips))},'ownerApproved':False,'motionApproved':False,'runtimeIntegrated':False,'manualReviewPending':not reviewed,'socketReviewComplete':reviewed}
 write(ROOT/'registration.json',result);write(ROOT/'manual-sockets.json',{'method':'actual per-pose source hand crops and native contacts reviewed; manual skin-island choices, explicit forearm endpoint estimates for hidden palms, opaque cuff-side pixel direction candidate; not automatic agreement from warm skin','items':manual,'manualReviewPending':not reviewed,'socketReviewComplete':reviewed});write(ROOT/'assessment.json',{'items':assessment,'manualReviewPending':not reviewed,'socketReviewComplete':reviewed,'limitations':['Owned B body-only. New production candidate, no runtime.','Death padding192×128/(96,112) changes canvas only, same calibrated source/body world scale.','Standing run terminal keys omitted where source returns to neutral; source remains history.','Seated meditation starts at third key when original source includes entry; no standing jump in loop.','Numeric face/hand geometry does not establish morphology approval.']});print(json.dumps(result['coverage']))
if __name__=='__main__':main()
