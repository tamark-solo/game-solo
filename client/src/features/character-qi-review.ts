import {CHARACTER_QI_THEMES,type CharacterQiTheme} from '../core/character-qi-review';
import {createQiChannel,beginQiChannel,releaseQiChannel,readQiTimeline,type QiChannel} from '../core/character-qi-timeline';
import '../ui/character-qi-layers.css';
export function setCharacterQiTheme(node:HTMLElement,theme:CharacterQiTheme){
 node.dataset.qiTheme=theme;const textures=CHARACTER_QI_THEMES[theme];
 node.querySelectorAll<HTMLImageElement>('[data-qi-texture]').forEach(img=>{const source=textures[img.dataset.qiTexture as keyof typeof textures];if(img.getAttribute('src')!==source)img.src=source;});
}
export function mountCharacterQiReview(parent:HTMLElement){
 const nodes=[...parent.querySelectorAll<HTMLElement>('.character-qi')],visible=new Set<HTMLElement>(),media=matchMedia('(prefers-reduced-motion: reduce)'),channels=new Map(nodes.map(n=>[n,createQiChannel()]));
 const parts=new Map(nodes.map(n=>[n,{ground:n.querySelector<HTMLElement>('.qi-ground img')!,rear:[...n.querySelectorAll<HTMLElement>('.qi-back img')],front:n.querySelector<HTMLElement>('.qi-front img')!,burst:n.querySelector<HTMLElement>('.qi-burst img')!,motes:[...n.querySelectorAll<HTMLElement>('.qi-mote')]}]));
 let enabled=true,motion=true,frame=0,last:number|null=null,age=0,disposed=false,feedback:((node:HTMLElement,phase:string,charge:number)=>void)|undefined;
 function paint(node:HTMLElement,still=false){const d=readQiTimeline(still?0:age,node.dataset.qiTheme as CharacterQiTheme,still?createQiChannel():channels.get(node)),p=parts.get(node)!;
  p.ground.style.transform=`scale(${d.ground.scale})`;p.ground.style.opacity=String(d.ground.opacity);
  p.rear.forEach((img,i)=>{const r=d.rear[i];img.style.transform=`translateY(${r.dy}%) scale(${r.scaleX},${r.scaleY})`;img.style.opacity=String(r.opacity);});
  p.front.style.transform=`translate(${d.front.dx}%,${d.front.dy}%) scaleX(${d.front.scaleX})`;p.front.style.opacity=String(d.front.opacity);p.burst.style.transform=`scale(${d.burst.scale})`;p.burst.style.opacity=String(d.burst.opacity);
  p.motes.forEach(img=>{const m=d.motes[Number(img.dataset.qiMote)],front=img.closest('.qi-orbit')?.classList.contains('qi-orbit-front');img.style.opacity=front===m.front?String(m.opacity):'0';img.style.transform=`translate(${m.x/8*100-50}%,${m.y/8*100-50}%)`;});
  node.dataset.phase=d.phase;node.dataset.charge=String(Math.round(d.charge*100));feedback?.(node,d.phase,d.charge);
 }
 const active=()=>nodes.some(n=>n.dataset.active==='true');
 function tick(now:number){frame=0;if(disposed||!active()){last=null;return;}age+=last===null?0:Math.min(64,now-last);last=now;for(const n of nodes)if(n.dataset.active==='true')paint(n);frame=requestAnimationFrame(tick);}
 const apply=()=>{for(const node of nodes){const runs=enabled&&!node.hidden&&motion&&!media.matches&&!document.hidden&&navigator.onLine&&visible.has(node);node.dataset.enabled=String(enabled);node.dataset.motion=String(motion&&!media.matches);node.dataset.active=String(runs);if(!runs){channels.set(node,createQiChannel());paint(node,true);}}
  if(active()){if(!frame)frame=requestAnimationFrame(tick);}else{cancelAnimationFrame(frame);frame=0;last=null;}
 };
 // Observe the actor frame because the qi root uses display:contents for front/back ordering.
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const node=e.target.querySelector<HTMLElement>('.character-qi');if(!node)continue;e.isIntersecting?visible.add(node):visible.delete(node);}apply();});
 for(const n of nodes)observer.observe(n.parentElement!);
 document.addEventListener('visibilitychange',apply);addEventListener('online',apply);addEventListener('offline',apply);media.addEventListener('change',apply);apply();
 return {
  update(nextEnabled:boolean,nextMotion:boolean){enabled=nextEnabled;motion=nextMotion;apply();},
  onFeedback(callback:(node:HTMLElement,phase:string,charge:number)=>void){feedback=callback;for(const n of nodes)paint(n,n.dataset.active!=='true');},
  beginChannel(node:HTMLElement){if(node.dataset.active!=='true')return false;channels.set(node,beginQiChannel(age));paint(node);return true;},
  releaseChannel(node:HTMLElement){channels.set(node,releaseQiChannel(channels.get(node)??createQiChannel(),age,node.dataset.qiTheme as CharacterQiTheme));paint(node);},
  cancelChannel(node:HTMLElement){channels.set(node,createQiChannel());paint(node,node.dataset.active!=='true');},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',apply);removeEventListener('online',apply);removeEventListener('offline',apply);media.removeEventListener('change',apply);for(const n of nodes)n.dataset.active='false';}
 };
}
