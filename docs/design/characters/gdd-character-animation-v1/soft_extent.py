"""Opt-in spectral crop retaining original RGBA inside a fixed source margin.

Provider alpha 1..7 residue can span the empty gutters. Measure support at
alpha>=8 inside the existing inter-body gaps, retaining its faint fringe for
a fixed source-wide native 3px margin. Raw files and retained pixels are exact.
"""
import math
from source_tools import isolated_soft_pose

def bounded_soft_pose(image, region, regions, factor):
    pose, box = isolated_soft_pose(image, region, regions)
    support = pose.getchannel('A').point(lambda a:255 if a>=8 else 0).getbbox()
    assert support, 'Spectral support missing'
    margin = math.ceil(3/factor)
    a,b,c,d = support
    crop = [max(0,a-margin),max(0,b-margin),min(pose.width,c+margin),min(pose.height,d+margin)]
    retained = pose.crop(crop)
    nonzero = retained.getchannel('A').getbbox();assert nonzero
    x0,y0,x1,y1 = nonzero
    retained = retained.crop(nonzero)
    result_box=[box[0]+crop[0]+x0,box[1]+crop[1]+y0,box[0]+crop[0]+x1,box[1]+crop[1]+y1]
    # A near-touching hem/crown can invalidate rectangular isolation. Reject it
    # instead of allowing another physical body into this spectral frame.
    a,b,c,d=result_box
    for other in regions:
        if other is region or not other['large']:continue
        ox0,oy0,ox1,oy1=other['box']
        if max(a,ox0)>=min(c,ox1) or max(b,oy0)>=min(d,oy1):continue
        assert not any(a<=q%image.width<c and b<=q//image.width<d for q in other['pixels']), 'Foreign physical core in spectral crop; regenerate spaced source'
    return retained,result_box
