from pathlib import Path
ROOT=Path(__file__).resolve().parent;V2=ROOT.parents[1]
old=V2/'support/root-banner-a-semantic-roots'
code=(old/'finalize.py').read_text(encoding='utf-8').replace('5d8136de47ac1482aabd56b56479620f2194b49e88050ef72b79a223bb050470','c82f3b21917ffa9f649431c8fba59eb17bba7fe205723c6c5b8125a498499a4b')
table="""selectedX={
 'east-hit':[210.5,519,848.25,202.5,525.25,836.25],
 'north-hit':[230.75,503,793.75,239.5,523.75,793],
 'northeast-hit':[237.5,520.75,816,237.5,527,827.25],
 'southeast-hit':[246.75,516.25,789.5,239.75,519.75,794.25],
 'east-gather':[219.5,512,817,212.75,524.5,814.75],
 'north-gather':[236.5,523,769,272,527.5,768.5],
 'northeast-gather':[196,526.75,820,245.25,521,818.75],
 'southeast-gather':[275.25,514.5,774.5,267.5,517.75,786]
}
"""
code=code[:code.index('selectedX={')]+table+code[code.index('font=ImageFont'):]
code=code.replace("seated=c['action']=='meditate';standing=not seated and i==0", "seated=c['action']=='gather' and i<4;standing=not seated")
code=code.replace("uncertainty=2 if standing else 4 if seated else 5", "uncertainty=1.5 if standing else 3")
code=code.replace('Manual own clothed folded-leg/thigh support projection in seated pose; folds hide pelvis and soles, no exact bone or world-floor claim.', 'Manual own boot/knee/folded-leg support projection in squat, kneeling or rising pose. Actual contact plane viewed; folds may hide one heel and pelvis. No exact skeletal or world-floor claim.')
code=code.replace("'sourcePoses':96", "'sourcePoses':48").replace('A-banner-semantic-root-support-1','A-banner-hit-gather-root-support-1').replace('uncertainty2–5nativepx','uncertainty1.5–3nativepx')
(ROOT/'finalize.py').write_text(code,encoding='utf-8')
code=(old/'record-viewed.py').read_text(encoding='utf-8').replace('96','48').replace("'sourceWholePoseSheetsViewed':16", "'sourceWholePoseSheetsViewed':8").replace("'bodyClips':16", "'bodyClips':8").replace('root-banner-A-semantic-roots-delivery-1','root-banner-A-hit-gather-roots-delivery-1')
(ROOT/'record-viewed.py').write_text(code,encoding='utf-8')
print('Prepared exact-source support proof, no actor writers')
