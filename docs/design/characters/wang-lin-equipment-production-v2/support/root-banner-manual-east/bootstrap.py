from pathlib import Path
import hashlib
ROOT=Path(__file__).resolve().parent
V2=ROOT.parents[1]
inp=V2/'actors/b/banner/review/root-east-manual-input.json'
assert hashlib.sha256(inp.read_bytes()).hexdigest()=='f391ce5776be632dffdfa5ed19a12a0c65ad90ec528d67ea448e93747c0890cb'
old=V2/'support/root-banner-manual'
code=(old/'prepare.py').read_text(encoding='utf-8')
code=code.replace("data=json.loads((V2/'actors/b/banner/review/foundation-proposals.json').read_text(encoding='utf-8'))", "data=json.loads((V2/'actors/b/banner/review/root-east-manual-input.json').read_text(encoding='utf-8'))['sources']")
code=code.replace("['north','northeast']", "['east','southeast']")
(ROOT/'prepare.py').write_text(code,encoding='utf-8')
(ROOT/'finalize.py').write_text((old/'finalize.py').read_text(encoding='utf-8'),encoding='utf-8')
print('Prepared support-only source review scripts')
