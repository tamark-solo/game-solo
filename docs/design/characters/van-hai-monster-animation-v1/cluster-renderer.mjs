import {bitmap,fixedBitmap,cacheStats} from './assets.mjs';
import {drawCommands} from './cluster-model.mjs';
import {directionVector} from '../../../../client/src/core/actor-animation-production.ts';
const FX='../../vfx/van-hai-monster-vfx-v2/',PROPS='../../vfx/van-hai-monster-vfx-v1/';
const propFor=a=>a.slug==='dark-talisman-rogue'?'rogue-dagger':a.slug==='black-silk-adept'?'adept-fan':null;
function paintBody(ctx,im,a,x,y,z){const c=a.clip,f=a.pose.frame;ctx.drawImage(im,Math.round(x-c.pivot[0]*z),Math.round(y-(c.pivot[1]+(f.liftPx??0))*z),c.frameSize[0]*z,c.frameSize[1]*z);}
function paintFx(ctx,im,a,n,x,y,z,opacity){ctx.save();ctx.translate(x+(a.foot[0]+n.point[0])*z,y+(a.foot[1]+n.point[1])*z);ctx.rotate(n.angle);ctx.scale(1,n.squash);ctx.globalAlpha=opacity;ctx.drawImage(im,-n.clip.anchor[0]*z,-n.clip.anchor[1]*z,n.clip.frameSize[0]*z,n.clip.frameSize[1]*z);ctx.restore();}
function paintProp(ctx,im,p,a,x,y,z){const s=a.pose.frame.sockets?.[p.id==='rogue-dagger'?'handRight':'handLeft'];if(!s)return;const v=directionVector(a.direction);ctx.save();ctx.translate(x+(s[0]-a.clip.pivot[0])*z,y+(s[1]-a.clip.pivot[1])*z);ctx.rotate(Math.atan2(v[1],v[0])+.25);ctx.drawImage(im,-p.anchor[0]*z,-p.anchor[1]*z,p.frameSize[0]*z,p.frameSize[1]*z);ctx.restore();}
function paintWarning(ctx,a,x,y,z){const p=a.graph.profile,v=a.graph.target,angle=Math.atan2(v[1]+20,v[0]);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.lineWidth=1.5;ctx.strokeStyle=a.actor.rank==='elite'?'#ffc16e':'#db9948';ctx.fillStyle='#cd853a21';ctx.beginPath();if(p.warning==='radial')ctx.arc(0,0,p.range*z,0,Math.PI*2);else if(p.warning==='cone'){ctx.moveTo(0,0);ctx.arc(0,0,p.range*z,-.42,.42);ctx.closePath();}else{const d=Math.hypot(v[0],v[1]+20)*z;ctx.rect(0,-7*z,d,14*z);}ctx.fill();ctx.stroke();ctx.restore();}
let masks=null;
export async function createClusterRenderer(canvas,props){
 const map=await fixedBitmap('../../world/hang-nhac-van-ngoc-detail-v2/regions/map-web.webp'),player=await fixedBitmap('../wang-lin-pixel-production-v2/masters/southeast.png');
 return async function render(state,bounds,options){
  const started=performance.now(),z=Number(options.zoom),width=Math.max(960,Math.ceil((bounds[2]-bounds[0])*z+100)),height=Math.max(600,Math.ceil((bounds[3]-bounds[1])*z+100));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;canvas.style.width=width+'px';canvas.style.height=height+'px';}
  const root=[width/2-(bounds[0]+bounds[2])*z/2,height/2-(bounds[1]+bounds[3])*z/2],ctx=canvas.getContext('2d'),commands=drawCommands(state,options.clarity,options.fx,options.warnings);
  // Canonical current frames, shared between instances. Do not eagerly decode
  // entire atlases/every direction for each creature in a crowd.
  const urls=new Set();for(const a of state.actors){urls.add(a.pose.frame.file);const id=propFor(a);if(id)urls.add(PROPS+props[id].file);}
  for(const c of [...commands.ground,...commands.depth])if(c.kind==='fx')urls.add(FX+c.node.sample.frame.file);
  const loaded=new Map(await Promise.all([...urls].map(async url=>[url,await bitmap(url)])));
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  if(options.scene==='map')ctx.drawImage(map,1616-width/(2*z),992-height/(2*z),width/z,height/z,0,0,width,height);
  else{ctx.fillStyle=options.scene==='light'?'#e8e0c9':'#1b372c';ctx.fillRect(0,0,width,height);}
  for(const c of commands.ground){const a=c.actor,x=root[0]+a.foot[0]*z,y=root[1]+a.foot[1]*z;if(c.kind==='shadow'){ctx.fillStyle='#192b2d60';ctx.beginPath();ctx.ellipse(x,y,18*z,5*z,0,0,Math.PI*2);ctx.fill();}else if(c.kind==='warning')paintWarning(ctx,a,x,y,z);else paintFx(ctx,loaded.get(FX+c.node.sample.frame.file),a,c.node,...root,z,c.opacity);}
  for(const c of commands.depth){
   if(c.kind==='player'){ctx.drawImage(player,root[0]-32*z,root[1]-88*z,64*z,96*z);continue;}
   const a=c.actor,x=root[0]+a.foot[0]*z,y=root[1]+a.foot[1]*z;
   if(c.kind==='fx')paintFx(ctx,loaded.get(FX+c.node.sample.frame.file),a,c.node,...root,z,c.opacity);
   else{const id=propFor(a),p=props[id],back=['north','northeast','northwest'].includes(a.direction);if(p&&back)paintProp(ctx,loaded.get(PROPS+p.file),p,a,x,y,z);paintBody(ctx,loaded.get(a.pose.frame.file),a,x,y,z);if(p&&!back)paintProp(ctx,loaded.get(PROPS+p.file),p,a,x,y,z);}
  }
  if(options.names)for(const a of state.actors){const text=(a.actor.rank==='elite'?'◆ ':'')+a.actor.name,x=root[0]+a.foot[0]*z,y=root[1]+(a.foot[1]-a.actor.bodyHeightPx-(a.pose.frame.liftPx??0)-8)*z;ctx.font=(11*z)+'px system-ui';ctx.textAlign='center';ctx.strokeStyle='#11261f';ctx.lineWidth=3;ctx.strokeText(text,x,y);ctx.fillStyle=a.actor.rank==='elite'?'#ffce87':'#efe6cd';ctx.fillText(text,x,y);ctx.textAlign='start';}
  ctx.strokeStyle='#b5ce9866';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(...root,12*z,4*z,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#17332bef';ctx.fillRect(16,15,620,65);ctx.fillStyle='#eee0b7';ctx.font='15px system-ui';ctx.fillText(`${state.actors.length} quái · ${options.clarity==='full'?'Đầy đủ VFX02':'Ưu tiên đọc trận'} · ${z}× · ${Math.round(state.time)}ms`,28,40);ctx.font='12px system-ui';ctx.fillText('Vương Lâm ở giữa · scene fixture / hit mẫu · depth theo chân',28,61);
  // Pixel coverage of opaque player silhouette, with only commands in front
  // of its world foot. Tiny masks exclude background and ground effects.
  if(!masks||masks.z!==z){const make=()=>new OffscreenCanvas(64*z,96*z);masks={z,player:make(),fx:make(),body:make()};const pc=masks.player.getContext('2d');pc.imageSmoothingEnabled=false;pc.drawImage(player,0,0,64*z,96*z);masks.playerAlpha=pc.getImageData(0,0,64*z,96*z).data;}
  const fc=masks.fx.getContext('2d',{willReadFrequently:true}),bc=masks.body.getContext('2d',{willReadFrequently:true});fc.clearRect(0,0,64*z,96*z);bc.clearRect(0,0,64*z,96*z);fc.imageSmoothingEnabled=bc.imageSmoothingEnabled=false;
  for(const c of commands.depth)if(c.depth>0){if(c.kind==='fx')paintFx(fc,loaded.get(FX+c.node.sample.frame.file),c.actor,c.node,32*z,88*z,z,c.opacity);else if(c.kind==='body')paintBody(bc,loaded.get(c.actor.pose.frame.file),c.actor,32*z+c.actor.foot[0]*z,88*z+c.actor.foot[1]*z,z);}
  const fa=fc.getImageData(0,0,64*z,96*z).data,ba=bc.getImageData(0,0,64*z,96*z).data,pa=masks.playerAlpha;let pixels=0,fxPixels=0,bodyPixels=0;
  for(let i=3;i<pa.length;i+=4)if(pa[i]>=128){pixels++;if(fa[i]>=96)fxPixels++;if(ba[i]>=128)bodyPixels++;}
  const fxCommands=[...commands.ground,...commands.depth].filter(c=>c.kind==='fx');
  return {time:state.time,actors:state.actors.length,elites:state.actors.filter(a=>a.actor.rank==='elite').length,effects:fxCommands.length,warnings:commands.ground.filter(c=>c.kind==='warning').length,fxCoverage:Math.round(fxPixels/pixels*1000)/10,bodyCoverage:Math.round(bodyPixels/pixels*1000)/10,renderMs:Math.round((performance.now()-started)*10)/10,cache:cacheStats(),drawCommands:[...commands.ground,...commands.depth].length};
 };
}
