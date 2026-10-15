"""Alpha region and support proposals for native packing; no artistic repainting."""
from PIL import Image
import statistics


def components(image, minimum=600):
    w, h = image.size
    mask = bytearray(image.getchannel('A').point(lambda v: 255 if v >= 128 else 0).tobytes())
    result = []
    for i, value in enumerate(mask):
        if not value:
            continue
        stack = [i]; mask[i] = 0; pixels = []
        x0 = x1 = i % w; y0 = y1 = i // w
        while stack:
            q = stack.pop(); pixels.append(q); y, x = divmod(q, w)
            x0 = min(x0,x); x1 = max(x1,x); y0 = min(y0,y); y1 = max(y1,y)
            for n in (q-w if y else -1,q+w if y+1<h else -1,q-1 if x else -1,q+1 if x+1<w else -1):
                if n >= 0 and mask[n]: mask[n] = 0; stack.append(n)
        result.append({'box':[x0,y0,x1+1,y1+1], 'pixels':pixels, 'large':len(pixels)>=minimum})
    return result


def rows_of(regions, rows, height):
    groups = []
    # A prone body's crown starts much lower than the ready pose in its row.
    # Keep those together; this clusters actual regions rather than cutting cells.
    threshold = .72*height/rows
    for region in sorted(regions,key=lambda r:r['box'][1]):
        if not groups or region['box'][1]-groups[-1][0]['box'][1]>threshold: groups.append([])
        groups[-1].append(region)
    return [sorted(group,key=lambda r:r['box'][0]) for group in groups]


def isolated_pose(image, region, all_regions):
    """Keep this complete connected human body and nearby disconnected pixels.

    Other source poses are excluded by region membership, never by equal-cell
    cropping. Small source fragments go to the nearest body rectangle.
    """
    w, h = image.size; x0,y0,x1,y1 = region['box']
    selection = set(region['pixels'])
    large = [r for r in all_regions if r['large']]
    for fragment in all_regions:
        if fragment['large']: continue
        bx0,by0,bx1,by1 = fragment['box']; x=(bx0+bx1)/2; y=(by0+by1)/2
        def distance(r):
            a,b,c,d=r['box']; return max(a-x,0,x-c)**2+max(b-y,0,y-d)**2
        nearest = min(large,key=distance)
        if nearest is region and distance(region)<=36:
            selection.update(fragment['pixels']);x0=min(x0,bx0);y0=min(y0,by0);x1=max(x1,bx1);y1=max(y1,by1)
    mask = Image.new('L',(x1-x0,y1-y0)); pixels=mask.load()
    for q in selection:
        y,x=divmod(q,w);pixels[x-x0,y-y0]=255
    pose=image.crop((x0,y0,x1,y1));pose.putalpha(mask)
    return pose,[x0,y0,x1,y1]


def boot_proposal(image, box):
    """Suggest lower dark boot clusters; caller must inspect root witnesses."""
    x0,y0,x1,y1=box; start=y1-max(6,round((y1-y0)*.08)); pixels=image.load(); columns={}
    for y in range(start,y1):
        for x in range(x0,x1):
            red,green,blue,alpha=pixels[x,y]
            if alpha>=128 and max(red,green,blue)<125:
                columns.setdefault(x,[]).append(y)
    if not columns: return {'root':[None,None],'groups':[],'confidence':'no-dark-boot-witness'}
    groups=[]
    for x in sorted(columns):
        if not groups or x-groups[-1][-1]>3:groups.append([])
        groups[-1].append(x)
    groups=sorted(groups,key=lambda group:sum(len(columns[x]) for x in group),reverse=True)[:2]
    groups.sort(key=lambda group:group[0]); witnesses=[]
    for group in groups:
        floor=max(y for x in group for y in columns[x])+1
        witnesses.append({'xRange':[group[0],group[-1]],'centerX':(group[0]+group[-1])/2,'soleY':floor})
    return {'root':[statistics.mean(g['centerX'] for g in witnesses),max(g['soleY'] for g in witnesses)],'groups':witnesses,
            'confidence':'two-lower-dark-support-clusters' if len(witnesses)==2 else 'one-lower-dark-support-cluster'}


def isolated_soft_pose(image, region, regions):
    """Preserve intrinsic RGBA inside measured gaps between complete bodies."""
    x0,y0,x1,y1=region['box'];left,top,right,bottom=0,0,image.width,image.height
    for other in regions:
        if other is region or not other['large']:continue
        a,b,c,d=other['box']
        if max(y0,b)<min(y1,d):
            if c<=x0:left=max(left,(c+x0)//2)
            elif a>=x1:right=min(right,(x1+a)//2)
        if max(x0,a)<min(x1,c):
            if d<=y0:top=max(top,(d+y0)//2)
            elif b>=y1:bottom=min(bottom,(y1+b)//2)
    cut=image.crop((left,top,right,bottom));box=cut.getchannel('A').getbbox();assert box
    a,b,c,d=box
    return cut.crop(box),[left+a,top+b,left+c,top+d]
