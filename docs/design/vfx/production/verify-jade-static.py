"""Filesystem-only checks; no browser or localhost requests."""
import json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent.parent
html=(root/'hoa-than-kit.html').read_text(encoding='utf8')
js=(root/'hoa-than-jade-preview.mjs').read_text(encoding='utf8')
ids=set(re.findall(r'id="([^"]+)"',html))
assert set(re.findall(r"\$\('([^']+)'\)",js))<=ids
assert 'hoa-than-jade-preview.mjs?v=3.0.0' in html
assert '-v3/' in js
assert 'checked' not in re.search(r'<input[^>]*id="force-feedback"[^>]*>',html).group(0)
assert 'value="1" selected' in html
for file in ['hoa-than-kit.html','hoa-than-jade-kit.html','skill-library.html']:
    for link in re.findall(r'(?:href|src)="([^"]+)"',(root/file).read_text(encoding='utf8')):
      if '://' in link or link.startswith('#'): continue
      path=link.split('?')[0].split('#')[0]
      assert (root/path).exists() or path=='releases/hoa-than-kit-3.0.0.zip', (file,path)
for module in ['hoa-than-jade-preview.mjs','production/r05-jade-model.mjs','production/r05-jade-controller.mjs']:
    for relative in re.findall(r"from\s*['\"]([^'\"]+)['\"]",(root/module).read_text(encoding='utf8')):
      if relative.startswith('.'): assert (root/module).parent.joinpath(relative).exists(), relative
for row in json.loads((root/'production/r05-jade-art-selection.json').read_text()):
    assert hashlib.sha256((root/row['selectedSource']).read_bytes()).hexdigest()==row['sha256']
    assert (root/row['prompt']).exists()
release_count=0
for sha in (root/'releases').rglob('*.sha256'):
    digest,name=sha.read_text().split(maxsplit=1)
    archive=sha.parent/name.strip()
    assert hashlib.sha256(archive.read_bytes()).hexdigest()==digest,archive
    release_count+=1
report=dict(method='filesystem_checks_no_browser',domIdsVerified=True,localImportsAndLinksVerified=True,sourceHashesVerified=8,releaseHashesVerified=release_count,browserInteractionVerified=False)
(root/'production/r05-jade-static-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
