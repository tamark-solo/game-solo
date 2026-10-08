import json, hashlib, shutil
from pathlib import Path
root=Path(__file__).resolve().parent.parent
gen=Path('C:/Users/AnhLT/.codex/generated_images/01a1159e-a059-7403-89ec-b1099738d65d')
selection=json.loads((root/'production/r05-jade-art-selection.json').read_text())
jobs=[('golden-thunder-contact','thunder','exec-0954fcf5-b581-4fa5-bcc0-e278c154fb4f.png'),('silk-wind-passage','wind','exec-4bb2f94d-343d-499b-b3c5-fd9574d8a6c5.png'),('silk-wind-settle','wind','exec-3f74ff72-9c47-4283-93cc-3fb950028d42.png')]
for id,family,file in jobs:
    dst=root/f'r05-{family}-v3/source/{id}.png'
    shutil.copyfile(gen/file,dst)
    selection.append(dict(id=id,family=family,tool='built_in_imagegen',original=str(gen/file),selectedSource=str(dst.relative_to(root)).replace('\\','/'),prompt=f'r05-{family}-v3/prompts/{id}.txt',sha256=hashlib.sha256(dst.read_bytes()).hexdigest(),reference='reference-hoa-than-user-v3.png'))
(root/'production/r05-jade-art-selection.json').write_text(json.dumps(selection,indent=2)+'\n')
for family in ['sword','thunder','wind']:
    path=root/f'r05-{family}-v3/export-spec.json'
    specs=json.loads(path.read_text())
    origins={
      'sword-flight':[[488,301],[485,301],[485,300],[496,296],[496,283],[486,280]],
      'thunder-impact':[[232,253],[224,253],[222,253],[225,253],[232,228],[224,228],[222,228],[225,228]],
      'wind-trail':[[421,323],[423,324],[424,323],[419,326],[425,284],[426,286],[424,285],[423,286]],
      'wind-return-curl':[[404,366],[220,352],[223,346],[222,353],[226,263],[220,263],[220,263],[224,263]]
    }
    for spec in specs:
      if spec['id'] in origins: spec['origins']=origins[spec['id']]
    path.write_text(json.dumps(specs,indent=2)+'\n')
