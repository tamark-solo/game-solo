"""Manual source points selected after viewing all 48 raw poses; support-only."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,math
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
snapshot=json.loads((ROOT/'snapshot.json').read_text(encoding='utf8'))
# Each candidate index was selected visually on the corresponding actual raw pose.
# Lists are location aids, never an automatic skin/hand classifier approval.
selection={
 'north-idle':[1,1,1,1,1,1],
 'north-run':[1,1,1,1,1,1],
 'north-cast-single-target':[1,4,1,1,3,1],
 'north-cast-aoe':[1,4,0,2,1,1],
 'northeast-idle':[2,2,2,2,2,2],
 'northeast-run':[2,3,2,2,3,3],
 'northeast-cast-single-target':[3,1,2,2,2,4],
 'northeast-cast-aoe':[2,5,1,0,0,2]}
cuffDeltas={
 'north-cast-single-target':[[-1,5],[3,4],[-1,5],[-5,3],[-5,0],[-1,5]],
 'north-cast-aoe':[[-1,5],[3,4],[0,6],[-5,3],[-5,3],[-1,5]],
 'northeast-cast-single-target':[[-2,5],[2,5],[-1,5],[-5,3],[-5,3],[-2,5]],
 'northeast-cast-aoe':[[-2,5],[2,5],[0,6],[-5,3],[-5,3],[-2,5]]}
# Source X estimates read from the TWO boot/ankle footprints in each raw running key.
# This avoids toggling root X between whichever boot happens to be lowest.
runReferences={
 'north-run':[[126,165],[327,345],[509,531],[704,723],[878,906],[1067,1103]],
 'northeast-run':[[80,141],[309,362],[507,548],[696,761],[867,991],[1098,1159]]}
measurements=[];checks=[]
def check(name,value):checks.append({'id':name,'passed':bool(value)});assert value,name
for f in snapshot['frames']:
    key=f['key'];short=f['clipId'].replace('banner-a-','');selected=f['candidates'][selection[short][key-1]];n=selected['native'];oldOcclusion=selected['rect']
    root=f['proposedRoot'];factor=f['sourceScale'];pivot=f['pivot'];source=PACK/f['source'];im=Image.open(source).convert('RGBA')
    check(f['clipId']+':'+str(key)+': source immutable',sha(source)==f['sourceSha256'])
    check(f['clipId']+':'+str(key)+': native immutable',sha(PACK/f['file'])==f['frameSha256'])
    palm=[root[0]+(n[0]-pivot[0])/factor,root[1]+(n[1]-pivot[1])/factor]
    # Resolve a nearest actually opaque pixel within the visually selected palm region.
    candidates=[]
    for y in range(round(palm[1])-3,round(palm[1])+4):
      for x in range(round(palm[0])-3,round(palm[0])+4):
        rgba=im.getpixel((x,y))
        if rgba[3]>=128:candidates.append(((x-palm[0])**2+(y-palm[1])**2,[x,y],list(rgba)))
    check(f['clipId']+':'+str(key)+': observed palm physical',bool(candidates))
    _,palm,palmRGBA=min(candidates)
    delta=cuffDeltas.get(short,[[(-2 if f['direction']=='northeast' else -1),5]]*6)[key-1]
    cuffNative=[n[0]+delta[0],n[1]+delta[1]]
    cuff=[round(root[0]+(cuffNative[0]-pivot[0])/factor),round(root[1]+(cuffNative[1]-pivot[1])/factor)]
    cuffRGBA=list(im.getpixel(tuple(cuff)));cuffEstimate=cuffRGBA[3]<128
    # Cuffs are observed wrist-sleeve locations with ±2 native px; if the point is
    # outside the alpha edge preserve it honestly as an estimate, never move the art.
    casting=f['action'].startswith('cast-');held=not casting or key==1
    openGesture=casting and key in (4,5)
    visibility='visible-closed-fist' if held else ('open-palm' if openGesture else 'seal')
    policy='held-empty-pole-grip' if held else 'planted-pole-command-no-held-claim'
    notes='Actual same raised closed fist, wrist bracer visible; costume/light patches below waist are not hands.' if held else 'Pole is planted from key2; chosen visible seal/command hand supplies gesture emitter only, never a shaft grip.'
    if short=='north-cast-single-target' and key==3:
        notes+=' Opposite seal palm hidden by long back hair; visible closed fist is a free ritual gesture, not proof of two joined palms.'
    if short=='north-cast-aoe' and key==3:
        notes+=' Actual overhead raised fist selected; shoulder-side fist is not chosen as the commanding arm.'
    if casting and key==6:
        notes+=' Source recovers with a visible closed fist although prompt asked free hands; equipment remains planted through recovery.'
    recommended=list(root);bootRefs=[]
    if f['action']=='run':
        xs=runReferences[short][key-1];recommended[0]=sum(xs)/2
        bootRefs=[{'sourceXEstimate':x,'projectionPlaneY':root[1],'uncertaintySourcePx':6,
           'role':'Observed separate boot/ankle footprint projected onto source ground plane; higher/lifted boot X is also included.'} for x in xs]
        rootNote='Manual two-boot footprint projection, includes higher boot X; avoids alternating lowest-toe-only horizontal recenter. PlaneY still actual lowest dark boot support. Not a pelvis bone measurement.'
    else:
        rootNote='Current support-plane X is inside the observed two-boot stance envelope; current floorY is one source pixel below actual dark soles. Keep as foot-support projection, not exact pelvis bone.'
    uncertainty=2.5 if f['action']=='run' else 2
    # Evidence crop shows original RGBA and points only on a separate QA page.
    l,t,w,h=f['sourceRect'];crop=im.crop((l,t,l+w,t+h));bg=Image.new('RGBA',crop.size,(235,237,230,255));bg.alpha_composite(crop)
    page=bg.convert('RGB').resize((w*3,h*3),Image.Resampling.NEAREST);draw=ImageDraw.Draw(page)
    def mark(point,color,label):
        x=(point[0]-l)*3;y=(point[1]-t)*3
        draw.line((x-8,y,x+8,y),fill=color,width=2);draw.line((x,y-8,x,y+8),fill=color,width=2)
        draw.text((x+9,y-10),label,fill=color)
    mark(palm,(0,130,180),'palm');mark(cuff,(180,70,0),'cuff');mark(recommended,(20,120,35),'ground projection')
    path=ROOT/'review/poses'/(f['clipId']+'-'+str(key).zfill(2)+'.png');path.parent.mkdir(parents=True,exist_ok=True);page.save(path)
    m={'clipId':f['clipId'],'key':key,'sourceId':f['sourceId'],'source':f['source'],'sourceSha256':f['sourceSha256'],
       'frameFile':f['file'],'frameSha256':f['frameSha256'],'sourceRect':f['sourceRect'],'sourceScale':factor,
       'sourcePalm':palm,'sourcePalmRGBA':palmRGBA,'palmUncertaintyNativePx':1.5,
       'sourceOcclusionRect':[root[0]+(oldOcclusion[0]-pivot[0])/factor,root[1]+(oldOcclusion[1]-pivot[1])/factor,oldOcclusion[2]/factor,oldOcclusion[3]/factor],
       'occlusionRectInPreviousNative':oldOcclusion,'occlusionAppliesToHeldPole':held,
       'sourceCuff':cuff,'sourceCuffRGBA':cuffRGBA,'cuffEstimate':cuffEstimate,'cuffUncertaintyNativePx':2,
       'visibility':visibility,'attachmentPolicy':policy,'heldGripClaim':held,'semanticNotes':notes,
       'sourceRoot':recommended,'previousProposedRoot':root,'observedBodyContactY':root[1],
       'sourceRootMeasurement':{'method':rootNote,'uncertaintyNativePx':uncertainty,'sourceBootFootprintReferences':bootRefs,
           'sourceSupportPlaneY':root[1],'sourceRootReviewed':True,'exactBoneClaim':False,'liftBakedOnce':True},
       'nativePalmUsingPreviousRoot':n,'rootDeltaNativePx':[(recommended[i]-root[i])*factor for i in range(2)],
       'evidence':path.relative_to(ROOT).as_posix(),'evidenceSha256':sha(path),'manualSourceViewed':True,
       'ownerApproved':False,'runtimeIntegrated':False}
    measurements.append(m)
report={'schema':'banner-a-core-manual-support-1','frames':measurements,'coverage':{'frames':48,'directions':['north','northeast'],
    'sourcePalmMeasurements':48,'sourceCuffLocations':48,'sourceRootReviews':48},'checks':len(checks),'passed':True,
    'limits':['Manual source estimates support actor A registration; no ART or runtime approval.',
       'Source/canonical images never repainted. Source scale unchanged; native grip must be recomputed after root correction.',
       'Closed gestures after charge are free-hand ritual poses with planted prop, not held-shaft claims.',
       'Source root is support-plane projection with uncertainty, not exact bone. Body lift remains baked once.'],
    'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'manual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'frames':len(measurements),'checks':len(checks),'cuffEstimates':sum(m['cuffEstimate'] for m in measurements),'rootCorrections':sum(any(abs(d)>0.1 for d in m['rootDeltaNativePx']) for m in measurements)}))
