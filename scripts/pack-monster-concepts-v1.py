"""Extract/register single identity concepts; no paint, no animation synthesis.

Only the new concept root is writable. Raw RGBA and approved actor/map inputs
remain byte-identical. Nearest resampling and body-alpha classification are
explicit in registration.json, following the actor production recipe.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

WORKSPACE = Path(__file__).resolve().parents[1]
ROOT = WORKSPACE / 'docs/design/characters/van-hai-monster-concepts-v1'
assert ROOT.resolve().is_relative_to(WORKSPACE.resolve())
manifest = json.loads((ROOT / 'production.json').read_text(encoding='utf-8'))
plan = json.loads((WORKSPACE / manifest['sourcePlan']).read_text(encoding='utf-8'))
enemies = {a['id']: a for a in plan['enemies']}
ALPHA_THRESHOLD = 210
# Root from visible support soles/roots. The x value is selected from the support
# region, never the whole alpha bounding box (dagger, wings, tail are excluded).
# y is the observed contact plane; hover uses an independent ground projection.
ROOTS = {
    'cloud-wolf': ([898,911], [825,858,959,911], 'Sole of closest planted forepaw; remaining paws sit on the projected floor.'),
    'talisman-sprout': ([641,1154], [419,1065,919,1154], 'Root tripod support; central forward root defines contact plane.'),
    'jade-scute': ([797,850], [744,742,855,850], 'Nearest front walking leg tip, not the forward pincer.'),
    'ink-bat': ([840,888], [779,811,927,888], 'Ground projection under torso/feet, 16px presentation lift; no physical sole claim.'),
    'cracked-puppet': ([694,1039], [594,964,781,1039], 'Forward planted stone foot sole; hands do not define root.'),
    'spirit-fungus': ([721,1060], [571,968,900,1060], 'Two root feet support; forward root determines floor plane.'),
    'dark-talisman-rogue': ([661,1201], [458,1090,832,1201], 'Midpoint of planted boot supports; closest sole defines floor, dagger excluded.'),
    'quiet-wisp': ([629,1167], [540,1056,687,1167], 'Ground projection below downward root ribbon; separate 8px hover lift.'),
    'wolf-caller': ([1003,971], [943,901,1062,971], 'Closest planted forepaw sole under raised shoulder, not tail bounding center.'),
    'jade-guard': ([845,969], [766,844,887,969], 'Closest walking leg tip; large bronze pincer is not a foot.'),
    'black-silk-adept': ([686,1141], [517,1035,864,1141], 'Midpoint of two planted boot supports; closest sole defines floor.'),
}
def sha(file): return hashlib.sha256(Path(file).read_bytes()).hexdigest()
rows=[]
for actor in manifest['actors']:
    file=ROOT / actor['raw']
    im=Image.open(file).convert('RGBA')
    alpha=im.getchannel('A')
    body=alpha.point(lambda v:255 if v>=ALPHA_THRESHOLD else 0)
    bounds=body.getbbox()
    assert bounds and body.getextrema()==(0,255), actor['slug']
    px, witness, note=ROOTS[actor['slug']]
    assert bounds[0]<=px[0]<bounds[2] and abs(px[1]-bounds[3])<=1
    isolated=im.copy(); isolated.putalpha(body)
    cut=isolated.crop(bounds)
    scale=actor['bodyHeightPx'] / cut.height
    scaled_size=(round(cut.width*scale), actor['bodyHeightPx'])
    native=cut.resize(scaled_size,Image.Resampling.NEAREST)
    # Register the source support root after quantization. The integer canvas
    # translation is the only placement correction; no repaint or deformation.
    sampled_bounds=native.getchannel('A').getbbox()
    native_root=[round((px[0]-bounds[0])*scale),sampled_bounds[3]]
    dest=[actor['pivot'][0]-native_root[0],actor['pivot'][1]-native_root[1]]
    assert dest[0]>=2 and dest[1]>=2
    assert dest[0]+native.width<=actor['canvas'][0]-2
    assert dest[1]+native.height<=actor['canvas'][1]-2
    frame=Image.new('RGBA',tuple(actor['canvas']))
    frame.alpha_composite(native,tuple(dest))
    frame.save(ROOT / actor['sprite'])
    native_bounds=frame.getchannel('A').getbbox()
    assert native_bounds[3]==actor['pivot'][1]
    measured_height=native_bounds[3]-native_bounds[1]
    assert abs(measured_height-actor['bodyHeightPx'])<=1, (actor['slug'],measured_height)
    assert set(frame.getchannel('A').get_flattened_data())=={0,255}
    low_alpha=sum(1 for v in alpha.get_flattened_data() if 0<v<ALPHA_THRESHOLD)
    actor.update(status='concept-candidate',role=enemies[actor['id']]['role'],
                 rawSha256=sha(file),spriteSha256=sha(ROOT / actor['sprite']),
                 promptSha256=sha(ROOT / actor['prompt']),pixelsResampled=True,measuredBodyHeightPx=measured_height,nativeBounds=list(native_bounds),
                 presentation={'shadowBaked':False,'vfxBaked':False,'liftPx':actor['liftPx']},
                 inputFiles=[{'file':p,'sha256':sha(WORKSPACE / p)} for p in actor['references']])
    if actor['slug']=='jade-guard':
        actor['refinement']={'prompt':'prompts/jade-guard-refine.txt',
            'promptSha256':sha(ROOT/'prompts/jade-guard-refine.txt'),
            'editTarget':'raw/jade-guard-v1-rejected.png',
            'editTargetSha256':sha(ROOT/'raw/jade-guard-v1-rejected.png'),
            'reason':'Initial elite too close to ordinary shell; darker material, stepped armor, forward bronze shield and V seam.'}
    rows.append({'id':actor['id'],'slug':actor['slug'],'sourceSize':list(im.size),
        'sourceBounds':list(bounds),'sourcePivot':px,'sourceSupportWitness':witness,
        'rootBasis':note,'pivotStatus':'concept-measured-pending-motion-review',
        'sharedNeutralScale':scale,'pixelsResampled':True,'resampling':'nearest',
        'nativeCutoutSize':list(native.size),'nativeCutoutRoot':native_root,'canvasTranslation':dest,
        'canvas':actor['canvas'],'pivot':actor['pivot'],'nativeBounds':list(native_bounds),
        'bodyHeightPx':actor['bodyHeightPx'],'measuredBodyHeightPx':measured_height,'liftPx':actor['liftPx'],
        'alphaPolicy':{'sourcePreserved':True,'nativeBodyThreshold':ALPHA_THRESHOLD,
                       'binaryNativeAlpha':True,'lowAlphaSourcePixelsExcluded':low_alpha,
                       'componentsRemoved':0,'rgbPainted':False},
        'sourceSha256':sha(file),'spriteSha256':actor['spriteSha256']})
manifest.update(status='concept-candidate',runtimeConsumable=False)
manifest['sourcePlanSha256']=sha(WORKSPACE / manifest['sourcePlan'])
manifest['approvedPlayerReference']={'file':'docs/design/characters/wang-lin-pixel-production-v2/masters/southeast.png',
    'sha256':sha(WORKSPACE/'docs/design/characters/wang-lin-pixel-production-v2/masters/southeast.png'),
    'canvas':[64,96],'pivot':[32,88],'bodyHeightPx':80,'modified':False}
(ROOT/'production.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'registration.json').write_text(json.dumps({'schema':'monster-concept-registration-1',
    'date':'2026-10-13','runtimeConsumable':False,'artApproved':False,'actors':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Deterministic review composition, not additional generated or painted ART.
def font(size,bold=False):
    name='segoeuib.ttf' if bold else 'segoeui.ttf'
    return ImageFont.truetype(str(Path('C:/Windows/Fonts')/name),size)
def centered(draw,x,y,text,f,fill):
    b=draw.textbbox((0,0),text,font=f);draw.text((round(x-(b[2]-b[0])/2),y),text,font=f,fill=fill)
board=Image.new('RGB',(1440,1120),'#101f1c');d=ImageDraw.Draw(board)
d.text((28,19),'VÂN HẢI · QUÁI & TINH ANH 01',font=font(28,True),fill='#e8d7ad')
d.text((28,62),'11 concept · Đông Nam / neutral · nearest 3× · body / shadow / VFX riêng',font=font(16),fill='#bbceba')
items=[{'name':'Vương Lâm · basis','sprite':'../wang-lin-pixel-production-v2/masters/southeast.png','pivot':[32,88],'bodyHeightPx':80,'rank':'basis','liftPx':0}]+manifest['actors']
for i,a in enumerate(items):
    col=i%4;row=i//4;x=col*360+16;y=row*336+108
    d.rounded_rectangle((x,y,x+328,y+313),radius=8,fill='#dedbc5' if a['rank']!='elite' else '#b1c3b4')
    frame=Image.open(ROOT / a['sprite']).convert('RGBA');z=3;ground=y+246
    frame=frame.resize((frame.width*z,frame.height*z),Image.Resampling.NEAREST)
    silhouette_bounds=frame.getchannel('A').getbbox()
    xx=round(x+164-(silhouette_bounds[0]+silhouette_bounds[2])/2);yy=round(ground-(a['pivot'][1]+a['liftPx'])*z)
    board.paste(frame,(xx,yy),frame)
    d.line((x+13,ground,x+315,ground),fill='#908a70',width=1)
    centered(d,x+164,y+254,a['name'],font(20,True),'#263c30')
    label={'basis':'BASIS','mob':'QUÁI THƯỜNG','elite':'TINH ANH'}[a['rank']]
    centered(d,x+164,y+286,f"{label} · {a['bodyHeightPx']} px",font(13),'#42583f')
board.save(ROOT/'review/lineup-3x.png')
print(f"Packed {len(rows)} identity masters; one view/pose each, no animation or runtime claims.")
