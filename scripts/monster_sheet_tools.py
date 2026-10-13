"""Read measured gutters and support points of AI sheets, never repaint ART."""
import math
from PIL import Image

BODY_ALPHA=210

def separators(projection,count):
    length=len(projection);step=length/count;cuts=[0];diagnostics=[]
    for i in range(1,count):
        nominal=i*step;lo=max(cuts[-1]+12,round(nominal-step*.29));hi=min(length-12,round(nominal+step*.29))
        groups=[];start=None
        for x in range(lo,hi+1):
            if projection[x]==0:
                if start is None:start=x
            elif start is not None:
                groups.append((start,x));start=None
        if start is not None:groups.append((start,hi+1))
        if groups:
            l,r=min(groups,key=lambda g:abs((g[0]+g[1])/2-nominal));cut=round((l+r)/2)
            diagnostics.append({'cut':cut,'emptyBand':[l,r],'opaquePixelsAtCut':0})
        else:
            cut=min(range(lo,hi+1),key=lambda x:(sum(projection[max(0,x-2):x+3]),abs(x-nominal)))
            diagnostics.append({'cut':cut,'emptyBand':None,'opaquePixelsAtCut':projection[cut]})
        cuts.append(cut)
    return cuts+[length],diagnostics

def body_grid(im,rows=6,cols=6):
    a=im.getchannel('A').point(lambda v:255 if v>=BODY_ALPHA else 0)
    w,h=im.size;data=a.tobytes();px=[0]*w;py=[0]*h
    for y in range(h):
        row=data[y*w:(y+1)*w]
        py[y]=sum(v!=0 for v in row)
        for x,v in enumerate(row):
            if v:px[x]+=1
    xs,xd=separators(px,cols);ys,yd=separators(py,rows)
    cells=[]
    for row in range(rows):
        values=[]
        for col in range(cols):
            rect=(xs[col],ys[row],xs[col+1],ys[row+1]);mask=a.crop(rect);b=mask.getbbox()
            if b is None:raise ValueError(f'Empty body tile {row}/{col}')
            values.append({'rect':rect,'bounds':b,'height':b[3]-b[1],'width':b[2]-b[0]})
        cells.append(values)
    return a,cells,{'xCuts':xs,'yCuts':ys,'verticalGutters':xd,'horizontalGutters':yd}

def support_x(mask,bounds):
    # Only visible soles/roots in the low contact strip, never whole body bbox.
    l,t,r,b=bounds;strip=max(2,round((b-t)*.035));points=[]
    for y in range(max(t,b-strip),b):
        for x in range(l,r):
            if mask.getpixel((x,y)):points.append(x)
    if not points:raise ValueError('No contact support pixels')
    return (min(points)+max(points))/2, [min(points),b-strip,max(points)+1,b]
