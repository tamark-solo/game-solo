"""Prepare explicitly assigned helper reservations; no image generation."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
assert not (ROOT/'plan.json').exists(), 'Reservation exists; never reset records after actual calls.'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
brief=PACK/'support/p5-next-family-briefs/chariot'
jobs=[]
for identity,directions in [('a',['north','northeast','east','southeast']),('b',['west','northwest'])]:
 for direction in directions:
  for group in ['damage','practice']:
   planned=brief/'prompts'/('chariot-'+identity+'-'+direction+'-'+group+'-planned.txt')
   jobs.append({'jobBase':'chariot-'+identity+'-'+direction+'-'+group,'familyId':'chariot','identityId':identity,
    'direction':direction,'group':group,'reservedBy':'root/banner_support_resume',
    'actorOwner':'root/banner_'+identity+'_resume','status':'reserved-awaiting-banner-checkpoint-and-own-chariot-view',
    'plannedBriefPrompt':planned.relative_to(PACK).as_posix(),'plannedBriefPromptSha256':sha(planned),
    'actualActorPrompt':None,'actualActorPromptSha256':None,'inputSnapshots':None,
    'actualOriginalPath':None,'rawSha256':None,'generationAllowed':False})
assert len(jobs)==12
plan={'schema':'chariot-foundation-helper-reservations-1','familyId':'chariot','jobs':jobs,
 'scope':'Support-only exact actor prompt/input snapshots, built-in ImageGen raw provenance and source assessment. No actor pack, roots, sockets, gear, FX, prior families or runtime writes.',
 'generationAllowed':False,'actualSources':0,
 'requiredGates':['Root Banner128 technical checkpoint exists and its pinned files verify.',
 'Actor owner supplies exact same-family/same-identity/same-view neutral PRIMARY input1 from a reviewed own Chariot core source, same-view Wang support input2 and selected own same-view Chariot raw input3.',
 'All three immutable snapshots and actual prompt SHA verify; helper views every input before calling built-in ImageGen with transparent_background true.',
 'Audit existing actor/helper original output, raw and records before a call; do not duplicate an actual call or infer success from a planned record.'],
 'plannedBriefs':{'briefSha256':sha(brief/'BRIEF.md'),'choreographySha256':sha(brief/'choreography.json')},
 'ownerApproved':False,'runtimeIntegrated':False}
(ROOT/'plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'reservedJobs':len(jobs),'actualSources':0,'generationAllowed':False,'planSHA':sha(ROOT/'plan.json')}))
