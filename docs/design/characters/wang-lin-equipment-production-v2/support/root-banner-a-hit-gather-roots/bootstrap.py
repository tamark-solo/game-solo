from pathlib import Path
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
code=(V2/'support/root-banner-a-semantic-roots/prepare.py').read_text(encoding='utf-8')
code=code.replace('semantic-roots-registration.json','hit-gather-roots-registration.json').replace('5d8136de47ac1482aabd56b56479620f2194b49e88050ef72b79a223bb050470','c82f3b21917ffa9f649431c8fba59eb17bba7fe205723c6c5b8125a498499a4b').replace("'sourcePoses':96", "'sourcePoses':48").replace("'sourceSheets':16", "'sourceSheets':8")
(ROOT/'prepare.py').write_text(code,encoding='utf-8')
print('Prepared support-only 48 source-root observations')
