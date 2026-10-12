import {BasicAttackTimeline} from '../../../../shared/animation-arena/basic-presentation.ts';
import {productionDuration} from '/src/core/actor-animation-production.ts';
const actions=['attack','attack_2','attack_3'];
export class BasicReviewEffects {
 constructor(catalog,sockets,clips){this.catalog=catalog;this.sockets=sockets;this.clips=clips;}
 sample(s,origin,d,selected,hit,vector){
  if(!actions.includes(selected)&&selected!=='combo')return{effects:[],events:[],target:null};
  const sockets=this.sockets.sockets,avg=[0,1].map(i=>actions.reduce((n,a)=>n+sockets[a][d][i],0)/3),contact={x:origin.x+avg[0]-56+vector[0]*46,y:origin.y+avg[1]-88+vector[1]*46},target={id:'basic-review-target',x:contact.x,y:contact.y+30.6,hp:100,maxHp:100,radius:15},list=selected==='combo'?actions:[selected],timeline=new BasicAttackTimeline(this.catalog),events=[];let offset=0;
  for(const a of list){const c=this.clips[a+'-'+d],release=c.phases.find(p=>p.label==='Phát lực').at,socket=sockets[a][d],point={x:origin.x+socket[0]-56,y:origin.y+socket[1]-88},dx=contact.x-point.x,dy=contact.y-point.y,length=Math.hypot(dx,dy),strikeId=['review',s.cycle,d,selected,a].join('-'),e={type:'release',strikeId,actorId:'candidate',action:a,at:1000+offset+release,...point,groundY:origin.y,dx:dx/length,dy:dy/length};timeline.event(e);events.push(e);if(hit){const h={type:'hit',strikeId,actorId:'candidate',action:a,targetId:target.id,at:e.at,...contact,groundY:target.y};timeline.event(h);events.push(h);}offset+=productionDuration(c);}
  return{effects:timeline.sample(1000+s.windAge),events,target,contact,age:s.windAge,diagnostics:timeline.diagnostics()};
 }
}
export function drawBasicNative(ctx,effects,catalog,images,root,x,y,zoom,target){
 if(target){ctx.save();ctx.translate(x+(target.x-root.x)*zoom,y+(target.y-root.y-30.6)*zoom);ctx.strokeStyle='#8bafb7';ctx.fillStyle='#a7d3e025';ctx.lineWidth=zoom;ctx.beginPath();ctx.arc(0,0,15*zoom,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,4*zoom,0,Math.PI*2);ctx.stroke();ctx.restore();}
 for(const f of effects){const c=catalog.clips[f.clip],r=c.frames[f.index];ctx.save();ctx.translate(x+(f.x-root.x)*zoom,y+(f.y-root.y)*zoom);ctx.rotate(-f.rotation);ctx.globalAlpha=f.opacity;ctx.imageSmoothingEnabled=true;ctx.drawImage(images.get(c.atlasUrl),r.x,r.y,r.w,r.h,-c.anchor[0]*zoom,-c.anchor[1]*zoom,r.w*zoom,r.h*zoom);ctx.restore();}
}
