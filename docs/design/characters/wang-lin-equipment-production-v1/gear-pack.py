from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json, math

ROOT = Path(__file__).resolve().parent
CONCEPT = ROOT.parent / 'wang-lin-concept-direction-v5'
if (ROOT / 'approval.json').exists():
    raise RuntimeError('Approved root is immutable')
sha = lambda file: hashlib.sha256(Path(file).read_bytes()).hexdigest()
approval = json.loads((CONCEPT / 'approval.json').read_text(encoding='utf-8'))
for pin in approval['files']:
    if sha(CONCEPT / pin['file']) != pin['sha256']:
        raise RuntimeError('Concept basis changed: ' + pin['file'])
body = json.loads((ROOT / 'body-registration.json').read_text(encoding='utf-8'))
body_by_id = {r['id']: r for r in body['records']}
measurements = {
    'sword-a': {'grip':[785,445], 'scale':0.0305, 'basis':'blade-tip offset matches approved resting sword; physical height about 33 px'},
    'sword-b': {'grip':[245,451], 'scale':0.0300, 'basis':'blade-tip offset matches approved resting sword; physical height about 30 px'},
    'banner-a': {'grip':[491,830], 'floor':[246,1486], 'poleTop':[690,243]},
    'banner-b': {'grip':[716,877], 'floor':[599,1514], 'poleTop':[826,188]},
    'chariot-a': {'grip':[200,205], 'floor':[1075,923]},
    'chariot-b': {'grip':[96,255], 'floor':[832,1205]},
    'bead-a': {'grip':[628,792], 'scale':5/320, 'basis':'5 px physical bead, bottom rests on measured palm'},
    'bead-b': {'grip':[629,826], 'scale':6/381, 'basis':'6 px physical bead, bottom rests on measured palm'},
}
canvas = (192,192)
pivot = (80,160)
out = ROOT / 'gear' / 'native'
out.mkdir(parents=True, exist_ok=True)
records = []
for id, measurement in measurements.items():
    b = body_by_id[id]
    source = ROOT / 'sources' / 'gear' / (id+'.png')
    im = Image.open(source).convert('RGBA')
    alpha = im.getchannel('A')
    core = alpha.point(lambda value:255 if value>=128 else 0)
    core_bounds = core.getbbox()
    gx,gy = measurement['grip']
    tx = pivot[0] + b['grip']['native'][0]-b['pivot'][0]
    ty = pivot[1] + b['grip']['native'][1]-b['pivot'][1]
    if 'floor' in measurement:
        scale = (pivot[1]-ty)/(measurement['floor'][1]-gy)
        scale_basis = 'Uniform scale solves hand and ground simultaneously; floor measured at apparatus/pole bottom, not character root.'
    else:
        scale = measurement['scale']
        scale_basis = measurement['basis']
    native = im.transform(canvas, Image.Transform.AFFINE, (1/scale,0,gx-tx/scale,0,1/scale,gy-ty/scale), Image.Resampling.NEAREST)
    native.putalpha(native.getchannel('A').point(lambda value:255 if value>=128 else 0))
    fullfile = out/(id+'.png')
    native.save(fullfile)
    front, rear = native.copy(), Image.new('RGBA',canvas)
    if id.startswith('banner'):
        rear = native.copy()
        front = Image.new('RGBA',canvas)
        pole_bottom = measurement['floor']
        for y in range(canvas[1]):
            sy = gy+(y-ty)/scale
            fraction = (sy-gy)/(pole_bottom[1]-gy)
            expected_source_x = gx+fraction*(pole_bottom[0]-gx)
            expected_native_x = tx+(expected_source_x-gx)*scale
            for x in range(canvas[0]):
                if y>=math.floor(ty) and abs(x-expected_native_x)<=2.5:
                    front.putpixel((x,y),native.getpixel((x,y)))
                    rear.putpixel((x,y),(0,0,0,0))
    front_file, rear_file = out/(id+'-front.png'), out/(id+'-rear.png')
    front.save(front_file)
    rear.save(rear_file)
    combined = Image.alpha_composite(rear,front)
    if any(a[3]!=b[3] or (a[3]>0 and a!=b) for a,b in zip(combined.get_flattened_data(),native.get_flattened_data())):
        raise RuntimeError('Layer union changed ART: '+id)
    edges = { 'left':native.getchannel('A').crop((0,0,1,192)).getbbox() is not None,
              'right':native.getchannel('A').crop((191,0,192,192)).getbbox() is not None,
              'top':native.getchannel('A').crop((0,0,192,1)).getbbox() is not None,
              'bottom':native.getchannel('A').crop((0,191,192,192)).getbbox() is not None }
    if any(edges.values()): raise RuntimeError('Native equipment clipping: '+id)
    projected_bounds = [tx+(core_bounds[0]-gx)*scale,ty+(core_bounds[1]-gy)*scale,tx+(core_bounds[2]-gx)*scale,ty+(core_bounds[3]-gy)*scale]
    if min(projected_bounds)<0 or projected_bounds[2]>192 or projected_bounds[3]>192:
        raise RuntimeError('Source core would be clipped: '+id)
    rel = lambda p: p.relative_to(ROOT).as_posix()
    record = {'id':id,'identityId':id[-1],'familyId':id.split('-')[0], 'direction':'southeast',
        'source':rel(source),'sourceSha256':sha(source),'sourceSize':list(im.size),'sourceCoreBounds':list(core_bounds),
        'sourceGrip':measurement['grip'],'sourceGripAlpha':alpha.getpixel(tuple(measurement['grip'])),
        'scale':scale,'scaleBasis':scale_basis,'canvas':list(canvas),'pivot':list(pivot),'registeredGrip':[tx,ty],
        'bodyGrip':b['grip']['native'],'bodyGround':[pivot[0],pivot[1]],'bounds':list(native.getchannel('A').getbbox()),
        'fullFile':rel(fullfile),'fullSha256':sha(fullfile),
        'layers':[{'file':rel(rear_file),'sha256':sha(rear_file),'role':'rear','canvas':list(canvas),'pivot':list(pivot),'offset':[0,0]},
                  {'file':rel(front_file),'sha256':sha(front_file),'role':'front','canvas':list(canvas),'pivot':list(pivot),'offset':[0,0]}],
        'handOcclusion':{'file':b['nativeFile'],'rect':b['grip']['nativeOcclusionRect'],'canvas':b['canvas'],'pivot':b['pivot']},
        'layerUnionMatchesVisiblePixels':True,'nativeEdges':edges,'uniformScalePerSource':True,
        'alphaPolicy':'Raw RGBA preserved; resting pixel equipment nearest sampled alpha128. Soft FX are separate.',
        'pixelsResampled':True,'pixelsRepainted':False,'ownerApproved':False,'runtimeReady':False}
    if 'floor' in measurement:
        record['sourceGround']=measurement['floor']
        record['registeredGroundY']=ty+(measurement['floor'][1]-gy)*scale
    records.append(record)

