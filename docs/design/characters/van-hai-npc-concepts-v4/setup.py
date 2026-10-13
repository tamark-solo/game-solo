"""Prepare authored identity briefs and actual image inputs; no generation."""
from pathlib import Path
import hashlib
import json
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V3 = BASE / 'van-hai-npc-concepts-v3'
WORKSPACE = ROOT.parents[3]
assert not any((ROOT / 'raw').glob('*.png')), 'Setup cannot overwrite a pack that already has generated sources.'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

for folder in ['inputs', 'prompts', 'specs', 'plans', 'raw', 'review']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)

approval = {
    'schema': 'npc-morphology-style-approval-1', 'date': '2026-10-13',
    'actorId': 'NPC-HN-GUIDE',
    'ownerFeedback': 'bản v3 của Trần Duy nhìn giống với tỷ lệ và cocept của vương lâm trong game',
    'scope': 'neutral southeast ratio and concept style',
    'morphologyStyleApproved': True, 'fullNeutralMasterArtApproved': False,
    'animationApproved': False, 'runtimeApproved': False,
    'pinnedFiles': [{'file': n, 'sha256': sha(V3 / n)} for n in ['raw/tran-duy.png', 'sprites/tran-duy.png', 'prompts/tran-duy.txt', 'production.json', 'registration.json']],
    'basisUse': 'Human proportions and pixel treatment for subsequent NPC neutral concepts; each identity follows the owner plan.'
}
save(V3 / 'style-approval.json', approval)

for source, name in [(V3 / 'sprites/tran-duy.png', 'tran-duy-v3-native.png'), (V3 / 'inputs/pixel02-southeast-native.png', 'pixel02-southeast-native.png'), (V3 / 'inputs/pixel02-southeast-nearest8x.png', 'pixel02-southeast-nearest8x.png')]:
    shutil.copy2(source, ROOT / 'inputs' / name)
image = Image.open(V3 / 'sprites/tran-duy.png')
image.resize((image.width * 8, image.height * 8), Image.Resampling.NEAREST).save(ROOT / 'inputs/tran-duy-v3-nearest8x.png')

