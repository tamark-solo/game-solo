from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import copy, hashlib, json, math

ROOT = Path(__file__).resolve().parent
V5 = ROOT.parent / 'wang-lin-concept-direction-v5'
OUT = ROOT / 'gear' / 'motion'
CANVAS, PIVOT = (192, 192), (96, 160)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
if (ROOT / 'approval.json').exists():
    raise RuntimeError('Approved production root is immutable; use another version')
approval = json.loads((V5 / 'approval.json').read_text(encoding='utf-8-sig'))
for pin in approval['files']:
    assert sha(V5 / pin['file']) == pin['sha256'], 'Concept basis changed: ' + pin['file']
motion = json.loads((ROOT / 'motion-registration.json').read_text(encoding='utf-8-sig'))
gear = json.loads((ROOT / 'gear-registration.json').read_text(encoding='utf-8-sig'))
props = {r['identityId']: r for r in gear['records'] if r['familyId'] == 'sword'}
assert len(motion['clips']) == 16
OUT.mkdir(parents=True, exist_ok=True)
checks, packed, max_quantization = [], [], 0

def bounds(image):
    return image.getchannel('A').getbbox()

def edges(image):
    a = image.getchannel('A')
    return {'left': bool(a.crop((0, 0, 1, image.height)).getbbox()), 'right': bool(a.crop((image.width-1, 0, image.width, image.height)).getbbox()), 'top': bool(a.crop((0, 0, image.width, 1)).getbbox()), 'bottom': bool(a.crop((0, image.height-1, image.width, image.height)).getbbox())}

def affine(source, grip, anchor, degrees):
    angle = math.radians(degrees)
    c, s = math.cos(angle), math.sin(angle)
    gx, gy = grip
    ax, ay = anchor
    return source.transform(CANVAS, Image.Transform.AFFINE, (c, s, gx-c*ax-s*ay, -s, c, gy+s*ax-c*ay), Image.Resampling.NEAREST)

def state(clip, frame, index, release_anchor):
    direction, identity, action = clip['direction'], clip['identityId'], clip['action']
    visible = frame['grip'].get('visibility', 'candidate')
    rest_angle = -65 if direction == 'north' and identity == 'a' else 0
    release_angle = (148 if identity == 'a' else -160) if direction == 'north' else (-140 if identity == 'a' else -70)
    grip = frame['grip']['native']
    offset = [grip[0]-frame['pivot'][0], grip[1]-frame['pivot'][1]]
    role, mode, explanation = 'front', 'held', 'Physical blade attached to the measured per-pose hand.'
    if action in ['idle', 'run']:
        if visible == 'occluded':
            role, explanation = 'rear', 'Hand is occluded in this back pose; rear-held candidate, visible grip is not claimed.'
        return offset, rest_angle, role, mode, explanation
    if index == 0 or index >= 5:
        if visible == 'occluded':
            return [18, -54], release_angle, 'front', 'hover', 'Deliberate detached command blade while the casting hand is occluded.'
        return offset, rest_angle, role, mode, explanation
    if action == 'cast-aoe':
        return [18, -54], release_angle, 'front', 'hover', 'Array command: blade hovers at a fixed caster-relative anchor; fingers channel the array and do not grip the hilt.'
    if index in [3, 4]:
        return release_anchor, release_angle, 'front', 'released', 'Release anchor is captured from the first open-palm release pose and remains fixed through the following pose. Core release gate still controls effects.'
    if visible in ['seal', 'occluded', 'open-palm']:
        return [18, -54], release_angle, 'front', 'hover', 'Deliberate detached sword control; no physical palm grip is claimed for this gesture.'
    return offset, rest_angle, role, mode, explanation

def composite(frame):
    result = Image.new('RGBA', CANVAS)
    for layer in frame['gearLayers']:
        if layer['role'] == 'rear': result.alpha_composite(Image.open(ROOT / layer['file']).convert('RGBA'))
    body = Image.open(ROOT / frame['file']).convert('RGBA')
    body_offset = (PIVOT[0]-frame['pivot'][0], PIVOT[1]-frame['pivot'][1])
    result.alpha_composite(body, body_offset)
    for layer in frame['gearLayers']:
        if layer['role'] == 'front': result.alpha_composite(Image.open(ROOT / layer['file']).convert('RGBA'))
        if layer['role'] == 'occlusion':
            x, y, w, h = layer['rect']
            result.alpha_composite(body.crop((x, y, x+w, y+h)), (body_offset[0]+x, body_offset[1]+y))
    return result

