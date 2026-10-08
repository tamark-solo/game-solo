import {frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
// Optional local ground contrast only. No camera exposure, gameplay or actor writes.
export function intentLighting(skill,{age,targetFoot,confirmedAge=null}){
 const spec=skill.intent?.localLighting;if(!spec)return null;
 let alpha,color;
 if(confirmedAge!==null&&age>=confirmedAge){
  const tick=Math.floor((age-confirmedAge)*24+1e-9);alpha=spec.flashAlpha[tick]??0;color=[235,226,255];
 }else{
  const start=frameSeconds(spec.startFrame,24),end=frameSeconds(spec.endFrame,24);
  if(age<start||age>=end)return null;
  const tick=Math.floor((age-start)*24+1e-9);alpha=spec.quietAlpha[Math.min(tick,spec.quietAlpha.length-1)];color=[9,20,42];
 }
 if(!alpha)return null;
 return {id:'local-contrast',kind:'localContrast',point:[...targetFoot],radii:[...spec.radii],alpha,color,layer:.25,angle:0};
}
export function drawIntentLighting(ctx,row){
 ctx.save();ctx.translate(...row.point);ctx.scale(...row.radii);
 const gradient=ctx.createRadialGradient(0,0,0,0,0,1),color=row.color.join(',');
 gradient.addColorStop(0,`rgba(${color},${row.alpha})`);gradient.addColorStop(1,`rgba(${color},0)`);
 ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}
