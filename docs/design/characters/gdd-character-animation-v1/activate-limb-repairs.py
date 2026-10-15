"""Prepare and finalize a recoverable replacement; filesystem moves use PowerShell."""
from pathlib import Path
import json,hashlib,copy,sys
from PIL import Image
from source_tools import components,rows_of
R=Path(__file__).resolve().parent;W=R.parents[3]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
archive=R/'history/limb-audit-r1'
repairs={
 'tich-bach-entry-run-north':'tich-bach-entry-north-run-limbs-r1',
 'huyen-tam-entry-run-northwest':'huyen-tam-entry-northwest-run-limbs-r3',
 'tich-bach-domain-run-north':'tich-bach-domain-north-run-limbs-r3',
 'huyen-tam-domain-run-west':'huyen-tam-domain-west-run-limbs-r3',
 'huyen-tam-entry-cast-aoe-south':'huyen-tam-entry-south-aoe-hands-r3',
 'tich-bach-entry-cast-aoe-south':'tich-bach-entry-south-aoe-hands-r2',
}
ledger=read(R/'generation.json');m=read(R/'manifest.json')
if sys.argv[1]=='prepare':
 assert not (archive/'manifest.json').exists(),'Already prepared; do not overwrite history'
 for id in repairs.values():
  j=next(j for j in ledger['jobs'] if j['id']==id);im=Image.open(R/j['source']).convert('RGBA');assert sha(R/j['source'])==j['sourceSha256']
  large=[p for p in components(im) if p['large']];cols,nrows=j['grid'];rows=rows_of(large,nrows,im.height)
  assert len(rows)==nrows and all(len(row)==cols for row in rows),id+' incomplete regions'
  assert all(p['box'][0]>0 and p['box'][1]>0 and p['box'][2]<im.width and p['box'][3]<im.height for p in large),id+' source edge'
 old=[copy.deepcopy(c) for c in m['clips'] if c['id'] in repairs]
 archive.mkdir(parents=True,exist_ok=True)
 write(archive/'manifest.json',{'status':'superseded-motion-limb-audit','reason':'Preserve original five active clips before five replacements and one missing-run completion','clips':old,'replacedBy':repairs,'originalManifestSha256':sha(R/'manifest.json')})
 moves=[]
 for c in old:
  for rel in [f"frames/{c['id']}",c['atlas']['file'],f"review/{c['id']}-contact.png"]:
   moves.append({'source':str(R/rel),'destination':str(archive/rel)})
 write(archive/'move-plan.json',{'intendedRoot':str(R),'archiveRoot':str(archive),'moves':moves})
 print(json.dumps({'oldClips':len(old),'moves':len(moves),'newSources':len(repairs)}))
elif sys.argv[1]=='finalize':
 historical=read(archive/'manifest.json')
 for c in historical['clips']:
  for f in c['frames']:assert sha(archive/f['file'])==f['sha256']
  assert sha(archive/c['atlas']['file'])==c['atlas']['sha256']
  assert not (R/c['frames'][0]['file']).exists(),'Old active frame still present'
  j=next(j for j in ledger['jobs'] if j['id']==c['sourceJob']);j.setdefault('excludedActions',[])
  if c['action'] not in j['excludedActions']:j['excludedActions'].append(c['action'])
  j.setdefault('supersededActions',{})[c['action']]={'reason':'limb-audit-r1','replacement':repairs[c['id']],'history':'history/limb-audit-r1/manifest.json'}
  s=next(s for s in m['sources'] if s['id']==c['sourceJob']);s['excludedActions']=j['excludedActions'];s['acceptedActions']=[a for a in s['acceptedActions'] if a!=c['action']]
 for clipid,id in repairs.items():
  j=next(j for j in ledger['jobs'] if j['id']==id)
  assessment=('Compact open palms and continuous wrist/cuff, smaller non-star finger grouping; all front body and both boots retained.' if 'aoe-hands' in id else 'Six running phases inspected at native/integer zoom: knee/boot chains and support silhouettes change; arm overlap follows stride, no complete-figure mirror. Costume stays on same side. Remains motion candidate.')
  j.update(sourceViewed=True,sourcePackingAllowed=True,sourceAssessment=assessment,limbAudit='review/limb-audit-v1/findings.json')
 m['clips']=[c for c in m['clips'] if c['id'] not in repairs]
 m['coverage'].update(bodyClips=len(m['clips']),bodyKeys=sum(len(c['frames']) for c in m['clips']))
 for j in ledger['jobs']:
  if j['id']=='huyen-tam-domain-west-run-fix1' and j['status']=='planned':j.update(supersededPlanned=True,replacedBy=repairs['huyen-tam-domain-run-west'])
 write(R/'manifest.json',m);write(R/'generation.json',ledger)
 print(json.dumps({'archived':len(historical['clips']),'sourcesReady':len(repairs)}))
else:raise ValueError(sys.argv[1])
