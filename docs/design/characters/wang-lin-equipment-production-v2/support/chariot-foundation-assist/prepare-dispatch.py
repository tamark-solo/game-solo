"""Stage exact reserved actor inputs after prerequisite technical checkpoints."""
from pathlib import Path
import hashlib,json,sys
ROOT=Path(__file__).resolve().parent;PACK=ROOT.parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for family in ('sword','banner'):
 checkpoint=PACK/'checkpoints'/(family+'.json')
 assert checkpoint.exists(), family+' technical checkpoint is not yet available.'
 d=json.loads(checkpoint.read_text(encoding='utf8'))
 assert d['familyId']==family and d['status']=='technical-review-ready' and d['coverage']['bodyClips']==128
 for pin in d['files']:assert sha(PACK/pin['file'])==pin['sha256'], 'Prerequisite checkpoint hash changed: '+pin['file']
# Reuse the exact snapshot copier, with a separate call ledger. It writes only
# this support directory, refuses existing records, verifies source prompt/input
# hashes and requires the actor's reviewed same-view neutral dependency.
original=ROOT.parent/'banner-foundation-assist/prepare.py'
code=original.read_text(encoding='utf8').replace('banner','chariot')
code=code.replace('chariot_support_resume','banner_support_resume')
code=code.replace("planPath=ROOT/'plan.json'", "planPath=ROOT/'call-plan.json'")
exec(compile(code,str(ROOT/'prepare-dispatch.py'),'exec'),{'__file__':str(ROOT/'prepare-dispatch.py'),'__name__':'__main__'})