for clip in motion['clips']:
    p = props[clip['identityId']]
    assert sha(ROOT / p['fullFile']) == p['fullSha256'], 'Resting prop changed'
    prop = Image.open(ROOT / p['fullFile']).convert('RGBA')
    pg = p['registeredGrip']
    first_release = next((f for f in clip['frames'][3:5] if f['grip'].get('visibility') == 'open-palm'), clip['frames'][3])
    release_anchor = [first_release['grip']['native'][i]-first_release['pivot'][i] for i in range(2)]
    current = copy.deepcopy(clip)
    current['gearTrack'] = {'id': clip['id'], 'propSource': p['source'], 'propSourceSha256': p['sourceSha256'], 'propNative': p['fullFile'], 'propNativeSha256': p['fullSha256'], 'sourceScale': p['scale'], 'additionalScale': 1, 'flatBladeViewPolicy': 'A flat physical blade reuses its resting artwork for the North pilot; this is a candidate without a separate perspective view, not a claim of eight-view equipment art.', 'releaseOffset': release_anchor, 'releaseGateMs': 480 if clip['action']=='cast-single-target' else 800 if clip['action']=='cast-aoe' else None, 'coreControlsRelease': True}
    folder = OUT / clip['id']
    folder.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(current['frames']):
        assert sha(ROOT / frame['file']) == frame['sha256'], 'Body frame changed during pack; rerun after motion finalization'
        offset, angle, role, mode, note = state(clip, frame, index, release_anchor)
        ideal = [PIVOT[i]+offset[i] for i in range(2)]
        anchor = [round(v) for v in ideal]
        error = math.hypot(anchor[0]-ideal[0], anchor[1]-ideal[1])
        max_quantization = max(max_quantization, error)
        whole = affine(prop, pg, anchor, angle)
        assert bounds(whole), 'Missing prop pixels'
        assert not any(edges(whole).values()), 'Prop clipped: ' + clip['id']
        assert whole.getpixel(tuple(anchor))[3] > 0, 'Registered hilt lost at quantized anchor'
        rear = whole if role == 'rear' else Image.new('RGBA', CANVAS)
        front = whole if role == 'front' else Image.new('RGBA', CANVAS)
        whole_file, rear_file, front_file = [folder / f'{index+1:02d}-{name}.png' for name in ['full', 'rear', 'front']]
        for im, file in [(whole, whole_file), (rear, rear_file), (front, front_file)]: im.save(file)
        layers = [{'file': file.relative_to(ROOT).as_posix(), 'sha256': sha(file), 'role': name, 'canvas': list(CANVAS), 'pivot': list(PIVOT), 'offset': [0, 0]} for name, file in [('rear', rear_file), ('front', front_file)]]
        visibility = frame['grip'].get('visibility', 'candidate')
        if mode == 'held' and visibility != 'occluded':
            x, y, w, h = frame['grip']['occlusionRect']
            assert x >= 0 and y >= 0 and x+w <= frame['canvas'][0] and y+h <= frame['canvas'][1]
            layers.append({'file': frame['file'], 'sha256': frame['sha256'], 'role': 'occlusion', 'cropInBody': True, 'rect': [x, y, w, h], 'canvas': frame['canvas'], 'pivot': frame['pivot'], 'offset': [0, 0], 'source': 'Own exact body pose; source-over crop restores only existing hand pixels.'})
        body = Image.open(ROOT / frame['file']).convert('RGBA')
        hand_pixel = tuple(max(0,min(body.size[i]-1,round(frame['grip']['native'][i]))) for i in range(2))
        hand_alpha = body.getpixel(hand_pixel)[3]
        if mode == 'held' and visibility != 'occluded': assert hand_alpha > 0, 'Visible held socket is empty: '+clip['id']+' '+str(index)
        frame['gearLayers'] = layers
        frame['gearMode'] = mode
        frame['mode'] = mode
        frame['body'] = {'file': frame['file'], 'sha256': frame['sha256'], 'canvas': frame['canvas'], 'pivot': frame['pivot']}
        frame['handOcclusion'] = next((l for l in layers if l['role']=='occlusion'), None)
        frame['gearGrip'] = {'native': anchor, 'worldOffset': [anchor[i]-PIVOT[i] for i in range(2)], 'bodyHandNative': frame['grip']['native'], 'quantizationErrorPx': error, 'gripAgreementClaimed': mode == 'held' and visibility != 'occluded'}
        frame['gearPresentation'] = {'mode': mode, 'handVisibility': visibility, 'note': note, 'file': whole_file.relative_to(ROOT).as_posix(), 'sha256': sha(whole_file), 'canvas': list(CANVAS), 'pivot': list(PIVOT), 'registeredHilt': anchor, 'desiredWorldOffset': offset, 'actualWorldOffset': [anchor[i]-PIVOT[i] for i in range(2)], 'rotationDeg': angle, 'quantizationErrorPx': error, 'sourceScale': p['scale'], 'additionalScale': 1, 'sampling': 'NEAREST affine around registered source hilt', 'sourcePropNative': p['fullFile'], 'sourcePropNativeSha256': p['fullSha256'], 'bodyPoseSha256': frame['sha256'], 'bodySocketAlpha': hand_alpha, 'gripAgreementClaimed': mode == 'held' and visibility != 'occluded', 'handOcclusionApplied': any(l['role']=='occlusion' for l in layers), 'releaseRequiresCoreFact': mode == 'released', 'bounds': list(bounds(whole)), 'sourcePixelsRepainted': False, 'ownerApproved': False}
        checks.append({'clip': clip['id'], 'frame': index, 'mode': mode, 'bodyPoseSha256': frame['sha256'], 'noClipping': True, 'factorPreserved': True, 'handMaskOwnPose': True, 'quantizationErrorPx': error, 'handSocketAlpha': hand_alpha, 'layerUnionMatchesFull': Image.alpha_composite(rear,front).tobytes()==whole.tobytes()})
    packed.append(current)

