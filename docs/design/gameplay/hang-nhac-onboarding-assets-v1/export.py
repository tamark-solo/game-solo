"""Local export/review only. No API, runtime import, owner map or DB writes."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json, shutil

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[3]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def relative(p): return p.resolve().relative_to(ROOT).as_posix()
def save_json(p, data): p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
plan = json.loads((BASE/'production.json').read_text(encoding='utf-8-sig'))
generation = json.loads((BASE/'generation-results.json').read_text(encoding='utf-8-sig'))
for folder in ['native','review']: (BASE/folder).mkdir(exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
sizes = {key:(tuple(value['canvas']),tuple(value['bodyFit'])) for key,value in plan['deliveredNativeTargets'].items()}
records=[]
for spec,gen in zip(plan['assets'],generation['records']):
    manifest_path=Path(gen['manifestPath'])
    manifest=json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    source=Path(manifest['files'][0]['path'])
    assert sha(source)==manifest['files'][0]['sha256']
    prepared=manifest['preparedFiles'][-1]
    alpha_path=Path(prepared['path'])
    assert sha(alpha_path)==prepared['sha256']
    image=Image.open(alpha_path).convert('RGBA')
    assert image.size==Image.open(source).size
    mask=image.getchannel('A').point(lambda v:255 if v>=64 else 0)
    bounds=mask.getbbox(); assert bounds is not None
    assert bounds[0]>2 and bounds[1]>2 and bounds[2]<image.width-2 and bounds[3]<image.height-2
    crop=(bounds[0]-2,bounds[1]-2,bounds[2]+2,bounds[3]+2)
    subject=image.crop(crop)
    def export(canvas,body,name):
        ratio=min(body[0]/subject.width,body[1]/subject.height)
        target=(max(1,round(subject.width*ratio)),max(1,round(subject.height*ratio)))
        reduced=subject.resize(target,Image.Resampling.LANCZOS)
        out=Image.new('RGBA',canvas)
        placement=((canvas[0]-target[0])//2,(canvas[1]-target[1])//2)
        out.alpha_composite(reduced,placement)
        p=BASE/'native'/name;out.save(p)
        data=list(out.get_flattened_data())
        spill=sum(1 for r,g,b,a in data if a>32 and r>120 and b>120 and r>g+40 and b>g+40)
        edge=sum(out.getpixel((x,y))[3]>0 for x in range(out.width) for y in range(out.height) if x in (0,out.width-1) or y in (0,out.height-1))
        assert spill==0,(name,'magenta',spill)
        assert edge==0,(name,'clipping',edge)
        return {'path':p.relative_to(BASE).as_posix(),'width':canvas[0],'height':canvas[1],'sha256':sha(p),'contentBounds':out.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox(),'placement':{'x':placement[0],'y':placement[1],'width':target[0],'height':target[1]},'visibleMagentaPixels':spill,'canvasEdgePixels':edge}
    canvas,body=sizes[spec['id']]
    native=export(canvas,body,spec['id']+'.png')
    icons=[]
    if spec['id']=='hn-quest-sample':
        icons=[export((s,s),(round(s*.78),round(s*.78)),spec['id']+'-'+str(s)+'.png') for s in (32,48,64)]
    preview=Image.new('RGBA',(600,340),'#efe8d4')
    d=ImageDraw.Draw(preview);d.rectangle((300,0,599,339),fill='#10282d')
    large=subject.copy();large.thumbnail((245,285),Image.Resampling.LANCZOS)
    for cx in (150,450):preview.alpha_composite(large,(cx-large.width//2,42+(285-large.height)//2))
    d.text((12,10),spec['label']+' · alpha',fill='#173339',font=font)
    preview_path=BASE/'review'/(spec['id']+'-alpha.png');preview.save(preview_path)
    grid=Image.new('RGB',(canvas[0]*6,canvas[1]*6+32),'#e7dfc9')
    n=Image.open(BASE/native['path']).convert('RGBA')
    grid.paste(n.resize((canvas[0]*6,canvas[1]*6),Image.Resampling.NEAREST),(0,32),n.resize((canvas[0]*6,canvas[1]*6),Image.Resampling.NEAREST))
    d=ImageDraw.Draw(grid)
    for x in range(0,canvas[0]+1,8):d.line((x*6,32,x*6,grid.height),fill='#789090');d.text((x*6+1,1),str(x),font=small,fill='#173339')
    for y in range(0,canvas[1]+1,8):d.line((0,y*6+32,grid.width,y*6+32),fill='#789090');d.text((1,y*6+32),str(y),font=small,fill='#173339')
    grid.save(BASE/'review'/(spec['id']+'-grid.png'))
    records.append({'id':spec['id'],'label':spec['label'],'role':spec['role'],'source':{'path':relative(source),'sha256':sha(source),'width':image.width,'height':image.height,'manifest':relative(manifest_path)},'alpha':{'path':relative(alpha_path),'sha256':sha(alpha_path),'canvasPreserved':True},'crop':{'box':crop,'boundsAlphaThreshold':64,'padding':2},'native':native,'icons':icons,'reviewImage':preview_path.relative_to(BASE).as_posix(),'ownerApproved':False,'artApproved':False})

actor_path=ROOT/plan['actorReference']; actor=Image.open(actor_path).convert('RGBA');assert actor.size==(64,96)
shutil.copyfile(actor_path,BASE/'review'/'actor-64x96.png')
world_path=ROOT/plan['styleReference'];world=Image.open(world_path).convert('RGBA')
world.crop((1370,1060,1970,1300)).save(BASE/'review'/'map-crop.png')
manifest={'schema':'game-solo-onboarding-art-review-1','status':'preview-pending-owner','date':'2026-10-13','ownerApproved':False,'artApproved':False,'runtimeConsumable':False,'assets':records,'actor':{'path':'review/actor-64x96.png','source':relative(actor_path),'sha256':sha(actor_path),'width':64,'height':96,'pivot':{'x':32,'y':88}},'mapCrop':'review/map-crop.png','mapReference':{'path':relative(world_path),'sha256':sha(world_path),'crop':[1370,1060,600,240]},'exportNotes':['Source preserved; each native size sampled directly from prepared source via Lanczos, no repeated up/down resize.','World sample reduced to hand size 18x28; conductor body56px to stay low beside actor.','Pivot must be visually measured on current exported PNG hashes before delivery.']}
measurement_path=BASE/'pivot-measurements.json'
if measurement_path.exists():
    measurements=json.loads(measurement_path.read_text(encoding='utf-8'))
    for asset in manifest['assets']:
        measured=next(m for m in measurements['assets'] if m['id']==asset['id'])
        assert measured['nativeSha256']==asset['native']['sha256'], 'Native changed: remeasure pivot before delivery'
        asset['native'].update(pivot=measured['pivot'],pivotVerified=True,pivotMeasurement='pivot-measurements.json')
    manifest['exportNotes'][-1]='Pivots visually measured on native PNGs; measurements pinned by SHA256. No collider or placement authored.'
approval_path=BASE/'approval.json'
if approval_path.exists():
    approval=json.loads(approval_path.read_text(encoding='utf-8'))
    assert approval['ownerApproved'] is True and approval['artApproved'] is True
    approved_hashes={target['sha256'] for target in approval['targets']}
    for target in approval['targets']:
        assert sha(ROOT/target['path'])==target['sha256'], 'Approved art changed: review required'
    for asset in manifest['assets']:
        assert asset['id'] in approval['assetIds']
        assert all(f['sha256'] in approved_hashes for f in [asset['source'],asset['alpha'],asset['native'],*asset['icons']])
        asset.update(ownerApproved=True,artApproved=True)
    manifest.update(status='art-approved-awaiting-placement',ownerApproved=True,artApproved=True,approval='approval.json')
save_json(BASE/'assets.json',manifest)
print('Exported 3 props, 3 sample status icons, alpha boards and measurement grids.')
