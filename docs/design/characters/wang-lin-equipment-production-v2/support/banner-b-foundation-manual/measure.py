"""Manual W/NW source registrations; selected real hands and support surfaces."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,math
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
snapshot=json.loads((ROOT/'snapshot.json').read_text(encoding='utf8'))
handIndices={
 'banner-b-west-damage-r1':[2]*13+[1,1,1,1,0],
 'banner-b-west-practice-r1':[2,2,2,2,2,2,1,1,1,1,1,1,1,2,1,1,2,2],
 'banner-b-northwest-damage-r1':[0,1,1,0,1,1,1,1,0,0,0,0,0,1,0,0,1,1,1,0,0,0],
 'banner-b-northwest-practice-r1':[1,1,1,1,0,1,3,1,1,1,0,0,0,0,0,0,0,1]}
# Endpoint inside the visible lower dark boot; source Y is measured on that actual
# boot, root projects its X onto the supported prone-body ground plane.
bootPointGuesses={
 'banner-b-west-damage-r1':{14:[962,1288],15:[313,1490],16:[652,1494],17:[987,1485]},
 'banner-b-northwest-damage-r1':{17:[592,1337],18:[949,1340],19:[307,1497],20:[642,1496],21:[968,1497]}}
checks=[];output={};allEntries=[]
def check(name,value):checks.append({'id':name,'passed':bool(value)});assert value,name
for sid,s in snapshot['sources'].items():
    source=PACK/s['sourceFile'];check(sid+' original unchanged',sha(source)==s['sourceSha256'])
    im=Image.open(source).convert('RGBA');factor=s['sourceScaleProposal'];items=[]
    for e in s['entries']:
        ri=e['rawIndex'];warm=e['warmProposals'][handIndices[sid][ri]]
        guess=warm['center'];physical=[]
        for y in range(round(guess[1])-2,round(guess[1])+3):
          for x in range(round(guess[0])-2,round(guess[0])+3):
            rgba=im.getpixel((x,y))
            if rgba[3]>=128:physical.append(((x-guess[0])**2+(y-guess[1])**2,[x,y],list(rgba)))
        check(sid+':'+str(ri)+' selected actual palm',bool(physical));_,palm,palmRGBA=min(physical)
        # Wrist/cuff directions read on source crops. No skin-color classifier approval.
        if s['group']=='damage':
            groundHand=ri>=(13 if s['direction']=='west' else 17)
            delta=[12,-3] if groundHand else [5,12]
        else:
            groundHand=ri in (12,13) if s['direction']=='west' else ri==12
            if groundHand:delta=[8,-10]
            elif ri in range(6,11) and s['direction']=='west':delta=[17,-2]
            elif ri in (11,14,15) and s['direction']=='west':delta=[5,14]
            else:delta=[5,12]
        cuff=[palm[0]+delta[0],palm[1]+delta[1]];cuffRGBA=list(im.getpixel(tuple(cuff)));cuffEstimate=cuffRGBA[3]<128
        cal=ri<6
        if s['group']=='damage':
            action='calibration' if cal else ('hit' if ri<(12 if s['direction']=='west' else 16) else 'death')
            closed=not groundHand
        else:
            action='calibration' if cal else ('meditate' if ri<12 else 'gather')
            closed=cal # Ritual/sitting/gather hands never claim a held shaft, even when curled.
        if sid=='banner-b-northwest-damage-r1' and ri in (6,7):action='unused-extra-calibration';closed=True
        if sid=='banner-b-northwest-damage-r1' and ri in (12,13):action='unused-extra-standing-hit';closed=True
        visibility='visible-closed-fist' if closed else ('ground-contact' if groundHand else 'seal')
        if s['group']=='practice' and s['direction']=='west' and ri in (11,14,15):visibility='open-palm'
        if s['group']=='practice' and s['direction']=='northwest' and ri in (13,14):visibility='open-palm'
        policy='held-empty-pole-grip-candidate' if closed else 'planted-pole-rest-or-free-gesture-no-held-claim'
        root=list(e['rootProposal']);planeY=e['bounds'][3];boot=None;bootROI=None
        method='Actual two dark boot soles visually inspected; keep proposed footprint envelope projection. Plane is source pixel after dark soles, not robe hem.'
        uncertainty=2
        if s['group']=='practice' and ri>=6:
            method='Seated folded-leg/cloth or kneeling support plane inspected on raw; x is support-envelope projection, not a measured pelvis bone. Pole is planted.'
            uncertainty=4 if ri<12 else 3
        if groundHand and s['group']=='damage':
            method='Early fallen/kneeling pose uses observed supported body envelope; no exact hidden pelvis/bone claim.';uncertainty=4
        if ri in bootPointGuesses.get(sid,{}):
            guess=bootPointGuesses[sid][ri];dark=[]
            # This local search only resolves the manually chosen visible boot ROI to
            # a physical dark pixel. It does not classify or select an anatomical root.
            for y in range(guess[1]-10,guess[1]+11):
              for x in range(guess[0]-10,guess[0]+11):
                rgba=im.getpixel((x,y))
                if rgba[3]>=128 and max(rgba[:3])<120:
                    dark.append(((x-guess[0])**2+(y-guess[1])**2,[x,y],list(rgba)))
            check(sid+':'+str(ri)+' actual lower dark boot',bool(dark));_,point,rgba=min(dark)
            boot={'source':point,'rgba':rgba,'role':'Actual visible lower dark human boot endpoint, measured in local manually selected ROI.'}
            bootROI=[guess[0]-10,guess[1]-10,21,21];root=[point[0],planeY]
            method='Actual visible lower dark-boot endpoint X projected to observed prone support planeY. Upper toe can be lifted; no exact pelvis bone claim.';uncertainty=3
        # Neutral height is actual crown through dark soles; all later lower actions use this source factor unchanged.
        palmRect=list(warm['rect'])
        l,t,w,h=e['sourceRect'];crop=im.crop((l,t,l+w,t+h));bg=Image.new('RGBA',crop.size,(241,243,236,255));bg.alpha_composite(crop)
        page=bg.convert('RGB').resize((w*3,h*3),Image.Resampling.NEAREST);draw=ImageDraw.Draw(page)
        for point,color,label in [(palm,(0,130,160),'palm'),(cuff,(160,70,0),'cuff'),(root,(10,120,30),'support projection')]:
            x=(point[0]-l)*3;y=(point[1]-t)*3;draw.line((x-6,y,x+6,y),fill=color,width=2);draw.line((x,y-6,x,y+6),fill=color,width=2);draw.text((x+8,y-8),label,fill=color)
        if boot:
            point=boot['source'];x=(point[0]-l)*3;y=(point[1]-t)*3;draw.ellipse((x-7,y-7,x+7,y+7),outline=(160,20,120),width=2)
        evidence=ROOT/'review/poses'/(sid+'-'+str(ri).zfill(2)+'.png');evidence.parent.mkdir(parents=True,exist_ok=True);page.save(evidence)
        notes='Actual empty closed fist selected instead of face/ear or hanging other hand.' if closed else 'Observed ritual/rest/contact hand, no held-pole claim.'
        if sid=='banner-b-northwest-practice-r1' and ri==6:notes+=' Palm is a small partially occluded fragment at joined wrist; source uncertainty3native, no exact finger/bone claim.'
        if sid=='banner-b-west-practice-r1' and ri==11:notes+=' Seated last key raises open hand; remains seated but differs from lap-only brief.'
        if action.startswith('unused'):notes+=' Source history only; excluded from active selected mapping.'
        item={'rawIndex':ri,'sourceRect':e['sourceRect'],'sourceRoot':root,'sourceRootReviewed':True,
           'sourceRootMeasurement':{'semantic':'boot-footprint' if boot else ('supported-seated-or-kneeling' if s['group']=='practice' and ri>=6 else 'standing-or-supported-body'),
             'method':method,'observedBodyContactY':planeY,'sourceSupportPlaneY':planeY,'uncertaintyNativePx':uncertainty,
             'exactBoneClaim':False,'sourceBootEndpoint':boot,'sourceBootROI':bootROI},
           'sourceCrownY':e['sourceCrownY'],'sourceBootSoleY':e['sourceBootSoleY'],'lift':0,'rendererAppliesLift':False,
           'grip':{'source':palm,'sourceWrist':cuff,'sourceOcclusionRect':palmRect,'visibility':visibility,'attachmentPolicy':policy,
             'closedGripConfirmed':closed,'sourcePalmReviewed':True,'sourceCuffReviewed':True,'sourceCuffEstimate':cuffEstimate,
             'sourcePalmRGBA':palmRGBA,'sourceCuffRGBA':cuffRGBA,'uncertaintyNativePx':3 if sid=='banner-b-northwest-practice-r1' and ri==6 else 1.5,
             'sourceCuffUncertaintyNativePx':2,'approved':False},
           'actionRole':action,'manualNote':notes,'sourceScaleUnchanged':factor,'evidence':evidence.relative_to(ROOT).as_posix(),'evidenceSHA':sha(evidence),
           'ownerApproved':False,'runtimeIntegrated':False}
        items.append(item);allEntries.append(item)
    if s['group']=='damage':
        mappings={'hit':list(range(6,12)),'death':list(range(12,18))} if s['direction']=='west' else {'hit':[8,9,10,11,14,15],'death':list(range(16,22))}
    else:mappings={'meditate':list(range(6,12)),'gather':list(range(12,18))}
    output[sid]={'sourceSha256':s['sourceSha256'],'sourceFile':s['sourceFile'],'actualGrid':s['actualGrid'],'rowColumns':s['rowColumns'],
       'sourceViewed':True,'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,'sourceScaleUnchanged':factor,
       'calibrations':[items[i] for i in range(6)],'actions':{a:[items[i] for i in indices] for a,indices in mappings.items()},
       'unusedEntries':[items[i] for i in (6,7,12,13)] if sid=='banner-b-northwest-damage-r1' else [],
       'sourceAllEntries':items,'ownerApproved':False,'runtimeIntegrated':False}
report={'schema':'banner-b-foundation-manual-support-1','sources':output,'coverage':{'sourceFiguresReviewed':len(allEntries),'selectedEntries':72,'unusedSourceEntries':4},
    'checks':len(checks),'passed':True,'ownerApproved':False,'runtimeIntegrated':False,
    'limits':['Only support measurements; actor B owns selection/packing/native review and may refine explicit uncertainty.',
       'Root is actual support-plane projection or visible boot endpoint, never a claimed exact hidden bone.',
       'Original source/costume/anatomy bytes never repainted, mirrored or per-pose fitted.',
       'RawIndex mappings reflect real22-figure NW damage source, not nominal3x6 crop.']}
(ROOT/'manual-sources.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'sources':len(output),'actualReviewed':len(allEntries),'checks':len(checks),'cuffEstimate':sum(e['grip']['sourceCuffEstimate'] for e in allEntries),'proneBootEndpoints':sum(e['sourceRootMeasurement']['sourceBootEndpoint'] is not None for e in allEntries)}))