key_count = sum(len(c['frames']) for c in motion['clips'])
assert len(checks) == key_count
font_file = Path('C:/Windows/Fonts/segoeui.ttf')
font = ImageFont.truetype(str(font_file), 14) if font_file.exists() else ImageFont.load_default()
for group, predicate in [('cast', lambda c:c['action'].startswith('cast')), ('rest',lambda c:c['action'] in ['idle','run'])]:
    clips = [c for c in packed if predicate(c)]
    sheet = Image.new('RGBA', (192*max(len(c['frames']) for c in clips), (192+28)*len(clips)), '#20352b')
    draw = ImageDraw.Draw(sheet)
    for row, clip in enumerate(clips):
        draw.text((8,row*220+4),clip['id'],font=font,fill='#d4dcc0')
        for col, frame in enumerate(clip['frames']):
            x, y = col*192, row*220+28
            sheet.alpha_composite(composite(frame),(x,y))
            anchor = frame['gearPresentation']['registeredHilt']
            color = '#acdab6' if frame['gearPresentation']['mode']=='held' else '#e6d19a'
            draw.line((x+anchor[0]-3,y+anchor[1],x+anchor[0]+3,y+anchor[1]),fill=color,width=1)
            draw.line((x+anchor[0],y+anchor[1]-3,x+anchor[0],y+anchor[1]+3),fill=color,width=1)
            draw.text((x+8,y+173),frame['gearPresentation']['mode'],font=font,fill=color)
    sheet.save(OUT / f'{group}-contact-dark-1x.png')
    sheet.resize((sheet.width*2,sheet.height*2),Image.Resampling.NEAREST).save(OUT / f'{group}-contact-dark-2x.png')

result={'schema':'wang-lin-equipment-gear-tracks-1','date':'2026-10-14','clips':packed,'coverage':{'castTracks':8,'restTracks':8,'castKeys':sum(len(c['frames']) for c in packed if c['action'].startswith('cast')),'restKeys':sum(len(c['frames']) for c in packed if c['action'] in ['idle','run']),'gearKeys':key_count},'registration':{'canvas':list(CANVAS),'pivot':list(PIVOT),'uniformSourceFactors':{identity:p['scale'] for identity,p in props.items()},'additionalScale':1,'maxQuantizationErrorPx':max_quantization},'policy':{'bodyModified':False,'mirrorBody':False,'repaintPropPixels':False,'sourcePropMaster':'P1 native resting physical blade','flatNorthBladeCandidate':True,'castSealAndOpenPalm':'Detached command/release, no fictitious closed grip','releaseOriginCaptured':True,'coreFactControlsEffectTiming':True},'ownerApproved':False,'artApproved':False,'motionApproved':False,'runtimeIntegrated':False}
(ROOT/'gear-tracks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'verification.json').write_text(json.dumps({'schema':'wang-lin-gear-track-verification-1','status':'passed','keys':key_count,'bodyModified':False,'basisPinsPreserved':len(approval['files']),'maxQuantizationErrorPx':max_quantization,'checks':checks,'limitations':['Held sockets are candidates measured from the actual source pose; visible hand masks restore the actor own pixels.','North blade uses flat resting art, without claiming a new perspective equipment view.','AOE and seal gestures intentionally use detached hover; no palm grip is claimed.']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'passed','castTracks':8,'restTracks':8,'gearKeys':key_count,'maxQuantizationErrorPx':max_quantization,'bodyModified':False}))
