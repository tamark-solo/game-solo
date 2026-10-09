import type { Position } from './world/types';

export interface RegionSpline { anchors: Position[]; smoothness: number }
export const MAX_SPLINE_ANCHORS = 64;
export const MAX_SPLINE_SAMPLES = 4096;
// World-space tolerance: collision and the visible border share one outline at every zoom.
export const SPLINE_TOLERANCE = 0.5;
type Segment = { a: Position; c1: Position; c2: Position; b: Position; index: number };
const mix = (a: Position, b: Position, t = .5): Position => ({ x: a.x + (b.x-a.x)*t, y: a.y + (b.y-a.y)*t });
const distance = (a: Position, b: Position) => Math.hypot(a.x-b.x,a.y-b.y);
const reflected = (a: Position,b: Position): Position => ({x:2*a.x-b.x,y:2*a.y-b.y});
function segments(anchors: Position[], smoothness: number, closed: boolean): Segment[] {
  const n = anchors.length;
  if(n<2)return [];
  const at=(i:number)=>closed?anchors[(i+n)%n]:i<0?reflected(anchors[0],anchors[1]):i>=n?reflected(anchors[n-1],anchors[n-2]):anchors[i];
  return Array.from({length:closed?n:n-1},(_,index)=>{
    const p0=at(index-1),a=at(index),b=at(index+1),p3=at(index+2);
    // Centripetal Catmull–Rom converted to cubic Bézier. Coincident knots are
    // tolerated during a live drag; authoring validation rejects them on commit.
    const d0=Math.max(1e-5,Math.sqrt(distance(p0,a))),d1=Math.max(1e-5,Math.sqrt(distance(a,b))),d2=Math.max(1e-5,Math.sqrt(distance(b,p3)));
    const tangent=(axis:'x'|'y')=>[
      d1*((a[axis]-p0[axis])/d0-(b[axis]-p0[axis])/(d0+d1)+(b[axis]-a[axis])/d1),
      d1*((b[axis]-a[axis])/d1-(p3[axis]-a[axis])/(d1+d2)+(p3[axis]-b[axis])/d2),
    ];
    const tx=tangent('x'),ty=tangent('y'),strength=Math.max(0,Math.min(1,smoothness))/3;
    return {a,b,c1:{x:a.x+tx[0]*strength,y:a.y+ty[0]*strength},c2:{x:b.x-tx[1]*strength,y:b.y-ty[1]*strength},index};
  });
}
function segmentDistance(p:Position,a:Position,b:Position):number {
  const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
/** Adaptive subdivision retains the source segment for insertion on a curved edge. */
export function splineOutline(anchors:Position[],smoothness=1,closed=true):{points:Position[];edges:number[]} {
  const points:Position[]=[],edges:number[]=[];
  if(!anchors.length)return {points,edges};
  if(anchors.length>MAX_SPLINE_ANCHORS)throw new Error(`Spline tối đa ${MAX_SPLINE_ANCHORS} điểm điều khiển. Chia thành vùng nhỏ hơn.`);
  const append=(p:Position,index:number)=>{
    const q={x:Math.round(p.x*1e6)/1e6,y:Math.round(p.y*1e6)/1e6};
    if(points.length&&distance(points.at(-1)!,q)<1e-7)return;
    if(points.length>=MAX_SPLINE_SAMPLES)throw new Error('Spline quá phức tạp. Chia thành vùng nhỏ hơn.');
    if(points.length)edges.push(index);
    points.push(q);
  };
  append(anchors[0],0);
  const subdivide=(s:Segment,depth:number):void=>{
    const error=Math.max(segmentDistance(s.c1,s.a,s.b),segmentDistance(s.c2,s.a,s.b));
    if(error<=SPLINE_TOLERANCE){append(s.b,s.index);return;}
    if(depth>=16)throw new Error('Không lấy mẫu được spline. Chỉnh các điểm gần nhau hoặc chia vùng.');
    const ac=mix(s.a,s.c1),cc=mix(s.c1,s.c2),cb=mix(s.c2,s.b),left=mix(ac,cc),right=mix(cc,cb),mid=mix(left,right);
    subdivide({...s,c1:ac,c2:left,b:mid},depth+1);subdivide({...s,a:mid,c1:right,c2:cb},depth+1);
  };
  for(const segment of segments(anchors,smoothness,closed))subdivide(segment,0);
  if(closed&&points.length>1&&distance(points[0],points.at(-1)!)<1e-7)points.pop();
  return {points,edges};
}
export const sampleSpline=(anchors:Position[],smoothness=1,closed=true)=>splineOutline(anchors,smoothness,closed).points;
export function nearestSplineEdge(spline:RegionSpline,p:Position):{index:number;point:Position;distance:number} {
  const {points,edges}=splineOutline(spline.anchors,spline.smoothness),best={index:0,point:points[0],distance:Infinity};
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),q={x:a.x+dx*t,y:a.y+dy*t},d=distance(p,q);
    if(d<best.distance){best.distance=d;best.index=edges[i]??spline.anchors.length-1;best.point=q;}
  }
  return best;
}
export function updateSplineRegion(region:{points:Position[];spline?:RegionSpline}):void {
  if(region.spline)region.points=sampleSpline(region.spline.anchors,region.spline.smoothness);
}
export function translateRegion(region:{points:Position[];spline?:RegionSpline},dx:number,dy:number):void {
  region.points=region.points.map(p=>({x:p.x+dx,y:p.y+dy}));
  if(region.spline)region.spline.anchors=region.spline.anchors.map(p=>({x:p.x+dx,y:p.y+dy}));
}