plan_path = WORKSPACE / 'docs/design/world/van-hai-living-world-v1/plan.json'
roster = json.loads(plan_path.read_text(encoding='utf-8'))['npcs']
identities = [
    ('NPC-HN-CULTIVATION', 'diep-tinh', 'an elderly woman cultivation teacher, visible mature eye lines, softly aged face and calm patient expression. Remove all male moustache and beard. Compact salt-and-pepper hair bun. Ivory and smoky jade robe, tiny jade beads and a closed bamboo scroll held near abdomen. She must read as an elderly woman, never a teen or young silver-haired heroine.'),
    ('NPC-HN-TRAINING', 'ta-kiem-son', 'a male martial teacher around forty, disciplined fair expression, short dark tied hair, a small eyebrow scar, dark navy robe, cloth-wrapped wrists and a worn wooden training sword pointing down beside the body. Keep the wooden sword small and readable, no giant sword or heavy armor. Mature face without making the head smaller; weight rests on one planted foot.'),
    ('NPC-HN-PREPARATION', 'to-nhuoc', 'an adult woman quartermaster, composed attentive face, dark hair tied neatly, muted jade robe and ivory cloth apron, a small tied account book with earthy red cord, a slim brush and a tiny sealed case near the waist. Remove all male moustache and beard. Keep professional props compact; no oversized book and no child face.')
]
actors = []
for ident, slug, identity in identities:
    npc = next(n for n in roster if n['id'] == ident)
    shutil.copy2(BASE / 'van-hai-npc-concepts-v1/raw' / f'{slug}.png', ROOT / 'inputs' / f'{slug}-identity-v1.png')
    prompt = (
        'Use case: style-transfer. Asset: one static neutral NPC sprite concept for Van Hai Dao Do. '
        'EDIT IMAGE 1, the owner-confirmed Tran Duy v3 human proportions template, enlarged exactly 8x with nearest sampling. '
        'Preserve its compact chibi head-to-body ratio, short torso and legs, shoulder width, large readable pixel clusters, standing foot level, and orthographic southeast/down-right camera. '
        'Change ONLY identity, hair, gender, age, clothes and small profession props as specified below. '
        'IMAGE 2 is Wang Lin Pixel02 currently in game, supporting pixel treatment and large head proportions. '
        'IMAGE 3 is the previous identity/costume concept ONLY; IGNORE its tall thin anatomy, pose, fine shading and detailed illustration style.\n'
        'Subject: ' + identity + '\n'
        'The NPC must appear made by the same pixel artist as images 1 and 2. Head and main hair about half the standing height; preserve mature identity with the large chibi head. '
        'Whole character and boots visible, relaxed neutral stance facing screen down-right. Simplify clothes and props into coarse clean low-resolution pixel shapes and broad three-tone material clusters. '
        'Target logical 64x96 body canvas, nominal standing height80 world pixels and foot(32,88); do not fill this frame with tall anatomy. '
        'Render as an integer enlargement, no subpixel painterly detail or smoothing. One character only, genuinely transparent RGBA background with generous padding. '
        'No floor, cast shadow, halo, haze, glow, light bloom, text, grid, scene, FX or sheet. Body and hand-held props form a static identity concept for review; this is not animation or runtime approval.\n'
    )
    (ROOT / 'prompts' / f'{slug}.txt').write_text(prompt, encoding='utf-8')
    save(ROOT / 'specs' / f'{slug}.json', {'assetType': 'character-concept', 'name': f'vn-npc-{slug}-pixel-v4', 'size': '1024x1536', 'quality': 'high', 'n': 1, 'prompt': prompt})
    actors.append({'id': ident, 'slug': slug, 'name': npc['name'], 'role': npc['role'], 'zone': npc['zone'], 'raw': f'raw/{slug}.png', 'prompt': f'prompts/{slug}.txt', 'sprite': f'sprites/{slug}.png', 'canvas': [64, 96], 'pivot': [32, 88], 'bodyHeightPx': 80, 'direction': 'southeast', 'pose': 'neutral', 'status': 'concept-candidate', 'artApproved': False, 'ownerApproved': False, 'runtimeImplemented': False, 'animationProduced': False, 'referenceMode': 'Tran Duy v3 edit template first, live Pixel02 second, old costume identity third', 'references': ['inputs/tran-duy-v3-nearest8x.png', 'inputs/pixel02-southeast-nearest8x.png', f'inputs/{slug}-identity-v1.png']})

save(ROOT / 'production.json', {'schema': 'van-hai-npc-concepts-4', 'id': 'VH-NPC-CONCEPTS-04', 'date': '2026-10-13', 'sourcePlan': plan_path.relative_to(WORKSPACE).as_posix(), 'sourcePlanSha256': sha(plan_path), 'directionsProduced': ['southeast'], 'directionsPending': ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east'], 'generator': 'project-router-gpt-image-2-edit', 'skill': 'docs/skills/game-actor-animation-production/SKILL.md', 'status': 'neutral-concepts-candidate', 'runtimeConsumable': False, 'artApproved': False, 'ownerApproved': False, 'morphologyStyleBasis': {'file': '../van-hai-npc-concepts-v3/style-approval.json', 'sha256': sha(V3 / 'style-approval.json'), 'scope': approval['scope']}, 'actors': actors})
save(ROOT / 'inputs/references.json', {'inputOrder': ['Tran Duy v3 nearest8x edit template', 'live Pixel02 nearest8x pixel style', 'old actor identity for clothes only'], 'images': [{'path': p.name, 'sha256': sha(p)} for p in (ROOT / 'inputs').glob('*.png')], 'scope': 'actual multipart image input, no text-only style reference'})
print('Pinned v3 ratio/style feedback and prepared three v4 specs with actual references.')
