from pathlib import Path
import json,copy
ROOT=Path(__file__).resolve().parent
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
def write(n,d):(ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
review=read('review-state.json');id='banner-a-east-cast-aoe';assert not review.get(id,{}).get('manualPointsRemappedAfterTemporalReorder'), 'Temporal remapping already recorded; do not remap again.'
order=[0,2,3,4,1,5];manual=read('manual.json');roots=read('root-overrides.json');oldmanual={i:copy.deepcopy(manual[id+':'+str(i+1)]) for i in range(6)};oldroots={i:copy.deepcopy(roots[id+':'+str(i+1)]) for i in range(6)}
for i,sourceindex in enumerate(order):
 key=id+':'+str(i+1);manual[key]=oldmanual[sourceindex]|{'priorSourceOrderKey':sourceindex+1,'temporalReorderPreservedSourcePoint':True};roots[key]=oldroots[sourceindex]|{'priorSourceOrderKey':sourceindex+1,'temporalReorderPreservedSourceMeasurement':True}
review[id]=review.get(id,{})|{'actionIndices':order,'durationsMs':[280,310,310,400,640,560],'manualPointsRemappedAfterTemporalReorder':True,'headTorsoFirstRecoveryViewed':True,'reorderReason':'Actual source ready→joinedseal→raisedritual→forward2palms release→steady open2palms→upright recovery. Source1,3,4,5,2,6, preserving original source pixels and measurements; release starts key4 at900ms. Original requested drawing order was different and is retained in immutable raw.'}
write('manual.json',manual);write('root-overrides.json',roots);write('review-state.json',review);print('E AOE actual source order1,3,4,5,2,6 mapped with original source coordinates and holds release900ms.')
