from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parent;V=R.parents[2];p=R/'generation.json';g=json.loads(p.read_text(encoding='utf-8'))
delta=''' Physical hand clarification mandatory: choose ONE anatomical dominant pole arm once in the six neutral keys; the same exact arm MUST keep CLOSED EMPTY gripping fingers through ALL30 poses. The opposite free arm ALONE seals and opens. NEVER join both palms in a two-hand seal, never swap holding arms, never open the pole hand during release. For AOE raise the SAME pole arm with CLOSED fist, opposite free arm alone opens/commands; recovery returns same pole arm to neutral. If rear view hides the fist, preserve visible closed grip just outside torso silhouette so separate shaft can attach. AT LEAST32px transparent outer margin beyond crown/boots/sleeves and24px gaps between every silhouette; first/last rows completely inside canvas. Six true run phases, no standing final run key. No colored fringe from reference.'''
for r in g['records']:
 if r['group']=='core' and r['status']!='generated' and not r.get('sha256') and r['id'].endswith('-r1'):
  q=V/r['prompt'];s=q.read_text(encoding='utf-8').rstrip()+'\n'+delta+'\n';q.write_text(s,encoding='utf-8');r['promptSha256']=hashlib.sha256(q.read_bytes()).hexdigest();r['promptClarification']='Physical one-arm pole continuity + opposite one-hand seals; revised BEFORE first tool call.'
p.write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Uncalled core prompts revised and hashed')
