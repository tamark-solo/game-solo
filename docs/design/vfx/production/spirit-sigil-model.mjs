import {SequencePlayer,frameSeconds} from '../frame-by-frame-r01/sequence-system.mjs';
function phase(clip,indices,holds,age,holdLast=false){
 const data={...clip,frames:indices.map(i=>clip.frames[i]),durations:holds,loop:false};
 let sample=new SequencePlayer(data).sample(age);
 if(!sample&&holdLast&&age>=0)sample={index:indices.length-1,frame:data.frames.at(-1)};
 return sample?{...sample,index:indices[sample.index],clip}:null;
}
// Coordinates are decorative offsets from a host foot snapshot; this never writes movement.
export function spiritPresentation(skill,clips,{age,foot,arrivedAt=null}){
 const spec=skill.spirit,clip=clips[spec.clip],start=frameSeconds(spec.startFrame,24);
 if(age<start)return null;
 let sample,offset=spec.offset;
 if(skill.family==='wind'){
  if(arrivedAt===null){
   if(age-start>spec.maxHoldFrames/24)return null;
   sample=phase(clip,spec.departureIndices,spec.departureHolds,age-start,true);
  }else{
   const elapsed=age-arrivedAt;if(elapsed<0)return null;
   sample=phase(clip,spec.arrivalIndices,spec.arrivalHolds,elapsed);
   const t=Math.max(0,Math.min(1,elapsed/(spec.mergeFrames/24)));
   offset=spec.offset.map((v,i)=>v*(1-t)+(spec.mergeOffset?.[i]??0)*t);
  }
 }else sample=new SequencePlayer(clip).sample(age-start);
 if(!sample)return null;
 return {id:spec.clip,sample,point:foot.map((v,i)=>v+offset[i]),angle:0,scale:spec.scale??1,layer:spec.layer??.5,kind:'decorativeSpirit'};
}
