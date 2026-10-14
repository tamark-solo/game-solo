from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent
p=ROOT/'generation.json';gen=json.loads(p.read_text(encoding='utf-8'))
for r in gen['records']:
 if r['status']!='planned' or r['direction'] not in ('west','northwest','southwest'):continue
 pp=ROOT/'prompts'/f"{r['id']}.txt";text=pp.read_text(encoding='utf-8')
 text+='\nCRITICAL CAMERA: Image1 gives IDENTITY ONLY, rotate that identity to the LEFT-facing camera in Image2. Every neutral, idle, running, cast, hit, sitting and falling cell turns head/nose/chest/knees/toes LEFT consistently. Long silver hair trails to screenRIGHT behind skull. NEVER retain the right-facing camera of Image1. '
 if r['direction']=='west':text+='STRICT LEFT PROFILE: one left-facing eye/nose outline, narrow side of chest, aligned shoulders, not front3/4. '
 if r['direction']=='northwest':text+='BACK LEFT 3/4: back of silver ponytail and coat dominant, only a small face sliver at LEFT edge, no front chest/eyes. '
 text+='Newly DRAW true view, not pixel mirroring.\n';pp.write_text(text,encoding='utf-8');r['promptSha256']=hashlib.sha256(pp.read_bytes()).hexdigest()
p.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
