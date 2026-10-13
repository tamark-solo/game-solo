"""Pack static NPC identity pilots with direct Pixel02 image references.

Use --inspect after raw generation, then record visually measured landmarks in
review/source-measurements.json. Packing refuses absent or stale measurements.
No paid generation, painting, animation synthesis or runtime/map integration.
"""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parents[3]
assert ROOT.name == 'van-hai-npc-concepts-v2'
assert (WORKSPACE / 'AGENTS.md').is_file()
ALPHA_THRESHOLD = 210
PLAYER = WORKSPACE / 'docs/design/characters/wang-lin-pixel-production-v2/masters/southeast.png'


def inside(relative):
    path = (ROOT / relative).resolve()
    assert path.is_relative_to(ROOT), f'Outside NPC pack: {relative}'
    return path


def write_json(relative, value):
    path = inside(relative)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def font(size, bold=False):
    return ImageFont.truetype(str(Path('C:/Windows/Fonts') / ('segoeuib.ttf' if bold else 'segoeui.ttf')), size)


def isolate(source):
    """Key only saturated magenta, then classify body alpha; never change RGB."""
    data = list(source.get_flattened_data())
    alpha = []
    keyed = soft = 0
    use_key = source.getchannel('A').getextrema()[0] == 255
    for red, green, blue, a in data:
        is_key = use_key and red >= 180 and blue >= 180 and green <= 140 and red-green >= 70 and blue-green >= 70
        if is_key and a:
            keyed += 1
        if 0 < a < ALPHA_THRESHOLD and not is_key:
            soft += 1
        alpha.append(255 if a >= ALPHA_THRESHOLD and not is_key else 0)
    mask = Image.new('L', source.size)
    mask.putdata(alpha)
    bounds = mask.getbbox()
    assert bounds and mask.getextrema() == (0, 255), 'Source needs foreground and transparent/key background.'
    cut = source.copy()
    cut.putalpha(mask)
    return cut, bounds, {'sourcePreserved': True, 'nativeBodyThreshold': ALPHA_THRESHOLD,
                        'binaryNativeAlpha': True, 'magentaKeyEnabled': use_key, 'magentaKey': {'redMin': 180, 'blueMin': 180, 'greenMax': 140, 'channelMinusGreenMin': 70},
                        'magentaPixelsExcluded': keyed, 'lowAlphaSourcePixelsExcluded': soft,
                        'rgbPainted': False, 'componentsRemoved': 0}


def source_guide(actor, image, bounds, measurement=None):
    guide = Image.new('RGBA', image.size, '#e7e2cd')
    guide.alpha_composite(image)
    draw = ImageDraw.Draw(guide)
    size = max(16, round(image.width / 45))
    for x in range(0, image.width, 100):
        draw.line((x, 0, x, image.height), fill='#34657d88', width=1)
        draw.text((x+3, 4), str(x), font=font(size), fill='#102e3d')
    for y in range(100, image.height, 100):
        draw.line((0, y, image.width, y), fill='#34657d88', width=1)
        draw.text((4, y+3), str(y), font=font(size), fill='#102e3d')
    draw.rectangle(bounds, outline='#ea8c1f', width=3)
    if measurement:
        px, py = measurement['sourcePivot']
        draw.rectangle(measurement['sourceSupportWitness'], outline='#d33234', width=3)
        draw.rectangle(measurement['headBounds'], outline='#7555b2', width=3)
        draw.line((px-30, py, px+30, py), fill='#d33234', width=3)
        draw.line((px, py-30, px, py+30), fill='#d33234', width=3)
        draw.line((bounds[0], measurement['bodyTopY'], bounds[2], measurement['bodyTopY']), fill='#258d5b', width=3)
    guide.convert('RGB').save(inside(f"review/{actor['slug']}-source-guide.png"))


def inspect(manifest):
    rows = []
    for actor in manifest['actors']:
        path = inside(actor['raw'])
        if not path.exists():
            rows.append({'id': actor['id'], 'status': 'raw-missing', 'raw': actor['raw']})
            continue
        source = Image.open(path).convert('RGBA')
        cut, bounds, policy = isolate(source)
        source_guide(actor, cut, bounds)
        rows.append({'id': actor['id'], 'slug': actor['slug'], 'sourceSize': list(source.size), 'sourceBounds': list(bounds),
                     'sourceSha256': sha(path), 'alphaPolicy': policy, 'status': 'requires-visual-foot-head-measurement'})
    write_json('review/source-inspection.json', {'actors': rows, 'artApproved': False})
    print(json.dumps(rows, ensure_ascii=False, indent=2))


