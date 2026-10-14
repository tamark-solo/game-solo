from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parent;V=R.parents[2];p=R/'generation.json';g=json.loads(p.read_text(encoding='utf-8'))
delta=''' Final explicit physical choreography: anatomical LEFT arm is the POLE ARM in every neutral/idle/run/ST/AOE cell. LEFT hand stays CLOSED EMPTY fist near own waist/lower chest, never opens and never joins a seal. Anatomical RIGHT is the FREE COMMAND ARM: it alone makes chest seal, raises above shoulder, then opens forward in ST/AOE release. This overrides earlier generic raised dominant-hand instruction: keep LEFT pole fist stable and raise RIGHT command arm for AOE. Even behind-view show LEFT closed fist just outside own left waist silhouette. Both arms distinct. Same exact arm roles through all30 sprites, no weapon/shaft object drawn.'''
for r in g['records']:
 if r['group']=='core' and r['direction'] in ['west','northwest'] and not r.get('sha256'):
  q=V/r['prompt'];s=q.read_text(encoding='utf-8').rstrip()+'\n'+delta+'\n';q.write_text(s,encoding='utf-8');r['promptSha256']=hashlib.sha256(q.read_bytes()).hexdigest();r['choreographyDelta']='LEFT pole arm low/closed continuous; RIGHT free arm alone raises/seals/opens. Updated before tool call after SE/N observed physical command gesture.'
p.write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Four uncalled owned core prompts revised and hashed')
