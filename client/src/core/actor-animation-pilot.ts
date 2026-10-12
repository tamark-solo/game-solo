export type PilotActorId='wang'|'wolf'|'boss';
export type PilotDirection='south'|'east';
export interface PilotRect{x:number;y:number;w:number;h:number}
export interface PilotClip {
 id:string;actor:PilotActorId;action:string;direction:PilotDirection;label:string;loop:boolean;holdLast:boolean;
 fps:number;durations:number[];frameSize:[number,number];pivot:[number,number];atlas:string;atlasSize:[number,number];
 origin:'new-imagegen'|'reused-canonical';uniqueFrames:number;
 phases:Array<{at:number;label:string}>;
 frames:Array<{file:string;sha256:string;rect:PilotRect;bounds:{left:number;top:number;width:number;height:number}}>;
}
export interface PilotActor{id:PilotActorId;name:string;role:string;bodyHeight:number;note:string;actions:string[]}
export interface PilotCatalog{version:1;actors:PilotActor[];clips:Record<string,PilotClip>;directions:PilotDirection[];background:{file:string;worldSize:[number,number];sourceSize:[number,number];foot:[number,number]}}
export type ClipTimeline=Pick<PilotClip,'fps'|'durations'|'loop'|'phases'|'frames'>;
export const pilotDuration=(clip:ClipTimeline)=>clip.durations.reduce((sum,n)=>sum+n,0)*1000/clip.fps;
export function pilotSample(clip:ClipTimeline,elapsed:number){
 if(!clip.frames.length||clip.frames.length!==clip.durations.length||clip.fps<=0||clip.durations.some(d=>d<=0))throw new Error('Invalid pilot clip');
 const duration=pilotDuration(clip),time=Math.max(0,Number.isFinite(elapsed)?elapsed:0),age=clip.loop?time%duration:Math.min(time,duration),tick=Math.floor(age*clip.fps/1000+1e-8);
 let remaining=tick,index=0;while(index<clip.frames.length-1&&remaining>=clip.durations[index])remaining-=clip.durations[index++];
 const phase=[...clip.phases].reverse().find(p=>age>=p.at)?.label||'Chuyển động';
 return {index,age,duration,phase,complete:!clip.loop&&time>=duration,frame:clip.frames[index]};
}
export function pilotFrameAge(clip:ClipTimeline,index:number){return clip.durations.slice(0,Math.max(0,Math.min(clip.frames.length-1,index))).reduce((sum,n)=>sum+n,0)*1000/clip.fps;}
export function pilotClip(catalog:PilotCatalog,actor:PilotActorId,action:string,direction:PilotDirection){
 const clip=catalog.clips[`${actor}-${action}-${direction}`];if(!clip)throw new Error(`Unavailable pilot binding: ${actor}/${action}/${direction}`);return clip;
}