def lineup(manifest):
    board = Image.new('RGB', (max(720, 12+(len(manifest['actors'])+1)*238), 480), '#102a25')
    draw = ImageDraw.Draw(board)
    draw.text((24, 16), 'VÂN HẢI · NPC PIXEL02 · V2', font=font(29, True), fill='#efdfb9')
    draw.text((24, 60), 'Neutral Đông Nam · 2× nearest · cùng mặt đất · tạo hình chờ duyệt', font=font(16), fill='#bbcfb9')
    items = [{'name': 'Vương Lâm', 'sprite': PLAYER, 'pivot': [32, 88], 'role': 'Pixel02 · basis'}]
    items += [{**a, 'sprite': inside(a['sprite'])} for a in manifest['actors']]
    for i, actor in enumerate(items):
        x, y, ground = 12 + i*238, 108, 333
        draw.rounded_rectangle((x, y, x+226, 458), radius=8, fill='#e5dfc9')
        frame = Image.open(actor['sprite']).convert('RGBA')
        frame = frame.resize((frame.width*2, frame.height*2), Image.Resampling.NEAREST)
        board.paste(frame, (x+113-actor['pivot'][0]*2, ground-actor['pivot'][1]*2), frame)
        draw.line((x+10, ground, x+216, ground), fill='#a7a18b')
        for text, yy, size, bold in [(actor['name'], 355, 23, True), (actor.get('role', 'NPC · candidate'), 397, 13, False)]:
            f = font(size, bold)
            bounds = draw.textbbox((0, 0), text, font=f)
            draw.text((round(x+113-(bounds[2]-bounds[0])/2), yy), text, font=f, fill='#294739')
    board.save(inside('review/lineup-2x.png'))