for background,label in [((31,36,47,255),'dark'),((218,213,194,255),'light')]:
    sheet=Image.new('RGBA',(8*192,216),background)
    draw=ImageDraw.Draw(sheet)
    for i,r in enumerate(records):
        x=i*192
        draw.text((x+8,5),r['id'],fill=(190,155,83,255))
        for layer in r['layers'][:1]: sheet.alpha_composite(Image.open(ROOT/layer['file']).convert('RGBA'),(x,20))
        b=body_by_id[r['id']]
        body_offset=(x+pivot[0]-b['pivot'][0],20+pivot[1]-b['pivot'][1])
        body_image=Image.open(ROOT/b['nativeFile']).convert('RGBA')
        sheet.alpha_composite(body_image,body_offset)
        sheet.alpha_composite(Image.open(ROOT/r['layers'][1]['file']).convert('RGBA'),(x,20))
        hx,hy,hw,hh=b['grip']['nativeOcclusionRect']
        sheet.alpha_composite(body_image.crop((hx,hy,hx+hw,hy+hh)),(body_offset[0]+hx,body_offset[1]+hy))
        draw.line((x+10,180,x+182,180),fill=(128,128,128,255))
    sheet.save(ROOT/'gear'/('lineup-'+label+'-1x.png'))
    sheet.resize((sheet.width*2,sheet.height*2),Image.Resampling.NEAREST).save(ROOT/'gear'/('lineup-'+label+'-2x.png'))

data={'schema':'wang-lin-equipment-gear-registration-1','date':'2026-10-14','records':records,'coverage':{'restingGear':8,'direction':'southeast','motionTracks':0},'ownerApproved':False,'runtimeReady':False,'limitations':['Grip/depth are measured presentation candidates for neutral only.','Chariot proportions solve current independent prop hand/ground geometry; compare to approved integrated concept before motion binding.','Native bead is deliberately compact (5/6 px), engraving detail reduces at 1×.']}
(ROOT/'gear-registration.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'restingGear':len(records),'layerUnionChecks':len(records),'nativeClipping':0,'conceptPinsUnchanged':len(approval['files'])}))
