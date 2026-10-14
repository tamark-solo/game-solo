from pathlib import Path
import json,shutil,copy,hashlib
R=Path(__file__).resolve().parent;V=R.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
g=json.loads((R/'generation.json').read_text(encoding='utf-8'));old=next(r for r in g['records'] if r['id']=='banner-b-southwest-core-r2')
old.update(selected=False,status='superseded-source-clipping',rejection='Correct left camera, but bottom AOE row actual dark soles intersects raw edge alpha128145 pixels. Preserve raw; native padding cannot restore missing feet.')
sid='banner-b-southwest-core-r3';assert not any(r['id']==sid for r in g['records'])
r=copy.deepcopy(old);r.update(id=sid,status='prepared-correction',selected=False,supersedes=old['id'],raw=f'actors/b/banner/sources/{sid}.png')
for key in ['original','sha256','size','mode','sourceViewed','rawImmutable','rejection']:r.pop(key,None)
prompt='''FRAMING correction only. Image1 is own Tịch Bạch Banner Southwest animation identity/outfit/edit target PRIMARY. Keep genuine SOUTHWEST front-LEFT down-left camera, face, silver high ponytail, ivory-charcoal-plum ritual robe with three seal panels, dark boots, pose choreography, every action and all30 cells. Image2 only Wang same-view anatomy/pixel/camera support; Image3 own Banner identity/outfit support. Do not mirror or copy Wang face.
Recompose the same 6 columns by5 rows of30 WHOLE figures on a LARGE SQUARE TRANSPARENT RGBA sheet. Current bottom AOE boots are cut off: redraw COMPLETE actual boots/soles on every cell, make all figures uniformly 20% SMALLER within roomy cells, with at least80px empty outer margin at ALL four sheet edges, especially below bottom boots, and at least28px clear gaps between figures including wide sleeves and hair. Entire sheet contents must fit comfortably inside canvas, never touch any edge. Preserve one common standing body scale across poses, not individual pose scaling. No graphics, labels, floor, shadow, embedded pole/banner/weapon, FX.
Rows: six neutral; six idle same closed empty near-front fist for separate pole; six true running phases all stride not standing, same fist; six ST ready then planted-pole chestseal/brace/open LEFT command/maintain/full upright recovery; six AOE ready then planted-pole twohands seal/raisecommand/open LEFT command/maintain/full upright recovery. Cast uses empty open/clasp hands, separate pole planted on ground from charge. Every frontLEFT face/recovery remains LEFT. Highest priority restore whole bottom-row feet with generous empty margin and intact whole-body framing.'''
p=R/'prompts'/f'{sid}.txt';p.write_text(prompt+'\n',encoding='utf-8');r.update(prompt=f'actors/b/banner/prompts/{sid}.txt',promptSha256=sha(p))
inputs=[]
for i,(path,role) in enumerate([(V/old['raw'],'own-same-identity-banner-SW-edit-target-PRIMARY'),(V/old['inputs'][1]['file'],'Wang-SW-camera-style-anatomy-only'),(V/old['inputs'][2]['file'],'own-approved-B-banner-P1-identity-outfit-support')],1):
 t=R/'inputs/core'/sid/f'{i}.png';t.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,t);inputs.append({'file':str(t.relative_to(V)).replace('\\','/'),'sha256':sha(t),'original':str(path),'role':role})
r['inputs']=inputs;g['records'].append(r);(R/'generation.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(sid)
