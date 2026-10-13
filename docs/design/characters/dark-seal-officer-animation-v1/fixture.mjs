// Isolated ART fixtures. No AI, command, damage, entity, loot or save writer.
export const ms=tick=>tick*1000/24;
export const vector=d=>({south:[0,1],southwest:[-Math.SQRT1_2,Math.SQRT1_2],west:[-1,0],northwest:[-Math.SQRT1_2,-Math.SQRT1_2],north:[0,-1],northeast:[Math.SQRT1_2,-Math.SQRT1_2],east:[1,0],southeast:[Math.SQRT1_2,Math.SQRT1_2]}[d]);
export function contains(kit,action,direction,point){const k=kit.skills[action],v=vector(direction),forward=point[0]*v[0]+point[1]*v[1],side=point[0]*-v[1]+point[1]*v[0],distance=Math.hypot(...point);
 if(k.shape==='cone')return distance<=k.range+kit.playerFootRadius&&Math.abs(Math.atan2(side,forward))<=k.halfAngle;
 if(k.shape==='capsule'){const along=Math.max(0,Math.min(k.range,forward));return Math.hypot(forward-along,side)<=k.halfWidth+kit.playerFootRadius;}
 return distance>=k.innerRadius-kit.playerFootRadius&&distance<=k.outerRadius+kit.playerFootRadius&&Math.abs(Math.atan2(side,-forward))>k.safeGapDegrees*Math.PI/360;
}
export function trial(kit,action,direction,mode){const k=kit.skills[action],v=vector(direction),n=[-v[1],v[0]],origin=v.map(x=>x*(action==='an_hoi'?80:action==='attack'?40:130));
 const lock=ms(k.lockTick),release=ms(k.releaseTick),resolve=ms(k.resolveTick),cancelAt=mode==='cancel'?release-1:Infinity,escapeAt=lock+kit.readReactionMs+kit.latencyFixtureMs;
 function playerAt(age){const distance=mode==='miss'?Math.max(0,Math.min(age,resolve)-escapeAt)*kit.playerSpeed/1000:0,escape=action==='an_hoi'?v:n;return origin.map((p,i)=>p+escape[i]*distance);}
 const hit=mode!=='cancel'&&contains(kit,action,direction,playerAt(resolve));
 return {id:action+'/'+direction+'/'+mode,origin:'isolated-review-fixture',action,direction,mode,lockedAim:direction,lock,release,resolve,cancelAt,end:ms(k.endTick),playerAt,hit,
  factsAt(age){const cancelled=age>=cancelAt;return {warning:age<release&&!cancelled,locked:age>=lock,releaseAge:!cancelled&&age>=release?age-release:null,contactAge:!cancelled&&hit&&age>=resolve?age-resolve:null,cancelled,bossOffset:[0,0]};}};
}
export function decoys(kit,t,age){if(t.action!=='phan_phu'||age<t.lock||age>=Math.min(t.cancelAt,t.resolve+300))return [];const k=kit.skills.phan_phu.decoys,v=vector(t.direction),normal=[-v[1],v[0]],fade=Math.min(1,(age-t.lock)/180,Math.max(0,(t.resolve+300-age)/300));return [-1,1].map((side,i)=>({id:t.id+'/decoy/'+i,offset:normal.map(n=>n*side*k.lateral),poseAge:Math.max(0,age-ms((i+1)*2)),opacity:k.opacity*fade,entity:false,damage:false,loot:false}));}
export function contactOnce(seen,event){if(event.origin!=='isolated-review-fixture'||!event.confirmed||seen.has(event.id))return false;seen.add(event.id);while(seen.size>64)seen.delete(seen.values().next().value);return true;}
export const escapeBudget=(kit,action)=>Math.max(0,ms(kit.skills[action].releaseTick-kit.skills[action].lockTick)-kit.readReactionMs-kit.latencyFixtureMs)*kit.playerSpeed/1000;
