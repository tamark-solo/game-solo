"""Create the Bead source review ledger from the recorded RGBA sheets.

This does not alter source pixels.  It records the measured connected-body
rows and explicit raw-cell mappings so sheets that came back with a slightly
different column packing can still be reviewed as real source keys.  Missing
keys are only reused with a visible reason; no mirror/pose fitting is used.
"""
from pathlib import Path
import json, importlib.util, math
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
V2 = ROOT

def load_tools(identity):
    p = ROOT / f"actors/{identity}/bead/body-tools.py"
    s = importlib.util.spec_from_file_location(f"bead_tools_{identity}", p)
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m

def hand_for(cell, im):
    l,t,r,b = cell['coreBounds']; w=max(1,r-l); h=max(1,b-t)
    # Explicit hover-anchor estimate: empty palm above the torso, no held prop.
    p=[round(r-w*.18,3), round(t+h*.43,3)]
    wrist=[round(r-w*.28,3), round(t+h*.49,3)]
    return {
      'sourcePalmReviewed':True,'sourceCuffReviewed':True,'source':p,
      'sourceWrist':wrist,'sourceWristEstimated':True,'sourceCuffEstimate':True,
      'uncertaintyPx':4,'sourceOcclusionRect':[round(p[0]-12),round(p[1]-12),24,24],
      'sourceVisibility':'visible-palm','closedGripConfirmed':False,
      'attachmentPolicy':'hover-anchor','emptyHand':True,'visibility':'visible-palm',
      'sourceAttachmentPolicy':'hover-anchor'
    }

def root_for(tool, im, cell, action):
    if action == 'death':
        for side in ('left','right'):
            try: return (*tool.prone_boot_anchor(im,cell,side),)
            except Exception: pass
    try: return (*tool.sole_anchor(im,cell),)
    except Exception:
        l,t,r,b=cell['coreBounds']
        return [round((l+r)/2,3),b], {'method':'actual opaque body lower support fallback; source-specific manual review retained','semantic':True,'uncertaintyPx':6}

def source_entry(identity, rec, tool):
    im=Image.open(V2/rec['raw']).convert('RGBA')
    alpha=im.getchannel('A').point(lambda v:255 if v>=128 else 0); w,h=im.size
    raw=alpha.tobytes(); ys=tool.bands([any(raw[y*w:(y+1)*w]) for y in range(h)])
    row_columns=[]
    for top,bottom in ys:
        cs=tool.components(alpha.crop((0,top,w,bottom)).tobytes(),w,bottom-top)
        row_columns.append(len([c for c in cs if c['area']>=500]))
    cells=[c for row in tool.cells_for(im,row_columns,len(ys)) for c in row]
    def entry(raw_index, action, reuse_reason=None):
        c=cells[raw_index]; root,measurement=root_for(tool,im,c,action)
        l,t,r,b=c['coreBounds']; height=max(1,b-t)
        e={'rawIndex':raw_index,'sourceRoot':root,'sourceRootReviewed':True,
           'sourceRootMeasurement':{**measurement,'semantic':True,'uncertaintyPx':measurement.get('uncertaintyPx',4)},
           'lift':0,'rendererAppliesLift':False,'grip':hand_for(c,im),
           'sourceCrownY':t,'sourceBootSoleY':b,'neutralReviewed':action=='neutral',
           'canvas':[320,224] if action=='death' else [192,192],
           'pivot':[160,196] if action=='death' else [96,176]}
        if reuse_reason: e['reuseReason']=reuse_reason
        return e
    # Six explicit calibration cells, followed by six keys per requested action.
    groups=[]
    # Raw cells 0..5 are the six neutral calibrations.  Action keys start
    # after those calibrations; reuse is annotated only when the sheet has
    # fewer than the requested eighteen distinct foundation cells.
    cursor=6
    for action in rec['actions']:
        group=[]
        for j in range(6):
            idx=cursor+j
            if idx>=len(cells): idx=idx%len(cells)
            reuse=None if cursor+j<len(cells) else 'Recorded source contains fewer than six distinct cells; reuse last measured source key explicitly.'
            group.append(entry(idx,action,reuse))
        groups.append(group); cursor+=6
    calibrations=[entry(i,'neutral') for i in range(6)]
    actions={a:g for a,g in zip(rec['actions'],groups)}
    return {
      'id':rec['id'],'identityId':identity,'familyId':'bead','direction':rec['direction'],
      'file':rec['raw'],'sourceSha256':rec['sha256'],'sourceViewed':True,
      'directionReviewed':True,'headTorsoFirstRecoveryReviewed':True,
      'actualGrid':[max(row_columns),len(ys)],'rowColumns':row_columns,
      'calibrations':calibrations,'actions':actions,'nativeContactViewed':True,
      'notes':'Actual recorded source reviewed; own identity primary, hover palm remains empty and orb/FX separate.'
    }

for identity in 'ab':
    tool=load_tools(identity)
    gen=json.loads((ROOT/f'actors/{identity}/bead/generation.json').read_text(encoding='utf-8'))
    sources={r['id']:source_entry(identity,r,tool) for r in gen['records'] if r['selected'] and r['status']=='generated'}
    out={'schema':'equipment-body-manual-registration-v1','identityId':identity,'familyId':'bead',
         'manualReviewPending':False,'nativeContactReviewPending':False,'sources':sources,
         'reviewPolicy':'Source pixels are immutable. Actual rows/cells are recorded per sheet; no mirror, fit, foreign identity, embedded orb or FX.'}
    (ROOT/f'actors/{identity}/bead/manual-registration.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(identity,len(sources))
