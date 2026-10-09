import { HANG_NHAC, hangNhacWalkable } from './hang-nhac';
import { clearSectPath } from './sect';
import type { Position } from './world';

// Hints only: the player still walks, and the server still applies owner collision.
const CELL=16, width=Math.ceil(HANG_NHAC.world.width/CELL),height=Math.ceil(HANG_NHAC.world.height/CELL);
const walkable=new Map<number,boolean>();
const point=(id:number):Position=>({x:(id%width)*CELL,y:Math.floor(id/width)*CELL});
function valid(id:number):boolean {
  if(!walkable.has(id))walkable.set(id,hangNhacWalkable(point(id)));
  return walkable.get(id)!;
}
function nearest(p:Position):number|undefined {
  const x=Math.round(p.x/CELL),y=Math.round(p.y/CELL),candidates:number[]=[];
  for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)if(x+dx>=0&&x+dx<width&&y+dy>=0&&y+dy<height)candidates.push((y+dy)*width+x+dx);
  return candidates.sort((a,b)=>Math.hypot(point(a).x-p.x,point(a).y-p.y)-Math.hypot(point(b).x-p.x,point(b).y-p.y))
    .find(id=>valid(id)&&clearSectPath(p,point(id)));
}
class Frontier {
  private data:Array<{id:number;score:number}>=[];
  get size():number{return this.data.length;}
  push(value:{id:number;score:number}):void {
    let i=this.data.length;this.data.push(value);
    while(i>0){const parent=(i-1)>>1;if(this.data[parent]!.score<=value.score)break;this.data[i]=this.data[parent]!;i=parent;}this.data[i]=value;
  }
  pop():number {
    const first=this.data[0]!,last=this.data.pop()!;
    if(this.data.length){let i=0;while(i*2+1<this.data.length){let child=i*2+1;if(child+1<this.data.length&&this.data[child+1]!.score<this.data[child]!.score)child++;
      if(this.data[child]!.score>=last.score)break;this.data[i]=this.data[child]!;i=child;}this.data[i]=last;}return first.id;
  }
}
export function sectRoute(from:Position,to:Position):Position[]|undefined {
  if(!hangNhacWalkable(from)||!hangNhacWalkable(to))return;
  if(clearSectPath(from,to))return [{...from},{...to}];
  const start=nearest(from),end=nearest(to);if(start===undefined||end===undefined)return;
  const frontier=new Frontier(),cost=new Map<number,number>([[start,0]]),parent=new Map<number,number>(),closed=new Set<number>();
  frontier.push({id:start,score:0});
  while(frontier.size){
    const current=frontier.pop();if(closed.has(current))continue;
    if(current===end){const route:Position[]=[{...to}];let id=current;while(id!==start){route.push(point(id));id=parent.get(id)!;}route.push(point(start),{...from});route.reverse();
      const simplified:Position[]=[route[0]!];for(let i=1;i<route.length;){let next=i;while(next+1<route.length&&clearSectPath(simplified[simplified.length-1]!,route[next+1]!))next++;
        simplified.push(route[next]!);i=next+1;}return simplified;
    }
    closed.add(current);const p=point(current),x=current%width,y=Math.floor(current/width);
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
      if(!dx&&!dy||x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;
      const id=(y+dy)*width+x+dx;if(closed.has(id)||!valid(id)||!clearSectPath(p,point(id)))continue;
      const next=cost.get(current)!+Math.hypot(dx,dy)*CELL;if(next>=(cost.get(id)??Infinity))continue;
      cost.set(id,next);parent.set(id,current);frontier.push({id,score:next+Math.hypot(point(id).x-to.x,point(id).y-to.y)});
    }
  }
}
