"""Chariot B pack: actual source + manually confirmed source roots/palms only.

manual-registration.json.sources[id] records actual layout/mapping, six calibrated
neutral entries, and per-action entries. No source/root/socket fallback is allowed.
This script is prepared before Sword128; it does not generate image artwork.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import json,statistics,math,sys,importlib.util
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2];PREFIX='actors/b/chariot/'
spec=importlib.util.spec_from_file_location('chariot_b_body_tools',ROOT/'body-tools.py')
tool=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool)
TIMING=json.loads((ROOT/'pack-recipe.json').read_text(encoding='utf-8'))['timingMs']
def write(p,data):
 p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_name(p.name+'.next');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(p)
def save(im,relative):
 p=ROOT/relative;p.parent.mkdir(parents=True,exist_ok=True);im.save(p);return PREFIX+relative,tool.sha(p)
def source_hand(entry,root,scale,pivot,neutral_axis):
 hand=entry['grip'];assert hand['sourcePalmReviewed'] and hand['sourceCuffReviewed'],'Manual source palm/cuff review required'
 p=hand['source'];w=hand['sourceWrist'];axis=math.degrees(math.atan2(p[1]-w[1],p[0]-w[0]));delta=(axis-neutral_axis+180)%360-180
 native=tool.point_native(p,root,scale,pivot);rect=hand['sourceOcclusionRect'];left=tool.point_native(rect[:2],root,scale,pivot)
 source_visibility=hand['visibility'];visibility={'visible-closed-fist':'closed-grip'}.get(source_visibility,source_visibility);held=visibility in ('visible','visible-palm','closed-grip') and hand.get('closedGripConfirmed',False)
 source_policy=hand.get('attachmentPolicy');policy='commanded-device' # Physical Cart remains at world ground; body hand only commands it.
 assert policy!='held-candidate' or held,'Visible closed fingers required for held shaft agreement; seal/open/hidden remain explicit detached candidate'
 angle_basis='Explicitly estimated occluded cuff/palm vector relative to own neutral; no held claim, uncertainty retained.' if hand.get('sourceWristEstimated') or hand.get('sourceCuffEstimate') or visibility=='occluded' else 'Manually reviewed actual source cuff-to-palm vector relative to same-source/same-view own neutral; no facing/N135.'
 return {**hand,'sourceVisibility':source_visibility,'sourceAttachmentPolicy':source_policy,'visibility':visibility,'native':native,'angleDeg':round(delta,4),'wristAxisSourceDeg':round(axis,4),'neutralWristAxisSourceDeg':round(neutral_axis,4),'angleBasis':angle_basis,'occlusionRect':[round(left[0])-1,round(left[1])-1,max(3,round(rect[2]*scale)+2),max(3,round(rect[3]*scale)+2)],'attachmentPolicy':policy,'emptyHand':True,'gripHeld':False,'manualConfirmed':True,'approved':False}
def pack_source(record,manual):
 sid=record['id'];assert manual['sourceSha256']==record['sha256']==tool.sha(V2/record['raw']),'Raw source hash'
 assert manual['sourceViewed'] and manual['directionReviewed'] and manual['headTorsoFirstRecoveryReviewed'],'Actual source/view/head-torso review required'
 assert tool.sha(V2/record['prompt'])==record['promptSha256'],'Prompt hash'
 for p in record['inputs']:assert tool.sha(V2/p['file'])==p['sha256'],'Input snapshot hash'
 im=Image.open(V2/record['raw']).convert('RGBA');cols,rows=manual['actualGrid'];grid=tool.cells_for(im,manual.get('rowColumns',cols),rows);flat=[p for row in grid for p in row]
 assert not any(tool.edge_count(im).values()),'Actual source-edge clipping'
 calibrations=manual['calibrations'];assert len(calibrations)==6,'Six real same-source neutral calibrations'
 heights=[e['sourceBootSoleY']-e['sourceCrownY'] for e in calibrations]
 assert all(h>0 for h in heights),'Actual crown-to-dark-boot measurements'
 scale=80/statistics.median(heights)
 neutral_hand=calibrations[0]['grip'];p,w=neutral_hand['source'],neutral_hand['sourceWrist'];neutral_axis=math.degrees(math.atan2(p[1]-w[1],p[0]-w[0]))
 rendered=[];clips=[];calframes=[];used=set()
 for action,entries in [('neutral',calibrations)]+[(a,manual['actions'][a]) for a in record['actions']]:
  frames=[];action_raw_indices=set()
  for index,e in enumerate(entries):
   rawindex=e['rawIndex'];cell=flat[rawindex]
   assert rawindex not in action_raw_indices or e.get('reuseReason'),'Repeated actual source key needs explicit reuse reason'
   if action!='neutral' and rawindex in {p['rawIndex'] for p in calibrations}:
    assert e.get('reuseReason'),'Neutral-source recovery reuse must be explicit; no synthetic action rows'
   action_raw_indices.add(rawindex);used.add(rawindex)
   assert e['sourceRootReviewed'] and e['sourceRootMeasurement']['semantic'],'Source semantic root review required'
   root=e['sourceRoot'];lift=e.get('lift',0);assert all(math.isfinite(v) for v in root) and math.isfinite(lift),'Finite root/lift'
   assert not e.get('rendererAppliesLift',False),'Lift must already be represented by registered native root'
   canvas=tuple(e.get('canvas',[192,128] if action=='death' else [112,112]));pivot=tuple(e.get('pivot',[96,112] if action=='death' else [56,104]))
   body=tool.native(im,cell,root,scale,canvas,pivot);assert not any(tool.edge_count(body).values()),(sid,action,index,'native clipped: enlarge padding, never fit pose')
   folder=sid if action=='neutral' else f'chariot-b-{record["direction"]}-{action}'
   file,sha=save(body,f'{"calibration" if action=="neutral" else "frames"}/{folder}/{index+1:02}.png')
   mask,msha=save(cell['part'],f'masks/{sid}/{rawindex+1:02}.png')
   duration=e.get('durationMs',0 if action=='neutral' else TIMING[action][index] if len(entries)==6 else 300)
   frame={'index':index,'sourceIndex':rawindex,'sourceRow':cell['row'],'sourceCol':cell['col'],'file':file,'sha256':sha,'canvas':list(canvas),'pivot':list(pivot),'durationMs':duration,'source':record['raw'],'sourceId':sid,'sourceRect':cell['rect'],'sourceCoreBounds':cell['coreBounds'],'sourceScale':scale,'sourcePartMask':mask,'sourcePartMaskSha256':msha,'root':root,'rootMeasurement':{**e['sourceRootMeasurement'],'manualReviewed':e['sourceRootReviewed']},'lift':lift,'bounds':list(body.getbbox()),'coreEdges':tool.edge_count(body),'grip':source_hand(e,root,scale,pivot,neutral_axis),'active':True,'manualReviewPending':False}
   if e.get('reuseReason'):frame['reuseReason']=e['reuseReason']
   frames.append(frame);rendered.append((action,index,body,frame))
  if action=='neutral':calframes=frames;continue
  if action.startswith('cast-'):
   release=700 if action=='cast-single-target' else 850;end=1480 if action=='cast-single-target' else 2260
   assert len(frames)>=6 and sum(f['durationMs'] for f in frames[:3])==release and sum(f['durationMs'] for f in frames)==end,'Core release key4/end phase mapping'
  cw,ch=frames[0]['canvas'];assert all(f['canvas']==[cw,ch] and f['pivot']==frames[0]['pivot'] for f in frames),'Shared clip canvas/pivot'
  atlas=Image.new('RGBA',(len(frames)*(cw+4),ch+4),(0,0,0,0));rects=[]
  for i,f in enumerate(frames):
   rect=[i*(cw+4)+2,2,cw,ch];f['atlasRect']=rect;rects.append(rect);atlas.paste(Image.open(V2/f['file']).convert('RGBA'),rect[:2])
   assert atlas.crop((rect[0],rect[1],rect[0]+cw,rect[1]+ch)).tobytes()==Image.open(V2/f['file']).convert('RGBA').tobytes(),'Actual atlas/canonical RGBA parity'
  cid=f'chariot-b-{record["direction"]}-{action}';afile,asha=save(atlas,f'atlases/{cid}.png')
  clips.append({'id':cid,'familyId':'chariot','identityId':'b','direction':record['direction'],'action':action,'frames':frames,'canvas':[cw,ch],'pivot':frames[0]['pivot'],'frameCount':len(frames),'durationMs':sum(f['durationMs'] for f in frames),'loop':action in ('idle','run','meditate'),'holdLast':action not in ('idle','run','meditate'),'sourceId':sid,'source':record['raw'],'sourceScale':scale,'atlas':afile,'atlasSha256':asha,'atlasSize':list(atlas.size),'gutter':2,'rects':rects,'socketReviewComplete':True,'ownerApproved':False,'motionApproved':False,'runtimeReady':False,'timingScope':'ART fixture only; Chariot ST700/AOE850 starts release at fourth body key; separate world-ground device with empty hands free to command, Core facts alone create contacts.'})
 source={'id':sid,'identityId':'b','familyId':'chariot','direction':record['direction'],'file':record['raw'],'raw':record['raw'],'source':record['raw'],'sha256':record['sha256'],'sourceSha256':record['sha256'],'sourceSize':list(im.size),'scale':scale,'sourceScale':scale,'neutralHeights':heights,'scaleBasis':'80/median actual source crown-to-dark-boot soles of six neutral measurements; one isotropic scale, no pose fit','calibrationCount':6,'sourcePoseCount':len(flat),'actualGrid':[cols,rows],'rowColumns':manual.get('rowColumns',[cols]*rows),'actualPoseMapping':{'neutral':[e['rawIndex'] for e in calibrations],**{a:[e['rawIndex'] for e in manual['actions'][a]] for a in record['actions']}},'unusedRawSourceIndices':[i for i in range(len(flat)) if i not in used],'sourceViewed':True,'socketReviewComplete':True,'headTorsoFirstRecoveryReviewed':True,'sourceEdges':tool.edge_count(im),'nativeContactViewed':False,'ownerApproved':False}
 labels=['neutral']+record['actions'];contact_columns=max(6,max(index+1 for action,index,body,f in rendered));contact_cell_width=max(220,max(body.width+8 for action,index,body,f in rendered));contact_row_height=max(160,max(body.height+24 for action,index,body,f in rendered));contact=Image.new('RGBA',(contact_columns*contact_cell_width,len(labels)*contact_row_height+20),(28,38,48,255));draw=ImageDraw.Draw(contact)
 for action,index,body,f in rendered:
  row=labels.index(action);x=index*contact_cell_width+4;y=row*contact_row_height+20
  assert x+body.width<=contact.width and y+body.height<=contact.height,'Every actual key must fit evidence canvas; expand padding, never skip keys'
  contact.alpha_composite(body,(x,y));draw.text((x,row*contact_row_height+3),action+' '+str(index+1),fill=(190,200,215));gx,gy=f['grip']['native'];draw.ellipse((x+gx-2,y+gy-2,x+gx+2,y+gy+2),outline=(80,230,160));px,py=f['pivot'];draw.line((x+px-3,y+py,x+px+3,y+py),fill=(245,210,80))
 source['nativeContactViewed']=manual.get('nativeContactViewed',False)
 source['nativeContact'],_=save(contact,f'review/{sid}-marked-1x.png');save(contact.resize((contact.width*2,contact.height*2),Image.Resampling.NEAREST),f'review/{sid}-marked-2x.png')
 cal={'id':sid+'-neutral','identityId':'b','familyId':'chariot','direction':record['direction'],'sourceId':sid,'frames':calframes,'animationClip':False}
 return source,clips,cal
def main():
 gen=json.loads((ROOT/'generation.json').read_text(encoding='utf-8'));assert gen['generationAllowed'],'Sword128 gate not released'
 assert not (ROOT/'approval.json').exists() and not (V2/'approval.json').exists(),'Approved package is write-locked'
 assert not (V2/'checkpoints/chariot.json').exists(),'Chariot technical checkpoint locks body/source/metadata; use a new revision package'
 manual_metadata=json.loads((ROOT/'manual-registration.json').read_text(encoding='utf-8'));manual=manual_metadata['sources'];sources=[];clips=[];cal=[];pending_sources=[]
 for r in gen['records']:
  if r.get('selected') and r['status']=='generated':
   if r['id'] not in manual:
    pending_sources.append(r['id']);continue # Explicit missing-body coverage; no placeholder pixels or hand/root fallback.
   s,c,k=pack_source(r,manual[r['id']]);sources.append(s);clips.extend(c);cal.append(k)
 ids=[c['id'] for c in clips];assert len(ids)==len(set(ids)),'Duplicate actual clip IDs'
 expected={(d,a) for d in ['north','northeast','east','southeast','south','southwest','west','northwest'] for a in ['idle','run','hit','death','meditate','gather','cast-single-target','cast-aoe']};actual={(c['direction'],c['action']) for c in clips}
 native_pending=manual_metadata.get('manualReviewPending',True)
 result={'schema':'equipment-body-motion-registration-v2','identityId':'b','familyId':'chariot','bodyHeight':80,'sources':sources,'calibrations':cal,'clips':clips,'coverage':{'clips':len(clips),'newClips':len(clips),'reusedClips':0,'motionPoses':sum(len(c['frames']) for c in clips),'newMotionPoses':sum(len(c['frames']) for c in clips),'neutralCalibrations':len(cal)*6,'newSources':len(sources),'selectedNewSources':len(sources),'directionCount':len(set(c['direction'] for c in clips)),'directions':sorted(set(c['direction'] for c in clips))},'pendingMatrix':[{'direction':d,'action':a} for d,a in sorted(expected-actual)],'pendingSourceRegistrations':pending_sources,'socketReviewComplete':all(s['socketReviewComplete'] for s in sources) and bool(sources) and not pending_sources and not native_pending,'manualReviewPending':native_pending,'nativeContactReviewPending':native_pending,'ownerApproved':False,'motionApproved':False,'runtimeIntegrated':False}
 write(ROOT/'registration.json',result);print(json.dumps(result['coverage']))
if __name__=='__main__':main()
