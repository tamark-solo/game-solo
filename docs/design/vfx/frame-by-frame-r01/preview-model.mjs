import { SequencePlayer, frameSeconds } from './sequence-system.mjs';
export const profiles={
 pvp:{label:'PvP',sprite:true,width:64,height:96,hitOffset:[-6,-42]},
 character:{label:'Nhân vật',sprite:true,width:64,height:96,hitOffset:[-6,-42]},
 monster:{label:'Quái · vùng chạm thử',sprite:false,width:56,height:64,hitOffset:[-8,-30]},
 boss:{label:'Boss · vùng chạm thử',sprite:false,width:112,height:144,hitOffset:[-18,-82]}
};
/** Only the isolated preview simulates confirmations. Production receives combat.hitConfirmed. */
export function makePreviewPlan(skill,clips,options){
 const profile=profiles[options.target],foot=skill.preview.defaultFoot,tf=[foot[0]+options.distance,foot[1]];
 const release=skill.events.find(e=>e.type==='release'),launch=frameSeconds(release.frame,skill.fps);
 const character=new SequencePlayer(clips['wanglin-cast-east']);
 const pose=character.sample(launch),offset=skill.sockets[pose.index],socket=[foot[0]+offset[0],foot[1]+offset[1]];
 const hitPoint=[tf[0]+profile.hitOffset[0],tf[1]+profile.hitOffset[1]],length=Math.hypot(hitPoint[0]-socket[0],hitPoint[1]-socket[1]);
 const direction=[(hitPoint[0]-socket[0])/length,(hitPoint[1]-socket[1])/length],track=skill.tracks.find(t=>t.id==='projectile');
 const contactFrame=release.frame+Math.ceil(Math.max(0,length-track.initialTipAhead)/(track.worldSpeed/skill.fps));
 const expireFrame=release.frame+Math.ceil(track.maxTravelWorld/(track.worldSpeed/skill.fps));
 const confirmFrame=contactFrame+options.delay,impactTime=frameSeconds(confirmFrame,skill.fps),expireTime=frameSeconds(expireFrame,skill.fps);
 const events=[...skill.events];
 if(options.hit){events.push({frame:contactFrame,type:'preview.projectile.contact'});events.push({frame:confirmFrame,type:'preview.hitConfirmed',sfx:'sword.hit'});}
 else events.push({frame:expireFrame,type:'preview.projectile.expired'});
 const endFrame=Math.max(36,(options.hit?confirmFrame+clips['qi-impact'].frames.length:expireFrame+4)+6);
 return {profile,foot,targetFoot:tf,socket,hitPoint,direction,angle:Math.atan2(direction[1],direction[0]),track,launch,releaseFrame:release.frame,contactFrame,contactTime:frameSeconds(contactFrame,skill.fps),confirmFrame,impactTime,expireFrame,expireTime,endFrame,events:events.sort((a,b)=>a.frame-b.frame),options};
}
export function projectileTip(plan,elapsed){
 const traveled=plan.track.initialTipAhead+Math.max(0,elapsed-plan.launch)*plan.track.worldSpeed;
 return [plan.socket[0]+plan.direction[0]*traveled,plan.socket[1]+plan.direction[1]*traveled];
}
