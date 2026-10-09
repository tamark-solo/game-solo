import type { Input, Position } from '../world/types';

export type SkillAimPolicy = 'direction' | 'target';

export function normalizedAim(input:Input):Input|undefined {
  const magnitude=Math.hypot(input.x,input.y);
  if(!Number.isFinite(magnitude)||magnitude<.001)return;
  return {x:input.x/magnitude,y:input.y/magnitude};
}

export function facingAim(direction:string):Input {
  switch(direction){
    case 'north':return {x:0,y:-1};
    case 'west':return {x:-1,y:0};
    case 'east':return {x:1,y:0};
    default:return {x:0,y:1};
  }
}

// A targeted cast faces the authoritative target at acceptance. Its direction stays fixed after that.
export function resolveSkillAim(policy:SkillAimPolicy,requested:Input,origin:Position,target?:Position):Input {
  return (policy==='target'&&target?normalizedAim({x:target.x-origin.x,y:target.y-origin.y}):undefined)??requested;
}
