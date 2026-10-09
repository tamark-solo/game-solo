import type { Position } from './world/types';
import type { EditorAsset, EditorObject } from './map-editor.ts';
import { sampleSpline } from './region-spline.ts';

export type CutShape = 'rect' | 'polygon' | 'spline';
export interface AssetExtraction {
  sourceAssetId: string; sourceName: string; sourceWidth: number; sourceHeight: number;
  bounds: { x: number; y: number; width: number; height: number };
  shape: CutShape; anchors: Position[]; smoothness: number;
}
export function cutOutline(shape: CutShape, anchors: Position[], smoothness: number): Position[] {
  if (!['rect', 'polygon', 'spline'].includes(shape)) throw new Error('Hình đường viền không hợp lệ.');
  if (anchors.length < 3) throw new Error('Vẽ ít nhất 3 điểm và khép đường viền.');
  if (anchors.length > (shape === 'spline' ? 64 : 256)) throw new Error('Quá nhiều điểm đường viền.');
  if (!Number.isFinite(smoothness) || smoothness < 0 || smoothness > 1 || anchors.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error('Tọa độ / độ cong không hợp lệ.');
  if (anchors.some((a, i) => Math.hypot(a.x - anchors[(i + 1) % anchors.length].x, a.y - anchors[(i + 1) % anchors.length].y) < .001)) throw new Error('Hai điểm kề nhau không được trùng.');
  const points = shape === 'spline' ? sampleSpline(anchors, smoothness) : anchors.map(p => ({ ...p }));
  const cross = (a: Position, b: Position, c: Position) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for (let i = 0; i < points.length; i++) for (let j = i + 2; j < points.length; j++) {
    if (i === 0 && j === points.length - 1) continue;
    const a=points[i], b=points[(i+1)%points.length], c=points[j], d=points[(j+1)%points.length];
    if (cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0) throw new Error('Đường viền tự cắt. Sửa điểm hoặc giảm độ cong.');
  }
  const area = points.reduce((sum, a, i) => { const b=points[(i+1)%points.length]; return sum+a.x*b.y-b.x*a.y; }, 0);
  if (Math.abs(area)<2) throw new Error('Vùng cắt quá nhỏ.');
  return points;
}
export function cutBounds(points: Position[], width: number, height: number): AssetExtraction['bounds'] {
  const x=Math.max(0,Math.floor(Math.min(...points.map(p=>p.x)))), y=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y))));
  const right=Math.min(width,Math.ceil(Math.max(...points.map(p=>p.x)))), bottom=Math.min(height,Math.ceil(Math.max(...points.map(p=>p.y))));
  if(right<=x || bottom<=y) throw new Error('Vùng cắt nằm ngoài ảnh.');
  return { x, y, width: right-x, height: bottom-y };
}
export function cutPlacement(source: EditorAsset, object: EditorObject, bounds: AssetExtraction['bounds'], pivot: Position): Position {
  const p=object.pivot??source.pivot;
  return { x:object.x+(object.flipX?-1:1)*(bounds.x+pivot.x-p.x)*object.scale, y:object.y+(bounds.y+pivot.y-p.y)*object.scale };
}
export function parseExtraction(value: unknown, outputWidth: number, outputHeight: number): AssetExtraction {
  const v=value as AssetExtraction, finite=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  if (!v || typeof v!=='object' || typeof v.sourceAssetId!=='string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(v.sourceAssetId) || typeof v.sourceName!=='string' || !v.sourceName.length || v.sourceName.length>120 || !Number.isInteger(v.sourceWidth)||!finite(v.sourceWidth,1,8192)||!Number.isInteger(v.sourceHeight)||!finite(v.sourceHeight,1,8192) || !['rect','polygon','spline'].includes(v.shape) || !Array.isArray(v.anchors) || !v.bounds) throw new Error('Nguồn cắt asset không hợp lệ.');
  const anchors=v.anchors.map(p=>{if(!p||!finite(p.x,0,v.sourceWidth)||!finite(p.y,0,v.sourceHeight))throw new Error('Điểm cắt nằm ngoài ảnh nguồn.');return {x:p.x,y:p.y};});
  if(v.shape==='rect' && (anchors.length!==4 || anchors[0].y!==anchors[1].y || anchors[1].x!==anchors[2].x || anchors[2].y!==anchors[3].y || anchors[3].x!==anchors[0].x))throw new Error('Khung cắt chữ nhật không hợp lệ.');
  const bounds=cutBounds(cutOutline(v.shape,anchors,v.smoothness),v.sourceWidth,v.sourceHeight);
  if(Object.keys(bounds).some(k=>bounds[k as keyof typeof bounds]!==v.bounds[k as keyof typeof bounds])||bounds.width!==outputWidth||bounds.height!==outputHeight)throw new Error('Kích thước / nguồn cắt không khớp.');
  return {sourceAssetId:v.sourceAssetId,sourceName:v.sourceName,sourceWidth:v.sourceWidth,sourceHeight:v.sourceHeight,bounds,shape:v.shape,anchors,smoothness:v.smoothness};
}
