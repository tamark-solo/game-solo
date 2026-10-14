"""Read source provenance and pin this helper's review evidence only."""
from pathlib import Path
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[];sources=[]
def check(name,value):
    checks.append({'check':name,'passed':bool(value)})
    assert value,name
for rp in sorted((ROOT/'records').glob('*.json')):
    r=json.loads(rp.read_text(encoding='utf8'));job=r['id']
    check(job+': actual original exists',Path(r['actualOriginalPath']).is_file())
    check(job+': raw exact original bytes',sha(ROOT/r['raw'])==r['rawSha256']==sha(Path(r['actualOriginalPath'])))
    check(job+': exact stored upstream prompt',sha(ROOT/r['prompt'])==r['promptSha256']==sha(Path(r['upstreamPromptOriginal'])))
    for i in r['inputs']:
        check(job+': immutable input '+str(i['index']),sha(ROOT/i['file'])==i['sha256']==sha(Path(i['sourceSnapshot'])))
    check(job+': tool receipt',sha(ROOT/r['toolMetadata'])==r['toolMetadataSha256'])
    check(job+': layout receipt',sha(ROOT/r['sourceLayoutQA'])==r['sourceLayoutQASha256'])
    check(job+': true transparent requested',r['transparentRequested'] and r['tool']=='image_gen.imagegen')
    qa=json.loads((ROOT/r['sourceLayoutQA']).read_text(encoding='utf8'))
    check(job+': actual dimensions',list(Image.open(ROOT/r['raw']).size)==r['actualDimensions']==qa['actualSize'])
    check(job+': outer physical alpha128 clear',all(v==0 for v in qa['alpha']['outerPhysical128'].values()))
    check(job+': transparent pixels present',qa['alpha']['transparentPixels']>0)
    check(job+': nominal layout diagnostics only',qa['nominalNonEmptyCells']==18 and qa['automaticPassIsNotClaimed'])
    count=22 if job=='banner-b-northwest-damage-r1' else 18
    camera={'north':'Back view mainly own long hair/coat, tiny right ear/cheek edge like own neutral.',
       'northeast':'Rear-right quarter retained with tiny right cheek.',
       'east':'Right-facing one dominant eye but quarter-right anatomy like own neutral, rather than strict side profile; actor must assess the delta.',
       'southeast':'Front-right quarter with two front eyes, own Banner costume retained.',
       'west':'Left-facing one dominant eye like own B neutral, some front coat visible.',
       'northwest':'Rear-left/up-left view retains own corrected B NW identity.'}[r['direction']]
    layout='eight neutral, eight hit/recoil candidates, six death; first four rows have FOUR columns, final two have THREE' if count==22 else 'six neutral, six '+('hit, six death' if r['group']=='damage' else 'seated, six gather')
    sources.append({'id':job,'raw':r['raw'],'sha256':r['rawSha256'],'actualFiguresVisuallyCounted':count,
       'layout':layout,
       'cameraAssessment':camera+' Final view/source selection belongs to owning actor worker.',
       'bodyCompleteness':'Full crown/hair/body/boot extent visually present, including prone terminal; final cell segmentation and alpha component review still required.',
       'choreographyNote':'Hit upright recovery and lying death terminal present.' if r['group']=='damage' else
          ('Gather N starts bent/reaching and then kneel/retrieve/rise; actor may reorder actual keys, no cloned six-key claim.' if r['direction']=='north' else 'Gather NE includes ready/reach/retrieve/kneel/rise/upright; seated row is fully seated.'),
       'sourceSelectedByHelper':False,'actorSocketsOrRootsClaimed':False,'ownerApproved':False,'runtimeIntegrated':False})
out={'schema':'banner-foundation-helper-source-assessment-1','passed':True,'checks':len(checks),'results':checks,'sources':sources,
     'actualRawSources':len(sources),'actualSourceFigures':sum(s['actualFiguresVisuallyCounted'] for s in sources),
     'canonicalCoverageClaimed':0,'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'qa/assessment.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
pins=[]
for p in sorted(ROOT.rglob('*')):
    if p.is_file() and p.name!='delivery.json' and '__pycache__' not in p.parts:
        pins.append({'file':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size})
delivery={'schema':'banner-foundation-helper-delivery-1','checks':len(checks),'actualRawSources':len(sources),
    'actualSourceFigures':out['actualSourceFigures'],'canonicalCoverageClaimed':0,'pins':pins,'ownerApproved':False,'runtimeIntegrated':False,
    'limitations':['Pinning/source checks are not ART approval or final body registration.',
       'Actors A/B own source selection, actual scale/sourceRects, all palm/socket/root/lift and canonical packing.']}
(ROOT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'sources':len(sources),'sourceFigures':out['actualSourceFigures'],'checks':len(checks),'pins':len(pins),'deliverySHA':sha(ROOT/'delivery.json')}))
