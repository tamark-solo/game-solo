from pathlib import Path
from PIL import Image,ImageDraw
import json,copy,math,importlib.util
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[2]
spec=importlib.util.spec_from_file_location('own_banner_geometry',ROOT/'body-tools.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def optional(name):return read(ROOT/name) if (ROOT/name).exists() else {}
def rel(p):return str(p.relative_to(V2)).replace('\\','/')
def main():
 gen=read(ROOT/'generation.json')
 if not gen['generationAllowed']:raise RuntimeError('Root Sword128 gate remains closed; prepare tooling only, do not publish canonical body.')
 if (ROOT/'approval.json').exists():raise RuntimeError('Approved Banner body write-locked')
 checkpoint=read(V2/'checkpoints/sword.json')
 assert checkpoint['coverage']['bodyClips']==128 and len(checkpoint['files'])==4244,'Sword checkpoint gate is incomplete'
 for pin in checkpoint['files']:
  assert g.sha(V2/pin['file'])==pin['sha256'],('Frozen Sword checkpoint changed',pin['file'])
 geometry=read(ROOT/'source-geometry.json');recipe=read(ROOT/'pack-recipe.json');manual=optional('manual.json');roots=optional('root-overrides.json');review=optional('review-state.json');clips=[];sources=[];calibrations=[]
 for src in geometry['sources']:
  if not src['selected']:continue
  assert src['sourceViewed'],'Do not select an unviewed source'
  assert not any(src['sourceEdges'].values()),'Never hide source edge clipping by canonical crop'
  s=copy.deepcopy(src);sources.append(s);im=Image.open(V2/s['file']).convert('RGBA');scale=s['scale'];calframes=[]
  for i,p in enumerate(s['calibrations']):
   n=g.native(im,p,p['root'],scale);nf=ROOT/'calibration'/s['id']/(str(i+1).zfill(2)+'.png');nf.parent.mkdir(parents=True,exist_ok=True);n.save(nf);calframes.append({'file':rel(nf),'sha256':g.sha(nf),'sourceId':s['id'],'sourceRect':p['rect'],'sourceBodyCell':[p['row'],p['col']],'sourceComponentMaskUsed':bool(p.get('componentRuns')),'root':p['root'],'sourceScale':scale,'canvas':[112,112],'pivot':[56,104],'sourceRootReviewed':p['rootReviewed']})
  calibrations.append({'sourceId':s['id'],'frames':calframes});s['manualReviewPending']=not s['calibrationRootsReviewed'] or not review.get(s['id'],{}).get('sourceCompletenessReviewed',False)
  for action,rawposes in s['actionCells'].items():
   if action not in s['selectedActions']:continue
   id='banner-a-'+s['direction']+'-'+action;selection=review.get(id,{});indices=selection.get('actionIndices',list(range(len(rawposes))));poses=[copy.deepcopy(rawposes[i]) for i in indices]
   if selection.get('appendStandingRecovery'):poses.append(copy.deepcopy(s['calibrations'][0])|{'reuseReason':'Standing recovery from actual same-source neutral; six real action keys retained.'})
   canvas=recipe['deathCanvas'] if action=='death' else recipe['normalCanvas'];pivot=recipe['deathPivot'] if action=='death' else recipe['normalPivot'];base=recipe['timingMs'][action];holds=selection.get('durationsMs',base[:len(poses)])
   if len(poses)>len(holds):holds=holds+[160]*(len(poses)-len(holds))
   assert len(holds)==len(poses) and all(h>0 for h in holds)
   frames=[];stride=canvas[0]+4
   for i,p in enumerate(poses):
    key=id+':'+str(i+1);rm=roots.get(key,{});root=rm.get('root',rm.get('sourceRoot',p['root']));lift=rm.get('lift',0);n=g.native(im,p,root,scale,canvas,pivot);nf=ROOT/'frames'/id/(str(i+1).zfill(2)+'.png');nf.parent.mkdir(parents=True,exist_ok=True);n.save(nf)
    m=manual.get(key);rootPending=not rm.get('sourceRootReviewed',False);f={'index':i,'file':rel(nf),'sha256':g.sha(nf),'source':s['file'],'sourceId':s['id'],'sourceRect':p['rect'],'sourceCoreBounds':p['core'],'sourceScale':scale,'canvas':canvas,'pivot':pivot,'root':root,'rootMeasurement':rm|{'sourceRoot':root,'manualReviewPending':rootPending},'lift':lift,'durationMs':holds[i],'bounds':list(n.getbbox()),'coreEdges':g.edges(n),'active':True,'sourceRootReviewed':not rootPending,'manualReviewPending':rootPending or not bool(m and m.get('sourcePalmReviewed',False))}
    f['sourceBodyCell']=[p['row'],p['col']];f['sourceComponentMaskUsed']=bool(p.get('componentRuns'))
    if 'reuseReason' in p:f['reuseReason']=p['reuseReason'];f['phase']='standing-recovery'
    if m:
     assert 'sourceManual' in m,'Manual palm uses actual source coords, not static frame transform or color classifier'
     native=[round(pivot[k]+(m['sourceManual'][k]-root[k])*scale,4) for k in range(2)];f['grip']=m|{'source':m['sourceManual'],'native':native,'emptyHand':True,'occlusionRect':[max(0,math.floor(native[0])-2),max(0,math.floor(native[1])-2),5,5],'approved':False}
    else:f['grip']={'source':[root[0],root[1]-24/scale],'native':[pivot[0],pivot[1]-24],'angleDeg':0,'visibility':'manual-review-pending','attachmentPolicy':'hidden-manual-review-pending','occlusionRect':[pivot[0]-2,pivot[1]-26,5,5],'approved':False,'selection':'explicit-placeholder-never-actual-palm'}
    frames.append(f)
   atlas=Image.new('RGBA',(len(frames)*stride,canvas[1]+4));rects=[]
   for i,f in enumerate(frames):
    rect=[2+i*stride,2,canvas[0],canvas[1]];f['atlasRect']=rect;rects.append(rect);atlas.paste(Image.open(V2/f['file']).convert('RGBA'),(rect[0],rect[1]))
   af=ROOT/'atlases'/(id+'.png');af.parent.mkdir(parents=True,exist_ok=True);atlas.save(af)
   clips.append({'id':id,'familyId':'banner','identityId':'a','direction':s['direction'],'action':action,'sourceId':s['id'],'sourceScale':scale,'frames':frames,'durationMs':sum(f['durationMs'] for f in frames),'canvas':canvas,'pivot':pivot,'atlas':rel(af),'atlasSha256':g.sha(af),'atlasSize':list(atlas.size),'rects':rects,'gutter':2,'loop':action in ('idle','run','meditate'),'holdLast':action not in ('idle','run','meditate'),'releaseTimeMs':recipe['releaseMs'].get(action),'manualReviewPending':any(f['manualReviewPending'] for f in frames),'ownerApproved':False,'motionApproved':False,'runtimeReady':False})
 ids=[c['id'] for c in clips];assert len(ids)==len(set(ids)),'Multiple active source groups for one action: explicitly supersede before pack'
 clips.sort(key=lambda c:c['id']);pending=any(c['manualReviewPending'] for c in clips) or any(s['manualReviewPending'] for s in sources)
 g.write(ROOT/'registration.json',{'schema':'huyen-tam-banner-body-registration-v2','date':'2026-10-14','familyId':'banner','identityId':'a','identityName':'Huyễn Tâm','sources':sources,'calibrations':calibrations,'clips':clips,'coverage':{'requiredClips':64,'registeredClips':len(clips),'bodyPoses':sum(len(c['frames']) for c in clips),'neutralCalibrationPoses':sum(len(c['frames']) for c in calibrations)},'manualReviewPending':pending,'socketReviewComplete':not pending,'ownerApproved':False,'motionApproved':False,'runtimeReady':False});print(json.dumps({'clips':len(clips),'poses':sum(len(c['frames']) for c in clips),'manualPending':pending}))
if __name__=='__main__':main()
