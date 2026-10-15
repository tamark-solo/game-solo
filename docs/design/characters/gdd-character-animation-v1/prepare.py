"""Create the resumable new-GDD animation queue from the 18 approved neutrals."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import shutil

R = Path(__file__).resolve().parent
W = R.parents[3]
C = R.parent / 'gdd-character-concepts-v1'
assert not (R / 'production-plan.json').exists(), 'Resume the existing queue instead of recreating it'
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
write = lambda p, d: p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
approval = read(C / 'approval.json')
for pin in approval['targets']:
    assert sha(C / pin['file']) == pin['sha256'], pin['file']
actors = read(C / 'manifest.json')['records']
directions = ['southeast', 'north', 'south', 'southwest', 'west', 'northwest', 'northeast', 'east']
views = {
    'southeast': 'FRONT THREE QUARTER facing screen lower-right; keep this exact camera throughout every action.',
    'south': 'STRICT FRONT facing screen-down; front of face and chest, symmetric camera, two eyes; no left profile in any row.',
    'southwest': 'FRONT THREE QUARTER facing screen lower-left, including all windup and release poses.',
    'west': 'LEFT PROFILE facing screen-left throughout all rows, never turn to front for casting.',
    'northwest': 'REAR THREE QUARTER facing screen upper-left; back of head/torso throughout, face largely occluded.',
    'north': 'STRICT REAR facing screen-up. Back of head and torso in ALL 9 rows. NO face, eyes or frontal chest in attacks, meditation or gathering.',
    'northeast': 'REAR THREE QUARTER facing screen upper-right; back of head/torso throughout, face largely occluded.',
    'east': 'RIGHT PROFILE facing screen-right throughout all rows, never turn to front for casting.',
}
action_text = {
    'idle': 'Six subtle breathing/rest phases with changing hair/sleeves and planted boots; last flows into first. Keep skull and torso constant.',
    'run': 'Six real running footfalls: left contact, compression, flight, right contact, compression, flight. Opposite arm/leg swing, bent knees, changing feet, robe lag. Never six standing poses. Same run for normal/Shift.',
    'move': 'Six purposeful gait phases with actual alternating supports; preserve the own actor anatomy. Spirit drifts with curling intrinsic lower ribbons rather than human footsteps.',
    'hit': 'Neutral, small recoil, largest recoil, rebound, settle, neutral. Actual torso response; boots remain credible, no sparks.',
    'death': 'Struck, buckle knees/support, kneel or collapse, fall onto near side, resting body, final settled corpse. Last TWO lie on the ground, never stand up again. Spirit settles into its own intrinsic remnant without external particles.',
    'meditate': 'Stand ready, lower body, settle cross-legged, palms close to lap, quiet seated breath, seated settled hold. Seated height naturally lower, never enlarge the head.',
    'gather': 'Ready, bend knees, lean down, empty hand reaches low at side, take and rise, standing recovery. Nothing gathered is drawn into the body sheet.',
    'cast-single-target': 'Standing ready, draw empty hands to chest, compact hand seal charge, one empty palm extends toward facing vector, recoil, fully standing recovery. Body gesture only; no weapon/projectile/glow.',
    'cast-aoe': 'Ready, ground both boots, draw two empty hands in, open both arms for domain command, lower arms, fully standing recovery. No circle/domain/ghost/light in the body pixels.',
    'talk': 'Six small speaking phases, restrained mouth/head motion and own identity, planted support; hands stay anatomically coherent. No speech bubbles.',
    'point': 'Ready, glance toward facing, raise near empty hand, indicate path with forefinger, lower hand, neutral recovery. No additional prop.',
    'profession': 'Six phases of a restrained own profession gesture, matching the approved appearance and GDD role; no new held props or FX. Read/inspect palms for archivist, beckon a beast for keeper, serve with empty hands for tea host, check side satchel for messenger.',
    'alchemy': 'Ready, draw empty hands inward, small two-hand seal, lower both palms toward an off-body furnace, release tension, ready. No flames, furnace, aura or floating pills baked into the body.',
    'attack': 'Ready, draw own attack arm(s) back, visibly load weight, forward strike/palm point in own facing, recoil, ready. Empty hands when weapon/prop will be a separate layer.',
    'appear': 'Six corporeal posture phases: lowered/contracted own body, gradually straighten, raise head, establish support, ready, ready hold. Keep intrinsic spirit alpha; no portal or outer smoke in body.',
}
group_actions = {
    'main': ['idle', 'run', 'hit', 'death', 'meditate', 'gather', 'cast-single-target', 'cast-aoe'],
    'main-future': ['idle', 'run', 'hit', 'death', 'meditate', 'gather', 'cast-single-target', 'cast-aoe'],
    'story': ['idle', 'talk', 'point', 'move'],
    'story-future': ['idle', 'talk', 'point', 'move'],
    'npc': ['idle', 'move', 'talk', 'profession'],
    'mob-stage2': ['idle', 'move', 'attack', 'hit', 'death'],
    'boss-stage2': ['idle', 'move', 'attack', 'hit', 'death', 'appear', 'cast-single-target', 'cast-aoe'],
}
ordered_groups = ['main', 'main-future', 'story', 'story-future', 'npc', 'mob-stage2', 'boss-stage2']
actors.sort(key=lambda a: (ordered_groups.index(a['group']), a['id']))
for name in ['inputs', 'prompts', 'sources', 'review']:
    (R / name).mkdir(parents=True, exist_ok=True)
jobs = []
for actor in actors:
    actions = list(group_actions[actor['group']])
    if actor['id'].startswith('li-muwan'):
        actions[2] = 'alchemy'
    own = R / 'inputs' / (actor['id'] + '.png')
    original = C / actor['file']
    # Integer nearest enlargement is a reference snapshot, not repainted artwork.
    image = Image.open(original).convert('RGBA')
    image.resize((image.width * 8, image.height * 8), Image.Resampling.NEAREST).save(own)
    for direction in directions:
        job_id = actor['id'] + '-' + direction
        player_original = R.parent / 'van-hai-npc-visual-standard-v1' / 'inputs' / ('wang-lin-live-' + direction + '-nearest8x.png')
        player = R / 'inputs' / ('wang-' + direction + '.png')
        if not player.exists():
            shutil.copyfile(player_original, player)
        npc_primary = actor['group'] == 'npc'
        input_paths = [player, own] if npc_primary else [own, player]
        inputs = []
        for index, path in enumerate(input_paths, 1):
            orig = original if path == own else player_original
            inputs.append({'file': path.relative_to(R).as_posix(), 'sha256': sha(path), 'original': orig.relative_to(W).as_posix(), 'originalSha256': sha(orig), 'index': index,
                           'role': 'own-approved-identity/outfit' if path == own else 'Wang-same-view-pixel/anatomy-reference', 'nearestIntegerEnlargement': 8 if path == own else 1})
        own_index = 2 if npc_primary else 1
        player_index = 1 if npc_primary else 2
        rows = [f'ROW {row}: {action.upper()} — {action_text[action]}' for row, action in enumerate(actions, 2)]
        prompt = f'''Use case: stylized-concept / identity-preserve.
Asset: real directional pixel-chibi body animation sheet for {actor['name']}.
Image {own_index}: APPROVED own southeast identity/outfit, PRIMARY identity and proportions. Preserve own face/skull, hair silhouette, age, body build, palette, clothing/accessories exactly while rotating into the requested view. Image {player_index}: Wang live SAME REQUESTED VIEW, pixel/camera support only for main/story/monsters; NPC human anatomy/style PRIMARY only, never Wang identity or costume. Do not substitute retired GDD artwork.
Requested camera: {views[direction]}
Exactly SIX COLUMNS by {len(actions)+1} ROWS, {6*(len(actions)+1)} complete isolated poses on genuinely transparent RGBA. Tall sheet with enough width for a fallen body, equal cell origins, at least 24px empty transparent gutters, generous outer alpha margin. NO labels/grid/background/shadow. Coarse crisp pixel clusters/stepped contours and limited shade bands matching the reference; no 3D or smooth illustration.
ROW 1: six identical standing neutral calibration poses in requested view, same skull/head/body size as approved own master. Neutral body will be {actor['bodyNominalPx']} native px after ONE common factor for the entire source. Keep that exact size throughout all actions; NEVER scale each action to fill its cell.
{chr(10).join(rows)}
Body/outfit ONLY. No held weapons, magic orb, chariot, banner, floating talisman, trail, particles, light, warning circle or separate shadow. Costume marks, side satchel and own attached ornaments remain. Hands/boots entirely inside cells. Floor/support at 82 percent of cell height, do not vertically center seated/dead bodies. Natural action height is allowed; keep skull constant, face never grows in casting/death. Real {direction} anatomy and occlusion in every row, not mirrored imagery. Last recovery and first neutral share own proportions.
'''
        prompt_path = R / 'prompts' / (job_id + '-r1.txt')
        prompt_path.write_text(prompt, encoding='utf-8')
        jobs.append({'id': job_id, 'actorId': actor['id'], 'name': actor['name'], 'group': actor['group'], 'direction': direction, 'bodyNominalPx': actor['bodyNominalPx'], 'actions': actions,
                     'grid': [6, len(actions)+1], 'prompt': prompt_path.relative_to(R).as_posix(), 'promptSha256': sha(prompt_path), 'inputs': inputs,
                     'source': 'sources/' + job_id + '-r1.png', 'status': 'planned', 'artApproved': False, 'motionApproved': False, 'runtimeReady': False})
pins = [{'file': p.relative_to(W).as_posix(), 'sha256': sha(p)} for p in [C / 'approval.json', C / 'manifest.json', C / 'registration.json', W / 'docs/GDD.md', W / 'docs/STAGE-ART-AND-LOGIC-SPEC-2026-10-14.md']]
pins += [{'file': (C / x['file']).relative_to(W).as_posix(), 'sha256': x['sha256']} for x in approval['targets']]
write(R / 'basis.json', {'schema': 'gdd-character-animation-basis-1', 'date': '2026-10-15', 'files': pins, 'approvedNeutrals': 18, 'retiredArtworkUsed': False})
write(R / 'production-plan.json', {'schema': 'gdd-character-animation-plan-1', 'date': '2026-10-15', 'authorization': 'Owner requests all 8 real directions and animation: main first, then story, NPC, mobs, bosses.', 'order': ordered_groups, 'actors': [{**a, 'actions': group_actions[a['group']]} for a in actors], 'directions': directions,
    'targetSources': len(jobs), 'targetBodyClips': sum(len(j['actions']) for j in jobs), 'targetBodyKeys': sum(len(j['actions'])*6 for j in jobs), 'mainMilestoneII': 'Read-only existing equipment V2, not regenerated here',
    'gearAndExternalFx': 'Separate later scope; no FX/gear completeness inferred from empty-hand body casts', 'runtimeIntegrated': False, 'ownerMotionApprovalInferred': False})
write(R / 'generation.json', {'schema': 'gdd-character-animation-generation-1', 'tool': 'built-in-imagegen', 'jobs': jobs})
write(R / 'progress.json', {'schema': 'gdd-character-animation-progress-1', 'date': '2026-10-15', 'status': 'source-production-started', 'activeWave': 'main', 'targetSources': len(jobs), 'targetBodyClips': sum(len(j['actions']) for j in jobs), 'generatedSources': 0, 'packedBodyClips': 0, 'runtimeIntegrated': False})
print(json.dumps({'sourceJobs': len(jobs), 'targetClips': sum(len(j['actions']) for j in jobs), 'mainClips': sum(len(j['actions']) for j in jobs if j['group'].startswith('main')), 'baselinePins': len(pins)}))