def pack(manifest):
    data = json.loads(inside('review/source-measurements.json').read_text(encoding='utf-8'))
    measurements = {a['id']: a for a in data['actors']}
    rows = []
    for actor in manifest['actors']:
        assert actor.get('direction', 'southeast') == 'southeast'
        assert actor['bodyHeightPx'] == 80
        assert actor['canvas'] in ([64, 96], [112, 96])
        assert actor['pivot'] == [actor['canvas'][0]//2, 88]
        measure = measurements[actor['id']]
        path = inside(actor['raw'])
        assert measure['sourceSha256'] == sha(path), f"Stale measurement: {actor['slug']}"
        assert measure['visuallyReviewed'] is True and len(measure['rootBasis']) > 20
        source = Image.open(path).convert('RGBA')
        isolated, bounds, policy = isolate(source)
        root = measure['sourcePivot']
        top = measure['bodyTopY']
        head = measure['headBounds']
        witness = measure['sourceSupportWitness']
        assert bounds[0] <= root[0] < bounds[2] and top < root[1] <= source.height
        assert witness[0] <= root[0] <= witness[2] and witness[1] <= root[1] <= witness[3]
        assert bounds[1] <= top < head[3] < root[1] and head[1] >= top
        scale = actor['bodyHeightPx'] / (root[1] - top)
        crop = isolated.crop(bounds)
        size = (round(crop.width*scale), round(crop.height*scale))
        native = crop.resize(size, Image.Resampling.NEAREST)
        native_root = [round((root[0]-bounds[0])*scale), round((root[1]-bounds[1])*scale)]
        dest = [actor['pivot'][0]-native_root[0], actor['pivot'][1]-native_root[1]]
        assert min(dest) >= 2, f"Insufficient top/left padding: {actor['slug']} {dest}"
        assert dest[0]+size[0] <= actor['canvas'][0]-2, f"Needs wider contract, not smaller body: {actor['slug']}"
        assert dest[1]+size[1] <= actor['canvas'][1]-2, f"Bottom clipping: {actor['slug']}"
        frame = Image.new('RGBA', tuple(actor['canvas']))
        frame.alpha_composite(native, tuple(dest))
        sprite = inside(actor['sprite'])
        assert sprite.parent == inside('sprites')
        sprite.parent.mkdir(parents=True, exist_ok=True)
        frame.save(sprite)
        native_bounds = list(frame.getchannel('A').getbbox())
        mapped_top = dest[1]+round((top-bounds[1])*scale)
        head_native = [dest[0]+round((head[0]-bounds[0])*scale), dest[1]+round((head[1]-bounds[1])*scale),
                       dest[0]+round((head[2]-bounds[0])*scale), dest[1]+round((head[3]-bounds[1])*scale)]
        rows.append({'id': actor['id'], 'slug': actor['slug'], 'status': 'concept-candidate', 'direction': 'southeast', 'pose': 'neutral',
                     'sourceSize': list(source.size), 'sourceBounds': list(bounds), 'sourcePivot': root, 'sourceSupportWitness': witness,
                     'bodyTopY': top, 'sourceHeadBounds': head, 'rootBasis': measure['rootBasis'], 'measurementNotes': measure.get('notes', ''),
                     'pivotStatus': 'concept-measured-pending-motion-review', 'sharedNeutralScale': scale,
                     'pixelsResampled': True, 'resampling': 'nearest-once', 'nativeCutoutSize': list(size),
                     'nativeCutoutRoot': native_root, 'canvasTranslation': dest, 'canvas': actor['canvas'], 'pivot': actor['pivot'],
                     'nativeBounds': native_bounds, 'bodyHeightPx': 80, 'measuredBodyHeightPx': actor['pivot'][1]-mapped_top,
                     'nativeHeadBounds': head_native, 'headToBodyRatio': (head[3]-head[1])/(root[1]-top),
                     'morphologyAssessment': measure.get('morphologyAssessment', 'pending-visual-review'),
                     'alphaPolicy': policy, 'sourceSha256': sha(path), 'spriteSha256': sha(sprite),
                     'promptSha256': sha(inside(actor['prompt'])), 'runtimeConsumable': False, 'artApproved': False, 'ownerApproved': False})
        source_guide(actor, isolated, bounds, measure)
    for actor, row in zip(manifest['actors'], rows):
        actor.update({'sourceDimensions': row['sourceSize'], 'sourceSha256': row['sourceSha256'],
                      'spriteSha256': row['spriteSha256'], 'promptSha256': row['promptSha256'],
                      'nativeRegistration': 'registration.json', 'sourcePivot': row['sourcePivot'],
                      'sharedNeutralScale': row['sharedNeutralScale'], 'pixelsResampled': True,
                      'anatomyStatus': row['morphologyAssessment'],
                      'visualLimitations': row['measurementNotes']})
    manifest['nativePacking'] = {'status': 'static-concept-only', 'registration': 'registration.json',
        'sourceMeasurements': 'review/source-measurements.json', 'alphaThreshold': ALPHA_THRESHOLD,
        'resampling': 'nearest-once', 'animationClips': 0, 'runtimeConsumable': False,
        'anatomyStatus': 'see-individual-measured-visual-assessment'}
    write_json('production.json', manifest)
    write_json('registration.json', {'schema': 'npc-concept-registration-2', 'date': '2026-10-13',
               'runtimeConsumable': False, 'artApproved': False, 'ownerApproved': False,
               'coverage': {'actors': len(rows), 'viewsPerActor': 1, 'posesPerActor': 1, 'animationClips': 0},
               'productionSha256AtPack': sha(inside('production.json')), 'measurementsSha256': sha(inside('review/source-measurements.json')),
               'approvedPlayerReference': {'file': str(PLAYER.relative_to(WORKSPACE)).replace('\\', '/'), 'sha256': sha(PLAYER),
                                           'canvas': [64, 96], 'pivot': [32, 88], 'bodyHeightPx': 80, 'modified': False},
               'headComparison': data['playerHeadComparison'], 'actors': rows})
    lineup(manifest)
    print(f'Packed {len(rows)} static NPC masters. No animation/runtime/ART approval.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inspect', action='store_true', help='Write source guides only; do not pack native sprites.')
    args = parser.parse_args()
    inside('review').mkdir(exist_ok=True)
    manifest = json.loads(inside('production.json').read_text(encoding='utf-8'))
    if args.inspect:
        inspect(manifest)
    else:
        pack(manifest)
