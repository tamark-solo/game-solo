from pathlib import Path
from PIL import Image
import hashlib,json,shutil

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[6]
V1=REPO/'docs/design/characters/wang-lin-equipment-production-v1'
STANDARD=REPO/'docs/design/characters/van-hai-npc-visual-standard-v1'
DIRECTIONS={'north':'back facing upward, no visible face or eyes; back of silver ponytail and coat', 'northeast':'three-quarter BACK looking upper screen right; right-side sliver of face only, most back visible', 'east':'strict right profile looking screen right, one eye only', 'southeast':'three-quarter FRONT looking lower screen right, both eyes readable', 'south':'straight FRONT looking toward viewer, symmetrical face and chest', 'southwest':'three-quarter FRONT looking lower screen left, both eyes readable', 'west':'strict left profile looking screen left, one eye only', 'northwest':'three-quarter BACK looking upper screen left; left-side sliver of face only, most back visible'}
PILOT=['idle','run','cast-single-target','cast-aoe']
FOUNDATION=['hit','death','meditate','gather']
COMMON='Use case: identity-preserve. Asset type: production pixel-art BODY-ONLY animation source sheet. EXACT six columns by five rows, thirty equally spaced full-body cells. Large empty transparent gutters separate every row and column; do not overlap adjacent cells, no grid lines, labels or text. Image1 is PRIMARY approved Tịch Bạch identity: long silver-white high ponytail with two silver fringe locks, calm sharp eyebrows, ivory compact robe, muted jade inner collar and waist sash, charcoal cuffs, dark human boots. Preserve this face, hair, costume, relative head/torso proportions in every pose. Image2 is ONLY Wang live same-view pixel treatment/anatomy/camera support, NEVER its face/hair/clothes. Make genuinely transparent RGBA, crisp stepped pixel clusters and restrained palette. No weapon, scabbard, aura, smoke, glow, ghost, trail, shadow, platform, other entity or landscape. All hands empty, fingers and actual dark boot soles readable. A single fixed camera direction and standing scale throughout the entire sheet; bending, sitting, falling gets naturally shorter, NEVER resize each action to same bbox. Ground baseline stays within each cell. Keep full crown/ponytail/hands/feet away from cell edges. Row0: six repeated identical standing neutral calibrations, both hands down empty, actual boots unobscured. '
ROWS_PILOT='Row1: six ordered subtle idle breathing frames, completed loop with grounded boots and mostly steady hands. Row2: six true run cycle frames: right contact, pass, left contact, pass, push, return phase; distinct alternating legs/arms, not walking, ponytail/cloth follows. Row3: six single-target sword-command BODY frames: ready, focus/seal, brace/lock, dominant open-palm release toward facing direction, follow-through, COMPLETE standing recovery to neutral stance. Row4: six AOE sword-array BODY frames: brace, off-hand seal at chest, raise calling hand, open-palm commanding release, steady command, COMPLETE standing recovery to neutral stance with boots planted and knees straight. Weapon and FX are separate layers. Every cell truly follows the named camera direction across all actions, especially release/recovery. '
ROWS_FOUNDATION='Row1: six ordered hit-reaction frames: ready, small torso flinch, recoil, brace, unwind, COMPLETE standing recovery. Row2: six ordered death frames: hit recoil, knees buckle, one knee lowered, fall onto side, body settles on ground, final prone corpse. The head and silver hair remain attached to the same human body, never dissolving or disappearing; no blood, no duplicate body. Leave a WIDE horizontal cell for prone body and preserve same scale, do not crop fallen head/boot. Row3: six meditate frames: standing ready, fold knees, sit cross-legged, calm settled breathing, slight breathing, stable final cross-legged pose; no floating aura. Row4: six gather frames: standing ready, bend at waist, lower one knee, reach empty right hand toward ground in front of facing body, retrieve gesture with no visible item, COMPLETE standing recovery. Pose 6 of hit/gather is fully upright, not another crouch. Same camera orientation across standing, seated and prone action, no sudden view rotation. '

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run():
 assert not (ROOT/'generation.json').exists(),'Generation history already exists; prepare new version rather than overwrite'
 for folder in ('inputs','sources','prompts','review'): (ROOT/folder).mkdir(parents=True,exist_ok=True)
 shutil.copyfile(V1/'sources/body/sword-b.png',ROOT/'inputs/tich-bach-approved-master.png')
 for d in DIRECTIONS:
  shutil.copyfile(STANDARD/f'inputs/wang-lin-live-{d}-nearest8x.png',ROOT/f'inputs/wang-{d}-nearest8x.png')
 for d in ('north','southeast'):
  im=Image.open(V1/f'motion/frames/sword-b-{d}-idle/01.png').convert('RGBA')
  im.resize((im.width*8,im.height*8),Image.Resampling.NEAREST).save(ROOT/f'inputs/tich-bach-approved-{d}-nearest8x.png')
 records=[]
 for d,view in DIRECTIONS.items():
  for group in ('pilot','foundation'):
   if group=='pilot' and d in ('north','southeast'):continue
   id=f'sword-b-{d}-{group}'
   own=f'inputs/tich-bach-approved-{d}-nearest8x.png' if d in ('north','southeast') else 'inputs/tich-bach-approved-master.png'
   inputs=[own,f'inputs/wang-{d}-nearest8x.png']
   prompt=COMMON+(ROWS_PILOT if group=='pilot' else ROWS_FOUNDATION)+f'ALL thirty cells face {d.upper()}: {view}. This is a true newly drawn view of Tịch Bạch, not a horizontal mirror. Retain ivory coat/jade sash design from Image1 and read same view in Image2. Exactly 30 complete separate characters, 6 columns by 5 rows. One square large sprite sheet only, transparent background.'
   pp=ROOT/f'prompts/{id}.txt';pp.write_text(prompt+'\n',encoding='utf-8')
   records.append({'id':id,'identityId':'b','familyId':'sword','direction':d,'group':group,'actions':PILOT if group=='pilot' else FOUNDATION,'prompt':f'actors/b/sword/prompts/{id}.txt','promptSha256':sha(pp),'inputs':[{'file':'actors/b/sword/'+p,'sha256':sha(ROOT/p),'role':'approved own identity PRIMARY' if n==0 else 'Wang same-view style/anatomy only'} for n,p in enumerate(inputs)],'tool':'built-in-imagegen','transparentRequested':True,'layout':'6 columns ×5 rows: neutral6 +4actions6','raw':f'actors/b/sword/sources/{id}.png','status':'planned','selected':False})
 (ROOT/'generation.json').write_text(json.dumps({'schema':'equipment-body-generation-v2','identityId':'b','familyId':'sword','ownerApproved':False,'runtimeIntegrated':False,'records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'root':str(ROOT),'plannedSources':len(records),'plannedNewClips':sum(len(r['actions']) for r in records)}))

if __name__=='__main__':run()
