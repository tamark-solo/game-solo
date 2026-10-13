// Isolated presentation fixtures. No live command, damage, loot or save writer.
export const ms=tick=>tick*1000/24;
export const vector=d=>({south:[0,1],southwest:[-Math.SQRT1_2,Math.SQRT1_2],west:[-1,0],northwest:[-Math.SQRT1_2,-Math.SQRT1_2],north:[0,-1],northeast:[Math.SQRT1_2,-Math.SQRT1_2],east:[1,0],southeast:[Math.SQRT1_2,Math.SQRT1_2]}[d]);
const clamp=x=>Math.max(0,Math.min(1,x));
export function bossOffset(kit,action,direction,age,cancelAt=Infinity){
 const k=kit.skills[action];if(action!=='van_nha')return [0,0];
 const start=ms(k.releaseTick),travel=ms(k.travelTicks),t=clamp((Math.min(age,cancelAt)-start)/travel),v=vector(direction);
 // Arrival is held after travel. Only starting a new trial resets origin.
 return v.map(n=>n*k.range*t);
}
export function contains(kit,action,direction,point){
 const k=kit.skills[action],v=vector(direction),forward=point[0]*v[0]+point[1]*v[1],side=point[0]*-v[1]+point[1]*v[0],distance=Math.hypot(...point);
 if(k.shape==='cone')return distance<=k.range+kit.playerFootRadius&&Math.abs(Math.atan2(side,forward))<=k.halfAngle;
 if(k.shape==='capsule'){const along=Math.max(0,Math.min(k.range,forward));return Math.hypot(forward-along,side)<=k.halfWidth+kit.playerFootRadius;}
 const rearAngle=Math.abs(Math.atan2(side,-forward));return distance>=k.innerRadius-kit.playerFootRadius&&distance<=k.outerRadius+kit.playerFootRadius&&rearAngle>k.safeGapDegrees*Math.PI/360;
}
export function trial(kit,action,direction,mode){
 const k=kit.skills[action],v=vector(direction),n=[-v[1],v[0]],origin=action==='hoi_phong'?v.map(x=>x*74):v.map(x=>x*(action==='attack'?45:110));
 const lock=ms(k.lockTick),release=ms(k.releaseTick),resolve=ms(k.resolveTick),cancelAt=mode==='cancel'?release-1:Infinity;
 const escapeAt=lock+kit.readReactionMs+kit.latencyFixtureMs;
 function playerAt(age){const distance=mode==='miss'?Math.max(0,Math.min(age,resolve)-escapeAt)*kit.playerSpeed/1000:0;const escape=action==='hoi_phong'?v:n;return origin.map((p,i)=>p+escape[i]*distance);}
 const hit=mode!=='cancel'&&contains(kit,action,direction,playerAt(resolve));
 return {id:action+'/'+direction+'/'+mode,origin:'isolated-review-fixture',action,direction,mode,lockedAim:direction,lock,release,resolve,cancelAt,end:ms(k.endTick),playerAt,hit,
  factsAt(age){const cancelled=age>=cancelAt;return {warning:age<release&&!cancelled,locked:age>=lock,releaseAge:!cancelled&&age>=release?age-release:null,contactAge:!cancelled&&hit&&age>=resolve?age-resolve:null,cancelled,bossOffset:bossOffset(kit,action,direction,age,cancelAt)};}};
}
// Contact receipt dedup is independent from visual frame callbacks.
export function contactOnce(seen,event){if(event.origin!=='isolated-review-fixture'||!event.confirmed||seen.has(event.id))return false;seen.add(event.id);return true;}
export function escapeBudget(kit,action){const k=kit.skills[action];return Math.max(0,ms(k.releaseTick-k.lockTick)-kit.readReactionMs-kit.latencyFixtureMs)*kit.playerSpeed/1000;}
