"""Measure native physical Banner shaft terminal pixels without changing gear."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
regPath=V2/'gear/banner/registration.json';reg=json.loads(regPath.read_text(encoding='utf8'))
records=[]
sheet=Image.new('RGB',(1024,1680),(37,42,48));draw=ImageDraw.Draw(sheet)
for index,record in enumerate(reg['records']):
    if record.get('calibrationOnly'):continue
    layer=next(x for x in record['layers'] if x['role']=='front')
    p=V2/layer['file'];assert sha(p)==layer['sha256']
    im=Image.open(p).convert('RGBA');alpha=im.getchannel('A');physical=alpha.point(lambda v:255 if v>=128 else 0)
    bbox=physical.getbbox();assert bbox
    y=bbox[3]-1;xs=[x for x in range(im.width) if physical.getpixel((x,y))==255]
    mid=sorted(xs)[len(xs)//2];point=[mid+0.5,y+0.5]
    row=record.copy()
    item={'id':record['id'],'identityId':record['identityId'],'direction':record['direction'],
          'fullFile':record['fullFile'],'fullSha256':record['fullSha256'],'frontFile':layer['file'],'frontSha256':sha(p),
          'canvas':record['canvas'],'pivot':record['pivot'],'registeredGrip':record['registeredGrip'],
          'registeredGroundCandidate':point,'lowestFrontPhysicalRow':y,'lowestRowPhysicalPixelsX':xs,
          'groundMinusGrip':[round(point[0]-record['registeredGrip'][0],6),round(point[1]-record['registeredGrip'][1],6)],
          'groundMinusPivot':[round(point[0]-record['pivot'][0],6),round(point[1]-record['pivot'][1],6)],
          'method':'Median occupied pixel center on the lowest alpha>=128 row of immutable front metal/shaft layer, then visually check it is physical pole endpoint.',
          'source':record['source'],'sourceSha256':record['sourceSha256'],'sourceScale':record['scale'],
          'sourceCoordinateClaimed':False,'manualEndpointReviewCompleted':False,
          'measurementUncertaintyNativePx':0.5,
          'ownerApproved':False,'runtimeIntegrated':False}
    records.append(item)
    full=Image.open(V2/record['fullFile']).convert('RGBA')
    fullbox=full.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
    crop=(max(0,min(fullbox[0],bbox[0])-3),max(0,min(fullbox[1],bbox[1])-3),
          min(im.width,max(fullbox[2],bbox[2])+3),min(im.height,max(fullbox[3],bbox[3])+3))
    cellX=(len(records)-1)%4*256;cellY=(len(records)-1)//4*420
    draw.text((cellX+6,cellY+5),record['id'],fill=(245,245,245))
    for which,bitmap in enumerate((full,im)):
        piece=bitmap.crop(crop).resize(((crop[2]-crop[0])*3,(crop[3]-crop[1])*3),Image.Resampling.NEAREST)
        # Fixed 3x across every record; crop is inspection only, never a gear derivative.
        left=cellX+6+which*122;top=cellY+27
        if piece.width>120:
            # A full banner may be wide; emit per-view evidence too, keeping source-native scale.
            left=cellX+6
            if which==0:continue
        sheet.paste(piece,(left,top),piece)
        px=left+(point[0]-crop[0])*3;py=top+(point[1]-crop[1])*3
        draw.line((px-8,py,px+8,py),fill=(100,245,165),width=1);draw.line((px,py-8,px,py+8),fill=(100,245,165),width=1)
    draw.text((cellX+6,cellY+400),'base '+str(point)+'; grip '+str(record['registeredGrip']),fill=(177,232,206))
    solo=Image.new('RGB',((crop[2]-crop[0])*6+28,(crop[3]-crop[1])*3+40),(230,231,233))
    sd=ImageDraw.Draw(solo)
    for which,bitmap in enumerate((full,im)):
        piece=bitmap.crop(crop).resize(((crop[2]-crop[0])*3,(crop[3]-crop[1])*3),Image.Resampling.NEAREST)
        left=6+which*(piece.width+14);top=25;solo.paste(piece,(left,top),piece)
        px=left+(point[0]-crop[0])*3;py=top+(point[1]-crop[1])*3
        sd.line((px-7,py,px+7,py),fill=(0,130,95),width=1);sd.line((px,py-7,px,py+7),fill=(0,130,95),width=1)
    sd.text((4,5),record['id']+' full / metal-front @3x',fill=(20,20,24))
    out=ROOT/'evidence'/(record['id']+'.png');out.parent.mkdir(parents=True,exist_ok=True);solo.save(out)
    item['evidence']=out.relative_to(ROOT).as_posix();item['evidenceSha256']=sha(out)
sheet.save(ROOT/'front-endpoints.png')
report={'schema':'banner-physical-ground-measurement-2','date':'2026-10-14','registrationFile':str(regPath),
        'registrationSha256':sha(regPath),'coverage':len(records),'records':records,'candidateOnlyUntilViewed':True,
        'reviewSheet':'front-endpoints.png','reviewSheetSha256':sha(ROOT/'front-endpoints.png'),
        'gearModified':False,'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'measurement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'coverage':len(records),'records':[{'id':r['id'],'base':r['registeredGroundCandidate'],'grip':r['registeredGrip'],'delta':r['groundMinusGrip']} for r in records]},ensure_ascii=True))
