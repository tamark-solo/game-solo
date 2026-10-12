"""Extract only monster/boss members into a new version; never restore old pipeline."""
import pathlib, zipfile, json, hashlib
root=pathlib.Path(__file__).resolve().parents[1]
archive=root/'docs/archive/actor-animation-pre-pixel02-2026-10-12'
dest=root/'docs/design/characters/sect-encounter-actors-v2'
manifest=json.loads((archive/'manifest.json').read_text(encoding='utf-8-sig'))
prefix='docs/design/characters/actor-animation-production-v1/'
records=[]
with zipfile.ZipFile(archive/'sources.zip') as z:
 for item in manifest['entries']:
  path=item['path']
  pilot='docs/design/characters/actor-animation-pilot-v1/'
  pilot_input=path.startswith(pilot) and '/' not in path[len(pilot):] and path[len(pilot):].startswith(('wolf-','boss-'))
  keep=pilot_input or path.startswith(prefix) and (path[len(prefix):] in ['catalog.json','source-registration.json','production-plan.json'] or any(f'/{actor}' in path for actor in ['wolf','boss']))
  if not keep: continue
  data=z.read(path)
  assert hashlib.sha256(data).hexdigest()==item['sha256']
  relative=('reference-subset/pilot-inputs/'+path[len(pilot):]) if pilot_input else 'reference-subset/'+path[len(prefix):]
  target=dest/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  records.append({'archiveMember':path,'file':relative,'sha256':item['sha256']})
 (dest/'archive-provenance.json').write_text(json.dumps({'archiveSha256':manifest['archiveSha256'],'purpose':'selected monster/boss inputs for new runtime pack; historical ART approval unchanged','records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'extracted':len(records),'destination':str(dest)},ensure_ascii=False))
